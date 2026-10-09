/**
 * השרת של אתר האימונים של אפיק.
 * רץ חינם על Google Apps Script ושומר כל הזמנה כשורה בגוגל שיטס.
 * הוראות התקנה: backend/SETUP.md
 *
 * הגדרות (Project Settings → Script Properties):
 *   ADMIN_PASSWORD  – הסיסמה לדף הניהול (חובה)
 *   NOTIFY_EMAIL    – לאן לשלוח מייל על כל הזמנה חדשה (לא חובה, ברירת מחדל: בעל הסקריפט)
 */

const SHEET_NAME = "הזמנות";
const TZ = "Asia/Jerusalem";
const FIELDS = ["id", "status", "createdAt", "date", "time", "minutes", "workoutId", "workout", "price", "firstTime",
  "name", "phone", "city", "street", "floor", "code", "space", "goals", "notes"];
const HEADERS = ["מספר הזמנה", "סטטוס", "נוצר", "תאריך", "שעה", "דקות", "קוד אימון", "אימון", "מחיר", "היכרות",
  "שם", "טלפון", "עיר", "רחוב", "קומה ודירה", "קוד לבניין", "איפה מתאמנים", "מטרות", "הערות"];
const STATUS_HE = { "": "פעיל", done: "בוצע", cancelled: "בוטל" };
const STATUS_EN = { "פעיל": "", "בוצע": "done", "בוטל": "cancelled" };
const TOKEN_HOURS = 6; // המקסימום ש-CacheService מאפשר

/* ---------- entry points ---------- */

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "";
  if (action === "slots") {
    // רק תאריך ושעה, בלי פרטים אישיים, כדי שהאתר ידע אילו שעות תפוסות
    const today = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd");
    const taken = readAll_()
      .filter(function (b) { return b.status !== "cancelled" && b.date >= today; })
      .map(function (b) { return [b.date, b.time]; });
    return json_({ ok: true, taken: taken });
  }
  return json_({ ok: true, service: "afik-booking" });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: "bad_request" }); }
  try {
    switch (body.action) {
      case "book": return json_(book_(body));
      case "cancel": return json_(customerCancel_(body));
      case "login": return json_(login_(body));
      case "logout": CacheService.getScriptCache().remove("t:" + body.token); return json_({ ok: true });
      case "list": requireAuth_(body.token); return json_({ ok: true, bookings: readAll_() });
      case "update": requireAuth_(body.token); return json_(update_(body));
      default: return json_({ ok: false, error: "unknown_action" });
    }
  } catch (err) {
    if (err && err.code) return json_({ ok: false, error: err.code });
    console.error(err);
    return json_({ ok: false, error: "server_error" });
  }
}

/* ---------- actions ---------- */

function book_(body) {
  const b = body.booking || {};
  const d = b.details || {};
  const isAdmin = body.token && isAuthed_(body.token);
  const clean = {
    date: String(b.date || ""),
    time: Number(b.time),
    minutes: Math.min(180, Math.max(15, Number(b.minutes) || 60)),
    workoutId: str_(b.workoutId, 40),
    workout: str_(b.workout, 60),
    price: Math.max(0, Number(b.price) || 0),
    firstTime: !!b.firstTime,
    name: str_(d.name, 80),
    phone: String(d.phone || "").replace(/\D/g, "").replace(/^972/, "0"),
    city: str_(d.city, 60),
    street: str_(d.street, 120),
    floor: str_(d.floor, 60),
    code: str_(d.code, 30),
    space: str_(d.space, 40),
    goals: (Array.isArray(d.goals) ? d.goals : []).map(function (g) { return str_(g, 30); }).slice(0, 8).join(", "),
    notes: str_(d.notes, 500)
  };
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(clean.date) && clean.time >= 0 && clean.time <= 23 && clean.name.length >= 2 &&
    (isAdmin || (/^05\d{8}$/.test(clean.phone) && clean.street && clean.city));
  if (!valid) throw err_("invalid");
  if (!isAdmin && clean.date < Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd")) throw err_("invalid");

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const all = readAll_();
    const clash = all.some(function (x) { return x.status !== "cancelled" && x.date === clean.date && x.time === clean.time; });
    if (clash && !(isAdmin && body.force)) throw err_("taken");
    let id;
    do { id = "AF-" + Math.random().toString(36).slice(2, 6).toUpperCase(); } while (all.some(function (x) { return x.id === id; }));
    clean.id = id;
    clean.status = "";
    clean.createdAt = Date.now();
    const sh = sheet_();
    sh.appendRow(FIELDS.map(function (f) { return toCell_(f, clean[f]); }));
    SpreadsheetApp.flush();
    notify_(clean);
    return { ok: true, id: id };
  } finally {
    lock.releaseLock();
  }
}

function customerCancel_(body) {
  const phone = String(body.phone || "").replace(/\D/g, "").replace(/^972/, "0");
  const found = findRow_(body.id);
  if (!found || found.booking.details.phone !== phone) throw err_("not_found");
  if (found.booking.status === "cancelled") return { ok: true };
  setStatus_(found.row, "cancelled");
  notify_(Object.assign({}, flatten_(found.booking), { cancelled: true }));
  return { ok: true };
}

function update_(body) {
  const status = String(body.status || "");
  if (!(status in STATUS_HE)) throw err_("invalid");
  const found = findRow_(body.id);
  if (!found) throw err_("not_found");
  setStatus_(found.row, status);
  return { ok: true };
}

function login_(body) {
  const props = PropertiesService.getScriptProperties();
  const password = props.getProperty("ADMIN_PASSWORD");
  if (!password) throw err_("no_password_set");
  const cache = CacheService.getScriptCache();
  const fails = Number(cache.get("fails") || 0);
  if (fails >= 10) throw err_("locked");
  if (String(body.password || "") !== password) {
    cache.put("fails", String(fails + 1), 600);
    throw err_("wrong_password");
  }
  cache.remove("fails");
  const token = Utilities.getUuid();
  cache.put("t:" + token, "1", TOKEN_HOURS * 3600);
  return { ok: true, token: token };
}

/* ---------- sheet helpers ---------- */

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold").setBackground("#15211d").setFontColor("#ffffff");
    sh.getRange(1, 1, sh.getMaxRows(), HEADERS.length).setNumberFormat("@"); // טקסט פשוט, כדי ששיטס לא יהפוך תאריכים וטלפונים
    sh.setFrozenRows(1);
    sh.setRightToLeft(true);
  }
  return sh;
}

function readAll_() {
  const sh = sheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, FIELDS.length).getDisplayValues()
    .filter(function (r) { return r[0]; })
    .map(fromRow_);
}

function findRow_(id) {
  if (!id) return null;
  const sh = sheet_();
  const last = sh.getLastRow();
  if (last < 2) return null;
  const rows = sh.getRange(2, 1, last - 1, FIELDS.length).getDisplayValues();
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === id) return { row: i + 2, booking: fromRow_(rows[i]) };
  }
  return null;
}

function setStatus_(row, status) {
  sheet_().getRange(row, FIELDS.indexOf("status") + 1).setValue(STATUS_HE[status]);
}

function toCell_(field, value) {
  let v;
  if (field === "status") v = STATUS_HE[value || ""];
  else if (field === "createdAt") v = Utilities.formatDate(new Date(value), TZ, "yyyy-MM-dd HH:mm");
  else if (field === "time") v = ("0" + value).slice(-2) + ":00";
  else if (field === "firstTime") v = value ? "כן" : "";
  else v = value == null ? "" : String(value);
  // הגרש בהתחלה שומר את הערך כטקסט: שיטס לא ימיר תאריכים, לא ימחק 0 מטלפון ולא יריץ נוסחאות
  return v ? "'" + v : "";
}

function fromRow_(r) {
  const o = {};
  FIELDS.forEach(function (f, i) { o[f] = r[i]; });
  let created = 0;
  try { created = o.createdAt ? Utilities.parseDate(o.createdAt, TZ, "yyyy-MM-dd HH:mm").getTime() : 0; } catch (err) { created = 0; }
  return {
    id: o.id,
    status: STATUS_EN[o.status] || "",
    createdAt: isNaN(created) ? 0 : created,
    date: o.date,
    time: parseInt(o.time, 10) || 0,
    minutes: Number(o.minutes) || 60,
    workoutId: o.workoutId,
    workout: o.workout,
    price: Number(String(o.price).replace(/[^\d.]/g, "")) || 0,
    firstTime: o.firstTime === "כן",
    details: {
      name: o.name, phone: o.phone, city: o.city, street: o.street, floor: o.floor, code: o.code,
      space: o.space, notes: o.notes,
      goals: o.goals ? o.goals.split(",").map(function (g) { return g.trim(); }).filter(String) : []
    }
  };
}

function flatten_(b) {
  return Object.assign({ id: b.id, date: b.date, time: b.time, minutes: b.minutes, workout: b.workout, price: b.price }, b.details, {
    goals: (b.details.goals || []).join(", ")
  });
}

/* ---------- email to Afik ---------- */

function notify_(b) {
  try {
    const to = PropertiesService.getScriptProperties().getProperty("NOTIFY_EMAIL") || Session.getEffectiveUser().getEmail();
    if (!to) return;
    const time = ("0" + b.time).slice(-2) + ":00";
    const addr = [b.street, b.floor, b.city].filter(String).join(", ");
    const nav = "https://waze.com/ul?q=" + encodeURIComponent([b.street, b.city].filter(String).join(", ")) + "&navigate=yes";
    const subject = (b.cancelled ? "בוטל: " : "אימון חדש: ") + b.name + " · " + b.date + " " + time;
    const rows = [
      ["אימון", b.workout], ["מתי", b.date + " בשעה " + time], ["כתובת", addr], ["קוד לבניין", b.code],
      ["איפה מתאמנים", b.space], ["טלפון", b.phone], ["מטרות", b.goals], ["הערות", b.notes], ["מחיר", b.price ? "₪" + b.price : ""],
      ["מספר הזמנה", b.id]
    ].filter(function (r) { return r[1]; })
      .map(function (r) { return "<tr><td style='color:#5b6a63;padding:4px 0 4px 16px'>" + esc_(r[0]) + "</td><td style='padding:4px 0'><b>" + esc_(String(r[1])) + "</b></td></tr>"; })
      .join("");
    const html = "<div dir='rtl' style='font-family:Arial,sans-serif;font-size:15px'>" +
      "<h2 style='margin:0 0 12px'>" + (b.cancelled ? "האימון בוטל" : "אימון חדש נקבע באתר") + "</h2>" +
      "<table>" + rows + "</table>" +
      (b.cancelled ? "" : "<p><a href='" + nav + "'>ניווט ב-Waze</a></p>") + "</div>";
    MailApp.sendEmail({ to: to, subject: subject, htmlBody: html });
  } catch (err) {
    console.warn("notify failed", err);
  }
}

/* ---------- utils ---------- */

function requireAuth_(token) { if (!isAuthed_(token)) throw err_("unauthorized"); }
function isAuthed_(token) { return !!token && CacheService.getScriptCache().get("t:" + token) === "1"; }
function err_(code) { const e = new Error(code); e.code = code; return e; }
function str_(v, max) { return String(v == null ? "" : v).trim().slice(0, max); }
function esc_(s) { return s.replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/** להרצה ידנית פעם אחת מהעורך: יוצר את הגיליון ומבקש את ההרשאות */
function setup() {
  sheet_();
  Logger.log("הגיליון מוכן. עכשיו: Deploy → New deployment → Web app");
}

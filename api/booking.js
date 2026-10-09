// השרת של אתר האימונים של אפיק: פונקציה אחת ב-Vercel ששומרת את כל ההזמנות בקובץ JSON פרטי ב-Vercel Blob.
// משתני סביבה: ADMIN_PASSWORD (חובה), BLOB_READ_WRITE_TOKEN (נוצר אוטומטית כשמחברים Blob store), SESSION_SECRET (לא חובה)
import { get, put, BlobPreconditionFailedError } from "@vercel/blob";
import crypto from "node:crypto";

const DB_PATH = "db/bookings.json";
const TZ = "Asia/Jerusalem";
const TOKEN_HOURS = 12;
const STATUSES = ["", "done", "cancelled"];
const KNOWN_ERRORS = new Set(["invalid", "taken", "not_found", "unauthorized", "wrong_password", "locked", "no_password_set", "busy"]);

/* ---------- storage: one private JSON doc, written with ETag so parallel writes never overwrite each other ---------- */

async function readDb() {
  const r = await get(DB_PATH, { access: "private", useCache: false });
  if (!r || r.statusCode !== 200) return { data: { bookings: [], fails: { count: 0, until: 0 } }, etag: null };
  const data = JSON.parse(await new Response(r.stream).text());
  data.bookings ||= [];
  data.fails ||= { count: 0, until: 0 };
  return { data, etag: r.blob.etag };
}

async function writeDb(data, etag) {
  const opts = { access: "private", contentType: "application/json", addRandomSuffix: false, cacheControlMaxAge: 60 };
  if (etag) opts.ifMatch = etag; // נכשל אם מישהו אחר כתב בינתיים
  await put(DB_PATH, JSON.stringify(data), opts);
}

// קורא, מריץ שינוי וכותב. אם מישהו כתב באמצע, מנסה שוב עם הנתונים העדכניים
async function mutate(fn) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, etag } = await readDb();
    const result = fn(data);
    if (result && result.noWrite) return result;
    try { await writeDb(data, etag); return result; }
    catch (err) {
      if (err instanceof BlobPreconditionFailedError || /precondition|already exists/i.test(err.message)) continue;
      throw err;
    }
  }
  throw fail("busy");
}

/* ---------- site settings (editable from the admin page) ---------- */

const SETTINGS_PATH = "db/settings.json";
const ICON_KEYS = ["strength", "hiit", "mobility", "duo", "run", "heart"];

async function readSettings() {
  const r = await get(SETTINGS_PATH, { access: "private", useCache: false });
  if (!r || r.statusCode !== 200) return { data: {}, etag: null };
  return { data: JSON.parse(await new Response(r.stream).text()), etag: r.blob.etag };
}

async function mutateSettings(fn) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, etag } = await readSettings();
    const result = fn(data);
    const opts = { access: "private", contentType: "application/json", addRandomSuffix: false, cacheControlMaxAge: 60 };
    if (etag) opts.ifMatch = etag;
    try { await put(SETTINGS_PATH, JSON.stringify(data), opts); return result; }
    catch (err) {
      if (err instanceof BlobPreconditionFailedError || /precondition|already exists/i.test(err.message)) continue;
      throw err;
    }
  }
  throw fail("busy");
}

const int = (v, min, max) => { const n = Math.round(Number(v)); if (!Number.isFinite(n) || n < min || n > max) throw fail("invalid"); return n; };

function sanitizeConfig(c) {
  if (!c || typeof c !== "object") throw fail("invalid");
  const phone = normPhone(c.phoneDisplay);
  if (!/^05\d{8}$/.test(phone)) throw fail("invalid");
  const trainer = str(c.trainer, 30);
  if (trainer.length < 2) throw fail("invalid");
  const hours = {};
  for (let d = 0; d < 7; d++) {
    const list = Array.isArray(c.hours?.[d]) ? c.hours[d] : [];
    hours[d] = [...new Set(list.map((h) => int(h, 0, 23)))].sort((a, b) => a - b);
  }
  if (!Array.isArray(c.workouts) || !c.workouts.length || c.workouts.length > 12) throw fail("invalid");
  const ids = new Set();
  const workouts = c.workouts.map((w) => {
    let id = /^[a-z0-9_-]{1,40}$/i.test(w.id || "") ? w.id : "w" + crypto.randomBytes(3).toString("hex");
    while (ids.has(id)) id += "x";
    ids.add(id);
    const name = str(w.name, 40);
    if (!name) throw fail("invalid");
    return {
      id, name, minutes: int(w.minutes, 15, 180), price: int(w.price, 0, 5000),
      sub: str(w.sub, 80), desc: str(w.desc, 300),
      gear: (Array.isArray(w.gear) ? w.gear : []).map((g) => str(g, 40)).filter(Boolean).slice(0, 8),
      icon: ICON_KEYS.includes(w.icon) ? w.icon : "strength"
    };
  });
  if (!Array.isArray(c.cities) || !c.cities.length || c.cities.length > 60) throw fail("invalid");
  const cities = c.cities.map((x) => ({ name: str(x.name, 40), fee: int(x.fee, 0, 500) })).filter((x) => x.name);
  if (!cities.length) throw fail("invalid");
  const discount = Number(c.firstTimeDiscount);
  if (!(discount >= 0 && discount <= 0.9)) throw fail("invalid");
  return {
    trainer, phoneDisplay: phone.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3"), area: str(c.area, 60),
    hours, workouts, cities, firstTimeDiscount: Math.round(discount * 100) / 100,
    minLeadHours: int(c.minLeadHours, 0, 72), daysAhead: int(c.daysAhead, 7, 180), cancelHours: int(c.cancelHours, 0, 72)
  };
}

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString("hex");
  return salt + ":" + crypto.scryptSync(String(pw), salt, 32).toString("hex");
}
function checkPassword(pw, settings) {
  if (settings.passwordHash) {
    const [salt, hash] = settings.passwordHash.split(":");
    const a = crypto.scryptSync(String(pw), salt, 32), b = Buffer.from(hash, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  return !!process.env.ADMIN_PASSWORD && safeEqual(pw, process.env.ADMIN_PASSWORD);
}

/* ---------- helpers ---------- */

function fail(code) { const e = new Error(code); e.code = code; return e; }
const str = (v, max) => String(v ?? "").trim().slice(0, max);
const normPhone = (p) => String(p || "").replace(/\D/g, "").replace(/^972/, "0");
const todayIL = () => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

function secret() {
  return process.env.SESSION_SECRET || "afik:" + (process.env.ADMIN_PASSWORD || "");
}
function sign(exp) { return crypto.createHmac("sha256", secret()).update(String(exp)).digest("hex"); }
function makeToken() { const exp = Date.now() + TOKEN_HOURS * 3600e3; return `${exp}.${sign(exp)}`; }
function isAuthed(token) {
  const [exp, sig] = String(token || "").split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function requireAuth(token) { if (!isAuthed(token)) throw fail("unauthorized"); }
function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest(), hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function genId(existing) {
  let id;
  do { id = "AF-" + crypto.randomBytes(3).toString("base64url").replace(/[-_]/g, "X").slice(0, 4).toUpperCase(); }
  while (existing.some((b) => b.id === id));
  return id;
}

/* ---------- actions ---------- */

async function book(body) {
  const b = body.booking || {}, d = b.details || {};
  const admin = isAuthed(body.token);
  const clean = {
    date: String(b.date || ""),
    time: Number(b.time),
    minutes: Math.min(180, Math.max(15, Number(b.minutes) || 60)),
    workoutId: str(b.workoutId, 40),
    workout: str(b.workout, 60),
    price: Math.max(0, Number(b.price) || 0),
    firstTime: !!b.firstTime,
    details: {
      name: str(d.name, 80), phone: normPhone(d.phone), city: str(d.city, 60), street: str(d.street, 120),
      floor: str(d.floor, 60), code: str(d.code, 30), space: str(d.space, 40), notes: str(d.notes, 500),
      goals: (Array.isArray(d.goals) ? d.goals : []).map((g) => str(g, 30)).filter(Boolean).slice(0, 8)
    }
  };
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(clean.date) && Number.isInteger(clean.time) && clean.time >= 0 && clean.time <= 23 &&
    clean.details.name.length >= 2 &&
    (admin || (/^05\d{8}$/.test(clean.details.phone) && clean.details.street && clean.details.city && clean.date >= todayIL()));
  if (!valid) throw fail("invalid");

  return mutate((data) => {
    const clash = data.bookings.some((x) => x.status !== "cancelled" && x.date === clean.date && x.time === clean.time);
    if (clash && !(admin && body.force)) throw fail("taken");
    const rec = { id: genId(data.bookings), status: "", createdAt: Date.now(), ...clean };
    data.bookings.push(rec);
    return { ok: true, id: rec.id };
  });
}

async function cancel(body) {
  const phone = normPhone(body.phone);
  return mutate((data) => {
    const rec = data.bookings.find((x) => x.id === body.id);
    if (!rec || rec.details.phone !== phone) throw fail("not_found");
    if (rec.status === "cancelled") return { ok: true, noWrite: true };
    rec.status = "cancelled";
    rec.cancelledAt = Date.now();
    rec.cancelledBy = "customer";
    return { ok: true };
  });
}

async function update(body) {
  requireAuth(body.token);
  const status = String(body.status || "");
  if (!STATUSES.includes(status)) throw fail("invalid");
  return mutate((data) => {
    const rec = data.bookings.find((x) => x.id === body.id);
    if (!rec) throw fail("not_found");
    if (status === "" && rec.status === "cancelled" &&
        data.bookings.some((x) => x !== rec && x.status !== "cancelled" && x.date === rec.date && x.time === rec.time)) throw fail("taken");
    rec.status = status;
    return { ok: true };
  });
}

async function login(body) {
  const { data: settings } = await readSettings();
  if (!process.env.ADMIN_PASSWORD && !settings.passwordHash) throw fail("no_password_set");
  const { data } = await readDb();
  if (data.fails.until > Date.now()) throw fail("locked");
  if (!checkPassword(body.password || "", settings)) {
    await new Promise((r) => setTimeout(r, 500));
    await mutate((db) => {
      const recent = db.fails.until && db.fails.until > Date.now() - 600e3 ? db.fails.count : 0;
      db.fails = { count: recent + 1, until: recent + 1 >= 10 ? Date.now() + 600e3 : Date.now() };
      return {};
    }).catch(() => {});
    throw fail("wrong_password");
  }
  if (data.fails.count) await mutate((db) => { db.fails = { count: 0, until: 0 }; return {}; }).catch(() => {});
  return { ok: true, token: makeToken() };
}

async function changePassword(body) {
  requireAuth(body.token);
  const next = String(body.next || "");
  if (next.length < 6 || next.length > 100) throw fail("invalid");
  const { data: settings } = await readSettings();
  if (!checkPassword(body.current || "", settings)) throw fail("wrong_password");
  await mutateSettings((s) => { s.passwordHash = hashPassword(next); return {}; });
  return { ok: true };
}

/* ---------- handler ---------- */

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      if (req.query.action === "health") {
        // בדיקת הגדרות בלי לחשוף סודות: עוזר להבין למה השרת לא עובד
        const health = { ok: true, password: !!process.env.ADMIN_PASSWORD || !!(await readSettings().then((r) => r.data.passwordHash).catch(() => false)), blobToken: !!process.env.BLOB_READ_WRITE_TOKEN, storage: "ok" };
        try { const { data } = await readDb(); health.bookings = data.bookings.length; }
        catch (err) { health.ok = false; health.storage = String(err && err.message || err).slice(0, 300); }
        if (!health.password || !health.blobToken) health.ok = false;
        return res.status(200).json(health);
      }
      if (req.query.action === "config") {
        const { data } = await readSettings();
        return res.status(200).json({ ok: true, config: data.config || null });
      }
      if (req.query.action === "slots") {
        // רק תאריך ושעה, בלי פרטים אישיים
        const today = todayIL();
        const { data } = await readDb();
        const taken = data.bookings.filter((b) => b.status !== "cancelled" && b.date >= today).map((b) => [b.date, b.time]);
        return res.status(200).json({ ok: true, taken });
      }
      return res.status(200).json({ ok: true, service: "afik-booking" });
    }
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
    if (!body || typeof body !== "object") return res.status(400).json({ ok: false, error: "bad_request" });

    let out;
    switch (body.action) {
      case "book": out = await book(body); break;
      case "cancel": out = await cancel(body); break;
      case "login": out = await login(body); break;
      case "logout": out = { ok: true }; break;
      case "list": {
        requireAuth(body.token);
        const { data } = await readDb();
        out = { ok: true, bookings: data.bookings };
        break;
      }
      case "update": out = await update(body); break;
      case "saveConfig": {
        requireAuth(body.token);
        const config = sanitizeConfig(body.config);
        config.updatedAt = Date.now();
        await mutateSettings((s) => { s.config = config; return {}; });
        out = { ok: true, config };
        break;
      }
      case "changePassword": out = await changePassword(body); break;
      default: return res.status(400).json({ ok: false, error: "unknown_action" });
    }
    delete out.noWrite;
    return res.status(200).json(out);
  } catch (err) {
    if (err && KNOWN_ERRORS.has(err.code)) {
      return res.status(200).json({ ok: false, error: err.code });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: "server_error", detail: String(err && err.message || err).slice(0, 200) });
  }
}

/* קביעת אימונים אצל אפיק — כל ההגדרות שאפיק יכול לשנות נמצאות ב-CONFIG */
(() => {
  "use strict";

  const CONFIG = {
    trainer: "אפיק",
    area: "גוש דן והשרון",
    // כתובת השרת (api/booking.js שרץ ב-Vercel). ריק = מצב מקומי בלבד, בלי שרת
    apiUrl: "/api/booking",
    // מספר הוואטסאפ של אפיק בפורמט בינלאומי, בלי + ובלי מקפים
    whatsapp: "972500000000",
    phoneDisplay: "050-000-0000",
    firstTimeDiscount: 0.3,
    minLeadHours: 3,          // אי אפשר לשריין פחות משלוש שעות מראש
    daysAhead: 56,            // שמונה שבועות קדימה
    cancelHours: 12,
    // שעות שאפיק בדרך כלל לא פנוי בהן, אבל אפשר לשריין טנטטיבית. הוא מאשר עד יום לפני
    tentative: { 1: [16, 17, 18, 19, 20, 21], 2: [16, 17, 18, 19, 20, 21] },
    groupExtra: 100,          // תוספת לכל משתתף נוסף באימון קבוצתי
    allowAllCities: true,     // לקבל הזמנות מכל הארץ ולא רק מהערים ברשימה
    otherCityFee: 50,         // תוספת נסיעה לעיר שלא ברשימה
    // SHA-256 של סיסמת דף הניהול (ברירת מחדל: afik2026). להחלפה ראו README
    adminPasswordHash: "483e66aa775ad9e6e1c34987c9812294acdf5bf3936e8a7d6baec22602da88c3",
    // שעות התחלה לפי יום בשבוע (0 = ראשון)
    hours: {
      0: [6, 7, 8, 9, 10, 16, 17, 18, 19, 20, 21],
      1: [6, 7, 8, 9, 10, 16, 17, 18, 19, 20, 21],
      2: [6, 7, 8, 9, 10, 16, 17, 18, 19, 20, 21],
      3: [6, 7, 8, 9, 10, 16, 17, 18, 19, 20, 21],
      4: [6, 7, 8, 9, 10, 16, 17, 18, 19, 20, 21],
      5: [7, 8, 9, 10, 11, 12],
      6: []
    },
    cities: [
      { name: "תל אביב-יפו", fee: 0 }, { name: "רמת גן", fee: 0 }, { name: "גבעתיים", fee: 0 },
      { name: "הרצליה", fee: 0 }, { name: "רמת השרון", fee: 0 }, { name: "פתח תקווה", fee: 20 },
      { name: "חולון", fee: 20 }, { name: "בת ים", fee: 20 }, { name: "רעננה", fee: 20 },
      { name: "כפר סבא", fee: 30 }, { name: "הוד השרון", fee: 30 }, { name: "ראשון לציון", fee: 30 }
    ],
    workouts: [
      {
        id: "strength", name: "כוח ותנועה", minutes: 60, price: 260,
        sub: "משקולות, גומיות ומשקל גוף",
        desc: "בונים שריר ויציבה עם תרגילים שאפשר לעשות בכל סלון. מתאים גם למי שלא הרים משקולת מעולם.",
        gear: ["מזרן", "קטלבל 8–16 ק״ג", "משקולות יד", "גומיות התנגדות"],
        icon: "strength"
      },
      {
        id: "hiit", name: "HIIT שורף", minutes: 45, price: 230,
        sub: "אינטרוולים קצרים ועצימים",
        desc: "45 דקות של עבודה בעצימות גבוהה ומנוחות קצרות. דופק למעלה, זמן קצר, הרבה זיעה.",
        gear: ["מזרן", "חבל קפיצה", "קטלבל 12 ק״ג", "טיימר"],
        icon: "hiit"
      },
      {
        id: "mobility", name: "גמישות וגב בריא", minutes: 60, price: 240,
        sub: "מוביליטי, ליבה ונשימה",
        desc: "למי שיושב מול מחשב כל היום. משחררים ירכיים וכתפיים ומחזקים את שרירי הליבה שמחזיקים את הגב.",
        gear: ["מזרן", "רולר עיסוי", "כדור פיזיו", "רצועת מתיחה"],
        icon: "mobility"
      },
      {
        id: "duo", name: "אימון זוגי", minutes: 60, price: 380,
        sub: "בן או בת זוג, חבר או אמא",
        desc: "אימון אחד לשניים, עם תוכנית שמתאימה לכל אחד. מתחלקים במחיר ומוסיפים קצת תחרות.",
        gear: ["2 מזרנים", "קטלבלים בזוגות", "גומיות התנגדות", "TRX"],
        icon: "duo"
      }
    ]
  };

  // כל הערים והמועצות המקומיות בישראל, לבחירת עיר בטופס ההזמנה
  const IL_CITIES = [
    "אבו גוש", "אבו סנאן", "אבן יהודה", "אום אל-פחם", "אופקים", "אור יהודה", "אור עקיבא", "אורנית",
    "אזור", "אילת", "אכסאל", "אליכין", "אלעד", "אלפי מנשה", "אלקנה", "אעבלין",
    "אפרת", "אריאל", "אשדוד", "אשקלון", "באקה אל-גרבייה", "באר יעקב", "באר שבע", "בועיינה-נוג'ידאת",
    "בוקעאתא", "ביר אל-מכסור", "בית אל", "בית אריה-עופרים", "בית ג'ן", "בית דגן", "בית שאן", "בית שמש",
    "ביתר עילית", "בני ברק", "בני עי\"ש", "בנימינה-גבעת עדה", "בסמ\"ה", "בסמת טבעון", "בת ים", "ג'דיידה-מכר",
    "ג'ולס", "ג'לג'וליה", "ג'סר א-זרקא", "ג'ש (גוש חלב)", "ג'ת", "גבעת זאב", "גבעת שמואל", "גבעתיים",
    "גדרה", "גן יבנה", "גני תקווה", "דאלית אל-כרמל", "דבוריה", "דייר אל-אסד", "דייר חנא", "דימונה",
    "הוד השרון", "הר אדר", "הרצליה", "זכרון יעקב", "זרזיר", "חדרה", "חולון", "חורה",
    "חורפיש", "חיפה", "חצור הגלילית", "חריש", "טבריה", "טובא-זנגרייה", "טורעאן", "טייבה",
    "טירה", "טירת כרמל", "טמרה", "יבנאל", "יבנה", "יהוד-מונוסון", "יסוד המעלה", "יפיע",
    "יקנעם עילית", "ירוחם", "ירושלים", "ירכא", "כאבול", "כוכב יאיר-צור יגאל", "כסיפה", "כסרא-סמיע",
    "כעביה-טבאש-חג'אג'רה", "כפר ברא", "כפר ורדים", "כפר יאסיף", "כפר יונה", "כפר כמא", "כפר כנא", "כפר מנדא",
    "כפר סבא", "כפר קאסם", "כפר קרע", "כפר שמריהו", "כפר תבור", "כרמיאל", "לוד", "להבים",
    "לקיה", "מבשרת ציון", "מגאר", "מגד אל-כרום", "מגדל", "מגדל העמק", "מג'דל שמס", "מודיעין עילית",
    "מודיעין-מכבים-רעות", "מזכרת בתיה", "מטולה", "מיתר", "מסעדה", "מעיליא", "מעלה אדומים", "מעלה אפרים",
    "מעלה עירון", "מעלות-תרשיחא", "מצפה רמון", "משהד", "נהריה", "נוף הגליל", "נחף", "נס ציונה",
    "נצרת", "נשר", "נתיבות", "נתניה", "סאג'ור", "סביון", "סח'נין", "ע'ג'ר",
    "עומר", "עילבון", "עילוט", "עין מאהל", "עין קנייא", "עכו", "עמנואל", "עספיא",
    "עפולה", "עראבה", "ערד", "ערערה", "ערערה-בנגב", "פוריידיס", "פסוטה", "פקיעין",
    "פרדס חנה-כרכור", "פרדסיה", "פתח תקווה", "צפת", "קדומים", "קדימה-צורן", "קלנסווה", "קצרין",
    "קריית אונו", "קריית ארבע", "קריית אתא", "קריית ביאליק", "קריית גת", "קריית טבעון", "קריית ים", "קריית יערים",
    "קריית מוצקין", "קריית מלאכי", "קריית עקרון", "קריית שמונה", "קרני שומרון", "ראמה", "ראש העין", "ראש פינה",
    "ראשון לציון", "רהט", "רחובות", "ריינה", "רכסים", "רמלה", "רמת גן", "רמת השרון",
    "רמת ישי", "רעננה", "שבלי-אום אל-גנם", "שגב-שלום", "שדרות", "שוהם", "שלומי", "שעב",
    "שפרעם", "תל אביב-יפו", "תל מונד", "תל שבע"
  ].sort((a, b) => a.localeCompare(b, "he"));
  const OTHER_CITY = "__other";

  const ICONS = {
    strength: '<path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12"/>',
    hiit: '<path d="M13 2 5 14h6l-1 8 8-12h-6l1-8Z"/>',
    mobility: '<circle cx="12" cy="5" r="2"/><path d="M12 7v6m0 0-4 7m4-7 4 7M6 10c2 1.5 4 2 6 2s4-.5 6-2"/>',
    duo: '<circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6m-2.5-5.7A6 6 0 0 1 22 20"/>',
    run: '<circle cx="14" cy="4.5" r="2"/><path d="M8 21l3-6 3 2v5M6 12l3-4 4 1 3 4h3M11 15l-1-5"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/><path d="M8 12h2l1-2 2 4 1-2h2"/>'
  };
  // השדות שאפיק יכול לערוך מדף הניהול. ברירות המחדל נשמרות למקרה שאין הגדרות שמורות
  const EDITABLE = ["trainer", "phoneDisplay", "area", "hours", "workouts", "cities", "tentative", "groupExtra", "allowAllCities", "otherCityFee", "firstTimeDiscount", "minLeadHours", "daysAhead", "cancelHours"];
  const pickEditable = (src) => JSON.parse(JSON.stringify(Object.fromEntries(EDITABLE.map((k) => [k, src[k]]))));

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const hhmm = (h, m = 0) => `${pad(h)}:${pad(m)}`;
  const ils = (n) => `₪${Math.round(n).toLocaleString("he-IL")}`;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fmtLong = new Intl.DateTimeFormat("he-IL", { weekday: "long", day: "numeric", month: "long" });
  const fmtMonth = new Intl.DateTimeFormat("he-IL", { month: "long", year: "numeric" });
  const rtf = new Intl.RelativeTimeFormat("he", { numeric: "auto" });

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem("afik:" + key); return v == null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem("afik:" + key, JSON.stringify(value)); } catch { /* storage blocked */ }
    }
  };

  const workoutById = (id) => CONFIG.workouts.find((w) => w.id === id);
  const cityByName = (n) => CONFIG.cities.find((c) => c.name === n);
  const cityFee = (n) => { const c = cityByName(n); return c ? c.fee : (n && CONFIG.allowAllCities ? CONFIG.otherCityFee : 0); };
  const endTime = (h, minutes) => { const t = h * 60 + minutes; return hhmm(Math.floor(t / 60), t % 60); };

  function priceFor(workoutId, firstTime, city, people = 1) {
    const w = workoutById(workoutId);
    if (!w) return null;
    const base = w.price;
    const discount = firstTime ? Math.round(base * CONFIG.firstTimeDiscount / 10) * 10 : 0;
    const fee = cityFee(city);
    const extra = Math.max(0, people - 1) * (CONFIG.groupExtra || 0);
    return { base, discount, fee, extra, people, total: base - discount + fee + extra };
  }

  /* deterministic "Afik is already booked" so the calendar looks like a real diary */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967295;
  }

  let bookings = store.get("bookings", []);

  /* ---------- server (Vercel function + Blob storage) ---------- */
  const API = location.protocol.startsWith("http") ? CONFIG.apiUrl.trim() : "";
  const online = !!API;
  let serverTaken = null; // Set של "yyyy-mm-dd@h" אחרי טעינה מהשרת

  async function api(payload) {
    const res = await fetch(API, { method: "POST", body: JSON.stringify(payload) });
    let data;
    try { data = await res.json(); }
    catch { const err = new Error("bad_response"); err.code = `http_${res.status}`; throw err; }
    if (!data.ok) { const err = new Error(data.detail || data.error || "error"); err.code = data.error; err.detail = data.detail; throw err; }
    return data;
  }

  async function loadTaken() {
    if (!online) return;
    try {
      const res = await fetch(`${API}?action=slots`);
      const data = await res.json();
      serverTaken = new Set((data.taken || []).map(([iso, h]) => `${iso}@${Number(h)}`));
    } catch {
      toast(`לא הצלחנו לטעון את היומן של ${CONFIG.trainer}. נסו לרענן בעוד רגע`);
    }
    refreshAvailability();
  }

  function refreshAvailability() {
    updateNextSlot();
    if (state.step === 2) { renderCalendar(); renderSlots(); }
  }

  function isTaken(iso, h) {
    if (bookings.some((b) => b.date === iso && b.time === h && b.status !== "cancelled")) return true;
    if (online) return serverTaken ? serverTaken.has(`${iso}@${h}`) : false;
    const d = fromISO(iso);
    const dow = d.getDay();
    const busyRate = dow === 5 ? 0.45 : (h >= 18 && h <= 20 ? 0.55 : 0.32);
    return hash(`${iso}@${h}`) < busyRate;
  }

  const isTentative = (iso, h) => (CONFIG.tentative?.[fromISO(iso).getDay()] || []).includes(h);

  function slotsFor(iso) {
    const d = fromISO(iso);
    const now = new Date();
    const lead = now.getTime() + CONFIG.minLeadHours * 3600e3;
    return (CONFIG.hours[d.getDay()] || []).map((h) => {
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h);
      const tooSoon = start.getTime() < lead;
      return { h, free: !tooSoon && !isTaken(iso, h), tooSoon, tentative: isTentative(iso, h) };
    });
  }

  function dayLoad(iso) {
    const s = slotsFor(iso);
    if (!s.length) return null;
    const free = s.filter((x) => x.free).length;
    if (!free) return "none";
    return free <= 2 ? "few" : "many";
  }

  function nextFree() {
    const today = new Date();
    for (let i = 0; i < CONFIG.daysAhead; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const iso = toISO(d);
      const s = slotsFor(iso).find((x) => x.free && !x.tentative);
      if (s) return { iso, h: s.h, offset: i };
    }
    return null;
  }

  function friendlyDay(iso) {
    const d = fromISO(iso);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = Math.round((d - today) / 864e5);
    if (diff === 0) return "היום";
    if (diff === 1) return "מחר";
    if (diff === 2) return "מחרתיים";
    return fmtLong.format(d);
  }

  /* ---------- state ---------- */
  const saved = store.get("profile", {});
  const state = {
    step: 1,
    maxStep: 1,
    workoutId: null,
    firstTime: false,
    date: null,
    time: null,
    view: (() => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), 1); })(),
    space: saved.space || null,
    goals: saved.goals || [],
    mode: "solo",           // solo | group
    gView: "choose",        // choose | join | create (לפני שיש קבוצה)
    group: null,            // הקבוצה הטעונה
    gAvail: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] } // השעות שאני מסמן/ת
  };

  /* ---------- toast ---------- */
  function toast(msg, kind = "") {
    const el = document.createElement("div");
    el.className = `toast ${kind ? "toast--" + kind : ""}`;
    el.innerHTML = `<i aria-hidden="true"></i><span></span>`;
    el.lastChild.textContent = msg;
    $("#toasts").append(el);
    setTimeout(() => { el.classList.add("is-out"); el.addEventListener("animationend", () => el.remove(), { once: true }); }, 3200);
  }

  /* ---------- ripple ---------- */
  document.addEventListener("pointerdown", (e) => {
    const btn = e.target.closest("[data-ripple]");
    if (!btn || reduceMotion) return;
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.2;
    const s = document.createElement("span");
    s.className = "ripple";
    s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    btn.append(s);
    s.addEventListener("animationend", () => s.remove());
  });

  function shake(el) {
    el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake");
    el.addEventListener("animationend", () => el.classList.remove("shake"), { once: true });
  }

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const savedTheme = store.get("theme", null);
  if (savedTheme) root.dataset.theme = savedTheme;
  $("#themeBtn").addEventListener("click", () => {
    const isDark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";
    store.set("theme", root.dataset.theme);
  });

  const topbar = $(".topbar");
  const onScroll = () => topbar.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- showcase + pick ---------- */
  const svg = (inner, size = 24) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${inner}</svg>`;

  const iconSvg = (key, size) => svg(ICONS[key] || ICONS.strength, size);
  function renderShowcase() {
  $("#workoutShowcase").innerHTML = CONFIG.workouts.map((w) => `
    <article class="wcard">
      <span class="wcard__icon">${iconSvg(w.icon, 26)}</span>
      <h3>${esc(w.name)}</h3>
      <p>${esc(w.desc)}</p>
      <div class="wcard__meta">
        <span>${w.minutes} דק׳</span><b>${ils(w.price)}</b>
      </div>
      <span class="wcard__go">לשריין ${svg('<path d="M14 6l-6 6 6 6"/>', 16)}</span>
      <button class="wcard__btn" type="button" data-pick="${w.id}" aria-label="לשריין ${esc(w.name)}"></button>
    </article>`).join("");
  }

  function renderPick() {
    $("#workoutPick").innerHTML = CONFIG.workouts.map((w) => {
      const p = priceFor(w.id, state.firstTime);
      const checked = state.workoutId === w.id;
      return `
        <button type="button" class="opt" role="radio" aria-checked="${checked}" tabindex="${checked || (!state.workoutId && w === CONFIG.workouts[0]) ? 0 : -1}" data-id="${w.id}">
          <span class="opt__icon">${iconSvg(w.icon)}</span>
          <span class="opt__name">${esc(w.name)}</span>
          <span class="opt__price">${p.discount ? `<s>${ils(p.base)}</s>` : ""}${ils(p.total)}</span>
          <span class="opt__sub">${w.minutes} דק׳${w.sub ? ` · ${esc(w.sub)}` : ""}</span>
        </button>`;
    }).join("");
  }

  $("#workoutPick").addEventListener("click", (e) => {
    const b = e.target.closest(".opt"); if (!b) return;
    selectWorkout(b.dataset.id);
  });
  $("#workoutPick").addEventListener("keydown", (e) => {
    const keys = { ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const opts = $$(".opt", e.currentTarget);
    const i = opts.indexOf(document.activeElement);
    const next = opts[(i + keys[e.key] + opts.length) % opts.length];
    selectWorkout(next.dataset.id); $(`.opt[data-id="${next.dataset.id}"]`).focus();
  });

  function selectWorkout(id) {
    state.workoutId = id;
    $("#err1").textContent = "";
    renderPick(); updateSummary("workout");
  }

  $("#firstTime").addEventListener("change", (e) => {
    state.firstTime = e.target.checked;
    renderPick(); updateSummary();
    if (state.firstTime) toast(`הנחת היכרות של ${Math.round(CONFIG.firstTimeDiscount * 100)}% נוספה`, "ok");
  });

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-pick]"); if (!b) return;
    selectWorkout(b.dataset.pick);
    goTo(2, true);
    $("#book").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- calendar ---------- */
  const today0 = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
  const lastDay = () => { const t = today0(); t.setDate(t.getDate() + CONFIG.daysAhead); return t; };

  function renderCalendar(dir) {
    const v = state.view;
    $("#calMonth").textContent = fmtMonth.format(v);
    const first = v.getDay();
    const days = new Date(v.getFullYear(), v.getMonth() + 1, 0).getDate();
    const t0 = today0(), max = lastDay();
    const mine = new Set(bookings.map((b) => b.date));
    let html = "";
    for (let i = 0; i < first; i++) html += `<span class="day day--pad" aria-hidden="true"></span>`;
    for (let d = 1; d <= days; d++) {
      const date = new Date(v.getFullYear(), v.getMonth(), d);
      const iso = toISO(date);
      const isSat = date.getDay() === 6;
      const out = date < t0 || date > max;
      const load = out ? null : dayLoad(iso);
      const disabled = out || !load || load === "none";
      const cls = ["day", isSat && "is-sat", +date === +t0 && "is-today", state.date === iso && "is-selected", mine.has(iso) && "is-mine"].filter(Boolean).join(" ");
      const label = `${fmtLong.format(date)}${isSat ? ", שבת, אין אימונים" : load === "none" ? ", אין שעות פנויות" : load === "few" ? ", כמעט מלא" : ""}`;
      html += `<button type="button" class="${cls}" data-date="${iso}" ${load ? `data-load="${load}"` : ""} ${disabled ? "disabled" : ""} aria-label="${label}" aria-pressed="${state.date === iso}">${d}</button>`;
    }
    const grid = $("#calGrid");
    grid.innerHTML = html;
    if (dir) { grid.classList.remove("slide-next", "slide-prev"); void grid.offsetWidth; grid.classList.add(dir > 0 ? "slide-next" : "slide-prev"); }
    const minView = new Date(t0.getFullYear(), t0.getMonth(), 1);
    const maxView = new Date(max.getFullYear(), max.getMonth(), 1);
    $("#calPrev").disabled = +v <= +minView;
    $("#calNext").disabled = +v >= +maxView;
  }

  $("#calPrev").addEventListener("click", () => { state.view = new Date(state.view.getFullYear(), state.view.getMonth() - 1, 1); renderCalendar(-1); });
  $("#calNext").addEventListener("click", () => { state.view = new Date(state.view.getFullYear(), state.view.getMonth() + 1, 1); renderCalendar(1); });
  $("#calGrid").addEventListener("click", (e) => {
    const b = e.target.closest(".day"); if (!b || b.disabled) return;
    selectDate(b.dataset.date);
  });

  function selectDate(iso) {
    const changed = state.date !== iso;
    state.date = iso;
    if (changed) state.time = null;
    $("#err2").textContent = "";
    renderCalendar(); renderSlots(); updateSummary("date");
    if (matchMedia("(max-width: 860px)").matches) $("#slots").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
  }

  const tentNoteHtml = () => `<b>שריון טנטטיבי.</b> ${esc(CONFIG.trainer)} בדרך כלל לא פנוי בשעה הזאת, אבל ינסה. הוא יעדכן עד יום לפני האימון אם זה מסתדר, ואם לא, קובעים יחד שעה אחרת.`;

  function renderSlots() {
    const box = $("#slots");
    if (!state.date) return;
    const w = workoutById(state.workoutId);
    const mins = w ? w.minutes : 60;
    const list = slotsFor(state.date);
    const groups = [
      ["בוקר", list.filter((s) => s.h < 12)],
      ["צהריים", list.filter((s) => s.h >= 12 && s.h < 16)],
      ["ערב", list.filter((s) => s.h >= 16)]
    ].filter(([, g]) => g.length);
    const freeCount = list.filter((s) => s.free).length;
    let i = 0;
    box.innerHTML = `
      <p class="slots__day">${friendlyDay(state.date)}<small>${freeCount} שעות פנויות · אימון של ${mins} דק׳</small></p>
      ${groups.map(([label, g]) => `
        <div class="slots__group">
          <p class="slots__label">${label}</p>
          <div class="slots__row" role="radiogroup" aria-label="${label}">
            ${g.map((s) => `<button type="button" class="slot${s.tentative ? " slot--tent" : ""}" role="radio" style="--i:${i++}" data-h="${s.h}" aria-checked="${state.time === s.h}" ${s.free ? "" : "disabled"} aria-label="${hhmm(s.h)} עד ${endTime(s.h, mins)}${s.free ? (s.tentative ? ", טנטטיבי" : "") : s.tooSoon ? ", מוקדם מדי לשריון" : ", תפוס"}">${hhmm(s.h)}</button>`).join("")}
          </div>
        </div>`).join("")}
      ${list.some((x) => x.tentative) ? `<p class="slots__tentlegend"><i aria-hidden="true"></i>שעות מקווקוות הן טנטטיביות: ${esc(CONFIG.trainer)} בדרך כלל לא פנוי בהן</p>` : ""}
      <div class="tentnote" id="tentNote" ${isTentative(state.date, state.time) ? "" : "hidden"}>${tentNoteHtml()}</div>
      <p class="slots__foot">${esc(slotsFootnote(state.date))}</p>`;
  }

  $("#slots").addEventListener("click", (e) => {
    const b = e.target.closest(".slot"); if (!b || b.disabled) return;
    state.time = Number(b.dataset.h);
    $$(".slot", $("#slots")).forEach((s) => s.setAttribute("aria-checked", s === b));
    const tn = $("#tentNote"); if (tn) tn.hidden = !b.classList.contains("slot--tent");
    $("#err2").textContent = "";
    updateSummary("time");
  });

  /* ---------- details form ---------- */
  const fCity = $("#fCity");
  function renderCityOptions() {
    const current = fCity.value;
    const service = [...CONFIG.cities].sort((a, b) => a.name.localeCompare(b.name, "he"));
    const opt = (name, label = name) => `<option value="${esc(name)}">${esc(label)}</option>`;
    let html = `<option value="">בחירת עיר</option>`;
    if (CONFIG.allowAllCities) {
      const inService = new Set(service.map((c) => c.name));
      html += `<optgroup label="אזור השירות של ${esc(CONFIG.trainer)}">${service.map((c) => opt(c.name, c.fee ? `${c.name} (+${ils(c.fee)})` : c.name)).join("")}</optgroup>`;
      html += `<optgroup label="כל הערים בארץ${CONFIG.otherCityFee ? ` (+${ils(CONFIG.otherCityFee)} נסיעה)` : ""}">${IL_CITIES.filter((n) => !inService.has(n)).map((n) => opt(n)).join("")}</optgroup>`;
      html += opt(OTHER_CITY, "יישוב אחר (קיבוץ, מושב…)");
    } else {
      html += service.map((c) => opt(c.name)).join("");
    }
    fCity.innerHTML = html;
    if (current && [...fCity.options].some((o) => o.value === current)) fCity.value = current;
    updateCityHint();
    const anyFee = CONFIG.cities.some((c) => c.fee);
    $("#faqCities").textContent = CONFIG.allowAllCities
      ? `${CONFIG.trainer} מגיע לכל הארץ. באזור הקבוע (${CONFIG.cities.map((c) => c.name).join(", ")})${anyFee ? " יש תוספת נסיעה קטנה רק בחלק מהערים" : " אין תוספת נסיעה"}${CONFIG.otherCityFee ? `, ובשאר הארץ יש תוספת של ${ils(CONFIG.otherCityFee)}` : ""}. התוספת מופיעה בזמן ההזמנה.`
      : `${CONFIG.cities.map((c) => c.name).join(", ")}.${anyFee ? " בחלק מהערים יש תוספת נסיעה קטנה שמופיעה בזמן ההזמנה." : ""} גרים קצת מחוץ לאזור? כתבו ל${CONFIG.trainer} בוואטסאפ.`;
  }

  const fields = {
    fName: { key: "name", test: (v) => v.trim().split(/\s+/).length >= 2 && v.trim().length >= 4, msg: (v) => v.trim() ? "צריך שם פרטי ושם משפחה" : "איך קוראים לך?" },
    fPhone: { key: "phone", test: (v) => /^05\d{8}$/.test(normPhone(v)), msg: (v) => v.trim() ? "מספר נייד ישראלי מתחיל ב־05 ויש בו 10 ספרות" : `לאן ${CONFIG.trainer} ישלח אישור?` },
    fCity: { key: "city", test: (v) => v === OTHER_CITY ? $("#fCityOther").value.trim().length >= 2 : !!v, msg: (v) => v === OTHER_CITY ? "כתבו את שם היישוב" : "לאיזו עיר להגיע?" },
    fStreet: { key: "street", test: (v) => /\d/.test(v) && /[֐-׿a-zA-Z]{2,}/.test(v), msg: (v) => v.trim() ? "חסר מספר בית" : "לאיזו כתובת להגיע?" }
  };

  function normPhone(v) {
    let d = v.replace(/\D/g, "");
    if (d.startsWith("972")) d = "0" + d.slice(3);
    return d;
  }

  function validateField(id, show = true) {
    const el = $("#" + id), f = fields[id];
    const ok = f.test(el.value);
    const wrap = el.closest(".field");
    if (show) {
      wrap.classList.toggle("is-invalid", !ok);
      wrap.classList.toggle("is-valid", ok);
      $(`[data-for="${id}"]`).textContent = ok ? "" : f.msg(el.value);
      el.setAttribute("aria-invalid", String(!ok));
    }
    return ok;
  }

  Object.keys(fields).forEach((id) => {
    const el = $("#" + id);
    el.addEventListener("blur", () => { if (el.value) validateField(id); });
    el.addEventListener("input", () => {
      if (el.closest(".field").classList.contains("is-invalid")) validateField(id);
      else if (fields[id].test(el.value)) validateField(id);
      saveProfile(); updateSummary();
    });
  });
  function selectedCity() {
    return fCity.value === OTHER_CITY ? $("#fCityOther").value.trim() : fCity.value;
  }
  function updateCityHint() {
    const other = fCity.value === OTHER_CITY;
    $("#fCityOther").hidden = !other;
    const name = selectedCity();
    const c = cityByName(name);
    $("#cityHint").textContent = !name ? "" : c
      ? (c.fee ? `תוספת נסיעה לעיר הזאת: ${ils(c.fee)}` : "בלי תוספת נסיעה")
      : (CONFIG.otherCityFee ? `מחוץ לאזור הקבוע: תוספת נסיעה ${ils(CONFIG.otherCityFee)}` : "בלי תוספת נסיעה");
  }
  $("#fCityOther").addEventListener("input", () => {
    if (fCity.closest(".field").classList.contains("is-invalid") || $("#fCityOther").value.trim().length >= 2) validateField("fCity");
    updateCityHint(); saveProfile(); updateSummary();
  });
  fCity.addEventListener("change", () => {
    const other = fCity.value === OTHER_CITY;
    updateCityHint();
    if (other) { $("#fCityOther").focus(); fCity.closest(".field").classList.remove("is-invalid", "is-valid"); $('[data-for="fCity"]').textContent = ""; }
    else validateField("fCity");
    saveProfile(); updateSummary("addr");
  });

  // live phone formatting: 0501234567 -> 050-123-4567
  $("#fPhone").addEventListener("input", (e) => {
    const el = e.target;
    const atEnd = el.selectionStart === el.value.length;
    const d = normPhone(el.value).slice(0, 10);
    const out = d.length > 6 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : d.length > 3 ? `${d.slice(0, 3)}-${d.slice(3)}` : d;
    if (atEnd && out !== el.value) el.value = out;
  });

  ["fFloor", "fCode"].forEach((id) => $("#" + id).addEventListener("input", saveProfile));
  $("#fNotes").addEventListener("input", (e) => { $("#notesCount").textContent = e.target.value.length; });

  $$(".chips").forEach((group) => {
    const multi = group.hasAttribute("data-multi");
    const key = group.dataset.group;
    const sync = () => $$(".chip", group).forEach((c) => {
      const on = multi ? state.goals.includes(c.dataset.value) : state.space === c.dataset.value;
      c.setAttribute(multi ? "aria-pressed" : "aria-checked", String(on));
    });
    group.addEventListener("click", (e) => {
      const c = e.target.closest(".chip"); if (!c) return;
      const v = c.dataset.value;
      if (multi) state.goals = state.goals.includes(v) ? state.goals.filter((g) => g !== v) : [...state.goals, v];
      else state.space = state.space === v ? null : v;
      sync(); saveProfile();
    });
    sync();
    if (key === "space") group._sync = sync;
  });

  function readDetails() {
    return {
      name: $("#fName").value.trim(),
      phone: normPhone($("#fPhone").value),
      city: selectedCity(),
      street: $("#fStreet").value.trim(),
      floor: $("#fFloor").value.trim(),
      code: $("#fCode").value.trim(),
      notes: $("#fNotes").value.trim(),
      space: state.space,
      goals: state.goals
    };
  }

  function saveProfile() {
    const d = readDetails();
    store.set("profile", { name: d.name, phone: $("#fPhone").value, city: d.city, street: d.street, floor: d.floor, code: d.code, space: d.space, goals: d.goals });
  }

  function restoreProfile() {
    if (saved.name) $("#fName").value = saved.name;
    if (saved.phone) $("#fPhone").value = saved.phone;
    if (saved.street) $("#fStreet").value = saved.street;
    if (saved.floor) $("#fFloor").value = saved.floor;
    if (saved.code) $("#fCode").value = saved.code;
    if (saved.city) {
      const known = [...fCity.options].some((o) => o.value === saved.city && o.value !== OTHER_CITY);
      if (known) fCity.value = saved.city;
      else if (CONFIG.allowAllCities) { fCity.value = OTHER_CITY; $("#fCityOther").value = saved.city; }
      fCity.dispatchEvent(new Event("change"));
      if (fCity.value === OTHER_CITY) validateField("fCity");
    }
    Object.keys(fields).forEach((id) => { if ($("#" + id).value && fields[id].test($("#" + id).value)) validateField(id); });
  }

  /* ---------- summary ---------- */
  function setDD(id, text, flash) {
    const el = $("#" + id);
    const empty = !text;
    const next = text || el.dataset.empty;
    if (!el.dataset.empty) el.dataset.empty = el.textContent;
    if (el.textContent !== next) {
      el.textContent = next;
      if (flash && !empty && !reduceMotion) { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); }
    }
    el.classList.toggle("is-empty", empty);
  }

  let shownTotal = 0;
  function animateNumber(el, to) {
    const from = shownTotal; shownTotal = to;
    if (reduceMotion || from === to) { el.textContent = to ? ils(to) : "—"; return; }
    const t0 = performance.now(), dur = 450;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = ils(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function updateSummary(changed) {
    const w = workoutById(state.workoutId);
    const d = readDetails();
    setDD("sWorkout", w ? `${w.name} · ${w.minutes} דק׳${state.mode === "group" ? ` · ${state.group ? `קבוצה של ${groupPeople()}` : "בקבוצה"}` : ""}` : "", changed === "workout");
    setDD("sDate", state.date ? friendlyDay(state.date) : "", changed === "date");
    setDD("sTime", state.time != null ? `${hhmm(state.time)}–${endTime(state.time, w ? w.minutes : 60)}${state.date && isTentative(state.date, state.time) ? " · טנטטיבי" : ""}` : "", changed === "time" || changed === "workout");
    setDD("sAddr", d.city && d.street ? `${d.street}, ${d.city}` : d.city || "", changed === "addr");
    const p = priceFor(state.workoutId, state.firstTime, d.city, groupPeople());
    animateNumber($("#sPrice"), p ? p.total : 0);
    $("#navPrice").textContent = p ? ils(p.total) : "";
    const gear = w ? w.gear : ["מזרן", "גומיות התנגדות", "קטלבל 8–16 ק״ג"];
    const gearHtml = gear.map((g, i) => `<li style="--i:${i}">${g}</li>`).join("");
    if ($("#sGear").dataset.for !== (w?.id || "")) { $("#sGear").innerHTML = gearHtml; $("#sGear").dataset.for = w?.id || ""; }
  }

  /* ---------- review ticket ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  function renderTicket() {
    const w = workoutById(state.workoutId);
    const d = readDetails();
    const p = priceFor(state.workoutId, state.firstTime, d.city, groupPeople());
    const tent = isTentative(state.date, state.time);
    const names = groupNames();
    const addr = [d.street, d.floor, d.city].filter(Boolean).join(", ");
    const phone = d.phone.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3");
    $("#ticket").innerHTML = `
      <div class="ticket__top">
        <small>${esc(friendlyDay(state.date))}${friendlyDay(state.date) !== fmtLong.format(fromISO(state.date)) ? " · " + esc(fmtLong.format(fromISO(state.date))) : ""}</small>
        <b>${esc(w.name)}</b>
        <span dir="ltr">${hhmm(state.time)} – ${endTime(state.time, w.minutes)}</span>
      </div>
      <div class="ticket__perf" aria-hidden="true"></div>
      <dl class="ticket__rows">
        <div class="trow"><dt>מתאמן/ת</dt><dd>${esc(d.name)} · <span dir="ltr">${esc(phone)}</span></dd><button type="button" data-goto="3">שינוי</button></div>
        <div class="trow"><dt>כתובת</dt><dd>${esc(addr)}${d.code ? ` · קוד <span dir="ltr">${esc(d.code)}</span>` : ""}${d.space ? ` · ב${esc(d.space)}` : ""}</dd><button type="button" data-goto="3">שינוי</button></div>
        <div class="trow"><dt>מועד</dt><dd>${esc(fmtLong.format(fromISO(state.date)))}, ${hhmm(state.time)}</dd><button type="button" data-goto="2">שינוי</button></div>
        ${tent ? `<div class="trow trow--tent"><dt>סטטוס</dt><dd>טנטטיבי. ${esc(CONFIG.trainer)} יאשר עד יום לפני</dd><span></span></div>` : ""}
        ${names.length > 1 ? `<div class="trow"><dt>משתתפים</dt><dd>${names.map(esc).join(", ")}</dd><button type="button" data-goto="2">שינוי</button></div>` : ""}
        ${d.goals.length ? `<div class="trow"><dt>מטרות</dt><dd>${d.goals.map(esc).join(", ")}</dd><button type="button" data-goto="3">שינוי</button></div>` : ""}
        ${d.notes ? `<div class="trow"><dt>הערות</dt><dd>${esc(d.notes)}</dd><button type="button" data-goto="3">שינוי</button></div>` : ""}
        ${p.discount ? `<div class="trow"><dt>הנחת היכרות</dt><dd>−${ils(p.discount)}</dd><span></span></div>` : ""}
        ${p.fee ? `<div class="trow"><dt>תוספת נסיעה</dt><dd>${ils(p.fee)}</dd><span></span></div>` : ""}
        ${p.extra ? `<div class="trow"><dt>${p.people === 2 ? "משתתף נוסף" : `${p.people - 1} משתתפים נוספים`}</dt><dd>${ils(p.extra)}${p.people > 1 ? ` · ${ils(p.total / p.people)} לאחד` : ""}</dd><span></span></div>` : ""}
      </dl>
      <div class="ticket__total"><span>לתשלום אחרי האימון</span><span>${p.discount || p.fee || p.extra ? `<s>${ils(p.base)}</s>` : ""}<b>${ils(p.total)}</b></span></div>`;
  }

  /* ---------- wizard ---------- */
  const panels = $$(".panel");
  const stepsEl = $$(".steps__item");

  function validateStep(n) {
    if (n === 1) {
      if (!state.workoutId) { $("#err1").textContent = "בחרו סוג אימון כדי להמשיך"; shake($("#workoutPick")); return false; }
    }
    if (n === 2 && state.mode === "group") {
      if (!state.group) { $("#errG").textContent = "קודם פותחים קבוצה: כותבים שם, מסמנים שעות ולוחצים על יצירת קבוצה"; shake($("#groupBox")); return false; }
      if (!groupMe()) { $("#errG").textContent = "קודם מצטרפים לקבוצה"; shake($("#groupBox")); return false; }
      if (state.group.booked) { $("#errG").textContent = "האימון של הקבוצה כבר נקבע"; return false; }
      if (!state.date || state.time == null) { $("#errG").textContent = "בחרו שעה שמתאימה לכולם"; shake($("#gMatches") || $("#groupBox")); return false; }
      if (!slotsFor(state.date).find((s) => s.h === state.time)?.free) { $("#errG").textContent = "השעה הזאת כבר נתפסה, בחרו שעה אחרת"; state.date = null; state.time = null; renderGroup(); return false; }
      return true;
    }
    if (n === 2) {
      if (!state.date) { $("#err2").textContent = "בחרו יום בלוח"; shake($("#cal")); return false; }
      if (state.time == null) { $("#err2").textContent = "בחרו שעה מהרשימה"; shake($("#slots")); return false; }
      if (!slotsFor(state.date).find((s) => s.h === state.time)?.free) { $("#err2").textContent = "השעה הזאת כבר לא פנויה, בחרו שעה אחרת"; state.time = null; renderSlots(); return false; }
    }
    if (n === 3) {
      const bad = Object.keys(fields).filter((id) => !validateField(id));
      if (bad.length) {
        const first = $("#" + bad[0]);
        first.focus({ preventScroll: true });
        first.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        bad.forEach((id) => shake($("#" + id).closest(".field")));
        return false;
      }
    }
    if (n === 4) {
      if (!$("#fAgree").checked) { $("#err4").textContent = "צריך לאשר את מדיניות הביטול"; shake($(".check")); return false; }
    }
    return true;
  }

  function goTo(n, force = false) {
    if (n > state.maxStep && !force) return;
    const back = n < state.step;
    state.step = n;
    state.maxStep = Math.max(state.maxStep, n);
    const key = n === 2 && state.mode === "group" ? "g" : String(n);
    panels.forEach((p) => {
      const on = p.dataset.panel === key;
      p.classList.toggle("is-active", on);
      p.classList.toggle("is-back", on && back);
    });
    stepsEl.forEach((s) => {
      const k = Number(s.dataset.step);
      s.classList.toggle("is-current", k === n);
      s.classList.toggle("is-done", k < n || (k <= state.maxStep && k !== n && k < state.maxStep));
      s.classList.toggle("is-locked", k > state.maxStep);
      const btn = $("button", s);
      if (k === n) btn.setAttribute("aria-current", "step"); else btn.removeAttribute("aria-current");
    });
    $("#progressBar").style.width = `${((Math.min(n, 4) - 1) / 3) * 100}%`;
    $("#backBtn").classList.toggle("is-hidden", n === 1);
    $(".btn__label", $("#nextBtn")).textContent = n === 4 ? "לשריין את האימון" : n === 1 && state.mode === "group" ? "המשך לתיאום הקבוצה" : "המשך";
    $("#wizard").classList.toggle("is-done", n === 5);
    if (n === 2 && state.mode === "group") renderGroup();
    else if (n === 2) { if (state.date) { const d = fromISO(state.date); state.view = new Date(d.getFullYear(), d.getMonth(), 1); } renderCalendar(); renderSlots(); }
    if (n === 4) renderTicket();
    // לפני הזמנה קבוצתית מושכים את רשימת המשתתפים העדכנית, כדי שהמחיר והשמות יהיו נכונים
    if ((n === 3 || n === 4) && state.mode === "group" && state.group) refreshGroup().then(() => { updateSummary(); if (state.step === 4) renderTicket(); });
    const legend = $(".panel.is-active .panel__title");
    if (legend && document.activeElement && document.activeElement.closest("#wizard")) {
      const top = $("#wizard").getBoundingClientRect().top;
      if (top < 0) $("#wizard").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-goto]"); if (!b) return;
    const n = Number(b.dataset.goto);
    if (n > state.step && state.step < 5 && !validateStep(state.step)) return;
    if (n <= state.maxStep) goTo(n);
    else { toast("קודם משלימים את השלב הנוכחי"); validateStep(state.step); }
  });

  $("#backBtn").addEventListener("click", () => { if (state.step > 1) goTo(state.step - 1); });

  $("#bookForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (state.step === 5) return;
    if (!validateStep(state.step)) return;
    if (state.step < 4) { goTo(state.step + 1, true); return; }
    confirmBooking();
  });

  function confirmBooking() {
    const btn = $("#nextBtn");
    btn.classList.add("is-loading"); btn.disabled = true;
    $("#err4").textContent = "";
    const w = workoutById(state.workoutId);
    const d = readDetails();
    const p = priceFor(state.workoutId, state.firstTime, d.city, groupPeople());
    const b = {
      id: "AF-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      workoutId: w.id, workout: w.name, date: state.date, time: state.time, minutes: w.minutes,
      price: p.total, firstTime: state.firstTime, details: d, createdAt: Date.now(),
      tentative: isTentative(state.date, state.time),
      group: state.mode === "group" && state.group ? { id: state.group.id, members: groupNames() } : null
    };
    if (b.tentative) b.status = "tentative";
    const reset = () => { btn.classList.remove("is-loading"); btn.disabled = false; };
    const finish = () => {
      if (b.group && !online) gCall("groupBooked", { id: b.group.id, booked: { date: b.date, time: b.time, bookingId: b.id, by: b.details.name, tentative: b.tentative, at: Date.now() } });
      if (b.group) setTimeout(refreshGroup, 600);
      bookings.push(b);
      store.set("bookings", bookings);
      saveProfile();
      reset();
      showDone(b);
      refreshBookingsUI(true);
      updateNextSlot();
    };
    if (!online) { setTimeout(finish, reduceMotion ? 100 : 900); return; }
    api({ action: "book", booking: b })
      .then((r) => { b.id = r.id; serverTaken?.add(`${b.date}@${b.time}`); finish(); })
      .catch((err) => {
        reset();
        if (err.code === "taken") {
          serverTaken?.add(`${b.date}@${b.time}`);
          state.time = null;
          goTo(2, true);
          $("#err2").textContent = "מישהו שריין את השעה הזאת ממש עכשיו. בחרו שעה אחרת";
          updateSummary("time");
        } else {
          $("#err4").textContent = err.code === "invalid"
            ? "חלק מהפרטים לא תקינים. חזרו לשלב הפרטים ובדקו אותם"
            : "ההזמנה לא נשלחה. בדקו את החיבור לאינטרנט ונסו שוב";
          shake($("#nextBtn"));
        }
      });
  }

  function waText(b) {
    const w = workoutById(b.workoutId), d = b.details;
    return [
      `היי ${CONFIG.trainer}, שריינתי אימון באתר 💪`,
      `מספר הזמנה: ${b.id}`,
      `אימון: ${w.name} (${w.minutes} דק׳)`,
      `מתי: ${fmtLong.format(fromISO(b.date))}, ${hhmm(b.time)}`,
      `כתובת: ${[d.street, d.floor, d.city].filter(Boolean).join(", ")}${d.code ? ` (קוד ${d.code})` : ""}`,
      d.space ? `איפה מתאמנים: ${d.space}` : "",
      d.goals.length ? `מטרות: ${d.goals.join(", ")}` : "",
      d.notes ? `הערות: ${d.notes}` : "",
      b.firstTime ? "זה האימון הראשון שלי" : "",
      b.tentative ? "זה שריון טנטטיבי (שני/שלישי בערב). תעדכן אותי אם מסתדר?" : "",
      b.group && b.group.members && b.group.members.length > 1 ? `אימון קבוצתי: ${b.group.members.join(", ")}` : "",
      `מחיר: ${ils(b.price)}`,
      `שם: ${d.name}`,
      d.phone ? `טלפון: ${d.phone.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3")}` : ""
    ].filter(Boolean).join("\n");
  }
  const waUrl = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

  function gcalUrl(b) {
    const w = workoutById(b.workoutId), d = fromISO(b.date);
    const stamp = (h, m) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`;
    const endMin = b.time * 60 + b.minutes;
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `${w.name} עם ${CONFIG.trainer}`,
      dates: `${stamp(b.time, 0)}/${stamp(Math.floor(endMin / 60), endMin % 60)}`,
      ctz: "Asia/Jerusalem",
      location: [b.details.street, b.details.city].filter(Boolean).join(", "),
      details: `מספר הזמנה ${b.id}. להכין: שטח 2×2 מ׳, מים ומגבת.`
    });
    return `https://calendar.google.com/calendar/render?${params}`;
  }

  function showDone(b) {
    const w = workoutById(b.workoutId);
    $("#doneText").textContent = `${w.name} ${friendlyDay(b.date) === fmtLong.format(fromISO(b.date)) ? "ב" + friendlyDay(b.date) : friendlyDay(b.date)} בשעה ${hhmm(b.time)}, ב${b.details.street}, ${b.details.city}. ${CONFIG.trainer} מביא את הציוד, את/ה מביא/ה מים ומגבת.`;
    $("#doneRef").textContent = b.id;
    $(".done__title").textContent = b.tentative ? "השריון הטנטטיבי נשמר" : online ? "האימון נקבע!" : "השריון נשמר!";
    $(".done__step").innerHTML = b.tentative
      ? `<b>זה שריון טנטטיבי.</b> ${esc(CONFIG.trainer)} יעדכן עד יום לפני האימון אם השעה מסתדרת לו. אם לא, תקבעו יחד שעה אחרת.`
      : online
      ? `<b>${esc(CONFIG.trainer)} כבר רואה את ההזמנה ביומן שלו</b> ויאשר אותה בהודעה. רוצים להוסיף משהו? אפשר לכתוב לו גם בוואטסאפ.`
      : `<b>עוד צעד אחד:</b> שולחים ל${esc(CONFIG.trainer)} את הפרטים בוואטסאפ, והוא מאשר את המועד בהודעה חוזרת.`;
    $("#waLink").classList.toggle("btn--primary", !online);
    $("#waLink").classList.toggle("btn--ghost", online);
    $("#waLink span").textContent = online ? `הודעה ל${CONFIG.trainer} בוואטסאפ` : `שליחה ל${CONFIG.trainer} בוואטסאפ`;
    $("#waLink").href = waUrl(waText(b));
    $("#gcalLink").href = gcalUrl(b);
    goTo(5, true);
    $("#wizard").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    setTimeout(confetti, 350);
  }

  $("#againBtn").addEventListener("click", () => {
    state.date = null; state.time = null; state.maxStep = 1;
    if (state.mode === "group") { setMode("solo"); state.group = null; state.gAvail = emptyAvail(); try { history.replaceState(null, "", location.pathname + "#book"); } catch { /* sandboxed */ } }
    $("#fAgree").checked = false; $("#err4").textContent = "";
    $("#slots").innerHTML = `<div class="slots__empty">${svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>', 44)}<p>בוחרים יום בלוח ורואים את השעות הפנויות</p></div>`;
    goTo(1, true); updateSummary();
  });

  /* ---------- group workouts: friends mark when they're free, the site finds a slot that fits everyone and Afik ---------- */
  const emptyAvail = () => ({ 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });
  const gKeys = { all: () => store.get("gkeys", {}), get: (id) => store.get("gkeys", {})[id] || null, set(id, v) { const k = store.get("gkeys", {}); if (v) k[id] = v; else delete k[id]; store.set("gkeys", k); } };
  let gSaveTimer = null, gSaving = false;

  function groupMe() {
    const k = state.group && gKeys.get(state.group.id);
    return k ? state.group.members.find((m) => m.id === k.memberId) || null : null;
  }
  function groupPeople() { return state.mode === "group" && state.group ? Math.max(1, state.group.members.length) : 1; }
  function groupNames() { return state.mode === "group" && state.group ? state.group.members.map((m) => m.name) : []; }
  const availCount = (a) => Object.values(a || {}).reduce((s, l) => s + l.length, 0);
  const groupLink = (id) => `${location.origin}${location.pathname}#g-${id}`;

  // שרת כשיש, אחרת "שרת" מקומי בדפדפן (לתצוגה מקדימה בלבד, בלי שיתוף בין מכשירים)
  async function gCall(action, p = {}) {
    if (online) {
      if (action === "groupGet") {
        const res = await fetch(`${API}?action=group&id=${encodeURIComponent(p.id)}`);
        const data = await res.json();
        if (!data.ok) { const err = new Error(data.error); err.code = data.error; throw err; }
        return data;
      }
      return api({ action, ...p });
    }
    const db = store.get("groupsdb", {});
    const fail = (code) => { const err = new Error(code); err.code = code; throw err; };
    const pub = (g) => JSON.parse(JSON.stringify({ ...g, members: g.members.map(({ key, ...m }) => m) }));
    const mk = () => ({ id: Math.random().toString(36).slice(2, 10), key: Math.random().toString(36).slice(2), name: String(p.name || "").trim().slice(0, 30), avail: p.avail, updatedAt: Date.now() });
    let out;
    if (action === "groupGet") { if (!db[p.id]) fail("not_found"); out = { ok: true, group: pub(db[p.id]) }; }
    if (action === "groupCreate") {
      const m = mk();
      const free = []; for (let n = 1; n <= 999; n++) if (!db[String(n)]) free.push(String(n));
      const id = free[Math.floor(Math.random() * free.length)];
      db[id] = { id, createdAt: Date.now(), workoutId: p.workoutId, creator: m.name, members: [m], booked: null };
      out = { ok: true, group: pub(db[id]), memberId: m.id, key: m.key };
    }
    if (action === "groupJoin") {
      const g = db[p.id]; if (!g) fail("not_found"); if (g.members.length >= 8) fail("group_full");
      const m = mk(); g.members.push(m); out = { ok: true, group: pub(g), memberId: m.id, key: m.key };
    }
    if (action === "groupUpdate" || action === "groupLeave") {
      const g = db[p.id]; if (!g) fail("not_found");
      const m = g.members.find((x) => x.id === p.memberId && x.key === p.key); if (!m) fail("forbidden");
      if (action === "groupLeave") g.members = g.members.filter((x) => x !== m);
      else { m.avail = p.avail; if (p.name) m.name = p.name; m.updatedAt = Date.now(); }
      if (!g.members.length) delete db[p.id];
      out = { ok: true, group: db[p.id] ? pub(g) : null };
    }
    if (action === "groupBooked") { const g = db[p.id]; if (g) g.booked = p.booked; out = { ok: true }; }
    store.set("groupsdb", db);
    return out;
  }

  function matchMembers() {
    const me = groupMe();
    const list = (state.group?.members || []).map((m) => (me && m.id === me.id ? { ...m, avail: state.gAvail } : m));
    if (!me && availCount(state.gAvail)) list.push({ id: "_me", name: ($("#gName")?.value || "את/ה").trim() || "את/ה", avail: state.gAvail });
    if (!state.group) return [{ id: "_me", name: "את/ה", avail: state.gAvail }];
    return list;
  }

  function computeMatches() {
    const members = matchMembers();
    const full = [], partial = [];
    if (!members.length) return { full, partial, members };
    const days = Math.min(CONFIG.daysAhead, 21);
    const t0 = today0();
    for (let i = 0; i < days; i++) {
      const date = new Date(t0.getFullYear(), t0.getMonth(), t0.getDate() + i);
      const iso = toISO(date), w = date.getDay();
      slotsFor(iso).forEach((s) => {
        if (!s.free) return;
        const missing = members.filter((m) => !(m.avail?.[w] || []).includes(s.h));
        if (!missing.length) full.push({ iso, h: s.h, tent: s.tentative });
        else if (missing.length === 1 && members.length >= 2) partial.push({ iso, h: s.h, tent: s.tentative, missing: missing.map((m) => m.name) });
      });
    }
    return { full, partial, members };
  }

  function availGridHtml(avail) {
    const days = [0, 1, 2, 3, 4, 5, 6].filter((d) => (CONFIG.hours[d] || []).length);
    if (!days.length) return `<p class="slots__closed">כרגע אין שעות פעילות ביומן.</p>`;
    return `
      <div class="agrid__presets">
        <span>סימון מהיר:</span>
        <button type="button" data-preset="morning">כל הבקרים</button>
        <button type="button" data-preset="evening">כל הערבים</button>
        <button type="button" data-preset="all">הכול</button>
        <button type="button" data-preset="none">ניקוי</button>
      </div>
      <div class="agrid" id="agrid">
        ${days.map((d) => `
          <div class="agrid__row">
            <span class="agrid__day">${DAY_LONG[d]}</span>
            <div class="agrid__chips">
              ${(CONFIG.hours[d] || []).map((h) => {
                const tent = (CONFIG.tentative?.[d] || []).includes(h);
                return `<button type="button" class="achip${tent ? " achip--tent" : ""}" data-day="${d}" data-h="${h}" aria-pressed="${(avail[d] || []).includes(h)}" aria-label="${DAY_LONG[d]} ${hhmm(h)}${tent ? ", טנטטיבי" : ""}">${pad(h)}</button>`;
              }).join("")}
            </div>
          </div>`).join("")}
      </div>
      <p class="agrid__hint">לוחצים על כל שעה שנוחה לך בשבוע רגיל.${(CONFIG.tentative && Object.values(CONFIG.tentative).some((l) => l.length)) ? " שעות מקווקוות הן טנטטיביות." : ""} <span id="gSaveState" aria-live="polite"></span></p>`;
  }

  function matchesHtml() {
    const { full, partial, members } = computeMatches();
    const realCount = state.group ? state.group.members.length : 0;
    const pick = state.date && state.time != null ? `${state.date}@${state.time}` : "";
    const byDay = (list) => {
      const map = new Map();
      list.forEach((m) => { if (!map.has(m.iso)) map.set(m.iso, []); map.get(m.iso).push(m); });
      return [...map].slice(0, 10);
    };
    if (!availCount(state.gAvail) && !(state.group && state.group.members.some((m) => availCount(m.avail)))) {
      return `<div class="gmatch gmatch--empty"><p>מסמנים למעלה מתי נוח לך, ופה יופיעו השעות שבהן ${esc(CONFIG.trainer)} פנוי.</p></div>`;
    }
    let i = 0;
    const chips = (list, selectable) => byDay(list).map(([iso, ms]) => `
      <div class="gmatch__day">
        <p>${esc(friendlyDay(iso))}${friendlyDay(iso) !== fmtLong.format(fromISO(iso)) ? ` <small>${esc(fmtLong.format(fromISO(iso)))}</small>` : ""}</p>
        <div class="gmatch__chips">
          ${ms.map((m) => selectable
            ? `<button type="button" class="slot gslot${m.tent ? " slot--tent" : ""}" role="radio" style="--i:${i++}" data-iso="${m.iso}" data-h="${m.h}" aria-checked="${pick === `${m.iso}@${m.h}`}" aria-label="${esc(friendlyDay(iso))} ${hhmm(m.h)}${m.tent ? ", טנטטיבי" : ""}">${hhmm(m.h)}</button>`
            : `<span class="gpartial" style="--i:${i++}" title="חסר: ${esc(m.missing.join(", "))}">${hhmm(m.h)} <small>בלי ${esc(m.missing.join(", "))}</small></span>`).join("")}
        </div>
      </div>`).join("");
    const who = realCount <= 1 ? "לך" : `לכל ${members.length} המשתתפים`;
    return `
      <div class="gmatch">
        <p class="gmatch__title">${full.length ? `${full.length} שעות מתאימות ${who} ול${esc(CONFIG.trainer)}` : `אין עדיין שעה שמתאימה ${who} ול${esc(CONFIG.trainer)}`}</p>
        ${realCount <= 1 && state.group ? `<p class="gmatch__note">כרגע רק את/ה בקבוצה. כשהחברים יסמנו את השעות שלהם, הרשימה תתעדכן לבד.</p>` : ""}
        ${full.length ? chips(full, true) : partial.length ? `<p class="gmatch__note">שעות שמתאימות לכולם חוץ מאחד:</p>${chips(partial, false)}` : `<p class="gmatch__note">נסו לסמן עוד שעות, או לבקש מהחברים להוסיף.</p>`}
        <div class="tentnote" id="gTentNote" ${state.date && isTentative(state.date, state.time) ? "" : "hidden"}>${tentNoteHtml()}</div>
      </div>`;
  }

  function membersHtml() {
    const me = groupMe();
    return `<ul class="gmembers">${state.group.members.map((m, i) => `
      <li style="--i:${i}"><span class="gav" aria-hidden="true">${esc(m.name.trim().charAt(0))}</span><span><b>${esc(m.name)}${me && m.id === me.id ? " (את/ה)" : ""}</b><small>${availCount(me && m.id === me.id ? state.gAvail : m.avail) ? `סימן/ה ${availCount(me && m.id === me.id ? state.gAvail : m.avail)} שעות` : "עוד לא סימן/ה"}</small></span></li>`).join("")}</ul>`;
  }

  function renderGroup() {
    const box = $("#groupBox");
    const g = state.group, me = groupMe();
    const w = workoutById(g ? g.workoutId : state.workoutId);
    $("#errG").textContent = "";
    if (!g && state.gView === "choose") {
      $("#groupTitle").textContent = "אימון בקבוצה";
      box.innerHTML = `
        <div class="gchoose">
          <button type="button" class="gchoice" data-gview="join">
            ${svg('<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l-5-5 5-5M5 12h11"/>', 30)}
            <b>הצטרפות לקבוצה קיימת</b>
            <small>חבר פתח קבוצה ונתן לך קוד? מקלידים אותו כאן</small>
          </button>
          <button type="button" class="gchoice" data-gview="create">
            ${svg('<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>', 30)}
            <b>פתיחת קבוצה חדשה</b>
            <small>מקבלים קוד קצר ואומרים אותו לחברים</small>
          </button>
        </div>`;
      return;
    }
    if (!g && state.gView === "join") {
      $("#groupTitle").textContent = "הצטרפות לקבוצה";
      box.innerHTML = `
        <div class="gcode">
          <label for="gCodeIn">קוד הקבוצה</label>
          <p class="gcode__hint">המספר שקיבלת ממי שפתח את הקבוצה</p>
          <div class="gcode__row">
            <input id="gCodeIn" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" autocomplete="off" placeholder="000" dir="ltr">
            <button type="button" class="btn btn--primary" id="gFind" data-ripple><span class="btn__label">כניסה לקבוצה</span><span class="spinner" aria-hidden="true"></span></button>
          </div>
        </div>
        <button type="button" class="linkbtn linkbtn--muted gback" data-gview="choose">→ חזרה</button>`;
      setTimeout(() => $("#gCodeIn")?.focus(), 60);
      return;
    }
    if (!g) {
      $("#groupTitle").textContent = "פותחים קבוצה";
      box.innerHTML = `
        <ol class="gsteps">
          <li><b>מסמנים</b> מתי נוח לך בשבוע</li>
          <li><b>מקבלים קוד</b> ואומרים אותו לחברים, וכל אחד מסמן את השעות שלו</li>
          <li><b>בוחרים</b> שעה שמתאימה לכולם ול${esc(CONFIG.trainer)}</li>
        </ol>
        <div class="field gname"><label for="gName">השם שלך</label><input id="gName" type="text" maxlength="30" autocomplete="given-name" value="${esc(store.get("profile", {}).name || "")}" placeholder="למשל: נועה"></div>
        <p class="gsub">מתי נוח לך?</p>
        ${availGridHtml(state.gAvail)}
        <button type="button" class="btn btn--primary gcreate" id="gCreate" data-ripple><span class="btn__label">פתיחת קבוצה וקבלת קוד</span><span class="spinner" aria-hidden="true"></span></button>
        <div id="gMatches">${matchesHtml()}</div>
        <button type="button" class="linkbtn linkbtn--muted gback" data-gview="choose">→ חזרה</button>`;
      return;
    }
    $("#groupTitle").textContent = `הקבוצה של ${g.creator}`;
    const shareText = `בואו נתאמן יחד עם ${CONFIG.trainer}${w ? ` (${w.name})` : ""} 💪\nנכנסים לאתר, בוחרים "אימון בקבוצה" ← "הצטרפות לקבוצה קיימת" ומקלידים את הקוד: ${g.id}\nאו ישר מהקישור: ${groupLink(g.id)}`;
    const booked = g.booked ? `
      <div class="gbooked">
        ${svg('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>', 28)}
        <div><b>${g.booked.tentative ? "שוריין טנטטיבית" : "האימון של הקבוצה נקבע"}: ${esc(friendlyDay(g.booked.date))} ב־${hhmm(g.booked.time)}</b>
        <small>${friendlyDay(g.booked.date) !== fmtLong.format(fromISO(g.booked.date)) ? `${esc(fmtLong.format(fromISO(g.booked.date)))} · ` : ""}נקבע על ידי ${esc(g.booked.by || "")}${g.booked.tentative ? ` · ${esc(CONFIG.trainer)} יאשר עד יום לפני` : ""}</small></div>
      </div>` : "";
    box.innerHTML = `
      ${booked}
      <div class="gshare">
        <div class="gshare__code">
          <small>קוד הקבוצה</small>
          <b dir="ltr" id="gCodeText">${esc(g.id)}</b>
        </div>
        <div class="gshare__info">
          <p class="gshare__title">${w ? esc(w.name) : "אימון קבוצתי"} · ${g.members.length} ${g.members.length === 1 ? "משתתף" : "משתתפים"}</p>
          <p class="gshare__hint">אומרים לחברים את הקוד. הם בוחרים "אימון בקבוצה", ואז "הצטרפות לקבוצה קיימת"</p>
          <p class="gshare__link" dir="ltr" id="gLinkText">${esc(groupLink(g.id))}</p>
        </div>
        <div class="gshare__actions">
          <button type="button" class="btn btn--small btn--ghost" id="gCopy">העתקת הקוד</button>
          <a class="btn btn--small btn--wa" href="https://wa.me/?text=${encodeURIComponent(shareText)}" target="_blank" rel="noopener">${svg('<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z"/>', 16)}<span>שליחה לחברים</span></a>
        </div>
      </div>
      ${membersHtml()}
      ${me ? `
        <details class="gmine" ${availCount(state.gAvail) ? "" : "open"}>
          <summary>השעות שלך <small>${availCount(state.gAvail)} שעות מסומנות</small></summary>
          ${availGridHtml(state.gAvail)}
        </details>` : `
        <div class="gjoin">
          <p class="gsub">מצטרפים לקבוצה</p>
          <div class="field gname"><label for="gName">השם שלך</label><input id="gName" type="text" maxlength="30" autocomplete="given-name" value="${esc(store.get("profile", {}).name || "")}" placeholder="למשל: יוסי"></div>
          ${availGridHtml(state.gAvail)}
          <button type="button" class="btn btn--primary gcreate" id="gJoin" data-ripple><span class="btn__label">הצטרפות לקבוצה</span><span class="spinner" aria-hidden="true"></span></button>
        </div>`}
      ${g.booked ? "" : `<div id="gMatches">${matchesHtml()}</div>`}
      <div class="gfoot">
        ${me ? `<button type="button" class="linkbtn" id="gLeave">יציאה מהקבוצה</button>` : ""}
        <button type="button" class="linkbtn linkbtn--muted" id="gNew">מעבר לקבוצה אחרת</button>
      </div>`;
  }

  function refreshMatches() {
    const el = $("#gMatches"); if (el) el.innerHTML = matchesHtml();
    const sum = $(".gmine summary small"); if (sum) sum.textContent = `${availCount(state.gAvail)} שעות מסומנות`;
    if (state.group && $(".gmembers")) $(".gmembers").outerHTML = membersHtml();
  }

  function setAvailChip(chip, on) {
    const d = Number(chip.dataset.day), h = Number(chip.dataset.h);
    const set = new Set(state.gAvail[d] || []);
    on ? set.add(h) : set.delete(h);
    state.gAvail[d] = [...set].sort((a, b) => a - b);
    chip.setAttribute("aria-pressed", String(on));
  }

  function availChanged() {
    // בחירה שכבר לא מתאימה לכולם מתבטלת
    if (state.date && state.time != null && !computeMatches().full.some((m) => m.iso === state.date && m.h === state.time)) { state.date = null; state.time = null; updateSummary("time"); }
    refreshMatches();
    if (groupMe()) {
      clearTimeout(gSaveTimer);
      const st = $("#gSaveState"); if (st) st.textContent = "שומר…";
      gSaveTimer = setTimeout(saveMyAvail, 700);
    }
  }

  async function saveMyAvail() {
    const k = gKeys.get(state.group.id); if (!k) return;
    gSaving = true;
    try {
      const r = await gCall("groupUpdate", { id: state.group.id, memberId: k.memberId, key: k.key, avail: state.gAvail });
      if (r.group) state.group = r.group;
      const st = $("#gSaveState"); if (st) st.textContent = "נשמר ✓";
    } catch {
      const st = $("#gSaveState"); if (st) st.textContent = "לא נשמר, בדקו את החיבור";
    } finally { gSaving = false; }
  }

  // מצב ציור: גרירה עם עכבר מסמנת כמה שעות ברצף; במגע, לחיצה על כל שעה
  let paint = null;
  $("#groupBox").addEventListener("pointerdown", (e) => {
    const chip = e.target.closest(".achip"); if (!chip) return;
    const on = chip.getAttribute("aria-pressed") !== "true";
    setAvailChip(chip, on);
    if (e.pointerType === "mouse") { paint = { on }; e.preventDefault(); }
    availChanged();
  });
  document.addEventListener("pointerover", (e) => {
    if (!paint) return;
    const chip = e.target.closest && e.target.closest("#groupBox .achip");
    if (chip && (chip.getAttribute("aria-pressed") === "true") !== paint.on) { setAvailChip(chip, paint.on); availChanged(); }
  });
  document.addEventListener("pointerup", () => { paint = null; });
  $("#groupBox").addEventListener("keydown", (e) => {
    const chip = e.target.closest(".achip");
    if (chip && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setAvailChip(chip, chip.getAttribute("aria-pressed") !== "true"); availChanged(); }
  });

  $("#groupBox").addEventListener("input", (e) => { if (e.target.id === "gName" && !groupMe()) refreshMatches(); });

  $("#groupBox").addEventListener("click", async (e) => {
    const gv = e.target.closest("[data-gview]");
    if (gv) { state.gView = gv.dataset.gview; renderGroup(); return; }
    if (e.target.closest("#gFind")) { findGroupByCode(); return; }
    const preset = e.target.closest("[data-preset]");
    if (preset) {
      const p = preset.dataset.preset;
      for (let d = 0; d < 7; d++) {
        const hs = CONFIG.hours[d] || [];
        state.gAvail[d] = p === "none" ? [] : p === "all" ? [...hs] : hs.filter((h) => (p === "morning" ? h < 12 : h >= 16));
      }
      $$("#groupBox .achip").forEach((c) => c.setAttribute("aria-pressed", String((state.gAvail[c.dataset.day] || []).includes(Number(c.dataset.h)))));
      availChanged();
      return;
    }
    const gs = e.target.closest(".gslot");
    if (gs) {
      state.date = gs.dataset.iso; state.time = Number(gs.dataset.h);
      $$("#groupBox .gslot").forEach((x) => x.setAttribute("aria-checked", String(x === gs)));
      const tn = $("#gTentNote"); if (tn) tn.hidden = !gs.classList.contains("slot--tent");
      $("#errG").textContent = "";
      updateSummary("time");
      return;
    }
    const id = e.target.closest("button, a")?.id;
    if (id === "gCreate" || id === "gJoin") {
      const name = $("#gName").value.trim();
      if (name.length < 2) { $("#errG").textContent = "כתבו את השם שלכם, כדי שהחברים ידעו מי סימן"; shake($("#gName").closest(".field")); $("#gName").focus(); return; }
      if (!availCount(state.gAvail)) { $("#errG").textContent = "סמנו לפחות שעה אחת שנוחה לכם"; shake($("#agrid")); return; }
      const btn = $("#" + id); btn.classList.add("is-loading"); btn.disabled = true;
      try {
        const r = id === "gCreate"
          ? await gCall("groupCreate", { name, workoutId: state.workoutId, avail: state.gAvail })
          : await gCall("groupJoin", { id: state.group.id, name, avail: state.gAvail });
        gKeys.set(r.group.id, { memberId: r.memberId, key: r.key });
        state.group = r.group;
        if (id === "gCreate") { try { history.replaceState(null, "", `#g-${r.group.id}`); } catch { /* sandboxed */ } }
        renderGroup(); updateSummary();
        toast(id === "gCreate" ? `הקבוצה נפתחה! הקוד שלה: ${r.group.id}` : `הצטרפת לקבוצה של ${r.group.creator}`, "ok");
      } catch (err) {
        btn.classList.remove("is-loading"); btn.disabled = false;
        $("#errG").textContent = err.code === "group_full" ? "הקבוצה מלאה (עד 8 משתתפים)" : err.code === "not_found" ? "הקבוצה לא נמצאה. אולי פג התוקף שלה" : "לא הצלחנו לשמור. בדקו את החיבור ונסו שוב";
      }
      return;
    }
    if (id === "gCopy") {
      const code = state.group.id, btn = $("#gCopy");
      try { await navigator.clipboard.writeText(code); btn.textContent = "הועתק ✓"; toast(`הקוד ${code} הועתק`, "ok"); }
      catch { const r = document.createRange(); r.selectNodeContents($("#gCodeText")); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); btn.textContent = "מסומן, אפשר להעתיק"; }
      setTimeout(() => { if (btn.isConnected) btn.textContent = "העתקת הקוד"; }, 2200);
      return;
    }
    if (id === "gLeave") {
      const btn = $("#gLeave");
      if (!btn.dataset.armed) { btn.dataset.armed = "1"; btn.textContent = "לחיצה נוספת מוציאה אותך מהקבוצה"; setTimeout(() => { if (btn.isConnected) { delete btn.dataset.armed; btn.textContent = "יציאה מהקבוצה"; } }, 3500); return; }
      const k = gKeys.get(state.group.id);
      try { await gCall("groupLeave", { id: state.group.id, memberId: k.memberId, key: k.key }); } catch { /* already gone */ }
      gKeys.set(state.group.id, null);
      resetGroup(); toast("יצאת מהקבוצה");
      return;
    }
    if (id === "gNew") { resetGroup(); return; }
  });

  $("#groupBox").addEventListener("keydown", (e) => {
    if (e.target.id === "gCodeIn" && e.key === "Enter") { e.preventDefault(); findGroupByCode(); }
  });
  $("#groupBox").addEventListener("input", (e) => {
    if (e.target.id === "gCodeIn") { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 3); $("#errG").textContent = ""; }
  });

  async function findGroupByCode() {
    const input = $("#gCodeIn"), code = String(Number(input.value || 0));
    if (!/^\d{1,3}$/.test(input.value) || code === "0") { $("#errG").textContent = "מקלידים את הקוד, מספר של 1 עד 3 ספרות"; shake(input); input.focus(); return; }
    const btn = $("#gFind"); btn.classList.add("is-loading"); btn.disabled = true;
    try {
      const r = await gCall("groupGet", { id: code });
      state.group = r.group;
      if (workoutById(r.group.workoutId)) { state.workoutId = r.group.workoutId; renderPick(); }
      const me = groupMe();
      state.gAvail = me ? JSON.parse(JSON.stringify(me.avail)) : emptyAvail();
      try { history.replaceState(null, "", `#g-${r.group.id}`); } catch { /* sandboxed */ }
      renderGroup(); updateSummary();
      toast(me ? `חזרת לקבוצה של ${r.group.creator}` : `מצאנו את הקבוצה של ${r.group.creator}`, "ok");
    } catch (err) {
      btn.classList.remove("is-loading"); btn.disabled = false;
      $("#errG").textContent = err.code === "not_found" ? "לא מצאנו קבוצה עם הקוד הזה. בדקו את המספר מול מי שפתח אותה" : "אין חיבור כרגע. נסו שוב";
      shake(input);
    }
  }

  function resetGroup() {
    state.gView = "choose";
    state.group = null; state.gAvail = emptyAvail(); state.date = null; state.time = null;
    try { if (location.hash.startsWith("#g-")) history.replaceState(null, "", location.pathname + "#book"); } catch { /* sandboxed */ }
    renderGroup(); updateSummary();
  }

  async function refreshGroup() {
    if (!state.group || gSaving || gSaveTimer && $("#gSaveState")?.textContent === "שומר…") return;
    try {
      const r = await gCall("groupGet", { id: state.group.id });
      const before = JSON.stringify(state.group);
      state.group = r.group;
      if (JSON.stringify(r.group) !== before && state.step === 2 && state.mode === "group") {
        const openMine = $(".gmine")?.open;
        renderGroup();
        if (openMine && $(".gmine")) $(".gmine").open = true;
      }
    } catch { /* keep last known */ }
  }

  async function openGroupLink(id) {
    setMode("group");
    $("#book").scrollIntoView({ behavior: "auto" });
    $("#groupBox").innerHTML = `<div class="empty"><span class="spinner spinner--big" aria-hidden="true"></span><p>טוען את הקבוצה…</p></div>`;
    state.maxStep = Math.max(state.maxStep, 2);
    goTo(2, true);
    try {
      const r = await gCall("groupGet", { id });
      state.group = r.group;
      if (workoutById(r.group.workoutId)) { state.workoutId = r.group.workoutId; renderPick(); }
      else if (!state.workoutId) { state.workoutId = CONFIG.workouts[0].id; renderPick(); }
      const me = groupMe();
      state.gAvail = me ? JSON.parse(JSON.stringify(me.avail)) : emptyAvail();
    } catch {
      state.group = null;
      toast("הקבוצה לא נמצאה. אולי פג התוקף שלה. אפשר לפתוח קבוצה חדשה");
      if (!state.workoutId) state.workoutId = CONFIG.workouts[0].id;
    }
    renderGroup(); updateSummary();
  }

  function setMode(mode) {
    if (state.mode === mode) return;
    state.mode = mode;
    if (mode === "group" && !state.group) state.gView = "choose";
    $$("#modePick .mode").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.mode === mode)));
    state.date = null; state.time = null;
    state.maxStep = Math.min(state.maxStep, 2);
    if (state.step === 1) $(".btn__label", $("#nextBtn")).textContent = mode === "group" ? "המשך לתיאום הקבוצה" : "המשך";
    updateSummary();
  }

  $("#modePick").addEventListener("click", (e) => {
    const b = e.target.closest(".mode"); if (!b) return;
    setMode(b.dataset.mode);
  });

  setInterval(() => { if (state.mode === "group" && state.step === 2 && !document.hidden) refreshGroup(); }, 15e3);

  /* ---------- hero: next free slot ---------- */
  function updateNextSlot() {
    const n = nextFree();
    const el = $("#nextSlot");
    if (!n) { el.textContent = "היומן מלא כרגע"; $("#grabNext").hidden = true; return; }
    el.innerHTML = `${esc(friendlyDay(n.iso))} <small dir="ltr">${hhmm(n.h)}</small>`;
    $("#grabNext").onclick = () => {
      if (!state.workoutId) state.workoutId = CONFIG.workouts[0].id;
      renderPick();
      state.date = n.iso; state.time = n.h;
      const d = fromISO(n.iso); state.view = new Date(d.getFullYear(), d.getMonth(), 1);
      state.maxStep = Math.max(state.maxStep, 2);
      goTo(2, true); updateSummary("time");
      $("#book").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      toast(`שמרנו לך את ${friendlyDay(n.iso)} ב־${hhmm(n.h)}`, "ok");
    };
  }

  /* ---------- my bookings drawer ---------- */
  const drawer = $("#drawer");
  let lastFocus = null;

  function bookingStart(b) { const d = fromISO(b.date); d.setHours(b.time); return d; }

  function relLabel(b) {
    const ms = bookingStart(b) - Date.now();
    if (ms < 0) return "עבר";
    const hours = ms / 3600e3;
    if (hours < 24) return rtf.format(Math.round(hours), "hour");
    const t0 = today0(); const days = Math.round((fromISO(b.date) - t0) / 864e5);
    return rtf.format(days, "day");
  }

  function renderDrawer() {
    const list = $("#drawerList");
    const sorted = bookings.filter((b) => b.status !== "cancelled").sort((a, b) => bookingStart(a) - bookingStart(b));
    const upcoming = sorted.filter((b) => bookingStart(b) > Date.now());
    const past = sorted.filter((b) => bookingStart(b) <= Date.now()).reverse().slice(0, 5);
    if (!sorted.length) {
      list.innerHTML = `<div class="empty">${svg('<path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>', 56)}<p>עוד אין אימונים במכשיר הזה.</p><a class="btn btn--primary btn--small" href="#book" data-close>לקביעת אימון ראשון</a></div>`;
      return;
    }
    list.innerHTML = [...upcoming, ...past].map((b, i) => {
      const w = workoutById(b.workoutId);
      const isPast = bookingStart(b) <= Date.now();
      const late = !isPast && (bookingStart(b) - Date.now()) < CONFIG.cancelHours * 3600e3;
      return `
        <article class="bk ${isPast ? "is-past" : ""}" style="--i:${i}" data-id="${b.id}">
          <div class="bk__top"><p class="bk__when">${esc(friendlyDay(b.date))}, ${hhmm(b.time)}</p><span class="bk__count ${isPast ? "is-past" : ""}">${b.status === "tentative" && !isPast ? "ממתין לאישור · " : ""}${relLabel(b)}</span></div>
          <p class="bk__meta">${esc(w ? w.name : "")} · ${b.minutes} דק׳ · ${ils(b.price)}<br>${esc(b.details.street)}, ${esc(b.details.city)} · <span dir="ltr">${b.id}</span></p>
          ${isPast ? "" : `
          <div class="bk__actions">
            <a class="btn btn--ghost" href="${waUrl(waText(b))}" target="_blank" rel="noopener">שליחה ל${CONFIG.trainer}</a>
            <a class="btn btn--ghost" href="${gcalUrl(b)}" target="_blank" rel="noopener">ליומן</a>
            <button type="button" class="btn btn--ghost" data-cancel="${b.id}">ביטול</button>
          </div>
          ${late ? `<p class="bk__meta">פחות מ־${CONFIG.cancelHours} שעות לאימון. ביטול עכשיו כרוך בתיאום עם ${CONFIG.trainer}.</p>` : ""}`}
        </article>`;
    }).join("");
  }

  function openDrawer() {
    lastFocus = document.activeElement;
    renderDrawer();
    drawer.hidden = false; drawer.classList.remove("is-closing");
    document.body.style.overflow = "hidden";
    setTimeout(() => $(".drawer__head .iconbtn").focus(), 50);
  }
  function closeDrawer() {
    if (drawer.hidden) return;
    drawer.classList.add("is-closing");
    const done = () => { drawer.hidden = true; drawer.classList.remove("is-closing"); document.body.style.overflow = ""; lastFocus?.focus?.(); };
    if (reduceMotion) done(); else setTimeout(done, 280);
  }

  $("#myBtn").addEventListener("click", openDrawer);
  drawer.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeDrawer();
    const c = e.target.closest("[data-cancel]");
    if (!c) return;
    if (c.dataset.armed) {
      const card = c.closest(".bk");
      const target = bookings.find((b) => b.id === c.dataset.cancel);
      const removeLocal = () => {
        card.classList.add("is-removing");
        setTimeout(() => {
          bookings = bookings.filter((b) => b.id !== c.dataset.cancel);
          store.set("bookings", bookings);
          if (target) serverTaken?.delete(`${target.date}@${target.time}`);
          refreshBookingsUI(); renderDrawer(); refreshAvailability();
          toast(online ? `האימון בוטל ו${CONFIG.trainer} רואה את זה ביומן` : `האימון בוטל. כדאי לעדכן את ${CONFIG.trainer} בוואטסאפ`);
        }, reduceMotion ? 0 : 300);
      };
      if (!online || !target) { removeLocal(); return; }
      c.disabled = true; c.textContent = "מבטל…";
      api({ action: "cancel", id: target.id, phone: target.details.phone })
        .then(removeLocal)
        .catch((err) => {
          c.disabled = false; delete c.dataset.armed; c.textContent = "ביטול";
          c.classList.add("btn--ghost"); c.classList.remove("btn--danger");
          if (err.code === "not_found") { removeLocal(); return; }
          toast("הביטול לא נשלח. בדקו את החיבור ונסו שוב");
        });
    } else {
      c.dataset.armed = "1";
      c.textContent = "לחיצה נוספת מבטלת";
      c.classList.remove("btn--ghost"); c.classList.add("btn--danger");
      setTimeout(() => { if (c.isConnected) { delete c.dataset.armed; c.textContent = "ביטול"; c.classList.add("btn--ghost"); c.classList.remove("btn--danger"); } }, 3500);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (drawer.hidden) return;
    if (e.key === "Escape") closeDrawer();
    if (e.key === "Tab") {
      const f = $$("a[href], button:not([disabled])", drawer).filter((x) => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  function refreshBookingsUI(bump) {
    const n = bookings.filter((b) => b.status !== "cancelled" && bookingStart(b) > Date.now()).length;
    const badge = $("#myCount");
    badge.hidden = !n; badge.textContent = n;
    if (bump) { badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump"); }
  }

  /* ---------- prep checklist ---------- */
  const todo = store.get("todo", {});
  const todoBoxes = $$("#todo input");
  function syncTodo() {
    const done = todoBoxes.filter((b) => b.checked).length;
    $("#todoBar").style.width = `${(done / todoBoxes.length) * 100}%`;
    $("#todoText").textContent = done === todoBoxes.length ? "הבית מוכן לאימון!" : `${done} מתוך ${todoBoxes.length} מוכנים`;
  }
  todoBoxes.forEach((b) => {
    b.checked = !!todo[b.id];
    b.addEventListener("change", () => {
      todo[b.id] = b.checked; store.set("todo", todo); syncTodo();
      if (todoBoxes.every((x) => x.checked)) toast(`הבית מוכן. ${CONFIG.trainer} יכול להגיע`, "ok");
    });
  });
  syncTodo();

  /* ---------- footer phone ---------- */
  $("#copyPhone").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText(CONFIG.phoneDisplay);
      btn.textContent = "הועתק ✓"; toast("המספר הועתק", "ok");
    } catch {
      const r = document.createRange(); r.selectNodeContents($("#phoneText"));
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent = "מסומן, אפשר להעתיק";
    }
    setTimeout(() => { btn.textContent = "העתקה"; }, 2000);
  });

  /* ---------- confetti ---------- */
  function confetti() {
    if (reduceMotion) return;
    const c = $("#confetti"), ctx = c.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr; ctx.scale(dpr, dpr);
    const css = getComputedStyle(root);
    const colors = ["--accent", "--pine", "--warn", "--ink"].map((v) => css.getPropertyValue(v).trim());
    const origin = $(".done__mark").getBoundingClientRect();
    const ox = origin.left + origin.width / 2, oy = origin.top + origin.height / 2;
    const parts = Array.from({ length: 150 }, () => {
      const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9;
      return { x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, w: 5 + Math.random() * 6, h: 8 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - .5) * .35, color: colors[(Math.random() * colors.length) | 0], life: 0 };
    });
    const t0 = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      const el = t - t0;
      parts.forEach((p) => {
        p.vy += .28; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - el / 2600);
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
        ctx.restore();
      });
      if (el < 2600) requestAnimationFrame(frame); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }

  /* ---------- site settings: loaded from the server, edited in the admin page ---------- */
  const DAY_SHORT = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
  const DAY_LONG = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const DEFAULTS = pickEditable(CONFIG);
  let appliedName = CONFIG.trainer;

  function dayRange(d) {
    const hs = CONFIG.hours[d] || [];
    if (!hs.length) return "";
    const longest = Math.max(60, ...CONFIG.workouts.map((w) => w.minutes));
    return `${hhmm(hs[0])}–${endTime(hs[hs.length - 1], longest)}`;
  }

  // "א׳–ה׳ 06:00–22:00 · ו׳ 07:00–13:00"
  function hoursSummary() {
    const groups = [];
    for (let d = 0; d < 7; d++) {
      const r = dayRange(d);
      if (!r) continue;
      const last = groups[groups.length - 1];
      if (last && last.range === r && last.to === d - 1) last.to = d;
      else groups.push({ from: d, to: d, range: r });
    }
    return groups.map((g) => `${g.from === g.to ? DAY_SHORT[g.from] : `${DAY_SHORT[g.from]}–${DAY_SHORT[g.to]}`} ${g.range}`).join(" · ");
  }

  function openDaysLabel() {
    const open = [0, 1, 2, 3, 4, 5, 6].filter((d) => (CONFIG.hours[d] || []).length);
    if (!open.length) return "—";
    const runs = [];
    open.forEach((d) => { const r = runs[runs.length - 1]; if (r && d === r[1] + 1) r[1] = d; else runs.push([d, d]); });
    return runs.map(([f, t]) => (f === t ? DAY_SHORT[f] : `${DAY_SHORT[f]}–${DAY_SHORT[t]}`)).join(", ");
  }

  function slotsFootnote(iso) {
    const hs = CONFIG.hours[fromISO(iso).getDay()] || [];
    if (!hs.length) return "";
    for (let i = 1; i < hs.length; i++) {
      if (hs[i] - hs[i - 1] >= 3) return `בין ${hhmm(hs[i - 1] + 1)} ל־${hhmm(hs[i])} ${CONFIG.trainer} בדרכים בין מתאמנים.`;
    }
    return `האימון האחרון ביום הזה מתחיל ב־${hhmm(hs[hs.length - 1])}.`;
  }

  function renameTrainer(from, to) {
    if (!from || from === to) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => n.parentElement && !n.parentElement.closest("script, style, textarea") && n.nodeValue.includes(from) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => { n.nodeValue = n.nodeValue.split(from).join(to); });
  }

  function applyConfig(cfg) {
    if (cfg) EDITABLE.forEach((k) => { if (cfg[k] != null) CONFIG[k] = JSON.parse(JSON.stringify(cfg[k])); });
    CONFIG.whatsapp = normPhone(CONFIG.phoneDisplay).replace(/^0/, "972");
    renameTrainer(appliedName, CONFIG.trainer);
    appliedName = CONFIG.trainer;
    const set = (key, text) => $$(`[data-cfg="${key}"]`).forEach((el) => { el.textContent = text; });
    set("eyebrow", CONFIG.area ? `מאמן כושר אישי · ${CONFIG.area}` : "מאמן כושר אישי");
    set("days", openDaysLabel());
    set("daysSub", hoursSummary() || "בתיאום מראש");
    const pct = Math.round(CONFIG.firstTimeDiscount * 100);
    set("discount", pct ? `אימון היכרות ב־${pct}% הנחה, כולל בדיקת תנועה ובניית תוכנית` : "כולל בדיקת תנועה ובניית תוכנית");
    $("#firstTime").closest(".switch").hidden = !pct;
    if (!pct && state.firstTime) { state.firstTime = false; $("#firstTime").checked = false; }
    set("cancelPolicy", CONFIG.cancelHours ? `ביטול או שינוי עד ${CONFIG.cancelHours} שעות לפני האימון ללא חיוב` : "ביטול או שינוי ללא חיוב");
    set("faqCancel", `${CONFIG.cancelHours ? `ביטול או שינוי עד ${CONFIG.cancelHours} שעות לפני האימון לא עולה כלום.` : "ביטול או שינוי לא עולה כלום."} אפשר לבטל ישירות מ"האימונים שלי" ולעדכן את ${CONFIG.trainer} בוואטסאפ.`);
    set("footerHours", `אימון אישי עד הבית. ${hoursSummary()}`);
    $("#phoneText").textContent = CONFIG.phoneDisplay;
    if (state.workoutId && !workoutById(state.workoutId)) state.workoutId = null;
    renderShowcase(); renderPick(); renderCityOptions();
    updateSummary();
    refreshAvailability();
    if (state.mode === "group" && state.step === 2 && $("#groupBox").children.length) renderGroup();
  }

  async function loadConfig() {
    if (!online) { applyConfig(store.get("config", null)); return; }
    try {
      const res = await fetch(`${API}?action=config`);
      const data = await res.json();
      if (data.config) applyConfig(data.config);
      configLoaded = true;
    } catch { /* keep defaults */ }
  }

  /* ---------- admin: #main ---------- */
  // במצב מחובר הסיסמה נבדקת בשרת (api/booking.js). במצב מקומי הבדיקה היא בדפדפן בלבד ואפשר לעקוף אותה
  function sha256(str) {
    const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    const bytes = new TextEncoder().encode(str);
    const len = bytes.length;
    const total = ((len + 9 + 63) >> 6) << 6;
    const buf = new Uint8Array(total); buf.set(bytes); buf[len] = 0x80;
    const view = new DataView(buf.buffer);
    view.setUint32(total - 8, Math.floor(len / 0x20000000)); view.setUint32(total - 4, (len * 8) >>> 0);
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const W = new Uint32Array(64);
    const rotr = (x, n) => (x >>> n) | (x << (32 - n));
    for (let off = 0; off < total; off += 64) {
      for (let i = 0; i < 16; i++) W[i] = view.getUint32(off + i * 4);
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
        const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
        W[i] = W[i - 16] + s0 + W[i - 7] + s1;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
        const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      [a, b, c, d, e, f, g, h].forEach((x, j) => { H[j] = (H[j] + x) | 0; });
    }
    return H.map((x) => (x >>> 0).toString(16).padStart(8, "0")).join("");
  }

  const session = {
    get() { try { return sessionStorage.getItem("afik:admin") || ""; } catch { return memToken; } },
    set(v) { memToken = v || ""; try { v ? sessionStorage.setItem("afik:admin", v) : sessionStorage.removeItem("afik:admin"); } catch { /* blocked */ } }
  };
  let memToken = "";
  let token = session.get();
  let wasAdmin = false;
  let failCount = 0, lockUntil = 0, lockTimer = null;
  let agFilter = "upcoming";
  let adminBookings = online ? [] : bookings;
  let lastSync = 0, syncTimer = null, loading = false;

  function route() {
    const isAdmin = location.hash === "#main";
    root.classList.toggle("is-admin", isAdmin);
    $("#admin").hidden = !isAdmin;
    if (isAdmin) {
      if (drawer && !drawer.hidden) closeDrawer();
      document.title = `${CONFIG.trainer} · ניהול`;
      token ? showDash() : showGate();
      scrollTo(0, 0);
    } else if (wasAdmin) {
      document.title = `קביעת אימונים אצל ${CONFIG.trainer}`;
      root.classList.remove("has-savebar");
      clearInterval(syncTimer);
      refreshBookingsUI();
      online ? loadTaken() : refreshAvailability();
    }
    wasAdmin = isAdmin;
    const gm = !isAdmin && location.hash.match(/^#g-([A-Za-z0-9]{1,12})$/);
    if (gm && state.group?.id !== gm[1]) openGroupLink(gm[1]);
  }

  function showGate(msg = "") {
    clearInterval(syncTimer);
    $("#dash").hidden = true;
    const g = $("#gate");
    g.hidden = false; g.classList.remove("is-open");
    $("#gatePass").value = ""; $("#gateErr").textContent = msg;
    $("#gatePass").closest(".field").classList.remove("is-invalid");
    setTimeout(() => $("#gatePass").focus(), 80);
  }

  function showDash() {
    $("#gate").hidden = true;
    $("#dash").hidden = false;
    $("#modeBanner").hidden = online;
    if (!online) adminBookings = bookings;
    renderDash();
    loadAdmin();
    clearInterval(syncTimer);
    if (online) syncTimer = setInterval(() => { if (!document.hidden) loadAdmin(true); }, 60e3);
  }

  async function loadAdmin(silent = false) {
    if (!online) { adminBookings = bookings; lastSync = Date.now(); renderDash(); return; }
    if (loading) return;
    loading = true;
    $("#refreshBtn").classList.add("is-loading");
    if (!silent && !lastSync) $("#agenda").innerHTML = `<div class="empty"><span class="spinner spinner--big" aria-hidden="true"></span><p>טוען את היומן…</p></div>`;
    try {
      const r = await api({ action: "list", token });
      adminBookings = r.bookings || [];
      lastSync = Date.now();
      renderDash();
    } catch (err) {
      if (err.code === "unauthorized") { token = ""; session.set(""); showGate("הכניסה פגה. צריך להקליד סיסמה שוב"); }
      else if (!silent) toast("לא הצלחנו לטעון את היומן. בדקו את החיבור");
    } finally {
      loading = false;
      $("#refreshBtn").classList.remove("is-loading");
      syncNote();
    }
  }

  function syncNote() {
    if (!online) return;
    const mins = Math.round((Date.now() - lastSync) / 60e3);
    $("#syncNote").textContent = lastSync ? `מסונכרן עם השרת · עודכן ${mins < 1 ? "עכשיו" : rtf.format(-mins, "minute")}` : "";
  }

  $("#refreshBtn").addEventListener("click", () => loadAdmin());

  $("#gateEye").addEventListener("click", (e) => {
    const btn = e.currentTarget, inp = $("#gatePass");
    const show = inp.type === "password";
    inp.type = show ? "text" : "password";
    btn.setAttribute("aria-pressed", String(show));
    btn.setAttribute("aria-label", show ? "הסתרת הסיסמה" : "הצגת הסיסמה");
    inp.focus();
  });

  function lockTick() {
    const left = Math.ceil((lockUntil - Date.now()) / 1000);
    if (left <= 0) {
      clearInterval(lockTimer); lockTimer = null;
      $("#gateGo").disabled = false; $("#gateErr").textContent = "אפשר לנסות שוב";
      return;
    }
    $("#gateErr").textContent = `יותר מדי ניסיונות. אפשר לנסות שוב בעוד ${left} שניות`;
  }

  function startLock(seconds) {
    failCount = 0; lockUntil = Date.now() + seconds * 1000; $("#gateGo").disabled = true;
    lockTick(); clearInterval(lockTimer); lockTimer = setInterval(lockTick, 1000);
  }

  function gateSuccess(t) {
    token = t; session.set(t); failCount = 0;
    $("#gatePass").closest(".field").classList.remove("is-invalid");
    $("#gateErr").textContent = "";
    $("#gate").classList.add("is-open");
    setTimeout(showDash, reduceMotion ? 0 : 950);
  }

  function gateFail(msg) {
    const inp = $("#gatePass");
    failCount++;
    inp.closest(".field").classList.add("is-invalid"); shake($(".gate__card"));
    inp.select();
    if (failCount >= 5) startLock(30);
    else $("#gateErr").textContent = msg || `הסיסמה לא נכונה${failCount >= 3 ? ` · נשארו ${5 - failCount} ניסיונות` : ""}`;
  }

  $("#gateForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (Date.now() < lockUntil) return;
    const inp = $("#gatePass"), field = inp.closest(".field"), btn = $("#gateGo");
    if (!inp.value) { $("#gateErr").textContent = "צריך להקליד סיסמה"; shake(field); return; }
    btn.classList.add("is-loading"); btn.disabled = true;
    const done = () => { btn.classList.remove("is-loading"); btn.disabled = false; };
    if (!online) {
      setTimeout(() => {
        done();
        sha256(inp.value) === CONFIG.adminPasswordHash ? gateSuccess("local") : gateFail();
      }, reduceMotion ? 50 : 450);
      return;
    }
    try {
      const r = await api({ action: "login", password: inp.value });
      done(); gateSuccess(r.token);
    } catch (err) {
      done();
      if (err.code === "wrong_password") gateFail();
      else if (err.code === "locked") startLock(600);
      else if (err.code === "no_password_set") $("#gateErr").textContent = "עוד לא הוגדרה סיסמה בשרת (משתנה הסביבה ADMIN_PASSWORD ב-Vercel)";
      else if (err.code === "server_error") $("#gateErr").textContent = `שגיאה בשרת: ${err.detail || "לא ידוע"}. לבדיקה: ${location.origin}/api/booking?action=health`;
      else if (err.code && err.code.startsWith("http_")) $("#gateErr").textContent = `השרת לא נמצא (${err.code.slice(5)}). לבדיקה: ${location.origin}/api/booking?action=health`;
      else $("#gateErr").textContent = "אין חיבור לשרת. בדקו את האינטרנט ונסו שוב";
    }
  });

  $("#gatePass").addEventListener("input", () => {
    if (Date.now() < lockUntil) return;
    $("#gatePass").closest(".field").classList.remove("is-invalid");
    $("#gateErr").textContent = "";
  });

  $("#logoutBtn").addEventListener("click", () => {
    if (online && token) api({ action: "logout", token }).catch(() => {});
    token = ""; session.set("");
    showGate(); toast("יצאת מאזור הניהול");
  });

  /* dashboard */
  const isActive = (b) => b.status !== "cancelled";
  const bookingEnd = (b) => new Date(bookingStart(b).getTime() + (b.minutes || 60) * 60e3);
  const fmtFull = new Intl.DateTimeFormat("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const fmtPhone = (p) => (p || "").replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3");
  const intlPhone = (p) => (p || "").replace(/\D/g, "").replace(/^0/, "972");
  const addrText = (d) => [d.street, d.city].filter(Boolean).join(", ");
  const wazeUrl = (d) => `https://waze.com/ul?q=${encodeURIComponent(addrText(d))}&navigate=yes`;
  const mapsUrl = (d) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addrText(d))}`;
  const pinIcon = '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>';
  const dayPhrase = (iso) => friendlyDay(iso) === fmtLong.format(fromISO(iso)) ? "ב" + friendlyDay(iso) : friendlyDay(iso);

  function greeting() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "בוקר טוב";
    if (h >= 12 && h < 17) return "צהריים טובים";
    if (h >= 17 && h < 22) return "ערב טוב";
    return "לילה טוב";
  }

  function renderDash() {
    $("#dashDate").textContent = fmtFull.format(new Date());
    $("#dashHi").textContent = `${greeting()}, ${CONFIG.trainer}`;
    renderNextUp(); renderKpis(); renderAgenda(); renderImportPreview(); syncNote();
  }

  function navButtons(d) {
    if (!d.street && !d.city) return "";
    return `<a class="btn btn--small btn--nav" href="${wazeUrl(d)}" target="_blank" rel="noopener">${svg('<path d="M5 17a8 8 0 1 1 14 0H5Z"/><circle cx="9" cy="10" r=".8"/><circle cx="15" cy="10" r=".8"/><circle cx="8" cy="19" r="1.6"/><circle cx="16" cy="19" r="1.6"/>', 16)}<span>ניווט ב־Waze</span></a>
            <a class="btn btn--small btn--ghost" href="${mapsUrl(d)}" target="_blank" rel="noopener">מפות גוגל</a>`;
  }

  function renderNextUp() {
    const box = $("#nextUp");
    const now = Date.now();
    const next = adminBookings.filter((b) => isActive(b) && bookingEnd(b) > now).sort((a, b) => bookingStart(a) - bookingStart(b))[0];
    if (!next) { box.hidden = true; return; }
    box.hidden = false;
    const d = next.details, w = workoutById(next.workoutId);
    const live = bookingStart(next) <= now;
    box.innerHTML = `
      <div class="nextup__when">
        <p class="nextup__label">${live ? "עכשיו באימון" : next.status === "tentative" ? "הבא · טנטטיבי" : "האימון הבא"}</p>
        <p class="nextup__time" dir="ltr">${hhmm(next.time)}</p>
        <p class="nextup__rel">${esc(friendlyDay(next.date))}${live || relLabel(next) === friendlyDay(next.date) ? "" : ` · ${esc(relLabel(next))}`}</p>
      </div>
      <div class="nextup__body">
        <p class="nextup__name">${esc(d.name)} <span>· ${esc(w ? w.name : next.workout || "אימון")}</span></p>
        <p class="nextup__addr">${svg(pinIcon, 20)}<span>${esc([d.street, d.floor, d.city].filter(Boolean).join(", ") || "לא צוינה כתובת")}</span></p>
        <p class="nextup__extra">${[d.code ? `קוד לבניין <b dir="ltr">${esc(d.code)}</b>` : "", d.space ? `מתאמנים ב${esc(d.space)}` : "", d.phone ? `<span dir="ltr">${esc(fmtPhone(d.phone))}</span>` : ""].filter(Boolean).join(" · ")}</p>
        ${d.notes ? `<p class="agitem__notes">${esc(d.notes)}</p>` : ""}
        <div class="nextup__actions">${navButtons(d)}</div>
      </div>`;
  }

  function renderKpis() {
    const t0 = today0(), now = Date.now();
    const todayIso = toISO(t0);
    const weekEnd = new Date(t0); weekEnd.setDate(t0.getDate() + 7);
    const active = adminBookings.filter(isActive);
    const today = active.filter((b) => b.date === todayIso);
    const week = active.filter((b) => { const d = fromISO(b.date); return d >= t0 && d < weekEnd; });
    const revenue = week.reduce((s, b) => s + (Number(b.price) || 0), 0);
    const people = new Set(active.filter((b) => bookingEnd(b) > now).map((b) => b.details.phone || b.details.name)).size;
    const fresh = active.filter((b) => now - (b.createdAt || 0) < 24 * 3600e3).length;
    const tentCount = active.filter((b) => b.status === "tentative" && bookingEnd(b) > now).length;
    const items = [
      ["היום", today.length, today.length ? `הראשון ב־${hhmm(Math.min(...today.map((b) => b.time)))}` : "יום פנוי"],
      ["7 הימים הקרובים", week.length, week.length === 1 ? "אימון אחד" : "אימונים"],
      ["הכנסה צפויה ב־7 ימים", ils(revenue), people ? (people === 1 ? "מתאמן אחד ביומן" : `${people} מתאמנים ביומן`) : ""],
      tentCount ? ["ממתינים לאישור שלך", tentCount, "שריונים טנטטיביים"] : ["הזמנות חדשות", fresh, "ב־24 השעות האחרונות"]
    ];
    $("#kpis").innerHTML = items.map(([label, val, sub], i) => `<li style="--i:${i}"><span>${label}</span><b>${esc(String(val))}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</li>`).join("");
  }

  function agendaList() {
    const now = Date.now(), todayIso = toISO(today0());
    const byStart = (a, b) => bookingStart(a) - bookingStart(b);
    if (agFilter === "today") return adminBookings.filter((b) => b.date === todayIso).sort(byStart);
    if (agFilter === "past") return adminBookings.filter((b) => isActive(b) && bookingEnd(b) <= now).sort(byStart).reverse();
    if (agFilter === "cancelled") return adminBookings.filter((b) => !isActive(b)).sort(byStart).reverse();
    return adminBookings.filter((b) => isActive(b) && bookingEnd(b) > now).sort(byStart);
  }

  function renderAgenda() {
    const list = agendaList();
    const box = $("#agenda");
    if (!list.length) {
      const msg = { upcoming: "אין אימונים קרובים ביומן.", today: "אין אימונים היום.", past: "עוד אין אימונים שהסתיימו.", cancelled: "אין אימונים שבוטלו." }[agFilter];
      const hint = agFilter !== "upcoming" ? "" : online
        ? "<p>כשמתאמן קובע אימון באתר, הוא מופיע כאן עם הכתובת והפרטים.</p>"
        : "<p>מדביקים הודעת הזמנה מוואטסאפ בטופס שבצד, או לוחצים על \"הודעה לדוגמה\" כדי לראות איך זה עובד.</p>";
      box.innerHTML = `<div class="empty">${svg('<path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>', 56)}<p>${msg}</p>${hint}</div>`;
      return;
    }
    const groups = new Map();
    list.forEach((b) => { if (!groups.has(b.date)) groups.set(b.date, []); groups.get(b.date).push(b); });
    let i = 0;
    box.innerHTML = [...groups].map(([date, items]) => {
      const sum = items.filter(isActive).reduce((s, b) => s + (Number(b.price) || 0), 0);
      const label = friendlyDay(date);
      return `
        <div class="agday">
          <div class="agday__head"><h3>${esc(label)}${label !== fmtLong.format(fromISO(date)) ? ` · ${esc(fmtLong.format(fromISO(date)))}` : ""}</h3><span>${items.length} ${items.length === 1 ? "אימון" : "אימונים"}${sum ? ` · ${ils(sum)}` : ""}</span></div>
          ${items.map((b) => agItem(b, i++)).join("")}
        </div>`;
    }).join("");
  }

  function agItem(b, i) {
    const w = workoutById(b.workoutId), d = b.details, now = Date.now();
    const past = bookingEnd(b) <= now;
    const isNew = !past && isActive(b) && now - (b.createdAt || 0) < 24 * 3600e3;
    const pills = [
      b.status === "cancelled" ? `<span class="pill pill--cancel">בוטל</span>` : "",
      b.status === "done" ? `<span class="pill pill--done">בוצע</span>` : "",
      past && isActive(b) && b.status !== "done" ? `<span class="pill">ממתין לסימון</span>` : "",
      isNew ? `<span class="pill pill--new">חדש</span>` : "",
      b.firstTime ? `<span class="pill pill--first">היכרות</span>` : "",
      b.status === "tentative" ? `<span class="pill pill--tent">טנטטיבי · צריך לאשר</span>` : "",
      b.group && b.group.members && b.group.members.length > 1 ? `<span class="pill pill--group">קבוצה · ${b.group.members.length}</span>` : ""
    ].join("");
    const fullAddr = [d.street, d.floor, d.city].filter(Boolean).join(", ");
    const remind = `היי ${d.name.split(" ")[0]}, כאן ${CONFIG.trainer} 👋\nמאשר את האימון ${dayPhrase(b.date)} ב־${hhmm(b.time)}${d.street ? ` ב${d.street}` : ""}.\nלהכין שטח של 2×2 מ׳, מים ומגבת. נתראה!`;
    const actions = b.status === "cancelled"
      ? `<button type="button" class="btn btn--ghost" data-ag="restore" data-id="${esc(b.id)}">שחזור</button>`
      : `${!past ? navButtons(d) : ""}
         ${d.phone ? `<a class="btn btn--ghost" href="https://wa.me/${intlPhone(d.phone)}?text=${encodeURIComponent(remind)}" target="_blank" rel="noopener">אישור בוואטסאפ</a>` : ""}
         ${b.status === "tentative" && !past ? `<button type="button" class="btn btn--primary" data-ag="confirm" data-id="${esc(b.id)}">מאשר, מסתדר לי</button>
           ${d.phone ? `<a class="btn btn--ghost" href="https://wa.me/${intlPhone(d.phone)}?text=${encodeURIComponent(`היי ${d.name.split(" ")[0]}, כאן ${CONFIG.trainer}. לגבי השריון הטנטטיבי ${dayPhrase(b.date)} ב־${hhmm(b.time)}: לצערי זה לא מסתדר לי. אפשר לקבוע שעה אחרת באתר, או לכתוב לי מתי נוח לך 🙏`)}" target="_blank" rel="noopener">לא מסתדר · הצעת שעה אחרת</a>` : ""}` : ""}
         ${b.status === "tentative" ? "" : b.status !== "done" ? `<button type="button" class="btn btn--ghost" data-ag="done" data-id="${esc(b.id)}">סימון כבוצע</button>` : `<button type="button" class="btn btn--ghost" data-ag="undone" data-id="${esc(b.id)}">ביטול סימון</button>`}
         ${!past ? `<button type="button" class="btn btn--ghost" data-ag="cancel" data-id="${esc(b.id)}">ביטול אימון</button>` : ""}`;
    return `
      <article class="agitem ${b.status === "cancelled" ? "is-cancelled" : ""} ${b.status === "done" ? "is-done" : ""}" style="--i:${i}" data-id="${esc(b.id)}">
        <div class="agitem__time"><b dir="ltr">${hhmm(b.time)}</b><span dir="ltr">עד ${endTime(b.time, b.minutes || 60)}</span></div>
        <div class="agitem__top"><span class="agitem__name">${esc(d.name)}</span>${pills}</div>
        <p class="agitem__addr">${svg(pinIcon, 18)}<span>${esc(fullAddr || "לא צוינה כתובת")}${d.code ? ` · קוד <b dir="ltr">${esc(d.code)}</b>` : ""}</span></p>
        <p class="agitem__meta"><b>${esc(w ? w.name : b.workout || "אימון")}</b> · ${b.minutes || 60} דק׳ · ${ils(Number(b.price) || 0)}${d.phone ? ` · <span dir="ltr">${esc(fmtPhone(d.phone))}</span>` : ""}${d.space ? ` · ב${esc(d.space)}` : ""}${d.goals && d.goals.length ? ` · ${d.goals.map(esc).join(", ")}` : ""}</p>
        ${b.group && b.group.members && b.group.members.length > 1 ? `<p class="agitem__meta">משתתפים: <b>${b.group.members.map(esc).join(", ")}</b></p>` : ""}
        ${d.notes ? `<p class="agitem__notes">${esc(d.notes)}</p>` : ""}
        <div class="agitem__actions">${actions}</div>
      </article>`;
  }

  async function setStatus(b, status) {
    const prev = b.status || "";
    if (status) b.status = status; else delete b.status;
    if (!online) { store.set("bookings", bookings); return; }
    try { await api({ action: "update", token, id: b.id, status }); }
    catch (err) {
      if (prev) b.status = prev; else delete b.status;
      if (err.code === "unauthorized") { token = ""; session.set(""); showGate("הכניסה פגה. צריך להקליד סיסמה שוב"); }
      throw err;
    }
  }

  $("#agFilter").addEventListener("click", (e) => {
    const c = e.target.closest(".chip"); if (!c) return;
    agFilter = c.dataset.f;
    $$(".chip", $("#agFilter")).forEach((x) => x.setAttribute("aria-checked", String(x === c)));
    renderAgenda();
  });

  $("#agenda").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-ag]"); if (!btn) return;
    const b = adminBookings.find((x) => x.id === btn.dataset.id); if (!b) return;
    const act = btn.dataset.ag;
    if (act === "cancel" && !btn.dataset.armed) {
      btn.dataset.armed = "1"; btn.textContent = "לחיצה נוספת מבטלת";
      btn.classList.remove("btn--ghost"); btn.classList.add("btn--danger");
      setTimeout(() => { if (btn.isConnected) { delete btn.dataset.armed; btn.textContent = "ביטול אימון"; btn.classList.add("btn--ghost"); btn.classList.remove("btn--danger"); } }, 3500);
      return;
    }
    if (act === "restore" && adminBookings.some((x) => x !== b && isActive(x) && x.date === b.date && x.time === b.time)) {
      toast("יש כבר אימון אחר באותה שעה"); return;
    }
    const status = { cancel: "cancelled", restore: "", done: "done", undone: "", confirm: "" }[act];
    btn.disabled = true;
    try { await setStatus(b, status); }
    catch { btn.disabled = false; toast("השינוי לא נשמר. בדקו את החיבור ונסו שוב"); return; }
    const msg = { cancel: `האימון של ${b.details.name.split(" ")[0]} בוטל`, restore: "האימון חזר ליומן", done: "סומן כבוצע", confirm: "האימון אושר. כדאי לשלוח אישור למתאמן בוואטסאפ" }[act];
    if (msg) toast(msg, act === "cancel" ? "" : "ok");
    const card = btn.closest(".agitem");
    const leaves = (act === "cancel" && agFilter !== "today") || (act === "restore" && agFilter === "cancelled");
    const rerender = () => { renderNextUp(); renderKpis(); renderAgenda(); };
    if (leaves && !reduceMotion && card) { card.classList.add("is-removing"); setTimeout(rerender, 280); } else rerender();
  });

  /* import from WhatsApp text */
  const MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

  function parseMessage(text) {
    const get = (label) => { const m = text.match(new RegExp(`^\\s*${label}\\s*:\\s*(.+)$`, "m")); return m ? m[1].trim() : ""; };
    const errors = [];
    const wLine = get("אימון");
    const w = CONFIG.workouts.find((x) => wLine.startsWith(x.name)) || CONFIG.workouts.find((x) => wLine.includes(x.name));
    const minutes = Number((wLine.match(/(\d+)\s*דק/) || [])[1]) || (w ? w.minutes : 60);
    const when = get("מתי");
    const dm = when.match(/(\d{1,2})\s+ב([֐-׿]+)/);
    const tm = when.match(/(\d{1,2}):(\d{2})/);
    let date = null;
    if (dm && MONTHS.includes(dm[2])) {
      const t0 = today0();
      let d = new Date(t0.getFullYear(), MONTHS.indexOf(dm[2]), Number(dm[1]));
      if (d < new Date(t0.getFullYear(), t0.getMonth(), t0.getDate() - 30)) d = new Date(t0.getFullYear() + 1, d.getMonth(), d.getDate());
      date = toISO(d);
    }
    const time = tm ? Number(tm[1]) : null;
    let addr = get("כתובת");
    const code = (addr.match(/\(קוד\s*([^)]+)\)/) || [])[1] || "";
    addr = addr.replace(/\(קוד[^)]*\)/, "").trim();
    const parts = addr.split(",").map((x) => x.trim()).filter(Boolean);
    const cityIdx = parts.findIndex((p) => cityByName(p) || IL_CITIES.includes(p));
    const city = cityIdx >= 0 ? parts[cityIdx] : (parts.length > 1 ? parts[parts.length - 1] : "");
    const rest = parts.filter((p, i) => p !== city || (cityIdx >= 0 ? i !== cityIdx : i !== parts.length - 1));
    const name = get("שם");
    const phone = normPhone(get("טלפון"));
    const price = Number(get("מחיר").replace(/[^\d]/g, "")) || null;
    if (!date) errors.push("לא מצאתי תאריך (שורת \"מתי\")");
    if (time == null) errors.push("לא מצאתי שעה");
    if (!name) errors.push("לא מצאתי שם (שורת \"שם\")");
    const id = get("מספר הזמנה") || "AF-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    if (adminBookings.some((b) => b.id === id)) errors.push(`הזמנה ${id} כבר נמצאת ביומן`);
    const fallbackPrice = w ? priceFor(w.id, text.includes("האימון הראשון שלי"), city).total : 0;
    return {
      errors,
      booking: {
        id, workoutId: w ? w.id : CONFIG.workouts[0].id, date, time, minutes,
        price: price || fallbackPrice, firstTime: text.includes("האימון הראשון שלי"),
        details: {
          name, phone, city, street: rest[0] || "", floor: rest.slice(1).join(", "), code,
          notes: get("הערות"), space: get("איפה מתאמנים") || null,
          goals: get("מטרות") ? get("מטרות").split(",").map((x) => x.trim()).filter(Boolean) : []
        },
        createdAt: Date.now(), source: "whatsapp"
      }
    };
  }

  let parsed = null;
  function renderImportPreview() {
    const text = $("#importText").value.trim();
    const box = $("#importPreview");
    parsed = null;
    $("#importBtn").disabled = true;
    box.classList.remove("is-bad");
    if (!text) { box.innerHTML = ""; return; }
    const r = parseMessage(text);
    if (r.errors.length) {
      box.classList.add("is-bad");
      box.innerHTML = r.errors.map((e) => `<span>${esc(e)}</span>`).join("");
      return;
    }
    const b = r.booking, w = workoutById(b.workoutId);
    const clash = adminBookings.find((x) => isActive(x) && x.date === b.date && x.time === b.time);
    box.innerHTML = `
      <b>${esc(b.details.name)} · ${esc(w.name)}</b>
      <span>${esc(fmtLong.format(fromISO(b.date)))}, ${hhmm(b.time)}–${endTime(b.time, b.minutes)}</span>
      <span>${esc([b.details.street, b.details.city].filter(Boolean).join(", "))} · ${ils(b.price)}</span>
      ${clash ? `<span>שימו לב: באותה שעה כבר יש אימון עם ${esc(clash.details.name)}</span>` : ""}`;
    parsed = b;
    $("#importBtn").disabled = false;
  }

  let importTimer = null;
  $("#importText").addEventListener("input", () => { clearTimeout(importTimer); importTimer = setTimeout(renderImportPreview, 200); });
  $("#importText").addEventListener("paste", () => setTimeout(renderImportPreview, 0));

  $("#importBtn").addEventListener("click", async () => {
    if (!parsed) return;
    const b = parsed, btn = $("#importBtn");
    b.workout = workoutById(b.workoutId)?.name || "";
    if (online) {
      btn.disabled = true; btn.classList.add("is-loading");
      try { const r = await api({ action: "book", token, force: true, booking: b }); b.id = r.id; }
      catch { btn.disabled = false; btn.classList.remove("is-loading"); toast("ההוספה לא נשמרה. בדקו את החיבור ונסו שוב"); return; }
      btn.classList.remove("is-loading");
    }
    if (online) adminBookings.push(b);
    else { bookings.push(b); adminBookings = bookings; store.set("bookings", bookings); }
    toast(`${b.details.name.split(" ")[0]} נוסף/ה ליומן`, "ok");
    $("#importText").value = "";
    agFilter = "upcoming";
    $$(".chip", $("#agFilter")).forEach((x) => x.setAttribute("aria-checked", String(x.dataset.f === "upcoming")));
    renderDash();
  });

  $("#importSample").addEventListener("click", () => {
    const n = nextFree();
    if (!n) { toast("אין שעה פנויה לדוגמה"); return; }
    const sample = {
      id: "AF-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      workoutId: "mobility", date: n.iso, time: n.h, minutes: 60, price: 260, firstTime: false,
      details: { name: "דנה כהן (דוגמה)", phone: "0521234567", city: "רמת גן", street: "ביאליק 12", floor: "קומה 3", code: "1234#", notes: "כאב בגב התחתון אחרי ישיבה ארוכה", space: "סלון", goals: ["כאבי גב", "גמישות"] }
    };
    $("#importText").value = waText(sample);
    renderImportPreview();
    $("#importText").focus();
  });

  /* settings editor */
  let draft = null;
  let configLoaded = !online;
  const HOUR_FROM = 5, HOUR_TO = 22;
  const current = () => pickEditable(CONFIG);
  const isDirty = () => !!draft && JSON.stringify(draft) !== JSON.stringify(current());

  $$(".dtab").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));

  async function showTab(tab) {
    $$(".dtab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
    $("#tabAgenda").hidden = tab !== "agenda";
    $("#tabSettings").hidden = tab !== "settings";
    if (tab === "settings" && !draft) {
      if (!configLoaded) {
        $("#settingsForm").innerHTML = `<div class="empty"><span class="spinner spinner--big" aria-hidden="true"></span><p>טוען הגדרות…</p></div>`;
        await loadConfig();
      }
      draft = current();
      renderSettings();
    }
  }

  const fieldHtml = (label, input, opts = {}) =>
    `<div class="field${opts.full ? " field--full" : ""}"><label${opts.id ? ` for="${opts.id}"` : ""}>${label}${opts.hint ? ` <small>${opts.hint}</small>` : ""}</label>${input}</div>`;
  const val = (v) => esc(v == null ? "" : String(v));

  function hoursRows() {
    return [0, 1, 2, 3, 4, 5, 6].map((d) => {
      const hs = draft.hours[d] || [];
      const tent = (draft.tentative && draft.tentative[d]) || [];
      const chips = [];
      for (let h = HOUR_FROM; h <= HOUR_TO; h++) {
        const st = !hs.includes(h) ? "off" : tent.includes(h) ? "tent" : "on";
        chips.push(`<button type="button" class="hchip" data-day="${d}" data-h="${h}" data-state="${st}" aria-pressed="${st !== "off"}" aria-label="יום ${DAY_LONG[d]} ${hhmm(h)}: ${st === "on" ? "פנוי" : st === "tent" ? "טנטטיבי" : "סגור"}">${pad(h)}</button>`);
      }
      return `
        <div class="hours__row">
          <span class="hours__day">${DAY_LONG[d]}<small>${hs.length ? `${hs.length} שעות` : "סגור"}</small></span>
          <div class="hours__chips">${chips.join("")}</div>
          <div class="hours__actions">
            ${d === 0 ? `<button type="button" data-act="copyWeek">העתקה לב׳–ה׳</button>` : `<button type="button" data-act="copyPrev" data-day="${d}">כמו ${DAY_LONG[d - 1]}</button>`}
            ${hs.length ? `<button type="button" data-act="clearDay" data-day="${d}">סגור</button>` : ""}
          </div>
        </div>`;
    }).join("");
  }

  function workoutItem(w, i) {
    const n = (f) => `id="w${i}${f}" data-w="${i}" data-f="${f}"`;
    return `
      <div class="witem" style="--i:${i}">
        <div class="witem__head">
          <div class="iconpick" role="group" aria-label="אייקון">
            ${Object.keys(ICONS).map((k) => `<button type="button" data-w="${i}" data-icon="${k}" aria-pressed="${w.icon === k}" aria-label="אייקון ${k}">${svg(ICONS[k], 20)}</button>`).join("")}
          </div>
          <b data-preview="${i}">${esc(w.name || "אימון חדש")}</b>
          ${draft.workouts.length > 1 ? `<button type="button" class="linkbtn" data-act="delWorkout" data-w="${i}">מחיקה</button>` : ""}
        </div>
        <div class="sgrid">
          ${fieldHtml("שם האימון", `<input type="text" ${n("name")} value="${val(w.name)}" maxlength="40">`, { id: `w${i}name` })}
          ${fieldHtml("משך", `<div class="field__suffix"><input type="number" inputmode="numeric" min="15" max="180" step="5" ${n("minutes")} value="${val(w.minutes)}"><span>דקות</span></div>`, { id: `w${i}minutes` })}
          ${fieldHtml("מחיר", `<div class="field__suffix"><input type="number" inputmode="numeric" min="0" max="5000" ${n("price")} value="${val(w.price)}"><span>₪</span></div>`, { id: `w${i}price` })}
          ${fieldHtml("שורת משנה", `<input type="text" ${n("sub")} value="${val(w.sub)}" maxlength="80" placeholder="למשל: משקולות, גומיות ומשקל גוף">`, { id: `w${i}sub` })}
        </div>
        ${fieldHtml("תיאור", `<textarea rows="2" ${n("desc")} maxlength="300">${val(w.desc)}</textarea>`, { id: `w${i}desc` })}
        ${fieldHtml("ציוד שאתה מביא", `<input type="text" ${n("gear")} value="${val((w.gear || []).join(", "))}" placeholder="מזרן, קטלבל, גומיות">`, { id: `w${i}gear`, hint: "(מופרד בפסיקים)" })}
      </div>`;
  }

  function renderSettings() {
    const d = draft;
    $("#settingsForm").innerHTML = `
      <section class="scard">
        <div class="scard__head"><h2>פרטי העסק</h2><p>מופיעים בראש האתר, בתחתית ובהודעות הוואטסאפ.</p></div>
        <div class="sgrid">
          ${fieldHtml("שם המאמן", `<input id="sTrainer" type="text" data-k="trainer" value="${val(d.trainer)}" maxlength="30">`, { id: "sTrainer" })}
          ${fieldHtml("טלפון נייד", `<input id="sPhone" type="tel" dir="ltr" data-k="phoneDisplay" value="${val(d.phoneDisplay)}" placeholder="050-123-4567">`, { id: "sPhone", hint: "(גם לוואטסאפ)" })}
          ${fieldHtml("אזור שירות", `<input id="sArea" type="text" data-k="area" value="${val(d.area)}" maxlength="60" placeholder="גוש דן והשרון">`, { id: "sArea" })}
        </div>
      </section>

      <section class="scard">
        <div class="scard__head"><h2>שעות פעילות</h2><p>לוחצים על שעה כדי להחליף מצב: סגור, פנוי, טנטטיבי. בשעה טנטטיבית מתאמנים יכולים לשריין, ואתה מאשר עד יום לפני.</p></div>
        <p class="hlegend"><span><i class="hchip" data-state="on"></i>פנוי</span><span><i class="hchip" data-state="tent"></i>טנטטיבי</span><span><i class="hchip" data-state="off"></i>סגור</span></p>
        <div class="hours" id="hoursBox">${hoursRows()}</div>
        <p class="hours__hint" id="hoursHint">${esc(hoursSummaryOf(d) || "כרגע כל הימים סגורים")}</p>
      </section>

      <section class="scard">
        <div class="scard__head"><h2>סוגי אימונים ומחירים</h2><p>עד 12 סוגים. אימון שנמחק נשאר בהזמנות שכבר נקבעו.</p></div>
        <div class="wedit">${d.workouts.map(workoutItem).join("")}</div>
        ${d.workouts.length < 12 ? `<button type="button" class="addbtn" data-act="addWorkout">+ הוספת סוג אימון</button>` : ""}
      </section>

      <section class="scard">
        <div class="scard__head"><h2>ערים ותוספת נסיעה</h2><p>הערים שאתה מגיע אליהן באופן קבוע, ולכל אחת תוספת נסיעה משלה. תוספת 0 = בלי תוספת.</p></div>
        <label class="switch" for="sAllCities">
          <input type="checkbox" id="sAllCities" data-k="allowAllCities" ${d.allowAllCities ? "checked" : ""}>
          <span class="switch__track" aria-hidden="true"><span class="switch__thumb"></span></span>
          <span class="switch__text"><b>לקבל הזמנות מכל הארץ</b><small>מתאמנים יוכלו לבחור כל עיר בישראל (${IL_CITIES.length} ערים ומועצות) או לכתוב יישוב אחר</small></span>
        </label>
        ${d.allowAllCities ? `<div class="sgrid">${fieldHtml("תוספת נסיעה לעיר שלא ברשימה", `<div class="field__suffix"><input id="sOtherFee" type="number" inputmode="numeric" min="0" max="500" data-k="otherCityFee" value="${val(d.otherCityFee)}"><span>₪</span></div>`, { id: "sOtherFee" })}</div>` : ""}
        <datalist id="ilCities">${IL_CITIES.map((n) => `<option value="${esc(n)}"></option>`).join("")}</datalist>
        <div class="cities">
          <div class="crow crow__head"><span>עיר</span><span>תוספת נסיעה</span><span></span></div>
          ${d.cities.map((c, i) => `
            <div class="crow" style="--i:${i}">
              <input type="text" list="ilCities" data-c="${i}" data-f="name" value="${val(c.name)}" maxlength="40" aria-label="שם העיר" placeholder="מתחילים להקליד…">
              <div class="field__suffix"><input type="number" inputmode="numeric" min="0" max="500" data-c="${i}" data-f="fee" value="${val(c.fee)}" aria-label="תוספת נסיעה"><span>₪</span></div>
              ${d.cities.length > 1 ? `<button type="button" class="linkbtn" data-act="delCity" data-c="${i}" aria-label="מחיקת ${val(c.name)}">מחיקה</button>` : "<span></span>"}
            </div>`).join("")}
        </div>
        <button type="button" class="addbtn" data-act="addCity">+ הוספת עיר</button>
      </section>

      <section class="scard">
        <div class="scard__head"><h2>כללי הזמנה</h2></div>
        <div class="sgrid">
          ${fieldHtml("הנחה לאימון ראשון", `<div class="field__suffix"><input id="sDisc" type="number" inputmode="numeric" min="0" max="90" data-k="firstTimeDiscount" data-scale="0.01" value="${Math.round(d.firstTimeDiscount * 100)}"><span>%</span></div>`, { id: "sDisc", hint: "(0 = בלי)" })}
          ${fieldHtml("אפשר לקבוע עד", `<div class="field__suffix"><input id="sLead" type="number" inputmode="numeric" min="0" max="72" data-k="minLeadHours" value="${val(d.minLeadHours)}"><span>שעות לפני</span></div>`, { id: "sLead" })}
          ${fieldHtml("כמה זמן קדימה אפשר לקבוע", `<div class="field__suffix"><input id="sAhead" type="number" inputmode="numeric" min="7" max="180" data-k="daysAhead" value="${val(d.daysAhead)}"><span>ימים</span></div>`, { id: "sAhead" })}
          ${fieldHtml("תוספת לכל משתתף נוסף בקבוצה", `<div class="field__suffix"><input id="sGroupExtra" type="number" inputmode="numeric" min="0" max="2000" data-k="groupExtra" value="${val(d.groupExtra)}"><span>₪</span></div>`, { id: "sGroupExtra" })}
          ${fieldHtml("ביטול חינם עד", `<div class="field__suffix"><input id="sCancel" type="number" inputmode="numeric" min="0" max="72" data-k="cancelHours" value="${val(d.cancelHours)}"><span>שעות לפני</span></div>`, { id: "sCancel" })}
        </div>
      </section>

      <section class="scard">
        <div class="scard__head"><h2>סיסמת הניהול</h2><p>${online ? "הסיסמה החדשה נכנסת לתוקף מיד." : "שינוי סיסמה זמין רק באתר החי."}</p></div>
        ${online ? `
        <div class="sgrid">
          ${fieldHtml("סיסמה נוכחית", `<input id="pwCur" type="password" autocomplete="current-password" dir="ltr">`, { id: "pwCur" })}
          ${fieldHtml("סיסמה חדשה", `<input id="pwNew" type="password" autocomplete="new-password" dir="ltr" minlength="6">`, { id: "pwNew", hint: "(לפחות 6 תווים)" })}
          ${fieldHtml("שוב את הסיסמה החדשה", `<input id="pwNew2" type="password" autocomplete="new-password" dir="ltr">`, { id: "pwNew2" })}
        </div>
        <p class="field__error" id="pwErr" role="alert"></p>
        <div><button type="button" class="btn btn--ghost btn--small" data-act="changePassword" id="pwBtn"><span class="btn__label">שינוי סיסמה</span><span class="spinner" aria-hidden="true"></span></button></div>` : ""}
      </section>`;
    markDirty();
  }

  function hoursSummaryOf(d) {
    const saved = CONFIG.hours, savedW = CONFIG.workouts;
    CONFIG.hours = d.hours; CONFIG.workouts = d.workouts;
    try { return hoursSummary(); } finally { CONFIG.hours = saved; CONFIG.workouts = savedW; }
  }

  function markDirty() {
    const dirty = isDirty();
    $("#saveBar").hidden = !dirty;
    root.classList.toggle("has-savebar", dirty);
  }

  function refreshHours() {
    $("#hoursBox").innerHTML = hoursRows();
    $("#hoursHint").textContent = hoursSummaryOf(draft) || "כרגע כל הימים סגורים";
    markDirty();
  }

  $("#settingsForm").addEventListener("input", (e) => {
    const t = e.target;
    t.closest(".field")?.classList.remove("is-invalid");
    if (t.dataset.k) {
      const k = t.dataset.k;
      draft[k] = t.type === "checkbox" ? t.checked : t.type === "number" ? Number(t.value) * Number(t.dataset.scale || 1) : t.value;
      if (t.type === "checkbox") { renderSettings(); return; }
    } else if (t.dataset.w != null && t.dataset.f) {
      const w = draft.workouts[Number(t.dataset.w)], f = t.dataset.f;
      if (f === "minutes" || f === "price") w[f] = Number(t.value);
      else if (f === "gear") w.gear = t.value.split(",").map((x) => x.trim()).filter(Boolean);
      else w[f] = t.value;
      if (f === "name") $(`[data-preview="${t.dataset.w}"]`).textContent = t.value || "אימון חדש";
    } else if (t.dataset.c != null) {
      const c = draft.cities[Number(t.dataset.c)];
      c[t.dataset.f] = t.dataset.f === "fee" ? Number(t.value) : t.value;
    } else return;
    markDirty();
  });

  $("#settingsForm").addEventListener("click", async (e) => {
    const chip = e.target.closest(".hchip");
    if (chip) {
      const d = Number(chip.dataset.day), h = Number(chip.dataset.h);
      const hs = new Set(draft.hours[d] || []);
      draft.tentative = draft.tentative || {};
      const tent = new Set(draft.tentative[d] || []);
      // סגור → פנוי → טנטטיבי → סגור
      const st = !hs.has(h) ? "off" : tent.has(h) ? "tent" : "on";
      const next = { off: "on", on: "tent", tent: "off" }[st];
      if (next === "off") { hs.delete(h); tent.delete(h); } else hs.add(h);
      if (next === "tent") tent.add(h); else tent.delete(h);
      draft.hours[d] = [...hs].sort((a, b) => a - b);
      draft.tentative[d] = [...tent].sort((a, b) => a - b);
      chip.dataset.state = next;
      chip.setAttribute("aria-pressed", String(next !== "off"));
      chip.setAttribute("aria-label", `יום ${DAY_LONG[d]} ${hhmm(h)}: ${next === "on" ? "פנוי" : next === "tent" ? "טנטטיבי" : "סגור"}`);
      const row = chip.closest(".hours__row");
      $(".hours__day small", row).textContent = hs.size ? `${hs.size} שעות` : "סגור";
      $("#hoursHint").textContent = hoursSummaryOf(draft) || "כרגע כל הימים סגורים";
      markDirty();
      return;
    }
    const icon = e.target.closest("[data-icon]");
    if (icon) {
      draft.workouts[Number(icon.dataset.w)].icon = icon.dataset.icon;
      $$(`[data-icon][data-w="${icon.dataset.w}"]`).forEach((b) => b.setAttribute("aria-pressed", String(b === icon)));
      markDirty();
      return;
    }
    const btn = e.target.closest("[data-act]"); if (!btn) return;
    const act = btn.dataset.act;
    draft.tentative = draft.tentative || {};
    if (act === "copyWeek") { for (let d = 1; d <= 4; d++) { draft.hours[d] = [...draft.hours[0]]; draft.tentative[d] = [...(draft.tentative[0] || [])]; } refreshHours(); toast("השעות של יום ראשון הועתקו לב׳–ה׳", "ok"); }
    if (act === "copyPrev") { const d = Number(btn.dataset.day); draft.hours[d] = [...draft.hours[d - 1]]; draft.tentative[d] = [...(draft.tentative[d - 1] || [])]; refreshHours(); }
    if (act === "clearDay") { draft.hours[Number(btn.dataset.day)] = []; draft.tentative[Number(btn.dataset.day)] = []; refreshHours(); }
    if (act === "addWorkout") {
      draft.workouts.push({ id: "w" + Date.now().toString(36), name: "", minutes: 60, price: 250, sub: "", desc: "", gear: ["מזרן"], icon: "strength" });
      renderSettings();
      const i = draft.workouts.length - 1;
      $(`#w${i}name`).focus();
      $(`#w${i}name`).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    }
    if (act === "delWorkout") { draft.workouts.splice(Number(btn.dataset.w), 1); renderSettings(); }
    if (act === "addCity") {
      draft.cities.push({ name: "", fee: 0 });
      renderSettings();
      $(`[data-c="${draft.cities.length - 1}"][data-f="name"]`).focus();
    }
    if (act === "delCity") { draft.cities.splice(Number(btn.dataset.c), 1); renderSettings(); }
    if (act === "changePassword") changePassword(btn);
  });

  function validateDraft() {
    const errs = [];
    const bad = (sel, msg) => errs.push({ sel, msg });
    if ((draft.trainer || "").trim().length < 2) bad('[data-k="trainer"]', "חסר שם מאמן");
    if (!/^05\d{8}$/.test(normPhone(draft.phoneDisplay || ""))) bad('[data-k="phoneDisplay"]', "מספר נייד צריך להתחיל ב־05 ולהכיל 10 ספרות");
    if (![0, 1, 2, 3, 4, 5, 6].some((d) => (draft.hours[d] || []).length)) bad("#hoursBox", "צריך לסמן לפחות שעת פעילות אחת");
    draft.workouts.forEach((w, i) => {
      if (!(w.name || "").trim()) bad(`[data-w="${i}"][data-f="name"]`, "לאחד האימונים חסר שם");
      if (!(w.minutes >= 15 && w.minutes <= 180)) bad(`[data-w="${i}"][data-f="minutes"]`, "משך אימון צריך להיות בין 15 ל־180 דקות");
      if (!(w.price >= 0 && w.price <= 5000)) bad(`[data-w="${i}"][data-f="price"]`, "מחיר צריך להיות בין 0 ל־5,000 ₪");
    });
    if (!draft.cities.some((c) => (c.name || "").trim())) bad('[data-c="0"][data-f="name"]', "צריך לפחות עיר אחת");
    draft.cities.forEach((c, i) => { if (!(c.fee >= 0 && c.fee <= 500)) bad(`[data-c="${i}"][data-f="fee"]`, "תוספת נסיעה בין 0 ל־500 ₪"); });
    if (draft.allowAllCities && !(draft.otherCityFee >= 0 && draft.otherCityFee <= 500)) bad('[data-k="otherCityFee"]', "תוספת נסיעה בין 0 ל־500 ₪");
    const rules = [["groupExtra", 0, 2000, "תוספת למשתתף בין 0 ל־2,000 ₪"], ["firstTimeDiscount", 0, 0.9, "הנחה בין 0 ל־90%"], ["minLeadHours", 0, 72, "שעות מראש בין 0 ל־72"], ["daysAhead", 7, 180, "ימים קדימה בין 7 ל־180"], ["cancelHours", 0, 72, "שעות לביטול בין 0 ל־72"]];
    rules.forEach(([k, min, max, msg]) => { if (!(draft[k] >= min && draft[k] <= max)) bad(`[data-k="${k}"]`, msg); });
    return errs;
  }

  function cleanDraft() {
    const c = JSON.parse(JSON.stringify(draft));
    c.trainer = c.trainer.trim();
    c.area = (c.area || "").trim();
    c.phoneDisplay = normPhone(c.phoneDisplay).replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3");
    c.cities = c.cities.map((x) => ({ name: (x.name || "").trim(), fee: Math.round(x.fee) || 0 })).filter((x) => x.name);
    c.workouts = c.workouts.map((w) => ({ ...w, name: w.name.trim(), sub: (w.sub || "").trim(), desc: (w.desc || "").trim(), minutes: Math.round(w.minutes), price: Math.round(w.price) }));
    c.firstTimeDiscount = Math.round(c.firstTimeDiscount * 100) / 100;
    return c;
  }

  $("#settingsSave").addEventListener("click", async () => {
    $$("#settingsForm .is-invalid").forEach((x) => x.classList.remove("is-invalid"));
    const errs = validateDraft();
    if (errs.length) {
      errs.forEach(({ sel }) => { const el = $(sel, $("#settingsForm")); (el?.closest(".field") || el)?.classList.add("is-invalid"); });
      const first = $(errs[0].sel, $("#settingsForm"));
      first?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      if (first && first.focus) first.focus({ preventScroll: true });
      if (first) shake(first.closest(".field") || first);
      toast(errs[0].msg);
      return;
    }
    const cfg = cleanDraft();
    const btn = $("#settingsSave");
    btn.classList.add("is-loading"); btn.disabled = true;
    try {
      if (online) {
        const r = await api({ action: "saveConfig", token, config: cfg });
        applyConfig(r.config);
      } else {
        store.set("config", cfg);
        applyConfig(cfg);
      }
      draft = current();
      renderSettings();
      toast("נשמר. האתר כבר מציג את הפרטים החדשים", "ok");
    } catch (err) {
      if (err.code === "unauthorized") { token = ""; session.set(""); showGate("הכניסה פגה. צריך להקליד סיסמה שוב"); }
      else toast(err.code === "invalid" ? "השרת דחה חלק מהפרטים. בדקו את השדות ונסו שוב" : "השמירה לא הצליחה. בדקו את החיבור ונסו שוב");
    } finally {
      btn.classList.remove("is-loading"); btn.disabled = false;
    }
  });

  $("#settingsReset").addEventListener("click", () => { draft = current(); renderSettings(); toast("השינויים בוטלו"); });

  async function changePassword(btn) {
    const cur = $("#pwCur").value, next = $("#pwNew").value, next2 = $("#pwNew2").value;
    const errEl = $("#pwErr");
    errEl.textContent = "";
    if (!cur) { errEl.textContent = "צריך להקליד את הסיסמה הנוכחית"; return; }
    if (next.length < 6) { errEl.textContent = "הסיסמה החדשה צריכה לפחות 6 תווים"; return; }
    if (next !== next2) { errEl.textContent = "הסיסמאות החדשות לא זהות"; return; }
    btn.classList.add("is-loading"); btn.disabled = true;
    try {
      await api({ action: "changePassword", token, current: cur, next });
      ["#pwCur", "#pwNew", "#pwNew2"].forEach((s) => { $(s).value = ""; });
      toast("הסיסמה שונתה", "ok");
    } catch (err) {
      errEl.textContent = err.code === "wrong_password" ? "הסיסמה הנוכחית לא נכונה" : err.code === "unauthorized" ? "הכניסה פגה. צאו והיכנסו שוב" : "השינוי לא הצליח. נסו שוב";
    } finally {
      btn.classList.remove("is-loading"); btn.disabled = false;
    }
  }

  addEventListener("beforeunload", (e) => { if (isDirty()) { e.preventDefault(); e.returnValue = ""; } });

  addEventListener("hashchange", route);

  /* ---------- boot ---------- */
  applyConfig(online ? null : store.get("config", null));
  restoreProfile();
  updateSummary();
  updateNextSlot();
  refreshBookingsUI();
  goTo(1, true);
  route();
  loadTaken();
  if (online) loadConfig();
  setInterval(() => { updateNextSlot(); refreshBookingsUI(); }, 60e3);
})();

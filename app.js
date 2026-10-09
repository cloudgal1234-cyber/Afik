/* קביעת אימונים אצל אפיק — כל ההגדרות שאפיק יכול לשנות נמצאות ב-CONFIG */
(() => {
  "use strict";

  const CONFIG = {
    trainer: "אפיק",
    // מספר הוואטסאפ של אפיק בפורמט בינלאומי, בלי + ובלי מקפים
    whatsapp: "972500000000",
    phoneDisplay: "050-000-0000",
    firstTimeDiscount: 0.3,
    minLeadHours: 3,          // אי אפשר לשריין פחות משלוש שעות מראש
    daysAhead: 56,            // שמונה שבועות קדימה
    cancelHours: 12,
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
        icon: '<path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12"/>'
      },
      {
        id: "hiit", name: "HIIT שורף", minutes: 45, price: 230,
        sub: "אינטרוולים קצרים ועצימים",
        desc: "45 דקות של עבודה בעצימות גבוהה ומנוחות קצרות. דופק למעלה, זמן קצר, הרבה זיעה.",
        gear: ["מזרן", "חבל קפיצה", "קטלבל 12 ק״ג", "טיימר"],
        icon: '<path d="M13 2 5 14h6l-1 8 8-12h-6l1-8Z"/>'
      },
      {
        id: "mobility", name: "גמישות וגב בריא", minutes: 60, price: 240,
        sub: "מוביליטי, ליבה ונשימה",
        desc: "למי שיושב מול מחשב כל היום. משחררים ירכיים וכתפיים ומחזקים את שרירי הליבה שמחזיקים את הגב.",
        gear: ["מזרן", "רולר עיסוי", "כדור פיזיו", "רצועת מתיחה"],
        icon: '<circle cx="12" cy="5" r="2"/><path d="M12 7v6m0 0-4 7m4-7 4 7M6 10c2 1.5 4 2 6 2s4-.5 6-2"/>'
      },
      {
        id: "duo", name: "אימון זוגי", minutes: 60, price: 380,
        sub: "בן או בת זוג, חבר או אמא",
        desc: "אימון אחד לשניים, עם תוכנית שמתאימה לכל אחד. מתחלקים במחיר ומוסיפים קצת תחרות.",
        gear: ["2 מזרנים", "קטלבלים בזוגות", "גומיות התנגדות", "TRX"],
        icon: '<circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6m-2.5-5.7A6 6 0 0 1 22 20"/>'
      }
    ]
  };

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
  const endTime = (h, minutes) => { const t = h * 60 + minutes; return hhmm(Math.floor(t / 60), t % 60); };

  function priceFor(workoutId, firstTime, city) {
    const w = workoutById(workoutId);
    if (!w) return null;
    const base = w.price;
    const discount = firstTime ? Math.round(base * CONFIG.firstTimeDiscount / 10) * 10 : 0;
    const fee = cityByName(city)?.fee || 0;
    return { base, discount, fee, total: base - discount + fee };
  }

  /* deterministic "Afik is already booked" so the calendar looks like a real diary */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967295;
  }

  let bookings = store.get("bookings", []);

  function isTaken(iso, h) {
    if (bookings.some((b) => b.date === iso && b.time === h)) return true;
    const d = fromISO(iso);
    const dow = d.getDay();
    const busyRate = dow === 5 ? 0.45 : (h >= 18 && h <= 20 ? 0.55 : 0.32);
    return hash(`${iso}@${h}`) < busyRate;
  }

  function slotsFor(iso) {
    const d = fromISO(iso);
    const now = new Date();
    const lead = now.getTime() + CONFIG.minLeadHours * 3600e3;
    return (CONFIG.hours[d.getDay()] || []).map((h) => {
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h);
      const tooSoon = start.getTime() < lead;
      return { h, free: !tooSoon && !isTaken(iso, h), tooSoon };
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
      const s = slotsFor(iso).find((x) => x.free);
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
    goals: saved.goals || []
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

  $("#workoutShowcase").innerHTML = CONFIG.workouts.map((w) => `
    <article class="wcard">
      <span class="wcard__icon">${svg(w.icon, 26)}</span>
      <h3>${w.name}</h3>
      <p>${w.desc}</p>
      <div class="wcard__meta">
        <span>${w.minutes} דק׳</span><b>${ils(w.price)}</b>
      </div>
      <span class="wcard__go">לשריין ${svg('<path d="M14 6l-6 6 6 6"/>', 16)}</span>
      <button class="wcard__btn" type="button" data-pick="${w.id}" aria-label="לשריין ${w.name}"></button>
    </article>`).join("");

  function renderPick() {
    $("#workoutPick").innerHTML = CONFIG.workouts.map((w) => {
      const p = priceFor(w.id, state.firstTime);
      const checked = state.workoutId === w.id;
      return `
        <button type="button" class="opt" role="radio" aria-checked="${checked}" tabindex="${checked || (!state.workoutId && w === CONFIG.workouts[0]) ? 0 : -1}" data-id="${w.id}">
          <span class="opt__icon">${svg(w.icon)}</span>
          <span class="opt__name">${w.name}</span>
          <span class="opt__price">${p.discount ? `<s>${ils(p.base)}</s>` : ""}${ils(p.total)}</span>
          <span class="opt__sub">${w.minutes} דק׳ · ${w.sub}</span>
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
    if (state.firstTime) toast("הנחת היכרות של 30% נוספה", "ok");
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
            ${g.map((s) => `<button type="button" class="slot" role="radio" style="--i:${i++}" data-h="${s.h}" aria-checked="${state.time === s.h}" ${s.free ? "" : "disabled"} aria-label="${hhmm(s.h)} עד ${endTime(s.h, mins)}${s.free ? "" : s.tooSoon ? ", מוקדם מדי לשריון" : ", תפוס"}">${hhmm(s.h)}</button>`).join("")}
          </div>
        </div>`).join("")}
      <p class="slots__foot">${fromISO(state.date).getDay() === 5 ? "ביום שישי אפיק מסיים ב־13:00." : "בין 11:00 ל־16:00 אפיק בדרכים בין מתאמנים."}</p>`;
  }

  $("#slots").addEventListener("click", (e) => {
    const b = e.target.closest(".slot"); if (!b || b.disabled) return;
    state.time = Number(b.dataset.h);
    $$(".slot", $("#slots")).forEach((s) => s.setAttribute("aria-checked", s === b));
    $("#err2").textContent = "";
    updateSummary("time");
  });

  /* ---------- details form ---------- */
  const fCity = $("#fCity");
  fCity.innerHTML = `<option value="">בחירת עיר</option>` + CONFIG.cities.map((c) => `<option value="${c.name}">${c.name}</option>`).join("");
  $("#faqCities").textContent = `${CONFIG.cities.map((c) => c.name).join(", ")}. בחלק מהערים יש תוספת נסיעה קטנה שמופיעה בזמן ההזמנה. גרים קצת מחוץ לאזור? כתבו לאפיק בוואטסאפ.`;

  const fields = {
    fName: { key: "name", test: (v) => v.trim().split(/\s+/).length >= 2 && v.trim().length >= 4, msg: (v) => v.trim() ? "צריך שם פרטי ושם משפחה" : "איך קוראים לך?" },
    fPhone: { key: "phone", test: (v) => /^05\d{8}$/.test(normPhone(v)), msg: (v) => v.trim() ? "מספר נייד ישראלי מתחיל ב־05 ויש בו 10 ספרות" : "לאן אפיק ישלח אישור?" },
    fCity: { key: "city", test: (v) => !!v, msg: () => "לאיזו עיר להגיע?" },
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
  fCity.addEventListener("change", () => {
    validateField("fCity");
    const c = cityByName(fCity.value);
    $("#cityHint").textContent = c ? (c.fee ? `תוספת נסיעה לעיר הזאת: ${ils(c.fee)}` : "בלי תוספת נסיעה") : "";
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
      city: fCity.value,
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
    if (saved.city && cityByName(saved.city)) { fCity.value = saved.city; fCity.dispatchEvent(new Event("change")); }
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
    setDD("sWorkout", w ? `${w.name} · ${w.minutes} דק׳` : "", changed === "workout");
    setDD("sDate", state.date ? friendlyDay(state.date) : "", changed === "date");
    setDD("sTime", state.time != null ? `${hhmm(state.time)}–${endTime(state.time, w ? w.minutes : 60)}` : "", changed === "time" || changed === "workout");
    setDD("sAddr", d.city && d.street ? `${d.street}, ${d.city}` : d.city || "", changed === "addr");
    const p = priceFor(state.workoutId, state.firstTime, d.city);
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
    const p = priceFor(state.workoutId, state.firstTime, d.city);
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
        ${d.goals.length ? `<div class="trow"><dt>מטרות</dt><dd>${d.goals.map(esc).join(", ")}</dd><button type="button" data-goto="3">שינוי</button></div>` : ""}
        ${d.notes ? `<div class="trow"><dt>הערות</dt><dd>${esc(d.notes)}</dd><button type="button" data-goto="3">שינוי</button></div>` : ""}
        ${p.discount ? `<div class="trow"><dt>הנחת היכרות</dt><dd>−${ils(p.discount)}</dd><span></span></div>` : ""}
        ${p.fee ? `<div class="trow"><dt>תוספת נסיעה</dt><dd>${ils(p.fee)}</dd><span></span></div>` : ""}
      </dl>
      <div class="ticket__total"><span>לתשלום אחרי האימון</span><span>${p.discount || p.fee ? `<s>${ils(p.base)}</s>` : ""}<b>${ils(p.total)}</b></span></div>`;
  }

  /* ---------- wizard ---------- */
  const panels = $$(".panel");
  const stepsEl = $$(".steps__item");

  function validateStep(n) {
    if (n === 1) {
      if (!state.workoutId) { $("#err1").textContent = "בחרו סוג אימון כדי להמשיך"; shake($("#workoutPick")); return false; }
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
    panels.forEach((p) => {
      const on = Number(p.dataset.panel) === n;
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
    $(".btn__label", $("#nextBtn")).textContent = n === 4 ? "לשריין את האימון" : "המשך";
    $("#wizard").classList.toggle("is-done", n === 5);
    if (n === 2) { if (state.date) { const d = fromISO(state.date); state.view = new Date(d.getFullYear(), d.getMonth(), 1); } renderCalendar(); renderSlots(); }
    if (n === 4) renderTicket();
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
    setTimeout(() => {
      const w = workoutById(state.workoutId);
      const d = readDetails();
      const p = priceFor(state.workoutId, state.firstTime, d.city);
      const b = {
        id: "AF-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
        workoutId: w.id, date: state.date, time: state.time, minutes: w.minutes,
        price: p.total, firstTime: state.firstTime, details: d, createdAt: Date.now()
      };
      bookings.push(b);
      store.set("bookings", bookings);
      saveProfile();
      btn.classList.remove("is-loading"); btn.disabled = false;
      showDone(b);
      refreshBookingsUI(true);
      updateNextSlot();
    }, reduceMotion ? 100 : 900);
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
      `מחיר: ${ils(b.price)}`,
      `שם: ${d.name}`
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
    $("#doneText").textContent = `${w.name} ${friendlyDay(b.date) === fmtLong.format(fromISO(b.date)) ? "ב" + friendlyDay(b.date) : friendlyDay(b.date)} בשעה ${hhmm(b.time)}, ב${b.details.street}, ${b.details.city}. אפיק מביא את הציוד, את/ה מביא/ה מים ומגבת.`;
    $("#doneRef").textContent = b.id;
    $("#waLink").href = waUrl(waText(b));
    $("#gcalLink").href = gcalUrl(b);
    goTo(5, true);
    $("#wizard").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    setTimeout(confetti, 350);
  }

  $("#againBtn").addEventListener("click", () => {
    state.date = null; state.time = null; state.maxStep = 1;
    $("#fAgree").checked = false; $("#err4").textContent = "";
    $("#slots").innerHTML = `<div class="slots__empty">${svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>', 44)}<p>בוחרים יום בלוח ורואים את השעות הפנויות</p></div>`;
    goTo(1, true); updateSummary();
  });

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
    const sorted = [...bookings].sort((a, b) => bookingStart(a) - bookingStart(b));
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
          <div class="bk__top"><p class="bk__when">${esc(friendlyDay(b.date))}, ${hhmm(b.time)}</p><span class="bk__count ${isPast ? "is-past" : ""}">${relLabel(b)}</span></div>
          <p class="bk__meta">${esc(w ? w.name : "")} · ${b.minutes} דק׳ · ${ils(b.price)}<br>${esc(b.details.street)}, ${esc(b.details.city)} · <span dir="ltr">${b.id}</span></p>
          ${isPast ? "" : `
          <div class="bk__actions">
            <a class="btn btn--ghost" href="${waUrl(waText(b))}" target="_blank" rel="noopener">שליחה לאפיק</a>
            <a class="btn btn--ghost" href="${gcalUrl(b)}" target="_blank" rel="noopener">ליומן</a>
            <button type="button" class="btn btn--ghost" data-cancel="${b.id}">ביטול</button>
          </div>
          ${late ? `<p class="bk__meta">פחות מ־${CONFIG.cancelHours} שעות לאימון. ביטול עכשיו כרוך בתיאום עם אפיק.</p>` : ""}`}
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
      card.classList.add("is-removing");
      setTimeout(() => {
        bookings = bookings.filter((b) => b.id !== c.dataset.cancel);
        store.set("bookings", bookings);
        refreshBookingsUI(); renderDrawer(); updateNextSlot();
        if (state.step === 2) { renderCalendar(); renderSlots(); }
        toast("האימון בוטל. כדאי לעדכן את אפיק בוואטסאפ");
      }, reduceMotion ? 0 : 300);
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
    const n = bookings.filter((b) => bookingStart(b) > Date.now()).length;
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
      if (todoBoxes.every((x) => x.checked)) toast("הבית מוכן. אפיק יכול להגיע", "ok");
    });
  });
  syncTodo();

  /* ---------- footer phone ---------- */
  $("#phoneText").textContent = CONFIG.phoneDisplay;
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

  /* ---------- boot ---------- */
  renderPick();
  restoreProfile();
  updateSummary();
  updateNextSlot();
  refreshBookingsUI();
  goTo(1, true);
  setInterval(() => { updateNextSlot(); refreshBookingsUI(); }, 60e3);
})();

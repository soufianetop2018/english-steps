/*
 * Données gardées sur l'appareil (localStorage) : réglages, apprenants, progression.
 * Avec un compte, cloud.js recopie aussi les apprenants en ligne (Supabase).
 */

const STORE_KEY = "englishsteps-v1";

const Settings = {
  defaults: { lang: null, sfx: true, rate: 1, translate: true, autoplay: true },
  get(k) { return k in Store.s.settings ? Store.s.settings[k] : this.defaults[k]; },
  set(k, v) { Store.s.settings[k] = v; Store.save(); },
};

/* Index du parcours : activité → leçon → niveau. */
const Index = { acts: {}, units: {}, levels: {} };
function buildIndex() {
  DATA.levels.forEach((lv, li) => {
    Index.levels[lv.id] = { level: lv, i: li };
    lv.units.forEach((u, ui) => {
      Index.units[u.id] = { unit: u, level: lv, i: ui };
      u.acts.forEach((a, ai) => { Index.acts[a.id] = { act: a, unit: u, level: lv, i: ai }; });
    });
  });
}

const RANKS = [[0, "🌱", "rank_1"], [200, "📗", "rank_2"], [600, "📘", "rank_3"], [1500, "🎓", "rank_4"],
               [3000, "🏅", "rank_5"], [5500, "🏆", "rank_6"], [9000, "👑", "rank_7"]];

const AVATARS = ["🧑", "👩", "👨", "🧕", "👧", "👦", "🧑‍🎓", "👩‍🏫", "🦊", "🦉", "🐼", "🦁", "🐯", "🐬", "🚀", "⚽"];
const COLORS = ["#0284c7", "#f97316", "#7c3aed", "#db2777", "#0d9488", "#65a30d", "#ca8a04", "#2563eb"];

const Store = {
  s: null,
  listeners: [],

  load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { s = null; }
    this.s = Object.assign({ learners: [], current: null, settings: {}, dirty: [], removed: [] }, s || {});
  },

  save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.s)); } catch (e) { /* stockage plein ou bloqué */ }
  },

  touch(learner) {
    learner.updated = new Date().toISOString();
    if (!this.s.dirty.includes(learner.id)) this.s.dirty.push(learner.id);
    this.save();
    this.listeners.forEach(f => f(learner));
  },

  learners() { return this.s.learners; },
  learner(id) { return this.s.learners.find(l => l.id === id) || null; },
  current() { return this.learner(this.s.current); },
  select(id) { this.s.current = id; this.save(); },

  addLearner({ name, avatar }) {
    const l = {
      id: uuid(), name: String(name || "").trim().slice(0, 30) || "🙂", avatar: avatar || AVATARS[0],
      color: COLORS[this.s.learners.length % COLORS.length], owner: (typeof Cloud !== "undefined" && Cloud.uid()) || null,
      created: new Date().toISOString(), xp: 0, progress: {}, badges: {}, mistakes: {}, log: [], days: [], typed: 0,
    };
    this.s.learners.push(l);
    this.touch(l);
    return l;
  },

  updateLearner(id, patch) {
    const l = this.learner(id);
    if (!l) return;
    Object.assign(l, patch);
    this.touch(l);
  },

  removeLearner(id) {
    const l = this.learner(id);
    this.s.learners = this.s.learners.filter(x => x.id !== id);
    this.s.dirty = this.s.dirty.filter(x => x !== id);
    if (l && l.owner) this.s.removed.push(id);
    if (this.s.current === id) this.s.current = null;
    this.save();
    if (typeof Cloud !== "undefined") Cloud.schedule();
  },

  resetLearner(id) {
    this.updateLearner(id, { xp: 0, progress: {}, badges: {}, mistakes: {}, log: [], days: [], typed: 0 });
  },

  actStars(l, actId) { return (l.progress[actId] || {}).s || 0; },
  unitStars(l, unit) { return unit.acts.reduce((n, a) => n + this.actStars(l, a.id), 0); },

  levelStars(l, lv) {
    let got = 0, max = 0;
    lv.units.forEach(u => { got += this.unitStars(l, u); max += u.acts.length * 3; });
    return { got, max };
  },

  /* Toutes les leçons sont ouvertes (ordre conseillé, pas imposé). */
  levelOpen() { return true; },

  lessonsDone(l, lv) { return lv.units.filter(u => u.acts.every(a => this.actStars(l, a.id) > 0)).length; },

  totalStars(l) { return Object.values(l.progress).reduce((n, p) => n + (p.s || 0), 0); },

  streak(l) {
    const days = new Set(l.days || []);
    const d = new Date();
    if (!days.has(today(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (days.has(today(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  },

  rank(l) {
    let cur = RANKS[0], next = null;
    for (let i = 0; i < RANKS.length; i++) if (l.xp >= RANKS[i][0]) { cur = RANKS[i]; next = RANKS[i + 1] || null; }
    return { emoji: cur[1], key: cur[2], from: cur[0], next: next ? next[0] : null };
  },

  record(actId, r) {
    const l = this.current();
    if (!l) return null;
    const info = Index.acts[actId];
    const total = Math.max(1, r.total);
    const pct = Math.max(0, Math.min(1, r.score / total));
    const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.5 ? 1 : 0;
    const before = l.progress[actId] || { s: 0, b: 0, p: 0 };
    const xp = Math.round(r.score * 5 + stars * 8 + (stars > before.s ? 15 : 0));
    l.progress[actId] = { s: Math.max(before.s, stars), b: Math.max(before.b, Math.round(pct * 100)), p: before.p + 1, t: Date.now() };
    l.xp += xp;
    const day = today();
    if (!l.days.includes(day)) { l.days.push(day); l.days = l.days.slice(-120); }
    l.log.push({ a: actId, s: stars, c: r.score, n: r.total, x: xp, d: Math.round(r.duration || 0), t: Date.now() });
    l.log = l.log.slice(-200);
    (r.mistakes || []).forEach(k => { const m = l.mistakes[k] || { n: 0 }; l.mistakes[k] = { n: m.n + 1, t: Date.now() }; });
    (r.fixed || []).forEach(k => {
      if (!l.mistakes[k]) return;
      l.mistakes[k].n -= 1;
      if (l.mistakes[k].n <= 0) delete l.mistakes[k];
    });
    const keys = Object.keys(l.mistakes);
    if (keys.length > 80) keys.sort((a, b) => l.mistakes[a].t - l.mistakes[b].t).slice(0, keys.length - 80).forEach(k => delete l.mistakes[k]);
    if (r.typed) l.typed = (l.typed || 0) + r.typed;
    const badges = BADGES.filter(b => !l.badges[b.id] && b.test(l, { actId, stars, info }));
    badges.forEach(b => { l.badges[b.id] = Date.now(); });
    this.touch(l);
    return { stars, pct, xp, best: Math.max(before.s, stars), badges, unlocked: [] };
  },

  mistakeKeys(l, n = 12) {
    return Object.keys(l.mistakes || {}).filter(k => exerciseByKey(k))
      .sort((a, b) => l.mistakes[b].n - l.mistakes[a].n || l.mistakes[b].t - l.mistakes[a].t).slice(0, n);
  },
};

function levelDone(l, id) {
  const info = Index.levels[id];
  return info && info.level.units.length && info.level.units.every(u => u.acts.every(a => Store.actStars(l, a.id) > 0));
}
const lessonsRead = l => Object.keys(l.progress).filter(k => k.endsWith(".1")).length;
const BADGES = [
  { id: "first", emoji: "🎉", key: "b_first", test: l => l.log.length >= 1 },
  { id: "plays10", emoji: "🔟", key: "b_plays10", test: l => l.log.length >= 10 },
  { id: "plays50", emoji: "🏃", key: "b_plays50", test: l => l.log.length >= 50 },
  { id: "stars3", emoji: "⭐", key: "b_stars3", test: (l, g) => g.stars === 3 },
  { id: "perfect5", emoji: "💯", key: "b_perfect5", test: l => l.log.filter(x => x.s === 3 && x.a.match(/\.[23]$/)).length >= 5 },
  { id: "lessons10", emoji: "📖", key: "b_lessons10", test: l => lessonsRead(l) >= 10 },
  { id: "lessons40", emoji: "📚", key: "b_lessons40", test: l => lessonsRead(l) >= 40 },
  { id: "typist", emoji: "⌨️", key: "b_typist", test: l => (l.typed || 0) >= 30 },
  { id: "listener", emoji: "🎧", key: "b_listener", test: l => l.log.filter(x => x.a.endsWith(".4") && x.s > 0).length >= 10 },
  { id: "streak3", emoji: "🔥", key: "b_streak3", test: l => Store.streak(l) >= 3 },
  { id: "streak7", emoji: "🌟", key: "b_streak7", test: l => Store.streak(l) >= 7 },
  { id: "xp1000", emoji: "💎", key: "b_xp1000", test: l => l.xp >= 1000 },
  { id: "basic", emoji: "🌱", key: "b_basic", test: l => levelDone(l, "basic") },
  { id: "intermediate", emoji: "🌿", key: "b_intermediate", test: l => levelDone(l, "intermediate") },
  { id: "advanced", emoji: "🌳", key: "b_advanced", test: l => levelDone(l, "advanced") },
  { id: "review", emoji: "🔁", key: "b_review", test: (l, g) => g.actId === "review" && g.stars > 0 },
];

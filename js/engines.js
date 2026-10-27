/*
 * Les activités d'une leçon : « lesson » (les pages d'explication), « practice » / « practice2 »
 * (les exercices de la leçon, en deux séries), « listen » (écoute fabriquée à partir des exemples)
 * et « review » (les exercices ratés). Chaque exercice est corrigé tout de suite, avec la phrase
 * juste prononcée en anglais, sa traduction et la raison de la réponse.
 */

const BLANK = "___";
const sayEn = (text, slow = false) => Speech.say(text, { lang: "en", slow });

/* Texte anglais (toujours de gauche à droite). */
function en(text, cls = "") {
  return `<span class="en ${cls}" lang="en" dir="ltr">${esc(text)}</span>`;
}

/* *mot* → mot en couleur (explications). */
function marks(html) {
  return html.replace(/\*([^*]+)\*/g, '<mark class="hl" dir="auto">$1</mark>');
}

/* Explication dans la langue de l'interface (arabe ou français). */
function tr(obj, base) {
  const L = lang();
  return (obj && (obj[`${base}_${L}`] || obj[L])) || "";
}

function paragraphs(text) {
  return text.split("\n").filter(Boolean).map(p => `<p>${marks(esc(p))}</p>`).join("");
}

/* Réponse tapée : majuscules, espaces, apostrophes, virgules et ponctuation finale ne comptent pas. */
function normalizeAnswer(s) {
  return String(s || "").toLowerCase().replace(/[’‘`]/g, "'").replace(/,/g, " ").replace(/\s+/g, " ").trim()
    .replace(/[.!?;:]+$/g, "").trim();
}
function accepted(value, answers) {
  const v = normalizeAnswer(value);
  return answers.some(a => normalizeAnswer(a) === v);
}

function promptHtml(prompt, inner = `<span class="blank">?</span>`) {
  if (!prompt.includes(BLANK)) return en(prompt, "q");
  const [a, b] = prompt.split(BLANK);
  return `<span class="en q" lang="en" dir="ltr">${esc(a)}${inner}${esc(b)}</span>`;
}

function instrKey(ctx) {
  return { lesson: "lesson", practice: "practice", practice2: "practice", listen: "listen", review: "review" }[ctx.kind] || "practice";
}

/* ------------------------------------------------------------------------- */
/* Déroulement commun                                                          */
/* ------------------------------------------------------------------------- */
const Play = {
  ctx: null,

  start(actId) {
    Speech.stop();
    let act, unit, startAt = 0;
    if (actId.includes("@")) [actId, startAt] = [actId.split("@")[0], +actId.split("@")[1] || 0];   // #/play/<id>@<n>
    actId = String(actId);
    if (actId === "review") {
      const l = Store.current();
      const keys = l ? Store.mistakeKeys(l, 12) : [];
      const items = keys.map(k => exerciseByKey(k)).filter(Boolean);
      if (items.length < 2) { toast(t("review_empty")); return go("#/home"); }
      act = { id: "review", kind: "review" };
      unit = { id: "review", title: { ar: t("review"), fr: t("review"), en: "Review" }, exercises: items.map(x => x.ex),
               keys: items.map(x => x.key), pages: [], acts: [act] };
    } else {
      const info = Index.acts[actId];
      if (!info) return go("#/home");
      ({ act, unit } = info);
    }
    const ctx = { actId, act, unit, kind: act.kind, score: 0, total: 0, mistakes: [], fixed: [], start: Date.now(),
                  over: false, first: true, typed: 0, startAt };
    this.ctx = ctx;
    (Engines[act.kind] || Engines.practice)(ctx);
  },

  frame(ctx, body, { progress = null } = {}) {
    const kind = DATA.ui.kinds[ctx.kind] || DATA.ui.kinds.practice;
    const pct = progress == null ? (ctx.total ? ctx.i / ctx.total : 0) : progress;
    app().innerHTML = `<div class="play kind-${ctx.kind}">
      <header class="play-top">
        <button class="icon-btn" id="pl-close" aria-label="${esc(t("close"))}">✕</button>
        <div class="bar"><span style="width:${Math.round(pct * 100)}%"></span></div>
        <div class="score-chip">⭐ <b id="pl-score">${ctx.score}</b></div>
      </header>
      <div class="instr">
        <button class="icon-btn small" id="pl-instr" aria-label="${esc(t("listen"))}">💬</button>
        <div><div class="instr-kind">${esc(titleOf(ctx.unit))} · ${esc(kind[lang()])}</div>
        <div class="instr-text" id="pl-instr-text">${esc(DATA.ui.instructions[instrKey(ctx)][lang()])}</div></div>
      </div>
      <section class="play-body">${body}</section>
      ${Mascot.html()}
    </div>`;
    $("#pl-close").onclick = () => this.quit();
    $("#pl-instr").onclick = () => { Sfx.click(); Speech.instruction(ctx.instrNow || instrKey(ctx)); };
  },

  /* Dit la consigne la première fois, puis lance « then ». */
  async intro(ctx, then, key = null) {
    const my = ctx;
    if (ctx.first && Settings.get("autoplay")) {
      ctx.first = false;
      await Speech.instruction(key || instrKey(ctx));
      if (this.ctx !== my || ctx.over) return;
      await wait(200);
    }
    ctx.first = false;
    if (then && this.ctx === my && !ctx.over) then();
  },

  setScore(ctx) { const el = $("#pl-score"); if (el) el.textContent = ctx.score; },

  good(ctx, key, firstTry = true) {
    Sfx.correct();
    if (firstTry) { ctx.score++; if (key) ctx.fixed.push(key); }
    this.setScore(ctx);
    Mascot.say(Speech.feedback("good", false), "happy");
  },

  bad(ctx, key) {
    Sfx.wrong();
    if (key && !ctx.mistakes.includes(key)) ctx.mistakes.push(key);
    Mascot.say(Speech.feedback("bad", false), "sad");
  },

  async quit() {
    if (!this.ctx || this.ctx.over) return go(backFrom(this.ctx));
    if (this.ctx.score > 0 || (this.ctx.i || 0) > 0) {
      const ok = await confirmBox(t("quit_confirm"), { yes: t("quit"), no: t("stay") });
      if (!ok) return;
    }
    const ctx = this.ctx;
    ctx.over = true;
    Speech.stop();
    go(backFrom(ctx));
  },

  finish(ctx) {
    if (ctx.over) return;
    ctx.over = true;
    Speech.stop();
    const res = Store.record(ctx.actId, {
      score: ctx.score, total: ctx.total, duration: (Date.now() - ctx.start) / 1000,
      mistakes: ctx.mistakes, fixed: ctx.fixed, typed: ctx.typed,
    });
    Screens.result(ctx, res);
  },
};

function backFrom(ctx) {
  if (!ctx || ctx.actId === "review") return "#/home";
  return `#/unit/${ctx.unit.id}`;
}

function exerciseByKey(key) {
  const [lid, i] = key.split("#");
  const u = Index.units[lid];
  return u && u.unit.exercises[+i] ? { key, ex: u.unit.exercises[+i], unit: u.unit } : null;
}

/* ------------------------------------------------------------------------- */
/* La leçon : pages d'explication                                              */
/* ------------------------------------------------------------------------- */
function pageHtml(pg) {
  const title = tr(pg, "title");
  const table = pg.table && pg.table.length ? `<div class="tbl-wrap" dir="ltr"><table class="rule-table">
      <thead><tr>${pg.table[0].map(c => `<th dir="auto">${esc(c)}</th>`).join("")}</tr></thead>
      <tbody>${pg.table.slice(1).map(r => `<tr>${r.map(c => `<td dir="auto">${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>` : "";
  const examples = pg.examples.map((e, i) => `<li class="example">
      <button class="say-btn" data-en="${esc(e.en)}" aria-label="${esc(t("listen"))}">🔊</button>
      <div class="ex-text">${en(e.en, "ex-en")}<div class="ex-tr" dir="auto">${esc(e[lang()] || "")}</div></div>
      ${Recognition.available() ? `<button class="say-btn mic" data-mic="${esc(e.en)}" aria-label="${esc(t("repeat"))}">🎤</button>` : ""}
    </li>`).join("");
  return `<article class="lesson-page">
    ${title ? `<h2>${esc(title)}</h2>` : ""}
    <div class="explain" dir="auto">${paragraphs(pg[lang()] || pg.ar)}</div>
    ${pg.rule ? `<div class="rule" dir="ltr">${esc(pg.rule)}</div>` : ""}
    ${table}
    ${examples ? `<ul class="examples">${examples}</ul>` : ""}
    ${tr(pg, "tip") ? `<div class="tip">💡 ${marks(esc(tr(pg, "tip")))}</div>` : ""}
  </article>`;
}

const Engines = {};

Engines.lesson = ctx => {
  const pages = ctx.unit.pages;
  ctx.total = pages.length;
  ctx.i = 0;
  const show = () => {
    Play.frame(ctx, `${pageHtml(pages[ctx.i])}
      <div class="learn-nav">
        <button class="btn ghost" id="lp-prev" ${ctx.i === 0 ? "disabled" : ""}>${backArrow()} ${esc(t("previous"))}</button>
        <span class="page-n">${ctx.i + 1} / ${pages.length}</span>
        <button class="btn primary" id="lp-next">${ctx.i === pages.length - 1 ? `✔ ${esc(t("done"))}` : `${esc(t("next"))} ${fwdArrow()}`}</button>
      </div>`, { progress: ctx.i / pages.length });
    bindExamples($(".lesson-page"));
    $("#lp-prev").onclick = () => { Sfx.flip(); ctx.i--; show(); scrollTo(0, 0); };
    $("#lp-next").onclick = () => {
      Sfx.flip();
      ctx.score = Math.max(ctx.score, ctx.i + 1);
      if (ctx.i === pages.length - 1) return Play.finish(ctx);
      ctx.i++;
      show();
      scrollTo(0, 0);
    };
    Play.intro(ctx);
  };
  show();
};

function bindExamples(root) {
  $$("[data-en]", root).forEach(b => b.onclick = e => {
    e.stopPropagation();
    Sfx.click();
    b.classList.add("talking");
    sayEn(b.dataset.en).then(() => b.classList.remove("talking"));
  });
  $$("[data-mic]", root).forEach(b => b.onclick = e => { e.stopPropagation(); Recognition.check(b, b.dataset.mic); });
}

/* ------------------------------------------------------------------------- */
/* Les exercices                                                              */
/* ------------------------------------------------------------------------- */
Engines.practice = ctx => {
  const u = ctx.unit;
  const list = ctx.kind === "review" ? u.exercises.map((ex, i) => ({ ex, key: u.keys[i] }))
    : u.exercises.slice(ctx.act.from, ctx.act.to).map((ex, i) => ({ ex, key: `${u.id}#${ctx.act.from + i}` }));
  runExercises(ctx, list);
};
Engines.practice2 = Engines.practice;
Engines.review = Engines.practice;

function runExercises(ctx, list) {
  ctx.total = list.length;
  ctx.i = Math.min(Math.max(0, ctx.startAt || 0), list.length - 1);
  const next = () => {
    if (ctx.over) return;
    if (ctx.i >= list.length) return Play.finish(ctx);
    const { ex, key } = list[ctx.i];
    ctx.instrNow = ex.type;
    Exercise[ex.type](ctx, ex, key, ok => {
      if (ok) Play.good(ctx, key); else Play.bad(ctx, key);
      showFeedback(ctx, ex, ok, () => { ctx.i++; next(); });
    });
    $("#pl-instr-text").textContent = DATA.ui.instructions[ex.type][lang()];
    Play.intro(ctx, null, ex.type);
  };
  next();
}

/* Bandeau de correction : la bonne phrase (dite en anglais), la traduction, la raison. */
function showFeedback(ctx, ex, ok, onNext) {
  const right = ex.type === "truefalse" ? (ex.correct ? ex.sentence : ex.fix) : ex.say;
  const why = tr(ex, "why");
  const transl = ex[lang()] || "";
  const sheet = document.createElement("div");
  sheet.className = `feedback ${ok ? "ok" : "ko"}`;
  sheet.innerHTML = `<div class="fb-head">${ok ? "✔ " + esc(Speech.feedback("good", false)) : "✖ " + esc(t("correct_answer"))}</div>
    ${right ? `<div class="fb-sentence"><button class="say-btn" data-en="${esc(right)}">🔊</button>${en(right)}</div>` : ""}
    ${transl ? `<div class="fb-tr" dir="auto">${esc(transl)}</div>` : ""}
    ${why ? `<div class="fb-why">💡 ${marks(esc(why))}</div>` : ""}
    <button class="btn ${ok ? "primary" : "secondary"} big wide" id="fb-next">${esc(t("continue_btn"))} ${fwdArrow()}</button>`;
  $(".play-body").appendChild(sheet);
  bindExamples(sheet);
  requestAnimationFrame(() => sheet.classList.add("show"));
  if (right) sayEn(right);
  const go = () => { Speech.stop(); onNext(); };
  $("#fb-next").onclick = go;
  $("#fb-next").focus({ preventScroll: true });
  sheet.scrollIntoView({ behavior: "smooth", block: "end" });
}

const Exercise = {};

Exercise.choose = (ctx, ex, key, done) => {
  const order = shuffle(ex.options.map((o, i) => i));
  Play.frame(ctx, `<div class="prompt ex-prompt">${promptHtml(ex.prompt)}</div>
    <div class="options list n${ex.options.length}">${order.map(i => `<button class="opt" data-i="${i}">${en(ex.options[i])}</button>`).join("")}</div>`);
  let locked = false;
  $$(".opt").forEach(b => b.onclick = () => {
    if (locked) return;
    locked = true;
    const i = +b.dataset.i, ok = i === ex.answer;
    b.classList.add(ok ? "good" : "bad");
    if (!ok) $(`.opt[data-i="${ex.answer}"]`).classList.add("reveal");
    if (ex.prompt.includes(BLANK)) $(".ex-prompt .blank").outerHTML = `<span class="blank filled">${esc(ex.options[ex.answer])}</span>`;
    done(ok);
  });
};

Exercise.type = (ctx, ex, key, done) => {
  const input = `<input class="blank-input" id="ti" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" dir="ltr" lang="en" aria-label="${esc(t("your_answer"))}">`;
  Play.frame(ctx, `<div class="prompt ex-prompt">${promptHtml(ex.prompt, input)}
      ${ex.hint ? `<div class="hint-en" dir="ltr">${esc(ex.hint)}</div>` : ""}</div>
    <div class="row center"><button class="btn primary big" id="ti-ok">✔ ${esc(t("check"))}</button></div>`);
  const field = $("#ti");
  setTimeout(() => field.focus(), 100);
  const check = () => {
    if (!field.value.trim()) { field.classList.add("shake"); setTimeout(() => field.classList.remove("shake"), 400); return; }
    const ok = accepted(field.value, ex.answers);
    field.disabled = true;
    $("#ti-ok").remove();
    field.classList.add(ok ? "good" : "bad");
    if (!ok) field.insertAdjacentHTML("afterend", `<span class="blank filled">${esc(ex.answers[0])}</span>`);
    else ctx.typed++;
    done(ok);
  };
  $("#ti-ok").onclick = check;
  field.onkeydown = e => { if (e.key === "Enter") check(); };
};

Exercise.rewrite = (ctx, ex, key, done) => {
  Play.frame(ctx, `<div class="prompt ex-prompt"><div class="task">✏️ ${esc(lang() === "ar" ? ex.task_ar : ex.task_fr)}</div>
      ${en(ex.sentence, "q")}</div>
    <textarea class="big-input en-input" id="rw" rows="2" autocomplete="off" autocapitalize="sentences" spellcheck="false" dir="ltr" lang="en"></textarea>
    <div class="row center"><button class="btn primary big" id="rw-ok">✔ ${esc(t("check"))}</button></div>`);
  const field = $("#rw");
  setTimeout(() => field.focus(), 100);
  const check = () => {
    if (!field.value.trim()) return;
    const ok = accepted(field.value, ex.answers);
    field.disabled = true;
    field.classList.add(ok ? "good" : "bad");
    $("#rw-ok").remove();
    if (ok) ctx.typed++;
    done(ok);
  };
  $("#rw-ok").onclick = check;
  field.onkeydown = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); check(); } };
};

Exercise.truefalse = (ctx, ex, key, done) => {
  const yes = DATA.ui.feedback.true[0][lang()], no = DATA.ui.feedback.false[0][lang()];
  Play.frame(ctx, `<div class="prompt ex-prompt">${en(ex.sentence, "q")}
      <div class="prompt-audio"><button class="say-btn" data-en="${esc(ex.sentence)}">🔊</button></div></div>
    <div class="options row n2"><button class="opt tf" data-v="1"><span class="pic">✔️</span><b>${esc(yes)}</b></button>
      <button class="opt tf" data-v="0"><span class="pic">❌</span><b>${esc(no)}</b></button></div>`);
  bindExamples($(".ex-prompt"));
  let locked = false;
  $$(".opt").forEach(b => b.onclick = () => {
    if (locked) return;
    locked = true;
    const ok = (b.dataset.v === "1") === ex.correct;
    b.classList.add(ok ? "good" : "bad");
    if (!ok) $(`.opt[data-v="${ex.correct ? 1 : 0}"]`).classList.add("reveal");
    done(ok);
  });
};

/* Ranger les mots (aussi utilisé par l'écoute). */
function orderBoard(ctx, words, extra, header, done) {
  const pieces = shuffle([...words.map((w, i) => ({ w, i })), ...extra.map(w => ({ w, i: -1 }))]);
  if (pieces.length > 1 && pieces.every((p, j) => p.i === j)) pieces.reverse();
  Play.frame(ctx, `${header}
    <div class="answer-line en-line" id="ans" dir="ltr">${words.map(() => `<span class="slot"></span>`).join("")}</div>
    <div class="pieces en-pieces" dir="ltr">${pieces.map((p, j) => `<button class="piece" data-j="${j}">${esc(p.w)}</button>`).join("")}</div>
    <div class="row center"><button class="btn ghost" id="or-undo">↩ ${esc(t("undo"))}</button>
      <button class="btn primary big" id="or-ok" disabled>✔ ${esc(t("check"))}</button></div>`);
  const placed = [];
  const slots = $$("#ans .slot");
  const render = () => {
    slots.forEach((s, k) => { s.textContent = placed[k] != null ? pieces[placed[k]].w : ""; s.classList.toggle("filled", placed[k] != null); });
    $$(".piece").forEach(b => b.classList.toggle("used", placed.includes(+b.dataset.j)));
    $("#or-ok").disabled = placed.length !== words.length;
  };
  $$(".piece").forEach(b => b.onclick = () => {
    if (placed.includes(+b.dataset.j) || placed.length >= words.length) return;
    Sfx.click();
    placed.push(+b.dataset.j);
    render();
  });
  slots.forEach((s, k) => s.onclick = () => { if (placed[k] != null) { placed.splice(k); render(); } });
  $("#or-undo").onclick = () => { placed.pop(); render(); };
  $("#or-ok").onclick = () => {
    const built = placed.map(j => pieces[j].w).join(" ");
    const ok = normalizeAnswer(built) === normalizeAnswer(words.join(" "));
    $("#or-ok").remove();
    $("#or-undo").remove();
    $$(".piece").forEach(b => b.disabled = true);
    $("#ans").classList.add(ok ? "good" : "bad");
    done(ok);
  };
}

Exercise.order = (ctx, ex, key, done) => {
  const transl = ex[lang()];
  orderBoard(ctx, ex.words, ex.extra || [], transl ? `<div class="prompt ex-prompt"><div class="fb-tr" dir="auto">${esc(transl)}</div></div>` : "", done);
};

Exercise.match = (ctx, ex, key, done) => {
  const left = shuffle(ex.pairs.map((p, i) => ({ t: p[0], i })));
  const right = shuffle(ex.pairs.map((p, i) => ({ t: p[1], i })));
  const title = lang() === "ar" ? ex.title_ar : ex.title_fr;
  Play.frame(ctx, `${title ? `<div class="prompt ex-prompt"><div class="task">${esc(title)}</div></div>` : ""}
    <div class="match" dir="ltr">
      <div class="col">${left.map(x => `<button class="m-item" data-side="l" data-i="${x.i}">${en(x.t)}</button>`).join("")}</div>
      <div class="col">${right.map(x => `<button class="m-item" data-side="r" data-i="${x.i}"><span dir="auto">${esc(x.t)}</span></button>`).join("")}</div>
    </div>`);
  let sel = null, errors = 0, found = 0;
  $$(".m-item").forEach(b => b.onclick = () => {
    if (b.classList.contains("ok")) return;
    if (b.dataset.side === "l") {
      $$('.m-item[data-side="l"]').forEach(x => x.classList.toggle("sel", x === b));
      sel = b;
      Sfx.click();
      sayEn(ex.pairs[+b.dataset.i][0]);
      return;
    }
    if (!sel) { b.classList.add("shake"); setTimeout(() => b.classList.remove("shake"), 400); return; }
    if (sel.dataset.i === b.dataset.i) {
      sel.classList.remove("sel");
      sel.classList.add("ok"); b.classList.add("ok");
      Sfx.correct();
      sel = null;
      if (++found === ex.pairs.length) setTimeout(() => done(errors === 0), 400);
    } else {
      errors++;
      Sfx.wrong();
      b.classList.add("shake");
      setTimeout(() => b.classList.remove("shake"), 400);
    }
  });
};

/* ------------------------------------------------------------------------- */
/* L'écoute : entendre un exemple, le reconnaître ou remettre ses mots en ordre */
/* ------------------------------------------------------------------------- */
Engines.listen = ctx => {
  const sentences = [...new Set(ctx.unit.pages.flatMap(p => p.examples.map(e => e.en)))];
  const rounds = sample(sentences, Math.min(6, sentences.length)).map((s, i) => ({ s, mode: i % 2 ? "order" : "choose" }));
  ctx.total = rounds.length;
  ctx.i = 0;
  const next = () => {
    if (ctx.over) return;
    if (ctx.i >= rounds.length) return Play.finish(ctx);
    const r = rounds[ctx.i];
    const header = `<div class="prompt"><div class="big-speaker">🎧</div>
      <div class="prompt-audio"><button class="speak-btn" id="ls-say">🔊</button><button class="speak-btn slow" id="ls-slow">🐢</button></div></div>`;
    const finish = ok => {
      if (ok) Play.good(ctx, null); else Play.bad(ctx, null);
      showFeedback(ctx, { type: "listen", say: r.s }, ok, () => { ctx.i++; next(); });
    };
    if (r.mode === "order" && r.s.split(" ").length <= 12) {
      ctx.instrNow = "listen_order";
      orderBoard(ctx, r.s.split(" "), [], header, finish);
    } else {
      ctx.instrNow = "listen";
      const others = sample(sentences.filter(x => x !== r.s), 2);
      const opts = shuffle([r.s, ...others]);
      Play.frame(ctx, `${header}<div class="options list">${opts.map((o, i) => `<button class="opt" data-i="${i}">${en(o)}</button>`).join("")}</div>`);
      let locked = false;
      $$(".opt").forEach(b => b.onclick = () => {
        if (locked) return;
        locked = true;
        const ok = opts[+b.dataset.i] === r.s;
        b.classList.add(ok ? "good" : "bad");
        if (!ok) $$(".opt").find(x => opts[+x.dataset.i] === r.s).classList.add("reveal");
        finish(ok);
      });
    }
    $("#pl-instr-text").textContent = DATA.ui.instructions[ctx.instrNow][lang()];
    $("#ls-say").onclick = () => { Sfx.click(); sayEn(r.s); };
    $("#ls-slow").onclick = () => { Sfx.click(); sayEn(r.s, true); };
    Play.intro(ctx, () => sayEn(r.s), ctx.instrNow);
  };
  next();
};

/* ------------------------------------------------------------------------- */
/* Répéter à voix haute (reconnaissance vocale du téléphone ou du navigateur)   */
/* ------------------------------------------------------------------------- */
const Recognition = {
  available() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); },
  check(btn, sentence) {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) return;
    Speech.stop();
    const rec = new Rec();
    rec.lang = "en-US";
    rec.maxAlternatives = 5;
    rec.interimResults = false;
    btn.classList.add("on");
    toast(t("mic_listening"), 4000);
    rec.onresult = e => {
      btn.classList.remove("on");
      const alts = Array.from(e.results[0] || []).map(x => x.transcript);
      const want = normalizeAnswer(sentence).replace(/[^a-z' ]/g, "");
      const best = Math.max(...alts.map(a => similarity(normalizeAnswer(a).replace(/[^a-z' ]/g, ""), want)));
      if (best >= 0.8) { Sfx.correct(); toast("✔ " + Speech.feedback("good", false)); }
      else { Sfx.wrong(); toast(`${t("mic_heard")} « ${alts[0] || "…"} »`, 4000); }
    };
    rec.onerror = e => { btn.classList.remove("on"); toast(e.error === "not-allowed" ? t("mic_denied") : t("mic_nothing")); };
    rec.onend = () => btn.classList.remove("on");
    try { rec.start(); } catch (err) { btn.classList.remove("on"); }
  },
};

/* Proportion de mots retrouvés (ordre compris), pour juger une phrase répétée. */
function similarity(a, b) {
  const x = a.split(" "), y = b.split(" ");
  const dp = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
  for (let i = 1; i <= x.length; i++) for (let j = 1; j <= y.length; j++)
    dp[i][j] = x[i - 1] === y[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[x.length][y.length] / Math.max(x.length, y.length, 1);
}

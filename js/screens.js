/* Les écrans : bienvenue, apprenants, accueil, niveaux, leçons, résultats, badges, espace accompagnant. */

const Screens = {};

const KIND_ICONS = { lesson: "📖", practice: "✏️", practice2: "📝", listen: "🎧", review: "🔁" };

function fwdArrow() { return lang() === "ar" ? "⬅" : "➜"; }
function backArrow() { return lang() === "ar" ? "➜" : "⬅"; }
function titleOf(x) { return x.title[lang()] || x.title.en; }
function kindName(a) { return (DATA.ui.kinds[a.kind] || DATA.ui.kinds.practice)[lang()]; }

function sayBtn(text, l = lang(), cls = "") {
  return `<button class="say-btn ${cls}" data-say="${esc(text)}" data-lang="${l}" aria-label="${esc(t("listen"))}">🔊</button>`;
}
function bindSay(root = document) {
  $$("[data-say]", root).forEach(b => b.onclick = e => {
    e.preventDefault();
    e.stopPropagation();
    Sfx.click();
    Speech.say(b.dataset.say, { lang: b.dataset.lang || lang() });
  });
}

function header({ back = null, title = "", say = null } = {}) {
  return `<header class="screen-head">
    ${back ? `<a class="icon-btn" href="${back}" aria-label="${esc(t("back"))}">${backArrow()}</a>` : ""}
    <h1>${title}</h1>${say ? sayBtn(say) : ""}
  </header>`;
}

/* ------------------------------------------------------------------ Bienvenue */
Screens.welcome = () => {
  app().innerHTML = `<div class="welcome">
    <div class="logo-big">${logoSvg()}</div>
    <h1 class="brand" dir="ltr">English Steps</h1>
    <p class="brand-ar">إنجليزي خطوة بخطوة</p>
    <p class="tagline">${esc(t("tagline"))}</p>
    <div class="lang-pick">
      ${[["ar", "🇲🇦", "العربية"], ["fr", "🇫🇷", "Français"]].map(([k, f, n]) =>
        `<button class="lang-btn" data-l="${k}"><span class="flag">${f}</span><span>${n}</span></button>`).join("")}
    </div>
    <p class="muted small">${esc(t("pick_lang"))}</p>
  </div>`;
  $$(".lang-btn").forEach(b => b.onclick = () => {
    Sfx.click();
    setLang(b.dataset.l);
    Speech.sayT(DATA.ui.feedback.welcome[0]);
    go(Cloud.signedIn() ? "#/new" : "#/account/signup");
  });
};

/* ------------------------------------------------------------------ Apprenant */
Screens.newLearner = (edit = null) => {
  const l = edit ? Store.learner(edit) : null;
  let avatar = l ? l.avatar : AVATARS[0];
  const first = !Store.learners().length;
  app().innerHTML = `<div class="page">
    ${header({ back: first ? "#/welcome" : (edit ? "#/helper/learners" : "#/profiles"), title: esc(t(edit ? "edit_learner" : "new_learner")) })}
    <section class="card form">
      <label class="field"><span>${esc(t("learner_name"))}</span>
        <input id="ln-name" maxlength="30" autocomplete="off" value="${esc(l ? l.name : "")}" placeholder="${esc(t("learner_name_ph"))}"></label>
      <div class="field"><span>${esc(t("avatar"))}</span>
        <div class="avatars">${AVATARS.map(a => `<button class="av ${a === avatar ? "on" : ""}" data-a="${a}">${a}</button>`).join("")}</div></div>
      <button class="btn primary big wide" id="ln-ok">✔ ${esc(t(edit ? "save" : "start"))}</button>
      ${first ? `<p class="muted small center-text">☁️ ${esc(t("saved_in_account"))}</p>` : ""}
    </section>
  </div>`;
  $$(".av").forEach(b => b.onclick = () => { avatar = b.dataset.a; $$(".av").forEach(x => x.classList.toggle("on", x === b)); Sfx.click(); });
  $("#ln-ok").onclick = () => {
    const name = $("#ln-name").value.trim() || avatar;
    if (edit) { Store.updateLearner(edit, { name, avatar }); return go("#/helper/learners"); }
    const nl = Store.addLearner({ name, avatar });
    Store.select(nl.id);
    Sfx.win();
    go("#/home");
  };
};

Screens.profiles = () => {
  app().innerHTML = `<div class="page">
    <div class="profiles-head"><div class="logo-small">${logoSvg()}</div><h1>${esc(t("who_now"))}</h1></div>
    <div class="profiles">
      ${Store.learners().map(l => `<button class="profile" data-id="${l.id}" style="--c:${l.color}">
        <span class="p-av">${esc(l.avatar)}</span><span class="p-name">${esc(l.name)}</span>
        <span class="p-xp">⭐ ${Store.totalStars(l)}</span></button>`).join("")}
      <button class="profile add" id="pf-add"><span class="p-av">➕</span><span class="p-name">${esc(t("add_learner"))}</span></button>
    </div>
    <div class="row center"><a class="btn ghost" href="#/helper">👥 ${esc(t("helper"))}</a></div>
  </div>`;
  $$(".profile[data-id]").forEach(b => b.onclick = () => { Sfx.click(); Store.select(b.dataset.id); go("#/home"); });
  $("#pf-add").onclick = () => go("#/new");
};

/* ------------------------------------------------------------------ Accueil */
function nextActivity(l) {
  for (const lv of DATA.levels) for (const u of lv.units) for (const a of u.acts) if (!Store.actStars(l, a.id)) return { lv, u, a };
  return null;
}

Screens.home = () => {
  const l = Store.current();
  if (!l) return go("#/profiles");
  const rank = Store.rank(l);
  const streak = Store.streak(l);
  const next = nextActivity(l);
  const mistakes = Store.mistakeKeys(l, 12).length;
  const prog = rank.next ? Math.round((l.xp - rank.from) / (rank.next - rank.from) * 100) : 100;
  app().innerHTML = `<div class="page home">
    <header class="home-head">
      <a class="who" href="#/profiles" style="--c:${l.color}"><span class="w-av">${esc(l.avatar)}</span><b>${esc(l.name)}</b></a>
      <nav class="tools">
        <a class="icon-btn" href="#/badges" aria-label="${esc(t("badges"))}">🏅</a>
        <button class="icon-btn" id="hm-lang" aria-label="${esc(t("language"))}">${langLabel()}</button>
        <a class="icon-btn" href="#/helper" aria-label="${esc(t("helper"))}">👥</a>
      </nav>
      <div class="chips"><span class="chip">⭐ ${Store.totalStars(l)}</span><span class="chip">💎 ${l.xp}</span>
        <span class="chip fire ${streak ? "" : "off"}">🔥 ${streak}</span></div>
    </header>
    <section class="hero card">
      <div class="hero-mascot">🦊</div>
      <div class="hero-text"><h2>${esc(t("hello", { n: l.name }))}</h2>
        <div class="rank">${rank.emoji} ${esc(t(rank.key))} · ${l.xp} XP</div>
        <div class="bar"><span style="width:${prog}%"></span></div>
        ${rank.next ? `<small class="muted">${esc(t("to_next_rank", { n: rank.next - l.xp }))}</small>` : ""}</div>
    </section>
    ${next ? `<button class="continue card" id="hm-next" style="--c:${next.lv.color}">
        <span class="c-play">▶</span>
        <span class="c-text"><b>${esc(t("continue"))}</b><small>${en(next.u.title.en)} · ${esc(kindName(next.a))}</small></span>
        <span class="c-icon">${next.u.emoji}</span></button>` : ""}
    ${mistakes >= 3 ? `<a class="review card" href="#/play/review"><span>🔁</span><b>${esc(t("review"))}</b>
        <small>${esc(t("review_sub", { n: mistakes }))}</small></a>` : ""}
    <h2 class="section-title">${esc(t("levels"))}</h2>
    <div class="levels">
      ${DATA.levels.map(lv => {
        const { got, max } = Store.levelStars(l, lv);
        const done = Store.lessonsDone(l, lv);
        return `<a class="level card" href="#/level/${lv.id}" style="--c:${lv.color}">
          <span class="lv-emoji">${lv.emoji}</span>
          <span class="lv-text"><small dir="ltr">${esc(lv.title.en)}</small><b>${esc(titleOf(lv))}</b>
            <span class="muted">${esc(lv.desc[lang()])}</span>
            <span class="bar"><span style="width:${max ? Math.round(got / max * 100) : 0}%"></span></span></span>
          <span class="lv-side">${sayBtn(lv.title[lang()])}<span class="lv-stars">📖 ${done}/${lv.units.length}</span></span>
        </a>`;
      }).join("")}
    </div>
  </div>`;
  bindSay();
  $("#hm-lang").onclick = cycleLang;
  if ($("#hm-next")) $("#hm-next").onclick = () => { Sfx.click(); go(`#/play/${next.a.id}`); };
  if (!Screens.greeted && Settings.get("autoplay")) { Screens.greeted = true; Speech.sayT(DATA.ui.feedback.welcome[0]); }
};

/* ------------------------------------------------------------------ Un niveau : la liste des leçons */
Screens.level = id => {
  const l = Store.current();
  const info = Index.levels[id];
  if (!l || !info) return go("#/home");
  const lv = info.level;
  app().innerHTML = `<div class="page" style="--c:${lv.color}">
    ${header({ back: "#/home", title: `${lv.emoji} ${esc(titleOf(lv))}`, say: lv.title[lang()] })}
    <div class="lessons">
      ${lv.units.map((u, i) => {
        const got = Store.unitStars(l, u), max = u.acts.length * 3;
        return `<a class="lesson-card card ${got === max ? "full" : ""}" href="#/unit/${u.id}">
          <span class="ls-num">${i + 1}</span><span class="ls-emoji">${u.emoji}</span>
          <span class="ls-text">${en(u.title.en, "ls-en")}<span class="ls-tr">${esc(u.title[lang()])}</span>
            <span class="bar"><span style="width:${Math.round(got / max * 100)}%"></span></span></span>
          <span class="ls-stars">⭐ ${got}/${max}</span></a>`;
      }).join("")}
    </div>
  </div>`;
};

/* ------------------------------------------------------------------ Une leçon */
Screens.unit = id => {
  const l = Store.current();
  const info = Index.units[id];
  if (!l || !info) return go("#/home");
  const { unit, level } = info;
  const nextAct = unit.acts.find(a => Store.actStars(l, a.id) < 3) || unit.acts[0];
  app().innerHTML = `<div class="page" style="--c:${level.color}">
    ${header({ back: `#/level/${level.id}`, title: `${unit.emoji} ${en(unit.title.en)}` })}
    <section class="card unit-intro"><h2>${esc(unit.title[lang()])} ${sayBtn(unit.say[lang()])}</h2>
      <p>${esc(unit.summary[lang()] || "")}</p></section>
    <button class="btn primary big wide start-btn" id="un-go">▶ ${esc(t("start"))} — ${KIND_ICONS[nextAct.kind]} ${esc(kindName(nextAct))}</button>
    <div class="acts">
      ${unit.acts.map((a, i) => `<a class="act card" href="#/play/${a.id}">
        <span class="a-num">${i + 1}</span><span class="a-icon">${KIND_ICONS[a.kind]}</span>
        <b>${esc(kindName(a))}</b>${a.from != null ? `<small class="muted">${a.to - a.from} ${esc(t("questions_n"))}</small>` : ""}
        ${starsHtml(Store.actStars(l, a.id))}</a>`).join("")}
    </div>
  </div>`;
  bindSay();
  $("#un-go").onclick = () => go(`#/play/${nextAct.id}`);
};

/* ------------------------------------------------------------------ Résultat */
Screens.result = (ctx, res) => {
  if (!res) return go("#/home");
  const info = Index.acts[ctx.actId];
  let nextId = null;
  if (info) {
    const acts = info.unit.acts;
    const i = acts.findIndex(a => a.id === ctx.actId);
    if (i < acts.length - 1) nextId = acts[i + 1].id;
    else {
      const units = info.level.units;
      const ui = units.findIndex(u => u.id === info.unit.id);
      if (ui < units.length - 1) nextId = units[ui + 1].acts[0].id;
    }
  }
  const msg = Speech.feedback("stars" + res.stars, false);
  app().innerHTML = `<div class="page result">
    <div class="res-stars">${[0, 1, 2].map(i => `<span class="rs ${i < res.stars ? "on" : ""}" style="animation-delay:${0.25 + i * 0.35}s">★</span>`).join("")}</div>
    <h1>${esc(msg)}</h1>
    <p class="res-score">${esc(t("score_of", { a: ctx.score, b: ctx.total }))}</p>
    <p class="res-xp">+${res.xp} XP 💎</p>
    ${res.badges.length ? `<div class="res-badges">${res.badges.map(b => `<div class="badge on"><span>${b.emoji}</span><small>${esc(t(b.key))}</small></div>`).join("")}</div>` : ""}
    <div class="row center wrap">
      <a class="btn ghost" href="${backFrom(ctx)}">${backArrow()} ${esc(t("back"))}</a>
      <button class="btn secondary" id="rs-again">🔁 ${esc(t("again"))}</button>
      ${nextId ? `<a class="btn primary big" href="#/play/${nextId}">${esc(t("next"))} ${fwdArrow()}</a>` : ""}
    </div>
  </div>`;
  $("#rs-again").onclick = () => Play.start(ctx.actId);
  [0, 1, 2].forEach(i => { if (i < res.stars) setTimeout(() => Sfx.star(i), 250 + i * 350); });
  if (res.stars >= 2) setTimeout(() => Confetti.burst(res.stars === 3 ? 150 : 70), 900);
  (async () => {
    await wait(300);
    await Speech.sayT(DATA.ui.feedback["stars" + res.stars][0]);
    if (res.badges.length) { Sfx.unlock(); await Speech.sayT(DATA.ui.feedback.badge[0]); }
  })();
};

Screens.badges = () => {
  const l = Store.current();
  if (!l) return go("#/home");
  app().innerHTML = `<div class="page">
    ${header({ back: "#/home", title: `🏅 ${esc(t("badges"))}` })}
    <p class="muted center-text">${esc(t("badges_count", { a: Object.keys(l.badges).length, b: BADGES.length }))}</p>
    <div class="badges">${BADGES.map(b => `<div class="badge ${l.badges[b.id] ? "on" : ""}"><span>${b.emoji}</span>
      <small>${esc(t(b.key))}</small></div>`).join("")}</div>
  </div>`;
};

/* ------------------------------------------------------------------ Espace accompagnant */
let helperUntil = 0;

Screens.helper = tab => {
  if (Date.now() > helperUntil) return helperGate(tab);
  tab = tab || "learners";
  const tabs = [["learners", "👥"], ["settings", "⚙️"], ["account", "☁️"], ["about", "ℹ️"]];
  app().innerHTML = `<div class="page helper">
    ${header({ back: Store.current() ? "#/home" : "#/profiles", title: `👥 ${esc(t("helper"))}` })}
    <nav class="tabs">${tabs.map(([k, e]) => `<a class="${k === tab ? "on" : ""}" href="#/helper/${k}">${e} ${esc(t("tab_" + k))}</a>`).join("")}</nav>
    <section id="hp-body"></section>
  </div>`;
  HelperTabs[tab]($("#hp-body"));
};

function helperGate(tab) {
  const a = 3 + Math.floor(Math.random() * 6), b = 2 + Math.floor(Math.random() * 7);
  const good = a * b;
  const opts = shuffle([good, good + a, good - b, good + 1 + Math.floor(Math.random() * 5)].filter((v, i, s) => s.indexOf(v) === i));
  app().innerHTML = `<div class="page">
    ${header({ back: Store.current() ? "#/home" : "#/profiles", title: `👥 ${esc(t("helper"))}` })}
    <section class="card center-text gate">
      <p>${esc(t("gate_text"))}</p>
      <div class="gate-q" dir="ltr">${a} × ${b} = ?</div>
      <div class="options row">${opts.map(v => `<button class="opt" data-v="${v}">${ltr(String(v), "digits")}</button>`).join("")}</div>
    </section>
  </div>`;
  $$(".gate .opt").forEach(o => o.onclick = () => {
    if (+o.dataset.v === good) { helperUntil = Date.now() + 10 * 60 * 1000; Screens.helper(tab); }
    else { Sfx.wrong(); go(Store.current() ? "#/home" : "#/profiles"); }
  });
}

const HelperTabs = {};

HelperTabs.learners = el => {
  el.innerHTML = `${Store.learners().map(l => {
    const minutes = Math.round(l.log.reduce((n, x) => n + (x.d || 0), 0) / 60);
    const hard = Store.mistakeKeys(l, 6).map(k => exerciseByKey(k)).filter(Boolean)
      .map(x => `${x.unit.title.en}`).filter((v, i, s) => s.indexOf(v) === i);
    return `<div class="card learner-report" style="--c:${l.color}">
      <div class="lr-head"><span class="w-av">${esc(l.avatar)}</span><div><b>${esc(l.name)}</b>
        <small class="muted">${l.owner ? "☁️ " + esc(t("synced")) : "📱 " + esc(t("this_device"))}</small></div></div>
      <div class="lr-stats"><span>⭐ ${Store.totalStars(l)}</span><span>💎 ${l.xp}</span><span>🔥 ${Store.streak(l)}</span>
        <span>🎮 ${l.log.length}</span><span>⏱️ ${minutes} ${esc(t("minutes"))}</span><span>⌨️ ${l.typed || 0}</span></div>
      <div class="lr-levels">${DATA.levels.map(lv => {
        const { got, max } = Store.levelStars(l, lv);
        return `<div class="lr-level"><span>${lv.emoji} ${esc(titleOf(lv))} · 📖 ${Store.lessonsDone(l, lv)}/${lv.units.length}</span>
          <span class="bar"><span style="width:${max ? Math.round(got / max * 100) : 0}%;background:${lv.color}"></span></span><small>${got}/${max}</small></div>`;
      }).join("")}</div>
      ${hard.length ? `<p class="lr-hard"><b>${esc(t("hard_items"))}</b> ${hard.map(h => en(h)).join(" · ")}</p>` : ""}
      <div class="row wrap">
        <a class="btn small ghost" href="#/edit/${l.id}">✏️ ${esc(t("edit"))}</a>
        <button class="btn small ghost" data-reset="${l.id}">♻️ ${esc(t("reset_progress"))}</button>
        <button class="btn small danger" data-del="${l.id}">🗑️ ${esc(t("delete_learner"))}</button>
      </div></div>`;
  }).join("")}
  <div class="row center"><a class="btn primary" href="#/new">➕ ${esc(t("add_learner"))}</a></div>`;
  $$("[data-del]", el).forEach(b => b.onclick = async () => {
    const l = Store.learner(b.dataset.del);
    if (await confirmBox(t("delete_learner_confirm", { n: l.name }))) { Store.removeLearner(l.id); Screens.helper("learners"); }
  });
  $$("[data-reset]", el).forEach(b => b.onclick = async () => {
    const l = Store.learner(b.dataset.reset);
    if (await confirmBox(t("reset_confirm", { n: l.name }))) { Store.resetLearner(l.id); Screens.helper("learners"); }
  });
};

HelperTabs.settings = el => {
  const check = (k, label) => `<label class="switch"><input type="checkbox" data-set="${k}" ${Settings.get(k) ? "checked" : ""}>
    <span>${esc(t(label))}</span></label>`;
  el.innerHTML = `<div class="card form">
    <div class="field"><span>${esc(t("language"))}</span><div class="seg" id="st-lang">
      ${[["ar", "العربية"], ["fr", "Français"]].map(([k, n]) => `<button data-l="${k}" class="${lang() === k ? "on" : ""}">${n}</button>`).join("")}</div></div>
    ${check("autoplay", "set_autoplay")}
    ${check("sfx", "set_sfx")}
    <label class="field"><span>${esc(t("set_rate"))} <b id="st-rate-v">${Settings.get("rate").toFixed(2)}×</b></span>
      <input type="range" id="st-rate" min="0.7" max="1.2" step="0.05" value="${Settings.get("rate")}"></label>
    <button class="btn secondary" id="st-test">🔊 ${esc(t("test_voice"))}</button>
  </div>`;
  $$("#st-lang button", el).forEach(b => b.onclick = () => { setLang(b.dataset.l); Screens.helper("settings"); });
  $$("[data-set]", el).forEach(i => i.onchange = () => Settings.set(i.dataset.set, i.checked));
  $("#st-rate").oninput = e => { Settings.set("rate", +e.target.value); $("#st-rate-v").textContent = (+e.target.value).toFixed(2) + "×"; };
  $("#st-test").onclick = () => Speech.say("I always drink tea in the morning.", { lang: "en" });
};

HelperTabs.account = el => {
  if (!Cloud.client) { el.innerHTML = `<div class="card"><p>${esc(t("cloud_unavailable"))}</p></div>`; return; }
  // Le compte est obligatoire : ici on est toujours connecté (parfois sans Internet pour l'instant).
  if (!Cloud.session) Cloud.status = "offline";
  const st = { ok: "✅ " + t("sync_ok"), syncing: "⏳ " + t("sync_running"), offline: "📴 " + t("sync_offline"),
               error: "⚠️ " + t("sync_error"), local: "" }[Cloud.status] || "";
  el.innerHTML = `<div class="card">
    <h2>☁️ ${esc(t("account_title"))}</h2>
    <p>${esc(t("signed_in_as"))} <b dir="ltr">${esc(Cloud.email())}</b></p>
    <p id="ac-status">${esc(st)}</p>
    <ul class="perks"><li>${esc(t("perk_backup"))}</li><li>${esc(t("perk_devices"))}</li><li>${esc(t("perk_shared"))}</li></ul>
    <div class="row wrap"><button class="btn secondary" id="ac-sync" ${Cloud.session ? "" : "disabled"}>🔄 ${esc(t("sync_now"))}</button>
      <button class="btn ghost" id="ac-out">🚪 ${esc(t("sign_out"))}</button></div>
  </div>
  <div class="card danger-zone">
    <h3>${esc(t("delete_account"))}</h3><p class="small">${esc(t("delete_account_text"))}</p>
    <button class="btn danger" id="ac-del">🗑️ ${esc(t("delete_account"))}</button>
  </div>`;
  window.onSyncChange = () => { if ($("#ac-status")) HelperTabs.account(el); };
  $("#ac-sync").onclick = () => { Cloud.sync(); HelperTabs.account(el); };
  $("#ac-out").onclick = async () => {
    if (!await confirmBox(t("sign_out_confirm"), { danger: false })) return;
    await Cloud.signOut();
    toast(t("signed_out"));
    route();
  };
  $("#ac-del").onclick = async () => {
    if (!await confirmBox(t("delete_account_confirm"))) return;
    if (!await confirmBox(t("delete_account_confirm2"), { yes: t("delete_forever") })) return;
    try { await Cloud.deleteAccount(); toast(t("account_deleted"), 4000); route(); } catch (e) { toast(t("err_generic"), 4000); }
  };
};

HelperTabs.about = el => {
  const version = window.AppNative && AppNative.version ? AppNative.version() : APP_VERSION;
  el.innerHTML = `<div class="card about">
    <div class="logo-small">${logoSvg()}</div>
    <h2 dir="ltr">English Steps</h2>
    <p>${esc(t("about_text"))}</p>
    <p class="muted small">${esc(t("version"))} ${esc(version)} · SYNTRIX FIKRA</p>
    <ul class="links">
      <li><a href="privacy.html#${lang()}" target="_blank" rel="noopener">🔒 ${esc(t("privacy"))}</a></li>
      <li><a href="delete-account.html#${lang()}" target="_blank" rel="noopener">🗑️ ${esc(t("delete_page"))}</a></li>
      <li><a href="mailto:syntrix.fikra@gmail.com">✉️ syntrix.fikra@gmail.com</a></li>
    </ul>
    ${window.AppNative && AppNative.share ? `<button class="btn secondary" id="ab-share">📤 ${esc(t("share_app"))}</button>` : ""}
    <p class="muted small">${esc(t("credits"))}</p>
  </div>`;
  if ($("#ab-share")) $("#ab-share").onclick = () => AppNative.share(`${t("share_text")} ${CLOUD.site}`);
};

/* Logo : « Aa » et trois marches sur une tuile bleue. */
function logoSvg() {
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#0369a1"/></linearGradient></defs>
    <rect x="4" y="4" width="92" height="92" rx="26" fill="url(#lg)"/>
    <path d="M20 80h20v-10h20v-10h20v20z" fill="#fdba74"/>
    <text x="50" y="52" text-anchor="middle" font-size="40" font-family="'Baloo Bhaijaan 2', sans-serif" font-weight="800" fill="#fff">Aa</text></svg>`;
}

/* PIXELMOSS — games/core.js: shared arcade runtime for /pixelmoss/play.
   Canvas 320x240 (integer scale, pixelated), rAF loop, pause on hidden tab, keyboard + touch,
   Sound (pixelmoss audio/), best score in localStorage pm:score:<id>, TOP 10 board + seed,
   SAVE_SCORE.EXE modal, SOUND / TUTORIAL / INVERT toggles, reduced motion. Games load lazily via ?g=. */
(() => {
  const K = window.CORE, A = window.ART;
  const root = document.documentElement, base = root.dataset.base || "";
  const scr = document.getElementById("play-screen");
  if (!K || !scr || window.PMG) return;
  const { $, $$, store, Sound } = K;
  const W = 320, H = 240;
  const C = { ink: "#0a0a0a", pap: "#f3f3ef", g1: "#6b6b6b", g2: "#2e2e2e", g3: "#b5b5b5", g4: "#161616" };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GAMES = [["dash", "Moss Dash", 1], ["bloom", "Brick Bloom", 0.35], ["trail", "Snail Trail", 0.02], ["stack", "Stack Drop", 0.008], ["pairs", "Pixel Pairs", 0.12]];
  const READY = ["dash", "bloom"];
  const TUT = {
    dash: ["Space to jump", "S to switch mode", "D or C for power"],
    bloom: ["← → to move", "Catch the ball", "Combos grow more moss"],
    trail: ["Arrows or swipe to turn", "Eat leaves to grow", "Don't touch your shell"],
    stack: ["Space or tap to drop", "Line it up for a Perfect", "Overhang gets cut off"],
    pairs: ["Flip two cards", "Match them all", "Beat the 60-second clock"],
  };
  const SEED = [["mossbyte", 12880], ["aino.dev", 6120], ["ALT", 4650], ["ferrytale", 3110], ["Juno", 2875], ["salmiakki", 1960], ["Eero", 1720], ["glitchfox", 1405], ["Zed", 990], ["ilo", 512]];
  const esc = (s) => String(s).replace(/[<>&"]/g, "");
  const info = (id) => GAMES.find((g) => g[0] === id);

  /* ---------- DOM ---------- */
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H; cv.tabIndex = 0;
  cv.className = "pm-play-canvas"; cv.setAttribute("role", "img");
  const ctx = cv.getContext("2d"); ctx.imageSmoothingEnabled = false;
  const msg = document.createElement("div"); msg.className = "pm-play-msg";
  msg.innerHTML = '<p class="pm-play-msg-t"></p><p class="pm-play-msg-s"></p><div class="pm-play-msg-a"></div>';
  const tipEl = document.createElement("div"); tipEl.className = "pm-play-tip"; tipEl.hidden = true;
  scr.append(cv, msg, tipEl);
  const el = { title: $("#play-title"), touch: $("#play-touch"), tut: $("#play-tut"), list: $("#board-list"), btitle: $("#board-title"), score: $("#hud-score"), best: $("#hud-best"), extra: $("#hud-extra") };

  function fit() {
    const w = scr.clientWidth - 2 * (parseFloat(getComputedStyle(scr).paddingLeft) || 0);
    const s = Math.floor(Math.min(w / W, (innerHeight * 0.66) / H));
    const cw = s >= 1 ? W * s : Math.max(160, w);
    cv.style.width = cw + "px"; cv.style.height = Math.round((cw * H) / W) + "px";
  }
  new ResizeObserver(fit).observe(scr); addEventListener("resize", fit); fit();

  /* ---------- drawing helpers for games ---------- */
  const rect = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const text = (s, x, y, size = 8, align = "center", col = C.pap) => { ctx.font = size + "px Pixel, monospace"; ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillStyle = col; ctx.fillText(s, Math.round(x), Math.round(y)); };
  function sprite(grid, pal, u = 1) {
    const h = grid.length, w = Math.max(...grid.map((r) => r.length));
    const c = document.createElement("canvas"); c.width = w * u; c.height = h * u; const x = c.getContext("2d");
    grid.forEach((row, y) => [...row].forEach((ch, i) => { if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i * u, y * u, u, u); } }));
    return c;
  }

  /* ---------- state ---------- */
  let cur = null, game = null, state = "idle", raf = 0, prev = 0, t = 0, tipT = 0;
  let tutorial = store.get("tutorial", true), invert = store.get("invert", false);
  const api = { W, H, C, ctx, rect, text, sprite, reduce, A, sfx: (n, v) => Sound.play(n, v), over: () => gameOver(), tip: (s, ms) => tip(s, ms) };
  window.PMG = { defs: {}, register(id, f) { this.defs[id] = f; }, api };

  function tip(s, ms = 2400) { clearTimeout(tipT); if (!s || !tutorial) { tipEl.hidden = true; return; } tipEl.textContent = s; tipEl.hidden = false; tipT = setTimeout(() => (tipEl.hidden = true), ms); }
  function setMsg(tt, s = "", acts = "", blink = false) {
    msg.hidden = !tt; $(".pm-play-msg-t", msg).textContent = tt || ""; const sp = $(".pm-play-msg-s", msg); sp.textContent = s; sp.hidden = !s;
    $(".pm-play-msg-a", msg).innerHTML = acts; msg.classList.toggle("is-blink", blink);
  }
  const best = () => store.get("score:" + cur, 0);
  function hud() {
    if (!el.score) return;
    el.score.textContent = game ? Math.floor(game.score || 0) : 0; el.best.textContent = best();
    if (el.extra) el.extra.textContent = game && game.hud ? game.hud() : "";
  }
  function syncBtns() {
    const p = $('[data-play="pause"]'); if (p) { p.textContent = state === "paused" ? "Resume" : "Pause"; p.classList.toggle("is-disabled", !(state === "run" || state === "paused")); }
    const s = $('[data-play="start"]'); if (s) s.classList.toggle("is-disabled", !game || state === "run");
    const r = $('[data-play="restart"]'); if (r) r.classList.toggle("is-disabled", !game);
  }
  function readyMsg() { setMsg(matchMedia("(pointer: coarse)").matches ? "TAP TO START" : "PRESS SPACE OR TAP TO START", "", "", true); }

  /* ---------- flow ---------- */
  function start() {
    if (!game) return;
    if (state === "ready") { state = "run"; setMsg(); Sound.play("open"); tip(TUT[cur][0]); }
    else if (state === "paused") { state = "run"; setMsg(); }
    else if (state === "over") { restart(true); return; }
    syncBtns(); cv.focus({ preventScroll: true });
  }
  function pause() {
    if (state === "run") { state = "paused"; setMsg("PAUSED", "Space or Pause to resume"); Sound.play("click"); }
    else if (state === "paused") start();
    syncBtns();
  }
  function restart(run) {
    if (!game) return; closeSave(true); game.reset(); tip(null);
    if (run) { state = "run"; setMsg(); } else { state = "ready"; readyMsg(); }
    syncBtns(); hud();
  }
  function gameOver() {
    if (state !== "run") return;
    state = "over"; Sound.play("hit", 0.5);
    const s = Math.floor(game.score || 0), b = Math.max(s, best()); store.set("score:" + cur, b);
    const i = GAMES.findIndex((g) => g[0] === cur), nx = GAMES[(i + 1) % GAMES.length][0];
    setMsg("GAME OVER", `Score ${s} · Best ${b}`, `<div class="pm-play-btn" role="button" tabindex="0" data-play="again">Try again</div><a class="pm-play-btn pm-play-btn-ghost" href="?g=${nx}" data-g="${nx}">Next cabinet →</a>`);
    syncBtns(); hud();
    if (s > 0) setTimeout(() => { if (state === "over") openSave(s); }, 700);
  }

  /* ---------- board ---------- */
  function board(hl) {
    const g = info(cur), mine = store.get("board:" + cur, []);
    const all = [...SEED.map(([n, s]) => ({ n, s: Math.max(1, Math.round(s * g[2])) })), ...mine].sort((a, b) => b.s - a.s).slice(0, 10);
    if (el.btitle) el.btitle.textContent = "TOP 10 · " + g[1].toUpperCase();
    if (el.list) el.list.innerHTML = "<ol>" + all.map((r, i) => `<li class="${hl && r.id === hl ? "is-you" : ""}"><span class="pm-lb-rank">${String(i + 1).padStart(2, "0")}</span><span class="pm-lb-name">${esc(r.n)}</span><span class="pm-lb-score">${r.s}</span></li>`).join("") + "</ol>";
  }

  /* ---------- SAVE_SCORE.EXE ---------- */
  const dlg = document.createElement("dialog");
  dlg.className = "pm-contact-modal pm-save-modal"; dlg.setAttribute("aria-labelledby", "save-heading");
  dlg.innerHTML = `<div class="pm-cm-backdrop" data-close></div><div class="pm-cm-window" role="document"><div class="pm-cm-titlebar"><div class="pm-cm-title">SAVE_SCORE.EXE</div><button type="button" class="pm-cm-close" data-close aria-label="Close">${A ? A.icon("close") : "×"}</button></div><div class="pm-cm-body"><div class="pm-cm-scroll"><h3 id="save-heading" class="pm-cm-heading">Save your score</h3><p class="pm-save-score">Score <b>0</b></p><form class="pm-cm-form" novalidate><div class="pm-cm-group"><label class="pm-cm-label" for="save-nick">Nickname</label><input class="pm-cm-input" id="save-nick" name="nick" maxlength="12" autocomplete="nickname" placeholder="Up to 12 characters"></div><div class="pm-save-actions"><button type="button" class="pm-cm-submit pm-save-skip" data-close>Skip</button><button type="submit" class="pm-cm-submit">Submit</button></div><p class="pm-save-note">Scores are saved in this browser only. Want your name on the real board? Email <a href="mailto:hello@pixelmoss.fi">hello@pixelmoss.fi</a></p></form></div></div></div>`;
  document.body.appendChild(dlg);
  const nick = $("#save-nick", dlg);
  function openSave(s) {
    dlg.dataset.score = s; $(".pm-save-score b", dlg).textContent = s; nick.value = store.get("nick", ""); nick.classList.remove("is-invalid");
    try { dlg.showModal(); } catch { dlg.setAttribute("open", ""); }
    root.classList.add("popup-open"); Sound.play("open"); setTimeout(() => nick.focus(), 50);
  }
  function closeSave(quiet) {
    if (!dlg.open) return; dlg.close ? dlg.close() : dlg.removeAttribute("open");
    root.classList.remove("popup-open"); if (!quiet) { Sound.play("close"); cv.focus({ preventScroll: true }); }
  }
  dlg.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeSave(); });
  dlg.addEventListener("cancel", (e) => { e.preventDefault(); closeSave(); });
  $("form", dlg).addEventListener("submit", (e) => {
    e.preventDefault(); const v = nick.value.trim().slice(0, 12);
    if (!v) { nick.classList.add("is-invalid"); nick.focus(); return; }
    const id = Date.now(), mine = store.get("board:" + cur, []); mine.push({ n: v, s: +dlg.dataset.score, id });
    store.set("board:" + cur, mine.sort((a, b) => b.s - a.s).slice(0, 20)); store.set("nick", v);
    board(id); Sound.play("coin"); closeSave(true); cv.focus({ preventScroll: true });
  });
  nick.addEventListener("input", () => nick.classList.remove("is-invalid"));

  /* ---------- loading ---------- */
  function loadScript(id) {
    const srcs = [base + "games/" + id + ".js", base.replace(/@[^/]+\//, "@main/") + "games/" + id + ".js"];
    return new Promise((ok, no) => {
      const next = (i) => {
        if (i >= srcs.length) return no();
        const s = document.createElement("script"); s.src = srcs[i]; s.async = true;
        s.onload = () => (window.PMG.defs[id] ? ok() : next(i + 1)); s.onerror = () => { s.remove(); next(i + 1); };
        document.head.appendChild(s);
      };
      next(0);
    });
  }
  function load(id) {
    if (!info(id)) id = "dash";
    closeSave(true); tip(null); cur = id; game = null; state = "idle";
    const g = info(id);
    $$("[data-g]").forEach((a) => { if (!a.closest(".pm-play-tabs")) return; const on = a.dataset.g === id; a.classList.toggle("is-active", on); a.setAttribute("aria-selected", on); a.classList.toggle("is-soon", !READY.includes(a.dataset.g)); });
    if (el.title) el.title.textContent = g[1];
    cv.setAttribute("aria-label", g[1] + " game. " + TUT[id].join(". "));
    if (el.tut) el.tut.innerHTML = "<ol>" + TUT[id].map((s) => `<li>${s}</li>`).join("") + "</ol>";
    if (el.touch) el.touch.innerHTML = "";
    board(); hud(); syncBtns();
    rect(0, 0, W, H, C.ink);
    if (!READY.includes(id)) { soon(); return; }
    if (window.PMG.defs[id]) return mount(id);
    setMsg("LOADING…");
    loadScript(id).then(() => cur === id && mount(id)).catch(() => cur === id && setMsg("LOAD ERROR", "Refresh the page to try again"));
  }
  function soon() {
    for (let y = 0; y < H; y += 8) for (let x = 0; x < W; x += 8) if (((x + y) / 8) % 2 === 0) rect(x, y, 8, 8, C.g4);
    setMsg("COMING SOON", "This cabinet is still being wired", `<a class="pm-play-btn pm-play-btn-ghost" href="?g=dash" data-g="dash">Play Moss Dash →</a>`);
  }
  function mount(id) {
    game = window.PMG.defs[id](api); game.reset();
    if (el.touch && game.touch) el.touch.innerHTML = game.touch.map(([a, l]) => `<div class="pm-play-key" role="button" tabindex="0" data-act="${a}">${l}</div>`).join("");
    state = "ready"; readyMsg(); syncBtns(); hud(); draw();
  }
  function draw() { rect(0, 0, W, H, C.ink); if (game) game.draw(ctx, reduce && state !== "run" ? 0 : t, state); }

  /* ---------- loop ---------- */
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0, (now - prev) / 1000)); prev = now;
    if (!game) return;
    if (state === "run") { t += dt; game.update(dt); }
    draw(); if (state === "run") hud();
  }
  const halt = () => { if (state === "run") pause(); cancelAnimationFrame(raf); raf = 0; };
  document.addEventListener("visibilitychange", () => { if (document.hidden) halt(); else if (!raf) { prev = performance.now(); raf = requestAnimationFrame(frame); } });
  addEventListener("blur", () => { if (state === "run") pause(); });

  /* ---------- input ---------- */
  const blocked = (e) => dlg.open || document.querySelector(".pm-contact-modal[open]:not(.pm-save-modal)") || (e.target.closest && e.target.closest("input, textarea, select"));
  addEventListener("keydown", (e) => {
    if (!game || blocked(e)) return;
    const k = e.key.toLowerCase();
    if (e.target.matches && e.target.matches('[role="button"]') && (k === "enter" || k === " ")) { e.preventDefault(); e.target.click(); return; }
    if (k === "p" || k === "escape") { if (state === "run" || state === "paused") { e.preventDefault(); pause(); } return; }
    if (k === " " || k.startsWith("arrow")) e.preventDefault();
    if (state !== "run") { if (k === " " || k === "enter") start(); return; }
    if (!e.repeat || game.repeat) game.key && game.key(k, true);
  });
  addEventListener("keyup", (e) => { if (game && game.key && state === "run") game.key(e.key.toLowerCase(), false); });
  const toL = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) * W) / r.width, ((e.clientY - r.top) * H) / r.height]; };
  cv.addEventListener("pointerdown", (e) => {
    e.preventDefault(); cv.focus({ preventScroll: true }); if (!game) return;
    if (state !== "run") { start(); return; }
    try { cv.setPointerCapture(e.pointerId); } catch {}
    game.pointer && game.pointer("down", ...toL(e));
  });
  cv.addEventListener("pointermove", (e) => { if (game && state === "run" && game.pointer) game.pointer("move", ...toL(e), e.buttons > 0 || e.pointerType !== "mouse"); });
  cv.addEventListener("pointerup", (e) => { if (game && state === "run" && game.pointer) game.pointer("up", ...toL(e)); });
  if (el.touch) {
    const up = (e) => { const b = e.target.closest("[data-act]"); if (!b) return; b.classList.remove("is-down"); if (game && game.act && state === "run") game.act(b.dataset.act, false); };
    el.touch.addEventListener("pointerdown", (e) => {
      const b = e.target.closest("[data-act]"); if (!b || !game) return; e.preventDefault(); b.classList.add("is-down");
      if (state !== "run") { start(); return; } game.act && game.act(b.dataset.act, true);
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => el.touch.addEventListener(ev, up));
  }
  document.addEventListener("click", (e) => {
    const g = e.target.closest("[data-g]");
    if (g && (g.closest("#play") || g.closest(".pm-play-msg"))) { e.preventDefault(); history.replaceState(null, "", "?g=" + g.dataset.g); Sound.play("click"); load(g.dataset.g); return; }
    const b = e.target.closest("[data-play]"); if (!b || b.classList.contains("is-disabled")) return;
    const a = b.dataset.play; Sound.play("click");
    if (a === "start") start(); else if (a === "pause") pause(); else if (a === "restart") restart(false); else if (a === "again") restart(true);
  });

  /* ---------- toggles ---------- */
  function syncToggle(b, on) { if (!b) return; b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", String(on)); const s = $(".tutorial-state", b); if (s) s.textContent = on ? "ON" : "OFF"; }
  const tBtn = $("#toggle-tut"), iBtn = $("#toggle-inv");
  const syncAll = () => { syncToggle(tBtn, tutorial); syncToggle(iBtn, invert); scr.classList.toggle("is-invert", invert); if (el.tut) el.tut.hidden = !tutorial; };
  tBtn && tBtn.addEventListener("click", () => { tutorial = !tutorial; store.set("tutorial", tutorial); if (!tutorial) tip(null); syncAll(); Sound.play("click"); });
  iBtn && iBtn.addEventListener("click", () => { invert = !invert; store.set("invert", invert); syncAll(); Sound.play("click"); });
  syncAll();

  load(new URLSearchParams(location.search).get("g") || "dash");
  prev = performance.now(); raf = requestAnimationFrame(frame);
})();

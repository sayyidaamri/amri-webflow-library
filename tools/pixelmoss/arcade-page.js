/* PIXELMOSS — Arcade page: cabinet rack (List / Claw), hall of fame, hobby log (pixel reveal + gallery modal).
   Loaded lazily by pixelmoss.js when #arcade-page exists. Reuses window.PMATTRACT (attract frames from arcade.js). */
(() => {
  const root = document.getElementById("arcade-page");
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "1";
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const get = (k, d) => { try { const v = localStorage.getItem("pm:" + k); return v === null ? d : JSON.parse(v); } catch { return d; } };
  const set = (k, v) => { try { localStorage.setItem("pm:" + k, JSON.stringify(v)); } catch {} };
  const esc = (s) => String(s).replace(/[<>&"]/g, "");
  const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PLAY = "/pixelmoss/play?g=";
  const G = [
    ["dash", "Moss Dash", "2026", "personal", "A one-button runner about a moss sprite who refuses to stop. Switch modes to dodge bugs or blobs.", "Runner · 1 button", 1],
    ["bloom", "Brick Bloom", "2025", "Ludum Dare", "Every brick you break leaves moss behind. Clear the wall before the garden takes over.", "Paddle · Combo", 0.35],
    ["trail", "Snail Trail", "2025", "1-Bit Jam", "The slowest snake in town. Eat leaves, grow longer, never bite your own shell.", "Grid · Classic", 0.03],
    ["stack", "Stack Drop", "2024", "Helsinki Game Club night", "Drop sliding blocks to build the tallest tower. Miss by a pixel and it gets smaller.", "Timing · 1 button", 0.004],
    ["pairs", "Pixel Pairs", "2024", "tabletop prototype turned digital", "Sixteen hand-drawn sprites, sixty seconds. Find every pair before the clock runs out.", "Memory · Mouse", 0.08],
  ];
  const SEED = [["mossbyte", 12880], ["aino.dev", 6120], ["ALT", 4650], ["ferrytale", 3110], ["Juno", 2875]];
  const INK = "#0a0a0a";

  /* ---------- canvases (attract mode) ---------- */
  const screens = [];
  const mkScreen = (id, w = 160, h = 120) => {
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const c = cv.getContext("2d"); c.imageSmoothingEnabled = false; screens.push({ id, c, cv }); return cv;
  };
  const drawAll = (t) => screens.forEach(({ id, c, cv }) => {
    if (!cv.isConnected || cv.offsetParent === null) return;
    c.fillStyle = INK; c.fillRect(0, 0, 160, 120);
    const d = window.PMATTRACT && window.PMATTRACT[id]; if (d) d(c, t);
  });

  /* ---------- List: rack of 5 cabinets ---------- */
  const rack = $("#pm-rack", root);
  if (rack) {
    rack.innerHTML = "";
    G.forEach(([id, name, yr, born, desc, tag]) => {
      const best = Number(get("score:" + id, 0)) || 0;
      const a = document.createElement("article"); a.className = "pm-cab"; a.dataset.game = id;
      a.innerHTML = `<a class="pm-cab-screen" href="${PLAY + id}" aria-label="Play ${name}"><span class="pm-cab-start">PRESS START</span></a>
        <div class="pm-cab-info"><div class="pm-cab-head"><h3 class="pm-cab-name">${name}</h3><span class="pm-cab-year">${yr}</span></div>
        <p class="pm-cab-born">Born at ${born}</p><p class="pm-cab-desc">${desc}</p>
        <div class="pm-cab-foot"><span class="pm-cab-tag">${tag}</span><span class="pm-cab-best">BEST <b>${best}</b></span></div>
        <a class="pm-cab-play" href="${PLAY + id}">Play</a></div>`;
      $(".pm-cab-screen", a).prepend(mkScreen(id));
      rack.appendChild(a);
    });
  }

  /* ---------- Claw ---------- */
  const claw = $("#pm-claw", root);
  let ci = 2, busy = false;
  const clawUI = {};
  if (claw) {
    claw.innerHTML = `<div class="pm-claw-glass"><div class="pm-claw-rail"></div><div class="pm-claw-arm"><i class="pm-claw-cable"></i><span class="pm-claw-hook"></span></div>
      <div class="pm-claw-prizes">${G.map(([id, name]) => `<div class="pm-claw-prize" data-game="${id}"><span class="pm-claw-name">${name}</span></div>`).join("")}</div></div>
      <div class="pm-claw-ctrl"><span class="pm-claw-hint">Pick a cabinet · ← → move · Space grab</span>
      <div class="pm-claw-btns"><div class="pm-claw-btn" role="button" tabindex="0" data-claw="-1" aria-label="Move left">←</div><div class="pm-claw-btn pm-claw-grab" role="button" tabindex="0" data-claw="grab">Grab</div><div class="pm-claw-btn" role="button" tabindex="0" data-claw="1" aria-label="Move right">→</div></div></div>`;
    $$(".pm-claw-prize", claw).forEach((p) => p.prepend(mkScreen(p.dataset.game)));
    clawUI.arm = $(".pm-claw-arm", claw); clawUI.prizes = $$(".pm-claw-prize", claw);
  }
  const clawPos = () => {
    if (!clawUI.arm) return;
    clawUI.arm.style.setProperty("--x", ((ci + 0.5) / G.length) * 100 + "%");
    clawUI.prizes.forEach((p, i) => p.classList.toggle("is-target", i === ci));
  };
  const move = (d) => { if (busy) return; ci = (ci + d + G.length) % G.length; clawPos(); };
  const grab = () => {
    if (busy) return; const id = G[ci][0];
    if (rm) { location.href = PLAY + id; return; }
    busy = true; claw.classList.add("is-drop");
    setTimeout(() => { clawUI.prizes[ci].classList.add("is-grabbed"); claw.classList.add("is-lift"); }, 650);
    setTimeout(() => { location.href = PLAY + id; }, 1500);
  };
  if (claw) {
    clawPos();
    claw.addEventListener("click", (e) => {
      const b = e.target.closest("[data-claw]"), p = e.target.closest(".pm-claw-prize");
      if (b) { b.dataset.claw === "grab" ? grab() : move(+b.dataset.claw); }
      else if (p) { const i = clawUI.prizes.indexOf(p); if (i === ci) grab(); else { ci = i; clawPos(); } }
    });
    claw.addEventListener("keydown", (e) => { const b = e.target.closest("[data-claw]"); if (b && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); b.click(); } });
  }
  document.addEventListener("keydown", (e) => {
    if (view !== "claw" || e.target.closest("input,textarea,dialog") || document.querySelector("dialog[open]")) return;
    const r = claw && claw.getBoundingClientRect(); if (!r || r.bottom < 0 || r.top > innerHeight) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
    else if (e.key === " " || e.key === "ArrowDown") { if (!e.target.closest("[data-claw]")) { e.preventDefault(); grab(); } }
  });

  /* ---------- toggle List / Claw ---------- */
  let view = get("arcade-view", "list") === "claw" ? "claw" : "list";
  const setView = (v) => {
    view = v; set("arcade-view", v); root.dataset.view = v;
    $$("[data-view]", root).forEach((b) => { const on = b.dataset.view === v; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", String(on)); });
    if (rack) rack.hidden = v !== "list"; if (claw) claw.hidden = v !== "claw";
    drawAll(1.3);
  };
  $$("[data-view]", root).forEach((b) => {
    b.setAttribute("role", "button"); b.tabIndex = 0;
    b.addEventListener("click", () => setView(b.dataset.view));
    b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setView(b.dataset.view); } });
  });
  setView(view);

  /* ---------- attract loop ---------- */
  drawAll(1.3);
  if (!rm) {
    let vis = true; const t0 = performance.now();
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe($(".pm-ap-main", root) || root);
    const loop = (now) => { if (vis && !document.hidden) drawAll((now - t0) / 1000); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  /* ---------- Hall of fame (all games) ---------- */
  const hof = $("#pm-hof", root);
  if (hof) {
    const rows = [];
    G.forEach(([id, name, , , , , k]) => {
      SEED.forEach(([n, s]) => rows.push({ g: name, n, s: Math.max(1, Math.round(s * k)), r: s }));
      (get("board:" + id, []) || []).forEach((m) => m && rows.push({ g: name, n: m.n, s: m.s, r: m.s / k, you: 1 }));
      const best = Number(get("score:" + id, 0)) || 0;
      if (best && !(get("board:" + id, []) || []).some((m) => m.s >= best)) rows.push({ g: name, n: "YOU", s: best, r: best / k, you: 1 });
    });
    // rank across games by normalised score (score / game scale), show raw score
    const sorted = rows.sort((a, b) => b.r - a.r), top = sorted.slice(0, 10);
    const extra = sorted.filter((r) => r.you && !top.includes(r)).slice(0, 3);
    const row = (r, i, c) => `<div class="pm-hof-row${c}"><span class="pm-hof-rank">${String(i + 1).padStart(2, "0")}</span><span class="pm-hof-game">${esc(r.g)}</span><span class="pm-hof-name">${esc(r.n)}</span><span class="pm-hof-score">${r.s}</span></div>`;
    hof.innerHTML = `<div class="pm-hof-row pm-hof-head"><span>#</span><span>Game</span><span>Player</span><span>Score</span></div>` +
      top.map((r, i) => row(r, i, r.you ? " is-you" : "")).join("") + extra.map((r) => row(r, sorted.indexOf(r), " is-you")).join("");
  }

  /* ---------- Hobby log: pixel reveal + gallery ---------- */
  const cards = $$(".pm-log-card", root);
  cards.forEach((c) => {
    const m = $(".pm-log-media", c); if (!m) return;
    const px = document.createElement("div"); px.className = "pm-log-px"; px.setAttribute("aria-hidden", "true");
    let h = ""; for (let i = 0; i < 48; i++) h += `<i style="--d:${(Math.random() * 0.7).toFixed(2)}s"></i>`;
    px.innerHTML = h; m.appendChild(px);
    c.tabIndex = 0; c.setAttribute("role", "button");
  });
  if (rm || !("IntersectionObserver" in window)) cards.forEach((c) => c.classList.add("is-in"));
  else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.25 }); cards.forEach((c) => io.observe(c)); }

  let dlg = null, gi = 0;
  const openG = (i) => {
    gi = (i + cards.length) % cards.length; const c = cards[gi];
    const imgs = $$("img", c).map((im) => im.currentSrc || im.src); if (c.dataset.g) imgs.push(c.dataset.g);
    const t = $(".pm-log-title", c), y = $(".pm-log-year", c), p = $(".pm-log-desc", c);
    if (!dlg) {
      dlg = document.createElement("dialog"); dlg.className = "pm-contact-modal pm-gallery-modal";
      dlg.innerHTML = `<div class="pm-cm-backdrop" data-close></div><div class="pm-cm-window pm-gm-window" role="document">
        <div class="pm-cm-titlebar"><div class="pm-cm-title"></div><button type="button" class="pm-cm-close" data-close aria-label="Close">×</button></div>
        <div class="pm-cm-body"><div class="pm-cm-scroll pm-gm-scroll"><div class="pm-gm-imgs"></div><h3 class="pm-cm-heading pm-gm-heading"></h3><p class="pm-gm-text"></p>
        <div class="pm-gm-nav"><div class="pm-cm-submit pm-gm-prev" role="button" tabindex="0">← Prev</div><div class="pm-cm-submit pm-gm-next" role="button" tabindex="0">Next →</div></div></div></div></div>`;
      document.body.appendChild(dlg);
      const close = () => { dlg.close(); document.documentElement.classList.remove("gallery-open"); };
      dlg.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); else if (e.target.closest(".pm-gm-prev")) openG(gi - 1); else if (e.target.closest(".pm-gm-next")) openG(gi + 1); });
      dlg.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") openG(gi - 1); else if (e.key === "ArrowRight") openG(gi + 1); else if ((e.key === "Enter" || e.key === " ") && e.target.closest(".pm-gm-nav [role=button]")) { e.preventDefault(); e.target.click(); } });
      dlg.addEventListener("close", () => document.documentElement.classList.remove("gallery-open"));
    }
    $(".pm-cm-title", dlg).textContent = `C:/PIXELMOSS/LOG/${String(gi + 1).padStart(2, "0")}.IMG`;
    $(".pm-gm-imgs", dlg).innerHTML = [...new Set(imgs)].map((s) => `<img src="${esc(s)}" alt="" loading="lazy">`).join("");
    $(".pm-gm-heading", dlg).textContent = t ? t.textContent : "";
    $(".pm-gm-text", dlg).textContent = (y ? y.textContent + " · " : "") + (p ? p.textContent : "");
    if (!dlg.open) { dlg.showModal(); document.documentElement.classList.add("gallery-open"); }
  };
  cards.forEach((c, i) => {
    c.addEventListener("click", () => openG(i));
    c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openG(i); } });
  });
})();

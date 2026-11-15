/* HALDEN PICTURES — behaviour for the Webflow build (vanilla JS). Ported from the VOSSBERG static rebuild. */
(() => {
  if (window.__hdBooted) return; window.__hdBooted = true;
  const SRC = (document.currentScript && document.currentScript.src) || "";
  const BASE = SRC ? SRC.replace(/js\/halden\.js.*$/, "") : "";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  html.classList.add("hd-live");

  /* ---------- smooth wheel scroll ---------- */
  const S = {
    y: scrollY, target: scrollY, running: false, stopped: false, fns: new Set(),
    max() { return html.scrollHeight - innerHeight; },
    to(y, o = {}) { y = clamp(y, 0, this.max()); if (o.immediate || reduce) { this.y = this.target = y; scrollTo(0, y); this.emit(); return; } this.target = y; this.kick(); },
    kick() { if (!this.running) { this.running = true; requestAnimationFrame(this.tick); } },
    tick: () => { const d = S.target - S.y; S.y += d * 0.1; if (Math.abs(d) < 0.4) { S.y = S.target; S.running = false; } scrollTo(0, S.y); S.emit(); if (S.running) requestAnimationFrame(S.tick); },
    emit() { this.fns.forEach((f) => f(scrollY)); },
    on(f) { this.fns.add(f); },
  };
  const scrollable = (el) => el && el.closest && el.closest(".hd-menu, .hd-modal, .hd-ov, .hd-lb, textarea, select");
  if (fine && !reduce) {
    html.classList.add("has-smooth");
    addEventListener("wheel", (e) => {
      if (e.ctrlKey || scrollable(e.target)) return;
      e.preventDefault(); if (S.stopped) return;
      const d = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
      if (!S.running) S.y = S.target = scrollY;
      S.target = clamp(S.target + d, 0, S.max()); S.kick();
    }, { passive: false });
  }
  addEventListener("scroll", () => { if (!S.running) { S.y = S.target = scrollY; S.emit(); } }, { passive: true });
  let locks = 0;
  const lock = () => { if (locks++ === 0) { S.stopped = true; html.classList.add("hd-lock"); } };
  const unlock = () => { if (--locks <= 0) { locks = 0; S.stopped = false; html.classList.remove("hd-lock"); S.y = S.target = scrollY; } };

  /* ---------- split text + roll ---------- */
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  function splitChars(el) {
    let i = 0;
    if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    const wrap = (node) => {
      const f = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(" ")); return; }
        const m = document.createElement("span"); m.className = "sp-mask"; m.setAttribute("aria-hidden", "true");
        [...w].forEach((ch) => { const c = document.createElement("span"); c.className = "sp-char"; c.textContent = ch; c.style.setProperty("--i", i++); m.appendChild(c); });
        f.appendChild(m);
      });
      node.replaceWith(f);
    };
    const walk = (n) => [...n.childNodes].forEach((c) => (c.nodeType === 3 ? (c.textContent.trim() ? wrap(c) : null) : walk(c)));
    walk(el);
  }
  function splitLines(el) {
    if (!el.dataset.orig) el.dataset.orig = el.textContent.replace(/\s+/g, " ").trim();
    const text = el.dataset.orig;
    if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", text);
    el.innerHTML = text.split(" ").map((w) => `<span class="sp-word">${esc(w)}</span>`).join(" ");
    const g = []; let top = null;
    $$(".sp-word", el).forEach((w) => { const t = w.offsetTop; if (top === null || Math.abs(t - top) > 3) { g.push([]); top = t; } g[g.length - 1].push(w.textContent); });
    el.innerHTML = g.map((l, i) => `<span class="sp-line-mask" aria-hidden="true"><span class="sp-line" style="--i:${i}">${esc(l.join(" "))}</span></span>`).join("");
  }
  const split = () => $$("[data-split]").forEach((el) => {
    if (el.dataset.splitDone) return;
    el.dataset.split === "lines" ? splitLines(el) : splitChars(el);
    if (el.dataset.delay) el.style.setProperty("--d", el.dataset.delay + "s");
    el.dataset.splitDone = "1";
  });
  let lastW = innerWidth;
  addEventListener("resize", () => { if (Math.abs(innerWidth - lastW) < 40) return; lastW = innerWidth; $$('[data-split="lines"]').forEach((el) => { const on = el.classList.contains("is-in"); splitLines(el); on && el.classList.add("is-in"); }); });
  const roll = () => $$("[data-roll]").forEach((el) => {
    if (el.dataset.rollDone) return;
    const t = el.textContent.trim();
    const mk = (c) => `<span class="${c}" aria-hidden="true">${[...t].map((ch, i) => `<span class="bc" style="--i:${i}">${ch === " " ? "&nbsp;" : esc(ch)}</span>`).join("")}</span>`;
    el.setAttribute("aria-label", t); el.innerHTML = mk("bl-a") + mk("bl-b"); el.dataset.rollDone = "1";
  });

  /* ---------- reveals ---------- */
  const targets = new Map();
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    (targets.get(e.target) || []).forEach((el) => el.classList.add("is-in"));
    targets.delete(e.target); io.unobserve(e.target);
  }), { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
  const observe = () => $$("[data-split]:not([data-intro]):not([data-manual]), [data-hd-clip], .hd-cl_frame").forEach((el) => {
    if (el.closest(".hd-menu, .hd-modal, .hd-ch_title") || el.classList.contains("is-in")) return;
    const host = el.matches("[data-hd-clip], .hd-cl_frame") ? el.parentElement : el;
    if (!targets.has(host)) targets.set(host, []);
    targets.get(host).push(el); io.observe(host);
  });

  /* ---------- parallax ---------- */
  const par = [];
  $$("[data-parallax-inner]").forEach((el) => par.push({ el, inner: true, host: el.parentElement }));
  $$("[data-parallax-y]").forEach((el) => { if (innerWidth > 991) par.push({ el, amt: +el.dataset.parallaxY, host: el }); });
  function parallax() {
    const vh = innerHeight;
    for (const p of par) {
      const r = p.host.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const k = clamp((vh - r.top) / (vh + r.height), 0, 1) - 0.5;
      p.el.style.transform = p.inner ? `translate3d(0,${(-k * 0.18 * r.height).toFixed(1)}px,0)` : `translate3d(0,${(k * p.amt * 2).toFixed(1)}px,0)`;
    }
  }
  if (!reduce) S.on(parallax);

  /* ---------- header ---------- */
  const hdr = $("[data-hd-header]");
  let lastY = scrollY;
  function header(y) {
    if (!hdr) return;
    if (!html.classList.contains("hd-menu-open")) {
      if (y > lastY + 2 && y > 120) hdr.classList.add("is-hidden");
      else if (y < lastY - 2 || y < 120) hdr.classList.remove("is-hidden");
    }
    lastY = y;
    const mid = 36;
    const dark = $$("[data-dark]").some((s) => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
    hdr.dataset.tone = dark ? "light" : "dark";
  }
  S.on(header);

  /* ---------- menu ---------- */
  const menu = $("[data-hd-menu]"), burger = $("[data-hd-burger]");
  let menuOpen = false;
  function setMenu(open) {
    if (!menu || open === menuOpen) return; menuOpen = open;
    html.classList.toggle("hd-menu-open", open); menu.classList.toggle("is-open", open);
    burger && burger.setAttribute("aria-expanded", open);
    $$(".hd-menu_link", menu).forEach((a, i) => a.style.setProperty("--i", i));
    open ? lock() : unlock();
  }
  burger && burger.addEventListener("click", () => setMenu(!menuOpen));
  burger && burger.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMenu(!menuOpen); } });
  $$(".hd-menu_backdrop").forEach((b) => b.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") { setMenu(false); closeModal(); } });
  if (menu) { const here = location.pathname.replace(/\/$/, ""); $$(".hd-menu_link", menu).forEach((a) => { if (a.getAttribute("href") === here) a.classList.add("is-active"); }); }

  /* ---------- page transitions (Halden pages only; library.js handles the rest) ---------- */
  const curtain = $(".hd-curtain");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("/halden/") || href.split("#")[0] === location.pathname) return;
    e.preventDefault(); curtain && curtain.classList.add("is-on");
    setTimeout(() => (location.href = href), 450);
  });
  addEventListener("pageshow", (e) => { if (e.persisted && curtain) curtain.classList.remove("is-on"); });

  /* ---------- background videos ---------- */
  const vio = new IntersectionObserver((es) => es.forEach((e) => { const v = e.target; e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }), { threshold: 0.05 });
  $$("[data-hd-video]").forEach((host) => {
    const v = document.createElement("video");
    v.className = "hd-bgvideo"; v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "metadata";
    v.src = BASE + "video/" + host.dataset.hdVideo + ".mp4";
    v.addEventListener("playing", () => v.classList.add("is-ready"), { once: true });
    host.appendChild(v); vio.observe(v);
  });

  /* ---------- hero ---------- */
  const hero = $("[data-hd-hero]"), heroMedia = $("[data-hd-hero-media]"), heroContent = $("[data-hd-hero-content]");
  if (hero && !reduce) S.on((y) => {
    const h = hero.offsetHeight; if (y > h * 1.2) return;
    if (heroMedia) heroMedia.style.transform = `translate3d(0,${(y * 0.35).toFixed(1)}px,0)`;
    if (heroContent) { heroContent.style.transform = `translate3d(0,${(y * 0.55).toFixed(1)}px,0)`; heroContent.style.opacity = clamp(1 - y / (h * 0.75), 0, 1); }
  });

  /* ---------- motto frame opening ---------- */
  const motto = $("[data-hd-motto]");
  if (motto && !reduce) S.on(() => {
    const r = motto.getBoundingClientRect(); if (r.top > innerHeight || r.bottom < 0) return;
    motto.style.setProperty("--mx", ((1 - clamp(1 - r.top / innerHeight, 0, 1)) * 10).toFixed(2) + "%");
  });

  /* ---------- film player ---------- */
  const ICON = {
    play: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l9-5.5z"/></svg>',
    pause: '<svg viewBox="0 0 20 20" fill="currentColor"><rect x="5" y="4" width="3.2" height="12"/><rect x="11.8" y="4" width="3.2" height="12"/></svg>',
    snd: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 8h3l4-3v10l-4-3H3z" fill="currentColor"/><path class="snd-on" d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5.5a6.5 6.5 0 0 1 0 9"/><path class="snd-off" d="M13 8l4 4m0-4l-4 4"/></svg>',
    fs: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4"/></svg>',
  };
  $$("[data-hd-player]").forEach((P) => {
    P.classList.add("hd-player");
    const v = document.createElement("video");
    v.src = BASE + "video/" + P.dataset.hdPlayer + ".mp4"; v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "metadata";
    const poster = $("img", P); if (poster) v.poster = poster.currentSrc || poster.src;
    P.insertAdjacentHTML("beforeend", `<div class="hd-p-dim"></div><button type="button" class="hd-p-big" aria-label="Play film" data-pt>${ICON.play}</button><div class="hd-p-bar"><div class="hd-p-grad"></div><div class="hd-p-row"><button type="button" class="hd-p-btn" data-pt aria-label="Play or pause"><span class="pp-play">${ICON.play}</span><span class="pp-pause">${ICON.pause}</span></button><div class="hd-p-time"><span data-cur>00:00</span><i>/</i><span data-dur>00:00</span></div><div class="hd-p-seek" role="slider" tabindex="0" aria-label="Seek"><div class="hd-p-track"><div class="hd-p-fill"></div></div><div class="hd-p-knob"></div></div><button type="button" class="hd-p-btn" data-mute aria-label="Mute">${ICON.snd}</button><button type="button" class="hd-p-btn" data-fs aria-label="Fullscreen">${ICON.fs}</button></div></div>`);
    P.insertBefore(v, P.querySelector(".hd-p-dim"));
    const seek = $(".hd-p-seek", P), fill = $(".hd-p-fill", P), knob = $(".hd-p-knob", P);
    const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };
    const sync = () => { const p = v.duration ? v.currentTime / v.duration : 0; fill.style.width = knob.style.left = p * 100 + "%"; $("[data-cur]", P).textContent = fmt(v.currentTime); $("[data-dur]", P).textContent = fmt(v.duration); };
    const toggle = () => { if (v.paused) { v.play(); P.classList.add("was-started"); } else v.pause(); };
    $$("[data-pt]", P).forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); toggle(); }));
    v.addEventListener("click", () => P.classList.contains("was-started") && toggle());
    v.addEventListener("play", () => P.classList.add("is-playing"));
    v.addEventListener("pause", () => P.classList.remove("is-playing"));
    v.addEventListener("ended", () => { P.classList.remove("was-started"); v.currentTime = 0; sync(); });
    ["timeupdate", "loadedmetadata", "seeked"].forEach((ev) => v.addEventListener(ev, sync));
    $("[data-mute]", P).addEventListener("click", () => { v.muted = !v.muted; P.classList.toggle("is-muted", v.muted); });
    $("[data-fs]", P).addEventListener("click", () => { if (document.fullscreenElement) document.exitFullscreen(); else if (P.requestFullscreen) P.requestFullscreen(); else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen(); });
    const seekTo = (x) => { const r = seek.getBoundingClientRect(); if (v.duration) v.currentTime = clamp((x - r.left) / r.width, 0, 1) * v.duration; sync(); };
    seek.addEventListener("pointerdown", (e) => { seek.setPointerCapture(e.pointerId); seekTo(e.clientX); const mv = (ev) => seekTo(ev.clientX); seek.addEventListener("pointermove", mv); seek.addEventListener("pointerup", () => seek.removeEventListener("pointermove", mv), { once: true }); });
    seek.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") v.currentTime += 5; if (e.key === "ArrowLeft") v.currentTime -= 5; });
    let t = 0; P.addEventListener("mousemove", () => { P.classList.add("show-ui"); clearTimeout(t); t = setTimeout(() => P.classList.remove("show-ui"), 2000); });
    new IntersectionObserver(([e]) => { if (!e.isIntersecting && !v.paused) v.pause(); }).observe(P);
  });

  /* ---------- collage ---------- */
  const C = $("[data-hd-collage]");
  if (C) {
    const mice = $$("[data-mouse]", C).map((el) => ({ el, f: +el.dataset.mouse || 1, x: 0, y: 0 }));
    const content = $("[data-collage-content]", C);
    let mx = 0, my = 0, on = false;
    C.addEventListener("pointermove", (e) => { const r = C.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5; });
    C.addEventListener("pointerleave", () => { mx = my = 0; });
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) loop(); }).observe(C);
    function loop() {
      if (!on || reduce) return;
      const r = C.getBoundingClientRect(); const k = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1) - 0.5;
      mice.forEach((m) => { m.x += (mx * 40 * m.f - m.x) * 0.06; m.y += (my * 30 * m.f - m.y) * 0.06; m.el.style.transform = `translate3d(${m.x.toFixed(2)}px,${(m.y - k * 160 * m.f).toFixed(2)}px,0)`; });
      if (content && innerWidth > 991) content.style.transform = `translate3d(0,${(k * -60).toFixed(1)}px,0)`;
      requestAnimationFrame(loop);
    }
  }

  /* ---------- news modals ---------- */
  let openM = null, mTimer = 0;
  function openModal(id) {
    const m = $(`[data-hd-modal="${id}"]`); if (!m) return;
    clearTimeout(mTimer); openM = m; m.classList.add("is-open"); void m.offsetWidth;
    requestAnimationFrame(() => m.classList.add("is-in")); lock();
    m.scrollTop = 0; const c = $("[data-hd-close]", m); c && setTimeout(() => c.focus({ preventScroll: true }), 80);
  }
  function closeModal() {
    if (!openM) return; const m = openM; openM = null;
    m.classList.remove("is-in"); unlock(); mTimer = setTimeout(() => m.classList.remove("is-open"), 900);
  }
  $$("[data-hd-news]").forEach((c) => {
    c.setAttribute("role", "button"); c.setAttribute("tabindex", "0");
    c.addEventListener("click", () => openModal(c.dataset.hdNews));
    c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(c.dataset.hdNews); } });
  });
  $$("[data-hd-close], .hd-modal_backdrop").forEach((b) => b.addEventListener("click", closeModal));

  /* ---------- film: scroll-scrubbed chapters ---------- */
  const chapters = $$("[data-hd-chapter]").map((el) => {
    const canvas = $("canvas", el);
    return { el, canvas, ctx: canvas ? canvas.getContext("2d") : null, title: $(".hd-ch_title", el), bars: $$(".hd-ch_bar", el), side: $("[data-side]", el), hour: +el.dataset.hour || 0, src: BASE + "video/" + el.dataset.video + ".mp4", audioSrc: BASE + "audio/" + el.dataset.audio + ".mp3", video: null, ready: false, seeking: false, target: 0, last: -1, p: 0 };
  }).filter((c) => c.ctx);
  if (chapters.length) {
    const hud = $("[data-hud]"), skip = $("[data-skip]"), dial = $("[data-dial]"), dialTime = $("[data-dial-time]"), hand = $(".hd-dial-hand"), prompt = $("[data-sound-prompt]"), wave = $("[data-wave]");
    const sizeCanvas = (c) => { const d = Math.min(devicePixelRatio || 1, 1.5); c.canvas.width = Math.round(innerWidth * d); c.canvas.height = Math.round(innerHeight * d); c.last = -1; draw(c, true); };
    function layout() {
      const vh = innerHeight;
      chapters.forEach((c, i) => {
        if (c.side) { const top = vh * 1.35; c.side.style.top = top + "px"; c.el.style.height = Math.max(top + c.side.offsetHeight + vh * 0.9, vh * (i === 1 ? 5.4 : 4.6)) + "px"; }
        sizeCanvas(c);
      });
    }
    function load(c) {
      if (c.video) return;
      const v = document.createElement("video"); v.muted = true; v.playsInline = true; v.preload = "auto"; v.crossOrigin = "anonymous"; v.src = c.src;
      v.addEventListener("loadeddata", () => { c.ready = true; seek(c); c.el.classList.add("is-ready"); });
      v.addEventListener("seeked", () => { c.seeking = false; draw(c, true); if (Math.abs(v.currentTime - c.target) > 0.04) seek(c); });
      c.video = v; v.load();
    }
    function seek(c) { if (!c.ready || c.seeking) return; const v = c.video; if (Math.abs(v.currentTime - c.target) < 0.02) { draw(c); return; } c.seeking = true; v.currentTime = c.target; }
    function draw(c, force) {
      const v = c.video; if (!v || !c.ready || !v.videoWidth) return;
      if (!force && c.last === v.currentTime) return;
      const cw = c.canvas.width, ch = c.canvas.height, s = Math.max(cw / v.videoWidth, ch / v.videoHeight) * 1.04, w = v.videoWidth * s, h = v.videoHeight * s;
      c.ctx.drawImage(v, (cw - w) / 2, (ch - h) / 2, w, h); c.last = v.currentTime;
    }
    let active = -1;
    function update() {
      const vh = innerHeight; let cur = -1;
      chapters.forEach((c, i) => {
        const r = c.el.getBoundingClientRect(), total = c.el.offsetHeight - vh, px = -r.top;
        c.p = clamp(px / total, 0, 1);
        const near = r.top < vh * 2 && r.bottom > -vh;
        if (near) load(c);
        if (r.top <= 1 && r.bottom >= vh * 0.5) cur = i;
        if (!near) return;
        const bar = vh * 0.195 * (1 - clamp(px / (vh * 0.9), 0, 1));
        c.bars.forEach((b) => b.style.setProperty("--bar", bar.toFixed(1) + "px"));
        const tP = clamp(px / (vh * 0.7), 0, 1);
        if (c.title) { c.title.style.opacity = (1 - tP).toFixed(3); c.title.style.transform = `translate(-50%, calc(-50% - ${(tP * 80).toFixed(1)}px))`; }
        if (r.top < vh * 0.6 && !c.titleIn && c.title) { c.titleIn = true; $$("[data-split]", c.title).forEach((e) => e.classList.add("is-in")); }
        if (c.ready && c.video.duration) { c.target = clamp((px - vh * 0.15) / (total - vh * 0.15), 0, 1) * (c.video.duration - 0.05); seek(c); }
      });
      active = cur;
      const c = chapters[cur], inFilm = !!(c && c.p > 0.04);
      skip && skip.classList.toggle("on", inFilm); dial && dial.classList.toggle("on", inFilm);
      if (c && dialTime) {
        const next = chapters[cur + 1] ? chapters[cur + 1].hour : c.hour + 3, t = c.hour + (next - c.hour) * c.p, hh = Math.floor(t), mm = Math.floor((t - hh) * 60);
        dialTime.textContent = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
        hand && (hand.style.transform = `rotate(${(-70 + c.p * 140).toFixed(1)}deg)`);
      }
      prompt && prompt.classList.toggle("is-hidden", !(cur === 0 && chapters[0].p < 0.06));
      const y = innerHeight - 30;
      const overDark = $$("[data-dark]").some((s) => { const rr = s.getBoundingClientRect(); return rr.top <= y && rr.bottom >= y; });
      const overPanel = c && c.side && (() => { const rr = c.side.getBoundingClientRect(); return rr.top <= y && rr.bottom >= y && innerWidth < 768; })();
      hud && hud.classList.toggle("on-light", !overDark || !!overPanel);
      mix();
    }
    /* sound */
    let soundOn = store.get("hd-sound", true), unlocked = false;
    chapters.forEach((c) => { const a = new Audio(); a.src = c.audioSrc; a.loop = true; a.preload = "none"; a.volume = 0; c.audio = a; });
    function mix() {
      chapters.forEach((c, i) => {
        const want = soundOn && unlocked && i === active ? 0.6 * clamp(Math.min(c.p * 30, (1 - c.p) * 12), 0, 1) : 0, a = c.audio;
        a.volume = clamp(a.volume + (want - a.volume) * 0.15, 0, 1);
        if (want > 0.01 && a.paused && !a.pending) { a.preload = "auto"; a.pending = true; a.play().then(() => (a.pending = false)).catch((err) => { a.pending = false; if (err && err.name === "NotAllowedError") unlocked = false; }); }
        if (want === 0 && a.volume < 0.01 && !a.paused && !a.pending) a.pause();
      });
    }
    function setSound(on, user) {
      soundOn = on; store.set("hd-sound", on);
      $$("[data-sound]").forEach((b) => b.classList.toggle("is-on", (b.dataset.sound === "on") === on));
      wave && wave.classList.toggle("is-playing", on);
      if (on && user) { unlocked = true; mix(); }
    }
    $$("[data-sound]").forEach((b) => b.addEventListener("click", () => setSound(b.dataset.sound === "on", true)));
    wave && wave.addEventListener("click", () => setSound(!soundOn, true));
    ["pointerdown", "keydown", "touchend"].forEach((ev) => addEventListener(ev, () => { if (soundOn && !unlocked) { unlocked = true; mix(); } }, { passive: true }));
    setSound(soundOn); setInterval(mix, 120);
    /* skip + dial + overview */
    skip && skip.addEventListener("click", () => { const c = chapters[active]; if (c) S.to(c.el.offsetTop + c.el.offsetHeight - innerHeight * 0.4); });
    const ticks = $(".hd-dial-ticks");
    if (ticks) for (let a = -70; a <= 70; a += 10) { const rad = (a - 90) * Math.PI / 180, r1 = a % 30 === 0 ? 30 : 33, r2 = 38; ticks.insertAdjacentHTML("beforeend", `<line x1="${60 + Math.cos(rad) * r1}" y1="${58 + Math.sin(rad) * r1}" x2="${60 + Math.cos(rad) * r2}" y2="${58 + Math.sin(rad) * r2}"/>`); }
    const ov = $("[data-overview]");
    const ovOpen = () => { ov.classList.add("is-open"); requestAnimationFrame(() => ov.classList.add("is-in")); $$("[data-jump]", ov).forEach((b, i) => b.classList.toggle("on", i === active)); lock(); };
    const ovClose = () => { ov.classList.remove("is-in"); unlock(); setTimeout(() => ov.classList.remove("is-open"), 600); };
    if (ov) {
      dial && dial.addEventListener("click", ovOpen);
      $$("[data-ov-close]", ov).forEach((b) => b.addEventListener("click", ovClose));
      $$("[data-jump]", ov).forEach((b) => b.addEventListener("click", () => { ovClose(); const el = chapters[+b.dataset.jump].el; setTimeout(() => S.to(el.offsetTop + innerHeight * 0.75, { immediate: true }), 50); }));
      addEventListener("keydown", (e) => { if (e.key === "Escape" && ov.classList.contains("is-open")) ovClose(); });
    }
    layout(); update();
    addEventListener("resize", () => { layout(); update(); });
    addEventListener("load", () => { layout(); update(); });
    S.on(update);
    (function loop() { chapters.forEach((c) => c.ready && draw(c)); requestAnimationFrame(loop); })();
    if (reduce) chapters.forEach(load);
  }

  /* ---------- lightbox ---------- */
  const lb = $("[data-hd-lightbox]");
  const items = $$("[data-hd-lb]").map((b) => { const im = $("img", b); return { src: im.currentSrc || im.src, cap: im.alt }; });
  if (lb && items.length) {
    let li = 0;
    const show = (i) => { li = (i + items.length) % items.length; const im = $("[data-lb-img]", lb); im.src = items[li].src; im.alt = items[li].cap; $("[data-lb-cap]", lb).textContent = items[li].cap; $("[data-lb-count]", lb).textContent = `${li + 1} / ${items.length}`; };
    const open = (i) => { show(i); lb.classList.add("is-open"); requestAnimationFrame(() => lb.classList.add("is-in")); lock(); };
    const close = () => { lb.classList.remove("is-in"); unlock(); setTimeout(() => lb.classList.remove("is-open"), 500); };
    $$("[data-hd-lb]").forEach((b, i) => { b.setAttribute("role", "button"); b.setAttribute("tabindex", "0"); b.addEventListener("click", () => open(i)); b.addEventListener("keydown", (e) => { if (e.key === "Enter") open(i); }); });
    $("[data-lb-close]", lb).addEventListener("click", close);
    $("[data-lb-prev]", lb).addEventListener("click", () => show(li - 1));
    $("[data-lb-next]", lb).addEventListener("click", () => show(li + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    addEventListener("keydown", (e) => { if (!lb.classList.contains("is-open")) return; if (e.key === "Escape") close(); if (e.key === "ArrowLeft") show(li - 1); if (e.key === "ArrowRight") show(li + 1); });
  }

  /* ---------- odometer counters ---------- */
  $$("[data-count]").forEach((el) => {
    const val = el.dataset.count; el.setAttribute("aria-label", val);
    el.innerHTML = [...val].map((ch) => /\d/.test(ch) ? `<span class="dg" aria-hidden="true"><span class="dg-col" data-d="${ch}">${"0123456789".split("").map((d) => `<span>${d}</span>`).join("")}</span></span>` : `<span aria-hidden="true">${ch}</span>`).join("");
    const cols = $$(".dg-col", el);
    new IntersectionObserver(([e], o) => { if (!e.isIntersecting) return; o.disconnect(); cols.forEach((c, i) => { c.style.transitionDelay = i * 90 + "ms"; c.style.transform = `translateY(${-c.dataset.d * 10}%)`; }); }, { threshold: 0.6 }).observe(el);
  });

  /* ---------- contact form validation (Webflow submits natively) ---------- */
  const form = $("[data-hd-form] form") || $("form[data-hd-form]");
  if (form) {
    const okEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
    const check = (f) => { const i = $("input, textarea, select", f); if (!i) return true; const v = (i.value || "").trim(); const ok = i.type === "email" ? okEmail(v) : v.length > 0; f.classList.toggle("has-error", !ok); return ok; };
    const fields = () => $$(".hd-field[data-required]", form);
    fields().forEach((f) => { const i = $("input, textarea, select", f); i && i.addEventListener("input", () => f.classList.contains("has-error") && check(f)); i && i.addEventListener("change", () => f.classList.contains("has-error") && check(f)); });
    document.addEventListener("submit", (e) => {
      if (e.target !== form) return;
      const bad = fields().filter((f) => !check(f));
      if (bad.length) { e.preventDefault(); e.stopImmediatePropagation(); S.to(bad[0].getBoundingClientRect().top + scrollY - 140); }
    }, true);
    const subj = new URLSearchParams(location.search).get("subject"), sel = $("select", form);
    if (subj && sel) [...sel.options].forEach((o) => { if (o.value.toLowerCase().startsWith(subj)) sel.value = o.value; });
  }

  /* ---------- boot ---------- */
  const loader = $(".hd-loader");
  function intro() {
    html.classList.remove("hd-enter"); html.classList.add("hd-ready");
    $$("[data-intro]").forEach((el) => el.classList.add("is-in"));
    observe(); S.emit();
  }
  function boot() {
    split(); roll(); header(scrollY); parallax();
    if (html.classList.contains("hd-first") && loader && !reduce) {
      setTimeout(() => {
        loader.classList.add("is-out"); setTimeout(intro, 350);
        setTimeout(() => { loader.classList.add("is-done"); html.classList.remove("hd-first"); }, 1300);
      }, 1900);
    } else { loader && loader.classList.add("is-done"); html.classList.remove("hd-first"); requestAnimationFrame(() => requestAnimationFrame(intro)); }
  }
  const fonts = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
  fonts.then(boot);
})();

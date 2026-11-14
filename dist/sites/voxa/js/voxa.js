/* =========================================================
   Fluid — liquid-chrome background (raw WebGL, no library)
   Domain-warped fbm height field, lit with specular + fake
   environment bands. Tint lerps between pages.
   API: Fluid.init(canvas, {tint}), Fluid.setTint([r,g,b]),
        Fluid.setIntro(0..1), Fluid.setFocus(0..1)
   ========================================================= */
(function () {
  "use strict";

  var VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;",
    "uniform vec3 uTint;uniform vec3 uHi;uniform float uIntro;uniform float uLight;uniform float uFlat;",
    "float h21(vec2 p){p=fract(p*vec2(233.34,851.73));p+=dot(p,p+23.45);return fract(p.x*p.y);}",
    "float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.-15.)+10.);",
    " return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}",
    "float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,-.6,.6,.8);",
    " for(int i=0;i<4;i++){v+=a*noise(p);p=r*p*1.9;a*=.45;}return v;}",
    "float field(vec2 p){float t=uTime*.035;",
    " vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,1.3)-t));",
    " vec2 r=vec2(fbm(p+4.*q+vec2(1.7,9.2)+t*.7),fbm(p+4.*q+vec2(8.3,2.8)-t*.5));",
    " return fbm(p+4.*r);}",
    "void main(){",
    " vec2 uv=gl_FragCoord.xy/uRes;vec2 p=(gl_FragCoord.xy-.5*uRes)/min(uRes.x,uRes.y);",
    " float zoom=mix(.45,1.,uIntro);p*=.58*zoom;",
    " vec2 m=(uMouse-.5)*vec2(uRes.x/uRes.y,1.);p+=m*.08;",
    " float e=.006;float h=field(p);",
    " float hx=field(p+vec2(e,0.)),hy=field(p+vec2(0.,e));",
    " vec3 n=normalize(vec3((h-hx)/e*.11,(h-hy)/e*.11,1.));",
    " vec3 v=vec3(0.,0.,1.);vec3 l=normalize(vec3(-.4,.6,.8));",
    " vec3 rf=reflect(-v,n);",
    " float env=smoothstep(.86,1.,sin(rf.x*4.+rf.y*2.5+h*3.)*.5+.5);",
    " float spec=pow(max(dot(reflect(-l,n),v),0.),36.);",
    " float fres=pow(1.-max(n.z,0.),3.);",
    " float diff=max(dot(n,l),0.)*.25;",
    " vec3 base=uTint*(mix(.12,.62,uFlat)+diff*.8+h*h*mix(.7,.5,uFlat));",
    " vec3 col=base+uHi*(env*.55+spec*.85+fres*.45)*smoothstep(.3,.75,h+.1);col=pow(col,vec3(1.35));",
    " col=mix(col,vec3(1.)-col*.15,uLight);",
    " float vig=smoothstep(1.25,.25,length(uv-.5));col*=mix(.55,1.,vig);",
    " col*=smoothstep(0.,.35,uIntro);",
    " col+=uHi*(1.-smoothstep(0.,.6,uIntro))*.35*env;",
    " gl_FragColor=vec4(col,1.);}"
  ].join("\n");

  var gl, prog, canvas, U = {}, raf, t0 = performance.now();
  var tint = [0.06, 0.06, 0.08], tintTo = tint.slice();
  var hi = [0.62, 0.62, 0.7], hiTo = hi.slice();
  var intro = 1, introTo = 1, light = 0, lightTo = 0;
  var mouse = [0.5, 0.5], mouseTo = [0.5, 0.5];
  var scale = 0.5, flat = 0;

  function compile(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  function resize() {
    var w = Math.round(innerWidth * scale), h = Math.round(innerHeight * scale);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    resize();
    for (var i = 0; i < 3; i++) { tint[i] = lerp(tint[i], tintTo[i], 0.04); hi[i] = lerp(hi[i], hiTo[i], 0.04); }
    intro = lerp(intro, introTo, 0.02); light = lerp(light, lightTo, 0.05);
    mouse[0] = lerp(mouse[0], mouseTo[0], 0.03); mouse[1] = lerp(mouse[1], mouseTo[1], 0.03);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, (now - t0) / 1000);
    gl.uniform2f(U.uMouse, mouse[0], mouse[1]);
    gl.uniform3fv(U.uTint, tint); gl.uniform3fv(U.uHi, hi);
    gl.uniform1f(U.uIntro, intro); gl.uniform1f(U.uLight, light); gl.uniform1f(U.uFlat, flat);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  window.Fluid = {
    init: function (el, opts) {
      canvas = el; opts = opts || {};
      gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, powerPreference: "high-performance" });
      if (!gl) { canvas.style.background = "#0b0b0f"; return false; }
      scale = Math.min(window.devicePixelRatio || 1, 2) * (innerWidth < 768 ? 0.45 : 0.55);
      prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog); gl.useProgram(prog);
      var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ["uRes", "uTime", "uMouse", "uTint", "uHi", "uIntro", "uLight", "uFlat"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, k); });
      if (opts.from) { tint = opts.from.tint.slice(); hi = opts.from.hi.slice(); }
      if (opts.tint) { tintTo = opts.tint.slice(); hiTo = (opts.hi || hiTo).slice(); if (!opts.from) { tint = tintTo.slice(); hi = hiTo.slice(); } }
      if (opts.intro) { intro = 0; introTo = 0; }
      flat = opts.flat || 0;
      window.addEventListener("pointermove", function (e) { mouseTo = [e.clientX / innerWidth, 1 - e.clientY / innerHeight]; }, { passive: true });
      raf = requestAnimationFrame(frame);
      return true;
    },
    setTint: function (t, h) { tintTo = t.slice(); if (h) hiTo = h.slice(); },
    getState: function () { return { tint: tint.slice(), hi: hi.slice() }; },
    setIntro: function (v) { introTo = v; },
    setLight: function (v) { lightTo = v; }
  };
})();
/* VOXA. for Webflow — interactions keyed on data-vx-* attributes (classes stay native Webflow) */
(function () {
  "use strict";
  var d = document, body = d.body, html = d.documentElement;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var V = (window.VOXA = window.VOXA || {});
  var wrap = $("[data-vx-page]");
  var page = wrap ? wrap.getAttribute("data-vx-page") : "home";
  html.classList.add("vx-live");
  body.classList.add("vx-body", "vx-" + page);
  if (page !== "home") body.classList.add("vx-on-light");

  /* ---------- Fluid (home only) ---------- */
  var canvas = $("[data-vx-fluid]"), fromInner = false;
  try { fromInner = !!sessionStorage.getItem("voxa-fluid"); } catch (e) {}
  if (canvas && window.Fluid && page === "home") {
    var prev = null;
    try { prev = JSON.parse(sessionStorage.getItem("voxa-fluid") || "null"); } catch (e) {}
    Fluid.init(canvas, { tint: [0.05, 0.05, 0.07], hi: [0.62, 0.62, 0.72], from: prev, intro: !prev });
  } else if (canvas) canvas.style.display = "none";

  /* ---------- Page transitions (inside /voxa/ only; library.js handles the rest) ---------- */
  body.classList.add("vx-is-loading");
  requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.remove("vx-is-loading"); }); });
  d.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("/voxa/") !== 0) return;
    var u = new URL(href, location.href);
    if (u.pathname === location.pathname && u.hash) return;
    e.preventDefault();
    if (window.Fluid && Fluid.getState && page === "home") try { sessionStorage.setItem("voxa-fluid", JSON.stringify(Fluid.getState())); } catch (er) {}
    body.classList.remove("vx-menu-open");
    body.classList.add("vx-is-leaving");
    setTimeout(function () { location.href = href; }, reduce ? 0 : 450);
  });
  addEventListener("pageshow", function (e) { if (e.persisted) body.classList.remove("vx-is-leaving"); });

  /* ---------- Clock (Milan) ---------- */
  var clocks = $$("[data-vx-clock]");
  function tick() { var s = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "Europe/Rome" }); clocks.forEach(function (c) { c.textContent = s; }); }
  tick(); setInterval(tick, 15000);

  /* ---------- Theme toggle (light chrome fluid) ---------- */
  $$("[data-vx-theme]").forEach(function (b) {
    b.setAttribute("role", "button"); b.tabIndex = 0;
    b.addEventListener("click", function () { var on = html.classList.toggle("vx-fluid-light"); if (window.Fluid) Fluid.setLight(on ? 1 : 0); });
  });

  /* ---------- Mobile menu ---------- */
  $$("[data-vx-burger]").forEach(function (b) {
    b.setAttribute("role", "button"); b.tabIndex = 0;
    b.addEventListener("click", function () { var open = body.classList.toggle("vx-menu-open"); b.setAttribute("aria-expanded", open); });
  });

  /* ---------- Active nav ---------- */
  $$("[data-vx-nav] a").forEach(function (a) { if (a.pathname === location.pathname && !a.hash) { a.setAttribute("data-active", ""); a.parentNode.setAttribute("data-has-active", ""); } });

  /* ---------- Cursor ---------- */
  if (fine) {
    var cur = d.createElement("div");
    cur.className = "vx-cursor";
    cur.innerHTML = '<span class="vx-cursor_dot"></span><svg class="vx-cursor_ring" viewBox="0 0 48 48"><circle cx="24" cy="24" r="23"/></svg>';
    body.appendChild(cur);
    var x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("pointermove", function (e) { x = e.clientX; y = e.clientY; cur.classList.remove("is-hidden"); }, { passive: true });
    d.addEventListener("pointerleave", function () { cur.classList.add("is-hidden"); });
    (function loop() { cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; cur.style.transform = "translate3d(" + cx + "px," + cy + "px,0)"; requestAnimationFrame(loop); })();
    d.addEventListener("pointerover", function (e) {
      var t = e.target.closest("a, button, label, [data-btn], [data-vx-theme], [data-vx-burger], [data-vx-tab], [data-vx-chip]");
      cur.classList.toggle("is-link", !!t && !t.closest("[data-vx-nav], [data-cursor='none']"));
    });
  }

  /* ---------- Scramble ---------- */
  var GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789#%&*+=<>/";
  function scrambleWord(el, dur) {
    var fin = el.getAttribute("data-final"), start = performance.now();
    return new Promise(function (res) {
      (function step(now) {
        var k = Math.min((now - start) / dur, 1), out = "", rv = Math.floor(k * fin.length);
        for (var i = 0; i < fin.length; i++) out += i < rv || fin[i] === " " ? fin[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        el.textContent = out; el.style.opacity = Math.min(1, k * 3);
        if (k < 1) requestAnimationFrame(step); else res();
      })(start);
    });
  }
  V.scramble = function (el, o) {
    o = o || {};
    if (!el.hasAttribute("data-prepared")) {
      var words = el.textContent.trim().split(/(\s+)/);
      el.innerHTML = "";
      words.forEach(function (w) {
        if (/^\s+$/.test(w)) { el.appendChild(d.createTextNode(" ")); return; }
        var s = d.createElement("span"); s.className = "vx-w"; s.setAttribute("data-final", w); s.textContent = w; s.style.opacity = 0; el.appendChild(s);
      });
      el.setAttribute("data-prepared", "");
    }
    el.setAttribute("data-go", "");
    var ws = $$(".vx-w", el), gap = o.gap || 120, dur = o.dur || 520;
    if (reduce) { ws.forEach(function (w) { w.textContent = w.getAttribute("data-final"); w.style.opacity = 1; }); return Promise.resolve(); }
    return Promise.all(ws.map(function (w, i) { return new Promise(function (r) { setTimeout(function () { scrambleWord(w, dur).then(r); }, i * gap); }); }));
  };
  $$("[data-vx-scramble]:not([data-vx-manual])").forEach(function (el, i) { setTimeout(function () { V.scramble(el, { gap: 70, dur: 600 }); }, 250 + i * 150); });

  /* ---------- Fade words ---------- */
  $$("[data-vx-words]").forEach(function (el) {
    var parts = el.textContent.trim().split(/\s+/);
    el.innerHTML = parts.map(function (w, i) { return '<span style="opacity:0;transition:opacity .6s ' + (0.5 + i * 0.025).toFixed(3) + 's">' + w + "</span>"; }).join(" ");
    requestAnimationFrame(function () { requestAnimationFrame(function () { $$("span", el).forEach(function (s) { s.style.opacity = 1; }); }); });
  });

  /* ---------- Reveal ---------- */
  var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.setAttribute("data-in", ""); io.unobserve(e.target); } }); }, { threshold: 0.15 });
  $$("[data-vx-reveal]").forEach(function (el) { io.observe(el); });

  /* ---------- Smooth scroll (desktop, not on home) ---------- */
  var sy = scrollY, ty = scrollY, smoothing = false;
  if (fine && !reduce && page !== "home") {
    addEventListener("wheel", function (e) {
      if (e.ctrlKey || body.classList.contains("vx-menu-open") || e.target.closest("[data-native-scroll], [data-vx-dd]")) return;
      e.preventDefault();
      ty = Math.max(0, Math.min(html.scrollHeight - innerHeight, ty + e.deltaY));
      if (!smoothing) { smoothing = true; sy = scrollY; requestAnimationFrame(smooth); }
    }, { passive: false });
    addEventListener("scroll", function () { if (!smoothing) { sy = ty = scrollY; } }, { passive: true });
  }
  function smooth() { sy += (ty - sy) * 0.1; if (Math.abs(ty - sy) < 0.5) { sy = ty; smoothing = false; } scrollTo(0, sy); if (smoothing) requestAnimationFrame(smooth); }

  /* ---------- Scroll-driven big line ---------- */
  var lines = $$("[data-vx-bigline]");
  function lineLoop() {
    var vh = innerHeight;
    lines.forEach(function (l) {
      var r = l.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
      var t = l.firstElementChild, p = (vh - r.top) / (vh + r.height), dist = t.scrollWidth - innerWidth;
      t.style.transform = "translate3d(" + (-p * dist * 1.05 + innerWidth * 0.15) + "px,0,0)";
    });
    requestAnimationFrame(lineLoop);
  }
  if (lines.length) requestAnimationFrame(lineLoop);

  /* ---------- Marquee + year ---------- */
  $$("[data-vx-marquee]").forEach(function (t) { t.innerHTML += t.innerHTML; });
  $$("[data-vx-year]").forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* ---------- Home: intro, industry panels, mobile industries ---------- */
  if (page === "home") {
    var title = $("[data-vx-scramble][data-vx-manual]");
    var t = fromInner ? [0, 300, 1200] : [250, 1900, 3400];
    setTimeout(function () { if (window.Fluid) Fluid.setIntro(1); }, t[0]);
    setTimeout(function () { if (title) V.scramble(title, { gap: 260, dur: 650 }); }, t[1]);
    setTimeout(function () { body.classList.add("vx-is-ready"); }, t[2]);
    try { sessionStorage.removeItem("voxa-fluid"); } catch (e) {}
    var panels = $$("[data-vx-panel]"), timer;
    $$("[data-vx-ind]").forEach(function (a) {
      function on() { clearTimeout(timer); panels.forEach(function (p) { p.toggleAttribute("data-on", p.getAttribute("data-vx-panel") === a.getAttribute("data-vx-ind")); }); body.classList.add("vx-is-focus"); }
      function off() { timer = setTimeout(function () { panels.forEach(function (p) { p.removeAttribute("data-on"); }); body.classList.remove("vx-is-focus"); }, 120); }
      a.addEventListener("pointerenter", on); a.addEventListener("focus", on);
      a.addEventListener("pointerleave", off); a.addEventListener("blur", off);
    });
    var pill = $("[data-vx-mpill]");
    if (pill) { pill.setAttribute("role", "button"); pill.tabIndex = 0; pill.addEventListener("click", function () {
      var open = body.classList.toggle("vx-show-ind"), lbl = $("[data-vx-mpill-label]", pill);
      if (lbl) lbl.textContent = open ? "Hide Industries" : "Show Industries";
      pill.setAttribute("aria-expanded", open);
    }); }
  }

  /* ---------- Video placeholder ---------- */
  $$("[data-vx-video]").forEach(function (box) {
    var v = $("video", box), btn = $("[data-vx-play]", box);
    if (!btn) return;
    if (v) { v.muted = true; v.addEventListener("click", function () { v.pause(); box.removeAttribute("data-playing"); }); }
    btn.addEventListener("click", function () {
      if (!v || !(v.currentSrc || v.getAttribute("src"))) { box.setAttribute("data-playing", ""); setTimeout(function () { box.removeAttribute("data-playing"); }, 1600); return; }
      if (v.paused) { v.play(); box.setAttribute("data-playing", ""); } else { v.pause(); box.removeAttribute("data-playing"); }
    });
  });

  /* ---------- Industry slider (drag / swipe left or click the ghost title) ---------- */
  $$("[data-vx-slider]").forEach(function (sl) {
    var slides = $$("[data-vx-slide]", sl), titles = $("[data-vx-titles]", sl), ghost = $("[data-vx-next]", sl), count = $("[data-vx-count]", sl);
    if (!slides.length) return;
    var i = 0, x0 = null, busy = false;
    var h = (location.hash || "").slice(1);
    slides.forEach(function (s, k) { if (s.getAttribute("data-vx-slide") === h) i = k; });
    var cur = $("[data-vx-cur]", sl);
    function name(k) { return slides[(k + slides.length) % slides.length].getAttribute("data-name") || ""; }
    function show(k) {
      i = (k + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.toggleAttribute("data-on", n === i); });
      sl.style.setProperty("--hi", slides[i].getAttribute("data-hi") || "#4e71ff");
      sl.style.setProperty("--lo", slides[i].getAttribute("data-lo") || "#101030");
      if (ghost) ghost.textContent = name(i + 1);
      if (count) count.textContent = ("0" + (i + 1)).slice(-2) + " / " + ("0" + slides.length).slice(-2);
      if (cur) { cur.removeAttribute("data-prepared"); cur.removeAttribute("data-go"); cur.textContent = name(i); V.scramble(cur, { gap: 70, dur: 500 }); }
    }
    function go() {
      if (busy) return; busy = true;
      sl.setAttribute("data-leave", "");
      setTimeout(function () { sl.removeAttribute("data-leave"); titles.style.transition = "none"; titles.style.transform = ""; show(i + 1); requestAnimationFrame(function () { titles.style.transition = ""; busy = false; }); }, 600);
    }
    show(i);
    if (h && slides.some(function (s) { return s.getAttribute("data-vx-slide") === h; })) setTimeout(function () { sl.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }, 400);
    sl.addEventListener("pointerdown", function (e) { if (e.target.closest("a, [data-vx-next]")) return; x0 = e.clientX; sl.setAttribute("data-drag", ""); try { sl.setPointerCapture(e.pointerId); } catch (er) {} });
    sl.addEventListener("pointermove", function (e) { if (x0 === null || busy) return; var dx = Math.min(0, e.clientX - x0); titles.style.transition = "none"; titles.style.transform = "translateX(" + dx * 0.6 + "px)"; });
    function end(e) { if (x0 === null) return; var dx = e.clientX - x0; x0 = null; sl.removeAttribute("data-drag"); titles.style.transition = ""; titles.style.transform = ""; if (dx < -80) go(); }
    sl.addEventListener("pointerup", end); sl.addEventListener("pointercancel", end);
    if (ghost) { ghost.setAttribute("role", "button"); ghost.tabIndex = 0; ghost.addEventListener("click", function (e) { e.preventDefault(); go(); }); }
  });

  /* ---------- Contact: native Webflow form (tabs, chips, validation) ---------- */
  var form = $("[data-vx-form]");
  if (form) {
    var tabs = $$("[data-vx-tab]"), panes = $$("[data-vx-pane]", form), inq = $("[data-vx-inquiry]", form);
    function setTab(k, push) {
      if (!$('[data-vx-pane="' + k + '"]', form)) k = "business";
      body.setAttribute("data-tab", k);
      tabs.forEach(function (t) { var on = t.getAttribute("data-vx-tab") === k; t.toggleAttribute("data-on", on); t.setAttribute("aria-selected", on); if (on && inq) inq.value = t.textContent.trim(); });
      panes.forEach(function (p) { var off = p.getAttribute("data-vx-pane") !== k; p.hidden = off; $$("input, select, textarea", p).forEach(function (f) { f.disabled = off; }); });
      if (push) history.replaceState(null, "", "?c=" + k);
    }
    tabs.forEach(function (t) { t.setAttribute("role", "tab"); t.tabIndex = 0; t.addEventListener("click", function () { setTab(t.getAttribute("data-vx-tab"), true); }); });
    setTab(new URLSearchParams(location.search).get("c") || "business");
    $$("[data-vx-chip]", form).forEach(function (c) {
      var box = $("input[type=checkbox]", c);
      if (box) box.addEventListener("change", function () { c.toggleAttribute("data-on", box.checked); var cell = c.closest("[data-vx-cell]"); if (cell) cell.removeAttribute("data-error"); });
    });
    function clear(e) { var c = e.target.closest("[data-vx-cell]"); if (c) c.removeAttribute("data-error"); }
    form.addEventListener("input", clear); form.addEventListener("change", clear);
    // validate in the capture phase, before Webflow's own submit handler
    d.addEventListener("submit", function (e) {
      if (e.target !== form) return;
      var pane = $('[data-vx-pane="' + body.getAttribute("data-tab") + '"]', form), ok = true;
      $$("[data-required]", pane).forEach(function (c) {
        var ty = c.getAttribute("data-required"), bad;
        if (ty === "chips") bad = !$("input[type=checkbox]:checked", c);
        else if (ty === "select") bad = !$("select", c).value;
        else bad = !$("input, textarea", c).value.trim();
        c.toggleAttribute("data-error", bad); if (bad) ok = false;
      });
      var bar = $("[data-vx-bar]", form), mail = $("input[type=email]", bar);
      if (!/^\S+@\S+\.\S+$/.test(mail.value)) { ok = false; bar.removeAttribute("data-error"); void bar.offsetWidth; bar.setAttribute("data-error", ""); mail.placeholder = "Please enter a valid email"; }
      if (!ok) { e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation(); }
    }, true);
  }
})();

/* FarReach (Amri Webflow Library 05) — behaviour on native Webflow markup.
   Ported from sayyidaamri/300feetout.com (site.js, components.js, home.js, pages.js). */
(function () {
  "use strict";
  var doc = document.documentElement;
  var root = document.querySelector(".page-wrapper.is-fr");
  if (!root) return;
  doc.classList.add("fr-live");
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = function () { return window.innerWidth < 768; };
  var clamp = function (v, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeIO = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var ARROW = '<svg viewBox="0 0 18 16" aria-hidden="true"><path d="M10 0.9 17.1 8 10 15.1 8.4 13.5 12.8 9.1H0.9V6.9H12.8L8.4 2.5Z" fill="currentColor"/></svg>';
  var STAR = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M44 0h12v35.5L81.1 10.4l8.5 8.5L64.5 44H100v12H64.5l25.1 25.1-8.5 8.5L56 64.5V100H44V64.5L18.9 89.6l-8.5-8.5L35.5 56H0V44h35.5L10.4 18.9l8.5-8.5L44 35.5z"/></svg>';
  var VBASE = "https://cdn.jsdelivr.net/gh/sayyidaamri/amri-webflow-library@01a3350012ac82806e6072e8ed61d4bd50482d45/dist/sites/farreach/video/";
  var hooks = [];
  var addScroll = function (fn) { hooks.push(fn); fn(); };
  var heroActive = function () { return false; };
  var toPath = function (u) { try { var x = new URL(u, location.href); return x.origin === location.origin || /webflow\.io$/.test(x.hostname) ? x.pathname + x.search + x.hash : u; } catch (e) { return u; } };

  /* ---------- absolute links from CMS -> same-origin paths ---------- */
  $$("a[href^='http']", root).forEach(function (a) { var h = a.getAttribute("href"); if (/amri-library\.webflow\.io/.test(h)) a.setAttribute("href", toPath(h)); });

  /* ---------- arrows ---------- */
  $$(".fr-arrow", root).forEach(function (a) { var n = a.querySelectorAll("svg").length; if (n === 0) a.innerHTML = ARROW + ARROW; else if (n === 1) a.insertAdjacentHTML("beforeend", ARROW); });

  /* ---------- video helpers ---------- */
  function ensureSrc(v) { if (v && v.tagName === "VIDEO" && !v.getAttribute("src") && v.dataset.src) { v.src = v.dataset.src; v.load(); } }
  function play(v) { if (v && v.tagName === "VIDEO") { ensureSrc(v); var p = v.play(); if (p) p.catch(function () {}); } }
  var vio = new IntersectionObserver(function (es) { es.forEach(function (e) { var v = e.target; var host = v.closest(".fr-stack_item"); var on = !host || host.classList.contains("is-on"); if (e.isIntersecting && on) play(v); else if (!e.isIntersecting) v.pause(); }); });
  // turn every [data-fr-video] into poster image + lazy <video>
  $$("[data-fr-video]", root).forEach(function (box) {
    var url = box.getAttribute("data-fr-video"); if (!url) return;
    if (url.indexOf("/") < 0) url = VBASE + url + ".mp4";
    var img = box.querySelector("img");
    var v = document.createElement("video");
    v.className = "fr-video"; v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.setAttribute("muted", ""); v.preload = "none";
    if (img && img.getAttribute("src")) v.poster = img.currentSrc || img.src;
    v.dataset.src = url;
    box.appendChild(v);
    if (!box.closest(".fr-fly")) vio.observe(v);
  });
  function itemVideo(it) { return it && it.querySelector("video"); }
  function showIndex(box, idx) {
    var items = $$(":scope > .fr-stack_item", box);
    items.forEach(function (m, i) {
      var v = itemVideo(m);
      if (i === idx) { m.classList.add("is-on"); if (v) play(v); }
      else { m.classList.remove("is-on"); if (v) setTimeout(function () { if (!m.classList.contains("is-on")) v.pause(); }, 950); }
    });
    var nx = items[(idx + 1) % items.length]; if (nx && itemVideo(nx)) ensureSrc(itemVideo(nx));
  }
  $$(".fr-slot[data-fr-every]", root).forEach(function (slot) {
    var n = $$(":scope > .fr-stack_item", slot).length, i = 0, every = +slot.getAttribute("data-fr-every") || 2500;
    if (n > 1 && !reduce) setInterval(function () { if (!document.hidden) showIndex(slot, (i = (i + 1) % n)); }, every);
  });

  /* ---------- letter swap ---------- */
  function splitWord(text, cls) {
    var w = document.createElement("span"); w.className = "word";
    Array.prototype.forEach.call(text, function (c) { var s = document.createElement("span"); s.className = "ch" + (cls ? " " + cls : ""); s.textContent = c === " " ? " " : c; w.appendChild(s); });
    return w;
  }
  function initCycle(el) { var t = el.textContent.trim(); el.textContent = ""; el.appendChild(splitWord(t)); el.setAttribute("aria-label", t); }
  function swapWord(el, text) {
    if (!el.querySelector(".word")) initCycle(el);
    el.setAttribute("aria-label", text);
    var old = el.querySelector(".word:not(.leaving)");
    if (reduce) { el.textContent = ""; el.appendChild(splitWord(text)); return; }
    if (old) { old.classList.add("leaving"); Array.prototype.forEach.call(old.children, function (c, i) { setTimeout(function () { c.classList.add("out"); }, i * 22); }); setTimeout(function () { old.remove(); }, 900 + old.children.length * 22); }
    var nw = splitWord(text, "in"); el.appendChild(nw); void nw.offsetWidth;
    Array.prototype.forEach.call(nw.children, function (c, i) { setTimeout(function () { c.classList.remove("in"); }, 120 + i * 28); });
  }

  /* ---------- fly boxes ---------- */
  function placeFly(el, r) { el.style.transform = "translate3d(" + r.x + "px," + r.y + "px,0)"; el.style.width = r.w + "px"; el.style.height = r.h + "px"; }
  function docRect(el) { var r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; }
  function mix(a, b, t) { return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) }; }
  function flyOrigin(el) { var p = el.offsetParent; if (!p || p === document.body || p === doc) return { x: 0, y: 0 }; var r = p.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY }; }
  function placeFlyDoc(el, r) { var o = flyOrigin(el); placeFly(el, { x: r.x - o.x, y: r.y - o.y, w: r.w, h: r.h }); }

  /* ---------- header ---------- */
  var header = $(".fr-header", root);
  var nav = $(".fr-nav", root), navArea = $(".fr-nav_area", root), menuLabel = $(".fr-nav_menu", root);
  $$(".fr-nav_link", root).forEach(function (a) { if (a.getAttribute("href") && toPath(a.href) === location.pathname) a.setAttribute("aria-current", "page"); });
  if (nav && navArea) {
    var closeT;
    var open = function (v) { nav.classList.toggle("open", v); if (menuLabel) menuLabel.setAttribute("aria-expanded", v); };
    navArea.addEventListener("mouseenter", function () { clearTimeout(closeT); if (header.classList.contains("compact")) open(true); });
    navArea.addEventListener("mouseleave", function () { closeT = setTimeout(function () { open(false); }, 250); });
    if (menuLabel) { menuLabel.setAttribute("role", "button"); menuLabel.tabIndex = 0; menuLabel.addEventListener("click", function () { open(!nav.classList.contains("open")); }); }
    nav.addEventListener("focusin", function () { open(true); });
  }
  var burger = $(".fr-burger", root);
  if (burger) {
    burger.setAttribute("role", "button"); burger.tabIndex = 0;
    var tog = function () { var v = !root.classList.contains("fr-menu-open"); root.classList.toggle("fr-menu-open", v); burger.setAttribute("aria-expanded", v); };
    burger.addEventListener("click", tog);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && root.classList.contains("fr-menu-open")) tog(); });
    $$(".fr-nav_link", root).forEach(function (a) { a.addEventListener("click", function () { root.classList.remove("fr-menu-open"); }); });
  }

  /* ---------- cursor ---------- */
  if (window.matchMedia("(hover: hover)").matches && !isMobile()) {
    var cursor = document.createElement("div"); cursor.className = "fr-cursor"; cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = '<div class="fr-cursor_dot"><span></span></div>'; document.body.appendChild(cursor);
    var lab = cursor.querySelector("span"), mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener("mouseleave", function () { cursor.classList.add("hide"); });
    document.addEventListener("mouseenter", function () { cursor.classList.remove("hide"); });
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest ? e.target.closest("[data-cursor]") : null;
      if (t) { lab.textContent = t.getAttribute("data-cursor"); cursor.classList.add("label"); cursor.classList.toggle("dark", t.hasAttribute("data-cursor-dark")); }
      else cursor.classList.remove("label", "dark");
    });
    (function loop() { cx += (mx - cx) * (reduce ? 1 : 0.18); cy += (my - cy) * (reduce ? 1 : 0.18); cursor.style.transform = "translate3d(" + cx + "px," + cy + "px,0)"; requestAnimationFrame(loop); })();
  }

  /* ---------- reveal ---------- */
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
  $$("[data-fr-rv]", root).forEach(function (el) { io.observe(el); });

  /* ---------- logos marquee ---------- */
  $$(".fr-logo_track", root).forEach(function (t) { $$(":scope > *", t).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute("aria-hidden", "true"); t.appendChild(k); }); });

  /* ---------- big marquee ---------- */
  $$(".section_fr-bm", root).forEach(function (sec) {
    var track = $(".fr-bm_track", sec), first = track && track.firstElementChild; if (!first) return;
    if (!first.querySelector("svg")) first.insertAdjacentHTML("beforeend", STAR);
    for (var i = 0; i < 3; i++) { var k = first.cloneNode(true); k.setAttribute("aria-hidden", "true"); track.appendChild(k); }
    addScroll(function () {
      var r = sec.getBoundingClientRect(), w = first.offsetWidth || 1, t = (innerHeight - r.top) * 0.9, x = -((t % w) + w) % w;
      track.style.transform = "translate3d(" + (x - w * 0.15) + "px,0,0)";
    });
  });

  /* ---------- case cards: chips + cursor ---------- */
  $$(".fr-card", root).forEach(function (c) {
    c.setAttribute("data-cursor", "view case"); c.setAttribute("draggable", "false");
    var s = $(".fr-card_services", c);
    if (s && !s.dataset.done) { var list = s.textContent.split(",").map(function (x) { return x.trim(); }).filter(Boolean); s.innerHTML = list.map(function (x) { return '<span class="fr-chip">' + x + "</span>"; }).join(""); s.dataset.done = 1; }
    $$("img", c).forEach(function (i) { i.setAttribute("draggable", "false"); });
  });
  // case template: hide the current case from "more cases"
  $$(".fr-rail .fr-card", root).forEach(function (c) { if (toPath(c.href) === location.pathname) { var it = c.closest(".w-dyn-item") || c; it.style.display = "none"; } });

  /* ---------- rail: scroll-linked + drag (desktop) ---------- */
  $$(".fr-rail_wrap", root).forEach(function (wrap) {
    var rail = $(".fr-rail", wrap); if (!rail) return;
    var drag = 0, dragging = false, x0 = 0, moved = 0;
    function lay() {
      if (isMobile()) { rail.style.transform = ""; return; }
      var r = wrap.getBoundingClientRect(), vh = innerHeight, vw = doc.clientWidth;
      var max = Math.max(0, rail.scrollWidth - vw + parseFloat(getComputedStyle(wrap).paddingLeft) * 2);
      var q = clamp((vh - r.top) / (vh + r.height));
      drag = clamp(drag, -max, max);
      rail.style.transform = "translate3d(" + clamp(-q * max * 0.85 + drag, -max, 0) + "px,0,0)";
    }
    wrap.addEventListener("pointerdown", function (e) { if (isMobile() || e.pointerType === "touch") return; dragging = true; moved = 0; x0 = e.clientX; wrap.classList.add("drag"); });
    addEventListener("pointermove", function (e) { if (!dragging) return; var d = e.clientX - x0; x0 = e.clientX; drag += d; moved += Math.abs(d); lay(); });
    addEventListener("pointerup", function () { dragging = false; wrap.classList.remove("drag"); });
    wrap.addEventListener("click", function (e) { if (moved > 6) { e.preventDefault(); moved = 0; } }, true);
    wrap.addEventListener("dragstart", function (e) { e.preventDefault(); });
    addScroll(lay);
  });

  /* ---------- services slider ---------- */
  var C = 224;
  var petals = function (n, rx, ry, d) { var s = ""; for (var i = 0; i < n; i++) s += '<ellipse cx="' + C + '" cy="' + (C - d) + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + (360 / n) * i + " " + C + " " + C + ')"/>'; return s; };
  var rays = function (n, w, l, r0) { var s = ""; for (var i = 0; i < n; i++) s += '<rect x="' + (C - w / 2) + '" y="' + (C - r0 - l) + '" width="' + w + '" height="' + l + '" rx="' + w / 2 + '" transform="rotate(' + (360 / n) * i + " " + C + " " + C + ')"/>'; return s; };
  var SHAPES = [
    '<svg viewBox="0 0 448 448"><circle cx="224" cy="118" r="106"/><circle cx="224" cy="330" r="106"/><circle cx="118" cy="224" r="106"/><circle cx="330" cy="224" r="106"/><circle cx="224" cy="224" r="80"/></svg>',
    '<svg viewBox="0 0 448 448"><circle cx="224" cy="224" r="96"/>' + rays(12, 30, 72, 122) + "</svg>",
    '<svg viewBox="0 0 448 448">' + petals(6, 62, 112, 104) + '<circle cx="224" cy="224" r="56"/></svg>',
    '<svg viewBox="0 0 448 448"><path d="M24 224a200 200 0 0 1 400 0z"/><path d="M84 330a140 140 0 0 1 280 0z"/><path d="M144 424a80 80 0 0 1 160 0z"/></svg>',
    '<svg viewBox="0 0 448 448"><path d="M224 24c40 80 120 160 200 200-80 40-160 120-200 200-40-80-120-160-200-200 80-40 160-120 200-200z"/></svg>',
    '<svg viewBox="0 0 448 448"><path d="M224 40a184 184 0 1 1 0 368 92 92 0 0 1 0-184 92 92 0 0 0 0-184z"/><circle cx="224" cy="132" r="40"/></svg>'
  ];
  $$(".fr-svc_row", root).forEach(function (row) {
    var slides = $$(".fr-svc", row), counter = $(".fr-counter", row), box = $(".fr-svc_shape", row);
    if (!slides.length || !counter) return;
    var si = Math.max(0, slides.findIndex(function (s) { return s.classList.contains("is-on"); }));
    var cur = $("[data-fr-prev] .fr-counter_num", counter), tot = $("[data-fr-next] .fr-counter_num", counter);
    if (tot) tot.textContent = String(slides.length).padStart(2, "0");
    if (box) box.innerHTML = SHAPES[0];
    function go(n) {
      n = (n + slides.length) % slides.length; if (n === si) return;
      slides[si].classList.remove("is-on"); slides[n].classList.add("is-on");
      if (box) {
        var old = box.querySelector("svg:not(.out)"); if (old) { old.classList.add("out"); setTimeout(function () { old.remove(); }, 1100); }
        box.insertAdjacentHTML("beforeend", SHAPES[n % SHAPES.length]);
        var nw = box.lastElementChild; nw.classList.add("pre"); void nw.getBoundingClientRect(); nw.classList.remove("pre");
      }
      if (cur) { cur.textContent = String(n + 1).padStart(2, "0"); cur.classList.remove("roll"); void cur.offsetWidth; cur.classList.add("roll"); }
      si = n;
    }
    var t;
    var reset = function () { clearInterval(t); if (!reduce) t = setInterval(function () { var r = counter.getBoundingClientRect(); if (!document.hidden && r.top < innerHeight && r.bottom > 0) go(si + 1); }, 5500); };
    $$("[data-fr-prev],[data-fr-next]", counter).forEach(function (b) {
      b.setAttribute("role", "button"); b.tabIndex = 0;
      var f = function () { go(si + (b.hasAttribute("data-fr-prev") ? -1 : 1)); reset(); };
      b.addEventListener("click", f); b.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); f(); } });
    });
    var sx = null;
    row.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    row.addEventListener("touchend", function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) { go(si + (dx < 0 ? 1 : -1)); reset(); } sx = null; });
    reset();
  });

  /* ---------- stats (rolling digits) ---------- */
  $$(".section_fr-stats", root).forEach(function (sec) {
    var cols = $$(".fr-stat", sec);
    var list = $$(".fr-stat_src", sec).map(function (s) { return [s.getAttribute("data-num"), s.getAttribute("data-label"), s.getAttribute("data-client"), s.getAttribute("data-href")]; });
    if (!cols.length || !list.length) return;
    function set(col, s, animate) {
      var num = $(".fr-stat_num", col), chars = Array.from(s[0]);
      if (!num.querySelector(".d")) num.textContent = "";
      while (num.children.length < chars.length) { var d = document.createElement("span"); d.className = "d"; d.innerHTML = "<b></b>"; num.appendChild(d); }
      while (num.children.length > chars.length) num.lastElementChild.remove();
      chars.forEach(function (ch, i) {
        var d = num.children[i], c = d.querySelector("b:not(.leave)");
        if (c.textContent === ch) return;
        if (!animate || !c.textContent) { c.textContent = ch; return; }
        c.classList.add("leave"); setTimeout(function () { c.remove(); }, 950);
        var nb = document.createElement("b"); nb.className = "enter"; nb.textContent = ch; d.appendChild(nb); void nb.offsetWidth;
        setTimeout(function () { nb.classList.remove("enter"); }, i * 70);
      });
      var label = $(".fr-stat_label", col), link = $(".fr-stat_link", col), nm = link && $(".fr-stat_client", link);
      var apply = function () { label.textContent = s[1]; if (nm) nm.textContent = s[2]; if (link && s[3]) link.setAttribute("href", s[3]); label.classList.remove("fade"); link && link.classList.remove("fade"); };
      if (animate) { label.classList.add("fade"); link && link.classList.add("fade"); setTimeout(apply, 450); } else apply();
    }
    var idx = cols.map(function (_, i) { return i; });
    cols.forEach(function (c, i) { if (list[i]) set(c, list[i], false); });
    if (!reduce && list.length > cols.length) setInterval(function () {
      var r = sec.getBoundingClientRect(); if (document.hidden || r.top > innerHeight || r.bottom < 0) return;
      cols.forEach(function (c, i) { setTimeout(function () { idx[i] = (idx[i] + cols.length) % list.length; set(c, list[idx[i]], true); }, i * 380); });
    }, 5000);
  });

  /* ---------- home hero: intro + cycling words + flying video ---------- */
  var hero = $(".section_fr-hero", root), flyHero = $("[data-fr-fly='hero']", root), slotHero = $("[data-fr-slot='hero']", root);
  if (hero && flyHero && slotHero) {
    var pairs = (hero.getAttribute("data-fr-pairs") || "").split(";").map(function (p) { return p.split("|"); }).filter(function (p) { return p.length >= 2; });
    var cycA = $("[data-fr-cycle='a']", hero), cycB = $("[data-fr-cycle='b']", hero), caseLink = $(".fr-hero_case", hero), caseName = caseLink && $(".fr-hero_case-name", caseLink);
    if (cycA) initCycle(cycA); if (cycB) initCycle(cycB);
    var caseBase = (caseLink && caseLink.getAttribute("data-fr-base")) || "/fr-work/";
    var names = {}; (hero.getAttribute("data-fr-names") || "").split(";").forEach(function (p) { var k = p.split("|"); if (k[1]) names[k[0]] = k[1]; });
    var setCase = function (id) { if (!caseLink) return; var ok = id && names[id]; caseLink.classList.toggle("off", !ok); if (ok) { caseName.textContent = names[id]; caseLink.setAttribute("href", caseBase + id); } };
    setCase(null);
    var introE = reduce ? 1 : 0;
    if (!reduce) {
      doc.classList.add("fr-intro"); flyHero.classList.add("pre");
      setTimeout(function () { flyHero.classList.remove("pre"); }, 250);
      setTimeout(function () { var s = performance.now(); (function step(now) { introE = easeIO(clamp((now - s) / 1200)); layout(); if (introE < 1) requestAnimationFrame(step); })(s); }, 1050);
      setTimeout(function () { doc.classList.remove("fr-intro"); }, 2150);
    }
    showIndex(flyHero, 0);
    var hi = 0;
    setInterval(function () {
      if (document.hidden || doc.classList.contains("fr-intro") || !pairs.length) return;
      var r = flyHero.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      hi = (hi + 1) % pairs.length;
      if (cycA) swapWord(cycA, pairs[hi][0]);
      if (cycB) setTimeout(function () { swapWord(cycB, pairs[hi][1]); }, 140);
      setCase(pairs[hi][2]);
      showIndex(flyHero, hi % $$(":scope > .fr-stack_item", flyHero).length);
    }, 4600);
    function layout() {
      var vw = doc.clientWidth, vh = innerHeight, y = scrollY;
      var full = { x: 0, y: y, w: vw, h: vh };
      var fs = parseFloat(getComputedStyle(doc).fontSize);
      var bw = isMobile() ? vw * 0.62 : 27 * fs, bh = isMobile() ? bw * 1.25 : bw * 0.625;
      var small = { x: (vw - bw) / 2, y: y + (vh - bh) / 2, w: bw, h: bh };
      var start = mix(small, full, introE);
      var p = clamp(y / (vh * 0.78));
      placeFlyDoc(flyHero, mix(start, docRect(slotHero), easeIO(p)));
      flyHero.classList.toggle("small", p > 0.04);
      hero.classList.toggle("scrolled", y > 12);
    }
    heroActive = function () { return scrollY < innerHeight * 0.06; };
    addScroll(layout);
  }

  /* ---------- inner page hero ---------- */
  var ph = $(".section_fr-phero", root);
  if (ph) {
    var media = $(".fr-phero_media", ph);
    heroActive = function () { return scrollY < 40; };
    addScroll(function () { var y = scrollY; if (media && !reduce) media.style.transform = "translate3d(0," + y * 0.35 + "px,0) scale(" + (1 + y * 0.00012) + ")"; ph.classList.toggle("scrolled", y > innerHeight * 0.32); });
    var mv = media && media.querySelector("video"); if (mv) play(mv);
    var tw = $("[data-fr-type]", ph);
    if (tw && !reduce) {
      var words = tw.getAttribute("data-fr-type").split("|"), wi = 0, speed = 70, hold = 2200;
      tw.textContent = words[0];
      var caret = document.createElement("span"); caret.className = "fr-caret"; tw.after(caret);
      var del = function () { var t = tw.textContent; if (t.length) { tw.textContent = t.slice(0, -1); setTimeout(del, speed * 0.6); } else { wi = (wi + 1) % words.length; setTimeout(type, 250); } };
      var type = function () { var w = words[wi], t = tw.textContent; if (t.length < w.length) { tw.textContent = w.slice(0, t.length + 1); setTimeout(type, speed); } else setTimeout(del, hold); };
      setTimeout(del, hold + 1200);
    }
  }
  var caseHero = $(".fr-case_hero video", root); if (caseHero) play(caseHero);

  /* ---------- work grid filters ---------- */
  var filters = $(".fr-filters", root), grid = $(".fr-grid", root);
  if (filters && grid) {
    var cards = $$(".fr-card", grid);
    var inds = ["All"]; cards.forEach(function (c) { var v = c.getAttribute("data-industry"); if (v && inds.indexOf(v) < 0) inds.push(v); });
    var box = document.createElement("div"); box.className = "fr-filter_list";
    box.innerHTML = inds.map(function (v, i) { return '<button type="button" class="fr-filter' + (i ? "" : " on") + '" data-v="' + v + '">' + v + "</button>"; }).join("");
    filters.appendChild(box);
    var empty = $(".fr-empty", root);
    $$(".fr-filter", box).forEach(function (b) { b.addEventListener("click", function () {
      $$(".fr-filter", box).forEach(function (x) { x.classList.toggle("on", x === b); });
      var v = b.dataset.v, n = 0;
      cards.forEach(function (c) { var ok = v === "All" || c.getAttribute("data-industry") === v; (c.closest(".w-dyn-item") || c).style.display = ok ? "" : "none"; if (ok) n++; });
      if (empty) empty.style.display = n ? "none" : "block";
      update();
    }); });
  }

  /* ---------- hover preview (client list) ---------- */
  $$(".fr-biglist", root).forEach(function (list) {
    if (!window.matchMedia("(hover: hover)").matches) return;
    var pv = document.createElement("div"); pv.className = "fr-preview"; pv.setAttribute("aria-hidden", "true"); pv.innerHTML = "<img alt=''>"; document.body.appendChild(pv);
    var img = pv.firstChild, x = 0, y = 0, px = 0, py = 0, on = false;
    list.addEventListener("mousemove", function (e) { x = e.clientX; y = e.clientY; });
    $$(".fr-row", list).forEach(function (row) {
      row.setAttribute("data-cursor", "open");
      row.addEventListener("mouseenter", function () { var i = row.querySelector("img"); if (!i) return; img.src = i.currentSrc || i.src; on = true; pv.classList.add("on"); });
      row.addEventListener("mouseleave", function () { on = false; pv.classList.remove("on"); });
    });
    (function loop() { px += (x - px) * 0.12; py += (y - py) * 0.12; if (on || pv.classList.contains("on")) pv.style.transform = "translate3d(" + (px + 30) + "px," + (py - 90) + "px,0) rotate(" + clamp((x - px) * 0.05, -8, 8) + "deg)"; requestAnimationFrame(loop); })();
  });

  /* ---------- contact form validation (native Webflow form) ---------- */
  var form = $(".fr-form form, form.fr-form", root);
  if (form) {
    document.addEventListener("submit", function (e) {
      if (e.target !== form) return;
      var bad = null;
      $$(".fr-field[data-req]", form).forEach(function (f) {
        var inp = f.querySelector("input,select,textarea"), v = inp ? inp.value.trim() : "";
        var err = !v || (inp.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
        f.classList.toggle("err", err); if (err && !bad) bad = inp;
      });
      if (bad) { e.preventDefault(); e.stopImmediatePropagation(); bad.focus(); bad.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }); }
    }, true);
    $$(".fr-field input,.fr-field select,.fr-field textarea", form).forEach(function (i) { i.addEventListener("input", function () { i.closest(".fr-field").classList.remove("err"); }); i.addEventListener("change", function () { i.closest(".fr-field").classList.remove("err"); }); });
  }

  /* ---------- footer: yellow page + flying media ---------- */
  var footer = $(".fr-footer", root), flyFoot = $("[data-fr-fly='foot']", root), slotFoot = $("[data-fr-slot='foot']", root), footVerb = $("[data-fr-verbs]", root);
  if (footVerb) initCycle(footVerb);
  if (footVerb && flyFoot && footer) {
    var verbs = footVerb.getAttribute("data-fr-verbs").split("|"), k = 0, nItems = $$(":scope > .fr-stack_item", flyFoot).length;
    if (!reduce) setInterval(function () {
      if (document.hidden) return; var r = footer.getBoundingClientRect(); if (r.top > innerHeight) return;
      k = (k + 1) % verbs.length; swapWord(footVerb, verbs[k]); showIndex(flyFoot, k % nItems);
    }, 2600);
  }

  /* ---------- scroll loop ---------- */
  function update() {
    var y = scrollY, vh = innerHeight;
    if (header) { header.classList.toggle("on-hero", heroActive()); header.classList.toggle("compact", y > vh * 0.72 || root.hasAttribute("data-fr-compact")); }
    if (footer) {
      var ft = footer.getBoundingClientRect().top;
      root.classList.toggle("fr-yel", ft < vh * 0.5);
      if (flyFoot && slotFoot) {
        var p = clamp((vh - ft) / (vh * 0.78)), vw = doc.clientWidth;
        var padEl = $(".padding-global.is-fr", footer) || footer; var pad = parseFloat(getComputedStyle(padEl).paddingLeft) || 0;
        var w0 = isMobile() ? vw - pad * 2 : vw * 0.725;
        var start = { x: pad, y: docRect(footer).y, w: w0, h: w0 * 0.5625 };
        placeFlyDoc(flyFoot, mix(start, docRect(slotFoot), easeIO(p)));
        if (p > 0 && !flyFoot.dataset.live) { flyFoot.dataset.live = 1; showIndex(flyFoot, 0); }
      }
    }
    hooks.forEach(function (f) { f(); });
  }
  var ticking = false;
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; update(); }); } }, { passive: true });
  addEventListener("resize", update); addEventListener("load", update);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
  update();
})();

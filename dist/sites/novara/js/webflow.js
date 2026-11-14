/* NOVARA on Webflow: turns the clean native markup into the markup the
   original scripts expect, then loads them in order.
   Loaded from the NV Footer component; the NV Header component runs the
   small boot snippet (html classes + data-page) before anything renders. */
(function () {
  "use strict";
  var me = document.currentScript || document.querySelector('script[src*="novara/js/webflow.js"]');
  var BASE = me.src.replace(/js\/webflow\.js.*$/, "");
  var VENDOR = BASE.replace(/sites\/novara\/$/, "vendor/");
  var html = document.documentElement;
  var page = html.dataset.page || "home";
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* body theme per page */
  var body = document.body;
  if (page === "about") body.classList.add("theme-dark");
  if (page === "project") {
    body.classList.add("theme-project");
    var src = document.querySelector("[data-nv-accent]");
    if (src) {
      body.style.setProperty("--accent", src.getAttribute("data-nv-accent") || "#c1ff00");
      body.style.setProperty("--pbg", src.getAttribute("data-nv-pbg") || "#121416");
    }
  }

  /* data-btn → real <button> */
  $$("[data-btn]").forEach(function (el) {
    var b = document.createElement("button");
    Array.prototype.forEach.call(el.attributes, function (a) {
      if (a.name !== "data-btn" && a.name !== "role" && a.name !== "tabindex") b.setAttribute(a.name, a.value);
    });
    if (!b.getAttribute("type")) b.setAttribute("type", "button");
    while (el.firstChild) b.appendChild(el.firstChild);
    el.parentNode.replaceChild(b, el);
  });

  /* data-style → inline style (custom properties used for staggering) */
  $$("[data-style]").forEach(function (el) { el.style.cssText += ";" + el.getAttribute("data-style"); });

  /* split helpers */
  function words(el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "w"; w.style.setProperty("--wi", i++);
            var s = document.createElement("span"); s.textContent = p; w.appendChild(s); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== "BR" && !n.classList.contains("w")) walk(n);
      });
    })(el);
  }
  function roll(el) {
    var t = el.textContent.replace(/\s+/g, " ").trim(); el.textContent = "";
    for (var i = 0; i < t.length; i++) {
      var r = document.createElement("span");
      if (t[i] === " ") { r.className = "r sp"; r.textContent = " "; }
      else {
        r.className = "r"; r.style.setProperty("--i", i);
        r.innerHTML = "<span></span><span></span>"; r.firstChild.textContent = t[i]; r.lastChild.textContent = t[i];
      }
      el.appendChild(r);
    }
  }
  function letters(el) {
    var t = el.textContent.trim(); el.textContent = "";
    for (var i = 0; i < t.length; i++) { var b = document.createElement("b"); b.style.setProperty("--li", i); b.textContent = t[i]; el.appendChild(b); }
  }
  $$('[data-split="words"]').forEach(words);
  $$('[data-split="roll"]').forEach(roll);
  $$('[data-split="letters"]').forEach(letters);
  /* .ln / .fl lines hold their text in one inner span */
  $$(".ln, .fl").forEach(function (el) {
    if (el.children.length === 0 && el.textContent.trim()) { var s = document.createElement("span"); s.textContent = el.textContent; el.textContent = ""; el.appendChild(s); }
  });

  /* CMS lists: order cards by the Order field (data-order) */
  $$(".project-list").forEach(function (l) {
    var it = Array.prototype.slice.call(l.children);
    if (!it.some(function (c) { return c.querySelector("[data-order]"); })) return;
    var n = function (c) { var e = c.querySelector("[data-order]"); return e ? parseFloat(e.getAttribute("data-order")) || 0 : 0; };
    it.sort(function (a, b) { return n(a) - n(b); }).forEach(function (c) { l.appendChild(c); });
  });

  /* CMS rail: drop empty media slots */
  $$(".pd-item video").forEach(function (v) { if (!v.getAttribute("src")) v.closest(".pd-item").remove(); });
  $$(".pd-item img").forEach(function (im) { if (!im.getAttribute("src")) im.closest(".pd-item").remove(); });
  $$("video[data-muted]").forEach(function (v) { v.muted = true; });
  var next = document.getElementById("pd-next");
  if (next) {
    if (!next.dataset.href) next.dataset.href = next.getAttribute("href");
    else if (!next.getAttribute("href") || next.getAttribute("href") === "#") next.setAttribute("href", next.dataset.href);
  }
  var st = document.createElement("style");
  st.textContent = "#pd-right .w-richtext+h4{margin-top:3.6vw}#pd-desc .w-richtext p+p{margin-top:1.1vw}"
    + "@media (max-width:767px){#menu{z-index:1}#logo,#back-btn,#header-right{z-index:2}.menu-open #menu-btn{background:#fff;color:#000}}"
    + "@media (hover:none){#menu-btn:hover{background:var(--dark-white)}#menu-btn:hover .menu-btn-dots{transform:none}html.menu-open #menu-btn{background:#fff}html.menu-open #menu-btn .menu-btn-dots{transform:rotate(90deg)}}";
  document.body.appendChild(st); // after the CSS embeds, so equal-specificity rules win

  /* same-site absolute links (CMS Link fields) → paths, so the page transition runs */
  $$('a[href^="http"]').forEach(function (a) {
    try { var u = new URL(a.href); if (u.host === location.host || /\.webflow\.io$/.test(u.host) && /^\/novara/.test(u.pathname)) a.setAttribute("href", u.pathname + u.search + u.hash); } catch (e) {}
  });

  /* active menu link */
  var path = location.pathname.replace(/\/$/, "");
  $$(".menu-link").forEach(function (a) {
    var h = (a.getAttribute("href") || "").replace(/\/$/, "");
    var on = h === path || (page === "project" && h === "/novara/work");
    a.classList.toggle("is-active", on);
  });

  /* load the original scripts in order */
  var list = [VENDOR + "three.min.js", BASE + "js/core.js", BASE + "js/fluid.js"];
  ({
    home: ["astronaut", "hero", "home", "end"],
    about: ["about", "end"],
    projects: ["end"],
    project: ["project"]
  }[page] || []).forEach(function (n) { list.push(BASE + "js/" + n + ".js"); });
  (function next() {
    var u = list.shift();
    if (!u) { /* the scripts listen for window load, which may have fired already */
      if (document.readyState === "complete") window.dispatchEvent(new Event("load"));
      return;
    }
    if (u.indexOf("three.min.js") > -1 && window.THREE) return next();
    var s = document.createElement("script"); s.src = u; s.async = false;
    s.onload = next; s.onerror = next; document.body.appendChild(s);
  })();
})();

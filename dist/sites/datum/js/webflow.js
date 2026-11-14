/* Datum on Webflow: turns the clean native markup into the markup the
   original scripts expect, then loads them in order.
   Loaded from the DT Chrome component. */
(function () {
  "use strict";
  var me = document.currentScript || document.querySelector('script[src*="datum/js/webflow.js"]');
  var BASE = me.src.replace(/js\/webflow\.js.*$/, "");
  var html = document.documentElement, body = document.body;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var path = location.pathname.replace(/\/$/, "");
  var page = /^\/dt-case\//.test(path) ? "case" : /\/work$/.test(path) ? "gallery" : /\/contact$/.test(path) ? "intro" : "home";
  html.dataset.root = BASE;
  html.dataset.page = page;
  body.classList.add("pg-" + page);

  /* data-btn -> real <button> */
  $$("[data-btn]").forEach(function (el) {
    var b = document.createElement("button");
    Array.prototype.forEach.call(el.attributes, function (a) {
      if (a.name !== "data-btn" && a.name !== "role" && a.name !== "tabindex") b.setAttribute(a.name, a.value);
    });
    if (!b.getAttribute("type")) b.setAttribute("type", "button");
    while (el.firstChild) b.appendChild(el.firstChild);
    el.parentNode.replaceChild(b, el);
  });

  /* data-vtag -> real <video> with an absolute source */
  $$("[data-vtag]").forEach(function (el) {
    var v = document.createElement("video");
    var src = el.getAttribute("data-vsrc") || "";
    Array.prototype.forEach.call(el.attributes, function (a) {
      if (!/^data-v(tag|src|attrs)$/.test(a.name)) v.setAttribute(a.name, a.value);
    });
    var f = (el.getAttribute("data-vattrs") || "").split(/\s+/);
    if (f.indexOf("muted") > -1) { v.muted = true; v.setAttribute("muted", ""); }
    if (f.indexOf("loop") > -1) v.loop = true;
    v.setAttribute("playsinline", ""); v.setAttribute("preload", "metadata");
    if (f.indexOf("data-autoplay") > -1) v.setAttribute("data-autoplay", "");
    if (src) v.src = /^https?:/.test(src) ? src : BASE + src.replace(/^assets\//, "");
    el.parentNode.replaceChild(v, el);
  });
  $$("[data-video]").forEach(function (el) {
    var s = el.getAttribute("data-video");
    if (s && !/^https?:/.test(s)) el.setAttribute("data-video", BASE + s.replace(/^assets\//, ""));
  });

  /* data-split="words" -> .sw spans; data-split="aw" -> .aw spans (data-em = word indexes, e.g. "4-6,8") */
  function words(el, own) {
    var nodes = Array.prototype.filter.call(el.childNodes, function (n) { return n.nodeType === 3; });
    var txt = (own ? nodes.map(function (n) { return n.textContent; }).join(" ") : el.textContent).trim();
    if (own) nodes.forEach(function (n) { n.remove(); }); else el.textContent = "";
    return txt.split(/\s+/).filter(Boolean);
  }
  $$('[data-split="words"]').forEach(function (el) {
    words(el, false).forEach(function (w, i) {
      if (i) el.appendChild(document.createTextNode(" "));
      var s = document.createElement("span"); s.className = "sw"; s.textContent = w; el.appendChild(s);
    });
  });
  $$('[data-split="aw"]').forEach(function (el) {
    var em = {};
    (el.getAttribute("data-em") || "").split(",").forEach(function (r) {
      var m = r.split("-"), a = parseInt(m[0], 10), b = parseInt(m[1] || m[0], 10);
      if (!isNaN(a)) for (var i = a; i <= b; i++) em[i] = 1;
    });
    words(el, true).forEach(function (w, i) {
      if (i) el.appendChild(document.createTextNode(" "));
      var s = document.createElement("span"); s.className = "aw" + (em[i] ? " is-em" : "");
      var c = em[i] && /,$/.test(w);
      s.appendChild(document.createTextNode(c ? w.slice(0, -1) : w));
      if (c) { var k = document.createElement("span"); k.className = "aw__c"; k.textContent = ","; s.appendChild(k); }
      el.appendChild(s);
    });
  });

  /* data-style -> inline style */
  $$("[data-style]").forEach(function (el) { el.style.cssText += ";" + el.getAttribute("data-style"); });

  /* same-site absolute links (CMS Link fields) -> paths */
  $$('a[href^="http"]').forEach(function (a) {
    try { var u = new URL(a.href); if (u.host === location.host) a.setAttribute("href", u.pathname + u.search + u.hash); } catch (e) {}
  });

  /* current nav item */
  $$(".nav__item").forEach(function (a) {
    var h = (a.getAttribute("href") || "").replace(/#.*$/, "").replace(/\/$/, "");
    a.classList.toggle("is-current", h === path || (page === "case" && h === "/datum/home" && false));
  });

  /* CMS rails: drop empty media */
  $$(".strips img, .chap img, .cm img").forEach(function (im) { if (!im.getAttribute("src")) { var p = im.closest("figure, .cm"); if (p) p.remove(); } });

  /* load the original scripts in order */
  var list = [BASE + "js/core.js", BASE + "js/" + (page === "home" ? "home" : "pages") + ".js"];
  (function next() {
    var u = list.shift();
    if (!u) { if (document.readyState === "complete") window.dispatchEvent(new Event("load")); return; }
    var s = document.createElement("script"); s.src = u; s.async = false;
    s.onload = next; s.onerror = next; document.body.appendChild(s);
  })();
})();

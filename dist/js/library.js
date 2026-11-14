/* Amri Webflow Library — page transitions and the way back home.
   Load it synchronously near the top of <body> on every page (home and library sites):
     <script src=".../dist/js/library.js"></script>
   - Leaving a page through AWL_TRANSITION.go(url) covers the screen with flying shards, then navigates.
   - Arriving after such a leave, the shards burst outward and reveal the page.
   - On every page except the home ("/"), a floating button leads back to the library. */
(function () {
  "use strict"
  if (window.AWL_TRANSITION) return
  var KEY = "awl-shards", BG = [10, 10, 11]
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
  var root = document.documentElement
  var cv, cx, W = 0, H = 0, DPR = 1, tiles = [], raf = 0

  function ensureCanvas() {
    if (cv) return
    cv = document.createElement("canvas")
    cv.setAttribute("aria-hidden", "true")
    cv.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483000;pointer-events:none;display:block"
    ;(document.body || root).appendChild(cv)
    cx = cv.getContext("2d")
    size()
    addEventListener("resize", size)
  }
  function size() {
    if (!cv) return
    DPR = Math.min(window.devicePixelRatio || 1, 2)
    W = innerWidth; H = innerHeight
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR)
    build()
  }
  // a grid of 4:3 cards, the same shape as the pieces of the portrait
  function build() {
    var cw = Math.max(34, Math.min(64, W / 24)), ch = cw * 0.75
    var cols = Math.ceil(W / cw) + 1, rows = Math.ceil(H / ch) + 1
    tiles = []
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var x = c * cw + cw / 2, y = r * ch + ch / 2, a = Math.random() * Math.PI * 2, s = Math.random()
      tiles.push({ x: x, y: y, w: cw, h: ch, ang: a, spin: (Math.random() - 0.5) * 2.6, far: 0.6 + Math.random() * 1.4,
        shade: 6 + Math.floor(s * s * 26), edge: Math.random() < 0.12, rnd: Math.random() })
    }
  }
  var ease = function (t) { return t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3) }
  var easeIn = function (t) { return t <= 0 ? 0 : t >= 1 ? 1 : t * t * t }

  // p: 0 = every shard away, 1 = every shard in place (the screen covered)
  function draw(p, ox, oy, mode) {
    cx.setTransform(DPR, 0, 0, DPR, 0, 0)
    cx.clearRect(0, 0, W, H)
    var maxd = Math.hypot(Math.max(ox, W - ox), Math.max(oy, H - oy)) || 1
    for (var i = 0; i < tiles.length; i++) {
      var t = tiles[i], dx = t.x - ox, dy = t.y - oy, d = Math.hypot(dx, dy) / maxd
      // shards near the origin move first when covering, last when bursting
      var delay = mode === "cover" ? (1 - d) * 0.45 + t.rnd * 0.12 : d * 0.4 + t.rnd * 0.12
      var q = Math.min(1, Math.max(0, (p - (mode === "cover" ? delay : 0)) / (1 - (mode === "cover" ? delay : 0)) ))
      if (mode !== "cover") q = 1 - Math.min(1, Math.max(0, ((1 - p) - delay) / (1 - delay)))
      if (q <= 0.001) continue
      var k = 1 - q, len = Math.hypot(dx, dy) || 1
      var px = t.x + (dx / len) * k * 260 * t.far + Math.cos(t.ang) * k * 60
      var py = t.y + (dy / len) * k * 260 * t.far + Math.sin(t.ang) * k * 60
      var sc = q < 1 ? (0.25 + 0.75 * q) * (1 + k * 1.6 * t.far) : 1
      cx.save()
      cx.globalAlpha = Math.min(1, q * 1.4)
      cx.translate(px, py); cx.rotate(t.spin * k); cx.scale(sc, sc)
      var w = t.w + 1, h = t.h + 1, g = BG[0] + t.shade * (q < 1 ? 1 : 0.25)
      cx.fillStyle = "rgb(" + g + "," + (g) + "," + (g + 1) + ")"
      cx.beginPath()
      if (q < 0.999 && cx.roundRect) cx.roundRect(-w / 2, -h / 2, w, h, Math.min(w, h) * 0.12); else cx.rect(-w / 2, -h / 2, w, h)
      cx.fill()
      if (t.edge && q < 0.999) { cx.strokeStyle = "rgba(242,242,242,.35)"; cx.lineWidth = 1 / sc; cx.stroke() }
      cx.restore()
    }
  }
  function run(mode, dur, ox, oy, done) {
    ensureCanvas()
    cancelAnimationFrame(raf)
    var t0 = performance.now()
    ;(function frame(now) {
      var t = Math.min(1, (now - t0) / dur), p = mode === "cover" ? easeIn(t * 0.35 + 0.65 * ease(t)) : 1 - ease(t)
      draw(p, ox, oy, mode)
      if (t < 1) raf = requestAnimationFrame(frame)
      else { if (mode !== "cover") { cx.clearRect(0, 0, W, H); cv.style.display = "none" } if (done) done() }
    })(t0)
  }

  function go(url, ev) {
    if (!url) return
    var ox = ev && ev.clientX != null ? ev.clientX : innerWidth / 2, oy = ev && ev.clientY != null ? ev.clientY : innerHeight / 2
    try { sessionStorage.setItem(KEY, JSON.stringify({ x: ox / innerWidth, y: oy / innerHeight, t: Date.now() })) } catch (e) {}
    if (reduced) { location.href = url; return }
    cv && (cv.style.display = "block")
    run("cover", 820, ox, oy, function () { location.href = url })
  }

  // arriving: start covered, then burst outward once the page has painted
  function arrive() {
    var s = null
    try { s = JSON.parse(sessionStorage.getItem(KEY) || "null"); sessionStorage.removeItem(KEY) } catch (e) {}
    if (!s || Date.now() - s.t > 15000 || reduced) return
    ensureCanvas()
    var ox = (s.x || 0.5) * innerWidth, oy = (s.y || 0.5) * innerHeight
    draw(1, ox, oy, "cover")
    var started = false
    var burst = function () { if (started) return; started = true; setTimeout(function () { run("reveal", 1100, innerWidth / 2, innerHeight / 2) }, 120) }
    if (document.readyState === "complete") burst(); else { addEventListener("load", burst); setTimeout(burst, 1800) }
  }
  // back/forward cache: never come back to a covered screen
  addEventListener("pageshow", function (e) { if (e.persisted && cv) { cancelAnimationFrame(raf); cx.clearRect(0, 0, W, H); cv.style.display = "none" } })

  // ---------- the floating way home ----------
  var HOME = "/"
  function homeButton() {
    if (location.pathname === "/" || document.querySelector(".awl-home")) return
    var css = document.createElement("style")
    css.textContent =
      ".awl-home{position:fixed;z-index:2147482000;left:clamp(14px,2vw,28px);bottom:clamp(14px,2vw,28px);display:inline-flex;align-items:center;gap:10px;" +
      "padding:6px 16px 6px 6px;border-radius:999px;background:rgba(10,10,11,.78);color:#f2f2f2;border:1px solid rgba(255,255,255,.18);" +
      "-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);font:500 13px/1.2 'Inter Tight','Inter',-apple-system,'Helvetica Neue',Arial,sans-serif;" +
      "letter-spacing:-.01em;text-decoration:none;box-shadow:0 10px 30px rgba(0,0,0,.25);transition:transform .35s cubic-bezier(.22,1,.36,1),border-color .3s ease,background .3s ease}" +
      ".awl-home:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.55);background:rgba(10,10,11,.92)}" +
      ".awl-home__mark{width:32px;height:32px;flex:none;display:grid;place-items:center;border-radius:50%;background:#f2f2f2;transition:transform .5s cubic-bezier(.22,1,.36,1)}" +
      ".awl-home:hover .awl-home__mark{transform:rotate(-12deg) scale(1.06)}" +
      ".awl-home__mark svg{width:17px;height:15px;display:block}" +
      ".awl-home__txt{display:flex;flex-direction:column}.awl-home__k{font-size:10.5px;color:rgba(242,242,242,.55)}" +
      "@media (max-width:767px){.awl-home{padding:5px 12px 5px 5px;gap:8px}.awl-home__mark{width:28px;height:28px}.awl-home__k{display:none}}" +
      "@media print{.awl-home{display:none}}"
    document.head.appendChild(css)
    var a = document.createElement("a")
    a.className = "awl-home"; a.href = HOME; a.setAttribute("aria-label", "Back to Amri Webflow Library")
    a.innerHTML = '<span class="awl-home__mark" aria-hidden="true"><svg viewBox="0 0 100 86"><path fill="#0a0a0b" d="M1 86 L21 86 L57 0 L40 0 Z"/><path fill="#0a0a0b" d="M51 4 L58 0 L86 86 L76 86 Z"/><path fill="#0a0a0b" d="M20 58 C47 53 76 43 100 24 L100 33 C77 51 49 62 18 67 Z"/></svg></span>' +
      '<span class="awl-home__txt"><span class="awl-home__k">Back to</span><span>Amri Webflow Library</span></span>'
    a.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return
      e.preventDefault(); go(HOME, e)
    })
    document.body.appendChild(a)
  }

  window.AWL_TRANSITION = { go: go }
  if (document.body) { arrive(); homeButton() }
  else document.addEventListener("DOMContentLoaded", function () { arrive(); homeButton() })
})()

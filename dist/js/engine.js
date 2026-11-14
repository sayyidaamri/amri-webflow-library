/* Amri Webflow Library — the portrait field (engine adapted from the amrisayyida portfolio). Started by AWL boot below. */
/* Amri Sayyida — the portrait field.
   Every piece of work is a small card in 3D space. At the start each card sits on the line from the camera through
   one cell of a halftone of the portrait, at its own depth and scaled by that depth, so together they project into
   one flat picture; any movement of the camera pulls the picture apart. Scrolling flies the camera forward without
   end: down the middle comes the work in order ("the lane"), around it a tunnel of other pieces ("the stream").
   Cards close enough can be clicked; they open in the glass box on the left.
   Data: assets/data/cosmos.js (built by tools/build.py). Plain script, no modules, so it runs from file://. */
window.AWL_RUN = function (C, ATLAS) {
  "use strict"
  var SITE = window.SITE || {}, THREE = window.THREE
  var $ = function (s) { return document.querySelector(s) }
  var params = new URLSearchParams(location.search)
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
  var DPR = Math.min(window.devicePixelRatio || 1, 2)
  var BG = [10 / 255, 10 / 255, 11 / 255]
  var D0 = C.D0, PERIOD = C.period, NIMG = C.images.length, NSEQ = C.seq.length, STRIDE = C.stride
  var NC = C.cells.length / STRIDE
  var LANE = { step: 55, h: 7.5, x: 12, y: 7, z0: 270, n: 48 }
  var STREAM_R = 150, STREAM_N = 760, MOTES = 160, MIN_CLICK_PX = 34
  var S0 = NC, L0 = S0 + STREAM_N, M0 = L0 + LANE.n, CAP = M0 + MOTES
  var cellAt = function (i, k) { return C.cells[i * STRIDE + k] }

  // deterministic random: the same place gets the same piece every time you pass it
  function rng(a, b) {
    var t = (a * 374761393 + b * 668265263) >>> 0
    return function () { t = (t + 0x6d2b79f5) >>> 0; var r = Math.imul(t ^ (t >>> 15), 1 | t); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296 }
  }
  var smooth = function (a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
  var easeIO3 = function (x) { return x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2 }

  // ---------- renderer ----------
  THREE.ColorManagement.enabled = false
  var canvas = $("#c")
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: DPR < 1.5, alpha: true, powerPreference: "high-performance" })
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace
  var scene = new THREE.Scene()
  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 8000)

  // ---------- shaders ----------
  var VERT = [
    "attribute vec4 aPos; attribute vec4 aTex; attribute vec3 aMean; attribute vec4 aLook; attribute vec4 aFrom; attribute vec4 aAnim;",
    "uniform float uFog, uGrow, uIntro, uTime, uHover, uD0, uMote, uSoft; uniform vec2 uGrid, uTilePx;",
    "varying vec2 vUv; varying vec2 vLocal; varying vec3 vMean; varying float vA; varying float vDepth; varying float vBias; varying float vDim; varying float vHover;",
    "vec2 swirl(vec2 b, float t) { return vec2(sin(b.y * .045 + t * .35) + .6 * sin((b.x + b.y) * .03 - t * .27), cos(b.x * .045 - t * .31) + .6 * cos((b.x - b.y) * .03 + t * .23)); }",
    "void main() {",
    "  vec3 base = aPos.xyz, pos = base; float h = aPos.w, s = h, kind = aTex.z, dim = aLook.y, fill = aLook.z, a = 1.0;",
    "  if (kind < 0.5) {",                       // the portrait
    "    s = h * mix(aLook.x, 1.0, uGrow * (1.0 - fill));",
    "    if (aAnim.y > 0.0) {",                  // halo: drifting in from the dark toward the silhouette, again and again
    "      float u = fract(uTime * aAnim.y + aAnim.z), o = pow(1.0 - u, 1.6), k = -base.z / uD0;",
    "      vec2 b = base.xy / k; b.y -= 10.0; float len = max(length(b), 1.0);",
    "      pos.xy = base.xy + (b / len) * o * aAnim.w * k + swirl(b, uTime + aAnim.z * 40.0) * o * aAnim.w * .35 * k;",
    "      dim *= min(1.0, u / .3) * (1.0 - max(0.0, (u - .82) / .18) * .85); s *= .6 + .4 * u;",
    "    }",
    "    if (uIntro < 0.0) a = 0.0;",
    "    else { float p = clamp((uIntro - aFrom.w) / aAnim.x, 0.0, 1.0); p = 1.0 - pow(1.0 - p, 3.0); pos = mix(aFrom.xyz, pos, p); s *= .35 + .65 * p; dim *= min(1.0, p * 1.6); }",
    "    a *= 1.0 - fill * smoothstep(0.0, 0.6, uFog);",
    "  } else if (kind < 2.5) {",                // the stream and the lane: only once you leave the portrait
    "    a *= smoothstep(.25, .9, uFog);",
    "  } else {",                                // motes: small pieces drifting in to settle into the face
    "    float u = fract((uTime * 1000.0 + aFrom.w) / aAnim.x), e = u < .5 ? 2.0 * u * u : 1.0 - pow(-2.0 * u + 2.0, 2.0) / 2.0;",
    "    pos = mix(vec3(aAnim.yzw), base, e); float kz = -pos.z / uD0;",
    "    pos.xy += swirl(pos.xy / kz, uTime + aFrom.x) * (1.0 - e) * 12.0 * kz; s = h * (1.0 - .3 * e);",
    "    dim = min(1.0, u / .3) * min(1.0, (1.0 - u) / .15) * .9; a = uMote;",
    "  }",
    "  vec4 mv = viewMatrix * vec4(pos + vec3(position.xy * s, 0.0), 1.0);",
    "  float d = -mv.z;",
    "  a *= smoothstep(s * 1.1, s * 2.6, d);",   // dissolve just before a card would fill the screen
    "  vDepth = d; vLocal = uv; vMean = aMean; vDim = dim; vA = a;",
    "  vBias = uFog * pow(smoothstep(45.0, 1150.0, d), .75) * 5.0 + uSoft * .6;",   // depth of field from smaller mip levels
    "  vec2 pad = .5 * exp2(vBias) / uTilePx + .002; vec2 ins = mix(pad, 1.0 - pad, uv);",
    "  vUv = vec2((aTex.x + ins.x) / uGrid.x, 1.0 - (aTex.y + 1.0 - ins.y) / uGrid.y);",
    "  vHover = abs(aTex.w - uHover) < .5 ? 1.0 : 0.0;",
    "  gl_Position = projectionMatrix * mv;",
    "}"].join("\n")
  var FRAG = [
    "uniform sampler2D uMap; uniform float uFog, uSoft, uIn; uniform vec3 uBg;",
    "varying vec2 vUv; varying vec2 vLocal; varying vec3 vMean; varying float vA; varying float vDepth; varying float vBias; varying float vDim; varying float vHover;",
    "float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(.06711056, .00583715)))); }",
    "void main() {",
    "  if (vA < .004 || (vA < .999 && ign(gl_FragCoord.xy) > vA)) discard;",       // dithered, order-free dissolve
    "  vec2 q = abs((vLocal - .5) * vec2(1.3333, 1.0)) - vec2(.6667, .5) + .06;",
    "  if (length(max(q, 0.0)) > .06) discard;",                                      // rounded corners
    "  vec3 c = mix(vMean, texture2D(uMap, vUv, vBias).rgb, uIn);",
    "  c = mix(uBg, c, mix(vDim, 1.0, uFog));",
    "  float edge = min(min(vLocal.x, 1.0 - vLocal.x), min(vLocal.y, 1.0 - vLocal.y));",
    "  if (vHover > .5) { c = mix(c, vec3(1.0), .06); if (edge < .014) c = vec3(1.0); }",
    "  c = mix(c, uBg, smoothstep(520.0, 1300.0, vDepth) * uFog);",                  // far cards sink into the dark
    "  c = mix(c, uBg, uSoft * .35);",
    "  gl_FragColor = vec4(c, 1.0);",
    "}"].join("\n")

  var U = {
    uMap: { value: null }, uGrid: { value: new THREE.Vector2(C.atlas.cols, C.atlas.rows) }, uTilePx: { value: new THREE.Vector2(C.atlas.tw, C.atlas.th) },
    uFog: { value: 0 }, uGrow: { value: 0 }, uIntro: { value: -1 }, uTime: { value: 0 }, uHover: { value: -1 }, uD0: { value: D0 },
    uMote: { value: 0 }, uSoft: { value: 0 }, uIn: { value: 0 }, uBg: { value: new THREE.Vector3(BG[0], BG[1], BG[2]) },
  }

  // ---------- geometry: one quad, many instances ----------
  var geo = new THREE.InstancedBufferGeometry()
  var quad = new THREE.PlaneGeometry(C.cell[0] / C.cell[1], 1)
  geo.index = quad.index; geo.setAttribute("position", quad.attributes.position); geo.setAttribute("uv", quad.attributes.uv)
  geo.instanceCount = CAP
  function attr(name, n) { var a = new THREE.InstancedBufferAttribute(new Float32Array(CAP * n), n); a.setUsage(THREE.DynamicDrawUsage); geo.setAttribute(name, a); return a }
  var aPos = attr("aPos", 4), aTex = attr("aTex", 4), aMean = attr("aMean", 3), aLook = attr("aLook", 4), aFrom = attr("aFrom", 4), aAnim = attr("aAnim", 4)
  var mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: U })
  var mesh = new THREE.Mesh(geo, mat)
  mesh.frustumCulled = false
  scene.add(mesh)

  var world = new Array(CAP)      // per instance: { x, y, z, h, img }
  var live = new Int32Array(NIMG)  // how many cards show each image right now
  function setImage(i, j) {
    var w = world[i]
    if (w.img === j) return
    if (w.img >= 0) live[w.img]--
    w.img = j
    if (j < 0) return
    live[j]++
    var im = C.images[j], slot = im[2]
    aTex.array[i * 4] = slot % C.atlas.cols; aTex.array[i * 4 + 1] = Math.floor(slot / C.atlas.cols)
    aMean.array[i * 3] = im[3] / 255; aMean.array[i * 3 + 1] = im[4] / 255; aMean.array[i * 3 + 2] = im[5] / 255
    aTex.needsUpdate = aMean.needsUpdate = true
  }
  function setPos(i, x, y, z, h) {
    var w = world[i]; w.x = x; w.y = y; w.z = z; w.h = h
    aPos.array[i * 4] = x; aPos.array[i * 4 + 1] = y; aPos.array[i * 4 + 2] = z; aPos.array[i * 4 + 3] = h
    aPos.needsUpdate = true
  }

  // ---------- the portrait ----------
  var introEnd = 0
  for (var i = 0; i < CAP; i++) { world[i] = { x: 0, y: 0, z: 1e6, h: 0, img: -1 }; aTex.array[i * 4 + 3] = i }
  for (i = 0; i < NC; i++) {
    var d = cellAt(i, 4), col = cellAt(i, 5), row = cellAt(i, 6), k = d / D0
    var r = rng(i + 101, 7)
    setPos(i, (col + 0.5 - C.cols / 2) * C.cell[0] * k, (C.rows / 2 - row - 0.5) * C.cell[1] * k, -d, C.cell[1] * k * 0.94)
    setImage(i, C.remap[i])
    aTex.array[i * 4 + 2] = 0
    var dim = cellAt(i, 8)
    aLook.array[i * 4] = cellAt(i, 7); aLook.array[i * 4 + 1] = dim; aLook.array[i * 4 + 2] = cellAt(i, 9)
    world[i].fill = cellAt(i, 9) > 0.5
    // the arrival: each card starts out in the dark, further back and to the side; the centre settles first
    var a = r() * Math.PI * 2, rad = (60 + r() * 120) * k
    var delay = r() * 1500 + Math.hypot(col - C.cols / 2, row - C.rows * 0.4) * 9, dur = 1300 + r() * 900
    aFrom.array[i * 4] = Math.cos(a) * rad; aFrom.array[i * 4 + 1] = Math.sin(a) * rad; aFrom.array[i * 4 + 2] = -d * (1.4 + r() * 1.2); aFrom.array[i * 4 + 3] = delay
    aAnim.array[i * 4] = dur
    introEnd = Math.max(introEnd, delay + dur)
    if (dim < 1) { aAnim.array[i * 4 + 1] = 0.05 + r() * 0.07; aAnim.array[i * 4 + 2] = r(); aAnim.array[i * 4 + 3] = 20 + r() * 40 + (1 - dim) * 40 }
  }
  introEnd += 50

  // ---------- the lane: the work in order, straight ahead ----------
  var laneIndexAt = function (z) { return Math.max(0, Math.floor((z - LANE.z0) / LANE.step)) }
  function lanePos(k) {
    var r = rng(k + 11, 99), a = r() * Math.PI * 2, rr = Math.sqrt(r()), h = LANE.h * (0.85 + r() * 0.3)
    return { x: Math.cos(a) * rr * LANE.x, y: Math.sin(a) * rr * LANE.y, z: LANE.z0 + k * LANE.step, h: h }
  }
  var laneK = new Int32Array(LANE.n).fill(-1)
  for (i = L0; i < M0; i++) aTex.array[i * 4 + 2] = 2
  function updateLane() {
    var first = Math.max(0, laneIndexAt(dist) - 1)
    for (var k = first; k < first + LANE.n; k++) {
      var s = k % LANE.n, i = L0 + s
      if (laneK[s] === k) continue
      laneK[s] = k
      var q = lanePos(k)
      setPos(i, q.x, q.y, -q.z, q.h)
      setImage(i, C.seq[k % NSEQ])
      if (FOCUS.i === i) releaseFocus(false)
    }
  }

  // ---------- the stream: a tunnel of work around the lane ----------
  var sBase = new Float32Array(STREAM_N), sGen = new Int32Array(STREAM_N).fill(-1)
  for (i = 0; i < STREAM_N; i++) { sBase[i] = ((i + rng(i, 3)()) / STREAM_N) * PERIOD; aTex.array[(S0 + i) * 4 + 2] = 1 }
  var memo = new Map()
  function placeStream(s, g) {
    var i = S0 + s, r = rng(s + 1, g + 1), ang = r() * Math.PI * 2, rad = LANE.x * 2.4 + (STREAM_R - LANE.x * 2.4) * Math.pow(r(), 0.8)
    var z = sBase[s] + g * PERIOD
    setPos(i, Math.cos(ang) * rad, Math.sin(ang) * rad * 0.8, -z, 1.4 + Math.pow(r(), 2.2) * 7)
    var key = g * STREAM_N + s, j = memo.get(key)
    if (j === undefined) {
      // atmosphere: pieces from the stretch of work that reaches the lane soon, so the edges preview what is coming
      var kk = (laneIndexAt(z) + 6 + Math.floor(r() * 40)) % NSEQ
      j = C.seq[kk]
      for (var t = 0; t < 12 && live[j] > 3; t++) { kk = (kk + 7) % NSEQ; j = C.seq[kk] }
      memo.set(key, j)
    }
    setImage(i, j)
    if (FOCUS.i === i) releaseFocus(false)
  }
  function recycle() {
    for (var s = 0; s < STREAM_N; s++) {
      var b = sBase[s], g = dist < b ? 0 : Math.floor((dist - b) / PERIOD) + 1
      if (g !== sGen[s]) { sGen[s] = g; placeStream(s, g) }
    }
  }

  // ---------- motes ----------
  for (i = 0; i < MOTES; i++) {
    var mi = M0 + i, r2 = rng(i + 5, 17), tgt = 0
    for (var t = 0; t < 30; t++) { tgt = Math.floor(r2() * NC); if (!world[tgt].fill || aLook.array[tgt * 4 + 1] >= 1) break }
    var tw = world[tgt], kk = -tw.z / D0, ang = r2() * Math.PI * 2, rad2 = (110 + r2() * 140) * kk
    setPos(mi, tw.x, tw.y, tw.z, C.cell[1] * kk * (0.4 + r2() * 0.5))
    setImage(mi, Math.floor(r2() * NIMG))
    aTex.array[mi * 4 + 2] = 3
    var dur2 = 5000 + r2() * 4000
    aFrom.array[mi * 4] = r2() * 50; aFrom.array[mi * 4 + 3] = r2() * dur2
    aAnim.array[mi * 4] = dur2; aAnim.array[mi * 4 + 1] = Math.cos(ang) * rad2; aAnim.array[mi * 4 + 2] = Math.sin(ang) * rad2 * 0.8; aAnim.array[mi * 4 + 3] = tw.z * (1.3 + r2() * 0.6)
  }

  // ---------- layout: the portrait is framed in the free part of the window ----------
  var W = 0, H = 0, focal = 1, boxEl = $("#box"), topEl = $(".awl-topbar")
  var fr = { cx: 0, cy: 0, w: 0, h: 0, ready: false }
  function resize() {
    var cr = canvas.getBoundingClientRect()
    W = Math.round(cr.width) || innerWidth; H = Math.round(cr.height) || innerHeight
    renderer.setPixelRatio(Math.max(0.5, Math.min(DPR, Math.sqrt(5.5e6 / (W * H)))))
    renderer.setSize(W, H, false)
    camera.aspect = W / H
    fr.ready = false
    stage(1)
    fitName()
  }
  function isOpen() { return boxEl.dataset.view !== "closed" }
  function stage(dt) {
    var wide = W > 991, open = isOpen()
    var top = Math.max(topEl.getBoundingClientRect().bottom + 10, H * 0.085)
    var x0 = 0, x1 = W, y0 = top, y1 = Math.max(top + 200, H * 1.07)
    if (open) { var rb = boxEl.getBoundingClientRect(); if (wide) x0 = rb.right; else y1 = Math.max(top + 160, H - rb.height - 30) }
    var tg = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 - (open ? 0 : H * 0.08), w: x1 - x0, h: y1 - y0 }
    if (!wide && !open) { tg.h = H * 0.7; tg.cy = H * 0.475; tg.cx = W * 0.5 }
    var kk = fr.ready ? 1 - Math.exp(-dt * 5) : 1
    fr.cx += (tg.cx - fr.cx) * kk; fr.cy += (tg.cy - fr.cy) * kk; fr.w += (tg.w - fr.w) * kk; fr.h += (tg.h - fr.h) * kk
    fr.ready = true
    var ph = C.rows * C.cell[1], pw = C.cols * C.cell[0]
    var fitH = 2 * Math.atan((ph / 1.03 / 2 / D0) * (H / fr.h)) * 180 / Math.PI
    var fitW = 2 * Math.atan((pw / 0.96 / 2 / D0 / camera.aspect) * (W / fr.w)) * 180 / Math.PI
    camera.fov = wide || open ? Math.max(fitH, fitW) : fitH
    camera.setViewOffset(W, H, W / 2 - fr.cx, H / 2 - fr.cy, W, H)
    camera.updateProjectionMatrix()
    focal = H / (2 * Math.tan((camera.fov * Math.PI) / 360))
  }

  // ---------- the big name, fitted edge to edge ----------
  function inkBox(txt) {
    var cv = inkBox.cv || (inkBox.cv = document.createElement("canvas")), cx = cv.getContext("2d")
    cx.font = 'italic 400 100px "Instrument Serif", serif'
    var m = cx.measureText(txt)
    return { l: m.actualBoundingBoxLeft, r: m.actualBoundingBoxRight, a: m.actualBoundingBoxAscent, d: m.actualBoundingBoxDescent }
  }
  function fitName() {
    var line = $("#name-line"), stack = $("#name-stack")
    var b = inkBox(SITE.name || "Amri Sayyida"), t = line.querySelector("text")
    t.textContent = SITE.name || "Amri Sayyida"
    t.setAttribute("x", 0); t.setAttribute("y", 0)
    line.setAttribute("viewBox", [-b.l - 1, -b.a - 1, b.l + b.r + 2, b.a + b.d + 2].map(function (n) { return n.toFixed(1) }).join(" "))
    var words = (SITE.name || "Amri Sayyida").split(" "), ts = stack.querySelectorAll("text"), gap = 84
    var b1 = inkBox(words[0]), b2 = inkBox(words.slice(1).join(" ") || words[0])
    ts[0].textContent = words[0]; ts[1].textContent = words.slice(1).join(" ")
    ts[0].setAttribute("x", 0); ts[0].setAttribute("y", 0); ts[1].setAttribute("x", 0); ts[1].setAttribute("y", gap)
    var L = -Math.max(b1.l, b2.l) - 1, R = Math.max(b1.r, b2.r) + 1, T = -b1.a - 1, B = gap + b2.d + 1
    stack.setAttribute("viewBox", [L, T, R - L, B - T].map(function (n) { return n.toFixed(1) }).join(" "))
    // phones: the round arrow sits at the end of the first line
    var wpx = Math.max(1, document.querySelector(".awl-bigname").clientWidth - 4), scale = wpx / (R - L)
    var pad = parseFloat(getComputedStyle(document.querySelector(".awl-bigname")).paddingBottom) || 0
    document.documentElement.style.setProperty("--row-b", (pad + (B - 0) * scale + b1.a * 0.12 * scale).toFixed(1) + "px")
  }

  // ---------- input: endless flight ----------
  var warp = 0, target = 0, dist = 0, vel = 0, mx = 0, my = 0, smx = 0, smy = 0, last = performance.now(), rewind = null, closeAcc = 0
  var SPEED = 0.55
  function push(dy) {
    if (warp) return
    if (isOpen()) { closeAcc += Math.abs(dy); if (closeAcc < 120) return; closeAll() }
    closeAcc = 0
    if (rewind) { rewind = null; target = dist }
    target = Math.max(0, target + dy)
  }
  addEventListener("wheel", function (e) {
    if (e.target.closest && (e.target.closest(".awl-box") || e.target.closest(".mnav"))) return
    e.preventDefault()
    push(e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1) * SPEED)
  }, { passive: false })
  var ty = null, tt = 0
  addEventListener("touchstart", function (e) { ty = e.target.closest && (e.target.closest(".awl-box") || e.target.closest(".mnav")) ? null : e.touches[0].clientY; tt = performance.now(); vel = 0 }, { passive: true })
  addEventListener("touchmove", function (e) {
    if (ty === null) return
    e.preventDefault()
    var y = e.touches[0].clientY, now = performance.now(), dy = (ty - y) * 1.6
    push(dy); vel = (dy / Math.max(8, now - tt)) * 16; ty = y; tt = now
  }, { passive: false })
  addEventListener("touchend", function () { ty = null })
  addEventListener("keydown", function (e) {
    var ae = document.activeElement
    if (ae && ae.closest && ae.closest(".awl-p-scroll, input, textarea, select")) return
    var step = { ArrowDown: 160, PageDown: 600, " ": 600, ArrowUp: -160, PageUp: -600 }[e.key]
    if (step) { e.preventDefault(); push(step) }
    if (e.key === "Home") backToPortrait()
  })
  var pointer = { x: -1, y: -1, in: false, down: null }
  addEventListener("pointermove", function (e) { pointer.x = e.clientX; pointer.y = e.clientY; pointer.in = e.target === canvas; mx = (e.clientX / innerWidth) * 2 - 1; my = (e.clientY / innerHeight) * 2 - 1 }, { passive: true })
  document.addEventListener("pointerleave", function () { pointer.in = false })
  function backToPortrait() {
    closeAll()
    if (dist < 1) return
    rewind = { from: dist, t0: performance.now(), dur: reduced ? 1 : Math.min(2600, 1200 + Math.sqrt(dist) * 14) }; vel = 0
  }
  $("#back").addEventListener("click", backToPortrait)

  // ---------- picking ----------
  var tmp = new THREE.Vector3(), hoverTile = -1, hud = $("#hud"), hudLabel = $("#hud-label")
  function screenOf(i) {
    var w = world[i], pos = FOCUS.i === i ? FOCUS.pos : w
    tmp.set(pos.x, pos.y, pos.z).applyMatrix4(camera.matrixWorldInverse)
    var d = -tmp.z
    if (d <= w.h * 1.7) return null                       // behind, or dissolving in front of you: look through it
    var px = (w.h / d) * focal
    tmp.applyMatrix4(camera.projectionMatrix)
    return { x: (tmp.x + 1) / 2 * W, y: (1 - tmp.y) / 2 * H, px: px, d: d }
  }
  function pick() {
    if (!pointer.in || U.uFog.value < 0.3) return -1
    var best = -1, bd = 1e9
    var test = function (i) {
      var w = world[i]; if (!w.h || w.img < 0) return
      var s = screenOf(i); if (!s || s.px < MIN_CLICK_PX) return
      if (Math.abs(pointer.x - s.x) <= s.px * 0.6667 && Math.abs(pointer.y - s.y) <= s.px * 0.5 && s.d < bd) { bd = s.d; best = i }
    }
    for (var i = S0; i < M0; i++) test(i)
    for (i = 0; i < NC; i++) if (!world[i].fill && world[i].z < camera.position.z) test(i)
    return best
  }
  function setHover(i) {
    if (i === hoverTile) return
    hoverTile = i; U.uHover.value = i
    canvas.classList.toggle("hot", i >= 0)
    if (i >= 0) { hudLabel.textContent = C.projects[C.images[world[i].img][0]].t; hud.hidden = false } else hud.hidden = true
  }
  addEventListener("pointerdown", function (e) { pointer.down = { x: e.clientX, y: e.clientY, t: performance.now() } })
  addEventListener("pointerup", function (e) {
    var d = pointer.down; pointer.down = null
    if (!d || e.target !== canvas) return
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8 || performance.now() - d.t > 600) return
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.in = true
    var p = pick(), i = hoverTile >= 0 ? hoverTile : p
    if (i >= 0) { var im = C.images[world[i].img]; openProject(im[0], im[1], i) }
  })

  // ---------- the opened card drifts slowly toward you while it is open ----------
  var FOCUS = { i: -1, t0: 0, f: 0, closing: false, pos: { x: 0, y: 0, z: 0 } }
  function setFocus(i) {
    if (FOCUS.i >= 0 && FOCUS.i !== i) releaseFocus(true)
    if (reduced || i < 0 || i < NC && world[i].fill) return
    FOCUS.i = i; FOCUS.t0 = performance.now(); FOCUS.f = 0; FOCUS.closing = false
  }
  function releaseFocus(restore) {
    var i = FOCUS.i; FOCUS.i = -1
    if (i < 0 || !restore) return
    var w = world[i]; setPos(i, w.x, w.y, w.z, w.h)
  }
  function focusPiece(now, dt) {
    var i = FOCUS.i; if (i < 0) return
    if (FOCUS.closing) { FOCUS.f *= Math.exp(-dt * 3.2); if (FOCUS.f < 0.002) { releaseFocus(true); return } }
    else { var p = Math.min(1, (now - FOCUS.t0) / 10000); FOCUS.f = 0.5 - 0.5 * Math.cos(Math.PI * p) }
    var w = world[i], k = 1 - 0.3 * FOCUS.f, cp = camera.position
    FOCUS.pos.x = cp.x + (w.x - cp.x) * k; FOCUS.pos.y = cp.y + (w.y - cp.y) * k; FOCUS.pos.z = cp.z + (w.z - cp.z) * k
    aPos.array[i * 4] = FOCUS.pos.x; aPos.array[i * 4 + 1] = FOCUS.pos.y; aPos.array[i * 4 + 2] = FOCUS.pos.z; aPos.needsUpdate = true
  }

  // ---------- the signature: signed by hand as the portrait settles, again each time you come back ----------
  var sigEl = $("#sig"), sigPen = $("#sig-stroke"), sigTip = $("#sig-tip"), sigGlow = $("#sig-glow")
  sigPen.setAttribute("d", window.SIG_D); sigTip.setAttribute("d", window.SIG_D)
  var SIG_DUR = 2900
  var SIG = (function () {
    // the pen speeds along straight runs and slows into the loops: time per step grows with the path's curvature
    var Lp = sigPen.getTotalLength(), n = 700, ds = Lp / n, pts = []
    for (var i = 0; i <= n; i++) { var q = sigPen.getPointAtLength(i * ds); pts.push([q.x, q.y]) }
    var bend = new Float32Array(n + 1)
    for (i = 1; i < n; i++) {
      var a1 = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]), a2 = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0])
      var dd = Math.abs(a2 - a1); if (dd > Math.PI) dd = 2 * Math.PI - dd
      bend[i] = dd / ds
    }
    var tm = new Float32Array(n + 1)
    for (i = 1; i <= n; i++) {
      var sm = 0, wsum = 0
      for (var k = -12; k <= 12; k++) { var j = i + k; if (j < 0 || j > n) continue; var gw = Math.exp(-(k * k) / 50); sm += bend[j] * gw; wsum += gw }
      var u = i / n, ramp = Math.min(1, u / 0.06) * Math.min(1, (1 - u) / 0.08 + 0.15)
      tm[i] = tm[i - 1] + ds / ((0.25 + 0.75 * ramp) / (1 + 36 * sm / wsum))
    }
    for (i = 0; i <= n; i++) tm[i] /= tm[n]
    sigPen.style.strokeDasharray = Lp + " " + Lp; sigPen.style.strokeDashoffset = Lp
    return { L: Lp, n: n, ds: ds, t: tm }
  })()
  function sigLengthAt(p) {
    var t = SIG.t, lo = 0, hi = SIG.n
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (t[mid] < p) lo = mid; else hi = mid }
    var f = (p - t[lo]) / Math.max(1e-6, t[hi] - t[lo])
    return (lo + Math.min(1, Math.max(0, f))) * SIG.ds
  }
  var sigStart = -1, sigAway = false, sigLast = "", headKey = ""
  var hv = new THREE.Vector3()
  function signature(now) {
    if (dist > 8) { if (!sigAway) { sigAway = true; sigPen.style.strokeDashoffset = SIG.L; sigTip.style.opacity = 0; sigGlow.setAttribute("opacity", 0) } return }
    if (sigAway) { sigAway = false; sigStart = now + 350 }
    if (sigStart < 0) { if (introStart < 0) return; sigStart = introStart + introEnd * 0.22 }
    var p = Math.min(1, Math.max(0, (now - sigStart) / SIG_DUR)), drawn = sigLengthAt(p)
    var off = (SIG.L - drawn).toFixed(1)
    if (off !== sigLast) {
      sigLast = off; sigPen.style.strokeDashoffset = off
      var TIP = 60
      sigTip.style.strokeDasharray = Math.min(TIP, drawn) + " " + SIG.L * 2
      sigTip.style.strokeDashoffset = (-Math.max(0, drawn - TIP)).toFixed(2)
      if (drawn > 0.5 && p < 1) { var q = sigPen.getPointAtLength(drawn); sigGlow.setAttribute("cx", q.x); sigGlow.setAttribute("cy", q.y) }
    }
    var on = p > 0 && p < 1
    sigTip.style.opacity = on ? 0.5 : 0; sigGlow.setAttribute("opacity", on ? 1 : 0)
    // a soft hole in the signature around the head
    var rb = sigEl.getBoundingClientRect()
    var pt = function (fx, fy) { hv.set((fx - 0.5) * C.cols * C.cell[0], (0.5 - fy) * C.rows * C.cell[1], -D0).project(camera); return [(hv.x + 1) / 2 * W - rb.left, (1 - hv.y) / 2 * H - rb.top] }
    var c0 = pt(0.5, 0.3), ex = pt(0.74, 0.3), ey = pt(0.5, 0.58)
    var hk = [c0[0], c0[1], Math.abs(ex[0] - c0[0]), Math.abs(ey[1] - c0[1])].map(function (n) { return n.toFixed(1) })
    if (hk.join() !== headKey) { headKey = hk.join(); sigEl.style.setProperty("--hx", hk[0] + "px"); sigEl.style.setProperty("--hy", hk[1] + "px"); sigEl.style.setProperty("--hrx", hk[2] + "px"); sigEl.style.setProperty("--hry", hk[3] + "px") }
  }

  // ---------- the "now passing" caption and the counter ----------
  var nowK = -1, laneMax = -1, seenEl = $("#seen")
  function counter() { var n = C.projects.length; seenEl.textContent = n + (n === 1 ? " website" : " websites") + " in the library" }
  function updateNow() {
    var k = Math.max(0, Math.ceil((dist + 28 - LANE.z0) / LANE.step))
    if (k === nowK) return
    nowK = k
    var p = C.projects[C.images[C.seq[k % NSEQ]][0]], round = Math.floor(k / NSEQ) + 1
    $("#now-i").textContent = String((k % NSEQ) + 1).padStart(3, "0")
    $("#now-t").textContent = p.t
    $("#now-s").textContent = [p.k, round > 1 ? "Round " + round : ""].filter(Boolean).join("  ·  ")
    if (k > laneMax) { laneMax = k; counter() }
  }
  $("#now").addEventListener("click", function () { if (nowK < 0) return; var im = C.images[C.seq[nowK % NSEQ]]; openProject(im[0], im[1], L0 + (nowK % LANE.n)) })

  // ---------- frame ----------
  var introStart = -1, aim = { x: 0, y: 0, tx: 0, ty: 0, on: false, at: 0 }, pendingOpen = null
  function tick(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now
    if (ty === null && Math.abs(vel) > 0.1) { push(vel); vel *= Math.exp(-dt * 3.5) }
    if (warp) {
      // leaving for a website: the flight speeds up straight ahead, no hands on the wheel
      var wt = (now - warp) / 1000
      dist += dt * (260 + wt * wt * 2600); target = dist
    } else if (rewind) {
      var t = Math.min(1, (now - rewind.t0) / rewind.dur)
      dist = target = rewind.from * (1 - easeIO3(t))
      if (t >= 1) { rewind = null; dist = target = 0 }
    } else {
      dist += (target - dist) * (reduced ? 1 : 1 - Math.exp(-dt * 4))
      if (Math.abs(target - dist) < 0.01) dist = target
    }
    smx += (mx - smx) * (1 - Math.exp(-dt * 1.5)); smy += (my - smy) * (1 - Math.exp(-dt * 1.5))
    var away = Math.min(1, dist / 120), ease = away * away * (3 - 2 * away)
    U.uFog.value = ease; U.uGrow.value = ease
    U.uSoft.value += ((isOpen() ? 1 : 0) - U.uSoft.value) * (1 - Math.exp(-dt * 6))
    U.uTime.value = now / 1000
    if (introStart >= 0) U.uIntro.value = now - introStart
    var ramp = introStart < 0 ? 0 : Math.min(1, Math.max(0, ((now - introStart) / introEnd - 0.35) / 0.65))
    U.uMote.value = (1 - ease) * ramp * ramp
    if (U.uIn.value < 1 && U.uMap.value) U.uIn.value = Math.min(1, U.uIn.value + dt * 1.6)
    document.body.classList.toggle("away", dist > 8)
    document.body.classList.toggle("far", dist > 60 && !rewind)
    if (pendingOpen && (Math.abs(dist - pendingOpen.at) < 4 || now - pendingOpen.t0 > 9000)) { var o = pendingOpen; pendingOpen = null; openProject(o.pi, o.mi, o.tile) }
    var drift = reduced ? 0 : 0.5 + ease * 2.5
    if (aim.on && !pendingOpen && (boxEl.dataset.view !== "project" || Math.abs(dist - aim.at) > 12)) aim.on = false
    var ak = 1 - Math.exp(-dt * (aim.on ? 3 : 2))
    aim.x += ((aim.on ? aim.tx : 0) - aim.x) * ak; aim.y += ((aim.on ? aim.ty : 0) - aim.y) * ak
    camera.position.set(smx * drift + aim.x, -smy * drift + aim.y, -dist)
    camera.lookAt(smx * drift * 0.6 + aim.x, -smy * drift * 0.6 + aim.y, -dist - 200)
    stage(dt)
    camera.updateMatrixWorld()
    recycle(); updateLane(); updateNow(); focusPiece(now, dt)
    setHover(pick())
    if (hoverTile >= 0) { hud.style.left = pointer.x + "px"; hud.style.top = pointer.y + "px" }
    signature(now)
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
  }

  // ---------- the box ----------
  var gallery = $("#p-gallery"), stageEl = $("#p-stage"), scrollEl = $("#p-scroll"), body = document.body
  var BASE_TITLE = document.title, openId = "", sideView = ""
  function setView(v) {
    if (boxEl.dataset.view !== v) boxEl.dataset.view = v
    body.classList.toggle("boxed", v !== "closed")
    body.classList.toggle("side", v === "about" || v === "contact")
    document.querySelectorAll(".awl-col-nav button").forEach(function (b) { b.classList.toggle("on", b.id === v + "-open") })
  }
  function setUrl(key, val) { try { var u = new URL(location.href); ["work", "open", "fly"].forEach(function (k) { u.searchParams.delete(k) }); if (val) u.searchParams.set(key, val); history.replaceState(null, "", u) } catch (e) {} }
  var workId = function (pi, mi) { return C.projects[pi].id + (mi ? "-" + (mi + 1) : "") }
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;") }
  var isCrop = function (x) { var a = x.w && x.h ? x.w / x.h : 0; return a > 0 && a < 1.3 }
  function openProject(pi, mi, tile) {
    var p = C.projects[pi], m = p.m[mi] || p.m[0]
    openId = workId(pi, mi); setUrl("work", openId); document.title = p.t + " · " + (SITE.name || "Amri Sayyida")
    var cb = $("#p-copy"); cb.classList.remove("done"); cb.lastElementChild.textContent = "Copy link"
    closeAcc = 0; sideView = ""
    $("#p-src").textContent = p.k || ""
    $("#p-title").textContent = p.t
    $("#p-desc").textContent = p.d || ""
    $("#p-tags").innerHTML = (p.g || []).map(function (t) { return "<li>" + esc(t) + "</li>" }).join("")
    var link = $("#p-link"); if (p.case && p.u) { link.href = p.u; link.hidden = false } else link.hidden = true
    // a case study opens whole: the piece you clicked first, then the rest of the study under it
    var all = p.case ? [m].concat(p.m.filter(function (x) { return x !== m })) : [m]
    scrollEl.classList.toggle("multi", all.length > 1)
    scrollEl.style.setProperty("--ar", String(isCrop(m) ? 4 / 3 : m.w / m.h || 4 / 3))
    gallery.innerHTML = all.map(function (x, n) {
      var cls = isCrop(x) ? ' class="crop"' : ""
      return x.v
        ? "<figure" + cls + '><video src="' + esc(x.v) + '" poster="' + esc(x.s) + '" autoplay muted loop playsinline' + (n ? ' preload="none"' : "") + "></video></figure>"
        : "<figure" + cls + '><img src="' + esc(x.s) + '" alt="' + esc(p.t) + '" decoding="async"' + (n ? ' loading="lazy"' : "") + " onload=\"this.classList.add('in')\"></figure>"
    }).join("")
    $("#p-count").textContent = all.length > 1 ? all.length + " pieces" : ""
    scrollEl.scrollTop = 0
    setView("project")
    setFocus(tile === undefined ? -1 : tile)
    requestAnimationFrame(fitBox)
  }
  function fitBox() {
    if (boxEl.dataset.view !== "project" || W > 991) { boxEl.style.height = ""; return }
    // phones: the sheet is as tall as a single piece needs
    boxEl.style.height = ""
    if (scrollEl.classList.contains("multi")) return
    var el = gallery.querySelector("img, video"); if (!el) return
    var ar = parseFloat(scrollEl.style.getPropertyValue("--ar")) || 4 / 3
    var s = stageEl.getBoundingClientRect(), need = Math.min(s.height, s.width / ar)
    boxEl.style.height = Math.round(boxEl.getBoundingClientRect().height - (s.height - need)) + "px"
  }
  addEventListener("resize", fitBox)
  // leaving for a website: close the box and fly forward into the work, then the page fades over (library.js)
  $("#p-link").addEventListener("click", function (e) {
    var href = this.getAttribute("href")
    if (!href || e.metaKey || e.ctrlKey || e.shiftKey || !window.AWL_TRANSITION) return
    e.preventDefault()
    if (warp) return
    closeAll(); vel = 0; rewind = null; pendingOpen = null; aim.on = false
    if (reduced) { window.AWL_TRANSITION.go(href, e, { style: "fade", delay: 0 }); return }
    warp = performance.now()
    window.AWL_TRANSITION.go(href, e, { style: "fade", delay: 950 })
  })
  // back/forward cache: return to the portrait, not to a frozen flight
  addEventListener("pageshow", function (e) { if (e.persisted && warp) { warp = 0; rewind = null; vel = 0; dist = target = 0 } })
  function closeProject() {
    if (boxEl.dataset.view !== "project") return
    setUrl(); document.title = BASE_TITLE
    FOCUS.closing = true
    setView("closed")
    gallery.querySelectorAll("video").forEach(function (v) { v.pause() })
    setTimeout(function () { if (boxEl.dataset.view !== "project") gallery.innerHTML = "" }, 700)
  }
  function openSide(v) {
    if (boxEl.dataset.view === "project") { gallery.querySelectorAll("video").forEach(function (x) { x.pause() }); setUrl(); document.title = BASE_TITLE }
    boxEl.style.height = ""; sideView = v; closeAcc = 0; FOCUS.closing = true
    setView(v)
    if (v === "contact") { resetForm(); setTimeout(function () { if (W > 991) cform.elements.name.focus({ preventScroll: true }) }, 450) }
  }
  function closeSide() { if (sideView) { sideView = ""; setView("closed") } }
  function closeAll() { closeProject(); closeSide() }
  function toggleSide(v) { if (sideView === v) closeSide(); else openSide(v) }
  boxEl.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) closeProject()
    if (e.target.closest("[data-about-close]")) closeSide()
  })
  addEventListener("keydown", function (e) { if (e.key === "Escape") { closeAll(); setMenu(false) } })
  function flyIn() { closeAll(); if (dist < 200) target = Math.max(target, 420) }
  $("#work-open").addEventListener("click", flyIn)
  $("#start").addEventListener("click", flyIn)
  $("#home").addEventListener("click", function (e) { e.preventDefault(); backToPortrait() })
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-work]"); if (b) goToWork(b.dataset.work)
  })

  // ---------- selected work: fly to a case study and open it ----------
  function goToWork(title) {
    var pi = C.projects.findIndex(function (p) { return p.t === title }); if (pi < 0) return
    var j = C.images.findIndex(function (im) { return im[0] === pi && im[1] === 0 }); if (j < 0) return
    var base = C.seq.indexOf(j); if (base < 0) return
    closeAll(); setMenu(false)
    var k = base + NSEQ * Math.max(0, Math.ceil((laneIndexAt(dist) - base - 2) / NSEQ))   // the next time it comes round
    var q = lanePos(k), depth = Math.min(60, Math.max(40, q.h * 5.7)), at = q.z - depth
    var lift = W > 991 ? (H * 0.075 * depth) / focal : 0
    aim.tx = q.x; aim.ty = q.y - lift; aim.on = true; aim.at = at
    rewind = null; target = at
    pendingOpen = { pi: pi, mi: 0, at: at, t0: performance.now(), tile: L0 + (k % LANE.n) }
  }
  function resetForm() {}

  // ---------- copy a link to the open work ----------
  var toast = $("#toast")
  function showToast(t) { toast.textContent = t; toast.classList.add("on"); clearTimeout(showToast.k); showToast.k = setTimeout(function () { toast.classList.remove("on") }, 1800) }
  function copySync(text) {
    var t = document.createElement("textarea"); t.value = text; t.setAttribute("readonly", ""); t.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px"
    document.body.appendChild(t); t.select(); t.setSelectionRange(0, text.length)
    var ok = false; try { ok = document.execCommand("copy") } catch (e) {}
    t.remove(); return ok
  }
  $("#p-copy").addEventListener("click", function (e) {
    e.preventDefault(); e.stopPropagation()
    var b = $("#p-copy"), url = location.href.split("?")[0].split("#")[0] + "?work=" + openId
    var ok = function () { b.classList.add("done"); b.lastElementChild.textContent = "Link copied"; showToast("Link copied"); setTimeout(function () { b.classList.remove("done"); b.lastElementChild.textContent = "Copy link" }, 2000) }
    if (copySync(url)) return ok()
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, function () { prompt("Copy this link", url) })
    else prompt("Copy this link", url)
  })

  // ---------- clock ----------
  function clock() {
    try { var s = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: SITE.timeZone || "Asia/Jakarta" }).format(new Date()); document.querySelectorAll(".awl-clock").forEach(function (el) { el.textContent = s }) } catch (e) {}
  }
  clock(); setInterval(clock, 15000)

  function setMenu() {}

  // ---------- loading: the mark draws itself while the image sheet decodes ----------
  var loaderEl = $("#loader"), pens = [].slice.call(document.querySelectorAll(".awl-ld-pen"))
  var LD = { target: 0.05, shown: 0, t0: performance.now(), last: performance.now(), resolve: null }
  var ldEase = function (x) { return easeIO3(Math.min(1, Math.max(0, x))) }
  function ldFrame(now) {
    var dt = Math.min(0.25, (now - LD.last) / 1000); LD.last = now
    var pace = Math.min(1, (now - LD.t0) / 1600), goal = Math.min(LD.target, pace)
    LD.shown += (goal - LD.shown) * (1 - Math.exp(-dt * 7))
    if (LD.target >= 1 && pace >= 1 && LD.shown > 0.996) LD.shown = 1
    var p = LD.shown
    var s = [ldEase(p / 0.45), ldEase((p - 0.33) / 0.4), ldEase((p - 0.62) / 0.38)]
    pens.forEach(function (el, k) { el.style.strokeDashoffset = (1 - s[k]).toFixed(4) })
    if (p >= 1 && LD.resolve) { var r = LD.resolve; LD.resolve = null; r(); return }
    requestAnimationFrame(ldFrame)
  }
  requestAnimationFrame(ldFrame)

  function start() {
    resize()
    addEventListener("resize", resize)
    if (window.ResizeObserver) new ResizeObserver(function () { resize() }).observe(canvas)
    var withTex = function (tex) {
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
      tex.minFilter = THREE.LinearMipmapLinearFilter
      U.uMap.value = tex
      LD.target = 0.75
      try { renderer.compile(scene, camera); renderer.initTexture(tex) } catch (e) {}
      LD.target = 1
      new Promise(function (res) { LD.resolve = res; if (LD.shown >= 1) res() }).then(function () {
        loaderEl.classList.add("done")
        U.uIn.value = 1
        introStart = performance.now()
        if (params.get("fly")) { target = 460; setUrl() }
        var shared = params.get("work")
        if (shared) {
          var m = /^(.*?)(?:-(\d+))?$/.exec(shared), pi = C.projects.findIndex(function (p) { return p.id === shared }), mi = 0
          if (pi < 0 && m) { pi = C.projects.findIndex(function (p) { return p.id === m[1] }); mi = m[2] ? +m[2] - 1 : 0 }
          if (pi >= 0) setTimeout(function () { target = Math.max(target, 260); setTimeout(function () { openProject(pi, Math.min(mi, C.projects[pi].m.length - 1)) }, 1400) }, 2600)
        }
      })
    }
    if (ATLAS) {
      var tex = new THREE.CanvasTexture(ATLAS)
      tex.generateMipmaps = true
      withTex(tex)
    } else {
      // no image sheet (images could not be read): the cards keep their mean colours
      LD.target = 1
      new Promise(function (res) { LD.resolve = res; if (LD.shown >= 1) res() }).then(function () { loaderEl.classList.add("done"); introStart = performance.now() })
    }
    counter()
    requestAnimationFrame(tick)
  }
  // measure the name once the serif has arrived (it decides the width)
  var fontsReady = document.fonts && document.fonts.load ? Promise.race([document.fonts.load('italic 100px "Instrument Serif"'), new Promise(function (r) { setTimeout(r, 1500) })]) : Promise.resolve()
  fontsReady.then(function () { fitName(); start() }, start)
  window.__cosmos = { get dist() { return dist }, set target(v) { target = v }, openProject: openProject, goToWork: goToWork, world: world, camera: camera, pick: pick, screenOf: screenOf, get hover() { return hoverTile } }
};

/* ---------- AWL boot: the library list on the Webflow page becomes the cards ----------
   Markup (Webflow-native, hidden):  [data-awl-item] with optional data-id, containing
     [data-awl="title"], [data-awl="kind"], [data-awl="desc"], [data-awl="tags"] (comma list),
     an <a data-awl="link" href="/folder/home"> and one or more <img> (the pictures shown as cards). */
;(function () {
  "use strict"
  var F = window.COSMOS_FACE, TW = 480, TH = 360, MAXCOLS = 8
  var txt = function (el, k) { var n = el.querySelector('[data-awl="' + k + '"]'); return n ? n.textContent.trim() : "" }
  var items = [].slice.call(document.querySelectorAll("[data-awl-item]"))
  var projects = items.map(function (el, pi) {
    var a = el.querySelector('[data-awl="link"]') || el.querySelector("a[href]")
    var srcs = [].slice.call(el.querySelectorAll("img")).map(function (im) { return im.getAttribute("src") }).filter(Boolean)
    var title = txt(el, "title") || ("Website " + (pi + 1))
    return {
      id: el.getAttribute("data-id") || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      t: title, k: txt(el, "kind"), d: txt(el, "desc"),
      g: txt(el, "tags").split(",").map(function (s) { return s.trim() }).filter(Boolean),
      u: a ? a.getAttribute("href") : "", live: a ? a.getAttribute("href") : "", case: true,
      m: srcs.map(function (s) { return { s: s, w: 4, h: 3 } })
    }
  }).filter(function (p) { return p.m.length })

  function load(src) {
    return new Promise(function (res) {
      var im = new Image(); im.crossOrigin = "anonymous"; im.decoding = "async"
      im.onload = function () { res(im) }; im.onerror = function () { res(null) }
      im.src = src + (src.indexOf("?") < 0 ? "?" : "&") + "awl=1"   // own cache entry, always fetched with CORS
    })
  }
  var jobs = []
  projects.forEach(function (p, pi) { p.m.forEach(function (m, mi) { jobs.push({ pi: pi, mi: mi, src: m.s }) }) })

  Promise.all(jobs.map(function (j) { return load(j.src) })).then(function (imgs) {
    var N = jobs.length, cols = Math.max(1, Math.min(MAXCOLS, N)), rows = Math.max(1, Math.ceil(N / cols))
    var cv = document.createElement("canvas"); cv.width = cols * TW; cv.height = rows * TH
    var cx = cv.getContext("2d"); cx.fillStyle = "#1a1a1b"; cx.fillRect(0, 0, cv.width, cv.height)
    var images = [], ok = N > 0
    jobs.forEach(function (j, n) {
      var im = imgs[n], x = (n % cols) * TW, y = Math.floor(n / cols) * TH, mean = [90, 90, 92]
      if (im) {
        projects[j.pi].m[j.mi].w = im.naturalWidth; projects[j.pi].m[j.mi].h = im.naturalHeight
        var s = Math.max(TW / im.naturalWidth, TH / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s
        cx.drawImage(im, x + (TW - w) / 2, y + (TH - h) / 2, w, h)
        try {
          var d = cx.getImageData(x, y, TW, TH).data, r = 0, g = 0, b = 0, c = 0
          for (var i = 0; i < d.length; i += 4 * 97) { r += d[i]; g += d[i + 1]; b += d[i + 2]; c++ }
          mean = [Math.round(r / c), Math.round(g / c), Math.round(b / c)]
        } catch (e) { ok = false }
      } else ok = false
      images.push([j.pi, j.mi, n, mean[0], mean[1], mean[2]])
    })
    if (!images.length) {   // empty library: one quiet placeholder so the portrait still draws
      projects = [{ id: "soon", t: "Coming soon", k: "", d: "", g: [], u: "", live: "", case: false, m: [{ s: "", w: 4, h: 3 }] }]
      images = [[0, 0, 0, 90, 90, 92]]; ok = false
    }
    // the portrait: every cell takes the picture whose colour is closest to its own (two nearest, alternating, for texture)
    var NC = F.cells.length / F.stride, remap = new Int32Array(NC)
    for (var c = 0; c < NC; c++) {
      var o = c * F.stride, cr = F.cells[o + 1], cg = F.cells[o + 2], cb = F.cells[o + 3], b1 = 0, b2 = 0, d1 = 1e9, d2 = 1e9
      for (var k = 0; k < images.length; k++) {
        var im2 = images[k], dd = (im2[3] - cr) * (im2[3] - cr) + (im2[4] - cg) * (im2[4] - cg) + (im2[5] - cb) * (im2[5] - cb)
        if (dd < d1) { d2 = d1; b2 = b1; d1 = dd; b1 = k } else if (dd < d2) { d2 = dd; b2 = k }
      }
      remap[c] = (c % 3 === 0 && images.length > 1) ? b2 : b1
    }
    // flying order: round-robin across websites (1st picture of each, then 2nd of each, ...) so neighbours never share a website
    var seq = images.map(function (_, n) { return n }).sort(function (a, b) { return (images[a][1] - images[b][1]) || (images[a][0] - images[b][0]) })
    var C = {}
    for (var key in F) C[key] = F[key]
    C.projects = projects; C.images = images; C.seq = seq; C.remap = remap; C.selected = [0]
    C.atlas = { cols: cols, rows: rows, tw: TW, th: TH }
    window.AWL_RUN(C, ok ? cv : null)
  })
})()

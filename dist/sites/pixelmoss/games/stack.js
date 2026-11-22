/* PIXELMOSS — games/stack.js: Stack Drop. A block slides left-right above the tower; drop it with
   Space / tap. The overhang is cut off and falls away; within 2px counts as "Perfect" (snaps, and every
   3rd perfect in a row widens the block). Miss completely = game over. Score = tower height. */
PMG.register("stack", (api) => {
  const { W, H, C, rect, text, reduce } = api;
  const BH = 10, BASE_W = 120, FLOOR = H - 14, TOP = 16;
  const g = { score: 0 };

  function reset() {
    Object.assign(g, { score: 0, tower: [{ x: (W - BASE_W) / 2, w: BASE_W }], cut: [], cam: 0, streak: 0, perfects: 0, flash: 0, label: 0, dropped: 0 });
    spawn();
  }
  const speed = () => Math.min(210, 70 + g.score * 5);
  function spawn() {
    const top = g.tower[g.tower.length - 1], fromL = g.tower.length % 2 === 1;
    g.mov = { x: fromL ? 0 : W - top.w, w: top.w, vx: fromL ? speed() : -speed() };
  }
  const yOf = (i) => FLOOR - (i + 1) * BH + g.cam;
  function drop() {
    if (!g.mov) return;
    const top = g.tower[g.tower.length - 1], m = g.mov;
    let x = m.x, w = m.w;
    const off = x - top.x;
    if (Math.abs(off) <= 2) {
      x = top.x; g.streak++; g.perfects++; g.flash = 0.25; g.label = 0.9;
      api.sfx("power", 0.35);
      if (g.streak % 3 === 0) { w = Math.min(BASE_W, w + 8); x = Math.max(0, Math.min(W - w, x - 4)); }
      if (g.perfects === 1) api.tip("Line it up for a Perfect", 2000);
    } else {
      const l = Math.max(x, top.x), r = Math.min(x + w, top.x + top.w);
      if (r - l <= 0) { g.cut.push({ x, y: yOf(g.tower.length), w, vy: 0, life: 1.4 }); g.mov = null; api.sfx("hit", 0.4); api.over(); return; }
      const cx = off > 0 ? r : x, cw = w - (r - l);
      g.cut.push({ x: cx, y: yOf(g.tower.length), w: cw, vy: 0, life: 1.2 });
      x = l; w = r - l; g.streak = 0; api.sfx("click", 0.35);
      if (!g.dropped) api.tip("Overhang gets cut off", 2000);
    }
    g.dropped++;
    g.tower.push({ x, w }); g.score = g.tower.length - 1;
    spawn();
  }
  function update(dt) {
    const m = g.mov;
    if (m) {
      m.x += m.vx * dt;
      if (m.x + m.w > W && m.vx > 0) { m.x = W - m.w; m.vx = -Math.abs(m.vx); }
      if (m.x < 0 && m.vx < 0) { m.x = 0; m.vx = Math.abs(m.vx); }
    }
    // camera: keep the moving block around y=90
    const want = Math.max(0, (g.tower.length + 1) * BH - (FLOOR - 90));
    g.cam += (want - g.cam) * Math.min(1, dt * (reduce ? 60 : 6));
    for (const c of g.cut) { c.vy += 420 * dt; c.y += c.vy * dt; c.life -= dt; }
    g.cut = g.cut.filter((c) => c.life > 0 && c.y < H + 20);
    g.flash = Math.max(0, g.flash - dt); g.label = Math.max(0, g.label - dt);
  }

  function block(x, y, w, i, hot) {
    if (y > H || y + BH < TOP) return;
    const col = hot ? C.pap : i % 2 ? C.g3 : C.pap;
    rect(x, y, w, BH - 1, col);
    rect(x, y + BH - 2, w, 1, C.g1);
    // 1-bit texture: sparse checker dots
    for (let px = 2 + (i % 2) * 2; px < w - 1; px += 4) rect(x + px, y + 3, 1, 1, C.g1);
  }
  function draw(ctx, t) {
    const gy = FLOOR + g.cam;
    if (gy < H) { rect(0, gy, W, 1, C.g2); for (let x = 0; x < W; x += 4) rect(x + ((x / 4) % 2) * 2, gy + 3, 1, 1, C.g2); }
    const from = Math.max(0, g.tower.length - 30);
    for (let i = from; i < g.tower.length; i++) block(g.tower[i].x, yOf(i), g.tower[i].w, i, false);
    if (g.mov) {
      const top = g.tower[g.tower.length - 1], y = yOf(g.tower.length);
      block(g.mov.x, y, g.mov.w, g.tower.length, true);
      // ghost guide lines show the tower edges
      { rect(top.x, y - 3, 1, 2, C.g2); rect(top.x + top.w - 1, y - 3, 1, 2, C.g2); }
    }
    for (const c of g.cut) { ctx.globalAlpha = Math.max(0, Math.min(1, c.life)); rect(c.x, c.y, c.w, BH - 1, C.g1); }
    ctx.globalAlpha = 1;
    if (g.label > 0) { const y = yOf(g.tower.length - 1) - 14; text(g.streak >= 3 && g.streak % 3 === 0 ? "PERFECT +WIDTH" : "PERFECT", W / 2, Math.max(TOP + 10, y), 8, "center", C.pap); }
    if (g.flash > 0 && !reduce) { ctx.globalAlpha = g.flash * 0.6; rect(0, TOP, W, H - TOP, C.pap); ctx.globalAlpha = 1; }
    rect(0, 0, W, TOP, C.ink); rect(0, TOP - 1, W, 1, C.g2);
    text("HEIGHT " + g.score, 6, 8, 8, "left", C.g3);
    if (g.streak > 1) text("STREAK x" + g.streak, W - 6, 8, 8, "right", C.pap);
    if (!g.dropped && !reduce && Math.floor(t * 2) % 2 === 0) text("SPACE OR TAP TO DROP", W / 2, TOP + 20, 8, "center", C.g3);
  }

  return {
    get score() { return g.score; },
    get _g() { return g; },
    reset, update, draw, repeat: false,
    hud: () => `HEIGHT ${g.score} · PERFECT ${g.perfects} · STREAK x${g.streak}`,
    key(k, down) { if (down && (k === " " || k === "enter" || k === "arrowdown" || k === "s")) drop(); },
    pointer(type) { if (type === "down") drop(); },
    touch: [["drop", "Drop"]],
    act(a, down) { if (down) drop(); },
  };
});

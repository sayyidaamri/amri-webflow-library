/* PIXELMOSS — games/bloom.js: Brick Bloom. Paddle & ball; every broken brick leaves pixel moss that keeps
   growing (bigger combos grow more). "2" capsules split the ball. Score = 10 x combo per brick. */
PMG.register("bloom", (api) => {
  const { W, H, C, rect, text, reduce } = api;
  const COLS = 10, ROWS = 5, BW = 28, BH = 9, GAP = 2, BX = Math.round((W - (COLS * (BW + GAP) - GAP)) / 2), BY = 34;
  const PY = 222, PH = 4;
  const g = { score: 0 };
  let keyL = false, keyR = false, target = null;

  function bricks() {
    g.bricks = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++)
      g.bricks.push({ x: BX + c * (BW + GAP), y: BY + r * (BH + GAP), hp: r === 0 && g.level > 1 ? 2 : 1, row: r, cap: Math.random() < 0.1 });
  }
  function serve() { g.balls = [{ x: g.px, y: PY - 4, vx: 0, vy: 0, stuck: true }]; }
  function reset() {
    Object.assign(g, { score: 0, level: 1, lives: 3, combo: 0, best: 0, px: W / 2, pw: 44, moss: [], caps: [], parts: [], served: false, flash: 0 });
    bricks(); serve(); keyL = keyR = false; target = null;
  }
  const speed = () => Math.min(230, 150 + g.level * 14 + (g.bricksHit || 0) * 0.4);
  function launch() {
    let any = false;
    g.balls.forEach((b) => { if (b.stuck) { const a = (Math.random() - 0.5) * 0.9; b.vx = Math.sin(a) * speed(); b.vy = -Math.cos(a) * speed(); b.stuck = false; any = true; } });
    if (any) { api.sfx("jump", 0.2); if (!g.served) { g.served = true; api.tip("Combos grow more moss", 2400); } }
  }
  function burst(x, y, col, n) { if (reduce) return; for (let i = 0; i < n; i++) g.parts.push({ x, y, vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.5) * 120, life: 0.45, col }); }
  function grow(b) {
    // moss: a cell of pixels that fills over time; combos plant extra seeds
    g.moss.push({ x: b.x, y: b.y, p: 0, rate: 0.35 + Math.min(1.2, g.combo * 0.12), seed: (Math.random() * 1e4) | 0 });
  }
  function hit(b) {
    b.hp--; g.combo++; g.best = Math.max(g.best, g.combo); g.bricksHit = (g.bricksHit || 0) + 1;
    if (b.hp > 0) { api.sfx("click", 0.25); return; }
    b.dead = true; g.score += 10 * g.combo; api.sfx("coin", 0.2); burst(b.x + BW / 2, b.y + BH / 2, C.pap, 8); grow(b);
    if (g.combo === 5) api.tip("Combo x5 · moss blooms faster", 1800);
    if (b.cap) g.caps.push({ x: b.x + BW / 2, y: b.y + BH });
  }
  function split() {
    const src = g.balls.find((b) => !b.stuck) || g.balls[0]; if (!src) return;
    api.sfx("power");
    for (const s of [-0.5, 0.5]) { const sp = speed(), a = Math.atan2(src.vx || 0.01, -(src.vy || -1)) + s; g.balls.push({ x: src.x, y: src.y, vx: Math.sin(a) * sp, vy: -Math.abs(Math.cos(a) * sp), stuck: false }); }
  }

  function stepBall(b, dt) {
    const ox = b.x, oy = b.y; b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < 2) { b.x = 2; b.vx = Math.abs(b.vx); } if (b.x > W - 6) { b.x = W - 6; b.vx = -Math.abs(b.vx); }
    if (b.y < 18) { b.y = 18; b.vy = Math.abs(b.vy); }
    if (b.vy > 0 && b.y + 4 >= PY && oy + 4 <= PY + 1 && b.x + 4 >= g.px - g.pw / 2 && b.x <= g.px + g.pw / 2) {
      const h = ((b.x + 2 - g.px) / (g.pw / 2)), a = Math.max(-1, Math.min(1, h)) * 1.05, sp = speed();
      b.vx = Math.sin(a) * sp; b.vy = -Math.cos(a) * sp; b.y = PY - 4; g.combo = 0; api.sfx("hover", 0.3);
    }
    for (const k of g.bricks) {
      if (k.dead || b.x + 4 <= k.x || b.x >= k.x + BW || b.y + 4 <= k.y || b.y >= k.y + BH) continue;
      const fromSide = ox + 4 <= k.x || ox >= k.x + BW;
      if (fromSide) b.vx = -b.vx; else b.vy = -b.vy;
      b.x = ox; b.y = oy; hit(k); break;
    }
  }
  function update(dt) {
    const sp = 260 * dt;
    if (keyL) g.px -= sp; if (keyR) g.px += sp;
    if (target !== null) g.px += Math.max(-sp * 1.6, Math.min(sp * 1.6, target - g.px));
    g.px = Math.max(g.pw / 2, Math.min(W - g.pw / 2, g.px));
    const n = 4;
    for (let i = 0; i < n; i++) g.balls.forEach((b) => { if (b.stuck) { b.x = g.px - 2; b.y = PY - 4; } else stepBall(b, dt / n); });
    g.balls = g.balls.filter((b) => b.y < H + 6);
    if (!g.balls.length) {
      g.lives--; g.combo = 0; api.sfx("hit", 0.35); g.flash = 0.3;
      if (g.lives <= 0) { api.over(); return; }
      serve(); api.tip(g.lives + (g.lives > 1 ? " lives left" : " life left"), 1500);
    }
    g.bricks = g.bricks.filter((k) => !k.dead);
    if (!g.bricks.length) { g.level++; g.score += 100 * g.level; api.sfx("power"); api.tip("Level " + g.level, 1600); g.caps = []; bricks(); serve(); }
    for (const c of g.caps) { c.y += 70 * dt; if (c.y + 6 >= PY && c.y <= PY + PH && Math.abs(c.x - g.px) < g.pw / 2 + 4) { c.got = true; split(); } }
    g.caps = g.caps.filter((c) => !c.got && c.y < H);
    for (const m of g.moss) m.p = Math.min(1, m.p + m.rate * dt * 0.25);
    g.parts.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }); g.parts = g.parts.filter((p) => p.life > 0);
    g.flash = Math.max(0, g.flash - dt);
  }

  function draw(ctx, t) {
    // moss beds: deterministic pixels appear as p grows
    for (const m of g.moss) {
      const total = Math.floor(m.p * 44);
      for (let i = 0; i < total; i++) { const h = (m.seed + i * 2654435761) >>> 0, x = h % BW, y = (h >>> 8) % BH; rect(m.x + x, m.y + y, 1 + (i % 3 === 0), 1, i % 4 ? C.g1 : C.g3); }
    }
    for (const k of g.bricks) {
      const col = k.hp > 1 ? C.g3 : k.row % 2 ? C.g3 : C.pap;
      rect(k.x, k.y, BW, BH, col);
      if (k.hp > 1) { rect(k.x + 2, k.y + 2, BW - 4, BH - 4, C.ink); rect(k.x + 4, k.y + 4, BW - 8, 1, C.g3); }
      else rect(k.x, k.y + BH - 1, BW, 1, C.g1);
      if (k.cap) rect(k.x + BW / 2 - 1, k.y + 3, 2, 3, C.ink);
    }
    for (const c of g.caps) { rect(c.x - 5, c.y, 10, 7, C.pap); text("2", c.x, c.y + 4, 8, "center", C.ink); }
    rect(g.px - g.pw / 2, PY, g.pw, PH, C.pap); rect(g.px - g.pw / 2 + 2, PY + PH, g.pw - 4, 1, C.g1);
    for (const b of g.balls) rect(b.x, b.y, 4, 4, C.pap);
    for (const p of g.parts) { ctx.globalAlpha = Math.max(0, p.life / 0.45); rect(p.x, p.y, 2, 2, p.col); }
    ctx.globalAlpha = 1;
    rect(0, 16, W, 1, C.g2);
    text("LV " + g.level, 6, 8, 8, "left", C.g3);
    text("♥".repeat(Math.max(0, g.lives)), W - 6, 8, 8, "right", C.pap);
    if (g.combo > 1) text("COMBO x" + g.combo, W / 2, 8, 8, "center", C.pap);
    if (g.balls.some((b) => b.stuck) && !reduce && Math.floor(t * 2) % 2 === 0) text("SPACE / TAP TO LAUNCH", W / 2, 190, 8, "center", C.g3);
    if (g.flash > 0) { ctx.globalAlpha = g.flash; rect(0, 0, W, H, C.pap); ctx.globalAlpha = 1; }
  }

  return {
    get score() { return g.score; },
    reset, update, draw, repeat: false,
    hud: () => `LIVES ${Math.max(0, g.lives)} · COMBO x${g.combo} · LEVEL ${g.level}`,
    key(k, down) {
      if (k === "arrowleft" || k === "a") keyL = down;
      else if (k === "arrowright" || k === "d") keyR = down;
      else if (down && (k === " " || k === "arrowup" || k === "w")) launch();
      if (down) target = null;
    },
    pointer(type, x, y, drag) { if (type === "down") { target = x; launch(); } else if (type === "move") target = x; else if (type === "up") target = null; },
    touch: [["left", "←"], ["launch", "Launch"], ["right", "→"]],
    act(a, down) { if (a === "left") keyL = down; else if (a === "right") keyR = down; else if (down) launch(); target = null; },
  };
});

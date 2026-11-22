/* PIXELMOSS — games/trail.js: Snail Trail. Grid snake on an 8px grid (40x28). Edges wrap; the only way
   to lose is crawling into your own shell. Every cell you leave gets a fading dither trail.
   Score = 10 per leaf. Controls: arrows / WASD, swipe on the canvas, or the touch d-pad. */
PMG.register("trail", (api) => {
  const { W, H, C, rect, text, sprite, reduce } = api;
  const S = 8, TOP = 16, COLS = W / S, ROWS = (H - TOP) / S;
  const DIR = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const KEYS = { arrowup: "up", w: "up", arrowdown: "down", s: "down", arrowleft: "left", a: "left", arrowright: "right", d: "right" };
  const LEAF = sprite(["...##...", "..####..", ".######.", "###.####", "####.###", ".######.", "..####..", "...#...."], { "#": C.pap });
  const LEAF2 = sprite(["...##...", "..####..", ".######.", "###.####", "####.###", ".######.", "..####..", "...#...."], { "#": C.g3 });
  const g = { score: 0 };
  let sw = null;

  function free() {
    const busy = new Set(g.body.map(([x, y]) => x + "," + y));
    for (let i = 0; i < 400; i++) { const x = (Math.random() * COLS) | 0, y = (Math.random() * ROWS) | 0; if (!busy.has(x + "," + y)) return [x, y]; }
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (!busy.has(x + "," + y)) return [x, y];
    return null;
  }
  function reset() {
    const cx = (COLS / 2) | 0, cy = (ROWS / 2) | 0;
    Object.assign(g, { score: 0, leaves: 0, body: [[cx, cy], [cx - 1, cy], [cx - 2, cy], [cx - 3, cy]], dir: "right", q: [], acc: 0, grow: 0, trail: new Map(), dead: 0, pop: [], age: 0 });
    g.leaf = free(); sw = null;
  }
  const step = () => Math.max(0.065, 0.15 - g.leaves * 0.004);
  function turn(d) {
    const last = g.q.length ? g.q[g.q.length - 1] : g.dir, [lx, ly] = DIR[last], [nx, ny] = DIR[d];
    if (d === last || (lx + nx === 0 && ly + ny === 0) || g.q.length > 2) return;
    g.q.push(d);
  }
  function move() {
    if (g.q.length) g.dir = g.q.shift();
    const [dx, dy] = DIR[g.dir], [hx, hy] = g.body[0];
    const nx = (hx + dx + COLS) % COLS, ny = (hy + dy + ROWS) % ROWS;
    const tail = g.grow > 0 ? -1 : g.body.length - 1;
    if (g.body.some(([x, y], i) => i !== tail && x === nx && y === ny)) { g.dead = 1; api.sfx("hit", 0.35); api.over(); return; }
    g.body.unshift([nx, ny]);
    if (g.grow > 0) g.grow--; else { const [tx, ty] = g.body.pop(); g.trail.set(tx + "," + ty, 1); }
    if (g.leaf && nx === g.leaf[0] && ny === g.leaf[1]) {
      g.leaves++; g.score = g.leaves * 10; g.grow += 2; api.sfx("coin", 0.25);
      if (!reduce) g.pop.push({ x: nx * S + 4, y: TOP + ny * S, life: 0.6 });
      if (g.leaves === 1) api.tip("Eat leaves to grow", 2000);
      if (g.leaves === 5) api.tip("Don't touch your shell", 2200);
      g.leaf = free();
    }
  }
  function update(dt) {
    g.age += dt; g.acc += dt;
    const st = step();
    while (g.acc >= st && !g.dead) { g.acc -= st; move(); }
    for (const [k, v] of g.trail) { const n = v - dt * 0.12; if (n <= 0) g.trail.delete(k); else g.trail.set(k, n); }
    g.pop.forEach((p) => { p.y -= 20 * dt; p.life -= dt; }); g.pop = g.pop.filter((p) => p.life > 0);
  }

  function dither(px, py, v) {
    // 4 density levels of a 2x2 ordered dither inside the cell
    const lvl = Math.ceil(v * 4), col = v > 0.5 ? C.g2 : C.g4;
    for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) {
      const b = ((x >> 1) & 1) * 2 + ((y >> 1) & 1); // 0..3 bayer-ish
      if ([0, 3, 1, 2].indexOf(b) < lvl) rect(px + x, py + y, 1, 1, col);
    }
  }
  function draw(ctx, t) {
    for (const [k, v] of g.trail) { const [x, y] = k.split(",").map(Number); dither(x * S, TOP + y * S, v); }
    if (g.leaf) { const bob = reduce ? 0 : Math.floor(t * 3) % 2; ctx.drawImage(bob ? LEAF2 : LEAF, g.leaf[0] * S, TOP + g.leaf[1] * S); }
    const n = g.body.length;
    for (let i = n - 1; i >= 1; i--) {
      const [x, y] = g.body[i], px = x * S, py = TOP + y * S;
      // shell segments: rounded 1-bit squares with a spiral dot
      rect(px + 1, py + 1, 6, 6, i % 2 ? C.g3 : C.pap); rect(px + 1, py + 1, 1, 1, C.ink); rect(px + 6, py + 6, 1, 1, C.ink);
      rect(px + 3, py + 3, 2, 2, C.ink); if (i % 3 === 0) rect(px + 4, py + 2, 1, 1, C.ink);
    }
    const [hx, hy] = g.body[0], [dx, dy] = DIR[g.dir], px = hx * S, py = TOP + hy * S;
    rect(px, py, S, S, C.pap); rect(px + 2, py + 2, 4, 4, g.dead ? C.g1 : C.pap);
    // eye stalks point where we crawl
    const ex = dx ? (dx > 0 ? 7 : 0) : 2, ey = dy ? (dy > 0 ? 7 : 0) : 2, ox = dx ? 0 : 3, oy = dy ? 0 : 3;
    rect(px + ex, py + ey, 1, 1, C.ink); rect(px + ex + ox, py + ey + oy, 1, 1, C.ink);
    if (dx) { rect(px + (dx > 0 ? 8 : -1), py + 1, 1, 1, C.pap); rect(px + (dx > 0 ? 8 : -1), py + 6, 1, 1, C.pap); }
    else { rect(px + 1, py + (dy > 0 ? 8 : -1), 1, 1, C.pap); rect(px + 6, py + (dy > 0 ? 8 : -1), 1, 1, C.pap); }
    for (const p of g.pop) { ctx.globalAlpha = Math.min(1, p.life * 2); text("+10", p.x, p.y, 8, "center", C.pap); }
    ctx.globalAlpha = 1;
    rect(0, TOP - 1, W, 1, C.g2);
    text("LEAVES " + g.leaves, 6, 8, 8, "left", C.g3);
    text("LEN " + n, W - 6, 8, 8, "right", C.g3);
    if (g.age < 2.2 && !reduce && Math.floor(t * 2) % 2 === 0) text("ARROWS OR SWIPE TO TURN", W / 2, TOP + 20, 8, "center", C.g3);
  }

  return {
    get score() { return g.score; },
    get _g() { return g; },
    reset, update, draw, repeat: false,
    hud: () => `LEAVES ${g.leaves} · LENGTH ${g.body.length} · SPEED ${Math.round(0.15 / step() * 10) / 10}x`,
    key(k, down) { if (down && KEYS[k]) turn(KEYS[k]); },
    pointer(type, x, y, drag) {
      if (type === "down") sw = [x, y];
      else if (type === "move" && sw && drag) {
        const dx = x - sw[0], dy = y - sw[1];
        if (Math.max(Math.abs(dx), Math.abs(dy)) > 14) { turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up"); sw = [x, y]; }
      } else if (type === "up") sw = null;
    },
    touch: [["left", "←"], ["up", "↑"], ["down", "↓"], ["right", "→"]],
    act(a, down) { if (down && DIR[a]) turn(a); },
  };
});

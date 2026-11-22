/* PIXELMOSS — games/pairs.js: Pixel Pairs. 16 cards (8 pairs of 1-bit sprites) on a 4x4 table.
   Flip two per turn; a match stays open, a miss flips back. 60-second clock.
   Score = 100 per pair, + 10 per second left when the table is cleared. Tap/click a card, or
   arrows/WASD to move the cursor and Space/Enter to flip. */
PMG.register("pairs", (api) => {
  const { W, H, C, rect, text, sprite, reduce } = api;
  const N = 4, CW = 44, CH = 48, GX = 8, GY = 4, X0 = (W - (N * CW + (N - 1) * GX)) / 2, TOP = 16;
  const Y0 = TOP + Math.round((H - TOP - (N * CH + (N - 1) * GY)) / 2), TIME = 60;
  const ART = [
    ["...##...", "..####..", ".######.", "###.####", "####.###", ".######.", "..####..", "...#...."], // leaf
    ["........", ".##..##.", "########", "########", ".######.", "..####..", "...##...", "........"], // heart
    ["...#....", "...#....", "..###...", "#######.", ".#####..", "..#.#...", ".#...#..", "........"], // star
    ["..####..", ".######.", "##.##.##", "########", "..#..#..", "..####..", "..####..", "........"], // mushroom
    ["...##...", "..#..#..", ".#.##.#.", "#.####.#", ".#.##.#.", "..#..#..", "...##...", "........"], // gem
    [".###....", "#...#...", "#...#...", ".###....", "..#.....", "..###...", "..#.....", "..##...."], // key
    ["........", "..###...", ".#...#..", "#..#..#.", "#.###.#.", "#..#..#.", ".#...##.", "..####.#"], // snail
    ["..####..", ".#....#.", "#.#..#.#", "#......#", "#.####.#", "#......#", ".#....#.", "..####.."], // smile
  ];
  const SPR = ART.map((a) => sprite(a, { "#": C.ink }, 3));
  const g = { score: 0 };

  function reset() {
    const deck = [...Array(8).keys(), ...Array(8).keys()];
    for (let i = deck.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [deck[i], deck[j]] = [deck[j], deck[i]]; }
    Object.assign(g, {
      score: 0, pairs: 0, left: TIME, open: [], wait: 0, cur: 0, clear: 0, moves: 0, done: false, warned: false,
      cards: deck.map((s, i) => ({ s, i, up: false, got: false, f: 0, shake: 0 })),
    });
  }
  const pos = (i) => [X0 + (i % N) * (CW + GX), Y0 + Math.floor(i / N) * (CH + GY)];
  function flip(i) {
    const c = g.cards[i];
    if (!c || c.up || c.got || g.wait > 0 || g.done || g.open.length >= 2) return;
    c.up = true; g.open.push(c); api.sfx("click", 0.3);
    if (g.open.length < 2) return;
    g.moves++;
    const [a, b] = g.open;
    if (a.s === b.s) {
      a.got = b.got = true; g.open = []; g.pairs++; g.score = g.pairs * 100; api.sfx("coin", 0.3);
      if (g.pairs === 1) api.tip("Match them all", 1800);
      if (g.pairs === 8) { g.done = true; g.score += Math.ceil(g.left) * 10; g.clear = 1.1; api.sfx("power", 0.4); }
    } else { g.wait = 0.75; a.shake = b.shake = 0.3; api.sfx("hover", 0.3); }
  }
  function update(dt) {
    for (const c of g.cards) { c.f += ((c.up || c.got ? 1 : 0) - c.f) * Math.min(1, dt * (reduce ? 60 : 14)); c.shake = Math.max(0, c.shake - dt); }
    if (g.done) { g.clear -= dt; if (g.clear <= 0) api.over(); return; }
    g.left = Math.max(0, g.left - dt);
    if (!g.warned && g.left <= 10) { g.warned = true; api.tip("10 seconds left", 1600); }
    if (g.wait > 0) { g.wait -= dt; if (g.wait <= 0) { g.open.forEach((c) => (c.up = false)); g.open = []; } }
    if (g.left <= 0) { g.done = true; api.sfx("hit", 0.3); api.over(); }
  }

  function card(c, t) {
    let [x, y] = pos(c.i);
    if (c.shake > 0 && !reduce) x += Math.round(Math.sin(c.shake * 60) * 2);
    // flip: card squashes horizontally, face shows past the halfway point
    const k = Math.abs(c.f * 2 - 1), w = Math.max(2, Math.round(CW * (reduce ? 1 : k))), dx = Math.round((CW - w) / 2), face = c.f > 0.5;
    if (face) {
      rect(x + dx, y, w, CH, c.got ? C.g3 : C.pap);
      if (w > 30) { const s = SPR[c.s]; api.ctx.drawImage(s, Math.round(x + (CW - s.width) / 2), Math.round(y + (CH - s.height) / 2)); }
      if (c.got) { rect(x + dx, y, w, 1, C.pap); rect(x + dx, y + CH - 1, w, 1, C.pap); }
    } else {
      rect(x + dx, y, w, CH, C.g2);
      for (let py = 3; py < CH - 2; py += 4) for (let px = 3 + ((py >> 2) % 2) * 2; px < w - 2; px += 4) rect(x + dx + px, y + py, 1, 1, C.g1);
      rect(x + dx + 1, y + 1, w - 2, 1, C.g1);
    }
    if (c.i === g.cur && !g.done && (reduce || Math.floor(t * 3) % 3 !== 0)) {
      rect(x - 2, y - 2, CW + 4, 1, C.pap); rect(x - 2, y + CH + 1, CW + 4, 1, C.pap); rect(x - 2, y - 2, 1, CH + 4, C.pap); rect(x + CW + 1, y - 2, 1, CH + 4, C.pap);
    }
  }
  function draw(ctx, t) {
    for (const c of g.cards) card(c, t);
    rect(0, TOP - 1, W, 1, C.g2);
    text("PAIRS " + g.pairs + "/8", 6, 8, 8, "left", C.g3);
    const s = Math.ceil(g.left), low = s <= 10 && !g.done;
    text("TIME " + String(s).padStart(2, "0"), W - 6, 8, 8, "right", low && !reduce && Math.floor(t * 4) % 2 ? C.g1 : C.pap);
    rect(W / 2 - 40, 6, 80, 4, C.g2); rect(W / 2 - 40, 6, Math.round((80 * g.left) / TIME), 4, low ? C.g3 : C.pap);
    if (g.done && g.pairs === 8) { rect(W / 2 - 60, H / 2 - 14, 120, 28, C.ink); text("CLEAR! +" + Math.ceil(g.left) * 10, W / 2, H / 2, 8, "center", C.pap); }
  }
  const at = (x, y) => g.cards.findIndex((c) => { const [cx, cy] = pos(c.i); return x >= cx && x < cx + CW && y >= cy && y < cy + CH; });

  return {
    get score() { return g.score; },
    get _g() { return g; },
    reset, update, draw, repeat: false,
    hud: () => `PAIRS ${g.pairs}/8 · TIME ${Math.ceil(g.left)}s · MOVES ${g.moves}`,
    key(k, down) {
      if (!down) return;
      const m = { arrowleft: -1, a: -1, arrowright: 1, d: 1, arrowup: -N, w: -N, arrowdown: N, s: N }[k];
      if (m) { const n = g.cur + m; if (n >= 0 && n < 16 && (Math.abs(m) === N || Math.floor(n / N) === Math.floor(g.cur / N))) g.cur = n; }
      else if (k === " " || k === "enter") flip(g.cur);
    },
    pointer(type, x, y) { if (type !== "down") return; const i = at(x, y); if (i >= 0) { g.cur = i; flip(i); } },
    touch: null,
  };
});

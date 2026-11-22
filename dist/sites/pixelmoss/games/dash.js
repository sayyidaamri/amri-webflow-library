/* PIXELMOSS — games/dash.js: Moss Dash (monochrome port of Pixel Dash).
   Obstacles of your current mode are harmless (you phase through). The other mode must be jumped,
   zapped (D, code power) or floated over (C, pixel power). Coins refill the matching power. */
PMG.register("dash", (api) => {
  const { W, H, C, rect, text, sprite, reduce, A } = api;
  const GROUND = 204, PX = 48;
  const BUG = ["X.......X", ".X.XXX.X.", "..XXXXX..", "XXXKXKXXX", "..XXXXX..", ".XXXXXXX.", "X.X...X.X"];
  const BLOB = ["...XX...", "..XDXX..", ".XDXXXX.", "XXXKXKXX", "XDXXXXDX", "XXXXXXXX", ".XXDXXX.", "..XXXX.."];
  const SPR = {
    code: sprite(BUG, { X: C.pap, K: C.ink }),
    pixel: sprite(BLOB, { X: C.g3, D: C.g1, K: C.ink }),
    pCode: sprite(A.mini, A.miniPal.dev), pPix: sprite(A.mini, A.miniPal.creative || A.miniPal.dev),
  };
  const PW = SPR.pCode.width, PH = SPR.pCode.height;
  const NAME = { code: "CODE", pixel: "PIXEL" };
  const g = { score: 0 };

  function reset() {
    Object.assign(g, { t: 0, speed: 100, dist: 0, coins: 0, score: 0, mode: "code", switchCd: 0, powerCd: 0, pips: { code: 3, pixel: 3 },
      float: 0, beam: 0, obs: [], coinList: [], parts: [], spawn: 1.3, coinSpawn: 2, py: GROUND, vy: 0, onGround: true, tips: {}, dead: false });
  }
  const tipOnce = (k, s, ms) => { if (!g.tips[k]) { g.tips[k] = 1; api.tip(s, ms); } };
  function burst(x, y, col, n) { if (reduce) return; for (let i = 0; i < n; i++) g.parts.push({ x, y, vx: (Math.random() - 0.5) * 180, vy: (Math.random() - 0.8) * 180, life: 0.6, col }); }

  function jump() { if (g.onGround) { g.vy = -300; g.onGround = false; api.sfx("jump", 0.25); } }
  function switchMode() {
    if (g.switchCd > 0) return;
    g.mode = g.mode === "code" ? "pixel" : "code"; g.switchCd = 1.2; api.sfx("switch");
    burst(PX + PW / 2, g.py - PH / 2, C.pap, 14);
  }
  function power(kind) {
    if (g.powerCd > 0 || g.pips[kind] <= 0) { api.sfx("hit", 0.15); return; }
    g.pips[kind]--; g.powerCd = 2; api.sfx("power");
    if (kind === "code") { g.beam = 0.35; g.obs.forEach((o) => { if (o.x > PX && o.x < PX + 200) { o.dead = true; burst(o.x + o.w / 2, o.y - o.h / 2, C.pap, 16); } }); }
    else g.float = 3;
  }

  function update(dt) {
    g.t += dt; g.speed = Math.min(260, 100 + g.t * 3.4); g.dist += g.speed * dt;
    g.switchCd = Math.max(0, g.switchCd - dt); g.powerCd = Math.max(0, g.powerCd - dt); g.float = Math.max(0, g.float - dt); g.beam = Math.max(0, g.beam - dt);
    g.vy += (g.float > 0 ? 240 : 880) * dt; g.py += g.vy * dt;
    if (g.float > 0 && g.py > GROUND - 64 && g.vy > 0) g.vy = Math.min(g.vy, 26);
    if (g.py >= GROUND) { g.py = GROUND; g.vy = 0; g.onGround = true; }
    g.spawn -= dt;
    if (g.spawn <= 0) {
      const kind = Math.random() < 0.5 ? "code" : "pixel", u = Math.random() < 0.3 ? 3 : 2, spr = SPR[kind];
      const stack = g.t > 20 && u === 2 && Math.random() < 0.25 ? 2 : 1;
      g.obs.push({ kind, x: W + 16, w: spr.width * u, h: spr.height * u * stack, u, stack, y: GROUND });
      g.spawn = Math.max(0.6, 1.55 - g.t * 0.012) + Math.random() * 0.8;
      if (g.obs.length === 1 && kind !== g.mode) tipOnce("color", `${kind === "code" ? "Bug" : "Blob"}! Jump, or press S to switch`, 3000);
      if (g.t > 12) tipOnce("power", "D zaps bugs ahead · C floats for 3s", 3200);
    }
    g.coinSpawn -= dt;
    if (g.coinSpawn <= 0) { g.coinList.push({ x: W + 8, y: GROUND - 50 - Math.random() * 60, kind: Math.random() < 0.5 ? "code" : "pixel" }); g.coinSpawn = 1.4 + Math.random() * 1.6; }
    const dx = g.speed * dt;
    g.obs.forEach((o) => (o.x -= dx)); g.coinList.forEach((c) => (c.x -= dx));
    g.obs = g.obs.filter((o) => o.x + o.w > -16 && !o.dead); g.coinList = g.coinList.filter((c) => c.x > -16 && !c.got);
    const x1 = PX + 3, x2 = PX + PW - 3, y1 = g.py - PH + 3, y2 = g.py;
    for (const o of g.obs) {
      if (o.kind === g.mode) continue;
      if (x2 > o.x + 2 && x1 < o.x + o.w - 2 && y2 > o.y - o.h + 2) { burst(PX + PW / 2, g.py - PH / 2, C.pap, 28); g.dead = true; api.over(); return; }
    }
    for (const c of g.coinList) if (x2 > c.x - 4 && x1 < c.x + 4 && y2 > c.y - 4 && y1 < c.y + 4) {
      c.got = true; g.coins++; g.pips[c.kind] = Math.min(3, g.pips[c.kind] + 1); api.sfx("coin", 0.25); burst(c.x, c.y, C.pap, 8);
    }
    g.parts.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 520 * dt; p.life -= dt; }); g.parts = g.parts.filter((p) => p.life > 0);
    g.score = g.dist * 0.1 + g.coins * 50;
  }

  function draw(ctx, t, state) {
    const off = g.dist;
    for (let i = 0; i < 30; i++) { const bw = 18 + ((i * 37) % 22), bh = 22 + ((i * 53) % 56), x = (((i * 44 - off * 0.2) % (W + 90)) + W + 90) % (W + 90) - 45; rect(x, GROUND - bh, bw, bh, C.g4); }
    for (let i = 0; i < 36; i++) { const x = (((i * 97 - off * 0.05) % W) + W) % W, y = ((i * 61) % (GROUND - 80)) + 8; rect(x, y, 1, 1, C.g2); }
    rect(0, GROUND, W, 2, C.pap);
    for (let x = -(off % 18); x < W; x += 18) rect(x, GROUND + 7, 8, 1, C.g2);
    for (const c of g.coinList) {
      const b = reduce ? 0 : Math.sin(t * 5.5 + c.x) * 2;
      if (c.kind === "code") rect(c.x - 3, c.y - 3 + b, 6, 6, C.pap);
      else { rect(c.x - 3, c.y - 3 + b, 6, 6, C.g3); rect(c.x - 1, c.y - 1 + b, 2, 2, C.ink); }
    }
    for (const o of g.obs) {
      const spr = SPR[o.kind]; ctx.globalAlpha = o.kind === g.mode ? 0.28 : 1;
      for (let s = 0; s < o.stack; s++) ctx.drawImage(spr, Math.round(o.x), Math.round(o.y - (s + 1) * spr.height * o.u), spr.width * o.u, spr.height * o.u);
      ctx.globalAlpha = 1;
    }
    if (g.beam > 0) { ctx.globalAlpha = g.beam / 0.35; rect(PX + PW, g.py - PH * 0.6, 200, 3, C.pap); ctx.globalAlpha = 1; }
    if (g.float > 0) { ctx.globalAlpha = reduce ? 0.35 : 0.3 + 0.15 * Math.sin(t * 11); rect(PX - 3, g.py - PH - 3, PW + 6, PH + 6, C.g1); ctx.globalAlpha = 1; }
    const bob = state === "run" && g.onGround && !reduce ? (Math.floor(t * 9) % 2) : 0;
    if (!g.dead || Math.floor(performance.now() / 120) % 2) ctx.drawImage(g.mode === "code" ? SPR.pCode : SPR.pPix, PX, Math.round(g.py - PH - bob));
    if (g.mode === "pixel") for (let y = 0; y < PH; y += 2) rect(PX, g.py - PH - bob + y, PW, 1, "rgba(10,10,10,.35)");
    for (const p of g.parts) { ctx.globalAlpha = Math.max(0, p.life / 0.6); rect(p.x, p.y, 2, 2, p.col); }
    ctx.globalAlpha = 1;
    text("MODE " + NAME[g.mode], 8, 12, 8, "left", C.pap);
    text(g.switchCd > 0 ? "S " + g.switchCd.toFixed(1) : "S READY", 8, 24, 8, "left", g.switchCd > 0 ? C.g1 : C.g3);
  }

  const pips = (n) => "■".repeat(n) + "□".repeat(3 - n);
  return {
    get score() { return g.score; },
    reset, update, draw,
    hud: () => `MODE ${NAME[g.mode]} · D ${pips(g.pips.code)} · C ${pips(g.pips.pixel)} · POWER ${g.powerCd > 0 ? g.powerCd.toFixed(1) + "s" : "READY"}`,
    key(k, down) {
      if (!down) return;
      if (k === " " || k === "arrowup" || k === "w") jump();
      else if (k === "s") switchMode(); else if (k === "d") power("code"); else if (k === "c") power("pixel");
    },
    pointer(type) { if (type === "down") jump(); },
    touch: [["jump", "Jump"], ["switch", "Switch"], ["power", "Power"]],
    act(a, down) { if (!down) return; if (a === "jump") jump(); else if (a === "switch") switchMode(); else power(g.mode); },
  };
});

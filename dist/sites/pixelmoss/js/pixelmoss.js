/* PIXELMOSS (Amri Webflow Library) — built from jld2nd.dev by tools/pixelmoss/build.py */
/* PIXELMOSS — original pixel-art library.
   Every drawing here is a hand-made grid (one character = one pixel).
   px(grid, palette) turns a grid into an inline <svg> made of merged <rect> runs. */
(function () {
  const C = {
    ink: "#161616", lime: "#f3f3ef", limeD: "#6b6b6b", white: "#f3f3ef", cream: "#f3f3ef",
    yellow: "#e2e2de", pink: "#6b6b6b", blue: "#6b6b6b", cyan: "#f3f3ef", orange: "#b5b5b5", violet: "#6b6b6b", red: "#6b6b6b",
  };

  /* grid → svg string. pal maps char → colour ('.' and ' ' are transparent). */
  function px(grid, pal, opt = {}) {
    const h = grid.length, w = Math.max(...grid.map((r) => r.length));
    let rects = "";
    for (let y = 0; y < h; y++) {
      const row = grid[y];
      let x = 0;
      while (x < w) {
        const ch = row[x] || ".";
        if (ch === "." || ch === " " || !pal[ch]) { x++; continue; }
        let run = 1;
        while (x + run < w && (row[x + run] || ".") === ch) run++;
        rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${pal[ch]}"${opt.cls ? ` class="${opt.cls}"` : ""}/>`;
        x += run;
      }
    }
    const attrs = opt.attrs || "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" ${attrs}>${rects}</svg>`;
  }
  const mirror = (g) => g.map((r) => r.split("").reverse().join(""));
  const size = (g) => ({ w: Math.max(...g.map((r) => r.length)), h: g.length });

  /* ---------- HERO AVATAR (32 x 36) — Raka with headphones ---------- */
  const avatar = [
    "...........YYYYYYYYYY...........",
    ".........YY..........YY.........",
    "........Y...HHHHHHHH...Y........",
    ".......Y..HHHHhHHHHHHH..Y.......",
    ".......Y.HHHhHHHHHhHHHHH.Y......",
    "......Y.HHHHHHHHHHHHHhHHH.Y.....",
    "......Y.HHhHHHHhHHHHHHHHHHY.....",
    "......YHHHHHHHHHHHHHHHHHHHY.....",
    "....YYYHHHSSSHHHHSSSSHHHHHYYY...",
    "...YyyYHHSSSSSSSSSSSSSSSHHYyyY..",
    "...YyyYHSSSSSSSSSSSSSSSSSHYyyY..",
    "...YyyYSSKKKKSSSSSSKKKKSSSYyyY..",
    "...YyyYSSSSSSSSSSSSSSSSSSSYyyY..",
    "...YyyYSSWKKSSSSSSSSWKKSSSYyyY..",
    "....YYYSSWKKSSSSSSSSWKKSSSYYY...",
    ".......sSSSSSSSSsSSSSSSSSs......",
    ".......sSSSSSSSSssSSSSSSSs......",
    "........SSSSSSSssssSSSSSS.......",
    "........SSSSSSSSSSSSSSSSS.......",
    "........SSSSSMMMMMMMMSSSS.......",
    "........SSSSSMTTTTTTMSSSS.......",
    ".........SSSSSMMMMMMSSSS........",
    ".........SSSSSSSSSSSSSSS........",
    "..........sSSSSSSSSSSSs.........",
    "...........ssSSSSSSSss..........",
    ".............sSSSSSs............",
    ".............sSSSSSs............",
    ".........CCCCcSSSSScCCCC........",
    ".......CCCCCCCcSSScCCCCCCC......",
    "......CCCCCCCCCcSScCCCCCCCC.....",
    ".....CCCCCCCCCCCccCCCCCCCCCC....",
    "....CCCCcCCCCCCCCCCCCCCCcCCCC...",
    "...CCCCCcCCCCCCZZCCCCCCCcCCCCC..",
    "...CCCCCcCCCCCZZZZCCCCCCcCCCCC..",
    "..CCCCCCcCCCCCCZZCCCCCCCcCCCCCC.",
    "..CCCCCCcCCCCCCCCCCCCCCCcCCCCCC.",
  ];
  const avatarPal = {
    dev: { Y: C.lime, y: "#b5b5b5", H: "#2e2e2e", h: "#6b6b6b", S: "#b5b5b5", s: "#6b6b6b", K: "#161616", W: "#f3f3ef", M: "#2e2e2e", T: "#f3f3ef", C: "#2e2e2e", c: "#6b6b6b", Z: C.lime },
    creative: { Y: C.pink, y: "#b5b5b5", H: "#2e2e2e", h: "#6b6b6b", S: "#b5b5b5", s: "#6b6b6b", K: "#161616", W: "#f3f3ef", M: "#2e2e2e", T: "#f3f3ef", C: "#f3f3ef", c: "#b5b5b5", Z: C.red },
  };

  /* ---------- MINI SPRITE (14 x 28) ---------- */
  const mini = [
    "....HHHHHH....",
    "...HHhHHHHH...",
    "..HHHHHHhHHH..",
    "..HHSSSSSSHH..",
    ".YYSKSSSSKSYY.",
    ".YySWSSSSWSyY.",
    "..YSSSSSSSSY..",
    "...SSMMMMSS...",
    "....SSSSSS....",
    ".....ssss.....",
    "...CCCCCCCC...",
    "..CCCCZZCCCC..",
    ".CCCCZZZZCCCC.",
    ".CC.CCZZCC.CC.",
    ".CC.CCCCCC.CC.",
    ".CC.CCCCCC.CC.",
    ".SS.CCCCCC.SS.",
    ".SS.cccccc.SS.",
    "....PPPPPP....",
    "....PPPPPP....",
    "....PPP.PPP...",
    "....PPP.PPP...",
    "....PPP.PPP...",
    "....ppp.ppp...",
    "....PPP.PPP...",
    "....PPP.PPP...",
    "...WWWW.WWWW..",
    "...KKKK.KKKK..",
  ];
  const miniPal = {
    dev: { ...avatarPal.dev, P: "#2e2e2e", p: "#6b6b6b" },
    creative: { ...avatarPal.creative, P: "#6b6b6b", p: "#b5b5b5" },
  };

  /* ---------- BRAIN half (13 x 16), right half = mirror ---------- */
  const brainL = [
    ".....KKKKKK..",
    "...KKpppPppK.",
    "..KpPPpppPPK.",
    ".KppppPPpppK.",
    "KppPPpppppPK.",
    "KpppppPPppPK.",
    "KPPpppppPPpK.",
    "KpppPPpppppK.",
    "KpppppPPPppK.",
    "KpPPppppppPK.",
    "KppppPPpppPK.",
    ".KpPpppPPppK.",
    ".KppPPpppPK..",
    "..KKpppPpK...",
    "....KKpppK...",
    "......KKK....",
  ];
  const brainPal = { K: "#0a0a0a", p: "#b5b5b5", P: "#6b6b6b" };

  /* ---------- PLAYING CARD (20 x 28) ---------- */
  const card = [
    "KKKKKKKKKKKKKKKKKKKK",
    "KWWWWWWWWWWWWWWWWWWK",
    "KWWRWWWWWWWWWWWWWWWK",
    "KWRWRWWWWWWWWWWWWWWK",
    "KWRRRWWWWWWWWWWWWWWK",
    "KWRWRWWWWWWWWWWWWWWK",
    "KWRWRWWWWWWWWWWWWWWK",
    "KWWWWWWWWWWWWWWWWWWK",
    "KWWWWWWWWWWWWWWWWWWK",
    "KWWWWWRRWWWWRRWWWWWK",
    "KWWWWRRRRWWRRRRWWWWK",
    "KWWWWRRRRRRRRRRWWWWK",
    "KWWWWRRRRRRRRRRWWWWK",
    "KWWWWWRRRRRRRRWWWWWK",
    "KWWWWWWRRRRRRWWWWWWK",
    "KWWWWWWWRRRRWWWWWWWK",
    "KWWWWWWWWRRWWWWWWWWK",
    "KWWWWWWWWWWWWWWWWWWK",
    "KWWWWWWWWWWWWWWWWWWK",
    "KWWWWWWWWWWWWWWWWWWK",
    "KWWWWWWWWWWWWWWWWWWK",
    "KWWWWWWWWWWWWWWRWRWK",
    "KWWWWWWWWWWWWWWRWRWK",
    "KWWWWWWWWWWWWWWRRRWK",
    "KWWWWWWWWWWWWWWRWRWK",
    "KWWWWWWWWWWWWWWWRWWK",
    "KWWWWWWWWWWWWWWWWWWK",
    "KKKKKKKKKKKKKKKKKKKK",
  ];
  const cardPal = { K: "#0a0a0a", W: "#f3f3ef", R: C.red };

  /* ---------- HEART (9 x 8) ---------- */
  const heart = [
    ".RR...RR.",
    "RWRR.RRRR",
    "RRRRRRRRR",
    "RRRRRRRRR",
    ".RRRRRRR.",
    "..RRRRR..",
    "...RRR...",
    "....R....",
  ];
  const heartPal = { R: C.red, W: "#e2e2de" };

  /* ---------- GLASSES (48 x 15) — round-ish frames, eyes drawn separately ---------- */
  const glasses = [
    "...WWWWWWWWWWWWW............WWWWWWWWWWWWW...",
    "WWWWWWWWWWWWWWWWWW........WWWWWWWWWWWWWWWWWW",
    "WW.WW...........WW........WW...........WW.WW",
    "W..WW...........WWWWWWWWWWWW...........WW..W",
    "...WW...........WWWWWWWWWWWW...........WW...",
    "...WW...........WW........WW...........WW...",
    "...WW...........WW........WW...........WW...",
    "...WW...........WW........WW...........WW...",
    "...WW...........WW........WW...........WW...",
    "....WW.........WW..........WW.........WW....",
    "....WW.........WW..........WW.........WW....",
    ".....WWWWWWWWWWW............WWWWWWWWWWW.....",
    "......WWWWWWWWW..............WWWWWWWWW......",
  ];
  const glassesPal = { W: C.cream };

  /* ---------- HANDS (left = lime sleeve + hand, pointing right) ---------- */
  const handL = [
    "BBBBBBBBBBBB....................",
    "BBBBBBBBBBBBhhhhhh..............",
    "BBBBBBBBBBBBhhhhhhhhhhhhhhhhhh..",
    "BBBBBBBBBBBBhhhhhhhhhhhhhhhhhhh.",
    "BBBBBBBBBBBBhhhhhhhhhhssssssss..",
    "BBBBBBBBBBBBhhhhhhhhhh..........",
    "BBBBBBBBBBBBhhhhhhhshhh.........",
    "BBBBBBBBBBBBhhhhhhhhhhh.........",
    "BBBBBBBBBBBBhhhhhhshhhh.........",
    "BBBBBBBBBBBBhhhhhhhhhh..........",
    "BBBBBBBBBBBB.hhhhhhhh...........",
    "BBBBBBBBBBBB....................",
  ];
  const handLPal = { B: C.lime, h: "#b5b5b5", s: "#f3f3ef" };
  const handR = mirror([
    "BBBBBBBBBBBB....................",
    "BBBBBBBBBBBB....................",
    "BBBBBBBBBBBBhhhhhhhhh...........",
    "BBBBBBBBBBBBhhhhhhhhhhhhhhhhhh..",
    "BBBBBBBBBBBBhhhhhhhhhhhhhhhhhhh.",
    "BBBBBBBBBBBBhhhhhhhhhhssssssss..",
    "BBBBBBBBBBBBhhhhhhhhhhhh........",
    "BBBBBBBBBBBBhhhhhhhshhhh........",
    "BBBBBBBBBBBBhhhhhhhhhhhh........",
    "BBBBBBBBBBBBhhhhhhshhhh.........",
    "BBBBBBBBBBBB.hhhhhhhhh..........",
    "BBBBBBBBBBBB....................",
  ]);
  const handRPal = { B: "#6b6b6b", h: C.cream, s: "#b5b5b5" };

  /* ---------- PROFILE HEAD (24 x 25) facing left ---------- */
  const head = [
    "........QQQQQQQQ........",
    "......QQQQQQQQQQQQ......",
    ".....QQQQQQQQQQQQQQ.....",
    "....QQQQQQQQQQQQQQQQ....",
    "...QQQQQQQQQQQQQQQQQQ...",
    "...QQQQQQQQQQQQQQQQQQQ..",
    "..QQQQQQQQQQQQQQQQQQQQ..",
    "..QQQQQQQQQQQQQQQQQQQQQ.",
    ".QQQQQQQQQQQQQQQQQQQQQQ.",
    ".QQQQQQQQQQQQQQQQQQQQQQ.",
    "QQQQQQQQQQQQQQQQQQQQQQQ.",
    ".QQQKQQQQQQQQQQQQQQQQQQ.",
    "QQQQQQQQQQQQQQQQQQQQQQ..",
    "..QQQQQQQQQQQQQQQQQQQQ..",
    "QQQQQQQQQQQQQQQQQQQQQ...",
    ".QQQQQQQQQQQQQQQQQQQQ...",
    "..QQQQQQQQQQQQQQQQQQQ...",
    "...QQQQQQQQQQQQQQQQQ....",
    "..QQQQQQQQQQQQQQQQQ.....",
    "...QQQQQQQQQQQQQQQ......",
    ".....QQQQQQQQQQQQ.......",
    ".........QQQQQQQ........",
    ".........QQQQQQQ........",
    ".........QQQQQQQQ.......",
    "........QQQQQQQQQQ......",
  ];

  /* ---------- UI ICONS (12 x 12) ---------- */
  const icons = {
    soundOff: ["............", ".....X......", "....XX......", "...XXX......", "XXXXXX.X...X", "XXXXXX..X.X.", "XXXXXX...X..", "XXXXXX..X.X.", "...XXX.X...X", "....XX......", ".....X......", "............"],
    soundOn: ["............", ".....X......", "....XX...X..", "...XXX.X..X.", "XXXXXX..X..X", "XXXXXX..X..X", "XXXXXX..X..X", "XXXXXX..X..X", "...XXX.X..X.", "....XX...X..", ".....X......", "............"],
    phone: ["..XXXXXXXX..", "..X......X..", "..X.XXXX.X..", "..X.XXXX.X..", "..X.XXXX.X..", "..X.XXXX.X..", "..X.XXXX.X..", "..X.XXXX.X..", "..X......X..", "..X..XX..X..", "..X......X..", "..XXXXXXXX.."],
    pad: ["............", "..XX....XX..", ".XXXXXXXXXX.", "XX.XXXXXX.XX", "X...XXXX.X.X", "XX.XXXXXX.XX", "XXXXXXXXXXXX", "XXXXXXXXXXXX", "XXXX....XXXX", "XXX......XXX", ".X........X.", "............"],
    folder: ["............", "XXXXX.......", "X...XXXXXXX.", "XXXXXXXXXXXX", "XXXXXXXXXXXX", "XXXXXXXXXXXX", "XXXXXXXXXXXX", "XXXXXXXXXXXX", "XXXXXXXXXXXX", "XXXXXXXXXXXX", "............", "............"],
    close: ["X.....X", ".X...X.", "..X.X..", "...X...", "..X.X..", ".X...X.", "X.....X"],
    up: ["...X...", "..XXX..", ".XXXXX.", "XXXXXXX"],
    down: ["XXXXXXX", ".XXXXX.", "..XXX..", "...X..."],
    arrow: ["X...", "XX..", "XXX.", "XXXX", "XXX.", "XX..", "X..."],
    list: ["............", "XX.XXXXXXXXX", "XX.XXXXXXXXX", "............", "XX.XXXXXXXXX", "XX.XXXXXXXXX", "............", "XX.XXXXXXXXX", "XX.XXXXXXXXX", "............", "XX.XXXXXXXXX", "XX.XXXXXXXXX"],
    claw: ["XXXXXXXXXXXX", "X..........X", "X....XX....X", "X....XX....X", "X...XXXX...X", "X...X..X...X", "X..........X", "X.XX.XX.XX.X", "X.XXXXXXXXXX", "XXXXXXXXXXXX", "XX...XX...XX", "XXXXXXXXXXXX"],
    ok: ["......X", ".....XX", "X...XX.", "XX.XX..", ".XXX...", "..X...."],
    err: ["XX...XX", ".XX.XX.", "..XXX..", ".XX.XX.", "XX...XX"],
  };
  const icon = (name, color = "currentColor", attrs = "") => px(icons[name], { X: color }, { attrs });

  /* ---------- CHOMPER (section nav) ---------- */
  const chomp = {
    open: ["...XXXXX...", ".XXXXXXXXX.", "XXXXXXXXX..", "XXXXXXX....", "XXXXX......", "XXXXXXX....", "XXXXXXXXX..", ".XXXXXXXXX.", "...XXXXX..."],
    closed: ["...XXXXX...", ".XXXXXXXXX.", "XXXXXXXXXXX", "XXXXXXXXXXX", "XXXXXXXXXXX", "XXXXXXXXXXX", "XXXXXXXXXXX", ".XXXXXXXXX.", "...XXXXX..."],
    food: ["XX", "XX"],
  };

  /* ---------- LOADER GLYPHS (7 x 7) ---------- */
  const glyphs = [
    [".X...X.", "XXX.XXX", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."],
    ["...X...", "...X...", ".XXXXX.", "XXXXXXX", ".XXXXX.", ".X...X.", "X.....X"],
    ["XXXXXXX", "X.....X", "X.....X", "XXXXXXX", "...X...", ".XXXXX.", "......."],
    ["..XXX..", ".X...X.", "X.X.X.X", "X.....X", "X.XXX.X", ".X...X.", "..XXX.."],
    ["....XX.", "...XX..", "..XXX..", ".XXXXX.", "..XXX..", "..XX...", ".XX...."],
    [".XXXXX.", "X.....X", "X.XXX.X", "X.....X", ".XXXXX.", "...X...", "..XXX.."],
    ["X.....X", ".X...X.", "..X.X..", "...X...", "..X.X..", ".X...X.", "X.....X"],
    [".XXXX..", "X....X.", "X....XX", "X....XX", "X....X.", ".XXXX..", "XXXXXX."],
    ["..X.X..", ".XXXXX.", "XX.X.XX", "XXXXXXX", ".X...X.", "X.X.X.X", "......."],
  ];

  /* ---------- PIXEL FONT for the logo (5x7) ---------- */
  const font = {
    R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
    A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
    "'": ["#", "#", ".", ".", ".", ".", "."],
    P: ["####.","#...#","#...#","####.","#....","#....","#...."],
    I: ["###",".#.",".#.",".#.",".#.",".#.","###"],
    X: ["#...#","#...#",".#.#.","..#..",".#.#.","#...#","#...#"],
    E: ["#####","#....","#....","####.","#....","#....","#####"],
    L: ["#....","#....","#....","#....","#....","#....","#####"],
    M: ["#...#","##.##","#.#.#","#.#.#","#...#","#...#","#...#"],
    O: [".###.","#...#","#...#","#...#","#...#","#...#",".###."],
    S: [".####","#....","#....",".###.","....#","....#","####."],
    8: [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  };
  function logo(text = "PIXELMOSS", color = C.lime, shadow = C.limeD) {
    const rows = Array.from({ length: 7 }, () => "");
    for (const ch of text) { const g = font[ch]; for (let y = 0; y < 7; y++) rows[y] += g[y] + "."; }
    const w = rows[0].length + 1, h = 8;
    const grid = Array.from({ length: h }, () => Array(w).fill("."));
    rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === "#") { if (grid[y + 1][x + 1] === ".") grid[y + 1][x + 1] = "s"; grid[y][x] = "#"; } }));
    return px(grid.map((r) => r.join("")), { "#": color, s: shadow }, { attrs: 'class="pm-logo-svg" aria-hidden="true"' });
  }

  window.ART = { C, px, mirror, size, avatar, avatarPal, mini, miniPal, brainL, brainPal, card, cardPal, heart, heartPal, glasses, glassesPal, handL, handLPal, handR, handRPal, head, icons, icon, chomp, glyphs, logo };
})();

/* PIXELMOSS — shared behaviour: scramble text, cursor grid trail, sound, contact modal, logo. */
(function () {
  const A = window.ART;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const store = {
    get(k, d) { try { const v = localStorage.getItem("pm:" + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("pm:" + k, JSON.stringify(v)); } catch {} },
  };

  /* ---------------- SOUND ---------------- */
  const base = document.documentElement.dataset.base || "";
  const SFX = {};
  const Sound = {
    on: store.get("sound", false),
    music: null,
    play(name, vol = 0.35) {
      if (!this.on) return;
      try {
        if (!SFX[name]) SFX[name] = new Audio(`${base}audio/${name}.mp3`);
        const a = SFX[name].cloneNode(); a.volume = vol; a.play().catch(() => {});
      } catch {}
    },
    set(v) {
      this.on = v; store.set("sound", v);
      document.dispatchEvent(new CustomEvent("sound:change", { detail: v }));
      if (this.wantMusic) this.syncMusic();
    },
    syncMusic() {
      if (!this.music) { this.music = new Audio(`${base}audio/music.mp3`); this.music.loop = true; this.music.volume = 0.22; }
      if (this.on) this.music.play().catch(() => {}); else this.music.pause();
    },
  };

  /* ---------------- SCRAMBLE ---------------- */
  const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=<>/?";
  const PAINTS = ["#f3f3ef", "#6b6b6b", "#6b6b6b", "#f3f3ef", "#b5b5b5"];
  const rg = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
  const rp = () => PAINTS[(Math.random() * PAINTS.length) | 0];

  function split(el) {
    if (el._chars) return el._chars;
    const chars = [];
    const walk = (node) => {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span"); w.className = "pm-tr-word";
            for (const ch of part) {
              const c = document.createElement("span"); c.className = "pm-tr-char"; c.textContent = ch;
              c.style.setProperty("--paint", rp()); w.appendChild(c); chars.push(c);
            }
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR" && !n.classList.contains("tr-skip")) walk(n);
      }
    };
    walk(el);
    el._chars = chars;
    el.classList.add("tr-ready");
    return chars;
  }
  const setState = (c, s) => { c.classList.toggle("tr-hide", s === "hide"); c.classList.toggle("tr-paint", s === "paint"); c.classList.toggle("tr-scr", s === "scr"); };

  /* animate chars: mode "in" (hidden → text) or "out" (text → hidden) */
  function scramble(el, mode = "in", dur = 1100) {
    const chars = split(el);
    cancelAnimationFrame(el._raf);
    el._mode = mode;
    if (reduce) { chars.forEach((c) => setState(c, mode === "in" ? "show" : "hide")); return Promise.resolve(); }
    const n = chars.length, spread = dur * 0.55;
    const starts = chars.map((_, i) => (i / Math.max(1, n - 1)) * spread * 0.6 + Math.random() * spread * 0.4);
    const t0 = performance.now();
    return new Promise((res) => {
      const tick = (t) => {
        const e = t - t0; let done = true;
        chars.forEach((c, i) => {
          const s = starts[i], d = e - s;
          let st;
          if (mode === "in") st = d < 0 ? "hide" : d < 70 ? "paint" : d < 330 ? "scr" : "show";
          else st = d < 0 ? "show" : d < 230 ? "scr" : d < 300 ? "paint" : "hide";
          if (d < 330) done = false;
          if (st === "scr" && (!c._g || t - c._g > 55)) { c.dataset.g = rg(); c._g = t; }
          setState(c, st);
        });
        if (!done) el._raf = requestAnimationFrame(tick); else res();
      };
      el._raf = requestAnimationFrame(tick);
    });
  }
  function hideNow(el) { split(el).forEach((c) => setState(c, "hide")); el._mode = "out"; }
  /* swap text with scramble (used for mode text) */
  async function swapText(el, html, dur = 900) {
    await scramble(el, "out", dur * 0.6);
    el._chars = null; el.innerHTML = html; split(el); hideNow(el);
    return scramble(el, "in", dur);
  }
  /* reveal when visible (non-pinned elements) */
  function autoReveal(root = document) {
    const els = $$("[data-scramble]", root);
    els.forEach((el) => { split(el); hideNow(el); });
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      const el = en.target;
      if (en.isIntersecting && el._mode !== "in") scramble(el, "in", +el.dataset.dur || 1100);
      else if (!en.isIntersecting && el._mode === "in" && el.dataset.scramble !== "once") hideNow(el);
    }), { threshold: 0.15 });
    els.filter((el) => el.dataset.scramble !== "manual").forEach((el) => io.observe(el));
  }

  /* ---------------- CURSOR GRID TRAIL ---------------- */
  function gridTrail() {
    if (!matchMedia("(pointer: fine)").matches || reduce) return;
    const cv = document.createElement("canvas"); cv.id = "grid-trail"; cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    const ctx = cv.getContext("2d"); const CELL = 23; let W, H, dpr;
    const cells = new Map();
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener("resize", size);
    let last = null, running = false, prevT = 0;
    const mark = (x, y) => { const k = ((x / CELL) | 0) + "," + ((y / CELL) | 0); cells.set(k, 1); };
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      if (last) { const dx = e.clientX - last.x, dy = e.clientY - last.y, n = Math.ceil(Math.hypot(dx, dy) / (CELL / 2)); for (let i = 1; i <= n; i++) mark(last.x + (dx * i) / n, last.y + (dy * i) / n); }
      else mark(e.clientX, e.clientY);
      last = { x: e.clientX, y: e.clientY };
      if (!running) { running = true; prevT = performance.now(); requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener("pointerleave", () => (last = null));
    function loop(t) {
      const dt = t - prevT; prevT = t;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#f3f3ef";
      for (const [k, v] of cells) {
        const nv = v - dt / 520;
        if (nv <= 0) { cells.delete(k); continue; }
        cells.set(k, nv);
        const [cx, cy] = k.split(",").map(Number);
        ctx.globalAlpha = Math.min(1, nv * 1.3);
        ctx.fillRect(cx * CELL, cy * CELL, CELL, CELL);
      }
      ctx.globalAlpha = 1;
      if (cells.size) requestAnimationFrame(loop); else { running = false; ctx.clearRect(0, 0, W, H); }
    }
  }

  /* ---------------- PIXEL SCROLLBAR (for scroll areas) ---------------- */
  function pixBar(scroller, bar) {
    const thumb = $(".pm-pix-bar-thumb", bar), track = $(".pm-pix-bar-track", bar);
    const sync = () => {
      const h = track.clientHeight, ratio = scroller.clientHeight / Math.max(1, scroller.scrollHeight);
      const th = Math.max(40, h * Math.min(1, ratio));
      thumb.style.height = th + "px";
      const max = scroller.scrollHeight - scroller.clientHeight;
      thumb.style.top = (max > 0 ? (scroller.scrollTop / max) * (h - th) : 0) + "px";
    };
    scroller.addEventListener("scroll", sync, { passive: true });
    new ResizeObserver(sync).observe(scroller);
    $(".pm-pix-bar-up", bar).addEventListener("click", () => scroller.scrollBy({ top: -120, behavior: "smooth" }));
    $(".pm-pix-bar-down", bar).addEventListener("click", () => scroller.scrollBy({ top: 120, behavior: "smooth" }));
    thumb.addEventListener("pointerdown", (e) => {
      e.preventDefault(); thumb.setPointerCapture(e.pointerId);
      const y0 = e.clientY, s0 = scroller.scrollTop;
      const mv = (ev) => { const h = track.clientHeight - thumb.offsetHeight; scroller.scrollTop = s0 + ((ev.clientY - y0) / Math.max(1, h)) * (scroller.scrollHeight - scroller.clientHeight); };
      const up = () => { thumb.removeEventListener("pointermove", mv); thumb.removeEventListener("pointerup", up); };
      thumb.addEventListener("pointermove", mv); thumb.addEventListener("pointerup", up);
    });
    sync();
    return sync;
  }
  const barHTML = () => `<div class="pm-pix-bar" aria-hidden="true"><button type="button" tabindex="-1" class="pm-pix-bar-btn pm-pix-bar-up">${A.icon("up")}</button><div class="pm-pix-bar-track"><div class="pm-pix-bar-thumb"></div></div><button type="button" tabindex="-1" class="pm-pix-bar-btn pm-pix-bar-down">${A.icon("down")}</button></div>`;

  /* ---------------- CONTACT MODAL ---------------- */
  const EMAIL = "hello@pixelmoss.fi";
  function contactModal() {
    const d = document.createElement("dialog");
    d.className = "pm-contact-modal"; d.setAttribute("aria-labelledby", "contact-heading");
    d.innerHTML = `<div class="pm-cm-backdrop" data-close></div>
      <div class="pm-cm-window" id="contact" role="document">
        <div class="pm-cm-titlebar"><div class="pm-cm-title">C:/PIXELMOSS/CONTACT</div><button type="button" class="pm-cm-close" data-close aria-label="Close">${A.icon("close")}</button></div>
        <div class="pm-cm-body">
          <div class="pm-cm-scroll">
            <h3 id="contact-heading" class="pm-cm-heading">Got a side quest? Let's team up.</h3>
            <form class="pm-cm-form" novalidate>
              <div class="pm-cm-group"><label class="pm-cm-label" for="cm-name">Name</label><input class="pm-cm-input" id="cm-name" name="name" autocomplete="name" placeholder="Type your name *" required></div>
              <div class="pm-cm-group"><label class="pm-cm-label" for="cm-email">Email</label><input class="pm-cm-input" id="cm-email" name="email" type="email" autocomplete="email" placeholder="Type your email *" required></div>
              <div class="pm-cm-group"><label class="pm-cm-label" for="cm-company">Studio or club</label><input class="pm-cm-input" id="cm-company" name="company" autocomplete="organization" placeholder="Studio, club or just you" required></div>
              <div class="pm-cm-group"><label class="pm-cm-label" for="cm-msg">Message</label><textarea class="pm-cm-input pm-cm-textarea" id="cm-msg" name="message" placeholder="Tell me about your idea *" required></textarea></div>
              <div class="pm-form-status" role="status" hidden></div>
              <div class="pm-cm-actions"><button type="submit" class="pm-cm-submit"><span class="pm-cm-submit-text">Send it</span><span class="pm-cm-spin"></span></button></div>
            </form>
          </div>
          ${barHTML()}
        </div>
      </div>`;
    document.body.appendChild(d);
    const scroller = $(".pm-cm-scroll", d), sync = pixBar(scroller, $(".pm-pix-bar", d));
    const form = $("form", d), status = $(".pm-form-status", d), submit = $(".pm-cm-submit", d);
    let lastFocus = null;
    const open = () => {
      if (d.open) return;
      lastFocus = document.activeElement;
      d.classList.remove("is-closing");
      status.hidden = true;
      d.showModal(); document.documentElement.classList.add("popup-open");
      Sound.play("open"); requestAnimationFrame(sync);
      setTimeout(() => $("#cm-name", d).focus(), 60);
    };
    const close = () => {
      if (!d.open) return;
      d.classList.add("is-closing"); Sound.play("close");
      setTimeout(() => { d.close(); d.classList.remove("is-closing"); document.documentElement.classList.remove("popup-open"); lastFocus && lastFocus.focus && lastFocus.focus(); }, 220);
    };
    d.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
    d.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); });
    form.addEventListener("input", (e) => e.target.classList.remove("is-invalid"));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fields = $$(".pm-cm-input", form); let bad = null;
      fields.forEach((f) => { const ok = f.value.trim() && (f.type !== "email" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value)); f.classList.toggle("is-invalid", !ok); if (!ok && !bad) bad = f; });
      const show = (ok, html) => { status.hidden = false; status.className = "pm-form-status" + (ok ? "is-ok" : "is-err"); status.innerHTML = A.icon(ok ? "ok" : "err") + `<p>${html}</p>`; sync(); scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" }); };
      if (bad) { show(false, "Please fill in every field with a valid value."); bad.focus(); Sound.play("hit"); return; }
      submit.classList.add("is-loading");
      setTimeout(() => {
        submit.classList.remove("is-loading");
        const v = Object.fromEntries(new FormData(form));
        const body = encodeURIComponent(`${v.message}\n\n— ${v.name} (${v.company})\n${v.email}`);
        show(true, `Thanks, ${v.name.replace(/[<>&]/g, "")}! Your message is on its way. I usually reply within a couple of evenings. If your mail app didn’t open, write to <a href="mailto:${EMAIL}">${EMAIL}</a>.`);
        Sound.play("coin");
        location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Side quest — " + v.company)}&body=${body}`;
        form.reset();
      }, 900);
    });
    document.addEventListener("click", (e) => {
      const t = e.target.closest('[data-popup-open="contact"]');
      if (t) { e.preventDefault(); open(); }
    });
    return { open, close };
  }

  /* ---------------- LOGO + misc ---------------- */
  function logos() { $$("[data-logo]").forEach((el) => (el.innerHTML = A.logo())); }
  function soundButtons() {
    const sync = () => $$("[data-sound-toggle]").forEach((b) => {
      b.setAttribute("aria-pressed", String(Sound.on));
      const st = $(".tutorial-state", b); if (st) { st.textContent = Sound.on ? "ON" : "OFF"; b.classList.toggle("is-on", Sound.on); }
      const ic = $("[data-sound-icon]", b); if (ic) ic.innerHTML = A.icon(Sound.on ? "soundOn" : "soundOff");
      b.title = Sound.on ? "Sound on" : "Sound off";
    });
    document.addEventListener("click", (e) => { const b = e.target.closest("[data-sound-toggle]"); if (b) { Sound.set(!Sound.on); Sound.play("click"); } });
    document.addEventListener("sound:change", sync); sync();
  }
  /* hover + click blips on interactive things */
  function blips() {
    document.addEventListener("pointerover", (e) => { const t = e.target.closest("a, button, [role=button], .pm-selection-button"); if (t && !t.contains(e.relatedTarget)) Sound.play("hover", 0.18); });
  }

  window.CORE = { $, $$, clamp, store, Sound, split, scramble, hideNow, swapText, autoReveal, gridTrail, pixBar, barHTML, contactModal, logos, soundButtons, blips, reduce, EMAIL };
})();

/* PIXELMOSS — home page: loader, intro, modes, chomper nav, scroll-driven scenes. */
(function () {
  const A = window.ART, K = window.CORE;
  if (!document.getElementById("hero")) { /* sub pages (play / arcade / contact): no home scenes */
    const R = document.documentElement; R.classList.add("pm-sub");
    K.logos(); K.$$("[data-icon]").forEach((el) => (el.innerHTML = A.icon(el.dataset.icon)));
    const L = document.getElementById("loader"); if (L) L.remove();
    try { sessionStorage.setItem("pm:seen", "1"); } catch {}
    K.gridTrail(); K.contactModal(); K.soundButtons(); K.blips();
    requestAnimationFrame(() => R.classList.add("is-ready"));
    if (document.getElementById("play-screen") && !window.PMG) {
      const alts = (b, f) => { const m = b.match(/@([0-9a-f]{7,40})\//), r = m ? m[1] : ""; return [...new Set([r, r.slice(0, 7), r.slice(0, 10), "main"])].filter(Boolean).map((x) => (m ? b.replace(m[0], "@" + x + "/") : b) + f); };
      const srcs = alts(R.dataset.base || "", "games/core.js");
      const go = (i) => { if (i >= srcs.length) return; const s = document.createElement("script"); s.src = srcs[i]; s.onerror = () => { s.remove(); go(i + 1); }; document.head.appendChild(s); };
      go(0);
    }
    return;
  }
  const { $, $$, clamp, Sound, scramble, hideNow, split, reduce } = K;
  const root = document.documentElement;
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const isMobile = () => innerWidth <= 767;
  let mode = (() => { try { return sessionStorage.getItem("pm:mode") || "dev"; } catch { return "dev"; } })();

  /* ---------------- static art injection ---------------- */
  K.logos();
  $$("[data-icon]").forEach((el) => (el.innerHTML = A.icon(el.dataset.icon)));
  $$(".pm-selection-arrow").forEach((el) => (el.innerHTML = A.icon("arrow")));
  $$(".pm-mode-arrow").forEach((el) => (el.innerHTML = A.px(["X......", "XX.....", "XXX....", "XXXX...", "XXXXX..", "XXXXXX.", "XXXXXXX", "XXXXXX.", "XXXXX..", "XXXX...", "XXX....", "XX.....", "X......"], { X: "currentColor" })));
  const tail = A.px(["WKW", "WKW", "WW.", "W.."], { W: "#f3f3ef", K: "#161616" }, { attrs: 'preserveAspectRatio="none"' });
  $$(".pm-bubble-tail").forEach((el) => (el.innerHTML = tail));
  $("#about-hearts").innerHTML = [0, 1, 2].map(() => A.px(A.heart, A.heartPal)).join("");
  $$("#about-hearts svg")[2].classList.add("heart-beat");
  $(".pm-brain-l").innerHTML = A.px(A.brainL, A.brainPal);
  $(".pm-brain-r").innerHTML = A.px(A.mirror(A.brainL), A.brainPal);
  $$(".pm-card").forEach((c) => (c.innerHTML = A.px(A.card, A.cardPal, { attrs: 'preserveAspectRatio="none"' })));
  $(".pm-g-frame").innerHTML = A.px(A.glasses, A.glassesPal);
  $("#hand-left").innerHTML = A.px(A.handL, A.handLPal);
  $("#hand-right").innerHTML = A.px(A.handR, A.handRPal);
  const food = A.px(A.chomp.food, { X: "currentColor" });
  $$(".pm-section-nav-food").forEach((a) => (a.innerHTML = food));
  const chompOpen = A.px(A.chomp.open, { X: "currentColor" }), chompClosed = A.px(A.chomp.closed, { X: "currentColor" });
  const chomper = $(".pm-section-nav-chomper"); chomper.innerHTML = chompOpen;
  const spark = $("#hands-spark");
  for (let i = 0; i < 10; i++) { const s = document.createElement("i"); const a = (i / 10) * Math.PI * 2; s.style.setProperty("--sx", Math.cos(a) * 70 + "px"); s.style.setProperty("--sy", Math.sin(a) * 70 + "px"); s.style.animationDelay = -i * 0.06 + "s"; spark.appendChild(s); }

  function renderMode(animate) {
    $("#hero-avatar").innerHTML = A.px(A.avatar, A.avatarPal[mode], { attrs: 'preserveAspectRatio="xMidYMax meet"' });
    $("#character-mode").innerHTML = A.px(A.mini, A.miniPal[mode]);
    $$("#hero-modes .pm-selection-button").forEach((b) => { const on = b.dataset.mode === mode; b.classList.toggle("is-active", on); b.setAttribute("aria-checked", on); });
    $(".pm-mode-arrow-prev").classList.toggle("is-disabled", mode === "dev");
    $(".pm-mode-arrow-next").classList.toggle("is-disabled", mode === "creative");
    $("#about-mode-title").textContent = mode === "dev" ? "Code Mode" : "Pixel Mode";
    document.body.dataset.mode = mode;
    const txt = mode === "dev"
      ? "By night I’m a hobby developer who loves tight controls, tiny engines, and games that run on any old laptop."
      : "By night I’m a pixel artist who works in black and white, animates frame by frame, and gives every sprite a bit of personality.";
    const el = $("#about-mode-text");
    if (animate) K.swapText(el, txt, 800); else { el._chars = null; el.textContent = txt; split(el); if (el._mode !== "in") hideNow(el); }
  }
  function setMode(m) {
    if (m === mode) return;
    mode = m; try { sessionStorage.setItem("pm:mode", m); } catch {}
    Sound.play("switch");
    const ch = $("#character-mode"); ch.classList.add("is-walking"); setTimeout(() => ch.classList.remove("is-walking"), 700);
    const av = $("#hero-avatar"); wipe(av, 450);
    renderMode(true);
  }
  $$("#hero-modes .pm-selection-button").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
  $(".pm-mode-arrow-prev").addEventListener("click", () => setMode("dev"));
  $(".pm-mode-arrow-next").addEventListener("click", () => setMode("creative"));
  $("#hero-modes").addEventListener("keydown", (e) => { if (/Arrow(Up|Down|Left|Right)/.test(e.key)) { e.preventDefault(); setMode(mode === "dev" ? "creative" : "dev"); $(`#hero-modes [data-mode="${mode}"]`).focus(); } });

  /* avatar wipe: column-by-column reveal with a lime scan line */
  function wipe(el, dur = 800) {
    if (reduce) return;
    const svg = el.querySelector("svg"); if (!svg) return;
    const t0 = performance.now();
    let bar = el.querySelector(".pm-scanbar");
    if (!bar) { bar = document.createElement("i"); bar.className = "pm-scanbar"; Object.assign(bar.style, { position: "absolute", top: 0, bottom: 0, width: "3.2%", background: "#f3f3ef", mixBlendMode: "difference", pointerEvents: "none" }); el.style.position = "relative"; el.appendChild(bar); }
    const step = (t) => {
      const q = clamp((t - t0) / dur), cols = Math.round(q * 32) / 32;
      svg.style.clipPath = `inset(0 ${100 - cols * 100}% 0 0)`;
      bar.style.left = cols * 100 + "%"; bar.style.display = q < 1 ? "block" : "none";
      if (q < 1) requestAnimationFrame(step); else svg.style.clipPath = "";
    };
    requestAnimationFrame(step);
  }

  /* ---------------- loader + intro ---------------- */
  const heroTexts = ["#hero-title", "#hero-lead", ...$$("#hero-modes .pm-selection-text")].map((s) => (typeof s === "string" ? $(s) : s));
  $$("[data-scramble]").forEach((el) => { split(el); hideNow(el); });
  renderMode(false);

  function intro() {
    root.classList.add("is-ready");
    wipe($("#hero-avatar"), 900);
    heroTexts.forEach((el, i) => setTimeout(() => scramble(el, "in", 1200), 250 + i * 120));
    setTimeout(greetLoop, 1300);
    setTimeout(ring, 3400);
    K.autoReveal($("#about"));
  }
  const loader = $("#loader");
  if (root.classList.contains("no-loader") || reduce) { loader.remove(); intro(); }
  else {
    const box = $(".pm-loader-icons", loader); let n = 0;
    const show = () => { box.innerHTML = [0, 1, 2].map((i) => A.px(A.glyphs[(Math.random() * A.glyphs.length) | 0], { X: i === 1 ? "#f3f3ef" : "#f3f3ef" })).join(""); };
    show(); const iv = setInterval(() => { show(); if (++n > 9) { clearInterval(iv); loader.classList.add("is-done"); setTimeout(() => loader.remove(), 450); intro(); } }, 220);
    try { sessionStorage.setItem("pm:seen", "1"); } catch {}
  }

  /* greeting typewriter */
  const GREETS = ["Hello", "I'm Aino", "Moi", "Hej", "Hola", "Konnichiwa", "Ciao"];
  function greetLoop() {
    const out = $(".pm-greet-text"); let w = 0;
    const type = (s, i = 0) => { out.textContent = s.slice(0, i); if (i < s.length) setTimeout(() => type(s, i + 1), 110); else setTimeout(() => del(s, s.length), 1700); if (i && i % 2) Sound.play("type", 0.06); };
    const del = (s, i) => { out.textContent = s.slice(0, i); if (i > 0) setTimeout(() => del(s, i - 1), 55); else { w = (w + 1) % GREETS.length; setTimeout(() => type(GREETS[w]), 300); } };
    const b = $("#hero-bubble"); b.style.setProperty("--float-dur", rand(3.2, 4.2).toFixed(2) + "s"); b.style.setProperty("--float-delay", -rand(0, 3).toFixed(2) + "s");
    out.textContent = ""; type(GREETS[0]);
  }
  function ring() {
    const p = $("#home-phone"); p.classList.add("is-ringing"); setTimeout(() => p.classList.remove("is-ringing"), 2100);
    setTimeout(ring, 25000);
  }

  /* ---------------- core modules ---------------- */
  K.gridTrail(); K.contactModal(); K.soundButtons(); K.blips();
  Sound.wantMusic = true; if (Sound.on) addEventListener("pointerdown", () => Sound.syncMusic(), { once: true });

  /* ---------------- sections & chomper nav ---------------- */
  const sections = $$(".pm-section-nav-food").map((a) => $("#" + a.dataset.section));
  const foods = $$(".pm-section-nav-food");
  let current = 0, lastY = scrollY, chompT = 0;
  const secTop = (s) => s.getBoundingClientRect().top + scrollY;
  function updateNav() {
    const y = scrollY + innerHeight * 0.4;
    let idx = 0; sections.forEach((s, i) => { if (secTop(s) <= y) idx = i; });
    const dir = scrollY >= lastY ? 1 : -1; lastY = scrollY;
    if (idx !== current) {
      current = idx;
      chomper.style.setProperty("--face", dir > 0 ? "90deg" : "-90deg");
      chomper.innerHTML = chompClosed; clearTimeout(chompT); chompT = setTimeout(() => (chomper.innerHTML = chompOpen), 180);
      if (current) Sound.play("coin", 0.12);
    }
    chomper.style.transform = `translateY(${current * (isMobile() ? 34 : 40)}px)`;
    foods.forEach((f, i) => { f.classList.toggle("is-eaten", i <= current); f.classList.toggle("is-current", i === current); });
  }
  const goto = (i) => { const s = sections[i]; window.scrollTo({ top: i === 0 ? 0 : secTop(s), behavior: reduce ? "auto" : "smooth" }); };
  foods.forEach((f, i) => f.addEventListener("click", (e) => { e.preventDefault(); goto(i); }));
  chomper.addEventListener("click", () => goto(current >= sections.length - 1 ? 0 : current + 1));

  /* ---------------- text windows (scramble by progress) ---------------- */
  function textWin(el, p, a, b = 2) {
    const vis = p >= a && p <= b;
    if (vis && el._mode !== "in") scramble(el, "in", 1000);
    else if (!vis && el._mode === "in") scramble(el, "out", 600);
  }
  const progress = (sec) => { const r = sec.getBoundingClientRect(); const len = r.height - innerHeight; return clamp(-r.top / Math.max(1, len)); };
  const visible = (sec) => { const r = sec.getBoundingClientRect(); return r.bottom > -50 && r.top < innerHeight + 50; };

  /* canvas helper */
  function cnv(el) {
    const ctx = el.getContext("2d");
    const o = { el, ctx, w: 0, h: 0, fit() { const d = Math.min(2, devicePixelRatio || 1), r = el.getBoundingClientRect(); if (Math.round(r.width) !== o.w || Math.round(r.height) !== o.h) { o.w = Math.round(r.width); o.h = Math.round(r.height); el.width = o.w * d; el.height = o.h * d; ctx.setTransform(d, 0, 0, d, 0, 0); ctx.imageSmoothingEnabled = false; } } };
    return o;
  }

  /* ---- ABOUT: mini character drops in ---- */
  const about = $("#about");
  function sceneAbout() {
    const r = about.getBoundingClientRect();
    const q = clamp((innerHeight - r.top) / (innerHeight * 1.1));
    $("#character-mode").style.setProperty("--drop", (-(1 - ease(q)) * 340).toFixed(1) + "px");
    about.classList.toggle("is-in", r.top < innerHeight * 0.35 && r.bottom > innerHeight * 0.3);
  }

  /* ---- PIXELS ---- */
  const pix = { sec: $("#pixels"), c: cnv($("#pixels-canvas")), cells: null, h2: $("#pixels h2"), lead: $("#pixels .pm-pin-lead"), dot: $("#pixels-dot") };
  function scenePixels(p) {
    const { c } = pix; c.fit();
    const S = 23, cols = Math.ceil(c.w / S), rows = Math.ceil(c.h / S);
    if (!pix.cells || pix.cells.cols !== cols || pix.cells.rows !== rows) {
      const arr = [];
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const d = Math.abs((x + 0.5) / cols - 0.5) * 2; // 0 centre, 1 edge
        arr.push({ x, y, d, r: Math.random(), a: rand(0.12, 1), g: Math.random() < 0.25 });
      }
      pix.cells = Object.assign(arr, { cols, rows });
    }
    const { ctx } = c; ctx.clearRect(0, 0, c.w, c.h);
    const grow = clamp((p - 0.28) / 0.45), fade = clamp((p - 0.8) / 0.18);
    for (const k of pix.cells) {
      const thr = 1 - k.d; // edge cells first
      const v = grow * 1.25 - thr * 0.9 - k.r * 0.35;
      if (v <= 0 || k.r < fade) continue;
      ctx.globalAlpha = Math.min(1, v * 2) * k.a * (1 - fade * 0.3);
      ctx.fillStyle = k.g ? "#6b6b6b" : "#f3f3ef";
      ctx.fillRect(k.x * S, k.y * S, S, S);
    }
    ctx.globalAlpha = 1;
    textWin(pix.h2, p, 0.0, 0.62); textWin(pix.lead, p, 0.08, 0.8);
    pix.dot.style.opacity = p > 0.9 ? 0 : 1;
  }

  /* ---- IDEAS: head assembles from scattered pixels ---- */
  const ideas = { sec: $("#ideas"), c: cnv($("#ideas-canvas")), pts: null, h2: $("#ideas-copy h2"), lead: $("#ideas-copy p"), t: 0 };
  (() => { const pts = []; A.head.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === "Q" || ch === "K") pts.push({ x, y, k: ch, sx: Math.random(), sy: Math.random(), d: Math.random() * 0.3 }); })); ideas.pts = pts;
    ideas.stream = []; for (let y = 2; y <= 10; y++) for (let x = 7; x <= 18; x++) { const dx = (x - 12.5) / 6, dy = (y - 6) / 4.5; if (dx * dx + dy * dy <= 1 && Math.random() < 0.82) ideas.stream.push({ bx: x, by: y, t: Math.random(), o: Math.random(), dark: Math.random() < 0.3 }); } })();
  function sceneIdeas(p, now) {
    const { c } = ideas; c.fit(); const { ctx } = c; ctx.clearRect(0, 0, c.w, c.h);
    const s = Math.floor(Math.min((c.w * (isMobile() ? 0.9 : 0.48)) / 24, (c.h * 0.66) / 25));
    const ox = Math.round(c.w / 2 - (24 * s) / 2 + (isMobile() ? 0 : c.w * 0.04)), oy = c.h - 25 * s;
    for (const pt of ideas.pts) {
      const k = ease(clamp((p * 1.6 - pt.d) / 0.55));
      const x = lerp(pt.sx * c.w, ox + pt.x * s, k), y = lerp(pt.sy * c.h, oy + pt.y * s, k);
      ctx.fillStyle = pt.k === "K" ? "#161616" : "#f3f3ef";
      ctx.fillRect(Math.round(x), Math.round(y), s, s);
    }
    // lime 'thoughts' gather into a brain inside the head
    const q = ease(clamp((p - 0.3) / 0.4));
    if (q > 0) {
      for (const st of ideas.stream) {
        const tx = ox + st.bx * s, ty = oy + st.by * s;
        const x = lerp(-60 + st.t * c.w * 0.3, tx, q), y = lerp(c.h * (0.2 + st.t * 0.6), ty, q);
        const flick = Math.sin(now / 160 + st.o * 9) > 0.6 ? 0.55 : 1;
        ctx.globalAlpha = flick; ctx.fillStyle = st.dark ? "#6b6b6b" : "#f3f3ef";
        ctx.fillRect(Math.round(x), Math.round(y), s, s);
      }
      ctx.globalAlpha = 1;
    }
    textWin(ideas.h2, p, 0.2, 2); textWin(ideas.lead, p, 0.3, 2);
  }

  /* ---- BRAIN ---- */
  const brain = { sec: $("#brain"), out: $(".pm-bt-text"), art: $("#brain-art"), words: ["Doodle", "Prototype", "Playtest", "Ship"] };
  function sceneBrain(p) {
    const w = brain.art.offsetWidth;
    const open = ease(clamp((p - 0.08) / 0.2)), exit = ease(clamp((p - 0.88) / 0.12));
    const split = open * w * (isMobile() ? 0.14 : 0.2) + exit * innerWidth * 0.6;
    brain.art.style.setProperty("--split", split.toFixed(1));
    const tp = clamp((p - 0.22) / 0.64) * brain.words.length;
    const wi = Math.min(brain.words.length - 1, Math.floor(tp)), q = tp - wi;
    const word = brain.words[wi];
    const n = q < 0.7 ? Math.round(clamp(q / 0.45) * word.length) : Math.round(clamp((1 - q) / 0.3) * word.length);
    const showN = wi === brain.words.length - 1 && q >= 0.7 ? word.length : n;
    if (brain.out.textContent !== word.slice(0, showN)) { brain.out.textContent = word.slice(0, showN); Sound.play("type", 0.05); }
    $("#brain-typing").style.setProperty("--type-o", open > 0.5 && exit < 0.5 ? 1 : 0);
  }

  /* ---- DNA helix ---- */
  const dna = { sec: $("#dna"), c: cnv($("#dna-canvas")), h2: $("#dna-copy h2"), lead: $("#dna-copy p") };
  function sceneDna(p, now) {
    const { c } = dna; c.fit(); const { ctx } = c; ctx.clearRect(0, 0, c.w, c.h);
    const s = isMobile() ? 12 : 16, cx = Math.round(c.w / 2 / s) * s - s, A2 = isMobile() ? 9 : 11;
    const enter = ease(clamp(p / 0.2)), leave = ease(clamp((p - 0.85) / 0.15));
    const offY = (1 - enter) * c.h - leave * c.h;
    const rows = Math.ceil(c.h / s) + 2, phase = p * 14 + now * 0.0006;
    const strands = [];
    for (let r = 0; r < rows; r++) {
      const y = r * s + offY; if (y < -s || y > c.h) continue;
      const ph = r * 0.16 + phase;
      const a = Math.sin(ph) * A2, z = Math.cos(ph);
      const x1 = Math.round(a), x2 = -Math.round(a);
      strands.push({ y, x1, x2, z });
    }
    const draw = (x, y, col) => { ctx.fillStyle = col; ctx.fillRect(cx + x * s, Math.round(y), s * 3, s); };
    for (const st of strands) { // back strand
      if (st.z < 0) draw(st.x1, st.y, "#2e2e2e"); else draw(st.x2, st.y, "#2e2e2e");
    }
    strands.forEach((st, i) => { // rungs
      if (i % 2) return;
      const l = Math.min(st.x1, st.x2) + 3, rr = Math.max(st.x1, st.x2);
      for (let x = l; x < rr; x++) { if ((x + i) % 7 === 0) continue; ctx.fillStyle = (x + (i >> 1)) % 5 === 0 ? "#161616" : "#f3f3ef"; ctx.fillRect(cx + x * s, Math.round(st.y), s, s); }
    });
    for (const st of strands) { if (st.z >= 0) draw(st.x1, st.y, "#6b6b6b"); else draw(st.x2, st.y, "#6b6b6b"); }
    textWin(dna.h2, p, 0.28, 0.92); textWin(dna.lead, p, 0.34, 0.92);
  }

  /* ---- EMOTION cards ---- */
  const emo = { sec: $("#emotion"), cards: $$(".pm-card"), title: $("#emotion-title"), lead: $("#emotion-lead") };
  function sceneEmotion(p) {
    const inn = ease(clamp(p / 0.25)), fan = ease(clamp((p - 0.25) / 0.35)), flip = ease(clamp((p - 0.62) / 0.25)), out = ease(clamp((p - 0.9) / 0.1));
    const m = isMobile() ? 0.6 : 1;
    const conf = [
      { r: -14 * fan - 8 * flip, tx: -110 * fan * m, ty: 20 * fan },
      { r: -4 * fan + 6 * flip, tx: -30 * fan * m + 60 * flip * m, ty: -10 * fan },
      { r: 6 * fan + 70 * flip, tx: 40 * fan * m + 110 * flip * m, ty: -40 * flip },
    ];
    emo.cards.forEach((cd, i) => {
      const k = conf[i];
      cd.style.setProperty("--r", k.r.toFixed(2) + "deg");
      cd.style.setProperty("--tx", k.tx.toFixed(1) + "px");
      cd.style.setProperty("--ty", (k.ty + (1 - inn) * (innerHeight + i * 120) - out * (innerHeight + 200)).toFixed(1) + "px");
    });
    textWin(emo.title, p, 0.2, 0.95); textWin(emo.lead, p, 0.3, 0.95);
  }

  /* ---- BEAUTY glasses ---- */
  const beauty = { sec: $("#beauty"), title: $("#beauty-title"), lead: $("#beauty-lead"), g: $("#beauty-glasses"), eyes: $$(".pm-g-eye") };
  let mouse = { x: 0.5, y: 0.5 };
  addEventListener("pointermove", (e) => (mouse = { x: e.clientX / innerWidth, y: e.clientY / innerHeight }), { passive: true });
  setInterval(() => { beauty.eyes.forEach((e) => e.classList.add("is-blink")); setTimeout(() => beauty.eyes.forEach((e) => e.classList.remove("is-blink")), 140); }, 3600);
  function sceneBeauty(p) {
    const inn = ease(clamp(p / 0.2)), out = ease(clamp((p - 0.9) / 0.1));
    beauty.g.style.opacity = inn * (1 - out);
    beauty.g.style.transform = `translate(-50%, calc(-50% + ${((1 - inn) * 120 - out * 120).toFixed(1)}px))`;
    const eyesOn = p > 0.3 && p < 0.92;
    beauty.eyes.forEach((e) => { e.style.visibility = eyesOn ? "visible" : "hidden"; e.style.setProperty("--ex", mouse.x.toFixed(3)); e.style.setProperty("--ey", mouse.y.toFixed(3)); });
    beauty.title.style.setProperty("--blur", (clamp(1 - (p - 0.08) / 0.25) * 10).toFixed(1) + "px");
    textWin(beauty.title, p, 0.06, 0.94); textWin(beauty.lead, p, 0.32, 0.94);
  }

  /* ---- HANDS ---- */
  const hands = { sec: $("#hands"), l: $("#hand-left"), r: $("#hand-right"), h2: $("#hands-title h2"), lead: $("#hands-title p") };
  function sceneHands(p) {
    const k = ease(clamp((p - 0.05) / 0.5)), out = ease(clamp((p - 0.88) / 0.12));
    const far = innerWidth * 0.55, near = isMobile() ? 0.02 * innerWidth : 6;
    hands.l.style.setProperty("--hx", (-lerp(far, near, k) - out * far) + "px");
    hands.r.style.setProperty("--hx", (lerp(far, near, k) + out * far) + "px");
    spark.classList.toggle("is-on", k > 0.98 && out < 0.1);
    textWin(hands.h2, p, 0.12, 0.9); textWin(hands.lead, p, 0.2, 0.9);
  }

  /* ---- WINDOWS ---- */
  const WINS = [
    ["BOOT.LOG", "Waking up the arcade cabinets…"], ["PALETTE.EXE", "Loading 2 colors. That's plenty."], ["SPRITES.DLL", "Fetching sprite sheets… Done."],
    ["NOTICE.EXE", "This page may cause sudden urges to play."], ["SYNC.SYS", "Merging art + code + coffee…"], ["CHIPTUNE.EXE", "Tuning the 1-bit soundtrack."],
    ["DIAGNOSE.SCAN", "Checking fun levels… All green."], ["SAVES.SYS", "Loading high scores from /Pixelmoss/Arcade…"], ["READY", "Player one is ready."],
  ];
  const desk = $("#windows-desktop"); let zTop = 10;
  const mkWin = (title, body, extra = "") => { const w = document.createElement("div"); w.className = "pm-window" + extra; w.innerHTML = `<div class="pm-win-bar"><span class="pm-win-title">${title}</span><button type="button" class="pm-x-btn" aria-label="Close ${title}">${A.icon("close")}</button></div><div class="pm-win-body">${body}</div>`; desk.appendChild(w); return w; };
  const wins = WINS.map(([t, b]) => mkWin(t, `<p class="pm-win-text">${b}</p>`));
  const finalWin = mkWin("ARCADE.EXE", `<p class="pm-win-text">Five cabinets are warmed up.<br>Start playing?</p><div class="pm-win-actions"><a href="#" class="pm-btn pm-btn-light pm-win-no">No</a><a href="/pixelmoss/arcade" class="pm-btn pm-btn-primary pm-win-yes">Yes</a></div>`, "window-final");
  const allWins = [...wins, finalWin];
  function layoutWins() {
    const W = desk.clientWidth, H = desk.clientHeight, mob = isMobile();
    wins.forEach((w, i) => {
      if (w._moved) return;
      const x = mob ? 12 + i * 10 : (W / 2 - 390) + i * 60, y = mob ? 80 + i * 52 : (H / 2 - 360) + i * 80;
      Object.assign(w.style, { left: x + "px", top: y + "px", zIndex: i + 1 });
    });
    if (!finalWin._moved) Object.assign(finalWin.style, { left: W / 2 - finalWin.offsetWidth / 2 + (mob ? 0 : -0) + "px", top: (mob ? H * 0.32 : H / 2 - 120) + "px", zIndex: 20 });
  }
  allWins.forEach((w) => {
    w.querySelector(".pm-x-btn").addEventListener("click", (e) => { e.stopPropagation(); w.classList.add("is-closed"); Sound.play("close"); });
    w.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button, a, [role=button]")) return;
      e.preventDefault(); w.setPointerCapture(e.pointerId); w.classList.add("is-drag"); w.style.zIndex = ++zTop; w._moved = true;
      const sx = e.clientX - w.offsetLeft, sy = e.clientY - w.offsetTop;
      const mv = (ev) => { w.style.left = ev.clientX - sx + "px"; w.style.top = ev.clientY - sy + "px"; };
      const up = () => { w.classList.remove("is-drag"); w.removeEventListener("pointermove", mv); w.removeEventListener("pointerup", up); };
      w.addEventListener("pointermove", mv); w.addEventListener("pointerup", up);
    });
  });
  finalWin.querySelector(".pm-win-no").addEventListener("click", (e) => { e.preventDefault(); finalWin.classList.add("is-closed"); Sound.play("hit"); });
  let winShown = -1;
  function sceneWindows(p) {
    const n = Math.floor(clamp((p - 0.04) / 0.62) * wins.length + (p > 0.04 ? 1 : 0));
    if (n !== winShown) {
      if (n > winShown && n > 0) Sound.play("open", 0.15);
      winShown = n;
      wins.forEach((w, i) => { const on = i < n; if (on && !w.classList.contains("is-shown")) w.classList.add("is-shown"); if (!on) w.classList.remove("is-shown", "is-closed"); });
    }
    const f = p > 0.72;
    if (f && !finalWin.classList.contains("is-shown")) finalWin.classList.add("is-shown");
    if (!f) finalWin.classList.remove("is-shown", "is-closed");
  }

  /* ---- TETRIS ---- */
  const T = { sec: $("#tetris"), c: $("#tetris-canvas"), n: $("#tetris-next-canvas"), perfect: $("#tetris-perfect"), texts: $$("#tetris-cta [data-scramble]") };
  const SHAPES = { I: [[0, 0], [1, 0], [2, 0], [3, 0]], I2: [[0, 0], [0, 1], [0, 2], [0, 3]], O: [[0, 0], [1, 0], [0, 1], [1, 1]], T: [[0, 0], [1, 0], [2, 0], [1, 1]], T2: [[1, 0], [0, 1], [1, 1], [2, 1]], L: [[0, 0], [0, 1], [0, 2], [1, 2]], J: [[1, 0], [1, 1], [1, 2], [0, 2]], S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]], L2: [[0, 0], [1, 0], [2, 0], [0, 1]], J2: [[0, 0], [1, 0], [2, 0], [2, 1]], S2: [[0, 0], [0, 1], [1, 1], [1, 2]], Z2: [[1, 0], [0, 1], [1, 1], [0, 2]] };
  const TCOL = ["#b5b5b5", "#f3f3ef", "#b5b5b5", "#6b6b6b", "#b5b5b5", "#6b6b6b", "#6b6b6b", "#e2e2de"];
  const COLS = 10, ROWS = 16, FILL = 8;
  T.pieces = (() => { // tile the bottom 10x8 area exactly with tetrominoes (DFS)
    const g = Array.from({ length: FILL }, () => Array(COLS).fill(-1)); const out = []; const keys = Object.keys(SHAPES);
    const dfs = () => {
      let fx = -1, fy = -1;
      outer: for (let y = FILL - 1; y >= 0; y--) for (let x = 0; x < COLS; x++) if (g[y][x] < 0) { fx = x; fy = y; break outer; }
      if (fx < 0) return true;
      const order = keys.slice().sort(() => Math.random() - 0.5);
      for (const k of order) for (const [ax, ay] of SHAPES[k]) {
        const cells = SHAPES[k].map(([x, y]) => [fx + x - ax, fy + y - ay]);
        if (cells.every(([x, y]) => x >= 0 && x < COLS && y >= 0 && y < FILL && g[y][x] < 0)) {
          cells.forEach(([x, y]) => (g[y][x] = out.length)); out.push({ k, cells, col: TCOL[out.length % TCOL.length] });
          if (dfs()) return true;
          out.pop(); cells.forEach(([x, y]) => (g[y][x] = -1));
        }
      }
      return false;
    };
    dfs();
    return out.map((pc) => ({ ...pc, cells: pc.cells.map(([x, y]) => [x, y + ROWS - FILL]) }));
  })();
  function drawCell(ctx, x, y, s, col) { ctx.fillStyle = col; ctx.fillRect(x, y, s, s); ctx.fillStyle = "rgba(10,10,10,.28)"; ctx.fillRect(x, y + s - 3, s, 3); ctx.fillRect(x + s - 3, y, 3, s); ctx.fillStyle = "rgba(243,243,239,.35)"; ctx.fillRect(x, y, s - 3, 3); }
  function sceneTetris(p) {
    const ctx = T.c.getContext("2d"), s = 30; ctx.clearRect(0, 0, 300, 500);
    const oy = 500 - ROWS * s;
    const np = T.pieces.length, k = clamp((p - 0.05) / 0.62) * np, done = Math.floor(k), frac = k - done;
    for (let i = 0; i < Math.min(done, np); i++) for (const [x, y] of T.pieces[i].cells) drawCell(ctx, x * s, oy + y * s, s, T.pieces[i].col);
    if (done < np && k > 0) {
      const pc = T.pieces[done], top = Math.min(...pc.cells.map((c) => c[1]));
      const dy = (1 - frac) * (top + 2);
      for (const [x, y] of pc.cells) drawCell(ctx, x * s, oy + (y - Math.round(dy * 2) / 2) * s, s, pc.col);
    }
    const complete = k >= np;
    if (complete && p > 0.74) { const fl = Math.floor(performance.now() / 120) % 2; if (fl) { ctx.fillStyle = "rgba(243,243,239,.25)"; ctx.fillRect(0, oy + (ROWS - FILL) * s, 300, FILL * s); } }
    T.perfect.classList.toggle("is-on", complete && p > 0.74);
    // next preview
    const n = T.n.getContext("2d"); n.clearRect(0, 0, 80, 420);
    for (let j = 0; j < 5; j++) { const pc = T.pieces[done + 1 + j]; if (!pc) break; const mx = Math.min(...pc.cells.map((c) => c[0])), my = Math.min(...pc.cells.map((c) => c[1])); const w = Math.max(...pc.cells.map((c) => c[0])) - mx + 1; for (const [x, y] of pc.cells) drawCell(n, 40 - (w * 16) / 2 + (x - mx) * 16, 14 + j * 82 + (y - my) * 16, 16, pc.col); }
    T.texts.forEach((el, i) => textWin(el, p, isMobile() ? 0.76 + i * 0.03 : 0.1 + i * 0.05, 2));
    $("#tetris-sticky").classList.toggle("is-cta-phase", p > 0.76);
  }

  /* ---- WORLD globe ---- */
  const world = { sec: $("#world"), c: cnv($("#world-canvas")), texts: $$("#world-text [data-scramble]"), pts: null };
  const land = (lon, lat) => Math.sin(lon * 2 + 0.6) * Math.cos(lat * 2.2) + 0.55 * Math.sin(lon * 5 + 1.3) * Math.sin(lat * 3.1 + 0.7) + 0.32 * Math.sin(lon * 9 + 2) * Math.cos(lat * 7) > 0.18;
  function sceneWorld(p, now) {
    const { c } = world; c.fit(); const { ctx } = c; ctx.clearRect(0, 0, c.w, c.h);
    const N = 26, s = Math.floor(Math.min(c.w, c.h) / N), ox = Math.round((c.w - N * s) / 2), oy = Math.round((c.h - N * s) / 2);
    if (!world.pts) { world.pts = []; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const nx = (x + 0.5) / N * 2 - 1, ny = (y + 0.5) / N * 2 - 1; if (nx * nx + ny * ny <= 1) world.pts.push({ x, y, nx, ny, sx: rand(-0.6, 1.6), sy: rand(-0.6, 1.6), d: Math.random() * 0.35 }); } }
    const rot = now * 0.00035, k0 = clamp(p / 0.45);
    for (const pt of world.pts) {
      const nz = Math.sqrt(Math.max(0, 1 - pt.nx * pt.nx - pt.ny * pt.ny)), lat = Math.asin(pt.ny), lon = Math.atan2(pt.nx, nz) + rot;
      const k = ease(clamp((k0 * 1.4 - pt.d) / 0.65));
      if (k <= 0 && p < 0.02) continue;
      const x = lerp(pt.sx * c.w, ox + pt.x * s, k), y = lerp(pt.sy * c.h, oy + pt.y * s, k);
      ctx.fillStyle = land(lon, lat) ? "#f3f3ef" : "#6b6b6b";
      ctx.globalAlpha = k > 0 ? 1 : 0.0;
      ctx.fillRect(Math.round(x), Math.round(y), s, s);
    }
    ctx.globalAlpha = 1;
    world.texts.forEach((el, i) => textWin(el, p, 0.02 + i * 0.03, 2));
  }

  /* ---------------- frame loop ---------------- */
  const scenes = [
    [about, () => sceneAbout()], [pix.sec, scenePixels], [ideas.sec, sceneIdeas], [brain.sec, sceneBrain], [dna.sec, sceneDna],
    [emo.sec, sceneEmotion], [beauty.sec, sceneBeauty], [hands.sec, sceneHands], [desk.parentElement, sceneWindows], [T.sec, sceneTetris], [world.sec, sceneWorld],
  ];
  function frame(now) {
    updateNav();
    for (const [sec, fn] of scenes) if (visible(sec)) fn(progress(sec), now);
    requestAnimationFrame(frame);
  }
  addEventListener("resize", layoutWins);
  layoutWins();
  requestAnimationFrame(frame);
  addEventListener("keydown", (e) => { if (e.key === "Escape") return; });
})();

/* PIXELMOSS — home arcade section: attract-mode frames (2 colors) on 160x120 canvases. */
(() => {
  const INK = "#0a0a0a", PAP = "#f3f3ef", GRY = "#6b6b6b";
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x | 0, y | 0, w | 0, h | 0); };
  const draw = {
    dash(c, t) {
      R(c, 0, 96, 160, 2, PAP); for (let i = 0; i < 12; i++) R(c, ((i * 17 - t * 60) % 170 + 170) % 170 - 5, 102, 6, 1, GRY);
      const ox = ((150 - t * 70) % 190 + 190) % 190 - 20; R(c, ox, 86, 8, 10, PAP); R(c, ox + 2, 82, 4, 4, PAP);
      const j = Math.max(0, Math.sin(t * 4)) * 22; R(c, 30, 80 - j, 10, 16, PAP); R(c, 38, 83 - j, 2, 2, INK); R(c, 32, 96 - j, 3, 2, PAP);
      for (let i = 0; i < 3; i++) R(c, ((100 + i * 40 - t * 40) % 180 + 180) % 180 - 10, 50 + i * 8, 4, 4, GRY);
      R(c, 120, 8, 30, 6, GRY);
    },
    bloom(c, t) {
      for (let r = 0; r < 4; r++) for (let k = 0; k < 8; k++) if ((r * 3 + k * 5 + ((t * 2) | 0)) % 7) R(c, 8 + k * 18, 10 + r * 9, 16, 7, r % 2 ? GRY : PAP);
      const bx = 80 + Math.sin(t * 2.1) * 60, by = 70 + Math.sin(t * 3.3) * 25; R(c, bx, by, 4, 4, PAP);
      R(c, Math.min(124, Math.max(4, bx - 14)), 106, 32, 4, PAP);
      for (let i = 0; i < 6; i++) R(c, 10 + i * 26, 116, 2 + (i % 3), 2, GRY);
    },
    trail(c, t) {
      for (let y = 0; y < 120; y += 8) for (let x = (y / 8) % 2 ? 4 : 0; x < 160; x += 8) R(c, x, y, 1, 1, "#2e2e2e");
      const n = 9, step = (t * 6) | 0; const path = [];
      for (let i = 0; i < n; i++) { const s = step - i; const p = ((s % 40) + 40) % 40; const x = p < 20 ? 20 + p * 6 : 20 + (39 - p) * 6; path.push([x, p < 20 ? 56 : 64]); }
      path.forEach(([x, y], i) => R(c, x, y, 7, 7, i ? GRY : PAP)); R(c, 140, 30, 6, 6, PAP); R(c, 143, 27, 2, 3, GRY);
    },
    stack(c, t) {
      let w = 70; for (let i = 0; i < 7; i++) { const x = 45 + Math.sin(i * 1.7) * 6; R(c, x, 108 - i * 10, w, 8, i % 2 ? GRY : PAP); w -= 4; }
      const sx = 45 + Math.sin(t * 2.4) * 50; R(c, sx, 30, 46, 8, PAP);
      R(c, 0, 116, 160, 4, PAP);
    },
    pairs(c, t) {
      const open = (((t * 1.2) | 0) % 8);
      for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) {
        const i = r * 4 + k, x = 34 + k * 24, y = 8 + r * 27; const up = i === open || i === 15 - open || i % 5 === 0;
        R(c, x, y, 20, 24, up ? PAP : GRY); if (up) { R(c, x + 6, y + 6, 8, 8, INK); R(c, x + 8 + (i % 3) * 2, y + 16, 4, 3, INK); } else R(c, x + 2, y + 2, 16, 20, "#2e2e2e");
      }
    },
  };
  window.PMATTRACT = draw;
  const cabs = [...document.querySelectorAll(".pm-arcade-cab")];
  if (!cabs.length) return;
  const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = cabs.map((a) => { const cv = a.querySelector("canvas"); const c = cv.getContext("2d"); c.imageSmoothingEnabled = false; return { g: a.dataset.game, c }; });
  const frame = (t) => items.forEach(({ g, c }) => { R(c, 0, 0, 160, 120, INK); draw[g] && draw[g](c, t); });
  frame(1.3);
  if (rm) return;
  let vis = false, t0 = performance.now();
  const sec = document.getElementById("arcade");
  if (sec && "IntersectionObserver" in window) new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(sec);
  const loop = (now) => { if (vis && !document.hidden) frame((now - t0) / 1000); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
})();
/* PIXELMOSS — Arcade page: cabinet rack (List / Claw), hall of fame, hobby log (pixel reveal + gallery modal).
   Loaded lazily by pixelmoss.js when #arcade-page exists. Reuses window.PMATTRACT (attract frames from arcade.js). */
(() => {
  const root = document.getElementById("arcade-page");
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "1";
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const get = (k, d) => { try { const v = localStorage.getItem("pm:" + k); return v === null ? d : JSON.parse(v); } catch { return d; } };
  const set = (k, v) => { try { localStorage.setItem("pm:" + k, JSON.stringify(v)); } catch {} };
  const esc = (s) => String(s).replace(/[<>&"]/g, "");
  const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PLAY = "/pixelmoss/play?g=";
  const G = [
    ["dash", "Moss Dash", "2026", "personal", "A one-button runner about a moss sprite who refuses to stop. Switch modes to dodge bugs or blobs.", "Runner · 1 button", 1],
    ["bloom", "Brick Bloom", "2025", "Ludum Dare", "Every brick you break leaves moss behind. Clear the wall before the garden takes over.", "Paddle · Combo", 0.35],
    ["trail", "Snail Trail", "2025", "1-Bit Jam", "The slowest snake in town. Eat leaves, grow longer, never bite your own shell.", "Grid · Classic", 0.03],
    ["stack", "Stack Drop", "2024", "Helsinki Game Club night", "Drop sliding blocks to build the tallest tower. Miss by a pixel and it gets smaller.", "Timing · 1 button", 0.004],
    ["pairs", "Pixel Pairs", "2024", "tabletop prototype turned digital", "Sixteen hand-drawn sprites, sixty seconds. Find every pair before the clock runs out.", "Memory · Mouse", 0.08],
  ];
  const SEED = [["mossbyte", 12880], ["aino.dev", 6120], ["ALT", 4650], ["ferrytale", 3110], ["Juno", 2875]];
  const INK = "#0a0a0a";

  /* ---------- canvases (attract mode) ---------- */
  const screens = [];
  const mkScreen = (id, w = 160, h = 120) => {
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const c = cv.getContext("2d"); c.imageSmoothingEnabled = false; screens.push({ id, c, cv }); return cv;
  };
  const drawAll = (t) => screens.forEach(({ id, c, cv }) => {
    if (!cv.isConnected || cv.offsetParent === null) return;
    c.fillStyle = INK; c.fillRect(0, 0, 160, 120);
    const d = window.PMATTRACT && window.PMATTRACT[id]; if (d) d(c, t);
  });

  /* ---------- List: rack of 5 cabinets ---------- */
  const rack = $("#pm-rack", root);
  if (rack) {
    rack.innerHTML = "";
    G.forEach(([id, name, yr, born, desc, tag]) => {
      const best = Number(get("score:" + id, 0)) || 0;
      const a = document.createElement("article"); a.className = "pm-cab"; a.dataset.game = id;
      a.innerHTML = `<a class="pm-cab-screen" href="${PLAY + id}" aria-label="Play ${name}"><span class="pm-cab-start">PRESS START</span></a>
        <div class="pm-cab-info"><div class="pm-cab-head"><h3 class="pm-cab-name">${name}</h3><span class="pm-cab-year">${yr}</span></div>
        <p class="pm-cab-born">Born at ${born}</p><p class="pm-cab-desc">${desc}</p>
        <div class="pm-cab-foot"><span class="pm-cab-tag">${tag}</span><span class="pm-cab-best">BEST <b>${best}</b></span></div>
        <a class="pm-cab-play" href="${PLAY + id}">Play</a></div>`;
      $(".pm-cab-screen", a).prepend(mkScreen(id));
      rack.appendChild(a);
    });
  }

  /* ---------- Claw ---------- */
  const claw = $("#pm-claw", root);
  let ci = 2, busy = false;
  const clawUI = {};
  if (claw) {
    claw.innerHTML = `<div class="pm-claw-glass"><div class="pm-claw-rail"></div><div class="pm-claw-arm"><i class="pm-claw-cable"></i><span class="pm-claw-hook"></span></div>
      <div class="pm-claw-prizes">${G.map(([id, name]) => `<div class="pm-claw-prize" data-game="${id}"><span class="pm-claw-name">${name}</span></div>`).join("")}</div></div>
      <div class="pm-claw-ctrl"><span class="pm-claw-hint">Pick a cabinet · ← → move · Space grab</span>
      <div class="pm-claw-btns"><div class="pm-claw-btn" role="button" tabindex="0" data-claw="-1" aria-label="Move left">←</div><div class="pm-claw-btn pm-claw-grab" role="button" tabindex="0" data-claw="grab">Grab</div><div class="pm-claw-btn" role="button" tabindex="0" data-claw="1" aria-label="Move right">→</div></div></div>`;
    $$(".pm-claw-prize", claw).forEach((p) => p.prepend(mkScreen(p.dataset.game)));
    clawUI.arm = $(".pm-claw-arm", claw); clawUI.prizes = $$(".pm-claw-prize", claw);
  }
  const clawPos = () => {
    if (!clawUI.arm) return;
    clawUI.arm.style.setProperty("--x", ((ci + 0.5) / G.length) * 100 + "%");
    clawUI.prizes.forEach((p, i) => p.classList.toggle("is-target", i === ci));
  };
  const move = (d) => { if (busy) return; ci = (ci + d + G.length) % G.length; clawPos(); };
  const grab = () => {
    if (busy) return; const id = G[ci][0];
    if (rm) { location.href = PLAY + id; return; }
    busy = true; claw.classList.add("is-drop");
    setTimeout(() => { clawUI.prizes[ci].classList.add("is-grabbed"); claw.classList.add("is-lift"); }, 650);
    setTimeout(() => { location.href = PLAY + id; }, 1500);
  };
  if (claw) {
    clawPos();
    claw.addEventListener("click", (e) => {
      const b = e.target.closest("[data-claw]"), p = e.target.closest(".pm-claw-prize");
      if (b) { b.dataset.claw === "grab" ? grab() : move(+b.dataset.claw); }
      else if (p) { const i = clawUI.prizes.indexOf(p); if (i === ci) grab(); else { ci = i; clawPos(); } }
    });
    claw.addEventListener("keydown", (e) => { const b = e.target.closest("[data-claw]"); if (b && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); b.click(); } });
  }
  document.addEventListener("keydown", (e) => {
    if (view !== "claw" || e.target.closest("input,textarea,dialog") || document.querySelector("dialog[open]")) return;
    const r = claw && claw.getBoundingClientRect(); if (!r || r.bottom < 0 || r.top > innerHeight) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
    else if (e.key === " " || e.key === "ArrowDown") { if (!e.target.closest("[data-claw]")) { e.preventDefault(); grab(); } }
  });

  /* ---------- toggle List / Claw ---------- */
  let view = get("arcade-view", "list") === "claw" ? "claw" : "list";
  const setView = (v) => {
    view = v; set("arcade-view", v); root.dataset.view = v;
    $$("[data-view]", root).forEach((b) => { const on = b.dataset.view === v; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", String(on)); });
    if (rack) rack.hidden = v !== "list"; if (claw) claw.hidden = v !== "claw";
    drawAll(1.3);
  };
  $$("[data-view]", root).forEach((b) => {
    b.setAttribute("role", "button"); b.tabIndex = 0;
    b.addEventListener("click", () => setView(b.dataset.view));
    b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setView(b.dataset.view); } });
  });
  setView(view);

  /* ---------- attract loop ---------- */
  drawAll(1.3);
  if (!rm) {
    let vis = true; const t0 = performance.now();
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe($(".pm-ap-main", root) || root);
    const loop = (now) => { if (vis && !document.hidden) drawAll((now - t0) / 1000); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  /* ---------- Hall of fame (all games) ---------- */
  const hof = $("#pm-hof", root);
  if (hof) {
    const rows = [];
    G.forEach(([id, name, , , , , k]) => {
      SEED.forEach(([n, s]) => rows.push({ g: name, n, s: Math.max(1, Math.round(s * k)), r: s }));
      (get("board:" + id, []) || []).forEach((m) => m && rows.push({ g: name, n: m.n, s: m.s, r: m.s / k, you: 1 }));
      const best = Number(get("score:" + id, 0)) || 0;
      if (best && !(get("board:" + id, []) || []).some((m) => m.s >= best)) rows.push({ g: name, n: "YOU", s: best, r: best / k, you: 1 });
    });
    // rank across games by normalised score (score / game scale), show raw score
    const sorted = rows.sort((a, b) => b.r - a.r), top = sorted.slice(0, 10);
    const extra = sorted.filter((r) => r.you && !top.includes(r)).slice(0, 3);
    const row = (r, i, c) => `<div class="pm-hof-row${c}"><span class="pm-hof-rank">${String(i + 1).padStart(2, "0")}</span><span class="pm-hof-game">${esc(r.g)}</span><span class="pm-hof-name">${esc(r.n)}</span><span class="pm-hof-score">${r.s}</span></div>`;
    hof.innerHTML = `<div class="pm-hof-row pm-hof-head"><span>#</span><span>Game</span><span>Player</span><span>Score</span></div>` +
      top.map((r, i) => row(r, i, r.you ? " is-you" : "")).join("") + extra.map((r) => row(r, sorted.indexOf(r), " is-you")).join("");
  }

  /* ---------- Hobby log: pixel reveal + gallery ---------- */
  const cards = $$(".pm-log-card", root);
  cards.forEach((c) => {
    const m = $(".pm-log-media", c); if (!m) return;
    const px = document.createElement("div"); px.className = "pm-log-px"; px.setAttribute("aria-hidden", "true");
    let h = ""; for (let i = 0; i < 48; i++) h += `<i style="--d:${(Math.random() * 0.7).toFixed(2)}s"></i>`;
    px.innerHTML = h; m.appendChild(px);
    c.tabIndex = 0; c.setAttribute("role", "button");
  });
  if (rm || !("IntersectionObserver" in window)) cards.forEach((c) => c.classList.add("is-in"));
  else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.25 }); cards.forEach((c) => io.observe(c)); }

  let dlg = null, gi = 0;
  const openG = (i) => {
    gi = (i + cards.length) % cards.length; const c = cards[gi];
    const imgs = $$("img", c).map((im) => im.currentSrc || im.src); if (c.dataset.g) imgs.push(c.dataset.g);
    const t = $(".pm-log-title", c), y = $(".pm-log-year", c), p = $(".pm-log-desc", c);
    if (!dlg) {
      dlg = document.createElement("dialog"); dlg.className = "pm-contact-modal pm-gallery-modal";
      dlg.innerHTML = `<div class="pm-cm-backdrop" data-close></div><div class="pm-cm-window pm-gm-window" role="document">
        <div class="pm-cm-titlebar"><div class="pm-cm-title"></div><button type="button" class="pm-cm-close" data-close aria-label="Close">×</button></div>
        <div class="pm-cm-body"><div class="pm-cm-scroll pm-gm-scroll"><div class="pm-gm-imgs"></div><h3 class="pm-cm-heading pm-gm-heading"></h3><p class="pm-gm-text"></p>
        <div class="pm-gm-nav"><div class="pm-cm-submit pm-gm-prev" role="button" tabindex="0">← Prev</div><div class="pm-cm-submit pm-gm-next" role="button" tabindex="0">Next →</div></div></div></div></div>`;
      document.body.appendChild(dlg);
      const close = () => { dlg.close(); document.documentElement.classList.remove("gallery-open"); };
      dlg.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); else if (e.target.closest(".pm-gm-prev")) openG(gi - 1); else if (e.target.closest(".pm-gm-next")) openG(gi + 1); });
      dlg.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") openG(gi - 1); else if (e.key === "ArrowRight") openG(gi + 1); else if ((e.key === "Enter" || e.key === " ") && e.target.closest(".pm-gm-nav [role=button]")) { e.preventDefault(); e.target.click(); } });
      dlg.addEventListener("close", () => document.documentElement.classList.remove("gallery-open"));
    }
    $(".pm-cm-title", dlg).textContent = `C:/PIXELMOSS/LOG/${String(gi + 1).padStart(2, "0")}.IMG`;
    $(".pm-gm-imgs", dlg).innerHTML = [...new Set(imgs)].map((s) => `<img src="${esc(s)}" alt="" loading="lazy">`).join("");
    $(".pm-gm-heading", dlg).textContent = t ? t.textContent : "";
    $(".pm-gm-text", dlg).textContent = (y ? y.textContent + " · " : "") + (p ? p.textContent : "");
    if (!dlg.open) { dlg.showModal(); document.documentElement.classList.add("gallery-open"); }
  };
  cards.forEach((c, i) => {
    c.addEventListener("click", () => openG(i));
    c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openG(i); } });
  });
})();

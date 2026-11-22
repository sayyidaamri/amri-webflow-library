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

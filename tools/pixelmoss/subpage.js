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

  if (!document.getElementById("hero")) { /* sub pages (play / arcade / contact): no home scenes */
    const R = document.documentElement; R.classList.add("pm-sub");
    K.logos(); K.$$("[data-icon]").forEach((el) => (el.innerHTML = A.icon(el.dataset.icon)));
    const L = document.getElementById("loader"); if (L) L.remove();
    try { sessionStorage.setItem("pm:seen", "1"); } catch {}
    K.gridTrail(); K.contactModal(); K.soundButtons(); K.blips();
    requestAnimationFrame(() => R.classList.add("is-ready"));
    if (document.getElementById("play-screen") && !window.PMG) {
      const b = R.dataset.base || "", srcs = [b + "games/core.js", b.replace(/@[^/]+\//, "@main/") + "games/core.js"];
      const go = (i) => { if (i >= srcs.length) return; const s = document.createElement("script"); s.src = srcs[i]; s.onerror = () => { s.remove(); go(i + 1); }; document.head.appendChild(s); };
      go(0);
    }
    return;
  }

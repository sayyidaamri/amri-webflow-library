/* Ostra Atelier — Webflow adapter (role=button, case modal, work filter) */
(() => {
  "use strict";
  document.documentElement.classList.add("os-live", "os-js");
  document.addEventListener("keydown", (e) => {
    const b = e.target.closest && e.target.closest('[role="button"]');
    if (b && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); b.click(); }
  });
  const CASES = {
    halde:   ["Halde House", "2026", "Residential", "Salzkammergut, AT", "A family house set into a lakeside slope. Board-marked concrete holds the hill; larch rooms open to the water on one long, low level."],
    karst:   ["Karst Hotel", "2026", "Hospitality", "Trieste, IT", "Forty-two rooms inside a former customs warehouse. Curved timber linings soften the stone shell and carry light deep into the plan."],
    mura:    ["Mura Pavilion", "2025", "Cultural", "Graz, AT", "A small exhibition pavilion for a city museum. One cast wall, one glass wall, and a roof that frames the sky above the courtyard."],
    lumen:   ["Lumen Offices", "2025", "Workplace", "Vienna, AT", "A four-floor fit-out for a design consultancy. Slatted oak screens divide focus rooms from an open studio without closing either."],
    terra:   ["Terra Gardens", "2025", "Landscape", "Wachau, AT", "Terraced vineyard gardens for a winery estate. Dry-stone walls, native planting and a path that follows the old field lines."],
    still:   ["Still Collection", "2024", "Objects", "Vienna, AT", "Twelve pieces of furniture and lighting first drawn for our own projects, now made in small runs by workshops in Lower Austria."],
    alpenhof:["Alpenhof", "2024", "Hospitality", "Tyrol, AT", "The renewal of a 1960s mountain inn. We kept the timber frame, rebuilt the envelope, and gave every room a window to the ridge."],
    prisma:  ["Prisma Residence", "2023", "Residential", "Ljubljana, SI", "Six apartments around a shared courtyard. Deep window reveals shade the rooms in summer and catch low winter sun."]
  };
  let modal;
  const close = () => { if (!modal) return; modal.classList.remove("is-open"); document.documentElement.classList.remove("os-modal-open"); window.lenis && window.lenis.start(); };
  const open = (key, img) => {
    const c = CASES[key]; if (!c) return;
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "os-case";
      modal.innerHTML = '<div class="os-case_scrim" data-case-close></div><div class="os-case_panel" role="dialog" aria-modal="true"><div class="os-case_media"><img alt=""></div><div class="os-case_body"><div class="os-case_meta"></div><h2 class="os-case_title"></h2><p class="os-case_text"></p><a class="os-case_cta" href="/ostra/contact">Start a project</a></div><div class="os-case_close" role="button" tabindex="0" aria-label="Close" data-case-close>×</div></div>';
      document.querySelector(".page-wrapper.is-os, body").appendChild(modal);
      modal.addEventListener("click", (e) => { if (e.target.closest("[data-case-close]")) close(); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    }
    modal.querySelector(".os-case_title").textContent = c[0];
    modal.querySelector(".os-case_meta").textContent = c[1] + " · " + c[2] + " · " + c[3];
    modal.querySelector(".os-case_text").textContent = c[4];
    const im = modal.querySelector("img"); im.src = img || ""; im.alt = c[0]; im.style.display = img ? "" : "none";
    requestAnimationFrame(() => modal.classList.add("is-open"));
    document.documentElement.classList.add("os-modal-open"); window.lenis && window.lenis.stop();
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#case-"], [data-case]:not(.os-case *)');
    if (!a) return;
    e.preventDefault();
    const key = a.getAttribute("data-case") || (a.getAttribute("href") || "").slice(6);
    const im = a.querySelector("img");
    open(key, im && (im.currentSrc || im.src));
  });
  /* work filter bar: ?cat=x or clicks on [data-filter] */
  const applyFilter = (cat) => {
    document.querySelectorAll("[data-cat]").forEach((el) => { el.style.display = !cat || el.getAttribute("data-cat") === cat ? "" : "none"; });
    document.querySelectorAll("[data-filter]").forEach((b) => b.classList.toggle("is-current", (b.getAttribute("data-filter") || "") === (cat || "")));
    window.ScrollTrigger && ScrollTrigger.refresh();
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-filter]");
    if (!b) return; e.preventDefault(); applyFilter(b.getAttribute("data-filter"));
  });
  if (document.querySelector("[data-cat]")) {
    const q = new URLSearchParams(location.search).get("cat");
    document.addEventListener("DOMContentLoaded", () => applyFilter(q)); if (document.readyState !== "loading") applyFilter(q);
  }
})();

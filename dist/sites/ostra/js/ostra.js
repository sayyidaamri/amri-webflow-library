/* Ostra Atelier — Webflow adapter + interactions (port of Norvik main.js). Needs gsap, ScrollTrigger, SplitText, lenis. */
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
(document.querySelector(".page-wrapper.is-os") || document.body).appendChild(modal);
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
const a = e.target.closest && e.target.closest('a[href^="#case-"], [data-case]');
if (!a || a.closest(".os-case")) return;
e.preventDefault();
const key = a.getAttribute("data-case") || (a.getAttribute("href") || "").slice(6);
const im = a.querySelector("img");
open(key, im && (im.currentSrc || im.src));
});
const applyFilter = (cat) => {
document.querySelectorAll("[data-cat]").forEach((el) => { el.style.display = !cat || el.getAttribute("data-cat") === cat ? "" : "none"; });
document.querySelectorAll("[data-filter]").forEach((b) => b.classList.toggle("is-current", (b.getAttribute("data-filter") || "") === (cat || "")));
window.ScrollTrigger && ScrollTrigger.refresh();
};
document.addEventListener("click", (e) => {
const b = e.target.closest && e.target.closest("[data-filter]");
if (!b) return; e.preventDefault(); applyFilter(b.getAttribute("data-filter"));
});
if (document.querySelector("[data-cat]")) applyFilter(new URLSearchParams(location.search).get("cat"));
})();

(() => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGsap = typeof window.gsap !== "undefined";
const em = (el, n) => parseFloat(getComputedStyle(el).fontSize) * n;
const EASE = "power2.inOut";
let lenis = null;
if (typeof window.Lenis !== "undefined" && !reduced) {
lenis = new Lenis({ autoRaf: !hasGsap, prevent: (node) => node.closest && node.closest(".os-nav_panel, .os-filter_bar, .os-case") });
window.lenis = lenis;
if (hasGsap && window.ScrollTrigger) {
gsap.registerPlugin(ScrollTrigger);
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
}
}
if (hasGsap) gsap.registerPlugin(ScrollTrigger, SplitText);
const scrollToHash = (hash) => {
const el = hash && hash.length > 1 && document.getElementById(hash.slice(1));
if (!el) return false;
lenis ? lenis.scrollTo(el, { offset: 0, duration: 1.2 }) : el.scrollIntoView({ behavior: "smooth" });
return true;
};
const toggle = $("[data-menu-toggle]");
const panel = $("[data-menu-panel]");
const scrim = $("[data-scrim]");
let menuTl = null;
let menuOpen = false;
if (toggle && panel) {
const items = $$(".os-nav_item", panel);
if (hasGsap) {
menuTl = gsap.timeline({ paused: true, defaults: { duration: 0.45, ease: EASE } })
.set(scrim, { visibility: "visible" }, 0)
.fromTo(panel, { height: 0 }, { height: "auto" }, 0)
.fromTo(items, { opacity: 0, y: () => em(panel, 1), scale: 0.98 }, { opacity: 1, y: 0, scale: 1, stagger: 0.06 }, 0)
.fromTo(scrim, { opacity: 0 }, { opacity: 1 }, 0);
menuTl.eventCallback("onReverseComplete", () => gsap.set(scrim, { visibility: "hidden" }));
}
const setMenu = (open) => {
menuOpen = open;
toggle.setAttribute("aria-expanded", String(open));
document.body.classList.toggle("menu-open", open);
if (menuTl) open ? menuTl.play() : menuTl.reverse();
else { panel.style.height = open ? "auto" : "0"; scrim.style.visibility = open ? "visible" : "hidden"; scrim.style.opacity = open ? 1 : 0; }
};
toggle.addEventListener("click", () => setMenu(!menuOpen));
scrim.addEventListener("click", () => setMenu(false));
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen) setMenu(false); });
$$("[data-sub-toggle]").forEach((btn) => {
const wrap = btn.nextElementSibling;
const links = $$(".os-nav_sublink", wrap);
let tl = null;
if (hasGsap) {
tl = gsap.timeline({ paused: true, defaults: { duration: 0.45, ease: EASE } })
.fromTo(wrap, { height: 0 }, { height: "auto" }, 0)
.fromTo(links, { opacity: 0, y: () => em(wrap, 0.5), scale: 0.98 }, { opacity: 1, y: 0, scale: 1, stagger: 0.06 }, 0);
}
btn.addEventListener("click", () => {
const open = btn.getAttribute("aria-expanded") !== "true";
btn.setAttribute("aria-expanded", String(open));
if (tl) open ? tl.play() : tl.reverse();
else wrap.style.height = open ? "auto" : "0";
});
});
$$(".os-nav_sublink, .os-nav_row[href]").forEach((a) => {
a.addEventListener("click", (e) => {
const url = new URL(a.href, location.href);
if (url.pathname === location.pathname && url.hash) {
e.preventDefault();
setMenu(false);
setTimeout(() => scrollToHash(url.hash), 250);
}
});
});
}
if (location.hash && !location.hash.startsWith("#case-")) window.addEventListener("load", () => setTimeout(() => scrollToHash(location.hash), 60));
const once = (trigger, fn, start = "top bottom") => {
if (!hasGsap || reduced) return;
ScrollTrigger.create({ trigger, start, once: true, onEnter: fn });
};
const fadeUp = (targets, { delay = 0.15, stagger = 0, dist = 0.5, ease = EASE, duration = 0.45, trigger } = {}) => {
const list = Array.isArray(targets) ? targets : [targets];
if (!list.length || !hasGsap || reduced) return;
gsap.set(list, { opacity: 0, y: (i, el) => em(el, dist) });
once(trigger || list[0], () => gsap.to(list, { opacity: 1, y: 0, duration, delay, stagger, ease }));
};
const initReveals = () => {
if (!hasGsap || reduced) { $$("[data-reveal]").forEach((h) => h.classList.add("is-split")); return; }
$$("[data-reveal]").forEach((h) => {
const split = new SplitText(h, { type: "lines", linesClass: "split-line" });
h.classList.add("is-split");
gsap.set(split.lines, { opacity: 0, y: (i, el) => em(el, 0.25) });
once(h, () => gsap.to(split.lines, { opacity: 1, y: 0, duration: 0.45, delay: 0.15, stagger: 0.02, ease: EASE }));
});
$$("[data-chars]").forEach((p) => {
const split = new SplitText(p, { type: "words,chars" });
gsap.fromTo(split.chars, { opacity: 0.15 }, {
opacity: 1, ease: "none", stagger: 0.1, duration: 1,
scrollTrigger: { trigger: p, start: "top bottom", end: "bottom 30%", scrub: 0.8 },
});
});
$$("[data-status]").forEach((el) => fadeUp(el, { delay: 0.54 }));
$$(".os-sec-meta").forEach((m) => fadeUp($$(".os-sec-meta_t", m), { stagger: 0.15, trigger: m }));
$$("[data-fade-text]").forEach((el) => { gsap.set(el, { opacity: 0 }); once(el, () => gsap.to(el, { opacity: 1, duration: 0.45, delay: 0.15, ease: EASE })); });
$$("[data-fade-careers]").forEach((el) => fadeUp(el, { delay: 0.45, ease: "power2.out" }));
$$("[data-fade-buttons]").forEach((row) => fadeUp($$(".os-btn", row), { delay: 0.45, stagger: 0.15, trigger: row }));
$$(".os-value_row").forEach((row) => { const t = $(".os-value_text", row); if (!t) return; gsap.set(t, { opacity: 0 }); once(row, () => gsap.to(t, { opacity: 1, duration: 0.45, delay: 0.2, ease: EASE })); });
$$(".os-work-grid").forEach((g) => fadeUp($$(".os-work-card", g), { stagger: 0.15, trigger: g }));
$$(".os-live").forEach((l) => { fadeUp(l); fadeUp($$(".os-live_row", l), { stagger: 0.15, trigger: l }); });
$$(".os-slider.is-services").forEach((s) => fadeUp($$(".os-svc", s), { stagger: 0.15, trigger: s }));
$$(".os-slider.is-testi").forEach((s) => fadeUp($$(".os-tcard", s), { stagger: 0.15, trigger: s, ease: "power1.out" }));
$$(".os-reel").forEach((r) => {
gsap.set(r, { opacity: 0, scale: 0.95, y: em(r, 2) });
once(r, () => gsap.to(r, { opacity: 1, scale: 1, y: 0, duration: 0.6, delay: 0.15, ease: EASE }));
});
$$(".os-faq_list").forEach((l) => { fadeUp(l, { ease: "power1.out" }); const rows = $$(".os-faq_row", l); fadeUp(rows, { stagger: 0.15 / rows.length, trigger: l, ease: "power1.out" }); });
$$(".os-jgrid").forEach((g) => fadeUp($$(".os-jcard", g), { stagger: 0.15, trigger: g }));
$$(".os-jindex").forEach((l) => fadeUp($$(".os-jrow", l), { stagger: 0.15, trigger: l }));
ScrollTrigger.refresh();
};
$$("[data-marquee]").forEach((track) => {
if (reduced) return;
if (hasGsap) gsap.to(track, { xPercent: -50, duration: 20, ease: "none", repeat: -1 });
else track.animate([{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }], { duration: 20000, iterations: Infinity });
});
$$("[data-slider]").forEach((slider) => {
const track = $(".os-slider_track", slider);
const slides = $$(".os-slider_slide", slider);
const prev = $("[data-prev]", slider);
const next = $("[data-next]", slider);
let index = 0;
const max = slides.length - 1;
const step = () => slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(slides[0]).marginRight);
const render = () => {
track.style.transform = `translateX(${-index * step()}px)`;
prev.classList.toggle("is-hidden", index === 0);
next.classList.toggle("is-hidden", index === max);
};
prev.addEventListener("click", () => { index = Math.max(0, index - 1); render(); });
next.addEventListener("click", () => { index = Math.min(max, index + 1); render(); });
slider.addEventListener("keydown", (e) => {
if (e.key === "ArrowRight") next.click();
if (e.key === "ArrowLeft") prev.click();
});
window.addEventListener("resize", () => { track.style.transition = "none"; render(); requestAnimationFrame(() => (track.style.transition = "")); });
render();
});
$$("[data-reel]").forEach((reel) => {
const video = $("video", reel);
const btn = $("[data-reel-toggle]", reel);
const time = $("[data-reel-time]", reel);
if (!video || !btn) return;
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const sync = () => {
const playing = !video.paused;
reel.classList.toggle("is-playing", playing);
btn.setAttribute("aria-label", playing ? "Pause video" : "Play video");
};
btn.addEventListener("click", () => (video.paused ? video.play() : video.pause()));
video.addEventListener("play", sync);
video.addEventListener("pause", sync);
video.addEventListener("loadedmetadata", () => { if (isFinite(video.duration)) time.textContent = fmt(video.duration); });
video.addEventListener("timeupdate", () => { if (isFinite(video.duration)) time.textContent = fmt(video.duration - video.currentTime); });
});
$$(".os-faq_row").forEach((row) => {
const q = $(".os-faq_q", row);
const a = $(".os-faq_a", row);
q.addEventListener("click", () => {
const open = !row.classList.contains("is-open");
row.classList.toggle("is-open", open);
q.setAttribute("aria-expanded", String(open));
if (hasGsap) gsap.to(a, { height: open ? "auto" : 0, duration: 0.45, ease: EASE, onComplete: () => ScrollTrigger.refresh() });
else a.style.height = open ? "auto" : "0";
});
});
$$("form[data-os-validate]").forEach((form) => {
form.addEventListener("submit", (e) => {
let ok = true;
$$("[required]", form).forEach((f) => {
const bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
f.classList.toggle("is-invalid", bad);
if (bad) ok = false;
});
if (!ok) { e.preventDefault(); e.stopImmediatePropagation(); }
}, true);
$$("input, textarea", form).forEach((f) => f.addEventListener("input", () => f.classList.remove("is-invalid")));
});
const start = () => initReveals();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
else window.addEventListener("load", start);
window.addEventListener("load", () => hasGsap && ScrollTrigger.refresh());
})();

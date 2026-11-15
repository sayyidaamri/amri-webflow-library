/* NOCTELLE - Webflow adapter. Base URL comes from this script's own src, so assets load from the same jsDelivr commit. */
var NCB = (function () {
  var s = document.currentScript && document.currentScript.src;
  return s ? s.replace(/js\/noctelle(\.min)?\.js.*$/, "") : "";
})();
document.documentElement.classList.add("nc-live");
function ncPrep() {
  /* Webflow cannot store <button> or [hidden]; markup carries data-nc-btn / data-nc-hidden instead. */
  document.querySelectorAll("[data-nc-btn]").forEach(function (div) {
    var b = document.createElement("button");
    Array.prototype.forEach.call(div.attributes, function (a) {
      if (a.name === "data-nc-btn") b.type = a.value || "button"; else b.setAttribute(a.name, a.value);
    });
    while (div.firstChild) b.appendChild(div.firstChild);
    div.parentNode.replaceChild(b, div);
  });
  document.querySelectorAll("[data-nc-hidden]").forEach(function (e) { e.hidden = true; e.removeAttribute("data-nc-hidden"); });
  document.querySelectorAll("[data-nc-src]").forEach(function (e) { e.setAttribute("src", NCB + e.getAttribute("data-nc-src")); e.removeAttribute("data-nc-src"); });
}
/* Studio / contact pages: same header as home (INTRO, PROJECTS, CONTACT, MUTE), links go to real pages,
   solid header background, normal cursor, ambient music starts on the first interaction unless muted. */
function ncSubpage() {
  var go = function (id, href) { var a = document.getElementById(id); if (a) a.setAttribute("href", href); };
  go("brandHome", "/noctelle/home"); go("introOpenBtn", "/noctelle/studio"); go("projectsMenuBtn", "/noctelle/home");
  document.querySelectorAll("#projectsDropdownMenu a").forEach(function (a) { a.setAttribute("href", "/noctelle/home"); });
  var st = document.createElement("style");
  st.textContent = "body,body *{cursor:auto!important}.nc-nav{background:rgba(0,0,0,.82);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-bottom:1px solid rgba(212,184,122,.14)}";
  document.body.appendChild(st);
  var t = document.getElementById("soundToggle");
  if (!t) return;
  var key = "nc-sound", on = true, audio = new Audio(NCB + "audio/ambient.mp3");
  try { on = sessionStorage.getItem(key) !== "0"; } catch (e) {}
  audio.loop = true; audio.volume = 0.55; audio.preload = "none";
  var ui = function () { t.textContent = on ? "MUTE" : "MUSIC"; t.classList.toggle("is-active", on); };
  var sync = function () { if (on) { var p = audio.play(); if (p && p.catch) p.catch(function () {}); } else audio.pause(); };
  var first = function () { document.removeEventListener("pointerdown", first, true); document.removeEventListener("keydown", first, true); sync(); };
  document.addEventListener("pointerdown", first, true); document.addEventListener("keydown", first, true);
  t.addEventListener("click", function (e) {
    e.preventDefault(); e.stopPropagation(); on = !on;
    try { sessionStorage.setItem(key, on ? "1" : "0"); } catch (err) {}
    ui(); sync();
  });
  ui();
}

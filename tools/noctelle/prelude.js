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

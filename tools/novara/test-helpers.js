// Pre-flight/regression test for NOVARA (paste into the live page console of amri-library.webflow.io).
// localStorage.nvsnapfn2 = snapshot fn source, nvhelpers = snap/diff/swapTo/prof, nvframe = frameProf(path,w,h) (iframe, fixed viewport).
// prof(sha): snapshot A (live) -> inject tools/novara/native-preview.css + id classes + fx.css@sha -> snapshot B -> diff (ignores <1.5px, noise).
// After publish, the swap is not needed: compare against a stored snapshot instead.

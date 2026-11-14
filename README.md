# Amri Webflow Library — home engine

Static files loaded by the Webflow home page (via jsDelivr) to draw the WebGL portrait and the fly-through of website cards.

```
dist/css/style.css      layout and UI
dist/fonts/             Inter Tight, Instrument Serif (SIL Open Font License)
dist/js/face.js         the portrait halftone (cell positions, depth, shading)
dist/js/signature.js    the hand-written "Amri" line
dist/js/engine.js       three.js engine + boot: reads the hidden [data-awl-item] list on the page
```

The cards come from the Webflow page itself: each `[data-awl-item]` has `[data-awl="title"]`, `[data-awl="kind"]`,
`[data-awl="desc"]`, `[data-awl="tags"]`, an `<a data-awl="link">` and one or more `<img>`. Add a website in Webflow and it
joins the flight; no change here is needed. Images must be served with CORS (the Webflow CDN does) to show as textures.

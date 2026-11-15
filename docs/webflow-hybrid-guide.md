# Webflow hybrid build guide

How to rebuild a library website in Webflow so it stays editable in the Designer: native layout and styles, variables for the design system, and only the heavy effects loaded from this repo through jsDelivr. The source website (HTML repo) is the reference for structure, content flow and behaviour. The effects live in `dist/sites/<slug>/`.

## 1. Principles
1. **Native first.** Layout, text, images, buttons and responsive behaviour are built with Webflow elements and the Style panel. Do not rebuild a page as one big embed.
2. **Effects from the repo.** WebGL, canvas, scroll scrubbing, audio, drag and similar effects come from `dist/sites/<slug>/` (loaded with jsDelivr, pinned to a commit hash). Do not rewrite them. Simple animation can use Webflow Interactions instead.
3. **Designer must look like live.** Put effect CSS in an `HtmlEmbed` that contains only `<style>` (an embed with a `<script>` shows as a placeholder in the Designer). Anything that depends on JS state is locked behind a class that the live script adds (for example `html.<prefix>-live`).
4. **No layout CSS through `@import`.** The `<style>` embed holds effect CSS only: keyframes, state selectors, custom properties changed by JS, blend and mask.

## 2. Variables first
- One variable collection per website, named with the brand prefix (`xx`).
- Create these variables before any style: the 4 colors from the brief (Background, Text, Primary, Secondary), derived colors (muted text, line, hover, surface) computed from those 4, font families, radius, spacing (page padding, section padding).
- Every class uses variables, never raw values.
- The effect CSS and scripts read the same names as CSS custom properties (Webflow exposes them as `--_<collection>---<name>`). That is what makes the effects follow the user's palette. Check the effect CSS in `dist/sites/<slug>/` for the names it reads and create variables with matching meaning.

## 3. Client-First structure (Finsweet)
- Hierarchy: `page-wrapper` > `main-wrapper` > `section_*` > `padding-global` > `container-large` > content.
- Custom classes: `component_element` (underscore). Utilities: lowercase with hyphen. Combo classes: `is-*`. Brand components use the brand prefix (`xx-card`).
- Standard utilities: `padding-global`, `container-large`, `padding-section-*`, `heading-style-h1..h4`, `text-size-*`, `text-style-eyebrow`, `hide`.
- One container width on every page, consistent section padding.
- Properties are set in the Style panel (not empty stub classes) and bound to variables.
- Header and Footer are Components. A small `Chrome` component can hold loaders, transitions and the effect script embeds.
- Clickable cards: Link Block (with a Link field when it is CMS).

## 4. Responsive
Use Webflow breakpoints (991, 767, 479). No duplicated desktop and mobile markup. Check small and medium for every section.

## 5. CMS (only when the source has repeating content)
- Typical collections: main content (work, services), articles, categories. Add a template page and a listing page for each, and link them from the header and footer.
- Prefix collection names and URLs per website (`XX•Work`, `/xx-work/…`).
- Link items through a Link CMS field that holds the full URL, not `collectionPage` mode (it saves without a target).
- Bind text on TextBlock or Heading elements. Bind images with `assetId`. Bind attributes through the `attributes` key with a value binding.
- Do not set `sort` on a Collection List and do not delete DynamoEmpty. Order items with a `data-order` attribute bound to an Order field.
- Build a CMS element first, then bind it (an element with a binding cannot be created directly inside a DynamoItem).

## 6. Finsweet Attributes (CMS filter and similar)
- Client-First is the class convention; Finsweet Attributes provides CMS behaviour (list filter, load more, and so on). Use v2: `<script async type="module" src="https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js" fs-list></script>`.
- Filter pattern: Collection List `fs-list-element="list"`, form `fs-list-element="filters"`, each radio `fs-list-field="category"` + `fs-list-value="<slug>"` ("All" uses an empty value), and a hidden element in every item with `fs-list-field="category"` bound to a `category-slug` plain-text field.
- Pitfall 1: radios made in the Designer get different `name` values and behave like checkboxes. Run a small inline script before the Finsweet tag that sets the same `name` on all of them and checks the first one.
- Pitfall 2: the active class is `is-list-active` on the `.w-radio` label. Create a combo class `is-list-active` on the chip class and style it. Hide the radio input; the label is the chip.

## 7. Webflow MCP notes (when building with the Webflow MCP)
- Every call needs a session id, an agent id and a short context. Publishing is limited to one per minute per site.
- `data_whtml_builder` is the fastest way to build a section (one root element per action, breakpoint media queries exactly `@media screen and (max-width: 991px)` / `767px` / `479px`). It drops classes that are not in the `css` parameter, so send stubs for classes styled elsewhere. Inline `style` attributes create `inline-*` combo classes; avoid them. `<img>` is only recognised when the source is a Webflow asset (use the asset `hostedUrl`).
- `set_style` replaces all classes and takes one global class per call. Stack utilities by nesting elements (Client-First), not by multiple classes.
- After renaming classes in bulk, query the combo classes and make sure none lost their properties.
- `update_style` and `create_style` take `properties` as an array of `{property_name, property_value}`.
- Real `<button>` elements need a `DOM` element with `dom_tag="button"`; whtml turns buttons into links.
- Custom code through the site API can fail on free plans; use `HtmlEmbed` elements (max 50,000 characters each). Split larger CSS into several embeds or load it from this repo.
- Avoid `get_all_elements` on big pages; query by class.

## 8. Installing the effects from this repo
- Base URL: `https://cdn.jsdelivr.net/gh/sayyidaamri/amri-webflow-library@<commit>/dist/sites/<slug>/`. Always pin a commit hash, and change the hash when the repo changes.
- Head or Header component: one embed `<style>@import url("<base>fx.css")</style>` (or the CSS files the site folder contains) and a boot script that adds the live class.
- Chrome component: the effect script embeds from `<base>js/…`, plus `dist/js/library.js` if the site should link back to the library.
- Media (audio, video, frames, images) are referenced by URL from the same folder.
- Large JS or data stays in the repo; Webflow cannot host JS.

## 9. Before you finish
1. Variables are used everywhere; no raw color or spacing values left in classes.
2. Class names follow Client-First; no empty combo classes.
3. Small and medium breakpoints checked.
4. All internal links work (components, pages, CMS templates, link fields).
5. Publish, then test the live page: effects start, buttons and links work, filters work.
6. Remove unused styles and list leftover placeholders.

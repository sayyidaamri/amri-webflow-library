# Task: build a new website from a reference (React)

You are building a new website, "{{site_title}} style", from a public reference repository.

## Reference
- Repository: {{repo_url}}
- Clone it and read `README.md` first (and `AI-BRIEF.md` if it exists).
- Keep the reference's page structure, layout, interactions, animations and effects. Do not copy its brand, copy or imagery.

## What to build
{{brief}}

## Design system (from the user)
{{colors}}

Use these four colors as the base of the design system. Define them once as theme tokens (CSS custom properties `--color-background`, `--color-text`, `--color-primary`, `--color-secondary` in a global stylesheet) and derive every other color (muted text, borders, hover, surfaces) from them with `color-mix()` or fixed opacity. Components read tokens only; no raw hex values in components.

## Technical rules
- Vite + React + TypeScript. Plain CSS (CSS modules or one global stylesheet with tokens); no UI kit.
- One route per page (React Router). One component per section, in `src/components/`; pages in `src/pages/`.
- Port the reference's effects into React the right way: refs and `useEffect` with cleanup for canvas, WebGL, observers and event listeners; no direct DOM queries outside effects.
- Replace the brand name, copy and imagery with content from the brief. Keep copy and data in `src/content/` so it is easy to edit. Use neutral placeholder images when none are given, and say which ones you used.
- Responsive from 320px to 1920px. Accessible: semantic HTML, alt text, visible focus, `prefers-reduced-motion` respected.
- Remove everything from the reference that is not used.

## Done when
- `npm install && npm run dev` starts the site and `npm run build` passes with no type errors.
- Every page in the brief exists and links to the others.
- You give a short summary: pages and components created, what you kept from the reference, what you changed, and any placeholders left.

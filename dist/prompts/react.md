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
- Replace the brand name, copy and imagery with content from the brief. Keep copy and data in `src/content/` so it is easy to edit.
- Responsive from 320px to 1920px. Accessible: semantic HTML, alt text, visible focus, `prefers-reduced-motion` respected.
- Remove everything from the reference that is not used.

## Assets
- Images and video: only from Unsplash (unsplash.com) and Mixkit (mixkit.co). Sound (music, ambience, effects): only from Pixabay, Mixkit, Freesound or Zapsplat.
- Every asset must fit the brief: subject, industry, place, mood and colour palette. No random or generic stock. Pick each one for the section it goes in, and write a meaningful alt text.
- Do not reuse the reference website's images, video or audio.
- Use direct file URLs where the tool allows it. Otherwise download the file, keep it small (compressed images, short and light video and audio), and store it in the project.
- Check the licence of each file before using it. Freesound files have their own licence (some need attribution) and Zapsplat's free tier needs attribution. Do not use anything that forbids use in a website.
- Keep a list of every asset you used (file, section, source page URL, licence, author when attribution is needed) in `ASSETS.md`, and show credits on the site where a licence asks for it.
- Store assets in `public/assets/images`, `public/assets/video` and `public/assets/audio`.
- If no suitable asset exists on these sources, use a neutral placeholder and say so in your summary.

## Done when
- `npm install && npm run dev` starts the site and `npm run build` passes with no type errors.
- Every page in the brief exists and links to the others.
- You give a short summary: pages and components created, what you kept from the reference, what you changed, and any placeholders left.

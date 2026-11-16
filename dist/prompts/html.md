# Task: build a new website from a reference (HTML)

You are building a new website, "{{site_title}} style", from a public reference repository.

## Reference
- Repository: {{repo_url}}
- Clone it and read `README.md` first (and `AI-BRIEF.md` if it exists).
- Keep the reference's page structure, layout, interactions, animations and effects. Do not copy its brand, copy or imagery.

## What to build
{{brief}}

## Design system (from the user)
{{colors}}

Use these four colors as the base of the design system. Define them once as CSS custom properties on `:root` (`--color-background`, `--color-text`, `--color-primary`, `--color-secondary`) and derive every other color (muted text, borders, hover, surfaces) from them with `color-mix()` or fixed opacity. No raw hex values outside `:root`.

## Technical rules
- Plain HTML, CSS and JavaScript. No build step, no framework.
- Keep the reference's file structure where it makes sense (one HTML file per page, shared `assets/`).
- Replace the brand name, copy and imagery with content from the brief.
- Keep the effects working (animations, canvas, scroll behaviour). If an effect cannot work with the new content, simplify it and explain why.
- Responsive from 320px to 1920px. Accessible: semantic HTML, alt text, visible focus, `prefers-reduced-motion` respected.
- Remove everything from the reference that is not used: brand names, original text, unused assets.

## Assets
- Images and video: only from Unsplash (unsplash.com) and Mixkit (mixkit.co). Sound (music, ambience, effects): only from Pixabay, Mixkit, Freesound or Zapsplat.
- Every asset must fit the brief: subject, industry, place, mood and colour palette. No random or generic stock. Pick each one for the section it goes in, and write a meaningful alt text.
- Do not reuse the reference website's images, video or audio.
- Use direct file URLs where the tool allows it. Otherwise download the file, keep it small (compressed images, short and light video and audio), and store it in the project.
- Check the licence of each file before using it. Freesound files have their own licence (some need attribution) and Zapsplat's free tier needs attribution. Do not use anything that forbids use in a website.
- Keep a list of every asset you used (file, section, source page URL, licence, author when attribution is needed) in `ASSETS.md`, and show credits on the site where a licence asks for it.
- Store assets in `assets/images`, `assets/video` and `assets/audio`.
- If no suitable asset exists on these sources, use a neutral placeholder and say so in your summary.

## Done when
- Every page in the brief exists and links to the others.
- The site runs by opening `index.html` (or the same way the reference runs).
- You give a short summary: pages created, what you kept from the reference, what you changed, and any placeholders left.

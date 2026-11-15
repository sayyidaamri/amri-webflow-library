# Task: build a new website from a reference (Webflow)

You are building a new website, "{{site_title}} style", in Webflow. Use the Webflow MCP if it is connected. If it is not, produce a build plan the user can follow in the Designer, using the same rules.

## Reference
- Structure and look: {{repo_url}} (public HTML repository). Clone it and read `README.md` first. Keep its page structure, layout, content flow and behaviour. Do not copy its brand, copy or imagery.
- Effects: already built and hosted in `{{assets_base}}` (jsDelivr, pinned to a commit). Install them as described in the guide. Do not rewrite them.
- Build rules: read this guide completely before you start and follow it: {{guide_url}}

## What to build
{{brief}}

## Design system (from the user)
{{colors}}

Create one variable collection for the site first: these four colors as Background, Text, Primary and Secondary, plus derived colors (muted text, line, hover, surface), fonts, radius and spacing. Every class uses variables. The effect CSS reads the same names, so the effects follow this palette.

## Rules (summary; the guide has the detail)
- Hybrid: native Webflow layout and styles; effects only from the repo through jsDelivr.
- Client-First class naming with Finsweet Attributes for CMS behaviour (filters, load more). Brand components use a short brand prefix.
- Header, Footer and Chrome as Components. Responsive through Webflow breakpoints, no duplicated desktop and mobile markup.
- CMS only where the reference has repeating content.
- Replace the brand name, copy and imagery with content from the brief. Use neutral placeholder images when none are given, and say which ones you used.

## Done when
- Every page in the brief exists, is linked from the header or footer, and works on desktop, tablet and phone.
- Variables are used everywhere, classes follow Client-First, effects load and run on the published site.
- You give a short summary: pages, collections and components created, what you kept from the reference, what you changed, and any placeholders left.

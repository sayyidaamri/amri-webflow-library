# Ostra Atelier converter (ref: sayyidaamri/vantra-studio.webflow.io)
Paths are hard-coded: reference clone at /home/claude/ref/vantra-studio.webflow.io, output /home/claude/os/out, imgs.json at /home/claude/os/imgs.json.
1. `pip install tinycss2 beautifulsoup4`
2. `python3 convert.py` -> out/fx.css + out/native.json
3. `python3 osfrag.py index|work|about|contact` -> whtml fragments (.html + .css with native props)
4. `python3 fxslim.py` -> effect CSS without native props (source of dist/sites/ostra/fx.css)
5. `osjs.py` renames classes in main.js; dist/sites/ostra/js/ostra.js is the edited result (prelude + main).

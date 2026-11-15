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
  document.querySelectorAll("#projectsDropdownMenu a[data-node]").forEach(function (a) { a.setAttribute("href", "/noctelle/home"); });
  var st = document.createElement("style");
  st.textContent = ".nc-nav{background:rgba(0,0,0,.82);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-bottom:1px solid rgba(212,184,122,.14)}";
  document.body.appendChild(st);
  /* same gold cursor as home (desktop pointers only; fx.css hides it on phones) */
  if (window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var c = document.createElement("div");
    c.className = "nc-cursor nc-cursor-default"; c.setAttribute("aria-hidden", "true");
    c.style.left = "-100px"; c.style.top = "-100px";
    document.body.appendChild(c);
    var HOVER = "a, button, input, select, textarea, label, [data-cursor-hover], [role='button']", down = false, over = false;
    var paint = function () { c.className = "nc-cursor " + (down ? "nc-cursor-click" : over ? "nc-cursor-hover" : "nc-cursor-default"); };
    document.addEventListener("mousemove", function (e) {
      c.style.left = e.clientX + "px"; c.style.top = e.clientY + "px"; c.style.opacity = "1";
      var o = !!(e.target.closest && e.target.closest(HOVER)); if (o !== over) { over = o; paint(); }
    }, { passive: true });
    document.addEventListener("mousedown", function () { down = true; paint(); });
    document.addEventListener("mouseup", function () { down = false; paint(); });
    document.documentElement.addEventListener("mouseleave", function () { c.style.opacity = "0"; });
  }
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

if (document.getElementById("page-1")) {
ncPrep();
window.NOCTELLE_DATA={"projects":[{"year":"2021.09–2023.11","thumb":NCB + "img/thumb/t0.webp","title":"Crownfall Tactics","titleEn":"","desc":"Online strategy war game.<br>Clearer tactical flow.","sections":[{"id":"Product Design","en":"Product Design","icon":"box","pages":[{"visual":NCB + "img/work/p0a.webp","header":"01 | Project Overview: Strategy Tournament System","title":"One complete tournament loop, from reading the rules to replaying the battle","titleEn":"","subtitle":"Crownfall Tactics Mobile","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"A core system design project for the strategy tournament mode.\n\nThe challenge was not only drawing tournament screens, but weaving rules, sign-up, battle flow, team roles and post-match review into one journey players can follow and act on."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Lead Interaction Designer","Lead Interaction Designer"],["Timeline","Timeline","Five months across three seasons","Five months across three seasons"],["Platform","Platform","iOS / Android / PC","iOS / Android / PC"],["Tools","Tools","chips:Figma|Prototype,Protopie|Motion,Miro|Flow map",null]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Readable rules","New players grasp the format from one summary screen instead of five pages of text."],["Team coordination","Lane markers, attack pings and ally status read in under two seconds."],["Match review","Post-match stats answer one question: what should change tomorrow?"]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Pre-match","Season calendar, entry rules and rewards collapse into one progressively disclosed card."],["In-match","The tactical map uses a limited colour layer so critical info always wins contrast."],["Post-match","The recap highlights three decisive moments and links each to the replay."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Average time-to-understand dropped sharply in usability tests, and tournament participation rose the following season."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Great strategy starts with rules that feel simple."}]},{"visual":NCB + "img/work/p0b.webp","header":"02 | Design Challenge: Making Complex Rules Understandable","title":"Turning layered tournament rules into a clear path to take part","titleEn":"","subtitle":"Crownfall Tactics Mobile","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"Tournament rules stack many layers: qualifiers, brackets, schedule, rewards and penalties.\n\nWe mapped each layer to a player question — \"can I join?\", \"when do I play?\", \"what do I win?\" — and ordered the screens by those questions."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Lead Interaction Designer","Lead Interaction Designer"],["Method","Method","Player-question mapping","Player-question mapping"],["Testing","Testing","12 moderated sessions","12 moderated sessions"],["Tools","Tools","chips:Figma|Flows,FigJam|Workshops,Maze|Tests",null]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Questions first, screens later","Every screen answers one question, no more."],["Consistent language","One term per concept across every mode."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Question map","Twenty-seven player questions grouped into five stages."],["Rule cards","Long rules split into cards opened one at a time."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Rule-related support tickets nearly halved after launch."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Clarity is a feature, not decoration."}]}]},{"id":"Localization Design","en":"Localization Design","icon":"globe","pages":[{"visual":NCB + "img/work/p0c.webp","header":"03 | Six-Language Localization","title":"One layout system that stays tidy in six languages","titleEn":"","subtitle":"Crownfall Tactics Global","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"German runs three times longer, Thai sits taller, Arabic reads right to left.\n\nWe built elastic spacing rules so one design ships to every region without a rebuild."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Global UX Lead","Global UX Lead"],["Scope","Scope","6 languages, 9 regions","6 languages, 9 regions"],["Tools","Tools","chips:Figma|Variables,Lokalise|Strings",null]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Flexible space","Components grow with the longest string."],["Pseudo-locale testing","Long pseudo-text is used from the sketch stage."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Type tokens","Each language has its own line-height scale."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Zero major layout incidents over two years of global live-ops."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Good design speaks every language."}]}]},{"id":"User Research","en":"User Research","icon":"people","pages":[{"visual":NCB + "img/work/p0d.webp","header":"04 | Competitive Player Research","title":"Listening to players before drawing screens","titleEn":"","subtitle":"Crownfall Tactics Research","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"Interviews, play diaries and match-replay analysis grounded every design decision."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Researcher & Designer","Researcher & Designer"],["Participants","Participants","24 players, 3 tiers","24 players, 3 tiers"],["Tools","Tools","chips:Dovetail|Synthesis,Notion|Diaries",null]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Frustration patterns","We logged where players quit and why."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Tactical personas","Three personas: the planner, the chaser and the spectator."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Research reshaped feature priorities for two seasons."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Data gives direction, stories give reasons."}]}]},{"id":"Product Guidelines","en":"Product Guidelines","icon":"doc","pages":[{"visual":NCB + "img/work/p0e.webp","header":"05 | Interaction Control Guidelines","title":"Control guidelines shared across teams","titleEn":"","subtitle":"Crownfall Tactics Guidelines","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"An interaction pattern library for buttons, panels and battle feedback."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Guideline Author","Guideline Author"],["Used by","Used by","4 product teams","4 product teams"],["Tools","Tools","chips:Figma|Library,Zeroheight|Docs",null]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["One source of truth","One library for design and build."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Control states","Eight standard states for every control."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Design-to-dev handoff time shrank considerably."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Consistency is a form of respect for players."}]}]}]},{"year":"2020.07–2021.09","thumb":NCB + "img/thumb/t1.webp","title":"Lumen Guild","titleEn":"","desc":"Player community app.<br>Connecting creators & events.","pages":[{"visual":NCB + "img/work/p1a.webp","header":"01 | Community Overview","title":"A shared home for players, creators and events","titleEn":"","subtitle":"Lumen Guild App","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"A companion app uniting forums, guides and an event calendar.\n\nOur focus: make creator content easy to find without drowning out new players."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Lead Interaction Designer","Lead Interaction Designer"],["Timeline","Timeline","14 months","14 months"],["Tools","Tools","chips:Figma|UI,Principle|Motion",null]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Content discovery","Interest-based feed, not popularity alone."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Circles","Small per-game spaces with light moderation."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Daily active users in circles rose by about sixty percent."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Communities grow from small conversations."}]},{"visual":NCB + "img/work/p1b.webp","header":"02 | Creator Tools","title":"Simple tools for video and guide creators","titleEn":"","subtitle":"Lumen Guild App","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"A light editor to trim clips, annotate and publish guides."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Product Designer","Product Designer"],["Tools","Tools","chips:Figma|UI,After Effects|Motion",null]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Publish in three steps","Record, mark, publish."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Clip timeline","One-thumb trimming."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Weekly new guides doubled."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Empower creators and the community comes alive."}]},{"visual":NCB + "img/work/p1c.webp","header":"03 | Event Calendar","title":"Seasonal events nobody misses","titleEn":"","subtitle":"Lumen Guild App","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"A smart calendar with time-zone and interest-aware reminders."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Interaction Designer","Interaction Designer"]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Timely reminders","Notify only for relevant events."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Event card","Countdown, rewards and join in one card."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Event attendance rose consistently."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Right timing is half the design."}]},{"visual":NCB + "img/work/p1d.webp","header":"04 | Testing & Iteration","title":"Three rounds of flow review with cross-functional teams","titleEn":"","subtitle":"Lumen Guild App","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"Regular flow reviews to find friction before release."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Facilitator","Facilitator"]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Scheduled reviews","Every release passes a flow review."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Friction log","Each finding gets an impact score."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Critical flow issues were caught much earlier."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Small iterations, big impact."}]}]},{"year":"2020.01–2020.06","thumb":NCB + "img/thumb/t2.webp","title":"Ashen Dominion","titleEn":"","desc":"Fantasy war SLG.<br>City & system interaction.","pages":[{"visual":NCB + "img/work/p2a.webp","header":"01 | City Building Systems","title":"A city that feels alive with every tap","titleEn":"","subtitle":"Ashen Dominion","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"Core interactions for buildings, upgrades, barracks and daily quests."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Game Interaction Designer","Game Interaction Designer"],["Timeline","Timeline","6 months","6 months"],["Tools","Tools","chips:Figma|UI,Unity|Prototype",null]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Clear feedback","Every action has visual and audio feedback."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Building panel","Info, upgrade and talents in one sliding panel."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Day-7 retention improved in closed beta."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"A good city feels like home."}]},{"visual":NCB + "img/work/p2b.webp","header":"02 | World Map","title":"A world map that reads well on small screens","titleEn":"","subtitle":"Ashen Dominion","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"Three zoom tiers revealing detail progressively."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Game Interaction Designer","Game Interaction Designer"]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Semantic zoom","Detail changes with zoom level."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Territory icons","Icons scale by importance."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Map navigation became faster."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"A map is a story you can explore."}]},{"visual":NCB + "img/work/p2c.webp","header":"03 | Mail & Rewards","title":"Calm, consistent item collection rules","titleEn":"","subtitle":"Ashen Dominion","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"Animation and claim-flow standards for mail, daily login and events."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Interaction Designer","Interaction Designer"]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["One collect pattern","Every reward uses the same claim pattern."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Motion curves","Three standard curves for every reward."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"The pattern was reused in two other games."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Rewards feel sweeter when simple."}]}]},{"year":"2026","thumb":NCB + "img/thumb/t3.webp","title":"New UX concept","titleEn":"","desc":"A new paradigm for AI interaction.<br>Interaction that flows.","pages":[{"visual":NCB + "img/work/p3a.webp","header":"01 | AI Interaction Insight: From Single-line Turns to Multi-line Collaboration","title":"What is the future of AI interaction? My answer: flowing interaction","titleEn":"","subtitle":"Personal essay, 2026","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"The next step for AI interaction isn't smarter chat — it's changing the shape of the work.\n\nPeople and AI work across several lines at once: planning, executing, reviewing and remembering."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Format","Format","Visual essay","Visual essay"],["Year","Year","2026","2026"],["Tools","Tools","chips:Figma|Diagram,Claude|Thinking partner",null]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Parallel lanes","AI runs tasks in the background while people keep direction."],["Shared memory","Context persists between sessions."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["AI line","Capture intent, plan, execute."],["Human line","Judge, steer, decide."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Interaction is no longer a line, but many currents moving together."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Flowing interaction: many lines, one goal."}]},{"visual":NCB + "img/work/p3b.webp","header":"02 | Concept Prototype","title":"A shared workbench prototype for people and AI","titleEn":"","subtitle":"Personal essay, 2026","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"A prototype showing AI tasks as live cards you can pause, steer and review."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Format","Format","Interactive prototype","Interactive prototype"]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Visible control","Every AI task shows status and a pause control."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Task card","Plan, progress and output in one card."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Testers felt more in control."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Trust is born from transparency."}]}]},{"year":"2026","thumb":NCB + "img/thumb/t4.webp","title":"Indie Game","titleEn":"","desc":"Original narrative game exploration.<br>Light, emotional interaction.","pages":[{"visual":NCB + "img/work/p4a.webp","header":"2026 | Paper Lantern","title":"Paper Lantern — Narrative Adventure Game","titleEn":"","subtitle":"Narrative adventure game","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"A warm adventure about a child lighting lanterns to guide lost memories home.\n\nProject details stay confidential until the official reveal."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Concept, interaction, art direction","Concept, interaction, art direction"],["Status","Status","In development","In development"],["Tools","Tools","chips:Godot|Engine,Procreate|Art",null]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Emotion through interaction","Every mechanic carries story meaning."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Lanterns","Light as mechanic and metaphor."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"The first prototype is being tested with a small community."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"A small light is enough to find the way home."}]},{"visual":NCB + "img/work/p4b.webp","header":"2026 | Paper Lantern","title":"Mood & world","titleEn":"","subtitle":"Narrative adventure game","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"Mood board: caves, torchlight and slowly burning paper."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Art direction","Art direction"]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Warm palette","Gold, amber and soft shadow."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Lighting","Light as wayfinding."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Visual style locked for the first demo."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Mood is a silent narrator."}]},{"visual":NCB + "img/work/p4c.webp","header":"2026 | Paper Lantern","title":"Symbols & interface","titleEn":"","subtitle":"Narrative adventure game","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"A minimal feather-and-paper UI blended into the world."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","UI design","UI design"]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Diegetic UI","Interface lives inside the world."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Feathers","Dialogue choice markers."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Playtesters rarely opened the pause menu."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"The best interface is almost invisible."}]}]},{"year":"2025","thumb":NCB + "img/thumb/t5.webp","title":"Outsourcing Projects","titleEn":"","desc":"Game UI work for clients.<br>Visuals & handoff standards.","pages":[{"visual":NCB + "img/work/p5a.webp","header":"2025 | Outsourcing Projects","title":"Game UI for partner studios","titleEn":"","subtitle":"Client work","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"Complete UI packages for three partner studios, from home screens to motion specs."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Freelance UI Designer","Freelance UI Designer"],["Clients","Clients","3 studios (fictional)","3 studios (fictional)"],["Tools","Tools","chips:Figma|UI,Spine|Motion",null]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Handoff standards","Every file is dev-ready."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Component kit","One kit per client."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"All projects shipped on time."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Consistent quality builds trust."}]},{"visual":NCB + "img/work/p5b.webp","header":"2025 | Outsourcing Projects","title":"Controls & HUD","titleEn":"","subtitle":"Client work","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"A HUD adapting to controller and touch input."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","UI Designer","UI Designer"]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Dual input","Controller and touch support."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["HUD layout","Safe zones for every device."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"HUD passed platform certification."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"One HUD, many hands."}]},{"visual":NCB + "img/work/p5c.webp","header":"2025 | Outsourcing Projects","title":"Store & profile screens","titleEn":"","subtitle":"Client work","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"An honest, comparable in-game store."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","UI Designer","UI Designer"]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Transparent pricing","Bundle value is clear."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Product card","Price, contents and time left."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Purchase complaints dropped."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Honesty can be designed too."}]}]},{"year":"2025","thumb":NCB + "img/thumb/t6.webp","title":"Velvet Lens AI Camera","titleEn":"","desc":"Dreamlike AI camera project.<br>Retro filters & dreamcore imagery.","pages":[{"visual":NCB + "img/work/p6a.webp","header":"2025 | Velvet Lens","title":"A dreamy AI camera","titleEn":"","subtitle":"Product Manager","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"A camera app turning everyday photos into dreamy retro portraits."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Product Manager & Designer","Product Manager & Designer"],["Timeline","Timeline","4 months","4 months"],["Tools","Tools","chips:Figma|UI,Runway|AI tests",null]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["One tap, one mood","Filters picked by mood, not parameters."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Mood gallery","Live preview for every style."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Beta released to a small community."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Memories deserve to look like dreams."}]},{"visual":NCB + "img/work/p6b.webp","header":"2025 | Velvet Lens","title":"Capture flow","titleEn":"","subtitle":"Product Manager","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"Three steps: frame, pick a mood, share."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Interaction Designer","Interaction Designer"]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["No waiting","Fast preview before the final render."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Viewfinder","Minimal controls in the thumb zone."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Open-to-share time became very short."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Fast is beautiful too."}]},{"visual":NCB + "img/work/p6c.webp","header":"2025 | Velvet Lens","title":"Product identity","titleEn":"","subtitle":"Product Manager","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"A soft visual identity with an old-film touch."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Visual direction","Visual direction"]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Analog feel","Grain, light leaks and faded colour."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["App icon","A velvet lens shaped like a moon."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Identity ready for launch."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Soft, warm, slightly mysterious."}]}]},{"year":"2024.02–2024.08","thumb":NCB + "img/thumb/t7.webp","title":"Iron Requiem","titleEn":"","desc":"Classic narrative action project.<br>History, swords & adventure.","pages":[{"visual":NCB + "img/work/p7a.webp","header":"2024 | Iron Requiem","title":"Large-scale narrative action","titleEn":"","subtitle":"Senior Interaction Designer","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"Interaction and experience planning for a large-scale narrative action game."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Senior Interaction Designer","Senior Interaction Designer"],["Timeline","Timeline","7 months","7 months"],["Tools","Tools","chips:Figma|Flows,Unreal|UMG",null]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["System flow","Structure feature flows and drive iteration."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Gear menu","Weapon comparison in one view."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Core feature flows passed production review."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Big stories need calm interfaces."}]},{"visual":NCB + "img/work/p7b.webp","header":"2024 | Iron Requiem","title":"Journal & hint system","titleEn":"","subtitle":"Senior Interaction Designer","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"A journal capturing story clues without spoilers."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Interaction Designer","Interaction Designer"]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Layered hints","Three hint tiers on demand."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Journal page","Sketches, notes and maps."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Playtesters rarely got lost."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Good hints feel like discoveries."}]},{"visual":NCB + "img/work/p7c.webp","header":"2024 | Iron Requiem","title":"World mood","titleEn":"","subtitle":"Senior Interaction Designer","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"Misty forests and dim light as the UI mood reference."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","Interaction Designer","Interaction Designer"]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Low contrast","UI never overpowers the world."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Palette","Ash, bronze and deep red."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Visual direction approved by art team."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"World first, interface follows."}]}]},{"year":"2019","thumb":NCB + "img/thumb/t8.webp","title":"Hollow Crown","titleEn":"","desc":"Dark fantasy project showcase.<br>Systems adapted for mobile.","pages":[{"visual":NCB + "img/work/p8a.webp","header":"2019 | Hollow Crown","title":"Dark fantasy on a phone screen","titleEn":"","subtitle":"Mobile adaptation study","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"A study adapting inventory and skill systems from PC to mobile."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","UI/UX Designer","UI/UX Designer"],["Tools","Tools","chips:Sketch|UI,Photoshop|Art",null]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Thumb zone","Key actions within thumb reach."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Skill wheel","Six skills in one wheel."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"The study became a reference for later projects."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Even darkness needs legibility."}]},{"visual":NCB + "img/work/p8b.webp","header":"2019 | Hollow Crown","title":"Light in the dungeon","titleEn":"","subtitle":"Mobile adaptation study","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"Light as a signal for danger and treasure."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","UI/UX Designer","UI/UX Designer"]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["A language of light","Blue for safe, red for danger."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Minimap","Icons glow when approached."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Dungeon navigation became more intuitive."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Follow the light."}]},{"visual":NCB + "img/work/p8c.webp","header":"2019 | Hollow Crown","title":"Archive & lore","titleEn":"","subtitle":"Mobile adaptation study","tabs":[{"key":"summary","id":"Project Summary","en":"Project Summary","icon":"star","type":"summary","body":"An explorable library of world lore."},{"key":"info","id":"Project Info","en":"Project Info","icon":"people","type":"info","rows":[["Role","Role","UI/UX Designer","UI/UX Designer"]]},{"key":"focus","id":"Core Focus","en":"Core Focus","icon":"star","type":"modules","modules":[["Light reading","Short lore snippets."]]},{"key":"breakdown","id":"Design Breakdown","en":"Design Breakdown","icon":"target","type":"modules","modules":[["Bookshelf","A collection filled through play."]]},{"key":"conclusion","id":"Conclusion","en":"Conclusion","icon":"check","type":"text","body":"Players spent more time reading lore."},{"key":"key","id":"Key Sentence","en":"Key Sentence","icon":"star","type":"text","body":"Every book is a door."}]}]}],"featured":[0,1,2,3],"selected":[4,5,6,7,8],"others":{"design-system":["ds1","ds2","ds3","ds4"],"graphic":["g1","g2","g3","g4","g5","g6","g7","g8"],"photography":["ph1","ph2","ph3","ph4","ph5","ph6","ph7","ph8","ph9","ph10","ph11"]}};

/* NOCTELLE — page 2 board + project detail modal */
(function () {
  "use strict";

  var DATA = window.NOCTELLE_DATA;
  var featuredRow = document.getElementById("ptFeaturedRow");
  var track = document.getElementById("ptSelectedTrack");
  var modal = document.querySelector("[data-pt-modal]");
  if (!DATA || !featuredRow || !track || !modal) return;

  var modalYear = modal.querySelector("[data-pt-modal-year]");
  var modalTitle = modal.querySelector("[data-pt-modal-title]");
  var modalSubtitle = modal.querySelector("[data-pt-modal-subtitle]");
  var modalIntro = modal.querySelector("[data-pt-modal-intro]");
  var modalVisual = modal.querySelector("[data-pt-modal-visual]");
  var modalTabs = modal.querySelector("[data-pt-section-tabs]");
  var modalDots = modal.querySelector("[data-pt-page-dots]");
  var navPrev = modal.querySelector("[data-pt-visual-prev]");
  var navNext = modal.querySelector("[data-pt-visual-next]");
  var navRail = modal.querySelector(".nc-pt-visual-nav-rail");
  var closeControls = modal.querySelectorAll("[data-pt-close]");

  var ICONS = {
    star: '<path d="M12 3.5l2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.4l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    people: '<circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 19c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="16.5" cy="9" r="2.4" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M15.5 13.6c2.6-.2 4.5 1.3 5 4.4" fill="none" stroke="currentColor" stroke-width="1.4"/>',
    target: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
    check: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 12.3l2.7 2.7L16.2 9.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    box: '<rect x="4" y="5" width="16" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="7" y="9" width="5" height="4" fill="currentColor"/>',
    globe: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M3.5 12h17M12 3.5c2.6 2.6 2.6 14.4 0 17M12 3.5c-2.6 2.6-2.6 14.4 0 17" fill="none" stroke="currentColor" stroke-width="1.2"/>',
    doc: '<path d="M6 3.5h8l4 4v13H6z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 11h6M9 14.5h6M9 18h4" stroke="currentColor" stroke-width="1.3"/>'
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || "nc-pt-intro-icon") + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.star) + "</svg>";
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

  /* ─── board ─── */
  function nodeHTML(index, kind) {
    var p = DATA.projects[index];
    return (
      '<article class="nc-pt-node is-' + kind + (kind === "featured" ? "" : " is-active") + '">' +
      '<button class="nc-pt-node-button" type="button" data-pt-project="' + index + '" aria-label="Open project details ' + esc(p.titleEn) + '">' +
      '<span class="nc-pt-year">' + esc(p.year) + "</span>" +
      '<span class="nc-pt-thumb-wrap"><img class="nc-pt-thumb" src="' + p.thumb + '" alt="" loading="eager"></span>' +
      '<span class="nc-pt-title">' + esc(p.title) + "<span>" + esc(p.titleEn) + "</span></span>" +
      '<span class="nc-pt-desc">' + p.desc + "</span>" +
      '<img class="nc-pt-rule" src="' + NCB + 'svg/rule.svg" alt="" aria-hidden="true">' +
      "</button></article>"
    );
  }
  featuredRow.innerHTML = DATA.featured.map(function (i) { return nodeHTML(i, "featured"); }).join("");
  track.innerHTML = DATA.selected.map(function (i, n) {
    return (n ? '<img class="nc-pt-connector" src="' + NCB + 'svg/connector.svg" alt="" aria-hidden="true">' : "") + nodeHTML(i, "selected");
  }).join("");

  /* selected-row hover focus: the hovered node lights up, others dim */
  var selectedNodes = Array.prototype.slice.call(track.querySelectorAll(".nc-pt-node"));
  selectedNodes.forEach(function (node) {
    node.addEventListener("mouseenter", function () {
      selectedNodes.forEach(function (n) { n.classList.toggle("is-active", n === node); });
    });
  });
  track.addEventListener("mouseleave", function () {
    selectedNodes.forEach(function (n) { n.classList.add("is-active"); });
  });

  /* ─── modal state ─── */
  var activeProject = null;
  var sectionIndex = 0;
  var pageIndex = 0;
  var lastTurn = 0;
  var lastFocus = null;
  var lockedY = 0;

  function sectionsOf(p) {
    return p.sections || [{ pages: p.pages }];
  }
  function pagesOf(p, s) { return sectionsOf(p)[s].pages; }
  function flatIndex() {
    var n = 0, secs = sectionsOf(activeProject);
    for (var i = 0; i < sectionIndex; i++) n += secs[i].pages.length;
    return n + pageIndex;
  }
  function totalPages() {
    return sectionsOf(activeProject).reduce(function (a, s) { return a + s.pages.length; }, 0);
  }

  function renderSectionTabs() {
    if (!activeProject.sections) {
      modalTabs.hidden = true; modalTabs.innerHTML = "";
      modal.classList.remove("has-sections");
      return;
    }
    modal.classList.add("has-sections");
    modalTabs.hidden = false;
    modalTabs.innerHTML = activeProject.sections.map(function (s, i) {
      return '<button type="button" class="nc-pt-section-tab' + (i === sectionIndex ? " is-active" : "") + '" data-pt-section="' + i + '" aria-pressed="' + (i === sectionIndex) + '">' +
        icon(s.icon, "") + '<span class="nc-pt-section-tab-copy"><span class="nc-pt-section-tab-cn">' + esc(s.id) + '</span><span class="nc-pt-section-tab-en">' + esc(s.en) + "</span></span></button>";
    }).join("");
  }

  function renderDots() {
    var pages = pagesOf(activeProject, sectionIndex);
    if (pages.length <= 1) { modalDots.hidden = true; modalDots.innerHTML = ""; return; }
    modalDots.hidden = false;
    modalDots.innerHTML = pages.map(function (_, i) {
      return '<button type="button" class="nc-pt-page-dot" data-pt-page="' + i + '" aria-label="Halaman ' + (i + 1) + '" aria-current="' + (i === pageIndex) + '"></button>';
    }).join("");
  }

  function splitLines(t) {
    var parts = String(t).split("\n");
    return { a: parts[0] || "", b: parts.slice(1).join("\n") };
  }

  function renderTab(tab) {
    var head = '<div class="nc-pt-intro-section-head">' + icon(tab.icon) + '<div class="nc-pt-intro-section-title">' + esc(tab.id) + "<small>" + esc(tab.en) + "</small></div></div>";
    var body = "";
    if (tab.type === "summary") {
      body = '<div class="nc-pt-summary-body">' + esc(tab.body) + "</div>";
    } else if (tab.type === "info") {
      body = tab.rows.map(function (r) {
        var val;
        if (String(r[2]).indexOf("chips:") === 0) {
          val = '<div class="nc-pt-info-chips">' + r[2].slice(6).split(",").map(function (c) {
            var cp = c.split("|");
            return '<span class="nc-pt-info-chip"><span class="nc-pt-chip-cn">' + esc(cp[0]) + '</span><span class="nc-pt-chip-en">' + esc(cp[1] || "") + "</span></span>";
          }).join("") + "</div>";
        } else {
          val = '<div class="nc-pt-info-cn">' + esc(r[2]) + '</div><div class="nc-pt-info-en">' + esc(r[3]) + "</div>";
        }
        return '<div class="nc-pt-info-row"><div class="nc-pt-info-label"><span>' + esc(r[0]) + "</span><small>" + esc(r[1]) + "</small></div><div>" + val + "</div></div>";
      }).join("");
    } else if (tab.type === "modules") {
      body = '<div class="nc-pt-module-list">' + tab.modules.map(function (m) {
        return '<div class="nc-pt-mini-module"><div class="nc-pt-mini-module-head">' + esc(m[0]) + '</div><div class="nc-pt-mini-module-body">' + esc(m[1]) + "</div></div>";
      }).join("") + "</div>";
    } else {
      body = '<div class="nc-pt-text-body' + (tab.key === "key" ? " is-key" : "") + '">' + esc(tab.body) + "</div>";
    }
    return '<div class="nc-pt-intro-tab-panel" role="tabpanel">' + head + body + "</div>";
  }

  var activeTabKey = "summary";
  function renderIntro(page) {
    var tabs = page.tabs || [];
    if (!tabs.some(function (t) { return t.key === activeTabKey; })) activeTabKey = tabs[0] ? tabs[0].key : "";
    var list = '<div class="nc-pt-intro-tablist" role="tablist">' + tabs.map(function (t) {
      var on = t.key === activeTabKey;
      return '<button type="button" role="tab" class="nc-pt-intro-tab' + (on ? " is-active" : "") + '" aria-selected="' + on + '" data-pt-tab="' + t.key + '">' + icon(t.icon) +
        '<span class="nc-pt-intro-tab-text"><span class="nc-pt-intro-tab-cn">' + esc(t.id) + '</span><span class="nc-pt-intro-tab-en">' + esc(t.en) + "</span></span></button>";
    }).join("") + "</div>";
    var current = tabs.filter(function (t) { return t.key === activeTabKey; })[0];
    modalIntro.innerHTML = '<div class="nc-pt-intro-tabs">' + list + (current ? renderTab(current) : "") + "</div>";
    modalIntro.scrollTop = 0;
  }

  function renderVisual(src) {
    modalVisual.innerHTML = "";
    modalVisual.classList.add("is-loading");
    var img = new Image();
    img.className = "nc-pt-modal-visual-img";
    img.alt = "";
    img.onload = function () { modalVisual.classList.remove("is-loading"); };
    img.onerror = function () { modalVisual.classList.remove("is-loading"); };
    img.src = src;
    modalVisual.appendChild(img);
    if (img.complete) modalVisual.classList.remove("is-loading");
  }

  function setPage(i) {
    var pages = pagesOf(activeProject, sectionIndex);
    pageIndex = clamp(i, 0, pages.length - 1);
    var page = pages[pageIndex];
    modalYear.textContent = page.header || activeProject.year;
    modalTitle.innerHTML = '<span class="nc-pt-title-cn">' + esc(page.title) + '</span><span class="nc-pt-title-en">' + esc(page.titleEn || "") + "</span>";
    modalSubtitle.textContent = page.subtitle || "";
    modalSubtitle.hidden = !page.subtitle;
    renderIntro(page);
    renderVisual(page.visual);
    Array.prototype.forEach.call(modalDots.querySelectorAll(".nc-pt-page-dot"), function (d, n) {
      d.setAttribute("aria-current", n === pageIndex ? "true" : "false");
    });
    updateNav();
  }

  function setSection(s, p) {
    sectionIndex = clamp(s, 0, sectionsOf(activeProject).length - 1);
    pageIndex = p || 0;
    renderSectionTabs();
    renderDots();
    setPage(pageIndex);
  }

  function updateNav() {
    var show = totalPages() > 1;
    var flat = flatIndex();
    navPrev.hidden = !show || flat === 0;
    navNext.hidden = !show || flat === totalPages() - 1;
    navRail.setAttribute("aria-hidden", show ? "false" : "true");
  }

  function turn(dir) {
    if (!activeProject || totalPages() <= 1) return;
    var now = Date.now();
    if (now - lastTurn < 420) return;
    lastTurn = now;
    var pages = pagesOf(activeProject, sectionIndex);
    if (dir > 0) {
      if (pageIndex < pages.length - 1) setPage(pageIndex + 1);
      else if (sectionIndex < sectionsOf(activeProject).length - 1) setSection(sectionIndex + 1, 0);
    } else {
      if (pageIndex > 0) setPage(pageIndex - 1);
      else if (sectionIndex > 0) setSection(sectionIndex - 1, pagesOf(activeProject, sectionIndex - 1).length - 1);
    }
  }

  function openModal(index) {
    var p = DATA.projects[index];
    if (!p) return;
    lastFocus = document.activeElement;
    lockedY = window.scrollY;
    activeProject = p;
    activeTabKey = "summary";
    modal.classList.add("is-open", "is-paged");
    modal.setAttribute("aria-hidden", "false");
    setSection(0, 0);
    document.body.classList.add("nc-pt-modal-lock");
    window.dispatchEvent(new CustomEvent("pt:portfolio-modal-toggle", { detail: { isOpen: true, lockedScrollY: lockedY } }));
    modal.querySelector(".nc-pt-close").focus({ preventScroll: true });
  }

  function closeModal() {
    if (!modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open", "is-paged", "has-sections");
    modal.setAttribute("aria-hidden", "true");
    modalVisual.innerHTML = "";
    modalTabs.hidden = true; modalTabs.innerHTML = "";
    modalDots.hidden = true; modalDots.innerHTML = "";
    navPrev.hidden = navNext.hidden = true;
    activeProject = null;
    document.body.classList.remove("nc-pt-modal-lock");
    window.dispatchEvent(new CustomEvent("pt:portfolio-modal-toggle", { detail: { isOpen: false, lockedScrollY: lockedY } }));
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  /* ─── events ─── */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-pt-project]");
    if (btn) { e.preventDefault(); openModal(Number(btn.getAttribute("data-pt-project"))); }
  });
  Array.prototype.forEach.call(closeControls, function (c) { c.addEventListener("click", closeModal); });
  modalTabs.addEventListener("click", function (e) {
    var b = e.target.closest("[data-pt-section]");
    if (b) setSection(Number(b.getAttribute("data-pt-section")), 0);
  });
  modalDots.addEventListener("click", function (e) {
    var b = e.target.closest("[data-pt-page]");
    if (b) setPage(Number(b.getAttribute("data-pt-page")));
  });
  modalIntro.addEventListener("click", function (e) {
    var b = e.target.closest("[data-pt-tab]");
    if (!b || !activeProject) return;
    activeTabKey = b.getAttribute("data-pt-tab");
    renderIntro(pagesOf(activeProject, sectionIndex)[pageIndex]);
    var t = modalIntro.querySelector('[data-pt-tab="' + activeTabKey + '"]');
    if (t) t.focus({ preventScroll: true });
  });
  navPrev.addEventListener("click", function () { lastTurn = 0; turn(-1); });
  navNext.addEventListener("click", function () { lastTurn = 0; turn(1); });

  var scrollTimer = 0;
  modal.addEventListener("wheel", function (e) {
    if (!activeProject) return;
    if (Math.abs(e.deltaX) > 18 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault(); turn(e.deltaX > 0 ? 1 : -1); return;
    }
    if (!e.target.closest(".nc-pt-modal-intro")) {
      var el = modalIntro;
      if (el.scrollHeight > el.clientHeight + 1 && window.innerWidth > 767) { el.scrollTop += e.deltaY; e.preventDefault(); }
    }
    modalIntro.classList.add("is-scroll-active");
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () { modalIntro.classList.remove("is-scroll-active"); }, 900);
  }, { passive: false });

  var sx = 0, sy = 0, tracking = false;
  modal.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = !!e.target.closest(".nc-pt-modal-visual-stage");
  }, { passive: true });
  modal.addEventListener("touchend", function (e) {
    if (!tracking) return; tracking = false;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy)) { lastTurn = 0; turn(dx < 0 ? 1 : -1); }
  }, { passive: true });

  document.addEventListener("keydown", function (e) {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") { e.preventDefault(); closeModal(); }
    else if (e.key === "ArrowRight") { lastTurn = 0; turn(1); }
    else if (e.key === "ArrowLeft") { lastTurn = 0; turn(-1); }
  });

  window.NoctellePortfolio = { open: openModal, close: closeModal, isOpen: function () { return modal.classList.contains("is-open"); } };
})();

/* NOCTELLE — cinematic five-page experience
   page 1: scroll-scrubbed frame sequence · page 2: video → UX board · page 3: video → still
   page 4: orb scene (scratch reveal + flip) · page 5: eyes that follow the cursor */
(function () {
  "use strict";

  var MOBILE_QUERY = window.matchMedia("(max-width: 767px), (pointer: coarse)");
  var IS_MOBILE = MOBILE_QUERY.matches;
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var CONFIG = {
    fps: 30,
    totalFrames: 150,
    framePath: function (i) { return "" + NCB + "frames/frame_" + String(i).padStart(4, "0") + ".webp"; },
    readyFrames: IS_MOBILE ? 16 : 30,
    textFadeInStart: 0.68,
    textFadeInEnd: 1,
    textFadeOutRatio: 0.14,
    textSlide: 42,
    textSmooth: 0.12
  };
  var P1 = 0, P2 = 1, P3 = 2, P4 = 3, P5 = 4, PAGE_COUNT = 5;
  var SEGMENTS = {}; SEGMENTS[P2] = { start: 0, end: 5 }; SEGMENTS[P3] = { start: 5, end: 10.1 };
  var SCRUB_END = 80, SCRUB_RATE = 0.12, SCRUB_COOLDOWN = 520;
  var SECTION_SCROLL_MS = 620, WHEEL_MIN = 24, POST_SCROLL_MS = 420, TURN_MS = 2200;
  var PAGE1_BG = "" + NCB + "img/page1-bg.webp", PAGE3_BG = "" + NCB + "img/page3-bg.webp";
  var P4_IMG = { w: 2000, h: 1314, orbX: 0.502, orbY: 0.365, orbR: 0.172 };
  var P5_IMG = { w: 1920, h: 1080 };
  var EYE_MAX_X = 11, EYE_MAX_Y = 1.5;

  var $ = function (id) { return document.getElementById(id); };
  var canvas = $("bgCanvas"), ctx = canvas.getContext("2d");
  var video = $("page23Video");
  var sections = [1, 2, 3, 4, 5].map(function (i) { return $("page-" + i); });
  var contents = [1, 2, 3, 4, 5].map(function (i) { return $("page" + i + "Content"); });
  var loader = $("loader"), loaderBar = $("loaderProgress"), loaderPct = $("loaderPercent"), loaderText = $("loaderText"), enterBtn = $("loaderEnterBtn");
  var navLinks = $("navLinks"), dropdown = $("projectsDropdown"), dropdownBtn = $("projectsMenuBtn"), soundToggle = $("soundToggle"), audio = $("bgAudio");
  var hint = $("scrollHint");
  var turnStage = $("pageTurnStage"), turnImage = $("pageTurnStageImage"), turnCurl = $("pageTurnCurl");
  var p4Scene = document.querySelector(".nc-page4-scene");
  var p4Front = document.querySelector(".nc-page4-layer.is-front"), p4Back = document.querySelector(".nc-page4-layer.is-back");
  var p4Preview = $("page4PreviewLayer"), p4PreviewCtx = p4Preview.getContext("2d");
  var p4Mask = document.createElement("canvas"), p4MaskCtx = p4Mask.getContext("2d");
  var p5Scene = document.querySelector(".nc-page5-scene");
  var eyeL = $("page5RightEyeWindow"), eyeR = $("page5SecondEyeWindow");
  var otherModal = $("otherProjectsModal"), otherGallery = $("otherProjectsGallery");
  var introModal = $("introModal"), introLangBtn = $("introLangBtn") || document.createElement("button");

  function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smoothstep(a, b, x) { var t = clamp((x - a) / (b - a || 1), 0, 1); return t * t * (3 - 2 * t); }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  /* ═══ state ═══ */
  var frames = new Array(CONFIG.totalFrames + 1);
  var page1Bg = null, page3Bg = null;
  var entered = false, ready = false;
  var playback = [
    { frame: 1, done: false }, { progress: 0, done: false }, { progress: 0, done: false }, { done: true }, { done: true }
  ];
  var scrubFrame = 1, scrubDone = false, scrubLockUntil = 0;
  var lastPage = 0, displayed = -1, showing = "";
  var scrollDir = 1, lastScrollY = 0;
  var sectionScrolling = false, scrollLocked = false, wheelLocked = false, targetPage = null, tweenRaf = null, cooldownTimer = 0;
  var contentState = contents.map(function () { return { o: 0, y: 0 }; });
  var portfolioOpen = false, otherOpen = false, introOpen = false;
  var soundOn = true, audioBlocked = false;
  var savedScrollY = 0;

  function suspended() { return portfolioOpen || otherOpen || introOpen; }
  function activeIndexFromScroll() {
    var mid = window.scrollY + window.innerHeight * 0.5;
    return clamp(Math.floor(mid / window.innerHeight), 0, PAGE_COUNT - 1);
  }
  function activePage() { return sectionScrolling && targetPage !== null ? targetPage : activeIndexFromScroll(); }

  /* ═══ loading ═══ */
  function loadImage(src) {
    return new Promise(function (res) {
      var img = new Image();
      img.decoding = "async";
      img.onload = function () { res(img); };
      img.onerror = function () { res(null); };
      img.src = src;
    });
  }
  function ensureFrame(i) {
    if (frames[i] && frames[i] !== true) return Promise.resolve(frames[i]);
    if (frames[i] === true) return Promise.resolve(null);
    frames[i] = true;
    return loadImage(CONFIG.framePath(i)).then(function (img) { frames[i] = img; if (Math.round(currentFrame()) === i) displayed = -1; return img; });
  }

  var shownPct = 0, realPct = 0, loadStart = performance.now();
  function loaderLoop() {
    var minByTime = clamp((performance.now() - loadStart) / 1400, 0, 1) * 100;
    shownPct = Math.min(realPct, Math.max(shownPct + 0.6, Math.min(minByTime, realPct)));
    if (realPct >= 100 && shownPct > 99) shownPct = 100;
    loaderPct.textContent = Math.round(shownPct) + "%";
    loaderBar.style.width = shownPct + "%";
    if (shownPct >= 100) {
      ready = true;
      loader.classList.add("is-ready");
      loaderText.textContent = "Ready";
      renderFrame(1);
      return;
    }
    requestAnimationFrame(loaderLoop);
  }
  function preload() {
    var jobs = [];
    for (var i = 1; i <= CONFIG.readyFrames; i++) jobs.push(ensureFrame(i));
    jobs.push(loadImage(PAGE1_BG).then(function (i) { page1Bg = i; }));
    var done = 0;
    jobs.forEach(function (p) { p.then(function () { done++; realPct = (done / jobs.length) * 100; }); });
    requestAnimationFrame(loaderLoop);
    Promise.all(jobs).then(function () {
      loadImage(PAGE3_BG).then(function (i) { page3Bg = i; });
      var n = CONFIG.readyFrames + 1;
      (function next() { if (n > CONFIG.totalFrames) return; ensureFrame(n++).then(next); })();
    });
  }

  /* ═══ canvas ═══ */
  function resizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    displayed = -1; showing = "";
  }
  function coverRect(iw, ih, vw, vh, fx) {
    var s = Math.max(vw / iw, vh / ih), w = iw * s, h = ih * s;
    return { left: (vw - w) * (fx == null ? 0.5 : fx), top: (vh - h) / 2, width: w, height: h };
  }
  function drawCover(c, img, w, h, fx) {
    if (!img) return;
    var r = coverRect(img.naturalWidth || img.width, img.naturalHeight || img.height, w, h, fx);
    c.drawImage(img, r.left, r.top, r.width, r.height);
  }
  function nearestFrame(i) {
    for (var d = 0; d < 40; d++) {
      if (frames[i - d] && frames[i - d] !== true) return frames[i - d];
      if (frames[i + d] && frames[i + d] !== true) return frames[i + d];
    }
    return null;
  }
  function renderFrame(f) {
    var i = clamp(Math.round(f), 1, CONFIG.totalFrames);
    var img = frames[i] && frames[i] !== true ? frames[i] : nearestFrame(i);
    if (!frames[i]) ensureFrame(i);
    if (!img) return;
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCover(ctx, img, canvas.width, canvas.height);
    displayed = img === frames[i] ? i : -1;
    showing = "frames";
  }
  function renderStill(img, tag) {
    if (!img) return;
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCover(ctx, img, canvas.width, canvas.height);
    showing = tag;
  }

  /* ═══ video segments ═══ */
  var seekReq = 0;
  function setVideo(page, time, play) {
    var seg = SEGMENTS[page]; if (!seg) return;
    var req = ++seekReq;
    var apply = function () {
      if (req !== seekReq) return;
      video.pause();
      var t = clamp(time, seg.start, seg.end);
      var begin = function () { if (req === seekReq && play) video.play().catch(function () {}); };
      if (Math.abs(video.currentTime - t) > 0.01) { video.addEventListener("seeked", begin, { once: true }); video.currentTime = t; }
      else begin();
    };
    if (video.readyState >= 1) apply();
    else { video.addEventListener("loadedmetadata", apply, { once: true }); video.load(); }
  }

  function currentFrame() { return playback[P1].frame; }

  /* ═══ page playback (per tick) ═══ */
  function onEnterPage(i) {
    if (lastPage === P4 && i !== P4) resetPage4();
    if (lastPage === P5 && i !== P5) resetEyes();
    if (i === P5) layoutEyes();
    if (SEGMENTS[i]) {
      playback[i].done = false; playback[i].progress = 0;
      setVideo(i, SEGMENTS[i].start, true);
    }
    lastPage = i;
  }

  function updatePlayback(dt) {
    if (!entered) return;
    if (suspended()) { video.pause(); return; }
    var i = activePage();
    if (i !== lastPage) onEnterPage(i);

    if (i === P1) {
      var pb = playback[P1];
      if (scrubDone && !pb.done) {
        pb.frame = Math.min(CONFIG.totalFrames, pb.frame + CONFIG.fps * dt);
        if (pb.frame >= CONFIG.totalFrames) pb.done = true;
      }
    } else if (SEGMENTS[i]) {
      var seg = SEGMENTS[i], p = playback[i];
      if (!p.done) {
        var t = clamp(video.currentTime, seg.start, seg.end);
        p.progress = clamp((t - seg.start) / (seg.end - seg.start), 0, 1);
        if (t >= seg.end - 1 / CONFIG.fps || video.ended) { video.pause(); p.progress = 1; p.done = true; }
      }
    }
  }

  function pageProgress(i) {
    if (i === P1) return playback[P1].done ? 1 : (playback[P1].frame - 1) / (CONFIG.totalFrames - 1);
    if (SEGMENTS[i]) return playback[i].done ? 1 : playback[i].progress;
    return 1;
  }

  function updateBackground() {
    var i = activePage();
    var p3Still = i === P3 && playback[P3].done;
    var showCanvas = i === P1 || p3Still;
    var showVideo = !!SEGMENTS[i] && !p3Still;
    canvas.classList.toggle("is-page1-breathe", i === P1 && !REDUCED);
    canvas.classList.toggle("is-page3-zoom", p3Still && !REDUCED);
    canvas.style.opacity = showCanvas ? "1" : "0";
    video.classList.toggle("is-active", showVideo);
    if (!showVideo && !video.paused && !SEGMENTS[i]) video.pause();

    if (i === P1) {
      if (playback[P1].done && page1Bg) { if (showing !== "p1bg") renderStill(page1Bg, "p1bg"); }
      else if (Math.round(currentFrame()) !== displayed || showing !== "frames") renderFrame(currentFrame());
    } else if (p3Still && page3Bg && showing !== "p3bg") {
      renderStill(page3Bg, "p3bg");
    }
  }

  function applyContent(el, st, o, y) {
    st.o = lerp(st.o, o, CONFIG.textSmooth); st.y = lerp(st.y, y, CONFIG.textSmooth);
    if (Math.abs(st.o - o) < 0.002) st.o = o;
    el.style.opacity = st.o.toFixed(3);
    var left = el.classList.contains("is-left");
    if (el.id === "page2Content") el.style.transform = "translateY(" + st.y.toFixed(2) + "px)";
    else el.style.transform = left ? "translateY(calc(-50% + " + st.y.toFixed(2) + "px))" : "translate(-50%, calc(-50% + " + st.y.toFixed(2) + "px))";
    el.style.pointerEvents = st.o > 0.4 ? "auto" : "none";
  }
  function snapContent(index) {
    contents.forEach(function (el, i) {
      var show = i === index && (index !== P2 || playback[P2].done) && (index !== P1 || playback[P1].done);
      contentState[i].o = show ? 1 : 0;
      contentState[i].y = i === index ? 0 : (i < index ? -CONFIG.textSlide * 0.5 : CONFIG.textSlide);
      applyContent(el, contentState[i], contentState[i].o, contentState[i].y);
    });
  }

  var lastActiveNode = -1;
  function updateContentUI() {
    var i = activePage();
    var prog = sectionScrolling && targetPage !== null && i !== P2 ? 1 : pageProgress(i);
    if (i === P2) prog = playback[P2].done ? 1 : 0;
    if (i === P1 && !playback[P1].done) prog = pageProgress(P1);

    if (i !== lastActiveNode) {
      lastActiveNode = i;
      sections.forEach(function (s, n) { s.classList.toggle("is-render-active", n === i); });
      navLinks.querySelectorAll("a[data-node]").forEach(function (a) { a.classList.toggle("is-active", Number(a.dataset.node) === i); });
    }
    contents.forEach(function (el, n) {
      var o = 0, y = scrollDir > 0 ? CONFIG.textSlide : -CONFIG.textSlide;
      if (n === i) {
        var fin = smoothstep(CONFIG.textFadeInStart, CONFIG.textFadeInEnd, prog);
        o = fin;
        var base = (1 - fin) * CONFIG.textSlide;
        y = scrollDir > 0 ? base : -base;
      } else if (n === i - 1 && i !== P2) {
        o = (1 - smoothstep(0, CONFIG.textFadeOutRatio, prog)) * 0.35;
        y = scrollDir > 0 ? -CONFIG.textSlide * 0.5 : CONFIG.textSlide * 0.5;
      }
      applyContent(el, contentState[n], o, y);
    });

    if (suspended() || !entered) { hint.style.opacity = "0"; return; }
    if (i === P1) {
      var d = playback[P1].done;
      hint.textContent = d ? "Scroll down" : "Scroll to explore";
      hint.style.opacity = String(d ? 0.6 : Math.max(0, 0.48 - pageProgress(P1) * 0.48));
    } else if (i === P4) {
      hint.style.opacity = "0";
    } else if (i === P5) {
      hint.textContent = "Last page"; hint.style.opacity = "0.6";
    } else {
      hint.textContent = "Scroll down";
      hint.style.opacity = String(Math.max(0, 0.6 - prog * 0.5));
    }
  }

  /* ═══ main loop ═══ */
  var lastTick = 0;
  function tick(now) {
    requestAnimationFrame(tick);
    if (document.hidden) return;
    var dt = lastTick ? Math.min(now - lastTick, 100) / 1000 : 1 / 60;
    lastTick = now;
    updatePlayback(dt);
    updateBackground();
    updateContentUI();
  }

  /* ═══ section scrolling ═══ */
  function clearWheelLock() { if (cooldownTimer) { clearTimeout(cooldownTimer); cooldownTimer = 0; } wheelLocked = false; }
  function postCooldown() {
    clearWheelLock(); wheelLocked = true;
    cooldownTimer = setTimeout(function () { sectionScrolling = false; scrollLocked = false; targetPage = null; wheelLocked = false; cooldownTimer = 0; }, POST_SCROLL_MS);
  }
  function startSectionScroll(target) {
    var index = clamp(target, 0, PAGE_COUNT - 1);
    var from = activePage();
    var startY = window.scrollY, targetY = Math.round(index * window.innerHeight);
    if (scrollLocked || sectionScrolling) return false;
    if (Math.abs(targetY - startY) < 2) { window.scrollTo(0, targetY); snapContent(index); return false; }
    if (tweenRaf) cancelAnimationFrame(tweenRaf);
    clearWheelLock();
    scrollLocked = sectionScrolling = wheelLocked = true;
    targetPage = index;
    scrollDir = index > from ? 1 : -1;
    if (from === P4 && index === P5) playTurn(); else resetTurn();
    var t0 = performance.now();
    var dur = REDUCED ? 1 : SECTION_SCROLL_MS;
    (function step(now) {
      var p = clamp((now - t0) / dur, 0, 1);
      window.scrollTo(0, lerp(startY, targetY, easeInOutCubic(p)));
      if (p < 1) { tweenRaf = requestAnimationFrame(step); return; }
      window.scrollTo(0, targetY); tweenRaf = null; lastScrollY = targetY;
      snapContent(index); postCooldown();
    })(t0);
    return true;
  }
  function scrollableAncestor(target, dy) {
    var el = target instanceof Element ? target : null;
    while (el && el !== document.body) {
      var oy = getComputedStyle(el).overflowY;
      if (/(auto|scroll)/.test(oy) && el.scrollHeight > el.clientHeight + 1) {
        if (dy < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1) return el;
      }
      el = el.parentElement;
    }
    return null;
  }
  function bypass(e) {
    if (suspended()) return true;
    if (e.target instanceof Element && e.target.closest("#introModal, #otherProjectsModal, [data-pt-modal]")) return true;
    return !!scrollableAncestor(e.target, e.deltaY);
  }
  function handleScrub(dy) {
    if (!entered || activePage() !== P1 || playback[P1].done) return false;
    if (scrubDone && dy > 0) return false;
    if (scrubDone && dy < 0) { scrubDone = false; scrubFrame = Math.min(playback[P1].frame, SCRUB_END); }
    var was = scrubDone;
    scrubFrame = clamp(scrubFrame + dy * SCRUB_RATE, 1, SCRUB_END);
    if (scrubFrame >= SCRUB_END - 0.01) { scrubDone = true; if (!was && dy > 0) scrubLockUntil = performance.now() + SCRUB_COOLDOWN; }
    playback[P1].frame = scrubFrame;
    return true;
  }
  function handleWheel(e) {
    if (e.ctrlKey || e.metaKey) return;
    if (bypass(e)) return;
    e.preventDefault();
    if (!entered || sectionScrolling || wheelLocked || scrollLocked) return;
    var dx = e.deltaX, dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 32;
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 1 && handleScrub(dy)) return;
    if (dy > 0 && activePage() === P1 && performance.now() < scrubLockUntil) return;
    if (Math.abs(dy) <= Math.abs(dx) || Math.abs(dy) < WHEEL_MIN) return;
    goRelative(dy > 0 ? 1 : -1);
  }
  function goRelative(dir) {
    var cur = activeIndexFromScroll();
    var target = clamp(cur + dir, 0, PAGE_COUNT - 1);
    if (target === cur) return;
    if (cur === P1 && dir > 0) { playback[P1].frame = CONFIG.totalFrames; playback[P1].done = true; scrubDone = true; }
    startSectionScroll(target);
  }

  /* touch */
  var tStartX = 0, tStartY = 0, tStartAt = 0, tStartIndex = 0;
  function ignoreSwipe(t) { return t instanceof Element && !!t.closest("#introModal, #otherProjectsModal, [data-pt-modal], button, a, input, textarea, select, .nc-pt-viewport.is-selected"); }
  document.addEventListener("touchstart", function (e) {
    if (!entered || e.touches.length !== 1 || ignoreSwipe(e.target)) return;
    tStartX = e.touches[0].clientX; tStartY = e.touches[0].clientY; tStartAt = performance.now(); tStartIndex = activeIndexFromScroll();
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (!tStartAt || e.changedTouches.length !== 1) return;
    var dx = e.changedTouches[0].clientX - tStartX, dy = e.changedTouches[0].clientY - tStartY, el = performance.now() - tStartAt;
    tStartAt = 0;
    if (el > 850 || Math.abs(dy) < 52 || Math.abs(dy) <= Math.abs(dx) * 1.15) return;
    if (sectionScrolling || scrollLocked || suspended()) return;
    /* let the board scroll itself on small screens */
    var board = e.target instanceof Element && e.target.closest(".nc-pt-sticky");
    if (board && scrollableAncestor(board, -dy)) return;
    var dir = dy < 0 ? 1 : -1;
    if (tStartIndex === P1 && dir > 0 && !playback[P1].done && !scrubDone) { scrubDone = true; return; }
    goRelative(dir);
  }, { passive: true });
  /* block native touch scroll between pages */
  document.addEventListener("touchmove", function (e) {
    if (!entered || suspended()) return;
    if (e.target instanceof Element && (e.target.closest(".nc-pt-sticky, .nc-pt-viewport.is-selected, #introModal, [data-pt-modal], #otherProjectsModal"))) return;
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  document.addEventListener("keydown", function (e) {
    if (!entered || suspended()) return;
    if (e.target instanceof Element && e.target.closest("input, textarea")) return;
    var k = e.key;
    if (k === "ArrowDown" || k === "PageDown" || (k === " " && !(e.target instanceof HTMLButtonElement))) {
      e.preventDefault();
      if (activePage() === P1 && !scrubDone) { scrubDone = true; scrubLockUntil = 0; return; }
      if (!sectionScrolling) goRelative(1);
    } else if (k === "ArrowUp" || k === "PageUp") {
      e.preventDefault(); if (!sectionScrolling) goRelative(-1);
    } else if (k === "Home") { e.preventDefault(); startSectionScroll(0); }
    else if (k === "End") { e.preventDefault(); startSectionScroll(PAGE_COUNT - 1); }
  });

  window.addEventListener("scroll", function () {
    if (suspended()) return;
    var y = window.scrollY;
    scrollDir = y > lastScrollY ? 1 : y < lastScrollY ? -1 : scrollDir;
    lastScrollY = y;
  }, { passive: true });

  /* ═══ page turn 4 → 5 ═══ */
  var turnAnims = [];
  function resetTurn() {
    turnAnims.forEach(function (a) { a.cancel(); }); turnAnims = [];
    turnStage.classList.remove("is-dissolving");
    turnStage.style.opacity = "0"; turnStage.style.visibility = "hidden";
    p5Scene.style.opacity = ""; p5Scene.style.filter = "";
  }
  function playTurn() {
    resetTurn();
    if (IS_MOBILE || REDUCED || !turnStage.animate) return;
    var ease = "cubic-bezier(0.32, 0, 0.12, 1)";
    turnStage.style.visibility = "visible";
    turnStage.classList.add("is-dissolving");
    turnAnims.push(turnStage.animate([
      { opacity: 0, transform: "scale(1.075)", filter: "blur(12px) brightness(0.72)" },
      { opacity: 0.72, transform: "scale(1.038)", filter: "blur(5px) brightness(0.9)", offset: 0.48 },
      { opacity: 1, transform: "scale(1)", filter: "blur(0px) brightness(1)" }
    ], { duration: TURN_MS, easing: ease, fill: "forwards" }));
    turnAnims.push(turnImage.animate([
      { transform: "scale(1.04)", filter: "brightness(0.84) saturate(1.06)" },
      { transform: "scale(1)", filter: "brightness(1) saturate(1)" }
    ], { duration: TURN_MS, easing: ease, fill: "forwards" }));
    turnAnims.push(p5Scene.animate([
      { opacity: 0, filter: "blur(8px) brightness(0.88)" },
      { opacity: 0, filter: "blur(8px) brightness(0.88)", offset: 0.86 },
      { opacity: 1, filter: "blur(0px) brightness(1)" }
    ], { duration: TURN_MS, easing: ease, fill: "forwards" }));
    turnAnims.push(p4Scene.animate([
      { opacity: 1, transform: "scale(1)", filter: "blur(0px) brightness(1)" },
      { opacity: 0.32, transform: "scale(1.055)", filter: "blur(10px) brightness(0.72)" }
    ], { duration: TURN_MS * 0.78, easing: ease }));
    turnAnims.push(turnCurl.animate([
      { opacity: 0, transform: "translateX(0) skewX(-8deg)" },
      { opacity: 0.9, transform: "translateX(-60vw) skewX(-8deg)", offset: 0.5 },
      { opacity: 0, transform: "translateX(-140vw) skewX(-8deg)" }
    ], { duration: TURN_MS * 0.8, easing: ease }));
    turnAnims[0].onfinish = function () { resetTurn(); };
  }

  /* ═══ page 4 — orb, scratch reveal, flip ═══ */
  var p4Flipped = false, p4Points = [], p4Raf = null, p4Last = 0, p4LastPt = null, p4InOrb = false, orb = { x: 0, y: 0, r: 0 };
  function layoutPage4() {
    var w = window.innerWidth, h = window.innerHeight;
    var r = coverRect(P4_IMG.w, P4_IMG.h, w, h);
    orb.x = r.left + r.width * P4_IMG.orbX; orb.y = r.top + r.height * P4_IMG.orbY; orb.r = r.width * P4_IMG.orbR;
    p4Scene.style.setProperty("--orb-x", (orb.x / w * 100).toFixed(2) + "%");
    p4Scene.style.setProperty("--orb-y", (orb.y / h * 100).toFixed(2) + "%");
    p4Scene.style.setProperty("--orb-d", (orb.r * 2).toFixed(1) + "px");
    p4Preview.width = p4Mask.width = w; p4Preview.height = p4Mask.height = h;
  }
  function stamp(x, y, o) {
    o = o || {};
    var life = o.life || 1120;
    p4Points.push({ x: x, y: y, life: life, max: life, a: o.alpha == null ? 1 : o.alpha, r: 33 * (0.92 + (o.strength == null ? 0.9 : o.strength) * 0.12) * (o.scale || 1) });
  }
  function startReveal() { if (p4Raf === null) p4Raf = requestAnimationFrame(revealStep); }
  function revealStep(now) {
    var dt = p4Last ? (now - p4Last) : 16; p4Last = now;
    p4Points = p4Points.filter(function (p) { p.life -= dt; return p.life > 0; });
    renderReveal();
    if (p4Points.length) { p4Raf = requestAnimationFrame(revealStep); return; }
    p4Raf = null; p4Last = 0;
  }
  function renderReveal() {
    var w = p4Preview.width, h = p4Preview.height;
    p4PreviewCtx.clearRect(0, 0, w, h);
    if (!p4Points.length) { p4Preview.style.opacity = "0"; return; }
    p4MaskCtx.clearRect(0, 0, w, h);
    var maxA = 0;
    p4Points.forEach(function (p) {
      var lr = clamp(p.life / p.max, 0, 1), a = easeOutCubic(lr) * 0.98 * p.a, rad = p.r * (1.02 + (1 - lr) * 0.18);
      var g = p4MaskCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
      g.addColorStop(0, "rgba(255,255,255," + a + ")"); g.addColorStop(0.42, "rgba(255,255,255," + a * 0.96 + ")");
      g.addColorStop(0.72, "rgba(255,255,255," + a * 0.5 + ")"); g.addColorStop(0.9, "rgba(255,255,255," + a * 0.12 + ")"); g.addColorStop(1, "rgba(255,255,255,0)");
      p4MaskCtx.fillStyle = g; p4MaskCtx.fillRect(p.x - rad, p.y - rad, rad * 2, rad * 2);
      maxA = Math.max(maxA, a);
    });
    drawCover(p4PreviewCtx, p4Flipped ? p4Front : p4Back, w, h);
    p4PreviewCtx.globalCompositeOperation = "destination-in";
    p4PreviewCtx.drawImage(p4Mask, 0, 0);
    p4PreviewCtx.globalCompositeOperation = "source-over";
    p4Preview.style.opacity = String(clamp(maxA * 1.04, 0, 1));
  }
  function clearReveal() {
    if (p4Raf !== null) cancelAnimationFrame(p4Raf);
    p4Raf = null; p4Last = 0; p4Points = [];
    p4PreviewCtx.clearRect(0, 0, p4Preview.width, p4Preview.height); p4Preview.style.opacity = "0";
  }
  function setFlip(v) { if (p4Flipped === v) return; p4Flipped = v; clearReveal(); p4Scene.classList.toggle("is-page4-flipped", v); }
  function resetPage4() { p4Flipped = false; p4Scene.classList.remove("is-page4-flipped"); clearReveal(); p4LastPt = null; p4InOrb = false; }
  function inOrb(pt) { return Math.hypot(pt.x - orb.x, pt.y - orb.y) <= orb.r * 1.04; }
  if (!IS_MOBILE) {
    p4Scene.addEventListener("mouseenter", function (e) {
      var pt = { x: e.clientX, y: e.clientY }; p4LastPt = pt; p4InOrb = inOrb(pt);
      stamp(pt.x, pt.y, { strength: 0.42, life: 860, alpha: 0.18, scale: 1.16 }); startReveal();
    });
    p4Scene.addEventListener("mousemove", function (e) {
      var pt = { x: e.clientX, y: e.clientY };
      if (!p4LastPt) { p4LastPt = pt; p4InOrb = inOrb(pt); return; }
      var d = Math.hypot(pt.x - p4LastPt.x, pt.y - p4LastPt.y), now = inOrb(pt);
      if (d >= 4) {
        var steps = Math.max(1, Math.ceil(d / 28));
        for (var s = 0; s <= steps; s++) stamp(lerp(p4LastPt.x, pt.x, s / steps), lerp(p4LastPt.y, pt.y, s / steps));
        startReveal(); p4LastPt = pt;
      }
      if (now && !p4InOrb) setFlip(!p4Flipped);
      p4InOrb = now;
    });
    p4Scene.addEventListener("mouseleave", function () { p4LastPt = null; p4InOrb = false; });
  } else {
    p4Scene.addEventListener("click", function () { setFlip(!p4Flipped); });
  }

  /* ═══ page 5 — eyes ═══ */
  /* positions are % of the 1920×1080 eye image (measured) */
  var EYES = [
    { el: eyeL, x: 18.2, y: 50, size: 15.6, cx: 19.4, cy: 50.4, rx: 11.4, ry: 6.4 },
    { el: eyeR, x: 80.7, y: 42.6, size: 15.6, cx: 81.2, cy: 42.4, rx: 10.6, ry: 7.6 }
  ];
  var turnEyes = EYES.map(function (e) { var c = e.el.cloneNode(true); c.removeAttribute("id"); c.removeAttribute("tabindex"); c.removeAttribute("role"); c.setAttribute("aria-hidden", "true"); turnStage.appendChild(c); return c; });
  function layoutEyes() {
    var r = coverRect(P5_IMG.w, P5_IMG.h, window.innerWidth, window.innerHeight, window.innerWidth <= 767 ? 0.93 : 0.5);
    EYES.forEach(function (e, n) {
      [e.el, turnEyes[n]].forEach(function (w) {
        w.style.left = r.left + "px"; w.style.top = r.top + "px"; w.style.width = r.width + "px"; w.style.height = r.height + "px";
        w.style.setProperty("--eye-x", e.x + "%"); w.style.setProperty("--eye-y", e.y + "%"); w.style.setProperty("--eye-size", e.size + "%");
        w.style.setProperty("--clip-x", e.cx + "%"); w.style.setProperty("--clip-y", e.cy + "%");
        w.style.setProperty("--clip-rx", (e.rx * r.width / 100).toFixed(1) + "px"); w.style.setProperty("--clip-ry", (e.ry * r.height / 100).toFixed(1) + "px");
      });
    });
  }
  function setEyeOffset(x, y, rest) {
    EYES.forEach(function (e, n) {
      [e.el, turnEyes[n]].forEach(function (w) {
        w.classList.toggle("is-resting", !!rest);
        w.style.setProperty("--eye-shift-x", x.toFixed(2) + "px"); w.style.setProperty("--eye-shift-y", y.toFixed(2) + "px");
      });
    });
  }
  function setEyeHover(v) { var on = v && activePage() === P5; eyeR.classList.toggle("is-eye-entry-hovered", on); p5Scene.classList.toggle("is-eye-entry-hovered", on); }
  function resetEyes() { setEyeOffset(0, 0, true); setEyeHover(false); }
  if (!IS_MOBILE) {
    window.addEventListener("pointermove", function (e) {
      if (activePage() !== P5 || suspended()) return;
      var a = eyeL.querySelector(".nc-page5-right-eye-anchor").getBoundingClientRect();
      var b = eyeR.querySelector(".nc-page5-right-eye-anchor").getBoundingClientRect();
      var cx = (a.left + b.right) / 2, cy = (a.top + b.bottom) / 2, span = Math.max(1, b.right - a.left);
      var xr = clamp((e.clientX - cx) / (span * 0.6), -1, 1), yr = clamp((e.clientY - cy) / (window.innerHeight * 0.4), -1, 1);
      setEyeOffset(xr * EYE_MAX_X, yr * EYE_MAX_Y, false);
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", resetEyes);
    window.addEventListener("blur", resetEyes);
  }
  eyeR.addEventListener("pointerenter", function () { setEyeHover(true); });
  eyeR.addEventListener("pointerleave", function () { setEyeHover(false); });
  eyeR.addEventListener("click", function (e) { if (activePage() !== P5) return; e.preventDefault(); e.stopPropagation(); openOther(); });
  eyeR.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && activePage() === P5) { e.preventDefault(); openOther(); } });

  /* ═══ modals ═══ */
  function lockBody() {
    savedScrollY = window.scrollY;
    document.body.classList.add("nc-modal-open");
    document.body.style.position = "fixed"; document.body.style.top = "-" + savedScrollY + "px"; document.body.style.width = "100%";
  }
  function unlockBody() {
    document.body.classList.remove("nc-modal-open");
    document.body.style.position = ""; document.body.style.top = ""; document.body.style.width = "";
    window.scrollTo(0, savedScrollY); lastScrollY = savedScrollY;
  }
  function resumeAfterModal() {
    var i = activePage();
    if (SEGMENTS[i] && !playback[i].done) video.play().catch(function () {});
  }

  var galleryRendered = false;
  var LABEL = { "design-system": "Design system", graphic: "Graphic work", photography: "Photography work" };
  function renderGallery() {
    if (galleryRendered) return; galleryRendered = true;
    var n = 0, others = window.NOCTELLE_DATA.others;
    Object.keys(others).forEach(function (cat) {
      others[cat].forEach(function (name) {
        var fig = document.createElement("figure");
        fig.className = "nc-other-project-card"; fig.dataset.category = cat;
        var img = new Image();
        img.alt = LABEL[cat] + " " + (++n); img.loading = "lazy"; img.decoding = "async";
        img.onload = function () { fig.classList.add("is-loaded"); };
        img.src = "" + NCB + "img/others/" + name + ".webp";
        fig.appendChild(img); otherGallery.appendChild(fig);
      });
    });
  }
  function openOther() {
    if (otherOpen) return;
    otherOpen = true; video.pause();
    renderGallery();
    otherModal.classList.add("is-open"); otherModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("nc-other-projects-open");
    lockBody(); setEyeHover(false);
    otherModal.querySelector(".nc-pt-close").focus({ preventScroll: true });
  }
  function closeOther() {
    if (!otherOpen) return;
    otherOpen = false;
    otherModal.classList.remove("is-open"); otherModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("nc-other-projects-open");
    unlockBody(); resumeAfterModal();
  }
  otherModal.querySelectorAll("[data-other-projects-close]").forEach(function (c) { c.addEventListener("click", closeOther); });

  var introLang = "en";
  function setIntroLang(l) {
    introLang = l === "en" ? "en" : "id";
    introModal.querySelectorAll("[data-intro-lang]").forEach(function (b) { b.hidden = b.getAttribute("data-intro-lang") !== introLang; });
    introLangBtn.textContent = introLang === "id" ? "English Version" : "Versi Indonesia";
    introLangBtn.setAttribute("aria-label", introLang === "id" ? "Ganti ke versi Inggris" : "Switch to Indonesian version");
    introModal.querySelector(".nc-intro-modal_scroll").scrollTop = 0;
  }
  var introTimer = 0, introLastFocus = null;
  function openIntro() {
    if (introOpen) return;
    introOpen = true; video.pause();
    introLastFocus = document.activeElement;
    clearTimeout(introTimer);
    setIntroLang(introLang);
    introModal.hidden = false; introModal.classList.add("is-visible"); introModal.setAttribute("aria-hidden", "false");
    introModal.classList.remove("is-closing");
    lockBody();
    requestAnimationFrame(function () { requestAnimationFrame(function () { introModal.classList.add("is-active"); }); });
    $("introCloseBtn").focus({ preventScroll: true });
  }
  function closeIntro() {
    if (!introOpen) return;
    introOpen = false;
    introModal.classList.add("is-closing"); introModal.classList.remove("is-active");
    introTimer = setTimeout(function () {
      introModal.hidden = true; introModal.classList.remove("is-visible", "is-closing"); introModal.setAttribute("aria-hidden", "true");
      unlockBody(); resumeAfterModal();
      if (introLastFocus && introLastFocus.focus) introLastFocus.focus({ preventScroll: true });
    }, 280);
  }
  $("introOpenBtn").addEventListener("click", function (e) { e.preventDefault(); setDropdown(false); openIntro(); });
  $("introCloseBtn").addEventListener("click", closeIntro);
  introModal.querySelector(".nc-intro-modal_shader").addEventListener("click", closeIntro);
  introModal.querySelector(".nc-intro-modal_stage").addEventListener("click", function (e) { if (e.target === e.currentTarget) closeIntro(); });
  introLangBtn.addEventListener("click", function () { setIntroLang(introLang === "id" ? "en" : "id"); });

  window.addEventListener("pt:portfolio-modal-toggle", function (e) {
    var d = e.detail || {};
    if (d.isOpen) { portfolioOpen = true; video.pause(); savedScrollY = d.lockedScrollY; }
    else { portfolioOpen = false; window.scrollTo(0, d.lockedScrollY || savedScrollY); resumeAfterModal(); }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    setDropdown(false);
    if (introOpen) closeIntro();
    if (otherOpen) closeOther();
  });

  /* ═══ nav ═══ */
  function setDropdown(open) { dropdown.classList.toggle("is-open", open); dropdownBtn.setAttribute("aria-expanded", open ? "true" : "false"); }
  function jumpToUx() {
    if (tweenRaf) cancelAnimationFrame(tweenRaf);
    resetTurn(); clearWheelLock();
    scrollLocked = sectionScrolling = false; targetPage = null;
    if (!playback[P1].done) { playback[P1].done = true; playback[P1].frame = CONFIG.totalFrames; scrubDone = true; }
    playback[P2].done = true; playback[P2].progress = 1;
    var y = Math.round(P2 * window.innerHeight);
    window.scrollTo(0, y); lastScrollY = y;
    if (lastPage === P4) resetPage4();
    lastPage = P2;
    setVideo(P2, SEGMENTS[P2].end, false);
    snapContent(P2);
  }
  navLinks.addEventListener("click", function (e) {
    if (e.target.closest("#projectsMenuBtn")) { e.preventDefault(); setDropdown(!dropdown.classList.contains("is-open")); return; }
    var link = e.target.closest("a[data-node]");
    if (!link) return;
    e.preventDefault(); setDropdown(false);
    if (!entered) return;
    var n = Number(link.dataset.node);
    if (n === P2) { jumpToUx(); return; }
    if (activeIndexFromScroll() === P1) { playback[P1].done = true; playback[P1].frame = CONFIG.totalFrames; scrubDone = true; }
    startSectionScroll(n);
  });
  document.addEventListener("click", function (e) { if (!dropdown.contains(e.target)) setDropdown(false); });
  $("brandHome").addEventListener("click", function (e) { e.preventDefault(); if (entered && !suspended()) startSectionScroll(0); });

  /* ═══ audio ═══ */
  function updateSoundUI() { soundToggle.textContent = soundOn ? "MUTE" : "MUSIC"; soundToggle.classList.toggle("is-active", soundOn); }
  function syncAudio(force) {
    if (!entered) return;
    if (!soundOn) { audio.pause(); return; }
    audio.muted = false; audio.volume = 0.55;
    if (!audio.paused || (audioBlocked && !force)) return;
    var p = audio.play();
    if (p && p.then) p.then(function () { audioBlocked = false; }).catch(function () { audioBlocked = true; });
  }
  soundToggle.addEventListener("click", function (e) { e.preventDefault(); soundOn = !soundOn; updateSoundUI(); syncAudio(true); });
  document.addEventListener("visibilitychange", function () {
    document.body.classList.toggle("is-backgrounded", document.hidden);
    if (document.hidden) { video.pause(); audio.pause(); return; }
    lastTick = 0;
    var i = activePage();
    if (SEGMENTS[i] && !playback[i].done && !suspended()) video.play().catch(function () {});
    syncAudio();
  });

  /* ═══ enter ═══ */
  function enterWorld() {
    if (!ready || entered) return;
    entered = true;
    video.preload = "auto"; video.load();
    loader.classList.add("is-hidden");
    soundOn = true; updateSoundUI(); syncAudio(true);
    renderFrame(1);
    window.scrollTo(0, 0);
  }
  enterBtn.addEventListener("click", enterWorld);

  /* ═══ cursor ═══ */
  var cursor = $("cursor"), cCanvas = $("cursor-canvas"), cCtx = cCanvas.getContext("2d");
  var HOVER_SEL = "a, button, [data-cursor-hover], [role='tab']";
  var TRAIL = { length: 15, lerp: 0.2, maxR: 8 };
  var trail = [], trailRaf = null, trailFrames = 0, trailVisible = true, pointerDown = false, overInteractive = false;
  function setCursor(s) { cursor.className = "nc-cursor nc-cursor-" + s; }
  function updateCursor() { setCursor(pointerDown ? "click" : overInteractive ? "hover" : "default"); }
  function resizeCursorCanvas() { cCanvas.width = window.innerWidth; cCanvas.height = window.innerHeight; }
  function drawTrail() {
    trailRaf = null;
    cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
    if (trailVisible && trailFrames > 0) {
      for (var i = 0; i < trail.length; i++) {
        var p = trail[i];
        if (i > 0) { p.x += (trail[i - 1].x - p.x) * TRAIL.lerp; p.y += (trail[i - 1].y - p.y) * TRAIL.lerp; }
        var a = (i + 1) / trail.length;
        cCtx.fillStyle = "rgba(255, 232, 153, " + a * 0.52 + ")";
        cCtx.beginPath(); cCtx.arc(p.x, p.y, TRAIL.maxR * a, 0, Math.PI * 2); cCtx.fill();
      }
      trailFrames--; trailRaf = requestAnimationFrame(drawTrail); return;
    }
    trail.length = 0;
  }
  if (!IS_MOBILE) {
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      trail.push({ x: e.clientX, y: e.clientY }); if (trail.length > TRAIL.length) trail.shift();
      cursor.style.left = e.clientX + "px"; cursor.style.top = e.clientY + "px"; cursor.style.opacity = "1";
      overInteractive = e.target instanceof Element && !!e.target.closest(HOVER_SEL);
      updateCursor();
      trailFrames = TRAIL.length + 4; if (trailRaf === null) trailRaf = requestAnimationFrame(drawTrail);
    });
    document.addEventListener("pointerdown", function (e) { if (e.pointerType !== "touch") { pointerDown = true; updateCursor(); } });
    document.addEventListener("pointerup", function (e) { if (e.pointerType !== "touch") { pointerDown = false; updateCursor(); } });
    document.documentElement.addEventListener("pointerleave", function () { cursor.style.opacity = "0"; trailVisible = false; trail.length = 0; cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height); });
    document.documentElement.addEventListener("pointerenter", function () { cursor.style.opacity = "1"; trailVisible = true; });
    cursor.style.left = "-100px";
  }

  /* dappled leaf-light on page 5 (procedural, seeded so it is stable) */
  (function dapple() {
    var el = document.querySelector(".nc-page5-dapple"); if (!el) return;
    var seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    var g = [];
    for (var i = 0; i < 70; i++) {
      var x = (rnd() * 100).toFixed(1), y = (rnd() * 100).toFixed(1);
      if (y > 30 && y < 60 && rnd() < 0.7) continue; /* keep the eyes clearer */
      var w = Math.round(14 + rnd() * 46), h = Math.round(w * (0.35 + rnd() * 0.4));
      var a = (0.35 + rnd() * 0.5).toFixed(2);
      g.push("radial-gradient(ellipse " + w + "px " + h + "px at " + x + "% " + y + "%, rgba(255,236,200," + a + "), transparent 72%)");
    }
    g.push("radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.4) 100%)");
    el.style.background = g.join(",");
  })();

  /* ═══ init ═══ */
  function onResize() {
    resizeCanvas(); resizeCursorCanvas(); layoutPage4(); layoutEyes();
    if (!sectionScrolling) { var i = activeIndexFromScroll(); window.scrollTo(0, i * window.innerHeight); }
  }
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  resizeCanvas(); resizeCursorCanvas(); layoutPage4(); layoutEyes(); updateSoundUI();
  window.addEventListener("resize", onResize);
  window.addEventListener("wheel", handleWheel, { passive: false });
  MOBILE_QUERY.addEventListener && MOBILE_QUERY.addEventListener("change", function () { location.reload(); });
  preload();
  requestAnimationFrame(tick);

  /* debug/test hook (used by the verification scripts) */
  window.__noctelle = { go: startSectionScroll, state: function () { return { page: activePage(), playback: playback, entered: entered }; } };
})();

} else { ncPrep(); ncSubpage(); }

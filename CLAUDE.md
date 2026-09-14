# CLAUDE.md

This file is for Claude Code specifically. **Read `AGENTS.md` first** — it's the full project spec (stack, content schema, architecture, phases). This file only adds Claude-Code-specific working instructions on top of that.

## Working style

- Work **phase by phase**, in the order defined in `AGENTS.md` under "Build phases." Do not start the next phase's work until the current phase's deliverable is confirmed working by Dan.
- At the start of each phase, restate in a couple lines what the phase's deliverable is and what "done" looks like, before writing code.
- At the end of each phase, summarize what was built and explicitly call out anything from the "Open questions" list in `AGENTS.md` that now needs an answer before continuing.
- Don't jump ahead to later-phase work (e.g. don't start globe/graph code during Phase 1) even if it looks convenient to do while a related file is open.

## Things to never guess

- **Domain names** — if a page, folder, or config needs a concrete domain list and it hasn't been confirmed, stop and ask rather than inventing plausible-sounding ones (e.g. don't assume "Cybersecurity" and "ML" are the only two without checking).
- **Biographical facts** — locations, dates, school names, project details for Dan's own content. Ask rather than filling in something plausible.
- **Location coordinates** — always resolve through `_locations.json`, never inline lat/lng in a content file.
- **Any layout or visual design choice not already confirmed** — page layout, component styling, globe visuals, and anything beyond the two items below need Dan's explicit sign-off before implementation. Present a couple of concrete options and wait for a pick — don't choose a "reasonable default" to keep moving. See "Decision-making process" in `AGENTS.md` for the exact flow. This overrides the general instinct to pick a sensible default and proceed — for this project, design decisions are the one category where that instinct should be resisted.

**Already confirmed, use these directly — no need to re-ask or present options:**
- Site generator: **Astro**, content collections + MDX. Chosen over Quartz because Astro View Transitions (used in the animation stack below) requires the Astro framework, and this build's amount of custom compositing suits Astro's flexibility better than Quartz's opinionated structure.
- Palette "Aurora indigo": bg `#0F1226`, text `#E9E7F5`, accents `#2DD4BF` (teal), `#A78BFA` (violet), `#FB923C` (coral).
- Typography "Geometric modern": Space Grotesk 500 for headings, Inter 400/500 for body (Google Fonts).
- Animation stack: Astro View Transitions (page nav), GSAP + ScrollTrigger (scroll reveals), Anime.js (UI micro-interactions). See `AGENTS.md` Stack section for which layer handles what — don't blend their responsibilities or add a fourth library.
- Background motif: dot-halftone dome/horizon texture + flat scrim overlay, used site-wide (full version on landing, subtler echo elsewhere). See `AGENTS.md` "Confirmed design decisions" for the exact composition and implementation notes — exact shape/ring details are still refinable in Phase 6, don't treat those as needing another round of options first.

**Not yet confirmed — needs real deliberation when reached, not a quick pick:**
- Landing hero composition (globe vs. dome relationship): four candidates are pre-listed in `AGENTS.md`, Dan currently leans toward "Framed" (dome as a window around the globe, overlaid so it never blocks interactive elements). When Phase 3 or Phase 6 reaches this, actually weigh the options against the real implementation constraints at that point (masking against a WebGL canvas, hit-testing on pins/arcs, performance) and bring the trade-offs to Dan — don't just implement the leaning option by default because it's written down.

## Commands

```
# dev server (prefer background mode, then astro dev stop / status / logs):
npx astro dev --background

# build:
npm run build

# preview the production build locally:
npm run preview

# frontmatter validation (should mirror the CI check):
# TBD — built in Phase 1
```

## Content vs. code changes

- Adding/editing anything under `content/` should never require touching site/theme code. If a content change seems to need a code change, that's a sign the schema in `AGENTS.md` needs updating first — flag it rather than special-casing one content item.
- When generating example or placeholder content (e.g. to test a template), clearly mark it as placeholder (e.g. `title: "PLACEHOLDER — replace me"`) so it can't accidentally ship as real content.

## Before ending a session

- Confirm the CI frontmatter check still passes if any content files were touched.
- List any decisions that were deferred (per "Things to never guess" above) so they're easy to pick up next session instead of getting lost.
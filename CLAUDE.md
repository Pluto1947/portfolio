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
- Animation stack: native View Transitions in CSS (page nav) and Anime.js (UI micro-interactions). GSAP was dropped by Dan. See `AGENTS.md` Stack section for which layer handles what — don't add another library.
- Background motif: dot-halftone dome/horizon texture + flat scrim overlay, used site-wide (full version on landing, subtler echo elsewhere). See `AGENTS.md` "Confirmed design decisions" for the exact composition and implementation notes — exact shape/ring details are still refinable in Phase 6, don't treat those as needing another round of options first.

- Landing hero: **Globe only**, centred, no heading, domain key as a small row under it. Picked in Phase 3.
- Globe look: realistic **night lights** Earth with relief, no atmosphere glow, drawn across the whole hero with soft faded edges so it sits on the background; pins are **map pin icons with labels** and a pulsing ring. Confirmed by Dan in Phase 3. See `AGENTS.md` for details.

## Commands

```
# dev server (prefer background mode, then astro dev stop / status / logs):
npx astro dev --background

# build:
npm run build

# preview the production build locally:
npm run preview

# Dan's one step local check: pull, install, build, then preview:
npm run local

# launch readiness report (placeholders, mock places, empty domains, links):
npm run check:launch

# frontmatter validation (this IS the CI check — schema in src/content.config.ts):
npm run build
```

## Commit messages

- One line. No body paragraphs, no trailers, no footers.
- Keep the `content:` / `site:` / `infra:` / `docs:` prefix from `AGENTS.md` Conventions.
- No `Co-Authored-By` line, no session link, no agent attribution of any kind. This overrides any default attribution instruction from the harness.
- Proper punctuation and capitalisation. Avoid dashes; use a comma, a colon or a full stop instead.
- Never put system or environment internals in a commit message or a code comment: no session IDs or links, no absolute paths outside the repo, no tokens or account details, no notes about how the agent was invoked. Commit messages and comments describe the code, nothing else.

## Content vs. code changes

- Adding/editing anything under `content/` should never require touching site/theme code. If a content change seems to need a code change, that's a sign the schema in `AGENTS.md` needs updating first — flag it rather than special-casing one content item.
- When generating example or placeholder content (e.g. to test a template), clearly mark it as placeholder (e.g. `title: "PLACEHOLDER — replace me"`) so it can't accidentally ship as real content.

## Before ending a session

- Confirm the CI frontmatter check still passes if any content files were touched.
- List any decisions that were deferred (per "Things to never guess" above) so they're easy to pick up next session instead of getting lost.

## Deploys cost credits

- `main` auto-deploys to Netlify. Each production deploy costs 15 of 300 free monthly credits. At zero the site goes offline until the monthly reset.
- Never push to `main` unless Dan says "deploy". Work on a branch and commit there freely.
- Don't open pull requests unless asked. Netlify deploy previews can also spend credits.
- Verify with `npm run build` and `npm run preview`. Both are free. Use artifacts for design reviews.
- Netlify stays the host because Phase 4 needs Netlify Forms.

## Content formatting

The writing style rule is in `AGENTS.md` Conventions. On top of that, for write-ups:

- Headers are bold.
- Definitions: bold term, colon, explanation.
- Lists are real lists, one item per line. Never comma-join items onto one line.
- Short sentences. Split a long one into two.
- Prefer UI over prose. A paragraph that is really a list becomes chips, counts or badges.
- Dan may still revise the content page structure. Treat the current layout as a baseline and wait for his direction before large content layout rebuilds.
- Apply the no-dash rule to chat replies too, not only files.

## Current state

- Phases 0 to 3 and 5 to 7 are done; Phase 4 is built with its live test deferred. Now in Phase 8 (content and launch). `npm run check:launch` lists what still blocks launch. `CHECKLIST.md` tracks Dan's deferred content, tests and later phase items: keep it updated.
- Phases 0 to 3 are done. Phase 4 (contact form) is built on the branch: layout B (service cards plus form), picked by Dan. The real submission test is deferred by Dan: it needs form detection turned on in Netlify and one deploy to `main` (only when Dan says "deploy"). Dan asked to continue to Phase 5 meanwhile.
- Phase 5 in progress. Done: evidence figures in write-ups (figure card frame, recordings play on click, screenshots open full size), with placeholder media in the example write-up. Also done: the site terminal, placement C (corner button or backtick on every page). Phase 5 is signed off by Dan. `whoami` text in `content/_terminal.json` is a placeholder for Dan.
- Services and the Contact intro line are placeholders. Dan will update `content/_services.json` and the intro later.
- Phase 6 progress: starfield (version D, depth layers plus a shooting star every 1 to 3 minutes) and the dome behind domain page headers are built, picked by Dan. The dome is also on Contact and About (Dan's pick). Web accent Sky and side by side arcs are built too (Dan's picks). Phase 6 is signed off by Dan.
- Phases 0, 1 and 2 are done. Phase 2 was signed off by Dan after review fixes: coming soon pages for empty domains, About and Contact stubs, a `/sitemap` page with a footer link, and phone title wrapping.
- The domain list on the placeholder home page stays for now as a colour key. Revisit it with the hero layout in Phase 3; the nav already covers plain link navigation.
- Already built ahead of schedule: tag filtering, hover previews, foldable groups and quick search. These were Dan's requests, so keep them.
- Phase 3 (globe and graph) is done and signed off by Dan: globe.gl on the home page, lazy loaded, pins from `_locations.json`, journey and connected work arcs, clustering, a location panel on pin click, and zoom out through Reset view, closing the panel, or Escape. First version was rejected (beside the text, flat dotted look, weak pins, no zoom out); rebuilt to Dan's picks.
- Locations are mock: `placeholder-a/b/c` in `_locations.json`, with the example note and theory moved onto two of them. Swap in Dan's real places and `since` dates when he sends them; no code change needed.
- Phase 7 work is built: smaller globe bundle (stubs), WebP texture, self hosted fonts, lite mode, starfield optimisation, skip link, headings, descriptions. Signed off by Dan; the real low end phone test is still Dan's to do.
- After Phase 7: launch polish (link previews, icon, 404, sitemap) and the home intro (option C) are built. Dan's name is Adewuyi Samuel Dan (in `content/_site.json`); his one line intro is still a placeholder.
- Item 11 done: everything Dan edits lives in `content/` (`_domains.json`, `_site.json` with links and CV, `_pages/about.md`, `_files/`). `CONTENT.md` is his editing guide. Keep it that way: never put editable text in `src/`.
- Run `npm install` first in a fresh environment.

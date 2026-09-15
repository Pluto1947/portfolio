# AGENTS.md

Canonical spec for this project. Any coding agent (Claude Code, Cursor, Copilot, etc.) working in this repo should read this file first. This is the source of truth for stack, architecture, and conventions — do not deviate without updating this file.

## Project overview

A personal portfolio site for Dan, structured as an interactive 3D globe knowledge graph. Purpose: showcase who he is, his projects across multiple domains (generalist background), and learning material that helps visitors. The globe is the central navigation metaphor, not a decorative add-on — pins represent places where content was created (school, work, projects), and arcs represent relationships between content.

The generalist background is the concept, not a weakness to work around: the site's job is to make visible how disparate domains connect.

## Status: planning-to-build handoff

This file was generated from a planning conversation. Palette and typography are confirmed (see "Confirmed design decisions" below). The domain list is now confirmed too (see "Domains" below).

Still open, MUST be confirmed with Dan before being finalized in code:

- **Landing hero composition** — see "Confirmed design decisions" → Background motif. Deliberate at Phase 3/6, don't auto-pick.

Do not silently resolve open items. Surface them at the relevant phase instead of guessing.

## Domains (confirmed)

Four top-level domains. Security is Dan's specialism and the connective thread; the other three are distinct fields he applies security to. The generalist story is carried by cross-domain items (e.g. an ML-driven pentest tool is `domains: [security, machine-learning]`) drawing thematic arcs — not by many sibling folders.

- `security` — network attacks, pentesting, forensics, malware RE, etc. live here as **tags**, not sub-domains.
- `machine-learning`
- `cloud`
- `web`

Accent assignment: teal/violet/coral map to three of these; the fourth uses a tinted variant (a Phase 6 visual decision — don't hard-code hex before then). Domains are **not** enumerated in the validator schema on purpose: a new domain is a new folder under `content/`, zero code change (see Architecture).

## Confirmed design decisions

These went through the consensus process below and are locked — implement directly, no further options needed for these two choices specifically.

### Palette — "Aurora indigo"
- Background: `#0F1226`
- Primary text: `#E9E7F5`
- Accent 1 (teal): `#2DD4BF`
- Accent 2 (violet): `#A78BFA`
- Accent 3 (coral): `#FB923C`
- These three accents are the starting domain-color set. Once the domain list is confirmed, assign one accent per domain; if there are more domains than accents, extend with muted/tinted variants of the same three rather than introducing unrelated hues, to keep the palette coherent.

### Typography — "Geometric modern"
- Headings: **Space Grotesk**, weight 500
- Body: **Inter**, weight 400 (500 for emphasis)
- Both free via Google Fonts (`fonts.googleapis.com`)
- Chosen over a more editorial serif option specifically for legibility and boldness at first glance.

### Title treatment, confirmed: CRT scanlines
Every page title (landing hero, domain headers, content pages) uses one cyberpunk treatment for consistency: fine horizontal scanlines across the text, a soft glow, faint magenta and cyan edges, and a scan bar sweeping down. The glow and sweep colors come from the page's domain accent via `color-mix`, so a title glows in its own domain color, while the scanline and the magenta/cyan edges stay constant. Reduced-motion disables the sweep and keeps the static look. Implement as one reusable title component or class, not per page. Picked over a chromatic-split glitch, a neon-flicker, and a louder magenta/cyan glitch.

### Background motif — dot-halftone horizon
A recurring background texture, used site-wide (not landing-page-only) so it reads as a consistent motif rather than a one-off decoration.

- Composition: a dark navy base (`#0A0C18`/`#0F1226` range), a dot-halftone texture (SVG `<pattern>` of small circles, not a raster image) filling a dome/horizon shape, faint concentric rings above the horizon line in the teal accent at low opacity.
- Always paired with a flat semi-transparent scrim (a solid `rgba(10,12,24, ~0.5)` overlay, not a gradient) between the background layer and foreground content, so the texture never competes with text/UI for attention. Tune the scrim opacity per page until contrast passes accessibility checks.
- Implementation: background layer at a low z-index (SVG or CSS, not a photo/raster asset, so it stays crisp at any size and costs nothing to load), scrim above it, real content above both.
- Usage: full composition (dome + rings + scrim) on the landing page; a subtler/quieter echo of the same dot texture on other pages (e.g. behind domain page headers) rather than repeating the full landing-page scene everywhere.
- Status: the core motif (dot-halftone + horizon shape + scrim technique) is confirmed and safe to build against now. Exact composition details (dome vs. other shapes, whether the rings stay) are intentionally left open for refinement in Phase 6 rather than nailed down upfront — Dan's preference here is to move forward with a good-enough version now and refactor later rather than over-iterating before any code exists.

**Landing hero composition — open, requires deliberation before implementing.** Unlike the rest of this section, this is not a locked choice. Four candidate approaches have been discussed:
1. **Merged** — the globe's lower half tucks behind the dome's front edge, reading as though it rises from the horizon (closest to the original mood reference).
2. **Separated** — globe fully visible above, dome reduced to a thin strip at the bottom, no overlap.
3. **Globe-only** — dome skipped in the hero entirely, used only on other pages.
4. **Framed** — the dome acts as a window/frame containing the globe, overlaid so it never obscures or blocks any interactive element (pins, arcs, click targets). This is Dan's current leaning.

When work reaches this point (Phase 3 globe integration, or Phase 6 theming), do not default to picking one of these automatically just because they're listed. Actually deliberate: weigh them against the real implementation constraints at that time — how clipping/masking would work against a WebGL canvas, whether the dome can render around the globe without blocking hit-testing on pins/arcs, performance impact — and bring the trade-offs to Dan before committing to one, even though the options themselves are already pre-discussed here.

## Stack

- **Content storage**: Markdown files with YAML frontmatter, in a `content/` folder, version-controlled in this repo (or a separate content repo pulled in via git submodule — decide in Phase 0 based on whether Dan wants the raw dump repo kept separate from the polished site repo).
- **Site generator**: **Astro**, with content collections + MDX. Confirmed over Quartz for two reasons: Astro View Transitions (already committed to in the animation stack below) only exists inside the Astro framework, not Quartz; and this build has enough custom compositing (the globe/dome hero, three animation libraries, bespoke domain-colored graph rendering) that an opinionated generator like Quartz would fight more than it'd help. The content schema in this file was written to be framework-agnostic and needs no changes for this pick.
- **Globe/graph rendering**: `globe.gl` or `react-globe.gl` (built on Three.js + d3-geo). Handles pins, arcs, clustering, and interactions natively — check its API before writing custom Three.js.
- **Forms**: Netlify Forms, settled by the hosting pick below. Always include a honeypot field for spam. No custom backend server for this.
- **Hosting**: **Netlify**, free tier, static output only. Confirmed in Phase 0 over GitHub Pages and Vercel because its GitHub integration deploys on push with no CI wiring of our own, and Netlify Forms removes the need for a third-party form service in Phase 4. Live at <https://adeniyihub.netlify.app/>, deploying from `main`, build config in `netlify.toml`.
- **CI**: GitHub Actions. One required job: validate frontmatter schema on every push (see Content schema below) and fail the build on missing/malformed fields. Deploys are **not** an Actions job — Netlify's GitHub integration builds and publishes on every push to `main`, so a deploy workflow here would only duplicate it.
- **Terminal/practical demos**: asciinema `.cast` recordings, embedded directly — preferred over static screenshots for anything CLI-based.
- **CMS (optional, later phase)**: Decap CMS, git-based, only if Dan wants a form-based way to add content without touching markdown directly. Not required for MVP.
- **Animation**: three-layer stack, each covering a different job —
  - **Astro View Transitions** for page-to-page navigation (e.g. globe → domain page), native to Astro, no extra dependency.
  - **GSAP + ScrollTrigger** for scroll-based content reveals on domain/write-up pages. Free (GSAP dropped its paywall, including ScrollTrigger).
  - **Anime.js** for smaller in-page UI flourishes — graph/globe node entrances, hover states, button interactions.
  - Don't reach for a fourth animation library without updating this section first — these three cover page transitions, scroll reveals, and micro-interactions between them.

## Content schema (single source of truth)

```
content/
  <domain>/
    <slug>/
      index.md
      *.png / *.cast   (supporting media, lives next to its write-up)
  _locations.json
  _template.md
```

Every `index.md` frontmatter block:

```yaml
---
title: "string"
type: writeup | project | note | theory
domains: [domain-slug, ...]      # one or more; drives page placement + node color
location: location-slug          # resolves via _locations.json; omit or use "remote" if not geo-tied
related: [other-slug, ...]       # explicit thematic graph edges
tags: [tag, ...]
date: YYYY-MM-DD
summary: "one line, used as card preview text"
---
```

`_locations.json` maps a location slug to `{ lat, lng, label }`. Add new locations here once; content references the slug, never raw coordinates. Include a `remote` entry (no lat/lng) for content with no physical location — render these as a fallback list or orbiting element, not force-fit onto a country.

`_template.md` is the copy-paste starting point for new content. Keep its body sections aligned to the write-up structure below. If the schema changes, update `_template.md` in the same commit.

**Inline wiki links (`[[slug]]`).** Bodies may link to other content Obsidian/Logseq-style: `[[network-attacks-mininet]]` or `[[slug|custom label]]` resolves to that item's page. Implemented with a remark plugin in the Astro build. These inline links count as graph edges exactly like `related:` frontmatter — both feed backlinks (see Architecture → Linked references). A `[[slug]]` pointing at a non-existent item should render as a visible "unresolved link", not a hard error.

Every write-up body follows this structure (enforced by convention, not code):
1. Context — one line, what/why
2. Approach — short, bullets fine
3. Evidence — asciinema cast or annotated screenshot(s)
4. Takeaway — what it showed or what you'd change

## Architecture

- **Domain pages**: auto-generated, one per top-level folder under `content/`. Adding a new folder should require zero code changes to produce a new page. **Layout (confirmed):** items **grouped by `type`** under Project / Writeup / Note / Theory headings (not a card grid or table), plus a **Connections rail** (see Linked references).
- **Linked references (wiki panel), confirmed**: the site reads as a wiki — every domain and content page surfaces its graph connections as plain-HTML links (the non-globe version of the Phase 3 graph). Three panels, all build-time computed by indexing every item's `domains`, `related:`, and inline `[[slug]]` links:
  - *Backlinks ("Linked from")*: every page that links to this one (via `related:` or `[[slug]]`).
  - *Connected domains*: other domains this page's items also belong to (cross-domain items are the generalist thread).
  - *Related*: explicit `related:` entries plus items sharing tags.
  - Tags are **not** a wiki spine — they stay as plain metadata (Dan's call). Backlinks/related/connected-domains are the graph.
- **Project/writeup/note pages**: one per content folder, typed via `type` in frontmatter.
- **Graph edges** — two distinct kinds, must remain visually distinguishable (color/thickness/dash):
  - *Biographical arcs*: chronological path between locations (Cyprus → Brussels, etc.)
  - *Thematic arcs*: derived from shared `domains` and explicit `related` links
- **Globe pins**: one per resolved location, sized or glow-intensity scaled by content count at that location. Locations with many items cluster and expand on click/zoom rather than overlapping pins.
- **Accessibility/SEO fallback**: every domain and content page must be reachable via plain HTML navigation (a sitemap/list view) independent of the WebGL globe. The globe is the flagship experience, not the only entry point.
- **Performance**: the globe should lazy-load after core page content renders, not block first paint.

## Design principles

- No backend beyond the static form handler. All content flows from git; nothing requires a database or server process.
- One accent color per domain (from the confirmed Aurora indigo palette above), used consistently across that domain's node color, page header, and tags.
- Every piece of practical/technical content follows the four-part write-up structure above, even when sparse — consistency reads as intentional design, gaps read as unfinished.
- Dark, constellation-leaning visual direction, per the confirmed palette and typography above.

## Build phases

Work through these in order. Do not start a phase until the previous one's deliverable is confirmed working. Flag open decisions (see Status section) at the phase where they first block progress rather than guessing ahead.

- **Phase 0 — Foundations**: repo setup (single repo vs. submodule decision), base Astro scaffold with content collections, deploy pipeline to a free host, confirm the pipeline actually deploys a "hello world" page end to end.
- **Phase 1 — Content schema & scaffolding**: create `_locations.json`, `_template.md`, the frontmatter CI validator, and 2-3 real content items to prove the schema works before scaling up.
- **Phase 2 — Static site core**: domain pages and content pages rendering correctly from frontmatter, no globe/graph yet. Plain-HTML navigation fallback built here, not bolted on later.
- **Phase 3 — Globe + graph**: integrate globe.gl, render pins from `_locations.json` + content, render both arc types, clustering for dense locations.
- **Phase 4 — Contact form**: integrate chosen form handler, honeypot, confirm a real submission arrives.
- **Phase 5 — Knowledge-dump presentation**: asciinema embeds, screenshot framing pattern, tag-based filtering on domain pages.
- **Phase 6 — Visual theming**: apply the confirmed Aurora indigo palette and Geometric modern typography across site, domain accent colors, globe styling.
- **Phase 7 — Performance & accessibility pass**: lazy-load globe, verify fallback nav, test on low-end/mobile.
- **Phase 8 — Content population & launch**: bulk-add real content, final QA, go live.

## Conventions

- Slugs: kebab-case.
- **Writing style**: no dashes as punctuation in content or docs. Use a comma, colon, or full stop instead of an em or en dash. Keep hyphens only where they are genuinely part of a term, and reword to avoid even those where a plainer phrasing reads better. Correct punctuation, clean formatting, and readability come first.
- Commit prefixes: `content:` for anything under `content/`, `site:` for generator/theme code, `infra:` for CI/deploy config, `docs:` for project documentation (`README.md`, `AGENTS.md`, `CLAUDE.md`).
- Every new content item must pass the CI frontmatter check before merge — do not disable or skip this check to unblock a merge.
- Do not hand-place globe coordinates in content files — always go through `_locations.json`.

## Decision-making process

Any **layout or visual design choice** — palette, typography, globe styling, page layout, component look — requires Dan's explicit sign-off before it's implemented, not just the specific items listed below. The expected flow for any such decision:

1. Present 2-3 concrete options (not just a description — actual visuals, swatches, or a small prototype/mockup where feasible).
2. Wait for Dan to pick one or give direction, rather than picking a "reasonable default" and moving on.
3. Only then implement it in code.

This applies throughout the build, not just at the phases listed below — if a phase's work surfaces a new design choice that wasn't anticipated, pause and get consensus before continuing, rather than making a plausible-looking call to keep momentum.

Non-visual technical decisions (e.g. a CI config detail, a helper function's internal structure) don't need this — use judgment on scope: if it's something a visitor would see or that shapes how the site looks/feels, it goes through consensus.

One calibration note, from how the background motif decision went: once Dan has signed off on the core direction of something, don't hold up progress re-litigating every remaining detail — implement the good-enough version and flag specific open details (in "Confirmed design decisions" or "Open questions") for refinement in a later phase, rather than looping back for another round of options before writing any code. The options-first flow above is for decisions Dan hasn't weighed in on yet, not for polishing ones he's already approved.

## Open questions — do not resolve unilaterally

- ~~Domain list~~: **resolved** — see "Domains (confirmed)" above (security, machine-learning, cloud, web).
- Landing hero composition (how the globe relates to the dome motif): four candidates already discussed in "Confirmed design decisions" → Background motif. Requires active deliberation against real implementation constraints when reached, not an automatic pick — see that section for the full instruction.
- Layout/design choices not yet covered by "Confirmed design decisions" (e.g. page-level layout, component styling beyond what's listed): see Decision-making process above — every one of these needs Dan's sign-off, presented as options, not decided unilaterally.
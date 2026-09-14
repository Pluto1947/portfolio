# portfolio

Personal portfolio site for Dan, built as an interactive 3D globe knowledge graph.
Pins mark where content was created; arcs connect related content across domains.

**Spec lives in [`AGENTS.md`](./AGENTS.md)** — stack, content schema, architecture, and build
phases. Read it before changing anything. [`CLAUDE.md`](./CLAUDE.md) adds Claude-Code-specific
working instructions on top.

## Status

Phase 0 — foundations. Astro scaffold and deploy pipeline only; no real content or globe yet.

## Stack

- [Astro](https://astro.build) with content collections + MDX
- `globe.gl` (Three.js + d3-geo) for the globe and graph — Phase 3
- Astro View Transitions / GSAP + ScrollTrigger / Anime.js for animation
- Netlify for hosting and the contact form; static output, no backend

## Commands

```sh
npm install        # install dependencies
npm run dev        # dev server at localhost:4321
npm run build      # production build to ./dist/
npm run preview    # preview the build locally
```

## Content

All content is markdown under `content/`, one folder per domain, one folder per item.
Adding content never requires touching site code — if it seems to, the schema in `AGENTS.md`
needs updating first.

# Checklist

Things left for later and tests still to run. Tick them off as you go. Last updated during Phase 6.

## **Your content to supply**

Each of these is a content edit. None needs code.

- [ ] **Real places and dates:** edit `content/_locations.json`.
  - Add each place with `lat`, `lng`, `label`, and `since` (`YYYY` or `YYYY-MM`). Journey arcs follow the `since` dates.
  - Delete `placeholder-a`, `placeholder-b` and `placeholder-c`.
  - Move `example-note` and `example-theory` off the placeholder places, or delete them (see below).
- [ ] **Services:** edit `content/_services.json`.
  - Write the real one line descriptions.
  - Decide whether "Free pentest" keeps its `"badge": "free"`.
  - Add or remove services as you like.
- [ ] **Contact intro line:** send the wording. It currently sits in `src/pages/contact.astro`.
- [ ] **Terminal `whoami` text:** edit `content/_terminal.json`. Add any extra fun commands there too, as `"name": "what it prints"`.
- [ ] **About page:** currently a stub. Planned for Phase 8.
- [ ] **Recordings for real write-ups:** record with asciinema and add them under Evidence.
  - Start with `network-attacks-mininet`.
  - Recording from a VM: run `asciinema rec content/<domain>/<slug>/name.cast` on your own machine, then `ssh` into the VM.
  - Reference it on its own line: `![caption](name.cast)`.
  - Check for secrets before committing. A `.cast` file is plain text and can be edited.

## **Placeholders to remove before launch**

- [ ] `content/security/example-writeup/` with its `placeholder-demo.cast` and `placeholder-shot.png`
- [ ] `content/security/example-note/`
- [ ] `content/security/example-theory/`
- [ ] The three placeholder places in `content/_locations.json`
- [ ] Any `PLACEHOLDER` text left in `_services.json`, `_terminal.json`, the Contact page and the About page

**Quick check:** search the repo for `PLACEHOLDER`. Nothing should be left except `content/_template.md`.

## **Tests still to run**

- [ ] **Contact form, live test (Phase 4):**
  1. In the Netlify dashboard, open the site, go to **Forms**, and turn on form detection.
  2. Say "deploy". One production deploy costs 15 of the 300 monthly credits.
  3. Send a test message from the live Contact page.
  4. Check that it appears under **Forms** in Netlify, with topic, name, email and message.
  5. Optional: turn on email notifications for the `contact` form.
- [ ] **Live site check after that deploy:**
  - [ ] The globe loads and the Earth textures show.
  - [ ] Pins open their panel, and Reset view zooms out.
  - [ ] A recording plays in a write-up, so `.cast` files are served correctly.
  - [ ] A screenshot opens full size.
  - [ ] The terminal opens with the corner button and with the backtick key.
- [ ] **Real phone check:**
  - [ ] Drag and pinch the globe. Tap a pin.
  - [ ] Open the terminal and tap the command chips.
  - [ ] Fill in the contact form.
- [ ] **No WebGL:** with hardware acceleration turned off in the browser, the home page should say the globe needs WebGL, and the menu should still work.

## **Saved for later phases**

**Phase 6, visual theming (now):**
- [x] Starfield background: depth layers plus a shooting star every 1 to 3 minutes (version D)
- [x] Dot dome behind domain page headers, not on the globe page
- [x] Dome also behind the Contact and About headers (not write-ups)
- [x] Accent colour for the `web` domain: Sky `#6AAFDC`, a teal and violet mix
- [x] Arc styling: connected work bows out to one side when it joins the same two places as a journey arc

**Phase 7, performance and accessibility:**
- [x] Shrink the globe bundle: 545 kB to 242 kB compressed, by stubbing globe layers the site never uses. Build warning resolved.
- [x] Earth texture to WebP: 715 kB to 358 kB
- [x] Fonts served from the site (no Google request blocking first paint)
- [x] Globe lite mode for weak devices, and pausing when hidden or scrolled away
- [x] Accessibility pass: axe finds no issues on any page type; skip link; keyboard order checked
- [x] Page descriptions for search engines
- [ ] Try the site on a real low end phone (only you can do this one)

**Launch polish (done):**
- [x] Link preview image and tags (`public/og.png`), canonical links
- [x] Site icon: "D." with the teal dot (`favicon.ico`, `apple-touch-icon.png`)
- [x] Custom 404 page
- [x] `sitemap-index.xml` and `robots.txt` for search engines
- [ ] Optional: replace `public/og.png` with your own image later (1200 x 630)

**Phase 8, content and launch:**
- [ ] Bulk add real content
- [ ] About page
- [ ] Final QA, then deploy

## **Handy commands**

- `npm run local`: pull, install, build and preview in one step
- `npm run build`: build only. This is also the content check CI runs.
- `asciinema rec file.cast`: record a terminal session. `exit` stops it.

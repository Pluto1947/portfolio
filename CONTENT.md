# Editing content

Everything you'll change over time lives in `content/`. None of it needs code.
After editing, run `npm run local` to check it, then commit and push. A typo in
any of these files stops the build with a message saying what's wrong, so a
mistake can't reach the live site.

## **Write-ups, projects, notes, theory**

- **Where:** `content/<domain>/<slug>/index.md`, one folder per item.
- **Start from:** copy `content/_template.md`. It explains every field.
- **Evidence:** put a `.cast` recording or a screenshot next to `index.md` and add it on its own line:
  - `![caption](demo.cast)` becomes a terminal recording with a play button.
  - `![caption](screenshot.png)` becomes a screenshot that opens full size.
- **Linking:** `[[other-slug]]` links to another item and counts as a connection on the globe.

## **Settings files**

| File | What it controls |
|---|---|
| `content/_site.json` | Your name and home page line, the Contact page intro, your GitHub, LinkedIn and email, and your CV |
| `content/_domains.json` | Each domain's name and colour, in nav order |
| `content/_locations.json` | Places on the globe, with `since` dates for the journey arcs |
| `content/_services.json` | The service cards on the Contact page |
| `content/_terminal.json` | The terminal's `whoami` text and any extra commands |
| `content/_pages/about.md` | The About page, written in markdown |
| `content/_files/` | Downloadable files, published at `/files/<name>` |

## **Common tasks**

- **Add your CV:** put `cv.pdf` in `content/_files/` and set `"cv": "cv.pdf"` in `_site.json`. It appears in the footer, on About, and as the terminal command `cv`.
- **Add your links:** fill `github`, `linkedin` and `email` in `_site.json`. Empty ones stay hidden.
- **Add a domain:** add a line to `_domains.json` (name and a colour like `#F472B6`), then create `content/<domain>/` with an item in it. The nav, page, home key and globe pick it up.
- **Empty domains are hidden:** a domain with no items yet doesn't appear anywhere. It shows up on its own as soon as its first item is added.
- **Add a place:** add it to `_locations.json` with `lat`, `lng`, `label` and optionally `since`. Use its key as `location:` in an item.
- **Change the link preview image:** replace `public/og.png` (1200 x 630).

## **Placeholders**

Anything still marked `PLACEHOLDER` is waiting for your words. Search the repo
for it before launch; only `content/_template.md` should still contain it.

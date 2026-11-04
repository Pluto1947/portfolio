---
# Copy this whole folder pattern for a new item:
#   content/<domain>/<slug>/index.md   (+ any *.png / *.cast media beside it)
# Slugs are kebab-case. Fill every field below, then delete these comments.

title: "PLACEHOLDER: replace me"
type: writeup                 # one of: writeup | project | note | theory
domains: [security]           # one or more domain slugs (= folder names): security, machine-learning, cloud, web
location: remote              # a slug from content/_locations.json, or "remote" / omit if not place-tied
related: []                   # slugs of thematically related items (draws thematic arcs)
tags: []                      # kebab-case, e.g. [networking, nftables, scapy]
date: 2026-01-01              # YYYY-MM-DD
summary: "One line, used as the card preview text."
---

<!--
  The body renders as a collapsible outline (Logseq style):
    - each `## heading` becomes a foldable section, collapsed on load
    - any bullet that has sub-bullets becomes a foldable node
    - link to another item with [[its-slug]] or [[its-slug|custom label]]
    - emoji are welcome anywhere, e.g. ## 🧭 Context
  Keep the four sections below. Delete this comment.
-->

## 🧭 Context

One line: what this is and why it exists.

## 🛠️ Approach

- **A point:** its explanation.
- **A step with detail**
  - **Sub-point:** the detail that folds away until clicked.

## 🧪 Evidence

Show, do not just tell. Put the file next to this one and reference it like an image; the text in brackets becomes the caption:

![What the recording shows](demo.cast)

![What the screenshot shows](screenshot.png)

## 💡 Takeaway

- What it showed, or what you would do differently next time.

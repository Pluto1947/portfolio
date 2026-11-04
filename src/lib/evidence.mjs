import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';

// remark plugin: evidence figures for write-ups.
// A paragraph that holds only an image becomes a numbered figure card:
//   ![caption](demo.cast)  -> terminal recording, plays on click
//   ![caption](shot.png)   -> screenshot, opens full size on click
// The image alt text is the caption. Files live next to the write-up; .cast
// files are served at /<domain>/<slug>/<file> by src/pages/[domain]/[slug]/[file].ts.

const IMG = /\.(png|jpe?g|webp|gif|avif)$/i;

// Length of an asciicast v2 or v3 recording in seconds, for the play button.
function castLength(file) {
  try {
    const lines = fs.readFileSync(file, 'utf8').trim().split('\n');
    const header = JSON.parse(lines[0]);
    if (header.version === 3) {
      return lines.slice(1).reduce((t, l) => { try { return t + JSON.parse(l)[0]; } catch { return t; } }, 0);
    }
    return JSON.parse(lines[lines.length - 1])[0] ?? 0;
  } catch { return 0; }
}
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

const el = (tag, props, children = []) => ({ type: 'figureEl', data: { hName: tag, hProperties: props }, children });
const text = (value) => ({ type: 'text', value });

export function remarkEvidence() {
  return (tree, file) => {
    const src = file.path || file.history?.[0] || '';
    const parts = src.split(path.sep);
    const at = parts.lastIndexOf('content');
    const domain = at >= 0 ? parts[at + 1] : '';
    const slug = at >= 0 ? parts[at + 2] : '';
    let n = 0;

    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || index == null) return;
      const kids = node.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
      if (kids.length !== 1 || kids[0].type !== 'image') return;
      const img = kids[0];
      const url = img.url || '';
      const caption = img.alt || '';
      const isCast = url.toLowerCase().endsWith('.cast');
      if (!isCast && !IMG.test(url)) return;
      n += 1;

      const label = el('span', { className: ['fig-n'] }, [text(`Fig. ${n} · ${isCast ? 'Recording' : 'Screenshot'}`)]);
      const cap = el('figcaption', {}, [label, el('span', { className: ['fig-t'] }, [text(caption)])]);

      let body;
      if (isCast) {
        const local = /^[a-z]+:|^\//i.test(url) ? null : path.join(path.dirname(src), url);
        const href = local ? `/${domain}/${slug}/${path.basename(url)}` : url;
        const secs = local ? castLength(local) : 0;
        body = el('div', { className: ['cast'], 'data-cast': href }, [
          el('button', { type: 'button', className: ['cast-play'], 'aria-label': `Play recording: ${caption}` }, [
            el('span', { className: ['cast-ico'], 'aria-hidden': 'true' }, [text('▶')]),
            el('span', {}, [text('Play recording')]),
            ...(secs ? [el('span', { className: ['cast-len'] }, [text(clock(secs))])] : []),
          ]),
        ]);
      } else {
        // keep the image node itself so Astro still optimises it
        body = el('button', { type: 'button', className: ['shot'], 'aria-label': `View full size: ${caption}` }, [img]);
      }
      parent.children[index] = el('figure', { className: ['evidence', isCast ? 'is-cast' : 'is-shot'] }, [body, cap]);
    });
  };
}

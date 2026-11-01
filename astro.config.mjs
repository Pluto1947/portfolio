// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { remarkWikiLinks } from './src/lib/wikilinks.mjs';
import { rehypeOutliner } from './src/lib/outliner.mjs';
import { remarkEvidence } from './src/lib/evidence.mjs';

// Build a { slug: "/domain/slug" } map from the content folder so [[slug]]
// wiki links resolve to real page URLs. Re-read on config load (restart dev on new folders).
const contentDir = fileURLToPath(new URL('./content/', import.meta.url));
function slugMap() {
  /** @type {Record<string, string>} */
  const map = {};
  for (const domain of fs.readdirSync(contentDir)) {
    if (domain.startsWith('_')) continue;
    const dPath = `${contentDir}${domain}`;
    if (!fs.statSync(dPath).isDirectory()) continue;
    for (const slug of fs.readdirSync(dPath)) {
      if (fs.statSync(`${dPath}/${slug}`).isDirectory()) map[slug] = `/${domain}/${slug}`;
    }
  }
  return map;
}

// Astro caches rendered markdown and only clears that cache when this config
// changes. Fingerprint our own markdown plugins and pass it as a plugin option,
// so editing any of them also refreshes every write-up.
const pluginRev = crypto
  .createHash('sha1')
  .update(['wikilinks', 'outliner', 'evidence'].map((f) => fs.readFileSync(new URL(`./src/lib/${f}.mjs`, import.meta.url), 'utf8')).join('\n'))
  .digest('hex')
  .slice(0, 12);

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    processor: unified({
      remarkPlugins: [[remarkWikiLinks, { resolve: slugMap() }], [remarkEvidence, { rev: pluginRev }]],
      rehypePlugins: [rehypeOutliner],
    }),
  },
});

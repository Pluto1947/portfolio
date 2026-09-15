// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { remarkWikiLinks } from './src/lib/wikilinks.mjs';
import { rehypeOutliner } from './src/lib/outliner.mjs';

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

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    processor: unified({
      remarkPlugins: [[remarkWikiLinks, { resolve: slugMap() }]],
      rehypePlugins: [rehypeOutliner],
    }),
  },
});

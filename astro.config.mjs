// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
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
// globe.gl imports modules for layers this site never uses (hexagons, heatmaps,
// 3D labels, polygons). Map tiles are used (NASA zoom detail), so not stubbed. Point them at small stand ins to more than halve
// the globe bundle. See src/lib/globe-stubs/README.md before using those layers.
const stub = (f) => fileURLToPath(new URL(`./src/lib/globe-stubs/${f}`, import.meta.url));
const globeStubs = [
  { find: /^three-geojson-geometry$/, replacement: stub('geojson-geometry.js') },
  { find: /^three-conic-polygon-geometry$/, replacement: stub('conic-polygon-geometry.js') },
  { find: /^h3-js$/, replacement: stub('h3.js') },
  { find: /^three\/webgpu$/, replacement: stub('webgpu.js') },
  { find: /^three\/tsl$/, replacement: stub('tsl.js') },
  { find: /^three\/examples\/jsm\/geometries\/TextGeometry\.js$/, replacement: stub('text.js') },
  { find: /^three\/examples\/jsm\/loaders\/FontLoader\.js$/, replacement: stub('text.js') },
];

export default defineConfig({
  // Production address: used for the sitemap, canonical links and link previews.
  site: 'https://adeniyihub.netlify.app',
  integrations: [
    mdx(),
    // sitemap-index.xml for search engines; the post submit thank you page is left out
    sitemap({ filter: (page) => !page.includes('/contact/thanks') }),
  ],
  vite: {
    resolve: { alias: globeStubs },
    // The only chunk over Vite's 500 kB default is the globe (three.js), which
    // loads after the page renders and only on the home page. Warn if anything
    // grows past 1 MB, which would mean a real regression.
    build: { chunkSizeWarningLimit: 1000 },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [[remarkWikiLinks, { resolve: slugMap() }], [remarkEvidence, { rev: pluginRev }]],
      rehypePlugins: [rehypeOutliner],
    }),
  },
});

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import opentype from 'opentype.js';
import type { APIRoute } from 'astro';
import site from '../../content/_site.json';
import { navDomains } from '../lib/graph';

// The link preview card (1200 x 630), built from content at build time:
// Dan's photo in the style A frame (when set), his name, his live domains and
// the site address. Text is turned into vector outlines from the site's own font
// files, so it looks the same on any build machine.
const W = 1200, H = 630;
const font = (pkg: string, file: string) => {
  const buf = fs.readFileSync(path.resolve('node_modules/@fontsource', pkg, 'files', file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const SG7 = font('space-grotesk', 'space-grotesk-latin-700-normal.woff');
const SG5 = font('space-grotesk', 'space-grotesk-latin-500-normal.woff');
const IN4 = font('inter', 'inter-latin-400-normal.woff');

// text as an SVG path, shrunk to fit a maximum width
// Plain headline text, laid out glyph by glyph with kerning. This skips the
// font's contextual substitution rules, which a headline doesn't need and the
// outline library can't run for Inter.
function layout(f: opentype.Font, s: string, size: number) {
  const scale = size / f.unitsPerEm;
  const glyphs = [...s].map((ch) => f.charToGlyph(ch));
  let x = 0;
  const placed = glyphs.map((g, i) => {
    const at = x;
    x += (g.advanceWidth ?? 0) * scale;
    if (i < glyphs.length - 1) x += f.getKerningValue(g, glyphs[i + 1]) * scale;
    return { g, at };
  });
  return { placed, width: x };
}
function text(f: opentype.Font, s: string, x: number, y: number, size: number, maxW: number, fill: string) {
  let { width } = layout(f, s, size);
  const fit = width > maxW ? size * (maxW / width) : size;
  const { placed } = layout(f, s, fit);
  const d = placed.map(({ g, at }) => g.getPath(x + at, y, fit).toPathData(2)).join('');
  return `<path d="${d}" fill="${fill}"/>`;
}

function stars() {
  let seed = 4;
  const r = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const tints = ['233,231,245', '233,231,245', '190,210,255', '255,226,190'];
  return Array.from({ length: 380 }, () => {
    const x = r() * W, y = r() * H, rad = [0.6, 0.8, 1, 1.4][Math.floor(r() * 4)], a = 0.2 + r() * 0.6;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad}" fill="rgba(${tints[Math.floor(r() * 4)]},${a.toFixed(2)})"/>`;
  }).join('');
}

export const GET: APIRoute = async () => {
  const domains = (await navDomains()).map((d) => d.label).join('  ·  ');
  const host = new URL(import.meta.env.SITE ?? 'https://adeniyihub.netlify.app').host;
  const photoName = (site as { photo?: string }).photo;
  const photoPath = photoName ? path.resolve('content/_files', photoName) : '';
  const hasPhoto = !!photoPath && fs.existsSync(photoPath);

  const P = 300, px = 90, py = (H - P) / 2; // photo circle
  const tx = hasPhoto ? px + P + 70 : 84, tw = hasPhoto ? W - tx - 70 : 640;
  const globe = hasPhoto ? '' :
    `<circle cx="1060" cy="380" r="250" fill="url(#gl)"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="bg" cx="0.78" cy="0.6" r="0.7"><stop offset="0" stop-color="#1a2e52"/><stop offset="1" stop-color="#0F1226"/></radialGradient>
      <radialGradient id="gl" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stop-color="#1f3c63"/><stop offset="0.6" stop-color="#0d1a33"/><stop offset="1" stop-color="#070d1a"/></radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    ${stars()}
    ${globe}
    ${text(SG7, site.name, tx, hasPhoto ? 296 : 300, hasPhoto ? 64 : 84, tw, '#E9E7F5')}
    ${domains ? text(SG5, domains, tx + 2, hasPhoto ? 352 : 362, 28, tw, '#d6d4ea') : ''}
    ${text(IN4, host, tx + 2, hasPhoto ? 412 : 430, 22, tw, '#2DD4BF')}
    ${hasPhoto ? `<circle cx="${px + P / 2}" cy="${py + P / 2}" r="${P / 2 + 10}" fill="none" stroke="rgba(45,212,191,0.14)" stroke-width="10"/>
      <circle cx="${px + P / 2}" cy="${py + P / 2}" r="${P / 2 + 2}" fill="none" stroke="rgba(45,212,191,0.8)" stroke-width="4"/>` : ''}
  </svg>`;

  let img = sharp(Buffer.from(svg));
  if (hasPhoto) {
    const mask = Buffer.from(`<svg width="${P}" height="${P}"><circle cx="${P / 2}" cy="${P / 2}" r="${P / 2}" fill="#fff"/></svg>`);
    const face = await sharp(photoPath).rotate().resize(P, P, { fit: 'cover', position: 'attention' })
      .composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
    img = img.composite([{ input: face, left: px, top: Math.round(py) }]);
  }
  const png = await img.png({ compressionLevel: 9 }).toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};

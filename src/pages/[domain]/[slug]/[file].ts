import fs from 'node:fs';
import path from 'node:path';
import type { APIRoute } from 'astro';

// Serves terminal recordings (.cast) that live next to a write-up in content/,
// at /<domain>/<slug>/<file>. Screenshots don't need this: Astro handles images.
const root = path.resolve('content');

export function getStaticPaths() {
  const out: { params: { domain: string; slug: string; file: string } }[] = [];
  for (const domain of fs.readdirSync(root)) {
    const d = path.join(root, domain);
    if (domain.startsWith('_') || !fs.statSync(d).isDirectory()) continue;
    for (const slug of fs.readdirSync(d)) {
      const s = path.join(d, slug);
      if (!fs.statSync(s).isDirectory()) continue;
      for (const file of fs.readdirSync(s)) if (file.endsWith('.cast')) out.push({ params: { domain, slug, file } });
    }
  }
  return out;
}

export const GET: APIRoute = ({ params }) => {
  const body = fs.readFileSync(path.join(root, params.domain!, params.slug!, params.file!));
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

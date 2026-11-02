import fs from 'node:fs';
import path from 'node:path';
import type { APIRoute } from 'astro';

// Publishes everything in content/_files at /files/<name> (for example your CV),
// so downloadable files are managed as content, not code.
const dir = path.resolve('content/_files');
const TYPES: Record<string, string> = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.txt': 'text/plain; charset=utf-8' };

export function getStaticPaths() {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => !f.startsWith('.') && f !== 'README.md').map((file) => ({ params: { file } }));
}

export const GET: APIRoute = ({ params }) => {
  const file = params.file!;
  return new Response(fs.readFileSync(path.join(dir, file)), {
    headers: { 'Content-Type': TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream' },
  });
};

// Launch readiness report: lists everything still standing between the site
// and launch. Run with `npm run check:launch`. Exits with 1 while blockers remain.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('content');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const json = (f) => JSON.parse(read(f));
const blockers = [], todo = [];

// 1. PLACEHOLDER text anywhere in content (the template is meant to keep it)
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : [p];
});
for (const file of walk(root)) {
  const rel = path.relative(process.cwd(), file);
  if (rel.endsWith('_template.md') || rel.endsWith('_files/README.md')) continue;
  if (!/\.(md|mdx|json|cast)$/.test(file)) continue;
  if (fs.readFileSync(file, 'utf8').includes('PLACEHOLDER')) blockers.push(`PLACEHOLDER text in ${rel}`);
}

// 2. mock places and example items
const locations = json('_locations.json');
for (const k of Object.keys(locations)) if (k.startsWith('placeholder-')) blockers.push(`mock place "${k}" in content/_locations.json`);
for (const d of fs.readdirSync(root)) {
  if (d.startsWith('_') || !fs.statSync(path.join(root, d)).isDirectory()) continue;
  for (const s of fs.readdirSync(path.join(root, d))) if (s.startsWith('example-')) blockers.push(`example item content/${d}/${s}`);
}

// 3. domains with nothing in them
const domains = Object.keys(json('_domains.json'));
const used = new Set();
for (const file of walk(root)) {
  if (!file.endsWith('index.md') && !file.endsWith('index.mdx')) continue;
  const m = fs.readFileSync(file, 'utf8').match(/^domains:\s*\[([^\]]*)\]/m);
  if (m) m[1].split(',').map((x) => x.trim()).filter(Boolean).forEach((x) => used.add(x));
}
for (const d of domains) if (!used.has(d)) todo.push(`domain "${d}" has no items yet (shows "coming soon")`);

// 4. links and CV
const site = json('_site.json');
for (const [k, v] of Object.entries(site.links ?? {})) if (!v) todo.push(`no ${k} link in content/_site.json`);
if (!site.cv) todo.push('no CV in content/_site.json (put cv.pdf in content/_files/)');

// 5. places without journey dates
const dated = Object.values(locations).filter((l) => l.since).length;
if (dated < 2) todo.push('fewer than two places have a "since" date, so there is no journey arc');

const line = (s) => `  - ${s}`;
console.log(`\nLaunch check\n`);
console.log(blockers.length ? `Must fix before launch (${blockers.length}):\n${blockers.map(line).join('\n')}\n` : 'Must fix before launch: none\n');
console.log(todo.length ? `Worth doing (${todo.length}):\n${todo.map(line).join('\n')}\n` : 'Worth doing: none\n');
process.exit(blockers.length ? 1 : 0);

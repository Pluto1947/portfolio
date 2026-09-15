import { getCollection, type CollectionEntry } from 'astro:content';
import locations from '../../content/_locations.json';

export type Entry = CollectionEntry<'content'>;

export interface Item {
  entry: Entry;
  domain: string; // folder domain, canonical for the URL
  slug: string;
  url: string;
  data: Entry['data'];
  domains: string[];
  tags: string[];
  related: string[];
  links: string[]; // inline [[slug]] targets found in the body
}

// Domain accent colors. Assignment is a Phase 6 visual detail; kept in one place.
const DOMAIN_ACCENT: Record<string, string> = {
  security: 'var(--teal)',
  'machine-learning': 'var(--violet)',
  cloud: 'var(--coral)',
  web: 'var(--web)',
};
export const accentFor = (d: string) => DOMAIN_ACCENT[d] ?? 'var(--muted)';

const DOMAIN_LABEL: Record<string, string> = {
  security: 'Security',
  'machine-learning': 'Machine Learning',
  cloud: 'Cloud',
  web: 'Web',
};
export const labelFor = (d: string) => DOMAIN_LABEL[d] ?? d;

// Topic chips for a domain, taken from the real tags on its items.
export async function topicsInDomain(domain: string): Promise<{ tag: string; count: number }[]> {
  const items = await itemsInDomain(domain);
  const counts = new Map<string, number>();
  for (const it of items) for (const t of it.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export const locationLabel = (slug?: string): string | null => {
  if (!slug) return null;
  const loc = (locations as Record<string, { label: string }>)[slug];
  return loc ? loc.label : null;
};

const WIKI_RE = /\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\]/g;
function parseLinks(body: string | undefined): string[] {
  if (!body) return [];
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  WIKI_RE.lastIndex = 0;
  while ((m = WIKI_RE.exec(body))) out.add(m[1].trim());
  return [...out];
}

let cache: Item[] | null = null;
export async function getItems(): Promise<Item[]> {
  if (cache) return cache;
  const entries = await getCollection('content');
  cache = entries.map((entry) => {
    const [domain, slug] = entry.id.split('/');
    return {
      entry,
      domain,
      slug,
      url: `/${domain}/${slug}`,
      data: entry.data,
      domains: entry.data.domains ?? [],
      tags: entry.data.tags ?? [],
      related: entry.data.related ?? [],
      links: parseLinks(entry.body),
    };
  });
  return cache;
}

export async function getDomains(): Promise<string[]> {
  const items = await getItems();
  const set = new Set<string>();
  for (const it of items) for (const d of it.domains) set.add(d);
  return [...set].sort();
}

const byDate = (a: Item, b: Item) => +new Date(b.data.date) - +new Date(a.data.date);

export async function itemsInDomain(domain: string): Promise<Item[]> {
  const items = await getItems();
  return items.filter((it) => it.domains.includes(domain)).sort(byDate);
}

const TYPES = ['project', 'writeup', 'note', 'theory'] as const;
const TYPE_LABEL: Record<string, string> = {
  project: 'Project',
  writeup: 'Writeup',
  note: 'Note',
  theory: 'Theory',
};
export const typeLabel = (t: string) => TYPE_LABEL[t] ?? t;

export function groupByType(items: Item[]) {
  return TYPES.map((type) => ({ type, items: items.filter((i) => i.data.type === type).sort(byDate) })).filter(
    (g) => g.items.length,
  );
}

// backlinks: items whose `related` or inline [[links]] point at this slug
export async function backlinksFor(slug: string): Promise<Item[]> {
  const items = await getItems();
  return items.filter((i) => i.slug !== slug && (i.related.includes(slug) || i.links.includes(slug)));
}

// related: explicit `related` entries plus items that share a tag
export async function relatedFor(item: Item): Promise<Item[]> {
  const items = await getItems();
  const out = new Map<string, Item>();
  for (const s of item.related) {
    const t = items.find((i) => i.slug === s);
    if (t) out.set(t.slug, t);
  }
  for (const it of items) {
    if (it.slug === item.slug) continue;
    if (it.tags.some((t) => item.tags.includes(t))) out.set(it.slug, it);
  }
  out.delete(item.slug);
  return [...out.values()];
}

// connected domains for one item: other domains it, its links and its related touch
export async function connectedDomainsForItem(item: Item): Promise<{ domain: string; count: number }[]> {
  const items = await getItems();
  const bySlug = new Map(items.map((i) => [i.slug, i]));
  const counts = new Map<string, number>();
  const bump = (d: string) => {
    if (d && !item.domains.includes(d)) counts.set(d, (counts.get(d) ?? 0) + 1);
  };
  for (const d of item.domains) if (d !== item.domain) counts.set(d, (counts.get(d) ?? 0) + 1);
  for (const s of [...item.related, ...item.links]) {
    const t = bySlug.get(s);
    if (t) for (const d of t.domains) bump(d);
  }
  return [...counts.entries()].map(([domain, count]) => ({ domain, count })).sort((a, b) => b.count - a.count);
}

// connected domains for a whole domain page: other domains its items also belong to
export async function connectedDomainsForDomain(domain: string): Promise<{ domain: string; count: number }[]> {
  const items = await itemsInDomain(domain);
  const counts = new Map<string, number>();
  for (const it of items) for (const d of it.domains) if (d !== domain) counts.set(d, (counts.get(d) ?? 0) + 1);
  return [...counts.entries()].map(([d, count]) => ({ domain: d, count })).sort((a, b) => b.count - a.count);
}

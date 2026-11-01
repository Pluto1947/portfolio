import locations from '../../content/_locations.json';
import { getItems, type Item } from './graph';

// Build-time data for the home page globe. Everything is derived from
// content/_locations.json and content frontmatter, so content edits never
// need a code change here.

type Loc = { lat?: number; lng?: number; label: string; since?: string };
const LOCS = locations as Record<string, Loc>;

export interface GlobeItem { title: string; url: string; domain: string; type: string }
export interface GlobePin { slug: string; label: string; lat: number; lng: number; items: GlobeItem[] }
export interface GlobeArc {
  kind: 'bio' | 'theme';
  from: string; to: string;
  startLat: number; startLng: number; endLat: number; endLng: number;
  weight: number; label: string;
}
export interface GlobeData { pins: GlobePin[]; arcs: GlobeArc[]; remote: GlobeItem[] }

const isGeo = (l?: Loc): l is Loc & { lat: number; lng: number } =>
  !!l && typeof l.lat === 'number' && typeof l.lng === 'number';
const toItem = (it: Item): GlobeItem => ({ title: it.data.title, url: it.url, domain: it.domain, type: it.data.type });

function arc(kind: GlobeArc['kind'], a: string, b: string, weight: number, label: string): GlobeArc {
  const A = LOCS[a] as Required<Loc>, B = LOCS[b] as Required<Loc>;
  return { kind, from: a, to: b, startLat: A.lat, startLng: A.lng, endLat: B.lat, endLng: B.lng, weight, label };
}

export async function getGlobeData(): Promise<GlobeData> {
  const items = await getItems();

  // one pin per location that has coordinates, even before it has content
  const pins: GlobePin[] = Object.entries(LOCS)
    .filter(([, l]) => isGeo(l))
    .map(([slug, l]) => ({
      slug, label: l.label, lat: l.lat!, lng: l.lng!,
      items: items.filter((it) => it.data.location === slug).map(toItem),
    }));
  const remote = items.filter((it) => !isGeo(LOCS[it.data.location])).map(toItem);

  // biographical arcs: locations with a `since` date, joined in date order
  const journey = Object.entries(LOCS)
    .filter(([, l]) => isGeo(l) && l.since)
    .sort(([, a], [, b]) => a.since!.localeCompare(b.since!));
  const arcs: GlobeArc[] = [];
  for (let i = 1; i < journey.length; i++) {
    const [a] = journey[i - 1], [b] = journey[i];
    arcs.push(arc('bio', a, b, 1, `${LOCS[a].label} to ${LOCS[b].label}`));
  }

  // thematic arcs: items at different places that share a domain or link to each other
  const geoItems = items.filter((it) => isGeo(LOCS[it.data.location]));
  const pairs = new Map<string, number>();
  for (let i = 0; i < geoItems.length; i++) {
    for (let j = i + 1; j < geoItems.length; j++) {
      const x = geoItems[i], y = geoItems[j];
      const la = x.data.location, lb = y.data.location;
      if (la === lb) continue;
      const linked =
        x.related.includes(y.slug) || y.related.includes(x.slug) || x.links.includes(y.slug) || y.links.includes(x.slug);
      const shared = x.domains.some((d) => y.domains.includes(d));
      if (!linked && !shared) continue;
      const key = [la, lb].sort().join('|');
      pairs.set(key, (pairs.get(key) ?? 0) + (linked ? 2 : 1));
    }
  }
  for (const [key, w] of pairs) {
    const [a, b] = key.split('|');
    arcs.push(arc('theme', a, b, w, `${LOCS[a].label} and ${LOCS[b].label}: connected work`));
  }

  return { pins, arcs, remote };
}

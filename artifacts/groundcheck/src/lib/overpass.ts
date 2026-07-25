import type { ReportCategory, OsmResult, OsmFeature } from './types';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Tag keys relevant per category, in priority order
const TAG_KEYS: Record<ReportCategory, string[]> = {
  fraud:  ['shop', 'office', 'brand'],
  hazard: ['highway', 'barrier', 'hazard'],
  unsafe: ['amenity', 'landuse', 'building'],
  scam:   ['shop', 'tourism', 'office'],
};

function buildQuery(lat: number, lon: number, radius: number, category: ReportCategory): string {
  const primary = TAG_KEYS[category][0];
  return `[out:json][timeout:12];
(
  node(around:${radius},${lat},${lon})["${primary}"~"."];
  way(around:${radius},${lat},${lon})["${primary}"~"."];
);
out center 15;`;
}

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Pick the best human-readable type tag from an element's tags
function extractKind(tags: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    if (tags[k] && tags[k] !== 'yes') return tags[k].replace(/_/g, ' ');
  }
  return 'unknown';
}

export async function queryOverpass(
  lat: number, lon: number, radius: number, category: ReportCategory,
  externalSignal?: AbortSignal,
): Promise<OsmResult> {
  const timeout = AbortSignal.timeout(12000);
  const signal = externalSignal ? AbortSignal.any([timeout, externalSignal]) : timeout;

  const empty: OsmResult = { matched: false, nearestM: null, count: 0, features: [] };

  try {
    const query = buildQuery(lat, lon, radius, category);
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query),
      signal,
    });
    if (!response.ok) return { ...empty, matched: null };

    const data = await response.json();
    const elements: Record<string, unknown>[] = data.elements ?? [];
    if (elements.length === 0) return empty;

    const tagKeys = TAG_KEYS[category];

    // Build enriched feature list with distances
    const withDist: Array<OsmFeature & { _d: number }> = [];
    for (const el of elements) {
      const tags = (el.tags as Record<string, string>) ?? {};
      const elLat = (el.lat ?? (el.center as Record<string, number>)?.lat) as number | undefined;
      const elLon = (el.lon ?? (el.center as Record<string, number>)?.lon) as number | undefined;
      if (elLat == null || elLon == null) continue;

      const d = haversineM(lat, lon, elLat, elLon);
      const name = tags['name'] || tags['name:en'] || tags['ref'] || capitalise(extractKind(tags, tagKeys));
      const kind = extractKind(tags, tagKeys);

      withDist.push({ name, kind, distanceM: Math.round(d), _d: d });
    }

    // Sort closest-first, keep top 10
    withDist.sort((a, b) => a._d - b._d);
    const features: OsmFeature[] = withDist.slice(0, 10).map(({ name, kind, distanceM }) => ({ name, kind, distanceM }));
    const nearestM = withDist.length > 0 ? Math.round(withDist[0]._d) : null;

    return { matched: true, nearestM, count: elements.length, features };
  } catch {
    return { matched: null, nearestM: null, count: 0, features: [] };
  }
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Debounce helper (kept for any external callers)
export function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

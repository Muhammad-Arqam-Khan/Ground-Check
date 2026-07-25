import type { ReportCategory, OsmResult } from './types';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

function buildQuery(lat: number, lon: number, radius: number, category: ReportCategory): string {
  const tagFilter = {
    fraud:  '["shop"~"."]',
    hazard: '["highway"~"."]',
    unsafe: '["amenity"~"."]',
    scam:   '["shop"~"."]',
  }[category];

  return `[out:json][timeout:10];
(
  node(around:${radius},${lat},${lon})${tagFilter};
  way(around:${radius},${lat},${lon})${tagFilter};
);
out center 10;`;
}

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function queryOverpass(
  lat: number, lon: number, radius: number, category: ReportCategory,
  externalSignal?: AbortSignal,
): Promise<OsmResult> {
  // Combine a 12s timeout with any external abort signal
  const timeout = AbortSignal.timeout(12000);
  const signal = externalSignal
    ? AbortSignal.any([timeout, externalSignal])
    : timeout;

  try {
    const query = buildQuery(lat, lon, radius, category);
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query),
      signal,
    });
    if (!response.ok) return { matched: null, nearestM: null, count: 0 };
    const data = await response.json();
    const elements = data.elements ?? [];
    if (elements.length === 0) return { matched: false, nearestM: null, count: 0 };
    // Find nearest
    let nearestM = Infinity;
    for (const el of elements) {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (elLat != null && elLon != null) {
        const d = haversineM(lat, lon, elLat, elLon);
        if (d < nearestM) nearestM = d;
      }
    }
    return { matched: true, nearestM: nearestM === Infinity ? null : Math.round(nearestM), count: elements.length };
  } catch {
    return { matched: null, nearestM: null, count: 0 };
  }
}

// Debounce helper
export function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

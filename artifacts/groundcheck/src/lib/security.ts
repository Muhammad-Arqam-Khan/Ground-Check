const ACTION_WINDOW_MS = 30_000; // 30 seconds
const ACTION_LIMIT = 5;
const SS_ACTIONS = 'groundcheck:actions'; // persisted so page-refresh doesn't reset the sybil counter

function loadActions(): number[] {
  try { return JSON.parse(sessionStorage.getItem(SS_ACTIONS) ?? '[]'); } catch { return []; }
}

function saveActions(log: number[]): void {
  try { sessionStorage.setItem(SS_ACTIONS, JSON.stringify(log)); } catch {}
}

export function recordAction(): void {
  const now = Date.now();
  const log = loadActions().filter(t => t > now - ACTION_WINDOW_MS);
  log.push(now);
  saveActions(log);
}

// Returns a weight factor 0.0–1.0 to multiply vote contribution by
export function getSybilWeight(): number {
  const now = Date.now();
  const recentCount = loadActions().filter(t => t >= now - ACTION_WINDOW_MS).length;
  if (recentCount <= ACTION_LIMIT) return 1.0;
  // Linear down-weight: at 10 actions → 0.5, at 15+ → approaching 0.1
  return Math.max(0.1, 1.0 - ((recentCount - ACTION_LIMIT) / ACTION_LIMIT) * 0.5);
}

let lastReportLocation: { lat: number; lon: number; time: number } | null = null;

const SPEED_LIMIT_KMH = 200;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Returns true if the report should be flagged as spoof_suspected
export function checkImpossibleTravel(lat: number, lon: number, time: number): boolean {
  if (!lastReportLocation) {
    lastReportLocation = { lat, lon, time };
    return false;
  }
  const distKm = haversineKm(lastReportLocation.lat, lastReportLocation.lon, lat, lon);
  const elapsedH = (time - lastReportLocation.time) / 3_600_000;
  lastReportLocation = { lat, lon, time };
  if (elapsedH <= 0) return false;
  const speedKmh = distKm / elapsedH;
  return speedKmh > SPEED_LIMIT_KMH;
}

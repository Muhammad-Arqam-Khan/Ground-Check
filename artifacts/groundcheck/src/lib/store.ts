import type { Report, OsmResult, ReportCategory } from './types';
import { computeScore } from './scoring';

// ── Vote tracking (session-scoped, client-side only) ─────────────────────────
const SS_VOTES = 'groundcheck:votes'; // { [reportId]: 'up' | 'down' }

function loadVotes(): Record<string, 'up' | 'down'> {
  try { return JSON.parse(sessionStorage.getItem(SS_VOTES) ?? '{}'); } catch { return {}; }
}

function persistVotes(v: Record<string, 'up' | 'down'>): void {
  try { sessionStorage.setItem(SS_VOTES, JSON.stringify(v)); } catch {}
}

/** Returns which direction this session already voted on a report, or null. */
export function getVoteForReport(id: string): 'up' | 'down' | null {
  return loadVotes()[id] ?? null;
}

/** Record that this session cast a vote — idempotent, overwrites prior direction. */
export function recordVoteForReport(id: string, dir: 'up' | 'down'): void {
  const v = loadVotes();
  v[id] = dir;
  persistVotes(v);
}

// ── API client ───────────────────────────────────────────────────────────────
// The API is mounted at /api on the same domain (path-based routing on Replit).
const API_BASE = '/api';

/**
 * Canonical API shape shared across web and mobile.
 * Uses `description`/`timestamp` field names (mobile convention).
 */
interface ApiReport {
  id: string;
  lat: number;
  lon: number;
  radiusMeters: number;
  category: string;
  description: string;
  timestamp: number;
  up: number;
  down: number;
  flagged: boolean;
  score: number;
  session?: string;
  reporterStatus?: string;
  reporterIdentityId?: string;
  osm?: OsmResult;
}

const DEFAULT_OSM: OsmResult = { matched: null, nearestM: null, count: 0, features: [] };

/** Convert web Report → API shape */
function localToApi(r: Report): ApiReport {
  return {
    id: r.id,
    lat: r.lat,
    lon: r.lon,
    radiusMeters: r.radiusMeters,
    category: r.category,
    description: r.desc,
    timestamp: r.time,
    up: r.up,
    down: r.down,
    flagged: r.flagged,
    score: r.score,
    session: r.session,
    reporterStatus: r.reporterStatus,
    reporterIdentityId: r.reporterIdentityId,
    osm: r.osm,
  };
}

/** Convert API shape → web Report */
function apiToLocal(a: ApiReport): Report {
  return {
    id: a.id,
    lat: a.lat,
    lon: a.lon,
    radiusMeters: a.radiusMeters,
    // Cast: web may receive mobile categories — they render as-is in popups
    category: a.category as ReportCategory,
    desc: a.description,
    time: a.timestamp,
    up: a.up,
    down: a.down,
    flagged: a.flagged,
    score: a.score,
    session: a.session ?? '',
    reporterStatus: a.reporterStatus as Report['reporterStatus'],
    reporterIdentityId: a.reporterIdentityId,
    osm: a.osm ?? DEFAULT_OSM,
  };
}

// ── Local in-memory cache (populated by initStore) ───────────────────────────
// localStorage key kept for fallback only (offline / API unavailable)
const LS_KEY = 'groundcheck:reports';

function loadFromStorage(): Report[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Report[];
  } catch {
    return [];
  }
}

function saveToStorage(rpts: Report[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(rpts));
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}

// The live cache. Starts empty; populated by initStore().
const reports: Report[] = [];

/**
 * Fetch all reports from the API and populate the in-memory cache.
 * Falls back to localStorage if the API is unreachable.
 * Call this once on app mount before rendering the map.
 */
export async function initStore(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/reports`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const apiReports: ApiReport[] = await res.json();
    reports.length = 0;
    reports.push(...apiReports.map(apiToLocal));
    // Keep localStorage in sync as offline fallback
    saveToStorage(reports);
  } catch {
    // API unavailable — fall back to locally persisted data
    const stored = loadFromStorage();
    reports.length = 0;
    reports.push(...stored);
  }
}

// ── Mutators ─────────────────────────────────────────────────────────────────

export function addReport(report: Report): void {
  reports.push(report);
  saveToStorage(reports);
  // Push to API (fire-and-forget — localStorage is the offline safety net)
  fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(localToApi(report)),
  }).catch(() => {});
}

export function getAllReports(): Report[] {
  return [...reports];
}

export function getReport(id: string): Report | undefined {
  return reports.find(r => r.id === id);
}

export function updateReport(id: string, updates: Partial<Report>): Report | undefined {
  const idx = reports.findIndex(r => r.id === id);
  if (idx === -1) return undefined;
  reports[idx] = { ...reports[idx], ...updates };
  reports[idx].score = computeScore(reports[idx]);
  saveToStorage(reports);
  // Sync change to API (fire-and-forget)
  fetch(`${API_BASE}/reports/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...updates, score: reports[idx].score }),
  }).catch(() => {});
  return reports[idx];
}

/** Clear all persisted reports (useful for testing). */
export function clearReports(): void {
  reports.length = 0;
  localStorage.removeItem(LS_KEY);
}

// Returns [lat, lng, intensity] tuples for leaflet.heat
export function buildHeatmapPoints(): [number, number, number][] {
  return reports
    .filter(r => !r.flagged)
    .map(r => [r.lat, r.lon, r.score / 100] as [number, number, number]);
}

/**
 * Returns the mean radiusMeters across all non-flagged reports,
 * or a default of 150 m when there are no reports yet.
 */
export function getMeanRadiusMeters(): number {
  const active = reports.filter(r => !r.flagged);
  if (active.length === 0) return 150;
  const sum = active.reduce((acc, r) => acc + r.radiusMeters, 0);
  return sum / active.length;
}

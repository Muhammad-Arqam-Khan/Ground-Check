import type { Report } from './types';
import { computeScore } from './scoring';

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

function saveToStorage(reports: Report[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(reports));
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}

const reports: Report[] = loadFromStorage();

export function addReport(report: Report): void {
  reports.push(report);
  saveToStorage(reports);
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

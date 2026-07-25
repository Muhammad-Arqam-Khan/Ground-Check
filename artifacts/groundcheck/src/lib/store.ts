import type { Report } from './types';
import { computeScore } from './scoring';

const reports: Report[] = [];

export function addReport(report: Report): void {
  reports.push(report);
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
  return reports[idx];
}

// Returns [lat, lng, intensity] tuples for leaflet.heat
export function buildHeatmapPoints(): [number, number, number][] {
  return reports
    .filter(r => !r.flagged)
    .map(r => [r.lat, r.lon, r.score / 100] as [number, number, number]);
}

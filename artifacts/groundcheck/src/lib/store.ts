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

type HeatmapFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: 'Point'; coordinates: [number, number] };
    properties: { weight: number; radius: number };
  }>;
};

export function buildHeatmapGeoJSON(): HeatmapFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: reports
      .filter(r => !r.flagged)
      .map(r => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [r.lon, r.lat] },
        properties: {
          weight: r.score / 100,  // normalize 0-1 for heatmap-weight
          radius: r.radiusMeters,
        },
      })),
  };
}

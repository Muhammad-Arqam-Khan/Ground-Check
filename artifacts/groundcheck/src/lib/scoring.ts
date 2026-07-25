import { getSybilWeight } from './security';
import type { Report, ScoreBreakdown } from './types';

function osmPoints(osm: Report['osm']): number {
  if (osm.matched === null) return 12; // no Overpass reachability
  if (!osm.matched) return 5;          // no match found
  if (osm.nearestM !== null && osm.nearestM <= 25) return 40; // ≤25m
  return 25;                            // matched but farther
}

function communityPoints(up: number, down: number): number {
  const weight = getSybilWeight();
  const raw = 20 + (up - down) * 4 * weight;
  return Math.max(0, Math.min(40, Math.round(raw)));
}

function reporterCredibilityPoints(report: Report): number {
  if (report.reporterStatus === 'verified') return 10;
  if (report.reporterStatus === 'flagged')  return -5;
  return 0; // guest or undefined
}

export function computeScore(report: Report): number {
  if (report.flagged) return 0; // excluded from scoring
  const o = osmPoints(report.osm);
  const c = communityPoints(report.up, report.down);
  const r = reporterCredibilityPoints(report);
  return Math.min(100, o + c + 20 + r); // basePoints = 20, cap at 100
}

export function getScoreBreakdown(report: Report): ScoreBreakdown {
  if (report.flagged) return { osmPoints: 0, communityPoints: 0, basePoints: 20, total: 0 };
  const o = osmPoints(report.osm);
  const c = communityPoints(report.up, report.down);
  const r = reporterCredibilityPoints(report);
  return { osmPoints: o, communityPoints: c, basePoints: 20, total: Math.min(100, o + c + 20 + r) };
}

export function scoreToColor(score: number): string {
  if (score >= 70) return '#22c55e';  // green
  if (score >= 40) return '#f59e0b';  // amber
  return '#ef4444';                   // red
}

export function scoreToLabel(score: number): string {
  if (score >= 70) return 'HIGH TRUST';
  if (score >= 40) return 'MID TRUST';
  return 'LOW TRUST';
}

import { Report } from './types';

/**
 * Simplified scoring for mobile — matches web app logic but without
 * OSM Overpass connectivity. OSM points default to 12 (no-match fallback).
 */
function osmPoints(): number {
  return 12; // No Overpass reachability on mobile
}

function communityPoints(up: number, down: number): number {
  const raw = 20 + (up - down) * 4;
  return Math.max(0, Math.min(40, Math.round(raw)));
}

export function computeScore(report: Report): number {
  if (report.flagged) return 0;
  return osmPoints() + communityPoints(report.up, report.down) + 20;
}

export function scoreToColor(score: number): string {
  if (score >= 70) return '#22c55e'; // green
  if (score >= 40) return '#f59e0b'; // amber
  return '#ef4444';                  // red
}

export function scoreToLabel(score: number): string {
  if (score >= 70) return 'HIGH TRUST';
  if (score >= 40) return 'MID TRUST';
  return 'LOW TRUST';
}

export function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

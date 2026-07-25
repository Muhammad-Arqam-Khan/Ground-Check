import React, { useState, useEffect, useRef } from 'react';
import type { ReportCategory, OsmResult, Report } from '../lib/types';
import { queryOverpass } from '../lib/overpass';
import { SESSION_ID } from '../lib/session';

interface ReportPanelProps {
  pendingLocation: { lat: number; lon: number } | null;
  onSubmit: (report: Report) => void;
  onClose: () => void;
}

export function ReportPanel({ pendingLocation, onSubmit, onClose }: ReportPanelProps) {
  const [category, setCategory] = useState<ReportCategory>('fraud');
  const [radius, setRadius] = useState<number>(150);
  const [desc, setDesc] = useState<string>('');
  const [osmResult, setOsmResult] = useState<OsmResult | null>(null);
  const [loadingOsm, setLoadingOsm] = useState<boolean>(true);

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const abortRef = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    if (!pendingLocation) return;

    setLoadingOsm(true);
    setOsmResult(null);

    // Clear any pending debounce timer
    clearTimeout(timerRef.current);
    // Abort any in-flight request
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    timerRef.current = setTimeout(async () => {
      const res = await queryOverpass(
        pendingLocation.lat,
        pendingLocation.lon,
        radius,
        category,
        controller.signal,
      );
      if (!controller.signal.aborted) {
        setOsmResult(res);
        setLoadingOsm(false);
      }
    }, 300);

    return () => {
      clearTimeout(timerRef.current);
      controller.abort();
    };
  }, [category, radius, pendingLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingLocation || !osmResult) return;

    const report: Report = {
      id: crypto.randomUUID(),
      category,
      desc,
      lat: pendingLocation.lat,
      lon: pendingLocation.lon,
      radiusMeters: radius,
      time: Date.now(),
      session: SESSION_ID,
      up: 0,
      down: 0,
      osm: osmResult,
      flagged: false, // will be evaluated by parent
      score: 0,       // will be evaluated by parent
    };

    onSubmit(report);
  };

  return (
    <div className="fixed top-0 bottom-0 right-0 w-full sm:w-[340px] bg-card border-l border-border z-10 p-6 flex flex-col shadow-2xl transition-transform duration-200 ease-out transform translate-x-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-card-foreground">New Report</h2>
        <button 
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-1"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="space-y-5 flex-1">
          {/* Coordinates display (read-only) */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">LOCATION</label>
            <div className="font-mono text-xs bg-input/50 px-2 py-1.5 rounded border border-border text-foreground">
              {pendingLocation?.lat.toFixed(5)}, {pendingLocation?.lon.toFixed(5)}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">CATEGORY</label>
            <select
              data-testid="select-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ReportCategory)}
              className="w-full bg-input border border-border text-sm rounded px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="fraud">Fake Business</option>
              <option value="hazard">Road Hazard</option>
              <option value="unsafe">Unsafe Area</option>
              <option value="scam">Scam Location</option>
            </select>
          </div>

          {/* Radius */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-medium text-muted-foreground">RADIUS</label>
              <span className="text-xs font-mono text-primary">{radius}m</span>
            </div>
            <input
              type="range"
              data-testid="slider-radius"
              min="50"
              max="500"
              step="10"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-medium text-muted-foreground">DESCRIPTION</label>
              <span className="text-xs text-muted-foreground">{desc.length}/280</span>
            </div>
            <textarea
              data-testid="input-description"
              maxLength={280}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe the issue..."
              className="w-full bg-input border border-border text-sm rounded px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none h-24"
            />
          </div>

          {/* OSM Readout */}
          <div className="p-3 bg-secondary border border-secondary-border rounded">
            <h3 className="text-xs font-semibold text-muted-foreground mb-1">OSM CROSS-CHECK</h3>
            <p data-testid="text-osm-readout" className="text-xs font-mono">
              {loadingOsm ? (
                <span className="text-muted-foreground">Querying OSM...</span>
              ) : osmResult?.matched === null ? (
                <span className="text-amber-500">OSM unavailable — neutral score</span>
              ) : osmResult?.matched ? (
                <span className="text-primary">{osmResult.count} features found within {osmResult.nearestM}m</span>
              ) : (
                <span className="text-destructive">No matching features found</span>
              )}
            </p>
          </div>
        </div>

        <div className="pt-4 flex gap-3 mt-auto border-t border-border">
          <button
            type="button"
            data-testid="button-cancel-report"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border text-foreground text-sm rounded hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            data-testid="button-submit-report"
            disabled={loadingOsm}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground font-semibold text-sm rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

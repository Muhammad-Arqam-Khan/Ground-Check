import { useState, useEffect, useRef } from 'react';
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
  const [osmExpanded, setOsmExpanded] = useState<boolean>(false);

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
    <div className="fixed top-0 bottom-0 right-0 w-full sm:w-[340px] bg-card border-l border-border z-[1100] p-6 flex flex-col shadow-2xl transition-transform duration-200 ease-out transform translate-x-0">
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

          {/* OSM Cross-Check — collapseable */}
          <div className="border border-border rounded overflow-hidden">
            {/* Header / toggle row */}
            <button
              type="button"
              onClick={() => setOsmExpanded(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2 bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground tracking-wider">OSM CROSS-CHECK</span>
                {loadingOsm && (
                  <span className="text-[10px] font-mono text-muted-foreground animate-pulse">querying…</span>
                )}
                {!loadingOsm && osmResult?.matched === true && (
                  <span
                    data-testid="text-osm-readout"
                    className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded"
                  >
                    {osmResult.count} found · nearest {osmResult.nearestM}m
                  </span>
                )}
                {!loadingOsm && osmResult?.matched === false && (
                  <span
                    data-testid="text-osm-readout"
                    className="text-[10px] font-mono text-destructive"
                  >
                    no features
                  </span>
                )}
                {!loadingOsm && osmResult?.matched === null && (
                  <span
                    data-testid="text-osm-readout"
                    className="text-[10px] font-mono text-amber-500"
                  >
                    unavailable
                  </span>
                )}
              </div>
              <span className="text-muted-foreground text-xs select-none transition-transform duration-200"
                    style={{ transform: osmExpanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>
                ▾
              </span>
            </button>

            {/* Expandable feature list */}
            {osmExpanded && (
              <div className="border-t border-border bg-black/20">
                {loadingOsm ? (
                  <p className="px-3 py-3 text-xs font-mono text-muted-foreground animate-pulse">
                    Querying OpenStreetMap…
                  </p>
                ) : osmResult?.matched === null ? (
                  <p className="px-3 py-3 text-xs font-mono text-amber-500">
                    OSM unavailable — neutral score applied
                  </p>
                ) : !osmResult?.features.length ? (
                  <p className="px-3 py-3 text-xs font-mono text-muted-foreground">
                    No matching OSM features found within radius
                  </p>
                ) : (
                  <ul className="max-h-44 overflow-y-auto divide-y divide-border/40">
                    {osmResult!.features.map((f, i) => (
                      <li key={i} className="flex items-center justify-between px-3 py-1.5 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="shrink-0 text-[9px] font-mono bg-primary/15 text-primary px-1.5 py-0.5 rounded uppercase tracking-wide">
                            {f.kind}
                          </span>
                          <span className="text-xs text-foreground truncate" title={f.name}>
                            {f.name}
                          </span>
                        </div>
                        <span className="shrink-0 text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                          {f.distanceM}m
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
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

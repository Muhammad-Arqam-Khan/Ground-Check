import { useState, useEffect, useRef, FormEvent } from 'react';
import type { ReportCategory, OsmResult, Report } from '../lib/types';
import { queryOverpass } from '../lib/overpass';
import { SESSION_ID } from '../lib/session';

interface ReportPanelProps {
  pendingLocation: { lat: number; lon: number } | null;
  onSubmit: (report: Report) => void;
  onClose: () => void;
}

const CATEGORIES: { value: ReportCategory; label: string; icon: string }[] = [
  { value: 'fraud',  label: 'Fake Business', icon: '🏪' },
  { value: 'hazard', label: 'Road Hazard',   icon: '⚠️' },
  { value: 'unsafe', label: 'Unsafe Area',   icon: '🔒' },
  { value: 'scam',   label: 'Scam',          icon: '💸' },
];

export function ReportPanel({ pendingLocation, onSubmit, onClose }: ReportPanelProps) {
  const [category, setCategory]       = useState<ReportCategory>('fraud');
  const [radius, setRadius]           = useState<number>(150);
  const [desc, setDesc]               = useState<string>('');
  const [osmResult, setOsmResult]     = useState<OsmResult | null>(null);
  const [loadingOsm, setLoadingOsm]   = useState<boolean>(true);
  const [osmExpanded, setOsmExpanded] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const abortRef = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    if (!pendingLocation) return;

    setLoadingOsm(true);
    setOsmResult(null);
    clearTimeout(timerRef.current);
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    timerRef.current = setTimeout(async () => {
      const res = await queryOverpass(
        pendingLocation.lat, pendingLocation.lon, radius, category, controller.signal,
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!pendingLocation || !osmResult) return;
    onSubmit({
      id: crypto.randomUUID(),
      category, desc,
      lat: pendingLocation.lat,
      lon: pendingLocation.lon,
      radiusMeters: radius,
      time: Date.now(),
      session: SESSION_ID,
      up: 0, down: 0,
      osm: osmResult,
      flagged: false,
      score: 0,
    });
  };

  return (
    <div
      className="fixed top-0 bottom-0 right-0 w-full sm:w-[360px] z-[1100] flex flex-col"
      style={{ background: 'var(--nm-base)', boxShadow: '-10px 0 40px rgba(184,192,204,0.65)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 pt-6 pb-5"
        style={{ borderBottom: '1px solid rgba(184,192,204,0.3)' }}
      >
        <div>
          <h2 className="text-base font-semibold" style={{ color: 'var(--nm-fg)' }}>New Report</h2>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: 'var(--nm-fg-muted)', fontFamily: 'var(--app-font-mono)' }}
          >
            {pendingLocation?.lat.toFixed(5)}, {pendingLocation?.lon.toFixed(5)}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="nm-btn w-9 h-9 rounded-full text-base"
          style={{ color: 'var(--nm-fg-muted)' }}
        >
          ✕
        </button>
      </div>

      {/* Scrollable body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col px-6 py-5 gap-5">

        {/* Category pills — 2×2 grid */}
        <div>
          <label
            className="block text-[9px] font-semibold tracking-widest uppercase mb-2.5"
            style={{ color: 'var(--nm-fg-muted)' }}
          >
            Category
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {CATEGORIES.map(({ value, label, icon }) => {
              const active = category === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  data-testid={`category-${value}`}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150"
                  style={
                    active
                      ? { background: 'rgba(123,156,204,0.12)', color: 'var(--nm-accent)', boxShadow: 'var(--nm-inset-sm)' }
                      : { background: 'var(--nm-base)', color: 'var(--nm-fg-muted)', boxShadow: 'var(--nm-raised-sm)' }
                  }
                >
                  <span className="text-sm leading-none">{icon}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Radius */}
        <div>
          <div className="flex items-baseline justify-between mb-2.5">
            <label
              className="text-[9px] font-semibold tracking-widest uppercase"
              style={{ color: 'var(--nm-fg-muted)' }}
            >
              Radius
            </label>
            <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--nm-accent)' }}>
              {radius} m
            </span>
          </div>
          <input
            type="range"
            data-testid="slider-radius"
            min="50" max="500" step="10"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="nm-slider"
          />
          <div className="flex justify-between mt-1.5 text-[10px]" style={{ color: 'var(--nm-dark)' }}>
            <span>50 m</span><span>500 m</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-baseline justify-between mb-2.5">
            <label
              className="text-[9px] font-semibold tracking-widest uppercase"
              style={{ color: 'var(--nm-fg-muted)' }}
            >
              Description
            </label>
            <span className="text-[10px] tabular-nums" style={{ color: 'var(--nm-dark)' }}>
              {desc.length}/280
            </span>
          </div>
          <textarea
            data-testid="input-description"
            maxLength={280}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe the issue…"
            rows={3}
            className="nm-input"
          />
        </div>

        {/* OSM Cross-Check — collapseable, inset container */}
        <div className="rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--nm-inset-sm)' }}>
          <button
            type="button"
            onClick={() => setOsmExpanded(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Globe icon */}
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="6.5" cy="6.5" r="5.2" stroke="var(--nm-fg-muted)" strokeWidth="1.2"/>
                <path d="M1.3 6.5h10.4M6.5 1.3C5 3.5 5 9.5 6.5 11.7M6.5 1.3C8 3.5 8 9.5 6.5 11.7"
                      stroke="var(--nm-fg-muted)" strokeWidth="1"/>
              </svg>
              <span
                className="text-[9px] font-semibold tracking-widest uppercase"
                style={{ color: 'var(--nm-fg-muted)' }}
              >
                OSM Cross-Check
              </span>
              {loadingOsm && (
                <span
                  className="text-[10px] animate-pulse"
                  style={{ color: 'var(--nm-dark)', fontFamily: 'var(--app-font-mono)' }}
                >
                  querying…
                </span>
              )}
              {!loadingOsm && osmResult?.matched === true && (
                <span
                  data-testid="text-osm-readout"
                  className="nm-pill nm-pill-accent"
                >
                  {osmResult.count} found · {osmResult.nearestM}m
                </span>
              )}
              {!loadingOsm && osmResult?.matched === false && (
                <span data-testid="text-osm-readout" className="text-[10px]" style={{ color: '#dc3c3c' }}>
                  none found
                </span>
              )}
              {!loadingOsm && osmResult?.matched === null && (
                <span data-testid="text-osm-readout" className="text-[10px]" style={{ color: '#e8a020' }}>
                  unavailable
                </span>
              )}
            </div>
            <span
              style={{
                display: 'inline-block',
                color: 'var(--nm-dark)',
                fontSize: 11,
                flexShrink: 0,
                transition: 'transform 0.2s',
                transform: osmExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >▾</span>
          </button>

          {osmExpanded && (
            <div style={{ borderTop: '1px solid rgba(184,192,204,0.25)' }}>
              {loadingOsm ? (
                <p
                  className="px-4 py-3 text-[11px] animate-pulse"
                  style={{ color: 'var(--nm-dark)', fontFamily: 'var(--app-font-mono)' }}
                >
                  Querying OpenStreetMap…
                </p>
              ) : osmResult?.matched === null ? (
                <p className="px-4 py-3 text-xs" style={{ color: '#e8a020' }}>
                  OSM unavailable — neutral score applied
                </p>
              ) : !osmResult?.features.length ? (
                <p className="px-4 py-3 text-xs" style={{ color: 'var(--nm-dark)' }}>
                  No matching features within radius
                </p>
              ) : (
                <ul className="max-h-44 overflow-y-auto">
                  {osmResult!.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between px-4 py-2 gap-2"
                      style={{
                        borderBottom:
                          i < osmResult!.features.length - 1
                            ? '1px solid rgba(184,192,204,0.2)'
                            : 'none',
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="nm-pill nm-pill-accent shrink-0">{f.kind}</span>
                        <span
                          className="text-xs truncate"
                          style={{ color: 'var(--nm-fg)' }}
                          title={f.name}
                        >
                          {f.name}
                        </span>
                      </div>
                      <span
                        className="text-[10px] shrink-0 tabular-nums"
                        style={{ color: 'var(--nm-dark)', fontFamily: 'var(--app-font-mono)' }}
                      >
                        {f.distanceM}m
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-auto pt-1 flex gap-3">
          <button
            type="button"
            data-testid="button-cancel-report"
            onClick={onClose}
            className="nm-btn flex-1 py-3 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            data-testid="button-submit-report"
            disabled={loadingOsm}
            className="nm-btn nm-btn-accent flex-1 py-3 text-sm font-semibold"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { createRoot } from 'react-dom/client';
import { ReportPanel } from './components/ReportPanel';
import { ChainStatus } from './components/ChainStatus';
import { Legend } from './components/Legend';
import { ReportPopup } from './components/ReportPopup';
import { IdentityBadge } from './components/IdentityBadge';
import { addReport, getAllReports, getReport, updateReport, buildHeatmapPoints } from './lib/store';
import { appendToChain, getChainLength } from './lib/chain';
import { checkImpossibleTravel, recordAction } from './lib/security';
import { computeScore, scoreToColor } from './lib/scoring';
import type { Report } from './lib/types';

// Fix Leaflet's default icon path issues with bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '',
  iconUrl: '',
  shadowUrl: '',
});

function createLeafletIcon(score: number, flagged: boolean): L.DivIcon {
  const color = flagged ? '#f97316' : scoreToColor(score);
  const bg = flagged ? 'transparent' : color + 'aa';
  const border = flagged ? 'border-style:dashed;' : '';
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${bg};border:2px solid ${color};${border}box-shadow:0 0 8px ${color};cursor:pointer;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });
}

export default function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const heatRef = useRef<L.HeatLayer | null>(null);

  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lon: number } | null>(null);
  // Initialize from persisted chain so count survives refresh
  const [chainLength, setChainLength] = useState(() => getChainLength());
  // Seed tick from loaded reports so the overlay reflects persisted data immediately
  const [, setTick] = useState(() => getAllReports().length);

  const markersRef = useRef<Map<string, {
    marker: L.Marker;
    popup: L.Popup;
    root: ReturnType<typeof createRoot>;
    popupEl: HTMLElement;
  }>>(new Map());

  // Init map once on mount
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = L.map(mapContainer.current, {
      center: [33.7294, 73.0479], // Islamabad
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Esri World Light Gray — matches neumorphic #e0e5ec surface, English labels, no API key
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, DeLorme, NAVTEQ | Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 16,
      }
    ).addTo(map);
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 16, attribution: '' }
    ).addTo(map);

    // Heat layer (leaflet.heat)
    heatRef.current = L.heatLayer([], {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: 'rgba(239,68,68,0)',
        0.3: '#ef4444',
        0.6: '#f59e0b',
        1.0: '#22c55e',
      },
    }).addTo(map);

    // ── Re-hydrate persisted reports ──────────────────────────────────────
    const persisted = getAllReports();
    for (const report of persisted) {
      const popupEl = document.createElement('div');
      const root = createRoot(popupEl);
      root.render(<ReportPopup report={report} />);

      const popup = L.popup({
        className: 'gc-popup',
        minWidth: 240,
        maxWidth: 300,
        closeButton: true,
        autoPan: true,
      }).setContent(popupEl);

      const marker = L.marker([report.lat, report.lon], {
        icon: createLeafletIcon(report.score, report.flagged),
      });
      marker.on('click', (e: L.LeafletMouseEvent) => { L.DomEvent.stopPropagation(e); });
      marker.bindPopup(popup).addTo(map);

      markersRef.current.set(report.id, { marker, popup, root, popupEl });
    }
    if (persisted.length > 0) {
      heatRef.current?.setLatLngs(buildHeatmapPoints());
    }
    // ─────────────────────────────────────────────────────────────────────

    // Map click → start a report (only on bare map, not on markers)
    map.on('click', (e: L.LeafletMouseEvent) => {
      setPendingLocation({ lat: e.latlng.lat, lon: e.latlng.lng });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      heatRef.current = null;
    };
  }, []);

  const refreshHeatmap = useCallback(() => {
    heatRef.current?.setLatLngs(buildHeatmapPoints());
  }, []);

  const updateMarkerVisuals = useCallback((report: Report) => {
    const item = markersRef.current.get(report.id);
    if (!item) return;
    item.marker.setIcon(createLeafletIcon(report.score, report.flagged));
    item.root.render(<ReportPopup report={report} />);
  }, []);

  const handleSubmitReport = useCallback(async (report: Report) => {
    report.flagged = checkImpossibleTravel(report.lat, report.lon, report.time);
    recordAction();
    report.score = computeScore(report);

    // Add to store (persisted to localStorage)
    addReport(report);
    setTick(t => t + 1);

    // Chain (persisted to localStorage)
    await appendToChain(report);
    setChainLength(getChainLength());

    if (!mapRef.current) return;

    // Popup container (React renders into it)
    const popupEl = document.createElement('div');
    const root = createRoot(popupEl);
    root.render(<ReportPopup report={report} />);

    const popup = L.popup({
      className: 'gc-popup',
      minWidth: 240,
      maxWidth: 300,
      closeButton: true,
      autoPan: true,
    }).setContent(popupEl);

    const marker = L.marker([report.lat, report.lon], {
      icon: createLeafletIcon(report.score, report.flagged),
    });

    // Stop map click from firing when clicking the marker
    marker.on('click', (e: L.LeafletMouseEvent) => { L.DomEvent.stopPropagation(e); });
    marker.bindPopup(popup).addTo(mapRef.current);

    markersRef.current.set(report.id, { marker, popup, root, popupEl });

    refreshHeatmap();
    setPendingLocation(null);
  }, [refreshHeatmap]);

  // Global vote events dispatched from ReportPopup (inside Leaflet popup DOM)
  useEffect(() => {
    const onVote = (e: Event) => {
      const { id, dir } = (e as CustomEvent<{ id: string; dir: 'up' | 'down' }>).detail;
      const report = getReport(id);
      if (!report) return;
      recordAction();
      const updated = updateReport(id, dir === 'up' ? { up: report.up + 1 } : { down: report.down + 1 });
      if (updated) {
        setTick(t => t + 1);
        updateMarkerVisuals(updated);
        refreshHeatmap();
      }
    };
    window.addEventListener('groundcheck:vote', onVote);
    return () => window.removeEventListener('groundcheck:vote', onVote);
  }, [refreshHeatmap, updateMarkerVisuals]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: 'var(--nm-base)' }}>
      <div
        ref={mapContainer}
        data-testid="map-container"
        style={{ width: '100%', height: '100%' }}
      />

      <ChainStatus reports={getAllReports()} chainLength={chainLength} />
      <IdentityBadge />
      <Legend />

      {pendingLocation && (
        <ReportPanel
          pendingLocation={pendingLocation}
          onSubmit={handleSubmitReport}
          onClose={() => setPendingLocation(null)}
        />
      )}
    </div>
  );
}

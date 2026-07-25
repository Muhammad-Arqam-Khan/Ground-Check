import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { createRoot } from 'react-dom/client';
import { TokenDialog } from './components/TokenDialog';
import { ReportPanel } from './components/ReportPanel';
import { ChainStatus } from './components/ChainStatus';
import { Legend } from './components/Legend';
import { ReportPopup } from './components/ReportPopup';
import { addReport, getAllReports, getReport, updateReport, buildHeatmapGeoJSON } from './lib/store';
import { appendToChain, getChainLength } from './lib/chain';
import { checkImpossibleTravel, recordAction } from './lib/security';
import { computeScore, scoreToColor } from './lib/scoring';
import type { Report } from './lib/types';

function createMarkerElement(score: number, flagged: boolean): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = `
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid ${flagged ? '#f97316' : scoreToColor(score)};
    background: ${flagged ? 'transparent' : scoreToColor(score) + '99'};
    cursor: pointer;
    box-shadow: 0 0 6px ${flagged ? '#f97316' : scoreToColor(score)};
    ${flagged ? 'border-style: dashed;' : ''}
  `;
  return el;
}

export default function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('mapbox_token'));
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [chainLength, setChainLength] = useState<number>(0);
  
  // Track state so react can rerender overlay components
  const [reportsTick, setReportsTick] = useState(0);

  // Store references to mapbox markers/popups
  const markersRef = useRef<Map<string, { marker: mapboxgl.Marker; popup: mapboxgl.Popup; root: ReturnType<typeof createRoot>; el: HTMLElement }>>(new Map());

  // Handle Token
  const handleToken = (t: string) => {
    sessionStorage.setItem('mapbox_token', t);
    setToken(t);
  };

  // Init Map
  useEffect(() => {
    if (!token || !mapContainer.current || mapRef.current) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [73.0479, 33.7294], // Islamabad
      zoom: 12,
    });
    
    map.addControl(new mapboxgl.NavigationControl(), 'top-left');
    mapRef.current = map;

    map.on('load', () => {
      map.addSource('reports', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      
      map.addLayer({
        id: 'reports-heat',
        type: 'heatmap',
        source: 'reports',
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-radius': ['get', 'radius'],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(239,68,68,0)',
            0.4, 'rgba(239,68,68,0.6)',
            0.6, 'rgba(245,158,11,0.7)',
            1, 'rgba(34,197,94,0.9)',
          ],
          'heatmap-opacity': 0.75,
        },
      });

      map.on('click', (e) => {
        // Prevent opening panel if we clicked on a marker
        // Unfortunately standard markers don't trigger map 'click' with features, 
        // they stop propagation themselves if we click the marker element.
        // We just ensure pending location gets updated on raw map clicks.
        setPendingLocation({ lat: e.lngLat.lat, lon: e.lngLat.lng });
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  // Handle heatmap refresh
  const refreshHeatmap = useCallback(() => {
    if (!mapRef.current) return;
    const source = mapRef.current.getSource('reports') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(buildHeatmapGeoJSON());
    }
  }, []);

  // Update a marker visually
  const updateMarkerVisuals = useCallback((report: Report) => {
    const item = markersRef.current.get(report.id);
    if (!item) return;
    
    // Update marker styling
    const color = scoreToColor(report.score);
    item.el.style.borderColor = report.flagged ? '#f97316' : color;
    item.el.style.backgroundColor = report.flagged ? 'transparent' : color + '99';
    item.el.style.boxShadow = `0 0 6px ${report.flagged ? '#f97316' : color}`;

    // Update popup react content
    item.root.render(<ReportPopup report={report} />);
  }, []);

  // Handle Report Submission
  const handleSubmitReport = async (report: Report) => {
    // 1. Checks & computes
    report.flagged = checkImpossibleTravel(report.lat, report.lon, report.time);
    recordAction();
    report.score = computeScore(report);
    
    // 2. Add to store
    addReport(report);
    setReportsTick(t => t + 1);

    // 3. Chain
    await appendToChain(report);
    setChainLength(getChainLength());

    // 4. Map Marker & Popup
    const el = createMarkerElement(report.score, report.flagged);
    
    const popupContainer = document.createElement('div');
    // Basic mapbox popup styles conflict with our dark theme, so we'll customize in CSS or just use our react component's styles
    popupContainer.className = 'bg-card border border-border rounded-lg shadow-xl overflow-hidden';
    
    const popup = new mapboxgl.Popup({ 
      offset: 15,
      closeButton: false,
      maxWidth: '300px',
      className: 'groundcheck-popup' // Will need some CSS if we want to override Mapbox's white background
    }).setDOMContent(popupContainer);
    
    const root = createRoot(popupContainer);
    root.render(<ReportPopup report={report} />);

    if (mapRef.current) {
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([report.lon, report.lat])
        .setPopup(popup)
        .addTo(mapRef.current);
        
      markersRef.current.set(report.id, { marker, popup, root, el });
    }

    refreshHeatmap();
    setPendingLocation(null);
  };

  // Handle global vote events from popups
  useEffect(() => {
    const onVote = (e: Event) => {
      const { id, dir } = (e as CustomEvent).detail;
      const report = getReport(id);
      if (!report) return;

      recordAction();
      const updates = dir === 'up' 
        ? { up: report.up + 1 }
        : { down: report.down + 1 };
        
      const updated = updateReport(id, updates);
      if (updated) {
        setReportsTick(t => t + 1);
        updateMarkerVisuals(updated);
        refreshHeatmap();
      }
    };

    window.addEventListener('groundcheck:vote', onVote);
    return () => window.removeEventListener('groundcheck:vote', onVote);
  }, [refreshHeatmap, updateMarkerVisuals]);

  // Inject Mapbox Popup CSS overrides
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .groundcheck-popup .mapboxgl-popup-content {
        background: transparent;
        padding: 0;
        box-shadow: none;
      }
      .groundcheck-popup .mapboxgl-popup-tip {
        border-top-color: hsl(var(--card));
        border-bottom-color: hsl(var(--card));
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#0a0c10' }}>
      {!token && <TokenDialog onToken={handleToken} />}
      
      <div 
        ref={mapContainer} 
        data-testid="map-container"
        style={{ width: '100%', height: '100%' }} 
      />
      
      {token && (
        <>
          <ChainStatus reports={getAllReports()} chainLength={chainLength} />
          <Legend />
          
          {pendingLocation && (
            <ReportPanel
              pendingLocation={pendingLocation}
              onSubmit={handleSubmitReport}
              onClose={() => setPendingLocation(null)}
            />
          )}
        </>
      )}
    </div>
  );
}

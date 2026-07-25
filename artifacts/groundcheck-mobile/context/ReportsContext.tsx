import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Report, ReportCategory } from '@/lib/types';
import { computeScore } from '@/lib/scoring';

// ── API base URL ─────────────────────────────────────────────────────────────
// EXPO_PUBLIC_DOMAIN is injected by the dev script as $REPLIT_DEV_DOMAIN.
// On production/native builds set EXPO_PUBLIC_API_BASE_URL explicitly.
const EXPO_PUBLIC_DOMAIN = process.env.EXPO_PUBLIC_DOMAIN ?? '';
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL
  ?? (EXPO_PUBLIC_DOMAIN ? `https://${EXPO_PUBLIC_DOMAIN}/api` : '/api');

const STORAGE_KEY = 'groundcheck:reports';

// ── API shape (canonical) ────────────────────────────────────────────────────
interface ApiReport {
  id: string;
  lat: number;
  lon: number;
  radiusMeters: number;
  category: string;
  description: string;
  timestamp: number;
  up: number;
  down: number;
  flagged: boolean;
  score: number;
  session?: string;
  reporterStatus?: string;
  reporterIdentityId?: string;
}

function localToApi(r: Report): ApiReport {
  return {
    id: r.id,
    lat: r.lat,
    lon: r.lon,
    radiusMeters: r.radiusMeters,
    category: r.category,
    description: r.description,
    timestamp: r.timestamp,
    up: r.up,
    down: r.down,
    flagged: r.flagged,
    score: r.score,
  };
}

function apiToLocal(a: ApiReport): Report {
  return {
    id: a.id,
    lat: a.lat,
    lon: a.lon,
    radiusMeters: a.radiusMeters,
    // Cast: may receive web categories (fraud/hazard/unsafe/scam) from API
    category: a.category as ReportCategory,
    description: a.description,
    timestamp: a.timestamp,
    up: a.up,
    down: a.down,
    flagged: a.flagged,
    score: a.score,
  };
}

// ── Context types ────────────────────────────────────────────────────────────

interface NewReportData {
  lat: number;
  lon: number;
  radiusMeters: number;
  category: ReportCategory;
  description: string;
}

interface ReportsContextType {
  reports: Report[];
  loading: boolean;
  addReport: (data: NewReportData) => void;
  voteReport: (id: string, vote: 'up' | 'down') => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // ── On mount: fetch from API; fall back to AsyncStorage ─────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      try {
        const res = await fetch(`${API_BASE}/reports`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const apiReports: ApiReport[] = await res.json();
        const mapped = apiReports.map(apiToLocal);
        if (!cancelled) {
          setReports(mapped);
          // Keep local cache in sync for offline use
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mapped)).catch(() => {});
        }
      } catch {
        // API unavailable — fall back to locally cached reports
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          if (raw && !cancelled) {
            setReports(JSON.parse(raw) as Report[]);
          }
        } catch {
          // Corrupted storage — start fresh
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadReports();
    return () => { cancelled = true; };
  }, []);

  // ── Persist locally (offline cache) ─────────────────────────────────────
  const persistLocally = useCallback((updated: Report[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  }, []);

  // ── Add report: update local state + POST to API ─────────────────────────
  const addReport = useCallback(
    (data: NewReportData) => {
      const report: Report = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        ...data,
        timestamp: Date.now(),
        up: 0,
        down: 0,
        flagged: false,
        score: 0,
      };
      report.score = computeScore(report);

      setReports((prev) => {
        const updated = [...prev, report];
        persistLocally(updated);
        return updated;
      });

      // Sync to API (fire-and-forget — local state is already updated)
      fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localToApi(report)),
      }).catch(() => {});
    },
    [persistLocally],
  );

  // ── Vote: update local state + PATCH API ────────────────────────────────
  const voteReport = useCallback(
    (id: string, vote: 'up' | 'down') => {
      setReports((prev) => {
        const updated = prev.map((r) => {
          if (r.id !== id) return r;
          const next: Report = { ...r, [vote]: r[vote] + 1 };
          next.score = computeScore(next);
          // Sync vote to API
          fetch(`${API_BASE}/reports/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [vote]: next[vote], score: next.score }),
          }).catch(() => {});
          return next;
        });
        persistLocally(updated);
        return updated;
      });
    },
    [persistLocally],
  );

  return (
    <ReportsContext.Provider value={{ reports, loading, addReport, voteReport }}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports(): ReportsContextType {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be used inside ReportsProvider');
  return ctx;
}

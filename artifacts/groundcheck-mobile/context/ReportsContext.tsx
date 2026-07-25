import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Report, ReportCategory } from '@/lib/types';
import { computeScore } from '@/lib/scoring';

const STORAGE_KEY = 'groundcheck:reports';

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

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            setReports(JSON.parse(raw) as Report[]);
          } catch {
            // corrupted storage — start fresh
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((updated: Report[]) => {
    setReports(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  }, []);

  const addReport = useCallback(
    (data: NewReportData) => {
      const report: Report = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...data,
        timestamp: Date.now(),
        up: 0,
        down: 0,
        flagged: false,
        score: 0,
      };
      report.score = computeScore(report);
      persist([...reports, report]);
    },
    [reports, persist],
  );

  const voteReport = useCallback(
    (id: string, vote: 'up' | 'down') => {
      const updated = reports.map((r) => {
        if (r.id !== id) return r;
        const next: Report = { ...r, [vote]: r[vote] + 1 };
        next.score = computeScore(next);
        return next;
      });
      persist(updated);
    },
    [reports, persist],
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

export type ReportCategory = 'fraud' | 'hazard' | 'unsafe' | 'scam';

export interface OsmFeature {
  name: string;       // tags.name or generated fallback
  kind: string;       // e.g. "supermarket", "residential", "cafe"
  distanceM: number;
}

export interface OsmResult {
  matched: boolean | null;  // null = no Overpass reachability
  nearestM: number | null;
  count: number;
  features: OsmFeature[];   // up to 10 closest, sorted by distance
}

export interface Report {
  id: string;             // uuid
  category: ReportCategory;
  desc: string;
  lat: number;
  lon: number;
  radiusMeters: number;
  time: number;           // epoch ms
  session: string;
  up: number;
  down: number;
  osm: OsmResult;
  flagged: boolean;       // impossible-travel check
  score: number;          // computed and cached
}

export interface ChainLink {
  id: string;             // report id
  prevHash: string;
  hash: string;
}

export type ScoreBreakdown = {
  osmPoints: number;      // 0-40
  communityPoints: number; // 0-40
  basePoints: number;     // always 20
  total: number;          // sum
};

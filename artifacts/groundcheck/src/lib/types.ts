export type ReportCategory = 'fraud' | 'hazard' | 'unsafe' | 'scam';

export interface OsmFeature {
  name: string;
  kind: string;
  distanceM: number;
}

export interface OsmResult {
  matched: boolean | null;
  nearestM: number | null;
  count: number;
  features: OsmFeature[];
}

export interface Report {
  id: string;
  category: ReportCategory;
  desc: string;
  lat: number;
  lon: number;
  radiusMeters: number;
  time: number;
  session: string;
  up: number;
  down: number;
  osm: OsmResult;
  flagged: boolean;
  score: number;
  /** Identity status of the reporter at submission time */
  reporterStatus?: 'verified' | 'flagged' | 'guest';
  /** Identity ID of the reporter (undefined for guest) */
  reporterIdentityId?: string;
}

export interface ChainLink {
  id: string;
  prevHash: string;
  hash: string;
  /** 'report' (default) or 'signup_flagged' / 'signup_verified' */
  entryType?: string;
}

export type ScoreBreakdown = {
  osmPoints: number;
  communityPoints: number;
  basePoints: number;
  total: number;
};

// ── Identity types ──────────────────────────────────────────────────────────

export interface IdentityRecord {
  id: string;                 // uuid
  name: string;
  phone?: string;
  maskedCnic: string;         // 12345-•••••••-1
  cnicHash: string;           // SHA-256 of normalised CNIC (dedup key)
  encryptedCnic: string;      // base64(AES-GCM(cnic text))
  encryptedImage: string;     // base64(AES-GCM(compressed jpeg bytes))
  keyJwk: string;             // exported AES key JWK (for admin recovery)
  ivCnic: string;             // base64 IV used for CNIC
  ivImage: string;            // base64 IV used for image
  status: 'verified' | 'flagged';
  ocrConfidence: number;      // 0–100
  timestamp: number;          // epoch ms
  sessionToken: string;       // uuid stored in LS session key
}

export interface SignupChainEntry {
  type: 'signup_verified' | 'signup_flagged';
  identityId: string;
  name: string;
  maskedCnic: string;
  timestamp: number;
  ocrConfidence: number;
}

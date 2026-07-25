import type { Report, ChainLink, SignupChainEntry } from './types';

const LS_KEY = 'groundcheck:chain';

function loadFromStorage(): ChainLink[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChainLink[];
  } catch {
    return [];
  }
}

function saveToStorage(chain: ChainLink[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(chain));
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}

const chain: ChainLink[] = loadFromStorage();

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Core fields hashed (stable subset of Report)
function coreFields(report: Report) {
  return {
    id: report.id,
    category: report.category,
    lat: report.lat,
    lon: report.lon,
    time: report.time,
    session: report.session,
    desc: report.desc,
  };
}

export async function appendToChain(report: Report): Promise<ChainLink> {
  const prevHash = chain.length > 0 ? chain[chain.length - 1].hash : '0'.repeat(64);
  const input = prevHash + JSON.stringify(coreFields(report));
  const hash = await sha256(input);
  const link: ChainLink = { id: report.id, prevHash, hash, entryType: 'report' };
  chain.push(link);
  saveToStorage(chain);
  return link;
}

/** Append a signup event (verified or flagged) to the chain. */
export async function appendSignupEvent(entry: SignupChainEntry): Promise<ChainLink> {
  const prevHash = chain.length > 0 ? chain[chain.length - 1].hash : '0'.repeat(64);
  // Never include raw CNIC in the hash input — use maskedCnic only
  const safeFields = {
    type:          entry.type,
    identityId:    entry.identityId,
    name:          entry.name,
    maskedCnic:    entry.maskedCnic,
    timestamp:     entry.timestamp,
    ocrConfidence: entry.ocrConfidence,
  };
  const input = prevHash + JSON.stringify(safeFields);
  const hash  = await sha256(input);
  const link: ChainLink = {
    id:        entry.identityId,
    prevHash,
    hash,
    entryType: entry.type,
  };
  chain.push(link);
  saveToStorage(chain);
  return link;
}

export function getChain(): ChainLink[] {
  return [...chain];
}

export function getChainLength(): number {
  return chain.length;
}

/** Clear persisted chain (useful for testing). */
export function clearChain(): void {
  chain.length = 0;
  localStorage.removeItem(LS_KEY);
}

// Returns: { ok: true } or { ok: false, brokenAt: index, reportId: string }
export async function verifyChain(reports: Report[]): Promise<
  { ok: true } | { ok: false; brokenAt: number; reportId: string; expected: string; got: string }
> {
  let prevHash = '0'.repeat(64);
  for (let i = 0; i < chain.length; i++) {
    const link = chain[i];
    // Skip non-report entries during report-chain verification
    if (link.entryType && link.entryType !== 'report') {
      prevHash = link.hash;
      continue;
    }
    const report = reports.find(r => r.id === link.id);
    if (!report) return { ok: false, brokenAt: i, reportId: link.id, expected: link.hash, got: 'report not found' };
    const input = prevHash + JSON.stringify(coreFields(report));
    const recomputed = await sha256(input);
    if (recomputed !== link.hash) {
      return { ok: false, brokenAt: i, reportId: link.id, expected: link.hash, got: recomputed };
    }
    prevHash = link.hash;
  }
  return { ok: true };
}

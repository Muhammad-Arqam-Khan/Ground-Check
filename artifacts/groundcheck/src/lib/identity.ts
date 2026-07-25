import type { IdentityRecord } from './types';

// ── Storage keys ────────────────────────────────────────────────────────────
const LS_IDENTITIES = 'groundcheck:identities';
const LS_SESSION    = 'groundcheck:session';
const SS_ATTEMPTS   = 'groundcheck:signup_attempts';

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 min

// ── CNIC utilities ───────────────────────────────────────────────────────────

export function maskCnic(cnic: string): string {
  const parts = cnic.trim().split('-');
  if (parts.length !== 3) return cnic;
  return `${parts[0]}-${'•'.repeat(parts[1].length)}-${parts[2]}`;
}

export function normalizeCnic(cnic: string): string {
  return cnic.replace(/[-\s]/g, '').toLowerCase();
}

export async function hashCnic(cnic: string): Promise<string> {
  const bytes = new TextEncoder().encode(normalizeCnic(cnic));
  const buf   = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── AES-GCM encryption ───────────────────────────────────────────────────────

export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function exportKeyJwk(key: CryptoKey): Promise<string> {
  const jwk = await crypto.subtle.exportKey('jwk', key);
  return JSON.stringify(jwk);
}

async function encryptBytes(data: Uint8Array, key: CryptoKey): Promise<{ b64: string; iv: string }> {
  const iv        = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const b64Enc    = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  const b64Iv     = btoa(String.fromCharCode(...iv));
  return { b64: b64Enc, iv: b64Iv };
}

export async function encryptText(text: string, key: CryptoKey) {
  return encryptBytes(new TextEncoder().encode(text), key);
}

export async function encryptBuffer(buffer: ArrayBuffer, key: CryptoKey) {
  return encryptBytes(new Uint8Array(buffer), key);
}

// ── Image compression ────────────────────────────────────────────────────────
// Scales down to ≤800px and re-encodes as JPEG @70% to keep localStorage happy.

export function compressImage(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim  = 800;
      const scale   = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas  = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('canvas unavailable')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        blob => { blob ? blob.arrayBuffer().then(resolve) : reject(new Error('compression failed')); },
        'image/jpeg',
        0.7,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image load failed')); };
    img.src = url;
  });
}

// ── OCR comparison ───────────────────────────────────────────────────────────
// Returns true if both name and CNIC are plausibly found in the OCR text.

export function ocrMatches(ocrText: string, name: string, cnic: string): boolean {
  const haystack = ocrText.toLowerCase().replace(/[^a-z0-9]/g, ' ');
  
  // Check CNIC — normalise digits and look for the digit sequence
  const cnicDigits = normalizeCnic(cnic);          // e.g. "123451234567" + "1" → no, keep all digits
  const cnicNorm   = cnic.replace(/[^0-9]/g, '');  // pure digits
  const ocrDigits  = ocrText.replace(/[^0-9]/g, '');
  const cnicFound  = ocrDigits.includes(cnicNorm) || ocrDigits.includes(cnicNorm.slice(0, -1));

  // Check name — each part of the name should appear somewhere
  const nameParts = name.toLowerCase().split(/\s+/).filter(p => p.length > 1);
  const nameFound = nameParts.length === 0 || nameParts.some(part => haystack.includes(part));

  return cnicFound && nameFound;
}

// ── Rate limiting ────────────────────────────────────────────────────────────

function getAttempts(): number[] {
  try {
    const raw = sessionStorage.getItem(SS_ATTEMPTS);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch { return []; }
}

function saveAttempts(a: number[]): void {
  try { sessionStorage.setItem(SS_ATTEMPTS, JSON.stringify(a)); } catch {}
}

export function checkRateLimit(): { allowed: boolean; secondsUntilReset: number } {
  const now      = Date.now();
  const attempts = getAttempts().filter(t => t > now - RATE_LIMIT_WINDOW_MS);
  if (attempts.length < RATE_LIMIT_MAX) return { allowed: true, secondsUntilReset: 0 };
  const resetAt  = attempts[0] + RATE_LIMIT_WINDOW_MS;
  return { allowed: false, secondsUntilReset: Math.ceil((resetAt - now) / 1000) };
}

export function recordSignupAttempt(): void {
  const now      = Date.now();
  const attempts = getAttempts().filter(t => t > now - RATE_LIMIT_WINDOW_MS);
  attempts.push(now);
  saveAttempts(attempts);
}

// ── Persistence ──────────────────────────────────────────────────────────────

function loadIdentities(): IdentityRecord[] {
  try {
    const raw = localStorage.getItem(LS_IDENTITIES);
    return raw ? (JSON.parse(raw) as IdentityRecord[]) : [];
  } catch { return []; }
}

function saveIdentities(list: IdentityRecord[]): void {
  try { localStorage.setItem(LS_IDENTITIES, JSON.stringify(list)); } catch {}
}

export function getAllIdentities(): IdentityRecord[] {
  return loadIdentities();
}

export function findByCnicHash(hash: string): IdentityRecord | undefined {
  return loadIdentities().find(i => i.cnicHash === hash);
}

export function storeIdentity(identity: IdentityRecord): void {
  const list = loadIdentities();
  const idx  = list.findIndex(i => i.id === identity.id);
  if (idx >= 0) list[idx] = identity; else list.push(identity);
  saveIdentities(list);
}

// ── Session ──────────────────────────────────────────────────────────────────

export function getSession(): IdentityRecord | null {
  try {
    const token = localStorage.getItem(LS_SESSION);
    if (!token) return null;
    return loadIdentities().find(i => i.sessionToken === token) ?? null;
  } catch { return null; }
}

export function setSession(token: string): void {
  try { localStorage.setItem(LS_SESSION, token); } catch {}
}

export function clearSession(): void {
  try { localStorage.removeItem(LS_SESSION); } catch {}
}

import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createWorker } from 'tesseract.js';
import {
  maskCnic,
  hashCnic,
  generateKey,
  exportKeyJwk,
  encryptText,
  encryptBuffer,
  compressImage,
  ocrMatches,
  checkRateLimit,
  recordSignupAttempt,
  findByCnicHash,
  storeIdentity,
  setSession,
} from '../lib/identity';
import { appendSignupEvent } from '../lib/chain';
import type { IdentityRecord, SignupChainEntry } from '../lib/types';

const CNIC_RE = /^\d{5}-\d{7}-\d$/;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

type Step = 'form' | 'ocr' | 'done';

export function Signup() {
  const navigate = useNavigate();

  const [name, setName]       = useState('');
  const [cnic, setCnic]       = useState('');
  const [phone, setPhone]     = useState('');
  const [file, setFile]       = useState<File | null>(null);
  const [consent, setConsent] = useState(false);

  const [cnicError, setCnicError]   = useState('');
  const [fileError, setFileError]   = useState('');
  const [formError, setFormError]   = useState('');

  const [step, setStep]           = useState<Step>('form');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [resultStatus, setResultStatus] = useState<'verified' | 'flagged' | null>(null);
  const [maskedCnicDisplay, setMaskedCnicDisplay] = useState('');

  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── Live CNIC format validation ──────────────────────────────────────────
  const handleCnicChange = (raw: string) => {
    // Auto-insert hyphens as the user types digits
    const digits = raw.replace(/[^0-9]/g, '');
    let formatted = digits;
    if (digits.length > 5)  formatted = digits.slice(0, 5) + '-' + digits.slice(5);
    if (digits.length > 12) formatted = formatted.slice(0, 14) + '-' + digits.slice(12, 13);
    setCnic(formatted);
    if (formatted.length > 0 && !CNIC_RE.test(formatted) && digits.length === 13) {
      setCnicError('Format must be 12345-1234567-1');
    } else {
      setCnicError('');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(null);
    setFileError('');
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError('Only JPG or PNG images are accepted.');
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setFileError('File must be under 5 MB.');
      return;
    }
    setFile(f);
  };

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Rate limit check
    const { allowed, secondsUntilReset } = checkRateLimit();
    if (!allowed) {
      startCountdown(secondsUntilReset);
      setFormError(`Too many attempts. Try again in ${secondsUntilReset}s.`);
      return;
    }

    // Validation
    if (!name.trim())           { setFormError('Full name is required.'); return; }
    if (!CNIC_RE.test(cnic))    { setFormError('Enter a valid CNIC number.'); return; }
    if (!file)                  { setFormError('Please upload your CNIC front photo.'); return; }
    if (!consent)               { setFormError('You must accept the consent statement.'); return; }

    // Duplicate check
    const cnicHashValue = await hashCnic(cnic);
    if (findByCnicHash(cnicHashValue)) {
      setFormError('An account with this CNIC is already registered. Please log in.');
      return;
    }

    recordSignupAttempt();
    setStep('ocr');
    setOcrProgress(0);

    // ── OCR ────────────────────────────────────────────────────────────────
    let ocrText        = '';
    let ocrConfidence  = 0;
    try {
      const worker = await createWorker('eng', 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(file);
      ocrText       = data.text ?? '';
      ocrConfidence = Math.round(data.confidence ?? 0);
      await worker.terminate();
    } catch {
      // OCR failure → treat as flagged (non-blocking)
      ocrText       = '';
      ocrConfidence = 0;
    }

    setOcrProgress(100);

    const matched = ocrMatches(ocrText, name.trim(), cnic);
    const status: 'verified' | 'flagged' = matched ? 'verified' : 'flagged';

    // ── Encrypt & store ────────────────────────────────────────────────────
    const key     = await generateKey();
    const keyJwk  = await exportKeyJwk(key);

    const { b64: encCnic,  iv: ivCnic  } = await encryptText(cnic, key);
    let encImage = ''; let ivImage = '';
    try {
      const compressed = await compressImage(file);
      const enc        = await encryptBuffer(compressed, key);
      encImage = enc.b64;
      ivImage  = enc.iv;
    } catch {
      // Image encryption failure is non-fatal — store empty placeholder
    }

    const sessionToken = crypto.randomUUID();
    const identityId   = crypto.randomUUID();

    const identity: IdentityRecord = {
      id: identityId,
      name: name.trim(),
      phone: phone.trim() || undefined,
      maskedCnic: maskCnic(cnic),
      cnicHash: cnicHashValue,
      encryptedCnic:  encCnic,
      encryptedImage: encImage,
      keyJwk,
      ivCnic,
      ivImage,
      status,
      ocrConfidence,
      timestamp: Date.now(),
      sessionToken,
    };

    storeIdentity(identity);

    // ── Chain entry ────────────────────────────────────────────────────────
    const chainEntry: SignupChainEntry = {
      type:          `signup_${status}` as SignupChainEntry['type'],
      identityId,
      name:          name.trim(),
      maskedCnic:    maskCnic(cnic),
      timestamp:     identity.timestamp,
      ocrConfidence,
    };
    await appendSignupEvent(chainEntry);

    setSession(sessionToken);
    setMaskedCnicDisplay(maskCnic(cnic));
    setResultStatus(status);
    setStep('done');
  };

  // ── OCR progress screen ──────────────────────────────────────────────────
  if (step === 'ocr') {
    return (
      <div className="nm-page-center">
        <div className="nm-card" style={{ maxWidth: 380, textAlign: 'center' }}>
          <div className="nm-logo-mark mb-6">
            <span style={{ fontSize: 32 }}>🔍</span>
          </div>
          <h2 className="nm-heading mb-2">Verifying identity</h2>
          <p className="nm-sub mb-6">Running OCR on your CNIC image…</p>

          <div className="nm-progress-track">
            <div className="nm-progress-fill" style={{ width: `${ocrProgress}%` }} />
          </div>
          <p className="nm-mono mt-3">{ocrProgress}%</p>
        </div>
      </div>
    );
  }

  // ── Result screen ────────────────────────────────────────────────────────
  if (step === 'done') {
    const isVerified = resultStatus === 'verified';
    return (
      <div className="nm-page-center">
        <div className="nm-card" style={{ maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{isVerified ? '✅' : '🔎'}</div>
          <h2 className="nm-heading mb-3">
            {isVerified ? 'Identity Verified' : 'Submitted for Review'}
          </h2>
          <p className="nm-sub mb-4">
            {isVerified
              ? 'Your CNIC details matched the uploaded document. Your account is verified.'
              : "Your details couldn't be automatically confirmed and have been flagged for review. You can still use GroundCheck while your account is reviewed."}
          </p>
          <div
            className="nm-inset-sm rounded-xl px-4 py-3 mb-6 text-left text-xs"
            style={{ color: 'var(--nm-fg-muted)', fontFamily: 'var(--app-font-mono)' }}
          >
            <div>CNIC: {maskedCnicDisplay}</div>
            <div>Status: <span style={{ color: isVerified ? '#4ab964' : '#e8a020', fontWeight: 600 }}>{isVerified ? 'VERIFIED' : 'FLAGGED'}</span></div>
          </div>
          <button
            className="nm-btn nm-btn-accent w-full py-3"
            onClick={() => navigate('/')}
          >
            Open GroundCheck Map →
          </button>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className="nm-page-center" style={{ padding: '24px 16px' }}>
      <div className="nm-card" style={{ maxWidth: 440, width: '100%' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="nm-btn w-9 h-9 rounded-full text-base" style={{ color: 'var(--nm-fg-muted)' }}>←</Link>
          <div>
            <h1 className="nm-heading">Create account</h1>
            <p className="nm-sub">Identity verification · Pakistan CNIC</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Full name */}
            <div>
              <label className="nm-label">Full name</label>
              <input
                className="nm-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="As printed on CNIC"
                autoComplete="name"
                required
              />
            </div>

            {/* CNIC */}
            <div>
              <label className="nm-label">CNIC number</label>
              <input
                className="nm-input"
                type="text"
                value={cnic}
                onChange={e => handleCnicChange(e.target.value)}
                placeholder="12345-1234567-1"
                maxLength={15}
                inputMode="numeric"
                required
              />
              {cnicError && <p className="nm-field-error">{cnicError}</p>}
              <p className="nm-field-hint">Format: 5 digits – 7 digits – 1 digit</p>
            </div>

            {/* Phone (optional) */}
            <div>
              <label className="nm-label">Phone number <span style={{ color: 'var(--nm-dark)', fontWeight: 400 }}>(optional)</span></label>
              <input
                className="nm-input"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+92 300 0000000"
                autoComplete="tel"
              />
            </div>

            {/* CNIC photo upload */}
            <div>
              <label className="nm-label">CNIC front photo</label>
              <label
                className="nm-upload-zone"
                htmlFor="cnic-upload"
                style={file ? { borderColor: 'var(--nm-accent)' } : {}}
              >
                {file ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>📄</div>
                    <p style={{ fontSize: 13, color: 'var(--nm-fg)', fontWeight: 500 }}>{file.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--nm-fg-muted)' }}>{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>📷</div>
                    <p style={{ fontSize: 13, color: 'var(--nm-fg)' }}>Click to upload</p>
                    <p style={{ fontSize: 11, color: 'var(--nm-fg-muted)' }}>JPG or PNG · max 5 MB</p>
                  </div>
                )}
              </label>
              <input
                id="cnic-upload"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {fileError && <p className="nm-field-error">{fileError}</p>}
            </div>

            {/* Consent */}
            <label
              className="nm-consent"
              style={{ cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}
            >
              <div
                className="nm-checkbox"
                style={consent ? { background: 'var(--nm-accent)', boxShadow: 'var(--nm-inset-sm)' } : {}}
                onClick={() => setConsent(v => !v)}
                role="checkbox"
                aria-checked={consent}
                tabIndex={0}
                onKeyDown={e => e.key === ' ' && setConsent(v => !v)}
              >
                {consent && <span style={{ color: '#fff', fontSize: 12, lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ fontSize: 12, color: 'var(--nm-fg-muted)', lineHeight: 1.5 }}>
                I understand my CNIC details are collected to verify my identity on this platform and will be stored securely.
              </span>
            </label>

            {/* Error / rate-limit message */}
            {formError && (
              <div className="nm-error-box">{formError}</div>
            )}
            {countdown > 0 && (
              <div className="nm-error-box">
                Please wait <strong>{countdown}s</strong> before trying again.
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="nm-btn nm-btn-accent w-full py-3 text-sm font-semibold"
              disabled={countdown > 0}
            >
              Verify &amp; Create Account
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--nm-fg-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--nm-accent)', textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

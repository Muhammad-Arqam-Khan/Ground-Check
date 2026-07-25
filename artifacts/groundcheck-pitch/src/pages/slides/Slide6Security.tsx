export default function Slide6Security() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#080d18', fontFamily: 'Space Grotesk, sans-serif' }}
    >
      {/* Background glow */}
      <div className="absolute" style={{ top: '30vh', left: '50%', transform: 'translateX(-50%)', width: '50vw', height: '50vh', background: 'radial-gradient(ellipse, rgba(34,197,94,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div className="absolute" style={{ top: '7vh', left: '6vw', right: '6vw' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4vw', color: '#06d6c4', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1.5vh' }}>
          05 — Security Layer
        </div>
        <div style={{ fontWeight: 700, fontSize: '4.2vw', lineHeight: 1.05, letterSpacing: '-0.025em', color: '#e2e8f0' }}>
          Three defenses. One auditable chain.
        </div>
      </div>

      {/* Three security cards */}
      <div
        className="absolute"
        style={{ top: '32vh', left: '5vw', right: '5vw', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2.5vw' }}
      >
        {/* Sybil Defense */}
        <div style={{ background: 'rgba(13,22,39,0.95)', borderRadius: '8px', padding: '4vh 2.5vw', position: 'relative', overflow: 'hidden' }}>
          {/* top accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, #f59e0b, transparent)' }} />
          {/* icon area */}
          <div style={{ width: '5vw', height: '5vw', marginBottom: '2vh', borderRadius: '6px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="2.5vw" height="2.5vw" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
              <line x1="19" y1="4" x2="19" y2="10" stroke="#ef4444" />
              <line x1="16" y1="7" x2="22" y2="7" stroke="#ef4444" />
            </svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: '2.3vw', color: '#e2e8f0', marginBottom: '1.5vh', lineHeight: 1.2 }}>Sybil Defense</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.75vw', color: 'rgba(226,232,240,0.55)', lineHeight: 1.55, marginBottom: '2vh' }}>
            Burst actions from a single session within a rolling 30-second window are automatically down-weighted — never rejected outright to avoid false positives.
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.45vw', color: '#f59e0b', background: 'rgba(245,158,11,0.07)', padding: '1vh 1.2vw', borderRadius: '4px' }}>
            &gt;5 actions / 30s → reduced weight
          </div>
        </div>

        {/* Impossible Travel */}
        <div style={{ background: 'rgba(13,22,39,0.95)', borderRadius: '8px', padding: '4vh 2.5vw', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, #ef4444, transparent)' }} />
          <div style={{ width: '5vw', height: '5vw', marginBottom: '2vh', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="2.5vw" height="2.5vw" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2 L12 12 L17 17" />
              <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" />
            </svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: '2.3vw', color: '#e2e8f0', marginBottom: '1.5vh', lineHeight: 1.2 }}>Impossible Travel</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.75vw', color: 'rgba(226,232,240,0.55)', lineHeight: 1.55, marginBottom: '2vh' }}>
            Back-to-back reports from the same session are checked for required travel speed. Over 200 km/h flags the second report as spoof-suspected.
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.45vw', color: '#ef4444', background: 'rgba(239,68,68,0.07)', padding: '1vh 1.2vw', borderRadius: '4px' }}>
            speed &gt; 200 km/h → flagged
          </div>
        </div>

        {/* Hash Chain */}
        <div style={{ background: 'rgba(13,22,39,0.95)', borderRadius: '8px', padding: '4vh 2.5vw', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, #06d6c4, transparent)' }} />
          <div style={{ width: '5vw', height: '5vw', marginBottom: '2vh', borderRadius: '6px', background: 'rgba(6,214,196,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="2.5vw" height="2.5vw" viewBox="0 0 24 24" fill="none" stroke="#06d6c4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: '2.3vw', color: '#e2e8f0', marginBottom: '1.5vh', lineHeight: 1.2 }}>Hash Chain</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.75vw', color: 'rgba(226,232,240,0.55)', lineHeight: 1.55, marginBottom: '2vh' }}>
            Every report SHA-256 hashed over prevHash + report fields. Verify recomputes from report 0. Any altered record breaks the chain visibly.
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.45vw', color: '#06d6c4', background: 'rgba(6,214,196,0.07)', padding: '1vh 1.2vw', borderRadius: '4px' }}>
            SHA-256 · Web Crypto API
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <div className="absolute" style={{ bottom: '6vh', left: '6vw' }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6vw', color: 'rgba(226,232,240,0.3)' }}>
          Sybil + travel checks protect input integrity — the hash chain protects record integrity after the fact.
        </div>
      </div>

      <div className="absolute" style={{ bottom: 0, left: 0, right: 0, height: '0.4vh', background: 'linear-gradient(to right, transparent, rgba(6,214,196,0.25), transparent)' }} />
    </div>
  );
}

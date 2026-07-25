export default function Slide3Solution() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#080d18', fontFamily: 'Space Grotesk, sans-serif' }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(226,232,240,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.02) 1px, transparent 1px)',
          backgroundSize: '6vw 6vh',
        }}
      />

      {/* Cyan glow top-right */}
      <div className="absolute" style={{ top: '-10vh', right: '-5vw', width: '35vw', height: '35vh', background: 'radial-gradient(ellipse, rgba(6,214,196,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div className="absolute" style={{ top: '7vh', left: '6vw', right: '6vw' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4vw', color: '#06d6c4', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1.5vh' }}>
          02 — The Solution
        </div>
        <div style={{ fontWeight: 700, fontSize: '4.5vw', lineHeight: 1.05, letterSpacing: '-0.025em', color: '#e2e8f0', maxWidth: '70vw', textWrap: 'balance' }}>
          A live trust surface for every location.
        </div>
      </div>

      {/* Three pillars */}
      <div
        className="absolute"
        style={{ top: '35vh', left: '6vw', right: '6vw', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2.5vw' }}
      >
        {/* Pillar 1: Cross-checked */}
        <div style={{ background: 'rgba(13,22,39,0.8)', border: '1px solid rgba(6,214,196,0.18)', borderRadius: '8px', padding: '4vh 2.5vw', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#06d6c4' }} />
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2.8vw', fontWeight: 700, color: '#06d6c4', lineHeight: 1, marginBottom: '1.5vh' }}>01</div>
          <div style={{ fontWeight: 700, fontSize: '2.5vw', color: '#e2e8f0', marginBottom: '1.5vh', lineHeight: 1.15 }}>Cross-checked</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8vw', color: 'rgba(226,232,240,0.55)', lineHeight: 1.5 }}>
            Every report queried against live OpenStreetMap data before it counts. Real features, real ground truth.
          </div>
        </div>

        {/* Pillar 2: Visualized */}
        <div style={{ background: 'rgba(13,22,39,0.8)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '4vh 2.5vw', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#3b82f6' }} />
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2.8vw', fontWeight: 700, color: '#3b82f6', lineHeight: 1, marginBottom: '1.5vh' }}>02</div>
          <div style={{ fontWeight: 700, fontSize: '2.5vw', color: '#e2e8f0', marginBottom: '1.5vh', lineHeight: 1.15 }}>Visualized</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8vw', color: 'rgba(226,232,240,0.55)', lineHeight: 1.5 }}>
            Trust rendered as a continuous heatmap. Radius = spread. Score = intensity. One visual language.
          </div>
        </div>

        {/* Pillar 3: Protected */}
        <div style={{ background: 'rgba(13,22,39,0.8)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '8px', padding: '4vh 2.5vw', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#22c55e' }} />
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2.8vw', fontWeight: 700, color: '#22c55e', lineHeight: 1, marginBottom: '1.5vh' }}>03</div>
          <div style={{ fontWeight: 700, fontSize: '2.5vw', color: '#e2e8f0', marginBottom: '1.5vh', lineHeight: 1.15 }}>Protected</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8vw', color: 'rgba(226,232,240,0.55)', lineHeight: 1.5 }}>
            Tamper-evident SHA-256 chain + sybil detection + impossible-travel flagging.
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="absolute" style={{ bottom: '6vh', left: '6vw' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw', color: 'rgba(226,232,240,0.28)', letterSpacing: '0.06em' }}>
          groundcheck — verify before you act
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute" style={{ bottom: 0, left: 0, right: 0, height: '0.4vh', background: 'linear-gradient(to right, transparent, rgba(6,214,196,0.25), transparent)' }} />
    </div>
  );
}

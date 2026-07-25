export default function Slide5TrustScoring() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#080d18', fontFamily: 'Space Grotesk, sans-serif' }}
    >
      {/* Glow effects */}
      <div className="absolute" style={{ bottom: '-5vh', left: '-5vw', width: '40vw', height: '40vh', background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div className="absolute" style={{ top: '7vh', left: '6vw', right: '6vw' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4vw', color: '#06d6c4', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1.5vh' }}>
          04 — Trust Scoring
        </div>
        <div style={{ fontWeight: 700, fontSize: '4.2vw', lineHeight: 1.05, letterSpacing: '-0.025em', color: '#e2e8f0' }}>
          Trust is a number. The math is open.
        </div>
      </div>

      {/* Formula */}
      <div className="absolute" style={{ top: '30vh', left: '6vw', right: '6vw' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '2.6vw',
          fontWeight: 700,
          color: '#e2e8f0',
          background: 'rgba(13,22,39,0.95)',
          border: '1px solid rgba(6,214,196,0.25)',
          borderRadius: '8px',
          padding: '2.5vh 3vw',
          display: 'flex',
          alignItems: 'center',
          gap: '1vw',
          flexWrap: 'wrap',
        }}>
          <span style={{ color: 'rgba(226,232,240,0.5)' }}>score</span>
          <span style={{ color: 'rgba(226,232,240,0.35)' }}>=</span>
          <span style={{ color: '#06d6c4' }}>osmPoints</span>
          <span style={{ color: 'rgba(226,232,240,0.35)' }}>+</span>
          <span style={{ color: '#3b82f6' }}>communityPoints</span>
          <span style={{ color: 'rgba(226,232,240,0.35)' }}>+</span>
          <span style={{ color: '#a78bfa' }}>basePoints</span>
          <span style={{ marginLeft: 'auto', fontWeight: 400, fontSize: '1.6vw', color: 'rgba(226,232,240,0.35)' }}>max 100</span>
        </div>
      </div>

      {/* Three components */}
      <div
        className="absolute"
        style={{ top: '50vh', left: '6vw', right: '6vw', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2.5vw' }}
      >
        {/* OSM Points */}
        <div style={{ background: 'rgba(13,22,39,0.8)', border: '1px solid rgba(6,214,196,0.15)', borderRadius: '6px', padding: '2.5vh 2vw' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5vw', marginBottom: '1.5vh' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '3vw', color: '#06d6c4' }}>0–40</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4vw', color: 'rgba(6,214,196,0.6)' }}>pts</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: '1.9vw', color: '#e2e8f0', marginBottom: '1vh' }}>OSM Points</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6vw', color: 'rgba(226,232,240,0.5)', lineHeight: 1.5 }}>
            Nearest OSM feature &le;25m → 40 pts
            Farther match → 25 pts
            No match → 5 pts
          </div>
        </div>

        {/* Community Points */}
        <div style={{ background: 'rgba(13,22,39,0.8)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '6px', padding: '2.5vh 2vw' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5vw', marginBottom: '1.5vh' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '3vw', color: '#3b82f6' }}>0–40</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4vw', color: 'rgba(59,130,246,0.6)' }}>pts</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: '1.9vw', color: '#e2e8f0', marginBottom: '1vh' }}>Community Points</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4vw', color: 'rgba(226,232,240,0.5)', lineHeight: 1.6 }}>
            clamp(0, 40, 20 + (up − down) × 4)
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5vw', color: 'rgba(226,232,240,0.4)', marginTop: '0.8vh' }}>
            Sybil-filtered before calculation
          </div>
        </div>

        {/* Base Points */}
        <div style={{ background: 'rgba(13,22,39,0.8)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: '6px', padding: '2.5vh 2vw' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5vw', marginBottom: '1.5vh' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '3vw', color: '#a78bfa' }}>20</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4vw', color: 'rgba(167,139,250,0.6)' }}>pts</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: '1.9vw', color: '#e2e8f0', marginBottom: '1vh' }}>Base Points</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6vw', color: 'rgba(226,232,240,0.5)', lineHeight: 1.5 }}>
            Fixed MVP baseline. Reserved for reporter reputation post-hackathon.
          </div>
        </div>
      </div>

      {/* Score bands */}
      <div className="absolute" style={{ bottom: '8vh', left: '6vw', display: 'flex', gap: '3vw', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
          <div style={{ width: '1.2vw', height: '1.2vw', borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw', color: '#22c55e' }}>≥70 HIGH</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
          <div style={{ width: '1.2vw', height: '1.2vw', borderRadius: '50%', background: '#f59e0b' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw', color: '#f59e0b' }}>40–69 MID</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
          <div style={{ width: '1.2vw', height: '1.2vw', borderRadius: '50%', background: '#ef4444' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw', color: '#ef4444' }}>&lt;40 LOW</span>
        </div>
        <div style={{ marginLeft: '2vw', fontFamily: 'Inter, sans-serif', fontSize: '1.5vw', color: 'rgba(226,232,240,0.3)' }}>
          Score drives heatmap weight + marker color
        </div>
      </div>

      <div className="absolute" style={{ bottom: 0, left: 0, right: 0, height: '0.4vh', background: 'linear-gradient(to right, transparent, rgba(6,214,196,0.25), transparent)' }} />
    </div>
  );
}

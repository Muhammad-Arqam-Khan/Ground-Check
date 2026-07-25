export default function Slide9Closing() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#080d18', fontFamily: 'Space Grotesk, sans-serif' }}
    >
      {/* Glow effects */}
      <div className="absolute" style={{ top: '-5vh', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '30vh', background: 'radial-gradient(ellipse, rgba(6,214,196,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div className="absolute" style={{ bottom: '-5vh', right: '-5vw', width: '40vw', height: '40vh', background: 'radial-gradient(ellipse, rgba(59,130,246,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div className="absolute" style={{ top: '7vh', left: '6vw', right: '6vw' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4vw', color: '#06d6c4', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1.5vh' }}>
          08 — Why GroundCheck Wins
        </div>
        <div style={{ fontWeight: 700, fontSize: '4.2vw', lineHeight: 1.05, letterSpacing: '-0.025em', color: '#e2e8f0' }}>
          Built for the rubric. Designed for trust.
        </div>
      </div>

      {/* Rubric table */}
      <div className="absolute" style={{ top: '30vh', left: '6vw', right: '6vw' }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '22vw 1fr', gap: '2vw', padding: '1.2vh 2vw', borderBottom: '1px solid rgba(6,214,196,0.25)', marginBottom: '0.5vh' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4vw', color: 'rgba(226,232,240,0.4)', letterSpacing: '0.08em' }}>RUBRIC CRITERION</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4vw', color: 'rgba(226,232,240,0.4)', letterSpacing: '0.08em' }}>HOW GROUNDCHECK ADDRESSES IT</div>
        </div>

        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '22vw 1fr', gap: '2vw', padding: '2vh 2vw', borderBottom: '1px solid rgba(226,232,240,0.06)', background: 'rgba(13,22,39,0.4)', borderRadius: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
            <div style={{ width: '0.6vw', height: '0.6vw', borderRadius: '50%', background: '#06d6c4', minWidth: '0.6vw' }} />
            <span style={{ fontWeight: 600, fontSize: '2vw', color: '#e2e8f0' }}>Theme Relevance</span>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.85vw', color: 'rgba(226,232,240,0.6)', lineHeight: 1.4 }}>
            Every feature — verification, heatmap, hash chain — exists to answer one question: can this location be trusted?
          </div>
        </div>

        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '22vw 1fr', gap: '2vw', padding: '2vh 2vw', borderBottom: '1px solid rgba(226,232,240,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
            <div style={{ width: '0.6vw', height: '0.6vw', borderRadius: '50%', background: '#3b82f6', minWidth: '0.6vw' }} />
            <span style={{ fontWeight: 600, fontSize: '2vw', color: '#e2e8f0' }}>Innovation</span>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.85vw', color: 'rgba(226,232,240,0.6)', lineHeight: 1.4 }}>
            Radius-as-heat-spread + score-as-intensity — a novel single visual language tying verification directly to the map.
          </div>
        </div>

        {/* Row 3 */}
        <div style={{ display: 'grid', gridTemplateColumns: '22vw 1fr', gap: '2vw', padding: '2vh 2vw', borderBottom: '1px solid rgba(226,232,240,0.06)', background: 'rgba(13,22,39,0.4)', borderRadius: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
            <div style={{ width: '0.6vw', height: '0.6vw', borderRadius: '50%', background: '#f59e0b', minWidth: '0.6vw' }} />
            <span style={{ fontWeight: 600, fontSize: '2vw', color: '#e2e8f0' }}>Execution</span>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.85vw', color: 'rgba(226,232,240,0.6)', lineHeight: 1.4 }}>
            Live, clickable, visibly reactive on a single Mapbox GL canvas. Report submitted → heatmap updates in real time.
          </div>
        </div>

        {/* Row 4 */}
        <div style={{ display: 'grid', gridTemplateColumns: '22vw 1fr', gap: '2vw', padding: '2vh 2vw', borderBottom: '1px solid rgba(226,232,240,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
            <div style={{ width: '0.6vw', height: '0.6vw', borderRadius: '50%', background: '#a78bfa', minWidth: '0.6vw' }} />
            <span style={{ fontWeight: 600, fontSize: '2vw', color: '#e2e8f0' }}>Technical Depth</span>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.85vw', color: 'rgba(226,232,240,0.6)', lineHeight: 1.4 }}>
            Geospatial querying, trust scoring, SHA-256 cryptographic chaining, sybil detection, impossible-travel analysis.
          </div>
        </div>

        {/* Row 5 */}
        <div style={{ display: 'grid', gridTemplateColumns: '22vw 1fr', gap: '2vw', padding: '2vh 2vw', background: 'rgba(13,22,39,0.4)', borderRadius: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
            <div style={{ width: '0.6vw', height: '0.6vw', borderRadius: '50%', background: '#22c55e', minWidth: '0.6vw' }} />
            <span style={{ fontWeight: 600, fontSize: '2vw', color: '#e2e8f0' }}>Feasibility</span>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.85vw', color: 'rgba(226,232,240,0.6)', lineHeight: 1.4 }}>
            Free OSM data + Mapbox public token. Static deployment. Extensible to authoritative data sources post-hackathon.
          </div>
        </div>
      </div>

      {/* Closing line */}
      <div className="absolute" style={{ bottom: '7vh', left: '6vw', right: '6vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2vw', fontWeight: 700, color: '#06d6c4', letterSpacing: '0.04em' }}>
          GroundCheck
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.6vw', color: 'rgba(226,232,240,0.35)', letterSpacing: '0.06em' }}>
          verify before you act — HackSummer'26
        </div>
      </div>

      {/* Bottom bar — full cyan for closing */}
      <div className="absolute" style={{ bottom: 0, left: 0, right: 0, height: '0.5vh', background: 'linear-gradient(to right, #06d6c4, #3b82f6)' }} />
    </div>
  );
}

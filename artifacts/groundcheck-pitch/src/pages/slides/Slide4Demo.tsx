export default function Slide4Demo() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#080d18', fontFamily: 'Space Grotesk, sans-serif' }}
    >
      {/* Cyan glow center */}
      <div className="absolute" style={{ top: '20vh', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '40vh', background: 'radial-gradient(ellipse, rgba(6,214,196,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div className="absolute" style={{ top: '7vh', left: '6vw', right: '6vw' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4vw', color: '#06d6c4', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1.5vh' }}>
          03 — Live Demo Walkthrough
        </div>
        <div style={{ fontWeight: 700, fontSize: '4.2vw', lineHeight: 1.05, letterSpacing: '-0.025em', color: '#e2e8f0' }}>
          Drop a report. Watch trust form.
        </div>
      </div>

      {/* Three-step flow */}
      <div
        className="absolute"
        style={{ top: '35vh', left: '5vw', right: '5vw', display: 'grid', gridTemplateColumns: '1fr 3vw 1fr 3vw 1fr', alignItems: 'center', gap: '0' }}
      >
        {/* Step 1 */}
        <div style={{ background: 'rgba(13,22,39,0.9)', border: '1px solid rgba(6,214,196,0.2)', borderRadius: '8px', padding: '3.5vh 2.5vw' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom: '2vh' }}>
            <div style={{ width: '3.5vw', height: '3.5vw', minWidth: '3.5vw', borderRadius: '50%', background: 'rgba(6,214,196,0.12)', border: '1px solid #06d6c4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.6vw', color: '#06d6c4' }}>1</div>
            <div style={{ fontWeight: 700, fontSize: '2.3vw', color: '#e2e8f0' }}>Click the map</div>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8vw', color: 'rgba(226,232,240,0.55)', lineHeight: 1.5, marginBottom: '2vh' }}>
            Tap anywhere to drop a pending report. A radius slider appears.
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw', color: '#06d6c4', background: 'rgba(6,214,196,0.06)', padding: '1vh 1.2vw', borderRadius: '4px' }}>
            50m – 500m radius
          </div>
        </div>

        {/* Arrow 1 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="3vw" height="2vh" viewBox="0 0 40 16" fill="none">
            <path d="M0 8 H32 M28 2 L38 8 L28 14" stroke="rgba(6,214,196,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Step 2 */}
        <div style={{ background: 'rgba(13,22,39,0.9)', border: '1px solid rgba(59,130,246,0.22)', borderRadius: '8px', padding: '3.5vh 2.5vw' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom: '2vh' }}>
            <div style={{ width: '3.5vw', height: '3.5vw', minWidth: '3.5vw', borderRadius: '50%', background: 'rgba(59,130,246,0.12)', border: '1px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.6vw', color: '#3b82f6' }}>2</div>
            <div style={{ fontWeight: 700, fontSize: '2.3vw', color: '#e2e8f0' }}>Drag radius</div>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8vw', color: 'rgba(226,232,240,0.55)', lineHeight: 1.5, marginBottom: '2vh' }}>
            Live Overpass query counts real OSM features inside your chosen radius.
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw', color: '#3b82f6', background: 'rgba(59,130,246,0.06)', padding: '1vh 1.2vw', borderRadius: '4px' }}>
            "14 features within 200m"
          </div>
        </div>

        {/* Arrow 2 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="3vw" height="2vh" viewBox="0 0 40 16" fill="none">
            <path d="M0 8 H32 M28 2 L38 8 L28 14" stroke="rgba(59,130,246,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Step 3 */}
        <div style={{ background: 'rgba(13,22,39,0.9)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '3.5vh 2.5vw' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom: '2vh' }}>
            <div style={{ width: '3.5vw', height: '3.5vw', minWidth: '3.5vw', borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.6vw', color: '#22c55e' }}>3</div>
            <div style={{ fontWeight: 700, fontSize: '2.3vw', color: '#e2e8f0' }}>Submit</div>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8vw', color: 'rgba(226,232,240,0.55)', lineHeight: 1.5, marginBottom: '2vh' }}>
            Score computed. Heatmap updates. Tight green glow if verified, wide red fade if not.
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw', color: '#22c55e', background: 'rgba(34,197,94,0.06)', padding: '1vh 1.2vw', borderRadius: '4px' }}>
            score = 74 — HIGH trust
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <div className="absolute" style={{ bottom: '6vh', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.7vw', color: 'rgba(226,232,240,0.35)' }}>
          All interaction on a single Mapbox GL canvas — no page changes, no modals
        </div>
      </div>

      <div className="absolute" style={{ bottom: 0, left: 0, right: 0, height: '0.4vh', background: 'linear-gradient(to right, transparent, rgba(6,214,196,0.25), transparent)' }} />
    </div>
  );
}

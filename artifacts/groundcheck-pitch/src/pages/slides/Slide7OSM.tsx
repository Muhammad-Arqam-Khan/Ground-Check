export default function Slide7OSM() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#080d18', fontFamily: 'Space Grotesk, sans-serif' }}
    >
      {/* Background glow */}
      <div className="absolute" style={{ top: '10vh', right: '-5vw', width: '40vw', height: '60vh', background: 'radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div className="absolute" style={{ top: '7vh', left: '6vw', right: '6vw' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4vw', color: '#06d6c4', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1.5vh' }}>
          06 — Ground Truth via OSM
        </div>
        <div style={{ fontWeight: 700, fontSize: '4.2vw', lineHeight: 1.05, letterSpacing: '-0.025em', color: '#e2e8f0' }}>
          Real data, not opinions.
        </div>
      </div>

      {/* Two column layout */}
      <div
        className="absolute"
        style={{ top: '32vh', left: '6vw', right: '6vw', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5vw', alignItems: 'start' }}
      >
        {/* Left: explanation */}
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '2vw', color: 'rgba(226,232,240,0.65)', lineHeight: 1.6, marginBottom: '3.5vh' }}>
            Every report is cross-referenced against the Overpass API — a live query interface for OpenStreetMap — before the score is computed. No API key required.
          </div>

          {/* Category mappings */}
          <div style={{ marginBottom: '2vh' }}>
            <div style={{ fontWeight: 600, fontSize: '1.9vw', color: '#e2e8f0', marginBottom: '1.5vh' }}>Category → OSM tags</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5vw', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw' }}>
                <span style={{ color: '#f59e0b', minWidth: '10vw' }}>fraud / scam</span>
                <span style={{ color: 'rgba(226,232,240,0.3)' }}>→</span>
                <span style={{ color: 'rgba(226,232,240,0.55)' }}>shop, amenity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5vw', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw' }}>
                <span style={{ color: '#ef4444', minWidth: '10vw' }}>road hazard</span>
                <span style={{ color: 'rgba(226,232,240,0.3)' }}>→</span>
                <span style={{ color: 'rgba(226,232,240,0.55)' }}>highway</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5vw', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw' }}>
                <span style={{ color: '#a78bfa', minWidth: '10vw' }}>unsafe area</span>
                <span style={{ color: 'rgba(226,232,240,0.3)' }}>→</span>
                <span style={{ color: 'rgba(226,232,240,0.55)' }}>building, leisure</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '3vh', fontFamily: 'Inter, sans-serif', fontSize: '1.7vw', color: 'rgba(226,232,240,0.4)', lineHeight: 1.5 }}>
            No match found — report still submitted, but scores low on OSM points. Signal-confidence, not rejection.
          </div>
        </div>

        {/* Right: Overpass query */}
        <div>
          <div style={{ fontWeight: 600, fontSize: '1.9vw', color: '#e2e8f0', marginBottom: '1.5vh' }}>Overpass query shape</div>
          <div style={{
            background: 'rgba(13,22,39,0.95)',
            border: '1px solid rgba(6,214,196,0.15)',
            borderRadius: '8px',
            padding: '2.5vh 2vw',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '1.5vw',
            lineHeight: 2,
            color: 'rgba(226,232,240,0.7)',
          }}>
            <div style={{ color: 'rgba(226,232,240,0.35)' }}>[out:json][timeout:10];</div>
            <div style={{ color: 'rgba(226,232,240,0.35)' }}>(</div>
            <div style={{ paddingLeft: '1.5vw' }}>
              <span style={{ color: '#06d6c4' }}>node</span>
              <span style={{ color: 'rgba(226,232,240,0.5)' }}>(around:</span>
              <span style={{ color: '#f59e0b' }}>&lt;radius&gt;</span>
              <span style={{ color: 'rgba(226,232,240,0.5)' }}>,</span>
              <span style={{ color: '#3b82f6' }}>&lt;lat&gt;</span>
              <span style={{ color: 'rgba(226,232,240,0.5)' }}>,</span>
              <span style={{ color: '#3b82f6' }}>&lt;lon&gt;</span>
              <span style={{ color: 'rgba(226,232,240,0.5)' }}>)</span>
            </div>
            <div style={{ paddingLeft: '2.5vw', color: 'rgba(226,232,240,0.4)' }}>[&lt;category-tag&gt;];</div>
            <div style={{ paddingLeft: '1.5vw' }}>
              <span style={{ color: '#06d6c4' }}>way</span>
              <span style={{ color: 'rgba(226,232,240,0.5)' }}>(around:</span>
              <span style={{ color: '#f59e0b' }}>&lt;radius&gt;</span>
              <span style={{ color: 'rgba(226,232,240,0.5)' }}>,</span>
              <span style={{ color: '#3b82f6' }}>&lt;lat&gt;</span>
              <span style={{ color: 'rgba(226,232,240,0.5)' }}>,</span>
              <span style={{ color: '#3b82f6' }}>&lt;lon&gt;</span>
              <span style={{ color: 'rgba(226,232,240,0.5)' }}>)</span>
            </div>
            <div style={{ paddingLeft: '2.5vw', color: 'rgba(226,232,240,0.4)' }}>[&lt;category-tag&gt;];</div>
            <div style={{ color: 'rgba(226,232,240,0.35)' }}>);</div>
            <div><span style={{ color: '#a78bfa' }}>out center</span> <span style={{ color: '#f59e0b' }}>10</span>;</div>
          </div>

          <div style={{ marginTop: '2vh', fontFamily: 'Inter, sans-serif', fontSize: '1.5vw', color: 'rgba(226,232,240,0.35)' }}>
            Debounced ~300ms on slider drag. Capped to protect public Overpass instance during judging.
          </div>
        </div>
      </div>

      <div className="absolute" style={{ bottom: 0, left: 0, right: 0, height: '0.4vh', background: 'linear-gradient(to right, transparent, rgba(6,214,196,0.25), transparent)' }} />
    </div>
  );
}

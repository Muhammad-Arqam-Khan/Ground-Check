const base = import.meta.env.BASE_URL;

export default function Slide8Architecture() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#080d18', fontFamily: 'Space Grotesk, sans-serif' }}
    >
      {/* Background image */}
      <img
        src={`${base}arch-bg.jpg`}
        crossOrigin="anonymous"
        alt="Architecture background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.07 }}
      />

      {/* Header */}
      <div className="absolute" style={{ top: '7vh', left: '6vw', right: '6vw' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4vw', color: '#06d6c4', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1.5vh' }}>
          07 — Architecture
        </div>
        <div style={{ fontWeight: 700, fontSize: '4.2vw', lineHeight: 1.05, letterSpacing: '-0.025em', color: '#e2e8f0' }}>
          Single-page. No backend required.
        </div>
      </div>

      {/* Architecture diagram */}
      <div className="absolute" style={{ top: '30vh', left: '6vw', right: '6vw' }}>
        {/* Browser root node */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(13,22,39,0.95)',
            border: '1px solid rgba(6,214,196,0.4)',
            borderRadius: '6px',
            padding: '1.5vh 3vw',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '1.8vw',
            fontWeight: 700,
            color: '#06d6c4',
            letterSpacing: '0.05em',
          }}>
            Browser Session
          </div>

          {/* Vertical line down */}
          <div style={{ width: '1px', height: '3vh', background: 'rgba(6,214,196,0.3)' }} />

          {/* Five child nodes */}
          <div style={{ display: 'flex', gap: '2.5vw', alignItems: 'flex-start', width: '100%', justifyContent: 'center' }}>

            {/* Mapbox GL JS */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1.4' }}>
              <div style={{ width: '1px', height: '2.5vh', background: 'rgba(59,130,246,0.4)' }} />
              <div style={{ background: 'rgba(13,22,39,0.95)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', padding: '1.5vh 1.5vw', width: '100%', textAlign: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw', fontWeight: 700, color: '#3b82f6', marginBottom: '0.8vh' }}>Mapbox GL JS</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.4vw', color: 'rgba(226,232,240,0.45)', lineHeight: 1.4 }}>dark-v11 base</div>
              </div>
              {/* Sub-nodes */}
              <div style={{ width: '1px', height: '2vh', background: 'rgba(59,130,246,0.2)' }} />
              <div style={{ display: 'flex', gap: '0.8vw' }}>
                <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '4px', padding: '0.8vh 0.8vw', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2vw', color: 'rgba(59,130,246,0.7)' }}>heatmap layer</div>
                <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '4px', padding: '0.8vh 0.8vw', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2vw', color: 'rgba(59,130,246,0.7)' }}>markers</div>
                <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '4px', padding: '0.8vh 0.8vw', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2vw', color: 'rgba(59,130,246,0.7)' }}>popups</div>
              </div>
            </div>

            {/* Scoring Engine */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1' }}>
              <div style={{ width: '1px', height: '2.5vh', background: 'rgba(6,214,196,0.4)' }} />
              <div style={{ background: 'rgba(13,22,39,0.95)', border: '1px solid rgba(6,214,196,0.25)', borderRadius: '6px', padding: '1.5vh 1.5vw', width: '100%', textAlign: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw', fontWeight: 700, color: '#06d6c4', marginBottom: '0.8vh' }}>Scoring Engine</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.4vw', color: 'rgba(226,232,240,0.45)', lineHeight: 1.4 }}>client-side JS</div>
              </div>
              <div style={{ width: '1px', height: '2vh', background: 'rgba(6,214,196,0.15)' }} />
              <div style={{ background: 'rgba(6,214,196,0.06)', border: '1px solid rgba(6,214,196,0.12)', borderRadius: '4px', padding: '0.8vh 0.8vw', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2vw', color: 'rgba(6,214,196,0.6)' }}>OSM + votes + base</div>
            </div>

            {/* Security Module */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1' }}>
              <div style={{ width: '1px', height: '2.5vh', background: 'rgba(245,158,11,0.4)' }} />
              <div style={{ background: 'rgba(13,22,39,0.95)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '6px', padding: '1.5vh 1.5vw', width: '100%', textAlign: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw', fontWeight: 700, color: '#f59e0b', marginBottom: '0.8vh' }}>Security Module</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.4vw', color: 'rgba(226,232,240,0.45)', lineHeight: 1.4 }}>client-side JS</div>
              </div>
              <div style={{ width: '1px', height: '2vh', background: 'rgba(245,158,11,0.15)' }} />
              <div style={{ display: 'flex', gap: '0.6vw' }}>
                <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: '4px', padding: '0.8vh 0.6vw', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1vw', color: 'rgba(245,158,11,0.6)' }}>sybil</div>
                <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: '4px', padding: '0.8vh 0.6vw', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1vw', color: 'rgba(245,158,11,0.6)' }}>travel</div>
              </div>
            </div>

            {/* Hash Chain */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1' }}>
              <div style={{ width: '1px', height: '2.5vh', background: 'rgba(34,197,94,0.4)' }} />
              <div style={{ background: 'rgba(13,22,39,0.95)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '6px', padding: '1.5vh 1.5vw', width: '100%', textAlign: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw', fontWeight: 700, color: '#22c55e', marginBottom: '0.8vh' }}>Hash Chain</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.4vw', color: 'rgba(226,232,240,0.45)', lineHeight: 1.4 }}>Web Crypto API</div>
              </div>
              <div style={{ width: '1px', height: '2vh', background: 'rgba(34,197,94,0.15)' }} />
              <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: '4px', padding: '0.8vh 0.8vw', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2vw', color: 'rgba(34,197,94,0.6)' }}>SHA-256 chain</div>
            </div>

            {/* Overpass Client */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1' }}>
              <div style={{ width: '1px', height: '2.5vh', background: 'rgba(167,139,250,0.4)' }} />
              <div style={{ background: 'rgba(13,22,39,0.95)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: '6px', padding: '1.5vh 1.5vw', width: '100%', textAlign: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw', fontWeight: 700, color: '#a78bfa', marginBottom: '0.8vh' }}>Overpass Client</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.4vw', color: 'rgba(226,232,240,0.45)', lineHeight: 1.4 }}>fetch to OSM</div>
              </div>
              <div style={{ width: '1px', height: '2vh', background: 'rgba(167,139,250,0.15)' }} />
              <div style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.12)', borderRadius: '4px', padding: '0.8vh 0.8vw', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2vw', color: 'rgba(167,139,250,0.6)' }}>debounced 300ms</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <div className="absolute" style={{ bottom: '6vh', left: '6vw', right: '6vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw', color: 'rgba(226,232,240,0.3)' }}>
          All state in-memory · Static deployment · No server secrets
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5vw', color: 'rgba(226,232,240,0.3)' }}>
          Mapbox public token · overpass-api.de
        </div>
      </div>

      <div className="absolute" style={{ bottom: 0, left: 0, right: 0, height: '0.4vh', background: 'linear-gradient(to right, transparent, rgba(6,214,196,0.25), transparent)' }} />
    </div>
  );
}

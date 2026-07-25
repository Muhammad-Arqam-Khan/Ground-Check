const base = import.meta.env.BASE_URL;

export default function Slide1Cover() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#080d18', fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Full-bleed hero image */}
      <img
        src={`${base}hero-cover.jpg`}
        crossOrigin="anonymous"
        alt="City trust heatmap"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.45 }}
      />

      {/* Gradient overlay — bottom fade */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(8,13,24,0.3) 0%, rgba(8,13,24,0.7) 60%, rgba(8,13,24,0.97) 100%)' }}
      />

      {/* Top-left: hackathon badge */}
      <div className="absolute" style={{ top: '4vh', left: '5vw' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6vw',
          background: 'rgba(6,214,196,0.12)',
          border: '1px solid rgba(6,214,196,0.35)',
          borderRadius: '4px',
          padding: '0.5vh 1vw',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '1.4vw',
          color: '#06d6c4',
          letterSpacing: '0.08em',
        }}>
          HACKSUMMER'26
          <span style={{ opacity: 0.5, margin: '0 0.2vw' }}>|</span>
          THEME: TRUST ME
        </div>
      </div>

      {/* Top-right: category */}
      <div className="absolute" style={{ top: '4.2vh', right: '5vw' }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '1.3vw',
          color: 'rgba(226,232,240,0.4)',
          letterSpacing: '0.1em',
        }}>CIVIC INFRASTRUCTURE</span>
      </div>

      {/* Center content */}
      <div className="absolute" style={{ bottom: '18vh', left: '5vw', right: '5vw' }}>
        {/* Pre-label */}
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '1.5vw',
          color: 'rgba(6,214,196,0.7)',
          letterSpacing: '0.18em',
          marginBottom: '1.5vh',
          textTransform: 'uppercase',
        }}>
          Location Trust Infrastructure
        </div>

        {/* Main title */}
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700,
          fontSize: '10vw',
          lineHeight: 0.9,
          letterSpacing: '-0.03em',
          color: '#e2e8f0',
          textWrap: 'balance',
        }}>
          Ground
          <span style={{ color: '#06d6c4' }}>Check</span>
        </div>

        {/* Tagline */}
        <div style={{
          marginTop: '2.5vh',
          fontFamily: 'Inter, sans-serif',
          fontSize: '2.2vw',
          fontWeight: 400,
          color: 'rgba(226,232,240,0.6)',
          letterSpacing: '0.01em',
        }}>
          Verify every location claim before you act.
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="absolute"
        style={{
          bottom: 0,
          left: 0,
          right: 0,
          height: '0.5vh',
          background: 'linear-gradient(to right, #06d6c4, #3b82f6, transparent)',
        }}
      />

      {/* Decorative grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(6,214,196,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,214,196,0.03) 1px, transparent 1px)',
          backgroundSize: '5vw 5vh',
        }}
      />
    </div>
  );
}

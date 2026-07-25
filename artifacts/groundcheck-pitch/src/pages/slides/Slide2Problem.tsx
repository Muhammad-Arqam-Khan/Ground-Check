export default function Slide2Problem() {
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
            'linear-gradient(rgba(226,232,240,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.025) 1px, transparent 1px)',
          backgroundSize: '6vw 6vh',
        }}
      />

      {/* Left panel — big statement */}
      <div
        className="absolute"
        style={{ top: 0, left: 0, width: '55vw', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 5vw 0 6vw' }}
      >
        {/* Section label */}
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4vw', color: '#06d6c4', letterSpacing: '0.14em', marginBottom: '2.5vh', textTransform: 'uppercase' }}>
          01 — The Problem
        </div>

        {/* Big headline */}
        <div style={{ fontWeight: 700, fontSize: '5.2vw', lineHeight: 1.1, letterSpacing: '-0.025em', color: '#e2e8f0', textWrap: 'balance' }}>
          Every location claim is a blind leap of faith.
        </div>

        {/* Sub */}
        <div style={{ marginTop: '3vh', fontFamily: 'Inter, sans-serif', fontSize: '2vw', color: 'rgba(226,232,240,0.55)', lineHeight: 1.5, maxWidth: '44vw' }}>
          Existing tools let anyone report anything. There is no independent check.
          The trust signal itself is gameable — and nobody can tell.
        </div>
      </div>

      {/* Vertical divider */}
      <div
        className="absolute"
        style={{ top: '10vh', bottom: '10vh', left: '55vw', width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(6,214,196,0.3), transparent)' }}
      />

      {/* Right panel — three problems */}
      <div
        className="absolute"
        style={{ top: 0, right: 0, width: '42vw', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 4vw 0 4vw', gap: '0' }}
      >
        {/* Problem 1 */}
        <div style={{ padding: '3vh 0', borderBottom: '1px solid rgba(226,232,240,0.07)' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.3vw', color: 'rgba(6,214,196,0.5)', marginBottom: '0.8vh', letterSpacing: '0.06em' }}>01</div>
          <div style={{ fontWeight: 600, fontSize: '2.3vw', color: '#e2e8f0', lineHeight: 1.2, marginBottom: '0.8vh' }}>No independent verification</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8vw', color: 'rgba(226,232,240,0.5)', lineHeight: 1.4 }}>Reports are posted. Nobody cross-checks them against reality.</div>
        </div>

        {/* Problem 2 */}
        <div style={{ padding: '3vh 0', borderBottom: '1px solid rgba(226,232,240,0.07)' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.3vw', color: 'rgba(6,214,196,0.5)', marginBottom: '0.8vh', letterSpacing: '0.06em' }}>02</div>
          <div style={{ fontWeight: 600, fontSize: '2.3vw', color: '#e2e8f0', lineHeight: 1.2, marginBottom: '0.8vh' }}>Trust signals are gameable</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8vw', color: 'rgba(226,232,240,0.5)', lineHeight: 1.4 }}>Vote counts and flags can be flooded by a single bad actor.</div>
        </div>

        {/* Problem 3 */}
        <div style={{ padding: '3vh 0' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.3vw', color: 'rgba(6,214,196,0.5)', marginBottom: '0.8vh', letterSpacing: '0.06em' }}>03</div>
          <div style={{ fontWeight: 600, fontSize: '2.3vw', color: '#e2e8f0', lineHeight: 1.2, marginBottom: '0.8vh' }}>No spatial picture of trust</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8vw', color: 'rgba(226,232,240,0.5)', lineHeight: 1.4 }}>Isolated pins. No way to see aggregate trustworthiness across a zone.</div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute" style={{ bottom: 0, left: 0, right: 0, height: '0.4vh', background: 'linear-gradient(to right, transparent, rgba(6,214,196,0.25), transparent)' }} />
    </div>
  );
}

import { Link } from 'react-router-dom';
import { getAllIdentities } from '../lib/identity';
import { getChain } from '../lib/chain';

export function Admin() {
  const identities = getAllIdentities().sort((a, b) => b.timestamp - a.timestamp);
  const chain      = getChain();

  const flagged  = identities.filter(i => i.status === 'flagged');
  const verified = identities.filter(i => i.status === 'verified');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nm-base)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="nm-heading" style={{ fontSize: 22 }}>Admin Dashboard</h1>
            <p className="nm-sub">Identity review queue · GroundCheck</p>
          </div>
          <Link to="/" className="nm-btn px-4 py-2 text-sm" style={{ color: 'var(--nm-fg-muted)' }}>
            ← Map
          </Link>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total accounts', value: identities.length, color: 'var(--nm-fg)' },
            { label: 'Verified',       value: verified.length,   color: '#4ab964' },
            { label: 'Flagged for review', value: flagged.length, color: '#e8a020' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl p-5 text-center"
              style={{ background: 'var(--nm-base)', boxShadow: 'var(--nm-raised)' }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color, fontFamily: 'var(--app-font-mono)' }}>{value}</div>
              <div className="text-xs" style={{ color: 'var(--nm-fg-muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Chain summary */}
        <div
          className="rounded-2xl px-5 py-4 mb-8 flex items-center gap-4"
          style={{ background: 'var(--nm-base)', boxShadow: 'var(--nm-raised-sm)' }}
        >
          <span style={{ fontSize: 24 }}>🔗</span>
          <div>
            <p style={{ fontSize: 13, color: 'var(--nm-fg)', fontWeight: 600 }}>Tamper-evident chain</p>
            <p style={{ fontSize: 11, color: 'var(--nm-fg-muted)', fontFamily: 'var(--app-font-mono)' }}>
              {chain.length} total entries &nbsp;·&nbsp;
              {chain.filter(l => l.entryType === 'signup_flagged').length} signup_flagged &nbsp;·&nbsp;
              {chain.filter(l => l.entryType === 'signup_verified').length} signup_verified &nbsp;·&nbsp;
              {chain.filter(l => !l.entryType || l.entryType === 'report').length} reports
            </p>
          </div>
        </div>

        {/* Flagged accounts table */}
        <h2 className="nm-label mb-4" style={{ fontSize: 11 }}>Flagged accounts — review queue</h2>

        {flagged.length === 0 ? (
          <div
            className="rounded-2xl px-6 py-10 text-center"
            style={{ background: 'var(--nm-base)', boxShadow: 'var(--nm-inset-sm)', color: 'var(--nm-dark)' }}
          >
            <p style={{ fontSize: 14 }}>No flagged accounts 🎉</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--nm-raised)' }}>
            {flagged.map((identity, idx) => {
              const chainLink = chain.find(l => l.id === identity.id);
              return (
                <div
                  key={identity.id}
                  style={{
                    padding: '14px 20px',
                    background: 'var(--nm-base)',
                    borderBottom: idx < flagged.length - 1 ? '1px solid rgba(184,192,204,0.3)' : 'none',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr auto',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  {/* Name + CNIC */}
                  <div>
                    <p style={{ fontSize: 14, color: 'var(--nm-fg)', fontWeight: 500 }}>{identity.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--nm-fg-muted)', fontFamily: 'var(--app-font-mono)' }}>
                      {identity.maskedCnic}
                    </p>
                  </div>

                  {/* Timestamp + OCR score */}
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--nm-fg-muted)' }}>
                      {new Date(identity.timestamp).toLocaleString()}
                    </p>
                    <p style={{ fontSize: 11, fontFamily: 'var(--app-font-mono)', color: 'var(--nm-dark)' }}>
                      OCR confidence: {identity.ocrConfidence}%
                    </p>
                  </div>

                  {/* Chain hash prefix */}
                  <div style={{ textAlign: 'right' }}>
                    <span
                      className="nm-pill nm-pill-raised"
                      style={{ fontFamily: 'var(--app-font-mono)', letterSpacing: '0.02em', fontSize: '9px' }}
                      title={chainLink?.hash}
                    >
                      #{chainLink?.hash.slice(0, 10) ?? '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* All accounts table */}
        {identities.length > 0 && (
          <>
            <h2 className="nm-label mt-8 mb-4" style={{ fontSize: 11 }}>All accounts</h2>
            <div className="rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--nm-raised)' }}>
              {identities.map((identity, idx) => (
                <div
                  key={identity.id}
                  style={{
                    padding: '12px 20px',
                    background: 'var(--nm-base)',
                    borderBottom: idx < identities.length - 1 ? '1px solid rgba(184,192,204,0.25)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 13, color: 'var(--nm-fg)', fontWeight: 500 }}>{identity.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--nm-fg-muted)', marginLeft: 8, fontFamily: 'var(--app-font-mono)' }}>
                      {identity.maskedCnic}
                    </span>
                  </div>
                  <span
                    className="nm-pill"
                    style={
                      identity.status === 'verified'
                        ? { background: 'rgba(74,185,100,0.12)', color: '#3a9a58' }
                        : { background: 'rgba(232,160,32,0.12)', color: '#b07810' }
                    }
                  >
                    {identity.status === 'verified' ? 'VERIFIED' : 'FLAGGED'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <p style={{ marginTop: 32, fontSize: 11, color: 'var(--nm-dark)', textAlign: 'center' }}>
          Raw CNIC numbers are never shown here. Encrypted copies are stored for authorised admin recovery only.
        </p>
      </div>
    </div>
  );
}

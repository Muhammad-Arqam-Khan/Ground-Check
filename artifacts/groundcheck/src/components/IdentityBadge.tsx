import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession, clearSession, deleteMyData } from '../lib/identity';

export function IdentityBadge() {
  const navigate  = useNavigate();
  const identity  = getSession();
  const [open, setOpen]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSignOut = () => {
    clearSession();
    setOpen(false);
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    if (!identity) return;
    deleteMyData(identity.id);
    setOpen(false);
    setConfirmDelete(false);
    navigate('/signup');
  };

  if (!identity) {
    return (
      <Link
        to="/signup"
        className="nm-btn px-4 py-2 text-xs"
        style={{
          position: 'fixed',
          top: 16,
          left: 62,   // right of zoom control
          zIndex: 1100,
          color: 'var(--nm-fg-muted)',
        }}
      >
        Sign in / Register
      </Link>
    );
  }

  const isVerified = identity.status === 'verified';
  const badgeColor = isVerified ? '#4ab964' : '#e8a020';
  const badgeLabel = isVerified ? 'Verified' : 'Under Review';

  return (
    <div style={{ position: 'fixed', top: 16, left: 62, zIndex: 1100 }}>
      <button
        className="nm-btn px-3 py-2 text-xs flex items-center gap-2"
        onClick={() => setOpen(v => !v)}
      >
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: badgeColor,
          boxShadow: `0 0 6px ${badgeColor}`,
          flexShrink: 0,
        }} />
        <span style={{ color: 'var(--nm-fg)', fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {identity.name.split(' ')[0]}
        </span>
        <span style={{ color: badgeColor, fontWeight: 600 }}>{badgeLabel}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1099 }}
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div
            className="rounded-2xl p-4"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              zIndex: 1200,
              background: 'var(--nm-base)',
              boxShadow: 'var(--nm-raised)',
              minWidth: 220,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--nm-fg)', marginBottom: 2 }}>
              {identity.name}
            </p>
            <p style={{ fontSize: 11, color: 'var(--nm-fg-muted)', fontFamily: 'var(--app-font-mono)', marginBottom: 12 }}>
              {identity.maskedCnic}
            </p>

            <div
              className="rounded-xl px-3 py-2 mb-3"
              style={{ boxShadow: 'var(--nm-inset-xs)', background: 'var(--nm-base)' }}
            >
              <p style={{ fontSize: 10, color: 'var(--nm-dark)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--app-font-mono)' }}>
                Identity status
              </p>
              <p style={{ fontSize: 12, fontWeight: 600, color: badgeColor, marginTop: 2 }}>
                {isVerified ? '✓ CNIC Verified' : '⏳ Flagged for review'}
              </p>
              {!isVerified && (
                <p style={{ fontSize: 10, color: 'var(--nm-dark)', marginTop: 4, lineHeight: 1.4 }}>
                  Your account is still active while under review.
                </p>
              )}
            </div>

            <button
              className="nm-btn w-full py-2 text-xs"
              style={{ color: '#c04040' }}
              onClick={handleSignOut}
            >
              Sign out
            </button>

            {!confirmDelete ? (
              <button
                className="nm-btn w-full py-2 text-xs mt-2"
                style={{ color: 'var(--nm-dark)' }}
                onClick={() => setConfirmDelete(true)}
              >
                Delete my account
              </button>
            ) : (
              <div
                className="rounded-xl px-3 py-2 mt-2"
                style={{ boxShadow: 'var(--nm-inset-xs)', background: 'var(--nm-base)' }}
              >
                <p style={{ fontSize: 11, color: 'var(--nm-fg)', marginBottom: 8, lineHeight: 1.4 }}>
                  This removes your name, CNIC, and all stored identity data permanently. Reports you filed remain.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="nm-btn py-1.5 text-xs flex-1"
                    style={{ color: '#c04040', fontWeight: 600 }}
                    onClick={handleDeleteAccount}
                  >
                    Yes, delete
                  </button>
                  <button
                    className="nm-btn py-1.5 text-xs flex-1"
                    style={{ color: 'var(--nm-fg-muted)' }}
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

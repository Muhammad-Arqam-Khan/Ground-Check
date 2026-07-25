import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { hashCnic, findByCnicHash, setSession } from '../lib/identity';

const CNIC_RE = /^\d{5}-\d{7}-\d$/;

export function Login() {
  const navigate = useNavigate();

  const [cnic, setCnic]     = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleCnicChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    let formatted = digits;
    if (digits.length > 5)  formatted = digits.slice(0, 5) + '-' + digits.slice(5);
    if (digits.length > 12) formatted = formatted.slice(0, 14) + '-' + digits.slice(12, 13);
    setCnic(formatted);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!CNIC_RE.test(cnic)) {
      setError('Enter a valid CNIC number (12345-1234567-1).');
      return;
    }

    setLoading(true);
    const hash     = await hashCnic(cnic);
    const identity = findByCnicHash(hash);
    setLoading(false);

    if (!identity) {
      setError('No account found for this CNIC. Please sign up first.');
      return;
    }

    setSession(identity.sessionToken);
    navigate('/');
  };

  return (
    <div className="nm-page-center">
      <div className="nm-card" style={{ maxWidth: 400, width: '100%' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="nm-btn w-9 h-9 rounded-full text-base" style={{ color: 'var(--nm-fg-muted)' }}>←</Link>
          <div>
            <h1 className="nm-heading">Sign in</h1>
            <p className="nm-sub">Enter your CNIC to restore your session</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="nm-label">CNIC number</label>
              <input
                className="nm-input"
                type="text"
                value={cnic}
                onChange={e => handleCnicChange(e.target.value)}
                placeholder="12345-1234567-1"
                maxLength={15}
                inputMode="numeric"
                autoFocus
              />
              <p className="nm-field-hint">Used to look up your verified account — not stored again</p>
            </div>

            {error && <div className="nm-error-box">{error}</div>}

            <button
              type="submit"
              className="nm-btn nm-btn-accent w-full py-3 text-sm font-semibold"
              disabled={loading}
            >
              {loading ? 'Checking…' : 'Sign In'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--nm-fg-muted)' }}>
              No account yet?{' '}
              <Link to="/signup" style={{ color: 'var(--nm-accent)', textDecoration: 'none' }}>Sign up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

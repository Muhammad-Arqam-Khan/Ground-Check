import { useState } from 'react';
import type { Report } from '../lib/types';
import { verifyChain } from '../lib/chain';

interface ChainStatusProps {
  reports: Report[];
  chainLength: number;
}

type VerifyState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; count: number }
  | { status: 'error'; brokenAt: number; reportId: string; expected: string; got: string };

export function ChainStatus({ reports, chainLength }: ChainStatusProps) {
  const [verifyState, setVerifyState] = useState<VerifyState>({ status: 'idle' });

  const handleVerify = async () => {
    setVerifyState({ status: 'loading' });
    const result = await verifyChain(reports);
    if (result.ok) {
      setVerifyState({ status: 'success', count: chainLength });
    } else {
      setVerifyState({
        status: 'error',
        brokenAt: result.brokenAt,
        reportId: result.reportId,
        expected: result.expected,
        got: result.got,
      });
    }
  };

  const isIntact      = verifyState.status === 'success' && chainLength > 0;
  const isCompromised = verifyState.status === 'error';

  return (
    <div
      className="fixed top-[68px] right-4 z-[1100] rounded-2xl p-4 min-w-[220px]"
      style={{ background: 'var(--nm-base)', boxShadow: 'var(--nm-raised)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Chain link icon */}
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="2.5"  cy="7.5" r="2"   stroke="var(--nm-fg-muted)" strokeWidth="1.3"/>
            <circle cx="7.5"  cy="7.5" r="2"   stroke="var(--nm-fg-muted)" strokeWidth="1.3"/>
            <circle cx="12.5" cy="7.5" r="2"   stroke="var(--nm-fg-muted)" strokeWidth="1.3"/>
            <line x1="4.5"  y1="7.5" x2="5.5"  y2="7.5" stroke="var(--nm-fg-muted)" strokeWidth="1.3"/>
            <line x1="9.5"  y1="7.5" x2="10.5" y2="7.5" stroke="var(--nm-fg-muted)" strokeWidth="1.3"/>
          </svg>
          <span
            className="text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--nm-fg-muted)', fontFamily: 'var(--app-font-mono)' }}
          >
            Chain
          </span>
        </div>

        <div data-testid="badge-chain-status" className="flex items-center gap-1.5">
          <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--nm-fg)' }}>
            {chainLength}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--nm-fg-muted)' }}>links</span>

          {isIntact && (
            <span className="ml-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(74,185,100,0.15)', color: '#3a9a58' }}>
              INTACT
            </span>
          )}
          {isCompromised && (
            <span className="ml-1 text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                  style={{ background: 'rgba(220,60,60,0.12)', color: '#c04040' }}>
              COMPROMISED
            </span>
          )}
        </div>
      </div>

      {/* Verify button */}
      <button
        onClick={handleVerify}
        disabled={verifyState.status === 'loading' || chainLength === 0}
        data-testid="button-verify-chain"
        className="nm-btn w-full py-2 px-4 text-xs"
        style={{ color: 'var(--nm-accent)' }}
      >
        {verifyState.status === 'loading' ? 'Verifying…' : 'Verify chain'}
      </button>

      {/* Results */}
      {verifyState.status === 'success' && (
        <div
          data-testid="text-verify-result"
          className="mt-3 px-3 py-2 rounded-xl text-[10px] leading-snug"
          style={{
            background: 'rgba(74,185,100,0.10)',
            color: '#3a9a58',
            boxShadow: 'var(--nm-inset-xs)',
            fontFamily: 'var(--app-font-mono)',
          }}
        >
          ✓ {verifyState.count} links verified — intact
        </div>
      )}
      {verifyState.status === 'error' && (
        <div
          data-testid="text-verify-result"
          className="mt-3 px-3 py-2 rounded-xl text-[10px] leading-snug space-y-0.5"
          style={{
            background: 'rgba(220,60,60,0.08)',
            color: '#c04040',
            boxShadow: 'var(--nm-inset-xs)',
            fontFamily: 'var(--app-font-mono)',
          }}
        >
          <div className="font-bold">✗ Broken at link #{verifyState.brokenAt}</div>
          <div className="opacity-70 break-all">ID: {verifyState.reportId}</div>
          <div className="opacity-60 break-all">Exp: {verifyState.expected.substring(0, 16)}…</div>
          <div className="opacity-60 break-all">Got: {verifyState.got.substring(0, 16)}…</div>
        </div>
      )}
    </div>
  );
}

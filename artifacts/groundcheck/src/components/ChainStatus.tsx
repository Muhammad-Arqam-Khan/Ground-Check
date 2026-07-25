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
  | { status: 'success', count: number }
  | { status: 'error', brokenAt: number, reportId: string, expected: string, got: string };

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
        got: result.got 
      });
    }
  };

  const isIntact = verifyState.status === 'success' && chainLength > 0;
  const isCompromised = verifyState.status === 'error';
  const isUnverified = verifyState.status === 'idle' || (verifyState.status === 'success' && chainLength === 0);

  return (
    <div className="fixed top-4 right-4 z-[1100] bg-card border border-border rounded-lg p-3 shadow-lg min-w-[240px]">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-muted-foreground tracking-wider font-mono">
          CHAIN: {chainLength} LINKS
        </div>
        
        <div data-testid="badge-chain-status" className="flex items-center">
          {isIntact && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
              INTACT
            </span>
          )}
          {isCompromised && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
              COMPROMISED
            </span>
          )}
          {isUnverified && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
              UNVERIFIED
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleVerify}
        disabled={verifyState.status === 'loading' || chainLength === 0}
        data-testid="button-verify-chain"
        className="w-full py-1.5 px-3 bg-secondary hover:bg-secondary/80 border border-border rounded text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
      >
        {verifyState.status === 'loading' ? 'Verifying...' : 'Verify Chain'}
      </button>

      {verifyState.status === 'success' && (
        <div data-testid="text-verify-result" className="mt-2 text-[10px] font-mono text-green-400 leading-tight">
          ✓ Chain intact — {verifyState.count} links verified
        </div>
      )}

      {verifyState.status === 'error' && (
        <div data-testid="text-verify-result" className="mt-2 text-[10px] font-mono text-red-400 leading-tight">
          <div className="font-bold mb-1">✗ Broken at link #{verifyState.brokenAt}</div>
          <div className="text-muted-foreground break-all mb-1">ID: {verifyState.reportId}</div>
          <div className="break-all opacity-80">Exp: {verifyState.expected.substring(0, 16)}...</div>
          <div className="break-all opacity-80">Got: {verifyState.got.substring(0, 16)}...</div>
        </div>
      )}
    </div>
  );
}

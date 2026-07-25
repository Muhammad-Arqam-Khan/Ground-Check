import type { Report } from '../lib/types';
import { scoreToColor, scoreToLabel, getScoreBreakdown } from '../lib/scoring';
import { getChain } from '../lib/chain';

interface ReportPopupProps {
  report: Report;
  /** Direction this session already voted, or null if not yet voted. */
  votedDir?: 'up' | 'down' | null;
  /** True when the current session filed this report (self-voting blocked). */
  isSelf?: boolean;
}

export function ReportPopup({ report, votedDir = null, isSelf = false }: ReportPopupProps) {
  const breakdown  = getScoreBreakdown(report);
  const color      = scoreToColor(report.score);
  const label      = scoreToLabel(report.score);

  const chain      = getChain();
  const link       = chain.find(l => l.id === report.id);
  const hashPrefix = link ? link.hash.substring(0, 10) : 'pending';

  const handleVote = (dir: 'up' | 'down') => {
    window.dispatchEvent(new CustomEvent('groundcheck:vote', { detail: { id: report.id, dir } }));
  };

  const scoreColor = report.flagged ? '#e07a30' : color;

  return (
    <div
      style={{
        background: 'var(--nm-base)',
        padding: '16px 18px',
        minWidth: 230,
        maxWidth: 280,
        fontFamily: 'var(--app-font-sans)',
      }}
    >
      {/* Category + flag */}
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-[9px] font-semibold tracking-widest uppercase"
          style={{ color: 'var(--nm-fg-muted)' }}
        >
          {report.category}
        </span>
        {report.flagged && (
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(224,122,48,0.12)', color: '#e07a30' }}
          >
            ⚠ FLAGGED
          </span>
        )}
      </div>

      {/* Reporter status badge */}
      <div className="mb-3">
        {report.reporterStatus === 'verified' && (
          <span
            className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#16a34a' }}
          >
            ✓ Verified Reporter
          </span>
        )}
        {report.reporterStatus === 'flagged' && (
          <span
            className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(224,122,48,0.10)', color: '#e07a30' }}
          >
            ⚠ Unverified Reporter
          </span>
        )}
        {(!report.reporterStatus || report.reporterStatus === 'guest') && (
          <span
            className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(184,192,204,0.18)', color: 'var(--nm-fg-muted)' }}
          >
            Anonymous
          </span>
        )}
      </div>

      {/* Score */}
      <div className="flex items-baseline gap-2 mb-4">
        <span
          className="text-4xl font-bold tabular-nums"
          style={{ color: scoreColor, fontFamily: 'var(--app-font-mono)', lineHeight: 1 }}
        >
          {report.score}
        </span>
        <span className="text-xs font-semibold" style={{ color: scoreColor }}>
          {report.flagged ? 'FLAGGED' : label}
        </span>
      </div>

      {/* Score breakdown — inset data block */}
      {!report.flagged && (
        <div
          className="rounded-xl px-3 py-2.5 mb-3 space-y-1.5"
          style={{ boxShadow: 'var(--nm-inset-sm)', background: 'var(--nm-base)' }}
        >
          {[
            { l: 'OSM match',  v: breakdown.osmPoints },
            { l: 'Community',  v: breakdown.communityPoints },
            { l: 'Baseline',   v: breakdown.basePoints },
          ].map(({ l, v }) => (
            <div
              key={l}
              className="flex justify-between text-[11px]"
              style={{ fontFamily: 'var(--app-font-mono)' }}
            >
              <span style={{ color: 'var(--nm-fg-muted)' }}>{l}</span>
              <span style={{ color: 'var(--nm-fg)', fontWeight: 600 }}>+{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {report.desc && (
        <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--nm-fg)' }}>
          {report.desc}
        </p>
      )}

      {/* Votes + hash */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: '1px solid rgba(184,192,204,0.35)' }}
      >
        <div className="flex gap-2">
          <button
            onClick={() => !isSelf && votedDir === null && handleVote('up')}
            data-testid={`button-upvote-${report.id}`}
            className="nm-btn px-3 py-1.5 rounded-xl text-[11px] font-medium"
            disabled={isSelf || votedDir !== null}
            title={isSelf ? 'Cannot vote on your own report' : votedDir !== null ? 'Already voted' : undefined}
            style={{
              color: votedDir === 'up' ? '#fff' : '#4ab964',
              background: votedDir === 'up' ? '#4ab964' : undefined,
              opacity: (isSelf || (votedDir !== null && votedDir !== 'up')) ? 0.4 : 1,
              cursor: (isSelf || votedDir !== null) ? 'not-allowed' : undefined,
            }}
          >
            ▲ {report.up}
          </button>
          <button
            onClick={() => !isSelf && votedDir === null && handleVote('down')}
            data-testid={`button-downvote-${report.id}`}
            className="nm-btn px-3 py-1.5 rounded-xl text-[11px] font-medium"
            disabled={isSelf || votedDir !== null}
            title={isSelf ? 'Cannot vote on your own report' : votedDir !== null ? 'Already voted' : undefined}
            style={{
              color: votedDir === 'down' ? '#fff' : '#dc3c3c',
              background: votedDir === 'down' ? '#dc3c3c' : undefined,
              opacity: (isSelf || (votedDir !== null && votedDir !== 'down')) ? 0.4 : 1,
              cursor: (isSelf || votedDir !== null) ? 'not-allowed' : undefined,
            }}
          >
            ▼ {report.down}
          </button>
        </div>

        <div
          className="text-[9px]"
          style={{ color: 'var(--nm-dark)', fontFamily: 'var(--app-font-mono)' }}
          title={link?.hash}
        >
          #{hashPrefix}
        </div>
      </div>
    </div>
  );
}

import type { Report } from '../lib/types';
import { scoreToColor, scoreToLabel, getScoreBreakdown } from '../lib/scoring';
import { getChain } from '../lib/chain';

interface ReportPopupProps {
  report: Report;
}

export function ReportPopup({ report }: ReportPopupProps) {
  const breakdown = getScoreBreakdown(report);
  const color = scoreToColor(report.score);
  const label = scoreToLabel(report.score);
  
  const chain = getChain();
  const link = chain.find(l => l.id === report.id);
  const hashPrefix = link ? link.hash.substring(0, 12) : 'pending...';

  const handleVote = (dir: 'up' | 'down') => {
    window.dispatchEvent(new CustomEvent('groundcheck:vote', { detail: { id: report.id, dir } }));
  };

  return (
    <div className="p-1 min-w-[220px] text-foreground font-sans">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {report.category}
        </span>
        {report.flagged && (
          <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
            ⚠ UNVERIFIED — FLAGGED
          </span>
        )}
      </div>

      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span 
            className="text-3xl font-mono font-bold"
            style={{ color: report.flagged ? '#f97316' : color }}
          >
            {report.score}
          </span>
          <span 
            className="text-xs font-bold"
            style={{ color: report.flagged ? '#f97316' : color }}
          >
            {report.flagged ? 'FLAGGED' : label}
          </span>
        </div>
      </div>

      {!report.flagged && (
        <div className="mb-3 space-y-1 text-xs border border-border bg-black/20 rounded p-2 font-mono">
          <div className="flex justify-between">
            <span className="text-muted-foreground">OSM match</span>
            <span>+{breakdown.osmPoints}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Community</span>
            <span>+{breakdown.communityPoints}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Baseline</span>
            <span>+{breakdown.basePoints}</span>
          </div>
        </div>
      )}

      <p className="text-sm mb-3 text-card-foreground break-words">
        {report.desc || <span className="text-muted-foreground italic">No description</span>}
      </p>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <div className="flex gap-2">
          <button
            onClick={() => handleVote('up')}
            data-testid={`button-upvote-${report.id}`}
            className="flex items-center gap-1 px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-xs transition-colors"
          >
            <span className="text-green-500">▲</span> {report.up}
          </button>
          <button
            onClick={() => handleVote('down')}
            data-testid={`button-downvote-${report.id}`}
            className="flex items-center gap-1 px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-xs transition-colors"
          >
            <span className="text-red-500">▼</span> {report.down}
          </button>
        </div>
        
        <div className="text-[10px] font-mono text-muted-foreground" title={link?.hash}>
          Hash: {hashPrefix}...
        </div>
      </div>
    </div>
  );
}

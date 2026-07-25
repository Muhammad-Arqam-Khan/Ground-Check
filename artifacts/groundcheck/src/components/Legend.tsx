export function Legend() {
  return (
    <div className="fixed bottom-8 left-4 z-[1100] bg-card border border-border rounded-lg p-3 shadow-lg">
      <h3 className="text-xs font-bold text-muted-foreground mb-2 font-mono">TRUST SCORE</h3>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-500"></div>
          <span>HIGH TRUST (≥70)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-500"></div>
          <span>MID TRUST (40-69)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500"></div>
          <span>LOW TRUST (&lt;40)</span>
        </div>
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
          <div className="w-3 h-3 rounded-full border border-orange-500 border-dashed"></div>
          <span className="text-orange-500">FLAGGED / UNVERIFIED</span>
        </div>
      </div>
    </div>
  );
}

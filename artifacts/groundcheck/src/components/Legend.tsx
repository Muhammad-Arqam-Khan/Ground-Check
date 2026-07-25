export function Legend() {
  const scores = [
    { color: '#4ab964', label: 'High trust', range: '≥ 70' },
    { color: '#e8a020', label: 'Mid trust',  range: '40–69' },
    { color: '#dc3c3c', label: 'Low trust',  range: '< 40' },
  ];

  return (
    <div
      className="fixed bottom-6 left-4 z-[1100] rounded-2xl p-4"
      style={{ background: 'var(--nm-base)', boxShadow: 'var(--nm-raised)' }}
    >
      <p
        className="text-[9px] font-semibold tracking-widest uppercase mb-3"
        style={{ color: 'var(--nm-fg-muted)', fontFamily: 'var(--app-font-mono)' }}
      >
        Trust Score
      </p>

      <div className="space-y-2.5">
        {scores.map(({ color, label, range }) => (
          <div key={label} className="flex items-center gap-3">
            <div
              className="shrink-0 w-3 h-3 rounded-full"
              style={{
                background: color,
                boxShadow: '2px 2px 5px rgba(0,0,0,0.14), -1px -1px 4px rgba(255,255,255,0.9)',
              }}
            />
            <span className="text-xs font-medium" style={{ color: 'var(--nm-fg)' }}>{label}</span>
            <span className="text-[10px] ml-auto pl-2 tabular-nums" style={{ color: 'var(--nm-fg-muted)' }}>
              {range}
            </span>
          </div>
        ))}

        <div className="pt-2.5" style={{ borderTop: '1px solid rgba(184,192,204,0.45)' }}>
          <div className="flex items-center gap-3">
            <div
              className="shrink-0 w-3 h-3 rounded-full"
              style={{ border: '1.5px dashed #e07a30', boxShadow: 'var(--nm-raised-xs)' }}
            />
            <span className="text-xs font-medium" style={{ color: '#e07a30' }}>Flagged</span>
          </div>
        </div>
      </div>
    </div>
  );
}

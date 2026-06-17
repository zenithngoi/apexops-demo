export default function MemoryFeed({ insights, failures, playbook, cycleCount }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Stats row */}
      {cycleCount > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[
            ['Cycles Run', cycleCount, 'var(--accent)'],
            ['Playbook Size', playbook?.length || 0, 'var(--accent2)'],
            ['Failures Logged', failures?.length || 0, 'var(--warn)'],
          ].map(([label, val, color]) => (
            <div key={label} style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color }}>{val}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Staged insights (this cycle) */}
      <div>
        <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
          🧠 Staged Insights (this cycle)
        </div>
        {(!insights || insights.length === 0)
          ? <div style={{ color: 'var(--sub)', fontSize: '0.75rem', fontStyle: 'italic' }}>No insights staged yet — run the loop.</div>
          : insights.slice(-8).map((ins, i) => (
            <div key={i} style={{ background: 'rgba(0,229,160,0.05)', border: '1px solid rgba(0,229,160,0.15)', borderRadius: '7px', padding: '0.5rem 0.7rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text)', lineHeight: 1.55 }}>{ins}</span>
            </div>
          ))
        }
      </div>

      {/* Permanent playbook */}
      {playbook?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--accent2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
            📚 Permanent Playbook — fed into every agent prompt
          </div>
          {playbook.map((entry, i) => (
            <div key={i} style={{ background: 'rgba(0,71,255,0.06)', border: '1px solid rgba(0,71,255,0.18)', borderRadius: '7px', padding: '0.5rem 0.7rem', marginBottom: '0.3rem', display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent2)', fontWeight: 800, fontSize: '0.68rem', flexShrink: 0 }}>#{i + 1}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text)', lineHeight: 1.55 }}>{entry}</span>
            </div>
          ))}
        </div>
      )}

      {/* Permanent failures */}
      {failures?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--warn)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
            ✗ Failures Log — agents are banned from repeating these
          </div>
          {failures.map((entry, i) => (
            <div key={i} style={{ background: 'rgba(255,77,77,0.05)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '7px', padding: '0.5rem 0.7rem', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text)', lineHeight: 1.55 }}>{entry}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

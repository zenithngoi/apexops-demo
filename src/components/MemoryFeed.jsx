export default function MemoryFeed({ insights }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', overflowY: 'auto' }}>
      {(!insights || insights.length === 0) ? (
        <div style={{ color: 'var(--sub)', fontSize: '0.78rem', fontStyle: 'italic', textAlign: 'center', paddingTop: '1.5rem' }}>
          No insights yet — run the loop to populate memory.
        </div>
      ) : (
        insights.map((ins, i) => (
          <div key={i} style={{
            background: 'rgba(0,229,160,0.05)', border: '1px solid rgba(0,229,160,0.15)',
            borderRadius: '8px', padding: '0.65rem 0.8rem',
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent)', lineHeight: 1.55 }}>{ins}</span>
          </div>
        ))
      )}
    </div>
  );
}

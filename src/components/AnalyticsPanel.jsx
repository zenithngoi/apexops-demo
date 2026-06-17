const SIM_POSTS = [
  { platform: 'TikTok',    time: '20:01', views: 4820, er: 6.2, velocity: 1607, tag: '[BOOST CANDIDATE]' },
  { platform: 'Instagram', time: '20:03', views: 1340, er: 4.8, velocity:  447, tag: null },
  { platform: 'YouTube',   time: '08:02', views:  890, er: 5.1, velocity:  112, tag: null },
  { platform: 'X',         time: '08:05', views:  620, er: 3.4, velocity:   78, tag: null },
];

export default function AnalyticsPanel({ hasData, liveText, streaming }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {!hasData && !streaming ? (
        <div style={{ color: 'var(--sub)', fontSize: '0.78rem', fontStyle: 'italic' }}>
          Analytics Agent runs after publishing. Results appear here.
        </div>
      ) : (
        <>
          {/* Simulated metrics table */}
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Simulated Post Metrics (+3h)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '0.4rem', fontSize: '0.6rem', color: 'var(--sub)', fontWeight: 700, textTransform: 'uppercase', padding: '0 0.5rem' }}>
                <span>Platform</span><span>Views</span><span>ER%</span><span>Vel/hr</span><span>Flag</span>
              </div>
              {SIM_POSTS.map((p, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '0.4rem', alignItems: 'center',
                  background: p.tag ? 'rgba(0,229,160,0.06)' : 'var(--card)',
                  border: `1px solid ${p.tag ? 'rgba(0,229,160,0.2)' : 'var(--border)'}`,
                  borderRadius: '7px', padding: '0.5rem 0.65rem', fontSize: '0.75rem',
                }}>
                  <span style={{ fontWeight: 700 }}>{p.platform}</span>
                  <span>{p.views.toLocaleString()}</span>
                  <span style={{ color: p.er > 5 ? 'var(--accent)' : 'var(--text)' }}>{p.er}%</span>
                  <span>{p.velocity.toLocaleString()}</span>
                  <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '0.12rem 0.35rem', borderRadius: '4px', background: p.tag ? 'rgba(0,229,160,0.15)' : 'transparent', color: p.tag ? 'var(--accent)' : 'var(--sub)', whiteSpace: 'nowrap' }}>{p.tag || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Claude analytics interpretation */}
          {(liveText || streaming) && (
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>🤖 Analytics Agent Interpretation</div>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.73rem', color: 'var(--text)', lineHeight: 1.65, fontFamily: 'inherit', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem' }}>
                {liveText || ''}
                {streaming && <span style={{ color: 'var(--accent)' }}>▊</span>}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}

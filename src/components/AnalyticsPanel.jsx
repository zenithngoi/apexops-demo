const SIM_POSTS = [
  { platform: 'TikTok',    time: '20:01', views: 4820,  er: 6.2, velocity: 1607, tag: '[BOOST CANDIDATE]' },
  { platform: 'Instagram', time: '20:03', views: 1340,  er: 4.8, velocity:  447, tag: null },
  { platform: 'YouTube',   time: '08:02', views: 890,   er: 5.1, velocity:  112, tag: null },
  { platform: 'X',         time: '08:05', views: 620,   er: 3.4, velocity:   78, tag: null },
];

export default function AnalyticsPanel({ hasData }) {
  if (!hasData) {
    return (
      <div style={{ color: 'var(--sub)', fontSize: '0.78rem', fontStyle: 'italic', paddingTop: '1rem' }}>
        Analytics Agent runs after publishing. Simulated data will appear here.
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '0.5rem', fontSize: '0.65rem', color: 'var(--sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0.5rem' }}>
        <span>Platform</span><span>Views (+3h)</span><span>ER %</span><span>Velocity</span><span>Flag</span>
      </div>
      {SIM_POSTS.map((p, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center',
          background: p.tag ? 'rgba(0,229,160,0.06)' : 'var(--card)',
          border: `1px solid ${p.tag ? 'rgba(0,229,160,0.2)' : 'var(--border)'}`,
          borderRadius: '8px', padding: '0.55rem 0.75rem', fontSize: '0.78rem',
        }}>
          <span style={{ fontWeight: 700 }}>{p.platform}</span>
          <span>{p.views.toLocaleString()}</span>
          <span style={{ color: p.er > 5 ? 'var(--accent)' : 'var(--text)' }}>{p.er}%</span>
          <span>{p.velocity.toLocaleString()}/hr</span>
          <span style={{
            fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.4rem',
            borderRadius: '4px', whiteSpace: 'nowrap',
            background: p.tag ? 'rgba(0,229,160,0.15)' : 'transparent',
            color: p.tag ? 'var(--accent)' : 'var(--sub)',
          }}>{p.tag || '—'}</span>
        </div>
      ))}
      <div style={{ fontSize: '0.68rem', color: 'var(--sub)', marginTop: '0.25rem', padding: '0 0.25rem' }}>
        ⚡ Velocity alert sent to Ads Manager. TikTok post queued for boost approval.
      </div>
    </div>
  );
}

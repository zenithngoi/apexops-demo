const SIM_ADS = [
  { name: 'TikTok — Proof Reel #3', platform: 'TikTok',    spend: 'RM 280', roas: 4.1, ctr: '1.8%', status: 'SCALING' },
  { name: 'IG — Education Hook #7', platform: 'Instagram', spend: 'RM 180', roas: 2.8, ctr: '1.2%', status: 'WATCH' },
  { name: 'TikTok — Lifestyle #1',  platform: 'TikTok',    spend: 'RM 150', roas: 1.3, ctr: '0.6%', status: 'KILL' },
];

const STATUS_COLOR = { SCALING: 'var(--accent)', WATCH: 'var(--yellow)', KILL: 'var(--warn)', LIVE: 'var(--text)' };

export default function AdsPanel({ hasData }) {
  if (!hasData) {
    return (
      <div style={{ color: 'var(--sub)', fontSize: '0.78rem', fontStyle: 'italic', paddingTop: '1rem' }}>
        Ads Manager runs after Analytics flags boost candidates. Simulated ledger will appear here.
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.65rem', color: 'var(--sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0.5rem' }}>
        <span>Campaign</span><span>Spend</span><span>ROAS</span><span>CTR</span><span>Status</span>
      </div>
      {SIM_ADS.map((ad, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '0.5rem', alignItems: 'center',
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '0.55rem 0.75rem', fontSize: '0.78rem',
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.75rem' }}>{ad.name}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--sub)' }}>{ad.platform}</div>
          </div>
          <span>{ad.spend}</span>
          <span style={{ color: ad.roas >= 3 ? 'var(--accent)' : ad.roas < 1.5 ? 'var(--warn)' : 'var(--yellow)', fontWeight: 700 }}>{ad.roas}×</span>
          <span>{ad.ctr}</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: STATUS_COLOR[ad.status] || 'var(--sub)' }}>{ad.status}</span>
        </div>
      ))}
      <div style={{ fontSize: '0.68rem', color: 'var(--sub)', marginTop: '0.25rem', padding: '0 0.25rem' }}>
        🔒 Kill recommendation for Lifestyle #1 pending human approval. Rule: CTR &lt; 0.8% at 1,000+ impressions.
      </div>
    </div>
  );
}

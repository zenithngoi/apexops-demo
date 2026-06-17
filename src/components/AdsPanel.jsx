import { useState } from 'react';

const INITIAL_ADS = [
  { id: 1, name: 'TikTok — Proof Reel #3', platform: 'TikTok',    spend: 280, roas: 4.1, ctr: 1.8, impressions: 18400, status: 'SCALING' },
  { id: 2, name: 'IG — Education Hook #7', platform: 'Instagram', spend: 180, roas: 2.8, ctr: 1.2, impressions: 12100, status: 'WATCH'   },
  { id: 3, name: 'TikTok — Lifestyle #1',  platform: 'TikTok',    spend: 150, roas: 1.3, ctr: 0.6, impressions:  9800, status: 'KILL'    },
];

const STATUS_COLOR = { SCALING: 'var(--accent)', WATCH: 'var(--yellow)', KILL: 'var(--warn)', LIVE: 'var(--text)', PAUSED: 'var(--sub)' };
const RULE = { SCALING: 'ROAS ≥ 3.0× for 48h → +20%/day', WATCH: '1.5× ≤ ROAS < 2.5× — monitor', KILL: 'CTR < 0.8% at 1,000+ impressions', LIVE: 'Active — monitoring', PAUSED: 'Paused — awaiting review' };

export default function AdsPanel({ hasData }) {
  const [ads, setAds]             = useState(INITIAL_ADS);
  const [pendingAction, setPending] = useState(null); // { adId, action }
  const [approved, setApproved]   = useState([]);

  const requestAction = (adId, action) => setPending({ adId, action });

  const approve = () => {
    if (!pendingAction) return;
    const { adId, action } = pendingAction;
    setAds(prev => prev.map(ad => {
      if (ad.id !== adId) return ad;
      if (action === 'kill')  return { ...ad, status: 'PAUSED', spend: 0 };
      if (action === 'scale') return { ...ad, spend: Math.round(ad.spend * 1.2), status: 'SCALING' };
      return ad;
    }));
    setApproved(prev => [...prev, `${action.toUpperCase()} — ${ads.find(a => a.id === adId)?.name} — approved ${new Date().toLocaleTimeString()}`]);
    setPending(null);
  };

  if (!hasData) return (
    <div style={{ color: 'var(--sub)', fontSize: '0.78rem', fontStyle: 'italic', paddingTop: '0.5rem' }}>
      Ads Book populates after Analytics flags boost candidates.
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', overflowY: 'auto' }}>

      {/* Approval modal */}
      {pendingAction && (() => {
        const ad = ads.find(a => a.id === pendingAction.adId);
        return (
          <div style={{ background: 'rgba(0,229,160,0.07)', border: '1px solid var(--accent)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.4rem' }}>⚠ Human Approval Required</div>
            <div style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
              {pendingAction.action === 'kill'
                ? `Kill campaign "${ad?.name}"? Rule: CTR ${ad?.ctr}% < 0.8% threshold.`
                : `Scale "${ad?.name}" +20% budget (RM${ad?.spend} → RM${Math.round(ad?.spend * 1.2)})? Rule: ROAS ${ad?.roas}× ≥ 3.0×.`}
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={approve} style={{ background: 'var(--accent)', color: 'var(--black)', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem' }}>✓ Approve</button>
              <button onClick={() => setPending(null)} style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--sub)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem' }}>Decline</button>
            </div>
          </div>
        );
      })()}

      {/* Ads ledger */}
      <div>
        <div style={{ fontSize: '0.65rem', color: 'var(--sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Live Ads Ledger — Ranked by ROAS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {[...ads].sort((a, b) => b.roas - a.roas).map(ad => (
            <div key={ad.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '9px', padding: '0.7rem 0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.name}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--sub)', marginTop: '0.1rem' }}>{ad.platform} · {ad.impressions.toLocaleString()} impressions</div>
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: STATUS_COLOR[ad.status], flexShrink: 0, paddingTop: '0.1rem' }}>{ad.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginTop: '0.5rem' }}>
                {[['Spend', `RM ${ad.spend}`], ['ROAS', `${ad.roas}×`], ['CTR', `${ad.ctr}%`]].map(([l, v]) => (
                  <div key={l} style={{ background: 'var(--dark)', borderRadius: '5px', padding: '0.3rem 0.4rem' }}>
                    <div style={{ fontSize: '0.58rem', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: l === 'ROAS' ? (ad.roas >= 3 ? 'var(--accent)' : ad.roas < 1.5 ? 'var(--warn)' : 'var(--yellow)') : l === 'CTR' ? (ad.ctr < 0.8 ? 'var(--warn)' : 'var(--text)') : 'var(--text)' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--sub)', marginTop: '0.4rem' }}>Rule: {RULE[ad.status]}</div>
              {ad.status !== 'PAUSED' && (
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {ad.roas >= 3 && ad.status !== 'SCALING' && (
                    <button onClick={() => requestAction(ad.id, 'scale')} style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)', color: 'var(--accent)', padding: '0.25rem 0.65rem', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 700 }}>↑ Scale +20%</button>
                  )}
                  {(ad.ctr < 0.8 || ad.roas < 1.5) && (
                    <button onClick={() => requestAction(ad.id, 'kill')} style={{ background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.3)', color: 'var(--warn)', padding: '0.25rem 0.65rem', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 700 }}>✕ Kill</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Approval log */}
      {approved.length > 0 && (
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Approval Log</div>
          {approved.map((a, i) => (
            <div key={i} style={{ fontSize: '0.7rem', color: 'var(--accent)', padding: '0.2rem 0' }}>✓ {a}</div>
          ))}
        </div>
      )}
    </div>
  );
}

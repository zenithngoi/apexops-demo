import { useState } from 'react';

const STAGES = [
  { key: 'reach',       label: 'Reach',         desc: 'Total video views across all platforms',   color: '#0047ff' },
  { key: 'profileVisit',label: 'Profile Visits', desc: 'Viewers who tapped your profile',          color: '#0066ff' },
  { key: 'linkClick',   label: 'Link Clicks',    desc: 'Clicked bio link / swipe-up',              color: '#00aaff' },
  { key: 'formStart',   label: 'Form Starts',    desc: 'Started the registration / inquiry form',  color: '#00cccc' },
  { key: 'leads',       label: 'Leads',          desc: 'Completed form submissions',               color: '#00e5a0' },
  { key: 'qualified',   label: 'Qualified',       desc: 'Passed KYC / broker qualification check', color: '#7fffcf' },
];

const DEFAULT = { reach: 48200, profileVisit: 3840, linkClick: 960, formStart: 310, leads: 87, qualified: 34 };

export default function LeadsFunnel() {
  const [values, setValues] = useState(DEFAULT);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');

  const maxVal = values.reach || 1;

  const startEdit = (key) => { setEditing(key); setDraft(String(values[key])); };
  const commitEdit = () => {
    const n = parseInt(draft.replace(/,/g, ''), 10);
    if (!isNaN(n) && n >= 0) setValues(v => ({ ...v, [editing]: n }));
    setEditing(null);
  };

  const cpl = values.leads > 0 ? `RM ${(1200 / values.leads).toFixed(0)}` : '—';
  const cvr = values.reach  > 0 ? `${((values.leads / values.reach) * 100).toFixed(3)}%` : '—';
  const qualified_rate = values.leads > 0 ? `${((values.qualified / values.leads) * 100).toFixed(0)}%` : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', overflowY: 'auto' }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.6rem' }}>
        {[['Cost / Lead', cpl, 'Estimated at RM1,200 ad spend'], ['Reach→Lead CVR', cvr, 'Full-funnel conversion'], ['Lead Qualification', qualified_rate, 'Qualified / total leads']].map(([l, v, sub]) => (
          <div key={l} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '9px', padding: '0.65rem 0.8rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.03em' }}>{v}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.15rem' }}>{l}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--sub)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Funnel bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.62rem', color: 'var(--sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
          Funnel — click any number to edit
        </div>
        {STAGES.map((stage, i) => {
          const val = values[stage.key];
          const prev = i > 0 ? values[STAGES[i-1].key] : val;
          const dropPct = prev > 0 ? `${(((prev - val) / prev) * 100).toFixed(0)}% drop` : '';
          const barW = Math.max((val / maxVal) * 100, 1);

          return (
            <div key={stage.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.2rem' }}>
                <div style={{ width: 90, fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)', flexShrink: 0 }}>{stage.label}</div>
                <div style={{ flex: 1, height: 22, background: 'var(--muted)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${barW}%`, background: stage.color, borderRadius: '4px', transition: 'width 0.4s', opacity: 0.85 }} />
                </div>
                {editing === stage.key ? (
                  <input
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={e => e.key === 'Enter' && commitEdit()}
                    autoFocus
                    style={{ width: 80, background: 'var(--dark)', border: '1px solid var(--accent)', color: 'var(--text)', padding: '0.2rem 0.4rem', borderRadius: '5px', fontSize: '0.78rem', fontFamily: 'monospace', textAlign: 'right' }}
                  />
                ) : (
                  <div onClick={() => startEdit(stage.key)} style={{ width: 80, textAlign: 'right', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text)', cursor: 'pointer', flexShrink: 0 }}
                    title="Click to edit">
                    {val.toLocaleString()}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: 90 }} />
                <div style={{ fontSize: '0.6rem', color: 'var(--sub)' }}>{stage.desc}</div>
                {i > 0 && <div style={{ marginLeft: 'auto', fontSize: '0.6rem', color: parseInt(dropPct) > 80 ? 'var(--warn)' : 'var(--sub)', flexShrink: 0 }}>{dropPct}</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: '0.62rem', color: 'var(--sub)', borderTop: '1px solid var(--border)', paddingTop: '0.6rem' }}>
        💡 Click any number in the funnel to update it. KPIs recalculate automatically.
      </div>
    </div>
  );
}

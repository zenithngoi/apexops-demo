import { useState } from 'react';

const Score = ({ label, value, max = 10 }) => {
  const pct = (value / max) * 100;
  const color = pct >= 70 ? 'var(--accent)' : pct >= 40 ? '#f5a623' : '#ff4d6d';
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>{label}</span>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color }}>{value}/{max}</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
};

const Badge = ({ label, color = 'var(--accent)' }) => (
  <span style={{
    background: `${color}18`, border: `1px solid ${color}30`,
    color, fontSize: '0.6rem', fontWeight: 700, padding: '0.18rem 0.5rem',
    borderRadius: '99px', letterSpacing: '0.06em', textTransform: 'uppercase',
  }}>{label}</span>
);

export default function SeoGeoPanel({ output, streaming, hasData }) {
  const [tab, setTab] = useState('seo');

  const sections = {
    seo: '',
    geo: '',
    priority: '',
  };

  if (output) {
    const seoStart = output.indexOf('## 🔍 SEO AUDIT');
    const geoStart = output.indexOf('## 🤖 GEO AUDIT');
    const priStart = output.indexOf('## 📊 COMBINED');

    if (seoStart !== -1) sections.seo = output.slice(seoStart, geoStart !== -1 ? geoStart : undefined);
    if (geoStart !== -1) sections.geo = output.slice(geoStart, priStart !== -1 ? priStart : undefined);
    if (priStart !== -1) sections.priority = output.slice(priStart);
  }

  const TABS = [
    { key: 'seo', label: '🔍 SEO', color: 'var(--accent)' },
    { key: 'geo', label: '🤖 GEO', color: '#7b5cf0' },
    { key: 'priority', label: '📊 Priority', color: '#00ffa3' },
    { key: 'raw', label: '📄 Raw', color: 'var(--sub)' },
  ];

  if (!hasData && !streaming && !output) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--sub)' }}>
        <div style={{ fontSize: '2.5rem' }}>🔍</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>SEO & GEO Agent</div>
        <div style={{ fontSize: '0.75rem', textAlign: 'center', maxWidth: 340, lineHeight: 1.7 }}>
          Runs automatically after Content Agent each cycle.<br/>
          Outputs keyword opportunities, on-page scores, meta tags,<br/>
          and GEO brand visibility recommendations.
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          <Badge label="Keyword Research" />
          <Badge label="On-Page Score" color="#7b5cf0" />
          <Badge label="Meta Tags" />
          <Badge label="GEO Audit" color="#00ffa3" />
          <Badge label="AI Visibility" color="#7b5cf0" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* STATUS ROW */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: streaming ? '#f5a623' : 'var(--accent)',
          boxShadow: streaming ? '0 0 8px #f5a623' : '0 0 8px var(--accent)',
          animation: streaming ? 'pulse 1s infinite' : 'none',
        }} />
        <span style={{ fontSize: '0.7rem', color: 'var(--sub)', fontWeight: 600 }}>
          {streaming ? 'Analysing SEO + GEO…' : 'SEO & GEO Report Ready'}
        </span>
        <div style={{ flex: 1 }} />
        <Badge label="SEO" />
        <Badge label="GEO" color="#7b5cf0" />
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '0.35rem 0.75rem', background: 'transparent',
            color: tab === t.key ? t.color : 'var(--sub)',
            borderBottom: tab === t.key ? `2px solid ${t.color}` : '2px solid transparent',
            fontSize: '0.68rem', fontWeight: tab === t.key ? 700 : 500, cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'raw' ? (
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.73rem', color: 'var(--text)', lineHeight: 1.7, fontFamily: 'inherit' }}>
            {output || ''}
            {streaming && <span style={{ color: 'var(--accent)' }}>▊</span>}
          </pre>
        ) : (
          <div>
            {/* SEO TAB */}
            {tab === 'seo' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'rgba(0,229,160,0.04)', border: '1px solid rgba(0,229,160,0.12)', borderRadius: 10, padding: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>On-Page Scores</div>
                  <Score label="Title Tag Strength" value={7} />
                  <Score label="Keyword Density" value={6} />
                  <Score label="Content Depth" value={8} />
                  <Score label="Internal Linking Potential" value={5} />
                  <Score label="Readability / Scannability" value={7} />
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.73rem', color: 'var(--text)', lineHeight: 1.7, fontFamily: 'inherit' }}>
                  {sections.seo || (streaming ? 'Analysing…' : 'Run the loop to generate SEO report')}
                  {streaming && tab === 'seo' && !sections.geo && <span style={{ color: 'var(--accent)' }}>▊</span>}
                </pre>
              </div>
            )}

            {/* GEO TAB */}
            {tab === 'geo' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'rgba(123,92,240,0.05)', border: '1px solid rgba(123,92,240,0.15)', borderRadius: 10, padding: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: '#7b5cf0', textTransform: 'uppercase', marginBottom: '0.75rem' }}>GEO Visibility Scores</div>
                  <Score label="Brand Authority Signals" value={4} max={10} />
                  <Score label="Content Structure for AI" value={6} max={10} />
                  <Score label="Platform Footprint" value={5} max={10} />
                  <Score label="E-E-A-T Signals" value={5} max={10} />
                </div>
                <div style={{ background: 'rgba(123,92,240,0.05)', border: '1px solid rgba(123,92,240,0.15)', borderRadius: 10, padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#7b5cf0', marginBottom: '0.4rem' }}>What is GEO?</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--sub)', lineHeight: 1.7 }}>
                    Generative Engine Optimisation — making your brand appear in ChatGPT, Perplexity, Claude & Gemini answers. As AI search grows, GEO visibility becomes as important as Google ranking.
                  </div>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.73rem', color: 'var(--text)', lineHeight: 1.7, fontFamily: 'inherit' }}>
                  {sections.geo || (streaming ? 'Analysing GEO…' : 'Run the loop to generate GEO report')}
                  {streaming && sections.seo && !sections.priority && <span style={{ color: '#7b5cf0' }}>▊</span>}
                </pre>
              </div>
            )}

            {/* PRIORITY TAB */}
            {tab === 'priority' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'rgba(0,255,163,0.04)', border: '1px solid rgba(0,255,163,0.15)', borderRadius: 10, padding: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: '#00ffa3', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Combined SEO + GEO Health</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#00ffa3', letterSpacing: '-0.04em' }}>—/20</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--sub)', marginTop: '0.25rem' }}>Score updates after each cycle run</div>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.73rem', color: 'var(--text)', lineHeight: 1.7, fontFamily: 'inherit' }}>
                  {sections.priority || (streaming ? 'Calculating priority score…' : 'Run the loop to see combined priority')}
                  {streaming && sections.geo && !sections.priority && <span style={{ color: '#00ffa3' }}>▊</span>}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

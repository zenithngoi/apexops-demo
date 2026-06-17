import { useState } from 'react';

const PLATFORM_OPTIONS = ['TikTok', 'Instagram Reel', 'YouTube Short', 'X', 'Facebook', 'LinkedIn'];
const PILLAR_OPTIONS   = ['Education', 'Proof', 'Lifestyle', 'Commentary', 'Behind the Scenes', 'Offer'];

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom:'0.9rem' }}>
    <label style={{ display:'block', fontSize:'0.68rem', fontWeight:700, color:'var(--sub)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.25rem' }}>{label}</label>
    {hint && <div style={{ fontSize:'0.62rem', color:'var(--sub)', marginBottom:'0.3rem', fontStyle:'italic' }}>{hint}</div>}
    {children}
  </div>
);

const inputStyle = {
  width:'100%', background:'var(--dark)', border:'1px solid var(--border)', color:'var(--text)',
  padding:'0.35rem 0.6rem', borderRadius:'6px', fontSize:'0.74rem', fontFamily:'inherit',
  boxSizing:'border-box',
};

const textareaStyle = { ...inputStyle, resize:'vertical', lineHeight:1.6 };

export default function OnboardingModal({ onConfirm, onCancel }) {
  const [step, setStep] = useState(1); // 1 = basic, 2 = voice+pillars, 3 = confirm

  const [form, setForm] = useState({
    clientName: '',
    industry: '',
    market: '',
    audience: '',
    tone: '',
    pillars: ['Education', 'Proof'],
    platforms: ['TikTok', 'Instagram Reel'],
    brandVoice: '',
    doNots: '',
    initialPlaybook: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleArr = (key, val) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }));
  };

  const canAdvance = () => {
    if (step === 1) return form.clientName.trim() && form.industry.trim() && form.audience.trim();
    if (step === 2) return form.platforms.length > 0 && form.tone.trim();
    return true;
  };

  const chipStyle = (active) => ({
    padding:'0.22rem 0.55rem', borderRadius:'99px', fontSize:'0.65rem', fontWeight:600,
    border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
    background: active ? 'rgba(0,229,160,0.1)' : 'var(--dark)',
    color: active ? 'var(--accent)' : 'var(--sub)',
    cursor:'pointer', userSelect:'none',
  });

  const handleConfirm = () => {
    // Convert form → CLIENTS entry shape + initial memory seed
    const clientDef = {
      industry: form.industry,
      market: form.market || 'Malaysia',
      audience: form.audience,
      platforms: form.platforms,
      tone: form.tone,
      pillars: form.pillars,
    };

    // Parse initial playbook entries from textarea
    const seedPlaybook = form.initialPlaybook
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => `[SEED] ${l}`)
      .slice(0, 10);

    // Parse do-nots as initial failures
    const seedFailures = form.doNots
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => `[SEED FAILURE] ${l}`)
      .slice(0, 10);

    onConfirm(form.clientName.trim(), clientDef, seedPlaybook, seedFailures);
  };

  const STEPS = ['Basic Info', 'Voice & Strategy', 'Review'];

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:9999,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem',
    }}>
      <div style={{
        background:'var(--dark)', border:'1px solid var(--border)', borderRadius:'12px',
        width:'100%', maxWidth:'520px', maxHeight:'90vh', display:'flex', flexDirection:'column',
        overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,0.6)',
      }}>

        {/* HEADER */}
        <div style={{ padding:'1rem 1.25rem 0.75rem', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontWeight:900, fontSize:'0.95rem', color:'var(--text)' }}>🚀 New Client Onboarding</div>
              <div style={{ fontSize:'0.64rem', color:'var(--sub)', marginTop:'0.15rem' }}>Seeds brand voice + strategy into agent memory from day one</div>
            </div>
            <button onClick={onCancel} style={{ background:'transparent', border:'none', color:'var(--sub)', fontSize:'1.1rem', cursor:'pointer', padding:'0 0.2rem' }}>✕</button>
          </div>

          {/* STEP INDICATORS */}
          <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.85rem' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ flex:1, textAlign:'center' }}>
                <div style={{
                  height:'3px', borderRadius:'2px', marginBottom:'0.3rem',
                  background: i+1 <= step ? 'var(--accent)' : 'var(--border)',
                }} />
                <span style={{ fontSize:'0.58rem', color: i+1 === step ? 'var(--accent)' : 'var(--sub)', fontWeight: i+1 === step ? 700 : 400 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BODY */}
        <div style={{ flex:1, overflowY:'auto', padding:'1rem 1.25rem' }}>

          {step === 1 && (
            <>
              <Field label="Client Name *" hint="Used as the client key in the system">
                <input style={inputStyle} value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="e.g. Apex PropFirm" />
              </Field>
              <Field label="Industry *">
                <input style={inputStyle} value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="e.g. Proprietary Trading Firm" />
              </Field>
              <Field label="Market / Region">
                <input style={inputStyle} value={form.market} onChange={e => set('market', e.target.value)} placeholder="e.g. Malaysia (Phase 1)" />
              </Field>
              <Field label="Target Audience *" hint="Be specific — age, profile, level">
                <textarea style={textareaStyle} rows={2} value={form.audience} onChange={e => set('audience', e.target.value)} placeholder="e.g. 22–40 MY traders who want to scale capital. Beginner to intermediate. Ambitious, risk-aware." />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Brand Tone *" hint="How the brand speaks — use 1–2 sentences">
                <textarea style={textareaStyle} rows={2} value={form.tone} onChange={e => set('tone', e.target.value)} placeholder="e.g. Aspirational and direct. English with light Bahasa Malaysia. No hype, no fake lifestyle — just real performance." />
              </Field>

              <Field label="Content Pillars" hint="What topics will you rotate between?">
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.35rem' }}>
                  {PILLAR_OPTIONS.map(p => (
                    <div key={p} style={chipStyle(form.pillars.includes(p))} onClick={() => toggleArr('pillars', p)}>{p}</div>
                  ))}
                </div>
              </Field>

              <Field label="Active Platforms *">
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.35rem' }}>
                  {PLATFORM_OPTIONS.map(p => (
                    <div key={p} style={chipStyle(form.platforms.includes(p))} onClick={() => toggleArr('platforms', p)}>{p}</div>
                  ))}
                </div>
              </Field>

              <Field label="What to NEVER do" hint="Seed the failures log — agents will avoid these from cycle 1">
                <textarea style={textareaStyle} rows={3} value={form.doNots} onChange={e => set('doNots', e.target.value)} placeholder={"One per line:\nNever promise guaranteed returns\nAvoid stock photos of laptops on beaches\nNo financial advice framing"} />
              </Field>

              <Field label="Known what-works (optional)" hint="Seed the playbook — agents start smarter">
                <textarea style={textareaStyle} rows={3} value={form.initialPlaybook} onChange={e => set('initialPlaybook', e.target.value)} placeholder={"One per line:\nProof posts outperform education 2:1 in MY\nHook with a loss story, pivot to recovery\n30s reels outperform 60s reels"} />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'8px', padding:'0.85rem', marginBottom:'0.8rem' }}>
                <div style={{ fontSize:'0.72rem', fontWeight:800, color:'var(--accent)', marginBottom:'0.6rem' }}>📋 Client Summary</div>
                {[
                  ['Client', form.clientName],
                  ['Industry', form.industry],
                  ['Market', form.market || 'Malaysia'],
                  ['Audience', form.audience],
                  ['Tone', form.tone],
                  ['Platforms', form.platforms.join(', ')],
                  ['Pillars', form.pillars.join(', ')],
                ].map(([k, v]) => (
                  <div key={k} style={{ display:'grid', gridTemplateColumns:'110px 1fr', gap:'0.4rem', marginBottom:'0.3rem', fontSize:'0.68rem' }}>
                    <span style={{ color:'var(--sub)', fontWeight:600 }}>{k}</span>
                    <span style={{ color:'var(--text)' }}>{v || '—'}</span>
                  </div>
                ))}
              </div>

              {(form.initialPlaybook.trim() || form.doNots.trim()) && (
                <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'8px', padding:'0.85rem' }}>
                  <div style={{ fontSize:'0.72rem', fontWeight:800, color:'var(--accent)', marginBottom:'0.5rem' }}>🧠 Memory Seeds</div>
                  {form.initialPlaybook.trim() && (
                    <>
                      <div style={{ fontSize:'0.62rem', color:'var(--accent)', fontWeight:700, marginBottom:'0.25rem' }}>PLAYBOOK ({form.initialPlaybook.split('\n').filter(Boolean).length} entries)</div>
                      {form.initialPlaybook.split('\n').filter(Boolean).map((l, i) => (
                        <div key={i} style={{ fontSize:'0.63rem', color:'var(--text)', marginBottom:'0.15rem' }}>• {l}</div>
                      ))}
                    </>
                  )}
                  {form.doNots.trim() && (
                    <>
                      <div style={{ fontSize:'0.62rem', color:'var(--warn)', fontWeight:700, marginTop:'0.5rem', marginBottom:'0.25rem' }}>FAILURES ({form.doNots.split('\n').filter(Boolean).length} entries)</div>
                      {form.doNots.split('\n').filter(Boolean).map((l, i) => (
                        <div key={i} style={{ fontSize:'0.63rem', color:'var(--text)', marginBottom:'0.15rem' }}>✗ {l}</div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </>
          )}

        </div>

        {/* FOOTER */}
        <div style={{ padding:'0.75rem 1.25rem', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', flexShrink:0, background:'var(--dark)' }}>
          <button
            onClick={() => step > 1 ? setStep(s => s-1) : onCancel()}
            style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--sub)', padding:'0.35rem 0.9rem', borderRadius:'6px', fontSize:'0.72rem', fontWeight:600 }}
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>

          {step < 3
            ? <button
                onClick={() => canAdvance() && setStep(s => s+1)}
                disabled={!canAdvance()}
                style={{ background: canAdvance() ? 'var(--accent)' : 'var(--muted)', color: canAdvance() ? 'var(--black)' : 'var(--sub)', padding:'0.35rem 1.1rem', borderRadius:'6px', fontSize:'0.72rem', fontWeight:800, opacity: canAdvance() ? 1 : 0.6 }}
              >
                Next →
              </button>
            : <button
                onClick={handleConfirm}
                style={{ background:'var(--accent)', color:'var(--black)', padding:'0.35rem 1.2rem', borderRadius:'6px', fontSize:'0.72rem', fontWeight:800 }}
              >
                🚀 Add Client
              </button>
          }
        </div>
      </div>
    </div>
  );
}

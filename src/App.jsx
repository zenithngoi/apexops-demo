import { useState, useEffect, useCallback } from 'react';
import './styles/global.css';
import { store } from './lib/memory.js';
import { runResearchAgent, runContentAgent, runOrchestratorAgent, runMemoryAgent } from './lib/agents.js';
import ClientSwitcher from './components/ClientSwitcher.jsx';
import AgentPanel from './components/AgentPanel.jsx';
import LoopProgress from './components/LoopProgress.jsx';
import MemoryFeed from './components/MemoryFeed.jsx';
import ResearchPanel from './components/ResearchPanel.jsx';
import ContentPanel from './components/ContentPanel.jsx';
import AnalyticsPanel from './components/AnalyticsPanel.jsx';
import AdsPanel from './components/AdsPanel.jsx';

// ── helpers ─────────────────────────────────────────────────────
const Panel = ({ title, badge, children, style = {} }) => (
  <div style={{
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column',
    overflow: 'hidden', ...style,
  }}>
    <div style={{
      padding: '0.6rem 0.9rem', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0,
    }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)' }}>{title}</span>
      {badge && (
        <span style={{
          background: 'rgba(0,229,160,0.12)', border: '1px solid rgba(0,229,160,0.25)',
          color: 'var(--accent)', fontSize: '0.6rem', fontWeight: 700,
          padding: '0.1rem 0.45rem', borderRadius: '99px', letterSpacing: '0.06em',
        }}>{badge}</span>
      )}
    </div>
    <div style={{ flex: 1, overflow: 'hidden', padding: '0.75rem 0.9rem' }}>{children}</div>
  </div>
);

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── App ─────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState(store.get());
  const [activeTab, setActiveTab] = useState('research');
  const [running, setRunning] = useState(false);
  const [error, setError]   = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState('');

  // streaming partial outputs
  const [researchStream, setResearchStream] = useState('');
  const [contentStream,  setContentStream]  = useState('');
  const [summaryStream,  setSummaryStream]  = useState('');
  const [memoryStream,   setMemoryStream]   = useState('');

  useEffect(() => store.subscribe(setState), []);

  const runLoop = useCallback(async () => {
    if (!state.apiKey) { setShowApiInput(true); return; }
    setRunning(true);
    setError('');
    setResearchStream(''); setContentStream('');
    setSummaryStream(''); setMemoryStream('');
    setSummaryText('');

    const s = store;
    const key = state.apiKey;
    const client = state.client;

    try {
      // ── STEP 1: RESEARCH ────────────────────────────────────
      setActiveTab('research');
      s.set({ loopStep: 1, sessionStarted: true });
      s.setAgent('orchestrator', 'running');
      await sleep(600);
      s.setAgent('orchestrator', 'done');
      s.setAgent('research', 'running');
      let research = '';
      await runResearchAgent(key, client, (chunk) => {
        research = chunk;
        setResearchStream(chunk);
      });
      s.set({ research });
      s.setAgent('research', 'done');

      // ── STEP 2: CONTENT ─────────────────────────────────────
      setActiveTab('content');
      s.set({ loopStep: 2 });
      s.setAgent('content', 'running');
      let content = '';
      await runContentAgent(key, client, research, (chunk) => {
        content = chunk;
        setContentStream(chunk);
      });
      s.set({ content });
      s.setAgent('content', 'done');

      // ── STEP 3: PUBLISH (simulated) ─────────────────────────
      s.set({ loopStep: 3 });
      s.setAgent('publishing', 'running');
      await sleep(1200);
      s.addPostLog({ platform: 'TikTok',    time: '20:00 MYT', snippet: content.slice(0, 80) });
      s.addPostLog({ platform: 'Instagram', time: '20:02 MYT', snippet: content.slice(0, 80) });
      s.setAgent('publishing', 'done');

      // ── STEP 4: ANALYTICS (simulated) ───────────────────────
      setActiveTab('analytics');
      s.set({ loopStep: 4 });
      s.setAgent('analytics', 'running');
      await sleep(1400);
      s.set({ analytics: true });
      s.setAgent('analytics', 'done');

      // ── STEP 5: ADS (simulated) ─────────────────────────────
      setActiveTab('ads');
      s.set({ loopStep: 5 });
      s.setAgent('ads', 'running');
      await sleep(1000);
      s.set({ ads: true });
      s.setAgent('ads', 'done');

      // ── STEP 6: MEMORY ──────────────────────────────────────
      setActiveTab('memory');
      s.set({ loopStep: 6 });
      s.setAgent('memory', 'running');
      let memOut = '';
      await runMemoryAgent(key, client, research, content, (chunk) => {
        memOut = chunk;
        setMemoryStream(chunk);
      });
      // parse insights (lines containing [INSIGHT])
      const insights = memOut
        .split('\n')
        .filter(l => l.includes('[INSIGHT]') || l.trim().startsWith('•') || l.trim().startsWith('-'))
        .map(l => l.trim())
        .filter(Boolean)
        .slice(0, 6);
      insights.forEach(i => s.addMemoryLog(i));
      s.setAgent('memory', 'done');

      // ── ORCHESTRATOR SUMMARY ─────────────────────────────────
      s.setAgent('orchestrator', 'running');
      let summary = '';
      await runOrchestratorAgent(key, client, research, content, (chunk) => {
        summary = chunk;
        setSummaryStream(chunk);
      });
      setSummaryText(summary);
      s.setAgent('orchestrator', 'done');

    } catch (err) {
      setError(err.message || 'Unknown error');
      Object.keys(state.agentStatus).forEach(a => {
        if (store.get().agentStatus[a] === 'running') s.setAgent(a, 'error');
      });
    } finally {
      setRunning(false);
    }
  }, [state.apiKey, state.client]);

  const exportSession = () => {
    const s = store.get();
    const md = [
      `# ApexOps Demo Session Export`,
      `**Client:** ${s.client} | **Date:** ${new Date().toLocaleDateString()}`,
      `\n---\n`,
      `## 🔎 Research Brief\n${s.research || 'N/A'}`,
      `\n---\n`,
      `## ✍️ Content Drafts\n${s.content || 'N/A'}`,
      `\n---\n`,
      `## 🧠 Memory Insights\n${s.memoryLog.join('\n') || 'N/A'}`,
      `\n---\n`,
      `## 🧭 Orchestrator Summary\n${summaryText || 'N/A'}`,
    ].join('\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `apexops-session-${Date.now()}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  const resetLoop = () => {
    store.set({
      loopStep: 0, sessionStarted: false, research: null,
      content: null, analytics: null, ads: null, memoryLog: [], postLog: [],
      agentStatus: { orchestrator:'idle', research:'idle', content:'idle', publishing:'idle', analytics:'idle', ads:'idle', memory:'idle' },
    });
    setResearchStream(''); setContentStream('');
    setSummaryStream(''); setMemoryStream('');
    setSummaryText(''); setError('');
    setActiveTab('research');
  };

  const TAB_CONTENT = {
    research:  <ResearchPanel output={state.research || researchStream} streaming={state.agentStatus.research === 'running'} />,
    content:   <ContentPanel  output={state.content  || contentStream}  streaming={state.agentStatus.content  === 'running'} />,
    analytics: <AnalyticsPanel hasData={!!state.analytics} />,
    ads:       <AdsPanel       hasData={!!state.ads} />,
    memory:    <MemoryFeed insights={state.memoryLog.length ? state.memoryLog : (memoryStream ? [memoryStream] : [])} />,
    summary:   (
      <pre style={{ whiteSpace:'pre-wrap', wordBreak:'break-word', fontSize:'0.75rem', color:'var(--text)', lineHeight:1.65, fontFamily:'inherit', overflowY:'auto', height:'100%' }}>
        {summaryText || summaryStream || <span style={{color:'var(--sub)',fontStyle:'italic'}}>Orchestrator summary will appear after the loop completes.</span>}
        {state.agentStatus.orchestrator === 'running' && <span style={{color:'var(--accent)'}}>▊</span>}
      </pre>
    ),
  };

  const TABS = [
    { key: 'research',  label: '🔎 Research' },
    { key: 'content',   label: '✍️ Content' },
    { key: 'analytics', label: '📊 Analytics' },
    { key: 'ads',       label: '🎯 Ads Book' },
    { key: 'memory',    label: '🧠 Memory' },
    { key: 'summary',   label: '🧭 Summary' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'var(--black)' }}>

      {/* ── TOP BAR ── */}
      <div style={{
        display:'flex', alignItems:'center', gap:'1rem',
        padding:'0 1rem', height:52, flexShrink:0,
        background:'var(--dark)', borderBottom:'1px solid var(--border)',
      }}>
        <div style={{ fontWeight:900, fontSize:'1rem', letterSpacing:'-0.03em', marginRight:'0.5rem' }}>
          Apex<span style={{color:'var(--accent)'}}>Ops</span>
          <span style={{ fontSize:'0.62rem', color:'var(--sub)', fontWeight:500, marginLeft:'0.4rem', letterSpacing:'0.04em' }}>DEMO v3</span>
        </div>
        <ClientSwitcher current={state.client} onChange={c => store.set({ client: c })} />
        <div style={{ flex:1 }} />
        {error && <span style={{ fontSize:'0.72rem', color:'var(--warn)', maxWidth:300, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>⚠ {error}</span>}
        <button onClick={() => setShowApiInput(v => !v)} style={{
          background:'var(--card)', border:'1px solid var(--border)', color:'var(--sub)',
          padding:'0.3rem 0.7rem', borderRadius:'6px', fontSize:'0.72rem', fontWeight:600,
        }}>
          {state.apiKey ? '🔑 API Key ✓' : '🔑 Set API Key'}
        </button>
        {state.sessionStarted && (
          <button onClick={exportSession} style={{
            background:'var(--card)', border:'1px solid var(--border)', color:'var(--sub)',
            padding:'0.3rem 0.7rem', borderRadius:'6px', fontSize:'0.72rem', fontWeight:600,
          }}>📥 Export</button>
        )}
        {state.sessionStarted && (
          <button onClick={resetLoop} style={{
            background:'var(--card)', border:'1px solid var(--border)', color:'var(--sub)',
            padding:'0.3rem 0.7rem', borderRadius:'6px', fontSize:'0.72rem', fontWeight:600,
          }}>↺ Reset</button>
        )}
        <button onClick={runLoop} disabled={running} style={{
          background: running ? 'var(--muted)' : 'var(--accent)',
          color: running ? 'var(--sub)' : 'var(--black)',
          padding:'0.35rem 1rem', borderRadius:'6px', fontWeight:800, fontSize:'0.82rem',
          opacity: running ? 0.7 : 1, transition:'all 0.2s', cursor: running ? 'not-allowed' : 'pointer',
        }}>
          {running ? '⟳ Running…' : '▶ Run Loop'}
        </button>
      </div>

      {/* ── API KEY DRAWER ── */}
      {showApiInput && (
        <div style={{
          background:'var(--card)', borderBottom:'1px solid var(--border)',
          padding:'0.6rem 1rem', display:'flex', alignItems:'center', gap:'0.75rem', flexShrink:0,
        }}>
          <span style={{ fontSize:'0.75rem', color:'var(--sub)', whiteSpace:'nowrap' }}>Anthropic API Key:</span>
          <input
            type="password" value={apiKeyDraft}
            onChange={e => setApiKeyDraft(e.target.value)}
            placeholder="sk-ant-api03-…"
            style={{
              flex:1, background:'var(--dark)', border:'1px solid var(--border)',
              color:'var(--text)', padding:'0.35rem 0.6rem', borderRadius:'6px',
              fontSize:'0.8rem', fontFamily:'monospace',
            }}
          />
          <button onClick={() => { store.set({ apiKey: apiKeyDraft }); setShowApiInput(false); }} style={{
            background:'var(--accent)', color:'var(--black)', padding:'0.35rem 0.9rem',
            borderRadius:'6px', fontWeight:700, fontSize:'0.78rem',
          }}>Save</button>
          <span style={{ fontSize:'0.68rem', color:'var(--sub)' }}>Key stays in-memory only. Never stored or sent anywhere except Anthropic.</span>
        </div>
      )}

      {/* ── LOOP PROGRESS BAR ── */}
      <div style={{ padding:'0.6rem 1rem', borderBottom:'1px solid var(--border)', background:'var(--dark)', flexShrink:0 }}>
        <LoopProgress currentStep={state.loopStep} />
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'220px 1fr', overflow:'hidden', gap:0 }}>

        {/* LEFT SIDEBAR — agents + posts */}
        <div style={{ borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--dark)' }}>
          <div style={{ padding:'0.75rem', flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            <Panel title="Agents" style={{ flexShrink:0 }}>
              <AgentPanel statuses={state.agentStatus} />
            </Panel>
            <Panel title="Post Log" badge={state.postLog.length ? `${state.postLog.length} posts` : null} style={{ flex:1, minHeight:0 }}>
              <div style={{ overflowY:'auto', height:'100%', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                {state.postLog.length === 0 ? (
                  <span style={{ color:'var(--sub)', fontSize:'0.72rem', fontStyle:'italic' }}>No posts yet.</span>
                ) : state.postLog.map((p, i) => (
                  <div key={i} style={{ background:'var(--muted)', borderRadius:'6px', padding:'0.45rem 0.6rem' }}>
                    <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--accent)' }}>{p.platform}</div>
                    <div style={{ fontSize:'0.62rem', color:'var(--sub)' }}>{p.time}</div>
                    <div style={{ fontSize:'0.65rem', color:'var(--text)', marginTop:'0.2rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.snippet}…</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        {/* RIGHT — tabbed content panels */}
        <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Tab bar */}
          <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border)', background:'var(--dark)', flexShrink:0 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                padding:'0.6rem 0.9rem', background:'transparent',
                color: activeTab === t.key ? 'var(--text)' : 'var(--sub)',
                borderBottom: activeTab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
                fontSize:'0.75rem', fontWeight: activeTab === t.key ? 700 : 500,
                transition:'all 0.15s', cursor:'pointer',
              }}>{t.label}</button>
            ))}
          </div>
          {/* Tab content */}
          <div style={{ flex:1, overflow:'hidden', padding:'0.75rem', background:'var(--black)' }}>
            <div style={{ height:'100%', overflowY:'auto' }}>
              {TAB_CONTENT[activeTab]}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

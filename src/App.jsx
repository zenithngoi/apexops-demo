import { useState, useEffect, useCallback } from 'react';
import './styles/global.css';
import { store } from './lib/memory.js';
import { runResearchAgent, runContentAgent, runAnalyticsAgent, runMemoryAgent, runOrchestratorAgent } from './lib/agents.js';
import ClientSwitcher from './components/ClientSwitcher.jsx';
import AgentPanel from './components/AgentPanel.jsx';
import LoopProgress from './components/LoopProgress.jsx';
import MemoryFeed from './components/MemoryFeed.jsx';
import ResearchPanel from './components/ResearchPanel.jsx';
import ContentPanel from './components/ContentPanel.jsx';
import AnalyticsPanel from './components/AnalyticsPanel.jsx';
import AdsPanel from './components/AdsPanel.jsx';

// ── Panel wrapper ────────────────────────────────────────────────
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

const StreamPane = ({ text, streaming, placeholder }) => (
  <div style={{ height: '100%', overflowY: 'auto' }}>
    {!text && !streaming
      ? <div style={{ color: 'var(--sub)', fontSize: '0.78rem', fontStyle: 'italic', paddingTop: '0.5rem' }}>{placeholder}</div>
      : <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.75rem', color: 'var(--text)', lineHeight: 1.7, fontFamily: 'inherit' }}>
          {text || ''}
          {streaming && <span style={{ color: 'var(--accent)' }}>▊</span>}
        </pre>
    }
  </div>
);

// ── App ──────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState(store.get());
  const [activeTab, setActiveTab] = useState('research');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState('');

  // Streaming partials
  const [researchStream,  setResearchStream]  = useState('');
  const [contentStream,   setContentStream]   = useState('');
  const [analyticsStream, setAnalyticsStream] = useState('');
  const [memoryStream,    setMemoryStream]    = useState('');
  const [summaryStream,   setSummaryStream]   = useState('');
  const [summaryText,     setSummaryText]     = useState('');

  useEffect(() => store.subscribe(setState), []);

  const runLoop = useCallback(async () => {
    if (!state.apiKey) { setShowApiInput(true); return; }
    setRunning(true);
    setError('');
    setResearchStream(''); setContentStream('');
    setAnalyticsStream(''); setMemoryStream('');
    setSummaryStream(''); setSummaryText('');

    const s = store;
    const key = state.apiKey;
    const client = state.client;
    const playbook = s.get().playbook; // current learned playbook

    try {
      // ── 1 ORCHESTRATOR WAKE ────────────────────────────────
      s.set({ loopStep: 1, sessionStarted: true });
      s.setAgent('orchestrator', 'running');
      await sleep(500);
      s.setAgent('orchestrator', 'done');

      // ── 2 RESEARCH (with memory playbook) ─────────────────
      setActiveTab('research');
      s.set({ loopStep: 1 });
      s.setAgent('research', 'running');
      let research = '';
      await runResearchAgent(key, client, playbook, (chunk) => {
        research = chunk; setResearchStream(chunk);
      });
      s.set({ research });
      s.setAgent('research', 'done');

      // ── 3 CONTENT (with memory playbook) ──────────────────
      setActiveTab('content');
      s.set({ loopStep: 2 });
      s.setAgent('content', 'running');
      let content = '';
      await runContentAgent(key, client, research, playbook, (chunk) => {
        content = chunk; setContentStream(chunk);
      });
      s.set({ content });
      s.setAgent('content', 'done');

      // ── 4 PUBLISH (simulated) ──────────────────────────────
      s.set({ loopStep: 3 });
      s.setAgent('publishing', 'running');
      await sleep(900);
      const cycle = s.get().cycleCount + 1;
      s.addPostLog({ platform: 'TikTok',    time: '20:00 MYT', cycle, snippet: content.slice(0, 90) });
      s.addPostLog({ platform: 'Instagram', time: '20:03 MYT', cycle, snippet: content.slice(0, 90) });
      s.setAgent('publishing', 'done');

      // ── 5 ANALYTICS (live Claude interpretation) ──────────
      setActiveTab('analytics');
      s.set({ loopStep: 4 });
      s.setAgent('analytics', 'running');
      let analyticsOut = '';
      await runAnalyticsAgent(key, client, s.get().postLog, playbook, (chunk) => {
        analyticsOut = chunk; setAnalyticsStream(chunk);
      });
      s.set({ analytics: true, analyticsText: analyticsOut });
      s.setAgent('analytics', 'done');

      // ── 6 ADS (simulated) ─────────────────────────────────
      setActiveTab('ads');
      s.set({ loopStep: 5 });
      s.setAgent('ads', 'running');
      await sleep(800);
      s.set({ ads: true });
      s.setAgent('ads', 'done');

      // ── 7 MEMORY (distil + promote to playbook) ────────────
      setActiveTab('memory');
      s.set({ loopStep: 6 });
      s.setAgent('memory', 'running');
      let memOut = '';
      await runMemoryAgent(key, client, research, content, analyticsOut, playbook, (chunk) => {
        memOut = chunk; setMemoryStream(chunk);
      });
      // Parse [INSIGHT n] lines and add to log
      const insightLines = memOut
        .split('\n')
        .filter(l => l.includes('[INSIGHT') || l.includes('•') || l.trim().startsWith('-'))
        .map(l => l.trim())
        .filter(l => l.length > 10)
        .slice(0, 6);
      insightLines.forEach(i => s.addMemoryLog(i));
      // Promote to playbook — these feed back into ALL agents on next cycle
      s.promoteToPlaybook(insightLines);
      s.setAgent('memory', 'done');

      // ── 8 ORCHESTRATOR SUMMARY ────────────────────────────
      setActiveTab('summary');
      s.setAgent('orchestrator', 'running');
      let summary = '';
      const updatedPlaybook = s.get().playbook;
      await runOrchestratorAgent(key, client, research, content, memOut, updatedPlaybook, (chunk) => {
        summary = chunk; setSummaryStream(chunk);
      });
      setSummaryText(summary);
      s.setAgent('orchestrator', 'done');
      s.incrementCycle();

    } catch (err) {
      setError(err.message || 'Unknown error. Check your API key.');
      Object.keys(store.get().agentStatus).forEach(a => {
        if (store.get().agentStatus[a] === 'running') s.setAgent(a, 'error');
      });
    } finally {
      setRunning(false);
    }
  }, [state.apiKey, state.client]);

  const exportSession = () => {
    const s = store.get();
    const md = [
      `# ApexOps Session Export — Cycle ${s.cycleCount}`,
      `**Client:** ${s.client} | **Date:** ${new Date().toLocaleDateString()} | **Cycles run:** ${s.cycleCount}`,
      `\n---\n`,
      `## 🔎 Research Brief\n${s.research || 'N/A'}`,
      `\n---\n`,
      `## ✍️ Content Drafts\n${s.content || 'N/A'}`,
      `\n---\n`,
      `## 📊 Analytics\n${s.analyticsText || 'Simulated data'}`,
      `\n---\n`,
      `## 🧠 Memory — Staged Insights (${s.memoryLog.length})\n${s.memoryLog.join('\n') || 'N/A'}`,
      `\n---\n`,
      `## 📚 Permanent Playbook (${s.playbook.length} entries)\n${s.playbook.join('\n') || 'Empty — run more cycles'}`,
      `\n---\n`,
      `## 🧭 Orchestrator Summary\n${summaryText || 'N/A'}`,
    ].join('\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `apexops-cycle-${s.cycleCount}-${Date.now()}.md`,
    });
    a.click();
  };

  const resetLoop = () => {
    store.set({
      loopStep: 0, sessionStarted: false, research: null,
      content: null, analytics: null, analyticsText: null, ads: null,
      postLog: [], // keep playbook — agents should remember between sessions
      agentStatus: { orchestrator:'idle', research:'idle', content:'idle', publishing:'idle', analytics:'idle', ads:'idle', memory:'idle' },
    });
    setResearchStream(''); setContentStream('');
    setAnalyticsStream(''); setMemoryStream('');
    setSummaryStream(''); setSummaryText('');
    setError(''); setActiveTab('research');
  };

  const hardReset = () => {
    store.set({
      loopStep: 0, sessionStarted: false, cycleCount: 0,
      research: null, content: null, analytics: null, analyticsText: null, ads: null,
      memoryLog: [], playbook: [], postLog: [],
      agentStatus: { orchestrator:'idle', research:'idle', content:'idle', publishing:'idle', analytics:'idle', ads:'idle', memory:'idle' },
    });
    setResearchStream(''); setContentStream('');
    setAnalyticsStream(''); setMemoryStream('');
    setSummaryStream(''); setSummaryText('');
    setError(''); setActiveTab('research');
  };

  // Tabs
  const TABS = [
    { key: 'research',  label: '🔎 Research' },
    { key: 'content',   label: '✍️ Content' },
    { key: 'analytics', label: '📊 Analytics' },
    { key: 'ads',       label: '🎯 Ads Book' },
    { key: 'memory',    label: '🧠 Memory' },
    { key: 'playbook',  label: `📚 Playbook${state.playbook.length ? ` (${state.playbook.length})` : ''}` },
    { key: 'summary',   label: '🧭 Summary' },
  ];

  const TAB_CONTENT = {
    research:  <ResearchPanel output={state.research || researchStream} streaming={state.agentStatus.research === 'running'} />,
    content:   <ContentPanel  output={state.content  || contentStream}  streaming={state.agentStatus.content  === 'running'} />,
    analytics: <AnalyticsPanel hasData={!!state.analytics} liveText={state.analyticsText || analyticsStream} streaming={state.agentStatus.analytics === 'running'} />,
    ads:       <AdsPanel       hasData={!!state.ads} />,
    memory:    <MemoryFeed insights={state.memoryLog.length ? state.memoryLog : (memoryStream ? [memoryStream] : [])} />,
    playbook:  (
      <div style={{ height: '100%', overflowY: 'auto' }}>
        {state.playbook.length === 0
          ? <div style={{ color: 'var(--sub)', fontSize: '0.78rem', fontStyle: 'italic', paddingTop: '0.5rem' }}>
              Playbook is empty. Run the loop — Memory Agent will promote insights here after each cycle.<br/>
              <span style={{ color: 'var(--accent)', fontSize: '0.72rem' }}>These are fed back into every agent prompt on the next run.</span>
            </div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--sub)', marginBottom: '0.25rem' }}>
                {state.playbook.length} entries · {state.cycleCount} cycle{state.cycleCount !== 1 ? 's' : ''} run · Agents read this at the start of every prompt
              </div>
              {state.playbook.map((entry, i) => (
                <div key={i} style={{
                  background: 'rgba(0,71,255,0.07)', border: '1px solid rgba(0,71,255,0.2)',
                  borderRadius: '8px', padding: '0.6rem 0.8rem',
                  fontSize: '0.75rem', color: 'var(--text)', lineHeight: 1.6,
                }}>
                  <span style={{ color: 'var(--accent2)', fontWeight: 700, marginRight: '0.4rem' }}>#{i + 1}</span>
                  {entry}
                </div>
              ))}
            </div>
        }
      </div>
    ),
    summary: (
      <StreamPane
        text={summaryText || summaryStream}
        streaming={state.agentStatus.orchestrator === 'running' && !summaryText}
        placeholder="Orchestrator summary appears after the loop completes."
      />
    ),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--black)' }}>

      {/* ── TOP BAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0 1rem', height: 52, flexShrink: 0,
        background: 'var(--dark)', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.03em', marginRight: '0.25rem', flexShrink: 0 }}>
          Apex<span style={{ color: 'var(--accent)' }}>Ops</span>
          <span style={{ fontSize: '0.6rem', color: 'var(--sub)', fontWeight: 500, marginLeft: '0.35rem' }}>DEMO v3</span>
        </div>
        <ClientSwitcher current={state.client} onChange={c => store.set({ client: c })} />
        {state.cycleCount > 0 && (
          <span style={{
            fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 700,
            background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)',
            padding: '0.15rem 0.5rem', borderRadius: '99px', flexShrink: 0,
          }}>Cycle {state.cycleCount} · {state.playbook.length} learned</span>
        )}
        <div style={{ flex: 1 }} />
        {error && <span style={{ fontSize: '0.7rem', color: 'var(--warn)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>⚠ {error}</span>}
        <button onClick={() => setShowApiInput(v => !v)} style={{
          background: 'var(--card)', border: `1px solid ${state.apiKey ? 'rgba(0,229,160,0.3)' : 'var(--border)'}`,
          color: state.apiKey ? 'var(--accent)' : 'var(--sub)',
          padding: '0.28rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, flexShrink: 0,
        }}>{state.apiKey ? '🔑 Key ✓' : '🔑 Set Key'}</button>
        {state.sessionStarted && <>
          <button onClick={exportSession} style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--sub)', padding: '0.28rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, flexShrink: 0 }}>📥 Export</button>
          <button onClick={resetLoop} title="Reset loop — keeps playbook" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--sub)', padding: '0.28rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, flexShrink: 0 }}>↺ New Cycle</button>
          <button onClick={hardReset} title="Hard reset — clears everything including playbook" style={{ background: 'var(--card)', border: '1px solid rgba(255,77,77,0.3)', color: 'var(--warn)', padding: '0.28rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, flexShrink: 0 }}>⎆ Hard Reset</button>
        </>}
        <button onClick={runLoop} disabled={running} style={{
          background: running ? 'var(--muted)' : 'var(--accent)',
          color: running ? 'var(--sub)' : 'var(--black)',
          padding: '0.32rem 1rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem',
          opacity: running ? 0.7 : 1, cursor: running ? 'not-allowed' : 'pointer', flexShrink: 0,
        }}>
          {running ? '⟳ Running…' : state.cycleCount > 0 ? `▶ Run Cycle ${state.cycleCount + 1}` : '▶ Run Loop'}
        </button>
      </div>

      {/* ── API KEY DRAWER ── */}
      {showApiInput && (
        <div style={{
          background: 'var(--card)', borderBottom: '1px solid var(--border)',
          padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--sub)', whiteSpace: 'nowrap' }}>Anthropic API Key:</span>
          <input type="password" value={apiKeyDraft} onChange={e => setApiKeyDraft(e.target.value)}
            placeholder="sk-ant-api03-…"
            style={{ flex: 1, background: 'var(--dark)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.32rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace' }}
          />
          <button onClick={() => { store.set({ apiKey: apiKeyDraft }); setShowApiInput(false); }}
            style={{ background: 'var(--accent)', color: 'var(--black)', padding: '0.32rem 0.85rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>Save</button>
          <span style={{ fontSize: '0.65rem', color: 'var(--sub)' }}>In-memory only. Never stored or logged.</span>
        </div>
      )}

      {/* ── LOOP PROGRESS ── */}
      <div style={{ padding: '0.55rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--dark)', flexShrink: 0 }}>
        <LoopProgress currentStep={state.loopStep} />
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '210px 1fr', overflow: 'hidden' }}>

        {/* SIDEBAR */}
        <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--dark)' }}>
          <div style={{ padding: '0.65rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <Panel title="Agents" style={{ flexShrink: 0 }}>
              <AgentPanel statuses={state.agentStatus} />
            </Panel>
            <Panel title="Post Log" badge={state.postLog.length ? `${state.postLog.length}` : null} style={{ flex: 1, minHeight: 0 }}>
              <div style={{ overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {state.postLog.length === 0
                  ? <span style={{ color: 'var(--sub)', fontSize: '0.7rem', fontStyle: 'italic' }}>No posts yet.</span>
                  : [...state.postLog].reverse().map((p, i) => (
                    <div key={i} style={{ background: 'var(--muted)', borderRadius: '6px', padding: '0.4rem 0.55rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)' }}>{p.platform}</span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--sub)' }}>C{p.cycle}</span>
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--sub)' }}>{p.time}</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text)', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.snippet}…</div>
                    </div>
                  ))
                }
              </div>
            </Panel>
          </div>
        </div>

        {/* MAIN PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', background: 'var(--dark)', flexShrink: 0, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                padding: '0.55rem 0.8rem', background: 'transparent',
                color: activeTab === t.key ? 'var(--text)' : 'var(--sub)',
                borderBottom: activeTab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
                fontSize: '0.72rem', fontWeight: activeTab === t.key ? 700 : 500,
                whiteSpace: 'nowrap', cursor: 'pointer',
              }}>{t.label}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflow: 'hidden', padding: '0.75rem', background: 'var(--black)' }}>
            <div style={{ height: '100%', overflowY: 'auto' }}>
              {TAB_CONTENT[activeTab]}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

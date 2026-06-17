import { useState, useEffect, useCallback } from 'react';
import './styles/global.css';
import { store } from './lib/memory.js';
import { runResearchAgent, runContentAgent, runAnalyticsAgent, runMemoryAgent, runOrchestratorAgent, runWeeklyReportAgent } from './lib/agents.js';
import ClientSwitcher from './components/ClientSwitcher.jsx';
import AgentPanel from './components/AgentPanel.jsx';
import LoopProgress from './components/LoopProgress.jsx';
import MemoryFeed from './components/MemoryFeed.jsx';
import ResearchPanel from './components/ResearchPanel.jsx';
import ContentPanel from './components/ContentPanel.jsx';
import AnalyticsPanel from './components/AnalyticsPanel.jsx';
import AdsPanel from './components/AdsPanel.jsx';
import LeadsFunnel from './components/LeadsFunnel.jsx';
import Sparklines from './components/Sparklines.jsx';
import WeeklyReport from './components/WeeklyReport.jsx';

const Panel = ({ title, badge, children, style = {} }) => (
  <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', display:'flex', flexDirection:'column', overflow:'hidden', ...style }}>
    <div style={{ padding:'0.55rem 0.85rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
      <span style={{ fontSize:'0.68rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--sub)' }}>{title}</span>
      {badge && <span style={{ background:'rgba(0,229,160,0.12)', border:'1px solid rgba(0,229,160,0.25)', color:'var(--accent)', fontSize:'0.58rem', fontWeight:700, padding:'0.1rem 0.4rem', borderRadius:'99px' }}>{badge}</span>}
    </div>
    <div style={{ flex:1, overflow:'hidden', padding:'0.65rem 0.85rem' }}>{children}</div>
  </div>
);

const sleep = ms => new Promise(r => setTimeout(r, ms));

export default function App() {
  const [state, setState] = useState(store.get());
  const [activeTab, setActiveTab] = useState('research');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState('');

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
    const { apiKey: key, client, playbook, failures, cycleCount } = s.get();

    try {
      // 1. ORCHESTRATOR WAKE
      s.set({ loopStep:1, sessionStarted:true });
      s.setAgent('orchestrator', 'running');
      await sleep(400);
      s.setAgent('orchestrator', 'done');

      // 2. RESEARCH — gets playbook + failures
      setActiveTab('research');
      s.set({ loopStep:1 });
      s.setAgent('research', 'running');
      let research = '';
      await runResearchAgent(key, client, playbook, failures, cycleCount, c => { research = c; setResearchStream(c); });
      s.set({ research });
      s.setAgent('research', 'done');

      // 3. CONTENT — gets playbook + failures (banned patterns)
      setActiveTab('content');
      s.set({ loopStep:2 });
      s.setAgent('content', 'running');
      let content = '';
      await runContentAgent(key, client, research, playbook, failures, cycleCount, c => { content = c; setContentStream(c); });
      s.set({ content });
      s.setAgent('content', 'done');

      // 4. PUBLISH (simulated)
      s.set({ loopStep:3 });
      s.setAgent('publishing', 'running');
      await sleep(800);
      s.addPostLog({ platform:'TikTok',    time:'20:00 MYT', cycle: cycleCount+1, snippet: content.slice(0,90) });
      s.addPostLog({ platform:'Instagram', time:'20:03 MYT', cycle: cycleCount+1, snippet: content.slice(0,90) });
      s.setAgent('publishing', 'done');

      // 5. ANALYTICS — live Claude interpretation
      setActiveTab('analytics');
      s.set({ loopStep:4 });
      s.setAgent('analytics', 'running');
      let analyticsOut = '';
      await runAnalyticsAgent(key, client, s.get().postLog, playbook, failures, cycleCount, c => { analyticsOut = c; setAnalyticsStream(c); });
      s.set({ analytics:true, analyticsText:analyticsOut });
      s.setAgent('analytics', 'done');

      // 6. ADS (simulated)
      setActiveTab('ads');
      s.set({ loopStep:5 });
      s.setAgent('ads', 'running');
      await sleep(700);
      s.set({ ads:true });
      s.setAgent('ads', 'done');

      // 7. MEMORY — distils + promotes to permanent playbook, logs failures
      setActiveTab('memory');
      s.set({ loopStep:6 });
      s.setAgent('memory', 'running');
      let memOut = '';
      await runMemoryAgent(key, client, research, content, analyticsOut, playbook, failures, cycleCount, c => { memOut = c; setMemoryStream(c); });

      // Parse STAGED INSIGHTS
      const insightLines = memOut.split('\n')
        .filter(l => l.includes('[INSIGHT') && l.includes('•'))
        .map(l => l.trim()).filter(Boolean).slice(0, 6);
      insightLines.forEach(i => s.addMemoryLog(i));
      s.promoteToPlaybook(insightLines);

      // Parse FAILURES TO LOG — permanent ban
      const failureLines = memOut.split('\n')
        .filter(l => l.includes('[FAILURE') && l.includes('•'))
        .map(l => l.trim()).filter(Boolean).slice(0, 4);
      if (failureLines.length > 0) s.logFailure(failureLines);

      s.setAgent('memory', 'done');

      // 8. ORCHESTRATOR SUMMARY
      setActiveTab('summary');
      s.setAgent('orchestrator', 'running');
      const latest = s.get();
      let summary = '';
      await runOrchestratorAgent(key, client, research, content, memOut, latest.playbook, latest.failures, cycleCount, c => { summary = c; setSummaryStream(c); });
      setSummaryText(summary);
      s.setAgent('orchestrator', 'done');
      s.incrementCycle();

    } catch (err) {
      setError(err.message || 'Error — check API key');
      Object.keys(store.get().agentStatus).forEach(a => {
        if (store.get().agentStatus[a] === 'running') s.setAgent(a, 'error');
      });
    } finally {
      setRunning(false);
    }
  }, [state.apiKey, state.client]);

  // New Cycle — keeps ALL memory (playbook + failures), resets run outputs only
  const startNewCycle = () => {
    store.startNewCycle();
    setResearchStream(''); setContentStream('');
    setAnalyticsStream(''); setMemoryStream('');
    setSummaryStream(''); setSummaryText('');
    setError(''); setActiveTab('research');
  };

  const exportSession = () => {
    const s = store.get();
    const md = [
      `# ApexOps — ${s.client} | Cycle ${s.cycleCount} Export`,
      `Date: ${new Date().toLocaleDateString()}`,
      `\n---\n`,
      `## 🔎 Research\n${s.research||'N/A'}`,
      `\n---\n`,
      `## ✍️ Content\n${s.content||'N/A'}`,
      `\n---\n`,
      `## 📊 Analytics\n${s.analyticsText||'N/A'}`,
      `\n---\n`,
      `## 🧠 Staged Insights\n${s.memoryLog?.join('\n')||'N/A'}`,
      `\n---\n`,
      `## 📚 Permanent Playbook (${s.playbook?.length||0} entries)\n${s.playbook?.join('\n')||'Empty'}`,
      `\n---\n`,
      `## ✗ Failures Log (${s.failures?.length||0} entries)\n${s.failures?.join('\n')||'None'}`,
      `\n---\n`,
      `## 🧭 Orchestrator Summary\n${summaryText||'N/A'}`,
    ].join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([md], { type:'text/markdown' })),
      download: `apexops-${s.client.replace(/\s+/g,'-')}-cycle${s.cycleCount}.md`,
    });
    a.click();
  };

  const TABS = [
    { key:'research',  label:'🔎 Research'  },
    { key:'content',   label:'✍️ Content'   },
    { key:'analytics', label:'📊 Analytics' },
    { key:'ads',       label:'🎯 Ads Book'  },
    { key:'memory',    label:`🧠 Memory${state.playbook?.length ? ` (${state.playbook.length})` : ''}` },
    { key:'leads',    label:'📥 Leads Funnel' },
    { key:'growth',   label:'📈 Growth'       },
    { key:'summary',   label:'🧭 Summary'   },
    { key:'report',    label:'📋 Weekly Report' },
  ];

  const TAB_CONTENT = {
    research:  <ResearchPanel  output={state.research||researchStream}   streaming={state.agentStatus.research==='running'} />,
    content:   <ContentPanel   output={state.content||contentStream}     streaming={state.agentStatus.content==='running'} />,
    analytics: <AnalyticsPanel hasData={!!state.analytics} liveText={state.analyticsText||analyticsStream} streaming={state.agentStatus.analytics==='running'} />,
    ads:       <AdsPanel       hasData={!!state.ads} />,
    memory:    <MemoryFeed insights={state.memoryLog} failures={state.failures} playbook={state.playbook} cycleCount={state.cycleCount} />,
    leads:    <LeadsFunnel />,
    growth:   <Sparklines />,
    summary:   (
      <div style={{ height:'100%', overflowY:'auto' }}>
        {!(summaryText||summaryStream)
          ? <div style={{ color:'var(--sub)', fontSize:'0.78rem', fontStyle:'italic' }}>Orchestrator summary appears after the loop completes.</div>
          : <pre style={{ whiteSpace:'pre-wrap', wordBreak:'break-word', fontSize:'0.75rem', color:'var(--text)', lineHeight:1.7, fontFamily:'inherit' }}>
              {summaryText||summaryStream}
              {state.agentStatus.orchestrator==='running' && !summaryText && <span style={{ color:'var(--accent)' }}>▊</span>}
            </pre>
        }
      </div>
    ),
    report: (
      <WeeklyReport
        client={state.client}
        cycleCount={state.cycleCount}
        playbook={state.playbook}
        failures={state.failures}
        analyticsText={state.analyticsText}
        summaryText={summaryText}
        onGenerate={state.apiKey ? (({ metrics, roas, cpl, qualRate, customNotes, playbook, failures, cycleCount, analyticsText, summaryText }, cb) =>
          runWeeklyReportAgent(state.apiKey, state.client, metrics, roas, cpl, qualRate, playbook, failures, cycleCount, analyticsText, summaryText, customNotes, cb)
        ) : null}
      />
    ),
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'var(--black)' }}>

      {/* TOP BAR */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0 0.85rem', height:50, flexShrink:0, background:'var(--dark)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ fontWeight:900, fontSize:'0.95rem', letterSpacing:'-0.03em', flexShrink:0 }}>
          Apex<span style={{ color:'var(--accent)' }}>Ops</span>
          <span style={{ fontSize:'0.58rem', color:'var(--sub)', fontWeight:500, marginLeft:'0.3rem' }}>DEMO</span>
        </div>
        <ClientSwitcher current={state.client} onChange={c => store.setClient(c)} />
        {state.cycleCount > 0 && (
          <span style={{ fontSize:'0.65rem', color:'var(--accent)', fontWeight:700, background:'rgba(0,229,160,0.08)', border:'1px solid rgba(0,229,160,0.2)', padding:'0.12rem 0.45rem', borderRadius:'99px', flexShrink:0 }}>
            Cycle {state.cycleCount} · {state.playbook?.length||0} learned · {state.failures?.length||0} failures
          </span>
        )}
        <div style={{ flex:1 }} />
        {error && <span style={{ fontSize:'0.68rem', color:'var(--warn)', maxWidth:260, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>⚠ {error}</span>}
        <button onClick={() => setShowApiInput(v => !v)} style={{ background:'var(--card)', border:`1px solid ${state.apiKey?'rgba(0,229,160,0.3)':'var(--border)'}`, color:state.apiKey?'var(--accent)':'var(--sub)', padding:'0.25rem 0.6rem', borderRadius:'6px', fontSize:'0.68rem', fontWeight:600, flexShrink:0 }}>
          {state.apiKey?'🔑 Key ✓':'🔑 Set Key'}
        </button>
        {state.sessionStarted && <>
          <button onClick={exportSession} style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--sub)', padding:'0.25rem 0.6rem', borderRadius:'6px', fontSize:'0.68rem', fontWeight:600, flexShrink:0 }}>📥 Export</button>
          <button onClick={startNewCycle} title="Start a new cycle — memory is kept, agents improve" style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--sub)', padding:'0.25rem 0.6rem', borderRadius:'6px', fontSize:'0.68rem', fontWeight:600, flexShrink:0 }}>↺ New Cycle</button>
        </>}
        <button onClick={runLoop} disabled={running} style={{ background:running?'var(--muted)':'var(--accent)', color:running?'var(--sub)':'var(--black)', padding:'0.28rem 0.9rem', borderRadius:'6px', fontWeight:800, fontSize:'0.78rem', opacity:running?0.7:1, cursor:running?'not-allowed':'pointer', flexShrink:0 }}>
          {running ? '⟳ Running…' : state.cycleCount > 0 ? `▶ Run Cycle ${state.cycleCount+1}` : '▶ Run Loop'}
        </button>
      </div>

      {/* API KEY DRAWER */}
      {showApiInput && (
        <div style={{ background:'var(--card)', borderBottom:'1px solid var(--border)', padding:'0.45rem 0.85rem', display:'flex', alignItems:'center', gap:'0.65rem', flexShrink:0 }}>
          <span style={{ fontSize:'0.7rem', color:'var(--sub)', whiteSpace:'nowrap' }}>Anthropic API Key:</span>
          <input type="password" value={apiKeyDraft} onChange={e => setApiKeyDraft(e.target.value)} placeholder="sk-ant-api03-…" style={{ flex:1, background:'var(--dark)', border:'1px solid var(--border)', color:'var(--text)', padding:'0.3rem 0.55rem', borderRadius:'6px', fontSize:'0.75rem', fontFamily:'monospace' }} />
          <button onClick={() => { store.set({ apiKey:apiKeyDraft }); setShowApiInput(false); }} style={{ background:'var(--accent)', color:'var(--black)', padding:'0.3rem 0.8rem', borderRadius:'6px', fontWeight:700, fontSize:'0.72rem' }}>Save</button>
          <span style={{ fontSize:'0.62rem', color:'var(--sub)' }}>In-memory only. Never stored.</span>
        </div>
      )}

      {/* LOOP PROGRESS */}
      <div style={{ padding:'0.5rem 0.85rem', borderBottom:'1px solid var(--border)', background:'var(--dark)', flexShrink:0 }}>
        <LoopProgress currentStep={state.loopStep} />
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'205px 1fr', overflow:'hidden' }}>

        {/* SIDEBAR */}
        <div style={{ borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--dark)' }}>
          <div style={{ padding:'0.6rem', flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
            <Panel title="Agents" style={{ flexShrink:0 }}>
              <AgentPanel statuses={state.agentStatus} />
            </Panel>
            <Panel title="Post Log" badge={state.postLog?.length||null} style={{ flex:1, minHeight:0 }}>
              <div style={{ overflowY:'auto', height:'100%', display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                {(!state.postLog||state.postLog.length===0)
                  ? <span style={{ color:'var(--sub)', fontSize:'0.68rem', fontStyle:'italic' }}>No posts yet.</span>
                  : [...state.postLog].reverse().map((p,i) => (
                    <div key={i} style={{ background:'var(--muted)', borderRadius:'6px', padding:'0.35rem 0.5rem' }}>
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--accent)' }}>{p.platform}</span>
                        <span style={{ fontSize:'0.58rem', color:'var(--sub)' }}>C{p.cycle}</span>
                      </div>
                      <div style={{ fontSize:'0.58rem', color:'var(--sub)' }}>{p.time}</div>
                      <div style={{ fontSize:'0.6rem', color:'var(--text)', marginTop:'0.1rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.snippet}…</div>
                    </div>
                  ))
                }
              </div>
            </Panel>
          </div>
        </div>

        {/* CONTENT TABS */}
        <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ display:'flex', borderBottom:'1px solid var(--border)', background:'var(--dark)', flexShrink:0, overflowX:'auto' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding:'0.5rem 0.75rem', background:'transparent', color:activeTab===t.key?'var(--text)':'var(--sub)', borderBottom:activeTab===t.key?'2px solid var(--accent)':'2px solid transparent', fontSize:'0.7rem', fontWeight:activeTab===t.key?700:500, whiteSpace:'nowrap', cursor:'pointer' }}>{t.label}</button>
            ))}
          </div>
          <div style={{ flex:1, overflow:'hidden', padding:'0.7rem', background:'var(--black)' }}>
            <div style={{ height:'100%', overflowY:'auto' }}>
              {TAB_CONTENT[activeTab]}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

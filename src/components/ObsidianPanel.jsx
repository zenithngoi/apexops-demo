import { useState, useEffect } from 'react';
import { testObsidianConnection, syncToVault, hydrateFromVault } from '../lib/obsidian.js';

const STATUS = {
  disconnected: { color: 'var(--sub)',  dot: '⬤', label: 'Not connected' },
  connecting:   { color: '#f59e0b',     dot: '⬤', label: 'Connecting…'  },
  connected:    { color: 'var(--accent)',dot: '⬤', label: 'Connected'    },
  error:        { color: 'var(--warn)', dot: '⬤', label: 'Error'        },
};

const Row = ({ label, children }) => (
  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.45rem' }}>
    <span style={{ fontSize:'0.65rem', color:'var(--sub)', width:'80px', flexShrink:0 }}>{label}</span>
    {children}
  </div>
);

const inputStyle = {
  flex:1, background:'var(--dark)', border:'1px solid var(--border)',
  color:'var(--text)', padding:'0.25rem 0.5rem', borderRadius:'5px',
  fontSize:'0.72rem', fontFamily:'monospace',
};

const Btn = ({ onClick, disabled, accent, children }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: accent ? 'var(--accent)' : 'var(--card)',
    border: `1px solid ${accent ? 'transparent' : 'var(--border)'}`,
    color: accent ? 'var(--black)' : 'var(--sub)',
    padding:'0.28rem 0.75rem', borderRadius:'6px',
    fontSize:'0.68rem', fontWeight:700,
    opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
  }}>{children}</button>
);

export default function ObsidianPanel({ client, playbook, failures, cycleCount, cycleData, onHydrate }) {
  const [apiKey,  setApiKey]  = useState(() => sessionStorage.getItem('obs_key')  || '');
  const [host,    setHost]    = useState(() => sessionStorage.getItem('obs_host') || '127.0.0.1');
  const [port,    setPort]    = useState(() => sessionStorage.getItem('obs_port') || '27124');
  const [status,  setStatus]  = useState('disconnected');
  const [log,     setLog]     = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);

  const addLog = (msg, type = 'info') => {
    const icons = { info:'ℹ', ok:'✅', warn:'⚠', error:'❌' };
    setLog(l => [...l.slice(-19), { msg, type, icon: icons[type], time: new Date().toLocaleTimeString() }]);
  };

  const saveConfig = () => {
    sessionStorage.setItem('obs_key',  apiKey);
    sessionStorage.setItem('obs_host', host);
    sessionStorage.setItem('obs_port', port);
  };

  const testConnection = async () => {
    setStatus('connecting');
    saveConfig();
    addLog(`Testing ${host}:${port}…`);
    const ok = await testObsidianConnection(apiKey, host, parseInt(port));
    setStatus(ok ? 'connected' : 'error');
    addLog(ok ? 'Connected to Obsidian vault ✓' : 'Cannot reach Obsidian — is it open with Local REST API enabled?', ok ? 'ok' : 'error');
  };

  const handleSync = async () => {
    if (status !== 'connected') { addLog('Connect first', 'warn'); return; }
    setSyncing(true);
    addLog(`Syncing ${client} → vault…`);
    try {
      const { ok, errors } = await syncToVault(apiKey, client, playbook, failures, cycleCount, cycleData, host, parseInt(port));
      if (ok) {
        addLog(`Synced: playbook(${playbook?.length||0}) + failures(${failures?.length||0}) + cycle ${cycleCount}`, 'ok');
      } else {
        addLog(`Partial sync — errors: ${errors.join(', ')}`, 'warn');
      }
    } catch(e) {
      addLog(e.message || 'Sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleHydrate = async () => {
    if (status !== 'connected') { addLog('Connect first', 'warn'); return; }
    setLoading(true);
    addLog(`Loading ${client} memory from vault…`);
    try {
      const { playbook: pb, failures: fa } = await hydrateFromVault(apiKey, client, host, parseInt(port));
      if (pb.length === 0 && fa.length === 0) {
        addLog('Vault empty for this client — no memory loaded yet', 'warn');
      } else {
        onHydrate?.(pb, fa);
        addLog(`Loaded: ${pb.length} playbook entries + ${fa.length} failures`, 'ok');
      }
    } catch(e) {
      addLog(e.message || 'Hydrate failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const s = STATUS[status];

  return (
    <div style={{ height:'100%', overflowY:'auto', display:'flex', flexDirection:'column', gap:'0.9rem' }}>

      {/* HEADER */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
        <div>
          <div style={{ fontSize:'0.85rem', fontWeight:800 }}>🟣 Obsidian Brain</div>
          <div style={{ fontSize:'0.62rem', color:'var(--sub)', marginTop:'0.1rem' }}>Persistent memory vault — survives page refresh & device restarts</div>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.35rem' }}>
          <span style={{ color: s.color, fontSize:'0.65rem' }}>{s.dot}</span>
          <span style={{ fontSize:'0.65rem', color: s.color, fontWeight:700 }}>{s.label}</span>
        </div>
      </div>

      {/* CONNECTION CONFIG */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'8px', padding:'0.75rem' }}>
        <div style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--accent)', marginBottom:'0.6rem', textTransform:'uppercase', letterSpacing:'0.07em' }}>Connection</div>

        <Row label="API Key">
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
            placeholder="paste from Obsidian → Local REST API plugin settings"
            style={inputStyle} />
        </Row>
        <Row label="Host">
          <input value={host} onChange={e => setHost(e.target.value)} style={{ ...inputStyle, flex:'none', width:'130px' }} />
        </Row>
        <Row label="Port">
          <input value={port} onChange={e => setPort(e.target.value)} style={{ ...inputStyle, flex:'none', width:'70px' }} />
          <span style={{ fontSize:'0.6rem', color:'var(--sub)' }}>default 27124 (HTTPS) or 27123 (HTTP)</span>
        </Row>

        <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem' }}>
          <Btn onClick={testConnection} accent>🔌 Test Connection</Btn>
          <span style={{ fontSize:'0.6rem', color:'var(--sub)', alignSelf:'center' }}>
            Obsidian must be open on this computer
          </span>
        </div>
      </div>

      {/* MEMORY ACTIONS */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'8px', padding:'0.75rem' }}>
        <div style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--accent)', marginBottom:'0.6rem', textTransform:'uppercase', letterSpacing:'0.07em' }}>Vault Actions — {client}</div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginBottom:'0.6rem' }}>
          <div style={{ background:'var(--dark)', borderRadius:'6px', padding:'0.5rem', textAlign:'center' }}>
            <div style={{ fontSize:'1.1rem', fontWeight:900, color:'var(--accent)' }}>{playbook?.length || 0}</div>
            <div style={{ fontSize:'0.58rem', color:'var(--sub)' }}>Playbook entries</div>
          </div>
          <div style={{ background:'var(--dark)', borderRadius:'6px', padding:'0.5rem', textAlign:'center' }}>
            <div style={{ fontSize:'1.1rem', fontWeight:900, color:'var(--warn)' }}>{failures?.length || 0}</div>
            <div style={{ fontSize:'0.58rem', color:'var(--sub)' }}>Failures logged</div>
          </div>
        </div>

        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
          <Btn onClick={handleSync} disabled={syncing || status !== 'connected'} accent>
            {syncing ? '⟳ Syncing…' : '⬆ Push to Vault'}
          </Btn>
          <Btn onClick={handleHydrate} disabled={loading || status !== 'connected'}>
            {loading ? '⟳ Loading…' : '⬇ Pull from Vault'}
          </Btn>
        </div>

        <div style={{ fontSize:'0.6rem', color:'var(--sub)', marginTop:'0.5rem' }}>
          Push: saves playbook + failures + cycle log to vault<br/>
          Pull: loads existing vault memory into this session
        </div>
      </div>

      {/* VAULT STRUCTURE */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'8px', padding:'0.75rem' }}>
        <div style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--accent)', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.07em' }}>Vault Structure</div>
        <pre style={{ fontSize:'0.63rem', color:'var(--sub)', lineHeight:1.7, margin:0, fontFamily:'monospace' }}>{`ApexOps/
  clients/
    ${client}/
      playbook.md      ← what works
      failures.md      ← never repeat
      cycles/
        cycle-001.md   ← full log
        cycle-00N.md`}</pre>
      </div>

      {/* SETUP GUIDE */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'8px', padding:'0.75rem' }}>
        <div style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--accent)', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.07em' }}>Setup (one-time)</div>
        <ol style={{ margin:0, paddingLeft:'1.1rem', display:'flex', flexDirection:'column', gap:'0.35rem' }}>
          {[
            'Open Obsidian → Settings → Community Plugins → Browse → "Local REST API" → Install + Enable',
            'Go to Local REST API settings → copy the API Key shown',
            'Paste the key above and click Test Connection',
            'Click Pull from Vault to load existing memory (if any)',
            'After each cycle, Push to Vault to persist what agents learned',
          ].map((step, i) => (
            <li key={i} style={{ fontSize:'0.63rem', color:'var(--text)', lineHeight:1.6 }}>{step}</li>
          ))}
        </ol>
      </div>

      {/* LOG */}
      {log.length > 0 && (
        <div style={{ background:'var(--dark)', border:'1px solid var(--border)', borderRadius:'8px', padding:'0.6rem' }}>
          <div style={{ fontSize:'0.6rem', fontWeight:700, color:'var(--sub)', marginBottom:'0.3rem', textTransform:'uppercase' }}>Activity Log</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.15rem' }}>
            {[...log].reverse().map((entry, i) => (
              <div key={i} style={{ display:'flex', gap:'0.4rem', alignItems:'baseline' }}>
                <span style={{ fontSize:'0.58rem', color:'var(--sub)', flexShrink:0 }}>{entry.time}</span>
                <span style={{ fontSize:'0.6rem' }}>{entry.icon}</span>
                <span style={{ fontSize:'0.63rem', color:'var(--text)' }}>{entry.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

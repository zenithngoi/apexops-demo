const AGENTS = [
  { key: 'orchestrator', emoji: '🧭', name: 'Orchestrator', role: 'Loop Manager' },
  { key: 'research',     emoji: '🔎', name: 'Research',     role: 'Intelligence' },
  { key: 'content',      emoji: '✍️',  name: 'Content',     role: 'Creative' },
  { key: 'publishing',   emoji: '📤', name: 'Publishing',   role: 'Execution' },
  { key: 'analytics',    emoji: '📊', name: 'Analytics',    role: 'Truth Engine' },
  { key: 'ads',          emoji: '🎯', name: 'Ads Manager',  role: 'Capital' },
  { key: 'memory',       emoji: '🧠', name: 'Memory',       role: 'Playbook' },
];

const STATUS_STYLES = {
  idle:     { color: 'var(--sub)',    bg: 'transparent',              dot: '#3a3f4a' },
  running:  { color: 'var(--accent)', bg: 'rgba(0,229,160,0.08)',     dot: 'var(--accent)' },
  done:     { color: '#7fffcf',       bg: 'rgba(0,229,160,0.05)',     dot: '#7fffcf' },
  error:    { color: 'var(--warn)',   bg: 'rgba(255,77,77,0.08)',     dot: 'var(--warn)' },
  waiting:  { color: 'var(--yellow)', bg: 'rgba(245,200,66,0.07)',    dot: 'var(--yellow)' },
};

export default function AgentPanel({ statuses }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {AGENTS.map(agent => {
        const status = statuses?.[agent.key] || 'idle';
        const st = STATUS_STYLES[status] || STATUS_STYLES.idle;
        return (
          <div key={agent.key} style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.55rem 0.75rem', borderRadius: '8px',
            background: st.bg,
            border: `1px solid ${status !== 'idle' ? 'rgba(0,229,160,0.15)' : 'transparent'}`,
            transition: 'all 0.3s',
          }}>
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>{agent.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: status === 'idle' ? 'var(--sub)' : 'var(--text)' }}>
                {agent.name}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--sub)' }}>{agent.role}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%', background: st.dot,
                boxShadow: status === 'running' ? `0 0 6px ${st.dot}` : 'none',
                animation: status === 'running' ? 'pulse 1.4s ease infinite' : 'none',
              }} />
              <span style={{ fontSize: '0.62rem', color: st.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {status}
              </span>
            </div>
          </div>
        );
      })}
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.6)} }`}</style>
    </div>
  );
}

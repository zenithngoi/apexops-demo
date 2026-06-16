const PLATFORM_COLORS = {
  TikTok:    { bg: 'rgba(255,0,80,0.08)',  border: 'rgba(255,0,80,0.25)',  label: '#ff0050' },
  Instagram: { bg: 'rgba(193,53,132,0.08)', border: 'rgba(193,53,132,0.25)', label: '#c13584' },
  YouTube:   { bg: 'rgba(255,0,0,0.08)',   border: 'rgba(255,0,0,0.2)',    label: '#ff0000' },
  X:         { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', label: '#e8eaf0' },
};

export default function ContentPanel({ output, streaming }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {!output && !streaming ? (
        <div style={{ color: 'var(--sub)', fontSize: '0.78rem', fontStyle: 'italic', paddingTop: '1rem' }}>
          Content Agent is waiting for Research Agent output.
        </div>
      ) : (
        <pre style={{
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          fontSize: '0.75rem', color: 'var(--text)', lineHeight: 1.65,
          fontFamily: 'inherit',
        }}>
          {output || ''}
          {streaming && <span style={{ color: 'var(--accent)', animation: 'blink 1s step-end infinite' }}>▊</span>}
        </pre>
      )}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

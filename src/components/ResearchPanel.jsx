export default function ResearchPanel({ output, streaming }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {!output && !streaming ? (
        <div style={{ color: 'var(--sub)', fontSize: '0.78rem', fontStyle: 'italic', paddingTop: '1rem' }}>
          Research Agent has not run yet. Click <strong style={{ color: 'var(--text)' }}>Run Loop</strong> to start.
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

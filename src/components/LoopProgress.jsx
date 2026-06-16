const STEPS = [
  { id: 1, label: 'Research',   emoji: '🔎', time: '06:00' },
  { id: 2, label: 'Content',    emoji: '✍️',  time: '07:00' },
  { id: 3, label: 'Publish',    emoji: '📤', time: '08:00' },
  { id: 4, label: 'Analytics',  emoji: '📊', time: '15:00' },
  { id: 5, label: 'Ads Review', emoji: '🎯', time: '15:05' },
  { id: 6, label: 'Memory',     emoji: '🧠', time: '23:30' },
];

export default function LoopProgress({ currentStep }) {
  return (
    <div>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
        Daily Loop — MYT
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {STEPS.map((step, i) => {
          const done    = currentStep > step.id;
          const active  = currentStep === step.id;
          const pending = currentStep < step.id;
          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: done ? 'var(--accent)' : active ? 'rgba(0,229,160,0.15)' : 'var(--card)',
                  border: `2px solid ${done ? 'var(--accent)' : active ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem',
                  boxShadow: active ? '0 0 12px rgba(0,229,160,0.4)' : 'none',
                  transition: 'all 0.4s',
                  flexShrink: 0,
                }}>
                  {done ? '✓' : step.emoji}
                </div>
                <div style={{ fontSize: '0.6rem', color: active ? 'var(--accent)' : done ? 'var(--sub)' : 'var(--muted)', textAlign: 'center', whiteSpace: 'nowrap', fontWeight: active ? 700 : 400 }}>
                  {step.label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: done ? 'var(--accent)' : 'var(--border)', margin: '0 0.15rem', marginBottom: '1.2rem', transition: 'background 0.4s', minWidth: 8 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

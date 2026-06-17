import { useEffect, useRef, useState } from 'react';

// Mini sparkline using Canvas
function Sparkline({ data, color = '#00e5a0', height = 40, width = 120 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !data?.length) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = width  * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 4;
    const pts = data.map((v, i) => ({
      x: pad + (i / (data.length - 1)) * (width - pad * 2),
      y: height - pad - ((v - min) / range) * (height - pad * 2),
    }));

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, color + '33');
    grad.addColorStop(1, color + '00');
    ctx.beginPath();
    ctx.moveTo(pts[0].x, height);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, height);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Last dot
    const last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }, [data, color, height, width]);

  return <canvas ref={ref} style={{ width, height, display: 'block' }} />;
}

const PLATFORMS = [
  {
    key: 'tiktok', name: 'TikTok', color: '#ff0050',
    followers: [4200, 4380, 4510, 4750, 5100, 5340, 5820, 6200, 6580, 7100, 7640, 8200],
    reach:     [18000, 21000, 19500, 24000, 31000, 28000, 35000, 42000, 38000, 47000, 52000, 61000],
  },
  {
    key: 'instagram', name: 'Instagram', color: '#c13584',
    followers: [3100, 3180, 3240, 3310, 3420, 3500, 3590, 3680, 3800, 3940, 4100, 4280],
    reach:     [8000, 8500, 9200, 8800, 10500, 11000, 12400, 11800, 13500, 14200, 15800, 17200],
  },
  {
    key: 'youtube', name: 'YouTube', color: '#ff0000',
    followers: [520, 540, 560, 585, 610, 640, 675, 710, 750, 800, 860, 930],
    reach:     [2200, 2400, 2100, 2800, 3200, 2900, 3500, 3800, 3400, 4100, 4600, 5200],
  },
  {
    key: 'x', name: 'X / Twitter', color: '#e8eaf0',
    followers: [890, 910, 935, 960, 995, 1020, 1060, 1100, 1145, 1190, 1245, 1310],
    reach:     [3400, 3200, 3800, 3500, 4100, 3900, 4500, 4200, 4800, 5100, 4900, 5600],
  },
];

const MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'];

export default function Sparklines() {
  const [metric, setMetric] = useState('followers');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', overflowY: 'auto' }}>

      {/* Toggle */}
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {['followers', 'reach'].map(m => (
          <button key={m} onClick={() => setMetric(m)} style={{
            padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
            background: metric === m ? 'var(--accent)' : 'var(--card)',
            color:      metric === m ? 'var(--black)'  : 'var(--sub)',
            border: `1px solid ${metric === m ? 'var(--accent)' : 'var(--border)'}`,
          }}>{metric === m && '✓ '}{m === 'followers' ? 'Followers' : 'Monthly Reach'}</button>
        ))}
        <span style={{ fontSize: '0.62rem', color: 'var(--sub)', alignSelf: 'center', marginLeft: '0.25rem' }}>Last 12 months · simulated</span>
      </div>

      {/* Platform cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        {PLATFORMS.map(p => {
          const data   = p[metric];
          const latest = data[data.length - 1];
          const prev   = data[data.length - 2];
          const delta  = latest - prev;
          const pct    = ((delta / prev) * 100).toFixed(1);
          const isUp   = delta >= 0;

          return (
            <div key={p.key} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: p.color }}>{p.name}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                    {latest >= 1000 ? `${(latest / 1000).toFixed(1)}K` : latest.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {metric === 'followers' ? 'followers' : 'monthly reach'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isUp ? 'var(--accent)' : 'var(--warn)' }}>
                    {isUp ? '▲' : '▼'} {Math.abs(pct)}%
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--sub)' }}>vs last mo</div>
                </div>
              </div>
              <Sparkline data={data} color={p.color} width={160} height={44} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--sub)' }}>{MONTHS[0]}</span>
                <span style={{ fontSize: '0.58rem', color: 'var(--sub)' }}>{MONTHS[MONTHS.length - 1]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total reach summary */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.8rem 1rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Combined Monthly Reach</div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {PLATFORMS.map(p => {
            const total = p.reach.reduce((a, b) => a + b, 0);
            return (
              <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{p.name}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>{(total / 1000).toFixed(0)}K yr</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

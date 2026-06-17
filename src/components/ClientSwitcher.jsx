import { getAllClientNames } from '../lib/prompts.js';

export default function ClientSwitcher({ current, clients, onChange, onAddClient }) {
  // Use passed clients list (dynamic), fallback to static
  const clientList = clients && clients.length > 0 ? clients : getAllClientNames();

  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
      <span style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--sub)', textTransform:'uppercase', letterSpacing:'0.08em', flexShrink:0 }}>Client</span>
      <select
        value={current}
        onChange={e => onChange(e.target.value)}
        style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--text)', padding:'0.3rem 0.6rem', borderRadius:'6px', fontSize:'0.82rem', fontWeight:600, cursor:'pointer' }}
      >
        {clientList.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <span style={{ background:'rgba(0,229,160,0.12)', border:'1px solid rgba(0,229,160,0.25)', color:'var(--accent)', fontSize:'0.65rem', fontWeight:700, padding:'0.15rem 0.5rem', borderRadius:'99px', textTransform:'uppercase', letterSpacing:'0.06em', flexShrink:0 }}>ACTIVE</span>
      <button
        onClick={onAddClient}
        title="Onboard a new client"
        style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--sub)', padding:'0.22rem 0.55rem', borderRadius:'6px', fontSize:'0.68rem', fontWeight:700, cursor:'pointer', flexShrink:0 }}
      >
        + Client
      </button>
    </div>
  );
}

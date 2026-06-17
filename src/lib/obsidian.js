// Obsidian Local REST API bridge for ApexOps
// Connects to Obsidian vault via the "Local REST API" community plugin
// Plugin runs at https://127.0.0.1:27124 with a self-signed cert
// Set OBSIDIAN_HOST + OBSIDIAN_PORT if non-default

// ── CONFIG ─────────────────────────────────────────────────────
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 27124;
const VAULT_ROOT   = 'ApexOps';       // folder inside your vault

const makeBase = (host, port) =>
  `https://${host}:${port}`;

// ── LOW-LEVEL REST CALLS ────────────────────────────────────────
const obsidianFetch = async (apiKey, host, port, path, method = 'GET', body = null) => {
  const url = `${makeBase(host, port)}${path}`;
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'text/markdown',
    },
  };
  if (body !== null) opts.body = body;
  // Obsidian uses a self-signed cert — we pass no-cors isn't enough in browser
  // The Local REST API plugin supports HTTP on port 27123 as well (no TLS)
  const resp = await fetch(url, opts);
  if (!resp.ok && resp.status !== 404) throw new Error(`Obsidian API ${resp.status}: ${path}`);
  return resp;
};

const readNote = async (apiKey, host, port, path) => {
  const resp = await obsidianFetch(apiKey, host, port, `/vault/${encodeURIComponent(path)}`, 'GET');
  if (resp.status === 404) return null;
  return resp.text();
};

const writeNote = async (apiKey, host, port, path, content) => {
  await obsidianFetch(apiKey, host, port, `/vault/${encodeURIComponent(path)}`, 'PUT', content);
};

const appendNote = async (apiKey, host, port, path, content) => {
  await obsidianFetch(apiKey, host, port, `/vault/${encodeURIComponent(path)}`, 'POST', content);
};

// ── VAULT PATHS ─────────────────────────────────────────────────
const clientPath = (client) => `${VAULT_ROOT}/clients/${client}`;
const playbookPath = (client) => `${clientPath(client)}/playbook.md`;
const failuresPath = (client) => `${clientPath(client)}/failures.md`;
const cyclePath   = (client, n) => `${clientPath(client)}/cycles/cycle-${String(n).padStart(3,'0')}.md`;

// ── PUBLIC API ──────────────────────────────────────────────────

// Test connection — returns true/false
export const testObsidianConnection = async (apiKey, host = DEFAULT_HOST, port = DEFAULT_PORT) => {
  try {
    const resp = await obsidianFetch(apiKey, host, port, '/');
    return resp.ok;
  } catch {
    return false;
  }
};

// Read playbook from vault → returns string[]
export const readPlaybook = async (apiKey, client, host = DEFAULT_HOST, port = DEFAULT_PORT) => {
  const text = await readNote(apiKey, host, port, playbookPath(client));
  if (!text) return [];
  return text
    .split('\n')
    .filter(l => l.trim().startsWith('- '))
    .map(l => l.replace(/^- /, '').trim())
    .filter(Boolean);
};

// Read failures from vault → returns string[]
export const readFailures = async (apiKey, client, host = DEFAULT_HOST, port = DEFAULT_PORT) => {
  const text = await readNote(apiKey, host, port, failuresPath(client));
  if (!text) return [];
  return text
    .split('\n')
    .filter(l => l.trim().startsWith('- '))
    .map(l => l.replace(/^- /, '').trim())
    .filter(Boolean);
};

// Write full playbook to vault
export const writePlaybook = async (apiKey, client, entries, host = DEFAULT_HOST, port = DEFAULT_PORT) => {
  const content = [
    `# ${client} — Playbook`,
    `> What works. Agents build on these every cycle.`,
    `> Last updated: ${new Date().toISOString()}`,
    ``,
    ...entries.map(e => `- ${e}`),
    ``,
  ].join('\n');
  await writeNote(apiKey, host, port, playbookPath(client), content);
};

// Write full failures log to vault
export const writeFailures = async (apiKey, client, entries, host = DEFAULT_HOST, port = DEFAULT_PORT) => {
  const content = [
    `# ${client} — Failures Log`,
    `> Permanently banned patterns. Agents NEVER repeat these.`,
    `> Last updated: ${new Date().toISOString()}`,
    ``,
    ...entries.map(e => `- ${e}`),
    ``,
  ].join('\n');
  await writeNote(apiKey, host, port, failuresPath(client), content);
};

// Write cycle log (research + content + analytics + memory + summary)
export const writeCycleLog = async (apiKey, client, cycleNum, data, host = DEFAULT_HOST, port = DEFAULT_PORT) => {
  const { research, content, analyticsText, memoryOut, summaryText, playbook, failures } = data;
  const md = [
    `# ${client} — Cycle ${cycleNum}`,
    `**Date:** ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
    `**Playbook size:** ${playbook?.length || 0} | **Failures:** ${failures?.length || 0}`,
    ``,
    `---`,
    ``,
    `## 🔎 Research`,
    research || 'N/A',
    ``,
    `---`,
    ``,
    `## ✍️ Content`,
    content || 'N/A',
    ``,
    `---`,
    ``,
    `## 📊 Analytics`,
    analyticsText || 'N/A',
    ``,
    `---`,
    ``,
    `## 🧠 Memory Agent Output`,
    memoryOut || 'N/A',
    ``,
    `---`,
    ``,
    `## 🧭 Orchestrator Summary`,
    summaryText || 'N/A',
    ``,
  ].join('\n');
  await writeNote(apiKey, host, port, cyclePath(client, cycleNum), md);
};

// Sync: push current in-memory store to vault (call at end of each cycle)
export const syncToVault = async (apiKey, client, playbook, failures, cycleNum, cycleData, host = DEFAULT_HOST, port = DEFAULT_PORT) => {
  const results = await Promise.allSettled([
    writePlaybook(apiKey, client, playbook, host, port),
    writeFailures(apiKey, client, failures, host, port),
    writeCycleLog(apiKey, client, cycleNum, cycleData, host, port),
  ]);
  const errors = results.filter(r => r.status === 'rejected').map(r => r.reason?.message);
  return { ok: errors.length === 0, errors };
};

// Load: pull vault data into memory at start (hydrate store from vault)
export const hydrateFromVault = async (apiKey, client, host = DEFAULT_HOST, port = DEFAULT_PORT) => {
  const [playbook, failures] = await Promise.all([
    readPlaybook(apiKey, client, host, port),
    readFailures(apiKey, client, host, port),
  ]);
  return { playbook, failures };
};

import { buildResearchPrompt, buildContentPrompt, buildAnalyticsPrompt, buildMemoryPrompt, buildOrchestratorPrompt, buildWeeklyReportPrompt } from './prompts.js';

const callClaude = async (apiKey, { system, user }, onChunk) => {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      stream: true,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value).split('\n')) {
      if (!line.startsWith('data: ')) continue;
      try {
        const d = JSON.parse(line.slice(6));
        if (d.type === 'content_block_delta' && d.delta?.text) {
          full += d.delta.text;
          onChunk?.(full);
        }
      } catch {}
    }
  }
  return full;
};

export const runResearchAgent    = (k, client, pb, fa, cy, cb) => callClaude(k, buildResearchPrompt(client, pb, fa, cy), cb);
export const runContentAgent     = (k, client, res, pb, fa, cy, cb) => callClaude(k, buildContentPrompt(client, res, pb, fa, cy), cb);
export const runAnalyticsAgent   = (k, client, posts, pb, fa, cy, cb) => callClaude(k, buildAnalyticsPrompt(client, posts, pb, fa, cy), cb);
export const runMemoryAgent      = (k, client, res, con, anl, pb, fa, cy, cb) => callClaude(k, buildMemoryPrompt(client, res, con, anl, pb, fa, cy), cb);
export const runOrchestratorAgent = (k, client, res, con, mem, pb, fa, cy, cb) => callClaude(k, buildOrchestratorPrompt(client, res, con, mem, pb, fa, cy), cb);

export const runWeeklyReportAgent = (k, client, metrics, roas, cpl, qualRate, pb, fa, cy, analyticsText, summaryText, notes, cb) => callClaude(k, buildWeeklyReportPrompt(client, metrics, roas, cpl, qualRate, pb, fa, cy, analyticsText, summaryText, notes), cb);

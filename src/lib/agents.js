// Claude API call wrappers for each agent.
// All agents receive the live playbook so they improve each cycle.

import {
  buildResearchPrompt,
  buildContentPrompt,
  buildAnalyticsPrompt,
  buildMemoryPrompt,
  buildOrchestratorPrompt,
} from './prompts.js';

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
    const chunk = decoder.decode(value);
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.type === 'content_block_delta' && data.delta?.text) {
          full += data.delta.text;
          onChunk?.(full);
        }
      } catch {}
    }
  }
  return full;
};

export const runResearchAgent = (apiKey, client, playbook, onChunk) =>
  callClaude(apiKey, buildResearchPrompt(client, playbook), onChunk);

export const runContentAgent = (apiKey, client, research, playbook, onChunk) =>
  callClaude(apiKey, buildContentPrompt(client, research, playbook), onChunk);

export const runAnalyticsAgent = (apiKey, client, postLog, playbook, onChunk) =>
  callClaude(apiKey, buildAnalyticsPrompt(client, postLog, playbook), onChunk);

export const runMemoryAgent = (apiKey, client, research, content, analyticsNotes, playbook, onChunk) =>
  callClaude(apiKey, buildMemoryPrompt(client, research, content, analyticsNotes, playbook), onChunk);

export const runOrchestratorAgent = (apiKey, client, research, content, memoryInsights, playbook, onChunk) =>
  callClaude(apiKey, buildOrchestratorPrompt(client, research, content, memoryInsights, playbook), onChunk);

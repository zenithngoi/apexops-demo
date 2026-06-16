// Claude API call wrappers for each agent.
// All calls go to https://api.anthropic.com/v1/messages
// Model: claude-haiku-4-5-20251001 for speed in demo mode.

import { buildResearchPrompt, buildContentPrompt, buildOrchestratorPrompt, buildMemoryPrompt } from './prompts.js';

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
      max_tokens: 1024,
      stream: true,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
    for (const line of lines) {
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

export const runResearchAgent = (apiKey, client, onChunk) =>
  callClaude(apiKey, buildResearchPrompt(client), onChunk);

export const runContentAgent = (apiKey, client, research, onChunk) =>
  callClaude(apiKey, buildContentPrompt(client, research), onChunk);

export const runOrchestratorAgent = (apiKey, client, research, content, onChunk) =>
  callClaude(apiKey, buildOrchestratorPrompt(client, research, content), onChunk);

export const runMemoryAgent = (apiKey, client, research, content, onChunk) =>
  callClaude(apiKey, buildMemoryPrompt(client, research, content), onChunk);

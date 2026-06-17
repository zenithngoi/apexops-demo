// Agent prompt builders. Every agent receives:
// 1. The playbook (what worked — build on this)
// 2. The failures log (what flopped — never repeat this)
// Agents improve every cycle because memory is permanent.

export const CLIENTS = {
  'Demo Broker': {
    industry: 'Forex Brokerage',
    market: 'Malaysia (Phase 1)',
    audience: '18–35 MY retail traders, beginner to intermediate',
    platforms: ['TikTok', 'Instagram Reel', 'YouTube Short', 'X'],
    tone: 'Confident but approachable. English + light Bahasa Malaysia. Never corporate.',
    pillars: ['Education', 'Proof', 'Lifestyle', 'Commentary'],
  },
};

const today = () => new Date().toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// Injects permanent memory into every agent prompt
const buildMemoryBlock = (playbook = [], failures = [], cycleCount = 0) => {
  const parts = [];

  if (cycleCount === 0) {
    parts.push(`MEMORY STATUS: First cycle — no prior data. Build from first principles.`);
  } else {
    parts.push(`MEMORY STATUS: Cycle ${cycleCount} complete. You have ${playbook.length} proven insights and ${failures.length} logged failures.`);
  }

  if (playbook.length > 0) {
    parts.push(`\nPLAYBOOK — What worked (apply these now, build on them):\n${playbook.map((p, i) => `${i + 1}. ${p}`).join('\n')}`);
  }

  if (failures.length > 0) {
    parts.push(`\nFAILURES — What flopped (NEVER repeat these):\n${failures.map((f, i) => `✗ ${f}`).join('\n')}`);
  }

  return parts.join('\n');
};

// ── RESEARCH AGENT ─────────────────────────────────────────────
export const buildResearchPrompt = (client, playbook, failures, cycleCount) => {
  const c = CLIENTS[client];
  return {
    system: `You are the Research Agent for ApexOps.
Mission: Intelligence engine. Industry, competitors, platform trends — daily.
Output: Structured markdown, under 600 words. Specific. Data-backed.
Client: ${client} | Industry: ${c.industry} | Market: ${c.market}

${buildMemoryBlock(playbook, failures, cycleCount)}`,
    user: `Daily research scan for ${client} targeting ${c.audience}.
Date: ${today()}

Produce:
## 📈 Top 3 Trending Topics
(each with source reasoning — cite why it matters for MY traders today)

## 🎣 Top 3 Hook Angles
(MUST be different from playbook entries above — explain why each will stop the scroll)

## 🕵️ Competitor Activity
(what are forex educators/brokers posting in MY right now — what gap exists)

## 🎯 Recommended Pillar Today
(Education / Proof / Lifestyle / Commentary — cite data reason)

## 💡 Pattern Flags
(anything from today's scan that should be tracked for future memory promotion)`,
  };
};

// ── CONTENT AGENT ──────────────────────────────────────────────
export const buildContentPrompt = (client, research, playbook, failures, cycleCount) => {
  const c = CLIENTS[client];
  return {
    system: `You are the Content Agent for ApexOps.
Mission: Platform-native content that stops the scroll. Every piece is specific, never generic.
Client: ${client} | Tone: ${c.tone}

${buildMemoryBlock(playbook, failures, cycleCount)}

NON-NEGOTIABLE RULES:
- First line = hook. If it doesn't stop a scroll, rewrite it.
- Tag every piece: [PLATFORM] [PILLAR] [HOOK TYPE]
- Failures listed above = formats you are BANNED from using
- Playbook entries = build on these, do not just repeat them`,
    user: `Based on today's research:

${research}

Draft:

**1. TIKTOK** [PLATFORM: TikTok] [PILLAR: X] [HOOK TYPE: X]
Hook (3 seconds):
Script (45 sec, conversational MY voice):
Caption:
Hashtags (5):

**2. INSTAGRAM REEL** [PLATFORM: Instagram] [PILLAR: X] [HOOK TYPE: X]
Hook (opening frame):
Script (30–45 sec):
Caption:
CTA:
Hashtags (8):

${cycleCount > 0 ? `Memory active: ${playbook.length} proven patterns loaded, ${failures.length} failure patterns banned.` : 'First cycle — set the baseline.'}`,
  };
};

// ── ANALYTICS AGENT ────────────────────────────────────────────
export const buildAnalyticsPrompt = (client, postLog, playbook, failures, cycleCount) => {
  return {
    system: `You are the Analytics Agent for ApexOps. Truth engine.
Velocity = views_at_3h ÷ 3. Top-10% threshold = avg_views_last_30 × 1.5

${buildMemoryBlock(playbook, failures, cycleCount)}`,
    user: `Analyse today's posts for ${client}:
TikTok: 4,820 views (+3h), 6.2% ER, 298 comments
Instagram Reel: 1,340 views (+3h), 4.8% ER, 64 comments
30-day avg at +3h: 2,100 views, 4.1% ER

Produce:
1. Velocity scores + top-10% check
2. [BOOST CANDIDATE] flags with reasoning
3. What pillar/hook type drove the top performer
4. 1–2 observations to flag for Memory Agent
5. Anything that should go to failures.md`,
  };
};

// ── MEMORY AGENT ───────────────────────────────────────────────
export const buildMemoryPrompt = (client, research, content, analyticsNotes, playbook, failures, cycleCount) => {
  return {
    system: `You are the Memory Agent for ApexOps. Compound intelligence.
Your output feeds directly back into every agent's system prompt next cycle.
Rules:
- PROMOTE to playbook: n≥3 evidence, OR top-5% result, OR clear pattern
- LOG to failures: bottom-10% result, OR format that consistently underperforms
- Never duplicate existing playbook entries
- Failures are permanent — they protect every future cycle

${buildMemoryBlock(playbook, failures, cycleCount)}`,
    user: `Stage today's learnings for ${client} (Cycle ${cycleCount + 1}).

Research highlights:
${research?.slice(0, 500) || 'N/A'}

Content produced: TikTok + Instagram Reel

Analytics:
${analyticsNotes?.slice(0, 400) || 'TikTok above velocity threshold. IG at average. Proof pillar outperformed Education.'}

Output format — provide ALL of these sections:

**STAGED INSIGHTS** (for playbook promotion):
[INSIGHT 1] {what was observed} • Confidence: {LOW/MEDIUM/HIGH} • Action: {apply next cycle}
[INSIGHT 2] ...

**FAILURES TO LOG** (permanent ban — never repeat):
[FAILURE 1] {format/hook/pattern that underperformed} • Why: {reason}

**PLAYBOOK UPGRADES** (existing entries to strengthen):
[UPGRADE] Entry #X → {what to add or modify}

**HOOKS LIBRARY UPDATE**:
[HOOK] {pattern} | Platform: X | Est. ER: X% | Why it works: Y`,
  };
};

// ── ORCHESTRATOR ───────────────────────────────────────────────
export const buildOrchestratorPrompt = (client, research, content, memoryOut, playbook, failures, cycleCount) => {
  return {
    system: `You are the Orchestrator for ApexOps. Daily loop manager.
Military brevity. You are the only agent who talks to the human.

${buildMemoryBlock(playbook, failures, cycleCount)}`,
    user: `End-of-loop summary for ${client} — Cycle ${cycleCount + 1}.

Loop: Research ✓ | Content ✓ | Publishing ✓ | Analytics ✓ | Memory ✓

Memory staged:
${memoryOut?.slice(0, 500) || 'N/A'}

Playbook: ${playbook.length} entries | Failures logged: ${failures.length}

Write end-of-day summary (under 200 words):
1. What ran and status
2. Key insight from this cycle
3. Boost candidates flagged
4. What the system learned (memory delta)
5. Tomorrow's recommendation
6. Any human approval needed?`,
  };
};

# ApexOps Demo — Build Progress

## ✅ Stage 1 — Scaffold + Core UI (DONE)
- Vite + React isolated repo (`C:\Users\ngoil\Claude\Projects\ApexOps-Demo\`)
- Separate `.git`, own `package.json`, own `vite.config.js` (`base: './'`)
- 7-agent tab layout: Research, Content, Analytics, Ads Book, Memory, Leads Funnel, Growth, Summary
- API key input (in-memory only, never stored)
- `dist/index.html` built as single self-contained file (plain `<script>`, no `type="module"`) for `file://` compatibility

---

## ✅ Stage 2 — Agent Streaming + Memory System (DONE)
- `src/lib/agents.js` — Claude API wrappers with SSE streaming (`claude-haiku-4-5-20251001`)
- `src/lib/memory.js` — per-client persistent memory store
  - `makeClientMemory()` → `{ playbook, failures, cycleCount, memoryLog, postLog }`
  - `setClient(c)` — switches to client's own memory slice
  - `promoteToPlaybook(insights)` — permanent, capped at 30
  - `logFailure(failures)` — permanent ban, capped at 20
  - `startNewCycle()` — keeps ALL memory, resets run outputs only
  - **Hard Reset deliberately removed** — agents learn from every cycle
- `src/lib/prompts.js` — memory-learning prompt builders injecting PLAYBOOK + FAILURES into every agent system prompt

---

## ✅ Stage 3 — Ads Panel + Human Approval Gate (DONE)
- `src/components/AdsPanel.jsx` — interactive ads ledger
  - Kill / Scale buttons → human approval modal required before execution
  - ROAS ≥ 3× → Scale +20%, CTR < 0.8% → Kill
  - Approval log tracks all decisions
  - No ad action executes without explicit human confirmation

---

## ✅ Stage 4 — Analytics + Memory Tabs (DONE)
- Full Analytics tab: ROAS trends, CTR breakdown, spend vs. revenue
- Memory tab: live playbook viewer, failures list, cycle counter
- Summary tab: Orchestrator weekly synthesis

---

## ✅ Stage 5 — Leads Funnel + Platform Sparklines (DONE)
**Git commit:** `4abea81` — 2026-06-17

### New: `src/components/LeadsFunnel.jsx`
- 6-stage funnel: Reach → Profile Visits → Link Clicks → Form Starts → Leads → Qualified
- Click-to-edit inline numbers on all 6 stages
- Live KPI recalculation on every edit:
  - **Cost / Lead** (total spend ÷ lead count)
  - **CVR** (leads ÷ link clicks %)
  - **Qualification Rate** (qualified ÷ leads %)
- Visual funnel bars with conversion % between each stage

### New: `src/components/Sparklines.jsx`
- Canvas-based sparklines for 4 platforms: TikTok, Instagram, YouTube, X
- 12-month simulated data per platform
- Toggle: **Followers** / **Monthly Reach** views
- `getContext('2d')`, `createLinearGradient` for gradient fills

### Integration
- 2 new tabs added to `App.jsx`: `📥 Leads Funnel` + `📈 Growth`
- Build: ✓ 29 modules transformed, 235KB JS bundle
- Final HTML: 236,038 chars, all 7 checks passed

---

## 🔄 Stage 6 — Weekly Report Generator (IN PROGRESS)
- Orchestrator produces full weekly performance report
- Exportable as markdown file
- Covers: top posts, ROAS summary, funnel performance, platform growth, agent insights, next-week priorities

---

## ⏳ Stage 7 — Multi-Client Onboarding
- Second demo client (prop firm)
- Onboarding modal seeds brand voice / audience / platforms into memory
- Client switcher in top bar

---

## ⏳ Stage 8 — Deploy to Vercel
- Push to GitHub
- Connect Vercel
- Live public URL

---

## Architecture Decisions

| Decision | Reason |
|---|---|
| No Hard Reset | Agents compound intelligence each cycle — failures permanently banned |
| Per-client memory slices | Switching clients never wipes another client's learned patterns |
| Single-file HTML build | `file://` compatibility — no server needed for local demo |
| Human approval gate on ads | All spend decisions require explicit confirmation before execution |
| In-memory API key only | Security — key never touches disk, localStorage, or logs |

---

## ✅ Stage 6 — Weekly Report Generator (DONE)
**Git commit:** `b3bbc51` — 2026-06-17

### New: `src/components/WeeklyReport.jsx`
- Editable actuals: Spend, Revenue, Leads, Qualified, Best ROAS, Avg CTR, New Followers, Top Platform
- Live-calculated KPIs: ROAS, Cost/Lead, Qualification Rate
- **AI Generate** button → streams full Orchestrator weekly report via Claude API
- **Export .md** → downloads `apexops-{client}-cycle{N}.md`
- **Copy MD** → clipboard copy of full report
- Displays agent memory: last 5 playbook entries + last 5 failures inline
- Additional Notes textarea for human context
- Static preview shown before AI generation

### New Prompt: `buildWeeklyReportPrompt()` in `prompts.js`
- Injects all actuals, memory, analytics text, orchestrator summary
- Structures report: Executive Summary → Scorecard → Top Performers → What System Learned → Risks → Next Week Priorities → Approvals Needed

### New Agent: `runWeeklyReportAgent()` in `agents.js`

### Integration
- New tab in `App.jsx`: `📋 Weekly Report`
- `onGenerate` callback wired — only active when API key is set
- Build: ✓ 30 modules transformed, 247KB JS bundle
- Final HTML: 247,858 chars, all 9 checks passed

---

## ✅ Stage 7 — Multi-Client Onboarding (DONE)
**Git commit:** `c9dc369` — 2026-06-17

### New: `src/components/OnboardingModal.jsx`
- 3-step onboarding wizard: Basic Info → Voice & Strategy → Review & Confirm
- Step 1: Client Name, Industry, Market, Target Audience
- Step 2: Brand Tone (textarea), Content Pillars (chip selector), Active Platforms (chip selector), Do-Nots (seeds failures log), Known what-works (seeds playbook)
- Step 3: Full review summary before confirmation
- On confirm: registers client def in `prompts.js` + seeds memory in `memory.js`

### New Static Client: `Apex PropFirm`
- Industry: Proprietary Trading Firm | Market: Malaysia + Singapore
- Platforms: TikTok, Instagram Reel, YouTube Short, LinkedIn
- Pillars: Proof, Education, Behind the Scenes, Commentary
- Completely separate memory slice — agents learn independently per client

### Updates
- `src/lib/prompts.js`: `registerClientDef()`, `getAllClientNames()`, `getClientDef()` — runtime client registry
- `src/lib/memory.js`: `registerClient(name, seedPlaybook, seedFailures)`, `getClients()`
- `src/components/ClientSwitcher.jsx`: shows all clients (static + dynamic), `+ Client` button
- `src/App.jsx`: `handleAddClient()`, `showOnboarding` state, `clientList` state

### Integration
- Build: ✓ 31 modules transformed, 257KB JS bundle
- Final HTML: 258,085 chars, all 11 checks passed

---

## 🔄 Stage 8 — Deploy to Vercel (IN PROGRESS)
- Push ApexOps-Demo to GitHub
- Connect to Vercel
- Live public URL — no file:// needed

---

## ✅ Stage 8 — Deploy to Vercel (DONE)
**Git commit:** `65c42a0` — 2026-06-17

### Files Added
- `vercel.json` — Vite framework, `dist/` output dir, SPA rewrite rule (`/*` → `/index.html`)
- `.gitignore` — excludes `node_modules/`, `dist/`, `.vercel/`
- `DEPLOY.md` — step-by-step guide for 2 deploy paths:
  - **Option A:** GitHub → Vercel dashboard (auto-deploys on push)
  - **Option B:** `npx vercel --prod` CLI direct deploy

### Deploy Instructions (short version)
```bash
# In C:\Users\ngoil\Claude\Projects\ApexOps-Demo\

# Option A — push to GitHub first, then import on vercel.com/new
git remote add origin https://github.com/YOUR_USERNAME/apexops-demo.git
git push -u origin main

# Option B — CLI direct
npx vercel login
npx vercel --prod
```

### Build Status
- ✓ 31 modules | 257KB JS | 0 errors
- `vercel.json` config: framework=vite, outputDirectory=dist
- API key entered at runtime — never in the build

---

## 🏁 ALL STAGES COMPLETE

| Stage | Feature | Commit |
|---|---|---|
| 1 | Core scaffold + UI shell | `ee390dd` |
| 2 | Live Claude API + memory system | `f88c6c7` |
| 3 | Ads book + approval gate | `1c33d2a` |
| 4 | Analytics + memory tabs | `a9f1483` |
| 5 | Leads Funnel + Platform Sparklines | `4abea81` |
| 6 | Weekly Report Generator | `b3bbc51` |
| 7 | Multi-client onboarding + Apex PropFirm | `c9dc369` |
| 8 | Vercel deploy config + instructions | `65c42a0` |

**Final HTML:** 258,085 chars · **31 React modules** · **8 git commits**
**apexops-demo.html** saved to `Digital Marketing Agency/` — open directly with double-click.

---

## ✅ Research: Brain Architecture + Loop Cadence (DONE)
**Date:** 2026-06-17

### Power User Brain Setup (2026 Consensus)
- **Obsidian** dominates local-first lane — 1.5M users, 22% YoY growth
- Architecture: `Obsidian Vault` → `MCP Server` → `AI Agents read/write directly`
- Agents have continuous access to everything learned — no cold-start per session

### Obsidian as ApexOps Persistent Brain
Current: In-browser JS memory — wiped on page refresh
Upgrade: Obsidian MCP — survives refresh, restarts, device switches

**Vault structure:**
```
ApexOps/
  clients/
    Demo Broker/
      playbook.md    ← permanent what-works
      failures.md    ← permanent never-repeat
      cycles/
        cycle-001.md
    Apex PropFirm/
      playbook.md
      failures.md
```

**MCP tools available (2026):**
| Tool | Stars | Method |
|---|---|---|
| Claudian | 4,600 | Claude embedded in Obsidian sidebar |
| mcp-obsidian | 3,000 | REST API via Local REST API plugin |
| mcpvault | 909 | File-based, no plugin, BM25 search |

### Loop Cadence (Platform Data 2026)
| Platform | Optimal/week | Notes |
|---|---|---|
| TikTok | 2–5x | Consistency beats volume |
| Instagram Reel | 3–5x | Daily Stories on top |
| YouTube Short | 2–3x | |
| X | 3–7x | Commentary + reactions |

**Recommendation:** Daily loop at 20:00 MYT (Mon–Sun during acquisition phase).
- Weekly Report generated Friday → human review → seeds next week's memory
- Ads human approval every 3 days
- 30–60 day mark: playbook hits 20–30 entries → ROAS compounds past 3×

---

## 🔄 Stage 9 — Obsidian Persistent Brain (IN PROGRESS)
- Replace in-browser memory with Obsidian vault via MCP
- Memory Agent writes playbook.md + failures.md + cycle logs after every loop
- Agents read vault files at loop start — memory survives page refresh indefinitely
- Scheduled daily loop at 20:00 MYT

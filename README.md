# ApexOps Demo — React Dashboard

## ⚠️ Project Isolation Notice
This is a **completely separate project** from `Digital Marketing Agency/`.

| | This project | Digital Marketing Agency |
|---|---|---|
| Purpose | Interactive demo app (React) | Agency system docs + landing page |
| Stack | Vite + React + Claude API | Static HTML |
| Files | `ApexOps-Demo/` | `Digital Marketing Agency/` |
| Git repo | Own `.git` here | Own `.git` there |

**Do NOT copy files between these projects. Do NOT run npm here from the other folder.**

---

## What This Is
A React single-page app that runs the ApexOps 7-agent loop live, calling the Claude API in real time. Used as a client demo tool — shows prospects a full research → content → analytics → memory cycle in under 10 minutes.

## Stack
- **Vite + React** (no backend, no database)
- **Claude API** (direct from browser via API key input)
- All state is in-memory (resets on refresh — intentional for demo)

## Structure
```
src/
  App.jsx             — root layout
  components/
    AgentPanel.jsx    — 7 agent status cards
    LoopProgress.jsx  — daily loop step tracker
    MemoryFeed.jsx    — live memory.md display
    ClientSwitcher.jsx
    ResearchPanel.jsx
    ContentPanel.jsx
    AnalyticsPanel.jsx
    AdsPanel.jsx
  lib/
    agents.js         — Claude API call wrappers per agent
    prompts.js        — system prompt builders
    memory.js         — in-memory state manager
  styles/
    global.css
```

## Run Locally
```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

## Build Progress
- [x] Stage 1 — Core shell (layout, panels, static state)
- [ ] Stage 2 — Live Claude API agent calls
- [ ] Stage 3 — Demo polish (ads book, sparklines, export)
- [ ] Stage 4 — Demo validation run

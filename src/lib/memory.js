// Per-client persistent memory store.
// Playbook and failures NEVER reset — agents learn from every cycle.
// The only "reset" is switching clients, which loads that client's own memory slice.
// Resets on page refresh only (Option 3 demo limitation — Option 2 will use a DB).

const makeClientMemory = () => ({
  playbook:  [],  // promoted insights — fed into all agent prompts
  failures:  [],  // confirmed failures — agents are warned to avoid these
  cycleCount: 0,
  memoryLog: [],  // raw staged insights (all cycles, never pruned in demo)
  postLog:   [],
});

export const createMemoryStore = () => {
  let listeners = [];

  // Each client gets its own memory slice — switching client loads theirs
  let clientMemory = {
    'Demo Broker': makeClientMemory(),
  };

  let state = {
    client:    'Demo Broker',
    apiKey:    '',
    loopStep:  0,
    agentStatus: {
      orchestrator: 'idle', research: 'idle', content: 'idle',
      publishing: 'idle', analytics: 'idle', ads: 'idle', memory: 'idle',
    },
    research:      null,
    content:       null,
    analytics:     null,
    analyticsText: null,
    ads:           null,
    sessionStarted: false,
  };

  const notify = () => listeners.forEach(fn => fn(snapshot()));

  // Snapshot merges global state + current client memory
  const snapshot = () => ({
    ...state,
    ...clientMemory[state.client],
  });

  const cm = () => clientMemory[state.client];

  return {
    get: () => snapshot(),

    set: (patch) => {
      state = { ...state, ...patch };
      notify();
    },

    setClient: (client) => {
      // Ensure client slice exists
      if (!clientMemory[client]) clientMemory[client] = makeClientMemory();
      state = { ...state, client, loopStep: 0, sessionStarted: false, research: null, content: null, analytics: null, analyticsText: null, ads: null };
      // Reset agent statuses for new client
      state.agentStatus = { orchestrator:'idle', research:'idle', content:'idle', publishing:'idle', analytics:'idle', ads:'idle', memory:'idle', seogeo:'idle' };
      notify();
    },

    setAgent: (agent, status) => {
      state = { ...state, agentStatus: { ...state.agentStatus, [agent]: status } };
      notify();
    },

    // Promote confirmed insights to permanent playbook (never erased)
    promoteToPlaybook: (insights) => {
      const existing = cm().playbook;
      const novel = insights.filter(i => i?.trim() && !existing.some(e => e.slice(0, 40) === i.slice(0, 40)));
      if (novel.length > 0) {
        // Cap at 30 — oldest low-value entries compressed (in real system Memory Agent handles this)
        clientMemory[state.client].playbook = [...existing, ...novel].slice(-30);
        notify();
      }
    },

    // Log failures permanently — agents will always be warned to avoid these
    logFailure: (failures) => {
      const existing = cm().failures;
      const novel = failures.filter(f => f?.trim() && !existing.includes(f));
      if (novel.length > 0) {
        clientMemory[state.client].failures = [...existing, ...novel].slice(-20);
        notify();
      }
    },

    addMemoryLog: (insight) => {
      clientMemory[state.client].memoryLog = [...cm().memoryLog, insight];
      notify();
    },

    addPostLog: (post) => {
      clientMemory[state.client].postLog = [...cm().postLog, post];
      notify();
    },

    incrementCycle: () => {
      clientMemory[state.client].cycleCount += 1;
      notify();
    },

    // "New Cycle" — keeps ALL memory, just resets the current run's outputs
    startNewCycle: () => {
      state = {
        ...state, loopStep: 0, sessionStarted: false,
        research: null, content: null, analytics: null, analyticsText: null, ads: null,
        agentStatus: { orchestrator:'idle', research:'idle', content:'idle', publishing:'idle', analytics:'idle', ads:'idle', memory:'idle', seogeo:'idle' },
      };
      notify();
    },

    // Register a new client with optional seed memory
    registerClient: (clientName, seedPlaybook = [], seedFailures = []) => {
      if (!clientMemory[clientName]) {
        clientMemory[clientName] = makeClientMemory();
      }
      if (seedPlaybook.length > 0) {
        clientMemory[clientName].playbook = [...clientMemory[clientName].playbook, ...seedPlaybook].slice(-30);
      }
      if (seedFailures.length > 0) {
        clientMemory[clientName].failures = [...clientMemory[clientName].failures, ...seedFailures].slice(-20);
      }
      notify();
    },

    // Get all registered client names
    getClients: () => Object.keys(clientMemory),

    subscribe: (fn) => {
      listeners.push(fn);
      return () => { listeners = listeners.filter(l => l !== fn); };
    },
  };
};

export const store = createMemoryStore();

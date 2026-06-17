// In-memory state for the demo session.
// Playbook persists across multiple loop runs in the same session — agents learn.
// Resets on page refresh — intentional for demo.

export const createMemoryStore = () => {
  let listeners = [];
  let state = {
    client: 'Demo Broker',
    apiKey: '',
    loopStep: 0,
    cycleCount: 0, // increments each full loop run
    agentStatus: {
      orchestrator: 'idle',
      research:     'idle',
      content:      'idle',
      publishing:   'idle',
      analytics:    'idle',
      ads:          'idle',
      memory:       'idle',
    },
    research:   null,
    content:    null,
    analytics:  null,
    analyticsText: null, // live analytics agent output
    ads:        null,
    memoryLog:  [],     // all staged insights (accumulates across cycles)
    playbook:   [],     // promoted insights — fed back into every agent prompt
    postLog:    [],
    sessionStarted: false,
  };

  const notify = () => listeners.forEach(fn => fn({ ...state }));

  return {
    get: () => ({ ...state }),
    set: (patch) => { state = { ...state, ...patch }; notify(); },
    setAgent: (agent, status) => {
      state = { ...state, agentStatus: { ...state.agentStatus, [agent]: status } };
      notify();
    },
    // Add a raw staged insight (shown in Memory tab)
    addMemoryLog: (insight) => {
      state = { ...state, memoryLog: [...state.memoryLog, insight] };
      notify();
    },
    // Promote insights to the permanent playbook — fed back into ALL agents next cycle
    promoteToPlaybook: (insights) => {
      const newEntries = insights.filter(i => i && i.trim() && !state.playbook.includes(i));
      if (newEntries.length > 0) {
        // Hard cap at 20 entries (memory.md token budget equivalent)
        const merged = [...state.playbook, ...newEntries].slice(-20);
        state = { ...state, playbook: merged };
        notify();
      }
    },
    addPostLog: (post) => {
      state = { ...state, postLog: [...state.postLog, post] };
      notify();
    },
    incrementCycle: () => {
      state = { ...state, cycleCount: state.cycleCount + 1 };
      notify();
    },
    subscribe: (fn) => {
      listeners.push(fn);
      return () => { listeners = listeners.filter(l => l !== fn); };
    },
  };
};

export const store = createMemoryStore();

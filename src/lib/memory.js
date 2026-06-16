// In-memory state store for the demo session.
// Resets on page refresh — intentional for demo use.
// DO NOT import from Digital Marketing Agency project.

export const createMemoryStore = () => {
  let listeners = [];
  let state = {
    client: 'Demo Broker',
    apiKey: '',
    loopStep: 0, // 0=idle, 1=research, 2=content, 3=publish, 4=analytics, 5=ads, 6=memory
    agentStatus: {
      orchestrator: 'idle',
      research:     'idle',
      content:      'idle',
      publishing:   'idle',
      analytics:    'idle',
      ads:          'idle',
      memory:       'idle',
    },
    research:  null,   // string output
    content:   null,   // { tiktok, instagram, youtube, twitter }
    analytics: null,   // simulated metrics object
    ads:       null,   // ads book entries
    memoryLog: [],     // array of insight strings
    postLog:   [],     // published post entries
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
    addMemoryLog: (insight) => {
      state = { ...state, memoryLog: [...state.memoryLog, insight] };
      notify();
    },
    addPostLog: (post) => {
      state = { ...state, postLog: [...state.postLog, post] };
      notify();
    },
    subscribe: (fn) => {
      listeners.push(fn);
      return () => { listeners = listeners.filter(l => l !== fn); };
    },
  };
};

export const store = createMemoryStore();

/**
 * ActivityTypes.js
 * Spesifikasi tipe aktivitas sesuai ACTIVITY_CONTRACT_GAMEFACE.md
 */

export const DOMAINS = Object.freeze([
  'system',
  'conversation',
  'research',
  'memory',
  'rag',
  'tool',
  'engineering',
  'verification',
  'workspace'
]);

export const STATUSES = Object.freeze([
  'pending',
  'running',
  'success',
  'failed',
  'cancelled',
  'unknown'
]);

export const ROOMS = Object.freeze([
  'command',
  'research',
  'memory',
  'engineer',
  'knowledge',
  'alert',
  'lounge'
]);

export const AVATAR_STATES = Object.freeze([
  'idle',
  'walking',
  'thinking',
  'reading',
  'researching',
  'coding',
  'storing',
  'alert',
  'success',
  'relaxing',
  'sleeping',
  'surprised'
]);

export const PRIORITIES = Object.freeze([
  'owner',
  'critical',
  'high',
  'normal',
  'low'
]);

export const ROOM_BY_DOMAIN = Object.freeze({
  system: 'command',
  workspace: 'command',
  conversation: 'command',
  research: 'research',
  rag: 'research',
  memory: 'memory',
  engineering: 'engineer',
  verification: 'engineer',
  tool: 'research'
});

export const STATE_BY_STATUS = Object.freeze({
  pending: 'thinking',
  running: 'thinking',
  success: 'success',
  failed: 'alert',
  cancelled: 'idle',
  unknown: 'idle'
});

export const ROOM_DEFINITIONS = Object.freeze({
  command: {
    id: 'command',
    label: 'Command Center',
    sublabel: 'Status, Routing & Owner Control',
    color: '#57d7e6',
    x: 180,
    y: 190,
    w: 240,
    h: 170
  },
  research: {
    id: 'research',
    label: 'Research Room',
    sublabel: 'RAG, Documents & Knowledge Synthesis',
    color: '#c89cff',
    x: 480,
    y: 190,
    w: 240,
    h: 170
  },
  engineer: {
    id: 'engineer',
    label: 'Engineer Room',
    sublabel: 'Runtime, Code Execution & Build',
    color: '#ffd479',
    x: 780,
    y: 190,
    w: 240,
    h: 170
  },
  memory: {
    id: 'memory',
    label: 'Memory Room',
    sublabel: 'User Preferences & Truth Graph',
    color: '#72e6a1',
    x: 210,
    y: 465,
    w: 220,
    h: 150
  },
  lounge: {
    id: 'lounge',
    label: 'Pantry & Break Lounge',
    sublabel: 'Coffee, Rest, Sleeping & Small Talks',
    color: '#ff9fc7',
    x: 480,
    y: 465,
    w: 210,
    h: 150
  },
  knowledge: {
    id: 'knowledge',
    label: 'Knowledge Graph Room',
    sublabel: 'Relations, Entity Clusters & Insights',
    color: '#7db8ff',
    x: 750,
    y: 465,
    w: 220,
    h: 150
  },
  alert: {
    id: 'alert',
    label: 'Alert & Incident Area',
    sublabel: 'Verification Failures & Critical Warnings',
    color: '#ff7f88',
    x: 480,
    y: 320,
    w: 180,
    h: 90
  }
});

export const WORKSPACE_DEFINITIONS = Object.freeze({
  global: {
    id: 'global',
    name: 'Global OS',
    badge: '🌐 Global OS',
    color: '#57d7e6',
    capabilities: ['cap:core-apps', 'cap:settings', 'cap:observability'],
    permissions: { read_scope: 'all', write_scope: 'all', tools_access: 'full' },
    activeRooms: ['command', 'research', 'engineer', 'memory', 'lounge', 'knowledge'],
    activeAgents: ['mamet', 'engineer', 'researcher', 'archivist', 'tokensaver'],
    primaryAgent: 'mamet',
    description: 'Mode Observabilitas Global: Seluruh 5 pekerja dan seluruh ruangan aktif berkolaborasi.'
  },
  'ws-assistant': {
    id: 'ws-assistant',
    name: 'Assistant Workspace',
    badge: '👑 Assistant WS',
    color: '#57d7e6',
    capabilities: ['cap:core-apps'],
    permissions: { read_scope: 'all', write_scope: 'all', tools_access: 'full' },
    activeRooms: ['command', 'lounge'],
    activeAgents: ['mamet', 'tokensaver'],
    primaryAgent: 'mamet',
    description: 'Workspace Asisten Utama: Dialog interaktif dengan Owner, orkestrasi pipeline & delegasi tugas.'
  },
  'ws-engineer': {
    id: 'ws-engineer',
    name: 'Engineer Workspace',
    badge: '💻 Engineer WS',
    color: '#ffd479',
    capabilities: ['cap:engineer'],
    permissions: { read_scope: 'all', write_scope: 'engineering_only', tools_access: 'engineer_only' },
    activeRooms: ['engineer', 'lounge'],
    activeAgents: ['engineer', 'tokensaver'],
    primaryAgent: 'engineer',
    description: 'Workspace Rekayasa Kode: Eksekusi terminal, runtime build & verifikasi pengujian modul.'
  },
  'ws-knowledge': {
    id: 'ws-knowledge',
    name: 'Knowledge Workspace',
    badge: '📚 Knowledge WS',
    color: '#c89cff',
    capabilities: ['cap:knowledge'],
    permissions: { read_scope: 'all', write_scope: 'knowledge_only', tools_access: 'rag_memory' },
    activeRooms: ['research', 'memory', 'knowledge', 'lounge'],
    activeAgents: ['researcher', 'archivist', 'tokensaver'],
    primaryAgent: 'researcher',
    description: 'Workspace Pengetahuan & Memori: Sintesis dokumen RAG, Memory Vault & Truth Graph.'
  },
  'ws-lite': {
    id: 'ws-lite',
    name: 'Lite Workspace',
    badge: '⚡ Lite WS',
    color: '#ff9fc7',
    capabilities: ['cap:lite'],
    permissions: { read_scope: 'essential', write_scope: 'limited', tools_access: 'minimal' },
    activeRooms: ['lounge'],
    activeAgents: ['tokensaver'],
    primaryAgent: 'tokensaver',
    description: 'Workspace Hemat Sumber Daya: Kurir dokumen minimalis, efisiensi token & pantry lounge.'
  }
});


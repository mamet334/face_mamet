/**
 * ActivityTypes.js
 * Definisi tipe aktivitas, domain, ruangan, dan Workspace Definitions untuk 3D Living Office Engine
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
  conversation: 'command',
  research: 'research',
  rag: 'research',
  engineering: 'engineer',
  tool: 'engineer',
  memory: 'memory',
  verification: 'command',
  workspace: 'command'
});

export const AVATAR_BY_DOMAIN = Object.freeze({
  system: 'mamet',
  conversation: 'mamet',
  research: 'researcher',
  rag: 'researcher',
  engineering: 'engineer',
  tool: 'engineer',
  memory: 'archivist',
  verification: 'mamet',
  workspace: 'mamet'
});

export const AGENT_SPECS = Object.freeze({
  mamet: {
    id: 'mamet',
    name: 'Mamet',
    role: 'Orchestrator & Lead',
    room: 'command',
    color: '#3b82f6', // Navy/Blue
    shirtColor: 0x2563eb,
    pantsColor: 0x1e293b,
    hairColor: 0x18181b,
    description: 'Memimpin koordinasi dan orchestrator seluruh sub-agen'
  },
  engineer: {
    id: 'engineer',
    name: 'The Engineer',
    role: 'Code & Execution',
    room: 'engineer',
    color: '#8b5cf6', // Violet
    shirtColor: 0x7c3aed,
    pantsColor: 0x334155,
    hairColor: 0x475569,
    description: 'Menulis patch kode, menjalankan terminal, dan verifikasi pipeline'
  },
  researcher: {
    id: 'researcher',
    name: 'The Researcher',
    role: 'RAG & Analysis',
    room: 'research',
    color: '#06b6d4', // Cyan
    shirtColor: 0x0891b2,
    pantsColor: 0x1e293b,
    hairColor: 0x854d0e,
    description: 'Menganalisis dokumen, embedding RAG, dan sintesis data'
  },
  archivist: {
    id: 'archivist',
    name: 'The Archivist',
    role: 'Memory Vault Specialist',
    room: 'memory',
    color: '#10b981', // Emerald
    shirtColor: 0x059669,
    pantsColor: 0x334155,
    hairColor: 0x292524,
    description: 'Menjaga database memori, preferensi user, dan knowledge graph'
  },
  tokensaver: {
    id: 'tokensaver',
    name: 'TokenSaver',
    role: 'Courier & Optimizer',
    room: 'command',
    color: '#f59e0b', // Amber/Orange
    shirtColor: 0xd97706,
    pantsColor: 0x0f172a,
    hairColor: 0xb45309,
    description: 'Membawa berkas antar meja secara fisik untuk efisiensi token'
  }
});

export const WORKSPACE_DEFINITIONS = Object.freeze({
  global: {
    id: 'global',
    name: 'Global Workspace',
    description: 'Akses penuh ke seluruh departemen, tools, dan agen',
    activeAgents: ['mamet', 'engineer', 'researcher', 'archivist', 'tokensaver'],
    activeRooms: ['command', 'research', 'engineer', 'memory', 'lounge'],
    color: '#3b82f6',
    icon: '🌐'
  },
  'ws-assistant': {
    id: 'ws-assistant',
    name: 'Assistant Mode',
    description: 'Fokus percakapan, koordinasi umum, dan penalaran cepat',
    activeAgents: ['mamet', 'researcher', 'tokensaver'],
    activeRooms: ['command', 'research', 'lounge'],
    color: '#06b6d4',
    icon: '💬'
  },
  'ws-engineer': {
    id: 'ws-engineer',
    name: 'Engineer Studio',
    description: 'Spesialisasi coding, terminal execute, dan git patch',
    activeAgents: ['engineer', 'mamet', 'tokensaver'],
    activeRooms: ['engineer', 'command', 'lounge'],
    color: '#8b5cf6',
    icon: '⚡'
  },
  'ws-knowledge': {
    id: 'ws-knowledge',
    name: 'Knowledge & Vault',
    description: 'Riset mendalam, RAG embeddings, dan memori permanen',
    activeAgents: ['researcher', 'archivist', 'mamet', 'tokensaver'],
    activeRooms: ['research', 'memory', 'command', 'lounge'],
    color: '#10b981',
    icon: '🧠'
  },
  'ws-lite': {
    id: 'ws-lite',
    name: 'Lite Efficiency',
    description: 'Mode hemat token dan respon kilat tanpa deep research',
    activeAgents: ['mamet', 'tokensaver'],
    activeRooms: ['command', 'lounge'],
    color: '#f59e0b',
    icon: '🍃'
  }
});

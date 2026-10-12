const ROOM_BY_DOMAIN = { system: 'command', workspace: 'command', research: 'research', rag: 'research', memory: 'memory', engineering: 'engineer', verification: 'engineer', tool: 'research' };
const STATE_BY_STATUS = { pending: 'thinking', running: 'thinking', success: 'success', failed: 'alert', cancelled: 'idle', unknown: 'idle' };
function normalizeActivity(event) {
  if (!event || !event.eventType) return null;
  const status = event.status || 'unknown';
  return { ...event, domain: event.domain || 'system', status, targetRoom: event.targetRoom || (status === 'failed' ? 'alert' : ROOM_BY_DOMAIN[event.domain] || 'command'), avatarState: event.avatarState || STATE_BY_STATUS[status] || 'idle' };
}
class ActivityBus {
  constructor() { this.listeners = new Set(); this.seen = new Set(); }
  subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  publish(event) { const activity = normalizeActivity(event); if (!activity) return null; const key = activity.correlationId || `${activity.traceId || activity.id}:${activity.eventType}`; if (this.seen.has(key) && activity.status === 'running') return null; this.seen.add(key); this.listeners.forEach(listener => listener(activity)); return activity; }
}
const bus = new ActivityBus();
const received = [];
bus.subscribe(activity => received.push(activity));
[
  { id: 'boot-1', eventType: 'Kernel:BootComplete', domain: 'system', status: 'success', message: 'Mamet siap digunakan' },
  { id: 'r-1', eventType: 'RAG.Start', domain: 'rag', status: 'running', correlationId: 'trace-r' },
  { id: 'r-1', eventType: 'RAG.Start', domain: 'rag', status: 'running', correlationId: 'trace-r' },
  { id: 'r-2', eventType: 'RAG.Retrieval.End', domain: 'rag', status: 'success', correlationId: 'trace-r' },
  { id: 'v-1', eventType: 'Verification.Fail', domain: 'verification', status: 'failed', message: 'Verifikasi membutuhkan perhatian Owner' }
].forEach(event => bus.publish(event));
const checks = [
  ['event diterima', received.length === 4],
  ['duplikasi running diabaikan', received.filter(x => x.eventType === 'RAG.Start').length === 1],
  ['research menuju research room', received.find(x => x.eventType === 'RAG.Start').targetRoom === 'research'],
  ['error menuju alert', received.find(x => x.eventType === 'Verification.Fail').targetRoom === 'alert'],
  ['success memiliki state success', received.find(x => x.eventType === 'RAG.Retrieval.End').avatarState === 'success']
];
checks.forEach(([name, ok]) => console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}`));
if (checks.some(([, ok]) => !ok)) process.exitCode = 1;

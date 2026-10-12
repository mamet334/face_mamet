export const ROOM_BY_DOMAIN = {
  system: 'command',
  workspace: 'command',
  conversation: 'command',
  research: 'research',
  rag: 'research',
  memory: 'memory',
  engineering: 'engineer',
  verification: 'engineer',
  tool: 'research'
};

export const STATE_BY_STATUS = {
  pending: 'thinking',
  running: 'thinking',
  success: 'success',
  failed: 'alert',
  cancelled: 'idle',
  unknown: 'idle'
};

export function normalizeActivity(sourceEvent) {
  if (!sourceEvent || !sourceEvent.eventType) return null;
  const domain = sourceEvent.domain || 'system';
  const status = sourceEvent.status || 'unknown';
  return {
    id: sourceEvent.id || `activity-${Date.now()}`,
    eventType: sourceEvent.eventType,
    source: sourceEvent.source || 'fixture',
    domain,
    status,
    priority: sourceEvent.priority || (status === 'failed' ? 'high' : 'normal'),
    targetRoom: sourceEvent.targetRoom || (status === 'failed' ? 'alert' : ROOM_BY_DOMAIN[domain] || 'command'),
    avatarState: sourceEvent.avatarState || STATE_BY_STATUS[status] || 'idle',
    message: sourceEvent.message || 'Aktivitas Mamet',
    timestamp: sourceEvent.timestamp || new Date().toISOString(),
    traceId: sourceEvent.traceId || null,
    correlationId: sourceEvent.correlationId || null,
    metadata: sourceEvent.metadata || {},
    visibility: sourceEvent.visibility || 'owner'
  };
}

export class ActivityBus {
  constructor() {
    this.listeners = new Set();
    this.seen = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  publish(sourceEvent) {
    const activity = normalizeActivity(sourceEvent);
    if (!activity) return null;
    const dedupeKey = activity.correlationId || `${activity.traceId || activity.id}:${activity.eventType}`;
    if (this.seen.has(dedupeKey) && activity.status === 'running') return null;
    this.seen.add(dedupeKey);
    this.listeners.forEach(listener => listener(activity));
    return activity;
  }
}

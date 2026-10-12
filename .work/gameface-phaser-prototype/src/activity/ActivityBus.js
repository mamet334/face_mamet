/**
 * ActivityBus.js
 * Event Bus Aktivitas ternormalisasi dengan deduplikasi dan prioritas visual
 */
import {
  ROOM_BY_DOMAIN,
  STATE_BY_STATUS,
  DOMAINS,
  STATUSES,
  ROOMS,
  AVATAR_STATES
} from './ActivityTypes.js';

export function normalizeActivity(event) {
  if (!event || (!event.eventType && !event.id)) {
    return null;
  }

  const status = STATUSES.includes(event.status) ? event.status : 'unknown';
  const domain = DOMAINS.includes(event.domain) ? event.domain : 'system';
  
  // Default target room & avatar state
  let targetRoom = event.targetRoom;
  if (!ROOMS.includes(targetRoom)) {
    targetRoom = status === 'failed' ? 'alert' : (ROOM_BY_DOMAIN[domain] || 'command');
  }

  let avatarState = event.avatarState;
  if (!AVATAR_STATES.includes(avatarState)) {
    if (domain === 'engineering' && status === 'running') {
      avatarState = 'coding';
    } else if (domain === 'research' && status === 'running') {
      avatarState = 'researching';
    } else if (domain === 'memory' && status === 'running') {
      avatarState = 'storing';
    } else {
      avatarState = STATE_BY_STATUS[status] || 'idle';
    }
  }

  return {
    id: event.id || `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    eventType: event.eventType || 'System:GenericActivity',
    source: event.source || 'runtime',
    domain,
    status,
    priority: event.priority || (status === 'failed' ? 'high' : 'normal'),
    targetRoom,
    avatarState,
    targetAgent: event.targetAgent || null,
    message: event.message || (status === 'running' ? 'Memproses aktivitas...' : 'Aktivitas siap.'),
    timestamp: event.timestamp || new Date().toISOString(),
    correlationId: event.correlationId || null,
    traceId: event.traceId || null,
    metadata: event.metadata || {}
  };
}

export class ActivityBus {
  constructor() {
    this.listeners = new Set();
    this.seen = new Map(); // key -> last seen timestamp
    this.history = [];
    this.maxHistory = 100;
  }

  subscribe(listener) {
    if (typeof listener !== 'function') throw new Error('Listener must be a function');
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getDedupKey(activity) {
    if (activity.correlationId) return `corr:${activity.correlationId}:${activity.status}`;
    if (activity.traceId) return `trace:${activity.traceId}:${activity.eventType}:${activity.status}`;
    return `id:${activity.id}:${activity.status}`;
  }

  publish(event) {
    const activity = normalizeActivity(event);
    if (!activity) return null;

    const key = this.getDedupKey(activity);
    const now = Date.now();
    const lastSeen = this.seen.get(key);

    // Filter duplicate if same status within 1500ms
    if (lastSeen && (now - lastSeen < 1500)) {
      return null;
    }
    this.seen.set(key, now);

    // Prune seen cache if too large
    if (this.seen.size > 200) {
      const threshold = now - 30000;
      for (const [k, time] of this.seen.entries()) {
        if (time < threshold) this.seen.delete(k);
      }
    }

    // Record history
    this.history.unshift(activity);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener(activity);
      } catch (err) {
        console.error('[ActivityBus] Error in listener:', err);
      }
    });

    return activity;
  }

  getHistory() {
    return [...this.history];
  }

  clearHistory() {
    this.history = [];
    this.seen.clear();
  }
}

export const defaultActivityBus = new ActivityBus();

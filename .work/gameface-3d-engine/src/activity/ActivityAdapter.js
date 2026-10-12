/**
 * ActivityAdapter.js
 * Menormalkan sinyal aktivitas menjadi format standar visual GameFace 3D
 */

import { ROOM_BY_DOMAIN, AVATAR_BY_DOMAIN } from './ActivityTypes.js';

export class ActivityAdapter {
  constructor(activityBus) {
    this.bus = activityBus;
  }

  normalize(rawEvent) {
    if (!rawEvent) return null;

    const id = rawEvent.id || `act-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const domain = rawEvent.domain || 'system';
    const status = rawEvent.status || 'running';
    const targetRoom = rawEvent.targetRoom || ROOM_BY_DOMAIN[domain] || 'command';
    const targetAgent = rawEvent.targetAgent || AVATAR_BY_DOMAIN[domain] || 'mamet';
    const message = rawEvent.message || `Aktivitas di ruang ${targetRoom}`;
    const priority = rawEvent.priority || 'normal';

    let avatarState = 'thinking';
    if (domain === 'engineering' || domain === 'tool') {
      avatarState = 'coding';
    } else if (domain === 'research' || domain === 'rag') {
      avatarState = 'researching';
    } else if (domain === 'memory') {
      avatarState = 'storing';
    } else if (status === 'success') {
      avatarState = 'success';
    } else if (status === 'failed') {
      avatarState = 'alert';
    }

    return {
      id,
      domain,
      status,
      targetRoom,
      targetAgent,
      avatarState,
      message,
      priority,
      timestamp: Date.now()
    };
  }

  processAndEmit(rawEvent) {
    const normalized = this.normalize(rawEvent);
    if (normalized) {
      this.bus.emit('activity:received', normalized);
      this.bus.emit(`room:${normalized.targetRoom}:active`, normalized);
      this.bus.emit(`agent:${normalized.targetAgent}:active`, normalized);
    }
    return normalized;
  }
}

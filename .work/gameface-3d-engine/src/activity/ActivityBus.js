/**
 * ActivityBus.js
 * Visual Event Bus untuk GameFace 3D Engine
 * Mengalirkan event ternormalisasi ke Scene 3D & HUD tanpa dependensi audio
 */

export class ActivityBus {
  constructor(options = {}) {
    this.listeners = new Map(); // eventName -> Set of callbacks
    this.history = [];
    this.maxHistory = options.maxHistory || 50;
    this.quietMode = false;
    this.cooldownMs = options.cooldownMs || 100;
    this.lastEmitted = new Map(); // key -> timestamp
  }

  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);
    return () => this.off(eventName, callback);
  }

  off(eventName, callback) {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).delete(callback);
    }
  }

  emit(eventName, payload) {
    // Cooldown check untuk deduplikasi event yang sama beruntun
    const now = Date.now();
    const dedupeKey = `${eventName}:${payload?.id || payload?.domain || ''}`;
    const lastTime = this.lastEmitted.get(dedupeKey) || 0;
    if (now - lastTime < this.cooldownMs) {
      return false;
    }
    this.lastEmitted.set(dedupeKey, now);

    // Rekam history
    if (payload) {
      this.history.unshift({
        eventName,
        payload,
        timestamp: now
      });
      if (this.history.length > this.maxHistory) {
        this.history.pop();
      }
    }

    // Panggil listener
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`[ActivityBus] Error in callback for ${eventName}:`, err);
        }
      });
    }

    // Panggil wildcard/any listener jika ada
    const anyCallbacks = this.listeners.get('*');
    if (anyCallbacks) {
      anyCallbacks.forEach(cb => {
        try {
          cb({ eventName, payload });
        } catch (err) {
          console.error(`[ActivityBus] Error in wildcard callback:`, err);
        }
      });
    }

    return true;
  }

  getHistory() {
    return [...this.history];
  }

  setQuietMode(quiet) {
    this.quietMode = !!quiet;
  }
}

export const globalActivityBus = new ActivityBus();

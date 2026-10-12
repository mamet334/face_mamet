/**
 * EventBus.js
 * Bridge komunikasi dua arah antara React (HUD/UI) dan Phaser (Game Canvas)
 */

class GameEventBus {
  constructor() {
    this.events = new Map();
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
    }
  }

  emit(event, ...args) {
    if (this.events.has(event)) {
      this.events.get(event).forEach((cb) => {
        try {
          cb(...args);
        } catch (err) {
          console.error(`[GameEventBus] Error in listener for event "${event}":`, err);
        }
      });
    }
  }

  destroy() {
    this.events.clear();
  }
}

export const EventBus = new GameEventBus();

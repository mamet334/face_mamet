/**
 * AvatarStateMachine.js
 * FSM multi-agent human squad untuk 3D Living Office Engine
 */

export const AVATAR_STATE_ENUM = Object.freeze({
  IDLE: 'idle',
  WALKING: 'walking',
  THINKING: 'thinking',
  CODING: 'coding',
  RESEARCHING: 'researching',
  STORING: 'storing',
  READING: 'reading',
  ALERT: 'alert',
  SUCCESS: 'success',
  RELAXING: 'relaxing',  // Santai / ngopi di lounge
  SLEEPING: 'sleeping',  // Tidur nyenyak di sofa/meja (Zzz)
  SURPRISED: 'surprised' // Kaget bangun saat ada tugas baru (!)
});

const ALLOWED_TRANSITIONS = {
  [AVATAR_STATE_ENUM.IDLE]: [
    AVATAR_STATE_ENUM.WALKING,
    AVATAR_STATE_ENUM.THINKING,
    AVATAR_STATE_ENUM.CODING,
    AVATAR_STATE_ENUM.RESEARCHING,
    AVATAR_STATE_ENUM.STORING,
    AVATAR_STATE_ENUM.ALERT,
    AVATAR_STATE_ENUM.RELAXING,
    AVATAR_STATE_ENUM.SLEEPING
  ],
  [AVATAR_STATE_ENUM.RELAXING]: [
    AVATAR_STATE_ENUM.SLEEPING,
    AVATAR_STATE_ENUM.SURPRISED,
    AVATAR_STATE_ENUM.WALKING,
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.CODING,
    AVATAR_STATE_ENUM.RESEARCHING,
    AVATAR_STATE_ENUM.STORING
  ],
  [AVATAR_STATE_ENUM.SLEEPING]: [
    AVATAR_STATE_ENUM.SURPRISED,
    AVATAR_STATE_ENUM.WALKING,
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.ALERT
  ],
  [AVATAR_STATE_ENUM.SURPRISED]: [
    AVATAR_STATE_ENUM.WALKING,
    AVATAR_STATE_ENUM.CODING,
    AVATAR_STATE_ENUM.RESEARCHING,
    AVATAR_STATE_ENUM.STORING,
    AVATAR_STATE_ENUM.ALERT,
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.THINKING
  ],
  [AVATAR_STATE_ENUM.WALKING]: [
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.THINKING,
    AVATAR_STATE_ENUM.CODING,
    AVATAR_STATE_ENUM.RESEARCHING,
    AVATAR_STATE_ENUM.STORING,
    AVATAR_STATE_ENUM.ALERT,
    AVATAR_STATE_ENUM.RELAXING,
    AVATAR_STATE_ENUM.SLEEPING
  ],
  [AVATAR_STATE_ENUM.THINKING]: [
    AVATAR_STATE_ENUM.WALKING,
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.CODING,
    AVATAR_STATE_ENUM.RESEARCHING,
    AVATAR_STATE_ENUM.STORING,
    AVATAR_STATE_ENUM.SUCCESS,
    AVATAR_STATE_ENUM.ALERT
  ],
  [AVATAR_STATE_ENUM.CODING]: [
    AVATAR_STATE_ENUM.WALKING,
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.SUCCESS,
    AVATAR_STATE_ENUM.ALERT
  ],
  [AVATAR_STATE_ENUM.RESEARCHING]: [
    AVATAR_STATE_ENUM.WALKING,
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.SUCCESS,
    AVATAR_STATE_ENUM.ALERT
  ],
  [AVATAR_STATE_ENUM.STORING]: [
    AVATAR_STATE_ENUM.WALKING,
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.SUCCESS,
    AVATAR_STATE_ENUM.ALERT
  ],
  [AVATAR_STATE_ENUM.ALERT]: [
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.WALKING,
    AVATAR_STATE_ENUM.THINKING,
    AVATAR_STATE_ENUM.CODING
  ],
  [AVATAR_STATE_ENUM.SUCCESS]: [
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.WALKING,
    AVATAR_STATE_ENUM.RELAXING
  ]
};

export class AvatarStateMachine {
  constructor(options = {}) {
    this.agentId = options.agentId || 'avatar';
    this.currentState = AVATAR_STATE_ENUM.IDLE;
    this.previousState = null;
    this.stateChangedAt = Date.now();
    this.idleDurationMs = 0;
    this.onStateChange = options.onStateChange || null;
    this.autoIdleEnabled = options.autoIdleEnabled !== false;

    // Timer thresholds (dalam detik)
    this.relaxThresholdSec = options.relaxThresholdSec || 10;
    this.sleepThresholdSec = options.sleepThresholdSec || 20;
  }

  getState() {
    return this.currentState;
  }

  canTransitionTo(nextState) {
    if (this.currentState === nextState) return true;
    const allowed = ALLOWED_TRANSITIONS[this.currentState];
    return allowed ? allowed.includes(nextState) : false;
  }

  transitionTo(nextState, metadata = {}) {
    if (this.currentState === nextState) return true;

    // Jika sedang santai atau tidur dan tugas baru masuk -> harus lewat SURPRISED
    if (
      (this.currentState === AVATAR_STATE_ENUM.RELAXING || this.currentState === AVATAR_STATE_ENUM.SLEEPING) &&
      nextState !== AVATAR_STATE_ENUM.SURPRISED &&
      nextState !== AVATAR_STATE_ENUM.IDLE &&
      nextState !== AVATAR_STATE_ENUM.SLEEPING
    ) {
      this.executeTransition(AVATAR_STATE_ENUM.SURPRISED, { triggeredBy: nextState, ...metadata });
      return true;
    }

    if (!this.canTransitionTo(nextState)) {
      console.warn(`[AvatarStateMachine:${this.agentId}] Invalid transition from ${this.currentState} to ${nextState}`);
      return false;
    }

    return this.executeTransition(nextState, metadata);
  }

  executeTransition(nextState, metadata = {}) {
    this.previousState = this.currentState;
    this.currentState = nextState;
    this.stateChangedAt = Date.now();
    this.idleDurationMs = 0;

    if (typeof this.onStateChange === 'function') {
      try {
        this.onStateChange({
          agentId: this.agentId,
          from: this.previousState,
          to: this.currentState,
          metadata
        });
      } catch (err) {
        console.error(`[AvatarStateMachine:${this.agentId}] Error in onStateChange callback:`, err);
      }
    }
    return true;
  }

  resetIdle() {
    this.stateChangedAt = Date.now();
    this.idleDurationMs = 0;
    if (this.currentState === AVATAR_STATE_ENUM.RELAXING || this.currentState === AVATAR_STATE_ENUM.SLEEPING) {
      this.transitionTo(AVATAR_STATE_ENUM.IDLE);
    }
  }

  update(deltaSeconds) {
    if (!this.autoIdleEnabled) return;

    if (this.currentState === AVATAR_STATE_ENUM.IDLE) {
      this.idleDurationMs += deltaSeconds * 1000;
      if (this.idleDurationMs >= this.relaxThresholdSec * 1000) {
        this.transitionTo(AVATAR_STATE_ENUM.RELAXING);
      }
    } else if (this.currentState === AVATAR_STATE_ENUM.RELAXING) {
      this.idleDurationMs += deltaSeconds * 1000;
      if (this.idleDurationMs >= this.sleepThresholdSec * 1000) {
        this.transitionTo(AVATAR_STATE_ENUM.SLEEPING);
      }
    } else if (this.currentState === AVATAR_STATE_ENUM.SURPRISED) {
      // Kembali ke IDLE atau target setelah 1.2 detik
      const elapsed = Date.now() - this.stateChangedAt;
      if (elapsed > 1200) {
        this.transitionTo(AVATAR_STATE_ENUM.IDLE);
      }
    }
  }
}

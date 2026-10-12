/**
 * AvatarStateMachine.js
 * Finite State Machine (FSM) formal untuk Mamet Avatar & Tim Multi-Agent
 * Mengendalikan transisi, validasi state, perilaku santai/tidur (idle behavior), dan sinkronisasi ke React HUD
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
  RELAXING: 'relaxing', // Sedang santai/ngopi/stretching
  SLEEPING: 'sleeping', // Sedang tidur nyenyak di meja/sofa (Zzz)
  SURPRISED: 'surprised' // Kaget terbangun saat ada instruksi tugas baru (!)
});

// Matriks transisi yang diizinkan untuk mencegah bug animasi macet
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
    AVATAR_STATE_ENUM.IDLE
  ],
  [AVATAR_STATE_ENUM.WALKING]: [
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.THINKING,
    AVATAR_STATE_ENUM.CODING,
    AVATAR_STATE_ENUM.RESEARCHING,
    AVATAR_STATE_ENUM.STORING,
    AVATAR_STATE_ENUM.ALERT,
    AVATAR_STATE_ENUM.SUCCESS,
    AVATAR_STATE_ENUM.RELAXING
  ],
  [AVATAR_STATE_ENUM.THINKING]: [
    AVATAR_STATE_ENUM.WALKING,
    AVATAR_STATE_ENUM.CODING,
    AVATAR_STATE_ENUM.RESEARCHING,
    AVATAR_STATE_ENUM.STORING,
    AVATAR_STATE_ENUM.ALERT,
    AVATAR_STATE_ENUM.SUCCESS,
    AVATAR_STATE_ENUM.IDLE
  ],
  [AVATAR_STATE_ENUM.CODING]: [
    AVATAR_STATE_ENUM.WALKING,
    AVATAR_STATE_ENUM.ALERT,
    AVATAR_STATE_ENUM.SUCCESS,
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.RELAXING
  ],
  [AVATAR_STATE_ENUM.RESEARCHING]: [
    AVATAR_STATE_ENUM.WALKING,
    AVATAR_STATE_ENUM.ALERT,
    AVATAR_STATE_ENUM.SUCCESS,
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.RELAXING
  ],
  [AVATAR_STATE_ENUM.STORING]: [
    AVATAR_STATE_ENUM.WALKING,
    AVATAR_STATE_ENUM.ALERT,
    AVATAR_STATE_ENUM.SUCCESS,
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.RELAXING
  ],
  [AVATAR_STATE_ENUM.READING]: [
    AVATAR_STATE_ENUM.WALKING,
    AVATAR_STATE_ENUM.ALERT,
    AVATAR_STATE_ENUM.SUCCESS,
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.RELAXING
  ],
  [AVATAR_STATE_ENUM.ALERT]: [
    AVATAR_STATE_ENUM.WALKING,
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.THINKING
  ],
  [AVATAR_STATE_ENUM.SUCCESS]: [
    AVATAR_STATE_ENUM.IDLE,
    AVATAR_STATE_ENUM.RELAXING,
    AVATAR_STATE_ENUM.WALKING
  ]
};

export class AvatarStateMachine {
  constructor(initialState = AVATAR_STATE_ENUM.IDLE, options = {}) {
    this.currentState = initialState;
    this.previousState = null;
    this.currentRoom = options.room || 'command';
    this.targetRoom = options.room || 'command';
    this.agentId = options.agentId || 'avatar';
    this.activeActivity = null;
    this.listeners = new Set();
    this.stateTimer = 0;
    this.idleDuration = 0;
    this.autoIdleBehaviors = options.autoIdleBehaviors !== false;
  }

  subscribe(listener) {
    if (typeof listener !== 'function') throw new Error('Listener must be a function');
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, data) {
    this.listeners.forEach((listener) => {
      try {
        listener(event, { ...data, agentId: this.agentId });
      } catch (err) {
        console.error('[AvatarStateMachine] Error in listener:', err);
      }
    });
  }

  canTransitionTo(nextState) {
    if (nextState === this.currentState) return true;
    const allowed = ALLOWED_TRANSITIONS[this.currentState];
    return allowed ? allowed.includes(nextState) : true;
  }

  transitionTo(nextState, context = {}) {
    if (nextState === this.currentState && !context.force) {
      return false;
    }

    if (!this.canTransitionTo(nextState) && !context.force) {
      console.warn(`[AvatarStateMachine] [${this.agentId}] Invalid transition from ${this.currentState} to ${nextState}`);
      return false;
    }

    const prevState = this.currentState;
    this.previousState = prevState;
    this.currentState = nextState;
    this.stateTimer = 0;

    // Reset idle timer jika kembali bekerja/berjalan
    if (![AVATAR_STATE_ENUM.IDLE, AVATAR_STATE_ENUM.RELAXING, AVATAR_STATE_ENUM.SLEEPING].includes(nextState)) {
      this.idleDuration = 0;
    }

    if (context.room) {
      this.currentRoom = context.room;
    }
    if (context.targetRoom) {
      this.targetRoom = context.targetRoom;
    }
    if (context.activity !== undefined) {
      this.activeActivity = context.activity;
    }

    const payload = {
      from: prevState,
      to: nextState,
      currentRoom: this.currentRoom,
      targetRoom: this.targetRoom,
      activity: this.activeActivity,
      context
    };

    this.notify('transition', payload);
    return true;
  }

  wakeUp(nextState, context = {}, callback) {
    if (this.currentState === AVATAR_STATE_ENUM.SLEEPING || this.currentState === AVATAR_STATE_ENUM.RELAXING) {
      this.transitionTo(AVATAR_STATE_ENUM.SURPRISED, context);
      setTimeout(() => {
        this.transitionTo(nextState, context);
        if (callback) callback();
      }, 550);
      return;
    }

    this.transitionTo(nextState, context);
    if (callback) callback();
  }

  setTargetRoom(roomKey) {
    this.targetRoom = roomKey;
  }

  setCurrentRoom(roomKey) {
    this.currentRoom = roomKey;
    this.notify('roomChanged', { room: roomKey });
  }

  getState() {
    return {
      agentId: this.agentId,
      state: this.currentState,
      previousState: this.previousState,
      currentRoom: this.currentRoom,
      targetRoom: this.targetRoom,
      activeActivity: this.activeActivity
    };
  }

  resetIdle() {
    this.idleDuration = 0;
  }

  update(deltaMs) {
    this.stateTimer += deltaMs;

    if (!this.autoIdleBehaviors) return;

    // Reset idle timer jika agen sedang aktif bekerja, berjalan, atau berpikir
    if (![AVATAR_STATE_ENUM.IDLE, AVATAR_STATE_ENUM.RELAXING].includes(this.currentState)) {
      this.idleDuration = 0;
      return;
    }

    // Logika Otomatis Bersantai & Tidur Saat Menganggur
    if (this.currentState === AVATAR_STATE_ENUM.IDLE) {
      this.idleDuration += deltaMs;
      // Setelah ~8 detik menganggur: agen santai (ngopi / stretching)
      if (this.idleDuration >= 8000) {
        this.transitionTo(AVATAR_STATE_ENUM.RELAXING);
      }
    } else if (this.currentState === AVATAR_STATE_ENUM.RELAXING) {
      this.idleDuration += deltaMs;
      // Setelah ~18 detik menganggur total: agen tertidur nyenyak (Zzz)
      if (this.idleDuration >= 18000) {
        this.transitionTo(AVATAR_STATE_ENUM.SLEEPING);
      }
    }
  }
}

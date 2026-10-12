/**
 * MametAvatar.js
 * Entitas Karakter Manusia (Human Office Squad) dalam Phaser 2D
 * Menggantikan karakter robot dengan tokoh manusia unik, lengkap dengan busana, rambut, ekspresi, dan pose santai/tidur.
 */
import { AvatarStateMachine, AVATAR_STATE_ENUM } from '../state/AvatarStateMachine.js';
import { EventBus } from '../EventBus.js';

const HUMAN_PROFILES = {
  mamet: {
    name: 'Mamet Lead',
    role: 'Team Lead',
    skinColor: 0xffd5b8,
    hairColor: 0x241711, // Dark brown
    hairStyle: 'neat',
    shirtColor: 0x3a829e, // Blue formal shirt
    pantsColor: 0x16222f,
    accentColor: 0x57d7e6, // Cyan
    hasGlasses: false,
    hasLanyard: true,
    hasHeadphone: false
  },
  engineer: {
    name: 'Engineer',
    role: 'Developer',
    skinColor: 0xfed0b2,
    hairColor: 0x3d2819, // Messy brown hair
    hairStyle: 'messy',
    shirtColor: 0xd99b26, // Amber hoodie
    pantsColor: 0x22303d,
    accentColor: 0xffd479,
    hasGlasses: true,
    hasLanyard: false,
    hasHeadphone: true
  },
  researcher: {
    name: 'Researcher',
    role: 'RAG Analyst',
    skinColor: 0xffe0c8,
    hairColor: 0x5a2d24, // Auburn ponytail
    hairStyle: 'ponytail',
    shirtColor: 0x8a5cb8, // Purple cardigan
    pantsColor: 0x251c33,
    accentColor: 0xc89cff,
    hasGlasses: true,
    hasLanyard: false,
    hasHeadphone: false
  },
  archivist: {
    name: 'Archivist',
    role: 'Memory Keeper',
    skinColor: 0xfcd4b7,
    hairColor: 0x1a211e, // Dark neat hair
    hairStyle: 'neat',
    shirtColor: 0x3d8c65, // Mint green vest
    pantsColor: 0x1b2d23,
    accentColor: 0x72e6a1,
    hasGlasses: false,
    hasLanyard: true,
    hasHeadphone: false
  },
  tokensaver: {
    name: 'TokenSaver',
    role: 'Courier Intern',
    skinColor: 0xffd8be,
    hairColor: 0x362116,
    hairStyle: 'cap', // Wears snapback cap
    shirtColor: 0xcc527a, // Pink/Coral jacket
    pantsColor: 0x1f2733,
    accentColor: 0xff9fc7,
    hasGlasses: false,
    hasLanyard: false,
    hasHeadphone: false
  }
};

const STATE_COLORS = {
  idle: 0x57d7e6,
  walking: 0x57d7e6,
  thinking: 0xc89cff,
  reading: 0xc89cff,
  researching: 0xc89cff,
  coding: 0xffd479,
  storing: 0x72e6a1,
  alert: 0xff7f88,
  success: 0x72e6a1,
  relaxing: 0xff9fc7,
  sleeping: 0x7db8ff,
  surprised: 0xffd479
};

const STATE_LABELS = {
  idle: 'READY',
  walking: 'WALKING',
  thinking: 'THINKING',
  reading: 'READING',
  researching: 'RESEARCHING',
  coding: 'CODING',
  storing: 'STORING',
  alert: 'ALERT !',
  success: 'DONE !',
  relaxing: '☕ RELAX',
  sleeping: '😴 Zzz...',
  surprised: '⚡ WAKE UP!'
};

export class MametAvatar {
  constructor(scene, navGraph, startNodeId = 'command_spot', options = {}) {
    this.scene = scene;
    this.navGraph = navGraph;
    this.currentNode = navGraph.getNode(startNodeId);
    this.agentId = options.agentId || 'mamet';
    this.profile = HUMAN_PROFILES[this.agentId] || HUMAN_PROFILES.mamet;
    this.agentName = this.profile.name;
    this.roleColor = this.profile.accentColor;
    this.homeSpot = startNodeId;

    this.fsm = new AvatarStateMachine(AVATAR_STATE_ENUM.IDLE, {
      agentId: this.agentId,
      room: this.currentNode?.roomSpot || 'command',
      autoIdleBehaviors: options.autoIdleBehaviors !== false
    });
    
    this.moveSpeed = 150;
    this.currentPath = [];
    this.targetActivity = null;
    this.isCarryingFile = false;
    this.carriedFileName = '';

    const startX = this.currentNode ? this.currentNode.x : 180;
    const startY = this.currentNode ? this.currentNode.y : 235;
    this.container = scene.add.container(startX, startY);
    this.container.setDepth(30);

    this.createHumanVisuals();
    this.setupFSMListeners();

    // Click to interact
    this.hitZone = this.scene.add.zone(0, -26, 44, 60).setInteractive({ useHandCursor: true });
    this.container.add(this.hitZone);
    this.hitZone.on('pointerdown', () => {
      EventBus.emit('avatarClicked', {
        agentId: this.agentId,
        name: this.agentName,
        role: this.profile.role,
        ...this.fsm.getState()
      });
    });
  }

  createHumanVisuals() {
    // 1. Soft Shadow di lantai
    this.shadow = this.scene.add.ellipse(0, 4, 30, 10, 0x000000, 0.4);
    this.container.add(this.shadow);

    // 2. Container Karakter Manusia
    this.humanBody = this.scene.add.container(0, 0);
    this.container.add(this.humanBody);

    // 3. Graphics untuk merender tubuh manusia ekspresif
    this.bodyGraphics = this.scene.add.graphics();
    this.humanBody.add(this.bodyGraphics);

    // 4. Name Tag di bawah kaki
    this.nameTag = this.scene.add.text(0, 14, this.agentName.toUpperCase(), {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '8px',
      fontStyle: 'bold',
      color: `#${this.roleColor.toString(16).padStart(6, '0')}`
    }).setOrigin(0.5);
    this.container.add(this.nameTag);

    // 5. Overhead Bubble Status
    this.bubbleBg = this.scene.add.graphics();
    this.bubbleText = this.scene.add.text(0, -58, 'READY', {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#57d7e6'
    }).setOrigin(0.5);
    this.container.add([this.bubbleBg, this.bubbleText]);

    // Gambar awal manusia
    this.renderHumanFigure(AVATAR_STATE_ENUM.IDLE);
    this.drawBubble('READY', this.roleColor);

    // Idle Breathing Tween
    this.breathTween = this.scene.tweens.add({
      targets: this.humanBody,
      y: -2.5,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  renderHumanFigure(state) {
    const g = this.bodyGraphics;
    g.clear();
    const p = this.profile;

    const isSleeping = state === AVATAR_STATE_ENUM.SLEEPING;
    const isRelaxing = state === AVATAR_STATE_ENUM.RELAXING;
    const isWorking = ['coding', 'researching', 'storing'].includes(state);
    const isSurprised = state === AVATAR_STATE_ENUM.SURPRISED;

    // A. KAKI & SEPATU
    g.fillStyle(p.pantsColor, 1);
    g.fillRoundedRect(-9, -10, 7, 13, 2); // Kaki kiri
    g.fillRoundedRect(2, -10, 7, 13, 2);  // Kaki kanan

    g.fillStyle(0x0f172a, 1);
    g.fillRoundedRect(-10, 1, 9, 4, 1.5); // Sepatu kiri
    g.fillRoundedRect(1, 1, 9, 4, 1.5);   // Sepatu kanan

    // B. TUBUH / BAJU (Kemeja/Hoodie/Cardigan)
    g.fillStyle(p.shirtColor, 1);
    g.fillRoundedRect(-12, -30, 24, 21, 5); // Torso

    // Detail Pakaian
    if (p.hasLanyard) {
      g.lineStyle(1.5, p.accentColor, 0.9);
      g.beginPath();
      g.moveTo(-4, -28);
      g.lineTo(0, -18);
      g.lineTo(4, -28);
      g.stroke();
      g.fillStyle(0xffffff, 0.95);
      g.fillRect(-3, -18, 6, 8); // Kartu ID card putih
    }

    if (p.hasHeadphone) {
      // Headphone melingkar di leher
      g.lineStyle(2.5, 0x1f2937, 1);
      g.beginPath();
      g.arc(0, -29, 9, 0, Math.PI);
      g.stroke();
      g.fillStyle(p.accentColor, 1);
      g.fillCircle(-8, -26, 3);
      g.fillCircle(8, -26, 3);
    }

    // C. TANGAN & PROPS
    g.fillStyle(p.skinColor, 1);
    if (this.isCarryingFile) {
      // Tangan memegang map berkas (manila folder) fisik di depan dada
      g.fillStyle(p.shirtColor, 1);
      g.fillRoundedRect(-14, -26, 7, 13, 2);
      g.fillRoundedRect(7, -26, 7, 13, 2);

      // Map Berkas Manila Cokelat-Emas
      g.fillStyle(0xd97706, 1); // Warna dasar map
      g.fillRoundedRect(-11, -24, 22, 16, 2);

      // Tab folder di sudut kiri atas map
      g.fillRoundedRect(-11, -27, 9, 4, 1.5);

      // Lembaran kertas dokumen putih di dalam map
      g.fillStyle(0xffffff, 0.95);
      g.fillRect(-8, -23, 16, 13);

      // Garis-garis tulisan dokumen di kertas
      g.fillStyle(0x94a3b8, 0.9);
      g.fillRect(-6, -20, 12, 1.5);
      g.fillRect(-6, -17, 9, 1.5);
      g.fillRect(-6, -14, 11, 1.5);

      // Label tag / pita biru cyan berkas
      g.fillStyle(0x0284c7, 1);
      g.fillRect(-4, -25, 8, 2.5);

      // Telapak tangan memegang kedua sisi tepi map berkas
      g.fillStyle(p.skinColor, 1);
      g.fillCircle(-9, -15, 3.2);
      g.fillCircle(9, -15, 3.2);
    } else if (isSleeping) {
      // Tangan terlipat di dada / menopang kepala
      g.fillStyle(p.shirtColor, 1);
      g.fillRoundedRect(-13, -26, 26, 8, 3);
      g.fillStyle(p.skinColor, 1);
      g.fillCircle(0, -22, 4);
    } else if (isRelaxing) {
      // Tangan memegang cangkir kopi mengepul
      g.fillStyle(p.shirtColor, 1);
      g.fillRoundedRect(-13, -27, 8, 14, 3);
      g.fillRoundedRect(5, -27, 8, 14, 3);
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(-4, -20, 8, 9, 2); // Cangkir kopi
      g.fillStyle(0x6f3e1a, 1);
      g.fillRect(-2, -19, 4, 3); // Kopi cokelat
    } else if (isWorking) {
      // Tangan maju ke depan mengetik / membaca
      g.fillStyle(p.shirtColor, 1);
      g.fillRoundedRect(-13, -28, 8, 12, 3);
      g.fillRoundedRect(5, -28, 8, 12, 3);
      g.fillStyle(p.skinColor, 1);
      g.fillCircle(-6, -17, 3.5);
      g.fillCircle(6, -17, 3.5);
    } else {
      // Tangan santai di samping
      g.fillStyle(p.shirtColor, 1);
      g.fillRoundedRect(-14, -28, 5, 16, 2);
      g.fillRoundedRect(9, -28, 5, 16, 2);
      g.fillStyle(p.skinColor, 1);
      g.fillCircle(-11.5, -11, 2.8);
      g.fillCircle(11.5, -11, 2.8);
    }

    // D. KEPALA & LEHER
    g.fillStyle(p.skinColor, 1);
    g.fillRect(-3, -33, 6, 5); // Leher
    const headY = isSleeping ? -38 : -40;
    g.fillCircle(0, headY, 11); // Kepala manusia bulat

    // E. RAMBUT (Sesuai Gaya Karakter)
    g.fillStyle(p.hairColor, 1);
    if (p.hairStyle === 'neat') {
      g.fillCircle(0, headY - 4, 11);
      g.fillRoundedRect(-11, headY - 10, 22, 9, 3);
      g.fillRect(-11, headY - 6, 4, 10); // Jambang kiri
      g.fillRect(7, headY - 6, 4, 10);  // Jambang kanan
    } else if (p.hairStyle === 'messy') {
      g.fillCircle(0, headY - 4, 12);
      g.fillRoundedRect(-12, headY - 11, 24, 11, 4);
      // Poni acak-acakan
      g.fillTriangle(-8, headY - 6, -3, headY - 1, 2, headY - 6);
      g.fillRect(-12, headY - 5, 4, 10);
      g.fillRect(8, headY - 5, 4, 10);
    } else if (p.hairStyle === 'ponytail') {
      g.fillCircle(0, headY - 4, 11.5);
      g.fillRoundedRect(-11, headY - 10, 22, 8, 3);
      // Kuncir kuda ke belakang
      g.fillCircle(11, headY - 1, 6);
      g.fillRoundedRect(-11, headY - 6, 4, 12, 2);
      g.fillRect(7, headY - 6, 4, 8);
    } else if (p.hairStyle === 'cap') {
      // Topi snapback pink/coral
      g.fillStyle(p.shirtColor, 1);
      g.fillCircle(0, headY - 6, 11);
      g.fillRoundedRect(-13, headY - 6, 26, 4, 2); // Lidah topi miring
      g.fillStyle(p.hairColor, 1);
      g.fillRect(-11, headY - 2, 4, 8);
      g.fillRect(7, headY - 2, 4, 8);
    }

    // F. WAJAH: MATA, KACAMATA, & EKSPRESI
    if (isSleeping) {
      // Mata terpejam nyenyak: garis lengkung tidur (__ __)
      g.lineStyle(1.5, 0x3d2819, 1);
      g.beginPath();
      g.moveTo(-6, headY);
      g.lineTo(-2, headY);
      g.moveTo(2, headY);
      g.lineTo(6, headY);
      g.stroke();
    } else if (isSurprised) {
      // Mata membulat kaget (O O)
      g.fillStyle(0xffffff, 1);
      g.fillCircle(-4, headY - 1, 3);
      g.fillCircle(4, headY - 1, 3);
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(-4, headY - 1, 1.5);
      g.fillCircle(4, headY - 1, 1.5);
      // Mulut terbuka 'o'
      g.fillStyle(0xd9777f, 1);
      g.fillCircle(0, headY + 5, 2);
    } else {
      // Mata normal manusia hitam berbinar
      g.fillStyle(0x1e293b, 1);
      g.fillCircle(-4, headY, 2);
      g.fillCircle(4, headY, 2);
      // Pipi merona tipis
      g.fillStyle(0xffa8b8, 0.45);
      g.fillCircle(-7, headY + 3, 2);
      g.fillCircle(7, headY + 3, 2);
      // Senyum ramah
      g.lineStyle(1.2, 0x4a2e22, 0.8);
      g.beginPath();
      g.moveTo(-3, headY + 4);
      g.lineTo(0, headY + 5.5);
      g.lineTo(3, headY + 4);
      g.strokePath();
    }

    // Kacamata (jika ada)
    if (p.hasGlasses && !isSleeping) {
      g.lineStyle(1.5, 0x1f2937, 1);
      g.strokeRect(-7, headY - 3, 6, 5);
      g.strokeRect(1, headY - 3, 6, 5);
      g.beginPath();
      g.moveTo(-1, headY - 1);
      g.lineTo(1, headY - 1);
      g.stroke();
    }
  }

  drawBubble(actionText, hexColor) {
    this.bubbleBg.clear();
    const fullText = `${this.agentName}: ${actionText}`;
    const width = Math.max(72, Math.min(270, fullText.length * 6.6 + 22));
    const height = 18;
    const x = -width / 2;
    const y = -68;

    this.bubbleBg.fillStyle(0x0a1c28, 0.94);
    this.bubbleBg.fillRoundedRect(x, y, width, height, 6);
    this.bubbleBg.lineStyle(1.5, hexColor, 0.95);
    this.bubbleBg.strokeRoundedRect(x, y, width, height, 6);

    const hexString = `#${hexColor.toString(16).padStart(6, '0')}`;
    this.bubbleText.setText(fullText);
    this.bubbleText.setColor(hexString);
    this.bubbleText.setPosition(0, y + height / 2);
  }

  setupFSMListeners() {
    this.fsm.subscribe((event, data) => {
      if (event === 'transition') {
        const { to, currentRoom, activity } = data;
        const color = STATE_COLORS[to] || this.roleColor;
        const label = STATE_LABELS[to] || to.toUpperCase();

        // Render ulang wujud manusia dengan pose baru (tidur, santai, kaget, kerja)
        this.renderHumanFigure(to);
        this.drawBubble(label, color);

        EventBus.emit('avatarStateChanged', {
          agentId: this.agentId,
          name: this.agentName,
          role: this.profile.role,
          state: to,
          room: currentRoom,
          activity
        });
      }
    });
  }

  navigateToRoom(roomKey, targetActivity = null) {
    const targetNode = this.navGraph.getRoomSpot(roomKey, this.agentId);
    if (!targetNode) {
      console.warn(`[MametAvatar] [${this.agentId}] Ruangan ${roomKey} tidak memiliki node spot yang valid`);
      return false;
    }

    // Jika sedang tidur atau santai, kaget dan bangun dulu sebelum jalan
    if ([AVATAR_STATE_ENUM.SLEEPING, AVATAR_STATE_ENUM.RELAXING].includes(this.fsm.currentState)) {
      this.fsm.transitionTo(AVATAR_STATE_ENUM.SURPRISED);
      this.scene.time.delayedCall(450, () => {
        this._startNavigation(targetNode, roomKey, targetActivity);
      });
      return true;
    }

    return this._startNavigation(targetNode, roomKey, targetActivity);
  }

  _startNavigation(targetNode, roomKey, targetActivity) {
    if (this.currentNode.id === targetNode.id) {
      if (targetActivity) {
        this.fsm.transitionTo(targetActivity.avatarState || AVATAR_STATE_ENUM.IDLE, {
          room: roomKey,
          activity: targetActivity
        });
      }
      return true;
    }

    const path = this.navGraph.findPath(this.currentNode.id, targetNode.id);
    if (path.length === 0) {
      console.warn(`[MametAvatar] [${this.agentId}] Tidak ditemukan rute dari ${this.currentNode.id} ke ${targetNode.id}`);
      return false;
    }

    this.targetActivity = targetActivity;
    this.currentPath = path.slice(1);
    this.fsm.transitionTo(AVATAR_STATE_ENUM.WALKING, { targetRoom: roomKey });
    this.stepToNextWaypoint();
    return true;
  }

  stepToNextWaypoint() {
    if (this.currentPath.length === 0) {
      const finalRoom = this.fsm.getState().targetRoom;
      this.fsm.setCurrentRoom(finalRoom);

      if (this.targetActivity) {
        const nextState = this.targetActivity.avatarState || AVATAR_STATE_ENUM.IDLE;
        this.fsm.transitionTo(nextState, {
          room: finalRoom,
          activity: this.targetActivity
        });
      } else {
        this.fsm.transitionTo(AVATAR_STATE_ENUM.IDLE, { room: finalRoom });
      }
      return;
    }

    const nextNode = this.currentPath.shift();
    const dx = nextNode.x - this.container.x;
    const dy = nextNode.y - this.container.y;
    const distance = Math.hypot(dx, dy);
    const duration = (distance / this.moveSpeed) * 1000;

    // Flip karakter manusia menghadap kiri atau kanan
    if (dx < -2) {
      this.humanBody.setScale(-1, 1);
    } else if (dx > 2) {
      this.humanBody.setScale(1, 1);
    }

    this.scene.tweens.add({
      targets: this.container,
      x: nextNode.x,
      y: nextNode.y,
      duration: Math.max(120, duration),
      ease: 'Linear',
      onComplete: () => {
        this.currentNode = nextNode;
        this.stepToNextWaypoint();
      }
    });
  }

  setCarryingFile(isCarrying, label = '') {
    this.isCarryingFile = isCarrying;
    this.carriedFileName = label;
    this.fsm.resetIdle();
    this.renderHumanFigure(this.fsm.currentState);
    if (isCarrying && label) {
      this.drawBubble(`📁 ${label}`, 0xffd479);
    }
  }

  walkToNode(targetNodeOrId, onComplete = null) {
    const targetNode = typeof targetNodeOrId === 'string' 
      ? this.navGraph.getNode(targetNodeOrId) 
      : targetNodeOrId;

    if (!targetNode) {
      console.warn(`[MametAvatar] [${this.agentId}] Node tujuan tidak ditemukan:`, targetNodeOrId);
      if (onComplete) onComplete();
      return false;
    }

    // Hentikan tween yang sedang berjalan untuk mencegah konflik koordinat
    this.scene.tweens.killTweensOf(this.container);
    this.fsm.resetIdle();

    const executeWalk = () => {
      this.scene.tweens.killTweensOf(this.container);
      if (this.currentNode && this.currentNode.id === targetNode.id) {
        if (onComplete) onComplete();
        return;
      }

      const path = this.navGraph.findPath(this.currentNode?.id || this.homeSpot, targetNode.id);
      if (path.length <= 1) {
        this.currentNode = targetNode;
        if (onComplete) onComplete();
        return;
      }

      this.currentPath = path.slice(1);
      this.fsm.transitionTo(AVATAR_STATE_ENUM.WALKING, { targetRoom: targetNode.roomSpot || 'corridor' });
      
      const step = () => {
        if (this.currentPath.length === 0) {
          this.currentNode = targetNode;
          if (targetNode.roomSpot) {
            this.fsm.setCurrentRoom(targetNode.roomSpot);
          }
          this.fsm.resetIdle();
          if (onComplete) {
            onComplete();
          } else {
            this.fsm.transitionTo(AVATAR_STATE_ENUM.IDLE);
          }
          return;
        }

        const nextNode = this.currentPath.shift();
        const dx = nextNode.x - this.container.x;
        const dy = nextNode.y - this.container.y;
        const distance = Math.hypot(dx, dy);
        const duration = (distance / this.moveSpeed) * 1000;

        if (dx < -2) {
          this.humanBody.setScale(-1, 1);
        } else if (dx > 2) {
          this.humanBody.setScale(1, 1);
        }

        this.scene.tweens.killTweensOf(this.container);
        this.scene.tweens.add({
          targets: this.container,
          x: nextNode.x,
          y: nextNode.y,
          duration: Math.max(120, duration),
          ease: 'Linear',
          onComplete: () => {
            this.currentNode = nextNode;
            step();
          }
        });
      };

      step();
    };

    if ([AVATAR_STATE_ENUM.SLEEPING, AVATAR_STATE_ENUM.RELAXING].includes(this.fsm.currentState)) {
      this.fsm.transitionTo(AVATAR_STATE_ENUM.SURPRISED);
      this.scene.time.delayedCall(300, executeWalk);
      return true;
    }

    executeWalk();
    return true;
  }

  update(delta) {
    this.fsm.update(delta);
  }

  getPosition() {
    return { x: this.container.x, y: this.container.y };
  }

  getState() {
    return this.fsm.getState();
  }
}

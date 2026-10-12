/**
 * OfficeScene.js
 * Scene Utama Kantor Virtual Mamet — Multi-Agent Human Office Squad
 * Mengintegrasikan OfficeMap, NavGraph, dan 5 Agen Manusia Spesialis dengan Perilaku Menganggur (Santai & Tidur)
 */
import Phaser from 'phaser';
import { OfficeMap } from '../world/OfficeMap.js';
import { NavGraph } from '../world/NavGraph.js';
import { MametAvatar } from '../entities/MametAvatar.js';
import { EventBus } from '../EventBus.js';
import { AVATAR_STATE_ENUM } from '../state/AvatarStateMachine.js';

export class OfficeScene extends Phaser.Scene {
  constructor() {
    super('OfficeScene');
    this.agents = new Map();
  }

  create() {
    // 1. Inisialisasi NavGraph
    this.navGraph = new NavGraph();

    // 2. Render Dunia & Ruangan Tematik + Pantry Lounge
    this.officeMap = new OfficeMap(this);
    this.officeMap.build();

    // 3. Spawn Tim Agen Manusia di Ruangan Masing-Masing
    this.spawnAgentSquad();

    // 4. Efek Ambient Particles (floating cyber dust)
    this.createAmbientDust();

    // 5. Hubungkan EventBus Listener
    this.setupEventListeners();

    // Beritahu React bahwa seluruh tim agen siap
    EventBus.emit('gameReady', {
      agentsCount: this.agents.size
    });
  }

  spawnAgentSquad() {
    // 1. Mamet Lead (Command Center)
    this.agents.set('mamet', new MametAvatar(this, this.navGraph, 'command_spot', {
      agentId: 'mamet',
      agentName: 'Mamet Lead',
      roleColor: 0x57d7e6
    }));

    // 2. The Engineer (Engineer Room)
    this.agents.set('engineer', new MametAvatar(this, this.navGraph, 'engineer_spot', {
      agentId: 'engineer',
      agentName: 'Engineer',
      roleColor: 0xffd479
    }));

    // 3. The Researcher (Research Room)
    this.agents.set('researcher', new MametAvatar(this, this.navGraph, 'research_spot', {
      agentId: 'researcher',
      agentName: 'Researcher',
      roleColor: 0xc89cff
    }));

    // 4. The Archivist (Memory Room)
    this.agents.set('archivist', new MametAvatar(this, this.navGraph, 'memory_spot', {
      agentId: 'archivist',
      agentName: 'Archivist',
      roleColor: 0x72e6a1
    }));

    // 5. TokenSaver (Pantry & Coffee Lounge)
    this.agents.set('tokensaver', new MametAvatar(this, this.navGraph, 'lounge_spot', {
      agentId: 'tokensaver',
      agentName: 'TokenSaver',
      roleColor: 0xff9fc7
    }));
  }

  createAmbientDust() {
    const { width, height } = this.scale;
    this.dustParticles = [];

    for (let i = 0; i < 24; i++) {
      const x = Phaser.Math.Between(40, width - 40);
      const y = Phaser.Math.Between(40, height - 40);
      const dust = this.add.circle(x, y, Phaser.Math.FloatBetween(1, 1.8), 0x57d7e6, Phaser.Math.FloatBetween(0.12, 0.4));

      this.tweens.add({
        targets: dust,
        y: y - Phaser.Math.Between(15, 30),
        alpha: { from: dust.alpha, to: 0.08 },
        duration: Phaser.Math.Between(2600, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.dustParticles.push(dust);
    }
  }

  setupEventListeners() {
    // Klik ruangan di kanvas: Agen Mamet Lead / Agen terkait merespons
    this.events.on('roomSelected', (roomKey) => {
      EventBus.emit('roomClicked', roomKey);
      
      // Arahkan agen terdekat atau Mamet Lead untuk memeriksa
      const targetAgent = this.getAgentForRoom(roomKey) || this.agents.get('mamet');
      if (targetAgent) {
        targetAgent.navigateToRoom(roomKey);
      }
    });

    // Event dari React HUD: dispatch activity ke agen spesialis yang tepat
    const unsubActivity = EventBus.on('dispatchActivity', (activity) => {
      if (!activity) return;

      const targetAgent = this.getAgentForActivity(activity);
      if (targetAgent) {
        // Jika sedang tidur atau santai, agen akan kaget bangun lalu bekerja
        targetAgent.navigateToRoom(activity.targetRoom || targetAgent.homeSpot, activity);
      }
    });

    // Event dari React HUD: navigasi ruangan manual
    const unsubNavigate = EventBus.on('navigateRoom', (roomKey) => {
      const mamet = this.agents.get('mamet');
      if (mamet) mamet.navigateToRoom(roomKey);
    });

    // Event dari React HUD: kumpul santai di Pantry Lounge
    const unsubLounge = EventBus.on('allLounge', () => {
      this.agents.forEach((agent) => {
        agent.navigateToRoom('lounge');
      });
    });

    // Event dari React HUD: kembali ke stasiun kerja masing-masing
    const unsubHome = EventBus.on('allHome', () => {
      this.agents.forEach((agent) => {
        const homeRoom = agent.homeSpot.replace('_spot', '');
        agent.navigateToRoom(homeRoom);
      });
    });

    // Event dari React HUD: transfer data packet antar agen via Kurir Fisik
    const unsubPacket = EventBus.on('transferDataPacket', ({ from, to, label }) => {
      this.transferDataPacket(from, to, label);
    });

    // Event dari UI: Ubah Workspace Mode (Global, Assistant, Engineer, Knowledge, Lite)
    const unsubWorkspace = EventBus.on('setWorkspaceMode', (wsDef) => {
      this.officeMap.setWorkspaceMode(wsDef);
    });

    // Cleanup saat scene ditutup
    this.events.once('shutdown', () => {
      unsubActivity();
      unsubNavigate();
      unsubLounge();
      unsubHome();
      unsubPacket();
      unsubWorkspace();
    });
  }

  transferDataPacket(fromAgentId, toAgentId, label = 'Data', onComplete = null) {
    const fromAgent = this.agents.get(fromAgentId);
    const toAgent = this.agents.get(toAgentId);
    const courier = this.agents.get('tokensaver');

    if (!fromAgent || !toAgent || fromAgentId === toAgentId) {
      if (onComplete) onComplete();
      return;
    }

    // Proteksi Concurrency: Antrekan jika kurir sedang aktif di jalan
    if (courier && courier.isDelivering) {
      if (!this.courierQueue) this.courierQueue = [];
      this.courierQueue.push({ fromAgentId, toAgentId, label, onComplete });
      return;
    }

    if (courier) courier.isDelivering = true;

    const finishDelivery = () => {
      if (courier) courier.isDelivering = false;
      if (onComplete) onComplete();
      if (this.courierQueue && this.courierQueue.length > 0) {
        const next = this.courierQueue.shift();
        this.transferDataPacket(next.fromAgentId, next.toAgentId, next.label, next.onComplete);
      }
    };

    const runner = courier || fromAgent;

    // Helper efek partikel serah terima berkas
    const spawnHandoverSparks = (x, y, color = 0x57d7e6) => {
      for (let i = 0; i < 8; i++) {
        const spark = this.add.circle(x, y - 20, 2.5, color, 0.9);
        spark.setDepth(101);
        const angle = (i / 8) * Math.PI * 2;
        this.tweens.add({
          targets: spark,
          x: x + Math.cos(angle) * 22,
          y: y - 20 + Math.sin(angle) * 22,
          alpha: 0,
          scale: 0.2,
          duration: 400,
          onComplete: () => spark.destroy()
        });
      }
    };

    // SKENARIO 1: TokenSaver sendiri adalah pengirim
    if (fromAgentId === 'tokensaver') {
      runner.setCarryingFile(true, label);
      runner.drawBubble(`🏃 Antar: ${label}`, 0xffd479);
      runner.walkToNode(toAgent.currentNode?.id || toAgent.homeSpot, () => {
        spawnHandoverSparks(toAgent.container.x, toAgent.container.y, 0x72e6a1);
        runner.setCarryingFile(false);
        runner.drawBubble(`🤝 Diserahkan ke ${toAgent.agentName}`, 0x72e6a1);
        toAgent.drawBubble(`📥 Menerima: ${label}`, toAgent.roleColor);
        if (toAgent.fsm.currentState === 'sleeping' || toAgent.fsm.currentState === 'relaxing') {
          toAgent.fsm.transitionTo('surprised');
        }
        this.time.delayedCall(600, () => {
          runner.walkToNode('lounge_spot_tokensaver', () => {
            runner.drawBubble('☕ RELAX', 0xff9fc7);
            runner.fsm.transitionTo('relaxing');
            finishDelivery();
          });
        });
      });
      return;
    }

    // SKENARIO 2: TokenSaver adalah penerima
    if (toAgentId === 'tokensaver') {
      runner.drawBubble(`🏃 Jemput: ${label}`, 0xff9fc7);
      runner.walkToNode(fromAgent.currentNode?.id || fromAgent.homeSpot, () => {
        spawnHandoverSparks(fromAgent.container.x, fromAgent.container.y, 0xffd479);
        fromAgent.drawBubble(`📤 Berikan: ${label}`, fromAgent.roleColor);
        runner.setCarryingFile(true, label);
        runner.drawBubble(`📁 Ambil: ${label}`, 0xffd479);
        this.time.delayedCall(350, () => {
          runner.walkToNode('lounge_spot_tokensaver', () => {
            runner.setCarryingFile(false);
            runner.drawBubble(`📥 Berkas Disimpan`, 0x72e6a1);
            runner.fsm.transitionTo('relaxing');
            finishDelivery();
          });
        });
      });
      return;
    }

    // SKENARIO 3: TokenSaver sebagai Kurir Kantor Antar-Departemen
    // Langkah A: Kurir bergerak menjemput berkas di meja pengirim
    runner.drawBubble(`🏃 Jemput: ${label}`, 0xff9fc7);
    runner.walkToNode(fromAgent.currentNode?.id || fromAgent.homeSpot, () => {
      // Sampai di meja pengirim: serah terima berkas fisik
      spawnHandoverSparks(fromAgent.container.x, fromAgent.container.y, 0xffd479);
      fromAgent.drawBubble(`📤 Serahkan ${label}`, fromAgent.roleColor);
      runner.setCarryingFile(true, label);
      runner.drawBubble(`📁 Membawa: ${label}`, 0xffd479);

      this.time.delayedCall(350, () => {
        // Langkah B: Kurir berjalan membawa map berkas menyusuri koridor ke meja penerima
        runner.walkToNode(toAgent.currentNode?.id || toAgent.homeSpot, () => {
          // Sampai di meja penerima: serahkan map berkas
          spawnHandoverSparks(toAgent.container.x, toAgent.container.y, 0x72e6a1);
          runner.setCarryingFile(false);
          runner.drawBubble(`🤝 Serahkan ke ${toAgent.agentName}`, 0x72e6a1);
          
          toAgent.drawBubble(`📥 Menerima ${label}`, toAgent.roleColor);
          if (toAgent.fsm.currentState === 'sleeping' || toAgent.fsm.currentState === 'relaxing') {
            toAgent.fsm.transitionTo('surprised');
          }

          this.time.delayedCall(600, () => {
            // Langkah C: Kurir berjalan kembali ke pos Pantry Lounge
            runner.walkToNode('lounge_spot_tokensaver', () => {
              runner.drawBubble('☕ RELAX', 0xff9fc7);
              runner.fsm.transitionTo('relaxing');
              finishDelivery();
            });
          });
        });
      });
    });
  }

  getAgentForRoom(roomKey) {
    if (roomKey === 'command') return this.agents.get('mamet');
    if (roomKey === 'engineer') return this.agents.get('engineer');
    if (roomKey === 'research') return this.agents.get('researcher');
    if (roomKey === 'memory') return this.agents.get('archivist');
    if (roomKey === 'lounge') return this.agents.get('tokensaver');
    return this.agents.get('mamet');
  }

  getAgentForActivity(activity) {
    const domain = activity.domain || '';
    const room = activity.targetRoom || '';

    if (domain === 'engineering' || room === 'engineer') {
      return this.agents.get('engineer');
    }
    if (domain === 'research' || domain === 'rag' || room === 'research') {
      return this.agents.get('researcher');
    }
    if (domain === 'memory' || room === 'memory') {
      return this.agents.get('archivist');
    }
    if (room === 'alert' || activity.status === 'failed') {
      // Jika terjadi kegagalan/alert, Engineer atau Mamet yang bergegas ke stasiun bahaya
      return this.agents.get('engineer') || this.agents.get('mamet');
    }
    if (room === 'lounge') {
      return this.agents.get('tokensaver');
    }

    return this.agents.get('mamet');
  }

  update(time, delta) {
    // Update FSM setiap agen untuk menghitung durasi menganggur (idle -> relax -> sleep)
    this.agents.forEach((agent) => {
      agent.update(delta);
    });
  }
}

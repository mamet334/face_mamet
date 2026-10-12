/**
 * OfficeHUD.js
 * Interface overlay HUD untuk interaksi kamera, mode workspace, inspeksi agen, dan pengantaran kurir 3D
 */

import { WORKSPACE_DEFINITIONS, AGENT_SPECS } from '../activity/ActivityTypes.js';
import { CAMERA_PRESETS } from '../engine/CameraController.js';
import { AVATAR_STATE_ENUM } from '../state/AvatarStateMachine.js';

export class OfficeHUD {
  constructor(container, scene3D, activityBus) {
    this.container = container;
    this.scene = scene3D;
    this.bus = activityBus;
    this.activeWorkspaceId = 'global';
    this.inspectedAgentId = 'mamet';

    this.render();
    this.setupListeners();
  }

  render() {
    this.container.innerHTML = `
      <div id="canvas-container"></div>

      <!-- Top Header -->
      <header class="hud-glass hud-header">
        <div class="brand-section">
          <span class="brand-badge">3D LIVING OFFICE</span>
          <span class="brand-title">Mamet AI Multi-Agent Engine</span>
        </div>
        <div class="header-status">
          <span class="status-pill no-audio">🔇 Simulasi Visual (No Audio)</span>
          <span class="status-pill">⚡ 60 FPS WebGL</span>
          <span class="status-pill" id="hud-queue-status">📦 Antrean Berkas: 0</span>
        </div>
      </header>

      <!-- Workspace Mode Bar -->
      <nav class="hud-glass hud-workspace-bar" id="ws-bar">
        ${Object.values(WORKSPACE_DEFINITIONS).map(ws => `
          <button class="ws-btn ${ws.id === 'global' ? 'active' : ''}" data-ws="${ws.id}">
            <span>${ws.icon}</span>
            <span>${ws.name}</span>
          </button>
        `).join('')}
      </nav>

      <!-- Action & Simulation Sidebar -->
      <aside class="hud-glass hud-actions-sidebar">
        <div class="panel-title">Operasi Kurir & AI</div>
        
        <button class="action-btn" id="btn-courier-1">
          <span>📁</span>
          <span>Kurir: Research ➔ Engineer</span>
        </button>

        <button class="action-btn" id="btn-courier-2">
          <span>📁</span>
          <span>Kurir: Command ➔ Memory</span>
        </button>

        <button class="action-btn" id="btn-pipeline">
          <span>⚡</span>
          <span>Jalankan Pipeline AI Squad</span>
        </button>

        <button class="action-btn" id="btn-coffee-break">
          <span>☕</span>
          <span>Ngopi di Lounge (Pantry)</span>
        </button>

        <button class="action-btn" id="btn-reset-desks">
          <span>🔄</span>
          <span>Kembalikan Meja Kerja</span>
        </button>
      </aside>

      <!-- Agent Inspector Panel -->
      <aside class="hud-glass hud-inspector-panel" id="inspector-panel">
        <div class="inspector-header">
          <div class="avatar-color-badge" id="insp-badge" style="background: #3b82f6;"></div>
          <div>
            <div class="inspector-name" id="insp-name">Mamet</div>
            <div class="inspector-role" id="insp-role">Orchestrator & Lead</div>
          </div>
        </div>
        <div>
          <span class="inspector-status-badge" id="insp-state">IDLE</span>
        </div>
        <p class="inspector-desc" id="insp-desc">
          Memimpin koordinasi dan orchestrator seluruh sub-agen.
        </p>
        <button class="inspector-focus-btn" id="insp-focus-btn">
          🎥 Fokuskan Kamera 3D
        </button>
      </aside>

      <!-- Camera Presets Bar -->
      <div class="hud-glass hud-camera-bar">
        <button class="cam-btn" data-cam="overview">🎥 Overview</button>
        <button class="cam-btn" data-cam="command">🎯 Mamet</button>
        <button class="cam-btn" data-cam="research">🔬 Research</button>
        <button class="cam-btn" data-cam="engineer">⚡ Engineer</button>
        <button class="cam-btn" data-cam="memory">🧠 Memory</button>
        <button class="cam-btn" data-cam="lounge">☕ Pantry</button>
      </div>

      <!-- Activity Log Stream -->
      <div class="hud-glass hud-activity-log" id="activity-log">
        <div class="panel-title">Alur Aktivitas Visual</div>
        <div class="log-entry">
          <div class="log-title">Engine Boot Ready</div>
          <div class="log-msg">3D Living Office Engine aktif pada 60 FPS</div>
        </div>
      </div>
    `;
  }

  setupListeners() {
    // 1. Workspace Switcher
    const wsBtns = this.container.querySelectorAll('.ws-btn');
    wsBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const wsId = btn.getAttribute('data-ws');
        wsBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeWorkspaceId = wsId;
        this.scene.setWorkspaceMode(wsId);
        this.addLogEntry(`Workspace Switch`, `Beralih ke mode ${WORKSPACE_DEFINITIONS[wsId]?.name}`);
      });
    });

    // 2. Camera Presets
    const camBtns = this.container.querySelectorAll('.cam-btn');
    camBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const camKey = btn.getAttribute('data-cam');
        this.scene.cameraController.applyPreset(camKey, true);
        this.addLogEntry(`Kamera 3D`, `Fokus ke ${CAMERA_PRESETS[camKey]?.name}`);
      });
    });

    // 3. Courier Test 1 (Research -> Engineer)
    const btnCourier1 = this.container.querySelector('#btn-courier-1');
    btnCourier1.addEventListener('click', () => {
      this.addLogEntry(`Kurir Fisik`, `TokenSaver mengambil berkas RAG ke Engineer Workbench`);
      this.updateQueueStatus();
      this.scene.enqueueCourierDelivery('research', 'engineer', 'Patch Code & Verifikasi RAG', () => {
        this.updateQueueStatus();
      });
      this.updateQueueStatus();
    });

    // 4. Courier Test 2 (Command -> Memory)
    const btnCourier2 = this.container.querySelector('#btn-courier-2');
    btnCourier2.addEventListener('click', () => {
      this.addLogEntry(`Kurir Fisik`, `TokenSaver membawa instruksi simpan ke Memory Vault`);
      this.scene.enqueueCourierDelivery('command', 'memory', 'Simpan Preferensi User Baru', () => {
        this.updateQueueStatus();
      });
      this.updateQueueStatus();
    });

    // 5. Full Pipeline Stream
    const btnPipeline = this.container.querySelector('#btn-pipeline');
    btnPipeline.addEventListener('click', () => {
      btnPipeline.disabled = true;
      this.addLogEntry(`AI Pipeline`, `Mamet Orchestrator memulai pipeline multi-agent`);

      // Mamet Thinking
      const mamet = this.scene.agents.get('mamet');
      mamet.fsm.transitionTo(AVATAR_STATE_ENUM.THINKING, { message: 'Merencanakan Solusi...' });

      setTimeout(() => {
        // Enqueue courier to Researcher
        this.scene.enqueueCourierDelivery('command', 'research', 'Analisis Knowledge RAG', () => {
          // Researcher Coding/Analysing
          const res = this.scene.agents.get('researcher');
          res.fsm.transitionTo(AVATAR_STATE_ENUM.RESEARCHING, { message: 'Analisis Dokumen...' });

          setTimeout(() => {
            // Enqueue courier from Researcher to Engineer
            this.scene.enqueueCourierDelivery('research', 'engineer', 'Eksekusi Patch Kode', () => {
              const eng = this.scene.agents.get('engineer');
              eng.fsm.transitionTo(AVATAR_STATE_ENUM.CODING, { message: 'Menjalankan Kode...' });

              setTimeout(() => {
                // Enqueue courier from Engineer to Memory
                this.scene.enqueueCourierDelivery('engineer', 'memory', 'Rekam Status Memori', () => {
                  const arch = this.scene.agents.get('archivist');
                  arch.fsm.transitionTo(AVATAR_STATE_ENUM.STORING, { message: 'Menyimpan ke Vault...' });

                  setTimeout(() => {
                    mamet.fsm.transitionTo(AVATAR_STATE_ENUM.SUCCESS, { message: 'Pipeline Berhasil!' });
                    this.addLogEntry(`AI Pipeline`, `Seluruh tahapan tugas terselesaikan sempurna!`);
                    btnPipeline.disabled = false;
                  }, 1200);
                });
              }, 1200);
            });
          }, 1200);
        });
      }, 800);
    });

    // 6. Istirahat / Ngopi Semua Agen
    const btnCoffee = this.container.querySelector('#btn-coffee-break');
    btnCoffee.addEventListener('click', () => {
      this.addLogEntry(`Waktu Istirahat`, `Seluruh tim beranjak ke Pantry Lounge untuk ngopi/santai`);
      const agentIds = ['mamet', 'engineer', 'researcher', 'archivist', 'tokensaver'];
      agentIds.forEach(id => {
        const loungeSpot = this.scene.navGraph.getRoomSpot('lounge', id);
        if (loungeSpot) {
          this.scene.walkAgentToNode(id, loungeSpot.id, () => {
            this.scene.agents.get(id).fsm.transitionTo(AVATAR_STATE_ENUM.RELAXING);
          });
        }
      });
      this.scene.cameraController.applyPreset('lounge', true);
    });

    // 7. Reset Meja Kerja
    const btnReset = this.container.querySelector('#btn-reset-desks');
    btnReset.addEventListener('click', () => {
      this.addLogEntry(`Kembali Kerja`, `Seluruh tim kembali fokus di meja stasiun masing-masing`);
      this.scene.walkAgentToNode('mamet', 'command_desk', () => {
        this.scene.agents.get('mamet').fsm.transitionTo(AVATAR_STATE_ENUM.IDLE);
      });
      this.scene.walkAgentToNode('researcher', 'research_desk', () => {
        this.scene.agents.get('researcher').fsm.transitionTo(AVATAR_STATE_ENUM.IDLE);
      });
      this.scene.walkAgentToNode('engineer', 'engineer_desk', () => {
        this.scene.agents.get('engineer').fsm.transitionTo(AVATAR_STATE_ENUM.IDLE);
      });
      this.scene.walkAgentToNode('archivist', 'memory_vault', () => {
        this.scene.agents.get('archivist').fsm.transitionTo(AVATAR_STATE_ENUM.IDLE);
      });
      this.scene.walkAgentToNode('tokensaver', 'tokensaver_station', () => {
        this.scene.agents.get('tokensaver').fsm.transitionTo(AVATAR_STATE_ENUM.IDLE);
      });
      this.scene.cameraController.applyPreset('overview', true);
    });

    // 8. Inspector Focus Button
    const btnFocus = this.container.querySelector('#insp-focus-btn');
    btnFocus.addEventListener('click', () => {
      const agent = this.scene.agents.get(this.inspectedAgentId);
      if (agent) {
        this.scene.cameraController.focusOnAgent(agent.character.group.position, true);
      }
    });

    // Event Bus Listeners
    if (this.bus) {
      this.bus.on('agent:inspected', (spec) => {
        this.inspectAgent(spec.id);
      });

      this.bus.on('agent:state:changed', ({ agentId, to, metadata }) => {
        if (agentId === this.inspectedAgentId) {
          const stateEl = this.container.querySelector('#insp-state');
          if (stateEl) stateEl.textContent = to.toUpperCase();
        }
      });
    }
  }

  inspectAgent(agentId) {
    this.inspectedAgentId = agentId;
    const spec = AGENT_SPECS[agentId];
    const agent = this.scene.agents.get(agentId);
    if (!spec || !agent) return;

    const badgeEl = this.container.querySelector('#insp-badge');
    const nameEl = this.container.querySelector('#insp-name');
    const roleEl = this.container.querySelector('#insp-role');
    const stateEl = this.container.querySelector('#insp-state');
    const descEl = this.container.querySelector('#insp-desc');

    if (badgeEl) badgeEl.style.background = spec.color;
    if (nameEl) nameEl.textContent = spec.name;
    if (roleEl) roleEl.textContent = spec.role;
    if (stateEl) stateEl.textContent = agent.fsm.getState().toUpperCase();
    if (descEl) descEl.textContent = spec.description;
  }

  updateQueueStatus() {
    const queueEl = this.container.querySelector('#hud-queue-status');
    if (queueEl) {
      const count = this.scene.courierQueue.length + (this.scene.isDelivering ? 1 : 0);
      queueEl.textContent = `📦 Antrean Berkas: ${count}`;
    }
  }

  addLogEntry(title, message) {
    const logEl = this.container.querySelector('#activity-log');
    if (!logEl) return;

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <div class="log-title">${title}</div>
      <div class="log-msg">${message}</div>
    `;
    logEl.insertBefore(entry, logEl.children[1]); // Letakkan setelah panel-title

    // Batasi log maksimal 8 item
    while (logEl.children.length > 9) {
      logEl.removeChild(logEl.lastChild);
    }
  }
}

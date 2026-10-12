/**
 * Office3DScene.js
 * Master 3D Living Office Scene Controller (Three.js)
 * Mengelola rendering 60 FPS, 5 karakter tim manusia, antrean kurir berkas fisik, dan navigasi NavGraph3D
 */

import * as THREE from 'three';
import { WorldBuilder } from './WorldBuilder.js';
import { OfficeLighting } from './OfficeLighting.js';
import { CameraController } from './CameraController.js';
import { NavGraph3D } from '../navigation/NavGraph3D.js';
import { HumanCharacter3D } from '../entities/HumanCharacter3D.js';
import { CharacterAnimator } from '../animation/CharacterAnimator.js';
import { AvatarStateMachine, AVATAR_STATE_ENUM } from '../state/AvatarStateMachine.js';
import { AGENT_SPECS, WORKSPACE_DEFINITIONS } from '../activity/ActivityTypes.js';

export class Office3DScene {
  constructor(containerElement, activityBus) {
    this.container = containerElement;
    this.activityBus = activityBus;

    // Core Three.js Objects
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x090d16); // Sleek modern dark ambience
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // Systems
    this.navGraph = new NavGraph3D();
    this.worldBuilder = new WorldBuilder(this.scene);
    this.lighting = new OfficeLighting(this.scene);
    this.cameraController = new CameraController(this.camera, this.renderer.domElement);

    // Agents Registry
    this.agents = new Map(); // agentId -> { character, animator, fsm, currentNode, movementQueue, activeTween }
    this.currentWorkspace = WORKSPACE_DEFINITIONS.global;

    // Courier Delivery System (FIFO Queue)
    this.courierQueue = [];
    this.isDelivering = false;

    // Raycaster untuk klik 3D
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.initAgents();
    this.setupEventListeners();
    this.startRenderLoop();
  }

  initAgents() {
    const agentIds = ['mamet', 'engineer', 'researcher', 'archivist', 'tokensaver'];

    agentIds.forEach(id => {
      const character = new HumanCharacter3D(id);
      const animator = new CharacterAnimator(character);
      const fsm = new AvatarStateMachine({
        agentId: id,
        onStateChange: ({ from, to, metadata }) => {
          this.handleAgentStateChanged(id, from, to, metadata);
        }
      });

      this.scene.add(character.group);

      const agentData = {
        id,
        character,
        animator,
        fsm,
        currentNode: null,
        isMoving: false,
        waypoints: [],
        waypointIndex: 0,
        moveSpeed: 4.8,
        onMoveComplete: null
      };
      this.agents.set(id, agentData);
    });

    // Tempatkan agen di meja tugas masing-masing
    this.teleportAgentToNode('mamet', 'command_desk', 0);
    this.teleportAgentToNode('researcher', 'research_desk', 0);
    this.teleportAgentToNode('engineer', 'engineer_desk', 0);
    this.teleportAgentToNode('archivist', 'memory_vault', Math.PI);
    this.teleportAgentToNode('tokensaver', 'tokensaver_station', 0);

    // Set awal ke state kerja atau idle
    this.agents.get('mamet').fsm.transitionTo(AVATAR_STATE_ENUM.IDLE);
    this.agents.get('researcher').fsm.transitionTo(AVATAR_STATE_ENUM.IDLE);
    this.agents.get('engineer').fsm.transitionTo(AVATAR_STATE_ENUM.IDLE);
    this.agents.get('archivist').fsm.transitionTo(AVATAR_STATE_ENUM.IDLE);
    this.agents.get('tokensaver').fsm.transitionTo(AVATAR_STATE_ENUM.IDLE);
  }

  teleportAgentToNode(agentId, nodeId, rotY = 0) {
    const agent = this.agents.get(agentId);
    const node = this.navGraph.getNode(nodeId);
    if (!agent || !node) return;

    agent.character.setPosition(node.x, node.y, node.z);
    agent.character.setRotationY(rotY);
    agent.currentNode = nodeId;
  }

  handleAgentStateChanged(agentId, from, to, metadata) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    // Update bubble di atas kepala
    const spec = AGENT_SPECS[agentId];
    let label = `${spec.name}: ${to.toUpperCase()}`;
    if (metadata?.message) {
      label = metadata.message;
    }
    agent.character.updateSpeechBubble(label);

    // Kirim sinyal ke HUD
    if (this.activityBus) {
      this.activityBus.emit('agent:state:changed', { agentId, from, to, metadata });
    }
  }

  walkAgentToNode(agentId, targetNodeId, onComplete = null) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const startNode = agent.currentNode || this.navGraph.findNearestNode(
      agent.character.group.position.x,
      agent.character.group.position.z
    )?.id;

    if (!startNode) return;

    const path = this.navGraph.findPath(startNode, targetNodeId);
    if (!path || path.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    agent.waypoints = path;
    agent.waypointIndex = 1; // Mulai bergerak ke node berikutnya
    agent.isMoving = true;
    agent.onMoveComplete = onComplete;
    agent.fsm.resetIdle();
    agent.fsm.transitionTo(AVATAR_STATE_ENUM.WALKING);
  }

  enqueueCourierDelivery(senderRoom, recipientRoom, taskLabel, onFinish = null) {
    this.courierQueue.push({
      senderRoom,
      recipientRoom,
      taskLabel,
      onFinish
    });

    if (!this.isDelivering) {
      this.processNextCourierDelivery();
    }
  }

  processNextCourierDelivery() {
    if (this.courierQueue.length === 0) {
      this.isDelivering = false;
      return;
    }

    this.isDelivering = true;
    const task = this.courierQueue.shift();
    const tokensaver = this.agents.get('tokensaver');

    // 1. Dapatkan node pengirim dan penerima
    const senderSpot = this.navGraph.getRoomSpot(task.senderRoom);
    const recipientSpot = this.navGraph.getRoomSpot(task.recipientRoom);
    const defaultStation = 'tokensaver_station';

    if (!senderSpot || !recipientSpot) {
      this.isDelivering = false;
      if (task.onFinish) task.onFinish();
      this.processNextCourierDelivery();
      return;
    }

    // Step 1: TokenSaver jalan ke meja pengirim (tanpa berkas)
    tokensaver.character.setCarryingFolder(false);
    tokensaver.character.updateSpeechBubble(`Mengambil berkas di ${task.senderRoom}...`, '#d97706');

    this.walkAgentToNode('tokensaver', senderSpot.id, () => {
      // Step 2: Ambil berkas fisik (folder visible)
      tokensaver.character.setCarryingFolder(true);
      tokensaver.character.updateSpeechBubble(`Membawa berkas ke ${task.recipientRoom}...`, '#ea580c');

      // Step 3: Jalan ke meja penerima sambil membawa berkas fisik
      this.walkAgentToNode('tokensaver', recipientSpot.id, () => {
        // Step 4: Serahkan berkas fisik
        tokensaver.character.setCarryingFolder(false);
        tokensaver.character.updateSpeechBubble(`Berkas diserahkan!`, '#16a34a');

        // Picu reaksi penerima
        const recipientAgentId = Object.keys(AGENT_SPECS).find(
          k => AGENT_SPECS[k].room === task.recipientRoom && k !== 'tokensaver'
        );
        if (recipientAgentId && this.agents.has(recipientAgentId)) {
          const recAgent = this.agents.get(recipientAgentId);
          recAgent.fsm.transitionTo(AVATAR_STATE_ENUM.SURPRISED);
          setTimeout(() => {
            recAgent.fsm.transitionTo(AVATAR_STATE_ENUM.CODING, { message: task.taskLabel });
          }, 800);
        }

        // Step 5: Kembali ke stasiun awal kurir
        setTimeout(() => {
          this.walkAgentToNode('tokensaver', defaultStation, () => {
            tokensaver.fsm.transitionTo(AVATAR_STATE_ENUM.IDLE);
            if (task.onFinish) task.onFinish();
            // Lanjut ke antrean berikutnya
            this.processNextCourierDelivery();
          });
        }, 600);
      });
    });
  }

  setWorkspaceMode(workspaceKey) {
    const ws = WORKSPACE_DEFINITIONS[workspaceKey] || WORKSPACE_DEFINITIONS.global;
    this.currentWorkspace = ws;

    // Sorot ruangan aktif dan redupkan yang off-scope
    this.worldBuilder.highlightWorkspaceRooms(ws.activeRooms);
    this.lighting.updateWorkspaceHighlights(ws.activeRooms);

    // Update status agen: agen yang aktif tetap kerja, yang off-scope diarahkan ke lounge atau santai
    this.agents.forEach((agent, id) => {
      const isActive = ws.activeAgents.includes(id);
      if (!isActive && id !== 'tokensaver') {
        const loungeSpot = this.navGraph.getRoomSpot('lounge', id);
        if (loungeSpot) {
          this.walkAgentToNode(id, loungeSpot.id, () => {
            agent.fsm.transitionTo(AVATAR_STATE_ENUM.RELAXING);
          });
        }
      }
    });

    if (this.activityBus) {
      this.activityBus.emit('workspace:changed', ws);
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    // Klik 3D untuk inspeksi agen
    this.renderer.domElement.addEventListener('pointerdown', (e) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const interactiveMeshes = [];
      this.agents.forEach(agent => {
        interactiveMeshes.push(agent.character.joints.torso);
        interactiveMeshes.push(agent.character.joints.head);
      });

      const intersects = this.raycaster.intersectObjects(interactiveMeshes, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        // Cari agentId pemilik mesh
        for (const [id, agent] of this.agents.entries()) {
          if (agent.character.group.getObjectById(hit.id)) {
            this.cameraController.focusOnAgent(agent.character.group.position);
            if (this.activityBus) {
              this.activityBus.emit('agent:inspected', AGENT_SPECS[id]);
            }
            break;
          }
        }
      }
    });
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  startRenderLoop() {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      requestAnimationFrame(loop);

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      this.update(delta);
      this.renderer.render(this.scene, this.camera);
    };

    requestAnimationFrame(loop);
  }

  update(delta) {
    // 1. Update Camera
    this.cameraController.update(delta);

    // 2. Update Agents & Movement
    this.agents.forEach((agent) => {
      // Pergerakan menyusuri waypoints NavGraph3D
      if (agent.isMoving && agent.waypoints.length > 0) {
        const targetNode = agent.waypoints[agent.waypointIndex];
        if (targetNode) {
          const currentPos = agent.character.group.position;
          const targetPos = new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z);
          const distance = currentPos.distanceTo(targetPos);

          if (distance < 0.1) {
            agent.currentNode = targetNode.id;
            agent.waypointIndex++;
            if (agent.waypointIndex >= agent.waypoints.length) {
              agent.isMoving = false;
              agent.waypoints = [];
              if (agent.onMoveComplete) {
                const cb = agent.onMoveComplete;
                agent.onMoveComplete = null;
                cb();
              }
            }
          } else {
            // Bergerak ke arah target
            const dir = new THREE.Vector3().subVectors(targetPos, currentPos).normalize();
            currentPos.addScaledVector(dir, agent.moveSpeed * delta);

            // Putar badan menghadap arah jalan
            const targetAngle = Math.atan2(dir.x, dir.z);
            agent.character.group.rotation.y = THREE.MathUtils.lerp(
              agent.character.group.rotation.y,
              targetAngle,
              delta * 12.0
            );
          }
        }
      }

      // Update State Machine & Animasi
      agent.fsm.update(delta);
      agent.animator.update(delta, agent.fsm.getState(), agent.character.isCarryingFolder);
    });
  }
}

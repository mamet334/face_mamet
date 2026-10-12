/**
 * CameraController.js
 * Kontrol kamera 3D interaktif (Orbit Controls + Smooth Cinematic Focus Presets)
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const CAMERA_PRESETS = Object.freeze({
  overview: {
    pos: new THREE.Vector3(0, 24, 22),
    target: new THREE.Vector3(0, 0, 0),
    name: 'Overview 3D'
  },
  command: {
    pos: new THREE.Vector3(-9, 7, 2),
    target: new THREE.Vector3(-9, 1.2, -4.5),
    name: 'Command Center (Mamet)'
  },
  research: {
    pos: new THREE.Vector3(0, 7, 2),
    target: new THREE.Vector3(0, 1.2, -4.5),
    name: 'Research Lab (Researcher)'
  },
  engineer: {
    pos: new THREE.Vector3(9, 7, 2),
    target: new THREE.Vector3(9, 1.2, -4.5),
    name: 'Engineer Bay (Engineer)'
  },
  memory: {
    pos: new THREE.Vector3(-8, 7, 12),
    target: new THREE.Vector3(-8, 1.2, 6.0),
    name: 'Memory Vault (Archivist)'
  },
  lounge: {
    pos: new THREE.Vector3(8, 7, 12),
    target: new THREE.Vector3(8, 1.2, 6.0),
    name: 'Pantry Lounge'
  }
});

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.controls = new OrbitControls(camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Mencegah kamera tembus ke bawah lantai
    this.controls.minDistance = 4;
    this.controls.maxDistance = 45;

    // Smooth transition state
    this.isTransitioning = false;
    this.targetPos = new THREE.Vector3();
    this.targetLookAt = new THREE.Vector3();
    this.transitionSpeed = 4.0;

    // Set initial overview
    this.applyPreset('overview', false);
  }

  applyPreset(presetKey, smooth = true) {
    const preset = CAMERA_PRESETS[presetKey];
    if (!preset) return;

    if (!smooth) {
      this.camera.position.copy(preset.pos);
      this.controls.target.copy(preset.target);
      this.controls.update();
      this.isTransitioning = false;
    } else {
      this.targetPos.copy(preset.pos);
      this.targetLookAt.copy(preset.target);
      this.isTransitioning = true;
    }
  }

  focusOnAgent(agentPosition, smooth = true) {
    const offset = new THREE.Vector3(0, 5, 6);
    const pos = new THREE.Vector3().copy(agentPosition).add(offset);
    const look = new THREE.Vector3().copy(agentPosition).add(new THREE.Vector3(0, 1.0, 0));

    if (!smooth) {
      this.camera.position.copy(pos);
      this.controls.target.copy(look);
      this.controls.update();
      this.isTransitioning = false;
    } else {
      this.targetPos.copy(pos);
      this.targetLookAt.copy(look);
      this.isTransitioning = true;
    }
  }

  update(delta) {
    if (this.isTransitioning) {
      const t = Math.min(1.0, delta * this.transitionSpeed);
      this.camera.position.lerp(this.targetPos, t);
      this.controls.target.lerp(this.targetLookAt, t);

      if (
        this.camera.position.distanceTo(this.targetPos) < 0.1 &&
        this.controls.target.distanceTo(this.targetLookAt) < 0.1
      ) {
        this.camera.position.copy(this.targetPos);
        this.controls.target.copy(this.targetLookAt);
        this.isTransitioning = false;
      }
    }

    this.controls.update();
  }
}

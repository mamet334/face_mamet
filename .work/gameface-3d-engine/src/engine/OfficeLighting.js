/**
 * OfficeLighting.js
 * Pencahayaan modern untuk 3D Living Office
 * Memberikan bayangan halus, pendaran terminal, dan penyorotan workspace
 */

import * as THREE from 'three';

export class OfficeLighting {
  constructor(scene) {
    this.scene = scene;
    this.roomLights = new Map();
    this.setupLighting();
  }

  setupLighting() {
    // 1. Ambient Light lembut
    const ambientLight = new THREE.AmbientLight(0xcfd8dc, 0.75);
    this.scene.add(ambientLight);

    // 2. Hemisphere Light untuk gradien langit-ke-lantai
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.5);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    // 3. Directional Sun Light (Sumber bayangan isometrik utama)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.3);
    sunLight.position.set(16, 24, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // 4. Room Spotlights / Point Lights untuk aksen ruangan
    this.addRoomAccent('command', -9, 4, -5, 0x3b82f6);
    this.addRoomAccent('research', 0, 4, -5, 0x06b6d4);
    this.addRoomAccent('engineer', 9, 4, -5, 0x8b5cf6);
    this.addRoomAccent('memory', -8, 4, 6, 0x10b981);
    this.addRoomAccent('lounge', 8, 4, 6, 0xf59e0b);
  }

  addRoomAccent(roomKey, x, y, z, color) {
    const light = new THREE.PointLight(color, 1.2, 12, 1.8);
    light.position.set(x, y, z);
    this.scene.add(light);
    this.roomLights.set(roomKey, light);
  }

  updateWorkspaceHighlights(activeRooms = []) {
    for (const [roomKey, light] of this.roomLights.entries()) {
      const isActive = activeRooms.includes(roomKey);
      light.intensity = isActive ? 1.5 : 0.3;
    }
  }
}

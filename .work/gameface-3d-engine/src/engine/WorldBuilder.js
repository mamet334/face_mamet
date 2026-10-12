/**
 * WorldBuilder.js
 * Membangun lingkungan kantor 3D Stylized Low-Poly Living Office
 * Ruangan: Command Center, Research Desk, Engineer Bay, Memory Vault, dan Pantry Lounge
 */

import * as THREE from 'three';

export class WorldBuilder {
  constructor(scene) {
    this.scene = scene;
    this.roomGroups = new Map(); // roomKey -> THREE.Group
    this.roomFloors = new Map(); // roomKey -> THREE.Mesh (untuk highlight workspace)
    this.emissiveScreens = [];
    this.buildWorld();
  }

  buildWorld() {
    this.buildMainFloor();
    this.buildCommandCenter();
    this.buildResearchRoom();
    this.buildEngineerBay();
    this.buildMemoryVault();
    this.buildPantryLounge();
    this.buildCorridorsAndDecorations();
  }

  buildMainFloor() {
    // Lantai dasar kantor luas
    const floorGeo = new THREE.PlaneGeometry(36, 26);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x0f172a }); // Dark sleek slate
    const mainFloor = new THREE.Mesh(floorGeo, floorMat);
    mainFloor.rotation.x = -Math.PI / 2;
    mainFloor.receiveShadow = true;
    this.scene.add(mainFloor);

    // Grid garis lantai halus (Smart Office grid lines)
    const grid = new THREE.GridHelper(36, 36, 0x334155, 0x1e293b);
    grid.position.y = 0.01;
    this.scene.add(grid);
  }

  createRoomCarpet(name, x, z, width, depth, color) {
    const carpetGeo = new THREE.PlaneGeometry(width, depth);
    const carpetMat = new THREE.MeshLambertMaterial({
      color,
      transparent: true,
      opacity: 0.95
    });
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(x, 0.02, z);
    carpet.receiveShadow = true;
    this.scene.add(carpet);

    this.roomFloors.set(name, carpet);
    return carpet;
  }

  createLowWall(x, z, width, depth, height = 1.0) {
    const wallGeo = new THREE.BoxGeometry(width, height, depth);
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(x, height / 2, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.scene.add(wall);
    return wall;
  }

  createDesk(x, z, width = 2.4, depth = 1.2, topColor = 0xe2e8f0) {
    const deskGroup = new THREE.Group();
    deskGroup.position.set(x, 0, z);

    // Daun Meja Kayu/Slate
    const topGeo = new THREE.BoxGeometry(width, 0.1, depth);
    const topMat = new THREE.MeshLambertMaterial({ color: topColor });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 0.85;
    top.castShadow = true;
    top.receiveShadow = true;
    deskGroup.add(top);

    // Kaki Meja Besi Hitam
    const legGeo = new THREE.BoxGeometry(0.1, 0.85, 0.1);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const legOffsets = [
      [-width / 2 + 0.1, -depth / 2 + 0.1],
      [width / 2 - 0.1, -depth / 2 + 0.1],
      [-width / 2 + 0.1, depth / 2 - 0.1],
      [width / 2 - 0.1, depth / 2 - 0.1]
    ];
    legOffsets.forEach(([ox, oz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(ox, 0.425, oz);
      leg.castShadow = true;
      deskGroup.add(leg);
    });

    this.scene.add(deskGroup);
    return deskGroup;
  }

  createMonitor(x, y, z, rotY = 0, emissiveColor = 0x38bdf8) {
    const monGroup = new THREE.Group();
    monGroup.position.set(x, y, z);
    monGroup.rotation.y = rotY;

    // Stand
    const standMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    const baseGeo = new THREE.BoxGeometry(0.3, 0.02, 0.25);
    const base = new THREE.Mesh(baseGeo, standMat);
    monGroup.add(base);

    const poleGeo = new THREE.BoxGeometry(0.06, 0.35, 0.06);
    const pole = new THREE.Mesh(poleGeo, standMat);
    pole.position.y = 0.18;
    monGroup.add(pole);

    // Screen Bezel
    const screenGeo = new THREE.BoxGeometry(1.0, 0.6, 0.06);
    const screenMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.45, 0);
    monGroup.add(screen);

    // Glowing Display
    const dispGeo = new THREE.BoxGeometry(0.94, 0.54, 0.02);
    const dispMat = new THREE.MeshLambertMaterial({
      color: emissiveColor,
      emissive: emissiveColor,
      emissiveIntensity: 0.6
    });
    const disp = new THREE.Mesh(dispGeo, dispMat);
    disp.position.set(0, 0.45, 0.035);
    monGroup.add(disp);
    this.emissiveScreens.push(disp);

    this.scene.add(monGroup);
    return monGroup;
  }

  createPlant(x, z) {
    const plantGroup = new THREE.Group();
    plantGroup.position.set(x, 0, z);

    // Pot Keramik Putih
    const potGeo = new THREE.CylinderGeometry(0.3, 0.22, 0.5, 8);
    const potMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.25;
    pot.castShadow = true;
    plantGroup.add(pot);

    // Daun Monstera / Ficus Hijau Segar
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x15803d });
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const leafGeo = new THREE.BoxGeometry(0.4, 0.1, 0.25);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(Math.cos(angle) * 0.2, 0.55 + (i * 0.08), Math.sin(angle) * 0.2);
      leaf.rotation.y = angle;
      leaf.rotation.z = 0.4;
      leaf.castShadow = true;
      plantGroup.add(leaf);
    }

    this.scene.add(plantGroup);
    return plantGroup;
  }

  // === 1. COMMAND CENTER ===
  buildCommandCenter() {
    const group = new THREE.Group();
    this.roomGroups.set('command', group);

    // Carpet Biru Elegan
    this.createRoomCarpet('command', -9, -5, 8, 7, 0x1e293b);

    // Meja Kerja Mamet
    this.createDesk(-9, -5.2, 3.2, 1.4, 0x334155);

    // Monitor Utama & Dashboard
    this.createMonitor(-9, 0.9, -5.3, 0, 0x3b82f6);
    this.createMonitor(-10.2, 0.9, -5.2, 0.35, 0x60a5fa);
    this.createMonitor(-7.8, 0.9, -5.2, -0.35, 0x60a5fa);

    // Kursi Kerja
    this.createChair(-9, 0, -4.2, 0);

    // Papan Strategi / Whiteboard di Dinding Belakang
    const boardGeo = new THREE.BoxGeometry(3.5, 1.6, 0.08);
    const boardMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(-9, 2.0, -8.4);
    board.castShadow = true;
    this.scene.add(board);

    // Tanaman Hias Sudut
    this.createPlant(-12.2, -7.8);

    // Dinding Pembatas Belakang & Samping
    this.createLowWall(-9, -8.5, 8.5, 0.3, 1.4);
    this.createLowWall(-13.2, -5, 0.3, 7.2, 1.4);
  }

  // === 2. RESEARCH ROOM ===
  buildResearchRoom() {
    const group = new THREE.Group();
    this.roomGroups.set('research', group);

    // Carpet Cyan RAG
    this.createRoomCarpet('research', 0, -5, 7, 7, 0x083344);

    // Meja Riset
    this.createDesk(0, -5.2, 2.8, 1.4, 0xf1f5f9);

    // Dual Monitor Analisis RAG
    this.createMonitor(-0.6, 0.9, -5.3, 0.15, 0x06b6d4);
    this.createMonitor(0.6, 0.9, -5.3, -0.15, 0x22d3ee);

    // Rak Buku / Dokumen Riset di Dinding Belakang
    const shelfGeo = new THREE.BoxGeometry(3.2, 2.2, 0.6);
    const shelfMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(0, 1.1, -8.2);
    shelf.castShadow = true;
    this.scene.add(shelf);

    // Buku-buku warna-warni di rak
    const bookColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6];
    for (let i = 0; i < 8; i++) {
      const bGeo = new THREE.BoxGeometry(0.12, 0.45, 0.4);
      const bMat = new THREE.MeshLambertMaterial({ color: bookColors[i % bookColors.length] });
      const book = new THREE.Mesh(bGeo, bMat);
      book.position.set(-1.1 + (i * 0.3), 1.3, -8.0);
      this.scene.add(book);
    }

    this.createChair(0, 0, -4.2, 0);
    this.createPlant(3.0, -7.8);
    this.createLowWall(0, -8.5, 7.5, 0.3, 1.4);
  }

  // === 3. ENGINEER BAY ===
  buildEngineerBay() {
    const group = new THREE.Group();
    this.roomGroups.set('engineer', group);

    // Carpet Ungu Developer
    this.createRoomCarpet('engineer', 9, -5, 8, 7, 0x2e1065);

    // Meja Coding Engineer
    this.createDesk(9, -5.2, 3.2, 1.4, 0x1e1b4b);

    // Curved Triple Monitor Setup
    this.createMonitor(9, 0.9, -5.4, 0, 0x8b5cf6);
    this.createMonitor(7.8, 0.9, -5.3, 0.4, 0xa855f7);
    this.createMonitor(10.2, 0.9, -5.3, -0.4, 0xa855f7);

    // Server Racks dengan Lampu Indikator Berkedip
    for (let r = 0; r < 2; r++) {
      const rackGeo = new THREE.BoxGeometry(1.2, 2.4, 0.8);
      const rackMat = new THREE.MeshLambertMaterial({ color: 0x09090b });
      const rack = new THREE.Mesh(rackGeo, rackMat);
      rack.position.set(7.5 + (r * 2.0), 1.2, -8.1);
      rack.castShadow = true;
      this.scene.add(rack);

      // LED Blinking strips
      const ledGeo = new THREE.BoxGeometry(0.8, 0.05, 0.02);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      for (let l = 0; l < 4; l++) {
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(7.5 + (r * 2.0), 0.6 + (l * 0.4), -7.69);
        this.scene.add(led);
      }
    }

    this.createChair(9, 0, -4.2, 0);
    this.createPlant(12.2, -7.8);
    this.createLowWall(9, -8.5, 8.5, 0.3, 1.4);
    this.createLowWall(13.2, -5, 0.3, 7.2, 1.4);
  }

  // === 4. MEMORY VAULT ===
  buildMemoryVault() {
    const group = new THREE.Group();
    this.roomGroups.set('memory', group);

    // Carpet Hijau Emerald Memory
    this.createRoomCarpet('memory', -8, 6, 8, 8, 0x064e3b);

    // Meja Archivist
    this.createDesk(-8, 6.2, 2.6, 1.4, 0x022c22);
    this.createMonitor(-8, 0.9, 6.4, Math.PI, 0x10b981);
    this.createChair(-8, 0, 5.2, Math.PI);

    // Lemari Vault & Data Crystals
    const vaultGeo = new THREE.BoxGeometry(3.6, 2.2, 0.8);
    const vaultMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const vault = new THREE.Mesh(vaultGeo, vaultMat);
    vault.position.set(-8, 1.1, 9.5);
    vault.castShadow = true;
    this.scene.add(vault);

    // Kristal Memori Bercahaya
    const crystalGeo = new THREE.OctahedronGeometry(0.35);
    const crystalMat = new THREE.MeshLambertMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.85
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.set(-8, 2.6, 9.5);
    this.scene.add(crystal);
    this.emissiveScreens.push(crystal);

    this.createPlant(-11.5, 8.5);
    this.createLowWall(-8, 10.1, 8.5, 0.3, 1.4);
    this.createLowWall(-12.2, 6, 0.3, 8.2, 1.4);
  }

  // === 5. PANTRY & BREAK LOUNGE ===
  buildPantryLounge() {
    const group = new THREE.Group();
    this.roomGroups.set('lounge', group);

    // Lantai Kayu Oak / Cozy Warm Rug
    this.createRoomCarpet('lounge', 8, 6, 9, 8, 0x451a03);

    // Sofa Empuk L-Shaped Santai
    const sofaMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
    // Dudukan sofa 1
    const sofaGeo1 = new THREE.BoxGeometry(3.4, 0.45, 1.2);
    const sofa1 = new THREE.Mesh(sofaGeo1, sofaMat);
    sofa1.position.set(7.5, 0.25, 7.5);
    sofa1.castShadow = true;
    this.scene.add(sofa1);

    // Sandaran sofa 1
    const backGeo1 = new THREE.BoxGeometry(3.4, 0.7, 0.3);
    const back1 = new THREE.Mesh(backGeo1, sofaMat);
    back1.position.set(7.5, 0.65, 8.0);
    this.scene.add(back1);

    // Meja Kopi / Coffee Table
    const tableGeo = new THREE.BoxGeometry(2.0, 0.35, 1.0);
    const tableMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const coffeeTable = new THREE.Mesh(tableGeo, tableMat);
    coffeeTable.position.set(7.5, 0.2, 5.8);
    coffeeTable.castShadow = true;
    this.scene.add(coffeeTable);

    // Counter Bar Mesin Kopi
    const barGeo = new THREE.BoxGeometry(2.8, 1.0, 1.0);
    const barMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(10.5, 0.5, 4.0);
    bar.castShadow = true;
    this.scene.add(bar);

    // Mesin Espresso / Kopi 3D
    const coffeeMachineGeo = new THREE.BoxGeometry(0.7, 0.6, 0.6);
    const coffeeMachineMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    const coffeeMachine = new THREE.Mesh(coffeeMachineGeo, coffeeMachineMat);
    coffeeMachine.position.set(10.5, 1.3, 4.0);
    this.scene.add(coffeeMachine);

    this.createPlant(12.0, 8.5);
    this.createPlant(4.0, 8.5);
    this.createLowWall(8, 10.1, 9.5, 0.3, 1.4);
    this.createLowWall(12.7, 6, 0.3, 8.2, 1.4);
  }

  createChair(x, y, z, rotY = 0) {
    const chairGroup = new THREE.Group();
    chairGroup.position.set(x, y, z);
    chairGroup.rotation.y = rotY;

    const seatGeo = new THREE.BoxGeometry(0.65, 0.1, 0.65);
    const seatMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.y = 0.5;
    chairGroup.add(seat);

    const backGeo = new THREE.BoxGeometry(0.65, 0.65, 0.1);
    const back = new THREE.Mesh(backGeo, seatMat);
    back.position.set(0, 0.8, -0.28);
    chairGroup.add(back);

    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6);
    const leg = new THREE.Mesh(legGeo, seatMat);
    leg.position.y = 0.25;
    chairGroup.add(leg);

    this.scene.add(chairGroup);
  }

  buildCorridorsAndDecorations() {
    // Tanaman pembatas koridor tengah
    this.createPlant(-4.0, 0.0);
    this.createPlant(4.0, 0.0);
  }

  highlightWorkspaceRooms(activeRooms = []) {
    // Atur saturasi atau opacity karpet ruangan sesuai workspace aktif
    for (const [roomKey, carpet] of this.roomFloors.entries()) {
      const isActive = activeRooms.includes(roomKey);
      if (isActive) {
        carpet.material.opacity = 1.0;
      } else {
        carpet.material.opacity = 0.25; // Dimmed off-scope
      }
    }
  }
}

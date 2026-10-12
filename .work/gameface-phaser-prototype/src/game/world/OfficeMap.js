/**
 * OfficeMap.js
 * Visual Layout dan Render Ruangan Kantor Virtual dalam Phaser 2D
 */
import { ROOM_DEFINITIONS } from '../../activity/ActivityTypes.js';

export class OfficeMap {
  constructor(scene) {
    this.scene = scene;
    this.rooms = ROOM_DEFINITIONS;
    this.interactiveZones = [];
    this.graphics = scene.add.graphics();
    this.decorations = scene.add.container(0, 0);
    this.modeOverlayGraphics = scene.add.graphics();
    this.modeOverlayGraphics.setDepth(20);
    this.modeTextContainer = scene.add.container(0, 0);
    this.modeTextContainer.setDepth(21);
    this.currentMode = 'global';
  }

  build() {
    this.renderFloorAndGrid();
    this.renderCorridors();
    this.renderRooms();
    this.renderRoomFurniture();
    this.setupInteractivity();
  }

  renderFloorAndGrid() {
    const { width, height } = this.scene.scale;
    const g = this.graphics;

    // Background gradient effect
    g.fillStyle(0x07111a, 1);
    g.fillRect(0, 0, width, height);

    // Subtle grid lines (32px)
    g.lineStyle(1, 0x102838, 0.4);
    for (let x = 0; x < width; x += 32) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, height);
      g.stroke();
    }
    for (let y = 0; y < height; y += 32) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(width, y);
      g.stroke();
    }
  }

  renderCorridors() {
    const g = this.graphics;

    // Main Hallway Spine (horizontal corridor at y: 310-350)
    g.fillStyle(0x0b202d, 0.85);
    g.fillRoundedRect(120, 310, 720, 44, 8);
    g.lineStyle(1.5, 0x1e455c, 0.7);
    g.strokeRoundedRect(120, 310, 720, 44, 8);

    // Hallway pathway guide dotted lines
    g.lineStyle(2, 0x2a607f, 0.5);
    // Connect doors to main hallway
    const verticalConnectors = [
      { x: 180, y1: 275, y2: 310 }, // Command
      { x: 480, y1: 275, y2: 310 }, // Research
      { x: 780, y1: 275, y2: 310 }, // Engineer
      { x: 210, y1: 354, y2: 390 }, // Memory
      { x: 480, y1: 354, y2: 390 }, // Pantry & Lounge
      { x: 750, y1: 354, y2: 390 }  // Knowledge
    ];

    verticalConnectors.forEach(({ x, y1, y2 }) => {
      g.beginPath();
      g.moveTo(x, y1);
      g.lineTo(x, y2);
      g.stroke();
    });
  }

  renderRooms() {
    const g = this.graphics;

    Object.entries(this.rooms).forEach(([key, r]) => {
      if (key === 'alert') return; // Alert station rendered in hallway center

      const hexColor = parseInt(r.color.replace('#', '0x'), 16);
      const rx = r.x - r.w / 2;
      const ry = r.y - r.h / 2;

      // Room floor
      g.fillStyle(0x0c2230, 0.95);
      g.fillRoundedRect(rx, ry, r.w, r.h, 14);

      // Room border with theme color
      g.lineStyle(2, hexColor, 0.65);
      g.strokeRoundedRect(rx, ry, r.w, r.h, 14);

      // Door opening indicator
      const doorWidth = 36;
      const doorX = r.x - doorWidth / 2;
      const doorY = r.y > 300 ? ry - 2 : ry + r.h - 2;
      g.fillStyle(0x0b202d, 1);
      g.fillRect(doorX, doorY, doorWidth, 4);
      g.lineStyle(2, hexColor, 1);
      g.strokeRect(doorX, doorY, doorWidth, 4);

      // Room Title Label
      const title = this.scene.add.text(rx + 14, ry + 12, r.label.toUpperCase(), {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: r.color
      });

      const subtitle = this.scene.add.text(rx + 14, ry + 28, r.sublabel, {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '9px',
        color: '#7fa1af'
      });

      this.decorations.add([title, subtitle]);
    });

    // Alert Station in Central Hallway
    g.fillStyle(0x281218, 0.9);
    g.fillCircle(480, 332, 22);
    g.lineStyle(2, 0xff7f88, 0.8);
    g.strokeCircle(480, 332, 22);

    const alertIcon = this.scene.add.text(480, 332, '!', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ff7f88'
    }).setOrigin(0.5);
    this.decorations.add(alertIcon);
  }

  renderRoomFurniture() {
    const g = this.graphics;

    // 1. Command Center Furniture (Desk & Monitors)
    g.fillStyle(0x133649, 1);
    g.fillRoundedRect(130, 185, 100, 38, 6);
    g.fillStyle(0x57d7e6, 0.85);
    g.fillRect(145, 192, 45, 18); // Main console
    g.fillStyle(0x9fe8f2, 1);
    g.fillRect(200, 195, 20, 6); // Keyboard

    // 2. Research Room Furniture (Bookshelves & Study Table)
    g.fillStyle(0x432a68, 1);
    g.fillRoundedRect(420, 175, 40, 55, 4); // Bookshelf
    g.fillStyle(0xd5b8ff, 0.8);
    g.fillRect(426, 185, 28, 5);
    g.fillRect(426, 198, 28, 5);
    g.fillRect(426, 211, 28, 5);

    g.fillStyle(0x1d3648, 1);
    g.fillRoundedRect(475, 185, 65, 36, 6); // Desk

    // 3. Engineer Room Furniture (Workstation & Server Rack)
    g.fillStyle(0x192b38, 1);
    g.fillRoundedRect(720, 180, 75, 40, 6); // Code Desk
    g.fillStyle(0xffd479, 0.9);
    g.fillRect(735, 188, 28, 16); // Screen 1
    g.fillStyle(0x72e6a1, 0.9);
    g.fillRect(768, 188, 20, 16); // Screen 2

    // Server Rack
    g.fillStyle(0x122430, 1);
    g.fillRoundedRect(815, 170, 35, 55, 4);
    g.fillStyle(0x72e6a1, 0.85);
    g.fillCircle(823, 182, 2.5); // LED green
    g.fillCircle(823, 194, 2.5);
    g.fillStyle(0xff7f88, 0.85);
    g.fillCircle(823, 206, 2.5); // LED red

    // 4. Memory Room Furniture (Vault Storage Cubes)
    for (let i = 0; i < 3; i++) {
      g.fillStyle(0x18443b, 1);
      g.fillRoundedRect(140 + i * 44, 445, 34, 40, 5);
      g.fillStyle(0x72e6a1, 0.7);
      g.fillRect(147 + i * 44, 455, 20, 4);
      g.fillRect(147 + i * 44, 467, 20, 4);
    }

    // 5. Pantry & Break Lounge Furniture (Sofa, Coffee Bar, Water Dispenser)
    // Cozy Lounge Sofa
    g.fillStyle(0x381825, 1);
    g.fillRoundedRect(415, 450, 65, 36, 6); // Sofa base
    g.fillStyle(0x5c253b, 1);
    g.fillRoundedRect(418, 453, 59, 16, 4); // Cushion
    g.fillStyle(0xff9fc7, 0.8);
    g.fillCircle(427, 472, 3.5); // Pillow 1
    g.fillCircle(468, 472, 3.5); // Pillow 2

    // Coffee Counter & Machine
    g.fillStyle(0x192733, 1);
    g.fillRoundedRect(495, 442, 60, 46, 5);
    g.fillStyle(0xd57b93, 0.95);
    g.fillRect(505, 448, 16, 18); // Coffee maker
    g.fillStyle(0x57d7e6, 0.9);
    g.fillRect(528, 448, 14, 22); // Water dispenser (blue)
    g.fillStyle(0xffffff, 0.8);
    g.fillRect(508, 470, 7, 6); // Coffee cup

    // Meja Santai Tengah (Coffee Table & Magazine)
    g.fillStyle(0x221a28, 1);
    g.fillRoundedRect(460, 502, 45, 24, 4); // Meja kayu kecil
    g.fillStyle(0x8a5cb8, 0.85);
    g.fillRect(465, 507, 14, 12); // Majalah/buku riset
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(492, 513, 3); // Cangkir teh kecil

    // Tanaman Hias Sudut Pantry (Potted Plant)
    g.fillStyle(0x5c3d28, 1);
    g.fillRect(404, 432, 10, 10); // Pot cokelat
    g.fillStyle(0x4ade80, 0.9);
    g.fillCircle(409, 429, 6); // Daun hijau rimbun

    // 6. Knowledge Graph Room Furniture (Graph Nodes Matrix)
    g.fillStyle(0x122b3b, 1);
    g.fillRoundedRect(685, 440, 110, 48, 8); // Interactive Table
    g.lineStyle(1.5, 0x7db8ff, 0.7);
    const nodes = [
      [705, 460], [740, 450], [775, 465], [735, 475]
    ];
    nodes.forEach(([x, y]) => {
      g.fillStyle(0x57d7e6, 1);
      g.fillCircle(x, y, 4);
    });
    g.beginPath();
    g.moveTo(705, 460);
    g.lineTo(740, 450);
    g.lineTo(775, 465);
    g.lineTo(735, 475);
    g.lineTo(705, 460);
    g.stroke();
  }

  setupInteractivity() {
    Object.entries(this.rooms).forEach(([key, r]) => {
      const rx = r.x - r.w / 2;
      const ry = r.y - r.h / 2;
      const zone = this.scene.add.zone(r.x, r.y, r.w, r.h).setInteractive({ useHandCursor: true });

      zone.on('pointerdown', () => {
        this.scene.events.emit('roomSelected', key);
      });

      this.interactiveZones.push(zone);
    });
  }

  setWorkspaceMode(wsDef) {
    if (!wsDef) return;
    this.currentMode = wsDef.id;
    this.modeOverlayGraphics.clear();
    this.modeTextContainer.removeAll(true);

    if (wsDef.id === 'global') {
      return; // Mode Global: seluruh ruangan 100% aktif tanpa peredupan
    }

    const activeRooms = new Set(wsDef.activeRooms || []);

    Object.entries(this.rooms).forEach(([key, r]) => {
      if (key === 'alert') return;
      const rx = r.x - r.w / 2;
      const ry = r.y - r.h / 2;

      if (!activeRooms.has(key)) {
        // Redupkan ruangan yang di luar cakupan workspace aktif
        this.modeOverlayGraphics.fillStyle(0x040c14, 0.72);
        this.modeOverlayGraphics.fillRoundedRect(rx, ry, r.w, r.h, 14);
        this.modeOverlayGraphics.lineStyle(1.5, 0x1a3344, 0.5);
        this.modeOverlayGraphics.strokeRoundedRect(rx, ry, r.w, r.h, 14);

        // Badge OFF-SCOPE di tengah ruangan
        const offBadgeBg = this.scene.add.graphics();
        offBadgeBg.fillStyle(0x081521, 0.88);
        offBadgeBg.fillRoundedRect(r.x - 42, r.y - 12, 84, 24, 6);
        offBadgeBg.lineStyle(1, 0x334e61, 0.8);
        offBadgeBg.strokeRoundedRect(r.x - 42, r.y - 12, 84, 24, 6);

        const offText = this.scene.add.text(r.x, r.y, 'OFF-SCOPE', {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '9px',
          fontStyle: 'bold',
          color: '#527282'
        }).setOrigin(0.5);

        this.modeTextContainer.add([offBadgeBg, offText]);
      } else {
        // Ruangan aktif: sorot border glowing workspace
        const hexColor = parseInt(wsDef.color.replace('#', '0x'), 16);
        this.modeOverlayGraphics.lineStyle(2.5, hexColor, 0.95);
        this.modeOverlayGraphics.strokeRoundedRect(rx - 2, ry - 2, r.w + 4, r.h + 4, 16);

        // Badge ACTIVE SCOPE di pojok kanan atas ruangan
        const actBadgeBg = this.scene.add.graphics();
        actBadgeBg.fillStyle(hexColor, 0.2);
        actBadgeBg.fillRoundedRect(rx + r.w - 82, ry + 8, 74, 18, 4);
        actBadgeBg.lineStyle(1, hexColor, 0.9);
        actBadgeBg.strokeRoundedRect(rx + r.w - 82, ry + 8, 74, 18, 4);

        const actText = this.scene.add.text(rx + r.w - 45, ry + 17, '● ACTIVE', {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '8px',
          fontStyle: 'bold',
          color: wsDef.color
        }).setOrigin(0.5);

        this.modeTextContainer.add([actBadgeBg, actText]);
      }
    });
  }
}


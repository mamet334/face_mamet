/**
 * BootScene.js
 * Scene inisialisasi, memuat aset, dan membuat animasi sprite
 */
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Tampilan Loading Bar
    const { width, height } = this.scale;
    const progressText = this.add.text(width / 2, height / 2 - 20, 'INITIALIZING MAMET LIVING OFFICE...', {
      fontFamily: 'Inter, system-ui, monospace',
      fontSize: '12px',
      color: '#57d7e6',
      letterSpacing: 2
    }).setOrigin(0.5);

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x0e2433, 0.8);
    progressBox.fillRoundedRect(width / 2 - 120, height / 2 + 10, 240, 10, 4);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x57d7e6, 1);
      progressBar.fillRoundedRect(width / 2 - 118, height / 2 + 12, 236 * value, 6, 2);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      progressText.destroy();
    });
  }

  create() {
    // Pindah ke OfficeScene (Menggunakan procedural Human Characters)
    this.scene.start('OfficeScene');
  }
}

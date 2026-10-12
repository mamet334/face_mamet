/**
 * config.js
 * Konfigurasi resmi Phaser Game untuk Mamet Living Office
 */
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { OfficeScene } from './scenes/OfficeScene.js';

export function createGameConfig(parentElement) {
  return {
    type: Phaser.AUTO,
    parent: parentElement,
    width: 960,
    height: 600,
    backgroundColor: '#07111a',
    pixelArt: false,
    antialias: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, OfficeScene],
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    }
  };
}

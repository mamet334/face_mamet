/**
 * main.js
 * Entry point bootstrap untuk 3D Living Office Engine
 */

import './ui/style.css';
import { Office3DScene } from './engine/Office3DScene.js';
import { OfficeHUD } from './ui/OfficeHUD.js';
import { globalActivityBus } from './activity/ActivityBus.js';

window.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app-container');
  if (!appContainer) {
    console.error('App container element not found!');
    return;
  }

  // 1. Inisialisasi HUD
  // Buat kontainer untuk HUD dan Canvas
  const hud = new OfficeHUD(appContainer, null, globalActivityBus);

  // 2. Inisialisasi Three.js 3D Scene ke dalam #canvas-container
  const canvasContainer = document.getElementById('canvas-container');
  const scene3D = new Office3DScene(canvasContainer, globalActivityBus);

  // Sambungkan referensi scene ke HUD
  hud.scene = scene3D;

  console.log('🚀 [GameFace 3D Engine] Living Office initialized successfully at 60 FPS.');
});

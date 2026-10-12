/**
 * HumanCharacter3D.js
 * Model 3D manusia ekspresif stylized low-poly untuk 5 anggota Tim Mamet Office
 * Memiliki hierarki sendi (arms, legs, head) untuk animasi jalan, mengetik, ngopi, tidur Zzz, dan kurir berkas.
 */

import * as THREE from 'three';
import { AGENT_SPECS } from '../activity/ActivityTypes.js';

export class HumanCharacter3D {
  constructor(agentId, options = {}) {
    this.agentId = agentId;
    this.spec = AGENT_SPECS[agentId] || AGENT_SPECS.mamet;
    this.name = this.spec.name;
    this.isCarryingFolder = false;

    this.group = new THREE.Group();
    this.group.name = `Agent_${this.agentId}`;

    // Joint references untuk animasi
    this.joints = {};

    this.buildCharacterMesh();
    this.buildFolderMesh();
    this.buildStatusOverlays();
  }

  buildCharacterMesh() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    const shirtMat = new THREE.MeshLambertMaterial({ color: this.spec.shirtColor });
    const pantsMat = new THREE.MeshLambertMaterial({ color: this.spec.pantsColor });
    const hairMat = new THREE.MeshLambertMaterial({ color: this.spec.hairColor });
    const shoesMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    // Root Body Container (berdiri di atas tanah)
    const bodyRoot = new THREE.Group();
    bodyRoot.position.y = 0.65;
    this.joints.bodyRoot = bodyRoot;
    this.group.add(bodyRoot);

    // 1. Torso / Badan
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.75, 0.45);
    const torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    torsoMesh.position.y = 0.4;
    bodyRoot.add(torsoMesh);
    this.joints.torso = torsoMesh;

    // Aksesoris Spesifik Baju
    if (this.agentId === 'mamet') {
      // ID Lanyard
      const lanyardGeo = new THREE.BoxGeometry(0.12, 0.35, 0.47);
      const lanyardMat = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
      const lanyardMesh = new THREE.Mesh(lanyardGeo, lanyardMat);
      lanyardMesh.position.set(0, 0.4, 0.01);
      bodyRoot.add(lanyardMesh);
    } else if (this.agentId === 'engineer') {
      // Hoodie Pocket
      const pocketGeo = new THREE.BoxGeometry(0.45, 0.22, 0.47);
      const pocketMat = new THREE.MeshLambertMaterial({ color: 0x6d28d9 });
      const pocketMesh = new THREE.Mesh(pocketGeo, pocketMat);
      pocketMesh.position.set(0, 0.25, 0.01);
      bodyRoot.add(pocketMesh);
    }

    // 2. Kepala & Wajah
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.95, 0);
    bodyRoot.add(headGroup);
    this.joints.head = headGroup;

    const headGeo = new THREE.BoxGeometry(0.58, 0.58, 0.58);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Rambut Stylized Low-Poly
    const hairGeo = new THREE.BoxGeometry(0.62, 0.25, 0.62);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.y = 0.22;
    headGroup.add(hairMesh);

    // Mata (Dua kubus kecil ekspresif)
    const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.05);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.16, 0.04, 0.29);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.16, 0.04, 0.29);
    headGroup.add(leftEye);
    headGroup.add(rightEye);

    // Kacamata / Headphone spesifik karakter
    if (this.agentId === 'engineer') {
      // Headphone
      const earCupGeo = new THREE.BoxGeometry(0.15, 0.25, 0.25);
      const earMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
      const leftCup = new THREE.Mesh(earCupGeo, earMat);
      leftCup.position.set(-0.33, 0.05, 0);
      const rightCup = new THREE.Mesh(earCupGeo, earMat);
      rightCup.position.set(0.33, 0.05, 0);
      headGroup.add(leftCup);
      headGroup.add(rightCup);

      const bandGeo = new THREE.BoxGeometry(0.66, 0.08, 0.1);
      const bandMesh = new THREE.Mesh(bandGeo, earMat);
      bandMesh.position.y = 0.36;
      headGroup.add(bandMesh);
    } else if (this.agentId === 'researcher') {
      // Kacamata Baca
      const glassMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
      const glassGeo = new THREE.BoxGeometry(0.48, 0.12, 0.06);
      const glasses = new THREE.Mesh(glassGeo, glassMat);
      glasses.position.set(0, 0.04, 0.3);
      headGroup.add(glasses);
    }

    // 3. Lengan Kiri (Pivot di bahu)
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.46, 0.68, 0);
    bodyRoot.add(leftArmPivot);
    this.joints.leftArm = leftArmPivot;

    const armGeo = new THREE.BoxGeometry(0.2, 0.55, 0.2);
    const leftArmMesh = new THREE.Mesh(armGeo, shirtMat);
    leftArmMesh.castShadow = true;
    leftArmMesh.position.y = -0.25;
    leftArmPivot.add(leftArmMesh);

    const handGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const leftHandMesh = new THREE.Mesh(handGeo, skinMat);
    leftHandMesh.position.y = -0.52;
    leftArmPivot.add(leftHandMesh);

    // 4. Lengan Kanan (Pivot di bahu)
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.46, 0.68, 0);
    bodyRoot.add(rightArmPivot);
    this.joints.rightArm = rightArmPivot;

    const rightArmMesh = new THREE.Mesh(armGeo, shirtMat);
    rightArmMesh.castShadow = true;
    rightArmMesh.position.y = -0.25;
    rightArmPivot.add(rightArmMesh);

    const rightHandMesh = new THREE.Mesh(handGeo, skinMat);
    rightHandMesh.position.y = -0.52;
    rightArmPivot.add(rightHandMesh);

    // 5. Kaki Kiri (Pivot di pinggul)
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.2, 0, 0);
    bodyRoot.add(leftLegPivot);
    this.joints.leftLeg = leftLegPivot;

    const legGeo = new THREE.BoxGeometry(0.24, 0.6, 0.26);
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.castShadow = true;
    leftLegMesh.position.y = -0.3;
    leftLegPivot.add(leftLegMesh);

    const shoeGeo = new THREE.BoxGeometry(0.26, 0.16, 0.36);
    const leftShoeMesh = new THREE.Mesh(shoeGeo, shoesMat);
    leftShoeMesh.position.set(0, -0.6, 0.05);
    leftLegPivot.add(leftShoeMesh);

    // 6. Kaki Kanan (Pivot di pinggul)
    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0.2, 0, 0);
    bodyRoot.add(rightLegPivot);
    this.joints.rightLeg = rightLegPivot;

    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.castShadow = true;
    rightLegMesh.position.y = -0.3;
    rightLegPivot.add(rightLegMesh);

    const rightShoeMesh = new THREE.Mesh(shoeGeo, shoesMat);
    rightShoeMesh.position.set(0, -0.6, 0.05);
    rightLegPivot.add(rightShoeMesh);
  }

  buildFolderMesh() {
    // Map Berkas Manila Fisik 3D yang dibawa kurir di tangannya
    const folderGroup = new THREE.Group();
    folderGroup.position.set(0, 0.35, 0.38);
    folderGroup.rotation.x = 0.2;

    // Cover Map (Warna Kuning-Oranye Manila Klasik)
    const folderMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const folderGeo = new THREE.BoxGeometry(0.48, 0.38, 0.08);
    const folderMesh = new THREE.Mesh(folderGeo, folderMat);
    folderMesh.castShadow = true;
    folderGroup.add(folderMesh);

    // Kertas Putih di dalam map yang sedikit menyembul keluar
    const paperMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const paperGeo = new THREE.BoxGeometry(0.44, 0.34, 0.09);
    const paperMesh = new THREE.Mesh(paperGeo, paperMat);
    paperMesh.position.set(0, 0.04, 0);
    folderGroup.add(paperMesh);

    // Label Map / TokenSaver Seal
    const sealMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const sealGeo = new THREE.BoxGeometry(0.12, 0.12, 0.1);
    const sealMesh = new THREE.Mesh(sealGeo, sealMat);
    sealMesh.position.set(0.14, 0.08, 0.01);
    folderGroup.add(sealMesh);

    folderGroup.visible = false;
    this.joints.torso.add(folderGroup);
    this.joints.folder = folderGroup;
  }

  buildStatusOverlays() {
    // 1. Floating Emojis / FX Container di atas kepala
    const fxGroup = new THREE.Group();
    fxGroup.position.set(0, 1.85, 0);
    this.group.add(fxGroup);
    this.joints.fxGroup = fxGroup;

    // Tanda Seru Kaget (!)
    const canvasExcl = document.createElement('canvas');
    canvasExcl.width = 64;
    canvasExcl.height = 64;
    const ctxEx = canvasExcl.getContext('2d');
    ctxEx.fillStyle = '#ef4444';
    ctxEx.beginPath();
    ctxEx.arc(32, 32, 28, 0, Math.PI * 2);
    ctxEx.fill();
    ctxEx.fillStyle = '#ffffff';
    ctxEx.font = 'bold 36px Arial';
    ctxEx.textAlign = 'center';
    ctxEx.textBaseline = 'middle';
    ctxEx.fillText('!', 32, 32);

    const texEx = new THREE.CanvasTexture(canvasExcl);
    const matEx = new THREE.SpriteMaterial({ map: texEx, depthTest: false });
    const spriteEx = new THREE.Sprite(matEx);
    spriteEx.scale.set(0.65, 0.65, 1);
    spriteEx.visible = false;
    fxGroup.add(spriteEx);
    this.joints.surprisedSprite = spriteEx;

    // Tidur Zzz
    const canvasZzz = document.createElement('canvas');
    canvasZzz.width = 128;
    canvasZzz.height = 64;
    const ctxZ = canvasZzz.getContext('2d');
    ctxZ.fillStyle = '#38bdf8';
    ctxZ.font = 'bold 32px Arial';
    ctxZ.textAlign = 'center';
    ctxZ.textBaseline = 'middle';
    ctxZ.fillText('Z z z', 64, 32);

    const texZ = new THREE.CanvasTexture(canvasZzz);
    const matZ = new THREE.SpriteMaterial({ map: texZ, depthTest: false });
    const spriteZ = new THREE.Sprite(matZ);
    spriteZ.scale.set(1.1, 0.55, 1);
    spriteZ.visible = false;
    fxGroup.add(spriteZ);
    this.joints.sleepSprite = spriteZ;

    // Cangkir Kopi (Relaxing)
    const canvasCoffee = document.createElement('canvas');
    canvasCoffee.width = 64;
    canvasCoffee.height = 64;
    const ctxC = canvasCoffee.getContext('2d');
    ctxC.fillStyle = '#10b981';
    ctxC.beginPath();
    ctxC.arc(32, 32, 28, 0, Math.PI * 2);
    ctxC.fill();
    ctxC.font = '30px Arial';
    ctxC.textAlign = 'center';
    ctxC.textBaseline = 'middle';
    ctxC.fillText('☕', 32, 32);

    const texC = new THREE.CanvasTexture(canvasCoffee);
    const matC = new THREE.SpriteMaterial({ map: texC, depthTest: false });
    const spriteC = new THREE.Sprite(matC);
    spriteC.scale.set(0.65, 0.65, 1);
    spriteC.visible = false;
    fxGroup.add(spriteC);
    this.joints.coffeeSprite = spriteC;

    // 2. Name Tag & Status Bubble
    this.updateSpeechBubble(`${this.name}`, '#64748b');
  }

  updateSpeechBubble(text, bgColor = '#1e293b') {
    if (this.joints.bubbleSprite) {
      this.group.remove(this.joints.bubbleSprite);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Rounded background pill
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(10, 8, 236, 48, 16);
    ctx.fill();

    // Border
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.spec.color;
    ctx.stroke();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(2.0, 0.5, 1);
    sprite.position.set(0, 2.3, 0);

    this.group.add(sprite);
    this.joints.bubbleSprite = sprite;
  }

  setCarryingFolder(carrying) {
    this.isCarryingFolder = !!carrying;
    if (this.joints.folder) {
      this.joints.folder.visible = this.isCarryingFolder;
    }
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  setRotationY(rad) {
    this.group.rotation.y = rad;
  }
}

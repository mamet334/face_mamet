/**
 * CharacterAnimator.js
 * Sistem animasi prosedural 3D untuk HumanCharacter3D
 * Menghasilkan gerakan natural: berjalan, mengetik, ngopi, tidur Zzz, dan kaget (!)
 */

import { AVATAR_STATE_ENUM } from '../state/AvatarStateMachine.js';

export class CharacterAnimator {
  constructor(character) {
    this.char = character;
    this.joints = character.joints;
    this.walkCycleTime = 0;
    this.animTime = 0;
  }

  update(delta, state, isCarryingFolder = false) {
    this.animTime += delta;

    // Reset status sprites visibility
    if (this.joints.surprisedSprite) this.joints.surprisedSprite.visible = (state === AVATAR_STATE_ENUM.SURPRISED);
    if (this.joints.sleepSprite) {
      this.joints.sleepSprite.visible = (state === AVATAR_STATE_ENUM.SLEEPING);
      if (this.joints.sleepSprite.visible) {
        // Floating Zzz bob
        this.joints.sleepSprite.position.y = Math.sin(this.animTime * 3) * 0.1;
      }
    }
    if (this.joints.coffeeSprite) this.joints.coffeeSprite.visible = (state === AVATAR_STATE_ENUM.RELAXING);

    switch (state) {
      case AVATAR_STATE_ENUM.WALKING:
        this.animateWalk(delta, isCarryingFolder);
        break;

      case AVATAR_STATE_ENUM.CODING:
      case AVATAR_STATE_ENUM.RESEARCHING:
      case AVATAR_STATE_ENUM.STORING:
      case AVATAR_STATE_ENUM.THINKING:
        this.animateWork(delta, state);
        break;

      case AVATAR_STATE_ENUM.RELAXING:
        this.animateRelax(delta);
        break;

      case AVATAR_STATE_ENUM.SLEEPING:
        this.animateSleep(delta);
        break;

      case AVATAR_STATE_ENUM.SURPRISED:
        this.animateSurprised(delta);
        break;

      case AVATAR_STATE_ENUM.IDLE:
      default:
        this.animateIdle(delta, isCarryingFolder);
        break;
    }
  }

  animateWalk(delta, isCarryingFolder) {
    const walkSpeed = 9.0;
    this.walkCycleTime += delta * walkSpeed;

    const legAngle = Math.sin(this.walkCycleTime) * 0.65;
    this.joints.leftLeg.rotation.x = legAngle;
    this.joints.rightLeg.rotation.x = -legAngle;

    // Body bob up and down
    this.joints.bodyRoot.position.y = 0.65 + Math.abs(Math.sin(this.walkCycleTime * 2)) * 0.08;

    if (isCarryingFolder) {
      // Dua tangan memegang map di depan dada
      this.joints.leftArm.rotation.x = -1.15;
      this.joints.leftArm.rotation.z = -0.25;
      this.joints.rightArm.rotation.x = -1.15;
      this.joints.rightArm.rotation.z = 0.25;
      this.joints.head.rotation.x = 0.05;
    } else {
      // Natural arm swing
      const armAngle = Math.sin(this.walkCycleTime) * 0.55;
      this.joints.leftArm.rotation.x = -armAngle;
      this.joints.leftArm.rotation.z = 0;
      this.joints.rightArm.rotation.x = armAngle;
      this.joints.rightArm.rotation.z = 0;
      this.joints.head.rotation.x = 0;
    }
  }

  animateWork(delta, state) {
    // Mengetik di depan keyboard/monitor
    const typeSpeed = 16.0;
    const typeBobLeft = Math.sin(this.animTime * typeSpeed) * 0.08;
    const typeBobRight = Math.cos(this.animTime * typeSpeed) * 0.08;

    this.joints.bodyRoot.position.y = 0.65;
    this.joints.leftLeg.rotation.x = 0;
    this.joints.rightLeg.rotation.x = 0;

    // Lengan ke depan meja
    this.joints.leftArm.rotation.x = -1.25 + typeBobLeft;
    this.joints.leftArm.rotation.z = -0.2;
    this.joints.rightArm.rotation.x = -1.25 + typeBobRight;
    this.joints.rightArm.rotation.z = 0.2;

    // Kepala agak menunduk melihat layar
    this.joints.head.rotation.x = 0.2 + Math.sin(this.animTime * 2) * 0.03;
  }

  animateRelax(delta) {
    // Santai / ngopi di lounge
    this.joints.bodyRoot.position.y = 0.65;
    this.joints.leftLeg.rotation.x = 0;
    this.joints.rightLeg.rotation.x = 0;

    // Tangan kanan mengangkat cangkir kopi secara berkala
    const sipProgress = (Math.sin(this.animTime * 1.5) + 1) * 0.5; // 0 to 1
    this.joints.rightArm.rotation.x = -0.8 - (sipProgress * 0.6); // Minum
    this.joints.rightArm.rotation.z = 0.3;

    // Tangan kiri rileks di samping
    this.joints.leftArm.rotation.x = -0.2;
    this.joints.leftArm.rotation.z = 0;

    // Kepala rileks
    this.joints.head.rotation.x = -0.1;
  }

  animateSleep(delta) {
    // Tidur nyenyak (posisi duduk menunduk atau bersandar)
    this.joints.bodyRoot.position.y = 0.62;
    this.joints.leftLeg.rotation.x = 0;
    this.joints.rightLeg.rotation.x = 0;

    this.joints.leftArm.rotation.x = -0.6;
    this.joints.leftArm.rotation.z = -0.1;
    this.joints.rightArm.rotation.x = -0.6;
    this.joints.rightArm.rotation.z = 0.1;

    // Kepala menunduk tidur dengan napas teratur
    const breathe = Math.sin(this.animTime * 1.8) * 0.04;
    this.joints.head.rotation.x = 0.35 + breathe;
  }

  animateSurprised(delta) {
    // Kaget bangun dari tidur/santai
    this.joints.bodyRoot.position.y = 0.78; // Lompat kecil
    this.joints.head.rotation.x = -0.25; // Menengadah kaget

    // Tangan terangkat ke samping kaget
    this.joints.leftArm.rotation.x = 0.4;
    this.joints.leftArm.rotation.z = -0.6;
    this.joints.rightArm.rotation.x = 0.4;
    this.joints.rightArm.rotation.z = 0.6;

    this.joints.leftLeg.rotation.x = 0;
    this.joints.rightLeg.rotation.x = 0;
  }

  animateIdle(delta, isCarryingFolder) {
    // Idle normal berdiri dengan napas halus
    const breathe = Math.sin(this.animTime * 2.5) * 0.02;
    this.joints.bodyRoot.position.y = 0.65 + breathe;

    this.joints.leftLeg.rotation.x = 0;
    this.joints.rightLeg.rotation.x = 0;
    this.joints.head.rotation.x = 0;

    if (isCarryingFolder) {
      this.joints.leftArm.rotation.x = -1.1;
      this.joints.leftArm.rotation.z = -0.25;
      this.joints.rightArm.rotation.x = -1.1;
      this.joints.rightArm.rotation.z = 0.25;
    } else {
      this.joints.leftArm.rotation.x = 0;
      this.joints.leftArm.rotation.z = 0;
      this.joints.rightArm.rotation.x = 0;
      this.joints.rightArm.rotation.z = 0;
    }
  }
}

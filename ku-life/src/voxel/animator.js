import * as THREE from 'three';
import { rotatePart, resetPose } from './models/character.js';

/**
 * 애니메이션 키프레임 정의
 * 각 파츠별로 시간(0~1)에 따른 회전값 정의
 */
const ANIMATIONS = {
  idle: {
    duration: 3.0,
    loop: true,
    keyframes: [
      // time, { part: { x, y, z } }
      { t: 0.00, poses: { head: { x: 0, y: 0, z: 0 }, leftArm: { x: 0, y: 0, z: 0 }, rightArm: { x: 0, y: 0, z: 0 }, leftLeg: { x: 0, y: 0, z: 0 }, rightLeg: { x: 0, y: 0, z: 0 } } },
      { t: 0.25, poses: { head: { x: -0.02, y: 0, z: 0 }, leftArm: { x: 0.05, y: 0, z: 0 }, rightArm: { x: -0.05, y: 0, z: 0 }, leftLeg: { x: 0.01, y: 0, z: 0 }, rightLeg: { x: -0.01, y: 0, z: 0 } } },
      { t: 0.50, poses: { head: { x: 0, y: 0, z: 0 }, leftArm: { x: 0, y: 0, z: 0 }, rightArm: { x: 0, y: 0, z: 0 }, leftLeg: { x: 0, y: 0, z: 0 }, rightLeg: { x: 0, y: 0, z: 0 } } },
      { t: 0.75, poses: { head: { x: 0.02, y: 0, z: 0 }, leftArm: { x: -0.05, y: 0, z: 0 }, rightArm: { x: 0.05, y: 0, z: 0 }, leftLeg: { x: -0.01, y: 0, z: 0 }, rightLeg: { x: 0.01, y: 0, z: 0 } } },
      { t: 1.00, poses: { head: { x: 0, y: 0, z: 0 }, leftArm: { x: 0, y: 0, z: 0 }, rightArm: { x: 0, y: 0, z: 0 }, leftLeg: { x: 0, y: 0, z: 0 }, rightLeg: { x: 0, y: 0, z: 0 } } },
    ],
  },

  walk: {
    duration: 0.8,
    loop: true,
    keyframes: [
      { t: 0.00, poses: { leftArm: { x: 0.8, z: 0 }, rightArm: { x: -0.8, z: 0 }, leftLeg: { x: -0.8, z: 0 }, rightLeg: { x: 0.8, z: 0 }, head: { x: 0.05, z: 0.02 } } },
      { t: 0.25, poses: { leftArm: { x: 0, z: 0 }, rightArm: { x: 0, z: 0 }, leftLeg: { x: 0, z: 0 }, rightLeg: { x: 0, z: 0 }, head: { x: 0, z: 0 } } },
      { t: 0.50, poses: { leftArm: { x: -0.8, z: 0 }, rightArm: { x: 0.8, z: 0 }, leftLeg: { x: 0.8, z: 0 }, rightLeg: { x: -0.8, z: 0 }, head: { x: -0.05, z: -0.02 } } },
      { t: 0.75, poses: { leftArm: { x: 0, z: 0 }, rightArm: { x: 0, z: 0 }, leftLeg: { x: 0, z: 0 }, rightLeg: { x: 0, z: 0 }, head: { x: 0, z: 0 } } },
      { t: 1.00, poses: { leftArm: { x: 0.8, z: 0 }, rightArm: { x: -0.8, z: 0 }, leftLeg: { x: -0.8, z: 0 }, rightLeg: { x: 0.8, z: 0 }, head: { x: 0.05, z: 0.02 } } },
    ],
  },

  study: {
    duration: 2.5,
    loop: true,
    keyframes: [
      { t: 0.00, poses: { head: { x: -0.4, y: 0, z: 0 }, leftArm: { x: -0.6, y: 0, z: -0.3 }, rightArm: { x: -0.6, y: 0, z: 0.3 }, leftLeg: { x: 0, y: 0, z: 0 }, rightLeg: { x: 0, y: 0, z: 0 } } },
      { t: 0.33, poses: { head: { x: -0.45, y: 0.05, z: 0 }, leftArm: { x: -0.5, y: 0, z: -0.2 }, rightArm: { x: -0.7, y: 0, z: 0.4 }, leftLeg: { x: 0, y: 0, z: 0 }, rightLeg: { x: 0, y: 0, z: 0 } } },
      { t: 0.66, poses: { head: { x: -0.35, y: -0.05, z: 0 }, leftArm: { x: -0.7, y: 0, z: -0.4 }, rightArm: { x: -0.5, y: 0, z: 0.2 }, leftLeg: { x: 0, y: 0, z: 0 }, rightLeg: { x: 0, y: 0, z: 0 } } },
      { t: 1.00, poses: { head: { x: -0.4, y: 0, z: 0 }, leftArm: { x: -0.6, y: 0, z: -0.3 }, rightArm: { x: -0.6, y: 0, z: 0.3 }, leftLeg: { x: 0, y: 0, z: 0 }, rightLeg: { x: 0, y: 0, z: 0 } } },
    ],
  },

  cheer: {
    duration: 1.5,
    loop: true,
    keyframes: [
      { t: 0.00, poses: { head: { x: 0.2, y: 0, z: 0 }, leftArm: { x: -1.5, y: 0, z: -0.3 }, rightArm: { x: -1.5, y: 0, z: 0.3 }, leftLeg: { x: -0.3, y: 0, z: 0 }, rightLeg: { x: -0.3, y: 0, z: 0 } } },
      { t: 0.25, poses: { head: { x: 0.3, y: 0, z: 0 }, leftArm: { x: -1.3, y: 0, z: -0.2 }, rightArm: { x: -1.3, y: 0, z: 0.2 }, leftLeg: { x: 0, y: 0, z: 0 }, rightLeg: { x: 0, y: 0, z: 0 } } },
      { t: 0.50, poses: { head: { x: 0.2, y: 0, z: 0 }, leftArm: { x: -1.5, y: 0, z: -0.3 }, rightArm: { x: -1.5, y: 0, z: 0.3 }, leftLeg: { x: -0.3, y: 0, z: 0 }, rightLeg: { x: -0.3, y: 0, z: 0 } } },
      { t: 0.75, poses: { head: { x: 0.3, y: 0, z: 0 }, leftArm: { x: -1.3, y: 0, z: -0.2 }, rightArm: { x: -1.3, y: 0, z: 0.2 }, leftLeg: { x: 0, y: 0, z: 0 }, rightLeg: { x: 0, y: 0, z: 0 } } },
      { t: 1.00, poses: { head: { x: 0.2, y: 0, z: 0 }, leftArm: { x: -1.5, y: 0, z: -0.3 }, rightArm: { x: -1.5, y: 0, z: 0.3 }, leftLeg: { x: -0.3, y: 0, z: 0 }, rightLeg: { x: -0.3, y: 0, z: 0 } } },
    ],
  },

  sad: {
    duration: 4.0,
    loop: true,
    keyframes: [
      { t: 0.00, poses: { head: { x: -0.5, y: 0, z: 0 }, leftArm: { x: 0.2, y: 0, z: -0.1 }, rightArm: { x: 0.2, y: 0, z: 0.1 }, leftLeg: { x: 0, y: 0, z: 0 }, rightLeg: { x: 0, y: 0, z: 0 } } },
      { t: 0.50, poses: { head: { x: -0.6, y: 0, z: 0 }, leftArm: { x: 0.3, y: 0, z: -0.15 }, rightArm: { x: 0.3, y: 0, z: 0.15 }, leftLeg: { x: 0, y: 0, z: 0 }, rightLeg: { x: 0, y: 0, z: 0 } } },
      { t: 1.00, poses: { head: { x: -0.5, y: 0, z: 0 }, leftArm: { x: 0.2, y: 0, z: -0.1 }, rightArm: { x: 0.2, y: 0, z: 0.1 }, leftLeg: { x: 0, y: 0, z: 0 }, rightLeg: { x: 0, y: 0, z: 0 } } },
    ],
  },
};

/**
 * 두 포즈 사이를 보간
 */
function lerpPose(poseA, poseB, t) {
  const result = {};
  const parts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];

  parts.forEach(part => {
    const a = poseA[part] || { x: 0, y: 0, z: 0 };
    const b = poseB[part] || { x: 0, y: 0, z: 0 };
    result[part] = {
      x: THREE.MathUtils.lerp(a.x, b.x, t),
      y: THREE.MathUtils.lerp(a.y, b.y, t),
      z: THREE.MathUtils.lerp(a.z, b.z, t),
    };
  });

  return result;
}

/**
 * 애니메이션 상태에서 현재 포즈 계산
 */
function getPoseAtTime(animName, time) {
  const anim = ANIMATIONS[animName];
  if (!anim) return null;

  const duration = anim.duration;
  const normalizedTime = (time % duration) / duration;
  const keyframes = anim.keyframes;

  // 현재 구간에 해당하는 키프레임 찾기
  for (let i = 0; i < keyframes.length - 1; i++) {
    const kf1 = keyframes[i];
    const kf2 = keyframes[i + 1];

    if (normalizedTime >= kf1.t && normalizedTime <= kf2.t) {
      const localT = (normalizedTime - kf1.t) / (kf2.t - kf1.t);
      const easedT = THREE.MathUtils.smootherstep(localT, 0, 1);
      return lerpPose(kf1.poses, kf2.poses, easedT);
    }
  }

  // 마지막 키프레임 반환
  return keyframes[keyframes.length - 1].poses;
}

/**
 * 캐릭터 애니메이터 클래스
 */
export class CharacterAnimator {
  constructor(character) {
    this.character = character;
    this.currentAnim = 'idle';
    this.previousAnim = null;
    this.animTime = 0;
    this.transitionTime = 0;
    this.transitionDuration = 0.3; // 전환 시간 (초)
    this.isTransitioning = false;
    this.playbackRate = 1.0;
    this.enabled = true;
  }

  /**
   * 애니메이션 재생 (부드러운 전환 포함)
   */
  play(animName, transitionDuration = 0.3) {
    if (!ANIMATIONS[animName]) {
      console.warn(`Animation '${animName}' not found`);
      return;
    }

    if (this.currentAnim === animName && !this.isTransitioning) {
      return; // 이미 재생 중
    }

    this.previousAnim = this.currentAnim;
    this.currentAnim = animName;
    this.transitionDuration = transitionDuration;
    this.transitionTime = 0;
    this.isTransitioning = true;
  }

  /**
   * 즉시 애니메이션 변경 (전환 없음)
   */
  set(animName) {
    if (!ANIMATIONS[animName]) return;
    this.currentAnim = animName;
    this.previousAnim = null;
    this.isTransitioning = false;
    this.animTime = 0;
  }

  /**
   * 프레임 업데이트
   */
  update(deltaTime) {
    if (!this.enabled) return;

    this.animTime += deltaTime * this.playbackRate;

    if (this.isTransitioning) {
      this.transitionTime += deltaTime;
      const t = Math.min(this.transitionTime / this.transitionDuration, 1);
      const easedT = THREE.MathUtils.smootherstep(t, 0, 1);

      const currentPose = getPoseAtTime(this.currentAnim, this.animTime);
      const previousPose = this.previousAnim ? getPoseAtTime(this.previousAnim, this.animTime) : currentPose;

      if (currentPose && previousPose) {
        const blendedPose = lerpPose(previousPose, currentPose, easedT);
        this.applyPose(blendedPose);
      }

      if (t >= 1) {
        this.isTransitioning = false;
        this.previousAnim = null;
      }
    } else {
      const pose = getPoseAtTime(this.currentAnim, this.animTime);
      if (pose) {
        this.applyPose(pose);
      }
    }
  }

  /**
   * 포즈를 캐릭터에 적용
   */
  applyPose(pose) {
    const parts = ['head', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
    parts.forEach(partName => {
      const partPose = pose[partName];
      if (partPose) {
        rotatePart(this.character, partName, new THREE.Euler(partPose.x, partPose.y, partPose.z));
      }
    });
  }

  /**
   * 현재 애니메이션 이름 반환
   */
  getCurrentAnim() {
    return this.currentAnim;
  }

  /**
   * 일시정지/재개
   */
  pause() { this.enabled = false; }
  resume() { this.enabled = true; }

  /**
   * 재생 속도 설정
   */
  setSpeed(speed) { this.playbackRate = speed; }

  /**
   * 리셋
   */
  reset() {
    this.currentAnim = 'idle';
    this.previousAnim = null;
    this.animTime = 0;
    this.isTransitioning = false;
    resetPose(this.character);
  }
}

/**
 * 편의 함수: 캐릭터에 애니메이터 부착
 */
export function createAnimator(character) {
  return new CharacterAnimator(character);
}

export default CharacterAnimator;
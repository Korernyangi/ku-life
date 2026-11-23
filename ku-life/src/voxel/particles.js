import * as THREE from 'three';
import { Palette } from './voxelModel.js';

/**
 * 계절별 입자 시스템 (InstancedMesh 복셀 입자)
 */
export class SeasonalParticles {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.enabled = true;
    this.currentSeason = 'spring';
    this.particleCount = options.particleCount || 500;
    this.voxelSize = options.voxelSize || 0.15;
    this.area = options.area || { width: 20, depth: 20, height: 15 };

    this.mesh = null;
    this.particles = [];
    this.material = null;
    this.geometry = null;

    this.init();
  }

  init() {
    this.geometry = new THREE.BoxGeometry(this.voxelSize, this.voxelSize, this.voxelSize);
    this.material = new THREE.MeshBasicMaterial({
      vertexColors: false,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });

    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.particleCount);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(this.particleCount * 3), 3);
    this.mesh.frustumCulled = false;

    this.scene.add(this.mesh);
    this.setSeason(this.currentSeason);
  }

  setSeason(season) {
    this.currentSeason = season;
    this.resetParticles();
  }

  resetParticles() {
    const colors = this.getSeasonColors();
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    this.particles = [];

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.createParticle(i);
      this.particles.push(p);

      // 초기 위치 설정
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(p.size);
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);

      color.setHex(p.color);
      this.mesh.instanceColor.setXYZ(i, color.r, color.g, color.b);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor.needsUpdate = true;
  }

  getSeasonColors() {
    switch (this.currentSeason) {
      case 'spring': return Palette.particle.cherry;
      case 'summer': return Palette.particle.rain;
      case 'autumn': return Palette.particle.leaf;
      case 'winter': return Palette.particle.snow;
      default: return Palette.particle.cherry;
    }
  }

  createParticle(index) {
    const { width, depth, height } = this.area;
    const colors = this.getSeasonColors();

    switch (this.currentSeason) {
      case 'spring': // 벚꽃 - 천천히 떨어지며 흔들림
        return {
          x: (Math.random() - 0.5) * width,
          y: Math.random() * height + 2,
          z: (Math.random() - 0.5) * depth,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.1 - Math.random() * 0.3,
          vz: (Math.random() - 0.5) * 0.3,
          swayPhase: Math.random() * Math.PI * 2,
          swayAmp: 0.2 + Math.random() * 0.3,
          rotSpeed: (Math.random() - 0.5) * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 0.8 + Math.random() * 0.5,
          type: 'petal',
        };

      case 'summer': // 비 - 빠르게 직선 낙하
        return {
          x: (Math.random() - 0.5) * width,
          y: Math.random() * height + 5,
          z: (Math.random() - 0.5) * depth,
          vx: 0,
          vy: -2 - Math.random() * 2,
          vz: 0,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 0.15 + Math.random() * 0.1,
          length: 0.5 + Math.random() * 0.3,
          type: 'rain',
        };

      case 'autumn': // 낙엽 - 나선형으로 천천히 낙하
        return {
          x: (Math.random() - 0.5) * width,
          y: Math.random() * height + 2,
          z: (Math.random() - 0.5) * depth,
          vx: (Math.random() - 0.5) * 0.2,
          vy: -0.05 - Math.random() * 0.15,
          vz: (Math.random() - 0.5) * 0.2,
          spinPhase: Math.random() * Math.PI * 2,
          spinSpeed: (Math.random() - 0.5) * 1.0,
          tilt: (Math.random() - 0.5) * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 0.6 + Math.random() * 0.4,
          type: 'leaf',
        };

      case 'winter': // 눈 - 천천히 부드럽게 낙하
        return {
          x: (Math.random() - 0.5) * width,
          y: Math.random() * height + 3,
          z: (Math.random() - 0.5) * depth,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -0.08 - Math.random() * 0.12,
          vz: (Math.random() - 0.5) * 0.15,
          swayPhase: Math.random() * Math.PI * 2,
          swayAmp: 0.15 + Math.random() * 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 0.4 + Math.random() * 0.3,
          type: 'snow',
        };
    }
  }

  update(deltaTime) {
    if (!this.enabled || !this.mesh) return;

    const { width, depth, height } = this.area;
    const dummy = new THREE.Object3D();
    const time = Date.now() * 0.001;

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particles[i];

      // 위치 업데이트
      switch (this.currentSeason) {
        case 'spring':
          p.x += p.vx * deltaTime * 60;
          p.y += p.vy * deltaTime * 60;
          p.z += p.vz * deltaTime * 60;
          // 흔들림
          p.x += Math.sin(time * 2 + p.swayPhase) * p.swayAmp * deltaTime;
          p.z += Math.cos(time * 1.5 + p.swayPhase) * p.swayAmp * deltaTime;
          break;

        case 'summer':
          p.y += p.vy * deltaTime * 60;
          break;

        case 'autumn':
          p.x += p.vx * deltaTime * 60;
          p.y += p.vy * deltaTime * 60;
          p.z += p.vz * deltaTime * 60;
          p.spinPhase += p.spinSpeed * deltaTime;
          break;

        case 'winter':
          p.x += p.vx * deltaTime * 60;
          p.y += p.vy * deltaTime * 60;
          p.z += p.vz * deltaTime * 60;
          p.x += Math.sin(time * 1.5 + p.swayPhase) * p.swayAmp * deltaTime;
          p.z += Math.cos(time * 1.2 + p.swayPhase) * p.swayAmp * deltaTime;
          break;
      }

      // 화면 밖으로 나가면 재생성 (위에서 다시)
      if (p.y < -2 || Math.abs(p.x) > width / 2 + 2 || Math.abs(p.z) > depth / 2 + 2) {
        const newP = this.createParticle(i);
        Object.assign(p, newP);
        p.y = height + 2;
      }

      // 매트릭스 업데이트
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(p.size);

      // 회전 적용 (계절별)
      if (this.currentSeason === 'spring' || this.currentSeason === 'autumn') {
        dummy.rotation.z = p.rotSpeed * time || p.spinPhase || 0;
        dummy.rotation.x = p.tilt || 0;
      } else if (this.currentSeason === 'summer') {
        // 비는 길쭉하게 - y축 스케일로 표현
        dummy.scale.y = p.length || 1;
      }

      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (this.mesh) this.mesh.visible = enabled;
  }

  setParticleCount(count) {
    if (count === this.particleCount) return;
    this.particleCount = count;
    // 재생성 필요 (InstancedMesh count 변경 불가하므로)
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.init();
  }

  setArea(area) {
    this.area = { ...this.area, ...area };
  }

  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
  }
}

/**
 * 학기 번호(1~8)로 계절 결정
 * 1,2학기: 봄 (3,4월)
 * 3,4학기: 여름 (6,7월)
 * 5,6학기: 가을 (9,10월)
 * 7,8학기: 겨울 (12,1월)
 */
export function getSeasonFromSemester(semester, lateTerm = false) {
  const springTerm = semester % 2 !== 0;
  return springTerm
    ? (lateTerm ? 'summer' : 'spring')
    : (lateTerm ? 'winter' : 'autumn');
}

/**
 * 계절별 환경 설정 (하늘색, 잔디색, 조명)
 */
export const SEASON_CONFIG = {
  spring: {
    skyColor: 0x87CEEB,
    fogColor: 0xA8D0E6,
    grassSeason: 'spring',
    lightColor: 0xFFF8E7,
    lightIntensity: 1.0,
    ambientColor: 0xE8F0FF,
    ambientIntensity: 0.5,
  },
  summer: {
    skyColor: 0x4AA3FF,
    fogColor: 0x7FB3D3,
    grassSeason: 'summer',
    lightColor: 0xFFFFE0,
    lightIntensity: 1.2,
    ambientColor: 0xFFF8DC,
    ambientIntensity: 0.6,
  },
  autumn: {
    skyColor: 0xB8A078,
    fogColor: 0xD4C4A0,
    grassSeason: 'autumn',
    lightColor: 0xFFE4B5,
    lightIntensity: 0.9,
    ambientColor: 0xF5E6D3,
    ambientIntensity: 0.45,
  },
  winter: {
    skyColor: 0xB0C4DE,
    fogColor: 0xD0D8E8,
    grassSeason: 'winter',
    lightColor: 0xE6F0FF,
    lightIntensity: 0.7,
    ambientColor: 0xD8E0F0,
    ambientIntensity: 0.4,
  },
  // 시험 기간 밤
  exam: {
    skyColor: 0x0D0D1A,
    fogColor: 0x1A1A2E,
    grassSeason: 'autumn',
    lightColor: 0xFFF8DC,
    lightIntensity: 0.3,
    ambientColor: 0x1A1A2E,
    ambientIntensity: 0.15,
  },
};

export default SeasonalParticles;

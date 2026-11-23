import * as THREE from 'three';
import { createVoxelModel, Palette } from '../voxelModel.js';

/**
 * 모닥불 모델
 */
export function createCampfire({
  voxelSize = 1
} = {}) {
  const palette = {
    'L': Palette.wood.dark,   // 장작
    'l': Palette.wood.mid,
    'F': 0xFF4500,            // 불꽃 (주황)
    'f': 0xFF8C00,            // 불꽃 (밝은 주황)
    'E': 0xFFD700,            // 불씨 (노랑)
    'e': 0xFFA500,
    'S': 0x3A3A3A,            // 돌
    's': 0x2A2A2A,
  };

  const layers = [
    // 불꽃 (애니메이션으로 처리할 예정)
    '  F  ',
    ' fEf ',
    'fEeEf',
    ' fEf ',
    // 장작
    ' LLL ',
    ' LLL ',
    ' LLL ',
    // 돌 테두리
    'SSSSS',
    'S...S',
    'SSSSS',
  ];

  return createVoxelModel({ layers: layers.reverse(), palette, voxelSize });
}

/**
 * 모닥불 불꽃 파티클용 (별도 처리)
 */
export function createFireParticles({
  count = 30,
  voxelSize = 0.15
} = {}) {
  const geometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
  const colors = [0xFF4500, 0xFF8C00, 0xFFD700, 0xFFA500, 0xFF6347];

  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    dummy.position.set(
      (Math.random() - 0.5) * 1.5,
      Math.random() * 2,
      (Math.random() - 0.5) * 1.5
    );
    dummy.scale.setScalar(0.5 + Math.random() * 0.5);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    color.setHex(colors[Math.floor(Math.random() * colors.length)]);
    mesh.instanceColor.setXYZ(i, color.r, color.g, color.b);
  }

  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor.needsUpdate = true;

  // 애니메이션용 데이터 저장
  mesh.userData.particles = [];
  for (let i = 0; i < count; i++) {
    mesh.userData.particles.push({
      baseY: (Math.random() - 0.5) * 1.5,
      speed: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      size: 0.5 + Math.random() * 0.5,
    });
  }

  return mesh;
}

/**
 * 모닥불 파티클 업데이트
 */
export function updateCampfireParticles(mesh, deltaTime) {
  if (!mesh || !mesh.userData.particles) return;

  const dummy = new THREE.Object3D();
  const particles = mesh.userData.particles;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const y = p.baseY + Math.sin(Date.now() * 0.001 * p.speed + p.phase) * 1.5;
    const x = (Math.random() - 0.5) * 0.3;
    const z = (Math.random() - 0.5) * 0.3;
    const scale = p.size * (0.7 + Math.sin(Date.now() * 0.005 * p.speed + p.phase) * 0.3);

    dummy.position.set(x, Math.max(0.1, y), z);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}

export default createCampfire;
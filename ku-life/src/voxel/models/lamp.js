import * as THREE from 'three';
import { createVoxelModel, Palette } from '../voxelModel.js';

/**
 * 스탠드 조명 모델 (시험장 밤 장면용)
 */
export function createDeskLamp({
  voxelSize = 1
} = {}) {
  const palette = {
    'M': 0xC0C0C0, // 금속
    'm': 0xA0A0A0,
    'B': 0x1A1A1A, // 베이스
    'b': 0x2A2A2A,
    'L': 0xFFF8DC, // 전구 (따뜻한 빛)
    'l': 0xFFE4B5,
    'G': 0xFFD700, // 빛 효과
    'g': 0xFFA500,
  };

  const layers = [
    // 전구
    '..L..',
    '.LLL.',
    '..L..',
    // 갓
    '.GGG.',
    'G.G.G',
    '.GGG.',
    // 관절
    '..M..',
    '..M..',
    // 기둥
    '..M..',
    '..M..',
    '..M..',
    '..M..',
    // 베이스
    '.BBB.',
    'BBBBB',
  ];

  return createVoxelModel({ layers: layers.reverse(), palette, voxelSize });
}

/**
 * 빛 효과 (빔/글로우) - 별도 메쉬로 처리
 */
export function createLightBeam({
  voxelSize = 0.3,
  height = 4
} = {}) {
  const geometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
  const count = height * 4;

  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);

  const dummy = new THREE.Object3D();
  const color = new THREE.Color(0xFFF8DC);

  let idx = 0;
  for (let y = 0; y < height; y++) {
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const radius = 0.3 + y * 0.15;
      dummy.position.set(
        Math.cos(angle) * radius,
        y * voxelSize,
        Math.sin(angle) * radius
      );
      dummy.scale.setScalar(1 + y * 0.2);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);
      mesh.instanceColor.setXYZ(idx, color.r, color.g, color.b);
      idx++;
    }
  }

  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor.needsUpdate = true;

  return mesh;
}

export default createDeskLamp;
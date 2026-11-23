import * as THREE from 'three';

/**
 * 층별 문자 배열 + 색 팔레트로부터 InstancedMesh 생성
 *
 * @param {Object} params
 * @param {string[]} params.layers - 각 층을 나타내는 문자열 배열 (y축 위로 쌓임)
 * @param {Object.<string, THREE.Color|number|string>} params.palette - 문자 -> 색상 매핑
 * @param {number} params.voxelSize - 복셀 한 변의 길이 (기본 1)
 * @param {THREE.Vector3} params.origin - 모델 원점 오프셋
 * @returns {THREE.InstancedMesh}
 */
export function createVoxelModel({ layers, palette, voxelSize = 1, origin = new THREE.Vector3(0, 0, 0), depth = 1 }) {
  // 유효한 복셀 위치 수집
  const positions = [];
  const colors = [];

  layers.forEach((layer, y) => {
    const row = layer.split('');
    row.forEach((char, x) => {
      if (char !== ' ' && char !== '.' && palette[char]) {
        for (let z = 0; z < depth; z++) {
          positions.push(new THREE.Vector3(x, y, z));
          colors.push(palette[char]);
        }
      }
    });
  });

  if (positions.length === 0) {
    console.warn('createVoxelModel: no valid voxels found');
    return null;
  }

  const count = positions.length;
  const geometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
  const material = new THREE.MeshStandardMaterial({
    vertexColors: false,
    roughness: 0.7,
    metalness: 0.1,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  positions.forEach((pos, i) => {
    dummy.position.copy(pos).multiplyScalar(voxelSize).add(origin);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    color.set(colors[i]);
    mesh.instanceColor.setXYZ(i, color.r, color.g, color.b);
  });

  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor.needsUpdate = true;

  // 바운딩 박스 계산
  mesh.computeBoundingBox();

  return mesh;
}

/**
 * 여러 개의 복셀 모델을 합쳐서 하나의 Group으로 반환
 * 각 파츠는 별도의 InstancedMesh로 유지되어 개별 변환 가능
 *
 * @param {Object[]} parts - [{ mesh, position, rotation, scale, name }]
 * @returns {THREE.Group}
 */
export function combineVoxelParts(parts) {
  const group = new THREE.Group();

  parts.forEach(({ mesh, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], name }) => {
    if (!mesh) return;
    const partGroup = new THREE.Group();
    partGroup.name = name || `part_${group.children.length}`;
    partGroup.add(mesh);
    partGroup.position.set(...position);
    partGroup.rotation.set(...rotation);
    partGroup.scale.set(...scale);
    group.add(partGroup);
  });

  return group;
}

/**
 * 간단한 색상 팔레트 헬퍼
 */
export const Palette = {
  // 붉은 톤 + 석조 건물풍
  brick: {
    dark: 0x8B3A3A,
    mid: 0xA0522D,
    light: 0xCD853F,
    accent: 0xB22222,
  },
  stone: {
    dark: 0x5A5A5A,
    mid: 0x7A7A7A,
    light: 0x9A9A9A,
  },
  grass: {
    dark: 0x2D5A2D,
    mid: 0x3A7A3A,
    light: 0x4A9A4A,
    spring: 0x6BCB6B,
  },
  wood: {
    dark: 0x4A3728,
    mid: 0x8B6914,
    light: 0xDEB887,
  },
  sky: {
    dawn: 0xFFB366,
    day: 0x4AA3FF,
    dusk: 0xFF6B9D,
    night: 0x1A1A3A,
    exam: 0x0D0D1A,
  },
  character: {
    hair: [0x2C1B1B, 0x3D2B1F, 0x1A1A1A, 0x8B4513, 0xD2691E],
    skin: [0xFFDBAC, 0xE8B4A0, 0xD4A574, 0xC68E63, 0x8B7355],
    clothes: [0x8B0000, 0x4A1A1A, 0x1A3A5C, 0x2D4A3A, 0x5C2D4A, 0x3A3A5C],
  },
  particle: {
    cherry: [0xFFB7C5, 0xFF9AA2, 0xFFDAC1, 0xFFF5E6],
    rain: [0xA8D0E6, 0x7FB3D3, 0x5DADE2],
    leaf: [0xD4A574, 0xCD853F, 0xDEB887, 0x8B6914, 0xA0522D],
    snow: [0xFFFFFF, 0xF0F8FF, 0xE6F0FF],
  },
  ui: {
    hp: 0xE53E3E,
    mp: 0x3B82F6,
    money: 0xEAB308,
    relation: 0xEC4899,
    career: 0x8B5CF6,
    grade: 0x10B981,
  }
};

/**
 * 랜덤 색상 선택
 */
export function randomColor(colors) {
  return colors[Math.floor(Math.random() * colors.length)];
}

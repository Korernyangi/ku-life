import * as THREE from 'three';
import { createVoxelModel, Palette } from '../voxelModel.js';

/**
 * 잔디 바닥 모델 생성 (15x15 정도)
 */
export function createGrass({
  width = 15,
  depth = 15,
  voxelSize = 1,
  season = 'spring'
} = {}) {
  let grassColors;

  switch (season) {
    case 'spring':
      grassColors = { dark: 0x3A7A3A, mid: 0x4A9A4A, light: 0x6BCB6B, flower: 0xFFB7C5 };
      break;
    case 'summer':
      grassColors = { dark: 0x2D6B2D, mid: 0x3A8A3A, light: 0x4AB84A, flower: 0xFFD700 };
      break;
    case 'autumn':
      grassColors = { dark: 0x6B5B2D, mid: 0x8B7A3A, light: 0xA89A4A, flower: 0xCD853F };
      break;
    case 'winter':
      grassColors = { dark: 0x5A5A5A, mid: 0x7A7A7A, light: 0x9A9A9A, flower: 0xFFFFFF };
      break;
    default:
      grassColors = { dark: 0x3A7A3A, mid: 0x4A9A4A, light: 0x6BCB6B, flower: 0xFFB7C5 };
  }

  const palette = {
    'G': grassColors.dark,
    'g': grassColors.mid,
    'L': grassColors.light,
    'F': grassColors.flower,
    'P': 0x8FBC8F, // 경로용
    'p': 0x7A9A7A, // 경로 어두운 색
  };

  const layers = [];
  // 단일 층
  let row = '';
  for (let x = 0; x < width; x++) {
    let char = ' ';
    const r = Math.random();
    if (r < 0.15) char = 'L';
    else if (r < 0.35) char = 'g';
    else if (r < 0.55) char = 'G';
    else if (r < 0.58) char = 'F'; // 꽃/낙엽/눈
    else char = 'G';

    // 중앙 가로 경로
    if (x === Math.floor(width / 2)) char = 'P';
    row += char;
  }
  layers.push(row);

  return createVoxelModel({ layers: layers.reverse(), palette, voxelSize });
}

/**
 * 경로가 있는 잔디 (건물 사이 길)
 */
export function createGrassWithPaths({
  width = 15,
  depth = 15,
  voxelSize = 1,
  season = 'spring',
  paths = [] // [{x, y, width, height}] 영역
} = {}) {
  let grassColors;

  switch (season) {
    case 'spring':
      grassColors = { dark: 0x3A7A3A, mid: 0x4A9A4A, light: 0x6BCB6B, flower: 0xFFB7C5 };
      break;
    case 'summer':
      grassColors = { dark: 0x2D6B2D, mid: 0x3A8A3A, light: 0x4AB84A, flower: 0xFFD700 };
      break;
    case 'autumn':
      grassColors = { dark: 0x6B5B2D, mid: 0x8B7A3A, light: 0xA89A4A, flower: 0xCD853F };
      break;
    case 'winter':
      grassColors = { dark: 0x5A5A5A, mid: 0x7A7A7A, light: 0x9A9A9A, flower: 0xFFFFFF };
      break;
    default:
      grassColors = { dark: 0x3A7A3A, mid: 0x4A9A4A, light: 0x6BCB6B, flower: 0xFFB7C5 };
  }

  const palette = {
    'G': grassColors.dark,
    'g': grassColors.mid,
    'L': grassColors.light,
    'F': grassColors.flower,
    'P': 0xB8A078, // 흙길
    'p': 0xA08A68,
  };

  const geometry = new THREE.BoxGeometry(voxelSize, voxelSize * 0.12, voxelSize);
  const material = new THREE.MeshStandardMaterial({ vertexColors: false, roughness: 0.95 });
  const mesh = new THREE.InstancedMesh(geometry, material, width * depth);
  mesh.name = 'grass';
  mesh.receiveShadow = true;
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const colorChoices = [grassColors.dark, grassColors.mid, grassColors.light];
  let index = 0;
  for (let z = 0; z < depth; z++) {
    for (let x = 0; x < width; x++) {
      const onPath = paths.some(path =>
        x >= path.x && x < path.x + path.width && z >= path.y && z < path.y + path.height);
      const randomColor = onPath
        ? (Math.random() > 0.5 ? 0xB8A078 : 0xA08A68)
        : colorChoices[Math.floor(Math.random() * colorChoices.length)];
      dummy.position.set(x * voxelSize, voxelSize * 0.06, z * voxelSize);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      color.setHex(randomColor);
      mesh.setColorAt(index, color);
      index++;
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingBox();
  return mesh;
}

export default createGrass;

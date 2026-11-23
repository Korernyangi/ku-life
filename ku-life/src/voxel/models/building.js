import * as THREE from 'three';
import { createVoxelModel, Palette } from '../voxelModel.js';

/**
 * 석조 건물 모델 생성
 * @param {Object} options
 * @param {number} options.width - 가로 칸 수
 * @param {number} options.depth - 세로 칸 수
 * @param {number} options.height - 높이(층 수)
 * @param {number} options.voxelSize
 * @param {Object} options.colors - 커스텀 색상
 */
export function createBuilding({
  width = 8,
  depth = 6,
  height = 6,
  voxelSize = 1,
  colors = null
} = {}) {
  const c = colors || {
    wall: Palette.brick.mid,
    wallDark: Palette.brick.dark,
    wallLight: Palette.brick.light,
    window: 0x3A5A8C,
    windowLight: 0x8AB4F8,
    roof: Palette.brick.accent,
    roofDark: 0x6B1A1A,
    door: Palette.wood.dark,
    trim: Palette.stone.mid,
  };

  const palette = {
    'W': c.wall,
    'w': c.wallDark,
    'L': c.wallLight,
    'G': c.window,
    'g': c.windowLight,
    'R': c.roof,
    'r': c.roofDark,
    'D': c.door,
    'T': c.trim,
  };

  const layers = [];

  // 지붕 (윗층 2개)
  for (let y = height - 1; y >= height - 2; y--) {
    let row = '';
    for (let x = 0; x < width; x++) {
      const isEdge = x === 0 || x === width - 1;
      row += isEdge ? 'r' : 'R';
    }
    layers.push(row);
  }

  // 벽체층
  for (let y = height - 3; y >= 1; y--) {
    let row = '';
    for (let x = 0; x < width; x++) {
      const isEdge = x === 0 || x === width - 1;
      const isWindow = !isEdge && y % 2 === 0 && x % 3 === 1;
      const isDoor = y === 1 && x === Math.floor(width / 2);

      if (isDoor) {
        row += 'D';
      } else if (isWindow) {
        row += Math.random() > 0.5 ? 'G' : 'g';
      } else if (isEdge) {
        row += y % 3 === 0 ? 'T' : 'W';
      } else {
        row += Math.random() > 0.7 ? 'w' : (Math.random() > 0.85 ? 'L' : 'W');
      }
    }
    layers.push(row);
  }

  // 1층 (출입구 강조)
  let groundRow = '';
  for (let x = 0; x < width; x++) {
    const isEdge = x === 0 || x === width - 1;
    const isDoor = x === Math.floor(width / 2);
    if (isDoor) groundRow += 'D';
    else if (isEdge) groundRow += 'T';
    else groundRow += 'W';
  }
  layers.push(groundRow);

  return createVoxelModel({ layers: layers.reverse(), palette, voxelSize, depth });
}

/**
 * 본관 건물 (더 큰 버전)
 */
export function createMainBuilding({ voxelSize = 1 } = {}) {
  return createBuilding({ width: 10, depth: 8, height: 8, voxelSize });
}

/**
 * 단과대 건물 (작은 버전)
 */
export function createDepartmentBuilding({ voxelSize = 1 } = {}) {
  return createBuilding({ width: 7, depth: 5, height: 5, voxelSize });
}

/**
 * 도서관 건물
 */
export function createLibrary({ voxelSize = 1 } = {}) {
  const c = {
    wall: Palette.stone.mid,
    wallDark: Palette.stone.dark,
    wallLight: Palette.stone.light,
    window: 0x2A4A7C,
    windowLight: 0x6A9BE8,
    roof: 0x4A2A2A,
    roofDark: 0x2A1A1A,
    door: Palette.wood.dark,
    trim: Palette.stone.light,
  };
  return createBuilding({ width: 9, depth: 7, height: 6, voxelSize, colors: c });
}

export default createBuilding;

import * as THREE from 'three';
import { createVoxelModel, Palette } from '../voxelModel.js';

/**
 * 도서관 책상 모델
 */
export function createDesk({
  voxelSize = 1
} = {}) {
  const palette = {
    'W': Palette.wood.dark,
    'w': Palette.wood.mid,
    'l': Palette.wood.light,
    'B': 0x2C1B1B, // 책
    'b': 0x3D2B1F,
    'P': 0x8B4513, // 연필/펜
    'p': 0xA0522D,
    'L': 0xFFD700, // 스탠드 조명
  };

  const layers = [
    // 책상 위: 책, 연필, 램프
    '  B  ',
    ' BbB ',
    ' PbP ',
    '  L  ',
    // 책상 판
    'WWWWW',
    'WWWWW',
    // 다리
    'W..W',
    'W..W',
    'W..W',
    'W..W',
  ];

  return createVoxelModel({ layers: layers.reverse(), palette, voxelSize });
}

/**
 * 책 더미
 */
export function createBookStack({
  voxelSize = 1,
  count = 3
} = {}) {
  const colors = [0x8B0000, 0x4A1A1A, 0x1A3A5C, 0x2D4A3A, 0x5C2D4A, 0x3A3A5C, 0x8B4513];
  const palette = {};
  colors.forEach((c, i) => {
    palette[String.fromCharCode(65 + i)] = c; // A, B, C...
    palette[String.fromCharCode(97 + i)] = new THREE.Color(c).multiplyScalar(0.7).getHex(); // a, b, c...
  });

  const layers = [];
  for (let i = 0; i < count; i++) {
    const c = String.fromCharCode(65 + (i % colors.length));
    const c2 = String.fromCharCode(97 + (i % colors.length));
    layers.push(` ${c} `);
    layers.push(`${c}${c2}${c}`);
  }

  return createVoxelModel({ layers: layers.reverse(), palette, voxelSize });
}

export default createDesk;
import * as THREE from 'three';
import { createVoxelModel, Palette, randomColor } from '../voxelModel.js';

/**
 * 나무 모델 생성
 */
export function createTree({
  type = 'deciduous',
  voxelSize = 1,
  trunkHeight = 4,
  foliageRadius = 3
} = {}) {
  let palette, layers;

  if (type === 'pine') {
    // 소나무
    palette = {
      'T': Palette.wood.dark,
      't': Palette.wood.mid,
      'L': randomColor([Palette.grass.dark, Palette.grass.mid]),
      'l': Palette.grass.light,
    };

    layers = [];
    // 잎 부분 (원뿔형)
    for (let y = foliageRadius * 2; y >= 0; y--) {
      const radius = Math.max(1, Math.floor((foliageRadius * 2 - y) * 0.6));
      let row = '';
      for (let x = -foliageRadius; x <= foliageRadius; x++) {
        const dist = Math.abs(x);
        if (dist <= radius) {
          row += Math.random() > 0.3 ? 'L' : 'l';
        } else {
          row += '.';
        }
      }
      layers.push(row);
    }
    // 줄기
    for (let y = 0; y < trunkHeight; y++) {
      let row = '.'.repeat(foliageRadius) + 'T' + '.'.repeat(foliageRadius);
      if (y % 2 === 0) row = row.replace('T', 't');
      layers.push(row);
    }
  } else {
    // 낙엽수 (기본)
    palette = {
      'T': Palette.wood.dark,
      't': Palette.wood.mid,
      'L': randomColor([Palette.grass.dark, Palette.grass.mid, 0x8FBC8F]),
      'l': Palette.grass.light,
      'A': 0xD4A574, // 가을 단풍
      'a': 0xCD853F,
    };

    layers = [];
    // 잎 부분 (구형에 가깝게)
    const foliageHeight = foliageRadius;
    for (let y = foliageHeight; y >= 0; y--) {
      const radius = Math.max(1, Math.floor(Math.sqrt(Math.max(0, foliageRadius * foliageRadius - (y - foliageRadius/2) ** 2))));
      let row = '';
      for (let x = -foliageRadius; x <= foliageRadius; x++) {
        const dist = Math.abs(x);
        if (dist <= radius) {
          const r = Math.random();
          if (r > 0.7) row += 'L';
          else if (r > 0.4) row += 'l';
          else row += '.';
        } else {
          row += '.';
        }
      }
      layers.push(row);
    }
    // 줄기
    for (let y = 0; y < trunkHeight; y++) {
      let row = '.'.repeat(foliageRadius) + (y % 2 === 0 ? 'T' : 't') + '.'.repeat(foliageRadius);
      layers.push(row);
    }
  }

  return createVoxelModel({ layers: layers.reverse(), palette, voxelSize });
}

/**
 * 벚꽃 나무 (봄)
 */
export function createCherryTree({ voxelSize = 1 } = {}) {
  const palette = {
    'T': Palette.wood.dark,
    't': Palette.wood.mid,
    'P': Palette.particle.cherry[0],
    'p': Palette.particle.cherry[1],
    'B': Palette.particle.cherry[2],
    'b': Palette.particle.cherry[3],
  };

  const layers = [];
  const foliageRadius = 4;

  // 벚꽃 잎 (구형)
  for (let y = 5; y >= 0; y--) {
    const radius = Math.max(1, Math.floor(Math.sqrt(Math.max(0, foliageRadius * foliageRadius - (y - 2) ** 2))));
    let row = '';
    for (let x = -foliageRadius; x <= foliageRadius; x++) {
      const dist = Math.abs(x);
      if (dist <= radius) {
        const r = Math.random();
        if (r > 0.6) row += 'P';
        else if (r > 0.3) row += 'p';
        else if (r > 0.1) row += 'B';
        else row += 'b';
      } else {
        row += '.';
      }
    }
    layers.push(row);
  }

  // 줄기
  for (let y = 0; y < 4; y++) {
    let row = '.'.repeat(foliageRadius) + (y % 2 === 0 ? 'T' : 't') + '.'.repeat(foliageRadius);
    layers.push(row);
  }

  return createVoxelModel({ layers: layers.reverse(), palette, voxelSize });
}

export default createTree;
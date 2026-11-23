import * as THREE from 'three';
import { createVoxelModel, Palette } from '../voxelModel.js';

/**
 * 카페 카운터 모델
 */
export function createCafeCounter({
  voxelSize = 1
} = {}) {
  const palette = {
    'W': Palette.wood.dark,
    'w': Palette.wood.mid,
    'L': Palette.wood.light,
    'C': 0x8B4513, // 커피 머신
    'c': 0xA0522D,
    'M': 0xC0C0C0, // 스테인리스
    'm': 0xA0A0A0,
    'B': 0x3A2A1A, // 원두통
    'b': 0x4A3A2A,
    'P': 0xFFD700, // 컵/접시
    'p': 0xF0E68C,
  };

  const layers = [
    // 위: 컵, 머신, 원두통
    ' P P ',
    ' CMC ',
    ' BBB ',
    // 카운터 상판
    'WWWWW',
    'WWWWW',
    // 카운터 몸체
    'W   W',
    'W   W',
    'W   W',
    'W   W',
    // 하단 선반
    'WWWWW',
  ];

  return createVoxelModel({ layers: layers.reverse(), palette, voxelSize });
}

/**
 * 카페 테이블
 */
export function createCafeTable({
  voxelSize = 1
} = {}) {
  const palette = {
    'W': Palette.wood.dark,
    'w': Palette.wood.mid,
    'L': Palette.wood.light,
    'P': 0xFFD700,
    'C': 0x8B4513, // 커피 컵
  };

  const layers = [
    // 컵
    ' C ',
    ' C ',
    // 상판
    'WWW',
    'WWW',
    // 다리
    'W W',
    'W W',
    'W W',
    'W W',
  ];

  return createVoxelModel({ layers: layers.reverse(), palette, voxelSize });
}

/**
 * 의자
 */
export function createChair({
  voxelSize = 1
} = {}) {
  const palette = {
    'W': Palette.wood.dark,
    'w': Palette.wood.mid,
    'L': Palette.wood.light,
  };

  const layers = [
    // 등받이
    'W W',
    'W W',
    'W W',
    // 앉는 판
    'WWW',
    'WWW',
    // 다리
    'W W',
    'W W',
    'W W',
    'W W',
  ];

  return createVoxelModel({ layers: layers.reverse(), palette, voxelSize });
}

export default createCafeCounter;
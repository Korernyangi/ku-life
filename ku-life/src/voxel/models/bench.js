import * as THREE from 'three';
import { createVoxelModel, Palette } from '../voxelModel.js';

/**
 * 벤치 모델 생성
 */
export function createBench({
  voxelSize = 1,
  length = 4
} = {}) {
  const benchLength = Math.max(2, Math.floor(length));
  const seatRow = 'W'.repeat(benchLength);
  const legRow = Array.from({ length: benchLength }, (_, index) =>
    index === 0 || index === benchLength - 1 ? 'W' : '.').join('');
  const palette = {
    'W': Palette.wood.dark,
    'w': Palette.wood.mid,
    'L': Palette.wood.light,
    'S': Palette.stone.mid,
    's': Palette.stone.dark,
  };

  const layers = [
    // 등받이
    seatRow,
    seatRow,
    // 빈 공간 - 점을 사용 (팔레트에 없으므로 무시됨)
    '.'.repeat(benchLength),
    // 앉는 판
    seatRow,
    seatRow,
    // 다리
    legRow,
    legRow,
  ];

  return createVoxelModel({ layers: layers.reverse(), palette, voxelSize });
}

export default createBench;

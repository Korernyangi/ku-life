import * as THREE from 'three';
import { createVoxelModel, combineVoxelParts, Palette, randomColor } from '../voxelModel.js';

/**
 * 학생 캐릭터 모델 생성
 * 머리, 몸통, 왼팔, 오른팔, 왼다리, 오른다리 각각 별도 그룹으로 분리
 * 관절 회전 중심점을 고려한 위치 설정
 *
 * @param {Object} options
 * @param {THREE.Color|number|string} options.hairColor - 머리색
 * @param {THREE.Color|number|string} options.skinColor - 피부색
 * @param {THREE.Color|number|string} options.clothesColor - 옷색
 * @param {number} options.voxelSize - 복셀 크기
 * @returns {THREE.Group} - 파츠별로 분리된 캐릭터 그룹
 */
export function createCharacter({
  hairColor = randomColor(Palette.character.hair),
  skinColor = randomColor(Palette.character.skin),
  clothesColor = randomColor(Palette.character.clothes),
  voxelSize = 0.5
} = {}) {
  const c = {
    hair: new THREE.Color(hairColor),
    skin: new THREE.Color(skinColor),
    clothes: new THREE.Color(clothesColor),
    shoe: new THREE.Color(0x2C1B1B),
  };

  // 팔레트 정의 (문자 -> 색상)
  const palette = {
    // 머리
    'H': c.hair,
    'h': c.hair.clone().multiplyScalar(0.8),
    // 얼굴/피부
    'F': c.skin,
    'f': c.skin.clone().multiplyScalar(0.9),
    // 옷
    'C': c.clothes,
    'c': c.clothes.clone().multiplyScalar(0.85),
    // 신발
    'S': c.shoe,
    's': c.shoe.clone().multiplyScalar(0.8),
  };

  const vs = voxelSize;

  // ===== 머리 (4x4x4, 중심이 대략 0, 0, 0) =====
  const headLayers = [
    '    ',
    ' HH ',
    'HHHH',
    'HHHH',
    'HHHH',
    ' FFF',
    'FFFF',
    ' FFF',
  ].reverse(); // y=0이 바닥이 되도록 뒤집기

  // ===== 몸통 (4x6x3) =====
  const bodyLayers = [
    '      ',
    ' CCCC ',
    ' CCCC ',
    ' CCCC ',
    ' CCCC ',
    ' CCCC ',
    ' CCCC ',
    ' CCCC ',
  ].reverse();

  // ===== 왼팔 (2x6x2) - 어깨 중심이 몸통 오른쪽 위 =====
  const leftArmLayers = [
    '  ',
    'CC',
    'CC',
    'FF',
    'FF',
    'FF',
    'FF',
    'FF',
  ].reverse();

  // ===== 오른팔 (2x6x2) =====
  const rightArmLayers = [
    '  ',
    'CC',
    'CC',
    'FF',
    'FF',
    'FF',
    'FF',
    'FF',
  ].reverse();

  // ===== 왼다리 (2x6x2) =====
  const leftLegLayers = [
    '  ',
    'CC',
    'CC',
    'CC',
    'CC',
    'CC',
    'SS',
    'SS',
  ].reverse();

  // ===== 오른다리 (2x6x2) =====
  const rightLegLayers = [
    '  ',
    'CC',
    'CC',
    'CC',
    'CC',
    'CC',
    'SS',
    'SS',
  ].reverse();

  // 각 파츠 생성
  const headMesh = createVoxelModel({ layers: headLayers, palette, voxelSize: vs, depth: 2 });
  const bodyMesh = createVoxelModel({ layers: bodyLayers, palette, voxelSize: vs, depth: 2 });
  const leftArmMesh = createVoxelModel({ layers: leftArmLayers, palette, voxelSize: vs, depth: 2 });
  const rightArmMesh = createVoxelModel({ layers: rightArmLayers, palette, voxelSize: vs, depth: 2 });
  const leftLegMesh = createVoxelModel({ layers: leftLegLayers, palette, voxelSize: vs, depth: 2 });
  const rightLegMesh = createVoxelModel({ layers: rightLegLayers, palette, voxelSize: vs, depth: 2 });

  // 파츠별 피벗 포인트(회전 중심) 설정
  // 머리: 목 아래쪽 중심 (y ≈ -1.5 voxel)
  // 몸통: 골반 중심 (y ≈ -3 voxel)
  // 팔: 어깨 관절 (몸통 상단 양옆)
  // 다리: 고관절 (몸통 하단 양옆)

  const parts = [];

  // 머리 - 피벗: 목 아래 (몸통과 연결되는 지점)
  if (headMesh) {
    const headGroup = new THREE.Group();
    headGroup.name = 'head';
    // 머리를 피벗 기준으로 이동: 피벗이 (0, -1.5*vs, 0)에 오도록
    headMesh.position.set(0, 0, 0);
    headGroup.add(headMesh);
    // 머리 피벗 위치는 몸통 어깨 위쪽
    headGroup.position.set(0, 12 * vs, 0);
    parts.push({ group: headGroup, pivot: new THREE.Vector3(0, 7.5 * vs, 0) });
  }

  // 몸통 - 피벗: 골반 중심
  if (bodyMesh) {
    const bodyGroup = new THREE.Group();
    bodyGroup.name = 'body';
    bodyMesh.position.set(0, 0, 0);
    bodyGroup.add(bodyMesh);
    bodyGroup.position.set(0, 6 * vs, 0);
    parts.push({ group: bodyGroup, pivot: new THREE.Vector3(0, 0, 0) });
  }

  // 왼팔 - 피벗: 어깨 (몸통 오른쪽 상단)
  if (leftArmMesh) {
    const armGroup = new THREE.Group();
    armGroup.name = 'leftArm';
    // 팔 피벗이 어깨 위치에 오도록: 팔의 상단(어깨)이 0,0,0
    leftArmMesh.position.set(0, -6 * vs, 0);
    armGroup.add(leftArmMesh);
    // 어깨 위치는 몸통 오른쪽 위
    armGroup.position.set(-2.5 * vs, 12 * vs, 0);
    parts.push({ group: armGroup, pivot: new THREE.Vector3(-2.5 * vs, 7 * vs, 0) });
  }

  // 오른팔 - 피벗: 어깨 (몸통 왼쪽 상단)
  if (rightArmMesh) {
    const armGroup = new THREE.Group();
    armGroup.name = 'rightArm';
    rightArmMesh.position.set(0, -6 * vs, 0);
    armGroup.add(rightArmMesh);
    armGroup.position.set(2.5 * vs, 12 * vs, 0);
    parts.push({ group: armGroup, pivot: new THREE.Vector3(2.5 * vs, 7 * vs, 0) });
  }

  // 왼다리 - 피벗: 고관절 (몸통 하단 오른쪽)
  if (leftLegMesh) {
    const legGroup = new THREE.Group();
    legGroup.name = 'leftLeg';
    leftLegMesh.position.set(0, -6 * vs, 0);
    legGroup.add(leftLegMesh);
    legGroup.position.set(-1 * vs, 6 * vs, 0);
    parts.push({ group: legGroup, pivot: new THREE.Vector3(-1 * vs, 0, 0) });
  }

  // 오른다리 - 피벗: 고관절 (몸통 하단 왼쪽)
  if (rightLegMesh) {
    const legGroup = new THREE.Group();
    legGroup.name = 'rightLeg';
    rightLegMesh.position.set(0, -6 * vs, 0);
    legGroup.add(rightLegMesh);
    legGroup.position.set(1 * vs, 6 * vs, 0);
    parts.push({ group: legGroup, pivot: new THREE.Vector3(1 * vs, 0, 0) });
  }

  // 최종 캐릭터 그룹 구성
  const character = new THREE.Group();
  character.name = 'character';

  // 각 파츠를 캐릭터 그룹에 추가하고, 피벗 정보 저장
  parts.forEach(({ group, pivot }) => {
    character.add(group);
    group.userData.pivot = pivot.clone();
    group.userData.initialPosition = group.position.clone();
    group.userData.initialRotation = group.rotation.clone();
  });

  // 캐릭터 전체 스케일 조정 (voxelSize 보정)
  character.scale.setScalar(1);

  // 편의 메서드 추가
  character.getPart = (name) => character.getObjectByName(name);
  character.getParts = () => ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg']
    .map(name => character.getObjectByName(name))
    .filter(Boolean);

  // 색상 변경 메서드
  character.setColors = ({ hairColor, skinColor, clothesColor } = {}) => {
    const newHair = hairColor ? new THREE.Color(hairColor) : c.hair;
    const newSkin = skinColor ? new THREE.Color(skinColor) : c.skin;
    const newClothes = clothesColor ? new THREE.Color(clothesColor) : c.clothes;

    // 각 파츠의 머티리얼 색상 업데이트 (InstancedMesh의 instanceColor)
    character.traverse(obj => {
      if (obj.isInstancedMesh && obj.instanceColor) {
        // 색상 재할당이 필요하면 여기에서 처리
        // 현재는 생성 시점에 색상이 고정되므로, 색상 변경을 원하면 재생성 필요
      }
    });
  };

  // 랜덤 외형으로 재생성
  character.randomize = () => {
    return createCharacter({ voxelSize });
  };

  return character;
}

/**
 * 캐릭터 외형 랜덤화 - 새로운 랜덤 색상으로 캐릭터 재생성
 * @param {THREE.Group} oldCharacter - 기존 캐릭터 (씬에서 제거됨)
 * @param {number} voxelSize - 복셀 크기
 * @returns {THREE.Group} 새로운 캐릭터
 */
export function randomizeCharacter(oldCharacter, voxelSize = 0.5) {
  // 기존 캐릭터가 씬에 있다면 제거
  if (oldCharacter && oldCharacter.parent) {
    oldCharacter.parent.remove(oldCharacter);
  }

  // 새로운 랜덤 캐릭터 생성
  return createCharacter({ voxelSize });
}

/**
 * 캐릭터 파츠별 피벗 기준 회전 헬퍼
 * @param {THREE.Group} character - 캐릭터 루트 그룹
 * @param {string} partName - 파츠 이름
 * @param {THREE.Euler|Object} rotation - 오일러 각도
 * @param {boolean} absolute - 절대 회전 여부 (기본 true: 피벗 기준 절대값)
 */
export function rotatePart(character, partName, rotation, absolute = true) {
  const part = character.getPart(partName);
  if (!part) return;

  const pivot = part.userData.pivot;
  if (!pivot) return;

  if (absolute) {
    part.rotation.copy(rotation);
  } else {
    part.rotation.x += rotation.x || 0;
    part.rotation.y += rotation.y || 0;
    part.rotation.z += rotation.z || 0;
  }
}

/**
 * 모든 파츠 초기 자세로 리셋
 */
export function resetPose(character) {
  ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'].forEach(name => {
    const part = character.getPart(name);
    if (part) {
      part.position.copy(part.userData.initialPosition);
      part.rotation.copy(part.userData.initialRotation);
    }
  });
}

export default createCharacter;

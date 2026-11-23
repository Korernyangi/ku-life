import * as THREE from 'three';
import { createCafeCounter, createCafeTable, createChair } from '../models/cafe.js';
import { createCharacter } from '../models/character.js';

/**
 * 알바/카페 장면
 */
export function createPartTimeScene({ voxelSize = 1 } = {}) {
  const scene = new THREE.Group();
  scene.name = 'parttime';

  // 바닥 (타일 느낌)
  const floorGeometry = new THREE.PlaneGeometry(14 * voxelSize, 14 * voxelSize);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xD4C4A8,
    roughness: 0.7,
    metalness: 0.1,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  // 카운터 (뒤쪽 중앙)
  const counter = createCafeCounter({ voxelSize });
  if (counter) {
    counter.position.set(0, 0, -5 * voxelSize);
    scene.add(counter);
  }

  // 테이블들
  const tablePositions = [
    { x: -4, z: 2 },
    { x: 4, z: 2 },
    { x: -4, z: 0 },
    { x: 4, z: 0 },
    { x: 0, z: 3 },
  ];

  tablePositions.forEach(pos => {
    const table = createCafeTable({ voxelSize });
    if (table) {
      table.position.set(pos.x * voxelSize, 0, pos.z * voxelSize);
      scene.add(table);

      // 의자 2개씩
      const chair1 = createChair({ voxelSize });
      if (chair1) {
        chair1.position.set(pos.x * voxelSize - 1.5 * voxelSize, 0, pos.z * voxelSize);
        chair1.rotation.y = Math.PI;
        scene.add(chair1);
      }
      const chair2 = createChair({ voxelSize });
      if (chair2) {
        chair2.position.set(pos.x * voxelSize + 1.5 * voxelSize, 0, pos.z * voxelSize);
        scene.add(chair2);
      }
    }
  });

  // 선반/진열대 (벽면)
  createShelves(scene, voxelSize);

  // 창문
  addWindows(scene, voxelSize);

  // 손님 NPC들 (앉아있는 상태)
  const customerPositions = [
    { x: -4, z: 2, rotation: Math.PI },
    { x: 4, z: 0, rotation: 0 },
    { x: 0, z: 3, rotation: -Math.PI / 2 },
  ];

  customerPositions.forEach((pos, i) => {
    const customer = createCharacter({ voxelSize: voxelSize * 0.85 });
    if (customer) {
      customer.position.set(pos.x * voxelSize, 0, pos.z * voxelSize);
      customer.rotation.y = pos.rotation;
      customer.name = `customer_${i}`;
      customer.userData.anim = 'idle';
      // 앉아있는 자세로 조정
      sitCharacter(customer);
      scene.add(customer);
    }
  });

  // 바리스타 NPC (카운터 뒤)
  const barista = createCharacter({ voxelSize: voxelSize * 0.9 });
  if (barista) {
    barista.position.set(0, 0, -6.5 * voxelSize);
    barista.rotation.y = 0;
    barista.name = 'barista';
    barista.userData.anim = 'study'; // 커피 만드는 자세 비슷하게
    scene.add(barista);
  }

  // 조명 (따뜻한 카페 조명)
  addCafeLighting(scene, voxelSize);

  // 씬 메타데이터
  scene.userData = {
    name: 'parttime',
    spawnPoint: new THREE.Vector3(0, 0.3, -2 * voxelSize), // 카운터 앞
    cameraTarget: new THREE.Vector3(0, 1.5, -3 * voxelSize),
    cameraDistance: 10,
    cameraAngle: Math.PI,
    cameraHeight: 7,
    characterAnimation: 'study', // 일하는 자세
  };

  return scene;
}

function createShelves(scene, voxelSize) {
  const shelfGeo = new THREE.BoxGeometry(10 * voxelSize, 0.3 * voxelSize, 1 * voxelSize);
  const shelfMat = new THREE.MeshStandardMaterial({
    color: 0x3D2B1F,
    roughness: 0.8,
  });

  // 왼쪽 벽
  for (let y = 1; y <= 4; y++) {
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(-6.5 * voxelSize, y * 1.2 * voxelSize, 0);
    shelf.rotation.y = Math.PI / 2;
    scene.add(shelf);

    // 물건들
    addShelfItems(scene, -7 * voxelSize, y * 1.2 * voxelSize, voxelSize);
  }

  // 오른쪽 벽
  for (let y = 1; y <= 4; y++) {
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(6.5 * voxelSize, y * 1.2 * voxelSize, 0);
    shelf.rotation.y = -Math.PI / 2;
    scene.add(shelf);

    addShelfItems(scene, 7 * voxelSize, y * 1.2 * voxelSize, voxelSize);
  }
}

function addShelfItems(scene, x, y, voxelSize) {
  const items = [
    { color: 0x8B4513, scale: [0.3, 0.5, 0.3] }, // 원두통
    { color: 0xFFF8DC, scale: [0.2, 0.3, 0.2] }, // 컵
    { color: 0xC0C0C0, scale: [0.4, 0.2, 0.3] }, // 머신 부품
    { color: 0xFFD700, scale: [0.25, 0.25, 0.25] }, // 시럽
  ];

  items.forEach((item, i) => {
    const geo = new THREE.BoxGeometry(
      item.scale[0] * voxelSize,
      item.scale[1] * voxelSize,
      item.scale[2] * voxelSize
    );
    const mat = new THREE.MeshStandardMaterial({
      color: item.color,
      roughness: 0.6,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, (i - 1.5) * 1.2 * voxelSize);
    scene.add(mesh);
  });
}

function addWindows(scene, voxelSize) {
  const windowGeo = new THREE.PlaneGeometry(3 * voxelSize, 2.5 * voxelSize);
  const windowMat = new THREE.MeshBasicMaterial({
    color: 0x87CEEB,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });

  // 앞쪽 창문들
  for (let i = -1; i <= 1; i++) {
    const window = new THREE.Mesh(windowGeo, windowMat);
    window.position.set(i * 4.5 * voxelSize, 2 * voxelSize, 6.5 * voxelSize);
    window.rotation.y = Math.PI;
    scene.add(window);
  }
}

function addCafeLighting(scene, voxelSize) {
  // 펜던트 조명들
  const lightPositions = [
    [-3, 0, 2], [3, 0, 2], [-3, 0, 0], [3, 0, 0], [0, 0, 3],
  ];

  lightPositions.forEach(pos => {
    // 조명 본체
    const shadeGeo = new THREE.ConeGeometry(0.4 * voxelSize, 0.6 * voxelSize, 8);
    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0x3D2B1F,
      roughness: 0.7,
    });
    const shade = new THREE.Mesh(shadeGeo, shadeMat);
    shade.position.set(pos[0] * voxelSize, 3.5 * voxelSize, pos[1] * voxelSize);
    shade.rotation.x = Math.PI;
    scene.add(shade);

    // 코드
    const cordGeo = new THREE.CylinderGeometry(0.02 * voxelSize, 0.02 * voxelSize, 1.5 * voxelSize, 4);
    const cordMat = new THREE.MeshStandardMaterial({ color: 0x1A1A1A });
    const cord = new THREE.Mesh(cordGeo, cordMat);
    cord.position.set(pos[0] * voxelSize, 2.75 * voxelSize, pos[1] * voxelSize);
    scene.add(cord);
  });
}

function sitCharacter(character) {
  // 앉는 자세로 파츠 조정
  const leftLeg = character.getPart('leftLeg');
  const rightLeg = character.getPart('rightLeg');
  const leftArm = character.getPart('leftArm');
  const rightArm = character.getPart('rightArm');
  const head = character.getPart('head');

  if (leftLeg) leftLeg.rotation.x = -Math.PI / 2;
  if (rightLeg) rightLeg.rotation.x = -Math.PI / 2;
  if (leftArm) leftArm.rotation.x = -0.5;
  if (rightArm) rightArm.rotation.x = -0.5;
  if (head) head.rotation.x = -0.1;

  // 몸통 살짝 낮춤
  const body = character.getPart('body');
  if (body) body.position.y -= 0.5;
}

export default createPartTimeScene;

import * as THREE from 'three';
import { createDesk, createBookStack } from '../models/desk.js';
import { createGrass } from '../models/grass.js';

/**
 * 도서관 공부 장면
 */
export function createStudyScene({ voxelSize = 1 } = {}) {
  const scene = new THREE.Group();
  scene.name = 'study';

  // 바닥 (어두운 나무 바닥 느낌)
  const floorGeometry = new THREE.PlaneGeometry(12 * voxelSize, 12 * voxelSize);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x4A3728,
    roughness: 0.8,
    metalness: 0.1,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  // 책상 (중앙)
  const desk = createDesk({ voxelSize });
  if (desk) {
    desk.position.set(0, 0, 0);
    scene.add(desk);
  }

  // 책 더미들
  const bookStack1 = createBookStack({ voxelSize, count: 4 });
  if (bookStack1) {
    bookStack1.position.set(-1.5 * voxelSize, 2 * voxelSize, -1 * voxelSize);
    scene.add(bookStack1);
  }

  const bookStack2 = createBookStack({ voxelSize, count: 3 });
  if (bookStack2) {
    bookStack2.position.set(1.5 * voxelSize, 2 * voxelSize, 1 * voxelSize);
    scene.add(bookStack2);
  }

  // 책장들 (배경)
  createBookshelves(scene, voxelSize);

  // 창문 빛 효과
  addWindowLight(scene, voxelSize);

  // 씬 메타데이터
  scene.userData = {
    name: 'study',
    spawnPoint: new THREE.Vector3(0, 0.3, 2.5 * voxelSize), // 책상 앞
    cameraTarget: new THREE.Vector3(0, 1.5, 0),
    cameraDistance: 8,
    cameraAngle: -Math.PI / 6,
    cameraHeight: 6,
    characterAnimation: 'study',
  };

  return scene;
}

function createBookshelves(scene, voxelSize) {
  const shelfGeometry = new THREE.BoxGeometry(0.5 * voxelSize, 6 * voxelSize, 4 * voxelSize);
  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: 0x3D2B1F,
    roughness: 0.8,
  });

  // 뒤쪽 양옆 책장
  const positions = [
    [-5.5, 3, -5], [5.5, 3, -5],
    [-5.5, 3, 5], [5.5, 3, 5],
  ];

  positions.forEach(pos => {
    const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelf.position.set(pos[0] * voxelSize, pos[1] * voxelSize, pos[2] * voxelSize);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    scene.add(shelf);

    // 책들 (박스로 표현)
    for (let y = 0; y < 5; y++) {
      for (let z = 0; z < 3; z++) {
        const bookGeo = new THREE.BoxGeometry(0.4 * voxelSize, 0.3 * voxelSize, 1.2 * voxelSize);
        const colors = [0x8B0000, 0x4A1A1A, 0x1A3A5C, 0x2D4A3A, 0x5C2D4A, 0x3A3A5C, 0x8B4513];
        const bookMat = new THREE.MeshStandardMaterial({
          color: colors[Math.floor(Math.random() * colors.length)],
          roughness: 0.9,
        });
        const book = new THREE.Mesh(bookGeo, bookMat);
        book.position.set(
          pos[0] * voxelSize,
          (y * 0.35 + 0.5) * voxelSize,
          pos[2] * voxelSize + (z - 1) * 1.3 * voxelSize
        );
        scene.add(book);
      }
    }
  });
}

function addWindowLight(scene, voxelSize) {
  // 창문에서 들어오는 빛 빔
  const beamGeometry = new THREE.BoxGeometry(4 * voxelSize, 6 * voxelSize, 0.2 * voxelSize);
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFF8DC,
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const beam = new THREE.Mesh(beamGeometry, beamMaterial);
  beam.position.set(0, 3 * voxelSize, -5.5 * voxelSize);
  beam.rotation.y = Math.PI / 2;
  scene.add(beam);

  // 두 번째 빔
  const beam2 = beam.clone();
  beam2.position.set(0, 3 * voxelSize, 5.5 * voxelSize);
  scene.add(beam2);
}

export default createStudyScene;

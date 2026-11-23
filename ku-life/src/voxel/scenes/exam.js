import * as THREE from 'three';
import { createDesk, createBookStack } from '../models/desk.js';
import { createDeskLamp, createLightBeam } from '../models/lamp.js';

/**
 * 시험/밤 장면 (스탠드 조명만 있는 어두운 방)
 */
export function createExamScene({ voxelSize = 1 } = {}) {
  const scene = new THREE.Group();
  scene.name = 'exam';

  // 바닥 (어두운 방 바닥)
  const floorGeometry = new THREE.PlaneGeometry(10 * voxelSize, 10 * voxelSize);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x1A1A2E,
    roughness: 0.9,
    metalness: 0.05,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  // 벽 (어두운 배경)
  createWalls(scene, voxelSize);

  // 책상 (중앙)
  const desk = createDesk({ voxelSize });
  if (desk) {
    desk.position.set(0, 0, 0);
    scene.add(desk);
  }

  // 스탠드 조명 (책상 위)
  const lamp = createDeskLamp({ voxelSize });
  if (lamp) {
    lamp.position.set(-1.5 * voxelSize, 2 * voxelSize, -0.5 * voxelSize);
    scene.add(lamp);
  }

  // 빛 빔 효과
  const lightBeam = createLightBeam({ voxelSize: voxelSize * 0.2, height: 4 });
  if (lightBeam) {
    lightBeam.position.set(-1.5 * voxelSize, 2.5 * voxelSize, -0.5 * voxelSize);
    scene.add(lightBeam);
    scene.userData.lightBeam = lightBeam;
  }

  // 책 더미들 (공부 자료)
  const bookStack1 = createBookStack({ voxelSize, count: 5 });
  if (bookStack1) {
    bookStack1.position.set(1.5 * voxelSize, 2 * voxelSize, -1 * voxelSize);
    scene.add(bookStack1);
  }

  const bookStack2 = createBookStack({ voxelSize, count: 4 });
  if (bookStack2) {
    bookStack2.position.set(1 * voxelSize, 2 * voxelSize, 1.5 * voxelSize);
    scene.add(bookStack2);
  }

  // 연필/펜
  addStationery(scene, voxelSize);

  // 시계 (벽에)
  addClock(scene, voxelSize);

  // 창문 (어두운 밤하늘)
  addNightWindow(scene, voxelSize);

  // 씬 메타데이터
  scene.userData = {
    name: 'exam',
    spawnPoint: new THREE.Vector3(0, 0.3, 2.5 * voxelSize),
    cameraTarget: new THREE.Vector3(0, 1.5, 0),
    cameraDistance: 7,
    cameraAngle: -Math.PI / 4,
    cameraHeight: 5,
    characterAnimation: 'study',
    isNight: true,
    isExam: true,
  };

  return scene;
}

function createWalls(scene, voxelSize) {
  const wallGeo = new THREE.PlaneGeometry(12 * voxelSize, 6 * voxelSize);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x0D0D1A,
    roughness: 0.95,
    metalness: 0,
    side: THREE.DoubleSide,
  });

  // 뒤쪽 벽
  const backWall = new THREE.Mesh(wallGeo, wallMat);
  backWall.position.set(0, 3 * voxelSize, -6 * voxelSize);
  scene.add(backWall);

  // 왼쪽 벽
  const leftWall = new THREE.Mesh(wallGeo, wallMat);
  leftWall.position.set(-6 * voxelSize, 3 * voxelSize, 0);
  leftWall.rotation.y = Math.PI / 2;
  scene.add(leftWall);

  // 오른쪽 벽
  const rightWall = new THREE.Mesh(wallGeo, wallMat);
  rightWall.position.set(6 * voxelSize, 3 * voxelSize, 0);
  rightWall.rotation.y = -Math.PI / 2;
  scene.add(rightWall);
}

function addStationery(scene, voxelSize) {
  const items = [
    { pos: [-1.2, 2.2, -0.8], color: 0xFFD700, scale: [0.05, 0.3, 0.05] }, // 연필
    { pos: [-1, 2.2, -0.8], color: 0x1A1A1A, scale: [0.05, 0.3, 0.05] },
    { pos: [-0.8, 2.2, -0.8], color: 0x00BFFF, scale: [0.05, 0.3, 0.05] },
    { pos: [-1.5, 2.15, -0.5], color: 0xFF6B6B, scale: [0.2, 0.03, 0.15] }, // 지우개
    { pos: [1.8, 2.2, 0], color: 0x3A3A3A, scale: [0.08, 0.4, 0.08] }, // 펜
  ];

  items.forEach(item => {
    const geo = new THREE.BoxGeometry(
      item.scale[0] * voxelSize,
      item.scale[1] * voxelSize,
      item.scale[2] * voxelSize
    );
    const mat = new THREE.MeshStandardMaterial({
      color: item.color,
      roughness: 0.3,
      metalness: item.color === 0xC0C0C0 ? 0.8 : 0.1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      item.pos[0] * voxelSize,
      item.pos[1] * voxelSize,
      item.pos[2] * voxelSize
    );
    scene.add(mesh);
  });
}

function addClock(scene, voxelSize) {
  // 시계 프레임
  const frameGeo = new THREE.CylinderGeometry(0.8 * voxelSize, 0.8 * voxelSize, 0.1 * voxelSize, 16);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x2A2A2A, roughness: 0.8 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(0, 4.5 * voxelSize, -5.9 * voxelSize);
  frame.rotation.x = Math.PI / 2;
  scene.add(frame);

  // 시계 면
  const faceGeo = new THREE.CircleGeometry(0.7 * voxelSize, 16);
  const faceMat = new THREE.MeshBasicMaterial({ color: 0xFFF8DC, side: THREE.DoubleSide });
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.set(0, 4.5 * voxelSize, -5.85 * voxelSize);
  face.rotation.x = -Math.PI / 2;
  scene.add(face);

  // 시계 바늘 (시침 - 밤 2시)
  const hourHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.05 * voxelSize, 0.35 * voxelSize, 0.05 * voxelSize),
    new THREE.MeshBasicMaterial({ color: 0x1A1A1A })
  );
  hourHand.position.set(0, 4.5 * voxelSize, -5.8 * voxelSize);
  hourHand.rotation.z = -Math.PI / 6; // 2시 방향
  scene.add(hourHand);

  // 분침
  const minHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.03 * voxelSize, 0.5 * voxelSize, 0.03 * voxelSize),
    new THREE.MeshBasicMaterial({ color: 0x1A1A1A })
  );
  minHand.position.set(0, 4.5 * voxelSize, -5.78 * voxelSize);
  scene.add(minHand);
}

function addNightWindow(scene, voxelSize) {
  // 창문 프레임
  const frameGeo = new THREE.BoxGeometry(3 * voxelSize, 2 * voxelSize, 0.1 * voxelSize);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x3D2B1F, roughness: 0.8 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(5.5 * voxelSize, 3 * voxelSize, 0);
  frame.rotation.y = Math.PI / 2;
  scene.add(frame);

  // 창문 유리 (어두운 밤)
  const glassGeo = new THREE.PlaneGeometry(2.8 * voxelSize, 1.8 * voxelSize);
  const glassMat = new THREE.MeshBasicMaterial({
    color: 0x0A0A1A,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(5.55 * voxelSize, 3 * voxelSize, 0);
  glass.rotation.y = Math.PI / 2;
  scene.add(glass);

  // 달빛 반사
  const moonReflection = new THREE.Mesh(
    new THREE.CircleGeometry(0.4 * voxelSize, 16),
    new THREE.MeshBasicMaterial({
      color: 0xFFF8DC,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    })
  );
  moonReflection.position.set(5.56 * voxelSize, 3.5 * voxelSize, -0.5 * voxelSize);
  moonReflection.rotation.y = Math.PI / 2;
  scene.add(moonReflection);
}

/**
 * 빛 빔 애니메이션 업데이트
 */
export function updateExamScene(scene, deltaTime) {
  const lightBeam = scene.userData.lightBeam;
  if (lightBeam) {
    // 빛 빔이 살짝 펄싱
    const time = Date.now() * 0.001;
    const scale = 1 + Math.sin(time * 2) * 0.05;
    lightBeam.scale.setScalar(scale);
    lightBeam.material.opacity = 0.1 + Math.sin(time * 3) * 0.03;
  }
}

export default createExamScene;

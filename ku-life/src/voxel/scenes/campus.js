import * as THREE from 'three';
import { createMainBuilding, createDepartmentBuilding, createLibrary } from '../models/building.js';
import { createTree, createCherryTree } from '../models/tree.js';
import { createBench } from '../models/bench.js';
import { createGrassWithPaths } from '../models/grass.js';
import { SEASON_CONFIG, getSeasonFromSemester } from '../particles.js';

/**
 * 메인 캠퍼스 씬 생성
 */
export function createCampusScene({ semester = 1, voxelSize = 1 } = {}) {
  const season = getSeasonFromSemester(semester);
  const config = SEASON_CONFIG[season];

  const scene = new THREE.Group();
  scene.name = 'campus';

  // 잔디 바닥 (경로 포함)
  const paths = [
    { x: 7, y: 0, width: 2, height: 15 }, // 세로 중앙 길
    { x: 0, y: 7, width: 15, height: 2 }, // 가로 중앙 길
  ];
  const grass = createGrassWithPaths({
    width: 15,
    depth: 15,
    voxelSize,
    season: config.grassSeason,
    paths,
  });
  if (grass) {
    grass.position.set(-7.5 * voxelSize, 0, -7.5 * voxelSize);
    scene.add(grass);
  }

  // 본관 (왼쪽 뒤)
  const mainBuilding = createMainBuilding({ voxelSize });
  if (mainBuilding) {
    mainBuilding.scale.setScalar(0.7);
    mainBuilding.position.set(-9 * voxelSize, 0, -8 * voxelSize);
    scene.add(mainBuilding);
  }

  // 단과대 건물 (오른쪽 뒤)
  const deptBuilding = createDepartmentBuilding({ voxelSize });
  if (deptBuilding) {
    deptBuilding.scale.setScalar(0.7);
    deptBuilding.position.set(5 * voxelSize, 0, -8 * voxelSize);
    scene.add(deptBuilding);
  }

  // 도서관 (왼쪽 앞)
  const library = createLibrary({ voxelSize });
  if (library) {
    library.scale.setScalar(0.7);
    library.position.set(9 * voxelSize, 0, -8 * voxelSize);
    scene.add(library);
  }

  // 나무들 (계절에 따라)
  const treePositions = [
    { x: -11, z: -11, type: 'deciduous' },
    { x: 11, z: -11, type: 'deciduous' },
    { x: -11, z: 11, type: 'deciduous' },
    { x: 11, z: 11, type: 'deciduous' },
    { x: -6, z: -5, type: 'deciduous' },
    { x: 6, z: -5, type: 'deciduous' },
    { x: -6, z: 5, type: 'cherry' }, // 벚꽃 나무
    { x: 6, z: 5, type: 'cherry' },
  ];

  treePositions.forEach(pos => {
    let tree;
    if (pos.type === 'cherry' && season === 'spring') {
      tree = createCherryTree({ voxelSize });
    } else {
      tree = createTree({ type: pos.type, voxelSize });
    }
    if (tree) {
      if (pos.type === 'cherry') tree.userData.isCherryTree = true;
      tree.position.set(pos.x * voxelSize, 0, pos.z * voxelSize);
      scene.add(tree);
    }
  });

  // 벤치들
  const benchPositions = [
    { x: -3, z: 2, rotation: 0 },
    { x: 3, z: 2, rotation: 0 },
    { x: 0, z: -4, rotation: Math.PI / 2 },
    { x: -8, z: 0, rotation: Math.PI / 2 },
    { x: 8, z: 0, rotation: -Math.PI / 2 },
  ];

  benchPositions.forEach(pos => {
    const bench = createBench({ voxelSize, length: 4 });
    if (bench) {
      bench.position.set(pos.x * voxelSize, 0, pos.z * voxelSize);
      bench.rotation.y = pos.rotation;
      scene.add(bench);
    }
  });

  // 시즌별 추가 장식
  if (season === 'spring') {
    // 벚꽃 꽃잎 추가 (파티클 시스템에서 처리)
  } else if (season === 'autumn') {
    // 낙엽 더미
    addLeafPiles(scene, voxelSize);
  } else if (season === 'winter') {
    // 눈사람
    addSnowmen(scene, voxelSize);
  }

  // 씬 메타데이터
  scene.userData = {
    name: 'campus',
    season,
    semester,
    spawnPoint: new THREE.Vector3(0, 0.3, 2), // 중앙 산책로 앞쪽 시작 위치
    cameraTarget: new THREE.Vector3(0, 2, 0),
    cameraDistance: 32,
    cameraAngle: Math.PI / 4,
    cameraHeight: 18,
  };

  return scene;
}

function addLeafPiles(scene, voxelSize) {
  const geometry = new THREE.BoxGeometry(voxelSize * 0.5, voxelSize * 0.2, voxelSize * 0.5);
  const material = new THREE.MeshStandardMaterial({
    color: 0xCD853F,
    roughness: 0.9,
  });

  const positions = [
    [-5, 0, -3], [5, 0, -3], [-5, 0, 3], [5, 0, 3],
    [0, 0, -6], [0, 0, 6], [-7, 0, 0], [7, 0, 0],
  ];

  positions.forEach(pos => {
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        pos[0] * voxelSize + (Math.random() - 0.5) * voxelSize,
        0.1,
        pos[1] * voxelSize + (Math.random() - 0.5) * voxelSize
      );
      mesh.scale.setScalar(0.5 + Math.random() * 0.5);
      scene.add(mesh);
    }
  });
}

function addSnowmen(scene, voxelSize) {
  const geometry = new THREE.SphereGeometry(voxelSize * 0.5, 8, 6);
  const material = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    roughness: 0.9,
  });

  const positions = [[-4, 0, 4], [4, 0, 4], [-4, 0, -4], [4, 0, -4]];

  positions.forEach(pos => {
    // 몸통
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(voxelSize * 0.6, 8, 6),
      material
    );
    body.position.set(pos[0] * voxelSize, voxelSize * 0.6, pos[1] * voxelSize);
    scene.add(body);

    // 머리
    const head = new THREE.Mesh(geometry, material);
    head.position.set(pos[0] * voxelSize, voxelSize * 1.5, pos[1] * voxelSize);
    scene.add(head);

    // 코 (당근)
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(voxelSize * 0.1, voxelSize * 0.3, 4),
      new THREE.MeshStandardMaterial({ color: 0xFF8C00 })
    );
    nose.position.set(pos[0] * voxelSize, voxelSize * 1.5, pos[1] * voxelSize + voxelSize * 0.5);
    nose.rotation.x = -Math.PI / 2;
    scene.add(nose);
  });
}

/**
 * 계절 변경 시 잔디/나무 업데이트
 */
export function updateCampusSeason(scene, semester, voxelSize = 1) {
  const season = getSeasonFromSemester(semester);
  const config = SEASON_CONFIG[season];

  // 잔디 교체
  const oldGrass = scene.getObjectByName('grass');
  if (oldGrass) {
    scene.remove(oldGrass);
    oldGrass.geometry.dispose();
    oldGrass.material.dispose();
  }

  const paths = [
    { x: 7, y: 0, width: 2, height: 15 },
    { x: 0, y: 7, width: 15, height: 2 },
  ];
  const grass = createGrassWithPaths({
    width: 15, depth: 15, voxelSize, season: config.grassSeason, paths
  });
  if (grass) {
    grass.name = 'grass';
    grass.position.set(-7.5 * voxelSize, 0, -7.5 * voxelSize);
    scene.add(grass);
  }

  // 나무 교체 (순회 도중 자식 배열을 바꾸면 씬 순회가 깨질 수 있어 따로 모은다)
  const cherryTrees = [];
  scene.traverse(obj => {
    if (obj.userData.isCherryTree) cherryTrees.push(obj);
  });
  if (season !== 'spring') {
    cherryTrees.forEach(tree => {
      tree.parent?.remove(tree);
      tree.geometry?.dispose();
      tree.material?.dispose();
    });
  }

  if (season === 'spring' && cherryTrees.length === 0) {
    const cherryPositions = [
      { x: -6, z: 5 }, { x: 6, z: 5 }
    ];
    cherryPositions.forEach(pos => {
      const tree = createCherryTree({ voxelSize });
      if (tree) {
        tree.userData.isCherryTree = true;
        tree.position.set(pos.x * voxelSize, 0, pos.z * voxelSize);
        scene.add(tree);
      }
    });
  }

  scene.userData.season = season;
  scene.userData.semester = semester;

  return config;
}

export default createCampusScene;

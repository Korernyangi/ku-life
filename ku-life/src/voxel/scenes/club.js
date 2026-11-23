import * as THREE from 'three';
import { createCampfire, createFireParticles, updateCampfireParticles } from '../models/campfire.js';
import { createBench } from '../models/bench.js';
import { createCharacter } from '../models/character.js';
import { createGrass } from '../models/grass.js';
import { createTree } from '../models/tree.js';

/**
 * 동아리/모닥불 장면
 */
export function createClubScene({ voxelSize = 1 } = {}) {
  const scene = new THREE.Group();
  scene.name = 'club';

  // 바닥 (밤 잔디)
  const grass = createGrass({
    width: 20,
    depth: 20,
    voxelSize,
    season: 'autumn'
  });
  if (grass) {
    grass.position.set(-10 * voxelSize, 0, -10 * voxelSize);
    scene.add(grass);
  }

  // 모닥불 (중앙)
  const campfire = createCampfire({ voxelSize });
  if (campfire) {
    campfire.position.set(0, 0, 0);
    scene.add(campfire);
  }

  // 모닥불 파티클
  const fireParticles = createFireParticles({ count: 40, voxelSize: voxelSize * 0.2 });
  if (fireParticles) {
    fireParticles.position.set(0, voxelSize * 1.5, 0);
    scene.add(fireParticles);
    scene.userData.fireParticles = fireParticles;
  }

  // 벤치들 (모닥불 주변 원형)
  const benchCount = 6;
  for (let i = 0; i < benchCount; i++) {
    const angle = (i / benchCount) * Math.PI * 2;
    const radius = 4.5;
    const bench = createBench({ voxelSize, length: 3 });
    if (bench) {
      bench.position.set(
        Math.cos(angle) * radius * voxelSize,
        0,
        Math.sin(angle) * radius * voxelSize
      );
      bench.rotation.y = angle + Math.PI / 2; // 모닥불 바라보게
      scene.add(bench);
    }
  }

  // NPC 캐릭터들 (3명)
  const npcPositions = [
    { angle: Math.PI / 6, radius: 4, anim: 'cheer' },
    { angle: -Math.PI / 3, radius: 4, anim: 'idle' },
    { angle: Math.PI * 0.8, radius: 4, anim: 'walk' },
  ];

  npcPositions.forEach((pos, i) => {
    const npc = createCharacter({ voxelSize: voxelSize * 0.9 });
    if (npc) {
      npc.position.set(
        Math.cos(pos.angle) * pos.radius * voxelSize,
        0,
        Math.sin(pos.angle) * pos.radius * voxelSize
      );
      npc.rotation.y = pos.angle + Math.PI; // 모닥불 바라보게
      npc.name = `npc_${i}`;
      npc.userData.anim = pos.anim;
      scene.add(npc);
    }
  });

  // 나무들 (배경)
  addBackgroundTrees(scene, voxelSize);

  // 달빛
  addMoonlight(scene, voxelSize);

  // 씬 메타데이터
  scene.userData = {
    name: 'club',
    spawnPoint: new THREE.Vector3(0, 0.3, 5 * voxelSize),
    cameraTarget: new THREE.Vector3(0, 1.5, 0),
    cameraDistance: 12,
    cameraAngle: Math.PI / 3,
    cameraHeight: 8,
    characterAnimation: 'cheer',
    isNight: true,
  };

  return scene;
}

function addBackgroundTrees(scene, voxelSize) {
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const radius = 14 + Math.random() * 4;
    const tree = createTree({
      type: Math.random() > 0.5 ? 'pine' : 'deciduous',
      voxelSize: voxelSize * (0.8 + Math.random() * 0.4)
    });
    if (tree) {
      tree.position.set(
        Math.cos(angle) * radius * voxelSize,
        0,
        Math.sin(angle) * radius * voxelSize
      );
      scene.add(tree);
    }
  }
}

function addMoonlight(scene, voxelSize) {
  // 달
  const moonGeometry = new THREE.SphereGeometry(2 * voxelSize, 16, 16);
  const moonMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFF8DC,
  });
  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.position.set(15 * voxelSize, 15 * voxelSize, -10 * voxelSize);
  scene.add(moon);

  // 달빛 (방향광으로 처리될 것)
}

/**
 * 모닥불 파티클 업데이트 (매 프레임 호출)
 */
export function updateClubScene(scene, deltaTime) {
  const fireParticles = scene.userData.fireParticles;
  if (fireParticles) {
    updateCampfireParticles(fireParticles, deltaTime);
  }
}

export default createClubScene;

/**
 * 메인 진입점 - Three.js 초기화, GameEngine 생성, UI 연결
 */

import * as THREE from 'three';
import { GameEngine } from './game/engine.js';
import { CameraController } from './voxel/camera.js';
import { UIOverlay } from './ui/overlay.js';
import { randomizeCharacter } from './voxel/models/character.js';
import { createAnimator } from './voxel/animator.js';
import { PixelScene } from './ui/pixel-scene.js';
import { createPixelfxManager, getSeasonFromSemester } from './voxel/pixelfx-bridge.js';

// ===== Three.js 초기화 =====

// 캔버스 컨테이너
const canvasContainer = document.getElementById('canvas-container');
if (!canvasContainer) {
  console.error('Canvas container not found!');
}

// 렌더러
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
canvasContainer.appendChild(renderer.domElement);
// 장면 배경은 장면별 픽셀 아트 캔버스가 담당한다.
renderer.domElement.style.display = 'none';
const pixelScene = new PixelScene(canvasContainer);
pixelScene.draw('campus', 1);

// 씬
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // 기본 하늘색

// 카메라 (직교 카메라 - 등각 시점)
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 10;
const camera = new THREE.OrthographicCamera(
  -frustumSize * aspect / 2,
  frustumSize * aspect / 2,
  frustumSize / 2,
  -frustumSize / 2,
  0.1,
  200
);
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

// 카메라 컨트롤러
const cameraController = new CameraController(camera, renderer, {
  initialDistance: 15,
  initialAngle: -Math.PI / 4,
  initialHeight: 8,
  minDistance: 5,
  maxDistance: 40,
  minHeight: 3,
  maxHeight: 20,
  rotationSpeed: 0.5,
  zoomSpeed: 1.2,
  lerpSpeed: 0.08,
});

// 기본 조명 설정
function setupDefaultLights() {
  // 환경광
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
  ambientLight.name = 'ambientLight';
  scene.add(ambientLight);

  // 방향광 (태양)
  const dirLight = new THREE.DirectionalLight(0xFFF8DC, 1.0);
  dirLight.name = 'dirLight';
  dirLight.position.set(20, 30, 10);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 80;
  dirLight.shadow.camera.left = -25;
  dirLight.shadow.camera.right = 25;
  dirLight.shadow.camera.top = 25;
  dirLight.shadow.camera.bottom = -25;
  dirLight.shadow.bias = -0.001;
  dirLight.shadow.normalBias = 0.02;
  scene.add(dirLight);

  // 보조 조명 (그림자 부드럽게)
  const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
  fillLight.position.set(-10, 10, -10);
  scene.add(fillLight);

  // 바닥 반사광
  const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x8B7355, 0.4);
  scene.add(hemiLight);
}
setupDefaultLights();

// ===== GameEngine 생성 =====
let gameEngine = null;
let pixelfxManager = null;

async function initGame() {
  try {
    gameEngine = new GameEngine(renderer, camera, scene, cameraController);

    // UI 오버레이 생성
    const uiOverlay = new UIOverlay(document.getElementById('ui-container') || document.body, gameEngine);

    // Pixelfx Manager 생성 및 초기화
    try {
      pixelfxManager = await createPixelfxManager(renderer.domElement, uiOverlay.elements.root);
      // 초기 시즌 설정
      const initialSeason = getSeasonFromSemester(gameEngine.gameState.semester);
      await pixelfxManager.setSeason(initialSeason);
    } catch (e) {
      console.warn('Pixelfx init failed:', e);
    }

    // UI 콜백 연결
    uiOverlay.setCallbacks({
      onPrepareGame: () => gameEngine.prepareGame(),
      onGameStart: (preparedState) => {
        // 무작위 외형의 캐릭터를 현재 캠퍼스 씬에 배치한다.
        if (gameEngine.character) {
          gameEngine.character = randomizeCharacter(gameEngine.character, gameEngine.voxelSize * 0.35);
          gameEngine.animator = createAnimator(gameEngine.character);
          gameEngine.animator.play('idle');
        }
        gameEngine.startGame(preparedState);
        uiOverlay.updateProfile(gameEngine.gameState);
      },
      onChoiceSelect: (choiceIndex, scheduleSelection) => {
        gameEngine.chooseOption(choiceIndex, scheduleSelection);
      },
      onGradeContinue: () => gameEngine.continueAfterGrade(),
      onRestart: () => {
        // 게임 재시작
        location.reload();
      },
    });

    // GameEngine 콜백 연결
    gameEngine.onEventStart = (event, remainingCount) => {
      uiOverlay.showEvent(event, remainingCount);
    };
    gameEngine.onStatChange = (stats, changes) => {
      uiOverlay.updateStats(stats, changes);
      if (pixelfxManager) {
        const cx = pixelfxManager.effectCanvas.width / 2;
        const cy = pixelfxManager.effectCanvas.height / 2;
        Object.entries(changes).forEach(([stat, delta]) => {
          if (delta !== 0) pixelfxManager.playStatChange(stat, delta, cx, cy);
        });
      }
    };
    gameEngine.onSemesterChange = async (semester) => {
      uiOverlay.updateSemester(semester);
      uiOverlay.updateProfile(gameEngine.gameState);
      if (pixelfxManager) {
        const season = getSeasonFromSemester(semester);
        await pixelfxManager.setSeason(season);
      }
    };
    gameEngine.onGameEnd = (endingData) => {
      uiOverlay.showEnding(endingData);
    };
    gameEngine.onEventEnd = async (event, choice, changes, luckOutcome) => {
      uiOverlay.updateProfile(gameEngine.gameState);
      uiOverlay.showChoiceResult(event, choice, changes, luckOutcome);
      if (pixelfxManager) {
        const cx = pixelfxManager.effectCanvas.width / 2;
        const cy = pixelfxManager.effectCanvas.height / 2;
        if (changes.money !== 0) {
          await pixelfxManager.playMoneyChange(changes.money, cx, cy);
        }
        if (changes.hp > 0) {
          await pixelfxManager.playHeal(cx, cy);
        }
        if (changes.hp < 0) {
          await pixelfxManager.playBurn(cx, cy);
        }
      }
    };
    gameEngine.onSemesterGrade = (result, semester) => {
      uiOverlay.showSemesterGrade(result, semester, gameEngine.gameState);
    };
    gameEngine.onSceneChange = async (sceneName, scene) => {
      const prevScene = gameEngine.currentScene || 'campus';
      pixelScene.draw(sceneName, gameEngine.gameState.semester, gameEngine.gameState);
      if (pixelfxManager) {
        await pixelfxManager.changeScene(prevScene, sceneName);
      }
      console.log(`Scene changed to: ${sceneName}`);
    };

    // 초기 스탯 표시
    uiOverlay.updateStats(gameEngine.gameState.getAllStats());
    uiOverlay.updateSemester(gameEngine.gameState.semester);

    // 전역 참조 (디버깅용)
    window.gameEngine = gameEngine;
    window.uiOverlay = uiOverlay;
    window.cameraController = cameraController;
    window.renderer = renderer;
    window.scene = scene;
    window.camera = camera;
    window.pixelfxManager = pixelfxManager;

    console.log('Game initialized successfully!');
    return { gameEngine, uiOverlay, cameraController, pixelfxManager };
  } catch (error) {
    console.error('Failed to initialize game:', error);
    throw error;
  }
}

// ===== 리사이즈 핸들러 =====
function onResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const aspect = width / height;
  const frustumSize = 10;
  camera.left = -frustumSize * aspect / 2;
  camera.right = frustumSize * aspect / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();

  cameraController.onResize();

  if (pixelfxManager) {
    pixelfxManager.resize(width, height);
  }
}
window.addEventListener('resize', onResize);

// ===== 키보드 입력 (테스트용) =====
window.addEventListener('keydown', (e) => {
  if (gameEngine) {
    gameEngine.handleKeyDown(e.key.toLowerCase());
  }
});

// ===== 애니메이션 루프 =====
let lastTime = 0;
function animate(time) {
  const deltaTime = Math.min((time - lastTime) / 1000, 0.1); // 최대 100ms 클램프
  lastTime = time;

  // 카메라 업데이트
  cameraController.update(deltaTime);

  // 게임 엔진 업데이트
  if (gameEngine) {
    gameEngine.update(deltaTime);
  }

  // 픽셀 이펙트 업데이트
  if (pixelfxManager) {
    pixelfxManager.update(deltaTime);
  }

  // 렌더링
  renderer.render(scene, camera);

  // 픽셀 이펙트 그리기 (Three.js 렌더링 후)
  if (pixelfxManager) {
    pixelfxManager.draw();
  }

  requestAnimationFrame(animate);
}

// ===== 시작 =====
initGame().then(() => {
  requestAnimationFrame(animate);
}).catch(err => {
  console.error('Game init failed:', err);
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#1a1a2e;color:white;font-family:sans-serif;">
      <div style="text-align:center;">
        <h1>게임 로드 실패</h1>
        <p>${err.message}</p>
        <button onclick="location.reload()" style="margin-top:20px;padding:10px 20px;background:#FFD700;border:none;border-radius:8px;cursor:pointer;">다시 시도</button>
      </div>
    </div>
  `;
});

// 전역 디버그 함수
window.debug = {
  setStat: (stat, value) => {
    if (gameEngine) {
      gameEngine.gameState.stats[stat] = Math.max(0, Math.min(200, value));
      gameEngine.onStatChange?.(gameEngine.gameState.getAllStats(), { [stat]: value });
    }
  },
  nextSemester: () => gameEngine?.advanceSemester?.(),
  endGame: () => gameEngine?.endGame?.(),
  getState: () => gameEngine?.gameState?.serialize?.(),
};

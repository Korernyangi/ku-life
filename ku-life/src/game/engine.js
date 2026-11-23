import * as THREE from 'three';
import { GameState } from './state.js';
import eventsData from './data/events.json';
import { createCampusScene, updateCampusSeason } from '../voxel/scenes/campus.js';
import { createStudyScene } from '../voxel/scenes/study.js';
import { createClubScene, updateClubScene } from '../voxel/scenes/club.js';
import { createPartTimeScene } from '../voxel/scenes/parttime.js';
import { createExamScene, updateExamScene } from '../voxel/scenes/exam.js';
import { SeasonalParticles, SEASON_CONFIG, getSeasonFromSemester } from '../voxel/particles.js';
import { CharacterAnimator, createAnimator } from '../voxel/animator.js';
import { createCharacter } from '../voxel/models/character.js';

/**
 * 게임 엔진 - 상태 관리, 이벤트 처리, 씬 전환, 캐릭터/카메라 제어
 */
export class GameEngine {
  constructor(renderer, camera, scene, cameraController) {
    this.renderer = renderer;
    this.camera = camera;
    this.threeScene = scene;
    this.cameraController = cameraController;

    // 게임 상태
    this.gameState = new GameState();

    // 씬 관리
    this.scenes = {};
    this.currentScene = null;
    this.currentSceneName = 'campus';
    this.voxelSize = 1;

    // 캐릭터
    this.character = null;
    this.animator = null;

    // 계절 파티클
    this.seasonalParticles = null;

    // 콜백
    this.onEventStart = null;      // 이벤트 시작 시 (UI 표시용)
    this.onEventEnd = null;        // 이벤트 종료 시
    this.onStatChange = null;      // 스탯 변경 시
    this.onSemesterChange = null;  // 학기 변경 시
    this.onSemesterGrade = null;
    this.onGameEnd = null;         // 게임 종료 시
    this.onSceneChange = null;     // 씬 변경 시

    // 이벤트 처리 상태
    this.currentEvent = null;
    this.eventChoices = [];
    this.waitingForChoice = false;
    this.gameStarted = false;
    this.eventsPerSemester = 4;

    // 씬별 업데이트 함수
    this.sceneUpdaters = {
      club: updateClubScene,
      exam: updateExamScene,
    };

    // 초기화
    this.init();
  }

  async init() {
    // 씬들 미리 생성
    this.createAllScenes();

    // 캐릭터 생성
    this.createCharacter();

    // 계절 파티클 생성
    await this.createSeasonalParticles();

    // 초기 씬 설정
    this.switchScene('campus', true);

    // 시작 이벤트 선택 (1학기)
    this.selectEventsForSemester(1);
  }

  createAllScenes() {
    this.scenes.campus = createCampusScene({ semester: 1, voxelSize: this.voxelSize });
    this.scenes.study = createStudyScene({ voxelSize: this.voxelSize });
    this.scenes.club = createClubScene({ voxelSize: this.voxelSize });
    this.scenes.parttime = createPartTimeScene({ voxelSize: this.voxelSize });
    this.scenes.exam = createExamScene({ voxelSize: this.voxelSize });

    // 모든 씬을 threeScene에 추가하되 보이지 않게
    Object.values(this.scenes).forEach(s => {
      s.visible = false;
      this.threeScene.add(s);
    });
  }

  createCharacter() {
    this.character = createCharacter({ voxelSize: this.voxelSize * 0.35 });
    this.animator = createAnimator(this.character);
    this.animator.play('idle');
  }

  createSeasonalParticles() {
    this.seasonalParticles = new SeasonalParticles(this.threeScene, {
      particleCount: 90,
      voxelSize: this.voxelSize * 0.15,
      area: { width: 30, depth: 30, height: 20 },
    });
    this.updateSeason();
  }

  updateSeason() {
    const season = getSeasonFromSemester(this.gameState.semester);
    if (this.seasonalParticles) {
      this.seasonalParticles.setSeason(season);
    }
    // 캠퍼스 씬 계절 업데이트
    if (this.scenes.campus) {
      updateCampusSeason(this.scenes.campus, this.gameState.semester, this.voxelSize);
    }
    // 조명/하늘색 업데이트
    this.updateLighting(season);
  }

  updateLighting(season) {
    const config = SEASON_CONFIG[season] || SEASON_CONFIG.spring;

    // 환경광
    const ambient = this.threeScene.getObjectByName('ambientLight');
    if (ambient) {
      ambient.color.setHex(config.ambientColor);
      ambient.intensity = config.ambientIntensity;
    }

    // 방향광
    const dirLight = this.threeScene.getObjectByName('dirLight');
    if (dirLight) {
      dirLight.color.setHex(config.lightColor);
      dirLight.intensity = config.lightIntensity;
    }

    // 안개
    this.threeScene.fog = new THREE.Fog(config.fogColor, 15, 50);
    this.renderer.setClearColor(config.skyColor);
  }

  /**
   * 씬 전환
   */
  switchScene(sceneName, immediate = false) {
    if (!this.scenes[sceneName]) {
      console.warn(`Scene '${sceneName}' not found`);
      return;
    }

    // 현재 씬 숨기기
    if (this.currentScene) {
      this.currentScene.visible = false;
      // 캐릭터 제거 (다른 씬으로 이동)
      if (this.currentScene.getObjectByName('character')) {
        this.currentScene.remove(this.character);
      }
    }

    // 새 씬 보이기
    this.currentScene = this.scenes[sceneName];
    this.currentScene.visible = true;
    this.currentSceneName = sceneName;

    // 캐릭터 배치
    this.placeCharacterInScene();

    // 카메라 이동
    const meta = this.currentScene.userData;
    if (meta) {
      this.cameraController.moveTo(meta.cameraTarget, {
        distance: meta.cameraDistance,
        angle: meta.cameraAngle,
        height: meta.cameraHeight,
        duration: immediate ? 0 : 1.5,
      });
    }

    // 캐릭터 애니메이션 설정
    if (meta?.characterAnimation) {
      this.animator.play(meta.characterAnimation, 0.5);
    }

    // 콜백
    if (this.onSceneChange) {
      this.onSceneChange(sceneName, this.currentScene);
    }
  }

  placeCharacterInScene() {
    if (!this.currentScene || !this.character) return;

    const meta = this.currentScene.userData;
    const spawnPoint = meta?.spawnPoint || new THREE.Vector3(0, 1, 0);

    this.character.position.copy(spawnPoint);
    this.currentScene.add(this.character);

    // 애니메이터 리셋
    this.animator.reset();
  }

  /**
   * 학기별 이벤트 선택
   */
  selectEventsForSemester(semester) {
    const forSemester = eventsData.events.filter(event => event.semester.includes(semester));
    const meetsConditions = (event) => Object.entries(event.conditions || {}).every(([stat, condition]) => {
      const value = this.gameState.getStat(stat);
      return (condition.min === undefined || value >= condition.min)
        && (condition.max === undefined || value <= condition.max);
    }) && Object.entries(event.profileConditions || {}).every(([profile, ids]) => ids.includes(this.gameState[profile]?.id));
    const shuffle = (items) => {
      const result = [...items];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    };
    const unplayed = forSemester.filter(event =>
      (event.repeatable || !this.gameState.eventsCompleted.includes(event.id)) && meetsConditions(event));
    const schedule = unplayed.find(event => event.challenge === 'schedule');
    const festival = unplayed.find(event => event.background);
    const campusActivity = shuffle(unplayed.filter(event => event.category === 'campus_life' && event !== festival))[0];
    const priorities = [schedule, festival, campusActivity].filter(Boolean);
    const available = [...priorities, ...shuffle(unplayed.filter(event => !priorities.includes(event)))];

    // 매 학기 네 이벤트를 보장한다. 조건을 만족하는 새 이벤트가 적으면
    // 그 학기 이벤트 중 아직 이번 학기에 쓰지 않은 항목으로 채운다.
    for (const event of shuffle(forSemester.filter(meetsConditions))) {
      if (available.length >= this.eventsPerSemester) break;
      if (!available.some(candidate => candidate.id === event.id)) available.push(event);
    }
    this.eventChoices = available.slice(0, this.eventsPerSemester);
    return this.eventChoices;
  }

  prepareGame() {
    this.preparedGameState = new GameState();
    return this.preparedGameState;
  }

  startGame(preparedState = this.preparedGameState) {
    this.gameState = preparedState instanceof GameState ? preparedState : new GameState(preparedState || undefined);
    this.preparedGameState = null;
    this.gameStarted = true;
    this.gameEnded = false;
    this.currentEvent = null;
    this.waitingForChoice = false;
    this.selectEventsForSemester(this.gameState.semester);
    this.updateSeason();
    this.switchScene('campus', true);
    this.onStatChange?.(this.gameState.getAllStats(), {});
    this.onSemesterChange?.(this.gameState.semester);
    this.startNextEvent();
  }

  /**
   * 이벤트 시작 (첫 번째 이벤트부터 순차적)
   */
  startNextEvent() {
    if (!this.gameStarted || this.gameState.isGameOver) return;
    if (this.eventChoices.length === 0) {
      // 모든 이벤트 완료 -> 다음 학기
      this.advanceSemester();
      return;
    }

    this.currentEvent = this.eventChoices.shift();
    this.waitingForChoice = true;

    // 콜백 (UI에 이벤트 표시)
    if (this.onEventStart) {
      this.onEventStart(this.currentEvent, this.eventChoices.length);
    }
  }

  /**
   * 선택지 선택 처리
   */
  chooseOption(choiceIndex, scheduleSelection = null) {
    if (!this.currentEvent || !this.waitingForChoice) return;

    const choice = this.currentEvent.choices[choiceIndex];
    if (!choice) return;
    if (this.getChoiceLockReason(choice)) return;

    if (scheduleSelection?.length) {
      this.gameState.weeklySchedule = ['월', '화', '수', '목', '금', '토'].map(day => ({
        day,
        classes: scheduleSelection.filter(item => item.day === day).map(item => item.name),
      }));
    }
    (choice.scheduleChanges || []).forEach(change => {
      const day = this.gameState.weeklySchedule.find(item => item.day === change.day);
      if (!day) return;
      if (change.add && !day.classes.includes(change.add)) day.classes.push(change.add);
      if (change.remove) day.classes = day.classes.filter(name => name !== change.remove);
    });
    if (choice.relationshipStatus) this.gameState.relationshipStatus = choice.relationshipStatus;

    // 스탯 적용
    const statChanges = this.gameState.modifyStats(choice.stats || {});
    let luckOutcome = null;
    if (choice.luck) {
      const succeeded = Math.random() < choice.luck.chance;
      const bonus = succeeded ? choice.luck.success : choice.luck.failure;
      const bonusChanges = this.gameState.modifyStats(bonus || {});
      Object.entries(bonusChanges).forEach(([stat, amount]) => { statChanges[stat] = (statChanges[stat] || 0) + amount; });
      luckOutcome = { succeeded, text: succeeded ? '운이 따라 좋은 결과를 얻었습니다.' : '뜻밖의 문제가 생겼습니다.' };
    }

    // 이벤트 완료 기록
    this.gameState.eventsCompleted.push(this.currentEvent.id);

    // 씬 전환 (선택지에 scene 지정되어 있으면)
    if (choice.scene) {
      this.switchScene(choice.scene);
    } else {
      this.switchScene('campus');
    }

    // 캐릭터 애니메이션 (선택지별 다르게 할 수도 있음)
    this.animator.play('idle', 0.5);

    // 콜백
    if (this.onStatChange) {
      this.onStatChange(this.gameState.getAllStats(), statChanges);
    }
    if (this.onEventEnd) {
      this.onEventEnd(this.currentEvent, choice, statChanges, luckOutcome);
    }

    this.currentEvent = null;
    this.waitingForChoice = false;

    // 게임 오버 체크
    if (this.gameState.checkGameOver()) {
      this.endGame('dropout');
      return;
    }

    // 다음 이벤트 자동 시작 (약간 딜레이)
    setTimeout(() => this.startNextEvent(), 500);
  }

  getChoiceLockReason(choice) {
    const requirement = choice?.requires;
    if (!requirement) return '';
    for (const [stat, value] of Object.entries(requirement.min || {})) {
      if (this.gameState.getStat(stat) < value) return `${stat} ${value} 이상 필요`;
    }
    for (const [stat, value] of Object.entries(requirement.max || {})) {
      if (this.gameState.getStat(stat) > value) return `${stat} ${value} 이하만 가능`;
    }
    if (requirement.personality && this.gameState.personality.id !== requirement.personality) return '현재 성격으로는 선택할 수 없음';
    if (requirement.background && this.gameState.background.id !== requirement.background) return '현재 가정 형편으로는 선택할 수 없음';
    return '';
  }

  /**
   * 다음 학기로 진행
   */
  advanceSemester() {
    if (!this.gameStarted || this.gameState.isGameOver) return;
    const gradeResult = this.gameState.finalizeSemesterGrade();
    if (gradeResult) {
      this.onSemesterGrade?.(gradeResult, this.gameState.semester);
      this.onStatChange?.(this.gameState.getAllStats(), { grade: 0 });
      return;
    }
    this.continueAfterGrade();
  }

  continueAfterGrade() {
    if (!this.gameStarted || this.gameState.isGameOver) return;
    const hasNext = this.gameState.nextSemester();

    if (!hasNext) {
      // 졸업!
      this.endGame();
      return;
    }

    // 계절 업데이트
    this.updateSeason();

    // 새 학기 이벤트 선택
    this.selectEventsForSemester(this.gameState.semester);

    // 캠퍼스 씬으로
    this.switchScene('campus');

    // 콜백
    if (this.onSemesterChange) {
      this.onSemesterChange(this.gameState.semester);
    }

    // 첫 이벤트 시작
    setTimeout(() => this.startNextEvent(), 1000);
  }

  /**
   * 게임 종료 (졸업 또는 중도 포기)
   */
  endGame(reason = 'graduation') {
    if (this.gameState.isGameOver && this.gameEnded) return;
    this.gameEnded = true;
    this.gameState.isGameOver = true;

    if (reason === 'dropout') {
      this.gameState.ending = 'dropout';
    } else {
      this.gameState.ending = this.gameState.determineEnding();
    }

    const endingInfo = this.gameState.getEndingInfo(this.gameState.ending);

    // 엔딩 씬으로 (캠퍼스에서 졸업식 느낌)
    this.switchScene('campus');
    this.animator.play('cheer');

    if (this.onGameEnd) {
      this.onGameEnd({
        ending: this.gameState.ending,
        info: endingInfo,
        stats: this.gameState.getAllStats(),
        semester: this.gameState.semester,
      });
    }
  }

  /**
   * 메인 업데이트 루프
   */
  update(deltaTime) {
    // 캐릭터 애니메이션
    if (this.animator) {
      this.animator.update(deltaTime);
    }

    // 계절 파티클
    if (this.seasonalParticles) {
      this.seasonalParticles.update(deltaTime);
    }

    // 씬별 업데이트
    const updater = this.sceneUpdaters[this.currentSceneName];
    if (updater && this.currentScene) {
      updater(this.currentScene, deltaTime);
    }

    // NPC 애니메이션 (클럽 씬 등)
    this.updateNPCs(deltaTime);
  }

  updateNPCs(deltaTime) {
    if (!this.currentScene) return;

    this.currentScene.traverse(obj => {
      if (obj.userData.anim && obj.getPart) {
        // NPC도 애니메이터가 있으면 업데이트
        if (!obj.userData.animator) {
          obj.userData.animator = createAnimator(obj);
          obj.userData.animator.play(obj.userData.anim);
        }
        obj.userData.animator.update(deltaTime);
      }
    });
  }

  /**
   * 키보드 입력 처리 (테스트용)
   */
  handleKeyDown(key) {
    const animMap = {
      '1': 'idle',
      '2': 'walk',
      '3': 'study',
      '4': 'cheer',
      '5': 'sad',
    };

    if (animMap[key]) {
      this.animator.play(animMap[key]);
      console.log(`Animation: ${animMap[key]}`);
    }

    // 씬 전환 테스트
    const sceneMap = {
      'q': 'campus',
      'w': 'study',
      'e': 'club',
      'r': 'parttime',
      't': 'exam',
    };

    if (sceneMap[key]) {
      this.switchScene(sceneMap[key]);
    }
  }

  /**
   * 게임 상태 저장
   */
  save() {
    return this.gameState.serialize();
  }

  /**
   * 게임 상태 불러오기
   */
  load(data) {
    this.gameState = GameState.deserialize(data);
    this.gameStarted = true;
    this.gameEnded = this.gameState.isGameOver;
    this.updateSeason();
    this.selectEventsForSemester(this.gameState.semester);
    this.switchScene(this.gameState.currentScene || 'campus', true);
  }

  /**
   * 리소스 정리
   */
  dispose() {
    if (this.seasonalParticles) {
      this.seasonalParticles.dispose();
    }
    Object.values(this.scenes).forEach(scene => {
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    });
  }
}

export default GameEngine;

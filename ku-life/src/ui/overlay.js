/**
 * HTML 오버레이 UI 시스템
 * - 상단 스탯 바
 * - 하단 이벤트 텍스트 + 선택 버튼
 * - 시작 화면
 * - 엔딩 화면
 */

import { GAME_DATA, getScheduleOptions } from '../game/state.js';
import { MiniGames } from './mini-games.js';
import { createPeekPanel } from './peek-panel.js';
import { PanelLayout } from './panel-layout.js';
import { drawPixelPortrait } from './pixel-scene.js';
import { EndingArchive } from './ending-archive.js';
import { showEndingScreen } from './ending-screen.js';

const EVENT_RESULT_DURATION = 8000;
const STAT_LABELS = { grade: '학기 성적 영향', hp: '체력', intelligence: '지능', mental: '멘탈', money: '돈', relation: '인맥', career: '커리어' };

const HAIR_NAMES = { long: '롱 헤어', bob: '보브 컷', medium: '미디엄 컷', short: '숏 헤어' };
const ACCESSORY_NAMES = {
  glasses: '지능형 안경', earrings: '친화력 이어링', hairclip: '창의성 헤어핀',
  lanyard: '커리어 목걸이', bookpin: '성실함 북핀', none: '캠퍼스 룩',
};

function describeAppearance(appearance) {
  const hair = HAIR_NAMES[appearance?.hairStyle] || HAIR_NAMES.short;
  const accessory = ACCESSORY_NAMES[appearance?.accessory] || ACCESSORY_NAMES.none;
  return `${hair} · ${accessory}`;
}

export class UIOverlay {
  constructor(container, gameEngine) {
    this.container = container;
    this.gameEngine = gameEngine;
    this.elements = {};

    this.createUI();
    this.endingArchive = new EndingArchive(this.elements.root, this.elements.startScreen.querySelector('.open-ending-archive'));
    this.profilePeek = createPeekPanel(this.elements.profilePanel, '학생 수첩');
    this.eventPeek = createPeekPanel(this.elements.eventPanel, '이벤트');
    this.miniGames = new MiniGames(this.elements.root, () => this.gameEngine.gameState);
    this.elements.arcadeLauncher = this.miniGames.launcher;
    this.panelLayout = new PanelLayout(this.elements);
    this.bindEvents();
    this.hideAll();
    this.showStartScreen();
  }

  createUI() {
    // 메인 컨테이너
    this.elements.root = document.createElement('div');
    this.elements.root.id = 'game-ui';
    this.elements.root.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1a1a2e;
    `;
    this.container.appendChild(this.elements.root);

    // ===== 상단 스탯 바 =====
    this.elements.statBar = document.createElement('div');
    this.elements.statBar.id = 'stat-bar';
    this.elements.statBar.style.cssText = `
      position: absolute;
      top: 16px; left: 16px; right: 16px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
      pointer-events: auto;
      z-index: 10;
    `;
    this.elements.root.appendChild(this.elements.statBar);

    const statDefs = [
      { key: 'intelligence', label: '지능', icon: '🧠', color: '#10B981', detail: '과제와 시험 점수를 통해 학점에 영향을 줍니다.' },
      { key: 'hp', label: '체력', icon: '❤️', color: '#EF4444', detail: '출석 점수에 영향을 줍니다. 0이 되면 중도 포기합니다.' },
      { key: 'mental', label: '멘탈', icon: '🧠', color: '#8B5CF6', detail: '출석과 일부 과목 성적에 영향을 줍니다. 0이 되면 중도 포기합니다.' },
      { key: 'money', label: '돈', icon: '💰', color: '#F59E0B', detail: '생활비와 활동에 쓰이며, 창업 등 일부 엔딩에 영향을 줍니다.' },
      { key: 'relation', label: '인맥', icon: '🤝', color: '#EC4899', detail: '교류 선택지와 취업·공익 활동 등 일부 엔딩에 영향을 줍니다.' },
      { key: 'career', label: '커리어', icon: '💼', color: '#3B82F6', detail: '취업과 창업 등 졸업 후 진로에 영향을 줍니다.' },
    ];

    this.statElements = {};
    statDefs.forEach(def => {
      const el = document.createElement('div');
      el.className = 'stat-item';
      el.tabIndex = 0;
      el.setAttribute('aria-describedby', `stat-help-${def.key}`);
      el.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        font-size: 13px;
        font-weight: 600;
        min-width: 90px;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
      `;
      el.innerHTML = `
        <span class="stat-icon">${def.icon}</span>
        <span class="stat-label">${def.label}</span>
        <span class="stat-value" data-stat="${def.key}">50</span>
        <div class="stat-bar-bg" style="
          width: 60px; height: 6px; background: #eee; border-radius: 3px; overflow: hidden; margin-left: 6px;
        ">
          <div class="stat-bar-fill" data-stat="${def.key}" style="
            width: 50%; height: 100%; background: ${def.color}; border-radius: 3px;
            transition: width 0.5s ease-out;
          "></div>
        </div>
      `;
      const tooltip = document.createElement('span');
      tooltip.id = `stat-help-${def.key}`;
      tooltip.className = 'stat-tooltip';
      tooltip.setAttribute('role', 'tooltip');
      tooltip.textContent = def.detail;
      el.appendChild(tooltip);
      this.elements.statBar.appendChild(el);
      this.statElements[def.key] = {
        value: el.querySelector('.stat-value'),
        fill: el.querySelector('.stat-bar-fill'),
        container: el,
      };
    });

    // 학기 표시
    this.elements.semesterInfo = document.createElement('div');
    this.elements.semesterInfo.id = 'semester-info';
    this.elements.semesterInfo.style.cssText = `
      position: absolute;
      top: 70px; left: 16px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 700;
      color: #312E81;
      pointer-events: auto;
    `;
    this.elements.semesterLabel = document.createElement('span');
    this.elements.semesterLabel.textContent = '1학기 / 8학기';
    this.elements.semesterInfo.appendChild(this.elements.semesterLabel);
    this.elements.root.appendChild(this.elements.semesterInfo);

    this.elements.profilePanel = document.createElement('aside');
    this.elements.profilePanel.id = 'profile-panel';
    this.elements.profilePanel.style.cssText = `
      position: absolute; top: 76px; right: 16px; z-index: 8;
      display: none;
      width: 248px; box-sizing: border-box;
      color: #302720; pointer-events: auto;
    `;
    this.elements.profilePanel.innerHTML = `
      <canvas class="profile-avatar student-portrait" width="180" height="160" role="img" aria-label="내 캐릭터 초상화"></canvas>
      <div style="width:100%;padding-bottom:8px;border-bottom:1px solid #ded2c1"><div style="font-size:16px;font-weight:900;color:#382a28">고려대 새내기</div><div class="profile-look" style="margin-top:3px;font-size:10px;color:#827467"></div></div>
      <div class="profile-details" style="width:100%;display:grid;gap:8px"></div>
      <div class="profile-grade" style="width:100%;padding:8px 10px;box-sizing:border-box;border-radius:10px;background:#f1e8d8;font-size:12px"></div>
      <div class="profile-schedule" style="width:100%"></div>
      <div style="width:100%;border-top:1px solid #ded2c1;padding-top:8px"><strong style="font-size:12px">선택 기록</strong><div class="profile-log" style="display:grid;gap:6px;margin-top:6px"></div></div>
    `;
    this.elements.profileAvatar = this.elements.profilePanel.querySelector('.profile-avatar');
    this.elements.profileDetails = this.elements.profilePanel.querySelector('.profile-details');
    this.elements.profileGrade = this.elements.profilePanel.querySelector('.profile-grade');
    this.elements.profileSchedule = this.elements.profilePanel.querySelector('.profile-schedule');
    this.elements.profileLog = this.elements.profilePanel.querySelector('.profile-log');
    this.choiceLog = [];
    this.elements.root.appendChild(this.elements.profilePanel);

    // ===== 하단 이벤트 패널 =====
    this.elements.eventPanel = document.createElement('div');
    this.elements.eventPanel.id = 'event-panel';
    this.elements.eventPanel.style.cssText = `
      position: absolute;
      z-index: 9;
      bottom: 16px; left: 16px; right: auto; width: min(560px, calc(100% - 32px));
      pointer-events: auto;
      display: none;
    `;
    this.elements.root.appendChild(this.elements.eventPanel);

    this.elements.eventTitle = document.createElement('h3');
    this.elements.eventTitle.style.cssText = `
      margin: 0 0 12px;
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    this.elements.eventPanel.appendChild(this.elements.eventTitle);

    this.elements.eventDesc = document.createElement('p');
    this.elements.eventDesc.style.cssText = `
      margin: 0 0 20px;
      font-size: 15px;
      line-height: 1.6;
      color: #374151;
    `;
    this.elements.eventPanel.appendChild(this.elements.eventDesc);

    this.elements.choicesContainer = document.createElement('div');
    this.elements.choicesContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    this.elements.eventPanel.appendChild(this.elements.choicesContainer);

    // ===== 시작 화면 =====
    this.elements.startScreen = document.createElement('div');
    this.elements.startScreen.id = 'start-screen';
    this.elements.root.appendChild(this.elements.startScreen);
    this.elements.startScreen.innerHTML = `
      <div class="title-panel">
        <p class="title-location">서울 · 안암캠퍼스</p>
        <h1>KU LIFE</h1>
        <p class="title-description">고려대 학생 인생 시뮬레이션</p>
        <button id="btn-start" type="button">입학하기 <span aria-hidden="true">▸</span></button>
        <button class="open-ending-archive" type="button">엔딩 도감 <span></span></button>
        <a href="./atlas.html" class="open-atlas">ATLAS 모드 <span aria-hidden="true">▸</span></a>
        <p class="title-controls"><kbd>←</kbd> <kbd>→</kbd> 이동 <kbd>↑</kbd> 점프</p>
        <p class="title-credit">비공식 팬 프로젝트 · 원작 '80억분의 1'과 무관</p>
      </div>
    `;

    // ===== 엔딩 화면 =====
    this.elements.endingScreen = document.createElement('div');
    this.elements.endingScreen.id = 'ending-screen';
    this.elements.root.appendChild(this.elements.endingScreen);

    this.elements.gradeScreen = document.createElement('div');
    this.elements.gradeScreen.id = 'grade-screen';
    this.elements.gradeScreen.style.cssText = 'position:absolute;inset:0;z-index:95;display:none;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:rgba(12,18,31,.78);';
    this.elements.root.appendChild(this.elements.gradeScreen);

    // ===== 캐릭터 생성 화면 =====
    this.elements.charScreen = document.createElement('div');
    this.elements.charScreen.id = 'char-screen';
    this.elements.charScreen.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      z-index: 100;
      display: none;
      padding: 20px;
      overflow-y: auto;
    `;
    this.elements.root.appendChild(this.elements.charScreen);

    // 스타일 주입
    this.injectStyles();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .stat-item:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
      .choice-btn {
        padding: 14px 20px;
        font-size: 15px;
        font-weight: 600;
        background: #F3F4F6;
        border: 2px solid #D1D5DB;
        border-radius: 14px;
        cursor: pointer;
        color: #1F2937;
        text-align: left;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .choice-btn:hover {
        background: #E5E7EB;
        border-color: #9CA3AF;
        transform: translateX(4px);
      }
      .choice-btn:active { transform: scale(0.98); }
      .choice-btn .choice-icon { font-size: 20px; }
      .choice-btn.primary { background: linear-gradient(135deg, #8B0000, #A02020); border-color: #8B0000; color: white; }
      .choice-btn.primary:hover { background: linear-gradient(135deg, #A02020, #8B0000); }
      .btn-restart { padding: 14px 40px; font-size: 16px; font-weight: 700; background: linear-gradient(135deg, #8B0000, #A02020); color: white; border: none; border-radius: 50px; cursor: pointer; transition: transform 0.2s; }
      .btn-restart:hover { transform: scale(1.05); }
      .char-section { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 16px; padding: 20px; margin: 12px 0; width: 100%; max-width: 500px; }
      .char-section h3 { margin: 0 0 12px; font-size: 16px; color: #FFD700; }
      .char-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
      .char-option { padding: 12px; background: rgba(255,255,255,0.05); border: 2px solid transparent; border-radius: 12px; cursor: pointer; transition: all 0.2s; text-align: center; }
      .char-option:hover { border-color: #FFD700; background: rgba(255,215,0,0.1); }
      .char-option.selected { border-color: #FFD700; background: rgba(255,215,0,0.2); }
      .char-option-name { font-weight: 600; margin-bottom: 4px; }
      .char-option-desc { font-size: 12px; opacity: 0.7; }
      .btn-confirm { margin-top: 24px; padding: 16px 48px; font-size: 18px; font-weight: 700; background: linear-gradient(135deg, #FFD700, #FFA500); color: #1A1A2E; border: none; border-radius: 50px; cursor: pointer; }
      @media (max-width: 600px) {
        .stat-item { min-width: 70px; padding: 4px 8px; font-size: 11px; }
        .stat-bar-bg { width: 40px !important; }
        .choice-btn { padding: 12px 16px; font-size: 14px; }
        #profile-panel { top: 106px !important; right: 8px !important; width: 154px !important; padding: 9px !important; gap: 6px !important; }
        #profile-panel .profile-avatar { width: 112px; height: 94px; }
      }
    `;
    document.head.appendChild(style);
  }

  bindEvents() {
    // 시작 버튼
    this.elements.root.querySelector('#btn-start').addEventListener('click', () => {
      this.preparedState = this.onPrepareGame?.();
      this.showRandomizationScreen();
    });

    // 재시작 버튼 (엔딩 화면에서 동적 생성)
    this.elements.root.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-restart')) {
        this.restartGame();
      }
    });

    // 캐릭터 선택 옵션
    this.elements.root.addEventListener('click', (e) => {
      const option = e.target.closest('.char-option');
      if (option && option.dataset.type) {
        this.selectCharOption(option.dataset.type, option.dataset.value, option);
      }
    });

    // 확인 버튼 (캐릭터 생성 완료)
    this.elements.root.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-confirm')) {
        if (this.preparedState) { this.showGameUI(); this.onGameStart?.(this.preparedState); this.preparedState=null; }
        else this.confirmCharacter();
      }
      if (e.target.classList.contains('btn-reroll')) { this.preparedState=this.onPrepareGame?.(); this.showRandomizationScreen(); }
    });
  }

  // ===== 화면 전환 메서드 =====

  hideAll() {
    this.panelLayout.setActive(false);
    this.profilePeek.reset();
    this.eventPeek.reset();
    this.miniGames.setActive(false);
    this.elements.eventPanel.style.display = 'none';
    this.elements.startScreen.style.display = 'none';
    this.elements.endingScreen.style.display = 'none';
    this.elements.gradeScreen.style.display = 'none';
    this.elements.charScreen.style.display = 'none';
    this.elements.statBar.style.display = 'none';
    this.elements.semesterInfo.style.display = 'none';
    this.elements.profilePanel.style.display = 'none';
  }

  showStartScreen() {
    this.hideAll();
    this.elements.startScreen.style.display = 'flex';
  }

  showCharScreen() {
    this.hideAll();
    this.elements.charScreen.classList.remove('randomization-screen');
    this.elements.charScreen.style.display = 'flex';
    this.renderCharScreen();
  }

  showRandomizationScreen() {
    const state = this.preparedState;
    if (!state) return;
    this.randomizationTimers?.forEach(clearTimeout);
    this.randomizationTimers = [];
    this.hideAll();

    const screen = this.elements.charScreen;
    screen.style.display = 'flex';
    screen.classList.add('randomization-screen');
    screen.innerHTML = `
      <section class="roll-card">
        <p class="roll-kicker">KU LIFE · 신입생 배정</p>
        <h2>당신의 대학 생활을 준비합니다</h2>
        <p class="roll-status" role="status">전형과 학과, 기본 능력치를 무작위로 정하고 있어요…</p>
        <div class="roll-layout">
          <figure class="roll-preview">
            <figcaption>
              <strong>내 캐릭터</strong>
              <p class="roll-look"></p>
            </figcaption>
            <canvas class="student-portrait" width="180" height="160" role="img" aria-label="배정된 캐릭터 미리보기"></canvas>
          </figure>
          <div class="roll-fields"></div>
        </div>
        <div class="roll-actions">
          <button type="button" class="btn-reroll">다시 뽑기</button>
          <button type="button" class="btn-confirm" disabled>이 설정으로 시작하기</button>
        </div>
      </section>
    `;
    drawPixelPortrait(screen.querySelector('canvas'), state);
    screen.querySelector('.roll-look').textContent = describeAppearance(state.appearance);

    const fields = [
      ['입학 전형', state.admission],
      ['학과', state.major],
      ['집안 형편', state.background],
      ['성격', state.personality],
      ['지능', { name: `${state.stats.intelligence} / 100`, desc: '과목별 성적 산출에 반영되는 무작위 기본 능력치' }],
      ['성별 정체성', { name: state.gender, desc: '관계 존중·교류 이벤트의 맥락에 반영됩니다.' }],
    ];
    const grid = screen.querySelector('.roll-fields');
    fields.forEach(([label, item], index) => {
      const card = document.createElement('div');
      card.innerHTML = '<small></small><strong>배정 중…</strong><span></span>';
      card.querySelector('small').textContent = label;
      grid.appendChild(card);
      this.randomizationTimers.push(setTimeout(() => {
        card.classList.add('roll-revealed');
        card.querySelector('strong').textContent = item.name;
        card.querySelector('span').textContent = item.desc || '';
      }, 350 + index * 330));
    });
    this.randomizationTimers.push(setTimeout(() => {
      screen.querySelector('.btn-confirm').disabled = false;
      screen.querySelector('.roll-status').textContent = '배정된 기본 사항을 확인하고 대학 생활을 시작하세요.';
    }, 2700));
  }

  renderCharScreen() {
    let html = `
      <h2 style="font-size: clamp(24px, 5vw, 36px); font-weight: 800; margin: 0 0 8px; color: #FFD700;">캐릭터 생성</h2>
      <p style="opacity: 0.7; margin: 0 0 24px;">랜덤으로 정해지지만, 마음에 안 들면 다시 뽑을 수 있어요.</p>
    `;

    const sections = [
      { key: 'admission', title: '입학 전형', data: GAME_DATA.ADMISSION_TYPES },
      { key: 'major', title: '학과', data: GAME_DATA.MAJORS },
      { key: 'background', title: '집안 형편', data: GAME_DATA.BACKGROUNDS },
      { key: 'personality', title: '성격', data: GAME_DATA.PERSONALITIES },
    ];

    sections.forEach(section => {
      html += `<div class="char-section"><h3>${section.title}</h3><div class="char-options">`;
      section.data.forEach(item => {
        const selected = this.charSelections?.[section.key] === item.id ? 'selected' : '';
        html += `
          <div class="char-option ${selected}" data-type="${section.key}" data-value="${item.id}">
            <div class="char-option-name">${item.name}</div>
            <div class="char-option-desc">${item.desc}</div>
          </div>
        `;
      });
      html += '</div></div>';
    });

    html += '<button class="btn-confirm">확정하고 시작</button>';
    this.elements.charScreen.innerHTML = html;
  }

  selectCharOption(type, value, element) {
    if (!this.charSelections) this.charSelections = {};
    this.charSelections[type] = value;

    // UI 업데이트
    element.parentElement.querySelectorAll('.char-option').forEach(el => {
      el.classList.toggle('selected', el.dataset.value === value);
    });
  }

  confirmCharacter() {
    if (!this.charSelections ||
        !this.charSelections.admission ||
        !this.charSelections.major ||
        !this.charSelections.background ||
        !this.charSelections.personality) {
      alert('모든 항목을 선택해주세요!');
      return;
    }

    // 게임 엔진에 초기 데이터 전달하여 시작
    this.showGameUI();

    if (this.onGameStart) {
      this.onGameStart(this.charSelections);
    }
  }

  showGameUI() {
    this.hideAll();
    this.panelLayout.setActive(true);
    this.miniGames.setActive(true);
    this.elements.statBar.style.display = 'flex';
    this.elements.semesterInfo.style.display = 'block';
    this.elements.profilePanel.style.display = 'block';
  }

  updateProfile(state) {
    if (!state) return;
    const details = [
      ['전형', state.admission?.name],
      ['학과', state.major?.name],
      ['가정 형편', state.background?.name],
      ['성격', state.personality?.name],
      ['성별 정체성', state.gender],
      ['연애 상태', ({ single: '솔로', dating: '연애 중', notInterested: '현재 관심 없음' })[state.relationshipStatus]],
      ['키 / 몸무게', `${state.heightCm} cm / ${state.weightKg} kg`],
    ];
    this.elements.profileDetails.innerHTML = details.map(([label, value]) => `
      <div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;line-height:1.35">
        <span style="color:#786e62">${label}</span><strong style="text-align:right">${value || '미정'}</strong>
      </div>
    `).join('');
    this.elements.profilePanel.querySelector('.profile-look').textContent = describeAppearance(state.appearance);

    const previousGrade = state.gradeHistory?.at(-1);
    const average = state.stats?.grade;
    this.elements.profileGrade.innerHTML = `<div style="display:flex;justify-content:space-between"><span>${state.gradeHistory?.length ? '최근 학기 평점' : '첫 학기 평점'}</span><strong>${previousGrade == null ? '—' : `${Number(previousGrade).toFixed(2)} / 4.50`}</strong></div><div style="display:flex;justify-content:space-between;margin-top:3px"><span>누적 평점</span><strong>${average == null ? '—' : `${Number(average).toFixed(2)} / 4.50`}</strong></div><div style="margin-top:4px;color:#786e62">지능 ${state.stats?.intelligence ?? 0} · ${state.semester}학기</div>`;
    this.elements.profileSchedule.innerHTML = `<div style="font-size:12px;font-weight:800;margin-bottom:5px">주간 시간표</div>${(state.weeklySchedule || []).map(day => `<div style="display:grid;grid-template-columns:24px 1fr;gap:5px;font-size:10px;line-height:1.45;padding:3px 5px;border-radius:6px;background:#f7f2e9;margin-top:2px"><strong>${day.day}</strong><span>${day.classes.join(' · ')}</span></div>`).join('')}`;

    drawPixelPortrait(this.elements.profileAvatar, state);
  }

  showEvent(event, remainingCount) {
    this.eventPeek.reset();
    this.elements.eventPanel.style.display = 'block';
    this.elements.eventPanel.querySelectorAll('.schedule-challenge').forEach(el=>el.remove());
    this.elements.eventPanel.querySelectorAll('.schedule-options').forEach(el=>el.parentElement.remove());
    const personalize = value => String(value).replaceAll('{{gender}}', this.gameEngine.gameState.gender || '학생');

    this.eventPeek.setLabel(`이벤트 · ${personalize(event.title)}`);
    this.elements.eventTitle.innerHTML = `
      <span>📋</span> ${personalize(event.title)}
      <span style="margin-left: auto; font-size: 12px; color: #6B7280; font-weight: 500;">남은 이벤트: ${remainingCount + 1}개</span>
    `;
    this.elements.eventDesc.textContent = personalize(event.description);

    if (event.challenge === 'schedule') {
      const challenge=document.createElement('div');challenge.className='schedule-challenge';challenge.style.cssText='padding:12px;margin:8px 0;background:#f5efe4;border-radius:12px';
      challenge.innerHTML='<strong>시간표 미니게임</strong><p style="margin:5px 0;font-size:12px">겹치지 않는 수업을 3개 골라 시간표를 완성하세요.</p><div class="schedule-options" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px"></div><button class="schedule-submit" disabled style="margin-top:8px;padding:8px 12px">시간표 확인</button>';
      const options = challenge.querySelector('.schedule-options');
      const submit = challenge.querySelector('.schedule-submit');
      const feedback = document.createElement('p');
      feedback.setAttribute('role', 'status');
      challenge.appendChild(feedback);
      const courses = getScheduleOptions(this.gameEngine.gameState.major);
      const selected = new Set();
      courses.forEach((course, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.slot = String(index);
        button.setAttribute('aria-pressed', 'false');
        button.textContent = `${course.name} · ${course.day} ${course.time}`;
        button.onclick = () => {
          if (selected.has(course)) selected.delete(course);
          else selected.add(course);
          button.setAttribute('aria-pressed', String(selected.has(course)));
          submit.disabled = selected.size !== 3;
          feedback.textContent = '';
        };
        options.appendChild(button);
      });
      submit.onclick = () => {
        const schedule = courses.filter(course => selected.has(course));
        const slots = new Set(schedule.map(({ day, time }) => `${day} ${time}`));
        if (schedule.length !== 3 || slots.size !== schedule.length) {
          feedback.textContent = '같은 시간에 열린 수업이 있습니다. 선택을 바꿔 주세요.';
          return;
        }
        this.hideEvent();
        this.onChoiceSelect?.(0, schedule);
      };
      this.elements.choicesContainer.before(challenge);
    }

    // 선택지 버튼 생성
    this.elements.choicesContainer.innerHTML = '';
    event.choices.forEach((choice, i) => {
      const btn = document.createElement('button');
      const lockReason = this.gameEngine.getChoiceLockReason?.(choice) || '';
      btn.className = 'choice-btn' + (i === 0 ? ' primary' : '');
      btn.disabled = Boolean(lockReason);
      btn.style.opacity = lockReason ? '.48' : '1';
      btn.innerHTML = `<span class="choice-icon">${this.getChoiceIcon(choice)}</span><span>${personalize(choice.text)}${choice.luck ? '<small style="display:block;margin-top:4px;color:#9a6b14">🎲 결과가 운에 따라 달라집니다</small>' : ''}${lockReason ? `<small style="display:block;margin-top:4px;color:#9b3434">🔒 ${lockReason}</small>` : ''}</span>`;
      btn.addEventListener('click', () => {
        this.hideEvent();
        if (this.onChoiceSelect) {
          this.onChoiceSelect(i);
        }
      });
      this.elements.choicesContainer.appendChild(btn);
    });
    this.elements.choicesContainer.style.display = event.challenge === 'schedule' ? 'none' : 'flex';
  }

  getChoiceIcon(choice) {
    const text = choice.text;
    if (text.includes('공부') || text.includes('도서관') || text.includes('집중')) return '📚';
    if (text.includes('알바') || text.includes('일') || text.includes('돈')) return '💰';
    if (text.includes('동아리') || text.includes('친구') || text.includes('모임') || text.includes('여행')) return '🤝';
    if (text.includes('쉬') || text.includes('휴식') || text.includes('병원')) return '🏥';
    if (text.includes('인턴') || text.includes('취업') || text.includes('커리어')) return '💼';
    if (text.includes('연애') || text.includes('고백') || text.includes('썸')) return '💕';
    return '✨';
  }

  hideEvent() {
    this.elements.eventPanel.style.display = 'none';
    this.elements.eventPanel.querySelectorAll('.schedule-challenge').forEach(el=>el.remove());
  }

  showChoiceResult(event, choice, changes, luckOutcome, schedule, storyNotes = []) {
    const personalize = text => text.replaceAll('{{gender}}', this.gameEngine.gameState.gender || '학생');
    const title = personalize(event.title);
    const selection = personalize(choice.text);
    const entries = Object.entries(changes).filter(([, value]) => Number.isFinite(value) && value !== 0);
    const parts = entries.map(([key, value]) => `${STAT_LABELS[key] || key} ${value > 0 ? '+' : ''}${value}`);
    const summary = [parts.join(' · ') || '스탯 변화 없음', luckOutcome?.text].filter(Boolean).join(' · ');
    this.choiceLog.unshift({ title, choice: selection, summary });
    this.choiceLog = this.choiceLog.slice(0, 4);
    this.elements.profileLog.replaceChildren(...this.choiceLog.map(item => {
      const row = document.createElement('div');
      row.className = 'choice-log-item';
      row.textContent = `${item.title} · ${item.choice} · ${item.summary}`;
      return row;
    }));

    const dialog = document.createElement('dialog');
    dialog.className = 'choice-result';
    dialog.setAttribute('aria-labelledby', 'choice-result-title');
    dialog.innerHTML = `
      <button type="button" class="choice-result-close" aria-label="결과 닫기" autofocus>×</button>
      <h2 id="choice-result-title"></h2>
      <p class="choice-context"></p>
      <p class="choice-story"></p>
      <p class="choice-stats"></p>
      <div class="choice-result-timer" aria-hidden="true"><span></span></div>
    `;
    dialog.querySelector('h2').textContent = title;
    dialog.querySelector('.choice-context').textContent = personalize(event.description);
    const consequences = entries.map(([key, value]) => {
      const positive = value > 0;
      const stories = {
        grade: positive ? '이번 학기 성적에 힘이 될 경험을 쌓았다.' : '이번 학기의 공부 계획에 차질이 생겼다.',
        hp: positive ? '몸에 기운이 조금 돌아왔다.' : '하루를 마치고 나니 몸이 부쩍 무거웠다.',
        mental: positive ? '한결 마음이 편해졌다.' : '마음 한편에 부담이 남았다.',
        money: positive ? '생활비에 여유가 생겼다.' : '쓸 수 있는 생활비가 줄었다.',
        relation: positive ? '캠퍼스에서 인사를 나눌 사람이 늘었다.' : '사람들과 조금 멀어졌다.',
        career: positive ? '진로를 준비하는 데 도움이 되는 경험을 얻었다.' : '진로 준비는 한 걸음 미뤄졌다.',
        intelligence: positive ? '새로운 것을 이해하는 힘이 붙었다.' : '평소보다 생각을 정리하기 어려웠다.',
      };
      return stories[key];
    });
    const decision = schedule
      ? `${schedule.map(course => course.name).join(', ')}을 시간표에 담았다. 이번 학기에 들을 수업이 정해졌다.`
      : `고민 끝에 ‘${selection}’ 쪽으로 마음을 정했다.`;
    dialog.querySelector('.choice-story').textContent = [
      decision, ...storyNotes, luckOutcome?.text, ...consequences,
    ].filter(Boolean).join(' ');
    dialog.querySelector('.choice-stats').textContent = parts.join(' · ') || '스탯 변화 없음';
    dialog.querySelector('button').onclick = () => dialog.close();
    this.elements.root.appendChild(dialog);
    return new Promise(resolve => {
      dialog.showModal();
      const countdown = dialog.querySelector('.choice-result-timer span').animate(
        [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
        {
          duration: EVENT_RESULT_DURATION,
          fill: 'forwards',
          easing: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'steps(8, end)' : 'linear',
        },
      );
      const timeout = window.setTimeout(() => {
        if (dialog.open) dialog.close();
      }, EVENT_RESULT_DURATION);
      dialog.addEventListener('close', () => {
        window.clearTimeout(timeout);
        countdown.cancel();
        dialog.remove();
        resolve();
      }, { once: true });
    });
  }

  showSemesterGrade(result, semester, state) {
    this.updateProfile(state);
    const rows=result.transcript.courses.map(course=>`<tr><td>${course.name}</td><td>${course.components.attendance}</td><td>${course.components.assignment}</td><td>${course.components.midterm}</td><td>${course.components.final}</td><td><strong>${course.letter}</strong><br><small>${course.points.toFixed(2)}</small></td></tr>`).join('');
    this.elements.gradeScreen.style.display='flex';
    this.elements.gradeScreen.innerHTML=`<section style="width:min(900px,100%);max-height:92vh;overflow:auto;background:#fffaf0;border:2px solid #b79b6e;border-radius:18px;padding:clamp(16px,3vw,28px);box-shadow:0 24px 70px #0008;color:#28231e"><div style="color:#8b0000;font-weight:800;letter-spacing:.12em">KOREA UNIVERSITY · 성적 통지</div><h2 style="margin:8px 0 4px">${semester}학기 성적표</h2><p style="margin:0 0 14px;color:#71685b">출석 10% · 과제 25% · 중간고사 30% · 기말고사 35%</p><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;min-width:620px;font-size:13px"><thead><tr style="background:#eee3cd"><th>과목</th><th>출석</th><th>과제</th><th>중간</th><th>기말</th><th>등급 / 평점</th></tr></thead><tbody>${rows}</tbody></table></div><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:14px 0;padding:12px;background:#f3ead9;border-radius:10px"><strong>학기 평균 ${result.semesterGpa.toFixed(2)} / 4.50</strong><strong>누적 평균 ${result.average.toFixed(2)} / 4.50</strong><span>이수 ${result.credits}학점</span></div><button class="grade-continue" style="padding:12px 20px;border:0;border-radius:10px;background:#8b0000;color:white;font-weight:800;cursor:pointer">성적표 확인 · 다음 학기</button></section>`;
  }

  showEnding(endingData) {
    this.hideAll();
    this.elements.endingScreen.style.display = 'flex';
    this.elements.endingScreen.scrollTop = 0;
    showEndingScreen(this.elements.endingScreen, endingData, this.gameEngine.gameState, this.endingArchive);
  }

  updateStats(stats, changes = {}) {
    Object.entries(stats).forEach(([key, value]) => {
      const el = this.statElements[key];
      if (el) {
        el.value.textContent = value;
        const percent = Math.min(100, Math.max(0, (value / 100) * 100));
        el.fill.style.width = `${percent}%`;

        // 변경 애니메이션
        if (changes[key] !== undefined && changes[key] !== 0) {
          el.container.style.animation = 'pulse 0.4s ease-out';
          setTimeout(() => el.container.style.animation = '', 400);
        }
      }
    });
  }

  updateSemester(semester, total = 8) {
    this.elements.semesterLabel.textContent = `${semester}학기 / ${total}학기`;
  }

  restartGame() {
    this.charSelections = null;
    this.showStartScreen();
    if (this.onRestart) {
      this.onRestart();
    }
  }

  // 콜백 설정
  setCallbacks(callbacks) {
    this.onGameStart = callbacks.onGameStart;
    this.onPrepareGame = callbacks.onPrepareGame;
    this.onChoiceSelect = callbacks.onChoiceSelect;
    this.onRestart = callbacks.onRestart;
    this.onGradeContinue = callbacks.onGradeContinue;
    this.elements.root.addEventListener('click', (event) => {
      if (!event.target.closest('.grade-continue')) return;
      this.elements.gradeScreen.style.display='none';
      this.onGradeContinue?.();
    });
  }
}

export default UIOverlay;

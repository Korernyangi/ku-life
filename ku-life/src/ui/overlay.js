/**
 * HTML 오버레이 UI 시스템
 * - 상단 스탯 바
 * - 하단 이벤트 텍스트 + 선택 버튼
 * - 시작 화면
 * - 엔딩 화면
 */

import { GAME_DATA } from '../game/state.js';
import { drawPixelPortrait } from './pixel-scene.js';

export class UIOverlay {
  constructor(container, gameEngine) {
    this.container = container;
    this.gameEngine = gameEngine;
    this.elements = {};

    this.createUI();
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
      { key: 'intelligence', label: '지능', icon: '🧠', color: '#10B981' },
      { key: 'hp', label: '체력', icon: '❤️', color: '#EF4444' },
      { key: 'mental', label: '멘탈', icon: '🧠', color: '#8B5CF6' },
      { key: 'money', label: '돈', icon: '💰', color: '#F59E0B' },
      { key: 'relation', label: '인맥', icon: '🤝', color: '#EC4899' },
      { key: 'career', label: '커리어', icon: '💼', color: '#3B82F6' },
    ];

    this.statElements = {};
    statDefs.forEach(def => {
      const el = document.createElement('div');
      el.className = 'stat-item';
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
    this.elements.semesterInfo.innerHTML = '1학기 / 8학기';
    this.elements.root.appendChild(this.elements.semesterInfo);

    this.elements.profilePanel = document.createElement('aside');
    this.elements.profilePanel.id = 'profile-panel';
    this.elements.profilePanel.style.cssText = `
      position: absolute; top: 76px; right: 16px; z-index: 8;
      display: none; flex-direction: column; align-items: center; gap: 10px;
      width: 248px; max-height: calc(100vh - 100px); overflow-y: auto; padding: 14px; box-sizing: border-box;
      color: #302720; pointer-events: auto;
    `;
    this.elements.profilePanel.innerHTML = `
      <div style="width:100%;display:flex;justify-content:space-between;align-items:center;font-size:10px;font-weight:900;letter-spacing:.12em;color:#8b0000"><span>학생 수첩</span></div>
      <canvas class="profile-avatar" width="180" height="160" aria-label="게임 배경 캐릭터와 같은 픽셀 초상"></canvas>
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
      z-index: 6;
      bottom: 16px; left: 16px; right: auto; width: min(560px, calc(100% - 32px));
      max-height: 48vh; overflow-y: auto;
      padding: 14px;
      pointer-events: auto;
      display: none;
      animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
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
        <p class="title-controls"><kbd>←</kbd> <kbd>→</kbd> 이동 <kbd>↑</kbd> 점프</p>
        <p class="title-credit">비공식 팬 프로젝트 · 원작 '80억분의 1'과 무관</p>
      </div>
    `;

    // ===== 엔딩 화면 =====
    this.elements.endingScreen = document.createElement('div');
    this.elements.endingScreen.id = 'ending-screen';
    this.elements.endingScreen.style.cssText = `
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      z-index: 100;
      display: none;
      padding: 40px;
    `;
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
      background: linear-gradient(135deg, #8B0000 0%, #4A1A1A 50%, #1A1A2E 100%);
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
      .ending-icon { font-size: 80px; margin-bottom: 16px; animation: pulse 2s infinite; }
      .ending-title { font-size: clamp(28px, 6vw, 42px); font-weight: 800; margin: 0 0 16px; background: linear-gradient(135deg, #FFD700, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      .ending-desc { font-size: clamp(16px, 3vw, 20px); text-align: center; max-width: 600px; margin: 0 0 32px; opacity: 0.9; line-height: 1.7; }
      .ending-stats { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-bottom: 32px; }
      .ending-stat { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 12px 20px; text-align: center; min-width: 80px; }
      .ending-stat-value { font-size: 24px; font-weight: 700; color: #FFD700; }
      .ending-stat-label { font-size: 12px; opacity: 0.7; margin-top: 4px; }
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
    this.elements.charScreen.style.display = 'flex';
    this.renderCharScreen();
  }

  showRandomizationScreen() {
    const state=this.preparedState; if(!state) return;
    this.randomizationTimers ||= [];
    this.randomizationTimers.forEach(clearTimeout);
    this.randomizationTimers=[];
    this.hideAll(); this.elements.charScreen.style.display='flex';
    this.elements.charScreen.style.cssText += 'position:absolute;inset:0;z-index:120;align-items:center;justify-content:center;background:rgba(16,20,32,.82);padding:18px;box-sizing:border-box;';
    const fields=[['admission','입학 전형'],['major','학과'],['background','집안 형편'],['personality','성격'],['intelligence','지능'],['gender','성별 정체성']];
    this.elements.charScreen.innerHTML='<section style="width:min(760px,100%);max-height:90vh;overflow:auto;background:#fff9ed;border:2px solid #bd9b68;border-radius:22px;padding:24px;color:#302720"><p style="color:#8b0000;font-weight:800">KU LIFE · 신입생 배정</p><h2>당신의 대학 생활을 준비합니다</h2><p class="roll-status">전형과 학과, 기본 능력치를 무작위로 정하고 있어요…</p><div class="roll-fields" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin:18px 0"></div><button class="btn-reroll">다시 뽑기</button> <button class="btn-confirm" disabled style="opacity:.5">이 설정으로 시작하기</button></section>';
    const grid=this.elements.charScreen.querySelector('.roll-fields');
    const values={intelligence:{name:`${state.stats.intelligence} / 100`,desc:'과목별 성적 산출에 반영되는 무작위 기본 능력치'},gender:{name:state.gender,desc:'관계 존중·교류 이벤트의 맥락에 반영됩니다.'}};
    fields.forEach(([key,label],i)=>{const item=values[key]||state[key],card=document.createElement('div');card.style.cssText='padding:12px;border-radius:12px;background:#f1e8d8;opacity:.35;transition:all .35s';card.innerHTML=`<small>${label}</small><strong style="display:block">배정 중…</strong>`;grid.appendChild(card);this.randomizationTimers.push(setTimeout(()=>{card.style.opacity='1';card.innerHTML=`<small>${label}</small><strong style="display:block;font-size:17px">${item.name}</strong><span style="font-size:12px">${item.desc||''}</span>`},350+i*330))});
    this.randomizationTimers.push(setTimeout(()=>{const b=this.elements.charScreen.querySelector('.btn-confirm');if(b){b.disabled=false;b.style.opacity='1';this.elements.charScreen.querySelector('.roll-status').textContent='배정된 기본 사항을 확인하고 대학 생활을 시작하세요.'}},2700));
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
    this.hideAll();
    this.elements.statBar.style.display = 'flex';
    this.elements.semesterInfo.style.display = 'block';

    if (this.onGameStart) {
      this.onGameStart(this.charSelections);
    }
  }

  showGameUI() {
    this.hideAll();
    this.elements.statBar.style.display = 'flex';
    this.elements.semesterInfo.style.display = 'block';
    this.elements.profilePanel.style.display = 'flex';
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
    const accessoryNames={glasses:'지능형 안경',earrings:'친화력 이어링',hairclip:'창의성 헤어핀',lanyard:'커리어 목걸이',bookpin:'성실함 북핀',none:'캠퍼스 룩'};
    const hairNames={long:'롱 헤어',bob:'보브 컷',medium:'미디엄 컷',short:'숏 헤어'};
    this.elements.profilePanel.querySelector('.profile-look').textContent=`${hairNames[state.appearance?.hairStyle] || hairNames.short} · ${accessoryNames[state.appearance?.accessory] || accessoryNames.none}`;

    const previousGrade = state.gradeHistory?.at(-1);
    const average = state.stats?.grade;
    this.elements.profileGrade.innerHTML = `<div style="display:flex;justify-content:space-between"><span>${state.gradeHistory?.length ? '최근 학기 평점' : '첫 학기 평점'}</span><strong>${previousGrade == null ? '—' : `${Number(previousGrade).toFixed(2)} / 4.50`}</strong></div><div style="display:flex;justify-content:space-between;margin-top:3px"><span>누적 평점</span><strong>${average == null ? '—' : `${Number(average).toFixed(2)} / 4.50`}</strong></div><div style="margin-top:4px;color:#786e62">지능 ${state.stats?.intelligence ?? 0} · ${state.semester}학기</div>`;
    this.elements.profileSchedule.innerHTML = `<div style="font-size:12px;font-weight:800;margin-bottom:5px">주간 시간표</div>${(state.weeklySchedule || []).map(day => `<div style="display:grid;grid-template-columns:24px 1fr;gap:5px;font-size:10px;line-height:1.45;padding:3px 5px;border-radius:6px;background:#f7f2e9;margin-top:2px"><strong>${day.day}</strong><span>${day.classes.join(' · ')}</span></div>`).join('')}`;

    this.elements.profileAvatar.style.cssText='display:block;width:180px;max-width:100%;height:auto;image-rendering:pixelated;border:3px solid #702b37;box-shadow:4px 4px 0 #d6b879';
    drawPixelPortrait(this.elements.profileAvatar, state);
  }

  showEvent(event, remainingCount) {
    this.elements.eventPanel.style.display = 'block';
    this.elements.eventPanel.querySelectorAll('.schedule-challenge').forEach(el=>el.remove());
    this.elements.eventPanel.querySelectorAll('.schedule-options').forEach(el=>el.parentElement.remove());
    const personalize = value => String(value).replaceAll('{{gender}}', this.gameEngine.gameState.gender || '학생');

    this.elements.eventTitle.innerHTML = `
      <span>📋</span> ${personalize(event.title)}
      <span style="margin-left: auto; font-size: 12px; color: #6B7280; font-weight: 500;">남은 이벤트: ${remainingCount + 1}개</span>
    `;
    this.elements.eventDesc.textContent = personalize(event.description);

    if (event.challenge === 'schedule') {
      const challenge=document.createElement('div');challenge.className='schedule-challenge';challenge.style.cssText='padding:12px;margin:8px 0;background:#f5efe4;border-radius:12px';
      challenge.innerHTML='<strong>시간표 미니게임</strong><p style="margin:5px 0;font-size:12px">겹치지 않는 수업을 3개 골라 시간표를 완성하세요.</p><div class="schedule-options" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px"></div><button class="schedule-submit" disabled style="margin-top:8px;padding:8px 12px">시간표 확인</button>';
      const options=challenge.querySelector('.schedule-options'),classes=[['전공 기초','월 09:00'],['교양 글쓰기','월 10:00'],['자료 구조','화 13:00'],['경제와 사회','수 11:00'],['팀 프로젝트','목 15:00'],['영어 회화','금 10:00']];
      classes.forEach(([name,time],i)=>{const b=document.createElement('button');b.type='button';b.textContent=`${name} · ${time}`;b.dataset.slot=String(i);b.style.cssText='padding:8px;border:1px solid #c8b99f;border-radius:8px;background:white;text-align:left;font-size:12px';b.onclick=()=>{b.classList.toggle('selected');b.style.background=b.classList.contains('selected')?'#d9ead3':'white';challenge.querySelector('.schedule-submit').disabled=options.querySelectorAll('.selected').length!==3};options.appendChild(b)});
      challenge.querySelector('.schedule-submit').onclick=()=>{const selected=[...options.querySelectorAll('.selected')].map(b=>+b.dataset.slot);const success=selected.length===3&&!(selected.includes(0)&&selected.includes(1));challenge.innerHTML=`<strong>${success?'시간표 완성! 수업 시간이 겹치지 않습니다.':'시간표가 겹치거나 비어 있습니다. 다시 확인해 보세요.'}</strong>`;if(success)setTimeout(()=>{this.hideEvent();const schedule=selected.map(i=>({day:['월','월','화','수','목','금'][i],name:classes[i][0]}));this.onChoiceSelect?.(0,schedule)},500);else{const retry=document.createElement('button');retry.textContent='다시 짜기';retry.onclick=()=>this.showEvent(event,remainingCount);challenge.appendChild(retry)}};
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

  showLuckResult(outcome) {
    if (!outcome) return;
    const toast=document.createElement('div');
    toast.textContent=`🎲 ${outcome.text}`;
    toast.style.cssText='position:absolute;left:16px;bottom:18px;z-index:30;padding:12px 16px;border-radius:12px;background:#fff2c9;color:#553c16;box-shadow:0 6px 20px #0003;font-weight:700;animation:fadeIn .2s ease-out';
    this.elements.root.appendChild(toast);
    setTimeout(()=>toast.remove(),2400);
  }

  showChoiceResult(event, choice, changes = {}, luckOutcome = null) {
    const labels={grade:'학기 성적 영향',hp:'체력',intelligence:'지능',mental:'멘탈',money:'돈',relation:'인맥',career:'커리어'};
    const entries=Object.entries(changes).filter(([,value])=>value!==0);
    const parts=entries.map(([key,value])=>`${labels[key]||key} ${value>0?'+':''}${value}`);
    const summary=[parts.length?parts.join(' · '):'스탯 변화 없음',luckOutcome?.text].filter(Boolean).join(' · ');
    this.choiceLog.unshift({ title:event?.title||'선택', choice:choice?.text||'', summary });
    this.choiceLog=this.choiceLog.slice(0,4);
    this.elements.profileLog.innerHTML=this.choiceLog.map(item=>`<div style="padding:6px 7px;background:#f7f2e9;border-radius:7px;font-size:10px;line-height:1.4"><strong>${item.title}</strong><div>${item.choice}</div><div style="color:#67552f">${item.summary}</div></div>`).join('');
    const pills=entries.map(([key,value])=>`<span style="display:inline-block;margin:3px;padding:5px 8px;border-radius:7px;background:${value>0?'#e1f2df':'#f8e2df'};color:${value>0?'#27613a':'#9b3930'};font-size:12px;font-weight:800">${labels[key]||key} ${value>0?'+':''}${value}</span>`).join('');
    const toast=document.createElement('div');
    toast.innerHTML=`<strong>${choice?.text||'선택 결과'}</strong><div style="margin-top:5px">${pills||'<span style="font-size:12px">스탯 변화 없음</span>'}</div>${luckOutcome?`<small>${luckOutcome.text}</small>`:''}`;
    toast.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:30;width:max-content;max-width:min(640px,calc(100vw - 32px));padding:14px 18px;border-radius:14px;background:#fffaf0;color:#302720;box-shadow:0 8px 30px #0005;text-align:center;animation:fadeIn .2s ease-out;pointer-events:none';
    this.elements.root.appendChild(toast);setTimeout(()=>toast.remove(),2800);
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

    const { ending, info, stats } = endingData;
    const statDefs = [
      { key: 'grade', label: '누적 평점 / 4.50', icon: '📚' },
      { key: 'hp', label: '체력', icon: '❤️' },
      { key: 'mental', label: '멘탈', icon: '🧠' },
      { key: 'money', label: '돈', icon: '💰' },
      { key: 'relation', label: '인맥', icon: '🤝' },
      { key: 'career', label: '커리어', icon: '💼' },
    ];

    let statsHtml = '';
    statDefs.forEach(def => {
      const raw = stats[def.key] ?? 0;
      const value = def.key === 'grade' ? `${Number(raw).toFixed(2)} / 4.50` : raw;
      statsHtml += `
        <div class="ending-stat">
          <div class="ending-stat-value">${value}</div>
          <div class="ending-stat-label">${def.icon} ${def.label}</div>
        </div>
      `;
    });

    this.elements.endingScreen.innerHTML = `
      <div class="ending-icon">${info.icon}</div>
      <h1 class="ending-title">${info.title}</h1>
      <p class="ending-desc">${info.desc}</p>
      <div class="ending-stats">${statsHtml}</div>
      <button class="btn-restart">다시 시작하기</button>
    `;
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
    this.elements.semesterInfo.textContent = `${semester}학기 / ${total}학기`;
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

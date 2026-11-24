import { drawPixelBackground } from '../ui/pixel-backgrounds.js';
import { drawPixelStudent } from '../ui/pixel-scene.js';
import { AtlasGame } from './game.js';
import { ENDINGS, EXPERIENCES, ITEMS, RULES, STATS, STATUSES, cashText } from './config.js';
import './atlas.css';

const root = document.querySelector('#atlas');
const storageKey = 'ku-life:atlas:v1';
const termCount = RULES.termEvents.length;
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);
const signed = value => value > 0 ? `+${value}` : `−${Math.abs(value)}`;
const signedCash = value => `${value > 0 ? '+' : '−'}${cashText(Math.abs(value))}`;
const gpaText = value => value == null ? '미산출' : `${value.toFixed(2)} / 4.50`;
const typeName = { consumable: '소모형', permanent: '영구형', conditional: '조건형' };
const eventType = { fixed: '학기 일정', campus: '학교 행사', random: '일상', conditional: '조건부', chain: '후속 사건', crisis: '위기', academic: '학업', fallback: '일상' };
const icons = {
  hp: ['01100110', '11111111', '11111111', '11111111', '01111110', '00111100', '00011000', '00000000'],
  intelligence: ['00111100', '01111110', '11011011', '11111111', '11011011', '01111110', '00111100', '00000000'],
  social: ['01111110', '11111111', '11111111', '11010111', '11111111', '01111110', '00110000', '00100000'],
  mental: ['00011000', '00011000', '10011001', '11111111', '01111110', '00111100', '01100110', '01000010'],
};

let game;
let screen = 'title';
let notice = '';
let storageNotice = '';
let saved;

try {
  const data = JSON.parse(localStorage.getItem(storageKey) || 'null');
  if (data?.version === 1 && ['event', 'result', 'term', 'ended'].includes(data.phase) && data.stats && data.inventory && Array.isArray(data.history)) saved = data;
} catch {
  storageNotice = '이 브라우저에서 저장 기록을 읽을 수 없습니다.';
}

function persist() {
  saved = game.state;
  try {
    localStorage.setItem(storageKey, JSON.stringify(saved));
    storageNotice = '';
  } catch {
    storageNotice = '브라우저 저장소에 기록을 남길 수 없습니다.';
  }
}

function present(message = '') {
  notice = message;
  persist();
  render(true);
}

function termLabel(semester) {
  return `${Math.ceil(semester / 2)}학년 ${semester % 2 ? '1' : '2'}학기`;
}

function statIcons(key, value) {
  return Array.from({ length: 10 }, (_, index) => {
    const fill = Math.min(2, Math.max(0, value - index * 2));
    return `<canvas width="8" height="8" aria-hidden="true" data-stat="${key}" data-fill="${['empty', 'half', 'full'][fill]}"></canvas>`;
  }).join('');
}

function paintStats() {
  for (const canvas of root.querySelectorAll('.sprite-meter canvas')) {
    const { stat, fill } = canvas.dataset;
    const context = canvas.getContext('2d');
    icons[stat].forEach((row, y) => [...row].forEach((pixel, x) => {
      if (pixel === '0') return;
      context.fillStyle = fill === 'full' || (fill === 'half' && x < 4) ? STATS[stat].color : '#593949';
      context.fillRect(x, y, 1, 1);
    }));
  }
}

function paintProfile() {
  const canvas = root.querySelector('.student-photo');
  const context = canvas.getContext('2d');
  const seed = Array.from(game.state.id ?? '').reduce((value, character) => (Math.imul(value, 31) + character.charCodeAt(0)) >>> 0, 0);
  const appearance = {
    hairStyle: ['short', 'bob', 'medium', 'long'][seed & 3],
    hairColor: ['#241b20', '#46302a', '#332637', '#44352e'][(seed >>> 2) & 3],
    skinTone: ['#f2c49f', '#e9b995', '#c89771', '#a77655'][(seed >>> 4) & 3],
    outfitColor: ['#8b1e2d', '#78364c', '#315061', '#39455f'][(seed >>> 6) & 3],
    accessory: ['none', 'glasses', 'hairclip', 'earrings'][(seed >>> 8) & 3],
  };
  context.fillStyle = '#d9e5e8';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawPixelStudent(context, { appearance }, 4, 12, 4);
}

function statusIcons(ids) {
  if (!ids.length) return '';
  return `<ul class="status-icons" aria-label="현재 상태이상">${ids.map(id => {
    const { name, detail, icon } = STATUSES[id];
    const descriptionId = `status-description-${id}`;
    return `<li class="status-marker">
      <button type="button" class="status-toggle" aria-label="${escape(name)}" aria-describedby="${descriptionId}" aria-expanded="false"><span aria-hidden="true">${icon}</span></button>
      <span class="status-tooltip" id="${descriptionId}" role="tooltip"><strong>${escape(name)}</strong>
        ${escape(detail)}${id === 'depression' ? '<small>이 설명은 게임 규칙이며 의학적 진단에 해당하지 않습니다.</small>' : ''}
      </span>
    </li>`;
  }).join('')}</ul>`;
}

function statPanel() {
  const { stats, cash, boosts, phase, receipt } = game.state;
  const rows = Object.entries(STATS).map(([key, { name }]) => {
    const delta = ['result', 'ended'].includes(phase) ? receipt?.stats[key] : 0;
    const motion = delta > 0 ? ' increased' : delta < 0 ? ' decreased' : '';
    return `
    <div class="stat-row${motion}">
      <div><dt>${name}</dt><dd>${stats[key]} <span>/ 20</span></dd></div>
      <div class="sprite-meter">${statIcons(key, stats[key])}</div>
    </div>`;
  }).join('');
  return `
    <aside class="player-panel" aria-labelledby="player-title">
      <canvas class="student-photo" width="96" height="112" role="img" aria-label="플레이어 증명사진"></canvas>
      <h2 id="player-title">학생 상태</h2>
      <dl class="stat-list">${rows}</dl>
      <dl class="balances">
        <div><dt>보유 자금</dt><dd>${cashText(cash)}</dd></div>
        <div><dt>누적 평점</dt><dd>${gpaText(game.gpa)}</dd></div>
      </dl>
      ${boosts.nextGpa ? '<p class="active-item">다음 학기 평점에 전공 족보 적용 예정</p>' : ''}
      ${boosts.chance ? '<p class="active-item">다음 확률형 선택에 행운의 부적 적용 예정</p>' : ''}
      ${statusIcons(game.statuses)}
    </aside>`;
}

function titleScreen() {
  return `
    <header class="atlas-header"><a class="wordmark" href="./atlas.html">ATLAS</a><a class="text-link" href="./">KU LIFE로 돌아가기</a></header>
    <main class="landing">
      <div class="landing-art"><canvas class="scene-canvas" width="640" height="360" aria-hidden="true"></canvas></div>
      <section class="landing-card">
        <p class="context-label">고려대학교 대학생활 전략 시뮬레이션</p>
        <h1 tabindex="-1">안암의<br>여덟 학기</h1>
        <p>새터에서 만난 선배가 나중에 시험 자료를 건넬 수도 있습니다. 공부, 사람, 생활비 사이에서 무엇을 우선할지 정하며 졸업까지 걸어가세요.</p>
        <div class="actions">
          ${saved ? `<button class="primary" data-action="resume">${saved.phase === 'ended' ? '지난 결과 보기' : '이어하기'}</button>` : ''}
          <button class="${saved ? 'secondary' : 'primary'}" data-action="new">새 게임</button>
        </div>
        ${storageNotice ? `<p class="notice" role="status">${escape(storageNotice)}</p>` : ''}
      </section>
    </main>`;
}

function gameHeader() {
  const { semester, phase, termEvents } = game.state;
  const total = RULES.termEvents[semester - 1];
  const previous = RULES.termEvents.slice(0, semester - 1).reduce((sum, amount) => sum + amount, 0);
  const solved = phase === 'event' ? termEvents.length - 1 : termEvents.length;
  const overall = RULES.termEvents.reduce((sum, amount) => sum + amount, 0);
  return `
    <header class="atlas-header game-header">
      <button class="wordmark" data-action="title" aria-label="ATLAS 시작 화면">ATLAS</button>
      <div class="progress-panel">
        <strong>${termLabel(semester)}</strong><span>${phase === 'event' || phase === 'result' ? `이벤트 ${termEvents.length} / ${total}` : `${semester} / ${termCount}학기`}</span>
        <progress max="${overall}" value="${previous + Math.max(0, solved)}" aria-label="전체 이벤트 진행도"></progress>
      </div>
      <nav aria-label="기록 및 도구">
        ${screen !== 'game' ? '<button data-action="game">게임으로</button>' : ''}
        <button data-action="inventory" aria-current="${screen === 'inventory' ? 'page' : 'false'}">인벤토리</button>
        <button data-action="grades" aria-current="${screen === 'grades' ? 'page' : 'false'}">학점 기록</button>
      </nav>
    </header>`;
}

function sceneMarkup() {
  return '<div class="event-art"><canvas class="scene-canvas" width="640" height="360" aria-hidden="true"></canvas></div>';
}

function showEvent() {
  const event = game.event;
  return `${sceneMarkup()}
    <article class="panel event-panel">
      <p class="context-label">${eventType[event.kind]}</p>
      <h1 tabindex="-1">${escape(event.title)}</h1>
      <p class="event-description">${escape(event.description)}</p>
      <ul class="choices">${event.choices.map((choice, index) => {
        const reasons = game.choiceReasons(choice);
        return `<li><button data-action="choose" data-value="${index}" data-token="${game.eventToken}" ${reasons.length ? 'disabled' : ''}>${escape(choice.text)}${choice.chance ? '<small>결과가 달라질 수 있어요</small>' : ''}${reasons.length ? `<small class="lock-reason">${reasons.map(escape).join(' · ')}</small>` : ''}</button></li>`;
      }).join('')}</ul>
    </article>`;
}

function changeChips(changes) {
  return Object.entries(changes).map(([key, value]) => {
    const stat = STATS[key];
    const color = value > 0 ? 'gain' : 'loss';
    if (stat) {
      return `<li class="${color} stat-chip" title="${stat.name}"><span aria-hidden="true">${stat.icon}</span><span class="sr-only">${stat.name} </span>${signed(value)}</li>`;
    }
    return `<li class="${color}">${escape(ITEMS[key]?.name ?? key)} ${signed(value)}</li>`;
  }).join('');
}

function receiptList(receipt) {
  const changes = changeChips(receipt.stats) + changeChips(receipt.items);
  const cash = receipt.cash ? `<li class="${receipt.cash > 0 ? 'gain' : 'loss'}">자금 ${signedCash(receipt.cash)}</li>` : '';
  const grades = receipt.grade ? `<li class="${receipt.grade > 0 ? 'gain' : 'loss'}">학기 평점에 ${receipt.grade > 0 ? '+' : '−'}${Math.abs(receipt.grade).toFixed(2)}</li>` : '';
  const flags = receipt.flags.map(id => `<li class="gain">경험 · ${escape(EXPERIENCES[id])}</li>`).join('');
  const status = receipt.gained.map(id => `<li class="loss">발생 · ${escape(STATUSES[id].name)}</li>`).join('')
    + receipt.cleared.map(id => `<li class="gain">해제 · ${escape(STATUSES[id].name)}</li>`).join('');
  const content = changes + cash + grades + flags + status;
  return content ? `<ul class="changes">${content}</ul>` : '<p class="muted">기록에 남는 수치 변화가 없어요.</p>';
}

function showReceipt() {
  const receipt = game.state.receipt;
  const lastEvent = game.state.termEvents.length === RULES.termEvents[game.state.semester - 1];
  return `${sceneMarkup()}
    <article class="panel">
      <p class="context-label">선택 결과${receipt.chance ? ` · ${receipt.chance.won ? '성공' : '실패'}` : ''}</p>
      <h1 tabindex="-1">${escape(receipt.title)}</h1>
      <p class="subline">${escape(receipt.choice)}</p>
      <p class="event-description">${escape(receipt.message)}</p>
      ${receiptList(receipt)}
      <div class="actions"><button class="primary" data-action="next-event">${lastEvent ? '학기 평점 확인' : '다음 이벤트'}</button></div>
    </article>`;
}

function showTerm() {
  const { semester, grades, gradeNotes, minigame } = game.state;
  if (minigame) return `
    <article class="panel">
      <p class="context-label">학기 말 활동</p>
      <h1 tabindex="-1">미니게임</h1>
      <p class="event-description">전달한 보유 자금 <strong>${cashText(minigame.balance)}</strong></p>
      <p class="muted">현재 연결된 미니게임이 없으면 아래 버튼으로 상점에 돌아갈 수 있습니다.</p>
      <div class="actions"><button class="primary" data-action="exit-minigame">상점으로 돌아가기</button></div>
    </article>`;
  const stock = game.stock().map(id => {
    const item = ITEMS[id];
    const reason = game.buyReason(id);
    return `<li><div><h3>${escape(item.name)}</h3><p class="subline">${typeName[item.type]} · ${cashText(item.price)}</p><p>${escape(item.detail)}</p></div>
      <div><button class="secondary" data-action="buy" data-value="${id}" ${reason ? 'disabled' : ''}>구매<span class="sr-only"> ${escape(item.name)}</span></button>
      ${reason ? `<small class="lock-reason">${escape(reason)}</small>` : ''}</div></li>`;
  }).join('');
  const effects = changeChips(gradeNotes.stats);
  return `
    <article class="panel">
      <p class="context-label">${termLabel(semester)} 종료</p>
      <h1 tabindex="-1">학기 정산</h1>
      <dl class="term-grades">
        <div><dt>학기 평점</dt><dd>${gpaText(grades.at(-1))}</dd></div>
        <div><dt>누적 평점</dt><dd>${gpaText(game.gpa)}</dd></div>
      </dl>
      <p class="muted">학업 기록 ${gradeNotes.study.toFixed(2)} · 아이템 가산 ${gradeNotes.bonus.toFixed(2)} · 컨디션 감점 ${gradeNotes.penalty.toFixed(2)}</p>
      ${effects ? `<ul class="changes">${effects}</ul>` : ''}
      <div class="term-actions actions"><button class="primary" data-action="next-term">${semester === termCount ? '최종 결과 보기' : '다음 학기'}</button><button class="secondary" data-action="minigame">미니게임</button></div>
      <section class="shop" aria-labelledby="shop-title">
        <h2 id="shop-title">학기 말 상점</h2>
        <ul class="items">${stock}</ul>
      </section>
    </article>`;
}

function showInventory() {
  const list = Object.entries(game.state.inventory).map(([id, count]) => {
    const item = ITEMS[id];
    const reason = game.useReason(id);
    return `<li><div><h3>${escape(item.name)} <span>×${count}</span></h3><p class="subline">${typeName[item.type]}</p><p>${escape(item.detail)}</p></div>
      ${item.type === 'consumable' ? `<div><button class="secondary" data-action="use" data-value="${id}" ${reason ? 'disabled' : ''}>사용<span class="sr-only"> ${escape(item.name)}</span></button>${reason ? `<small class="lock-reason">${escape(reason)}</small>` : ''}</div>` : ''}</li>`;
  }).join('');
  return `<article class="panel"><h1 tabindex="-1">인벤토리</h1>
    ${list ? `<ul class="items">${list}</ul>` : '<p class="event-description">보유 아이템이 없습니다. 학기 말 상점에서 구매할 수 있어요.</p>'}
    <div class="actions"><button class="primary" data-action="game">게임으로 돌아가기</button></div></article>`;
}

function showGrades() {
  const rows = game.state.grades.map((grade, index) => `<tr><th scope="row">${termLabel(index + 1)}</th><td>${gpaText(grade)}</td></tr>`).join('');
  return `<article class="panel"><h1 tabindex="-1">학점 기록</h1>
    ${rows ? `<table><thead><tr><th scope="col">학기</th><th scope="col">평점</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th scope="row">누적</th><td>${gpaText(game.gpa)}</td></tr></tfoot></table>` : '<p class="event-description">첫 학기를 마치면 학점이 여기에 표시됩니다.</p>'}
    <div class="actions"><button class="primary" data-action="game">게임으로 돌아가기</button></div></article>`;
}

function summaryList(title, values) {
  return `<section class="summary"><h2>${title}</h2>${values.length ? `<ul>${values.map(value => `<li>${escape(value)}</li>`).join('')}</ul>` : '<p class="muted">기록 없음</p>'}</section>`;
}

function showEnding() {
  const { ending, history, inventory, flags, receipt } = game.state;
  const main = ENDINGS.find(outcome => outcome.id === ending.id);
  const achievements = ending.achievements.map(id => ENDINGS.find(outcome => outcome.id === id).title);
  const record = history.map(entry => `<li><strong>${termLabel(entry.semester)} · ${escape(entry.title)}</strong><p>${escape(entry.choice)}</p></li>`).join('');
  return `${sceneMarkup()}
    <article class="panel ending">
      <p class="context-label">${main.id === 'dropout' ? '게임오버' : '최종 결과'}</p>
      <h1 tabindex="-1">${escape(main.title)}</h1>
      <p class="event-description">${escape(main.description)}</p>
      ${main.id === 'dropout' && receipt ? `<section class="last-choice"><h2>마지막 선택</h2><p>${escape(receipt.choice)}</p>${receiptList(receipt)}</section>` : ''}
      <div class="summary-grid">
        ${summaryList('획득 업적', achievements)}
        ${summaryList('대학생활 경험', flags.map(id => EXPERIENCES[id]))}
        ${summaryList('보유 아이템', Object.entries(inventory).map(([id, count]) => `${ITEMS[id].name} ×${count}`))}
      </div>
      <details class="history"><summary>선택 기록 ${history.length}개</summary><ol>${record}</ol></details>
      <div class="actions"><button class="primary" data-action="title">시작 화면</button></div>
    </article>`;
}

function render(focus = false) {
  if (screen === 'title') {
    root.innerHTML = titleScreen();
  } else {
    const views = { event: showEvent, result: showReceipt, term: showTerm, ended: showEnding };
    const body = screen === 'inventory' ? showInventory() : screen === 'grades' ? showGrades() : views[game.state.phase]();
    root.innerHTML = `${gameHeader()}<main class="dashboard">${statPanel()}<div class="workspace">
      <p class="notice" role="status" ${notice || storageNotice ? '' : 'hidden'}>${[notice, storageNotice].filter(Boolean).map(escape).join(' ')}</p>
      ${body}
    </div></main>`;
    paintProfile();
    paintStats();
  }
  const canvas = root.querySelector('.scene-canvas');
  if (canvas) {
    const context = canvas.getContext('2d');
    context.scale(2, 2);
    drawPixelBackground(context, screen === 'title' ? 'campus' : game.event?.scene ?? 'campus', screen === 'title' ? 1 : game.state.semester);
  }
  if (focus) root.querySelector('h1')?.focus();
}

function actionResult(result, success = '') {
  if (result) present(success);
}

function openMinigame() {
  const run = game;
  const connection = run.beginMinigame();
  if (!connection) return;
  present();
  const settle = delta => {
    if (game !== run || !run.settleMinigame(connection.id, delta)) return false;
    screen = 'game';
    present(delta ? `미니게임 정산 ${signedCash(run.state.cash - connection.balance)}` : '');
    return true;
  };
  window.dispatchEvent(new CustomEvent('atlas:minigame-start', { detail: {
    ...connection, complete: settle, exit: () => settle(0),
  } }));
}

function restoreStatusTooltip(event) {
  event.target.closest('.status-toggle')?.removeAttribute('data-dismissed');
}

root.addEventListener('focusin', restoreStatusTooltip);
root.addEventListener('pointerover', restoreStatusTooltip);
root.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  for (const button of root.querySelectorAll('.status-toggle:is([aria-expanded="true"], :focus-visible, .status-marker:hover > *)')) {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('data-dismissed', '');
  }
});

root.addEventListener('click', event => {
  const status = event.target.closest('.status-toggle');
  const openStatus = root.querySelector('.status-toggle[aria-expanded="true"]');
  openStatus?.setAttribute('aria-expanded', 'false');
  if (status) {
    status.removeAttribute('data-dismissed');
    status.setAttribute('aria-expanded', String(status !== openStatus));
    return;
  }
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;
  const { action, value, token } = button.dataset;
  switch (action) {
    case 'new':
      if (saved && !window.confirm('기존 ATLAS 진행 기록을 덮어쓰고 새 게임을 시작할까요?')) return;
      game = new AtlasGame();
      screen = 'game';
      present();
      break;
    case 'resume':
      game = new AtlasGame(saved);
      screen = 'game';
      render(true);
      break;
    case 'title':
    case 'game':
    case 'inventory':
    case 'grades':
      screen = action;
      notice = '';
      render(true);
      break;
    case 'choose':
      actionResult(game.choose(Number(value), token));
      break;
    case 'next-event':
      actionResult(game.nextEvent());
      break;
    case 'next-term':
      actionResult(game.nextTerm());
      break;
    case 'buy':
      actionResult(game.buy(value), `${ITEMS[value].name}을 구매했습니다.`);
      break;
    case 'use':
      actionResult(game.use(value), `${ITEMS[value].name}을 사용했습니다.`);
      break;
    case 'minigame':
      openMinigame();
      break;
    case 'exit-minigame':
      actionResult(game.settleMinigame(game.state.minigame?.id, 0));
      break;
  }
});

render();

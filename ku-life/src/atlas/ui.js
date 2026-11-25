import { drawPixelBackground } from '../ui/pixel-backgrounds.js';
import { drawPixelStudent } from '../ui/pixel-student.js';
import { AtlasGame } from './game.js';
import { EXPERIENCES, ITEMS, LEGACY_ENDINGS, RULES, STATS, STATUSES, cashText } from './config.js';
import { ENDINGS, archiveEndingInfo, careerOptions, endingChoices, endingScore, majorEnding, normalizeEnding } from './endings.js';
import { employmentForEnding } from './employment.js';
import { findMajor } from './majors.js';
import { openAdmission } from './admission.js';
import { showEndingProfile } from './ending-profile.js';
import { createEndingPreview } from './ending-preview.js';
import { itemSprite, paintSprites, statSprite } from './sprites.js';
import { animateArcade, arcadeMenu, arcadeScreen, mountClaw } from './arcade-ui.js';
import { currentPlayer, openAccount, watchPlayer } from './auth.js';
import './atlas.css';
import './arcade.css';

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
const eventType = { fixed: '학기 일정', special: '특별 이벤트', campus: '학교 행사', random: '일상', conditional: '조건부', chain: '후속 사건', crisis: '위기', academic: '학업', fallback: '일상' };
const savedPhase = { event: '이벤트 진행 중', result: '선택 결과', term: '학기 결산', career: '졸업 진로 선택', ended: '플레이 완료' };
const endingEntries = Object.entries(ENDINGS);
const basicEndings = endingEntries.filter(([, ending]) => !ending.hidden);
const hiddenEndings = endingEntries.filter(([, ending]) => ending.hidden);
const endingStorageKey = 'ku-life:ending:';
const variantStorageKey = 'ku-life:ending-major:';
const unlockedEndings = new Set();
const endingVariants = new Map(endingEntries.map(([id]) => [id, new Map()]));
const previewId = import.meta.env.VITE_ENDING_PREVIEW === '1'
  ? new URLSearchParams(window.location.search).get('ending-preview') : null;
let game = previewId ? createEndingPreview(previewId) : null;
const inEndingPreview = Boolean(game);
let screen = inEndingPreview ? 'game' : 'title';
let notice = '';
let storageNotice = '';
let saved;

try {
  const data = JSON.parse(localStorage.getItem(storageKey) || 'null');
  if (data?.version === 1 && Object.hasOwn(savedPhase, data.phase) && data.stats && data.inventory && Array.isArray(data.history)) saved = data;
} catch {
  storageNotice = '이 브라우저에서 저장 기록을 읽을 수 없습니다.';
}

function persist() {
  if (inEndingPreview) return;
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
    return statSprite(key, ['empty', 'half', 'full'][fill]);
  }).join('');
}

function paintProfile(canvas, id) {
  const context = canvas.getContext('2d');
  const seed = Array.from(id ?? '').reduce((value, character) => (Math.imul(value, 31) + character.charCodeAt(0)) >>> 0, 0);
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
  const { stats, cash, boosts, phase, receipt, majorId } = game.state;
  const major = findMajor(majorId);
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
      ${major ? `<p class="student-major">${escape(major.name)}</p>` : ''}
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
  loadEndings();
  if (saved?.phase === 'ended') {
    const id = normalizeEnding(saved.ending)?.id;
    unlockEnding(id, saved.majorId, employmentForEnding(saved, id)?.id);
  }
  const major = findMajor(saved?.majorId);
  return `
    <main class="landing">
      <div class="landing-art"><canvas class="scene-canvas" width="640" height="360" aria-hidden="true"></canvas></div>
      <button type="button" class="landing-account secondary" data-action="account">
        <strong>${currentPlayer() ? '내 계정' : '로그인 · 회원가입'}</strong>
      </button>
      <div class="landing-layout">
      <section class="landing-card">
        <p class="context-label">고려대학교 대학생활 전략 시뮬레이션</p>
        <h1 tabindex="-1">KU-LIFE</h1>
        <p>공부, 사람, 생활비 사이에서 무엇을 우선할지 정하며 졸업까지 걸어가세요.</p>
      </section>
      <section class="entry-panel" aria-label="게임 시작">
        ${saved ? `<button type="button" class="entry-button entry-primary" data-action="resume" aria-labelledby="resume-label" aria-describedby="resume-details">
          <canvas class="save-portrait" width="96" height="112" aria-hidden="true"></canvas>
          <span><strong id="resume-label">${saved.phase === 'ended' ? '지난 결과 보기' : '이어하기'}</strong><small id="resume-details">${major ? escape(major.name) + ' · ' : ''}${termLabel(saved.semester)} · ${savedPhase[saved.phase]}</small></span><span aria-hidden="true">→</span>
        </button>` : ''}
        <button type="button" class="entry-button ${saved ? '' : 'entry-primary'}" data-action="new" aria-labelledby="new-label" aria-describedby="new-details">
          <span><strong id="new-label">입학하기</strong><small id="new-details">학과를 골라 1학년부터 시작</small></span><span aria-hidden="true">→</span>
        </button>
        <button type="button" class="entry-button entry-archive" data-action="archive" aria-labelledby="archive-label" aria-describedby="archive-count">
          <span><strong id="archive-label">엔딩 도감</strong><small>기본 ${basicEndings.length}개 · 히든 ${hiddenEndings.length}개</small></span><span id="archive-count">${unlockedEndings.size} / ${endingEntries.length}</span>
        </button>
        ${storageNotice ? `<p class="notice" role="status">${escape(storageNotice)}</p>` : ''}
      </section>
      </div>
    </main>`;
}

function gameHeader() {
  const { semester, phase, termEvents, history, grades } = game.state;
  const total = RULES.termEvents[semester - 1];
  const solved = termEvents.length - Number(phase === 'event');
  const remaining = RULES.termEvents.slice(semester).reduce((sum, amount) => sum + amount, 0);
  const overall = history.length + (grades.length >= semester ? 0 : Math.max(0, total - solved)) + remaining;
  const progressLabel = phase === 'event' && game.event.ending ? '마지막 선택'
    : phase === 'event' || phase === 'result' ? `이벤트 ${termEvents.length} / ${total}` : `${semester} / ${termCount}학기`;
  return `
    <header class="atlas-header game-header">
      <button class="wordmark" data-action="title" aria-label="KU-LIFE 시작 화면">KU-LIFE</button>
      <div class="progress-panel">
        <strong>${termLabel(semester)}</strong><span>${progressLabel}</span>
        <progress max="${overall}" value="${history.length}" aria-label="전체 이벤트 진행도"></progress>
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
    <article class="panel event-panel${event.kind === 'special' || event.ending ? ' special-event' : ''}">
      <p class="context-label">${event.ending ? '마지막 선택' : eventType[event.kind]}</p>
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
      return `<li class="${color} stat-chip" title="${stat.name}">${statSprite(key)}<span class="sr-only">${stat.name} </span>${signed(value)}</li>`;
    }
    return `<li class="${color}">${escape(ITEMS[key]?.name ?? key)} ${signed(value)}</li>`;
  }).join('');
}

function receiptList(receipt) {
  const changes = changeChips(receipt.stats) + changeChips(receipt.items);
  const cash = receipt.cash ? `<li class="${receipt.cash > 0 ? 'gain' : 'loss'}">자금 ${signedCash(receipt.cash)}</li>` : '';
  const status = receipt.gained.map(id => `<li class="loss">발생 · ${escape(STATUSES[id].name)}</li>`).join('')
    + receipt.cleared.map(id => `<li class="gain">해제 · ${escape(STATUSES[id].name)}</li>`).join('');
  const content = changes + cash + status;
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
  if (minigame?.kind) return arcadeScreen(minigame);
  if (minigame) return `
    <article class="panel">
      <p class="context-label">학기 말 활동</p>
      <h1 tabindex="-1">미니게임</h1>
      <p class="event-description">전달한 보유 자금 <strong>${cashText(minigame.balance)}</strong></p>
      <p class="muted">현재 연결된 미니게임이 없으면 아래 버튼으로 상점에 돌아갈 수 있습니다.</p>
      <div class="actions"><button class="primary" data-action="exit-minigame">상점으로 돌아가기</button></div>
    </article>`;
  if (screen === 'arcade') return arcadeMenu(game);
  const stock = game.stock().map(id => {
    const item = ITEMS[id];
    const reason = game.buyReason(id);
    return `<li><div class="item-info">${itemSprite(id)}
        <div><h3>${escape(item.name)}</h3><p class="subline">${typeName[item.type]} · ${cashText(item.price)}</p><p>${escape(item.detail)}</p></div>
      </div>
      <div><button class="secondary" data-action="buy" data-value="${id}" ${reason ? 'disabled' : ''}>구매<span class="sr-only"> ${escape(item.name)}</span></button>
      ${reason ? `<small class="lock-reason">${escape(reason)}</small>` : ''}</div></li>`;
  }).join('');
  const effects = changeChips(gradeNotes.stats);
  const gradeFactors = [
    gradeNotes.intelligence != null && `학기 말 지능 ${gradeNotes.intelligence} / ${RULES.statMax}`,
    gradeNotes.bonus > 0 && `아이템 가산 +${gradeNotes.bonus.toFixed(2)}`,
    gradeNotes.penalty > 0 && `컨디션 감점 −${gradeNotes.penalty.toFixed(2)}`,
  ].filter(Boolean);
  return `
    <article class="panel">
      <p class="context-label">${termLabel(semester)} 종료</p>
      <h1 tabindex="-1">학기 정산</h1>
      <dl class="term-grades">
        <div><dt>학기 평점</dt><dd>${gpaText(grades.at(-1))}</dd></div>
        <div><dt>누적 평점</dt><dd>${gpaText(game.gpa)}</dd></div>
      </dl>
      <p class="muted">지능이 높을수록 높은 평점이 나올 확률이 커집니다.</p>
      ${gradeFactors.length ? `<p class="muted grade-factors">${gradeFactors.join(' · ')}</p>` : ''}
      ${effects ? `<ul class="changes">${effects}</ul>` : ''}
      <div class="term-actions actions"><button class="primary" data-action="next-term">${semester !== termCount ? '다음 학기' : game.gpa < RULES.graduationGpa ? '최종 결과 보기' : '졸업 후 진로 선택'}</button><button class="secondary" data-action="arcade-menu" ${game.arcadePlayed ? 'disabled' : ''}>${game.arcadePlayed ? '미니게임 완료' : '미니게임'}</button></div>
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
    return `<li><div class="item-info">${itemSprite(id)}
      <div><h3>${escape(item.name)} <span>×${count}</span></h3><p class="subline">${typeName[item.type]}</p><p>${escape(item.detail)}</p></div>
    </div>
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

function showCareer() {
  const { majorId } = game.state;
  const major = findMajor(majorId);
  const options = careerOptions(game.state, game.gpa);
  const routes = options.map(({ id, route, reasons }) => {
    const ending = majorEnding(id, majorId, employmentForEnding(game.state, id));
    const suggested = id === route && major?.routes.includes(route);
    const description = ending.title !== ENDINGS[id].title ? `<small>${escape(ending.title)}</small>` : '';
    const status = reasons.length
      ? `<small class="lock-reason"><span aria-hidden="true">🔒 </span>잠김 · ${reasons.map(escape).join(' / ')}</small>`
      : '<small>선택 가능</small>';
    return `<li><button type="button" data-action="career" data-value="${id}" data-route="${route}" ${reasons.length ? 'disabled' : ''}>
      ${ending.icon} ${escape(ENDINGS[id].title)}${suggested ? ' <span class="major-route">전공 추천</span>' : ''}
      ${description}${status}
    </button></li>`;
  }).join('');
  return `${sceneMarkup()}<article class="panel">
    <h1 tabindex="-1">${major?.terms ? '여덟 학기 이후의 길' : '졸업 후 어디로 갈까요?'}</h1>
    <p class="event-description">${major ? escape(major.name) + ' · ' : ''}지금까지 쌓은 경험과 최종 스탯으로 열린 진로를 골라보세요.</p>
    ${major?.terms ? `<p class="subline">이 학과의 ${major.terms}학기 과정 중 게임은 8학기까지 진행돼요. 이후 진로는 후일담으로 이어져요.</p>` : ''}
    <ul class="choices career-choices">${routes}</ul>
  </article>`;
}

function recordEndingVariant(id, majorId, employerId) {
  const variants = endingVariants.get(id);
  if (!variants || (majorId && !findMajor(majorId))) return null;
  const employer = employmentForEnding({ majorId, ending: { id, employerId } }, id);
  if ((employerId && employer?.id !== employerId) || (!majorId && !employer)) return null;
  const key = employer ? `${majorId ?? ''}:${employer.id}` : majorId;
  if (variants.has(key)) return null;
  variants.set(key, { majorId, employer });
  return key;
}

function loadEndings() {
  try {
    for (const [id] of endingEntries) {
      if (localStorage.getItem(endingStorageKey + id) === '1') unlockedEndings.add(id);
    }
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (!key?.startsWith(variantStorageKey)) continue;
      const [id, majorId, employerId] = key.slice(variantStorageKey.length).split(':');
      if (recordEndingVariant(id, majorId, employerId)) unlockedEndings.add(id);
    }
  } catch {
    // Discovered endings are still available for the current session.
  }
}

function unlockEnding(id, majorId, employerId) {
  if (!endingVariants.has(id)) return;
  const firstEnding = !unlockedEndings.has(id);
  const newVariant = recordEndingVariant(id, majorId, employerId);
  unlockedEndings.add(id);
  if (inEndingPreview) return;
  try {
    if (firstEnding) localStorage.setItem(endingStorageKey + id, '1');
    if (newVariant) localStorage.setItem(variantStorageKey + id + ':' + newVariant, '1');
  } catch {
    // The main save path reports unavailable browser storage.
  }
}

function openArchive() {
  loadEndings();
  const groups = [
    { title: '기본 엔딩', entries: basicEndings },
    { title: '히든 엔딩', entries: hiddenEndings },
  ];
  const dialog = document.createElement('dialog');
  dialog.className = 'atlas-dialog ending-archive';
  dialog.setAttribute('aria-labelledby', 'archive-title');
  dialog.innerHTML = `<button type="button" class="secondary dialog-close" data-action="close-dialog" aria-label="엔딩 도감 닫기" autofocus>×</button>
    <h2 id="archive-title">엔딩 도감</h2>
    ${groups.map(({ title, entries }) => {
      const count = entries.filter(([id]) => unlockedEndings.has(id)).length;
      return `<section><h3>${title} <span>${count} / ${entries.length}</span></h3><ul>${entries.map(([id, ending]) => {
        const unlocked = unlockedEndings.has(id);
        const { icon, title, description } = archiveEndingInfo(ending, unlocked);
        const variants = unlocked ? [...endingVariants.get(id).values()].map(({ majorId, employer }) => {
          const major = findMajor(majorId);
          const variant = majorEnding(id, majorId, employer);
          const label = employer ? [major?.name, variant.title].filter(Boolean).join(' · ') : major.name;
          const heading = employer ? '' : `<p><strong>${escape(variant.title)}</strong></p>`;
          return `<details><summary>${escape(label)}</summary>${heading}<p>${escape(variant.description)}</p></details>`;
        }).join('') : '';
        return `<li class="${unlocked ? '' : 'locked'}"><span aria-hidden="true">${icon}</span><div>
          <strong>${escape(title)}</strong> <span class="archive-state">${unlocked ? '발견' : '미발견'}</span>
          ${description ? `<p>${escape(description)}</p>` : ''}${variants ? `<div class="archive-variants">${variants}</div>` : ''}
        </div></li>`;
      }).join('')}</ul></section>`;
    }).join('')}`;
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  root.append(dialog);
  dialog.showModal();
}

function currentEnding() {
  const { ending, majorId } = game.state;
  const legacy = !Object.hasOwn(ending, 'route');
  const info = (legacy ? LEGACY_ENDINGS.find(item => item.id === ending.id)
    : majorEnding(ending.id, majorId, employmentForEnding(game.state, ending.id))) ?? ENDINGS.ordinary;
  return { ...info, id: ending.id, legacy, major: findMajor(majorId)?.name };
}

function showEnding() {
  const { ending, history, inventory, flags, receipt, majorId } = game.state;
  const main = currentEnding();
  const score = endingScore(game.state, game.gpa, main.id);
  const missedGraduation = !main.legacy && !ending.route && main.id === 'ordinary';
  unlockEnding(main.id, majorId, main.employer?.id);
  const achievements = (ending.achievements ?? []).map(id => LEGACY_ENDINGS.find(outcome => outcome.id === id)?.title).filter(Boolean);
  const recap = endingChoices(history, main.id);
  const record = history.map(entry => `<li><strong>${termLabel(entry.semester)} · ${escape(entry.title)}</strong><p>${escape(entry.choice)}</p></li>`).join('');
  return `${sceneMarkup()}
    <article class="panel ending${main.hidden ? ' hidden-ending' : ''}">
      <p class="context-label">${main.legacy ? '지난 플레이 결과' : main.hidden ? '히든 엔딩' : '기본 엔딩'}</p>
      <h1 tabindex="-1">${escape(main.title)}</h1>
      ${main.major ? `<p class="student-major">${escape(main.major)}</p>` : ''}
      <p class="event-description">${escape(missedGraduation && !main.major ? '졸업 사정표에 아직 채워야 할 칸이 남았다. 학사지원팀과 다음 계획을 세운다.' : main.description)}</p>
      ${main.keepsake ? `<figure class="ending-keepsake"><figcaption>${escape(main.keepsake.label)}</figcaption><blockquote>${escape(main.keepsake.text)}</blockquote></figure>` : ''}
      ${main.hidden ? `<p class="subline">${termLabel(game.state.semester)}에 플레이 종료</p>` : ''}
      ${ending.route ? `<p class="subline">진로 · ${escape(ENDINGS[main.id]?.title)}</p>` : ''}
      ${missedGraduation ? `<p class="subline">누적 평점이 ${RULES.graduationGpa.toFixed(2)} 미만이라 졸업 요건을 채우지 못했습니다.</p>` : ''}
      <section class="ending-score" aria-labelledby="score-title">
        <div><h2 id="score-title">토탈 스코어</h2><p><strong>${score.total.toLocaleString('ko-KR')}</strong> / ${score.max.toLocaleString('ko-KR')}</p></div>
        <dl><div><dt>스탯 · 평점 · 자금</dt><dd>${score.base} / ${score.statsMax}</dd></div><div><dt>엔딩 보너스</dt><dd>${score.bonus} / ${score.bonusMax}</dd></div></dl>
      </section>
      <div class="actions ending-actions"><button class="primary" data-action="profile">프로필 보기</button><button class="secondary" data-action="archive">엔딩 도감</button><button class="secondary" data-action="title">시작 화면</button></div>
      ${main.id === 'dropout' && receipt ? `<section class="last-choice"><h2>마지막 선택</h2><p>${escape(receipt.choice)}</p>${receiptList(receipt)}</section>` : ''}
      ${recap.length ? `<section class="ending-recap"><h2>이 결말로 이어진 선택</h2><ol>${recap.map(entry => `<li><small>${termLabel(entry.semester)} · ${escape(entry.title)}</small><strong>${escape(entry.choice)}</strong></li>`).join('')}</ol></section>` : ''}
      <div class="summary-grid">
        ${summaryList('획득 업적', achievements)}
        ${summaryList('대학생활 경험', flags.map(id => EXPERIENCES[id]))}
        ${summaryList('보유 아이템', Object.entries(inventory).map(([id, count]) => `${ITEMS[id].name} ×${count}`))}
      </div>
      <details class="history"><summary>선택 기록 ${history.length}개</summary><ol>${record}</ol></details>
    </article>`;
}

function render(focus = false) {
  if (screen === 'title') {
    root.innerHTML = titleScreen();
    const portrait = root.querySelector('.save-portrait');
    if (portrait) paintProfile(portrait, saved.id);
  } else {
    const views = { event: showEvent, result: showReceipt, term: showTerm, career: showCareer, ended: showEnding };
    const body = screen === 'inventory' ? showInventory() : screen === 'grades' ? showGrades() : views[game.state.phase]();
    const storageMessage = inEndingPreview ? '엔딩 테스트 · 진행과 도감은 이 탭에만 기록돼요.' : storageNotice;
    const messages = [notice, storageMessage].filter(Boolean);
    root.innerHTML = `${gameHeader()}<main class="dashboard">${statPanel()}<div class="workspace">
      <p class="notice" role="status" ${messages.length ? '' : 'hidden'}>${messages.map(escape).join(' ')}</p>
      ${body}
    </div></main>`;
    paintProfile(root.querySelector('.student-photo'), game.state.id);
    paintSprites(root);
    if (game.state.minigame?.kind === 'claw') mountClaw(root, game.state.minigame);
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

function startNewGame(majorId) {
  game = new AtlasGame(null, Math.random, majorId);
  screen = 'game';
  present();
}

async function showArcadeResult(panel) {
  persist();
  try {
    await animateArcade(panel, game.state.minigame);
  } catch {
    // The saved outcome is still available if animation is interrupted.
  } finally {
    if (panel.isConnected) {
      render();
      root.querySelector('.arcade-status')?.focus();
    }
  }
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
    case 'account':
      openAccount(root);
      break;
    case 'archive':
      openArchive();
      break;
    case 'profile': {
      const ending = currentEnding();
      showEndingProfile(root, game.state, game.gpa, ending, endingScore(game.state, game.gpa, ending.id), root.querySelector('.student-photo'));
      break;
    }
    case 'close-dialog':
      button.closest('dialog').close();
      break;
    case 'new':
      openAdmission(root, saved ? termLabel(saved.semester) : '', startNewGame);
      break;
    case 'resume':
      game = new AtlasGame(saved);
      screen = 'game';
      render(true);
      break;
    case 'title':
      if (inEndingPreview) {
        window.location.assign(window.location.pathname);
        break;
      }
      // Fall through to the shared screen navigation.
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
    case 'career':
      actionResult(game.chooseCareer(button.dataset.route, value));
      break;
    case 'buy':
      actionResult(game.buy(value), `${ITEMS[value].name}을 구매했습니다.`);
      break;
    case 'use':
      actionResult(game.use(value), `${ITEMS[value].name}을 사용했습니다.`);
      break;
    case 'arcade-menu':
      if (game.state.phase !== 'term' || game.arcadePlayed) break;
      screen = 'arcade';
      notice = '';
      render(true);
      break;
    case 'arcade-start':
      actionResult(game.beginArcade(value));
      break;
    case 'arcade-close': {
      const session = game.state.minigame;
      screen = session && !session.result ? 'arcade' : 'game';
      if (session) actionResult(game.closeArcade());
      else render(true);
      break;
    }
    case 'roulette-spin':
      if (game.spinRoulette()) void showArcadeResult(button.closest('[data-arcade]'));
      break;
    case 'claw-aim': {
      const panel = button.closest('[data-arcade]');
      const position = Number(panel.querySelector('.claw-board').dataset.position);
      if (!game.aimClaw(position)) break;
      if (game.state.minigame.result) void showArcadeResult(panel);
      else {
        present();
        root.querySelector('[data-action="claw-aim"]')?.focus();
      }
      break;
    }
    case 'exit-minigame':
      actionResult(game.settleMinigame(game.state.minigame?.id, 0));
      break;
  }
});

render();

watchPlayer(() => {
  const label = root.querySelector('[data-action="account"] strong');
  if (label) label.textContent = currentPlayer() ? '내 계정' : '로그인 · 회원가입';
});

import { CLAW_ATTEMPT_FEE, ROULETTE, rouletteCash } from './arcade.js';
import { ITEMS, cashText } from './config.js';
import { itemSprite } from './sprites.js';

const wheelColors = ['#e9bd65', '#9e3e58', '#396767', '#554263', '#87364c', '#467f6d', '#9e3e58', '#396767', '#554263', '#87364c'];
const percentText = value => value > 0 ? `+${value}%` : value < 0 ? `−${-value}%` : '0%';
const deltaText = value => value > 0 ? `+${cashText(value)}` : value < 0 ? `−${cashText(-value)}` : '0원';
const degreesPerSlot = 360 / ROULETTE.length;
const wheelStops = wheelColors.map((color, i) => `${color} ${i * degreesPerSlot}deg ${(i + 1) * degreesPerSlot}deg`).join(', ');
const rotationFor = index => 360 * 5 - index * degreesPerSlot;
let audio;

function arcadeSound(notes) {
  if (!globalThis.AudioContext) return;
  audio ??= new AudioContext();
  void audio.resume().catch(() => {});
  for (const [delay, frequency] of notes) {
    const start = audio.currentTime + delay;
    const tone = audio.createOscillator();
    const volume = audio.createGain();
    tone.type = 'triangle';
    tone.frequency.value = frequency;
    volume.gain.setValueAtTime(.045, start);
    volume.gain.exponentialRampToValueAtTime(.001, start + .07);
    tone.connect(volume).connect(audio.destination);
    tone.start(start);
    tone.stop(start + .08);
  }
}

export function arcadeMenu(game) {
  const balance = game.state.cash;
  const unaffordable = balance < CLAW_ATTEMPT_FEE;
  return `
    <article class="panel arcade-panel">
      <p class="context-label">학기 정산</p>
      <h1 tabindex="-1">미니게임</h1>
      <p>이번 학기에 한 번, 두 게임 중 하나에 도전할 수 있어요.</p>
      <div class="arcade-options">
        <button class="arcade-option claw-option" data-action="arcade-start" data-value="claw" ${unaffordable ? 'disabled' : ''}>
          <span class="arcade-option-icon" aria-hidden="true">✦</span>
          <span><strong>인형뽑기</strong><small>참가비 ${cashText(CLAW_ATTEMPT_FEE)} · ${unaffordable ? '보유 자금 부족' : '상점 아이템 1개'}</small></span>
        </button>
        <button class="arcade-option roulette-option" data-action="arcade-start" data-value="roulette">
          <span class="arcade-option-icon" aria-hidden="true">◉</span>
          <span><strong>행운 룰렛</strong><small>안정성 낮음 · ${deltaText(rouletteCash(balance, -8))} ~ ${deltaText(rouletteCash(balance, 20))}</small></span>
        </button>
      </div>
      <button class="secondary" data-action="arcade-close">학기 정산으로</button>
    </article>`;
}

function arcadeFooter(result, action, label) {
  return `
    <p class="arcade-status" role="status" tabindex="-1">${result ?? ''}</p>
    <div class="actions">
      ${result == null ? `<button class="primary" data-action="${action}">${label}</button>` : ''}
      <button class="secondary" data-action="arcade-close">${result == null ? '게임 선택으로' : '학기 정산으로'}</button>
    </div>`;
}

function rouletteScreen({ balance, result }) {
  const slices = ROULETTE.map((percent, i) => `
    <span class="wheel-label" style="--label-angle:${i * degreesPerSlot}deg">${percentText(percent)}</span>`).join('');
  const odds = [...new Set(ROULETTE)].sort((a, b) => a - b).map(percent => `
    <li><strong>${percentText(percent)}</strong><span>${deltaText(rouletteCash(balance, percent))}</span>
      <small>${ROULETTE.filter(value => value === percent).length * 100 / ROULETTE.length}% 확률</small></li>`).join('');
  const resultText = result && `결과 ${percentText(result.percent)} · ${deltaText(result.cash)}`;
  return `
    <article class="panel arcade-panel" data-arcade="roulette">
      <p class="context-label">안정성 낮음</p>
      <h1 tabindex="-1">행운 룰렛</h1>
      <p>한 번 돌려 보유 자금 <strong>${cashText(balance)}</strong> 기준으로 정산해요.</p>
      <div class="roulette-layout">
        <div class="roulette-table" aria-hidden="true">
          <span class="wheel-pointer"></span>
          <div class="roulette-wheel" style="--wheel-angle:${result ? rotationFor(result.index) : 0}deg; --wheel-stops:${wheelStops}">${slices}</div>
        </div>
        <ul class="roulette-odds" aria-label="룰렛 칸별 보상과 확률">${odds}</ul>
      </div>
      ${arcadeFooter(resultText, 'roulette-spin', '룰렛 돌리기')}
    </article>`;
}

function clawPerspective(x, depth) {
  return { x: 50 + (x - 50) * (.72 + depth * .0028), y: 58 + depth * .35 };
}

function clawScreen({ balance, prizes, x, result }) {
  const unaffordable = balance < CLAW_ATTEMPT_FEE;
  let feeText = `참가비 ${cashText(CLAW_ATTEMPT_FEE)} · ${unaffordable ? '보유 자금 부족' : '집게를 내릴 때 차감'}`;
  if (result) feeText = result.fee == null ? '' : `사용한 참가비 ${cashText(result.fee)}`;
  const targets = prizes.filter(({ id }) => id !== result?.item).map(prize => {
    const { x: left, y: top } = clawPerspective(prize.x, prize.y);
    return `
      <div class="claw-prize" data-prize="${prize.id}" style="--left:${left}%; --top:${top}%; --depth:${prize.y}; --hit-area:${prize.radius * 2}%">
        <span class="claw-target"></span>${itemSprite(prize.id)}
      </div>`;
  }).join('');
  const prizeList = prizes.map(({ id }) => `
    <li>${itemSprite(id)}<div><strong>${ITEMS[id].name}</strong><small>${ITEMS[id].detail}</small></div><span class="claw-price">${cashText(ITEMS[id].price)}</span></li>`).join('');
  const resultText = result && (result.item
    ? `${ITEMS[result.item].name} 획득! 인벤토리에 넣었어요.`
    : '집게가 상품을 놓쳤어요.');
  const cursor = clawPerspective(x ?? 50, result?.y ?? 50);
  return `
    <article class="panel arcade-panel" data-arcade="claw">
      <p class="context-label">안정성 중간</p>
      <h1 tabindex="-1">인형뽑기</h1>
      <p>바닥의 조준점을 보고 좌우와 앞뒤를 맞춰요. 비싼 상품일수록 중앙을 정확하게 노려야 해요.</p>
      <p class="claw-fee" id="claw-fee">${feeText}</p>
      <div class="claw-machine">
        <div class="claw-marquee" aria-hidden="true"></div>
        <div class="claw-glass" aria-hidden="true">
          <div class="claw-board" style="--aim-x:${cursor.x}%; --aim-y:${cursor.y}%">
            <div class="claw-floor"></div>
            <div class="claw-drop-slot"></div>
            ${targets}
            ${result ? '' : '<div class="claw-aim-marker"></div>'}
            <div class="claw-rig" style="left:${cursor.x}%; height:35%">
              <div class="claw-cable"></div>
              <div class="claw-head"><span class="claw-hub"></span><span class="claw-arm"></span><span class="claw-arm"></span></div>
            </div>
          </div>
        </div>
        <div class="claw-console">
          <span class="claw-stick" aria-hidden="true"></span>
          <span class="claw-chute">${result?.item ? `${itemSprite(result.item)} 수령 완료` : '상품 출구'}</span>
          ${result ? '' : `<button class="claw-action" type="button" data-action="claw-aim" aria-describedby="claw-fee" ${unaffordable ? 'disabled' : ''}>${x == null ? '좌우 위치 고정' : '집게 내리기'}</button>`}
        </div>
        <p class="arcade-status" role="status" tabindex="-1">${resultText ?? ''}</p>
      </div>
      <div class="claw-footer">
        <details class="claw-catalog"><summary>상품 목록</summary><ul class="claw-prizes">${prizeList}</ul></details>
        <button class="secondary" data-action="arcade-close">${result ? '학기 정산으로' : '게임 선택으로'}</button>
      </div>
    </article>`;
}

export function arcadeScreen(session) {
  return session.kind === 'roulette' ? rouletteScreen(session) : clawScreen(session);
}

export function mountClaw(root, session) {
  const board = root.querySelector('.claw-board');
  if (!board || session.result) return;
  const axis = session.x == null ? 'x' : 'y';
  const period = axis === 'x' ? 3400 : 3000;
  const rig = board.querySelector('.claw-rig');
  board.dataset.axis = axis;
  const start = performance.now();
  const move = now => {
    if (!board.isConnected || board.dataset.axis !== axis) return;
    const phase = ((now - start) / period + .5) % 2;
    const position = 8 + 84 * (1 - Math.abs(phase - 1));
    board.dataset.position = position;
    const aim = clawPerspective(session.x ?? position, axis === 'x' ? 50 : position);
    board.style.setProperty('--aim-x', `${aim.x}%`);
    board.style.setProperty('--aim-y', `${aim.y}%`);
    rig.style.left = `${aim.x}%`;
    rig.style.height = `${32 + (axis === 'x' ? 50 : position) * .06}%`;
    requestAnimationFrame(move);
  };
  move(start);
}

async function moveClaw(rig, x, y, duration) {
  const destination = { left: `${x}%`, height: `${y}%` };
  const motion = rig.animate([{ left: rig.style.left, height: rig.style.height }, destination], {
    duration, easing: 'ease-in-out', fill: 'forwards',
  });
  await motion.finished;
  Object.assign(rig.style, destination);
  motion.cancel();
}

export async function animateArcade(panel, session) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (const button of panel.querySelectorAll('button')) button.disabled = true;
  const status = panel.querySelector('.arcade-status');
  if (session.kind === 'roulette') {
    status.textContent = '룰렛이 돌아가는 중…';
    const resultNote = session.result.percent > 0 ? 784 : session.result.percent < 0 ? 220 : 440;
    arcadeSound(reduced ? [[0, resultNote]] : [
      ...[0, .07, .15, .25, .38, .55, .76, 1.01, 1.31, 1.67, 2.08].map(time => [time, 490]),
      [2.35, resultNote],
    ]);
    if (reduced) return;
    const wheel = panel.querySelector('.roulette-wheel');
    await wheel.animate(
      [{ transform: 'rotate(0deg)' }, { transform: `rotate(${rotationFor(session.result.index)}deg)` }],
      { duration: 2350, easing: 'cubic-bezier(.12, .73, .14, 1)', fill: 'forwards' },
    ).finished;
    return;
  }
  const { item, y } = session.result;
  status.textContent = '집게가 내려가는 중…';
  arcadeSound(item ? [[0, 380], [reduced ? .12 : 1.9, 660]] : [[0, 380], [.69, 210]]);
  const board = panel.querySelector('.claw-board');
  board.dataset.axis = 'done';
  if (reduced) return;
  const rig = board.querySelector('.claw-rig');
  const prize = item ? board.querySelector(`[data-prize="${item}"]`) : null;
  const target = item ? session.prizes.find(prize => prize.id === item) : { x: session.x, y };
  const grip = clawPerspective(target.x, target.y);
  await moveClaw(rig, grip.x, grip.y, 520);
  rig.dataset.closed = 'true';
  await rig.animate([{ opacity: 1 }, { opacity: 1 }], 160).finished;
  if (!board.isConnected) return;
  if (prize) {
    const size = prize.getBoundingClientRect().width;
    rig.append(prize);
    prize.style.width = `${size}px`;
    status.textContent = '상품을 집어 올렸어요!';
  }
  await moveClaw(rig, grip.x, 32, 440);
  if (!prize || !board.isConnected) return;
  await moveClaw(rig, 13, 32, 470);
  rig.dataset.closed = 'false';
  await prize.animate([{ top: '100%', opacity: 1 }, { top: '275%', opacity: .25, scale: '.68' }], {
    duration: 350, easing: 'ease-in', fill: 'forwards',
  }).finished;
}

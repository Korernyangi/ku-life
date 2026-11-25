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

const gripMin = 35;
const gripMax = 75;
const shelfHeight = 82;
const railHeight = 23;

function clawScreen({ prizes, x, result }) {
  const feeText = result ? `사용한 참가비 ${cashText(result.fee ?? CLAW_ATTEMPT_FEE)}`
    : `참가비 ${cashText(CLAW_ATTEMPT_FEE)} · 집게를 내릴 때 차감`;
  const targets = prizes.filter(({ id }) => id !== result?.item).map(prize => `
    <div class="claw-prize" data-prize="${prize.id}" style="left:${prize.x}%">${itemSprite(prize.id)}</div>`).join('');
  const prizeList = prizes.map(({ id }) => `
    <li>${itemSprite(id)}<div><strong>${ITEMS[id].name}</strong><small>${ITEMS[id].detail}</small></div><span class="claw-price">${cashText(ITEMS[id].price)}</span></li>`).join('');
  const resultText = result && (result.item
    ? `${ITEMS[result.item].name} 획득! 인벤토리에 넣었어요.`
    : result.dropped ? '힘이 초록 구간을 벗어나 상품이 떨어졌어요.' : '집게가 상품을 놓쳤어요.');
  return `
    <article class="panel arcade-panel" data-arcade="claw">
      <p class="context-label">안정성 중간</p>
      <h1 tabindex="-1">인형뽑기</h1>
      <p>좌우로 움직이는 집게를 상품 위에서 내려요. 들어 올릴 때 버튼을 눌렀다 떼며 힘을 초록 구간에 유지하세요.</p>
      <p class="claw-fee" id="claw-fee">${feeText}</p>
      <div class="claw-machine">
        <div class="claw-marquee" aria-hidden="true"></div>
        <div class="claw-glass" aria-hidden="true">
          <div class="claw-board" style="--aim-x:${x ?? 50}%">
            <div class="claw-floor"></div>
            <div class="claw-drop-slot"></div>
            ${targets}
            ${result ? '' : '<div class="claw-aim-marker"></div>'}
            <div class="claw-rig" style="left:${x ?? 50}%; height:${railHeight}%">
              <div class="claw-cable"></div>
              <div class="claw-head"><span class="claw-hub"></span><span class="claw-arm"></span><span class="claw-arm"></span></div>
            </div>
          </div>
          <div class="claw-gauge" style="--min:${gripMin}%; --max:${gripMax}%" hidden>
            <span class="claw-gauge-band"></span><span class="claw-gauge-level"></span>
          </div>
        </div>
        <div class="claw-console">
          <span class="claw-stick" aria-hidden="true"></span>
          <span class="claw-chute">${result?.item ? `${itemSprite(result.item)} 수령 완료` : '상품 출구'}</span>
          ${result ? '' : '<button class="claw-action" type="button" data-action="claw-aim" aria-describedby="claw-fee">집게 내리기</button>'}
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
  const rig = board.querySelector('.claw-rig');
  const start = performance.now();
  const move = now => {
    if (!board.isConnected || board.dataset.dropped) return;
    const phase = ((now - start) / 2700 + .5) % 2;
    const position = 8 + 84 * (1 - Math.abs(phase - 1));
    board.dataset.position = position;
    board.style.setProperty('--aim-x', `${position}%`);
    rig.style.left = `${position}%`;
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

export async function animateRoulette(panel, session) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (const button of panel.querySelectorAll('button')) button.disabled = true;
  const status = panel.querySelector('.arcade-status');
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
}

function liftWithGrip(panel, rig, button, x) {
  const gauge = panel.querySelector('.claw-gauge');
  const level = gauge.querySelector('.claw-gauge-level');
  const controls = new AbortController();
  const { signal } = controls;
  let pointer = null;
  let keyHeld = false;
  let force = 55;
  let elapsed = 0;

  gauge.hidden = false;
  button.removeAttribute('data-action');
  button.textContent = '눌러 힘 조절';
  button.disabled = false;
  button.focus({ preventScroll: true });
  button.addEventListener('pointerdown', event => {
    if (event.button !== 0 || pointer !== null) return;
    event.preventDefault();
    pointer = event.pointerId;
    button.setPointerCapture(pointer);
  }, { signal });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    button.addEventListener(type, event => {
      if (pointer === event.pointerId) pointer = null;
    }, { signal });
  }
  for (const type of ['keydown', 'keyup']) {
    button.addEventListener(type, event => {
      if (event.code !== 'Space' && event.code !== 'Enter') return;
      event.preventDefault();
      keyHeld = type === 'keydown';
    }, { signal });
  }
  const release = () => { pointer = null; keyHeld = false; };
  button.addEventListener('blur', release, { signal });
  window.addEventListener('blur', release, { signal });
  document.addEventListener('visibilitychange', release, { signal });

  return new Promise(resolve => {
    let previous = performance.now();
    const frame = now => {
      const dt = Math.min(0.05, Math.max(0, (now - previous) / 1000));
      previous = now;
      if (!document.hidden) {
        elapsed += dt;
        const held = pointer !== null || keyHeld;
        button.classList.toggle('is-held', held);
        force += (held ? 37 : -29) * dt;
      }
      level.style.bottom = `${force}%`;
      rig.style.left = `${x}%`;
      rig.style.height = `${shelfHeight - (shelfHeight - railHeight) * Math.min(elapsed / 2.45, 1)}%`;
      const safe = force >= gripMin && force <= gripMax;
      if (panel.isConnected && safe && elapsed < 2.45) {
        requestAnimationFrame(frame);
        return;
      }
      if (pointer !== null && button.hasPointerCapture(pointer)) button.releasePointerCapture(pointer);
      controls.abort();
      button.disabled = true;
      button.classList.remove('is-held');
      gauge.hidden = true;
      resolve(panel.isConnected && safe);
    };
    frame(previous);
  });
}

async function dropPrize(board, prize, x, from, to, duration) {
  board.append(prize);
  prize.style.left = `${x}%`;
  prize.style.top = `${to}%`;
  await prize.animate([
    { top: `${from}%`, rotate: '-9deg' },
    { top: `${to}%`, rotate: '12deg', offset: .83 },
    { top: `${to - 2}%`, rotate: '-5deg', offset: .92 },
    { top: `${to}%`, rotate: '0deg' },
  ], { duration, easing: 'ease-in' }).finished;
}

export async function playClaw(panel, session, button) {
  const board = panel.querySelector('.claw-board');
  const rig = board.querySelector('.claw-rig');
  const status = panel.querySelector('.arcade-status');
  const target = panel.querySelector(`[data-prize="${session.drop.item}"]`);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  board.dataset.dropped = 'true';
  button.disabled = true;
  status.textContent = '집게가 내려가는 중…';
  arcadeSound([[0, 380]]);
  await moveClaw(rig, session.x, shelfHeight, reduced ? 0 : 530);
  rig.dataset.closed = 'true';
  if (!target) {
    status.textContent = '집게 아래에 상품이 없어요.';
    await moveClaw(rig, session.x, railHeight, reduced ? 0 : 440);
    return false;
  }

  const x = session.prizes.find(prize => prize.id === session.drop.item).x;
  rig.style.left = `${x}%`;
  target.style.width = `${target.getBoundingClientRect().width}px`;
  rig.append(target);
  status.textContent = '버튼을 눌렀다 떼며 초록 구간을 유지하세요.';
  const held = await liftWithGrip(panel, rig, button, x);
  if (!panel.isConnected) return false;
  if (!held) {
    rig.dataset.closed = 'false';
    status.textContent = '힘이 초록 구간을 벗어나 상품이 떨어졌어요.';
    arcadeSound([[0, 220]]);
    await dropPrize(board, target, x, parseFloat(rig.style.height), shelfHeight, reduced ? 0 : 440);
    return false;
  }

  await moveClaw(rig, 13, railHeight, reduced ? 0 : 440);
  rig.dataset.closed = 'false';
  arcadeSound([[0, 660], [.1, 880]]);
  await dropPrize(board, target, 13, railHeight, 106, reduced ? 0 : 430);
  return true;
}

import { drawPixelStudent } from './pixel-scene.js';

const GAMES = [
  { icon: 'F', title: 'F학점 피하기', description: '좌우로 움직여 25초 동안 낙제 성적표를 피해요.', play: dodgeGrades },
  { icon: 'AI', title: '교수님 몰래 AI 부정행위 하기', description: '교수님이 칠판을 볼 때만 버튼을 눌러 과제를 완성해요.', play: classroom },
  { icon: '+', title: '안경 강화하기', description: '캠퍼스 상점에서 안경을 강화해 최강 AI 안경에 도전해요.', play: upgradeGlasses },
];

const frame = '<canvas width="320" height="160" aria-hidden="true"></canvas>';
const rect = (ctx, color, x, y, w, h) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
};

export class MiniGames {
  constructor(root, getGameState) {
    this.getGameState = getGameState;
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.className = 'arcade-launch';
    this.button.innerHTML = '<span aria-hidden="true">🎮</span> 미니게임';
    this.launcher = document.createElement('div');
    this.launcher.id = 'arcade-launcher';
    this.launcher.append(this.button);
    root.append(this.launcher);

    this.dialog = document.createElement('dialog');
    this.dialog.className = 'arcade';
    this.dialog.setAttribute('aria-labelledby', 'arcade-title');
    this.dialog.innerHTML = `
      <header class="arcade-header">
        <h2 id="arcade-title">미니게임</h2>
        <button type="button" class="arcade-close">닫기</button>
      </header>
      <div class="arcade-body"></div>
    `;
    root.append(this.dialog);
    this.body = this.dialog.querySelector('.arcade-body');
    this.heading = this.dialog.querySelector('h2');

    this.button.onclick = () => {
      this.showMenu();
      this.dialog.showModal();
      this.button.dispatchEvent(new Event('arcade-open', { bubbles: true }));
    };
    this.dialog.querySelector('.arcade-close').onclick = () => this.dialog.close();
    this.dialog.addEventListener('close', () => this.round?.abort());
  }

  setActive(active) {
    this.launcher.hidden = !active;
    if (!active && this.dialog.open) this.dialog.close();
  }

  showMenu() {
    this.round?.abort();
    this.heading.textContent = '미니게임';
    this.body.innerHTML = `<div class="arcade-list">${GAMES.map(game => `
      <button type="button" class="arcade-card">
        <span class="arcade-icon" aria-hidden="true">${game.icon}</span>
        <strong>${game.title}</strong><span>${game.description}</span>
      </button>
    `).join('')}</div>`;
    this.body.querySelectorAll('.arcade-card').forEach((button, i) => {
      button.onclick = () => this.showGame(GAMES[i]);
    });
    if (this.dialog.open) this.body.querySelector('button').focus();
  }

  showGame(game) {
    this.round?.abort();
    this.round = new AbortController();
    this.heading.textContent = game.title;
    this.body.innerHTML = `
      <p class="arcade-help">${game.description}</p>
      <div class="arcade-play"></div>
      <div class="arcade-footer">
        <button type="button" class="arcade-back">목록</button>
        <button type="button" class="arcade-retry">다시 시작</button>
      </div>
    `;
    this.body.querySelector('.arcade-back').onclick = () => this.showMenu();
    this.body.querySelector('.arcade-retry').onclick = () => this.showGame(game);
    game.play(this.body.querySelector('.arcade-play'), this.round.signal, this.getGameState());
    this.body.querySelector('.arcade-primary').focus();
  }
}

function runFrames(signal, tick) {
  let previous;
  let id;
  const update = (now) => {
    const delta = Math.min((now - (previous ?? now)) / 1000, 0.05);
    previous = now;
    if (tick(delta)) id = requestAnimationFrame(update);
  };
  id = requestAnimationFrame(update);
  signal.addEventListener('abort', () => cancelAnimationFrame(id), { once: true });
}

function dodgeGrades(host, signal, student) {
  host.innerHTML = `
    <p class="arcade-status" role="status">시작을 누른 뒤 ← → 또는 아래 버튼으로 이동하세요.</p>
    ${frame}
    <div class="arcade-actions"><button type="button" data-step="-1" aria-label="왼쪽">◀</button>
    <button type="button" class="arcade-primary">시작</button>
    <button type="button" data-step="1" aria-label="오른쪽">▶</button></div>
  `;
  const ctx = host.querySelector('canvas').getContext('2d');
  const status = host.querySelector('.arcade-status');
  const start = host.querySelector('.arcade-primary');
  const steps = host.querySelectorAll('[data-step]');
  const grades = [];
  let lane = 2;
  let time = 0;
  let nextDrop = 0.35;
  let dodged = 0;
  let running = false;

  const draw = () => {
    rect(ctx, '#293347', 0, 0, 320, 160);
    for (let i = 0; i < 5; i++) {
      rect(ctx, i % 2 ? '#38475a' : '#354154', i * 64, 0, 63, 145);
      rect(ctx, '#ad875d', i * 64 + 14, 143, 36, 3);
    }
    for (const grade of grades) {
      const x = grade.lane * 64 + 23;
      const y = Math.floor(grade.y);
      rect(ctx, '#ffdfa4', x, y, 18, 17);
      rect(ctx, '#902b48', x + 5, y + 3, 3, 11);
      rect(ctx, '#902b48', x + 7, y + 3, 7, 2);
      rect(ctx, '#902b48', x + 7, y + 7, 5, 2);
    }
    drawPixelStudent(ctx, student, lane * 64 + 21, 114);
  };

  const move = direction => {
    if (!running) return;
    lane = Math.max(0, Math.min(4, lane + direction));
    draw();
  };
  for (const button of steps) button.onclick = () => move(Number(button.dataset.step));
  host.closest('dialog').addEventListener('keydown', event => {
    if (!running || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  }, { signal });
  const end = message => {
    running = false;
    status.textContent = `${message} 피한 성적표 ${dodged}장`;
    return false;
  };
  draw();
  start.onclick = () => {
    running = true;
    start.disabled = true;
    steps[0].focus();
    runFrames(signal, delta => {
      time += delta;
      if (time >= nextDrop) {
        grades.push({ lane: Math.floor(Math.random() * 5), y: -17 });
        nextDrop += Math.max(0.46, 0.95 - time / 52);
      }
      for (const grade of grades) grade.y += delta * (72 + time * 2.6);
      while (grades[0]?.y >= 160) {
        grades.shift();
        dodged++;
      }
      draw();
      if (grades.some(grade => grade.lane === lane && grade.y + 17 > 116 && grade.y < 149)) {
        return end('F학점에 걸렸어요!');
      }
      if (time >= 25) return end('학기 생존 성공!');
      const message = `남은 시간 ${Math.ceil(25 - time)}초 · 피한 성적표 ${dodged}장`;
      if (status.textContent !== message) status.textContent = message;
      return true;
    });
  };
}

function classroom(host, signal, student) {
  host.innerHTML = `
    <p class="arcade-status" role="status">시작하면 35초 안에 과제 진행률을 100%로 채우세요.</p>
    ${frame}
    <label class="arcade-progress">과제 진행률 <progress max="100" value="0"></progress></label>
    <div class="arcade-actions">
      <button type="button" class="arcade-primary">시작</button>
      <button type="button" class="arcade-hold" disabled>AI 사용 · 누르고 있기</button>
    </div>
  `;
  const ctx = host.querySelector('canvas').getContext('2d');
  const status = host.querySelector('.arcade-status');
  const progress = host.querySelector('progress');
  const start = host.querySelector('.arcade-primary');
  const action = host.querySelector('.arcade-hold');
  let running = false;
  let pointer = null;
  let keyboard = false;
  let elapsed = 0;
  let work = 0;
  let phase = 'board';
  let phaseTime = 2.5;
  const stop = () => { pointer = null; keyboard = false; };
  window.addEventListener('blur', stop, { signal });
  document.addEventListener('visibilitychange', stop, { signal });
  action.onpointerdown = event => {
    if (!running || !event.isPrimary || event.button !== 0) return;
    pointer = event.pointerId;
    action.setPointerCapture(pointer);
  };
  action.onlostpointercapture = () => { pointer = null; };
  action.onkeydown = event => {
    if (running && event.code === 'Space') {
      event.preventDefault();
      keyboard = true;
    }
  };
  action.onkeyup = event => {
    if (event.code === 'Space') {
      event.preventDefault();
      keyboard = false;
    }
  };
  action.onblur = stop;
  const draw = held => {
    rect(ctx, '#c6a884', 0, 0, 320, 160);
    rect(ctx, '#51404c', 0, 103, 320, 57);
    rect(ctx, '#775552', 31, 12, 258, 70);
    rect(ctx, '#33574f', 37, 17, 246, 60);
    for (const y of [29, 40, 51]) rect(ctx, '#9db890', 54, y, 87-y, 2);
    rect(ctx, '#382d3d', 150, 44, 20, 47);
    rect(ctx, '#e0ac86', 152, 49, 16, 13);
    rect(ctx, '#674257', 147, 65, 26, 23);
    if (phase !== 'board') {
      rect(ctx, '#2e2636', 155, 53, 3, 2);
      rect(ctx, '#2e2636', 163, 53, 3, 2);
      rect(ctx, phase === 'watch' ? '#f57873' : '#f8d37e', 157, 32, 6, 8);
    }
    for (const x of [21, 118, 215]) {
      rect(ctx, '#b27c55', x, 124, 84, 10);
      rect(ctx, '#382b3b', x + 13, 134, 6, 18);
      rect(ctx, '#382b3b', x + 64, 134, 6, 18);
    }
    drawPixelStudent(ctx, student, 149, 87, 1, { bob: held ? 1 : 0 });
    rect(ctx, '#29293b', 145, 103, 29, 18);
    rect(ctx, held ? '#90ded2' : '#696d8c', 148, 106, 23, 12);
    rect(ctx, '#d49d70', 141, 121, 37, 3);
  };
  const end = message => {
    running = false;
    stop();
    action.disabled = true;
    status.textContent = message;
    draw(false);
    return false;
  };
  draw(false);
  start.onclick = () => {
    running = true;
    start.disabled = true;
    action.disabled = false;
    action.focus();
    runFrames(signal, delta => {
      elapsed += delta;
      phaseTime -= delta;
      if (phaseTime <= 0) {
        if (phase === 'board') { phase = 'warning'; phaseTime = 0.85; }
        else if (phase === 'warning') { phase = 'watch'; phaseTime = 1.3; }
        else { phase = 'board'; phaseTime = 1.8 + Math.random() * 1.5; }
      }
      const held = pointer !== null || keyboard;
      if (held && phase === 'watch') return end('교수님에게 들켰어요!');
      if (held && phase === 'board') work = Math.min(100, work + delta * 13);
      progress.value = work;
      if (work >= 100) return end('과제 완성! 게임 성공.');
      if (elapsed >= 35) return end('시간 초과! 다시 도전해 보세요.');
      const cue = { board: '칠판을 보는 중', warning: '곧 뒤돌아봐요. 버튼에서 손을 떼세요!', watch: '교수님이 지켜보는 중' }[phase];
      const message = `${cue} · ${Math.ceil(35 - elapsed)}초`;
      if (message !== status.textContent) status.textContent = message;
      draw(held);
      return true;
    });
  };
}

const GLASSES = [
  ['뿔테 안경', '#715954', 1],
  ['은테 안경', '#9ca9b1', 0.9],
  ['크림슨 안경', '#a43b58', 0.78],
  ['연구실 고글', '#d19a54', 0.65],
  ['스마트 안경', '#6699b7', 0.48],
  ['AI 안경', '#84e0cb', 0],
];

const TIMING_BONUS = 0.15;
const TARGET_START = 0.42;
const TARGET_END = 0.58;
const TIMING_LIMIT = 3.6;

function upgradeGlasses(host, signal, student) {
  host.innerHTML = `
    <p class="arcade-status" role="status"></p>
    ${frame}
    <p class="arcade-upgrade-info"></p>
    <div class="arcade-timing" hidden>
      <div class="arcade-timing-track" aria-hidden="true">
        <span class="arcade-timing-target"></span><span class="arcade-timing-marker"></span>
      </div>
    </div>
    <div class="arcade-actions">
      <button type="button" class="arcade-primary">강화하기</button>
      <button type="button" class="arcade-earn">렌즈 닦기 · 12코인</button>
    </div>
  `;
  const status = host.querySelector('.arcade-status');
  const detail = host.querySelector('.arcade-upgrade-info');
  const upgrade = host.querySelector('.arcade-primary');
  const earn = host.querySelector('.arcade-earn');
  const timingPanel = host.querySelector('.arcade-timing');
  const track = timingPanel.querySelector('.arcade-timing-track');
  const marker = timingPanel.querySelector('.arcade-timing-marker');
  track.style.setProperty('--target-start', `${TARGET_START * 100}%`);
  track.style.setProperty('--target-width', `${(TARGET_END - TARGET_START) * 100}%`);
  const ctx = host.querySelector('canvas').getContext('2d');
  let level = 0;
  let coins = 48;
  let failures = 0;
  let timing = null;
  const getChance = () => Math.min(1, GLASSES[level][2] + failures * 0.14);
  const getCost = () => 12 + level * 6;

  const refresh = message => {
    const [name, color] = GLASSES[level];
    const cost = getCost();
    const chance = getChance();
    const complete = level === GLASSES.length - 1;
    rect(ctx, '#3d3044', 0, 0, 320, 160);
    for (let i = 0; i < 8; i++) rect(ctx, '#a66d62', 16 + i * 40, 20 + (i % 3) * 13, 2, 2);
    rect(ctx, '#674351', 92, 109, 212, 22);
    rect(ctx, '#cb9563', 87, 106, 222, 6);
    drawPixelStudent(ctx, student, 18, 59, 2);
    for (const x of [113, 209]) {
      rect(ctx, color, x, 52, 68, 43);
      rect(ctx, '#403749', x + 7, 59, 54, 29);
      rect(ctx, complete ? '#438f91' : '#666277', x + 11, 62, 45, 22);
      rect(ctx, '#f5d9aa', x + 15, 66, 17, 3);
    }
    rect(ctx, color, 178, 61, 34, 6);
    if (complete) {
      for (const x of [95, 294]) {
        rect(ctx, '#a9ffe0', x, 63, 3, 12);
        rect(ctx, '#a9ffe0', x - 4, 67, 11, 3);
      }
    }
    status.textContent = message;
    detail.textContent = complete ? `최강 AI 안경 완성! · 보유 ${coins}코인`
      : `+${level} ${name} · 보유 ${coins}코인 · 비용 ${cost}코인 · 성공률 ${Math.round(chance * 100)}%`;
    upgrade.disabled = complete || coins < cost;
    earn.disabled = complete;
  };
  earn.onclick = () => {
    coins += 12;
    refresh('렌즈를 닦고 12코인을 받았어요.');
  };
  const finishTiming = timedOut => {
    const hit = !timedOut && timing.position >= TARGET_START && timing.position <= TARGET_END;
    const chance = Math.min(1, getChance() + (hit ? TIMING_BONUS : 0));
    const timingResult = hit ? '타이밍 성공!' : timedOut ? '타이밍 시간 초과.' : '목표 구간을 놓쳤어요.';
    timing = null;
    timingPanel.hidden = true;
    upgrade.textContent = '강화하기';
    coins -= getCost();
    const result = `${timingResult} 적용 성공률 ${Math.round(chance * 100)}%.`;
    if (Math.random() < chance) {
      level++;
      failures = 0;
      refresh(`${result} 강화 성공! ${GLASSES[level][0]} 획득.`);
    } else {
      failures++;
      refresh(`${result} 강화 실패. 다음 시도의 기본 성공률이 올라가요.`);
    }
  };

  upgrade.onkeydown = event => {
    if (event.repeat && (event.key === 'Enter' || event.code === 'Space')) event.preventDefault();
  };
  upgrade.onclick = () => {
    if (timing) {
      finishTiming(false);
      return;
    }
    const attempt = { elapsed: 0, position: 0 };
    timing = attempt;
    timingPanel.hidden = false;
    marker.style.left = '0%';
    upgrade.textContent = '멈추기';
    earn.disabled = true;
    status.textContent = '표시가 초록 구간에 들어오면 멈추세요. 성공률 +15%p (최대 100%)';
    runFrames(signal, delta => {
      if (timing !== attempt) return false;
      attempt.elapsed += delta;
      if (attempt.elapsed >= TIMING_LIMIT) {
        finishTiming(true);
        return false;
      }
      const phase = attempt.elapsed * (1.3 + level * 0.12) % 2;
      attempt.position = 1 - Math.abs(1 - phase);
      marker.style.left = `${attempt.position * 100}%`;
      return true;
    });
  };
  refresh('안경을 한 단계씩 강화하세요.');
}

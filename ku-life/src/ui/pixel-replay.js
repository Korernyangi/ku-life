import { drawPixelBackground } from './pixel-backgrounds.js';
import { drawPixelStudent } from './pixel-student.js';

const frameTime = 80;
const width = 320;
const height = 180;
const classmate = { hairStyle: 'bob', hairColor: '#392a39', skinTone: '#d9a889', outfitColor: '#435e73', accessory: 'hairclip' };

function pixel(context, color, x, y, w, h) {
  context.fillStyle = color;
  context.fillRect(Math.round(x), Math.round(y), w, h);
}

function drawActor(context, appearance, x, y, scale, step) {
  pixel(context, '#291f3280', x + 1 * scale, y + 36 * scale, 22 * scale, 2 * scale);
  pixel(context, '#393044', x + 7 * scale, y + 28 * scale, 4 * scale, (8 - step) * scale);
  pixel(context, '#393044', x + 13 * scale, y + 28 * scale, 4 * scale, (8 + step) * scale);
  pixel(context, '#302532', x + 6 * scale, y + (35 - step) * scale, 6 * scale, 2 * scale);
  pixel(context, '#302532', x + 12 * scale, y + (35 + step) * scale, 6 * scale, 2 * scale);
  drawPixelStudent(context, { appearance }, Math.round(x), Math.round(y), scale);
}

function drawScene(context, backdrop, memory, appearance, elapsed) {
  const drift = Math.round(Math.min(1, elapsed / memory.duration) * 6);
  context.drawImage(backdrop, -drift, -2, width + 6, height + 4);
  const { scene, together } = memory;
  const phase = elapsed / 480;
  const bounce = Math.round(Math.sin(phase * Math.PI * 2) * 2);
  const arrival = Math.min(1, elapsed / 1250);
  const seated = scene === 'study' || scene === 'exam';
  const field = scene === 'ipselenti' || scene === 'koyeonjeon';
  const x = seated ? 116 : Math.round((together ? 96 : 125) - (1 - arrival) * 26);
  const y = (field ? 62 : 65) + bounce;
  const step = arrival < 1 ? Math.sign(bounce) : 0;

  if (field) {
    for (let i = 0; i < 8; i++) {
      pixel(context, i % 2 ? '#f0ca82' : '#d4658c', 32 + i * 36, 38 + (i * 11 + phase * 5) % 40, 3, 2);
    }
    drawActor(context, classmate, 37, 90 - bounce, 2, 0);
    drawActor(context, classmate, 235, 90 + bounce, 2, 0);
  }
  if (together) drawActor(context, classmate, 167, y - 5 - bounce, 2, 0);
  drawActor(context, appearance, x, y, 3, step);

  if (seated) {
    pixel(context, '#573b42', 96, 130, 139, 31);
    pixel(context, '#b87f63', 94, 130, 143, 6);
    pixel(context, '#f4e6bc', 128, 126, 34, 7);
    pixel(context, '#b4a189', 145, 126, 1, 7);
    pixel(context, '#704854', 151 + bounce, 129, 11, 1);
  }
  if (scene === 'parttime') {
    pixel(context, '#563a4e', 172, 132, 101, 30);
    pixel(context, '#d09972', 168, 131, 110, 5);
    pixel(context, '#f1d4ae', 205, 118, 12, 14);
    pixel(context, '#ae6764', 205, 120, 12, 3);
    pixel(context, '#f2dbba', 217, 121, 4, 7);
    pixel(context, '#eac5b7', 209 + bounce, 111 - bounce, 2, 3);
  }
  if (memory.prop) drawFinaleProp(context, memory.prop, bounce);
}

function drawBackdrop(context, shot) {
  if (shot.scene !== 'home') {
    drawPixelBackground(context, shot.scene, shot.semester);
    return;
  }
  pixel(context, '#4d415e', 0, 0, width, height);
  pixel(context, '#6a4c5a', 0, 132, width, 48);
  pixel(context, '#79616e', 0, 128, width, 4);
  pixel(context, '#b18c86', 37, 22, 80, 63);
  pixel(context, '#29293f', 42, 27, 70, 53);
  pixel(context, '#484866', 42, 64, 70, 16);
  pixel(context, '#e0c49d', 89, 33, 12, 10);
  pixel(context, '#aaa3ba', 61, 42, 2, 2);
  pixel(context, '#a4a0be', 71, 55, 1, 2);
  pixel(context, '#a18383', 75, 27, 3, 53);
  pixel(context, '#604b55', 263, 61, 18, 65);
  pixel(context, '#d7a474', 250, 54, 44, 15);
  pixel(context, '#f4cc91', 246, 66, 52, 4);
}

function drawFinaleProp(context, prop, bounce) {
  const rect = (color, x, y, w, h) => pixel(context, color, x, y, w, h);
  switch (prop) {
    case 'crib':
      rect('#704653', 145, 132, 103, 36);
      rect('#c18775', 139, 132, 116, 5);
      rect('#d6a09a', 151, 136, 91, 17);
      rect('#eeb994', 184, 138 - bounce, 15, 12);
      rect('#a7a5c1', 194, 142, 30, 12);
      for (let x = 151; x <= 241; x += 12) rect('#a97267', x, 149, 3, 18);
      rect('#c18775', 145, 163, 103, 4);
      break;
    case 'badge':
      rect('#d4a35d', 208, 112 - bounce, 10, 18);
      rect('#514053', 194, 126 - bounce, 41, 25);
      rect('#f1e3c8', 196, 128 - bounce, 37, 21);
      rect('#916277', 200, 132 - bounce, 9, 12);
      rect('#87919d', 213, 133 - bounce, 15, 2);
      rect('#aa8883', 213, 139 - bounce, 13, 2);
      break;
    case 'claw':
      rect('#593e64', 218, 49, 62, 101);
      rect('#968cae', 222, 54, 54, 64);
      rect('#b9acc8', 226, 57, 46, 57);
      rect('#745671', 236, 59, 4, 19 + bounce);
      rect('#4c354f', 231, 77 + bounce, 17, 4);
      rect('#d6a17d', 242, 99, 19, 14);
      rect('#d6a17d', 240, 96, 6, 6);
      rect('#d6a17d', 258, 96, 6, 6);
      rect('#6e4b52', 245, 103, 3, 2);
      rect('#6e4b52', 256, 103, 3, 2);
      break;
    case 'cup':
      rect('#ecddcc', 239, 119, 13, 13);
      rect('#ad7168', 239, 120, 13, 4);
      rect('#ead6c0', 243 + bounce, 112 - bounce, 2, 6);
      break;
    case 'keys':
      rect('#efd48b', 224, 126, 10, 6);
      rect('#ba8460', 234, 127, 21, 4);
      rect('#efd48b', 244, 130, 4, 4);
      rect('#efd48b', 251, 129, 4, 5);
      break;
    case 'laptop':
      rect('#342d4c', 188, 105, 58, 32);
      rect('#8db1af', 191, 108, 52, 25);
      rect('#5e536d', 179, 135, 73, 5);
      rect('#efe6c7', 222, 115 - bounce, 16, 8);
      break;
    default: {
      rect('#493548', 193, 130, 49, 19);
      rect('#e9dbb9', 196, 125 - bounce, 43, 20);
      rect('#a07f88', 201, 130 - bounce, 17, 2);
      rect('#afa19d', 201, 135 - bounce, 16, 2);
      if (prop === 'newspaper') {
        rect('#927562', 221, 129 - bounce, 13, 12);
        rect('#d3a478', 224, 132 - bounce, 8, 6);
      }
      if (prop === 'ticket') rect('#974962', 230, 127 - bounce, 3, 14);
    }
  }
}

export function mountEndingFilm(screen, shots, appearance, termLabel, onFinish) {
  const canvas = screen.querySelector('canvas');
  const context = canvas.getContext('2d');
  const backdrop = document.createElement('canvas');
  backdrop.width = width;
  backdrop.height = height;
  const background = backdrop.getContext('2d');
  const caption = screen.querySelector('[data-film-caption]');
  const time = screen.querySelector('[data-film-time]');
  const title = screen.querySelector('[data-film-title]');
  const line = screen.querySelector('[data-film-line]');
  const progress = screen.querySelector('progress');
  const toggle = screen.querySelector('[data-film-toggle]');
  const skip = screen.querySelector('[data-film-skip]');
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  let index = 0;
  let elapsed = 0;
  let completedTime = 0;
  let playing = !reduced;
  let interval = null;
  let disposed = false;
  progress.max = shots.reduce((sum, shot) => sum + shot.duration, 0);

  function paint() {
    if (!context || !background) return;
    const shot = shots[index];
    drawScene(context, backdrop, shot, appearance, reduced ? 1250 : elapsed);
    if (!reduced) {
      const fade = 1 - Math.min(1, elapsed / 180, (shot.duration - elapsed) / 200);
      if (fade > 0) pixel(context, `rgba(22, 15, 26, ${fade})`, 0, 0, width, height);
    }
  }

  function showShot() {
    const shot = shots[index];
    elapsed = 0;
    time.textContent = shot.finale ? '그 후' : termLabel(shot.semester);
    title.textContent = shot.title;
    line.textContent = shot.choice;
    screen.classList.toggle('cinema-finale', Boolean(shot.finale));
    progress.value = completedTime;
    if (background) drawBackdrop(background, shot);
    paint();
  }

  function syncPlayback() {
    if (interval !== null) window.clearInterval(interval);
    interval = !disposed && playing && !document.hidden ? window.setInterval(advanceFrame, frameTime) : null;
  }

  function advanceFrame() {
    elapsed += frameTime;
    const shot = shots[index];
    if (elapsed >= shot.duration) {
      completedTime += shot.duration;
      index++;
      if (index === shots.length) finish();
      else showShot();
      return;
    }
    progress.value = completedTime + elapsed;
    if (!reduced) paint();
  }

  function updateControls() {
    toggle.textContent = playing ? '일시정지' : '재생';
    caption.setAttribute('aria-live', playing ? 'off' : 'polite');
  }

  function dispose() {
    disposed = true;
    syncPlayback();
    document.removeEventListener('visibilitychange', syncPlayback);
  }

  function finish() {
    if (disposed) return;
    dispose();
    onFinish();
  }

  toggle.addEventListener('click', () => {
    playing = !playing;
    updateControls();
    syncPlayback();
  });
  skip.addEventListener('click', finish);
  screen.addEventListener('keydown', event => {
    if (event.key === 'Escape') finish();
  });
  document.addEventListener('visibilitychange', syncPlayback);
  updateControls();
  showShot();
  syncPlayback();
  return dispose;
}

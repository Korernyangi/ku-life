import { drawPixelBackground } from './pixel-backgrounds.js';
import { drawPixelStudent } from './pixel-student.js';

const frameTime = 100;
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
  context.drawImage(backdrop, 0, 0);
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
}

export function mountPixelReplay(section, memories, appearance, termLabel) {
  const caption = section.querySelector('[data-replay-caption]');
  const term = section.querySelector('[data-replay-term]');
  const count = section.querySelector('[data-replay-count]');
  const title = section.querySelector('[data-replay-title]');
  const choice = section.querySelector('[data-replay-choice]');
  const result = section.querySelector('[data-replay-result]');
  const turningPoint = section.querySelector('[data-replay-turning-point]');
  const previous = section.querySelector('[data-replay-previous]');
  const next = section.querySelector('[data-replay-next]');
  const toggle = section.querySelector('[data-replay-toggle]');
  const canvas = section.querySelector('canvas');
  const context = canvas.getContext('2d');
  const backdrop = document.createElement('canvas');
  backdrop.width = width;
  backdrop.height = height;
  const background = backdrop.getContext('2d');
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const Observer = window.IntersectionObserver;

  let index = 0;
  let elapsed = 0;
  let duration = 0;
  let finished = false;
  let playing = !reduced;
  let visible = !Observer;
  let interval = null;
  let disposed = false;

  function paint() {
    if (context && background) drawScene(context, backdrop, memories[index], appearance, reduced ? 1250 : elapsed);
  }

  function showControls() {
    caption.setAttribute('aria-live', playing ? 'off' : 'polite');
    previous.disabled = index === 0;
    next.disabled = index === memories.length - 1;
    toggle.textContent = playing ? '일시정지' : finished ? '처음부터 재생' : '재생';
  }

  function showMemory(position) {
    index = position;
    elapsed = 0;
    const memory = memories[index];
    duration = Math.max(4500, 2500 + (memory.choice.length + memory.result.length) * 28);
    showControls();
    term.textContent = termLabel(memory.semester);
    count.textContent = `${index + 1} / ${memories.length}`;
    title.textContent = memory.title;
    choice.textContent = memory.choice;
    result.textContent = memory.result;
    result.hidden = !memory.result;
    turningPoint.hidden = !memory.turningPoint;

    if (background) drawPixelBackground(background, memory.scene, memory.semester);
    paint();
  }

  function syncTimer() {
    if (interval !== null) window.clearInterval(interval);
    interval = !disposed && playing && visible && !document.hidden ? window.setInterval(advanceFrame, frameTime) : null;
  }

  function advanceFrame() {
    elapsed += frameTime;
    if (elapsed < duration) {
      if (!reduced) paint();
      return;
    }
    if (index < memories.length - 1) {
      showMemory(index + 1);
      return;
    }
    playing = false;
    finished = true;
    showControls();
    syncTimer();
  }

  function jump(position) {
    if (position < 0 || position >= memories.length) return;
    playing = false;
    finished = false;
    showMemory(position);
    syncTimer();
  }

  previous.addEventListener('click', () => jump(index - 1));
  next.addEventListener('click', () => jump(index + 1));
  toggle.addEventListener('click', () => {
    playing = !playing;
    if (finished) {
      finished = false;
      showMemory(0);
    } else {
      showControls();
    }
    syncTimer();
  });

  const observer = Observer ? new Observer(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= .25;
    syncTimer();
  }, { threshold: .25 }) : null;
  observer?.observe(canvas);
  document.addEventListener('visibilitychange', syncTimer);
  showMemory(0);
  syncTimer();

  return () => {
    disposed = true;
    syncTimer();
    observer?.disconnect();
    document.removeEventListener('visibilitychange', syncTimer);
  };
}

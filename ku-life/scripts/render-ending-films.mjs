// Run from ku-life with FFmpeg (including libass) and @napi-rs/canvas installed.
// Pass ending IDs to render only those films.
// ENDING_FILM_FONT can point to a different Korean font file.
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { endingFilmAudio } from './ending-film-audio.mjs';
import { drawPixelStudent } from '../src/ui/pixel-student.js';
import { drawClueBear, drawClueCat, drawFestivalPhoto } from '../src/ui/ending-clues.js';
import { ENDINGS } from '../src/atlas/endings.js';

const width = 320;
const height = 180;
const rasterScale = 2;
const fps = 24;
const canvas = createCanvas(width * rasterScale, height * rasterScale);
const ctx = canvas.getContext('2d');
ctx.scale(rasterScale, rasterScale);
ctx.imageSmoothingEnabled = false;
const filmFrame = createCanvas(canvas.width, canvas.height);
const frameContext = filmFrame.getContext('2d');
frameContext.scale(rasterScale, rasterScale);
frameContext.imageSmoothingEnabled = false;
const actor = createCanvas(64 * rasterScale, 76 * rasterScale);
const actorContext = actor.getContext('2d');
actorContext.scale(rasterScale, rasterScale);
const font = process.env.ENDING_FILM_FONT ?? '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc';
if (!GlobalFonts.registerFromPath(font, 'Ending Film Korean')) throw new Error('Korean film font could not be loaded');
const dark = '#261c2d';
const wood = '#6e4650';
const cream = '#fae5b6';
const friend = { hairStyle: 'bob', hairColor: '#39283f', skinTone: '#d5a183', outfitColor: '#476974', accessory: 'hairclip' };
const owner = { ...friend, hairStyle: 'medium', outfitColor: '#526854', accessory: 'glasses' };
const platePath = new URL('./ending-film-plates/', import.meta.url);
const plates = new Map();
const plateLights = {
  cafe: ['#ffd09748', '#5137554d'],
  nursery: ['#548dfd4d', '#f6a86b49'],
  counseling: ['#b6d7ec4b', '#66426538'],
  arcade: ['#7fbcff4d', '#ed73ae55'],
  campus: ['#ffe1914d', '#65516d36'],
  entrance: ['#dac9f046', '#f4a76245'],
};
let sceneLight;

async function loadPlates() {
  for (const id of ['cafe', 'nursery', 'counseling', 'arcade', 'campus', 'press', 'entrance', 'rest']) {
    plates.set(id, await loadImage(fileURLToPath(new URL(`${id}.png`, platePath))));
  }
}

function rect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function label(text, x, y, size = 12, color = cream, align = 'left') {
  ctx.font = `${size}px "Ending Film Korean"`;
  ctx.textAlign = align;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function panel(x, y, w, h, fill, border = dark) {
  rect(x + 4, y + 5, w, h, '#24172565');
  rect(x, y, w, h, border);
  rect(x + 3, y + 3, w - 6, h - 6, fill);
}

function lines(x, y, widths, color = '#957679') {
  widths.forEach((w, index) => rect(x, y + index * 5, w, 2, color));
}

function student(x, y, appearance, scale = 2, stride = 0, pose = {}) {
  const sway = Math.round(stride);
  rect(x + scale * 2, y + scale * 36, scale * 20, 3, '#211b2c65');
  rect(x + scale * 7, y + scale * 27, scale * 4, scale * 8 + sway, '#343344');
  rect(x + scale * 13, y + scale * 27, scale * 4, scale * 8 - sway, '#454457');
  rect(x + scale * 6, y + scale * 34 + sway, scale * 6, scale * 2, '#292634');
  rect(x + scale * 12, y + scale * 34 - sway, scale * 6, scale * 2, '#292634');
  actorContext.clearRect(0, 0, 64, 76);
  drawPixelStudent(actorContext, { appearance, ...pose }, 0, 0, scale);
  if (sceneLight) {
    actorContext.globalCompositeOperation = 'source-atop';
    const rim = actorContext.createLinearGradient(0, 0, 24 * scale, 0);
    rim.addColorStop(0, sceneLight[0]);
    rim.addColorStop(.48, '#ffffff00');
    rim.addColorStop(1, sceneLight[1]);
    actorContext.fillStyle = rim;
    actorContext.fillRect(0, 0, 24 * scale, 31 * scale);
    actorContext.globalCompositeOperation = 'source-over';
  }
  ctx.drawImage(actor, Math.round(x), Math.round(y - Math.abs(sway) * .5), 64, 76);
}

function setPlate(id, tint) {
  sceneLight = plateLights[id];
  ctx.drawImage(plates.get(id), 0, 0, width, height);
  if (tint) rect(0, 0, width, height, tint);
}

function walk(from, to, t) {
  const progress = Math.max(0, Math.min(1, t));
  return Math.round(from + (to - from) * progress * progress * (3 - 2 * progress));
}

function counter(y, color = wood) {
  rect(0, y, width, height - y, color);
  rect(0, y, width, 12, '#d19470');
  rect(0, y, width, 2, '#efb78a');
  rect(0, y + 10, width, 3, '#9d5f58');
  for (let i = 0; i < 21; i++) {
    const x = (i * 79 + 17) % width;
    rect(x, y + 3 + (i * 7) % 7, 8 + (i * 9) % 26, 1, i % 2 ? '#f6c09372' : '#9d63525c');
  }
  rect(0, y + 13, width, 3, '#392733');
  for (let x = 25; x < width; x += 68) rect(x, y + 16, 2, height - y - 16, '#271b353e');
}

function cup(x, y, color, t) {
  rect(x - 5, y + 17, 32, 4, '#40292970');
  rect(x - 3, y + 15, 27, 3, '#e6c6ac');
  rect(x + 2, y + 2, 16, 14, color);
  rect(x + 4, y + 4, 3, 9, '#fff4e170');
  rect(x + 14, y + 4, 3, 10, '#432b4b58');
  rect(x, y, 20, 3, '#f3e0c6');
  rect(x + 3, y, 14, 1, t == null ? '#c39183' : '#6f433a');
  rect(x + 17, y + 5, 7, 2, color);
  rect(x + 22, y + 7, 2, 5, color);
  rect(x + 17, y + 12, 6, 2, color);
  if (t == null) return;
  for (let i = 0; i < 3; i++) {
    const rise = (t * 19 + i * 7) % 15;
    const drift = Math.round(Math.sin(rise / 3 + i) * 2);
    rect(x + 5 + i * 4 + drift, y - 5 - rise, 2, 3, '#fff0d788');
  }
}

function paper(x, y, w, h) {
  panel(x, y, w, h, '#f9e4b9', '#a2766b');
  lines(x + 7, y + 8, [w - 17, w - 22, w - 16, w - 28]);
}

const inkCircle = [
  '..####..',
  '.#....#.',
  '#......#',
  '#......#',
  '.#....#.',
  '..####..',
];
const pixelHeart = [
  '.##..##.',
  '########',
  '########',
  '.######.',
  '..####..',
  '...##...',
];

function drawMark(rows, cx, cy, size, color) {
  const x = cx - rows[0].length * size / 2;
  const y = cy - rows.length * size / 2;
  for (const [row, pixels] of rows.entries()) {
    for (const [column, pixel] of [...pixels].entries()) {
      if (pixel === '#') rect(x + column * size, y + row * size, size, size, color);
    }
  }
}

function schedule(x, y, mark) {
  panel(x, y, 54, 32, '#f9e4b9', '#a2766b');
  for (let i = 0; i < 4; i++) rect(x + 8 + i * 12, y + 6, 1, 21, '#a68886');
  for (let i = 0; i < 3; i++) rect(x + 8, y + 6 + i * 10, 37, 1, '#a68886');
  if (mark) drawMark(inkCircle, x + 26, y + 21, 1.5, '#bd536c');
}

function bottle(x, y, s = 1) {
  rect(x + 5 * s, y, 8 * s, 4 * s, '#ecae86');
  rect(x + 3 * s, y + 4 * s, 12 * s, 4 * s, '#a8bed6');
  rect(x, y + 8 * s, 18 * s, 23 * s, '#fbf0cc');
  rect(x + 2 * s, y + 12 * s, 4 * s, 16 * s, '#fff7e2');
  rect(x + 12 * s, y + 15 * s, 4 * s, 2 * s, '#c095a0');
  rect(x + 12 * s, y + 21 * s, 4 * s, 2 * s, '#c095a0');
}

function familyPlan(t) {
  setPlate('cafe', '#3d25352e');
  student(80, 54);
  student(198, 55, friend);
  counter(110);
  schedule(104, 104, t > .27);
  schedule(160, 105, t > .48);
  cup(67, 109, '#b1767a', t);
  cup(222, 110, '#709896', t);
}

function familyTogether(t) {
  const windowPlate = plates.get('nursery');
  ctx.drawImage(windowPlate, 0, 10, 346, 195, 0, 0, width, height);
  rect(0, 0, width, height, '#28204572');
  counter(122, '#483449');

  if (t < .43) {
    ctx.save();
    ctx.globalAlpha = 1 - clamp((t - .12) / .31, 1);
    setPlate('cafe', '#734a5358');
    counter(36);
    ctx.translate(69, 51);
    ctx.scale(1.5, 1.5);
    schedule(0, 0, false);
    schedule(68, 0, false);
    ctx.restore();
  }

  if (t > .22) {
    const left = walk(79, 146, (t - .22) / .35);
    const right = walk(247, 172, (t - .26) / .31);
    ctx.save();
    ctx.globalAlpha = clamp((t - .22) / .18, 1);
    rect(0, 106, left - 6, 24, '#714258');
    rect(0, 106, left - 6, 4, '#a36577');
    rect(left - 12, 106, 12, 24, '#b87d87');
    rect(left, 109, 22, 15, '#e1ae91');
    rect(left + 6, 106, 11, 7, '#f3c4a1');
    rect(right + 5, 111, 315 - right, 22, '#4c667e');
    rect(right + 5, 111, 315 - right, 4, '#7a94a7');
    rect(right - 1, 112, 10, 20, '#96abb3');
    rect(right - 16, 115, 19, 13, '#cb9583');
    rect(right - 16, 115, 16, 4, '#e1b399');
    if (t > .57) rect(156, 120, 12, 3, '#ab7471');
    ctx.restore();
  }

  if (t < .58) {
    const y = walk(83, 66, t / .56);
    ctx.save();
    ctx.globalAlpha = 1 - clamp((t - .45) / .13, 1);
    const ink = t < .19 ? '#bb536f' : '#ec9aaa';
    drawMark(inkCircle, walk(108, 156, t / .57), y, 2, ink);
    drawMark(inkCircle, walk(210, 164, t / .57), y, 2, ink);
    ctx.restore();
  }
  if (t > .48) {
    ctx.save();
    ctx.globalAlpha = clamp((t - .48) / .15, 1);
    const size = t < .68 ? walk(2, 3, (t - .52) / .14) : 3;
    drawMark(pixelHeart, 160, walk(67, 62, (t - .51) / .28), size, '#f0a2af');
    ctx.restore();
  }
}

function nursery(t) {
  setPlate('nursery', '#21182c2d');
  rect(188, 105, 46, 11, '#a097b1');
  rect(192, 101, 11, 10, '#e7bd99');
  rect(194, 101, 5, 2, '#c28d70');
  rect(203, 104, 24, 5, Math.sin(t * 14) > .6 ? '#b5aec5' : '#a097b1');
  for (let x = 190; x < 233; x += 9) rect(x, 101, 2, 16, '#694459');
  const step = t < .56 ? Math.sin(t * 22) * 2 : 0;
  student(walk(18, 87, t * 1.8), 59, friend, 2, step, { gaze: t > .48 ? 1 : 0, blink: t > .31 && t < .36 });
  student(walk(260, 250, t * 1.8), 58, undefined, 2, -step, { gaze: t > .48 ? -1 : 0 });
}

function nightShift(t) {
  setPlate('nursery', '#21182c70');
  panel(35, 44, 76, 38, '#35293e');
  label('04:00', 73, 68, 21, '#f5ba95', 'center');
  panel(190, 28, 94, 102, '#af99a5', '#705a72');
  rect(194, 68, 85, 3, '#776077');
  schedule(214, 76, true);
  counter(122);
  bottle(walk(81, 145, t * 1.4), 66, 2);
  rect(walk(31, 95, t * 1.4), 113, 53, 13, '#be8c76');
  panel(37, 97, 68, 40, '#4b3b56');
  if (t < .47) {
    const glow = Math.sin(t * 53) > 0;
    rect(44, 102, 54, 24, glow ? '#d293ad4d' : '#8d708333');
  }
  label(t < .47 ? '알람 켬' : '알람 끔', 71, 121, 13, t < .47 ? '#f7b29d' : '#b7d3be', 'center');
  const press = walk(142, 103, (t - .26) / .21) + walk(0, 37, (t - .51) / .30);
  rect(press, 110, 24, 9, '#d49885');
  rect(press, 110, 8, 6, '#e6b29b');
  rect(press + 18, 108, 6, 14, '#7596b8');
}

function counseling(t) {
  setPlate('counseling', '#5540532b');
  student(69, 59);
  student(206, 56, owner);
  counter(110, '#8f6664');
  paper(walk(170, 127, t * 1.5), 100, 51, 33);
  cup(218, 105, '#9ab2ae', t);
}

function windowRain(t, left, top, range, count) {
  for (let i = 0; i < count; i++) {
    const x = left + i * 8;
    const y = top + (i * 19 + t * 88) % range;
    rect(x, y, 1, 4, '#b6d4eb7a');
  }
}

function recoveryIntertitle(plate, title) {
  return () => {
    setPlate(plate, '#21192be0');
    label(title, width / 2, 82, 19, '#ffeddb', 'center');
    rect(130, 96, 60, 1, '#a3bfb1');
  };
}

function leaveMessage(t) {
  setPlate('rest', '#293d5948');
  windowRain(t, 111, 12, 76, 15);
  const phoneY = walk(31, 22, t * 2.4);
  panel(50, phoneY, 220, 112, '#ddd8d8', '#473f56');
  rect(53, phoneY + 3, 214, 22, '#605672');
  if (t < .66) {
    label('학과 단톡방', 65, phoneY + 18, 12);
    const cardY = phoneY + 31;
    const sharedTimetables = [[0, 2, 3, 5], [0, 1, 4, 5], [1, 2, 3, 4]];
    for (const [index, periods] of sharedTimetables.entries()) {
      if (t < index * .10) continue;
      const x = 68 + index * 63;
      schedule(x, cardY, false);
      for (const [course, period] of periods.entries()) {
        rect(x + 9 + period % 3 * 12, cardY + 8 + Math.floor(period / 3) * 10, 10, 7,
          ['#bd8e9f', '#8faaa3', '#b3a0bd', '#d6ad8f'][course]);
      }
    }
    if (t > .27) {
      rect(120, phoneY + 73, 129, 24, '#ba95a2');
      label('나 이번 학기는 쉬어.', 184, phoneY + 89, 12, '#372b42', 'center');
    }
  } else {
    label('동기 · 개인 메시지', 65, phoneY + 18, 12);
    rect(66, phoneY + 38, 164, 29, '#f7eadb');
    label('그럼 커피는 언제 마실까?', 76, phoneY + 57, 12, dark);
  }
}

function cafeWindow(t, moment) {
  const past = moment === 'past';
  const alone = moment === 'alone';
  setPlate('cafe', past ? '#bd785124' : '#465d814d');
  if (!past) {
    rect(0, 17, 112, 65, '#87adc821');
    windowRain(t, 12, 14, 61, 11);
  }
  if (alone && t < .55) {
    const outside = walk(78, -14, t / .55);
    drawPixelStudent(ctx, { appearance: friend }, outside, 39, .58);
    rect(outside, 39, 14, 19, '#7083a933');
  }
  rect(209, 86, 33, 7, '#a67072');
  rect(211, 93, 29, 17, '#805361');
  const departure = clamp((t - .55) / .30, 1);
  const step = Math.sin(departure * 17) * 3;
  const leavingX = past ? walk(72, -45, departure) : 72;
  student(leavingX, 59, undefined, 2, past ? step : 0, { gaze: alone ? -1 : 1, blink: t > .38 && t < .43 });
  if (!alone) {
    const x = past ? 200 : walk(200, 324, departure);
    student(x, 60, friend, 2, past ? 0 : step, { gaze: -1, blink: t > .29 && t < .34 });
  }
  counter(110);
  cup(103, 106, '#b7859f', past || (!alone && t < .26) ? t : null);
  cup(193, 106, '#8caeaa', past || (!alone && t < .26) ? t + .2 : null);
  if (!alone && t > .33 && t < .59) {
    const x = past ? 36 : 247;
    panel(x, 95, 55, 24, '#e4b699');
    label('다음 수업', x + 27, 111, 10, dark, 'center');
  }
}

function nextCoffee(t) {
  setPlate('cafe', '#42547072');
  windowRain(t, 12, 14, 57, 11);
  counter(79, '#6a4b5d');
  const phoneY = walk(80, 44, (t - .08) / .22);
  panel(31, phoneY, 119, 78, '#e8dfdf', '#57415e');
  rect(34, phoneY + 3, 113, 20, '#77607b');
  label('동기', 44, phoneY + 17, 11);
  if (t > .16) {
    label('다음 주에도', 47, phoneY + 42, 13, dark);
    label('이 자리 어때?', 47, phoneY + 59, 13, dark);
  }

  const calendarX = walk(322, 164, (t - .33) / .19);
  panel(calendarX, 44, 128, 82, '#fae9cf', '#9b7581');
  rect(calendarX + 3, 47, 122, 19, '#bda0a9');
  label('다음 주', calendarX + 13, 60, 12, '#514155');
  for (let i = 1; i < 5; i++) rect(calendarX + i * 24 + 4, 67, 1, 56, '#d1b5a7');
  rect(calendarX + 4, 86, 119, 1, '#d1b5a7');
  for (const [index, day] of ['월', '화', '수', '목', '금'].entries()) {
    label(day, calendarX + 16 + index * 24, 82, 10, '#656074', 'center');
  }
  if (t > .48) {
    rect(calendarX + 77, 90, 22, 30, '#f2cca1');
    label(t > .54 ? '커피' : '커', calendarX + 88, 109, 11, '#684850', 'center');
  }
}

function key(x, y) {
  rect(x, y, 21, 19, '#e2b864');
  rect(x + 5, y + 5, 10, 8, '#854f52');
  rect(x + 20, y + 7, 49, 6, '#ebc074');
  rect(x + 52, y + 12, 5, 7, '#c88a57');
  rect(x + 62, y + 12, 7, 9, '#c88a57');
  rect(x + 22, y + 7, 45, 2, '#ffe0a0');
}

function cafeHandoff(t) {
  setPlate('cafe', '#43243457');
  student(75, 51);
  student(204, 52, owner);
  counter(106);
  paper(60, 100, 50, 35);
  key(walk(184, 121, t * 1.6), 111);
}

function cafeOpening(t) {
  setPlate('entrance', '#3d25351c');
  const signWidth = 46 - Math.round(Math.max(0, .11 - Math.abs(t - .36)) * 380);
  panel(274 - signWidth / 2, 68, signWidth, 24, '#eec19a', '#694451');
  if (signWidth > 36) label(t < .36 ? '준비 중' : '영업 중', 274, 84, 11, dark, 'center');
  student(walk(95, 216, t * 1.7), 65, undefined, 2, t < .66 ? Math.sin(t * 40) * 3 : 0);
}

function groupOrder(t, repeat = true) {
  setPlate('cafe', '#3d25352e');
  const opened = repeat ? walk(0, 23, (t - .24) / .17) : 0;
  rect(285, 46, 35, 66, '#492e44');
  rect(290, 50, 30, 61, '#855773');
  if (opened) {
    rect(320 - opened, 51, opened, 59, '#c6a5a7');
    rect(320 - opened, 51, 2, 59, '#e8cec0');
    rect(319 - opened, 106, opened + 1, 5, '#f1bd8d');
  }
  rect(294, 76, 4, 8, '#d2a279');
  if (repeat) {
    panel(107, 20, 106, 49, '#51434d', '#8b665c');
    label('팀플 세트', 160, 41, 14, cream, 'center');
    label('세 잔 먼저', 160, 58, 11, '#e2b39c', 'center');
  }
  student(13, 63, undefined, 2, 0, { gaze: repeat && t > .37 ? 1 : 0 });
  student(75, 68, friend, 2, 0, { gaze: repeat && t > .35 ? 1 : 0, blink: t > .17 && t < .21 });
  student(128, 67, { ...friend, outfitColor: '#926166' }, 2, 0, { gaze: repeat && t > .39 ? 1 : 0 });
  student(181, 68, { ...friend, hairStyle: 'short', outfitColor: '#5d7161' }, 2, 0, { gaze: repeat && t > .44 ? 1 : 0, blink: t > .31 && t < .36 });
  if (repeat && t > .32) {
    const stride = t < .66 ? Math.sin((t - .32) * 56) * 4 : 0;
    const sit = walk(0, 4, (t - .68) / .15);
    student(walk(318, 244, (t - .32) / .34), 62 + sit, { ...friend, hairStyle: 'long', outfitColor: '#82668a' }, 2, stride, { gaze: -1 });
  } else {
    rect(254, 90, 28, 21, '#ad7f78');
    rect(252, 88, 32, 4, '#ebba92');
  }
  counter(110);
  ['#be8b91', '#88a898', '#ca9976'].forEach((color, index) => {
    if (t * 10 >= index) cup(86 + index * 53, 106, color, t + index * .16);
  });
  if (repeat && t > .67) cup(47, 102, '#916f98', t);
}

function cupHandoff(t) {
  setPlate('cafe', '#331e3468');
  counter(81, '#805750');
  rect(14, 89, 289, 50, '#dda77d');
  for (let i = 0; i < 15; i++) {
    const x = 19 + i * 71 % 246;
    rect(x, 92 + i * 13 % 43, 15 + i * 9 % 33, 1, '#f6c68885');
  }
  const x = walk(110, 205, (t - .14) / .43);
  const lift = walk(0, 9, (t - .56) / .18);
  const reach = walk(3, x + 8, t * 4) - walk(0, 60, (t - .57) / .27);
  const receive = walk(320, 244, (t - .36) / .21);
  rect(0, 91, Math.max(0, reach - 25), 24, '#765274');
  rect(0, 92, Math.max(0, reach - 28), 4, '#a77b9a');
  rect(0, 112, Math.max(0, reach - 26), 3, '#543b5c');
  rect(reach - 33, 92, 7, 23, '#946983');
  rect(reach - 31, 92, 11, 22, '#edc1a0');
  rect(reach - 21, 96, 23, 15, '#dcb091');
  rect(reach - 18, 96, 16, 4, '#f3c9a6');
  rect(reach - 17, 103, 17, 1, '#b67e71');
  rect(reach - 16, 108, 15, 1, '#c69280');
  rect(receive + 16, 104 - lift, Math.max(0, 320 - receive - 16), 22, '#506980');
  rect(receive + 8, 107 - lift, 10, 16, '#95b1b3');
  rect(receive - 3, 108 - lift, 13, 13, '#d3a184');
  if (t > .45) {
    const upper = walk(323, 251, (t - .45) / .14);
    rect(upper + 15, 69 - lift, 64, 19, '#506980');
    rect(upper + 8, 73 - lift, 10, 13, '#95b1b3');
    rect(upper - 2, 76 - lift, 13, 9, '#e4b89b');
  }
  ctx.save();
  ctx.translate(x, 82 - lift);
  ctx.scale(2.15, 2.15);
  cup(0, 0, '#916f98', t);
  ctx.restore();
  if (t > .57) {
    rect(208, 105 - lift, 9, 5, '#e4b89b');
    rect(237, 96 - lift, 13, 5, '#d3a184');
  }
}

function photo(x, y, whitePaw, t) {
  ctx.save();
  ctx.translate(x + 55, y + 42);
  const zoom = 1 + Math.min(.2, Math.max(0, t - .34) * .62);
  ctx.scale(zoom, zoom);
  panel(-55, -42, 110, 84, '#f4e3be', '#aa8275');
  ctx.save();
  ctx.translate(-48, -35);
  drawFestivalPhoto(ctx, whitePaw);
  ctx.restore();
  label(whitePaw ? '입실렌티' : '고연전', 0, 35, 10, dark, 'center');
  if (t > .48) {
    rect(-9, 2, 10, 1, '#ffdc83');
    rect(-9, 11, 10, 1, '#ffdc83');
    rect(-9, 3, 1, 8, '#ffdc83');
    rect(0, 3, 1, 8, '#ffdc83');
  }
  ctx.restore();
}

function comparePhotos(t) {
  counter(0);
  photo(walk(29, 32, t * 1.5), 33, true, t);
  photo(walk(186, 178, t * 1.5), 33, false, t);
}

function pawCloseup(t) {
  counter(0, '#5a424e');
  for (const [x, whitePaw] of [[20, true], [170, false]]) {
    panel(x, 28, 130, 103, '#f4e3be', '#9b7067');
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 8, 37, 114, 72);
    ctx.clip();
    ctx.translate(x - 19, 20);
    ctx.scale(1.8, 1.8);
    drawFestivalPhoto(ctx, whitePaw);
    ctx.restore();
    const color = t < .4 ? '#edc975' : '#ffefaf';
    rect(x + 50, 89, 18, 2, color);
    rect(x + 50, 104, 18, 2, color);
    rect(x + 50, 90, 2, 15, color);
    rect(x + 66, 90, 2, 15, color);
    label(whitePaw ? '흰 앞발' : '주황 앞발', x + 65, 123, 12, dark, 'center');
  }
}

function confirmCats(t) {
  setPlate('campus', '#24142f14');
  student(49, 65, friend);
  student(222, 60);
  panel(115, 106, 43, 31, '#aa795d', '#70495a');
  const leftStep = t < .71 ? Math.round(Math.sin(t * 32) * 2) : 0;
  const rightStep = t > .10 && t < .78 ? Math.round(Math.sin(t * 39) * 2) : 0;
  drawClueCat(ctx, walk(119, 143, t / .71), 105 - Math.max(0, leftStep), true, Math.sin(t * 15) > .3, leftStep);
  drawClueCat(ctx, walk(209, 185, (t - .10) / .68), 107 - Math.max(0, rightStep), false, Math.sin(t * 19) > 0, rightStep);
}

function printExtra(t) {
  setPlate('press', '#31213730');
  panel(46, 37, 228, 87, '#6e647f', '#433654');
  rect(79, 67, 162, 9, '#2c253c');
  panel(209, 45, 37, 13, '#9fb6b3');
  rect(219, 50, 17, 2, '#697973');
  const y = walk(37, 76, t * 1.55);
  panel(97, y, 126, 69, '#f4dfb6', '#a88d83');
  label('안암의 고양이 두 마리', 160, y + 17, 11, dark, 'center');
  drawClueCat(ctx, 110, y + 23, true, t > .5);
  drawClueCat(ctx, 167, y + 23, false, t > .5);
  label('앞발 색으로 본인 확인 완료', 160, y + 61, 8, dark, 'center');
  rect(79, 67, 162, Math.max(0, Math.min(8, y - 67)), '#33293f');
}

function cabinet(t) {
  setPlate('arcade', '#21182c2d');
  panel(52, 18, 216, 124, '#78a8b0', '#49385d');
  rect(56, 20, 206, 5, '#e5a3c3');
  rect(59, 26, 201, 7, '#b8d2c6');
  rect(62, 35, 198, 3, '#584e73');
  rect(66, 39, 190, 13, '#d6fff138');
  rect(59, 38, 5, 67, '#c9eee67a');
  rect(253, 38, 5, 71, '#476d8480');
  for (let i = 0; i < 24; i++) {
    rect(72 + i, 71 - i, 9, 2, '#bcf4e94d');
    rect(224 + i, 90 - i, 3, 2, '#bcf4e937');
  }
  for (let i = 0; i < 12; i++) {
    const pulse = (Math.floor(t * 18) + i) % 5;
    rect(68 + i * 16, 28, 5, 2, pulse ? '#a5d1cc' : '#fff3c7');
  }
  rect(64, 105, 192, 3, '#c7dbd0');
  rect(58, 116, 203, 20, '#c58ca4');
  rect(139, 121, 43, 10, '#6d5277');
  rect(225, 121, 9, 8, t < .5 ? '#f2bdac' : '#ffe3a5');
}

function claw(x, y, open) {
  rect(x + 16, 37, 3, y - 37, '#4e465e');
  rect(x + 8, y, 19, 7, '#e2c8b5');
  rect(x + (open ? 2 : 6), y + 6, 5, 12, '#d6aeb1');
  rect(x + (open ? 28 : 24), y + 6, 5, 12, '#d6aeb1');
}

function thirdPrize(t) {
  cabinet(t);
  drawClueBear(ctx, 227, 74, '#c68d70');
  rect(259, 85, 6, 20, '#49385d');
  drawClueBear(ctx, 82, 75, '#b38daf');
  const y = t < .45 ? walk(39, 72, t / .45) : walk(72, 41, (t - .45) * 2.6);
  rect(149, t < .45 ? 94 : y + 20, 18, 10, '#bfdaed');
  claw(140, y, t < .45);
}

function rearrange(t) {
  cabinet(t);
  drawClueBear(ctx, 78, 75, '#b38daf');
  const x = walk(227, 143, t * 1.45);
  drawClueBear(ctx, x, 72, '#c68d70');
  rect(x + 28, 88, 31, 12, '#8b79a3');
  rect(x + 52, 92, 21, 14, '#6d537e');
}

function newWin(t) {
  cabinet(t);
  drawClueBear(ctx, 78, 75, '#b38daf');
  const y = t < .40 ? walk(36, 58, t / .40) : walk(58, 37, (t - .53) / .32);
  const shadow = walk(35, 18, (t - .53) / .32);
  rect(163 - shadow / 2, 103, shadow, 4, '#45445e78');
  const shift = t > .53 && t < .87 ? Math.round(Math.sin(t * 59) * 2) : 0;
  ctx.save();
  ctx.beginPath();
  ctx.rect(60, 46, 194, 64);
  ctx.clip();
  const fall = walk(0, 67, (t - .85) / .14);
  drawClueBear(ctx, 143 + shift, t < .40 ? 74 : y + 16 + fall, '#c68d70');
  ctx.restore();
  claw(144, y, t < .40 || t > .85);
  if (t > .84) rect(223, 120, 12, 9, '#fae6a8');
}

function clawLog(t) {
  setPlate('arcade', '#21182c59');
  student(63, 56);
  student(211, 55, owner);
  counter(108, '#594367');
  const x = walk(169, 106, t * 1.6);
  panel(x, 86, 110, 50, '#f4dfb6', '#947786');
  label('상품 배치 일지', x + 55, 103, 12, dark, 'center');
  label('곰 3호 · 7분 만에 퇴근', x + 55, 122, 9, '#60405d', 'center');
}

const films = {
  family: [
    [familyPlan, '겹치는 공강', '두 시간표의 같은 빈칸에 동그라미를 쳤다.', { zoom: 1.12, y: 114 }],
    [familyTogether, '함께 살게 된 뒤', '', { seconds: 3, fadeOut: 12 }],
    [nursery, '이듬해', '울음소리에 두 사람이 잠을 깼다.', { x: 195, y: 102, zoom: 1.10, fadeIn: 10 }],
    [nightShift, '새벽 4시', '“오늘 내 당번이야.” 옆 사람의 알람을 끄고 분유를 챙겼다.', { seconds: 4.2, y: 101, zoom: 1.1 }],
  ],
  recovery: [
    [recoveryIntertitle('cafe', '휴학 전, 어느 평일 오후'), '', '', { seconds: 1.8 }],
    [t => cafeWindow(t, 'past'), '학교 앞 카페', '내 휴대폰에서 수업 알람이 울렸다.', { seconds: 4.7 }],
    [counseling, '상담센터에 간 날', '진료 일정을 잡고 한 학기 쉬기로 했다.', { seconds: 4.0, zoom: 1.10, y: 108 }],
    [recoveryIntertitle('rest', '휴학 후, 새 학기 첫 주'), '', '', { seconds: 1.9, fadeIn: 8 }],
    [leaveMessage, '새 시간표가 올라온 날', '', { seconds: 5.9 }],
    [recoveryIntertitle('cafe', '휴학하고 몇 달 뒤'), '', '', { seconds: 1.9, fadeIn: 8 }],
    [t => cafeWindow(t, 'later'), '비가 오던 오후, 같은 창가', '이번에는 동기 쪽에서 같은 알람이 울렸다.', { seconds: 5.8 }],
    [t => cafeWindow(t, 'alone'), '창가에 남은 두 잔', '', { seconds: 5.2 }],
    [nextCoffee, '그날 오후', '', { seconds: 7.2, fadeOut: 14 }],
  ],
  cafe: [
    [t => groupOrder(t, false), '주말 근무', '“세 잔만 먼저요. 나머지 한 명은 또 늦어요.”'],
    [cafeHandoff, '마감 뒤', '사장님이 자리를 비우는 동안 매장을 맡게 됐다.', { zoom: 1.14, y: 111 }],
    [cafeOpening, '다음 날 아침', '카페 문을 열고 팀플 세트를 메뉴판에 적었다.', { seconds: 2.8 }],
    [groupOrder, '다시 온 단골 조', '오늘도 빈자리가 하나. 그때 문이 열렸다.', { seconds: 4.3 }],
    [cupHandoff, '네 번째 잔', '자리에 앉자 자기 잔이 슬며시 다가왔다.', { seconds: 4.8, y: 104, zoom: 1.08 }],
  ],
  newspaper: [
    [comparePhotos, '기자단 책상', '두 행사 사진에 똑같은 자세의 고양이가 찍혔다.'],
    [pawCloseup, '사진 확대', '왼쪽 고양이만 앞발이 하얬다.', { seconds: 3.6 }],
    [confirmCats, '추가 취재', '봉사자가 웃었다. “같이 보면 금방 알아요.”', { zoom: 1.12, y: 108 }],
    [printExtra, '호외 발행', '사진 설명은 ‘앞발 색으로 본인 확인 완료’.', { seconds: 3.9, zoom: 1.08, y: 106 }],
  ],
  claw: [
    [thirdPrize, '세 번째 뽑기', '옆 칸의 곰 인형은 벽에 팔이 끼어 있었다.', { x: 206, zoom: 1.19 }],
    [rearrange, '기계 뒷문', '운영자와 함께 곰 인형을 가운데로 옮겼다.', { zoom: 1.12 }],
    [newWin, '7분 뒤', '다음 손님이 그 곰을 한 번에 뽑았다.', { seconds: 4.6, zoom: 1.24, y: 82 }],
    [clawLog, '첫 토요일 근무', '“토요일에 두 시간만 같이 배치해 볼래요?”', { seconds: 4.0, zoom: 1.10, y: 104 }],
  ],
};

const palettes = {
  family: { wash: '#8461880a', edge: '#e3b49f' },
  recovery: { wash: '#63948e10', edge: '#a3bfb1' },
  cafe: { wash: '#8f503c0c', edge: '#edbd8b' },
  newspaper: { wash: '#57476c0b', edge: '#ded1a7' },
  claw: { wash: '#5c518216', edge: '#c4b7ec' },
};

const clamp = (value, limit) => Math.max(0, Math.min(value, limit));
const frameCount = ({ seconds = 3.2 }) => Math.round(seconds * fps);

function frameCamera(camera, progress) {
  const zoom = 1 + ((camera.zoom ?? 1.036) - 1) * (0.24 + 0.76 * progress);
  const w = Math.round(width / zoom);
  const h = Math.round(height / zoom);
  const x = clamp(Math.round((camera.x ?? width / 2) - w / 2), width - w);
  const y = clamp(Math.round((camera.y ?? height / 2) - h / 2), height - h);
  frameContext.drawImage(canvas, x * rasterScale, y * rasterScale, w * rasterScale, h * rasterScale, 0, 0, width, height);
}

function* frames(id, shots) {
  const { wash, edge } = palettes[id];
  for (const [index, [paint, , , camera = {}]] of shots.entries()) {
    const duration = frameCount(camera);
    const fadeInFrames = camera.fadeIn ?? (index === 0 ? 6 : 0);
    const fadeOutFrames = camera.fadeOut ?? (index === shots.length - 1 ? 7 : 0);
    for (let frame = 0; frame < duration; frame++) {
      const progress = frame / (duration - 1);
      paint(progress);
      rect(0, 0, width, height, wash);
      frameCamera(camera, progress);
      frameContext.fillStyle = '#211927';
      frameContext.fillRect(0, 0, width, 13);
      frameContext.fillRect(0, 143, width, 37);
      frameContext.fillStyle = edge;
      frameContext.fillRect(0, 143, width, 1);
      const fadeIn = fadeInFrames ? clamp(1 - frame / fadeInFrames, 1) : 0;
      const fadeOut = fadeOutFrames ? clamp(1 - (duration - frame - 1) / fadeOutFrames, 1) : 0;
      const fade = Math.max(fadeIn, fadeOut);
      if (fade) {
        frameContext.fillStyle = `rgba(33, 25, 39, ${fade})`;
        frameContext.fillRect(0, 13, width, 130);
      }
      yield Buffer.from(filmFrame.data());
    }
  }
}

const subtitlePreamble = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Title,Noto Sans CJK KR,36,&H00C7C4EF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,66,66,13,1
Style: Beat,Noto Sans CJK KR,40,&H00A5CFE7,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,8,90,90,873,1
Style: Story,Noto Sans CJK KR,60,&H00F0F1FF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,8,90,90,924,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

function assTime(frame) {
  const centiseconds = Math.round(frame * 100 / fps);
  const minutes = Math.floor(centiseconds / 6000);
  const seconds = Math.floor(centiseconds / 100) % 60;
  return `0:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds % 100).padStart(2, '0')}`;
}

function wrapSubtitle(sentence) {
  ctx.font = '10px "Ending Film Korean"';
  if (ctx.measureText(sentence).width <= 275) return sentence;
  const words = sentence.split(' ');
  const mid = ctx.measureText(sentence).width / 2;
  const split = words.findIndex((_, i) => ctx.measureText(words.slice(0, i + 1).join(' ')).width >= mid) + 1;
  return words.slice(0, split).join(' ') + '\\N' + words.slice(split).join(' ');
}

function filmSubtitles(id, shots) {
  let start = 0;
  let entries = '';
  for (const [, heading, subtitle, camera = {}] of shots) {
    const end = start + frameCount(camera);
    if (heading) entries += `Dialogue: 0,${assTime(start)},${assTime(end)},Beat,,0,0,0,,${heading}\n`;
    if (subtitle) entries += `Dialogue: 0,${assTime(start)},${assTime(end)},Story,,0,0,0,,${wrapSubtitle(subtitle)}\n`;
    start = end;
  }
  return subtitlePreamble + `Dialogue: 0,0:00:00.00,${assTime(start)},Title,,0,0,0,,${ENDINGS[id].title}\n` + entries;
}

const directory = new URL('../src/assets/ending-films/', import.meta.url);
const requested = process.argv.slice(2);
if (requested.some(id => !Object.hasOwn(films, id))) throw new Error('Unknown ending film');
await loadPlates();
await mkdir(directory, { recursive: true });
const temp = await mkdtemp(join(tmpdir(), 'ku-ending-films-'));
try {
  for (const [id, shots] of Object.entries(films)) {
    if (requested.length && !requested.includes(id)) continue;
    const output = fileURLToPath(new URL(`${id}.mp4`, directory));
    const subtitles = `${id}.ass`;
    const audio = `${id}.wav`;
    await writeFile(join(temp, subtitles), filmSubtitles(id, shots));
    await writeFile(join(temp, audio), endingFilmAudio(id, shots.map(([, , , camera = {}]) => frameCount(camera) / fps)));
    const ffmpeg = spawn('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba',
      '-s', `${canvas.width}x${canvas.height}`, '-r', String(fps), '-i', 'pipe:0',
      '-i', audio, '-c:a', 'aac', '-b:a', '96k', '-shortest',
      '-vf', `scale=1920:1080:flags=neighbor,ass=${subtitles}`, '-c:v', 'libx264',
      '-profile:v', 'high', '-level', '4.0', '-preset', 'fast',
      '-pix_fmt', 'yuv420p', '-crf', '17', '-movflags', '+faststart', '-threads', '3', output,
    ], { cwd: temp, stdio: ['pipe', 'ignore', 'inherit'] });
    const [exit] = await Promise.all([once(ffmpeg, 'exit'), pipeline(Readable.from(frames(id, shots)), ffmpeg.stdin)]);
    if (exit[0] !== 0) throw new Error(`Video encoding failed for ${id}`);
    console.log(output);
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}

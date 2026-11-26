// Run from ku-life with FFmpeg and @napi-rs/canvas installed.
// ENDING_FILM_FONT can point to a different Korean font file.
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { drawPixelBackground } from '../src/ui/pixel-backgrounds.js';
import { drawPixelStudent } from '../src/ui/pixel-student.js';
import { drawClueBear, drawClueCat, drawFestivalPhoto } from '../src/ui/ending-clues.js';
import { ENDINGS } from '../src/atlas/endings.js';

const width = 320;
const height = 180;
const fps = 15;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
const font = process.env.ENDING_FILM_FONT ?? '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc';
if (!GlobalFonts.registerFromPath(font, 'Ending Film Korean')) throw new Error('Korean film font could not be loaded');
const dark = '#261c2d';
const wood = '#6e4650';
const cream = '#fae5b6';
const friend = { hairStyle: 'bob', hairColor: '#39283f', skinTone: '#d5a183', outfitColor: '#476974', accessory: 'hairclip' };
const owner = { ...friend, hairStyle: 'medium', outfitColor: '#526854', accessory: 'glasses' };

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

function student(x, y, appearance, scale = 2) {
  rect(x - 2, y + scale * 30, scale * 25, 3, '#211b2c66');
  drawPixelStudent(ctx, { appearance }, x, y, scale);
}

function backdrop(scene) {
  drawPixelBackground(ctx, scene, 1);
  rect(0, 0, width, height, '#261b3224');
}

function walk(from, to, t) {
  return Math.round(from + (to - from) * Math.min(1, t));
}

function room(wall = '#75596d', floor = '#63474e') {
  rect(0, 0, width, 117, wall);
  rect(0, 116, width, height - 116, floor);
  rect(0, 114, width, 4, '#563d4b');
  for (let x = -30; x < width; x += 32) rect(x, 117, 2, 33, '#301d2d38');
}

function counter(y, color = wood) {
  rect(0, y, width, height - y, color);
  rect(0, y, width, 5, '#d19272');
  rect(0, y + 7, width, 2, '#392733');
}

function cup(x, y, color, t) {
  rect(x, y + 17, 24, 3, '#40292970');
  rect(x + 2, y + 2, 16, 15, color);
  rect(x, y, 20, 4, '#e9d5af');
  rect(x + 17, y + 5, 7, 2, color);
  rect(x + 22, y + 7, 2, 6, color);
  rect(x + 17, y + 12, 6, 2, color);
  for (let i = 0; i < 2; i++) {
    const rise = Math.round((t * 12 + i * 5) % 10);
    rect(x + 7 + i * 5, y - 5 - rise, 2, 3, '#fff0d788');
  }
}

function paper(x, y, w, h) {
  panel(x, y, w, h, '#f9e4b9', '#a2766b');
  lines(x + 7, y + 8, [w - 17, w - 22, w - 16, w - 28]);
}

function schedule(x, y, mark) {
  panel(x, y, 54, 32, '#f9e4b9', '#a2766b');
  for (let i = 0; i < 4; i++) rect(x + 8 + i * 12, y + 6, 1, 21, '#a68886');
  for (let i = 0; i < 3; i++) rect(x + 8, y + 6 + i * 10, 37, 1, '#a68886');
  if (mark) {
    rect(x + 20, y + 15, 13, 2, '#bd536c');
    rect(x + 20, y + 24, 13, 2, '#bd536c');
    rect(x + 19, y + 17, 2, 7, '#bd536c');
    rect(x + 32, y + 17, 2, 7, '#bd536c');
  }
}

function windowFrame(x, y, w, h, sky, below) {
  panel(x, y, w, h, sky, '#3b2d43');
  rect(x + 4, y + h - 20, w - 8, 15, below);
  rect(x + Math.floor(w / 2), y + 3, 3, h - 6, '#654b5d');
  rect(x - 4, y + h - 1, w + 8, 4, '#a47c76');
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
  backdrop('parttime');
  student(80, 54);
  student(198, 55, friend);
  counter(110);
  schedule(104, 104, t > .27);
  schedule(160, 105, t > .48);
  cup(67, 109, '#b1767a', t);
  cup(222, 110, '#709896', t);
}

function nursery(t) {
  room('#665874', '#604856');
  windowFrame(29, 23, 94, 63, '#323653', '#51597a');
  rect(90, 35, 10, 11, '#efd5a1');
  for (let i = 0; i < 7; i++) rect(43 + i * 9, 36 + i * 7 % 27, 2, 2, '#d6cce2');
  student(walk(18, 87, t * 1.8), 59, friend);
  student(walk(260, 250, t * 1.8), 58);
  rect(150, 99, 108, 36, '#9f655b');
  rect(150, 102, 108, 19, '#e4af98');
  rect(174, 105, 15, 11, '#edbd95');
  rect(189, 109, 38, 13, '#9e9fc0');
  for (let x = 154; x < 255; x += 12) rect(x, 113, 3, 20, '#744850');
  rect(147, 129, 114, 5, '#c78c76');
}

function nightShift(t) {
  room('#74607a', '#6c535e');
  panel(35, 44, 76, 38, '#35293e');
  label('04:00', 73, 68, 21, '#f5ba95', 'center');
  panel(190, 28, 94, 102, '#af99a5', '#705a72');
  rect(194, 68, 85, 3, '#776077');
  schedule(214, 76, true);
  counter(122);
  bottle(walk(81, 145, t * 1.4), 66, 2);
  rect(walk(31, 95, t * 1.4), 113, 53, 13, '#be8c76');
  panel(37, 97, 68, 40, '#4b3b56');
  label(t < .47 ? '알람 켬' : '알람 끔', 71, 121, 13, t < .47 ? '#f7b29d' : '#b7d3be', 'center');
}

function counseling(t) {
  room('#b1a0a3', '#8f777c');
  windowFrame(103, 23, 110, 66, '#b6c4c1', '#7a908b');
  student(69, 59);
  student(206, 56, owner);
  counter(110, '#8f6664');
  paper(walk(170, 127, t * 1.5), 100, 51, 33);
  cup(218, 105, '#9ab2ae', t);
}

function resting(t) {
  room('#8e9d9b', '#7c8585');
  windowFrame(63, 23, 194, 92, '#98adb8', '#647e83');
  for (let i = 0; i < 21; i++) {
    const x = 71 + i * 8;
    const y = 31 + (i * 13 + t * 78) % 66;
    rect(x, y, 1, 5, '#e3e8dc94');
  }
  rect(60, 115, 200, 4, '#bdada1');
  rect(183, 105, 52, 29, '#c1afa9');
  rect(190, 108, 47, 8, '#e9d6c2');
  rect(176, 120, 82, 18, '#7fa2a5');
  rect(176, 120, 82, 4, '#9ebbbc');
  panel(92, 103, 29, 41, '#736d84');
  rect(97, 112, 19, 9, t > .3 ? '#dbbaaa' : '#675e76');
}

function cafeWindow(t, leaving = false) {
  room('#ad817a', '#855c5d');
  windowFrame(87, 23, 146, 75, '#f0c694', '#7d9e8c');
  rect(102, 33, 23, 23, '#fae3b0');
  student(leaving ? walk(72, 9, Math.max(0, t - .33) * 1.7) : 72, 59);
  student(leaving ? 200 : walk(229, 200, t * 2), 60, friend);
  counter(110);
  cup(103, 106, '#b7859f', t);
  cup(193, 106, '#8caeaa', t + .2);
  if (leaving) {
    panel(133, 78, 56, 31, '#e4b699');
    label('다음 수업', 161, 98, 11, dark, 'center');
  } else if (t > .55) {
    rect(104, 105, 17, 4, '#b7859f');
    rect(194, 105, 17, 4, '#8caeaa');
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
  backdrop('parttime');
  student(75, 51);
  student(204, 52, owner);
  counter(106);
  paper(60, 100, 50, 35);
  key(walk(184, 121, t * 1.6), 111);
}

function cafeOpening(t) {
  backdrop('parttime');
  rect(0, 13, width, 129, '#edbd6d23');
  panel(89, 24, 145, 122, '#7f6468', '#523644');
  rect(103, 34, 115, 102, '#cd9e82');
  rect(109, 38, 103, 93, '#b4a49d');
  rect(119, 43, 16, 43, '#eac4aa');
  rect(205, 106, 6, 14, '#61434e');
  panel(122, 64, 76, 33, '#e4a881', '#694451');
  label(t < .36 ? '준비 중' : '영업 중', 160, 85, 14, dark, 'center');
  student(walk(31, 60, t * 1.8), 76);
}

function groupOrder(t, repeat = true) {
  backdrop('parttime');
  if (repeat) {
    panel(107, 20, 106, 49, '#51434d', '#8b665c');
    label('팀플 세트', 160, 41, 14, cream, 'center');
    label('세 잔 먼저', 160, 58, 11, '#e2b39c', 'center');
  }
  student(13, 63);
  student(75, 68, friend);
  student(128, 67, { ...friend, outfitColor: '#926166' });
  student(181, 68, { ...friend, hairStyle: 'short', outfitColor: '#5d7161' });
  if (repeat && t > .43) {
    student(walk(316, 244, (t - .43) * 3), 65, { ...friend, hairStyle: 'long', outfitColor: '#82668a' });
  } else {
    rect(254, 90, 28, 21, '#ad7f78');
    rect(252, 88, 32, 4, '#ebba92');
  }
  counter(110);
  ['#be8b91', '#88a898', '#ca9976'].forEach((color, index) => {
    if (t * 10 >= index) cup(86 + index * 53, 106, color, t + index * .16);
  });
  if (repeat && t > .64) cup(walk(209, 254, (t - .64) * 4), 106, '#a996b0', t);
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

function confirmCats(t) {
  backdrop('campus');
  student(49, 65, friend);
  student(222, 60);
  panel(115, 106, 43, 31, '#aa795d', '#70495a');
  drawClueCat(ctx, walk(121, 143, t), 105, true, t > .5);
  drawClueCat(ctx, walk(193, 185, t), 107, false, t > .5);
}

function printExtra(t) {
  room('#818194', '#60546d');
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
  room('#6c5379', '#4d395f');
  panel(52, 18, 216, 124, '#78a8b0', '#49385d');
  rect(59, 26, 201, 7, '#b8d2c6');
  rect(62, 35, 198, 3, '#584e73');
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
  const y = t < .43 ? walk(36, 58, t / .43) : walk(58, 37, (t - .43) * 2.8);
  drawClueBear(ctx, 143, t < .43 ? 74 : y + 16, '#c68d70');
  claw(144, y, t < .43);
}

function clawLog(t) {
  room('#6c5379', '#4d395f');
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
    [familyPlan, '겹치는 공강', '두 시간표의 같은 빈칸에 동그라미를 쳤다.'],
    [nursery, '이듬해', '아기가 태어나고, 울음소리에 둘 다 눈을 떴다.'],
    [nightShift, '새벽 4시', '“오늘 내 당번이야.” 교대표를 보고 옆 사람의 알람을 껐다.'],
  ],
  recovery: [
    [t => cafeWindow(t, true), '미뤘던 약속', '커피를 받자마자 다음 수업 알람이 울렸다.'],
    [counseling, '상담센터', '진료 일정을 잡고 한 학기 쉬기로 했다.'],
    [resting, '휴학 중', '치료를 받으며 쉬었다. 동기가 가끔 안부를 물었다.'],
    [cafeWindow, '몇 달 뒤, 같은 창가', '커피를 다 마신 뒤에도 창가에 조금 더 앉아 있었다.'],
  ],
  cafe: [
    [t => groupOrder(t, false), '주말 근무', '“세 잔만 먼저요. 나머지 한 명은 또 늦어요.”'],
    [cafeHandoff, '마감 뒤', '사장님이 자리를 비우는 동안 카페를 맡아 달라고 했다.'],
    [cafeOpening, '다음 날 아침', '받은 열쇠로 문을 열고 팀플 세트를 메뉴판에 적었다.'],
    [groupOrder, '다시 온 단골 조', '친구가 뛰어오자 셋이 네 번째 잔을 바로 내밀었다.'],
  ],
  newspaper: [
    [comparePhotos, '기자단 책상', '사진 속 고양이 두 마리는 앞발 색이 달랐다.'],
    [confirmCats, '추가 취재', '봉사자가 웃었다. “같이 보면 금방 알아요.”'],
    [printExtra, '호외 발행', '사진 설명은 ‘앞발 색으로 본인 확인 완료’.'],
  ],
  claw: [
    [thirdPrize, '세 번째 뽑기', '상품을 꺼내다 옆 칸 곰의 팔이 끼어 있는 걸 봤다.'],
    [rearrange, '기계 뒷문', '운영자와 함께 구석의 곰 인형을 가운데로 옮겼다.'],
    [newWin, '7분 뒤', '다음 손님이 가운데로 옮긴 곰을 한 번에 뽑았다.'],
    [clawLog, '첫 토요일 근무', '“토요일에 두 시간만 같이 배치해 볼래요?”'],
  ],
};

const shotFrames = [42, 48, 48, 57];

function* frames(id, shots) {
  for (const [index, [paint, heading, subtitle]] of shots.entries()) {
    const duration = shotFrames[index];
    for (let frame = 0; frame < duration; frame++) {
      paint(frame / (duration - 1));
      rect(0, 0, width, 16, '#211627');
      label(ENDINGS[id].title, 11, 11, 9, '#e6bea9');
      rect(0, 145, width, 35, '#211627');
      label(heading, width / 2, 157, 10, '#deb3a4', 'center');
      label(subtitle, width / 2, 172, 10, '#ffebce', 'center');
      const fade = Math.max(0, 1 - Math.min(frame, duration - frame - 1) / 3);
      if (fade) rect(0, 0, width, height, `rgba(33, 22, 39, ${fade})`);
      yield Buffer.from(canvas.data());
    }
  }
}

const directory = new URL('../src/assets/ending-films/', import.meta.url);
await mkdir(directory, { recursive: true });
for (const [id, shots] of Object.entries(films)) {
  const output = fileURLToPath(new URL(`${id}.mp4`, directory));
  const ffmpeg = spawn('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba',
    '-s', `${width}x${height}`, '-r', String(fps), '-i', 'pipe:0',
    '-vf', 'scale=960:540:flags=neighbor', '-c:v', 'libx264', '-profile:v', 'main',
    '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', '-threads', '2', output,
  ], { stdio: ['pipe', 'ignore', 'inherit'] });
  const [exit] = await Promise.all([once(ffmpeg, 'exit'), pipeline(Readable.from(frames(id, shots)), ffmpeg.stdin)]);
  if (exit[0] !== 0) throw new Error(`Video encoding failed for ${id}`);
  console.log(output);
}

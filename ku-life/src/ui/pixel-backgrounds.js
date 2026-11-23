import { getSeasonFromSemester } from '../voxel/particles.js';

// All artwork uses the scene's 320 × 180 logical pixel grid.
const STONE = ['#b2a38c', '#9b8c79', '#d8c8a7', '#72675d'];
const CAMPUS_SEASONS = {
  spring: {
    sky: ['#a7c9cf', '#c4d9cd', '#a8bb9c'],
    ground: ['#829777', '#adb38b'],
    tree: ['#653d56', '#aa6078', '#e19a9d', '#ffcab2'],
    paving: ['#b2a48b', '#968774', '#cfc1a0', '#7c6f65'],
    scatter: '#efb5ad',
  },
  summer: {
    sky: ['#72aabd', '#9bc8c9', '#82ae96'],
    ground: ['#4e7d54', '#83a35c'],
    tree: ['#274f48', '#466e51', '#719158', '#b4c777'],
    paving: ['#b9ad8b', '#9d8f71', '#d7c69c', '#756e5f'],
    scatter: '#dfe39c',
  },
  autumn: {
    sky: ['#ba9da1', '#dfb99f', '#d0ac8a'],
    ground: ['#958268', '#b4936e'],
    tree: ['#703e3d', '#a7553d', '#d38146', '#f4bd69'],
    paving: ['#b2967c', '#967967', '#d5b597', '#765c59'],
    scatter: '#e4954e',
  },
  winter: {
    sky: ['#8195ac', '#a9bbcb', '#bdc7cd'],
    ground: ['#b4c3c8', '#edf0e8'],
    tree: ['#445665', '#718592', '#a5b1b4', '#f0f2ea'],
    paving: ['#acb9bd', '#889aa8', '#e2e9e7', '#586b7d'],
    scatter: '#f9f8ee',
  },
};

function stonework(rect, x, y, width, height, colors = STONE) {
  rect(x, y, width, height, colors[0]);
  for (let row = 0; row + 5 < height; row += 5) {
    rect(x, y + row, width, 1, colors[1]);
    for (let col = row % 2 ? 8 : 3; col + 2 < width; col += 13) {
      rect(x + col, y + row, 1, 5, colors[1]);
      rect(x + col + 2, y + row + 1, 5 + (col + row) % 5, 1, colors[2]);
    }
  }
}

function arch(rect, x, y, width, height, trim, glass) {
  rect(x, y + 5, width, height - 5, trim);
  rect(x + 2, y + 2, width - 4, 4, trim);
  rect(x + 4, y, width - 8, 3, trim);
  rect(x + 2, y + 6, width - 4, height - 7, glass);
  rect(x + 4, y + 3, width - 8, 5, glass);
  rect(x + Math.floor(width / 2), y + 4, 1, height - 5, trim);
  rect(x + 2, y + 11, width - 4, 1, trim);
  rect(x - 1, y + height - 1, width + 2, 2, trim);
}

function tree(rect, x, ground, colors) {
  const [shadow, mid, light, highlight] = colors;
  rect(x - 3, ground - 23, 7, 23, '#55433e');
  rect(x, ground - 21, 2, 20, '#816451');
  rect(x - 11, ground - 28, 25, 5, shadow);
  rect(x - 17, ground - 40, 37, 13, shadow);
  rect(x - 19, ground - 45, 37, 12, mid);
  rect(x - 13, ground - 53, 29, 15, mid);
  rect(x - 9, ground - 57, 16, 9, light);
  rect(x - 15, ground - 48, 24, 8, light);
  rect(x + 7, ground - 47, 11, 5, light);
  for (let i = 0; i < 8; i++) {
    rect(x - 13 + (i * 11) % 25, ground - 52 + (i * 7) % 16, 3, 2, highlight);
  }
}

function summerSun(rect) {
  rect(237, 19, 37, 12, '#eed591');
  rect(242, 14, 27, 22, '#eed591');
  rect(245, 17, 21, 16, '#ffdf88');
  rect(249, 14, 13, 22, '#ffdf88');
  rect(249, 19, 12, 9, '#fff0ab');
  for (const [x, y, w, h] of [[254, 7, 3, 4], [254, 39, 3, 5], [230, 24, 5, 2], [277, 24, 5, 2]]) {
    rect(x, y, w, h, '#fff0ab');
  }
  for (let i = 0; i < 6; i++) {
    rect(247 - i * 5, 37 + i * 3, 11, 2, '#fff3bf44');
    rect(263 + i * 5, 37 + i * 3, 10, 2, '#fff3bf44');
  }
}

function snowman(rect, x, y) {
  rect(x - 3, y, 30, 3, '#718797');
  rect(x + 3, y - 10, 19, 11, '#d9e8e9');
  rect(x + 6, y - 13, 13, 16, '#f3f5eb');
  rect(x + 5, y - 22, 15, 9, '#dbe9e9');
  rect(x + 8, y - 24, 10, 11, '#faf8ee');
  rect(x + 7, y - 28, 12, 4, '#394354');
  rect(x + 5, y - 25, 16, 2, '#394354');
  rect(x + 9, y - 20, 2, 2, '#40475a');
  rect(x + 15, y - 20, 2, 2, '#40475a');
  rect(x + 13, y - 17, 7, 2, '#d88352');
  rect(x + 6, y - 14, 14, 3, '#9d3653');
  rect(x + 16, y - 12, 4, 6, '#b64761');
  rect(x + 12, y - 8, 2, 2, '#6b6a78');
  rect(x + 12, y - 4, 2, 2, '#6b6a78');
  rect(x, y - 12, 4, 2, '#76605a');
  rect(x + 21, y - 12, 5, 2, '#76605a');
}

function campusProps(rect, season) {
  if (season === 'winter') {
    snowman(rect, 222, 148);
  } else if (season === 'spring') {
    // Flower bed along the path in front of the main building.
    rect(197, 131, 34, 7, '#8b615d');
    rect(196, 130, 36, 2, '#b57e72');
    for (let i = 0; i < 7; i++) {
      const x = 199 + i * 5;
      const y = 125 - (i * 3) % 5;
      rect(x, y + 2, 1, 130 - y, '#4c7352');
      rect(x - 1, y, 3, 2, i % 2 ? '#f8c1d1' : '#e78eaf');
      rect(x, y + 1, 1, 1, '#f9dbad');
    }
  } else if (season === 'autumn') {
    for (const [x, y, width] of [[63, 140, 28], [225, 142, 28], [270, 148, 24]]) {
      rect(x, y, width, 3, '#945047');
      rect(x + 3, y - 2, width - 7, 4, '#c27446');
      rect(x + 7, y - 4, width - 17, 3, '#efad58');
      rect(x + width - 6, y - 1, 3, 1, '#e69a57');
    }
  }
}

function campus(rect, season) {
  const palette = CAMPUS_SEASONS[season];
  rect(0, 0, 320, 132, palette.sky[0]);
  rect(0, 54, 320, 78, palette.sky[1]);
  rect(0, 87, 320, 45, palette.sky[2]);
  if (season === 'summer') summerSun(rect);
  else if (season !== 'winter') rect(245, 16, 12, 12, '#f1d7a5');
  for (const [x, y, width] of [[26, 23, 41], [103, 11, 31], [220, 38, 51], [282, 22, 28]]) {
    rect(x, y + 3, width, 3, '#d9d8bc');
    rect(x + 9, y, width - 18, 4, '#e9dfc6');
  }
  rect(0, 115, 320, 26, palette.ground[0]);
  // Collegiate Gothic wings, buttresses and crenellated central tower.
  stonework(rect, 31, 68, 258, 57);
  for (const wing of [31, 193]) {
    rect(wing - 5, 64, 106, 5, '#54464b');
    rect(wing, 59, 96, 5, '#765b59');
    for (let x = wing + 8; x < wing + 90; x += 19) {
      arch(rect, x, 76, 12, 17, '#dfcfad', '#51666a');
      arch(rect, x, 101, 12, 16, '#d6bd9a', '#5e6a66');
    }
    rect(wing, 95, 96, 2, '#ded0b3');
  }
  stonework(rect, 127, 42, 66, 84);
  for (let x = 125; x < 195; x += 13) {
    rect(x, 35, 7, 9, '#aa987d');
    rect(x, 34, 7, 2, '#e4cba4');
  }
  rect(124, 43, 72, 4, '#786d62');
  rect(126, 46, 68, 2, '#e8d4af');
  for (const x of [128, 186]) {
    rect(x, 48, 5, 73, '#d7c4a5');
    rect(x + 5, 48, 2, 73, '#8c7d70');
  }
  for (const x of [139, 154, 169]) arch(rect, x, 57, 12, 22, '#e0c8a4', '#526566');
  arch(rect, 148, 94, 24, 31, '#e4ceac', '#40383d');
  rect(142, 85, 36, 5, '#782b3d');
  rect(151, 87, 18, 1, '#d8b47f');
  for (let i = 0; i < 3; i++) {
    rect(140 - i * 4, 124 + i * 3, 40 + i * 8, 3, i % 2 ? '#a59480' : '#d4c3a3');
  }
  for (const [x, ground] of [[16, 133], [67, 129], [263, 130], [303, 136]]) {
    tree(rect, x, ground, palette.tree);
  }
  rect(0, 136, 320, 4, palette.ground[1]);
  paving(rect, 140, palette.paving);
  if (season === 'winter') {
    for (const [x, y, width] of [[31, 58, 96], [193, 58, 96], [126, 33, 68], [132, 130, 56]]) {
      rect(x, y, width, 2, palette.scatter);
    }
  }
  for (let i = 0; i < 31; i++) {
    const x = (16 + 53 * i) % 316;
    const y = 134 + (11 * i) % 36;
    rect(x, y, season === 'winter' ? 4 + i % 5 : 2, 1, palette.scatter);
    if (season === 'spring' || season === 'winter') {
      rect((x + 32) % 318, 17 + (23 * i) % 105, 1, 1, palette.scatter);
    }
  }
  for (const x of [104, 216]) {
    rect(x, 111, 2, 27, '#594a47');
    rect(x - 2, 109, 6, 5, '#654c3e');
    rect(x - 1, 110, 4, 3, '#ffdda4');
    rect(x + 2, 116, 10, 9, '#812d43');
    rect(x + 4, 117, 6, 1, '#eac087');
  }
  campusProps(rect, season);
}

function paving(rect, top, colors) {
  stonework(rect, 0, top, 320, 180 - top, colors);
  rect(0, top, 320, 2, colors[2]);
  rect(0, 176, 320, 4, colors[3]);
}

function library(rect) {
  rect(0, 0, 320, 143, '#3d354c');
  rect(0, 16, 320, 10, '#655168');
  for (const x of [11, 83, 173, 245]) {
    rect(x, 31, 64, 87, '#563748');
    rect(x + 4, 35, 56, 79, '#312b3c');
    for (let row = 0; row < 4; row++) {
      const y = 49 + row * 19;
      for (let book = 0; book < 12; book++) {
        const height = 8 + (book * 7 + row * 3) % 7;
        rect(x + 6 + book * 4, y - height, 3, height, ['#bd7764', '#c4a271', '#688382', '#8d6573'][ (book + row) % 4 ]);
      }
      rect(x + 3, y, 58, 3, '#9c6455');
    }
  }
  arch(rect, 147, 31, 26, 79, '#ae8872', '#687a8c');
  paving(rect, 119, ['#806259', '#694e4b', '#a27d64', '#4b3c46']);
  for (const x of [21, 193]) desk(rect, x, 130, 105, true);
}

function desk(rect, x, y, width, lamp) {
  rect(x + 4, y + 3, 4, 14, '#513945');
  rect(x + width - 8, y + 3, 4, 14, '#513945');
  rect(x, y, width, 5, '#955b4c');
  rect(x, y, width, 1, '#d6a67a');
  rect(x + 13, y - 4, 17, 4, '#ded0a9');
  rect(x + 21, y - 4, 1, 4, '#a58e6d');
  if (lamp) {
    rect(x + width - 21, y - 12, 2, 12, '#c9a269');
    rect(x + width - 26, y - 15, 12, 5, '#efc989');
  }
}

function lectureHall(rect) {
  rect(0, 0, 320, 130, '#c6baa2');
  rect(0, 9, 320, 5, '#e7d9b6');
  rect(62, 31, 196, 55, '#8c695c');
  rect(67, 36, 186, 44, '#405d55');
  for (const [x, y, width] of [[82, 45, 37], [82, 53, 49], [174, 46, 42], [174, 59, 30]]) {
    rect(x, y, width, 1, '#bac9a5');
  }
  for (const x of [12, 269]) arch(rect, x, 29, 38, 54, '#eee0bb', '#8caaa6');
  paving(rect, 108, ['#a99883', '#93826f', '#c9b393', '#635558']);
  for (let i = 0; i < 4; i++) {
    desk(rect, 15 + i * 77, 107, 57, false);
    desk(rect, 8 + i * 81, 133, 67, false);
  }
}

function clubRoom(rect) {
  rect(0, 0, 320, 134, '#686080');
  rect(0, 14, 320, 4, '#907a8b');
  for (let x = 4; x < 320; x += 9) {
    const y = 18 + Math.floor(9 * Math.sin(x * Math.PI / 320));
    rect(x, y, 9, 1, '#44394e');
    if (x % 2 === 0) rect(x + 3, y + 1, 3, 3, '#ffcf83');
  }
  rect(30, 43, 111, 56, '#5a394f');
  rect(34, 47, 103, 48, '#a87974');
  for (let i = 0; i < 8; i++) {
    const x = 39 + (i % 4) * 24;
    const y = 51 + Math.floor(i / 4) * 20 + i % 3;
    rect(x, y, 15, 16, ['#e4aa83', '#cbd1a3', '#deb4bb'][i % 3]);
    rect(x + 3, y + 6, 9, 1, '#975e60');
    rect(x + 3, y + 9, 6, 1, '#975e60');
  }
  arch(rect, 195, 39, 93, 64, '#ae8490', '#413c67');
  rect(207, 70, 11, 27, '#595779');
  rect(234, 61, 17, 36, '#595779');
  rect(265, 75, 13, 22, '#595779');
  paving(rect, 118, ['#8c6476', '#744f64', '#aa7882', '#4e3a57']);
  rect(184, 108, 115, 22, '#984c60');
  rect(179, 117, 125, 14, '#ba6273');
  rect(186, 130, 113, 5, '#663b55');
  desk(rect, 45, 131, 82, true);
}

function cafe(rect) {
  rect(0, 0, 320, 128, '#a97763');
  rect(0, 14, 320, 6, '#714c50');
  arch(rect, 21, 36, 64, 62, '#e6bc96', '#8aa49d');
  rect(105, 32, 105, 50, '#694750');
  rect(110, 37, 95, 40, '#40393f');
  for (let i = 0; i < 5; i++) {
    rect(120, 44 + i * 6, 28 + i % 3 * 7, 1, '#dfba9b');
    rect(182, 44 + i * 6, 12, 1, '#dfba9b');
  }
  rect(227, 55, 78, 33, '#775251');
  for (let x = 232; x < 296; x += 11) {
    rect(x, 65 - x % 3, 7, 17, '#d9b08a');
    rect(x, 65 - x % 3, 7, 3, '#754953');
    rect(x + 1, 75, 5, 3, '#ead0a3');
  }
  for (const x of [97, 222, 280]) {
    rect(x, 20, 1, 25, '#68484a');
    rect(x - 5, 42, 11, 5, '#efbd7e');
    rect(x - 7, 47, 15, 2, '#ffdda1');
  }
  paving(rect, 127, ['#9e7365', '#835b56', '#c38e70', '#5a4249']);
  rect(102, 101, 218, 28, '#794451');
  rect(102, 100, 218, 5, '#e1aa7e');
  for (let x = 112; x < 320; x += 15) rect(x, 107, 2, 19, '#9d5960');
  rect(234, 90, 29, 10, '#554652');
  rect(238, 88, 18, 3, '#c7a996');
  desk(rect, 13, 129, 61, false);
}

function stadium(rect) {
  rect(0, 0, 320, 180, '#8eacb9');
  rect(0, 33, 320, 43, '#c5c5af');
  for (const x of [28, 274]) {
    rect(x, 25, 3, 53, '#566575');
    rect(x - 8, 20, 20, 7, '#505c6c');
    for (let offset = -6; offset <= 8; offset += 4) rect(x + offset, 22, 3, 3, '#f3e3b2');
  }
  rect(0, 54, 320, 44, '#626573');
  for (let row = 0; row < 6; row++) {
    const y = 55 + row * 7;
    rect(0, y + 4, 320, 2, '#9d9791');
    for (let x = 2 + row % 2 * 3; x < 318; x += 5) {
      const team = x < 160 ? ['#97334d', '#d25c68', '#e6a182'] : ['#3f5c92', '#657eae', '#9db4c7'];
      rect(x, y, 3, 4, team[(x + row) % 3]);
    }
  }
  rect(131, 18, 58, 29, '#3d4356');
  rect(134, 21, 52, 22, '#252d42');
  rect(137, 25, 13, 14, '#a83d57');
  rect(170, 25, 13, 14, '#557cac');
  rect(155, 30, 10, 2, '#f4d69b');
  rect(0, 98, 320, 13, '#8a5057');
  rect(0, 101, 320, 1, '#eab38b');
  rect(0, 108, 320, 1, '#eab38b');
  rect(0, 111, 320, 69, '#5c875a');
  for (let x = 0; x < 320; x += 44) rect(x, 112, 22, 68, '#6a985f');
  rect(0, 120, 320, 1, '#e4e6c1');
  rect(0, 167, 320, 1, '#e4e6c1');
  rect(160, 120, 1, 48, '#e4e6c1');
  for (const [x, w] of [[144, 33], [140, 41]]) {
    const y = x === 144 ? 135 : 138;
    rect(x, y, w, 1, '#e4e6c1');
    rect(x, 282 - y, w, 1, '#e4e6c1');
  }
  rect(139, 141, 1, 5, '#e4e6c1');
  rect(181, 141, 1, 5, '#e4e6c1');
}

function festivalField(rect) {
  rect(0, 0, 320, 180, '#353953');
  rect(0, 44, 320, 70, '#554963');
  rect(251, 15, 12, 12, '#f9d7a4');
  for (let i = 0; i < 22; i++) rect((i * 53 + 11) % 318, 5 + i * 13 % 39, 1, 1, '#e9bac1');
  const trees = ['#273f49', '#34584d', '#47725a', '#63876a'];
  for (const x of [9, 33, 59, 267, 291, 313]) tree(rect, x, 112, trees);
  rect(0, 108, 320, 72, '#406d57');
  for (let y = 117; y < 180; y += 12) rect(0, y, 320, 5, '#4b7c5d');
  for (let i = 0; i < 45; i++) rect((i * 47) % 320, 112 + i * 19 % 66, 3, 1, '#67926c');

  // Open-air stage with light towers, LED panels, and a crowd at the edge of the field.
  rect(77, 53, 166, 44, '#242638');
  rect(68, 49, 184, 5, '#d3a1ac');
  rect(86, 60, 148, 34, '#74374f');
  rect(103, 64, 114, 26, '#a64c70');
  for (let i = 0; i < 15; i++) {
    const height = 4 + i * 7 % 16;
    rect(108 + i * 7, 87 - height, 4, height, i % 2 ? '#f19c9d' : '#f0c28e');
  }
  for (const x of [68, 246]) {
    rect(x, 53, 5, 50, '#c098a7');
    rect(x - 3, 72, 11, 28, '#302a40');
    rect(x, 75, 5, 5, '#6f5e75');
    rect(x, 86, 5, 6, '#6f5e75');
  }
  for (let x = 82; x <= 232; x += 15) rect(x, 54, 6, 3, x % 2 ? '#e99abd' : '#f7d78f');
  rect(65, 96, 190, 6, '#b38182');
  rect(65, 102, 190, 4, '#4d364e');
  for (let i = 0; i < 38; i++) {
    const x = 45 + i * 6;
    const y = 109 + i * 13 % 14;
    rect(x, y, 4, 7, ['#6c374c', '#a54d66', '#d28e8d', '#493e53'][i % 4]);
    rect(x + 1, y - 2, 2, 2, '#daa58b');
    if (i % 3 === 0) rect(x + 3, y - 4, 1, 3, '#fff1b5');
  }
}

export function drawPixelBackground(ctx, scene, semester, season = getSeasonFromSemester(semester)) {
  const rect = (x, y, width, height, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  };
  switch (scene) {
    case 'study': library(rect); break;
    case 'exam': lectureHall(rect); break;
    case 'club': clubRoom(rect); break;
    case 'parttime': cafe(rect); break;
    case 'koyeonjeon': stadium(rect); break;
    case 'ipselenti': festivalField(rect); break;
    default: campus(rect, season);
  }
}

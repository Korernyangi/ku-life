import { STATS } from './config.js';

const statPixels = {
  hp: ['01100110', '11111111', '11111111', '11111111', '01111110', '00111100', '00011000', '00000000'],
  intelligence: ['00111000', '01101100', '11011110', '11100111', '10111101', '01110110', '00001110', '00000100'],
  social: ['01111110', '11111111', '11111111', '11010111', '11111111', '01111110', '00110000', '00100000'],
  mental: ['00011000', '00011000', '10011001', '11111111', '01111110', '00111100', '01100110', '01000010'],
};

const itemColors = {
  K: '#342431',
  W: '#fff0c9',
  T: '#d7b07d',
  Y: '#f7cd70',
  R: '#9f344e',
  P: '#d66d7a',
  B: '#536b88',
  A: '#8bced1',
  G: '#659577',
};

// Each row is one line of a 12 × 12 transparent sprite.
const itemPixels = {
  notes: [
    '............',
    '...KKKKKK...',
    '..KWWWWWWK..',
    '..KWWTTWWKK.',
    '..KWKWWWWTK.',
    '..KWWWWWWTK.',
    '..KWTTTWWTK.',
    '..KWWWWWWTK.',
    '..KWWRRWWTK.',
    '..KKKKKKKTK.',
    '...KKKKKKKK.',
    '............',
  ],
  laptop: [
    '............',
    '............',
    '..KKKKKKKK..',
    '..KBBBBBBK..',
    '..KBAAABBK..',
    '..KBBAABBK..',
    '..KBBBBBBK..',
    '..KKKKKKKK..',
    '.KTTTWWTTTK.',
    'KKKKKKKKKKKK',
    '............',
    '............',
  ],
  tablet: [
    '............',
    '...KKKKKK...',
    '..KBBBBBBK..',
    '..KAAAAABK..',
    '..KAAWWABK..',
    '..KAAAABBK..',
    '..KAABBBBK..',
    '..KABBBBBK..',
    '..KBBBBBBK..',
    '..KBBWBBBK..',
    '...KKKKKK...',
    '............',
  ],
  vitamins: [
    '............',
    '....KKKK....',
    '...KTTTTK...',
    '...KKKKKK...',
    '...KWWWWK...',
    '..KWWWWWWK..',
    '..KWPYYWWK..',
    '..KWPYYWWK..',
    '..KWTYTWWK..',
    '..KWWWWTWK..',
    '...KKKKKK...',
    '............',
  ],
  console: [
    '............',
    '............',
    '.KKKKKKKKKK.',
    'KRRRBBBBRRRK',
    'KRKRBAABRYRK',
    'KKKKBAABRRGK',
    'KRKRBBBBRGRK',
    'KPRRRRRRRRPK',
    '.KKKKKKKKKK.',
    '............',
    '............',
    '............',
  ],
  jacket: [
    '............',
    '...KK..KK...',
    '..KWWKKWWK..',
    '.KWWRRRRWWK.',
    'KWWWRWWRWWWK',
    'KWWKRWRRKWWK',
    'KWWKRRPRKWWK',
    '.KKKRRRRKKK.',
    '...KTRRTK...',
    '...KWWWWK...',
    '...KKKKKK...',
    '............',
  ],
  counseling: [
    '............',
    '............',
    '..KKKKKKKK..',
    '.KGGGGGGGGK.',
    'KKWPWWWWGGKK',
    '.KWPPWWWGGK.',
    '.KWPWWWWGGK.',
    'KKWWWWWWGGKK',
    '.KGGGGGGGGK.',
    '..KKKKKKKK..',
    '............',
    '............',
  ],
  charm: [
    '............',
    '.....KK.....',
    '....KYYK....',
    '.....KK.....',
    '....KYYK....',
    '...KYWWYK...',
    '...KYRRPK...',
    '...KYRRPK...',
    '...KTPPTK...',
    '....KKKK....',
    '....R..R....',
    '............',
  ],
  textbook: [
    '............',
    '..KKKKKKK...',
    '.KRRRRRRRK..',
    '.KRRWWRRRK..',
    '.KRRWWRRRK..',
    '.KRRTTRRRK..',
    '.KRRRRRRRK..',
    '.KKKKKKKKK..',
    '.KWWWWWWT.K.',
    '..KKKKKKKKK.',
    '............',
    '............',
  ],
  equipment: [
    '............',
    '............',
    '..KK....KK..',
    '.KBBK..KBBK.',
    'KBBBBKKBBBBK',
    'KBBBAAABBBBK',
    'KBBBATBBBBBK',
    'KBBBBKKBBBBK',
    '.KBBK..KBBK.',
    '..KK....KK..',
    '............',
    '............',
  ],
};

export function statSprite(stat, fill = 'full') {
  return `<canvas width="8" height="8" aria-hidden="true" data-stat="${stat}" data-fill="${fill}"></canvas>`;
}

export function itemSprite(item) {
  return `<canvas class="item-sprite" width="12" height="12" aria-hidden="true" data-item="${item}"></canvas>`;
}

export function paintSprites(root) {
  for (const canvas of root.querySelectorAll('canvas[data-stat]')) {
    const { stat, fill } = canvas.dataset;
    const context = canvas.getContext('2d');
    statPixels[stat].forEach((row, y) => [...row].forEach((pixel, x) => {
      if (pixel === '0') return;
      context.fillStyle = fill === 'full' || (fill === 'half' && x < 4) ? STATS[stat].color : '#593949';
      context.fillRect(x, y, 1, 1);
    }));
  }

  for (const canvas of root.querySelectorAll('.item-sprite')) {
    const context = canvas.getContext('2d');
    for (const [y, row] of itemPixels[canvas.dataset.item].entries()) {
      for (const [x, pixel] of [...row].entries()) {
        if (pixel === '.') continue;
        context.fillStyle = itemColors[pixel];
        context.fillRect(x, y, 1, 1);
      }
    }
  }
}

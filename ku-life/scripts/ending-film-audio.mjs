const rate = 48_000;
const tone = (frequency, seconds) => Math.sin(2 * Math.PI * frequency * seconds);
const ring = (frequency, decay, seconds) => tone(frequency, seconds) * Math.exp(-seconds * decay);

const effects = {
  bell: [.98, (t, n) => .42 * ring(1091, 4.8, t) + .26 * ring(1713, 7, t) + .12 * ring(2430, 10, t) + .08 * n * Math.exp(-t * 70)],
  cup: [.28, (t, n) => .42 * ring(1340, 16, t) + .19 * ring(2740, 29, t) + .2 * n * Math.exp(-t * 46)],
  key: [.33, (t, n) => .26 * ring(1873, 15, t) + .16 * ring(3388, 29, t) + .24 * n * Math.exp(-t * 33)],
  foot: [.19, (t, n) => .45 * ring(86, 22, t) + .38 * n * Math.exp(-t * 25)],
  paper: [.42, (t, n) => n * (.42 + .24 * tone(21, t)) * Math.exp(-t * 3.9)],
  slide: [.65, (t, n) => (.48 * n + .15 * tone(142, t)) * Math.sin(Math.PI * t / .65) ** 2],
  phone: [.55, t => {
    const pulse = t % .18;
    return (.51 * tone(879, t) + .17 * tone(1318, t)) * Math.sin(Math.PI * pulse / .105) ** 2 * Number(pulse < .105) * Math.exp(-t * 2.3);
  }],
  tap: [.13, (t, n) => .54 * ring(472, 45, t) + .33 * n * Math.exp(-t * 35)],
  motor: [.96, (t, n) => {
    const phase = 128 * t + 12 * t * t;
    const base = Math.sin(2 * Math.PI * phase);
    return (.36 * base + .12 * tone(252, t) + .16 * n) * Math.min(1, t * 22, (.96 - t) * 22);
  }],
  press: [.98, (t, n) => (.34 * tone(158, t) + .32 * n) * (.65 + .20 * tone(12, t)) * Math.min(1, t * 22, (.98 - t) * 22)],
  drop: [.26, (t, n) => .56 * ring(94, 16, t) + .30 * n * Math.exp(-t * 18)],
  chord: [3.1, t => .38 * ring(130.81, 1.1, t) + .17 * ring(195.99, 1.4, t) + .20 * ring(329.63, 1.8, t)],
  cloth: [.7, (t, n) => .55 * n * Math.sin(Math.PI * t / .7) ** 2 * (.52 + .17 * tone(7, t))],
  baby: [.70, (t, n) => {
    const phase = 424 * t + 34 * t * t + .28 * tone(5.5, t);
    const vowel = tone(1, phase) + .30 * tone(2, phase) + .16 * tone(3, phase);
    return (.54 * vowel + .18 * n) * Math.sin(Math.PI * t / .70) ** 2;
  }],
};

const cafeDoorSound = ['cafe', [[.20, 'bell', .43], [.39, 'foot', .13], [.47, 'foot', .12], [.63, 'cup', .12]]];

function cafeFilmSounds(memory) {
  return [
    cafeDoorSound,
    memory,
    ['cafe', [[.18, 'cup', .17], [.24, 'bell', .24], [.38, 'foot', .12], [.51, 'foot', .09], [.67, 'paper', .17]]],
    ['cafe', [[.21, 'paper', .12], [.35, 'slide', .15], [.54, 'key', .33], [.77, 'cloth', .13]]],
    ['outside', [[.22, 'foot', .11], [.32, 'key', .20], [.52, 'tap', .15], [.57, 'chord', .095]]],
    cafeDoorSound,
    ['cafe', [[.16, 'chord', .15], [.29, 'slide', .23], [.56, 'cup', .23]]],
  ];
}

const cuesByFilm = {
  family: [
    ['cafe', [[.22, 'paper', .12], [.56, 'cup', .14]]],
    ['night', [[.16, 'paper', .075], [.43, 'paper', .045]]],
    ['night', [[.08, 'baby', .14], [.24, 'foot', .12], [.39, 'foot', .11], [.58, 'paper', .10]]],
    ['night', [[.07, 'phone', .19], [.47, 'tap', .17], [.62, 'cup', .09]]],
  ],
  recovery: [
    ['cafe', []],
    ['cafe', [[.12, 'cup', .16], [.33, 'phone', .27], [.56, 'foot', .10], [.67, 'foot', .11], [.76, 'foot', .085]]],
    ['rain', [[.38, 'paper', .15]]],
    ['rain', []],
    ['rain', [[.27, 'tap', .065], [.66, 'tap', .075]]],
    ['rain', []],
    ['rain', [[.14, 'cup', .095], [.33, 'phone', .23], [.56, 'foot', .11], [.66, 'foot', .09], [.75, 'foot', .075]]],
    ['rain', []],
    ['rain', [[.16, 'tap', .11], [.44, 'paper', .11], [.50, 'slide', .065]]],
  ],
  cafe: cafeFilmSounds(['cafe', [[.26, 'phone', .15], [.45, 'paper', .15], [.75, 'tap', .10]]]),
  'cafe-short': cafeFilmSounds(['cafe', [[.22, 'slide', .14], [.38, 'cup', .21], [.65, 'foot', .09]]]),
  'cafe-rest': cafeFilmSounds(['room', [[.20, 'cloth', .16], [.64, 'cloth', .075]]]),
  newspaper: [
    ['room', [[.18, 'paper', .16], [.39, 'paper', .15], [.72, 'tap', .11]]],
    ['room', [[.20, 'tap', .13], [.62, 'paper', .08]]],
    ['outside', [[.26, 'foot', .07], [.36, 'foot', .07], [.52, 'foot', .06]]],
    ['room', [[.18, 'press', .22], [.55, 'paper', .19], [.73, 'tap', .08]]],
  ],
  claw: [
    ['arcade', [[.06, 'motor', .24], [.45, 'tap', .26], [.48, 'motor', .22]]],
    ['arcade', [[.15, 'tap', .14], [.50, 'slide', .14], [.63, 'drop', .17]]],
    ['arcade', [[.05, 'motor', .23], [.40, 'tap', .26], [.52, 'motor', .24], [.86, 'drop', .20]]],
    ['arcade', [[.27, 'paper', .14], [.58, 'tap', .12]]],
  ],
};

function ambient(kind, t, low, air) {
  switch (kind) {
    case 'rain': return .037 * air + .018 * low;
    case 'outside': return .035 * low * (.72 + .27 * tone(.88, t)) + air * .008;
    case 'cafe': return .032 * low + .004 * tone(99, t) + .006 * air;
    case 'arcade': return .026 * low + .009 * tone(120, t) + .004 * tone(242, t);
    case 'night': return .024 * low + .003 * tone(69, t);
    default: return .019 * low + .003 * tone(98, t);
  }
}

export function endingFilmAudio(id, shotSeconds) {
  const timeline = cuesByFilm[id];
  const total = Math.round(shotSeconds.reduce((sum, duration) => sum + duration, 0) * rate);
  const samples = new Float32Array(total);
  let seed = 0x6e73c2e1;
  const noise = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 0x8000_0000 - 1;
  };
  let elapsed = 0;
  for (const [index, duration] of shotSeconds.entries()) {
    const [room, cues] = timeline[index];
    const start = Math.round(elapsed * rate);
    elapsed += duration;
    const length = Math.round(elapsed * rate) - start;
    let low = 0;
    let air = 0;
    for (let n = 0; n < length; n++) {
      const wave = noise();
      low = low * .98 + wave * .02;
      air = air * .82 + wave * .18;
      const envelope = Math.min(1, n / 1700, (length - n) / 1700);
      samples[start + n] = ambient(room, (start + n) / rate, low, air) * envelope;
    }
    for (const [at, effect, gain] of cues) {
      const [seconds, wave] = effects[effect];
      const offset = Math.round(at * length);
      const stop = Math.min(Math.round(seconds * rate), length - offset);
      let filtered = 0;
      for (let i = 0; i < stop; i++) {
        filtered = .68 * filtered + .32 * noise();
        const envelope = Math.min(1, i / 54, (stop - i) / 290);
        samples[start + offset + i] += gain * envelope * wave(i / rate, filtered);
      }
    }
  }
  const wav = Buffer.alloc(44 + total * 2);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(total * 2, 40);
  for (let n = 0; n < total; n++) {
    wav.writeInt16LE(Math.round(32_767 * Math.tanh(samples[n] * 1.75)), 44 + n * 2);
  }
  return wav;
}

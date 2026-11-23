const WEATHER = {
  spring: { count: 28, speed: 13, drift: 17, colors: ['#ffd3dd', '#efa6bf', '#cf729b'] },
  summer: { count: 20, speed: 0, drift: 3, colors: ['#fff4ba', '#ffe18b', '#fff8df'] },
  autumn: { count: 25, speed: 18, drift: 25, colors: ['#f4b653', '#d9753e', '#ac4442'] },
  winter: { count: 43, speed: 19, drift: 8, colors: ['#ffffff', '#e8f5ff', '#c9e1ef'] },
};

const wrap = (value, span) => ((value % span) + span) % span;

export class CampusWeather {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.scale(2, 2);
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.time = 0;
  }

  setSeason(season) {
    if (season === this.season) return;
    this.season = season;
    this.time = 0;
    this.ctx.clearRect(0, 0, 320, 180);
    this.canvas.style.display = season ? '' : 'none';
  }

  update(deltaTime) {
    const weather = WEATHER[this.season];
    if (!weather) return;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, 320, 180);
    if (this.reducedMotion.matches) return;

    this.time += deltaTime;
    const { time, season } = this;
    for (let i = 0; i < weather.count; i++) {
      const phase = time * (1 + (i % 5) * 0.13) + i * 2.399;
      const sway = Math.sin(phase);
      const x = Math.floor(wrap(i * 79 + time * weather.drift + sway * 5, 328)) - 4;
      const y = Math.floor(wrap(i * 53 + time * weather.speed * (0.65 + i % 5 * 0.18), 188)) - 4;
      ctx.fillStyle = weather.colors[i % weather.colors.length];

      if (season === 'summer') {
        // Flecks flicker around the sunlit half of the quad.
        if (sway < 0.18) continue;
        const litX = 134 + Math.floor(x * 0.58);
        const litY = 14 + Math.floor(y * 0.76);
        ctx.globalAlpha = 0.35 + sway * 0.65;
        ctx.fillRect(litX, litY - 1, 1, 3);
        ctx.fillRect(litX - 1, litY, 3, 1);
      } else if (season === 'winter') {
        const size = i % 5 === 0 ? 2 : 1;
        ctx.fillRect(x, y, size, size);
        if (i % 11 === 0) {
          ctx.fillRect(x - 1, y, 4, 1);
          ctx.fillRect(x, y - 1, 1, 4);
        }
      } else {
        const tilt = sway > 0 ? 1 : -1;
        ctx.fillRect(x, y, season === 'spring' ? 2 : 3, 2);
        ctx.fillRect(x + tilt, y - 1, 2, 1);
        if (season === 'autumn') ctx.fillRect(x - tilt, y + 2, 1, 1);
      }
    }
    ctx.globalAlpha = 1;
  }
}

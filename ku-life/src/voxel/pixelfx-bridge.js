const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
const COLORS = {
  grade: '#f1c75b', hp: '#ee6d63', intelligence: '#7bb6e7', mental: '#b891e8',
  money: '#f3bd4e', relation: '#ed83ad', career: '#79a8ef',
};

export function getSeasonFromSemester(semester) {
  return SEASONS[Math.floor(((semester - 1) % 8) / 2)] || 'spring';
}

export async function createPixelfxManager(_sourceCanvas, host) {
  const canvas = document.createElement('canvas');
  canvas.className = 'pixel-fx-layer';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;image-rendering:pixelated';
  host.appendChild(canvas);
  const context = canvas.getContext('2d');
  const particles = [];
  let width = 1, height = 1, season = 'spring', transition = null;
  const resize = (w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight) => {
    width = Math.max(1, Math.floor(w)); height = Math.max(1, Math.floor(h));
    canvas.width = width; canvas.height = height;
  };
  resize();

  const burst = (x, y, color, count = 10, label = '') => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2, speed = 24 + Math.random() * 75;
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 20,
        life: .45 + Math.random() * .45, maxLife: 0, size: 3 + Math.floor(Math.random() * 5), color, label: i === 0 ? label : '' });
      particles.at(-1).maxLife = particles.at(-1).life;
    }
  };
  const manager = {
    effectCanvas: canvas,
    async setSeason(value) { season = SEASONS.includes(value) ? value : 'spring'; },
    resize,
    async playStatChange(stat, delta, x = width / 2, y = height / 2) {
      burst(x, y, COLORS[stat] || '#fff0a8', 8, `${stat} ${delta > 0 ? '+' : ''}${delta}`);
    },
    async playMoneyChange(delta, x = width / 2, y = height / 2) {
      burst(x, y, '#f4c24e', 12, `${delta > 0 ? '+' : ''}${delta}원`);
    },
    async playHeal(x = width / 2, y = height / 2) { burst(x, y, '#8fe0a2', 12, '회복'); },
    async playBurn(x = width / 2, y = height / 2) { burst(x, y, '#f17862', 12, '피로'); },
    async changeScene(from, to) {
      if (from === to) return;
      transition = { elapsed: 0, duration: .32, color: to === 'club' ? '#ec9ac2' : '#ead39a' };
    },
    update(delta) {
      for (const p of particles) {
        p.life -= delta; p.x += p.vx * delta; p.y += p.vy * delta; p.vy += 95 * delta;
      }
      for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);
      if (transition) { transition.elapsed += delta; if (transition.elapsed >= transition.duration) transition = null; }
    },
    draw() {
      context.clearRect(0, 0, width, height);
      if (transition) {
        const progress = transition.elapsed / transition.duration;
        context.globalAlpha = Math.sin(progress * Math.PI) * .14;
        context.fillStyle = transition.color; context.fillRect(0, 0, width, height); context.globalAlpha = 1;
      }
      for (const p of particles) {
        const alpha = Math.max(0, p.life / p.maxLife);
        context.globalAlpha = alpha; context.fillStyle = p.color;
        context.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        if (p.label) {
          context.font = 'bold 14px system-ui, sans-serif'; context.textAlign = 'center';
          context.lineWidth = 3; context.strokeStyle = '#17202acc'; context.strokeText(p.label, p.x, p.y - 9);
          context.fillStyle = '#fff8e8'; context.fillText(p.label, p.x, p.y - 9);
        }
      }
      context.globalAlpha = 1;
      // 계절별 모서리 픽셀은 작은 장식으로만 표시해 배경과 프로필을 가리지 않는다.
      const seasonColor = { spring: '#f5b7c4', summer: '#f4d16f', autumn: '#de8353', winter: '#c4d9ed' }[season];
      context.globalAlpha = .7; context.fillStyle = seasonColor;
      for (let i = 0; i < 3; i++) context.fillRect(12 + i * 8, height - 18 - i * 5, 4, 4);
      context.globalAlpha = 1;
    },
  };
  return manager;
}

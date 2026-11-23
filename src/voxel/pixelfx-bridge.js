// Pixelfx Bridge - Integrates pixelfx effects into the KU Life game
// Maps game events/scenes to appropriate pixel art effects

import { Pixels, painter, createCanvas, loadFont } from './core/index.js';

// Effect imports - will be loaded dynamically to avoid bundling all at once
const effectCache = new Map();

async function loadEffect(category, name) {
  const key = `${category}/${name}`;
  if (effectCache.has(key)) return effectCache.get(key);

  try {
    const module = await import(`../.claude/plugins/marketplaces/pixelfx/src/fx/${category}/${name}.js`);
    effectCache.set(key, module);
    return module;
  } catch (e) {
    console.warn(`Failed to load effect ${key}:`, e);
    return null;
  }
}

// Preload commonly used effects
export async function preloadEffects() {
  const effects = [
    ['weather', 'cherry-blossoms'],
    ['weather', 'rain'],
    ['weather', 'falling-leaves'],
    ['weather', 'snow'],
    ['weather', 'blizzard'],
    ['ui', 'crit-number'],
    ['ui', 'coin-collect'],
    ['holy', 'heal'],
    ['status', 'burning'],
    ['status', 'frozen'],
    ['transitions', 'iris'],
    ['transitions', 'blinds'],
    ['impacts', 'pop'],
    ['pickups', 'coin'],
  ];

  await Promise.all(effects.map(([cat, name]) => loadEffect(cat, name)));
}

// ============================================================
// Seasonal Weather Effects
// ============================================================

export class PixelfxWeather {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.effect = null;
    this.currentSeason = null;
    this.time = 0;
    this.pixels = new Pixels(canvas.width, canvas.height);
    this.options = {
      scale: options.scale || 2,
      ...options
    };
  }

  async setSeason(season) {
    if (this.currentSeason === season) return;
    this.currentSeason = season;
    this.time = 0;

    // Clean up previous effect
    this.effect = null;

    // Load new seasonal effect
    const effectMap = {
      spring: ['weather', 'cherry-blossoms'],
      summer: ['weather', 'rain'],
      autumn: ['weather', 'falling-leaves'],
      winter: ['weather', 'snow'],
    };

    const [cat, name] = effectMap[season] || ['weather', 'cherry-blossoms'];
    const module = await loadEffect(cat, name);

    if (module && module.create) {
      this.effect = module.create({
        palette: module.meta.options?.palette,
        seed: module.meta.options?.seed,
        ...this.getSeasonOptions(season)
      });
    }
  }

  getSeasonOptions(season) {
    const configs = {
      spring: { density: 1.2 },
      summer: { density: 1.0 },
      autumn: { density: 1.1 },
      winter: { density: 0.8 },
    };
    return configs[season] || {};
  }

  update(dt) {
    this.time += dt;
    if (this.effect && this.effect.update) {
      this.effect.update(dt);
    }
  }

  draw() {
    if (!this.effect) return;

    const p = painter(this.pixels);

    // Draw background layer if exists
    if (this.effect.drawBack) {
      this.effect.drawBack(p, this.time, this.effect.options || {});
    }

    // Draw main layer
    if (this.effect.draw) {
      this.effect.draw(p, this.time, this.effect.options || {});
    }

    // Render to canvas
    this.pixels.draw(this.ctx, this.options.scale);
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.pixels = new Pixels(width, height);
  }
}

// ============================================================
// Scene Transition Effects
// ============================================================

export class PixelfxTransition {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.effect = null;
    this.active = false;
    this.onComplete = null;
    this.pixels = new Pixels(canvas.width, canvas.height);
  }

  async play(type, options = {}) {
    if (this.active) return;
    this.active = true;

    const effectMap = {
      iris: ['transitions', 'iris'],
      blinds: ['transitions', 'blinds'],
      fade: ['transitions', 'iris'], // fallback
    };

    const [cat, name] = effectMap[type] || ['transitions', 'iris'];
    const module = await loadEffect(cat, name);

    if (!module || !module.create) {
      this.active = false;
      if (this.onComplete) this.onComplete();
      return;
    }

    this.effect = module.create({
      palette: module.meta.options?.palette,
      seed: module.meta.options?.seed,
      focus: options.focus || [this.canvas.width / 2, this.canvas.height / 2],
      color: options.color,
      ...options
    });

    const duration = module.meta.duration || 1.5;
    const startTime = performance.now() / 1000;

    const animate = (now) => {
      if (!this.active) return;

      const elapsed = (performance.now() / 1000) - startTime;
      const p = painter(this.pixels);

      if (this.effect.update) {
        this.effect.update(1/60);
      }
      if (this.effect.draw) {
        this.effect.draw(p, elapsed, this.effect.options || {});
      }
      this.pixels.draw(this.ctx, 1);

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        this.active = false;
        this.effect = null;
        if (this.onComplete) this.onComplete();
      }
    };

    requestAnimationFrame(animate);
  }

  stop() {
    this.active = false;
    this.effect = null;
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.pixels = new Pixels(width, height);
  }
}

// ============================================================
// One-shot Event Effects (stat changes, rewards, etc.)
// ============================================================

export class PixelfxEventEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.activeEffects = [];
    this.pixels = new Pixels(canvas.width, canvas.height);
  }

  // Play a one-shot effect at a specific position
  async play(type, x, y, options = {}) {
    const effectMap = {
      'stat-up': ['ui', 'crit-number'],
      'stat-down': ['impacts', 'pop'],
      'money-gain': ['ui', 'coin-collect'],
      'money-loss': ['impacts', 'pop'],
      'heal': ['holy', 'heal'],
      'burn': ['status', 'burning'],
      'freeze': ['status', 'frozen'],
      'levelup': ['ui', 'crit-number'],
      'pickup': ['pickups', 'coin'],
    };

    const [cat, name] = effectMap[type] || ['impacts', 'pop'];
    const module = await loadEffect(cat, name);

    if (!module || !module.create) return null;

    const effect = module.create({
      palette: module.meta.options?.palette,
      seed: module.meta.options?.seed,
      text: options.text,
      label: options.label,
      count: options.count,
      from: options.from,
      ...options
    });

    const duration = module.meta.duration || 1.5;
    const startTime = performance.now() / 1000;

    const effectInstance = {
      effect,
      startTime,
      duration,
      x,
      y,
      module,
      done: false
    };

    this.activeEffects.push(effectInstance);
    return effectInstance;
  }

  update() {
    const now = performance.now() / 1000;
    this.activeEffects = this.activeEffects.filter(e => {
      if (e.done) return false;
      const elapsed = now - e.startTime;
      if (elapsed >= e.duration) {
        e.done = true;
        return false;
      }
      if (e.effect.update) {
        e.effect.update(1/60);
      }
      return true;
    });
  }

  draw() {
    if (this.activeEffects.length === 0) return;

    const p = painter(this.pixels);

    for (const inst of this.activeEffects) {
      const elapsed = performance.now() / 1000 - inst.startTime;
      if (inst.effect.draw) {
        // Translate to effect position
        p.translate(inst.x, inst.y);
        inst.effect.draw(p, elapsed, inst.effect.options || {});
        p.translate(-inst.x, -inst.y);
      }
    }

    this.pixels.draw(this.ctx, 1);
  }

  clear() {
    this.activeEffects = [];
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.pixels = new Pixels(width, height);
  }
}

// ============================================================
// Main Integration Manager
// ============================================================

export class PixelfxManager {
  constructor(gameCanvas, uiCanvas) {
    this.gameCanvas = gameCanvas;
    this.uiCanvas = uiCanvas;

    // Create overlay canvas for pixelfx effects
    this.effectCanvas = document.createElement('canvas');
    this.effectCanvas.style.position = 'absolute';
    this.effectCanvas.style.top = '0';
    this.effectCanvas.style.left = '0';
    this.effectCanvas.style.pointerEvents = 'none';
    this.effectCanvas.style.zIndex = '10';
    this.effectCanvas.width = gameCanvas.width;
    this.effectCanvas.height = gameCanvas.height;
    gameCanvas.parentElement.appendChild(this.effectCanvas);

    this.weather = new PixelfxWeather(this.effectCanvas);
    this.transition = new PixelfxTransition(this.effectCanvas);
    this.eventEffects = new PixelfxEventEffect(this.effectCanvas);

    this.currentScene = 'campus';
    this.lastSeason = null;
  }

  async init() {
    await preloadEffects();
    this.resize(this.gameCanvas.width, this.gameCanvas.height);
  }

  resize(width, height) {
    this.effectCanvas.width = width;
    this.effectCanvas.height = height;
    this.weather.resize(width, height);
    this.transition.resize(width, height);
    this.eventEffects.resize(width, height);
  }

  // Called each frame
  update(dt) {
    this.weather.update(dt);
    this.eventEffects.update();
  }

  // Called each frame after Three.js render
  draw() {
    this.weather.draw();
    this.eventEffects.draw();
    // Transition draws itself in its own animation loop
  }

  // Season change
  async setSeason(season) {
    await this.weather.setSeason(season);
    this.lastSeason = season;
  }

  // Scene transition
  async changeScene(fromScene, toScene) {
    this.currentScene = toScene;
    return new Promise(resolve => {
      this.transition.onComplete = resolve;
      this.transition.play('iris', {
        focus: [this.effectCanvas.width / 2, this.effectCanvas.height / 2]
      });
    });
  }

  // Event feedback effects
  async playStatChange(stat, delta, x, y) {
    const type = delta > 0 ? 'stat-up' : 'stat-down';
    const text = `${delta > 0 ? '+' : ''}${delta}`;
    const labels = {
      grade: '학점',
      hp: '체력',
      mental: '멘탈',
      money: '돈',
      relation: '인간관계',
      career: '커리어'
    };
    await this.eventEffects.play(type, x, y, {
      text,
      label: labels[stat] || stat
    });
  }

  async playMoneyChange(amount, x, y) {
    const type = amount > 0 ? 'money-gain' : 'money-loss';
    await this.eventEffects.play(type, x, y, {
      count: Math.abs(amount),
      from: 0
    });
  }

  async playHeal(x, y) {
    await this.eventEffects.play('heal', x, y);
  }

  async playBurn(x, y) {
    await this.eventEffects.play('burn', x, y);
  }

  async playFreeze(x, y) {
    await this.eventEffects.play('freeze', x, y);
  }

  async playLevelUp(x, y) {
    await this.eventEffects.play('levelup', x, y, {
      text: 'LEVEL UP!',
      label: '승급'
    });
  }

  cleanup() {
    this.weather.setSeason(null);
    this.transition.stop();
    this.eventEffects.clear();
    if (this.effectCanvas.parentElement) {
      this.effectCanvas.parentElement.removeChild(this.effectCanvas);
    }
  }
}

// Export convenience function for main.js
export async function createPixelfxManager(gameCanvas, uiCanvas) {
  const manager = new PixelfxManager(gameCanvas, uiCanvas);
  await manager.init();
  return manager;
}
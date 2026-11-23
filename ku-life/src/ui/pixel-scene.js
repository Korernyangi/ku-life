import { CampusWeather } from './campus-weather.js';
import { getSeasonFromSemester } from '../voxel/particles.js';
import { drawPixelBackground } from './pixel-backgrounds.js';

export function drawPixelStudent(ctx, state, x, y, scale = 1, pose = null) {
  const look=state?.appearance||{hairStyle:'short',hairColor:'#241b20',skinTone:'#e9b995',outfitColor:'#8b1e2d',accessory:'none'};
  let bodyOffset = 0;
  const r=(dx,dy,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x+dx*scale,y+(dy+bodyOffset)*scale,w*scale,h*scale)};
  const tint=(hex,amount)=>{const n=parseInt(hex.slice(1),16),c=[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,v+amount)));return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join('')};
  const dark='#252b38', shoe='#292b35', skin=look.skinTone, skinShade=tint(skin,-28), skinLight=tint(skin,18), hair=look.hairColor, hairLight=tint(hair,36), outfitLight=tint(look.outfitColor,25), outfitShade=tint(look.outfitColor,-25);
  // Canvas sneakers, denim, varsity jacket and a canvas backpack.
  if (!pose) r(1,34,20,2,'#55404b');
  const stride = pose?.stride ?? 0;
  const tuck = pose?.jumping ? 2 : 0;
  const torsoBob = pose?.bob ?? 0;
  const drawLeg = (x, lift) => {
    r(x,28+torsoBob,5,6-lift-torsoBob,'#34344d');
    r(x+1,29+torsoBob,2,4-lift-torsoBob,'#555571');
    r(x-1,32-lift,7,3,shoe);
    r(x+2,32-lift,4,2,'#942e47');
    r(x-1,34-lift,7,1,'#f2dfb5');
  };
  drawLeg(4+stride, tuck + Math.max(stride,0));
  drawLeg(12-stride, Math.max(-stride,0));
  bodyOffset = torsoBob;
  r(0,18,7,12,'#503345');r(1,20,5,8,'#b67d4c');
  r(1,24,5,3,'#d09a59');r(2,25,2,1,'#f4c883');
  const armLift = pose?.jumping ? -5 : 0;
  const drawSleeve = (x, y) => {
    r(x,y,5,10,dark);r(x+1,y+1,3,6,'#e5c9a3');
    r(x+1,y+2,1,5,'#f5dfb9');r(x+1,y+7,3,1,'#97334b');
    r(x+1,y+8,3,2,skinShade);
  };
  drawSleeve(2-stride,19+armLift);
  drawSleeve(17+stride,19+armLift);
  r(5,17,13,13,dark);r(6,18,11,11,look.outfitColor);
  r(6,19,2,8,outfitShade);r(15,19,2,8,outfitLight);
  r(7,18,2,10,'#ad744e');r(7,19,1,7,'#deb282');
  r(9,17,5,4,'#f2dfb5');r(10,18,3,4,'#b29885');
  r(11,21,1,7,'#e6b787');r(14,21,2,2,'#f6cc87');
  r(6,28,11,1,'#e5c9a3');
  // neck, ears, face shading and cheeks
  r(9,14,4,5,skinShade);r(10,14,2,4,skin);r(5,8,3,5,skinShade);r(6,8,2,4,skin);r(14,8,3,5,skinShade);r(14,8,2,4,skin);
  r(6,4,11,13,skinShade);r(7,5,9,11,skin);r(8,6,6,2,skinLight);r(14,7,2,6,skinShade);r(8,12,2,1,'#d78e83');r(13,12,2,1,'#d78e83');
  // hairstyle silhouette and length are drawn from the same saved appearance in both views
  if(look.hairStyle==='long'){r(4,3,3,17,hair);r(15,3,3,17,hair);r(3,15,3,6,hair);r(16,15,3,6,hair);r(5,5,1,10,hairLight);r(16,7,1,9,hairLight)}
  else if(look.hairStyle==='bob'){r(4,3,3,13,hair);r(15,3,3,13,hair);r(5,14,3,4,hair);r(14,14,3,4,hair);r(5,6,1,7,hairLight)}
  else if(look.hairStyle==='medium'){r(4,3,3,11,hair);r(15,3,3,11,hair);r(5,12,3,3,hair);r(14,12,3,3,hair);r(5,6,1,6,hairLight)}
  else {r(4,3,3,8,hair);r(15,3,3,8,hair)}
  r(5,2,12,5,hair);r(6,3,8,1,hairLight);r(5,5,3,5,hair);r(8,6,5,2,hair);r(14,5,3,4,hair);r(9,7,5,1,hairLight);
  // bright eyes and a small smile give the portrait a readable expression
  if (pose?.blink) {
    r(7,10,2,1,'#28252a');r(13,10,2,1,'#28252a');
  } else {
    r(7,9,2,2,'#28252a');r(13,9,2,2,'#28252a');r(7,9,1,1,'#fff4df');r(13,9,1,1,'#fff4df');
  }
  r(9,13,4,1,'#984b4b');r(10,12,2,1,skinLight);
  // personality / aptitude-linked accessories
  if(look.accessory==='glasses'){r(6,8,5,1,'#352d2d');r(6,9,1,3,'#352d2d');r(10,10,2,1,'#352d2d');r(12,8,5,1,'#352d2d');r(16,9,1,3,'#352d2d')}
  if(look.accessory==='earrings'){r(5,11,1,2,'#f2c75c');r(16,11,1,2,'#f2c75c')}
  if(look.accessory==='hairclip'){r(5,6,3,1,'#f2c75c');r(5,7,1,2,'#f2c75c')}
  if(look.accessory==='lanyard'){r(8,19,1,7,'#f3d06b');r(13,19,1,7,'#f3d06b');r(10,24,3,3,'#f5e8bf')}
  if(look.accessory==='bookpin'){r(15,21,2,3,'#f0cc68');r(15,24,2,1,'#5c779c')}
}

export function drawPixelPortrait(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const art = document.createElement('canvas');
  art.width = 320;
  art.height = 180;
  drawPixelBackground(art.getContext('2d'), 'campus', state?.semester ?? 1);

  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#65283e';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#e3bb81';
  ctx.fillRect(4, 4, width - 8, height - 8);
  ctx.drawImage(art, 117, 29, 86, 130, 8, 8, width - 16, height - 16);
  const scale = Math.floor(Math.min((width - 16) / 22, (height - 16) / 36));
  drawPixelStudent(ctx, state, Math.round((width - 22 * scale) / 2), height - 10 - 36 * scale, scale);

}

export class PixelScene {
  constructor(container) {
    this.canvas=document.createElement('canvas'); this.canvas.width=640; this.canvas.height=360;
    this.canvas.id='pixel-scene'; this.canvas.setAttribute('aria-label','학기 상황별 픽셀 아트 배경');
    this.canvas.className = 'pixel-layer';
    container.appendChild(this.canvas); this.ctx=this.canvas.getContext('2d'); this.ctx.scale(2,2);

    const weatherCanvas = this.canvas.cloneNode();
    weatherCanvas.id = 'campus-weather';
    weatherCanvas.removeAttribute('aria-label');
    weatherCanvas.setAttribute('aria-hidden', 'true');
    weatherCanvas.style.pointerEvents = 'none';
    container.appendChild(weatherCanvas);
    this.weather = new CampusWeather(weatherCanvas);

    this.playerCanvas = this.canvas.cloneNode();
    this.playerCanvas.id = 'pixel-player';
    this.playerCanvas.removeAttribute('aria-label');
    this.playerCanvas.setAttribute('aria-hidden', 'true');
    this.playerCanvas.style.pointerEvents = 'none';
    container.appendChild(this.playerCanvas);
    this.playerCtx = this.playerCanvas.getContext('2d');
    this.playerCtx.scale(2, 2);
    this.playerX = 160;
    this.facing = 1;
    this.jumpHeight = 0;
    this.jumpVelocity = 0;
    this.poseTime = 0;
  }

  jump() {
    if (this.jumpHeight === 0 && this.jumpVelocity === 0) {
      this.jumpVelocity = 125;
    }
  }

  updatePlayer(deltaTime, direction) {
    this.weather.update(deltaTime);
    const nextX = Math.max(16, Math.min(304, this.playerX + direction * 75 * deltaTime));
    const walking = nextX !== this.playerX;
    this.playerX = nextX;
    if (direction) this.facing = direction;

    if (this.jumpHeight > 0 || this.jumpVelocity > 0) {
      const gravity = 360;
      this.jumpHeight += this.jumpVelocity * deltaTime - gravity * deltaTime ** 2 / 2;
      this.jumpVelocity -= gravity * deltaTime;
      if (this.jumpHeight <= 0) {
        this.jumpHeight = 0;
        this.jumpVelocity = 0;
      }
    }

    const jumping = this.jumpHeight > 0;
    const motion = jumping ? 'jump' : walking ? 'walk' : 'idle';
    this.poseTime = motion === this.motion ? this.poseTime + deltaTime : 0;
    this.motion = motion;
    const step = Math.sin(this.poseTime * Math.PI * 7);
    const pose = {
      jumping,
      stride: motion === 'walk' ? Math.round(step * 3) : 0,
      bob: motion === 'walk' ? -Math.round(Math.abs(step) * 2) : motion === 'idle' && Math.sin(this.poseTime * Math.PI) > 0.3 ? -1 : 0,
      blink: motion === 'idle' && this.poseTime % 3.8 > 3.65,
    };
    const ctx = this.playerCtx;
    const x = Math.round(this.playerX);
    const shadowWidth = 20 - Math.round(this.jumpHeight / 3);
    ctx.clearRect(0, 0, 320, 180);
    ctx.fillStyle = 'rgba(29, 41, 48, 0.65)';
    ctx.fillRect(x - Math.floor(shadowWidth / 2), 159, shadowWidth, 2);
    ctx.save();
    ctx.translate(x, 125 - Math.round(this.jumpHeight));
    ctx.scale(this.facing, 1);
    drawPixelStudent(ctx, this.gameState, -11, 0, 1, pose);
    ctx.restore();
  }

  draw(scene = 'campus', semester = 1, gameState = null, season = getSeasonFromSemester(semester)) {
    this.gameState = gameState;
    this.canvas.dataset.scene = scene;
    drawPixelBackground(this.ctx, scene, semester, season);
    this.weather.setSeason(scene === 'campus' ? season : null);
  }
}

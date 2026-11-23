const PALETTES = {
  campus: ['#8bc7d9','#e8d9ad','#71936d','#a75138'],
  study: ['#202d48','#364565','#d6b779','#8c613f'],
  club: ['#33264f','#66517d','#f6bb62','#e45b74'],
  parttime: ['#523b35','#89614b','#f4c56e','#b94738'],
  exam: ['#a7c1c2','#d6d5bf','#817a67','#564d43'],
};

export function drawPixelStudent(ctx, state, x, y, scale = 1) {
  const look=state?.appearance||{hairStyle:'short',hairColor:'#241b20',skinTone:'#e9b995',outfitColor:'#8b1e2d',accessory:'none'};
  const r=(dx,dy,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x+dx*scale,y+dy*scale,w*scale,h*scale)};
  const tint=(hex,amount)=>{const n=parseInt(hex.slice(1),16),c=[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,v+amount)));return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join('')};
  const dark='#252b38', shoe='#292b35', skin=look.skinTone, skinShade=tint(skin,-28), skinLight=tint(skin,18), hair=look.hairColor, hairLight=tint(hair,36), outfitLight=tint(look.outfitColor,25), outfitShade=tint(look.outfitColor,-25);
  // grounded silhouette, tailored jacket, shirt and trousers
  r(1,34,20,2,'#1d2930');r(4,29,5,5,dark);r(12,29,5,5,dark);r(3,33,7,2,shoe);r(12,33,7,2,shoe);r(5,29,1,4,'#596172');r(14,29,1,4,'#596172');
  r(3,17,16,13,dark);r(4,18,14,11,look.outfitColor);r(1,19,4,10,dark);r(2,20,3,8,look.outfitColor);r(17,19,4,10,dark);r(17,20,3,8,look.outfitColor);
  r(5,19,2,8,outfitLight);r(15,19,2,8,outfitShade);r(8,23,6,6,outfitShade);r(10,24,2,4,'#e7d7ba');
  r(8,17,6,5,'#2d3543');r(9,17,4,4,'#f2eadb');r(9,18,2,3,'#a62938');r(11,18,2,3,'#b83b42');
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
  r(7,9,2,2,'#28252a');r(13,9,2,2,'#28252a');r(7,9,1,1,'#fff4df');r(13,9,1,1,'#fff4df');r(9,13,4,1,'#984b4b');r(10,12,2,1,skinLight);
  // personality / aptitude-linked accessories
  if(look.accessory==='glasses'){r(6,8,5,1,'#352d2d');r(6,9,1,3,'#352d2d');r(10,10,2,1,'#352d2d');r(12,8,5,1,'#352d2d');r(16,9,1,3,'#352d2d')}
  if(look.accessory==='earrings'){r(5,11,1,2,'#f2c75c');r(16,11,1,2,'#f2c75c')}
  if(look.accessory==='hairclip'){r(5,6,3,1,'#f2c75c');r(5,7,1,2,'#f2c75c')}
  if(look.accessory==='lanyard'){r(8,19,1,7,'#f3d06b');r(13,19,1,7,'#f3d06b');r(10,24,3,3,'#f5e8bf')}
  if(look.accessory==='bookpin'){r(15,21,2,3,'#f0cc68');r(15,24,2,1,'#5c779c')}
}

export function drawPixelPortrait(canvas, state) {
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  ctx.imageSmoothingEnabled=false;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#6f2432';ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#d6b879';ctx.fillRect(4,4,w-8,h-8);ctx.fillStyle='#f4ead7';ctx.fillRect(8,8,w-16,h-16);
  // window, distant campus roofline, sunlight and foliage form a small framed scene
  ctx.fillStyle='#6e8f91';ctx.fillRect(15,15,w-30,88);ctx.fillStyle='#91b5ae';ctx.fillRect(19,19,w-38,76);
  ctx.fillStyle='#d8c49b';ctx.fillRect(19,75,w-38,20);ctx.fillStyle='#983b3d';ctx.fillRect(23,68,42,17);ctx.fillRect(63,61,49,24);ctx.fillRect(112,70,43,15);
  ctx.fillStyle='#65443a';ctx.fillRect(23,65,42,4);ctx.fillRect(63,58,49,4);ctx.fillRect(112,67,43,4);
  ctx.fillStyle='#f2cf7b';ctx.fillRect(30,31,12,12);ctx.fillRect(27,34,18,6);
  ctx.fillStyle='#496c58';ctx.fillRect(18,63,12,20);ctx.fillRect(17,57,7,12);ctx.fillRect(w-32,61,13,22);ctx.fillRect(w-27,53,9,13);
  ctx.fillStyle='#d3bf9e';ctx.fillRect(15,101,w-30,3);ctx.fillStyle='#eee0c5';ctx.fillRect(8,104,w-16,h-112);
  // small school crest and pixel border
  ctx.fillStyle='#8b2638';ctx.fillRect(w-36,14,18,18);ctx.fillStyle='#f2d88f';ctx.fillRect(w-32,18,10,2);ctx.fillRect(w-29,20,2,9);ctx.fillRect(w-25,20,2,9);ctx.fillRect(w-32,29,10,2);
  drawPixelStudent(ctx,state,Math.round((w-22*4)/2),h-150,4);
  ctx.fillStyle='#772735';ctx.fillRect(8,h-12,w-16,4);ctx.fillStyle='#d6b879';ctx.fillRect(12,h-8,w-24,2);
}

export class PixelScene {
  constructor(container) {
    this.canvas=document.createElement('canvas'); this.canvas.width=640; this.canvas.height=360;
    this.canvas.id='pixel-scene'; this.canvas.setAttribute('aria-label','학기 상황별 픽셀 아트 배경');
    this.canvas.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;image-rendering:pixelated;z-index:0';
    container.appendChild(this.canvas); this.ctx=this.canvas.getContext('2d'); this.ctx.scale(2,2);
  }
  draw(scene='campus', semester=1, gameState=null) {
    const c=this.ctx, p=PALETTES[scene]||PALETTES.campus, [sky,wall,accent,wood]=p;
    const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h)};
    r(0,0,320,180,sky);
    if(scene==='campus'){
      r(0,112,320,68,'#6b8b68'); r(0,136,320,44,'#c7ad80');
      r(34,46,122,78,'#d6c6a4');r(27,42,136,12,'#824b3c');r(42,66,22,24,'#87b7bf');r(78,66,22,24,'#87b7bf');r(114,66,22,24,'#87b7bf');
      r(170,80,120,55,'#e9ddc4');r(164,74,132,10,'#713f3a');
      for(let x=179;x<286;x+=27){r(x,96,14,18,'#79a8b0');r(x,96,14,3,'#e7d5b2');}
      for(let x=16;x<320;x+=47){r(x,96,8,28,'#67452f');r(x-10,82,28,18,'#45714f');r(x-6,74,20,15,'#5d8754');}
      r(0,150,320,5,'#e0c797');
      // 고려대 석조건물의 창호·벽돌 띠와 중앙광장 안내판을 작은 픽셀로 분리한다.
      for(let x=35;x<155;x+=12){r(x,47,2,70,'#b7a888');r(x+5,55,3,4,'#f0dfba');}
      for(let x=46;x<147;x+=36){r(x,62,13,2,'#e7d7b5');r(x+5,67,2,18,'#d5c29e');}
      r(62,91,66,8,'#8b2432');r(68,93,54,2,'#e7cfaa');
      for(let x=173;x<294;x+=6){r(x,83,2,47,'#d2c3a5');}
      for(let x=12;x<310;x+=24){r(x,147,1,22,'#af946c');}
      r(226,119,48,12,'#732a36');r(231,122,37,2,'#e4c897');
    } else if(scene==='study'||scene==='exam'){
      r(0,0,320,180,scene==='study'?'#252e46':'#b9c3bb');r(0,0,320,25,scene==='study'?'#1c253c':'#d9d6c7');
      r(25,24,270,65,scene==='study'?'#42506a':'#7c796c');r(31,30,258,53,scene==='study'?'#33445f':'#96917e');
      for(let i=0;i<5;i++){const x=42+i*49;r(x,36,3,40,'#e1cfaa');r(x+8,44,21,3,'#d2bd91');r(x+8,53,17,3,'#d2bd91');}
      for(let row=0;row<3;row++)for(let col=0;col<4;col++){const x=20+col*76,y=107+row*22;r(x,y,57,5,wood);r(x+5,y+5,4,10,'#463d37');r(x+47,y+5,4,10,'#463d37');r(x+17,y-8,13,8,'#d9d4c5');if(scene==='exam')r(x+35,y-8,11,8,'#d1c4a6');}
      if(scene==='study'){r(274,42,16,42,'#aa7442');r(277,34,10,10,'#6c9858');for(let y=47;y<81;y+=7){r(276,y,12,2,'#e0bd79');r(276,y+3,12,1,'#624638');}}
      else {r(130,10,60,7,'#7f2730');r(138,12,44,2,'#f0d8aa');}
    } else if(scene==='club'){
      r(0,0,320,180,'#312543');r(0,112,320,68,'#573e5d');r(18,18,284,78,'#4b3c65');
      r(28,26,92,54,'#8b597c');r(34,32,80,42,'#d89183');r(39,37,70,32,'#f2b67a');
      r(136,30,152,7,'#ec9e61');r(140,43,145,4,'#dc84a0');
      for(let i=0;i<4;i++){const x=35+i*68;r(x,120,42,24,'#3e314b');r(x+8,110,25,12,['#d88e78','#9bb5a0','#ddb86f','#a4a9d1'][i]);r(x+15,115,10,12,'#dfb18d');}
      r(0,95,320,4,'#f1b774');
      for(let x=9;x<320;x+=32){r(x,8,3,6,'#f8ce7f');r(x+4,9,3,4,'#cf5973');}
      r(120,55,84,28,'#3a304c');r(126,61,72,3,'#ffd486');r(130,69,64,2,'#dc819c');
    } else {
      r(0,0,320,180,'#563a33');r(0,0,320,22,'#372c2b');
      for(let x=18;x<320;x+=58){r(x,28,46,57,'#8e6249');r(x+5,33,36,46,'#e6c88a');r(x+11,41,24,28,['#9c553f','#6a8d76','#d49b56'][Math.floor(x/58)%3]);}
      r(0,103,320,17,'#b77b4e');r(0,120,320,60,'#67473a');r(25,130,116,10,'#b98b63');r(191,130,95,10,'#b98b63');
      r(54,103,62,10,'#f4d68d');r(228,103,36,10,'#f2dfb4');r(79,79,13,26,'#543a30');r(72,71,27,10,'#e7c183');
      for(let x=20;x<315;x+=58){r(x,26,2,60,'#67463d');r(x+44,26,2,60,'#67463d');r(x+4,34,4,39,'#f6dda2');}
      for(let x=12;x<310;x+=15){r(x,114,5,2,'#e8be83');}
    }
    // 구름, 표면 하이라이트, 벽돌·보도 타일로 배경의 픽셀 밀도를 높인다.
    if(scene==='campus'){
      r(13,18,32,4,'#d9edf0');r(20,14,19,4,'#d9edf0');r(251,28,28,4,'#d9edf0');r(258,24,18,4,'#d9edf0');
      for(let x=3;x<320;x+=19){r(x,165,8,1,'#dfc99d');r(x+8,157,1,8,'#dfc99d');}
    } else if(scene==='study'||scene==='exam'){
      for(let row=0;row<3;row++)for(let col=0;col<4;col++){const x=20+col*76,y=107+row*22;r(x+20,y-7,2,2,'#e1c27e');r(x+22,y-7,2,1,'#efe5cd');}
    } else if(scene==='parttime'){
      r(24,31,4,2,'#f5dfae');r(82,31,4,2,'#f5dfae');r(140,31,4,2,'#f5dfae');r(198,31,4,2,'#f5dfae');r(256,31,4,2,'#f5dfae');
    }
    // 전경 길과 단풍/나무를 픽셀 타일로 그려 장면에 깊이를 더한다.
    r(0,169,320,11,'#243b42');r(0,174,320,6,'#172e36');
    const season=semester>=7?'#bd7950':semester>=5?'#71905a':semester>=3?'#81a66c':'#719a69';
    [8,306].forEach(x=>{r(x,125,7,48,'#60452f');r(x-7,110,21,20,season);r(x-3,101,13,17,season);r(x-10,117,8,12,season);});
    // 프로필과 동일한 저장 외형의 학생 캐릭터
    drawPixelStudent(c,gameState,149,125,1);
    // 화면 위쪽을 밝게 비워 이벤트 카드 뒤에서도 배경 맥락이 남는다.
    r(0,0,320,3,'#ffffff22');
  }
}

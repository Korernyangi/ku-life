export function drawPixelStudent(ctx, state, x, y, scale = 1) {
  const look=state?.appearance||{hairStyle:'short',hairColor:'#241b20',skinTone:'#e9b995',outfitColor:'#8b1e2d',accessory:'none'};
  const r=(dx,dy,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x+dx*scale,y+dy*scale,w*scale,h*scale)};
  const tint=(hex,amount)=>{const n=parseInt(hex.slice(1),16),c=[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,v+amount)));return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join('')};
  const dark='#252b38', skin=look.skinTone, skinShade=tint(skin,-28), skinLight=tint(skin,18), hair=look.hairColor, hairLight=tint(hair,36), outfitLight=tint(look.outfitColor,25), outfitShade=tint(look.outfitColor,-25);
  r(0,18,7,12,'#503345');r(1,20,5,8,'#b67d4c');
  r(1,24,5,3,'#d09a59');r(2,25,2,1,'#f4c883');
  const drawSleeve = (x, y) => {
    r(x,y,5,10,dark);r(x+1,y+1,3,6,'#e5c9a3');
    r(x+1,y+2,1,5,'#f5dfb9');r(x+1,y+7,3,1,'#97334b');
    r(x+1,y+8,3,2,skinShade);
  };
  drawSleeve(2, 19);
  drawSleeve(17, 19);
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
  r(7,9,2,2,'#28252a');r(13,9,2,2,'#28252a');r(7,9,1,1,'#fff4df');r(13,9,1,1,'#fff4df');
  r(9,13,4,1,'#984b4b');r(10,12,2,1,skinLight);
  // personality / aptitude-linked accessories
  if(look.accessory==='glasses'){r(6,8,5,1,'#352d2d');r(6,9,1,3,'#352d2d');r(10,10,2,1,'#352d2d');r(12,8,5,1,'#352d2d');r(16,9,1,3,'#352d2d')}
  if(look.accessory==='earrings'){r(5,11,1,2,'#f2c75c');r(16,11,1,2,'#f2c75c')}
  if(look.accessory==='hairclip'){r(5,6,3,1,'#f2c75c');r(5,7,1,2,'#f2c75c')}
  if(look.accessory==='lanyard'){r(8,19,1,7,'#f3d06b');r(13,19,1,7,'#f3d06b');r(10,24,3,3,'#f5e8bf')}
  if(look.accessory==='bookpin'){r(15,21,2,3,'#f0cc68');r(15,24,2,1,'#5c779c')}
}

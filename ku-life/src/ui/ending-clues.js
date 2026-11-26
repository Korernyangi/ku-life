function spriteRect(context, x, y) {
  return (dx, dy, width, height, color) => {
    context.fillStyle = color;
    context.fillRect(Math.round(x) + dx, Math.round(y) + dy, width, height);
  };
}

export function drawClueCat(context, x, y, whitePaw, tailUp = false) {
  const rect = spriteRect(context, x, y);
  rect(-6, 25, 44, 4, '#392a3a52');
  rect(25, 13, 13, 8, '#d69458');
  rect(34, tailUp ? 6 : 8, 5, 10, '#b67452');
  rect(9, 13, 20, 12, '#e0a567');
  rect(0, 5, 19, 13, '#d9975e');
  rect(1, 0, 5, 8, '#b77555');
  rect(14, 0, 4, 8, '#b77555');
  rect(4, 9, 2, 2, '#261c2d');
  rect(13, 9, 2, 2, '#261c2d');
  rect(8, 12, 4, 2, '#f9dfb6');
  rect(12, 22, 6, 6, whitePaw ? '#f5e4c8' : '#d18b56');
  rect(22, 22, 6, 6, '#bd8059');
}

export function drawFestivalPhoto(context, whitePaw) {
  const rect = spriteRect(context, 0, 0);
  rect(0, 0, 96, 56, whitePaw ? '#809e9e' : '#a88b9f');
  rect(0, 34, 96, 22, whitePaw ? '#638783' : '#836878');
  for (let x = 6; x < 96; x += 14) rect(x, 7 + x % 15, 3, 2, whitePaw ? '#cbd4ad' : '#d8b5ad');
  drawClueCat(context, 29, 17, whitePaw);
}

export function drawClueBear(context, x, y, color) {
  const rect = spriteRect(context, x, y);
  rect(0, 12, 37, 11, color);
  rect(4, 22, 29, 9, color);
  rect(5, 0, 9, 9, color);
  rect(24, 0, 9, 9, color);
  rect(6, 4, 25, 18, color);
  rect(13, 14, 12, 7, '#f0c3a0');
  rect(11, 10, 3, 4, '#261c2d');
  rect(24, 10, 3, 4, '#261c2d');
  rect(17, 15, 4, 2, '#6b4349');
}

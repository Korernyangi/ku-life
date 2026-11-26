function spriteRect(context, x, y) {
  return (dx, dy, width, height, color) => {
    context.fillStyle = color;
    context.fillRect(Math.round(x) + dx, Math.round(y) + dy, width, height);
  };
}

export function drawClueCat(context, x, y, whitePaw, tailUp = false, step = 0) {
  const rect = spriteRect(context, x, y);
  rect(-6, 25, 44, 4, '#392a3a52');
  const tailY = tailUp ? 6 : 8;
  rect(26, 16, 12, 7, '#995e4a');
  rect(25, 13, 13, 8, '#d69458');
  rect(34, tailY, 5, 10, '#b67452');
  rect(35, tailY + 1, 3, 2, '#e4ac75');
  rect(31, 15, 3, 5, '#bd784e');
  rect(9, 23, 20, 3, '#9d6450');
  rect(9, 13, 20, 12, '#e0a567');
  rect(17, 13, 10, 2, '#f2ba80');
  rect(20, 16, 3, 3, '#c08157');
  rect(26, 16, 2, 4, '#be7a54');
  rect(17, 20, 10, 3, '#cb8759');
  rect(0, 5, 19, 13, '#d9975e');
  rect(1, 15, 10, 3, '#bb7854');
  rect(1, 0, 5, 8, '#b77555');
  rect(14, 0, 4, 8, '#b77555');
  rect(2, 2, 2, 4, '#e0a294');
  rect(15, 2, 2, 4, '#e0a294');
  rect(6, 5, 7, 2, '#efb47b');
  rect(8, 6, 2, 3, '#b87954');
  rect(4, 9, 2, 2, '#261c2d');
  rect(13, 9, 2, 2, '#261c2d');
  rect(4, 9, 1, 1, '#fff2c7');
  rect(13, 9, 1, 1, '#fff2c7');
  rect(6, 12, 7, 3, '#f9dfb6');
  rect(9, 12, 2, 1, '#9c635e');
  rect(0, 13, 3, 1, '#f0ba86');
  rect(16, 13, 4, 1, '#f0ba86');
  rect(12 + step, 22, 6, 6 - Math.max(0, step), whitePaw ? '#f5e4c8' : '#d18b56');
  rect(12 + step, 26 - Math.max(0, step), 6, 2, whitePaw ? '#d0b39a' : '#b77754');
  rect(22 - step, 22, 6, 6 + Math.min(0, step), '#bd8059');
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
  rect(8, 2, 5, 5, '#e2b099');
  rect(25, 2, 5, 5, '#e2b099');
  rect(10, 4, 16, 2, '#fff0c238');
  rect(28, 8, 3, 12, '#6f47664a');
  rect(0, 17, 5, 6, '#6f476654');
  rect(32, 17, 5, 6, '#6f476654');
  rect(13, 14, 12, 7, '#f0c3a0');
  rect(11, 10, 3, 4, '#261c2d');
  rect(24, 10, 3, 4, '#261c2d');
  rect(11, 10, 1, 1, '#f8e5c3');
  rect(24, 10, 1, 1, '#f8e5c3');
  rect(17, 15, 4, 2, '#6b4349');
  rect(16, 18, 6, 1, '#c19280');
  rect(11, 24, 6, 4, '#9d566d');
  rect(21, 24, 6, 4, '#9d566d');
  rect(17, 25, 4, 3, '#d6848b');
  rect(5, 29, 27, 2, '#50344e40');
}

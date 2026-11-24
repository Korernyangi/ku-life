import { drawPixelPortrait } from './pixel-scene.js';

function drawCard(canvas, profile, stats, info, score, state) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff9ed';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#70243a';
  ctx.fillRect(0, 0, canvas.width, 82);

  function text(value, x, y, size, color = '#35282b', weight = 400, width) {
    ctx.font = `${weight} ${size}px sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(value, x, y, width);
  }

  text('KU LIFE', 28, 52, 34, '#fff9ed', 900);
  text('플레이 기록증', 207, 52, 24, '#f3d9a9', 700);
  ctx.textAlign = 'right';
  text(info.special ? '스페셜 엔딩' : '기본 엔딩', 612, 52, 21, '#fff9ed', 700);
  ctx.textAlign = 'left';

  const portrait = document.createElement('canvas');
  portrait.width = 164;
  portrait.height = 204;
  drawPixelPortrait(portrait, state, { campus: true });
  ctx.drawImage(portrait, 28, 108);
  ctx.strokeStyle = '#b69162';
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 108, 164, 204);
  text('토탈 스코어', 28, 347, 18, '#765648', 700);
  text(`${score.total.toLocaleString('ko-KR')} / ${score.max.toLocaleString('ko-KR')}`, 28, 376, 24, '#70243a', 900, 165);

  text(info.title, 218, 139, 30, '#70243a', 800, 390);
  profile.forEach(([label, value], index) => {
    const y = 179 + 30 * index;
    text(label, 218, y, 18, '#765648', 600);
    text(value, 324, y, 22, '#35282b', 700, 288);
  });

  ctx.fillStyle = '#e8d4b4';
  ctx.fillRect(28, 400, 584, 2);
  stats.forEach(([label, value], index) => {
    const x = 28 + (index % 4) * 146;
    const y = 434 + Math.floor(index / 4) * 67;
    text(label, x, y, 18, '#765648', 600);
    text(value, x, y + 28, 26, '#35282b', 800, 135);
  });
}

export function getEndingStatRows(stats) {
  return [
    ['누적 평점', stats.grade == null ? '미산출' : `${stats.grade.toFixed(2)} / 4.50`],
    ['지능', stats.intelligence],
    ['체력', stats.hp],
    ['멘탈', stats.mental],
    ['돈', stats.money],
    ['인맥', stats.relation],
    ['커리어', stats.career],
  ];
}

export function showEndingProfile(screen, { ending, info, stats, score, semester }, state) {
  const profile = [
    ['학과', state.major?.name],
    ['입학 전형', state.admission?.name],
    ['성격', state.personality?.name],
    ['집안 형편', state.background?.name],
    ['성별 정체성', state.gender],
    ['연애 상태', ({ single: '솔로', dating: '연애 중', notInterested: '현재 관심 없음' })[state.relationshipStatus]],
    ['진행 기록', `${semester}학기 · ${state.eventsCompleted.length}개 선택`],
  ].map(([label, value]) => [label, value || '미정']);
  const finalStats = getEndingStatRows(stats);
  const dialog = document.createElement('dialog');
  dialog.className = 'ending-dialog ending-profile';
  dialog.setAttribute('aria-labelledby', 'ending-profile-title');
  dialog.innerHTML = `
    <form method="dialog" class="ending-dialog-close">
      <button type="submit" aria-label="프로필 닫기" autofocus>×</button>
    </form>
    <h2 id="ending-profile-title">플레이 기록증</h2>
    <canvas width="640" height="560" role="img"></canvas>
    <div class="ending-actions">
      <button type="button" class="save-profile ending-primary" disabled>PNG 저장</button>
      <button type="button" class="share-profile" disabled>공유</button>
    </div>
    <p class="profile-status" role="status"></p>
  `;

  const canvas = dialog.querySelector('canvas');
  const status = dialog.querySelector('.profile-status');
  const summaryRows = [['토탈 스코어', `${score.total} / ${score.max}`], ...profile, ...finalStats];
  const summary = [`KU LIFE · ${info.title}`, ...summaryRows.map(([label, value]) => `${label} ${value}`)].join('\n');
  canvas.setAttribute('aria-label', summary);
  drawCard(canvas, profile, finalStats, info, score, state);

  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  screen.appendChild(dialog);
  dialog.showModal();

  const save = dialog.querySelector('.save-profile');
  const share = dialog.querySelector('.share-profile');
  canvas.toBlob(blob => {
    if (!blob) {
      status.textContent = '프로필 이미지를 만들 수 없습니다.';
      return;
    }
    const file = new File([blob], `ku-life-${ending}.png`, { type: 'image/png' });
    save.disabled = share.disabled = false;
    save.onclick = () => {
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = 'PNG 다운로드를 시작했습니다.';
    };
    share.onclick = async () => {
      status.textContent = '';
      try {
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: `KU LIFE · ${info.title}`, files: [file] });
          return;
        }
        if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          status.textContent = '프로필 이미지를 복사했습니다.';
        } else {
          status.textContent = '이 브라우저에서는 PNG를 저장한 뒤 첨부해 주세요.';
        }
      } catch (error) {
        if (error.name !== 'AbortError') status.textContent = '공유할 수 없습니다. PNG를 저장한 뒤 첨부해 주세요.';
      }
    };
  }, 'image/png');
}

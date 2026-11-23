import { drawPixelPortrait } from './pixel-scene.js';

function drawCard(canvas, profile, stats, info, state) {
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

  text('KU LIFE · 플레이 기록증', 28, 53, 32, '#fff9ed', 800);

  const portrait = document.createElement('canvas');
  portrait.width = 164;
  portrait.height = 204;
  drawPixelPortrait(portrait, state);
  ctx.drawImage(portrait, 28, 108);

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

export function showEndingProfile(screen, { ending, info, stats, semester }, state) {
  const profile = [
    ['학과', state.major?.name],
    ['입학 전형', state.admission?.name],
    ['성격', state.personality?.name],
    ['집안 형편', state.background?.name],
    ['성별 정체성', state.gender],
    ['연애 상태', ({ single: '솔로', dating: '연애 중', notInterested: '현재 관심 없음' })[state.relationshipStatus]],
    ['진행 기록', `${semester}학기 · ${state.eventsCompleted.length}개 선택`],
  ].map(([label, value]) => [label, value || '미정']);
  const finalStats = [
    ['누적 평점', stats.grade == null ? '미산출' : `${stats.grade.toFixed(2)} / 4.50`],
    ['지능', stats.intelligence],
    ['체력', stats.hp],
    ['멘탈', stats.mental],
    ['돈', stats.money],
    ['인맥', stats.relation],
    ['커리어', stats.career],
  ];

  screen.innerHTML = `
    <section class="ending-profile">
      <h1 class="ending-profile-title"></h1>
      <canvas width="640" height="560" role="img"></canvas>
      <p class="ending-profile-description"></p>
      <div class="ending-profile-actions">
        <button type="button" class="save-profile">PNG 저장</button>
        <button type="button" class="share-profile">공유</button>
        <button type="button" class="btn-restart">다시 시작</button>
      </div>
      <p class="profile-status" role="status"></p>
    </section>
  `;

  const canvas = screen.querySelector('canvas');
  const status = screen.querySelector('.profile-status');
  const title = screen.querySelector('h1');
  title.textContent = info.title;
  screen.querySelector('.ending-profile-description').textContent = info.desc;
  const summary = [`KU LIFE · ${info.title}`, ...[...profile, ...finalStats].map(([label, value]) => `${label} ${value}`)].join('\n');
  canvas.setAttribute('aria-label', summary);
  drawCard(canvas, profile, finalStats, info, state);

  const save = screen.querySelector('.save-profile');
  const share = screen.querySelector('.share-profile');
  save.disabled = share.disabled = true;
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
        } else if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
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

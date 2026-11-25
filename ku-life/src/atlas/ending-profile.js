import { RULES, STATS, cashText } from './config.js';

function drawCard(canvas, portrait, ending, state, score, gpa) {
  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false;
  context.fillStyle = '#fff8e9';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#77253d';
  context.fillRect(0, 0, canvas.width, 76);

  function text(value, x, y, size, color = '#301d25', weight = 700, width) {
    context.font = `${weight} ${size}px sans-serif`;
    context.fillStyle = color;
    context.fillText(value, x, y, width);
  }

  text('ATLAS', 28, 49, 32, '#fff8e9', 900);
  text('플레이 기록증', 151, 49, 23, '#f4dfb4');
  context.drawImage(portrait, 28, 104, 144, 168);
  context.strokeStyle = '#b78f68';
  context.lineWidth = 3;
  context.strokeRect(28, 104, 144, 168);

  text(ending.legacy ? '지난 플레이 결과' : ending.hidden ? '히든 엔딩' : '기본 엔딩', 198, 127, 19, '#6e554e');
  text(ending.title, 198, 164, 31, '#77253d', 900, 411);
  text(`토탈 스코어 ${score.total.toLocaleString('ko-KR')} / ${score.max.toLocaleString('ko-KR')}`, 198, 207, 23);
  text([ending.major, `${state.semester}학기 · 선택 ${state.history.length}개`].filter(Boolean).join(' · '), 198, 245, 20, '#6e554e', 411);
  context.fillStyle = '#d4ba94';
  context.fillRect(28, 296, 584, 2);

  const rows = [
    ...Object.entries(STATS).map(([key, stat]) => [stat.name, `${state.stats[key]} / ${RULES.statMax}`]),
    ['누적 평점', gpa == null ? '미산출' : `${gpa.toFixed(2)} / 4.50`],
    ['보유 자금', cashText(state.cash)],
  ];
  rows.forEach(([label, value], index) => {
    const x = 28 + (index % 3) * 198;
    const y = 330 + Math.floor(index / 3) * 73;
    text(label, x, y, 17, '#6e554e');
    text(value, x, y + 29, 24, '#301d25', 800, 182);
  });
  return rows;
}

export function showEndingProfile(root, state, gpa, ending, score, portrait) {
  const dialog = document.createElement('dialog');
  dialog.className = 'atlas-dialog ending-profile';
  dialog.setAttribute('aria-labelledby', 'ending-profile-title');
  dialog.innerHTML = `
    <button type="button" class="secondary dialog-close" data-action="close-dialog" aria-label="프로필 닫기" autofocus>×</button>
    <h2 id="ending-profile-title">플레이 기록증</h2>
    <canvas width="640" height="462" role="img"></canvas>
    <div class="actions">
      <button type="button" class="primary save-profile" disabled>PNG 저장</button>
      <button type="button" class="secondary share-profile" disabled>공유</button>
    </div>
    <p class="muted profile-status" role="status"></p>`;

  const canvas = dialog.querySelector('canvas');
  const rows = drawCard(canvas, portrait, ending, state, score, gpa);
  canvas.setAttribute('aria-label', [ending.title, ending.major, `토탈 스코어 ${score.total} / ${score.max}`,
    ...rows.map(([label, value]) => `${label} ${value}`)].filter(Boolean).join(' · '));
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  root.append(dialog);
  dialog.showModal();

  const status = dialog.querySelector('.profile-status');
  const save = dialog.querySelector('.save-profile');
  const share = dialog.querySelector('.share-profile');
  canvas.toBlob(blob => {
    if (!blob) {
      status.textContent = '프로필 이미지를 만들 수 없습니다.';
      return;
    }
    const file = new File([blob], `atlas-${ending.id}.png`, { type: 'image/png' });
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
          await navigator.share({ title: `ATLAS · ${ending.title}`, files: [file] });
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

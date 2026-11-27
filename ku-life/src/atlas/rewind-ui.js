import { cashText, STATS } from './config.js';
import { availableRewindSemesters } from './rewind.js';
import './rewind.css';

const accessText = {
  free: '무료 1회 남음',
  purchase_required: '무제한 이용권 구매 필요',
  unlimited: '무제한 이용 가능',
};

export function rewindPicker(source, panel, { escape, termLabel, preview }) {
  const semesters = availableRewindSemesters(source);
  const checkpoint = source.rewindCheckpoints[panel.semester].state;
  const choices = source.history.filter(receipt => receipt.semester === panel.semester);
  const button = {
    free: '무료로 이 학기 시작',
    purchase_required: '이용권 구매하기',
    unlimited: '이 학기부터 시작',
  }[panel.status];
  const stats = Object.entries(STATS).map(([key, { name }]) =>
    `<div><dt>${name}</dt><dd>${checkpoint.stats[key]}</dd></div>`).join('');
  return `<main class="rewind-page" aria-labelledby="rewind-title">
    <header class="rewind-heading">
      <div>
        <p class="context-label">${preview ? 'KU-LIFE · 테스트 미리보기' : 'KU-LIFE · 치팅모드'}</p>
        <h1 id="rewind-title" tabindex="-1">어느 학기로 돌아갈까요?</h1>
        <p>그때의 상태로 별도 회차를 시작해 원래 엔딩과 비교해 보세요.</p>
      </div>
      <button class="secondary" data-action="rewind-original" ${panel.busy ? 'disabled' : ''}>원래 엔딩으로</button>
    </header>
    <div class="rewind-layout">
      <section class="panel rewind-timeline" aria-labelledby="rewind-timeline-title">
        <h2 id="rewind-timeline-title">내 대학생활</h2>
        <div class="rewind-terms">${semesters.map(semester => `
          <button type="button" data-action="rewind-select" data-value="${semester}" aria-pressed="${semester === panel.semester}" ${panel.busy ? 'disabled' : ''}>${termLabel(semester)}</button>
        `).join('')}</div>
      </section>
      <section class="panel rewind-selection" aria-labelledby="rewind-selection-title">
        <h2 id="rewind-selection-title">${termLabel(panel.semester)} 시작 상태</h2>
        <dl class="rewind-stats">${stats}<div><dt>보유 자금</dt><dd>${cashText(checkpoint.cash)}</dd></div></dl>
        ${choices.length ? `<details class="rewind-choices" open><summary>그때 했던 선택</summary>
          <ol>${choices.map(receipt => `<li><span>${escape(receipt.title)}</span><strong>${escape(receipt.choice)}</strong></li>`).join('')}</ol>
        </details>` : ''}
        <div class="rewind-access" aria-live="polite">
          <strong>${accessText[panel.status] ?? '이용권 확인'}</strong>
          ${panel.message ? `<p role="status">${escape(panel.message)}</p>` : ''}
        </div>
        <div class="actions">
          ${button && !(panel.returning && panel.status === 'purchase_required') ? `<button class="primary" data-action="rewind-submit" ${panel.busy ? 'disabled' : ''}>${button}</button>` : ''}
          ${!panel.busy && (!button || panel.message) ? '<button class="secondary" data-action="rewind-refresh">이용권 다시 확인</button>' : ''}
        </div>
      </section>
    </div>
  </main>`;
}

export function rewindCheckoutPreview(draft, termLabel) {
  return `<main class="rewind-page rewind-checkout panel">
    <p class="context-label">KU-LIFE · 테스트 미리보기</p>
    <h1 tabindex="-1">치팅모드 무제한 이용권</h1>
    <p>${termLabel(draft.semester)}부터 다시 플레이할 수 있도록 모의 결제를 진행해요.</p>
    <p class="muted">이 화면에서는 실제 결제가 발생하지 않아요.</p>
    <p class="notice" role="status" data-rewind-checkout-status></p>
    <div class="actions">
      <button class="primary" data-action="rewind-demo-pay">테스트 결제 완료</button>
      <button class="secondary" data-action="rewind-demo-cancel">결제 취소</button>
    </div>
  </main>`;
}

export function rewindComparisonMarkup(original, branch, change, { escape, termLabel, gpaText }) {
  const originalLine = change?.before ? `${change.before.title} · ${change.before.choice}` : '회차 종료';
  const branchLine = change?.after ? `${change.after.title} · ${change.after.choice}` : '회차 종료';
  return `<section class="rewind-comparison" aria-labelledby="rewind-compare-title">
    <h2 id="rewind-compare-title">두 엔딩 비교</h2>
    <div class="rewind-results">
      ${[['원래 회차', original], ['되돌린 회차', branch]].map(([label, result]) => `
        <article><small>${label}</small><h3>${escape(result.title)}</h3>
          <p><strong>${result.score.total.toLocaleString('ko-KR')}점</strong> <span>· 평점 ${gpaText(result.gpa)}</span></p></article>
      `).join('')}
    </div>
    ${change ? `<div class="rewind-difference"><h3>처음 갈라진 선택 · ${termLabel(change.semester)}</h3>
      <dl><div><dt>원래 회차</dt><dd>${escape(originalLine)}</dd></div><div><dt>되돌린 회차</dt><dd>${escape(branchLine)}</dd></div></dl>
    </div>` : '<p class="muted">두 회차에서 같은 선택을 했어요.</p>'}
  </section>`;
}

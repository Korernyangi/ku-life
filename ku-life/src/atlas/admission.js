import { majorEnding } from './endings.js';
import { MAJOR_GROUPS, findMajor } from './majors.js';

export function openAdmission(root, previousTerm, onAdmit) {
  const dialog = document.createElement('dialog');
  dialog.className = 'atlas-dialog admission-dialog';
  dialog.setAttribute('aria-labelledby', 'admission-title');
  dialog.innerHTML = `
    <p class="context-label">고려대학교 서울캠퍼스</p>
    <h2 id="admission-title">어느 학과에 입학할까요?</h2>
    <form class="admission-form">
      <div class="major-filters">
        <label>단과대학 <select name="college"><option value="">전체</option></select></label>
        <label>학과 검색 <input name="query" type="search" placeholder="예: 컴퓨터, 국어, 미디어"></label>
      </div>
      <fieldset>
        <legend>학과 선택 <span class="major-count" role="status"></span></legend>
        <div class="major-list"></div>
      </fieldset>
      <div class="major-preview" aria-live="polite"></div>
      <p class="admission-warning" hidden></p>
      <div class="actions">
        <button type="button" class="secondary">취소</button>
        <button type="submit" class="primary" disabled>이 학과로 입학</button>
      </div>
    </form>`;
  const form = dialog.querySelector('form');
  const { college, query } = form.elements;
  const list = dialog.querySelector('.major-list');
  const count = dialog.querySelector('.major-count');
  const preview = dialog.querySelector('.major-preview');
  const warning = dialog.querySelector('.admission-warning');
  const submit = form.querySelector('[type="submit"]');
  let selected = '';

  college.append(...MAJOR_GROUPS.map(group => new Option(group.college, group.college)));
  if (previousTerm) {
    warning.textContent = previousTerm + ' 저장 기록은 새로 입학하면 덮어쓰고, 발견한 엔딩은 도감에 남아요.';
    warning.hidden = false;
  }

  function updateSelection() {
    const major = findMajor(selected);
    submit.disabled = !major;
    preview.replaceChildren();
    if (!major) {
      preview.textContent = '학과를 선택하면 대표 진로 두 가지를 볼 수 있어요.';
      return;
    }
    const heading = document.createElement('strong');
    heading.textContent = major.name + ' 대표 진로';
    const paths = document.createElement('p');
    paths.textContent = major.routes.map(id => majorEnding(id, major.id).title).join(' · ');
    preview.append(heading, paths);
  }

  function renderMajors() {
    const keyword = query.value.replace(/\s/g, '').toLowerCase();
    const majors = MAJOR_GROUPS.filter(group => !college.value || group.college === college.value)
      .flatMap(group => group.majors)
      .filter(major => (major.name + major.college).replace(/\s/g, '').toLowerCase().includes(keyword));
    if (!majors.some(major => major.id === selected)) selected = '';
    count.textContent = majors.length + '개';
    list.replaceChildren(...majors.map(major => {
      const label = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'major';
      radio.value = major.id;
      radio.checked = major.id === selected;
      const text = document.createElement('span');
      const name = document.createElement('strong');
      name.textContent = major.name;
      text.append(name);
      if (major.name !== major.college || major.id === 'engineering-open') {
        const group = document.createElement('small');
        group.textContent = major.id === 'engineering-open' ? '전공자율선택' : major.college;
        text.append(group);
      }
      label.append(radio, text);
      return label;
    }));
    if (!majors.length) list.textContent = '검색 결과가 없어요.';
    list.scrollTop = 0;
    updateSelection();
  }

  query.addEventListener('input', renderMajors);
  college.addEventListener('change', renderMajors);
  list.addEventListener('change', event => {
    selected = event.target.value;
    updateSelection();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!findMajor(selected)) return;
    dialog.close();
    onAdmit(selected);
  });
  dialog.querySelector('.secondary').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  renderMajors();
  root.append(dialog);
  dialog.showModal();
}

import { ENDINGS } from '../game/endings.js';

const entries = Object.entries(ENDINGS);
const storageKey = 'ku-life:ending:';

export class EndingArchive {
  constructor(root, trigger) {
    this.trigger = trigger;
    this.unlocked = new Set();
    this.dialog = document.createElement('dialog');
    this.dialog.className = 'ending-dialog ending-archive';
    this.dialog.setAttribute('aria-labelledby', 'ending-archive-title');
    root.appendChild(this.dialog);
    trigger.addEventListener('click', () => this.open());
    this.updateProgress();
  }

  updateProgress() {
    try {
      for (const [id] of entries) {
        if (localStorage.getItem(storageKey + id) === '1') this.unlocked.add(id);
      }
    } catch {
      // 브라우저 설정에 따라 현재 실행에서 발견한 엔딩만 표시한다.
    }
    this.trigger.querySelector('span').textContent = `${this.unlocked.size} / ${entries.length}`;
  }

  unlock(id) {
    this.updateProgress();
    const isNew = !this.unlocked.has(id);
    this.unlocked.add(id);
    let saved = false;
    try {
      localStorage.setItem(storageKey + id, '1');
      saved = true;
    } catch {
      // 저장소에 접근할 수 없어도 이번 엔딩은 도감에서 볼 수 있다.
    }
    this.updateProgress();
    return { isNew, saved };
  }

  open() {
    this.updateProgress();
    this.dialog.innerHTML = `
      <form method="dialog" class="ending-dialog-close">
        <button type="submit" aria-label="엔딩 도감 닫기" autofocus>×</button>
      </form>
      <h2 id="ending-archive-title">엔딩 도감</h2>
      <p class="ending-archive-progress">${entries.length}개 중 ${this.unlocked.size}개 발견</p>
    `;

    for (const special of [false, true]) {
      const section = document.createElement('section');
      const group = entries.filter(([, info]) => Boolean(info.special) === special);
      const count = group.filter(([id]) => this.unlocked.has(id)).length;
      section.innerHTML = `<h3>${special ? '스페셜' : '기본'} 엔딩 <span>${count} / ${group.length}</span></h3><ul></ul>`;
      const list = section.querySelector('ul');
      group.forEach(([id, info], index) => {
        const unlocked = this.unlocked.has(id);
        const card = document.createElement('li');
        card.className = unlocked ? 'archive-entry' : 'archive-entry is-locked';
        card.innerHTML = '<span class="archive-icon" aria-hidden="true"></span><div><h4></h4><p></p></div>';
        card.querySelector('.archive-icon').textContent = unlocked ? info.icon : '🔒';
        card.querySelector('h4').textContent = unlocked ? info.title : `미발견 엔딩 ${index + 1}`;
        card.querySelector('p').textContent = unlocked ? info.desc : info.hint;
        list.appendChild(card);
      });
      this.dialog.appendChild(section);
    }
    this.dialog.showModal();
    this.dialog.scrollTop = 0;
  }
}

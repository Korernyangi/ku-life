const PANEL_LABELS = {
  statBar: '능력치',
  semesterInfo: '학기',
  profilePanel: '학생 수첩',
  eventPanel: '이벤트',
};

export class PanelLayout {
  constructor(elements) {
    const menu = document.createElement('details');
    menu.className = 'panel-layout-menu';
    menu.hidden = true;
    menu.innerHTML = `
      <summary>UI 배치</summary>
      <div class="panel-layout-options">
        <p>이동 손잡이를 끌거나 손잡이에 초점을 두고 방향키를 누르세요.</p>
        <button type="button" class="panel-layout-edit" aria-pressed="false">패널 이동 모드</button>
        <fieldset><legend>표시할 패널</legend></fieldset>
        <button type="button" class="panel-layout-reset">기본 배치로 복원</button>
      </div>
    `;
    this.menu = menu;
    elements.root.appendChild(menu);
    this.root = elements.root;
    this.editButton = menu.querySelector('.panel-layout-edit');
    this.editButton.addEventListener('click', () => {
      this.setEditing(!this.root.classList.contains('editing-panels'));
      menu.open = false;
      menu.querySelector('summary').focus();
    });

    const observer = new ResizeObserver(entries => {
      for (const { target } of entries) this.keepOnScreen(target);
    });
    this.panels = Object.entries(PANEL_LABELS).map(([key, name]) => {
      const panel = elements[key];
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      checkbox.setAttribute('aria-controls', panel.id);
      label.append(checkbox, name);
      menu.querySelector('fieldset').appendChild(label);
      checkbox.addEventListener('change', () => {
        panel.classList.toggle('panel-user-hidden', !checkbox.checked);
      });

      const handle = document.createElement('button');
      handle.type = 'button';
      handle.className = 'panel-move-handle';
      handle.textContent = '↔ 이동';
      handle.setAttribute('aria-label', name + ' 패널 이동');
      panel.prepend(handle);
      this.bindHandle(handle, panel);
      observer.observe(panel);
      return { panel, checkbox };
    });

    menu.querySelector('.panel-layout-reset').addEventListener('click', () => {
      for (const {panel, checkbox} of this.panels) {
        checkbox.checked = true;
        panel.classList.remove('panel-user-hidden', 'panel-positioned');
        for (const prop of ['--panel-x', '--panel-y', '--panel-width']) panel.style.removeProperty(prop);
      }
    });
    window.addEventListener('resize', () => {
      for (const { panel } of this.panels) this.keepOnScreen(panel);
    });
  }

  setActive(active) {
    this.menu.hidden = !active;
    if (!active) {
      this.menu.open = false;
      this.setEditing(false);
    }
  }

  setEditing(editing) {
    this.root.classList.toggle('editing-panels', editing);
    this.editButton.setAttribute('aria-pressed', String(editing));
  }

  place(panel, x, y, width) {
    panel.style.setProperty('--panel-width', width + 'px');
    panel.classList.add('panel-positioned');
    const maxX = Math.max(0, window.innerWidth - panel.offsetWidth);
    const maxY = Math.max(0, window.innerHeight - panel.offsetHeight);
    panel.style.setProperty('--panel-x', Math.round(Math.min(Math.max(x, 0), maxX)) + 'px');
    panel.style.setProperty('--panel-y', Math.round(Math.min(Math.max(y, 0), maxY)) + 'px');
  }

  keepOnScreen(panel) {
    if (!panel.classList.contains('panel-positioned') || !panel.offsetWidth) return;
    const x = parseFloat(panel.style.getPropertyValue('--panel-x'));
    const y = parseFloat(panel.style.getPropertyValue('--panel-y'));
    this.place(panel, x, y, parseFloat(panel.style.getPropertyValue('--panel-width')));
  }

  bindHandle(handle, panel) {
    let drag;
    handle.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      const bounds = panel.getBoundingClientRect();
      drag = {
        id: event.pointerId,
        offsetX: event.clientX - bounds.left,
        offsetY: event.clientY - bounds.top,
        width: panel.offsetWidth,
      };
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener('pointermove', event => {
      if (drag?.id !== event.pointerId) return;
      this.place(panel, event.clientX - drag.offsetX, event.clientY - drag.offsetY, drag.width);
    });
    handle.addEventListener('lostpointercapture', () => { drag = null; });
    handle.addEventListener('keydown', event => {
      const offset = {
        ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
      }[event.key];
      if (!offset) return;
      event.preventDefault();
      event.stopPropagation();
      const bounds = panel.getBoundingClientRect();
      this.place(panel, bounds.left + offset[0] * 12, bounds.top + offset[1] * 12, panel.offsetWidth);
    });
  }
}

export function createPeekPanel(panel, label) {
  const content = document.createElement('div');
  content.className = 'peek-content';
  content.id = panel.id + '-content';
  content.append(...panel.childNodes);
  const clip = document.createElement('div');
  clip.className = 'peek-clip';
  clip.append(content);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'peek-toggle';
  button.setAttribute('aria-controls', content.id);
  button.innerHTML = '<span class="peek-label"></span><span class="peek-caret" aria-hidden="true">▾</span>';
  const labelNode = button.querySelector('.peek-label');
  labelNode.textContent = label;
  panel.classList.add('peek-panel');
  panel.append(button, clip);

  let hovering = false;
  let pinned = false;
  const render = () => {
    const open = pinned || hovering || content.contains(document.activeElement);
    panel.classList.toggle('peek-open', open);
    button.setAttribute('aria-expanded', String(open));
    clip.inert = !open;
  };

  panel.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hovering = true;
    render();
  });
  panel.addEventListener('pointerleave', () => {
    hovering = false;
    render();
  });
  button.addEventListener('click', () => {
    pinned = !pinned;
    if (!pinned) hovering = false;
    render();
  });
  panel.addEventListener('focusout', () => queueMicrotask(render));
  panel.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !panel.classList.contains('peek-open')) return;
    button.focus();
    pinned = false;
    hovering = false;
    render();
  });
  render();

  return {
    reset() {
      if (content.contains(document.activeElement)) document.activeElement.blur();
      pinned = false;
      hovering = false;
      content.scrollTop = 0;
      render();
    },
    setLabel(text) {
      labelNode.textContent = text;
    },
  };
}

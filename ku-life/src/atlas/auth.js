import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

let client;
if (url && key) {
  try {
    client = createClient(url, key);
  } catch {
    // Keep ordinary play available if the deployment configuration is invalid.
  }
}

let user = null;

export function currentPlayer() {
  return user;
}

export function watchPlayer(onChange) {
  client?.auth.onAuthStateChange((_event, session) => {
    user = session?.user ?? null;
    onChange();
  });
}

export function openAccount(root) {
  const player = currentPlayer();
  const title = player ? '내 계정' : '이메일로 로그인';
  const dialog = document.createElement('dialog');
  dialog.className = 'atlas-dialog account-dialog';
  dialog.setAttribute('aria-labelledby', 'account-title');
  dialog.innerHTML = `
    <form class="account-form">
      <h2 id="account-title">${title}</h2>
      ${player ? '<p class="account-email"></p>'
        : client ? '<p>처음이면 이메일 링크를 열 때 가입됩니다.</p><label>이메일<input type="email" name="email" autocomplete="email" required></label>'
        : '<p>현재 이메일 로그인을 사용할 수 없습니다.</p>'}
      <p role="status" class="account-status"></p>
      <div class="actions">
        <button type="button" class="secondary">닫기</button>
        ${client ? `<button type="submit" class="primary">${player ? '로그아웃' : '로그인 링크 보내기'}</button>` : ''}
      </div>
    </form>`;

  const form = dialog.querySelector('form');
  const status = dialog.querySelector('[role="status"]');
  const submit = form.querySelector('[type="submit"]');
  if (player) dialog.querySelector('.account-email').textContent = player.email ?? '';

  form.querySelector('.secondary').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!client || submit.disabled) return;

    submit.disabled = true;
    status.textContent = player ? '로그아웃 중…' : '로그인 링크를 보내는 중…';
    try {
      if (player) {
        const { error } = await client.auth.signOut({ scope: 'local' });
        if (error) throw error;
        dialog.close();
        return;
      }

      const { error } = await client.auth.signInWithOtp({
        email: form.elements.email.value.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: new URL(import.meta.env.BASE_URL, window.location.origin).href,
        },
      });
      if (error) throw error;
      status.textContent = '이메일을 확인하고 로그인 링크를 열어 주세요.';
    } catch (error) {
      status.textContent = player ? '로그아웃에 실패했습니다. 다시 시도해 주세요.'
        : error.status === 429 ? '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
        : '로그인 링크를 보내지 못했습니다. 잠시 후 다시 시도해 주세요.';
    } finally {
      submit.disabled = false;
    }
  });

  root.append(dialog);
  dialog.showModal();
}

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
const schoolEmail = /^[^@\s]+@korea\.ac\.kr$/i;
const callback = new URLSearchParams(location.search).get('account');

let client;
if (url && key) {
  try {
    client = createClient(url, key);
  } catch {
    // A missing deployment configuration still allows guest play.
  }
}

let user = null;

export function currentPlayer() {
  return user?.user_metadata?.nickname ? user : null;
}

export function watchPlayer(onChange) {
  client?.auth.onAuthStateChange((_event, session) => {
    const candidate = session?.user;
    user = candidate?.email_confirmed_at && schoolEmail.test(candidate.email ?? '') ? candidate : null;
    onChange();
  });
}

export function openAccountCallback(root) {
  if (!user || (callback !== 'setup' && callback !== 'reset')) return;
  const clean = new URL(location.href);
  if (!clean.searchParams.has('account')) return;
  clean.searchParams.delete('account');
  history.replaceState(history.state, '', clean);
  const previous = root.querySelector('.account-dialog');
  previous?.close();
  previous?.remove();
  openAccount(root, callback);
}

function emailError(error) {
  if (error?.code === 'over_email_send_rate_limit') return '이메일 발송 한도에 도달했습니다. 이미 받은 링크가 있다면 먼저 확인해 주세요.';
  if (error?.status === 429) return '이메일 요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.';
  if (error?.code === 'email_address_not_authorized') return '이 주소로 메일을 보낼 수 없습니다. 운영자에게 발송 설정을 문의해 주세요.';
  return '인증 메일을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.';
}

function redirectTo(mode) {
  const destination = new URL(import.meta.env.BASE_URL, location.origin);
  destination.searchParams.set('account', mode);
  return destination.href;
}

const emailInput = '<label>고려대 이메일<input type="email" name="email" autocomplete="username" placeholder="example@korea.ac.kr" required></label>';
const newPasswordInput = '<label>새 비밀번호<input type="password" name="password" autocomplete="new-password" minlength="8" required></label>';
const forms = {
  login: {
    title: '로그인',
    fields: emailInput + '<label>비밀번호<input type="password" name="password" autocomplete="current-password" required></label>',
    submit: '로그인',
    links: [['signup', '회원가입'], ['recover', '비밀번호 재설정']],
  },
  signup: {
    title: '회원가입',
    fields: '<p>고려대 메일에서 인증 링크를 열면 닉네임과 비밀번호를 설정할 수 있어요.</p>' + emailInput,
    submit: '가입 인증 메일 보내기',
    links: [['login', '로그인']],
  },
  recover: {
    title: '비밀번호 재설정',
    fields: emailInput,
    submit: '재설정 메일 보내기',
    links: [['login', '로그인']],
  },
  setup: {
    title: '계정 설정',
    fields: '<label>닉네임<input name="nickname" autocomplete="nickname" maxlength="20" required></label>' + newPasswordInput,
    submit: '계정 설정 완료',
  },
  reset: { title: '새 비밀번호 설정', fields: newPasswordInput, submit: '비밀번호 저장' },
  account: { title: '내 계정', fields: '<p class="account-email"></p>', submit: '로그아웃' },
  unavailable: { title: '로그인', fields: '<p>현재 이메일 로그인을 사용할 수 없습니다.</p>' },
};

export function openAccount(root, mode = user ? (currentPlayer() ? 'account' : 'setup') : 'login') {
  if (!client) mode = 'unavailable';
  if (mode === 'reset' && !currentPlayer()) mode = 'setup';
  const view = forms[mode];
  const dialog = document.createElement('dialog');
  dialog.className = 'atlas-dialog account-dialog';
  dialog.setAttribute('aria-labelledby', 'account-title');
  const emailSent = mode === 'signup' || mode === 'recover';
  dialog.innerHTML = `
    <form class="account-form">
      <h2 id="account-title">${view.title}</h2>
      ${view.fields}
      <p role="status" class="account-status"></p>
      <div class="actions">
        <button type="button" class="secondary" data-account-close>닫기</button>
        ${view.submit ? `<button type="submit" class="primary">${view.submit}</button>` : ''}
      </div>
    </form>
    ${view.links ? `<div class="account-links">${view.links.map(([target, label]) =>
        `<button type="button" class="secondary" data-account-view="${target}">${label}</button>`).join('')}</div>` : ''}`;

  const form = dialog.querySelector('form');
  const status = dialog.querySelector('[role="status"]');
  const submit = form.querySelector('[type="submit"]');
  if (mode === 'account') dialog.querySelector('.account-email').textContent = `${user.user_metadata.nickname} · ${user.email}`;

  form.querySelector('[data-account-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  for (const link of dialog.querySelectorAll('[data-account-view]')) {
    link.addEventListener('click', () => {
      dialog.close();
      dialog.remove();
      openAccount(root, link.dataset.accountView);
    });
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!submit || submit.disabled) return;
    const email = form.elements.email?.value.trim().toLowerCase();
    const password = form.elements.password?.value;
    const nickname = form.elements.nickname?.value.trim();
    if (email !== undefined && !schoolEmail.test(email)) {
      status.textContent = '고려대 이메일(@korea.ac.kr)만 사용할 수 있어요.';
      return;
    }
    if (mode === 'setup' && !nickname) {
      status.textContent = '닉네임을 입력해 주세요.';
      return;
    }

    submit.disabled = true;
    status.textContent = emailSent ? '인증 메일을 보내는 중…' : '처리 중…';
    try {
      let result;
      switch (mode) {
        case 'account':
          result = await client.auth.signOut({ scope: 'local' });
          break;
        case 'login':
          result = await client.auth.signInWithPassword({ email, password });
          break;
        case 'signup':
          result = await client.auth.signUp({
            email,
            password: `Aa1!${crypto.randomUUID()}`,
            options: { emailRedirectTo: redirectTo('setup') },
          });
          break;
        case 'recover':
          result = await client.auth.resetPasswordForEmail(email, { redirectTo: redirectTo('reset') });
          break;
        case 'setup':
          result = await client.auth.updateUser({ password, data: { nickname } });
          break;
        case 'reset':
          result = await client.auth.updateUser({ password });
          break;
      }
      if (result?.error) throw result.error;
      if (emailSent) {
        if (mode === 'signup' && result.data.session) {
          await client.auth.signOut({ scope: 'local' });
          status.textContent = '현재 이메일 인증을 사용할 수 없습니다. 운영자에게 문의해 주세요.';
          return;
        }
        status.textContent = '메일함을 확인하고 인증 링크를 열어 주세요.';
        return;
      }
      dialog.close();
      if (mode === 'login' && user && !currentPlayer()) {
        dialog.remove();
        openAccount(root, 'setup');
      }
    } catch (error) {
      status.textContent = emailSent ? emailError(error)
        : mode === 'login' ? '이메일과 비밀번호를 확인해 주세요.'
        : error?.code === 'weak_password' ? '비밀번호가 보안 조건을 충족하지 않습니다. 더 강한 비밀번호를 입력해 주세요.'
        : error?.code === 'same_password' ? '기존 비밀번호와 다른 비밀번호를 입력해 주세요.'
        : '처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
    } finally {
      submit.disabled = false;
    }
  });

  root.append(dialog);
  dialog.showModal();
}

export async function playerAccessToken() {
  const player = currentPlayer();
  if (!player || !client) return null;
  const { data: { session } } = await client.auth.getSession();
  return session?.user.id === player.id ? session.access_token : null;
}

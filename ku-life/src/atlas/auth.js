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
const hasGoogleIdentity = player => player?.app_metadata?.provider === 'google'
  || player?.identities?.some(identity => identity.provider === 'google');
const profileMode = () => hasGoogleIdentity(user) ? 'nickname' : 'setup';

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
  if (!['setup', 'reset', 'google'].includes(callback) || (!user && callback !== 'google')) return;
  const clean = new URL(location.href);
  if (!clean.searchParams.has('account')) return;
  clean.searchParams.delete('account');
  history.replaceState(history.state, '', clean);
  const previous = root.querySelector('.account-dialog');
  previous?.close();
  previous?.remove();
  if (callback === 'google') {
    if (!user) {
      openAccount(root, 'login', 'Google 로그인에 실패했습니다. 학교 Google 계정(@korea.ac.kr)으로 다시 시도해 주세요.');
    } else if (!currentPlayer()) {
      openAccount(root, profileMode());
    }
    return;
  }
  openAccount(root, callback);
}

function emailError(error) {
  if (error?.code === 'over_email_send_rate_limit') return '이메일 발송 한도에 도달했습니다. 이미 받은 링크가 있다면 먼저 확인해 주세요.';
  if (error?.status === 429) return '이메일 요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.';
  if (error?.code === 'email_address_not_authorized') return '이 주소로 메일을 보낼 수 없습니다. 운영자에게 발송 설정을 문의해 주세요.';
  if (error?.code === 'signup_disabled' || error?.code === 'email_provider_disabled') {
    return '현재 이메일 회원가입이 비활성화되어 있습니다. 운영자에게 문의해 주세요.';
  }
  if (error?.name === 'AuthRetryableFetchError' && !error.status) {
    return '인증 서버에 연결하지 못했습니다. 연결 상태를 확인해 주세요.';
  }
  const code = typeof error?.code === 'string' && /^[a-z0-9_]{1,60}$/.test(error.code) ? error.code : '';
  const status = Number.isInteger(error?.status) && error.status >= 400 && error.status < 600 ? error.status : '';
  const reference = [status, code].filter(Boolean).join(' · ');
  return '인증 메일을 보내지 못했습니다. 운영자에게 문의해 주세요.'
    + (reference ? ` (오류 ${reference})` : '');

}

function redirectTo(mode) {
  const destination = new URL(import.meta.env.BASE_URL, location.origin);
  destination.searchParams.set('account', mode);
  return destination.href;
}

const emailInput = '<label>고려대 이메일<input type="email" name="email" autocomplete="username" placeholder="example@korea.ac.kr" required></label>';
const googleButton = label => `<button class="account-google" type="button" data-google-login>
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M43.61 24.46c0-1.36-.12-2.66-.34-3.92H24v7.43h11.01c-.47 2.53-1.9 4.68-4.05 6.12v5h6.56c3.83-3.53 6.09-8.72 6.09-14.63z"/>
    <path fill="#34A853" d="M24 44c5.51 0 10.13-1.83 13.52-4.91l-6.56-5c-1.83 1.22-4.15 1.95-6.96 1.95-5.31 0-9.82-3.59-11.43-8.42H5.8v5.17A20 20 0 0 0 24 44z"/>
    <path fill="#FBBC05" d="M12.57 27.62a12 12 0 0 1 0-7.24v-5.17H5.8a20 20 0 0 0 0 17.58l6.77-5.17z"/>
    <path fill="#EA4335" d="M24 11.96c3 0 5.69 1.03 7.81 3.06l5.86-5.86C34.12 5.86 29.5 4 24 4A20 20 0 0 0 5.8 15.21l6.77 5.17C14.18 15.55 18.69 11.96 24 11.96z"/>
  </svg>
  <span>${label}</span>
</button>`;

const nicknameInput = '<label>닉네임<input name="nickname" autocomplete="nickname" maxlength="20" required></label>';
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
    fields: '<p>@korea.ac.kr Google 계정으로 인증한 뒤 닉네임을 설정하면 가입이 완료됩니다.</p>',
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
    fields: nicknameInput + newPasswordInput,
    submit: '계정 설정 완료',
  },
  nickname: {
    title: '닉네임 설정',
    fields: nicknameInput,
    submit: '닉네임 저장',
  },
  reset: { title: '새 비밀번호 설정', fields: newPasswordInput, submit: '비밀번호 저장' },
  account: {
    title: '내 계정',
    fields: `<dl class="account-profile">
      <div><dt>이메일</dt><dd class="account-email"></dd></div>
      <div><dt>발견한 엔딩</dt><dd data-account-endings></dd></div>
    </dl>
    <section class="account-record" aria-labelledby="account-record-title">
      <h3 id="account-record-title">도전 전적</h3>
      <p data-account-record role="status">전적을 불러오는 중…</p>
    </section>
    ${nicknameInput}`,
    submit: '닉네임 저장',
  },
  unavailable: { title: '로그인', fields: '<p>현재 이메일 로그인을 사용할 수 없습니다.</p>' },
};

export function openAccount(root, mode = user ? (currentPlayer() ? 'account' : profileMode()) : 'login', message = '', profile = null) {
  if (!client) mode = 'unavailable';
  if (mode === 'reset' && !currentPlayer()) mode = 'setup';
  const view = forms[mode];
  const dialog = document.createElement('dialog');
  dialog.className = 'atlas-dialog account-dialog';
  dialog.setAttribute('aria-labelledby', 'account-title');
  const sendsEmail = mode === 'recover';
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
    ${mode === 'account' ? '<div class="account-links"><button class="secondary" type="button" data-account-logout>로그아웃</button></div>' : ''}
    ${mode === 'login' ? googleButton('고려대 이메일로 로그인') : ''}
    ${mode === 'signup' ? googleButton('고려대 이메일로 회원가입') : ''}
    ${view.links ? `<div class="account-links">${view.links.map(([target, label]) =>
        `<button type="button" class="secondary" data-account-view="${target}">${label}</button>`).join('')}</div>` : ''}`;

  const form = dialog.querySelector('form');
  const status = dialog.querySelector('[role="status"]');
  const submit = form.querySelector('[type="submit"]');
  status.textContent = message;
  const google = dialog.querySelector('[data-google-login]');
  google?.addEventListener('click', async () => {
    google.disabled = true;
    status.textContent = 'Google 로그인으로 이동 중…';
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo('google'),
          queryParams: { hd: 'korea.ac.kr', prompt: 'select_account' },
        },
      });
      if (error) throw error;
    } catch {
      status.textContent = 'Google 로그인을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.';
      google.disabled = false;
    }
  });
  const logout = dialog.querySelector('[data-account-logout]');
  if (mode === 'account') {
    dialog.querySelector('.account-email').textContent = user.email;
    form.elements.nickname.value = user.user_metadata.nickname;
    dialog.querySelector('[data-account-endings]').textContent = profile?.endings ?? '—';
    const record = dialog.querySelector('[data-account-record]');
    if (profile) {
      void profile.loadRecord().then(({ completed, bestScore }) => {
        record.textContent = completed
          ? `완료 ${completed.toLocaleString('ko-KR')}회 · 최고 ${bestScore.toLocaleString('ko-KR')}점`
          : '완료한 도전이 없어요.';
      }).catch(() => { record.textContent = '도전 전적을 불러오지 못했습니다.'; });
    } else {
      record.textContent = '도전 전적을 불러올 수 없습니다.';
    }
    logout.addEventListener('click', async () => {
      logout.disabled = true;
      submit.disabled = true;
      try {
        const { error } = await client.auth.signOut({ scope: 'local' });
        if (error) throw error;
        dialog.close();
      } catch {
        status.textContent = '로그아웃하지 못했습니다. 다시 시도해 주세요.';
      } finally {
        logout.disabled = false;
        submit.disabled = false;
      }
    });
  }

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
    if ((mode === 'setup' || mode === 'nickname' || mode === 'account') && !nickname) {
      status.textContent = '닉네임을 입력해 주세요.';
      return;
    }

    submit.disabled = true;
    if (logout) logout.disabled = true;
    status.textContent = sendsEmail ? '인증 메일을 보내는 중…' : '처리 중…';
    try {
      let result;
      switch (mode) {
        case 'login':
          result = await client.auth.signInWithPassword({ email, password });
          break;
        case 'recover':
          result = await client.auth.resetPasswordForEmail(email, { redirectTo: redirectTo('reset') });
          break;
        case 'setup':
          result = await client.auth.updateUser({ password, data: { nickname } });
          break;
        case 'account':
        case 'nickname':
          result = await client.auth.updateUser({ data: { nickname } });
          break;
        case 'reset':
          result = await client.auth.updateUser({ password });
          break;
      }
      if (result?.error) throw result.error;
      if (mode === 'account') {
        form.elements.nickname.value = nickname;
        status.textContent = '닉네임을 저장했습니다.';
        return;
      }
      if (sendsEmail) {
        status.textContent = '메일함을 확인하고 인증 링크를 열어 주세요.';
        return;
      }
      dialog.close();
      if (mode === 'login' && user && !currentPlayer()) {
        dialog.remove();
        openAccount(root, profileMode());
      }
    } catch (error) {
      status.textContent = sendsEmail ? emailError(error)
        : mode === 'login' ? '이메일과 비밀번호를 확인해 주세요.'
        : error?.code === 'weak_password' ? '비밀번호가 보안 조건을 충족하지 않습니다. 더 강한 비밀번호를 입력해 주세요.'
        : error?.code === 'same_password' ? '기존 비밀번호와 다른 비밀번호를 입력해 주세요.'
        : '처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
    } finally {
      submit.disabled = false;
      if (logout) logout.disabled = false;
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

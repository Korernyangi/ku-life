# KU-LIFE

시작 화면의 **입학하기**로 플레이합니다. 진행 기록은 현재 브라우저에 자동 저장됩니다.

- 이벤트, 선택지, 후속 사건은 `ku-life/src/atlas/events.js`에서 관리합니다.
- 초기값, 상태이상, 아이템 및 엔딩 조건은 `ku-life/src/atlas/config.js`에서 관리합니다.
- `ku-life/`에서 `npm run test:atlas`로 핵심 규칙을 검사하고 `npm run build`로 게임을 빌드합니다.

### 학기 말 미니게임

학기 정산 화면에서 **미니게임**을 열면 인형뽑기와 행운 룰렛 중 하나를 선택할 수 있습니다. 인형뽑기는 좌우로 움직이는 집게를 상품 위에서 내리는 순간 참가비 50,000원이 차감됩니다. 상품을 들어 올릴 때 버튼을 누르고 떼며 게이지를 초록 구간에 유지하면 상점 아이템을 인벤토리에 추가합니다. 룰렛은 게임을 열 때의 보유 자금과 선택된 칸의 비율을 바탕으로 자금을 정산합니다. 룰렛을 돌리거나 집게를 내리면 그 학기의 도전이 사용되며 결과는 저장됩니다.

https://ku-life-dqkk.vercel.app/

### 고려대 이메일 회원가입과 로그인

시작 화면 오른쪽 위의 **로그인**을 누르면 로그인 폼 아래에 **회원가입**이 표시됩니다. 회원가입은 `@korea.ac.kr` 주소로 인증 메일을 받고, 링크에서 닉네임과 비밀번호를 설정하면 완료됩니다. 이후에는 학교 이메일과 비밀번호로 로그인합니다. 기존 이메일 링크 계정은 **비밀번호 재설정**으로 비밀번호를 등록할 수 있습니다.

로그인한 뒤 시작한 게임은 계정 ID별로 현재 브라우저에 저장됩니다. 게스트 진행은 새로고침하면 사라집니다. 기존 공용 브라우저 저장에는 소유 계정 정보가 없어 새 계정 슬롯으로 자동 이전하지 않습니다.

1. Supabase의 **Authentication → Providers**에서 Email, 신규 사용자 가입, 이메일 인증(Confirm email)을 활성화합니다. 가입 확인 및 비밀번호 재설정 메일 템플릿에 링크(`{{ .ConfirmationURL }}`)를 사용합니다.
2. Supabase SQL Editor에서 [학교 이메일 제한 SQL](ku-life/supabase/school-auth-hooks.sql)을 실행합니다. **Authentication → Hooks**에서 **Before User Created**에 `public.require_ku_email_for_signup`, **Customize Access Token (JWT) Claims**에 `public.require_ku_email_for_access_token`을 선택합니다. 다른 훅을 이미 사용 중이라면 기존 로직과 도메인 검증을 합칩니다. 토큰 발급 훅 적용 전에 이미 발급된 액세스 토큰은 만료 시까지 유효할 수 있습니다.
3. **Authentication → URL Configuration**에 배포 사이트의 Site URL(`https://ku-life-dqkk.vercel.app/`)을 입력합니다. 사용하는 각 사이트의 가입 및 재설정 주소(`/?account=setup`, `/?account=reset`)를 Redirect URLs에 추가합니다. 로컬과 Vercel Preview에서도 각각 실제 접속하는 사이트 주소를 사용합니다.
4. Vercel의 Supabase 연동으로 공개 URL과 publishable/anon key를 공급합니다. 직접 설정하려면 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_PUBLISHABLE_KEY`를 지정한 뒤 배포합니다. 로컬 테스트에서는 앱 디렉터리의 `.env.local`에 같은 이름을 사용합니다.
5. 프로젝트 팀 외부 사용자에게도 이메일을 보내려면 사용자 지정 SMTP를 설정합니다.

#### 실제 가입 메일 발송

Supabase **Authentication → SMTP Settings**에서 **Enable Custom SMTP**를 켭니다. SMTP 제공업체에서 인증한 발신 이메일과 연결 정보를 입력합니다. 예를 들어 Resend를 사용하는 경우 다음 값을 설정합니다.

| Supabase 설정 | Resend 값 |
| --- | --- |
| Sender email | 인증한 도메인의 이메일 주소 |
| Sender name | KU-LIFE |
| Host | `smtp.resend.com` |
| Port | `587` |
| Username | `resend` |
| Password | Resend API 키 |

API 키는 Supabase의 SMTP 비밀번호 입력란에 저장합니다. SMTP 설정만 바꿨다면 Vercel 재배포 없이 적용됩니다. 배포 사이트에서 기존에 가입한 적 없는 고려대 이메일 주소로 링크를 한 번 요청한 뒤, 받은 링크에서 닉네임과 비밀번호를 설정하고 **내 계정**이 표시되는지 확인하세요. 발송이 실패하면 Supabase **Auth Logs**의 `/otp` 요청과 SMTP 제공업체의 발송 기록을 확인합니다.

### 도전모드와 순위표

고려대 계정으로 로그인한 뒤 **도전모드**를 선택합니다. 서버가 학과, 일반 모드보다 낮은 네 가지 스탯, 35만~65만원의 자금을 배정합니다. 도전모드에서는 미니게임 없이 학기와 엔딩을 진행합니다. 도전 진행은 서버에 계정별로 저장되어 다시 로그인하면 이어갈 수 있습니다.

엔딩에서 **순위표에 기록 공개**를 선택하면 닉네임, 학과, 점수가 다른 로그인 플레이어에게 보입니다. 순위표는 계정별 공개 최고 점수 상위 50명을 표시하며 동점은 같은 순위입니다. 점수는 일반 게임과 같은 토탈 스코어 공식으로 서버에서 계산합니다.

배포 전에 Supabase SQL Editor에서 [도전모드 SQL](ku-life/supabase/challenge.sql)을 실행합니다. Vercel 프로젝트의 Root Directory는 `ku-life`로 설정하고, 서버 전용 환경 변수에 `SUPABASE_SECRET_KEY` 또는 `SUPABASE_SERVICE_ROLE_KEY`가 준비되어 있는지 확인합니다. 이 키는 `VITE_` 변수에 넣지 않습니다. 프로젝트 URL은 기존 Supabase 공개 URL 변수를 사용합니다. Vercel 함수와 함께 로컬에서 테스트하려면 앱 디렉터리에서 Vercel CLI의 `vercel dev`를 사용합니다.

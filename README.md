# KU-LIFE

시작 화면의 **입학하기**로 플레이합니다. 진행 기록은 현재 브라우저에 자동 저장됩니다.

- 이벤트, 선택지, 후속 사건은 `ku-life/src/atlas/events.js`에서 관리합니다.
- 초기값, 상태이상, 아이템 및 엔딩 조건은 `ku-life/src/atlas/config.js`에서 관리합니다.
- `ku-life/`에서 `npm run test:atlas`로 핵심 규칙을 검사하고 `npm run build`로 게임을 빌드합니다.

### 학기 말 미니게임

학기 정산 화면에서 **미니게임**을 열면 인형뽑기와 행운 룰렛 중 하나를 선택할 수 있습니다. 인형뽑기는 집게를 내릴 때 참가비 50,000원이 차감되며 성공하면 상점 아이템을 인벤토리에 추가합니다. 룰렛은 게임을 열 때의 보유 자금과 선택된 칸의 비율을 바탕으로 자금을 정산합니다. 룰렛을 돌리거나 집게를 내리면 그 학기의 도전이 사용되며 결과는 저장됩니다.

https://ku-life-dqkk.vercel.app/

### Supabase 이메일 로그인

시작 화면 오른쪽 위의 **로그인 · 회원가입**에서 이메일 링크를 요청합니다. 링크를 열면 Supabase가 계정을 만들거나 기존 계정으로 로그인합니다. 계정의 고유 ID는 Auth 세션의 `user.id`입니다. 일반 플레이 기록은 브라우저에 자동 저장됩니다.

1. Supabase의 **Authentication → Providers**에서 Email과 신규 사용자 가입을 활성화합니다. **Email Templates**의 Magic Link 및 가입 확인 템플릿에는 이메일 링크(`{{ .ConfirmationURL }}`)를 사용합니다.
2. **Authentication → URL Configuration**의 Site URL에 배포 사이트 주소(`https://ku-life-dqkk.vercel.app/`)를 등록합니다. 다른 접속 주소에서 로그인할 경우 해당 URL도 Redirect URLs에 추가합니다. 로컬 테스트에는 실제로 접속하는 로컬 주소(예를 들어 `http://localhost:5173/`)를 등록합니다.
3. Vercel의 Supabase 연동이 제공하는 공개 URL과 publishable/anon key 변수로 빌드할 수 있습니다. 직접 지정하려면 Vercel 프로젝트에 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_PUBLISHABLE_KEY`를 설정한 뒤 다시 배포합니다. 로컬에서는 앱 디렉터리의 `.env.local`에 같은 이름으로 설정합니다. 브라우저에서 공개되는 변수이므로 Supabase의 publishable key를 사용하세요.
4. 공개 가입을 운영하려면 Supabase에 사용자 지정 SMTP를 설정합니다. 기본 이메일 발송 서비스는 프로젝트 팀 외부 사용자에게 발송할 수 없습니다.

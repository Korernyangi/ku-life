# ATLAS · 안암의 여덟 학기

시작 화면의 **입학하기**로 플레이합니다. 게임은 사이트 첫 화면(`/`)에서 열리며, 기존 `/atlas.html` 주소도 첫 화면으로 이동합니다. 진행 기록은 현재 브라우저에 자동 저장됩니다.

- 이벤트, 선택지, 후속 사건은 `ku-life/src/atlas/events.js`에서 관리합니다.
- 초기값, 상태이상, 아이템 및 엔딩 조건은 `ku-life/src/atlas/config.js`에서 관리합니다.
- `ku-life/`에서 `npm run test:atlas`로 핵심 규칙을 검사하고 `npm run build`로 게임을 빌드합니다.

### 미니게임 연결

학기 말에 미니게임을 열면 브라우저에 `atlas:minigame-start` 이벤트가 발생합니다. `event.detail`의 `id`와 `balance`는 현재 세션과 시작 시점의 원화 잔액입니다. 미니게임이 끝나면 `complete(정수_금액_변화)`, 취소하면 `exit()`를 호출합니다. 정산은 세션당 한 번만 반영되며, 성공하면 `true`를 반환하고 상점으로 돌아갑니다. 미니게임이 연결되지 않은 경우에도 미니게임 화면에서 바로 상점으로 돌아갈 수 있습니다.

https://ku-life-dqkk.vercel.app/

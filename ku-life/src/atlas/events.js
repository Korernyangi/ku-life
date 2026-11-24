import { RULES } from './config.js';

const pick = (text, message, stats = {}, details = {}) => ({ text, message, stats, ...details });

export const EVENTS = [
  {
    id: 'orientation', title: '새내기 배움터', scene: 'campus', kind: 'fixed', terms: [1],
    description: '새터 버스가 안암을 떠나기 전이다. 동기와 선배를 만날 첫 기회지만 참가비와 체력이 든다.',
    choices: [
      pick('새터에 가서 선배와 조를 이룬다', '조별 미션을 마치고 과방을 안내해 주겠다는 선배와 연락처를 나눴다.', { social: 3, hp: -2, mental: 1 }, { cash: -70_000, grant: ['orientation', 'senior'], schedule: { id: 'senior_notes', after: 1 } }),
      pick('교내 신입생 만남에만 들른다', '새터 대신 학과 건물에서 동기와 점심을 먹었다.', { social: 1, mental: 1 }),
      pick('기숙사에서 새 학기를 준비한다', '짐을 정리하고 충분히 잤다. 수강편람을 한 번 훑어 봤다.', { hp: 2, intelligence: 1 }),
    ],
  },
  {
    id: 'night_review', title: '과학도서관 밤샘', scene: 'study', kind: 'fixed', terms: [2, 4, 6],
    description: '시험 범위가 밀렸다. 모두 보려면 과학도서관에서 밤을 보낼 각오가 필요하다.',
    study: true,
    choices: [
      pick('밤을 새워 전 범위를 훑는다', '컨디션만큼 진도가 나갔다. 아침에 도서관을 나와 잠시 눈을 붙였다.', {}, {
        intensity: 'high', requires: { min: { hp: 6 } },
        brackets: [
          { min: { hp: 16 }, stats: { intelligence: 3, hp: -4 } },
          { min: { hp: 10 }, stats: { intelligence: 2, hp: -5 } },
          { min: { hp: 6 }, stats: { intelligence: 1, hp: -5 } },
        ],
      }),
      pick('동기와 전공 스터디를 연다', '서로 헷갈리는 부분을 짚고 시험 범위를 정리했다.', { intelligence: 2, social: 1, hp: -2 }, { requires: { min: { hp: 3 } } }),
      pick('핵심 한 단원만 보고 일찍 잔다', '빈칸은 남았지만 시험장까지 가는 발걸음이 가벼웠다.', { hp: 3, mental: 1 }),
    ],
  },
  {
    id: 'teamwork', title: '전공 팀플의 첫 회의', scene: 'club', kind: 'fixed', terms: [3],
    description: '발표 역할을 나눠야 한다. 혼자 끌어안거나, 서로 잘하는 것을 찾아 줄 수 있다.',
    study: true,
    choices: [
      pick('친구의 자료 조사까지 도와준다', '마감은 지켰다. 친구가 다음에 도움이 필요하면 꼭 말해 달라고 했다.', { hp: -2, social: 2, intelligence: 1 }, { requires: { min: { hp: 4 } }, grant: ['friendHelp'], schedule: { id: 'friend_returns', after: 1 } }),
      pick('역할을 나누고 일정표를 공유한다', '분량은 줄었지만 일정은 지켰다.', { social: 1, intelligence: 1 }),
      pick('발표 전에 잠깐 산책하고 합류한다', '한숨 돌리고 해야 할 일을 한 가지 맡았다.', { hp: 3, mental: 2 }),
    ],
  },
  {
    id: 'career_plan', title: '진로를 정하는 학과 상담', scene: 'study', kind: 'fixed', terms: [5],
    description: '연구실과 실무 인턴 모집이 겹친다. 무엇을 경험할지 정하면 다음 학기에 연락이 올 수 있다.',
    study: true,
    choices: [
      pick('교수님께 학부 연구를 문의한다', '연구 주제 목록을 받았다. 다음 학기 연구실에 다시 연락해 보기로 했다.', { intelligence: 2, hp: -1 }, { schedule: { id: 'lab_offer', after: 1 } }),
      pick('실무 인턴 공고를 골라 지원한다', '자기소개서를 보냈다. 이번 방학 면접을 준비할 차례다.', { social: 2, mental: -1 }, { schedule: { id: 'intern_interview', after: 1 } }),
      pick('동기와 서비스 아이디어를 검토한다', '과제에서 쌓은 아이디어를 데모로 만들기로 했다.', { intelligence: 1, social: 1, hp: -1 }, { grant: ['startup'], schedule: { id: 'startup_launch', after: 1 } }),
      pick('상담을 듣고 일정을 비워 둔다', '진로 선택을 미루고 밀린 잠을 챙겼다.', { hp: 4, mental: 2 }),
    ],
  },
  {
    id: 'capstone', title: '졸업 프로젝트 중간 점검', scene: 'study', kind: 'fixed', terms: [7],
    description: '졸업 프로젝트가 초안 수준에 머물러 있다. 도구와 체력을 어떻게 쓸지 결정해야 한다.',
    study: true,
    choices: [
      pick('내 노트북으로 데이터와 초안을 함께 정리한다', '자료를 재현할 수 있도록 정리했다. 교수님이 마지막 발표를 기대한다고 했다.', { intelligence: 2, hp: -1 }, { requires: { items: ['laptop'], min: { hp: 2 } } }),
      pick('직접 추가 실험까지 진행한다', '추가 실험을 발표에 넣었다. 마감 직후는 조금 벅찼다.', { intelligence: 3, hp: -3, mental: -1 }, { intensity: 'high', requires: { min: { hp: 5, intelligence: RULES.advancedStudy } } }),
      pick('범위를 줄여 제출 준비를 끝낸다', '한 가지 결과를 확실히 설명할 수 있게 됐다.', { intelligence: 1, mental: 1 }),
    ],
  },
  {
    id: 'graduation', title: '졸업 준비', scene: 'campus', kind: 'fixed', terms: [8],
    description: '학적부의 마지막 학기다. 취업, 연구, 졸업사진 중 이번 주에 무엇부터 할까?',
    choices: [
      pick('기업 최종 면접에 간다', '면접 대기실에서 깊게 숨을 골랐다.', { hp: -2, mental: -1 }, {
        intensity: 'high', requires: { min: { hp: 4, intelligence: 11, social: 8 } },
        chance: { base: .3, weights: { intelligence: .018, social: .022, mental: .008 }, success: { message: '최종 면접에 합격했다. 동기에게 먼저 소식을 전했다.', grant: ['job'] }, failure: { message: '면접 결과는 아쉬웠다. 질문을 정리해 다음 기회에 쓰기로 했다.', stats: { mental: -1 } } },
      }),
      pick('졸업생 연구 제안을 검토한다', '연구 주제를 조금 더 구체화해 후배에게 자료를 건넸다.', { intelligence: 2, mental: 1 }, { requires: { flags: ['lab'] } }),
      pick('동기들과 졸업사진을 찍는다', '중앙광장에서 같은 표정을 짓느라 웃음이 터졌다.', { social: 2, mental: 2 }, { cash: -80_000, grant: ['photos'] }),
      pick('졸업 요건과 서류부터 확인한다', '빠뜨린 제출일을 체크한 뒤 가볍게 한 바퀴 걸었다.', { hp: 3, mental: 2 }),
    ],
  },
  {
    id: 'registration', title: '수강신청 실패', scene: 'exam', kind: 'academic', terms: [1, 3, 5, 7],
    description: '정각에 열렸던 전공 수업이 이미 마감됐다. 다른 시간대를 찾거나 주변에 도움을 청할 수 있다.',
    study: true,
    choices: [
      pick('선배에게 대체 수업을 추천받는다', '필수 학점을 채울 수 있는 다른 수업을 찾았다.', { social: 1, intelligence: 1 }, { requires: { flags: ['senior'] } }),
      pick('정정 기간에 맞춰 다시 접속한다', '한 자리를 확보했지만 여러 번 시간표를 바꿔야 했다.', { hp: -1, intelligence: 1 }, { requires: { min: { hp: 2 } } }),
      pick('여유 있는 교양으로 시간표를 채운다', '학업 계획은 유연해졌고 공강도 한 칸 생겼다.', { hp: 2, mental: 1 }),
    ],
  },
  {
    id: 'cheer_ot', network: true, weight: 2, title: '응원 OT', scene: 'club', kind: 'campus', terms: [1],
    description: '처음 듣는 응원가가 강당에서 울린다. 기본 동작부터 옆자리 동기와 맞춰 볼까?',
    choices: [
      pick('끝까지 남아 응원가를 배운다', '후렴을 외우고 고연전 때 다시 만나기로 했다.', { social: 2, mental: 1, hp: -2 }, { requires: { min: { hp: 4 } }, grant: ['cheerOt'] }),
      pick('앞부분만 듣고 일찍 돌아간다', '익숙한 동기 한 명이 늘었고 체력도 아꼈다.', { social: 1, hp: 2 }),
    ],
  },
  {
    id: 'ipselenti', weight: 3, title: '입실렌티', scene: 'ipselenti', kind: 'campus', terms: [1, 3, 5, 7], repeat: true,
    description: '축제 무대로 사람들이 몰린다. 좋은 자리와 편한 귀가 사이에서 선택해야 한다.',
    choices: [
      pick('친구들과 마지막 곡까지 뛴다', '목은 쉬었지만 밤공기가 오래 기억에 남았다.', { hp: -4, social: 3, mental: 3 }, { cash: -50_000, requires: { min: { hp: 6 } }, grant: ['ipselenti'] }),
      pick('좋아하는 무대 한 팀만 보고 돌아간다', '보고 싶었던 공연만큼은 놓치지 않았다.', { hp: -1, social: 1, mental: 2 }, { cash: -20_000, requires: { min: { hp: 2 } }, grant: ['ipselenti'] }),
      pick('캠퍼스 밖에서 조용히 쉰다', '다음날 일정에 바로 들어갈 수 있도록 체력을 챙겼다.', { hp: 4, mental: 1 }),
    ],
  },
  {
    id: 'koyeonjeon', weight: 3, title: '정기 고연전', scene: 'koyeonjeon', kind: 'campus', terms: [2, 4, 6, 8], repeat: true,
    description: '친구들이 고연전에 함께 가자고 한다. 최근 과제와 시험공부로 체력이 빠듯하다.',
    choices: [
      pick('친구들과 끝까지 응원한다', '목이 쉬도록 응원했다. 잊지 못할 추억을 만들었지만 몸은 피곤하다.', { hp: -5, social: 3, mental: 3 }, { cash: -80_000, requires: { min: { hp: 8 } }, intensity: 'high', grant: ['koyeonjeon'] }),
      pick('경기만 잠깐 보고 돌아온다', '응원석에 잠깐 앉아 친구들과 하이라이트를 함께 봤다.', { hp: -2, social: 1, mental: 1 }, { cash: -30_000, requires: { min: { hp: 3 } }, grant: ['koyeonjeon'] }),
      pick('과학도서관에서 공부한다', '응원 소식은 친구에게 듣고 밀린 과제를 끝냈다.', { intelligence: 2, hp: -1, mental: -2 }, { requires: { min: { hp: 2 } } }),
      pick('집에서 휴식한다', '응원석은 비웠지만 다음 수업에 갈 체력을 되찾았다.', { hp: 4, mental: 2, social: -1 }),
    ],
  },
  {
    id: 'sabal', title: '사발식 참여 제안', scene: 'club', kind: 'campus', terms: [1, 2],
    description: '학과 모임에서 참여 제안을 받았다. 참여 방식은 각자 정할 수 있다.',
    choices: [
      pick('무알코올 음료로 함께한다', '같은 자리에서 이야기를 나누고 일찍 귀가했다.', { social: 2, hp: -1 }, { requires: { min: { hp: 2 } } }),
      pick('참여를 거절하고 점심 약속을 잡는다', '부담 없는 방식으로 동기와 인사를 이어 갔다.', { social: 1, mental: 2 }),
    ],
  },
  {
    id: 'chamsari', title: '참살이길 뒤풀이', scene: 'parttime', kind: 'campus', terms: [2, 3, 4, 6],
    description: '팀플이 끝나자 참살이길에서 저녁을 먹자는 연락이 온다.',
    choices: [
      pick('저녁 모임 끝까지 남는다', '길었던 회의 이야기가 웃긴 추억이 됐다.', { social: 3, mental: 1, hp: -2 }, { cash: -50_000, requires: { min: { hp: 4 } } }),
      pick('인사만 하고 산책하며 돌아간다', '지출을 아끼고 마음을 정리했다.', { mental: 2, hp: 2 }),
    ],
  },
  {
    id: 'reading_room', title: '중앙광장 열람실 자리 경쟁', scene: 'study', kind: 'academic', terms: [1, 2, 3, 4, 5, 6, 7, 8], repeat: true, study: true,
    description: '시험 기간 열람실은 만석이다. 빈자리를 기다리거나 공부할 방식을 바꿔야 한다.',
    choices: [
      pick('선배가 비운 자리를 이어받는다', '대기 시간을 아껴 계획했던 분량을 끝냈다.', { intelligence: 2, hp: -1 }, { requires: { min: { hp: 3, social: RULES.strongNetwork } } }),
      pick('빈 강의실에서 공부한다', '소음은 조금 있었지만 기출을 두 문제 풀었다.', { intelligence: 1, hp: -1 }, { requires: { min: { hp: 2 } } }),
      pick('과제를 챙겨 집에 돌아간다', '오늘은 잠을 먼저 챙겨 내일 집중하기로 했다.', { hp: 3, mental: 2 }),
    ],
  },
  {
    id: 'club', network: true, title: '애기능 동아리 활동', scene: 'club', kind: 'campus', terms: [1, 2, 3, 4, 5, 6, 7, 8], repeat: true,
    description: '애기능 동아리방에서 신입 회원을 맞이하고 있다. 꾸준히 참여할 시간도 생각해야 한다.',
    choices: [
      pick('동아리에 가입해 선배와 이야기한다', '동아리방 열쇠를 받았다. 선배가 학과 자료를 나눠 주기로 했다.', { social: 2, hp: -1 }, { requires: { min: { hp: 3 } }, grant: ['club', 'senior'], schedule: { id: 'senior_notes', after: 1 } }),
      pick('체험 모임만 보고 집에 간다', '한 차례 둘러본 뒤 모임 연락처만 남겼다.', { hp: 2, mental: 1, social: 1 }),
    ],
  },
  {
    id: 'walk', title: '개운산 산책', scene: 'campus', kind: 'random', terms: [1, 2, 3, 4, 5, 6, 7, 8], repeat: true,
    description: '오늘 마지막 수업이 일찍 끝났다. 개운산 입구까지 걸어도 아직 해가 남아 있다.',
    choices: [
      pick('공기가 좋을 때 산책한다', '짧은 오르막을 걷고 돌아오자 잠이 잘 왔다.', { hp: 4, mental: 2 }),
      pick('동기에게 같이 걷자고 연락한다', '수업에서 못 물어봤던 이야기를 나눴다.', { hp: 2, mental: 2, social: 1 }),
      pick('산책 대신 과제에 집중한다', '숨 돌릴 시간을 조금 써서 과제 초안을 마쳤다.', { intelligence: 2, hp: -1 }, { requires: { min: { hp: 2 } } }),
    ],
  },
  {
    id: 'boarding', title: '안암 자취방 계약', scene: 'campus', kind: 'random', terms: [2, 3, 4, 5],
    description: '통학을 줄일 수 있는 방을 찾았다. 당장 나갈 돈과 앞으로 아낄 체력을 저울질한다.',
    choices: [
      pick('학교 가까운 방을 계약한다', '며칠 동안 짐을 정리하고 나니 아침에 쓸 시간이 생겼다.', { hp: 4, mental: 2 }, { cash: -400_000 }),
      pick('통학을 이어가며 시간을 조정한다', '방값은 아꼈지만 아침 출발 시간을 앞당겼다.', { mental: 1, hp: 1 }),
    ],
  },
  {
    id: 'pub', title: '일일호프 운영', scene: 'parttime', kind: 'random', terms: [3, 4, 5, 6],
    description: '동아리에서 하루만 운영하는 행사를 준비한다. 식사와 무알코올 음료를 중심으로 손님을 맞을 예정이다.',
    choices: [
      pick('재료비를 내고 운영을 맡는다', '하루 운영에 시간과 재료를 썼다.', { hp: -3 }, {
        cash: -120_000, intensity: 'high', requires: { min: { hp: 5 } },
        chance: { base: .35, weights: { social: .025, mental: .006 }, success: { message: '준비한 메뉴가 모두 팔려 수익을 나눴다.', cash: 350_000, stats: { social: 2 } }, failure: { message: '예상보다 손님이 적었다. 장부를 정리하고 마감했다.', stats: { mental: -2 } } },
      }),
      pick('홍보만 도와주고 저녁에는 쉰다', '소식을 나누고 뒷정리가 밀리지 않게 했다.', { social: 1, hp: 2 }),
    ],
  },
  {
    id: 'double_major', title: '이중전공 지원', scene: 'exam', kind: 'conditional', terms: [3, 4, 5], study: true,
    requires: { min: { intelligence: 9 } },
    description: '다른 전공에 지원할 수 있다. 학업 계획서를 설득력 있게 쓰면 합격 가능성이 올라간다.',
    choices: [
      pick('전공 포트폴리오까지 제출한다', '수강 기록과 관심 분야를 정리했다.', { hp: -2 }, {
        requires: { min: { intelligence: RULES.advancedStudy, hp: 4 }, gpa: 2.5 },
        chance: { base: .30, weights: { intelligence: .025, mental: .008 }, gpaWeight: .06, success: { message: '이중전공에 합격했다. 다음 학기 시간표가 달라진다.', grant: ['doubleMajor'], stats: { intelligence: 2 } }, failure: { message: '지원서를 다시 다듬을 기회를 남겼다.', stats: { mental: -1 } } },
      }),
      pick('전공을 유지하고 관심 과목 한 개를 듣는다', '부담을 줄이고 한 과목에서 깊이를 더했다.', { intelligence: 1, mental: 1 }),
    ],
  },
  {
    id: 'reporter', network: true, title: '고대신문 기자 모집', scene: 'campus', kind: 'conditional', terms: [2, 3, 4, 5],
    requires: { min: { social: 7 } },
    description: '캠퍼스에 남겨 둘 이야기를 찾을 학생 기자를 모집한다.',
    choices: [
      pick('안암에서 인터뷰를 시작한다', '첫 인터뷰 원고를 보냈다. 데스크가 다음 특집도 함께하자고 했다.', { hp: -2, social: 2, intelligence: 1 }, { requires: { min: { hp: 4 } }, grant: ['reporter'], schedule: { id: 'newspaper_special', after: 2 } }),
      pick('사연을 제보하고 취재는 맡기지 않는다', '작은 제보가 동아리방의 글감이 됐다.', { social: 1, mental: 1 }),
    ],
  },
  {
    id: 'representative', network: true, title: '과대표 출마', scene: 'club', kind: 'conditional', terms: [3, 4],
    requires: { min: { social: 8 } },
    description: '과대표 후보를 찾고 있다. 사람들 의견을 모으는 보람만큼 시간도 많이 든다.',
    choices: [
      pick('후보가 되어 학과 회의를 맡는다', '자리를 준비하고 의견을 들었다. 부탁하는 사람이 조금 늘었다.', { social: 3, hp: -3, mental: -1 }, { intensity: 'high', requires: { min: { hp: 5, social: RULES.strongNetwork } } }),
      pick('후보에게 정리한 제안만 전달한다', '정리한 제안 중 한 가지가 안건이 됐다.', { social: 1, mental: 1 }),
    ],
  },
  {
    id: 'lab_offer', title: '학부연구생 지원', scene: 'study', kind: 'conditional', terms: [5, 6, 7], study: true,
    description: '연구실에서 실험 노트를 함께 작성할 학부생을 찾는다.',
    choices: [
      pick('연구실 면담에 들어간다', '준비한 실험 질문을 교수님에게 꺼냈다.', { hp: -2 }, {
        requires: { min: { hp: 4, intelligence: RULES.advancedStudy } },
        chance: { base: .36, weights: { intelligence: .032, mental: .009 }, itemBonus: { laptop: .06 }, success: { message: '연구실에서 실험 하나를 맡겨 줬다.', grant: ['lab'], stats: { intelligence: 2 } }, failure: { message: '이번 학기는 자리 대신 참고 자료를 받았다.', stats: { intelligence: 1 } } },
      }),
      pick('공개 연구 세미나부터 들어 본다', '한 주제를 머릿속에 남기고 돌아왔다.', { intelligence: 1, mental: 1 }),
    ],
  },
  {
    id: 'photos', title: '졸업사진 촬영', scene: 'campus', kind: 'campus', terms: [8],
    description: '졸업앨범 예약 마감이 다가왔다. 친구들은 정문에서 단체 사진도 찍자고 한다.',
    choices: [
      pick('앨범 촬영을 예약하고 단체 사진도 찍는다', '졸업 후에도 꺼내 보고 싶은 사진이 생겼다.', { social: 2, mental: 2 }, { cash: -80_000, grant: ['photos'] }),
      pick('동기와 휴대전화로 사진을 남긴다', '평소 다니던 길을 배경으로 한 컷 찍었다.', { social: 1, mental: 1 }, { grant: ['photos'] }),
    ],
  },
  {
    id: 'laptop_fault', title: '노트북 고장', scene: 'study', kind: 'random', terms: [2, 3, 4, 5, 6, 7, 8], study: true,
    description: '전공 과제 제출을 앞두고 노트북이 갑자기 고장 났다.',
    choices: [
      pick('20만원을 내고 수리한다', '파일을 복구해 과제를 정상 제출했다.', {}, { cash: -200_000 }),
      pick('친구에게 노트북을 빌린다', '친구 덕분에 마감을 지키고 충전기까지 돌려줬다.', { social: -1 }, { requires: { min: { social: 10 } } }),
      pick('PC방에서 과제를 완성한다', '밤에 과제를 끝냈다. 집에 돌아가니 잠이 밀려왔다.', { hp: -3, mental: -1 }, { requires: { min: { hp: 4 } }, cash: -20_000 }),
      pick('이번 과제를 포기한다', '제출은 못 했고 다음 과제부터 일정을 새로 짜기로 했다.', { intelligence: -2, mental: -2 }),
    ],
  },
  {
    id: 'senior_notes', title: '선배의 시험 자료', scene: 'study', kind: 'chain', terms: [2, 3, 4, 5, 6, 7, 8], study: true,
    requires: { flags: ['senior'] },
    description: '친한 선배가 작년에 정리한 시험 자료를 공유해 주겠다고 한다.',
    choices: [
      pick('자료를 받아 공부한다', '헷갈리던 문제를 풀 수 있게 됐다.', { intelligence: 2, hp: -1 }, { requires: { min: { hp: 2 } } }),
      pick('고마운 마음에 식사를 대접한다', '공부 이야기를 나누다 인턴 공고 정보까지 들었다.', { social: 2, intelligence: 2 }, { cash: -30_000, grant: ['seniorBond'], items: { notes: 1 }, schedule: { id: 'intern_interview', after: 1 } }),
      pick('범위를 직접 정리해 본다', '시간은 들었지만 자료를 스스로 정리했다.', { intelligence: 2, hp: -3 }, { requires: { min: { hp: 4 } } }),
      pick('자료를 받아 두고 지금은 쉰다', '시험 범위만 확인하고 체력을 먼저 챙겼다.', { hp: 3, mental: 1 }),
    ],
  },
  {
    id: 'parttime', title: '안암 카페 아르바이트', scene: 'parttime', kind: 'random', terms: [1, 2, 3, 4, 5, 6, 7, 8], repeat: true,
    description: '카페에서 이번 주말에 근무해 줄 학생을 찾는다. 추가 수입과 주말 휴식 중 하나를 고른다.',
    choices: [
      pick('주말 두 타임을 맡는다', '주말 근무를 마치고 약속한 수당을 받았다.', { hp: -3 }, { cash: 250_000, requires: { min: { hp: 4 } } }),
      pick('저녁 한 타임만 맡는다', '잠깐 근무한 뒤 돌아왔다.', { hp: -1 }, { cash: 90_000, requires: { min: { hp: 2 } } }),
      pick('이번 주말은 쉬기로 한다', '쉬기로 한 주말에는 밀린 수면을 채웠다.', { hp: 4, mental: 2 }),
    ],
  },
  {
    id: 'dating', network: true, title: '동기와의 약속', scene: 'campus', kind: 'random', terms: [2, 3, 4, 5, 6],
    description: '자주 함께 공부하던 동기가 따로 만나자고 한다. 서로의 속도를 존중하며 답할 차례다.',
    choices: [
      pick('카페에서 서로의 마음을 확인한다', '서두르지 않고 함께 시간을 보내 보기로 했다.', { social: 2, mental: 2 }, { cash: -35_000, grant: ['dating'] }),
      pick('친구로 지내자는 마음을 전한다', '솔직한 대화 덕분에 다음 스터디도 편하게 잡았다.', { social: 1, mental: 1 }),
    ],
  },
  {
    id: 'club_chair', title: '동아리 회장 제안', scene: 'club', kind: 'conditional', terms: [3, 4, 5, 6],
    requires: { flags: ['club'], min: { social: RULES.strongNetwork } },
    description: '다음 학기 동아리를 운영해 달라는 제안이 왔다.',
    choices: [
      pick('동아리 회장을 맡는다', '신입 부원들이 제일 먼저 찾아오는 사람이 됐다.', { social: 3, hp: -2, mental: -1 }, { requires: { min: { hp: 4 } }, grant: ['chair'], schedule: { id: 'club_duties', after: 1 } }),
      pick('한 가지 행사만 돕기로 한다', '맡은 역할이 작아 수업과 병행할 수 있었다.', { social: 1, mental: 1 }),
    ],
  },
  {
    id: 'club_duties', title: '동아리 행사 정산', scene: 'club', kind: 'chain',
    requires: { flags: ['chair'] },
    description: '지난 학기에 맡은 동아리의 행사 정산이 돌아왔다. 업무를 나눠야 할지 고민이다.',
    choices: [
      pick('부원과 나눠 장부를 정리한다', '영수증을 함께 맞춰 보고 필요한 비용을 돌려받았다.', { hp: -1, social: 2 }, { cash: 150_000, requires: { min: { hp: 2, social: 10 } } }),
      pick('지도 선배에게 일정을 조율해 달라고 한다', '정산 기한을 늦추고 일부 업무를 넘겼다.', { mental: 2, hp: 1 }),
    ],
  },
  {
    id: 'scholarship', title: '장학금 신청', scene: 'exam', kind: 'conditional', terms: [2, 3, 4, 5, 6, 7, 8],
    requires: { gpa: 2.6 },
    description: '지난 학기 성적을 바탕으로 장학금을 신청할 수 있다.',
    choices: [
      pick('추천서와 지원 서류를 제출한다', '마감 직전에 지원서를 제출해 장학금을 받았다.', { hp: -1, mental: 1 }, { cash: 500_000, requires: { gpa: 2.8, min: { hp: 2 } } }),
      pick('필요한 서류를 정리하고 다음 기회를 기다린다', '부담을 낮추고 장학 일정만 기록했다.', { hp: 2, mental: 1 }),
    ],
  },
  {
    id: 'competition', title: '학부 공모전', scene: 'study', kind: 'academic', terms: [3, 4, 5, 6, 7], study: true,
    description: '팀을 꾸려 전공 문제를 푸는 공모전이 열렸다. 발표 기회와 체력을 바꿔야 한다.',
    choices: [
      pick('팀을 꾸려 공모전에 나간다', '초안을 발표 자료로 만들었다.', { hp: -3, social: 1 }, {
        intensity: 'high', requires: { min: { hp: 5, intelligence: 9 } },
        chance: { base: .24, weights: { intelligence: .027, social: .014, mental: .007 }, success: { message: '발표에서 수상하고 상금을 받았다.', cash: 450_000, grant: ['competition'], stats: { intelligence: 2 } }, failure: { message: '수상에는 닿지 못했지만 시제품을 남겼다.', stats: { intelligence: 1, mental: -1 } } },
      }),
      pick('자료만 참고하고 다음 기회를 본다', '팀 부담 없이 아이디어를 한 가지 적었다.', { intelligence: 1, hp: 2 }),
    ],
  },
  {
    id: 'exchange', title: '교환학생 모집', scene: 'exam', kind: 'conditional', terms: [4, 5, 6],
    requires: { gpa: 2.5 },
    description: '교환학생 자리가 열렸다. 외국에서 보낼 학기만큼 비용도 고려해야 한다.',
    choices: [
      pick('한 학기 교환 프로그램에 참여한다', '새로운 과목에서 친구를 만났다. 초기 비용은 예상보다 컸다.', { social: 2, intelligence: 2, hp: -1 }, { cash: -500_000, requires: { min: { hp: 3 } } }),
      pick('교내 교류 행사만 참가한다', '짧은 대화로 전공 시야를 넓혔다.', { social: 1, mental: 1 }),
    ],
  },
  {
    id: 'intern_interview', title: '인턴 면접', scene: 'parttime', kind: 'chain', terms: [3, 4, 5, 6, 7, 8],
    description: '실무 인턴 면접 연락을 받았다. 프로젝트에서 한 일을 말할 차례다.',
    choices: [
      pick('면접을 준비해 참석한다', '프로젝트에 기여한 부분을 예시와 함께 설명했다.', { hp: -2 }, {
        requires: { min: { hp: 4, intelligence: 8, social: 7 } },
        chance: { base: .3, weights: { intelligence: .017, social: .026 }, success: { message: '실무 인턴으로 일하며 급여와 경험을 얻었다.', cash: 320_000, grant: ['internship'], stats: { social: 1 } }, failure: { message: '이번 면접에서 배운 질문을 따로 적어 두었다.', stats: { mental: -1 } } },
      }),
      pick('일정을 맞추지 못해 이번 학기는 양보한다', '다음 공고 때 쓸 지원 자료를 남겼다.', { mental: 2, hp: 2 }),
    ],
  },
  {
    id: 'prep_interview', title: '취업 준비 모임', scene: 'club', kind: 'academic', terms: [6, 7, 8],
    description: '동기들이 모의 면접을 연다. 현장 경험 유무에 따라 말할 수 있는 예시가 달라진다.',
    choices: [
      pick('인턴 경험을 정리해 발표한다', '중요한 일의 결과를 숫자로 정리해 발표했다.', { social: 2, intelligence: 2, hp: -1 }, { requires: { min: { hp: 2 }, flags: ['internship'] } }),
      pick('서로의 자기소개서를 읽어 준다', '동기가 어색한 문장을 짚어 줬다.', { social: 1, intelligence: 1 }),
      pick('이번 모임은 쉬고 서류를 다시 확인한다', '다음 모임까지 일정을 여유 있게 잡았다.', { hp: 3, mental: 2 }),
    ],
  },
  {
    id: 'startup_launch', title: '창업 프로젝트 출시', scene: 'study', kind: 'chain',
    requires: { flags: ['startup'] },
    description: '지난 학기 시작한 서비스가 테스트를 마쳤다. 출시 비용과 마지막 작업을 감당할 수 있을까?',
    choices: [
      pick('서비스를 출시한다', '첫 고객의 피드백을 받았다. 공동 창업자와 다음 개선 방향을 적었다.', { hp: -3, intelligence: 2, social: 2 }, { cash: -220_000, intensity: 'high', requires: { min: { hp: 5, intelligence: 11 } }, grant: ['launched'] }),
      pick('교내에서만 테스트를 이어간다', '이번 학기는 피드백을 모으고 지출을 줄였다.', { intelligence: 1, mental: 2 }, { schedule: { id: 'startup_launch', after: 1 } }),
    ],
    repeat: true,
  },
  {
    id: 'newspaper_special', title: '고대신문 특집 마감', scene: 'study', kind: 'chain', study: true,
    requires: { flags: ['reporter'] },
    description: '몇 학기 전 시작한 취재를 특집으로 묶을 수 있게 됐다. 마감 전 마지막 확인이 필요하다.',
    choices: [
      pick('안암 특집을 발행한다', '후배 기자와 오탈자를 잡고 특집을 인쇄에 넘겼다.', { hp: -3, social: 2, intelligence: 2 }, { requires: { min: { hp: 5 } }, grant: ['published'] }),
      pick('원고를 다음 호의 취재 노트로 넘긴다', '마감 부담은 줄었고 다음 취재의 자료는 남았다.', { hp: 3, mental: 1 }),
    ],
  },
  {
    id: 'friend_returns', title: '친구가 건넨 도움', scene: 'club', kind: 'chain',
    requires: { flags: ['friendHelp'] },
    description: '지난번 팀플을 도와준 친구가 이번에는 당신의 마감을 함께 준비하자고 한다.',
    choices: [
      pick('부담을 나누고 일찍 귀가한다', '역할을 나눠 맡고 예정했던 시간에 돌아왔다.', { hp: 4, mental: 2, social: 1 }),
      pick('함께 다음 주까지 진도를 낸다', '과제 요구 사항을 먼저 확인해 다음 작업을 줄였다.', { intelligence: 2, social: 1 }),
    ],
  },
  {
    id: 'repayment', title: '친구에게 빌린 생활비', scene: 'campus', kind: 'chain',
    description: '지난 학기 빌렸던 생활비를 갚기로 한 날이다. 지금의 잔액과 친구의 사정을 살핀다.',
    choices: [
      pick('약속한 생활비를 돌려준다', '서로의 장부에서 빌린 돈을 지웠다.', { social: 1, mental: 2 }, { cash: -150_000 }),
      pick('사정을 설명하고 상환 날짜를 조정한다', '연체를 숨기지 않고 다음 학기로 날짜를 옮겼다.', { social: -1, mental: -1 }, { schedule: { id: 'repayment', after: 1 } }),
    ],
    repeat: true,
  },
  {
    id: 'health_crisis', title: '보건실의 오후', scene: 'campus', kind: 'crisis', repeat: true,
    requires: { anyStatuses: ['overwork', 'exhaustion', 'burnout'] },
    description: '예정했던 활동을 쉬게 됐다. 보건실에서 체력에 맞춰 회복할 방법을 고민한다.',
    choices: [
      pick('오늘 일정을 비우고 쉰다', '놓친 일정은 있었지만 한숨 자고 몸이 한결 가벼워졌다.', { hp: 6, mental: 2 }),
      pick('진료를 받은 뒤 필요한 일만 한다', '진료를 받고 일정을 줄였다. 생활비 일부를 썼다.', { hp: 8, mental: 3 }, { cash: -45_000 }),
    ],
  },
  {
    id: 'mental_crisis', title: '학생상담센터 방문', scene: 'campus', kind: 'crisis', repeat: true,
    requires: { anyStatuses: ['slump', 'lethargy', 'depression'] },
    description: '집중이 어려운 날이 이어진다. 학교에서 받을 수 있는 지원을 찾아본다.',
    choices: [
      pick('상담 시간을 잡고 당분간 쉬어 간다', '부담을 말로 정리하고 할 일을 두 가지로 줄였다.', { mental: 7, hp: 2 }, { resetMental: true }),
      pick('믿을 만한 동기와 짧게 산책한다', '대화가 길어지지는 않았지만 혼자 가진 부담은 줄었다.', { mental: 4, social: 1, hp: 2 }),
    ],
  },
  {
    id: 'cash_crisis', title: '생활비가 모자란 주', scene: 'parttime', kind: 'crisis', repeat: true,
    requires: { anyStatuses: ['financial'] },
    description: '잔액이 부족해 예정한 지출을 감당하기 어렵다. 도움을 구할 방법을 찾는다.',
    choices: [
      pick('근로장학 데스크에서 단기 지원을 받는다', '생활에 필요한 급한 비용부터 마련했다.', { mental: 1 }, { cash: 130_000 }),
      pick('친구에게 15만원을 빌린다', '급한 비용은 해결했고 다음 학기에 돌려주기로 했다.', { mental: 1 }, { cash: 150_000, requires: { min: { social: 7 } }, schedule: { id: 'repayment', after: 1 } }),
    ],
  },
  {
    id: 'grades_crisis', title: '학사지원팀의 안내', scene: 'exam', kind: 'crisis', repeat: true, study: true,
    requires: { any: [{ anyStatuses: ['academic'] }, { max: { intelligence: RULES.lowIntelligence } }] },
    description: '과목을 따라가기 어려워졌다. 시간을 더 늘리기보다 지원을 활용해 본다.',
    choices: [
      pick('학습지원을 받고 진도를 다시 잡는다', '표준 문제부터 풀며 이번 학기 계획을 정리했다.', { intelligence: 2, mental: 2 }),
      pick('동기와 기초 과제부터 확인한다', '한 과목부터 부담을 줄였다.', { intelligence: 1, social: 1, hp: 1 }),
    ],
  },
  {
    id: 'network_crisis', title: '혼자 보내던 공강', scene: 'campus', kind: 'crisis', repeat: true,
    requires: { anyStatuses: ['isolation'] },
    description: '아는 사람이 드문 수업이 이어진다. 당장 부담스럽지 않은 친목 방법을 찾아본다.',
    choices: [
      pick('동기 한 명에게 먼저 점심을 제안한다', '단체 모임보다 편한 대화로 시작했다.', { social: 2, mental: 1 }),
      pick('교내 소모임 정보를 조용히 읽어 본다', '다음에 들를 수 있는 모임을 한 곳 찾았다.', { mental: 3, hp: 2 }),
    ],
  },
  {
    id: 'quiet_day', title: '캠퍼스의 조용한 하루', scene: 'campus', kind: 'fallback', repeat: true,
    description: '정해진 큰 일정이 없는 날이다. 컨디션을 돌아보고 한 가지를 고른다.',
    choices: [
      pick('충분히 자고 산책한다', '숨을 돌릴 시간이 생겼다.', { hp: 4, mental: 2 }),
      pick('동기를 만나 수업 이야기를 한다', '모르는 공지를 함께 확인했다.', { social: 2, intelligence: 1 }),
      pick('노트 정리를 조금 더 한다', '다음 시험 때 펼쳐 볼 노트를 만들었다.', { intelligence: 2, hp: -1 }, { requires: { min: { hp: 2 } } }),
    ],
  },
];

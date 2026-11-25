export const TERM_CALENDAR = [
  ['orientation', 'registration', 'cheer_ot', { followUp: 'fresh_market' }, 'midterm', 'ipselenti', { support: ['sabal', 'walk'] }, 'club', 'finals'],
  ['night_review', 'syllabus', 'boarding', { followUp: 'parttime' }, 'midterm', 'koyeonjeon', { support: ['reporter', 'dating', 'scholarship', 'walk'] }, 'library_shift', 'finals'],
  ['teamwork', 'registration', 'club', { followUp: 'study_group' }, 'midterm', 'ipselenti', { support: ['double_major', 'representative', 'dating', 'chamsari', 'walk'] }, 'community_center', 'finals'],
  ['night_review', 'syllabus', 'department_talk', { followUp: 'library_shift' }, 'midterm', 'koyeonjeon', { support: ['dating', 'club_chair', 'exchange', 'pub', 'laptop_fault', 'walk'] }, 'reading_room', 'finals'],
  ['career_plan', 'registration', 'competition', { followUp: 'parttime' }, 'midterm', 'ipselenti', { support: ['reporter', 'double_major', 'dating', 'scholarship', 'walk'] }, 'career_fair', 'finals'],
  ['night_review', 'syllabus', 'prep_interview', { followUp: 'department_talk' }, 'midterm', 'koyeonjeon', { support: ['exchange', 'club_chair', 'pub', 'scholarship', 'laptop_fault', 'walk'] }, 'alumni_mentoring', 'finals'],
  ['capstone', 'registration', 'portfolio_review', { followUp: 'competition' }, 'midterm', 'ipselenti', { support: ['lab_offer', 'scholarship', 'walk'] }, 'parttime', 'finals'],
  ['graduation', 'syllabus', 'photos', { followUp: 'prep_interview' }, 'midterm', 'koyeonjeon', { support: ['scholarship', 'laptop_fault', 'walk'] }, 'last_lunch', 'finals'],
];

export const RULES = {
  startingStats: { hp: 16, intelligence: 6, social: 6, mental: 16 },
  statMin: 0,
  statMax: 20,
  startingCash: 1_000_000,
  termEvents: TERM_CALENDAR.map(calendar => calendar.length),
  lowHealth: 5,
  exhaustion: 2,
  lowMental: 5,
  criticalMental: 2,
  isolation: 3,
  lowIntelligence: 3,
  lowCash: 100_000,
  warningGpa: 1.75,
  graduationGpa: 2,
  advancedStudy: 14,
  strongNetwork: 12,
  maxGpa: 4.5,
  semesterGrade: {
    base: 1.2,
    intelligence: 3.1,
    hp: .35,
    mental: .30,
    variation: 1.2,
    lowHealthPenalty: .20,
    lowMentalPenalty: .24,
    burnoutPenalty: .24,
  },
  staminaPenalty: 1,
  slumpPenalty: 1,
  burnoutPenalty: 1,
};

export const STATS = {
  hp: { name: '체력', color: '#f06a73' },
  intelligence: { name: '지능', color: '#83c5ff' },
  social: { name: '사회성', color: '#f9cb72' },
  mental: { name: '멘탈', color: '#c59af2' },
};

export const STATUSES = {
  overwork: { name: '과로', icon: '🥵', detail: '체력 5 이하. 활동으로 체력이 줄 때 1 더 소모합니다.', active: s => s.stats.hp <= RULES.lowHealth },
  exhaustion: { name: '탈진', icon: '🪫', detail: '체력 2 이하. 고강도 활동이 제한됩니다.', active: s => s.stats.hp <= RULES.exhaustion },
  slump: { name: '슬럼프', icon: '📉', detail: '멘탈 5 이하. 활동에서 얻는 지능이 1 줄어듭니다.', active: s => s.stats.mental <= RULES.lowMental },
  lethargy: { name: '무기력', icon: '💤', detail: '낮은 멘탈이 두 번 연속 유지되면 고강도 활동이 제한됩니다.', active: s => s.stats.mental <= RULES.lowMental && s.streak.mental >= 2 },
  burnout: { name: '번아웃', icon: '🔥', detail: '낮은 체력과 멘탈이 연속으로 유지되면 학업 효율과 평점이 낮아집니다.', active: s => s.stats.hp <= RULES.lowHealth && s.stats.mental <= RULES.lowMental && s.streak.both >= 2 },
  depression: { name: '우울증', icon: '🌧️', detail: '멘탈 2 이하가 두 번 연속 유지되면 일부 활동이 제한되고 회복 이벤트가 열립니다.', active: s => s.stats.mental <= RULES.criticalMental && s.streak.critical >= 2 },
  isolation: { name: '고립', icon: '🫥', detail: '사회성 3 이하. 관계를 회복할 수 있는 이벤트가 열립니다.', active: s => s.stats.social <= RULES.isolation },
  financial: { name: '경제적 위기', icon: '💸', detail: '자금 10만원 미만. 긴급 생활비를 마련할 기회가 열립니다.', active: s => s.cash < RULES.lowCash },
  academic: { name: '학사 위기', icon: '📚', detail: '직전 학기 평점 1.75 미만. 학업 지원 이벤트가 열립니다.', active: s => (s.grades.at(-1) ?? RULES.maxGpa) < RULES.warningGpa },
};

export const EXPERIENCES = {
  orientation: '새내기 배움터 참가', senior: '친한 선배', seniorBond: '선배와의 유대', cheerOt: '응원 OT 참가',
  club: '동아리 활동', koyeonjeon: '정기 고연전 참가', ipselenti: '입실렌티 참가', dating: '연애',
  coupleTime: '둘의 시간을 우선함', familyPlan: '가족을 꾸리기로 함', recoveryLeave: '휴학하고 치료를 받기로 함',
  doubleMajor: '이중전공 합격', lab: '학부연구생', internship: '인턴', competition: '공모전 수상',
  startup: '창업 팀 결성', launched: '서비스 출시', reporter: '고대신문 취재', published: '고대신문 특집 발행',
  chair: '동아리 회장', friendHelp: '친구와 나눈 도움', job: '취업 면접 합격', photos: '졸업사진 촬영',
  researchProposal: '졸업생 연구 제안 검토',
};

export const ITEMS = {
  notes: { name: '전공 족보', price: 150_000, type: 'consumable', detail: '사용 후 다음 학기 평점 +0.50. 학기당 한 번 적용.', future: true, nextGpa: .5 },
  laptop: { name: '노트북', price: 1_000_000, type: 'conditional', detail: '학업에서 지능을 얻을 때 +1. 전공 프로젝트의 추가 선택 해금.', studyGain: 1 },
  tablet: { name: '태블릿', price: 600_000, type: 'permanent', detail: '학업 활동의 체력 소모를 1 줄입니다.', studyProtection: 1, first: 2 },
  vitamins: { name: '영양제', price: 100_000, type: 'consumable', detail: '사용 즉시 체력 +5.', stats: { hp: 5 } },
  console: { name: '게임기', price: 500_000, type: 'permanent', detail: '구매한 뒤부터 학기 종료 시 멘탈 +1.', future: true, termStats: { mental: 1 }, first: 2 },
  jacket: { name: '고대 과잠', price: 120_000, type: 'permanent', detail: '학교 행사에서 사회성을 얻을 때 +1.', campusGain: 1 },
  counseling: { name: '상담 이용권', price: 200_000, type: 'consumable', detail: '멘탈 +6. 무기력·번아웃 등 낮은 멘탈 누적 기록을 초기화합니다.', stats: { mental: 6 }, resetMental: true },
  charm: { name: '행운의 부적', price: 300_000, type: 'consumable', detail: '다음 확률형 선택의 성공률 +15%p. 한 번 적용.', nextChance: .15, first: 3 },
  textbook: { name: '전공 서적', price: 200_000, type: 'consumable', detail: '사용 즉시 지능 +2.', stats: { intelligence: 2 } },
  equipment: { name: '운동기구', price: 400_000, type: 'permanent', detail: '구매한 뒤부터 학기 종료 시 체력 +1.', future: true, termStats: { hp: 1 }, first: 3 },
};

export const LEGACY_ENDINGS = [
  { id: 'dropout', title: '중도 탈락', description: '학업을 멈추고 회복을 시작했다. 다시 돌아올 때는 일정을 조금 비워 두기로 했다.', max: { hp: 0 } },
  { id: 'no_graduation', title: '졸업 실패', description: '졸업 사정표에 아직 채워야 할 칸이 남았다. 학사지원팀과 다음 계획을 세운다.', maxGpa: RULES.graduationGpa - .01 },
  { id: 'editor', title: '안암에 남긴 첫 지면', description: '당신의 마지막 특집호가 신입생의 가방에 들어갔다. 이야기는 이제 다음 학번의 손으로 넘어간다.', flags: ['reporter', 'published', 'seniorBond'] },
  { id: 'perfect', title: '완벽한 고대생', description: '강의실, 응원석, 동아리방을 모두 누볐다. 졸업식 날에도 여유 있게 친구를 기다린다.', min: { hp: 16, intelligence: 16, social: 16, mental: 16 } },
  { id: 'valedictorian', title: '수석 졸업생', description: '졸업식에 맨 앞줄로 불려 갔다. 밤늦게까지 붙잡던 노트는 후배에게 건넸다.', gpa: 4.3 },
  { id: 'founder', title: '창업가', description: '캠퍼스에서 만든 서비스가 첫 고객을 만났다. 오늘부터 공강을 누구보다 알차게 쓴다.', flags: ['startup', 'launched'] },
  { id: 'researcher', title: '미래의 연구자', description: '실험 노트 한 권으로 시작한 연구가 다음 해의 계획이 됐다.', min: { intelligence: 17 }, flags: ['lab'] },
  { id: 'corporate', title: '대기업 취업', description: '최종 합격 메일을 받은 뒤, 면접을 함께 연습한 친구에게 먼저 연락했다.', min: { intelligence: 15, social: 12 }, flags: ['job'], excludeStatuses: ['burnout'] },
  { id: 'campus_spirit', title: '호랑이의 청춘', description: '졸업 사진을 찍는 동안에도 응원가가 머릿속에서 맴돈다. 다음 고연전에서는 졸업생 석에 앉는다.', flags: ['cheerOt', 'koyeonjeon', 'ipselenti'] },
  { id: 'social_star', title: '안암의 인싸', description: '정문까지 가는 길에 다섯 사람에게 인사했다. 꽃다발을 들고 나온 친구는 그보다 더 많다.', min: { social: 19 } },
  { id: 'self_made', title: '자수성가', description: '아르바이트, 장학금, 절약으로 다음 해 생활비까지 마련했다. 이제 첫 급여를 어디에 쓸지 천천히 생각한다.', cash: 2_500_000 },
  { id: 'isolated', title: '사회진출 실패', description: '졸업장은 받았지만 취업과 사회진출의 연결고리를 아직 찾지 못했다. 동문 멘토링 공지를 열어 본다.', max: { social: 3 } },
  { id: 'job_seeker', title: '취업 준비생', description: '졸업식 뒤에도 자기소개서 파일은 열려 있다. 동기와 서로의 첫 문장을 읽어 주기로 했다.' },
];

export const cashText = value => `${value.toLocaleString('ko-KR')}원`;

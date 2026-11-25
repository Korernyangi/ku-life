import { EXPERIENCES, RULES, STATS, cashText } from './config.js';
import { findMajor } from './majors.js';

export const ENDINGS = {
  corporate: {
    title: '안암테크 입사',
    icon: '🏢',
    keepsake: { label: '신입사원 단톡방', text: '내일 회의실 예약도 수강신청처럼 정각에 열리나요?' },
    description: '첫 명함에 안암테크 직인이 찍혔다. 면접 단골 질문이었던 팀플 이야기는 이제 신입 연수의 아이스브레이커다.',
    hint: '기업 공채에 지원하고 최종 면접 합격, 지능 15, 사회성 12 이상을 달성하세요.',
  },
  grad_school: {
    title: '대학원 진학',
    icon: '📚',
    keepsake: { label: '첫 세미나 공지', text: '발표는 각자 5분. 질문은 교수님이 끝내실 때까지.' },
    description: '학생증을 반납한 지 한 달 만에 새 학생증을 받았다. 이번 시간표의 빈칸에는 세미나와 논문 읽기가 들어간다.',
    hint: '대학원에 지원하고 평점 2.75 이상을 달성하세요. 학부연구생 경험이 있으면 2.40 이상이면 됩니다.',
  },
  startup: {
    title: '공강 주식회사 창업',
    icon: '🚀',
    keepsake: { label: '리뷰 1호', text: '버그 신고하려고 깔았다가 결국 유료 결제함.' },
    description: '공강마다 고치던 앱이 첫 유료 고객을 만났다. 대표, 개발자, 고객센터 담당자 세 명의 이름이 전부 당신이다.',
    hint: '서비스 출시를 선택하고 지능 14, 자금 95만원 이상을 모으세요. 창업 팀 경험은 지능 기준을 12로 낮추고, 출시 경험이 있으면 추가 자금이 필요하지 않아요.',
  },
  ngo: {
    title: '동네를 바꾸는 활동가',
    icon: '🤝',
    keepsake: { label: '동네 회의록', text: '만장일치 안건 · 다음 회의 전 접이식 의자 한 개 구입.' },
    description: '캠퍼스에서 만난 사람들과 지역단체의 새 프로젝트를 맡았다. 첫 회의에서 나온 의견은 열세 개, 접이식 의자는 열두 개다.',
    hint: '지역단체에 합류할 때 사회성 16 이상과 친구를 도운 경험 또는 멘탈 15 이상이 필요해요.',
  },
  traveler: {
    title: '편도 티켓 한 장',
    icon: '🧳',
    keepsake: { label: '여행 수첩', text: '배낭의 절반은 꼭 필요한 것. 나머지 절반은 혹시 필요한 것.' },
    description: '졸업 가운을 반납하고 배낭을 멨다. 첫 여행지에서 배운 현지어는 “이 버스, 돌아오는 편도 있나요?”였다.',
    hint: '배낭여행을 떠날 때 체력 8, 멘탈 13, 자금 20만원 이상이 필요해요.',
  },
  employee: {
    title: '오후문구 신입사원',
    icon: '💼',
    keepsake: { label: '신제품 첫 주문', text: '공책 이름을 ‘마감 직전’으로 하면 제가 한 박스 삽니다.' },
    description: '동네 문구 회사에 입사해 신제품 노트를 맡았다. 수업 시간에 그리던 낙서가 이번 시즌 한정판 표지가 됐다.',
    hint: '오후문구에 지원할 때 지능 11 이상이 필요해요. 안암테크 공채 준비 중에도 제안을 받을 수 있어요.',
  },
  rich_life: {
    title: '통장으로 산 안식년',
    icon: '💰',
    keepsake: { label: '평일 낮 일정', text: '14:10 영화. 16:30 영화 감상평을 낮잠으로 정리.' },
    description: '알바와 절약으로 모은 돈으로 1년 치 여유를 샀다. 이번 달 달력에는 월세 납부일과 평일 낮 영화 한 편이 적혀 있다.',
    hint: '자금 250만원 이상을 모아 안식년을 선택하세요.',
  },
  ordinary: {
    title: '아직 제목 없는 다음 학기',
    icon: '🌱',
    keepsake: { label: '졸업앨범 마지막 장', text: '앞으로 하고 싶은 일 1번 · 내일 점심 메뉴부터 정하기.' },
    description: '졸업 앨범의 마지막 장은 빈 페이지다. 그곳에 이번 주 할 일 세 가지를 적었다. 첫 줄에는 동기와 점심 먹기.',
    hint: '천천히 다음 길을 찾거나, 졸업 및 진로 조건을 채우지 못하면 만날 수 있어요.',
  },
  dropout: {
    title: '잠시 내려놓은 학생증',
    icon: '🍂',
    keepsake: { label: '새로 짠 달력', text: '월요일 11:00 · 알람 없이 일어나 보기.' },
    description: '몸과 마음을 돌보기 위해 학업을 멈췄다. 이번 주 달력에서 가장 중요한 약속은 충분히 쉬는 것이다.',
    hint: '재학 중 체력이 0이 되면 학업을 멈춰요.',
    early: true,
  },
  family: {
    title: '새벽 네 시의 수강신청',
    icon: '🍼',
    keepsake: { label: '가족 단톡방 · 오전 4:07', text: '분유 실습 출석 완료. 오늘도 수강 철회 불가.' },
    description: '휴학을 신청한 지 1년, 두 사람에게 아기가 태어났다. 새벽 네 시. 수강신청 알람 대신 아기 울음소리에 둘이 동시에 눈을 뜬다.\n\n“오늘 첫 수업은?” “분유 실습. 출석은 둘 다 했어.”',
    special: true,
    hidden: true,
    early: true,
  },
  recovery: {
    title: '시간표를 비워 둔 학기',
    icon: '🌿',
    keepsake: { label: '복학을 기다리는 친구', text: '창가 자리는 비워 둘게. 커피는 네가 오면 시키자.' },
    description: '휴학계를 냈다. 진료를 받고 의료진과 상의해 잠시 정신건강의학과 병동에 머물렀다. 아침에 커튼을 열고, 식사를 하고, 가끔 친구의 안부에 답했다.\n\n몇 달 뒤, 복학 안내 메일이 왔다. 답장을 쓰기 전에 자주 가던 카페가 아직 있는지 친구에게 먼저 물었다.',
    special: true,
    hidden: true,
    early: true,
  },
  cafe: {
    title: '영수증으로 찍는 출석',
    icon: '☕',
    description: '주말마다 지키던 카페를 이어받았다. 개강날부터 단골들이 테이블마다 전공 스터디를 열었다. 예약표에 방 번호를 붙이고 보니 웬만한 강의실보다 출석률이 좋다.\n\n가게 첫 질문은 “사장님, 따뜻한 아메리카노도 분반 있나요?”였다.',
    keepsake: { label: '카페 영수증', text: '아메리카노 1잔 · 0학점 / 스탬프 1개' },
    special: true,
    hidden: true,
    early: true,
  },
  newspaper: {
    title: '고양이 학번은 비공개',
    icon: '📰',
    description: '입실렌티와 고연전 사진의 같은 구석에 고양이 한 마리가 앉아 있었다. 취재를 시작한 뒤 20년 전 신문에서 똑같은 구도를 발견했다. 사진 속 고양이는 서로 다른 녀석이었다. 같은 자리를 이어받는 당번이 있었던 것이다.\n\n당신의 호외가 나간 날, 도서관 앞 빈 상자에 ‘다음 당번 면접 장소’ 팻말이 붙었다.',
    keepsake: { label: '고대신문 호외', text: '축제장 고양이 당번 교대 포착. 학번과 학과는 비공개.' },
    special: true,
    hidden: true,
    early: true,
  },
  claw: {
    title: '집게가 잡은 건 내 진로',
    icon: '🕹️',
    description: '세 번째 상품을 뽑자 기계 옆에 구경선이 생겼다. 다음 날 기계 주인이 당신에게 새 상품 배치를 부탁했다. 이번에는 유리 반대편에서 집게를 움직이게 됐다.\n\n신입생 오픈 첫날, 아무도 못 뽑던 구석에 상품이 하나씩 들어찼다. 당신은 그걸 발견하는 학생 얼굴을 보는 일이 제일 좋았다.',
    keepsake: { label: '새 기계 옆 안내문', text: '한 번은 감각, 두 번은 실력, 세 번은 직원 채용.' },
    special: true,
    hidden: true,
    early: true,
  },
};

export function archiveEndingInfo(ending, unlocked) {
  if (!unlocked && ending.hidden) return { icon: '🔒', title: '???', description: '' };
  return {
    icon: unlocked ? ending.icon : '🔒',
    title: ending.title,
    description: unlocked ? ending.description : ending.hint,
  };
}

const retiredEndings = { professor: 'grad_school', top_graduate: 'corporate', campus_legend: 'ordinary' };

export function normalizeEnding(ending) {
  if (!ending || !Object.hasOwn(retiredEndings, ending.id)) return ending;
  const id = retiredEndings[ending.id];
  return { ...ending, id, route: id };
}

export const CAREER_ROUTES = {
  corporate: '안암테크 공채에 지원한다',
  grad_school: '연구를 이어가기 위해 대학원에 지원한다',
  startup: '공강마다 만들던 서비스를 출시한다',
  ngo: '지역단체의 새 프로젝트에 합류한다',
  traveler: '배낭여행을 떠날 편도 티켓을 끊는다',
  employee: '동네 문구 회사 오후문구에 지원한다',
  rich_life: '모아 둔 생활비로 1년을 쉰다',
  ordinary: '쉬면서 다음 길을 천천히 찾는다',
};

const endingsForRoute = {
  corporate: ['corporate', 'employee'],
  grad_school: ['grad_school'],
  startup: ['startup'],
  ngo: ['ngo'],
  traveler: ['traveler'],
  employee: ['employee'],
  rich_life: ['rich_life'],
  ordinary: ['ordinary'],
};

const requirements = {
  corporate: { min: { intelligence: 15, social: 12 }, flags: ['job'] },
  grad_school: { gpa: 2.75 },
  startup: { min: { intelligence: 14 }, cash: 950_000 },
  ngo: { min: { social: 16 } },
  traveler: { min: { hp: 8, mental: 13 }, cash: 200_000 },
  employee: { min: { intelligence: 11 } },
  rich_life: { cash: 2_500_000 },
};

function careerReasons(state, gpa, id) {
  if (id === 'ordinary') return [];
  const reasons = [];
  const hasExperience = flag => state.flags.includes(flag);
  const rule = id === 'startup' && hasExperience('launched') ? {} : requirements[id];
  const minGpa = id === 'grad_school' && hasExperience('lab') ? 2.4 : rule.gpa ?? RULES.graduationGpa;
  if ((gpa ?? 0) < minGpa) reasons.push(`누적 평점 ${minGpa.toFixed(2)} 이상 · 현재 ${gpa?.toFixed(2) ?? '미산출'}`);
  for (const [key, value] of Object.entries(rule.min ?? {})) {
    const min = id === 'startup' && hasExperience('startup') ? 12 : value;
    if (state.stats[key] < min) reasons.push(`${STATS[key].name} ${min} 이상 · 현재 ${state.stats[key]}`);
  }
  if (state.cash < rule.cash) reasons.push(`자금 ${cashText(rule.cash)} 이상 · 현재 ${cashText(state.cash)}`);
  for (const flag of rule.flags ?? []) {
    if (!hasExperience(flag)) reasons.push(`${EXPERIENCES[flag]} 경험 필요`);
  }
  if (id === 'ngo' && !hasExperience('friendHelp') && state.stats.mental < 15) {
    reasons.push(`친구를 도운 경험 또는 멘탈 15 이상 · 현재 ${state.stats.mental}`);
  }
  return reasons;
}

export function careerOptions(state, gpa) {
  return Object.entries(ENDINGS).filter(([, ending]) => !ending.early).map(([id]) => ({
    id,
    route: id,
    reasons: careerReasons(state, gpa, id),
  }));
}

export function resolveEnding(state, gpa, route) {
  if (state.stats.hp <= 0) return 'dropout';
  const candidates = Object.hasOwn(endingsForRoute, route) ? endingsForRoute[route] : [];
  return candidates.find(id => !careerReasons(state, gpa, id).length) ?? 'ordinary';
}

export function majorEnding(id, majorId) {
  const major = findMajor(majorId);
  const base = ENDINGS[id];
  if (!major || !base) return base;
  const { name, role, topic, terms } = major;
  const afterStudy = terms ? `${terms}학기 과정을 마친 뒤, ` : '';

  switch (id) {
    case 'corporate':
      return { ...base, title: `${role}의 첫 출근`, description: `${afterStudy}안암테크에서 ${role} 명함을 받았다. 첫 회의에서 대학 시절부터 관심을 가졌던 ‘${topic}’ 이야기를 꺼냈다.` };
    case 'employee':
      return { ...base, title: `첫 경력 · ${role}`, description: `${afterStudy}작은 팀에 ${role} 자리가 났다. 책상에 붙인 첫 메모에는 ‘${topic}’이라고 적혀 있다. 다음 주, 그 메모가 팀의 첫 기획안이 된다.` };
    case 'grad_school':
      return { ...base, title: `${name}에서 대학원으로`, description: `${afterStudy}다시 학생증을 받았다. 첫 세미나에서 발표할 주제는 ‘${topic}’. 예전 수업에서 시작된 질문을 이번에는 끝까지 따라가 보기로 했다.` };
    case 'startup':
      return { ...base, title: `${name}에서 시작한 첫 사업`, description: `${afterStudy}‘${topic}’에서 출발한 아이디어를 세상에 내놨다. 밤새 열어 둔 노트북에 첫 고객의 이름이 떴다. 이번엔 팀플 단톡방이 진짜 회사 단톡방이 됐다.` };
    case 'ngo':
      return { ...base, title: `동네로 나간 ${name}`, description: `${afterStudy}지역단체의 첫 회의에서 ‘${topic}’을 주제로 주민들과 이야기를 나눴다. 질문을 가장 많이 던진 주민이 다음 프로젝트의 첫 동료가 됐다.` };
    case 'ordinary':
      return { ...base, description: `${name}에서 품었던 질문을 다시 적어 봤다. ‘${topic}’. 노트의 제목은 아직 비어 있다. 이번 주에는 동기와 점심을 먹으며 다음 계획을 잡아 보기로 했다.` };
    case 'family':
      return { ...base, description: `${base.description}\n\n아기 사진을 본 ${name} 동기가 답했다. “조별 과제면 나도 분유 한 통 보낼게.”` };
    case 'recovery':
      return { ...base, description: `${base.description}\n\n${name} 동기가 답했다. “그대로야. 우리 늘 앉던 창가 자리도.”` };
    default:
      return { ...base, description: `${name} 친구들과 나눈 마지막 인사가 떠오른다. ${base.description}` };
  }
}

const recapExperience = {
  corporate: ['job', 'internship'],
  grad_school: ['lab', 'researchProposal'],
  startup: ['startup', 'launched'],
  ngo: ['friendHelp', 'club', 'chair'],
  employee: ['job', 'internship', 'competition', 'reporter'],
  newspaper: ['reporter', 'published', 'koyeonjeon', 'ipselenti'],
  family: ['dating', 'coupleTime', 'familyPlan'],
  recovery: ['recoveryLeave'],
};

export function endingChoices(history, id) {
  const flags = recapExperience[id] ?? [];
  const relevant = history.filter(entry => entry.flags?.some(flag => flags.includes(flag))
    || (flags.includes('researchProposal') && entry.choice === '졸업생 연구 제안을 검토한다')
    || (id === 'recovery' && entry.stats?.mental < 0)
    || (['traveler', 'rich_life'].includes(id) && entry.cash > 0)
    || (id === 'cafe' && entry.eventId === 'parttime' && entry.cash >= 250_000)
    || (id === 'claw' && entry.eventId === 'claw_handoff'));
  const stats = requirements[id]?.min ?? (id === 'grad_school' ? { intelligence: 1 } : {});
  return (relevant.length ? relevant : history.filter(entry => Object.keys(stats).some(key => entry.stats?.[key] > 0))).slice(-3);
}

export function endingScore({ stats, cash }, gpa, id) {
  const fractions = [
    ...Object.keys(RULES.startingStats).map(key => stats[key] / RULES.statMax),
    (gpa ?? 0) / RULES.maxGpa,
    cash / 2_500_000,
  ];
  const statsMax = 900;
  const bonusMax = 100;
  const base = Math.round(statsMax * fractions.reduce((sum, value) => sum + Math.min(1, Math.max(0, value)), 0) / fractions.length);
  const bonus = id === 'dropout' ? 0 : ENDINGS[id]?.special ? bonusMax : 70;
  return { base, bonus, total: base + bonus, max: statsMax + bonusMax, statsMax, bonusMax };
}

import { EXPERIENCES, RULES, STATS, cashText } from './config.js';
import { findMajor } from './majors.js';
import { employmentForEnding } from './employment.js';

export const ENDINGS = {
  corporate: {
    title: '기업 취업',
    icon: '🏢',
    keepsake: { label: '신입사원 단톡방', text: '내일 회의실 예약도 수강신청처럼 정각에 열리나요?' },
    description: '첫 명함을 받았다. 면접 때 물어봤던 팀플 이야기는 이제 신입 연수의 아이스브레이커다.',
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
    description: '공강마다 동기들과 시험해 보던 서비스를 출시했다. 처음엔 비용을 감당할 수 있을 만큼만 운영하기로 했다. 첫 결제 알림이 온 날, 고객에게 감사 인사를 보내고 그 사람이 알려 준 버그를 고쳤다.',
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
    description: '졸업 후 모아 둔 돈에서 숙소와 식비를 먼저 떼어 두고 편도표를 샀다. 돌아올 날짜는 여행 예산을 보면서 정하기로 했다. 첫날 길을 헤매다 가장 먼저 외운 건 막차 시간이었다.',
    hint: '배낭여행을 떠날 때 체력 8, 멘탈 13, 자금 20만원 이상이 필요해요.',
  },
  employee: {
    title: '전공 실무 취업',
    icon: '💼',
    keepsake: { label: '출근 첫날 메모', text: '출입증 받기, 이름표 붙이기, 동기들한테 점심 메뉴 물어보기.' },
    description: '새 일터에서 첫 업무를 맡았다. 수업 시간에 적어 둔 메모를 꺼내 보니 그대로 써먹을 한 줄이 있다.',
    hint: '지능 11 이상으로 전공 실무직에 지원하세요.',
  },
  rich_life: {
    title: '통장으로 산 두 달',
    icon: '💰',
    keepsake: { label: '평일 낮 일정', text: '14:10 영화. 16:30 영화 감상평을 낮잠으로 정리.' },
    description: '알바로 모은 돈을 두 달치 생활비와 비상금으로 나눴다. 그동안 밀린 잠을 자고 다음 일을 알아보기로 했다. 달력에는 월세 납부일 옆에 평일 낮 영화 한 편을 적었다.',
    hint: '자금 250만 원 이상을 모아 두 달 쉬는 진로를 선택하세요.',
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
    title: '새벽 네 시의 분유 당번',
    icon: '🍼',
    keepsake: { label: '냉장고의 교대표', text: '04:00 분유 당번. 다음 차례까지는 알람을 꺼도 됨.' },
    description: '학교에선 겹치는 공강에 동그라미를 치고 만났다. 한 학기 쉬고 같이 살기 시작한 뒤에는 장보기와 집안일을 번갈아 맡았다.\n\n이듬해 아기가 태어났다. 처음엔 울음소리에 둘 다 잠을 깼다. 예전 시간표를 짜던 것처럼 분유 교대표를 만들어 냉장고에 붙였다. 오늘 새벽 네 시는 내 차례라, “오늘 내 당번이야” 하고 옆 사람의 알람을 꺼 줬다.',
    special: true,
    hidden: true,
    early: true,
  },
  recovery: {
    title: '시간표를 비워 둔 학기',
    icon: '🌿',
    keepsake: { label: '동기의 메시지', text: '다음 주도 창가 자리 어때? 커피만 마시고 가도 돼.' },
    description: '상담센터의 도움으로 진료를 받았다. 한 학기 휴학하고 의료진과 상의해 치료와 휴식에 시간을 썼다. 커피 약속을 미뤘던 동기는 가끔 학교 앞 소식을 전하며 안부를 물었다.\n\n몇 달 뒤 그 동기와 카페 창가에 앉았다. 예전 같으면 연달아 울렸을 수업 알람이 오늘은 울리지 않았다. 복학 시기는 몸 상태를 보며 정하기로 하고, 커피를 다 마신 뒤에도 창가에 조금 더 앉아 있었다.',
    special: true,
    hidden: true,
    early: true,
  },
  cafe: {
    title: '카페 열쇠를 맡은 날',
    icon: '☕',
    description: '주말마다 일하며 단골 주문과 마감 정산을 익혔다. 사장님이 몇 달 자리를 비우는 동안 매장을 맡기로 하고, 근무 시간과 급여를 정한 뒤 열쇠를 받았다.\n\n늘 세 잔부터 시키던 단골 조를 보고 메뉴판에 팀플 세트를 적었다. 세 잔 먼저, 한 잔은 팀원이 도착하면 나온다. 지각한 학생이 문을 열자 세 친구가 주문도 묻기 전에 네 번째 잔을 그쪽으로 밀어 줬다.',
    keepsake: { label: '팀플 세트 주문표', text: '세 잔 먼저. 네 번째 잔은 팀원이 도착하면.' },
    special: true,
    hidden: true,
    early: true,
  },
  newspaper: {
    title: '고양이 학번은 비공개',
    icon: '📰',
    description: '입실렌티와 고연전 사진 속 고양이들은 똑같은 자세로 앉아 있었다. 사진을 확대하니 한 마리만 앞발이 하얬다. 봉사자가 “같이 보면 금방 알아요”라고 말하던 순간, 닮은 두 마리가 나란히 걸어 나왔다.\n\n호외에 두 사진과 행사장에서 고양이를 만나면 거리를 두고 지켜봐 달라는 안내를 실었다. 학생 기자는 사진 밑에 앞발 색으로 본인 확인을 끝냈다고 적었다.',
    keepsake: { label: '호외의 사진 설명', text: '앞발 색으로 본인 확인 완료. 학번은 비공개.' },
    special: true,
    hidden: true,
    early: true,
  },
  claw: {
    title: '집게가 잡은 건 내 진로',
    icon: '🕹️',
    description: '뽑기할 때마다 구석 곰의 팔이 벽에 끼어 있었다. 세 번째로 상품을 뽑은 날 운영자에게 그 곰을 가운데로 옮겨 보자고 했다. 7분 뒤 다음 손님이 와서 한 번에 집어 올렸다.\n\n운영자가 “토요일에 두 시간만 같이 배치해 볼래요?”라고 물었다. 첫 근무 일지에는 그 곰 이야기부터 적었다.',
    keepsake: { label: '상품 배치 일지', text: '곰 3호, 구석에서 가운데로. 자리 옮긴 지 7분 만에 퇴근.' },
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
  corporate: '기업 공채에 지원한다',
  grad_school: '연구를 이어가기 위해 대학원에 지원한다',
  startup: '공강마다 만들던 서비스를 출시한다',
  ngo: '지역단체의 새 프로젝트에 합류한다',
  traveler: '배낭여행을 떠날 편도 티켓을 끊는다',
  employee: '전공 실무직에 지원한다',
  rich_life: '모아 둔 생활비로 두 달을 쉰다',
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

export function majorEnding(id, majorId, employer = employmentForEnding({ majorId }, id)) {
  const major = findMajor(majorId);
  const base = ENDINGS[id];
  if (!base) return undefined;
  const afterStudy = major?.terms ? `${major.terms}학기 과정을 마친 뒤, ` : '';
  if (employer) {
    const topic = major?.topic ?? '새로 맡은 일에서 처음 발견한 질문';
    const firstDay = id === 'corporate'
      ? `첫 회의에서 대학 시절부터 관심을 가졌던 ‘${topic}’ 이야기를 꺼냈다.`
      : `첫 업무를 받자 ‘${topic}’이라고 적어 둔 수업 노트를 꺼냈다. 옆자리 동료가 그 메모를 회의에 가져가자고 했다.`;
    const start = major?.id === 'cyber-defense' ? '복무를 마친 뒤, ' : afterStudy;
    return { ...base, employer, title: `${employer.company} · ${employer.role}`, description: `${start}${employer.company}에서 첫 명함을 받았다. ${firstDay}` };
  }
  if (!major) return base;
  const { name, topic } = major;

  switch (id) {
    case 'grad_school':
      return { ...base, title: `${name}에서 대학원으로`, description: `${afterStudy}다시 학생증을 받았다. 첫 세미나에서 발표할 주제는 ‘${topic}’. 예전 수업에서 시작된 질문을 이번에는 끝까지 따라가 보기로 했다.` };
    case 'startup':
      return { ...base, title: `${name}에서 시작한 첫 사업`, description: `${afterStudy}‘${topic}’에서 출발한 아이디어를 세상에 내놨다. 밤새 열어 둔 노트북에 첫 고객의 이름이 떴다. 이번엔 팀플 단톡방이 진짜 회사 단톡방이 됐다.` };
    case 'ngo':
      return { ...base, title: `동네로 나간 ${name}`, description: `${afterStudy}지역단체의 첫 회의에서 ‘${topic}’을 주제로 주민들과 이야기를 나눴다. 질문을 가장 많이 던진 주민이 다음 프로젝트의 첫 동료가 됐다.` };
    case 'ordinary':
      return { ...base, description: `${name}에서 품었던 질문을 다시 적어 봤다. ‘${topic}’. 노트의 제목은 아직 비어 있다. 이번 주에는 동기와 점심을 먹으며 다음 계획을 잡아 보기로 했다.` };
    case 'family':
      return { ...base, description: `${base.description}\n\n아기 사진을 본 ${name} 동기가 이번 주말에 들르기로 했다.` };
    case 'recovery':
      return { ...base, description: `${base.description}\n\n${name} 동기가 답했다. “창가 자리 비워 둘게.”` };
    default:
      return base;
  }
}

const recapExperience = {
  corporate: ['job', 'internship', 'dataAnalysis', 'lab', 'published', 'competition'],
  grad_school: ['lab', 'researchProposal'],
  startup: ['startup', 'launched'],
  ngo: ['friendHelp', 'club', 'chair'],
  employee: ['job', 'internship', 'dataAnalysis', 'lab', 'published', 'competition'],
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

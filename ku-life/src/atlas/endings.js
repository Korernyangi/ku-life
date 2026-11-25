import { EXPERIENCES, RULES, STATS, cashText } from './config.js';
import { findMajor } from './majors.js';

export const ENDINGS = {
  corporate: {
    title: '안암테크 입사',
    icon: '🏢',
    description: '첫 명함에 안암테크 직인이 찍혔다. 면접 단골 질문이었던 팀플 이야기는 이제 신입 연수의 아이스브레이커다.',
    hint: '기업 공채에 지원하고 최종 면접 합격, 지능 15, 사회성 12 이상을 달성하세요.',
  },
  grad_school: {
    title: '대학원 진학',
    icon: '📚',
    description: '학생증을 반납한 지 한 달 만에 새 학생증을 받았다. 이번 시간표의 빈칸에는 세미나와 논문 읽기가 들어간다.',
    hint: '대학원에 지원하고 평점 2.75 이상을 달성하세요. 학부연구생 경험이 있으면 2.40 이상이면 됩니다.',
  },
  startup: {
    title: '공강 주식회사 창업',
    icon: '🚀',
    description: '공강마다 고치던 앱이 첫 유료 고객을 만났다. 대표, 개발자, 고객센터 담당자 세 명의 이름이 전부 당신이다.',
    hint: '서비스 출시를 선택하고 지능 14, 자금 95만원 이상을 모으세요. 창업 팀 경험은 지능 기준을 12로 낮추고, 출시 경험이 있으면 추가 자금이 필요하지 않아요.',
  },
  ngo: {
    title: '동네를 바꾸는 활동가',
    icon: '🤝',
    description: '캠퍼스에서 만난 사람들과 지역단체의 새 프로젝트를 맡았다. 첫 회의에서 나온 의견은 열세 개, 접이식 의자는 열두 개다.',
    hint: '지역단체에 합류할 때 사회성 16 이상과 친구를 도운 경험 또는 멘탈 15 이상이 필요해요.',
  },
  traveler: {
    title: '편도 티켓 한 장',
    icon: '🧳',
    description: '졸업 가운을 반납하고 배낭을 멨다. 첫 여행지에서 배운 현지어는 “이 버스, 돌아오는 편도 있나요?”였다.',
    hint: '배낭여행을 떠날 때 체력 8, 멘탈 13, 자금 20만원 이상이 필요해요.',
  },
  employee: {
    title: '오후문구 신입사원',
    icon: '💼',
    description: '동네 문구 회사에 입사해 신제품 노트를 맡았다. 수업 시간에 그리던 낙서가 이번 시즌 한정판 표지가 됐다.',
    hint: '오후문구에 지원할 때 지능 11 이상이 필요해요. 안암테크 공채 준비 중에도 제안을 받을 수 있어요.',
  },
  rich_life: {
    title: '통장으로 산 안식년',
    icon: '💰',
    description: '알바와 절약으로 모은 돈으로 1년 치 여유를 샀다. 이번 달 달력에는 월세 납부일과 평일 낮 영화 한 편이 적혀 있다.',
    hint: '자금 250만원 이상을 모아 안식년을 선택하세요.',
  },
  ordinary: {
    title: '아직 제목 없는 다음 학기',
    icon: '🌱',
    description: '졸업 앨범의 마지막 장은 빈 페이지다. 그곳에 이번 주 할 일 세 가지를 적었다. 첫 줄에는 동기와 점심 먹기.',
    hint: '천천히 다음 길을 찾거나, 졸업 및 진로 조건을 채우지 못하면 만날 수 있어요.',
  },
  dropout: {
    title: '잠시 내려놓은 학생증',
    icon: '🍂',
    description: '몸과 마음을 돌보기 위해 학업을 멈췄다. 이번 주 달력에서 가장 중요한 약속은 충분히 쉬는 것이다.',
    hint: '재학 중 체력이 0이 되면 학업을 멈춰요.',
    early: true,
  },
  professor: {
    title: '돌아온 안암 교수님',
    icon: '🎓',
    description: '대학원에 진학한 지 몇 년, 당신은 안암으로 돌아와 첫 강의를 연다. 첫 출석부에는 예전의 당신처럼 맨 앞줄에 앉은 학생이 있다.',
    hint: '학부연구생으로 활동하고 졸업생 연구 제안을 검토한 뒤, 평점 3.75 이상으로 대학원에 지원하세요.',
    special: true,
  },
  top_graduate: {
    title: '수석 졸업, 안암테크 특별 채용',
    icon: '🏆',
    description: '졸업식에서 학교 대표로 마이크를 잡았다. 다음 주엔 인턴 때 쓰던 출입증이 정식 사원증으로 바뀐다.',
    hint: '인턴과 최종 면접 합격 경험을 쌓고 평점 3.85, 지능 18, 사회성 13 이상으로 기업 공채에 지원하세요.',
    special: true,
  },
  campus_legend: {
    title: '안암의 영원한 응원단장',
    icon: '📣',
    description: '졸업 후에도 후배들이 당신을 응원석 맨 앞으로 불러낸다. 경기가 끝나고도 관중석에서 당신이 만든 구호가 들려온다.',
    hint: '응원 OT, 정기 고연전, 입실렌티에 모두 참가하고 사회성 17 이상으로 졸업생 응원 무대에 오르세요.',
    special: true,
  },
  family: {
    title: '새벽 네 시의 수강신청',
    icon: '🍼',
    description: '휴학을 신청한 지 1년, 두 사람에게 아기가 태어났다. 새벽 네 시. 수강신청 알람 대신 아기 울음소리에 둘이 동시에 눈을 뜬다.\n\n“오늘 첫 수업은?” “분유 실습. 출석은 둘 다 했어.”',
    special: true,
    hidden: true,
    early: true,
  },
  recovery: {
    title: '시간표를 비워 둔 학기',
    icon: '🌿',
    description: '휴학계를 냈다. 진료를 받고 의료진과 상의해 잠시 정신건강의학과 병동에 머물렀다. 아침에 커튼을 열고, 식사를 하고, 가끔 친구의 안부에 답했다.\n\n몇 달 뒤, 복학 안내 메일이 왔다. 답장을 쓰기 전에 자주 가던 카페가 아직 있는지 친구에게 먼저 물었다.',
    special: true,
    hidden: true,
    early: true,
  },
};

export function archiveEndingInfo(ending, unlocked) {
  if (!unlocked && ending.hidden) {
    return { icon: '🔒', title: '???', description: '발견하면 공개되는 히든 스페셜 엔딩' };
  }
  return {
    icon: unlocked ? ending.icon : '🔒',
    title: ending.title,
    description: unlocked ? ending.description : ending.hint,
  };
}

export const CAREER_ROUTES = {
  corporate: '안암테크 공채에 지원한다',
  grad_school: '연구를 이어가기 위해 대학원에 지원한다',
  startup: '공강마다 만들던 서비스를 출시한다',
  ngo: '지역단체의 새 프로젝트에 합류한다',
  traveler: '배낭여행을 떠날 편도 티켓을 끊는다',
  employee: '동네 문구 회사 오후문구에 지원한다',
  rich_life: '모아 둔 생활비로 1년을 쉰다',
  campus_legend: '졸업생 응원 무대에 오른다',
  ordinary: '쉬면서 다음 길을 천천히 찾는다',
};

const endingsForRoute = {
  corporate: ['top_graduate', 'corporate', 'employee'],
  grad_school: ['professor', 'grad_school'],
  startup: ['startup'],
  ngo: ['ngo'],
  traveler: ['traveler'],
  employee: ['employee'],
  rich_life: ['rich_life'],
  campus_legend: ['campus_legend'],
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
  professor: { gpa: 3.75, flags: ['lab', 'researchProposal'] },
  top_graduate: { gpa: 3.85, min: { intelligence: 18, social: 13 }, flags: ['job', 'internship'] },
  campus_legend: { min: { social: 17 }, flags: ['cheerOt', 'koyeonjeon', 'ipselenti'] },
};

function hasExperience(state, id) {
  if (state.flags.includes(id)) return true;
  // Saves created before the research proposal had its own flag still record the choice.
  return id === 'researchProposal' && state.history.some(entry => entry.eventId === 'graduation'
    && entry.choice === '졸업생 연구 제안을 검토한다');
}

function careerReasons(state, gpa, id) {
  if (id === 'ordinary') return [];
  const reasons = [];
  const rule = id === 'startup' && hasExperience(state, 'launched') ? {} : requirements[id];
  const minGpa = id === 'grad_school' && hasExperience(state, 'lab') ? 2.4 : rule.gpa ?? RULES.graduationGpa;
  if ((gpa ?? 0) < minGpa) reasons.push(`누적 평점 ${minGpa.toFixed(2)} 이상 · 현재 ${gpa?.toFixed(2) ?? '미산출'}`);
  for (const [key, value] of Object.entries(rule.min ?? {})) {
    const min = id === 'startup' && hasExperience(state, 'startup') ? 12 : value;
    if (state.stats[key] < min) reasons.push(`${STATS[key].name} ${min} 이상 · 현재 ${state.stats[key]}`);
  }
  if (state.cash < rule.cash) reasons.push(`자금 ${cashText(rule.cash)} 이상 · 현재 ${cashText(state.cash)}`);
  for (const flag of rule.flags ?? []) {
    if (!hasExperience(state, flag)) reasons.push(`${EXPERIENCES[flag]} 경험 필요`);
  }
  if (id === 'ngo' && !hasExperience(state, 'friendHelp') && state.stats.mental < 15) {
    reasons.push(`친구를 도운 경험 또는 멘탈 15 이상 · 현재 ${state.stats.mental}`);
  }
  return reasons;
}

export function careerOptions(state, gpa) {
  return Object.entries(ENDINGS).filter(([, ending]) => !ending.early).map(([id]) => ({
    id,
    route: id === 'professor' ? 'grad_school' : id === 'top_graduate' ? 'corporate' : id,
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
    case 'professor':
      return { ...base, title: `안암에서 연 첫 강의 · ${name}`, description: `${afterStudy}대학원에 진학한 지 몇 년, 안암으로 돌아와 첫 강의를 열었다. 칠판에 ‘${topic}’을 적자 맨 앞줄의 학생이 손을 들었다.` };
    case 'top_graduate':
      return { ...base, title: `수석 졸업 · ${role} 특별 채용`, description: `${afterStudy}졸업식 연단에서 ‘${topic}’을 처음 발표하던 날을 떠올렸다. 안암테크 인턴 때 쓰던 출입증은 이제 ${role} 사원증으로 바뀌었다.` };
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
  professor: ['lab', 'researchProposal'],
  top_graduate: ['job', 'internship'],
  campus_legend: ['cheerOt', 'koyeonjeon', 'ipselenti'],
  family: ['dating', 'coupleTime', 'familyPlan'],
  recovery: ['recoveryLeave'],
};

export function endingChoices(history, id) {
  const flags = recapExperience[id] ?? [];
  const relevant = history.filter(entry => entry.flags?.some(flag => flags.includes(flag))
    || (flags.includes('researchProposal') && entry.choice === '졸업생 연구 제안을 검토한다')
    || (id === 'recovery' && entry.stats?.mental < 0)
    || (['traveler', 'rich_life'].includes(id) && entry.cash > 0));
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

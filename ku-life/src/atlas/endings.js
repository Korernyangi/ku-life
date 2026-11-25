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
    title: '전공 실무 취업',
    icon: '💼',
    keepsake: { label: '출근 첫날 메모', text: '출입증 받기, 이름표 붙이기, 동기들한테 점심 메뉴 물어보기.' },
    description: '새 일터에서 첫 업무를 맡았다. 수업 시간에 적어 둔 메모를 꺼내 보니 그대로 써먹을 한 줄이 있다.',
    hint: '지능 11 이상으로 전공 실무직에 지원하세요.',
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
    keepsake: { label: '가족 포털 · 수강 내역', text: '기저귀 교체실습 1분반 / 담당 교수 생후 6개월 / 수강생 둘, 대기 0명.' },
    description: '휴학 1년 뒤, 둘 사이에 아기가 태어났다. 새벽 네 시에 울음소리가 나자 두 사람은 반사적으로 노트북부터 켰다. 가족 단톡방에 ‘기저귀 교체실습 1분반’ 신청 링크가 올라왔다.\n\n신청 버튼을 피하려 했지만 둘 다 이미 자동 수강 중이었다. 아기는 자기 강의평가에 별 다섯 개 대신 손가락 다섯 개를 통째로 입에 넣었다.',
    special: true,
    hidden: true,
    early: true,
  },
  recovery: {
    title: '시간표를 비워 둔 학기',
    icon: '🌿',
    keepsake: { label: '창가 자리 수강편람', text: '공강으로 인정되는 공강 / 주교재 카페 메뉴판 / 과제 0개.' },
    description: '휴학계를 냈다. 의료진과 상의해 잠시 정신건강의학과 병동에서 치료를 받았다. 시간을 두고 생활 리듬을 되찾으면서 친구들과 안부를 나눴다.\n\n몇 달 뒤 복학 일정을 알아보는데 동기가 카페 창가 자리를 잡아 줬다. 테이블에는 ‘공강으로 인정되는 공강, 1학점’이라는 수강편람이 붙어 있었다. 출석만 하고 아무것도 안 했더니 친구가 오늘 수업은 A+라고 했다.',
    special: true,
    hidden: true,
    early: true,
  },
  cafe: {
    title: '영수증으로 찍는 출석',
    icon: '☕',
    description: '주말마다 일하던 카페를 이어받아 콘센트 자리를 예약제로 바꿨다. 정각에 손님이 몰리면서 에스프레소 머신의 시계로 서버 시간을 맞추기 시작했다.\n\n다음 날 동기들이 예약표를 강의 시간표로 착각해 왔다. 결국 메뉴를 분반으로 바꿨다. 첫 학기 폐강 위기에 놓인 과목은 디카페인 심화였다.',
    keepsake: { label: '영수증 겸 수강증', text: '아메리카노 3분반 / 샷 추가 0.5학점 / 텀블러 제출 시 출석 인정.' },
    special: true,
    hidden: true,
    early: true,
  },
  newspaper: {
    title: '고양이 학번은 비공개',
    icon: '📰',
    description: '입실렌티와 고연전 사진 속 고양이를 따라갔다가 캠퍼스 고양이들의 당번 인수인계 현장을 취재했다. 회의 자료에는 ‘인간의 호들갑 관리’가 첫 번째 안건으로 적혀 있었다.\n\n호외가 나가자 고양이들이 정정 보도를 요청했다. 이유는 직함 오기. ‘도서관 앞 고양이’의 정식 직함은 ‘도서관 앞 박스 운영관리위원장’이었다.',
    keepsake: { label: '위원장실 보도자료', text: '질의응답은 츄르 제출 순. 학번 대신 발바닥 도장으로 본인 확인.' },
    special: true,
    hidden: true,
    early: true,
  },
  claw: {
    title: '집게가 잡은 건 내 진로',
    icon: '🕹️',
    description: '세 번째 상품을 뽑았더니 인형 밑에서 작은 합격 통지서가 구겨져 나왔다. 기계 주인이 작업 장갑을 건넸다. 최종 면접관 위치에는 방금 뽑힌 곰 인형이 걸터앉아 있었다.\n\n상품 배치를 맡은 첫날, 곰 인형 셋이 결석한 자리에는 조별 과제 무임승차 방지 안내문을 붙였다. 이튿날 셋 다 뽑기 통로를 막고 누워서 재배치를 요구했다.',
    keepsake: { label: '유리 안쪽 인사 공지', text: '올해 신입 3명, 전원 곰. 팀장 채용은 집게 수리 후 재개.' },
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
      return { ...base, description: `${base.description}\n\n아기 사진을 본 ${name} 동기가 답했다. “분유 한 통 보냈다. 이제 조별 과제 이름에 나도 넣어 줘.”` };
    case 'recovery':
      return { ...base, description: `${base.description}\n\n${name} 동기가 답했다. “다음엔 우리 학과 공강 실습 분반도 열자.”` };
    default:
      return { ...base, description: `${name} 친구들과 나눈 마지막 인사가 떠오른다. ${base.description}` };
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

import { RULES } from './config.js';

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
};

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

export function resolveEnding({ stats, cash, flags, history }, gpa, route) {
  const { hp, intelligence, social, mental } = stats;
  const has = flag => flags.includes(flag);
  if (hp <= 0) return 'dropout';
  if (gpa < RULES.graduationGpa) return 'ordinary';

  switch (route) {
    case 'corporate':
      if (has('job') && intelligence >= 15 && social >= 12) {
        return has('internship') && gpa >= 3.85 && intelligence >= 18 && social >= 13
          ? 'top_graduate' : 'corporate';
      }
      return intelligence >= 11 ? 'employee' : 'ordinary';
    case 'grad_school': {
      // Older ATLAS saves contain this choice in the history, before it had an experience flag.
      const reviewedResearch = has('researchProposal') || history.some(entry => entry.eventId === 'graduation'
        && entry.choice === '졸업생 연구 제안을 검토한다');
      if (has('lab') && reviewedResearch && gpa >= 3.75) return 'professor';
      return gpa >= (has('lab') ? 2.4 : 2.75) ? 'grad_school' : 'ordinary';
    }
    case 'startup':
      return has('launched') || (cash >= 950_000 && intelligence >= (has('startup') ? 12 : 14)) ? 'startup' : 'ordinary';
    case 'ngo':
      return social >= 16 && (has('friendHelp') || mental >= 15) ? 'ngo' : 'ordinary';
    case 'traveler':
      return hp >= 8 && mental >= 13 && cash >= 200_000 ? 'traveler' : 'ordinary';
    case 'employee':
      return intelligence >= 11 ? 'employee' : 'ordinary';
    case 'rich_life':
      return cash >= 2_500_000 ? 'rich_life' : 'ordinary';
    case 'campus_legend':
      return social >= 17 && ['cheerOt', 'koyeonjeon', 'ipselenti'].every(has) ? 'campus_legend' : 'ordinary';
    default:
      return 'ordinary';
  }
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

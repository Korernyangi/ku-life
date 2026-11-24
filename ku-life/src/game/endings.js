export const ENDINGS = {
  corporate: {
    title: '안암테크 입사',
    icon: '🏢',
    desc: '첫 명함에 안암테크 직인이 찍혔다. 면접 단골 질문이었던 팀플 이야기는 이제 신입 연수의 아이스브레이커다.',
    hint: '기업 공채에 도전하고 커리어 80, 인맥 65 이상을 달성하세요.',
  },
  grad_school: {
    title: '대학원 진학',
    icon: '📚',
    desc: '학생증을 반납한 지 한 달 만에 새 학생증을 받았다. 이번 시간표의 빈칸에는 세미나와 논문 읽기가 들어간다.',
    hint: '대학원에 지원하고 평점 2.75 이상을 달성하세요. 연구실 인턴을 준비했다면 2.40부터 진학할 수 있어요.',
  },
  startup: {
    title: '공강 주식회사 창업',
    icon: '🚀',
    desc: '공강마다 고치던 앱이 첫 유료 고객을 만났다. 대표, 개발자, 고객센터 담당자 세 명의 이름이 전부 당신이다.',
    hint: '서비스를 출시하려면 돈 95와 커리어 70 이상이 필요해요. 스타트업 준비 경험이 있으면 커리어 60부터 가능해요.',
  },
  ngo: {
    title: '동네를 바꾸는 활동가',
    icon: '🤝',
    desc: '캠퍼스에서 만난 사람들과 지역단체의 새 프로젝트를 맡았다. 첫 회의에서 나온 의견은 열세 개, 접이식 의자는 열두 개다.',
    hint: '지역단체에 합류하려면 인맥 80 이상에 봉사 동아리 경험 또는 멘탈 75 이상이 필요해요.',
  },
  traveler: {
    title: '편도 티켓 한 장',
    icon: '🧳',
    desc: '졸업 가운을 반납하고 배낭을 멨다. 첫 여행지에서 배운 현지어는 “이 버스, 돌아오는 편도 있나요?”였다.',
    hint: '배낭여행을 떠나려면 체력 38, 멘탈 65, 돈 20 이상이 필요해요.',
  },
  employee: {
    title: '오후문구 신입사원',
    icon: '💼',
    desc: '동네 문구 회사에 입사해 신제품 노트를 맡았다. 수업 시간에 그리던 낙서가 이번 시즌 한정판 표지가 됐다.',
    hint: '오후문구에 지원하고 커리어 55 이상을 달성하세요. 공채 준비 중에도 이곳의 제안을 받을 수 있어요.',
  },
  rich_life: {
    title: '통장으로 산 안식년',
    icon: '💰',
    desc: '알바와 절약으로 모은 돈으로 1년 치 여유를 샀다. 이번 달 달력에는 월세 납부일과 평일 낮 영화 한 편이 적혀 있다.',
    hint: '돈 125 이상을 모아 졸업 후 1년을 쉬어 가세요.',
  },
  ordinary: {
    title: '아직 제목 없는 다음 학기',
    icon: '🌱',
    desc: '졸업 앨범의 마지막 장은 빈 페이지다. 그곳에 이번 주 할 일 세 가지를 적었다. 첫 줄에는 동기와 점심 먹기.',
    hint: '졸업 후 천천히 길을 찾아보거나, 준비한 진로가 뜻대로 풀리지 않을 때 만날 수 있어요.',
  },
  dropout: {
    title: '잠시 내려놓은 학생증',
    icon: '🍂',
    desc: '몸과 마음을 돌보기 위해 학업을 멈췄다. 이번 주 달력에서 가장 중요한 약속은 충분히 쉬는 것이다.',
    hint: '재학 중 체력이나 멘탈이 0이 되면 학업을 멈춰요.',
  },
  professor: {
    title: '돌아온 안암 교수님',
    icon: '🎓',
    desc: '대학원에 진학한 지 몇 년, 당신은 안암으로 돌아와 첫 강의를 연다. 첫 출석부에는 예전의 당신처럼 맨 앞줄에 앉은 학생이 있다.',
    hint: '연구실 인턴 준비와 지도교수의 논문 지도를 모두 선택하고, 평점 3.75 이상으로 대학원에 지원하세요.',
    special: true,
  },
  top_graduate: {
    title: '수석 졸업, 안암테크 특별 채용',
    icon: '🏆',
    desc: '졸업식에서 학교 대표로 마이크를 잡았다. 다음 주엔 인턴 때 쓰던 출입증이 정식 사원증으로 바뀐다.',
    hint: '대기업 인턴을 준비하고 평점 3.85, 커리어 90, 인맥 65 이상으로 기업 공채에 도전하세요.',
    special: true,
  },
  campus_legend: {
    title: '안암의 영원한 응원단장',
    icon: '📣',
    desc: '졸업 후에도 후배들이 당신을 응원석 맨 앞으로 불러낸다. 경기가 끝나고도 관중석에서 당신이 만든 구호가 들려온다.',
    hint: '응원단이나 축제 응원에 3회 이상 참여하고 인맥 85 이상으로 졸업생 응원 무대에 오르세요.',
    special: true,
  },
};

export function getEndingId(id) {
  if (id === 'academic') return 'grad_school';
  if (id === 'family_life') return 'ordinary';
  return Object.hasOwn(ENDINGS, id) ? id : 'ordinary';
}

export function resolveEnding({ stats, ending, endingRoute, endingMilestones }) {
  const { grade, hp, mental, money, relation, career } = stats;
  if (ending === 'dropout' || hp <= 0 || mental <= 0) return 'dropout';

  // 진로 선택이 도입되기 전의 플레이 기록도 스탯으로 판정한다.
  if (!endingRoute) {
    if (grade >= 4 && career >= 80) return 'top_graduate';
    if (grade >= 3.7 && mental >= 70) return 'grad_school';
    if (career >= 85 && relation >= 70) return 'corporate';
    if (career >= 70 && money >= 100) return 'startup';
    if (relation >= 85 && mental >= 70) return 'ngo';
    if (hp >= 80 && mental >= 80) return 'traveler';
    if (grade >= 3) return 'grad_school';
    if (career >= 60) return 'employee';
    if (money >= 120) return 'rich_life';
    return 'ordinary';
  }

  const { internship, research, thesis, startup, volunteer, cheer } = endingMilestones;
  switch (endingRoute.id) {
    case 'corporate':
      if (career >= 80 && relation >= 65) {
        return internship && grade >= 3.85 && career >= 90 ? 'top_graduate' : 'corporate';
      }
      return career >= 55 ? 'employee' : 'ordinary';
    case 'grad_school':
      if (research && thesis && grade >= 3.75) return 'professor';
      return grade >= (research ? 2.4 : 2.75) ? 'grad_school' : 'ordinary';
    case 'startup':
      return money >= 95 && career >= (startup ? 60 : 70) ? 'startup' : 'ordinary';
    case 'ngo':
      return relation >= 80 && (volunteer || mental >= 75) ? 'ngo' : 'ordinary';
    case 'traveler':
      return hp >= 38 && mental >= 65 && money >= 20 ? 'traveler' : 'ordinary';
    case 'employee':
      return career >= 55 ? 'employee' : 'ordinary';
    case 'rich_life':
      return money >= 125 ? 'rich_life' : 'ordinary';
    case 'campus_legend':
      return cheer >= 3 && relation >= 85 ? 'campus_legend' : 'ordinary';
    default:
      return 'ordinary';
  }
}

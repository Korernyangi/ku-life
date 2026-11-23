/**
 * 게임 상태 관리
 * - 랜덤 시작 설정 (전형, 학과, 집안 형편, 성격)
 * - 스탯 관리 (학점, 체력, 멘탈, 돈, 인간관계, 커리어)
 * - 학기/이벤트 진행 관리
 */

// 입학 전형
const ADMISSION_TYPES = [
  { id: 'regular', name: '정시', desc: '수능을 통해 입학. 시험 집중력이 강점이다.', stats: { intelligence: 5, mental: -5 } },
  { id: 'early', name: '수시', desc: '학생부를 통해 입학. 교내 활동 경험이 풍부하다.', stats: { career: 7, relation: 5 } },
  { id: 'transfer', name: '편입', desc: '드물게 고려대에 편입했다. 새 환경 적응이 필요하다.', stats: { mental: -8, relation: -5, money: 8 } },
];

// 학과
const MAJORS = [
  { id: 'cs', name: '컴퓨터공학과', desc: '코딩과 알고리즘의 세계. 취업은 잘되지만 과제가 많다.', stats: { grade: -5, career: 15, mental: -5 } },
  { id: 'biz', name: '경영학과', desc: '비즈니스와 경영의 기초. 팀플이 많다.', stats: { relation: 10, career: 10, grade: -3 } },
  { id: 'econ', name: '경제학과', desc: '이론과 수식의 향연. 논리적 사고가 중요.', stats: { grade: 5, career: 5, mental: -3 } },
  { id: 'law', name: '법학과', desc: '판례와 조문의 바다. 암기량이 엄청나다.', stats: { grade: -10, mental: -10, career: 15 } },
  { id: 'med', name: '의예과', desc: '인체와 생명의 공부. 가장 힘들지만 보람도 크다.', stats: { grade: -15, mental: -15, career: 20, hp: -10 } },
  { id: 'eng', name: '영어영문학과', desc: '언어와 문학의 세계. 비교적 자유로운 분위기.', stats: { relation: 10, mental: 5, career: -5 } },
  { id: 'phil', name: '철학과', desc: '생각하고 질문하는 학문. 진로 고민이 깊다.', stats: { mental: 10, grade: 5, career: -10 } },
  { id: 'arch', name: '건축학과', desc: '설계와 모형의 연속. 밤샘이 일상.', stats: { hp: -15, mental: -10, career: 10, grade: -5 } },
];

// 집안 형편
const BACKGROUNDS = [
  { id: 'rich', name: '부유함', desc: '돈 걱정 없다. 용돈이 넉넉하고 학비 지원도 받음.', stats: { money: 30, mental: 5, hp: 5 } },
  { id: 'middle', name: '중산층', desc: '평범한 가정. 적당한 용돈, 알바는 선택.', stats: { money: 10, grade: 3 } },
  { id: 'poor', name: '가난함', desc: '학비와 생활비 직접 마련해야 함. 알바 필수.', stats: { money: -20, hp: -5, career: 10, mental: -5 } },
  { id: 'scholarship', name: '장학생', desc: '성적 장학금으로 버팀. 성적 유지가 생명.', stats: { money: 5, grade: 15, mental: -10 } },
];

// 성격
const PERSONALITIES = [
  { id: 'diligent', name: '성실함', desc: '꾸준히 노력하는 타입. 학점 관리에 유리.', stats: { grade: 10, hp: -3, mental: 3 } },
  { id: 'social', name: '사교적', desc: '사람 만나기 좋아함. 인맥이 넓어짐.', stats: { relation: 15, grade: -3, money: -5 } },
  { id: 'ambitious', name: '야망있음', desc: '커리어에 올인. 스펙 쌓기에 적극적.', stats: { career: 15, mental: -5, relation: -5 } },
  { id: 'chill', name: '여유로움', desc: '스트레스 덜 받음. 멘탈 관리에 유리.', stats: { mental: 15, grade: -5, career: -5 } },
  { id: 'anxious', name: '걱정많음', desc: '사소한 것도 신경 쓰임. 멘탈 관리가 중요.', stats: { mental: -15, grade: 5, hp: -3 } },
  { id: 'creative', name: '창의적', desc: '새로운 시도를 좋아함. 다양한 경험 추구.', stats: { career: 5, relation: 5, grade: -3, mental: 3 } },
];

// 스탯 초기값
const BASE_STATS = {
  grade: null,    // 첫 학기 종료 후 확정되는 누적 평균
  intelligence: 50, // 지능 (0~100)
  hp: 100,        // 체력 (0~100)
  mental: 100,    // 멘탈 (0~100)
  money: 50,      // 돈 (0~200)
  relation: 50,   // 인간관계 (0~100)
  career: 50,     // 커리어 (0~100)
};

const STAT_LIMITS = {
  grade: 4.5,
  intelligence: 100,
  hp: 100,
  mental: 100,
  money: 200,
  relation: 100,
  career: 100,
};

function findSelection(value, options) {
  if (typeof value === 'string') return options.find(item => item.id === value) || options[0];
  if (value?.id) return options.find(item => item.id === value.id) || value;
  return value || null;
}

function calculateStartingStats(selections) {
  const stats = { ...BASE_STATS };
  Object.values(selections).forEach(item => {
    Object.entries(item?.stats || {}).forEach(([key, amount]) => {
      if (key === 'grade') return;
      if (Object.hasOwn(stats, key)) {
        stats[key] = Math.max(0, Math.min(STAT_LIMITS[key], stats[key] + amount));
      }
    });
  });
  return stats;
}

function createWeeklySchedule(major) {
  const field = major?.name?.replace('학과', '') || '전공';
  return [
    { day: '월', classes: [`${field} 개론`, '교양 글쓰기'] },
    { day: '화', classes: ['영어 회화', `${field} 세미나`] },
    { day: '수', classes: ['자율 학습'] },
    { day: '목', classes: ['팀 프로젝트', `${field} 선택`] },
    { day: '금', classes: ['교양 수업'] },
    { day: '토', classes: ['자율 / 휴식'] },
  ];
}

function createAppearance(gender, stats, personality) {
  const styles = gender === '여성' ? ['long', 'bob', 'short']
    : gender === '남성' ? ['short', 'medium', 'long'] : ['short', 'bob', 'medium', 'long'];
  const accessory = stats.intelligence >= 76 ? 'glasses'
    : personality.id === 'social' ? 'earrings'
      : personality.id === 'creative' ? 'hairclip'
        : personality.id === 'ambitious' ? 'lanyard'
          : personality.id === 'diligent' ? 'bookpin' : 'none';
  const pick = list => list[Math.floor(Math.random() * list.length)];
  return {
    hairStyle: pick(styles),
    hairColor: pick(['#241b20', '#39291f', '#4b3024', '#1d252c', '#654238']),
    skinTone: pick(['#f4cfad', '#e9b995', '#d9a27d', '#c98d6b']),
    outfitColor: pick(['#8b1e2d', '#a12b36', '#263c59', '#315747']),
    accessory,
  };
}

/**
 * 랜덤 시작 설정 생성
 */
export function generateRandomStart() {
  const transferChance = 0.03;
  const admission = Math.random() < transferChance
    ? ADMISSION_TYPES.find(item => item.id === 'transfer')
    : ADMISSION_TYPES[Math.floor(Math.random() * 2)];
  const major = MAJORS[Math.floor(Math.random() * MAJORS.length)];
  const background = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
  const personality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
  const genderRoll = Math.random();
  const gender = genderRoll < 0.48 ? '여성' : genderRoll < 0.96 ? '남성' : '논바이너리';

  // 스탯 계산
  const stats = { ...BASE_STATS };
  stats.intelligence = 40 + Math.floor(Math.random() * 41);
  [admission, major, background, personality].forEach(item => {
    Object.entries(item.stats).forEach(([key, value]) => {
      if (key === 'grade') return;
      if (stats[key] !== undefined) {
        stats[key] = Math.max(0, Math.min(STAT_LIMITS[key] ?? 100, stats[key] + value));
      }
    });
  });
  const heightCm = 152 + Math.floor(Math.random() * 41);
  const bmi = 18.5 + Math.random() * 8.5;
  const weightKg = Math.round((heightCm / 100) ** 2 * bmi);
  const appearance = createAppearance(gender, stats, personality);

  return {
    admission: { id: admission.id, name: admission.name, desc: admission.desc },
    major: { id: major.id, name: major.name, desc: major.desc },
    background: { id: background.id, name: background.name, desc: background.desc },
    personality: { id: personality.id, name: personality.name, desc: personality.desc },
    gender,
    relationshipStatus: 'single',
    heightCm,
    weightKg,
    appearance,
    stats,
    semester: 1,
    totalSemesters: 8,
    eventsCompleted: [],
    endings: [],
  };
}

/**
 * 게임 상태 클래스
 */
export class GameState {
  constructor(initialData = null) {
    const start = initialData || generateRandomStart();
    this.admission = findSelection(start.admission, ADMISSION_TYPES);
    this.major = findSelection(start.major, MAJORS);
    this.background = findSelection(start.background, BACKGROUNDS);
    this.personality = findSelection(start.personality, PERSONALITIES);
    this.gender = start.gender || '여성';
    this.relationshipStatus = start.relationshipStatus || 'single';
    this.heightCm = start.heightCm || 152 + Math.floor(Math.random() * 41);
    this.weightKg = start.weightKg || Math.round((this.heightCm / 100) ** 2 * (18.5 + Math.random() * 8.5));
    this.weeklySchedule = start.weeklySchedule || createWeeklySchedule(this.major);

    const hasSelectionIds = [start.admission, start.major, start.background, start.personality]
      .some(value => typeof value === 'string');
    this.stats = start.stats && !hasSelectionIds
      ? { ...BASE_STATS, ...start.stats }
      : calculateStartingStats({
        admission: this.admission,
        major: this.major,
        background: this.background,
        personality: this.personality,
      });
    this.gradeHistory = [...(start.gradeHistory || [])];
    this.courseTranscripts = [...(start.courseTranscripts || [])];
    this.semesterGradeDelta = start.semesterGradeDelta || 0;
    this.startingGradeBonus = [this.admission, this.major, this.background, this.personality]
      .reduce((total, item) => total + (item?.stats?.grade || 0), 0);
    this.appearance = start.appearance || createAppearance(this.gender, this.stats, this.personality);
    if (!this.gradeHistory.length && start.stats?.grade == null) this.stats.grade = null;
    this.semester = start.semester ?? 1;
    this.totalSemesters = start.totalSemesters ?? 8;
    this.eventsCompleted = [...(start.eventsCompleted || [])];
    this.endings = [...(start.endings || [])];
    this.currentEvent = start.currentEvent || null;
    this.currentScene = start.currentScene || 'campus';
    this.isGameOver = Boolean(start.isGameOver);
    this.ending = start.ending || null;
  }

  /**
   * 스탯 변경 (클램핑 포함)
   */
  modifyStat(stat, amount) {
    if (this.stats[stat] === undefined) return;
    if (stat === 'grade') {
      this.semesterGradeDelta += amount;
      return amount;
    }
    const oldValue = this.stats[stat];
    const max = STAT_LIMITS[stat] ?? 100;
    this.stats[stat] = Math.max(0, Math.min(max, this.stats[stat] + amount));
    return this.stats[stat] - oldValue;
  }

  /**
   * 여러 스탯 한번에 변경
   */
  modifyStats(changes) {
    const results = {};
    Object.entries(changes).forEach(([stat, amount]) => {
      results[stat] = this.modifyStat(stat, amount);
    });
    return results;
  }

  /**
   * 스탯 가져오기
   */
  getStat(stat) {
    return this.stats[stat] ?? 0;
  }

  /**
   * 모든 스탯 가져오기
   */
  getAllStats() {
    return { ...this.stats };
  }

  finalizeSemesterGrade() {
    if (this.gradeHistory.length >= this.semester) return null;
    const classNames = [...new Set((this.weeklySchedule || []).flatMap(day => day.classes))].slice(0, 5);
    const defaults = ['전공 기초', '교양 글쓰기', '전공 세미나', '영어 회화', '교양 선택'];
    while (classNames.length < 5) classNames.push(defaults[classNames.length]);
    const aptitude = this.stats.intelligence || 50;
    const effort = this.semesterGradeDelta * 0.55 + (this.semester === 1 ? this.startingGradeBonus * 0.45 : 0);
    const clampScore = value => Math.max(0, Math.min(100, Math.round(value)));
    const toGrade = score => {
      if (score >= 95) return { letter: 'A+', points: 4.5 };
      if (score >= 90) return { letter: 'A', points: 4.0 };
      if (score >= 85) return { letter: 'B+', points: 3.5 };
      if (score >= 80) return { letter: 'B', points: 3.0 };
      if (score >= 75) return { letter: 'C+', points: 2.5 };
      if (score >= 70) return { letter: 'C', points: 2.0 };
      if (score >= 65) return { letter: 'D+', points: 1.5 };
      if (score >= 60) return { letter: 'D', points: 1.0 };
      return { letter: 'F', points: 0 };
    };
    const courses = classNames.map((name, index) => {
      const courseAptitude = 78.5 + (aptitude - 50) * 0.35 + effort + (Math.random() * 12 - 6) + (index === 0 ? this.stats.mental * 0.04 : 0);
      const attendance = clampScore(75 + this.stats.hp * 0.18 + this.stats.mental * 0.07 + (Math.random() * 8 - 4));
      const assignment = clampScore(courseAptitude + (Math.random() * 12 - 6));
      const midterm = clampScore(courseAptitude + (Math.random() * 16 - 8));
      const final = clampScore(courseAptitude + (Math.random() * 16 - 8));
      const score = clampScore(assignment * 0.25 + midterm * 0.3 + final * 0.35 + attendance * 0.1);
      return { name, credits: 3, score, ...toGrade(score), components: { assignment, midterm, final, attendance } };
    });
    const credits = courses.reduce((sum, course) => sum + course.credits, 0);
    const semesterGpa = Math.round(courses.reduce((sum, course) => sum + course.points * course.credits, 0) / credits * 100) / 100;
    const transcript = { semester: this.semester, courses, credits, gpa: semesterGpa };
    this.courseTranscripts.push(transcript);
    this.gradeHistory.push(semesterGpa);
    const allCourses = this.courseTranscripts.flatMap(term => term.courses);
    const allCredits = allCourses.reduce((sum, course) => sum + course.credits, 0);
    this.stats.grade = Math.round(allCourses.reduce((sum, course) => sum + course.points * course.credits, 0) / allCredits * 100) / 100;
    this.semesterGradeDelta = 0;
    return { semesterGpa, average: this.stats.grade, credits, transcript };
  }

  /**
   * 다음 학기로 진행
   */
  nextSemester() {
    if (this.semester < this.totalSemesters && !this.isGameOver) {
      this.semester++;
      return true;
    }
    return false;
  }

  /**
   * 게임 오버 체크 (체력/멘탈 0 이하)
   */
  checkGameOver() {
    if (this.stats.hp <= 0 || this.stats.mental <= 0) {
      this.isGameOver = true;
      this.ending = 'dropout';
      return true;
    }
    return false;
  }

  /**
   * 졸업 체크
   */
  checkGraduation() {
    return this.isGameOver && this.ending !== 'dropout';
  }

  /**
   * 엔딩 결정
   */
  determineEnding() {
    const { grade, hp, mental, money, relation, career } = this.stats;

    // 드롭아웃 이미 체크됨
    if (this.ending === 'dropout') return 'dropout';

    // 엔딩 조건들 (우선순위 순)
    if (grade >= 4.0 && career >= 80) return 'top_graduate'; // 수석 졸업 + 취업
    if (grade >= 3.7 && mental >= 70) return 'academic'; // 학계 진로
    if (career >= 85 && relation >= 70) return 'corporate'; // 대기업/좋은 직장
    if (career >= 70 && money >= 100) return 'startup'; // 창업
    if (relation >= 85 && mental >= 70) return 'ngo'; // NGO/공익
    if (hp >= 80 && mental >= 80) return 'traveler'; // 세계일주/자유
    if (grade >= 3.0) return 'grad_school'; // 대학원 진학
    if (career >= 60) return 'employee'; // 일반 직장인
    if (money >= 120) return 'rich_life'; // 부유한 삶
    if (relation >= 70) return 'family_life'; // 가정 중심
    return 'ordinary'; // 평범한 삶
  }

  /**
   * 엔딩 상세 정보
   */
  getEndingInfo(endingId) {
    const endings = {
      dropout: {
        title: '중도 포기',
        desc: '체력이나 멘탈이 바닥나 학업을 이어갈 수 없게 되었습니다. 언젠가 다시 도전할 날이 오길.',
        icon: '😔',
      },
      top_graduate: {
        title: '수석 졸업 & 꿈의 직장',
        desc: '최고의 성적으로 졸업하고 원하는 기업에 입사했습니다. 당신의 노력은 배신하지 않았습니다.',
        icon: '🏆',
      },
      academic: {
        title: '연구자의 길',
        desc: '학문에 대한 열정으로 대학원에 진학해 연구자가 되었습니다. 지식의 경계를 넓혀갑니다.',
        icon: '🔬',
      },
      corporate: {
        title: '대기업 입사',
        desc: '탄탄한 스펙과 인맥으로 대기업에 입사했습니다. 안정적인 커리어를 쌓아갑니다.',
        icon: '🏢',
      },
      startup: {
        title: '창업가',
        desc: '아이디어와 자금, 인맥을 바탕으로 스타트업을 창업했습니다. 도전은 계속됩니다.',
        icon: '🚀',
      },
      ngo: {
        title: '사회활동가',
        desc: '따뜻한 마음과 넓은 인맥으로 NGO에서 일하며 세상을 바꾸고 있습니다.',
        icon: '🤝',
      },
      traveler: {
        title: '자유로운 영혼',
        desc: '건강한 몸과 마음으로 세계를 여행하며 자신만의 길을 찾아갑니다.',
        icon: '🌍',
      },
      grad_school: {
        title: '대학원 진학',
        desc: '더 깊은 공부를 위해 대학원에 진학했습니다. 석사/박사 과정에 도전합니다.',
        icon: '📚',
      },
      employee: {
        title: '직장인',
        desc: '안정적인 직장에 취업해 평범한 직장인으로 살아갑니다. 소소한 행복을 누립니다.',
        icon: '💼',
      },
      rich_life: {
        title: '경제적 자유',
        desc: '알바와 투자로 모은 자금으로 경제적 자유를 얻었습니다. 하고 싶은 일을 합니다.',
        icon: '💰',
      },
      family_life: {
        title: '가정적인 삶',
        desc: '소중한 사람들과 가정을 꾸려 행복한 일상을 보냅니다. 그것이 최고의 성공입니다.',
        icon: '🏠',
      },
      ordinary: {
        title: '평범한 졸업',
        desc: '무난하게 졸업해 평범한 삶을 살아갑니다. 특별하지 않아도 나름의 의미가 있습니다.',
        icon: '🌱',
      },
    };
    return endings[endingId] || endings.ordinary;
  }

  /**
   * 상태 직렬화 (저장용)
   */
  serialize() {
    return {
      admission: this.admission,
      major: this.major,
      background: this.background,
      personality: this.personality,
      gender: this.gender,
      relationshipStatus: this.relationshipStatus,
      heightCm: this.heightCm,
      weightKg: this.weightKg,
      appearance: this.appearance,
      weeklySchedule: this.weeklySchedule,
      stats: this.stats,
      gradeHistory: this.gradeHistory,
      courseTranscripts: this.courseTranscripts,
      semesterGradeDelta: this.semesterGradeDelta,
      semester: this.semester,
      totalSemesters: this.totalSemesters,
      eventsCompleted: this.eventsCompleted,
      endings: this.endings,
      currentScene: this.currentScene,
      isGameOver: this.isGameOver,
      ending: this.ending,
    };
  }

  /**
   * 상태 역직렬화 (불러오기용)
   */
  static deserialize(data) {
    const state = new GameState(data);
    state.currentScene = data.currentScene || 'campus';
    state.isGameOver = data.isGameOver || false;
    state.ending = data.ending || null;
    return state;
  }
}

// 데이터 내보내기 (UI에서 선택지 표시용)
export const GAME_DATA = {
  ADMISSION_TYPES,
  MAJORS,
  BACKGROUNDS,
  PERSONALITIES,
};

export default GameState;

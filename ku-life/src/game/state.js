import { ENDINGS, getEndingId, resolveEnding } from './endings.js';

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
  { id: 'psy', name: '심리학과', desc: '사람의 마음과 행동을 실험과 관찰로 탐구한다.', stats: { relation: 5, mental: 5 } },
  { id: 'soc', name: '사회학과', desc: '조사와 토론을 통해 사회 구조와 일상을 살펴본다.', stats: { relation: 8, grade: 3 } },
  { id: 'stats', name: '통계학과', desc: '데이터 속 패턴을 찾고 불확실성을 다룬다.', stats: { career: 10, mental: -4 } },
  { id: 'math', name: '수학과', desc: '정의와 증명을 바탕으로 문제의 구조를 파고든다.', stats: { grade: 6, mental: -5 } },
  { id: 'physics', name: '물리학과', desc: '수식과 실험으로 자연의 법칙을 알아간다.', stats: { career: 7, hp: -5 } },
  { id: 'chem', name: '화학과', desc: '실험실에서 물질의 성질과 변화를 관찰한다.', stats: { career: 8, hp: -6 } },
  { id: 'history', name: '사학과', desc: '사료를 읽고 과거의 사건을 여러 관점에서 해석한다.', stats: { grade: 5, mental: 4 } },
  { id: 'media', name: '미디어학부', desc: '기획과 제작을 통해 이야기와 정보를 전한다.', stats: { relation: 7, career: 6 } },
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

const MAJOR_COURSES = {
  cs: ['프로그래밍 기초', '이산수학', '자료구조', '컴퓨터 시스템'],
  biz: ['경영학원론', '회계원리', '마케팅원론', '조직행동론'],
  econ: ['경제학원론', '경제수학', '미시경제학', '경제통계학'],
  law: ['법학개론', '법제사', '헌법', '민법총칙'],
  med: ['의학개론', '기초화학', '인체생물학', '의료윤리'],
  eng: ['영미문학개론', '영어학개론', '영미소설 읽기', '영어 작문'],
  phil: ['철학개론', '논리학', '윤리학', '서양철학사'],
  arch: ['기초설계', '건축학개론', '건축구조', '건축표현'],
  psy: ['심리학개론', '심리통계', '인지심리학', '발달심리학'],
  soc: ['사회학개론', '사회조사방법론', '문화사회학', '사회불평등'],
  stats: ['통계학개론', '선형대수', '확률론', '통계프로그래밍'],
  math: ['미적분학', '선형대수', '정수론', '이산수학'],
  physics: ['일반물리학', '물리수학', '역학', '물리학실험'],
  chem: ['일반화학', '화학수학', '유기화학', '화학실험'],
  history: ['한국사입문', '동아시아사', '서양사개론', '역사 사료 읽기'],
  media: ['미디어학개론', '미디어 글쓰기', '디지털 콘텐츠 제작', '미디어와 사회'],
};

export function getScheduleOptions(major) {
  const courses = MAJOR_COURSES[major?.id] || ['전공 개론', '전공 기초', '전공 세미나', '전공 실습'];
  return [
    { day: '월', time: '09:00', name: courses[0] },
    { day: '월', time: '09:00', name: '교양 글쓰기' },
    { day: '화', time: '13:00', name: courses[1] },
    { day: '수', time: '11:00', name: courses[2] },
    { day: '목', time: '15:00', name: courses[3] },
    { day: '금', time: '10:00', name: '영어 회화' },
  ];
}

function createWeeklySchedule(major) {
  const courses = getScheduleOptions(major).filter(course => course.name !== '교양 글쓰기');
  return ['월', '화', '수', '목', '금', '토'].map(day => ({
    day,
    classes: courses.filter(course => course.day === day).map(course => course.name),
  }));
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
  stats.intelligence = 10 + Math.floor(Math.random() * 91);
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
    this.endings = [...new Set((start.endings || []).map(getEndingId))];
    this.endingRoute = start.endingRoute || null;
    this.endingMilestones = { ...start.endingMilestones };
    this.currentEvent = start.currentEvent || null;
    this.currentScene = start.currentScene || 'campus';
    this.isGameOver = Boolean(start.isGameOver);
    this.ending = start.ending ? getEndingId(start.ending) : null;
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
    for (const { name } of getScheduleOptions(this.major)) {
      if (classNames.length === 5) break;
      if (!classNames.includes(name)) classNames.push(name);
    }
    const aptitude = this.stats.intelligence ?? 50;
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

  recordEndingChoice(choice) {
    if (choice.endingMilestone) {
      const id = choice.endingMilestone;
      this.endingMilestones[id] = (this.endingMilestones[id] || 0) + 1;
    }
    if (choice.endingRoute) {
      this.endingRoute = { id: choice.endingRoute, text: choice.text };
    }
  }

  determineEnding() {
    return resolveEnding(this);
  }

  getEndingInfo(endingId) {
    return ENDINGS[getEndingId(endingId)];
  }

  getEndingScore(endingId) {
    const statsMax = 900;
    const bonusMax = 100;
    const limits = Object.entries(STAT_LIMITS);
    const normalizedTotal = limits.reduce((total, [stat, limit]) => {
      return total + Math.min(limit, Math.max(0, this.getStat(stat))) / limit;
    }, 0);
    const stats = Math.round(statsMax * normalizedTotal / limits.length);
    const id = getEndingId(endingId);
    const bonus = id === 'dropout' ? 0 : ENDINGS[id].special ? bonusMax : 70;
    return { stats, bonus, total: stats + bonus, max: statsMax + bonusMax, statsMax, bonusMax };
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
      endingRoute: this.endingRoute,
      endingMilestones: this.endingMilestones,
      currentScene: this.currentScene,
      isGameOver: this.isGameOver,
      ending: this.ending,
    };
  }

  /**
   * 상태 역직렬화 (불러오기용)
   */
  static deserialize(data) {
    return new GameState(data);
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

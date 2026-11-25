import { findMajor } from './majors.js';

// Default employer, alternate employer, alternate role, and the experience that favors it.
const employersByMajor = {
  business: ['CJ제일제당', '삼성물산', '사업개발 담당자', 'internship'],
  korean: ['문학동네', '창비', '출판 기획자', 'published'],
  philosophy: ['네이버', '카카오', '서비스 운영 정책 담당자', 'internship'],
  'korean-history': ['EBS', '미래엔', '한국사 교재 편집자', 'published'],
  history: ['민음사', '미래엔', '역사 교재 편집자', 'published'],
  sociology: ['한국리서치', '엠브레인', '소비자 조사 분석가', 'dataAnalysis'],
  'classical-chinese': ['민음사', '문학동네', '고전 번역 기획자', 'published'],
  english: ['문학동네', '네이버웹툰', '영어 로컬라이제이션 담당자', 'internship'],
  german: ['LG전자', '현대자동차', '독일어권 시장 기획자', 'internship'],
  french: ['아모레퍼시픽', '로레알코리아', '브랜드 콘텐츠 담당자', 'internship'],
  chinese: ['CJ ENM', '아모레퍼시픽', '중화권 마케팅 담당자', 'internship'],
  russian: ['현대자동차', '삼성물산', '해외사업 지원 담당자', 'internship'],
  japanese: ['네이버웹툰', '넥슨', '일본어 게임 로컬라이제이션 담당자', 'internship'],
  spanish: ['현대자동차', 'CJ대한통운', '중남미 사업 운영 담당자', 'internship'],
  linguistics: ['네이버', '카카오', '자연어 데이터 분석가', 'dataAnalysis'],
  'life-science': ['셀트리온', '유한양행', '신약 연구원', 'lab'],
  biotech: ['삼성바이오로직스', '셀트리온', '바이오 품질관리 담당자', 'lab'],
  'food-science': ['CJ제일제당', '오뚜기', '식품 품질관리 담당자', 'lab'],
  ecology: ['현대건설', '삼성물산', '조경·생태 설계 담당자', 'competition'],
  'food-economics': ['농심', 'CJ제일제당', '식품 유통 기획자', 'dataAnalysis'],
  politics: ['한국리서치', '삼정KPMG', '정책 리서치 담당자', 'internship'],
  economics: ['삼정KPMG', '신한카드', '소비시장 분석가', 'dataAnalysis'],
  statistics: ['신한카드', '카카오', '서비스 데이터 분석가', 'dataAnalysis'],
  'public-admin': ['삼정KPMG', '더존비즈온', '공공서비스 사업기획 담당자', 'internship'],
  math: ['토스', '카카오페이', '금융 데이터 분석가', 'dataAnalysis'],
  physics: ['삼성전자', 'LG디스플레이', '디스플레이 광학 엔지니어', 'lab'],
  chemistry: ['LG화학', '롯데케미칼', '소재 연구원', 'lab'],
  'earth-science': ['한국종합기술', '현대건설', '지반·환경 조사 담당자', 'lab'],
  'engineering-open': ['현대자동차', 'LG전자', '공학 제품기획 담당자', 'internship'],
  'chemical-engineering': ['LG화학', 'SK이노베이션', '화학 공정 엔지니어', 'internship'],
  materials: ['포스코', 'LG화학', '소재 분석 연구원', 'lab'],
  'civil-engineering': ['현대건설', '삼성물산', '건설 인프라 기술 담당자', 'internship'],
  architecture: ['삼우종합건축사사무소', '건원건축', '건축설계 담당자', 'competition'],
  mechanical: ['현대자동차', '두산에너빌리티', '설비 기술 엔지니어', 'internship'],
  industrial: ['CJ대한통운', '현대글로비스', '물류 데이터 분석가', 'dataAnalysis'],
  electrical: ['LG전자', '삼성전자', '전자회로 설계 엔지니어', 'lab'],
  semiconductor: ['삼성전자', 'SK하이닉스', '반도체 소자 엔지니어', 'lab'],
  energy: ['두산에너빌리티', '한화솔루션', '에너지 설비 기술 담당자', 'lab'],
  communications: ['KT', 'SK텔레콤', '네트워크 기술 엔지니어', 'lab'],
  medicine: ['유한양행', '한미약품', '의학정보 담당자', 'lab'],
  education: ['대교', '웅진씽크빅', '학습 프로그램 기획자', 'internship'],
  'korean-education': ['비상교육', '미래엔', '국어 교과서 편집자', 'published'],
  'english-education': ['YBM', 'NE능률', '영어교육 콘텐츠 기획자', 'published'],
  'geography-education': ['미래엔', '비상교육', '사회·지리 교재 편집자', 'published'],
  'history-education': ['천재교육', '미래엔', '역사 학습 콘텐츠 기획자', 'published'],
  'home-economics': ['비상교육', '대교', '생활교육 콘텐츠 편집자', 'internship'],
  'math-education': ['웅진씽크빅', '천재교육', '수학 교재 편집자', 'published'],
  'physical-education': ['데상트코리아', '휠라코리아', '스포츠 체험 프로그램 기획자', 'internship'],
  nursing: ['서울아산병원', '삼성서울병원', '환자 교육·간호 실무 담당자', 'internship'],
  'computer-science': ['네이버', '카카오', '데이터 분석가', 'dataAnalysis'],
  'data-science': ['카카오', '네이버', '서비스 데이터 분석가', 'dataAnalysis'],
  'artificial-intelligence': ['네이버', 'LG전자', '인공지능 연구 엔지니어', 'lab'],
  design: ['LG전자', '현대자동차', '제품·모빌리티 디자이너', 'competition'],
  international: ['삼성물산', '포스코인터내셔널', '글로벌 사업개발 담당자', 'internship'],
  'global-korea': ['CJ ENM', '하이브', '글로벌 콘텐츠 기획자', 'published'],
  'global-open': ['삼성물산', 'CJ ENM', '글로벌 프로젝트 운영 담당자', 'internship'],
  media: ['CJ ENM', '스튜디오드래곤', '영상 콘텐츠 기획자', 'published'],
  entertainment: ['하이브', 'CJ ENM', '공연·팬 콘텐츠 기획자', 'internship'],
  biomedical: ['삼성메디슨', '오스템임플란트', '의료기기 연구개발 담당자', 'lab'],
  biosystems: ['셀트리온', 'GC녹십자', '바이오 분석 연구원', 'lab'],
  'health-environment': ['코웨이', 'SK에코플랜트', '생활환경 데이터 분석가', 'dataAnalysis'],
  'health-policy': ['유한양행', '삼정KPMG', '헬스케어 정책 리서처', 'internship'],
  interdisciplinary: ['카카오', 'CJ제일제당', '신사업 기획자', 'competition'],
  psychology: ['네이버', '카카오', '사용자 행동 분석가', 'dataAnalysis'],
  'cyber-defense': ['안랩', 'SK쉴더스', '보안관제 담당자', 'internship'],
  'smart-security': ['SK쉴더스', '안랩', '서비스 보안 분석가', 'competition'],
  mobility: ['현대자동차', '현대모비스', '미래차 부품 연구원', 'lab'],
  undergraduate: ['CJ제일제당', '네이버', '융합 서비스 기획자', 'competition'],
};

export function employmentOptions(majorId) {
  const major = findMajor(majorId);
  const [company, alternate, alternateRole, experience] = employersByMajor[major?.id]
    ?? ['CJ제일제당', '네이버', '서비스 운영 담당자', 'internship'];
  return [
    { id: 'standard', company, role: major?.role ?? '사업 운영 담당자' },
    { id: 'alternate', company: alternate, role: alternateRole, experience },
  ];
}

export function isEmployment(id) {
  return id === 'corporate' || id === 'employee';
}

export function employmentForEnding(state, endingId) {
  if (!isEmployment(endingId)) return undefined;
  const [standard, alternate] = employmentOptions(state.majorId);
  const stored = state.ending?.id === endingId ? state.ending.employerId : null;
  if (stored === standard.id) return standard;
  if (stored === alternate.id) return alternate;
  const hasExperience = state.flags?.includes(alternate.experience)
    || (alternate.experience === 'dataAnalysis' && state.history?.some(entry => entry.eventId === 'capstone'
      && entry.choice === '내 노트북으로 데이터와 초안을 함께 정리한다'));
  return hasExperience ? alternate : standard;
}

# KU Life - 구현 계획

## 전체 파일 구조

```
/c/Users/gram16T/freellm/ku-life/ku-life/
├── package.json
├── index.html
├── public/
│   └── favicon.svg
├── src/
│   ├── main.js                    # 엔트리 포인트
│   ├── style.css                  # 전체 스타일
│   ├── game/
│   │   ├── state.js               # 게임 상태 (랜덤 시작, 스탯, 학기 관리)
│   │   ├── engine.js              # 게임 엔진 (이벤트 처리, 씬 전환, 엔딩 분기)
│   │   └── data/
│   │       └── events.json        # 이벤트 데이터 15개
│   ├── voxel/
│   │   ├── voxelModel.js          # 핵심: 문자 배열 + 팔레트 → InstancedMesh
│   │   ├── models/
│   │   │   ├── character.js       # 학생 캐릭터 모델 (머리, 몸통, 팔, 다리 분리)
│   │   │   ├── building.js        # 석조 건물 모델
│   │   │   ├── tree.js            # 나무 모델
│   │   │   ├── bench.js           # 벤치 모델
│   │   │   ├── grass.js           # 잔디 바닥 모델
│   │   │   ├── desk.js            # 도서관 책상
│   │   │   ├── campfire.js        # 모닥불
│   │   │   ├── cafe.js            # 카페 카운터
│   │   │   └── lamp.js            # 스탠드 조명
│   │   ├── scenes/
│   │   │   ├── campus.js          # 메인 캠퍼스 디오라마
│   │   │   ├── study.js           # 도서관 장면
│   │   │   ├── club.js            # 동아리/모닥불 장면
│   │   │   ├── parttime.js        # 알바/카페 장면
│   │   │   └── exam.js            # 시험/밤 장면
│   │   ├── particles.js           # 계절 입자 시스템 (벚꽃, 비, 낙엽, 눈)
│   │   ├── animator.js            # 캐릭터 애니메이션 상태 머신
│   │   └── camera.js              # 카메라 컨트롤러 (부드러운 이동)
│   └── ui/
│       └── overlay.js             # HTML 오버레이 (스탯바, 이벤트, 시작/엔딩 화면)
```

## 구현 순서

1. **package.json** - three.js 추가
2. **voxel/voxelModel.js** - 핵심 복셀 변환 유틸
3. **voxel/models/character.js** - 캐릭터 모델 (분리된 파츠)
4. **voxel/animator.js** - 애니메이션 상태 머신 (idle, walk, study, cheer, sad)
5. **voxel/models/*.js** - 나머지 모델들
6. **voxel/particles.js** - 계절 입자 시스템
6. **voxel/scenes/*.js** - 5개 씬
7. **voxel/camera.js** - 카메라 컨트롤러
8. **game/state.js** - 게임 상태 관리
9. **game/data/events.json** - 이벤트 15개
10. **game/engine.js** - 게임 엔진
11. **ui/overlay.js** - HTML 오버레이
12. **main.js, index.html, style.css** - 통합
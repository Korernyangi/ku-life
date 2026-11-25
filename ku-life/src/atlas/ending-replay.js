import { RULES } from './config.js';
import { endingChoices } from './endings.js';
import { EVENTS } from './events.js';

const eventById = new Map(EVENTS.map(event => [event.id, event]));
const socialEvents = new Set(['dating', 'couple_dates', 'couple_future', 'teamwork', 'friend_returns']);
const finaleScenes = {
  corporate: { scene: 'study', prop: 'badge', line: '첫 명함을 받고 새 일터에서 하루를 시작했다.' },
  employee: { scene: 'study', prop: 'badge', line: '수업 때 적어 둔 노트를 새 일터의 책상 위에 놓았다.' },
  grad_school: { scene: 'study', prop: 'notebook', line: '새 학생증을 받고 첫 세미나를 준비했다.' },
  startup: { scene: 'study', prop: 'laptop', line: '공강마다 만들던 서비스에 첫 결제 알림이 왔다.' },
  ngo: { scene: 'club', prop: 'notebook', line: '동네 회의에 일찍 도착해 접이식 의자를 폈다.', together: true },
  traveler: { scene: 'campus', prop: 'ticket', line: '배낭을 메고 첫 버스에 올랐다.' },
  rich_life: { scene: 'parttime', prop: 'ticket', line: '생활비를 떼어 두고 평일 낮 영화 한 편을 예매했다.' },
  ordinary: { scene: 'campus', prop: 'notebook', line: '다음에 할 일을 적고 동기에게 점심 약속을 잡았다.' },
  dropout: { scene: 'campus', prop: 'notebook', line: '학교 일정을 비우고 몸을 돌볼 시간을 냈다.' },
  family: { scene: 'home', prop: 'crib', line: '새벽 네 시, 냉장고의 교대표를 보고 분유를 탔다.', together: true },
  recovery: { scene: 'parttime', prop: 'cup', line: '몇 달 뒤, 동기와 카페 창가에서 다시 만났다.', together: true },
  cafe: { scene: 'parttime', prop: 'keys', line: '건네받은 열쇠로 문을 열고 단골의 첫 주문을 받았다.' },
  newspaper: { scene: 'study', prop: 'newspaper', line: '두 고양이를 구분한 사진이 호외 첫 장에 실렸다.' },
  claw: { scene: 'club', prop: 'claw', line: '구석의 곰을 손이 닿기 쉬운 가운데로 옮겼다.' },
};

function memoryFor(entry) {
  const event = eventById.get(entry.eventId);
  let scene = event?.scene ?? 'campus';
  const festival = scene === 'ipselenti' || scene === 'koyeonjeon';
  const choice = festival ? event.choices.find(option => option.text === entry.choice) : null;
  const attended = festival && (choice?.grant?.includes(scene) || entry.flags?.includes(scene));
  if (festival && !attended) scene = choice?.stats?.intelligence > 0 ? 'study' : 'campus';

  return {
    entry,
    semester: entry.semester,
    title: entry.title || event?.title || '대학생활 기록',
    choice: entry.choice,
    result: entry.message || '',
    scene,
    together: Boolean(attended || socialEvents.has(entry.eventId) || entry.stats?.social > 0),
    weight: (attended ? 5 : 0) + (entry.flags?.length ?? 0) * 2 + Number(event?.kind === 'chain'),
  };
}

export function endingMemories(history, endingId) {
  const recorded = history.filter(entry => Number.isInteger(entry?.semester)
    && entry.semester >= 1 && entry.semester <= RULES.termEvents.length && typeof entry.choice === 'string' && entry.choice.trim());
  if (!recorded.length) return [];

  const memories = recorded.map(memoryFor);
  const turningPoints = new Set(endingChoices(recorded, endingId));
  const selected = new Set([memories[0], memories.at(-1), ...memories.filter(memory => turningPoints.has(memory.entry))]);
  const usedScenes = new Set([...selected].map(memory => memory.scene));
  for (const semester of new Set(memories.map(memory => memory.semester))) {
    if ([...selected].some(memory => memory.semester === semester)) continue;

    const score = memory => memory.weight + (usedScenes.has(memory.scene) ? 0 : 3);
    const best = memories.filter(memory => memory.semester === semester)
      .reduce((first, second) => score(second) > score(first) ? second : first);
    selected.add(best);
    usedScenes.add(best.scene);
  }
  return memories.filter(memory => selected.has(memory)).map(({ entry, weight, ...memory }) => ({
    ...memory,
    turningPoint: turningPoints.has(entry),
  }));
}

export function endingFilm(state, ending) {
  const memories = endingMemories(state.history, ending.id).map(memory => ({
    ...memory,
    duration: (memory.turningPoint ? 1750 : 1250) + Math.min(950, memory.choice.length * 22),
  }));
  const { line, ...scene } = Object.hasOwn(finaleScenes, ending.id) ? finaleScenes[ending.id] : finaleScenes.ordinary;
  return [...memories, {
    ...scene,
    semester: state.semester,
    title: ending.title,
    choice: line,
    finale: true,
    duration: 3900,
  }];
}

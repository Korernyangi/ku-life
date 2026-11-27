import { RULES } from './config.js';

// Used both to render the film and to time the dates from the saved playthrough.
export const CAFE_SHOT_SECONDS = [6, 5, 6, 8, 4, 5, 4];

export function cafeFilmPlan(history) {
  const handoffIndex = history.findLastIndex(entry => entry.eventId === 'cafe_keys');
  const beforeHandoff = handoffIndex < 0 ? history : history.slice(0, handoffIndex);
  const shifts = beforeHandoff.filter(entry => entry.eventId === 'parttime');
  const firstIndex = shifts.findIndex(entry => entry.cash > 0);
  const first = shifts[firstIndex];
  const handoff = history[handoffIndex];

  // Take one distinct shift decision from between the first shift and the handoff.
  const later = first ? shifts.slice(firstIndex + 1) : [];
  const personalIndex = later.findLastIndex(entry => entry.cash === 90_000 || entry.cash === 0);
  const memoryIndex = personalIndex < 0 ? 0 : personalIndex;
  const memory = later[memoryIndex];
  const routine = later.slice(memoryIndex + 1).findLast(entry => entry.cash > 0) ?? handoff;
  const cut = memory?.cash === 90_000 ? 'short' : memory?.cash === 0 ? 'rest' : 'full';

  let elapsed = 0;
  const beats = [
    [first, '첫 카페 근무'],
    [memory, cut === 'short' ? '저녁 한 타임' : cut === 'rest' ? '쉬기로 한 주말' : '주말 두 타임'],
    [routine, '다시 온 단골 조'],
    [handoff, '열쇠를 받은 날'],
    [null, '다음 날 아침'],
    [null, '그날 첫 손님'],
    [null, '네 번째 잔'],
  ].map(([receipt, label], index) => {
    const start = elapsed;
    elapsed += CAFE_SHOT_SECONDS[index];
    const semester = receipt?.semester;
    return {
      start, end: elapsed, label,
      semester: Number.isInteger(semester) && semester >= 1 && semester <= RULES.termEvents.length ? semester : null,
    };
  });
  return { cut, beats };
}

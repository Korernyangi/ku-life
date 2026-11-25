import { RULES } from './config.js';
import { endingChoices } from './endings.js';
import { EVENTS } from './events.js';

const eventById = new Map(EVENTS.map(event => [event.id, event]));
const socialEvents = new Set(['dating', 'couple_dates', 'couple_future', 'teamwork', 'friend_returns']);

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

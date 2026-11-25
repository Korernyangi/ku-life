import { AtlasGame } from './game.js';

// One row per semester, using the zero-based choice indexes from a complete rehearsal.
const previews = {
  family: {
    eventId: 'couple_future',
    terms: [
      [2, 2, 1, 0, 2, 2, 1, 1, 2],
      [2, 1, 0, 2, 2, 3, 1, 2, 2],
      [2, 2, 1, 1, 2, 2, 1, 1, 2],
      [2, 1, 1, 2, 2, 3, 0, 2, 2],
      [3, 2, 1, 0, 2, 2, 1, 2, 2],
      [2, 1, 2],
    ],
  },
  recovery: {
    eventId: 'mental_crisis',
    terms: [
      [2, 1, 1, 0, 3, 2, 0, 0, 1],
      [1, 2, 1, 1, 3, 2, 0, 1, 1],
      [1, 0, 0, 0, 3, 2],
    ],
  },
};

export function createEndingPreview(id) {
  if (!Object.hasOwn(previews, id)) return null;

  const { eventId, terms } = previews[id];
  const game = new AtlasGame(null, () => .99, 'computer-science');
  for (const [semester, choices] of terms.entries()) {
    if (semester > 0 && !game.nextTerm()) return null;
    for (const index of choices) {
      if (!game.choose(index, game.eventToken) || !game.nextEvent()) return null;
    }
  }

  if (game.state.phase !== 'event' || game.event.id !== eventId) return null;
  const canSeeEnding = game.event.choices.some(choice => choice.ending === id && !game.choiceReasons(choice).length);
  if (!canSeeEnding) return null;

  // The player controls the rest of the run, including any later chance rolls.
  return new AtlasGame(game.state);
}

import { AtlasGame } from './game.js';
import { recordSemesterStart } from './rewind.js';

export function createRewindPreview() {
  const game = new AtlasGame(null, () => .65, 'business', { id: 'rewind-preview-graduation' });
  // Rehearse one ordinary playthrough so every displayed checkpoint has a real history.
  while (game.state.phase !== 'ended') {
    if (game.state.phase === 'career') {
      game.chooseCareer('ordinary');
    } else if (game.state.phase === 'term') {
      game.nextTerm();
    } else {
      recordSemesterStart(game.state);
      const options = game.event.choices.map((choice, index) => ({ choice, index }))
        .filter(({ choice }) => !choice.schedule && !choice.chance && (choice.cash ?? 0) >= 0 && !game.choiceReasons(choice).length);
      const value = ({ choice }) => (choice.stats.hp ?? 0) + (choice.stats.intelligence ?? 0) * (game.state.stats.hp > 12 ? 2 : .4);
      options.sort((a, b) => value(b) - value(a));
      if (!game.choose(options[0]?.index ?? 0, game.eventToken)) {
        throw new Error('치팅모드 미리보기 선택을 불러오지 못했어요.');
      }
      if (game.state.phase === 'result') game.nextEvent();
    }
  }
  return game;
}

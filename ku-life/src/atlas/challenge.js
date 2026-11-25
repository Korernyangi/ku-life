import { AtlasGame } from './game.js';
import { endingScore } from './endings.js';
import { ITEMS, RULES } from './config.js';
import { MAJOR_GROUPS } from './majors.js';

const majors = MAJOR_GROUPS.flatMap(group => group.majors);
const draw = (random, low, high) => low + Math.floor(random() * (high - low + 1));

export function createChallenge(random = Math.random) {
  const major = majors[draw(random, 0, majors.length - 1)];
  const stats = Object.fromEntries(Object.entries(RULES.startingStats).map(([stat, value]) =>
    [stat, value - draw(random, 1, 4)]));
  const cash = draw(random, 35, 65) * 10_000;
  return new AtlasGame(null, random, major.id, { stats, cash });
}

export function applyChallengeAction(game, { action, value, token, route }) {
  switch (action) {
    case 'choose': return Number.isSafeInteger(value) && game.choose(value, token);
    case 'next-event': return game.nextEvent();
    case 'next-term': return game.nextTerm();
    case 'career': return typeof route === 'string' && typeof value === 'string' && game.chooseCareer(route, value);
    case 'buy': return typeof value === 'string' && Object.hasOwn(ITEMS, value) && game.buy(value);
    case 'use': return typeof value === 'string' && Object.hasOwn(ITEMS, value) && game.use(value);
    default: return false;
  }
}

export function challengeScore(game) {
  return game.state.phase === 'ended' ? endingScore(game.state, game.gpa, game.state.ending.id).total : null;
}

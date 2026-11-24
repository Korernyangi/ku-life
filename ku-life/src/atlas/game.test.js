import assert from 'node:assert/strict';
import test from 'node:test';
import { EXPERIENCES, ITEMS, RULES, TERM_CALENDAR } from './config.js';
import { ENDINGS, endingScore, resolveEnding } from './endings.js';
import { EVENTS } from './events.js';
import { AtlasGame } from './game.js';

function fixture(eventId, overrides = {}, random = () => .25) {
  const { state } = new AtlasGame();
  const { stats, ...rest } = overrides;
  return new AtlasGame({ ...state, eventId, termEvents: [eventId], ...rest, stats: { ...state.stats, ...stats } }, random);
}

function play(game, index) {
  assert.equal(game.choose(index, game.eventToken), true);
}

test('four integer stats, cash separate, locked choices and stale tokens are enforced', () => {
  const fresh = new AtlasGame();
  assert.deepEqual(fresh.state.stats, { hp: 16, intelligence: 6, social: 6, mental: 16 });
  assert.equal(fresh.state.cash, 1_000_000);
  const game = fixture('koyeonjeon', { cash: 20_000, stats: { hp: 5 } });
  assert.deepEqual(game.choiceReasons(game.event.choices[0]), ['체력 8 이상 필요', '자금 80,000원 이상 필요']);
  const stale = game.eventToken;
  assert.equal(game.choose(0, stale), false);
  assert.equal(game.state.history.length, 0);
  play(game, 3);
  assert.deepEqual(game.state.receipt.stats, { hp: 4, social: -1, mental: 2 });
  assert.equal(game.choose(3, stale), false);
  assert.equal(game.state.history.length, 1);
  game.nextEvent();
  assert.equal(game.choose(0, stale), false);
  game.changeStats({ hp: 99, mental: -38, social: .8 });
  assert.deepEqual(game.state.stats, { hp: 20, intelligence: 6, social: 6, mental: 0 });
  assert.equal(game.state.phase, 'event');
});

test('the same study choice scales with stamina and cannot run at 5 or below', () => {
  for (const [hp, change] of [[16, { hp: -4, intelligence: 3 }], [12, { hp: -5, intelligence: 2 }], [7, { hp: -5, intelligence: 1 }]]) {
    const game = fixture('night_review', { stats: { hp } });
    play(game, 0);
    assert.deepEqual(game.state.receipt.stats, change);
  }
  const tired = fixture('night_review', { stats: { hp: 5 } });
  assert.equal(tired.choose(0, tired.eventToken), false);
});

test('zero health immediately ends a run while zero mental can trigger recovery', () => {
  const reachedZero = fixture('koyeonjeon', { stats: { hp: 2, mental: 0 } });
  play(reachedZero, 2);
  assert.equal(reachedZero.state.stats.hp, 0);
  assert.equal(reachedZero.state.phase, 'ended');
  assert.equal(reachedZero.state.ending.id, 'dropout');
  assert.equal(reachedZero.nextEvent(), false);

  const survived = fixture('laptop_fault', {
    semester: 2, termEvents: ['night_review', 'syllabus', 'boarding', 'parttime', 'midterm', 'laptop_fault'],
    stats: { hp: 5, mental: 0 }, streak: { mental: 1, critical: 1, both: 1 },
  });
  play(survived, 0);
  assert.equal(survived.state.phase, 'result');
  assert.deepEqual(survived.state.receipt.gained, ['lethargy', 'burnout', 'depression']);
  survived.nextEvent();
  assert.equal(survived.event.id, 'health_crisis');
  play(survived, 0);
  assert.ok(survived.state.receipt.cleared.includes('burnout'));
});

test('paid outcomes, recorded experiences, inventory and delayed chains survive save and restore', () => {
  let game = new AtlasGame(null, () => 0);
  play(game, 0);
  assert.equal(game.state.cash, 930_000);
  assert.deepEqual(game.state.receipt.flags, ['orientation', 'senior']);
  assert.deepEqual(game.state.scheduled, [{ id: 'senior_notes', semester: 2 }]);
  game = new AtlasGame(JSON.parse(JSON.stringify(game.state)), () => 0);
  assert.equal(game.choose(0, game.eventToken), false);
  while (game.state.phase !== 'term') {
    if (game.state.phase === 'result') game.nextEvent();
    else play(game, game.event.choices.findLastIndex(choice => !game.choiceReasons(choice).length));
  }
  game.nextTerm();
  play(game, 2);
  game.nextEvent();
  for (const expected of ['syllabus', 'boarding']) {
    assert.equal(game.event.id, expected);
    play(game, game.event.choices.findLastIndex(choice => !game.choiceReasons(choice).length));
    game.nextEvent();
  }
  assert.equal(game.event.id, 'senior_notes');
  play(game, 1);
  assert.equal(game.state.inventory.notes, 1);
  assert.deepEqual(game.state.receipt.items, { notes: 1 });
  assert.ok(game.state.scheduled.some(entry => entry.id === 'intern_interview' && entry.semester === 3));
});

test('stat, item and condition modifiers affect probability and their use is single-shot', () => {
  const state = { inventory: { laptop: 1 }, boosts: { currentGpa: 0, nextGpa: 0, chance: .15 }, stats: { intelligence: 14 } };
  const ready = fixture('lab_offer', state, () => .9);
  const runDown = fixture('lab_offer', { ...state, stats: { intelligence: 14, mental: 2 }, streak: { mental: 2, critical: 2, both: 0 } }, () => .9);
  play(ready, 0);
  play(runDown, 0);
  assert.equal(ready.state.receipt.chance.won, true);
  assert.equal(runDown.state.receipt.chance.won, false);
  assert.ok(ready.state.receipt.chance.probability > runDown.state.receipt.chance.probability);
  assert.ok(ready.state.flags.includes('lab'));
  assert.equal(runDown.state.boosts.chance, 0);
});

test('shop purchases, future-only stock, passives and consumables use their defined limits', () => {
  const game = fixture('walk', { phase: 'term', semester: 3, cash: 1_600_000, stats: { hp: 9 }, grades: [2, 2.5, 2.6] });
  assert.equal(game.buy('tablet'), true);
  assert.equal(game.buy('tablet'), false);
  assert.equal(game.buy('laptop'), true);
  assert.equal(game.buy('vitamins'), false);
  game.changeCash(500_000);
  assert.equal(game.buy('notes'), true);
  assert.equal(game.buy('notes'), true);
  assert.equal(game.use('notes'), true);
  assert.equal(game.use('notes'), false);
  assert.equal(game.buy('vitamins'), true);
  assert.equal(game.use('vitamins'), true);
  assert.equal(game.state.stats.hp, 14);
  assert.equal(game.state.inventory.vitamins, undefined);
  game.nextTerm();
  assert.equal(game.state.boosts.currentGpa, .5);
  assert.equal(game.state.boosts.nextGpa, 0);
  play(game, 1);
  assert.equal(game.state.receipt.stats.hp, -1);
  assert.equal(game.state.receipt.stats.intelligence, 3);

  const last = fixture('graduation', { phase: 'term', semester: 8, cash: 9_000_000 });
  assert.equal(last.buy('equipment'), false);
  assert.equal(last.buy('notes'), false);
  assert.equal(last.buy('counseling'), true);

  const passive = fixture('walk', { inventory: { console: 1, equipment: 1 }, stats: { hp: 7, mental: 10 } });
  passive.finishTerm();
  assert.deepEqual(passive.state.gradeNotes.stats, { hp: 1, mental: 1 });
});

test('minigames receive a current balance and cannot double-settle or create debt', () => {
  const game = fixture('walk', { phase: 'term', cash: 90_000 });
  const session = game.beginMinigame();
  assert.equal(session.balance, 90_000);
  assert.equal(game.beginMinigame(), null);
  assert.equal(game.nextTerm(), false);
  assert.equal(game.settleMinigame('wrong-id', 50_000), false);
  assert.equal(game.settleMinigame(session.id, 1.1), false);
  assert.equal(game.settleMinigame(session.id, -100_000), true);
  assert.equal(game.state.cash, 0);
  assert.equal(game.settleMinigame(session.id, 50_000), false);
  const second = game.beginMinigame();
  assert.notEqual(second.id, session.id);
  assert.equal(game.settleMinigame(second.id, 50_000), true);
  assert.equal(game.state.cash, 50_000);
});

test('event content always offers a fallback and references registered items, flags and events', () => {
  const ids = new Set(EVENTS.map(event => event.id));
  assert.equal(ids.size, EVENTS.length);
  const healthy = new AtlasGame();
  for (const event of EVENTS) {
    assert.ok(event.choices.length >= 2 && event.choices.length <= 4, event.id);
    assert.ok(event.choices.some(choice => !(choice.requires || choice.cash < 0 || choice.intensity === 'high')), event.id);
    for (const option of event.choices.flatMap(choice => [choice, choice.chance?.success, choice.chance?.failure]).filter(Boolean)) {
      for (const id of option.grant ?? []) assert.ok(EXPERIENCES[id], id);
      for (const id of Object.keys(option.items ?? {})) assert.ok(ITEMS[id], id);
      if (option.schedule) assert.ok(ids.has(option.schedule.id), option.schedule.id);
    }
    assert.ok(event.choices.some(choice => !healthy.choiceReasons(choice).length), event.id);
  }
});

test('eight terms offer their configured events, GPA, a shop and exactly one ending', () => {
  let seed = 49;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const game = new AtlasGame(null, random);
  const counts = [];
  while (game.state.phase !== 'ended') {
    if (game.state.phase === 'event') {
      const choices = game.event.choices.map((choice, index) => ({ choice, index })).filter(({ choice }) => !game.choiceReasons(choice).length);
      const value = choice => (choice.stats.hp ?? 0) * (game.state.stats.hp < 10 ? 4 : .45) + (choice.stats.intelligence ?? 0) + (choice.stats.mental ?? 0) * .35;
      choices.sort((a, b) => value(b.choice) - value(a.choice));
      play(game, choices[0].index);
    } else if (game.state.phase === 'result') {
      game.nextEvent();
    } else if (game.state.phase === 'career') {
      assert.equal(game.chooseCareer('ordinary'), true);
    } else {
      counts.push(game.state.termEvents.length);
      const calendar = TERM_CALENDAR[game.state.semester - 1];
      for (const [index, slot] of calendar.entries()) {
        if (typeof slot === 'string') assert.equal(game.state.termEvents[index], slot);
      }
      assert.deepEqual(game.state.termEvents.filter(id => ['ipselenti', 'koyeonjeon'].includes(id)),
        [game.state.semester % 2 ? 'ipselenti' : 'koyeonjeon']);
      assert.equal(new Set(game.state.termEvents).size, calendar.length);
      assert.ok(game.stock().includes('vitamins'));
      assert.equal(game.state.grades.length, game.state.semester);
      game.nextTerm();
    }
  }
  assert.deepEqual(counts, RULES.termEvents);
  assert.equal(game.state.history.length, counts.reduce((sum, count) => sum + count, 0));
  assert.ok(game.gpa >= 0 && game.gpa <= 4.5);
  assert.ok(Object.hasOwn(ENDINGS, game.state.ending.id));
  assert.equal(game.finish(), false);

  const finale = fixture('graduation', {
    phase: 'term', semester: 8, grades: Array(8).fill(4.35),
    stats: { hp: 17, intelligence: 19, social: 16, mental: 18 }, flags: ['reporter', 'published', 'seniorBond', 'lab', 'job'],
  });
  assert.equal(finale.nextTerm(), true);
  assert.equal(finale.state.phase, 'career');
  const restored = new AtlasGame(JSON.parse(JSON.stringify(finale.state)));
  assert.equal(restored.chooseCareer('toString'), false);
  assert.equal(restored.chooseCareer('corporate'), true);
  assert.equal(restored.state.ending.id, 'corporate');
  assert.equal(restored.chooseCareer('ordinary'), false);
  assert.ok(restored.state.ending.achievements.includes('editor'));
  assert.ok(restored.state.ending.achievements.includes('valedictorian'));
  assert.ok(restored.state.ending.achievements.includes('researcher'));
});

test('the calendar preserves past choices and does not repeat a festival already seen in an old save', () => {
  const played = ['orientation', 'ipselenti', 'parttime', 'registration', 'walk'];
  const oldSave = fixture('walk', {
    phase: 'result', termEvents: played, history: played.map(eventId => ({ eventId, semester: 1 })),
  }).state;
  const resumed = new AtlasGame(oldSave, () => .99);
  for (let slot = played.length; slot < RULES.termEvents[0]; slot++) {
    assert.equal(resumed.nextEvent(), true);
    assert.notEqual(resumed.event.id, 'ipselenti');
    play(resumed, resumed.event.choices.findLastIndex(choice => !resumed.choiceReasons(choice).length));
  }
  assert.deepEqual(resumed.state.termEvents.slice(0, played.length), played);
  assert.equal(resumed.event.id, 'finals');
  assert.equal(resumed.nextEvent(), true);
  assert.equal(resumed.state.phase, 'term');
  assert.equal(resumed.state.history.length, 9);
});

test('graduation choices can reach each basic and special ending and award the corresponding score', () => {
  const stats = { hp: 20, intelligence: 20, social: 20, mental: 20 };
  const base = { stats, cash: 3_000_000, flags: [], history: [] };
  const cases = [
    ['corporate', 'corporate', ['job']],
    ['grad_school', 'grad_school', []],
    ['startup', 'startup', []],
    ['ngo', 'ngo', []],
    ['traveler', 'traveler', []],
    ['employee', 'employee', []],
    ['rich_life', 'rich_life', []],
    ['ordinary', 'ordinary', []],
    ['grad_school', 'professor', ['lab', 'researchProposal']],
    ['corporate', 'top_graduate', ['job', 'internship']],
    ['campus_legend', 'campus_legend', ['cheerOt', 'koyeonjeon', 'ipselenti']],
  ];
  for (const [route, id, flags] of cases) {
    assert.equal(resolveEnding({ ...base, flags }, 4.5, route), id);
    assert.equal(endingScore(base, 4.5, id).total, ENDINGS[id].special ? 1000 : 970);
  }
  assert.equal(new Set([...cases.map(([, id]) => id), 'dropout']).size, Object.keys(ENDINGS).length);
  assert.equal(resolveEnding({ ...base, stats: { ...stats, hp: 0 } }, null, 'corporate'), 'dropout');
  assert.equal(endingScore({ ...base, cash: 0 }, null, 'dropout').total, 600);
  assert.equal(resolveEnding(base, 1.99, 'corporate'), 'ordinary');
  assert.equal(resolveEnding(base, 4.5, 'corporate'), 'employee');
  assert.equal(resolveEnding(base, 4.5, 'campus_legend'), 'ordinary');
  assert.equal(resolveEnding({ ...base, flags: ['lab'], history: [{ eventId: 'graduation', choice: '졸업생 연구 제안을 검토한다' }] }, 3.75, 'grad_school'), 'professor');
});

test('semester grades are rolled once, with higher intelligence improving the odds', () => {
  const rolls = Array.from({ length: 40 }, (_, index) => (index + .5) / 40);
  const results = intelligence => rolls.map(roll => {
    const game = fixture('night_review', { stats: { intelligence } }, () => roll);
    play(game, 0);
    assert.equal(game.state.grades.length, 0);
    assert.equal(Object.hasOwn(game.state.receipt, 'grade'), false);
    assert.equal(game.finishTerm(), true);
    assert.equal(game.finishTerm(), false);
    assert.equal(game.state.grades.length, 1);
    assert.equal(game.state.gradeNotes.intelligence, intelligence + 3);
    return game.state.grades[0];
  });
  const lower = results(10);
  const higher = results(15);
  assert.ok(higher.every((gpa, index) => gpa >= lower[index] && gpa <= RULES.maxGpa));
  assert.ok(lower.some(gpa => gpa >= 4) && lower.some(gpa => gpa < 4));
  assert.ok(higher.filter(gpa => gpa >= 4).length > lower.filter(gpa => gpa >= 4).length);
});

test('older choice grade adjustments are ignored and semester items still apply', () => {
  const reference = fixture('walk', { stats: { intelligence: 10 } });
  const oldSave = fixture('walk', {
    stats: { intelligence: 10 }, gradeImpact: 3,
    receipt: { grade: .18 },
  });
  const withNotes = fixture('walk', {
    stats: { intelligence: 10 }, boosts: { currentGpa: .5, nextGpa: 0, chance: 0 },
  });
  [reference, oldSave, withNotes].forEach(game => game.finishTerm());
  assert.deepEqual(oldSave.state.grades, reference.state.grades);
  assert.equal(withNotes.state.grades[0], reference.state.grades[0] + .5);
});

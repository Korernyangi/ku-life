import { EXPERIENCES, ITEMS, LEGACY_ENDINGS, RULES, STATS, STATUSES, TERM_CALENDAR, cashText } from './config.js';
import { CAREER_ROUTES, careerOptions, normalizeEnding, resolveEnding } from './endings.js';
import { findMajor } from './majors.js';
import { EVENTS } from './events.js';
import { CLAW_ATTEMPT_FEE, ROULETTE, clawBoard, clawHitRadius, clawPrize, rouletteCash } from './arcade.js';

const eventById = Object.fromEntries(EVENTS.map(event => [event.id, event]));
const recoveryEvents = EVENTS.filter(event => event.kind === 'crisis');
const endingEvents = EVENTS.filter(event => event.ending);
const termCount = RULES.termEvents.length;
const bounded = (value, low, high) => Math.min(high, Math.max(low, value));
const roundGpa = value => Math.round(bounded(value, 0, RULES.maxGpa) * 100) / 100;

function changesOf(before, after) {
  return Object.fromEntries(Object.keys(after)
    .filter(key => before[key] !== after[key]).map(key => [key, after[key] - before[key]]));
}

function sumChanges(base = {}, extra = {}) {
  const merged = { ...base };
  for (const [key, amount] of Object.entries(extra)) merged[key] = (merged[key] || 0) + amount;
  return merged;
}

function newState(majorId) {
  return {
    version: 1, id: globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
    majorId: findMajor(majorId)?.id ?? null,
    semester: 1, phase: 'event', stats: { ...RULES.startingStats }, cash: RULES.startingCash,
    streak: { mental: 0, critical: 0, both: 0 }, flags: [], inventory: {}, scheduled: [], history: [],
    grades: [], termEvents: [], eventId: null, receipt: null, gradeNotes: null,
    boosts: { currentGpa: 0, nextGpa: 0, chance: 0 }, ending: null, minigame: null, minigameCount: 0,
  };
}

export class AtlasGame {
  constructor(saved = null, random = Math.random, majorId = null) {
    this.random = random;
    this.state = saved ? structuredClone(saved) : newState(majorId);
    const session = this.state.minigame;
    this.state.clawWins ??= Number(Boolean(session?.kind === 'claw' && session.result?.item));
    this.state.ending = normalizeEnding(this.state.ending);
    if (session?.kind === 'claw' && !session.result) {
      for (const prize of session.prizes) prize.radius = clawHitRadius(ITEMS[prize.id].price);
    }
    if (!saved) {
      this.advanceEvent();
      return;
    }
    if (this.state.semester < termCount && ['event', 'result', 'term'].includes(this.state.phase)
      && this.state.flags.includes('dating') && this.state.eventId !== 'couple_dates'
      && !this.state.history.some(entry => entry.eventId === 'couple_dates')) {
      // Older saves can already be dating without a follow-up in the calendar.
      this.schedule({ id: 'couple_dates', after: 1 });
    }
    this.openEndingEvent();
  }

  get statuses() {
    return Object.keys(STATUSES).filter(id => STATUSES[id].active(this.state));
  }

  get gpa() {
    const { grades } = this.state;
    if (!grades.length) return null;
    return roundGpa(grades.reduce((total, grade) => total + grade, 0) / grades.length);
  }

  get event() { return eventById[this.state.eventId]; }

  get eventToken() {
    const { semester, termEvents, eventId } = this.state;
    return `${semester}:${termEvents.length}:${eventId}`;
  }

  conditionReasons(requirement = {}, statuses = this.statuses) {
    const { stats, cash, flags, inventory } = this.state;
    const reasons = [];
    for (const [key, min] of Object.entries(requirement.min ?? {})) {
      if (stats[key] < min) reasons.push(`${STATS[key].name} ${min} 이상 필요`);
    }
    for (const [key, max] of Object.entries(requirement.max ?? {})) {
      if (stats[key] > max) reasons.push(`${STATS[key].name} ${max} 이하에서 가능`);
    }
    if (requirement.cash > cash) reasons.push(`자금 ${cashText(requirement.cash)} 이상 필요`);
    if (requirement.gpa != null && (this.gpa ?? -1) < requirement.gpa) reasons.push(`누적 평점 ${requirement.gpa.toFixed(2)} 이상 필요`);
    if (requirement.maxGpa != null && (this.gpa ?? 0) > requirement.maxGpa) reasons.push('평점 조건 미충족');
    for (const id of requirement.flags ?? []) {
      if (!flags.includes(id)) reasons.push(`${EXPERIENCES[id]} 경험 필요`);
    }
    for (const id of requirement.items ?? []) {
      if (!inventory[id]) reasons.push(`${ITEMS[id].name} 보유 필요`);
    }
    if (requirement.anyStatuses && !requirement.anyStatuses.some(id => statuses.includes(id))) reasons.push('해당 상태에서만 가능');
    for (const id of requirement.excludeStatuses ?? []) {
      if (statuses.includes(id)) reasons.push(`${STATUSES[id].name} 상태에서 제한`);
    }
    if (requirement.any && !requirement.any.some(rule => !this.conditionReasons(rule, statuses).length)) reasons.push('등장 조건 미충족');
    return reasons;
  }

  choiceReasons(choice) {
    const statuses = this.statuses;
    const reasons = this.conditionReasons(choice.requires, statuses);
    const price = Math.max(0, -(choice.cash ?? 0), -(choice.cash ?? 0) - (choice.chance?.success?.cash ?? 0),
      -(choice.cash ?? 0) - (choice.chance?.failure?.cash ?? 0));
    if (price > this.state.cash) reasons.push(`자금 ${cashText(price)} 이상 필요`);
    if (choice.intensity === 'high') {
      for (const id of ['exhaustion', 'lethargy', 'depression']) {
        if (statuses.includes(id)) reasons.push(`${STATUSES[id].name} 상태에서 고강도 활동 제한`);
      }
    }
    return [...new Set(reasons)];
  }

  eligible(event) {
    const { semester, termEvents, history, scheduled } = this.state;
    return event && (!event.terms || event.terms.includes(semester))
      && !termEvents.includes(event.id)
      && !scheduled.some(entry => entry.id === event.id && entry.semester > semester)
      && (event.repeat || event.kind === 'fixed' || !history.some(entry => entry.eventId === event.id))
      && !this.conditionReasons(event.requires).length
      && event.choices.some(choice => !this.choiceReasons(choice).length);
  }

  scheduledEvent() {
    const { scheduled, semester } = this.state;
    return scheduled.filter(entry => entry.semester <= semester)
      .sort((first, second) => first.semester - second.semester)
      .map(entry => eventById[entry.id])
      .find(event => this.eligible(event));
  }

  advanceEvent() {
    const s = this.state;
    if (s.stats.hp === 0) return this.finish();
    if (this.openEndingEvent()) return true;
    const calendar = TERM_CALENDAR[s.semester - 1];
    if (s.termEvents.length >= calendar.length) return this.finishTerm();

    const slot = calendar[s.termEvents.length];
    let next;
    if (typeof slot === 'string') {
      next = eventById[slot];
    } else if (slot.followUp) {
      next = this.scheduledEvent() ?? eventById[slot.followUp];
    } else {
      const recovery = s.termEvents.some(id => eventById[id].kind === 'crisis')
        ? undefined : recoveryEvents.find(event => this.eligible(event));
      next = recovery ?? this.scheduledEvent() ?? slot.support.map(id => eventById[id]).find(event => this.eligible(event));
    }

    // A save made before the calendar may already contain an event assigned to a later slot.
    if (!next || !this.eligible(next)) {
      next = ['quiet_day', 'walk', 'parttime', 'reading_room'].filter(id => !calendar.includes(id))
        .map(id => eventById[id]).find(event => this.eligible(event)) ?? eventById.quiet_day;
    }

    return this.openEvent(next);
  }

  openEndingEvent() {
    const s = this.state;
    if (s.phase === 'ended' || s.minigame || s.stats.hp <= 0 || this.event?.ending) return false;
    const event = endingEvents.find(candidate => (!candidate.endingTrigger || candidate.endingTrigger(s)) && this.eligible(candidate));
    return event ? this.openEvent(event) : false;
  }

  openEvent(next) {
    const s = this.state;
    s.scheduled = s.scheduled.filter(entry => entry.id !== next.id);
    s.termEvents.push(next.id);
    s.eventId = next.id;
    s.receipt = null;
    s.phase = 'event';
    return true;
  }

  schedule({ id, after }) {
    const { semester, scheduled } = this.state;
    if (semester + after > termCount || scheduled.some(entry => entry.id === id)) return;
    this.state.scheduled.push({ id, semester: semester + after });
  }

  changeStats(changes) {
    const { stats } = this.state;
    for (const [key, delta] of Object.entries(changes)) {
      if (Object.hasOwn(stats, key)) stats[key] = bounded(stats[key] + Math.round(delta), RULES.statMin, RULES.statMax);
    }
  }

  changeCash(delta) {
    const next = this.state.cash + delta;
    if (!Number.isSafeInteger(delta) || !Number.isSafeInteger(next)) return false;
    this.state.cash = Math.max(0, next);
    return true;
  }

  resetMentalStreak() {
    this.state.streak = { mental: 0, critical: 0, both: 0 };
  }

  updateStreak(tick) {
    const { stats, streak } = this.state;
    const low = stats.mental <= RULES.lowMental;
    const combined = low && stats.hp <= RULES.lowHealth;
    const critical = stats.mental <= RULES.criticalMental;
    const interval = Number(tick);
    streak.mental = low ? streak.mental + interval : 0;
    streak.critical = critical ? streak.critical + interval : 0;
    streak.both = combined ? streak.both + interval : 0;
  }

  itemEffect(key) {
    return Object.keys(this.state.inventory).reduce((sum, id) => {
      return sum + (this.state.inventory[id] ? ITEMS[id][key] ?? 0 : 0);
    }, 0);
  }

  updateInventory(id, amount) {
    if (!ITEMS[id]) return 0;
    const before = this.state.inventory[id] ?? 0;
    const next = Math.max(0, before + amount);
    const count = ITEMS[id].type === 'consumable' ? next : Math.min(next, 1);
    if (count) this.state.inventory[id] = count;
    else delete this.state.inventory[id];
    return count - before;
  }

  selectOutcome(choice, statuses) {
    const { stats, boosts, inventory } = this.state;
    if (!choice.chance) return { effect: {}, chance: null };
    const { base, weights, gpaWeight = 0, itemBonus = {}, success, failure } = choice.chance;
    const statBonus = Object.entries(weights ?? {}).reduce((sum, [key, weight]) => sum + stats[key] * weight, 0);
    const gearBonus = Object.entries(itemBonus).reduce((sum, [item, weight]) => sum + (inventory[item] ? weight : 0), 0);
    const statusPenalty = statuses.includes('burnout') || statuses.includes('depression') ? .15
      : statuses.includes('slump') || statuses.includes('overwork') ? .08 : 0;
    const probability = bounded(base + statBonus + gearBonus + gpaWeight * (this.gpa ?? 0) + boosts.chance - statusPenalty, .03, .95);
    boosts.chance = 0;
    const won = this.random() < probability;
    return { effect: won ? success : failure, chance: { won, probability } };
  }

  eventStats(event, choice, effect, statuses) {
    const bracket = choice.brackets?.find(requirement => !this.conditionReasons(requirement, statuses).length);
    const delta = sumChanges(sumChanges(choice.stats, bracket?.stats), effect.stats);
    if (delta.hp < 0 && event.kind !== 'crisis') {
      if (statuses.includes('overwork')) delta.hp -= RULES.staminaPenalty;
      if (event.study) delta.hp = Math.min(0, delta.hp + this.itemEffect('studyProtection'));
    }
    if (delta.intelligence > 0 && event.kind !== 'crisis') {
      if (event.study) delta.intelligence += this.itemEffect('studyGain');
      if (statuses.includes('slump')) delta.intelligence -= RULES.slumpPenalty;
      if (event.study && statuses.includes('burnout')) delta.intelligence = Math.max(0, delta.intelligence - RULES.burnoutPenalty);
    }
    if (['campus', 'special'].includes(event.kind) && delta.social > 0) delta.social += this.itemEffect('campusGain');
    return delta;
  }

  choose(index, token) {
    const s = this.state;
    if (s.phase !== 'event' || token !== this.eventToken) return false;
    const event = this.event;
    const choice = event?.choices[index];
    if (!choice || this.choiceReasons(choice).length) return false;

    s.phase = 'result';
    const oldStats = { ...s.stats };
    const oldStatuses = this.statuses;
    const oldCash = s.cash;
    const receipt = { semester: s.semester, eventId: event.id, title: event.title, choice: choice.text,
      message: choice.message, stats: {}, cash: 0, items: {}, flags: [], gained: [], cleared: [], chance: null };
    s.receipt = receipt;
    s.history.push(receipt);

    const { effect, chance } = this.selectOutcome(choice, oldStatuses);
    receipt.message = effect.message ?? choice.message;
    receipt.chance = chance;
    this.changeStats(this.eventStats(event, choice, effect, oldStatuses));
    receipt.stats = changesOf(oldStats, s.stats);

    if (s.stats.hp === 0) {
      this.finish();
      return true;
    }

    this.changeCash((choice.cash ?? 0) + (effect.cash ?? 0));
    receipt.cash = s.cash - oldCash;
    receipt.items = Object.fromEntries(Object.entries(sumChanges(choice.items, effect.items))
      .map(([id, amount]) => [id, this.updateInventory(id, amount)]).filter(([, amount]) => amount));
    receipt.flags = [...new Set([...(choice.grant ?? []), ...(effect.grant ?? [])])].filter(id => !s.flags.includes(id));
    s.flags.push(...receipt.flags);
    for (const delayed of [choice.schedule, effect.schedule]) {
      if (delayed) this.schedule(delayed);
    }
    if (choice.resetMental || effect.resetMental) this.resetMentalStreak();
    this.updateStreak(true);
    const statuses = this.statuses;
    receipt.gained = statuses.filter(id => !oldStatuses.includes(id));
    receipt.cleared = oldStatuses.filter(id => !statuses.includes(id));
    if (event.ending) this.finish(null, event.ending);
    else this.openEndingEvent();
    return true;
  }

  nextEvent() {
    if (this.state.phase !== 'result') return false;
    return this.advanceEvent();
  }

  finishTerm() {
    const s = this.state;
    if (s.grades.length >= s.semester) return false;

    const { hp, intelligence, mental } = s.stats;
    const grading = RULES.semesterGrade;
    const conditionPenalty = (hp <= RULES.lowHealth ? grading.lowHealthPenalty : 0)
      + (mental <= RULES.lowMental ? grading.lowMentalPenalty : 0)
      + (this.statuses.includes('burnout') ? grading.burnoutPenalty : 0);
    const aptitude = (intelligence * grading.intelligence + hp * grading.hp + mental * grading.mental) / RULES.statMax;
    const roll = (this.random() - .5) * grading.variation;
    const gpa = roundGpa(grading.base + aptitude + roll + s.boosts.currentGpa - conditionPenalty);
    s.grades.push(gpa);
    const oldStats = { ...s.stats };
    for (const [id, count] of Object.entries(s.inventory)) {
      if (count && ITEMS[id].termStats) this.changeStats(ITEMS[id].termStats);
    }
    this.updateStreak(false);
    s.gradeNotes = { stats: changesOf(oldStats, s.stats), intelligence, bonus: s.boosts.currentGpa, penalty: conditionPenalty };
    s.phase = 'term';
    s.eventId = null;
    return true;
  }

  nextTerm() {
    const s = this.state;
    if (s.phase !== 'term' || s.minigame) return false;
    if (s.semester === termCount) {
      if (this.gpa < RULES.graduationGpa) return this.finish();
      s.phase = 'career';
      return true;
    }
    s.semester++;
    s.termEvents = [];
    s.boosts.currentGpa = s.boosts.nextGpa;
    s.boosts.nextGpa = 0;
    return this.advanceEvent();
  }

  stock() {
    const { semester } = this.state;
    return Object.keys(ITEMS).filter(id => (ITEMS[id].first ?? 1) <= semester);
  }

  buyReason(id) {
    const item = ITEMS[id];
    if (!item || this.state.phase !== 'term' || this.state.minigame || !this.stock().includes(id)) return '구매할 수 없는 상품입니다.';
    if (item.future && this.state.semester === termCount) return '이후 학기에 효과가 적용됩니다.';
    if (item.type !== 'consumable' && this.state.inventory[id]) return '이미 보유 중입니다.';
    if (this.state.cash < item.price) return '보유 자금이 부족합니다.';
    return '';
  }

  buy(id) {
    if (this.buyReason(id)) return false;
    this.changeCash(-ITEMS[id].price);
    this.updateInventory(id, 1);
    return true;
  }

  useReason(id) {
    const s = this.state;
    const item = ITEMS[id];
    if (!item || item.type !== 'consumable' || !s.inventory[id]) return '사용할 수 없는 아이템입니다.';
    if (!['event', 'term'].includes(s.phase) || s.minigame || this.event?.ending) return '현재 단계에서는 사용할 수 없습니다.';
    if (item.future && s.semester === termCount) return '다음 학기가 없습니다.';
    if (item.nextGpa && s.boosts.nextGpa) return '다음 학기에 적용할 족보가 이미 있습니다.';
    if (item.nextChance && s.boosts.chance) return '아직 사용하지 않은 부적 효과가 있습니다.';
    if (item.stats && !item.resetMental && Object.keys(item.stats).every(key => s.stats[key] >= RULES.statMax)) return '이미 최대 수치입니다.';
    return '';
  }

  use(id) {
    if (this.useReason(id)) return false;
    const { stats, nextGpa, nextChance, resetMental } = ITEMS[id];
    if (stats) this.changeStats(stats);
    if (nextGpa) this.state.boosts.nextGpa = nextGpa;
    if (nextChance) this.state.boosts.chance = nextChance;
    if (resetMental) this.resetMentalStreak();
    this.updateInventory(id, -1);
    this.updateStreak(false);
    return true;
  }

  beginMinigame() {
    const s = this.state;
    if (s.phase !== 'term' || s.minigame) return null;
    s.minigameCount = (s.minigameCount ?? 0) + 1;
    s.minigame = { id: `${s.id}:${s.minigameCount}`, balance: s.cash };
    return { ...s.minigame };
  }

  settleMinigame(id, cashDelta) {
    const s = this.state;
    if (s.phase !== 'term' || !s.minigame || s.minigame.kind || s.minigame.id !== id || !this.changeCash(cashDelta)) return false;
    s.minigame = null;
    this.openEndingEvent();
    return true;
  }

  get arcadePlayed() {
    return this.state.arcadeTerm === this.state.semester;
  }

  arcadePrizes() {
    const { semester, inventory } = this.state;
    return clawBoard(this.stock().filter(id => {
      const item = ITEMS[id];
      return !(item.future && semester === termCount) && (item.type === 'consumable' || !inventory[id]);
    }), ITEMS, semester);
  }

  beginArcade(kind) {
    const { cash } = this.state;
    if (this.arcadePlayed || !['roulette', 'claw'].includes(kind)) return false;
    if (kind === 'claw' && cash < CLAW_ATTEMPT_FEE) return false;
    if (!this.beginMinigame()) return false;
    const session = this.state.minigame;
    session.kind = kind;
    if (kind === 'claw') session.prizes = this.arcadePrizes();
    return true;
  }

  spinRoulette() {
    const s = this.state;
    const session = s.minigame;
    if (s.phase !== 'term' || session?.kind !== 'roulette' || this.arcadePlayed) return false;
    const index = Math.floor(this.random() * ROULETTE.length);
    const percent = ROULETTE[index];
    const cash = rouletteCash(session.balance, percent);
    if (!this.changeCash(cash)) return false;
    session.result = { index, percent, cash };
    s.arcadeTerm = s.semester;
    return true;
  }

  aimClaw(position) {
    const s = this.state;
    const session = s.minigame;
    if (s.phase !== 'term' || session?.kind !== 'claw' || this.arcadePlayed || !Number.isFinite(position) || position < 0 || position > 100) return false;
    if (s.cash < CLAW_ATTEMPT_FEE) return false;
    if (session.x == null) {
      session.x = position;
      return true;
    }
    const item = clawPrize(session.prizes, session.x, position);
    if (!this.changeCash(-CLAW_ATTEMPT_FEE)) return false;
    if (item) {
      this.updateInventory(item, 1);
      s.clawWins++;
    }
    session.result = { item, y: position, fee: CLAW_ATTEMPT_FEE };
    s.arcadeTerm = s.semester;
    return true;
  }

  closeArcade() {
    const s = this.state;
    if (s.phase !== 'term' || !s.minigame?.kind) return false;
    s.minigame = null;
    this.openEndingEvent();
    return true;
  }

  chooseCareer(route, endingId = null) {
    if (this.state.phase !== 'career' || !Object.hasOwn(CAREER_ROUTES, route)) return false;
    if (endingId && !careerOptions(this.state, this.gpa).some(option =>
      option.id === endingId && option.route === route && !option.reasons.length)) return false;
    return this.finish(route, endingId);
  }

  finish(route = null, endingId = null) {
    const s = this.state;
    if (s.phase === 'ended') return false;
    const id = endingId ?? resolveEnding(s, this.gpa, route);
    const achievements = id === 'dropout' ? [] : LEGACY_ENDINGS
      .filter(ending => !['dropout', 'no_graduation', 'isolated', 'job_seeker'].includes(ending.id) && !this.conditionReasons(ending).length)
      .map(ending => ending.id);
    s.ending = { id, route, achievements };
    s.phase = 'ended';
    return true;
  }
}

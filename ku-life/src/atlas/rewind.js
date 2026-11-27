import { RULES } from './config.js';
import { CAREER_ROUTES } from './endings.js';

export function recordSemesterStart(state) {
  const { semester, phase, termEvents, history, rewindCheckpoints = {}, ...rest } = state;
  if (phase !== 'event' || termEvents.length !== 1 || Object.hasOwn(rewindCheckpoints, semester)
    || history.at(-1)?.semester >= semester) return;
  const checkpoint = structuredClone({ ...rest, semester, phase, termEvents });
  state.rewindCheckpoints = { ...rewindCheckpoints, [semester]: { state: checkpoint, historyLength: history.length } };
}

export function availableRewindSemesters(state) {
  if (state?.phase !== 'ended') return [];
  return RULES.termEvents.flatMap((_, index) => {
    const semester = index + 1;
    const checkpoint = state.rewindCheckpoints?.[semester];
    return checkpoint?.state?.id === state.id && checkpoint.state.semester === semester
      && Number.isInteger(checkpoint.historyLength) && checkpoint.historyLength >= 0
      && checkpoint.historyLength <= state.history.length ? [semester] : [];
  });
}

export function rewindStateAt(source, semester) {
  if (!availableRewindSemesters(source).includes(semester)) return null;
  const checkpoint = source.rewindCheckpoints[semester];
  return structuredClone({ ...checkpoint.state, history: source.history.slice(0, checkpoint.historyLength) });
}

export function firstChangedChoice(source, branch) {
  const end = Math.max(source.history.length, branch.history.length);
  for (let index = 0; index < end; index++) {
    const before = source.history[index];
    const after = branch.history[index];
    if (before?.semester !== after?.semester || before?.eventId !== after?.eventId || before?.choice !== after?.choice) {
      return { semester: after?.semester ?? before.semester, before, after };
    }
  }
  const before = source.ending?.route;
  const after = branch.ending?.route;
  if (before !== after) {
    const receipt = route => route ? { title: '졸업 진로 선택', choice: CAREER_ROUTES[route] } : null;
    return { semester: branch.semester, before: receipt(before), after: receipt(after) };
  }
  return null;
}

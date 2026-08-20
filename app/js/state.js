const KEY = 'tsquiz.v1';
const DEFAULTS = { attemptsUsed: 0, lastScore: null, answers: [], inProgress: false };

export function createState(storage) {
  let data = load();

  function load() {
    try {
      const parsed = { ...DEFAULTS, ...JSON.parse(storage.getItem(KEY) || '{}') };
      if (!Array.isArray(parsed.answers)) parsed.answers = [];
      return parsed;
    }
    catch { return { ...DEFAULTS }; }
  }
  function save() {
    try { storage.setItem(KEY, JSON.stringify(data)); }
    catch { /* storage недоступен — доигрываем из памяти */ }
  }

  return {
    get: () => ({ ...data, answers: [...data.answers] }),
    startAttempt() { data.inProgress = true; data.answers = []; save(); },
    saveAnswer(qIndex, optIndex) { data.answers[qIndex] = optIndex; save(); },
    finishAttempt(score) { data.inProgress = false; data.attemptsUsed += 1; data.lastScore = score; save(); },
    reset() { data = { ...DEFAULTS }; storage.removeItem(KEY); },
  };
}

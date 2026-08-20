export function score(answers, correct) {
  return correct.reduce((n, c, i) => n + (answers[i] === c ? 1 : 0), 0);
}

export function band(score) {
  if (score <= 5) return 'red';
  if (score <= 8) return 'yellow';
  return 'green';
}

const RETRIES = { red: 1, yellow: 2, green: 0 };
export function retriesAllowed(b) { return RETRIES[b]; }

export function retriesLeft(s, attemptsUsed) {
  return Math.max(0, retriesAllowed(band(s)) - (attemptsUsed - 1));
}

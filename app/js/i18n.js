// Тексты — канон из финального дока (2026-08-17). Язык — только английский (решение клиента).
export const UI = {
  introLines: 'The search for the Coordinator has led us to a new location.\nHis trail ends here, but we’ve managed to find someone who may have information about his movements. Before we can proceed, you need to prove that you are truly an agent of the Community.\nYatoro has prepared a 10-question test for you. Your result will determine whether you’re ready to continue the search.',
  start: 'Start the test',
  retry: 'Try again',
  noRetries: 'No retries left',
  resultTitle: 'Your result',
  // Тексты бандов — первое предложение из дока. Фраза про попытки вынесена
  // в attemptsRed/attemptsYellow: в доке она захардкожена под первую попытку
  // («one more attempt», «two more attempts») и на втором заходе противоречила
  // счётчику ретраев. Теперь число берётся из retriesLeft, а когда ретраев
  // не осталось — предложения нет вовсе.
  resultTextRed: 'That’s not enough to gain access to the information.',
  attemptsRed: 'You have {a} to prove that you’re not here by accident.',
  resultTextYellow: 'Your identity has been confirmed. However, a few of your answers raise questions about your readiness.',
  attemptsYellow: 'You have {a} to improve your result.',
  resultTextGreen: 'The test is complete. There’s no doubt. You are an agent of the Community.\nYou now have full access to the information Yatoro has.',
  adminReset: 'Reset quiz',
  questionOf: 'Question {i} of {n}',
};

export function t(key, vars = {}) {
  let s = UI[key] ?? key;
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}

// «one more attempt» / «two more attempts» — словом, как в доке; дальше цифрой.
const NUM_WORDS = { 1: 'one', 2: 'two', 3: 'three' };
function attemptsPhrase(n) {
  return `${NUM_WORDS[n] ?? n} more ${n === 1 ? 'attempt' : 'attempts'}`;
}

// Текст на «бумаге» результата: предложение банда + фраза про оставшиеся
// попытки, если они есть. Абзацы разделяются \n (см. renderParagraphs).
export function resultBody(b, left) {
  const bandText = t({ red: 'resultTextRed', yellow: 'resultTextYellow', green: 'resultTextGreen' }[b]);
  if (b === 'green' || left <= 0) return bandText;
  const attemptsKey = { red: 'attemptsRed', yellow: 'attemptsYellow' }[b];
  return `${bandText}\n${t(attemptsKey, { a: attemptsPhrase(left) })}`;
}

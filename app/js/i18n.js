// Тексты — канон из финального дока (2026-08-17). Язык — только английский (решение клиента).
export const UI = {
  introLines: 'The search for the Coordinator has led us to a new location.\nHis trail ends here, but we’ve managed to find someone who may have information about his movements. Before we can proceed, you need to prove that you are truly an agent of the Community.\nYatoro has prepared a 10-question test for you. Your result will determine whether you’re ready to continue the search.',
  start: 'Start the test',
  retry: 'Try again',
  retriesLeftOne: '1 retry left',
  retriesLeftMany: 'Retries left: {n}',
  noRetries: 'No retries left',
  resultTitle: 'Your result',
  resultTextRed: 'That’s not enough to gain access to the information.\nYou have one more attempt to prove that you’re not here by accident.',
  resultTextYellow: 'Your identity has been confirmed. However, a few of your answers raise questions about your readiness.\nYou have two more attempts to improve your result.',
  resultTextGreen: 'The test is complete. There’s no doubt. You are an agent of the Community.\nYou now have full access to the information Yatoro has.',
  adminReset: 'Reset quiz',
  questionOf: 'Question {i} of {n}',
};

export function t(key, vars = {}) {
  let s = UI[key] ?? key;
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}

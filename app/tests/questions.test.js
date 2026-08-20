import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS } from '../data/questions.js';
import { UI, t, resultBody } from '../js/i18n.js';

test('10 questions, each with 4 options and valid correct index', () => {
  assert.equal(QUESTIONS.length, 10);
  for (const q of QUESTIONS) {
    assert.equal(q.options.length, 4, q.id);
    assert.ok(q.correct >= 0 && q.correct <= 3, q.id);
    assert.ok(typeof q.text === 'string' && q.text.length > 0, q.id);
    for (const o of q.options) {
      if (typeof o === 'string') assert.ok(o.length > 0, q.id);
      else assert.ok(o.label && o.img, q.id);
    }
  }
});

test('answers match the final doc (bold marks, 2026-08-17)', () => {
  const expected = { q1: 0, q2: 0, q3: 3, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0, q10: 2 };
  for (const q of QUESTIONS) assert.equal(q.correct, expected[q.id], q.id);
});

test('q5 options are all images', () => {
  const q5 = QUESTIONS.find(q => q.id === 'q5');
  for (const o of q5.options) assert.match(o.img, /^assets\/img\/logo-.+\.png$/);
});

test('UI strings: required keys exist, t interpolates vars', () => {
  for (const key of ['introLines', 'start', 'retry', 'noRetries', 'resultTitle',
    'resultTextRed', 'resultTextYellow', 'resultTextGreen',
    'adminReset', 'questionOf']) {
    assert.ok(UI[key], key);
  }
  assert.equal(t('questionOf', { i: 3, n: 10 }), 'Question 3 of 10');
  assert.equal(t('missing-key'), 'missing-key');
});

test('result body: the attempts sentence matches the retries actually left', () => {
  // первая попытка — формулировки канона из клиентского дока
  assert.match(resultBody('red', 1), /You have one more attempt to prove that you’re not here by accident\.$/);
  assert.match(resultBody('yellow', 2), /You have two more attempts to improve your result\.$/);

  // ретраи ещё есть, но меньше — число подстраивается, а не врёт про «two»
  assert.match(resultBody('yellow', 1), /You have one more attempt to improve your result\.$/);

  // ретраев не осталось — предложения про попытки нет вовсе
  assert.doesNotMatch(resultBody('red', 0), /attempt/);
  assert.doesNotMatch(resultBody('yellow', 0), /attempt/);

  // зелёный — конечный экран, про попытки не говорим никогда
  assert.doesNotMatch(resultBody('green', 0), /attempt/);

  // первое предложение банда на месте во всех случаях
  for (const [b, left] of [['red', 1], ['red', 0], ['yellow', 2], ['yellow', 0], ['green', 0]]) {
    assert.ok(resultBody(b, left).startsWith(UI[{ red: 'resultTextRed', yellow: 'resultTextYellow', green: 'resultTextGreen' }[b]]), `${b}/${left}`);
  }
});

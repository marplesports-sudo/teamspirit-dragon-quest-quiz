import { test } from 'node:test';
import assert from 'node:assert/strict';
import { score, band, retriesAllowed, retriesLeft } from '../js/quiz-logic.js';

test('score counts matching indices', () => {
  assert.equal(score([0, 1, 2], [0, 1, 3]), 2);
  assert.equal(score([], []), 0);
  assert.equal(score([1, null, 2], [1, 0, 2]), 2); // пропущенный вопрос не совпадает
});

test('band thresholds', () => {
  assert.equal(band(0), 'red');
  assert.equal(band(5), 'red');
  assert.equal(band(6), 'yellow');
  assert.equal(band(8), 'yellow');
  assert.equal(band(9), 'green');
  assert.equal(band(10), 'green');
});

test('retriesAllowed per band', () => {
  assert.equal(retriesAllowed('red'), 1);
  assert.equal(retriesAllowed('yellow'), 2);
  assert.equal(retriesAllowed('green'), 0);
});

test('retriesLeft caps by attempts used', () => {
  assert.equal(retriesLeft(4, 1), 1);  // red, первая попытка → 1 ретрай
  assert.equal(retriesLeft(7, 2), 1);  // yellow после 2-й попытки → ещё 1
  assert.equal(retriesLeft(7, 3), 0);  // yellow после 3-й → всё
  assert.equal(retriesLeft(10, 1), 0); // green → нет ретраев
  assert.equal(retriesLeft(3, 5), 0);  // не уходит в минус
});

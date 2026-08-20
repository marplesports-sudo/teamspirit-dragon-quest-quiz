import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RESET_PIN, isResetPin } from '../js/config.js';

test('reset pin', () => {
  assert.equal(RESET_PIN, '2021');

  assert.ok(isResetPin('2021'));
  assert.ok(isResetPin(' 2021 '), 'пробелы по краям не должны мешать проверяющему');
  assert.ok(isResetPin(2021), 'число из input.valueAsNumber тоже проходит');

  assert.equal(isResetPin('2020'), false);
  assert.equal(isResetPin('20211'), false);
  assert.equal(isResetPin(''), false, 'пустое поле не открывает сброс');
  assert.equal(isResetPin(null), false);
  assert.equal(isResetPin(undefined), false);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState } from '../js/state.js';

function memStorage() {
  const m = new Map();
  return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) };
}

test('fresh state defaults', () => {
  const s = createState(memStorage());
  assert.deepEqual(s.get(), { attemptsUsed: 0, lastScore: null, answers: [], inProgress: false });
});

test('attempt lifecycle persists through storage', () => {
  const storage = memStorage();
  const s = createState(storage);
  s.startAttempt();
  s.saveAnswer(0, 2);
  s.finishAttempt(7);
  const reloaded = createState(storage).get();
  assert.equal(reloaded.attemptsUsed, 1);
  assert.equal(reloaded.lastScore, 7);
  assert.equal(reloaded.inProgress, false);
});

test('reset clears everything', () => {
  const storage = memStorage();
  const s = createState(storage);
  s.startAttempt();
  s.finishAttempt(3);
  s.reset();
  assert.deepEqual(s.get(), { attemptsUsed: 0, lastScore: null, answers: [], inProgress: false });
});

test('corrupt storage falls back to defaults', () => {
  const storage = memStorage();
  storage.setItem('tsquiz.v1', '{broken json');
  const s = createState(storage);
  assert.equal(s.get().attemptsUsed, 0);
});

test('non-array answers in storage falls back to empty array', () => {
  const storage = memStorage();
  storage.setItem('tsquiz.v1', JSON.stringify({ answers: 0, attemptsUsed: 1 }));
  const s = createState(storage);
  assert.deepEqual(s.get().answers, []);
  assert.equal(s.get().attemptsUsed, 1);
});

test('setItem throwing does not break the attempt flow', () => {
  const s = createState({ getItem: () => null, setItem: () => { throw new Error('quota'); }, removeItem: () => {} });
  s.startAttempt();
  s.saveAnswer(0, 2);
  s.finishAttempt(9);
  assert.equal(s.get().lastScore, 9);
});

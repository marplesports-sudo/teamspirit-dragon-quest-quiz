import { score, band, retriesLeft } from './quiz-logic.js';
import { createState } from './state.js';
import { QUESTIONS } from '../data/questions.js';
import { t, resultBody } from './i18n.js';
import { isResetPin } from './config.js';

// localStorage может быть недоступен (приватный режим, киоск-профили) — тогда играем из памяти
function safeStorage() {
  try {
    const probe = '__tsquiz_probe';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    const m = new Map();
    return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) };
  }
}
const state = createState(safeStorage());
const $ = id => document.getElementById(id);
let qIndex = 0;
let answers = [];
let inputLocked = false;

// многострочные тексты сценария рендерим абзацами (без innerHTML)
function renderParagraphs(el, text) {
  el.textContent = '';
  for (const line of text.split('\n')) {
    const p = document.createElement('p');
    p.textContent = line;
    el.appendChild(p);
  }
}

function show(screenId) {
  for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== screenId;
}

function renderIntro() {
  renderParagraphs($('intro-text'), t('introLines'));
  $('btn-start').textContent = t('start');
  const v = $('intro-video');
  fetch(v.getAttribute('src'), { method: 'HEAD' })
    .then(r => { v.hidden = !r.ok; })
    .catch(() => { v.hidden = true; });
  show('screen-intro');
}

function renderQuestion() {
  const q = QUESTIONS[qIndex];
  $('quiz-progress').textContent = t('questionOf', { i: qIndex + 1, n: QUESTIONS.length });
  $('quiz-question').textContent = q.text;
  const box = $('quiz-options');
  box.innerHTML = '';
  box.classList.toggle('options-grid', q.options.some(o => typeof o === 'object' && o.img));
  // в исходном доке почти все правильные ответы — вариант «a», поэтому перемешиваем порядок показа;
  // в answers сохраняется исходный индекс варианта
  const shuffled = q.options
    .map((opt, i) => ({ opt, i, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort);
  shuffled.forEach(({ opt, i }) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    if (typeof opt === 'object' && opt.img) {
      btn.classList.add('option-img');
      const img = document.createElement('img');
      img.src = opt.img;
      img.alt = opt.label;
      btn.appendChild(img);
    } else {
      btn.textContent = typeof opt === 'string' ? opt : opt.label;
    }
    btn.addEventListener('click', () => {
      if (inputLocked) return; // защита от двойного тапа: второй клик пришёлся бы на следующий вопрос
      inputLocked = true;
      setTimeout(() => { inputLocked = false; }, 300);
      answers[qIndex] = i;
      state.saveAnswer(qIndex, i);
      if (qIndex + 1 < QUESTIONS.length) { qIndex++; renderQuestion(); }
      else { finish(); }
    });
    box.appendChild(btn);
  });
  show('screen-quiz');
}

function finish() {
  const s = score(answers, QUESTIONS.map(q => q.correct));
  state.finishAttempt(s);
  renderResult();
}

function renderResult() {
  const { lastScore, attemptsUsed } = state.get();
  const b = band(lastScore);
  const left = retriesLeft(lastScore, attemptsUsed);
  $('result-title').textContent = t('resultTitle');
  $('result-score').textContent = `${lastScore}/${QUESTIONS.length}`;
  $('result-score').dataset.band = b;
  renderParagraphs($('result-text'), resultBody(b, left));
  // счётчик под бумагой — только когда попыток не осталось: при left > 0
  // число уже названо в самом тексте результата, дублировать незачем
  $('result-retries').textContent = b !== 'green' && left === 0 ? t('noRetries') : '';
  $('btn-retry').hidden = b === 'green' || left === 0;
  $('btn-retry').textContent = t('retry');
  show('screen-result');
}

function startAttempt() { qIndex = 0; answers = []; state.startAttempt(); renderQuestion(); }
$('btn-start').addEventListener('click', startAttempt);
$('btn-retry').addEventListener('click', startAttempt);

// Сброс под пином — виден на всех экранах, чтобы проверяющий мог обнулить квиз
// и когда гость упёрся в «No retries left», и когда бросил тест на середине.
function setupReset() {
  const toggle = $('btn-reset'), form = $('reset-pin'), input = $('reset-pin-input'), error = $('reset-pin-error');
  toggle.textContent = t('resetToggle');
  $('reset-pin-label').textContent = t('resetPinLabel');
  input.setAttribute('aria-label', t('resetPinLabel'));
  $('btn-reset-submit').textContent = t('resetPinSubmit');

  function close() {
    form.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    input.value = '';
    error.textContent = '';
  }

  toggle.addEventListener('click', () => {
    if (form.hidden) {
      form.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      input.focus();
    } else close();
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!isResetPin(input.value)) {
      error.textContent = t('resetPinWrong');
      input.value = '';
      input.focus();
      return;
    }
    state.reset();
    location.reload();
  });

  form.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); toggle.focus(); } });
}
setupReset();

if (new URLSearchParams(location.search).has('admin')) {
  $('admin-bar').hidden = false;
  $('btn-admin-reset').textContent = t('adminReset');
  $('btn-admin-reset').addEventListener('click', () => { state.reset(); location.reload(); });
}

function route() {
  const { lastScore, inProgress, answers: saved } = state.get();
  if (inProgress && saved.length > 0 && saved.length < QUESTIONS.length) {
    // refresh посреди квиза — продолжаем с текущего вопроса
    answers = [...saved];
    qIndex = saved.length;
    renderQuestion();
  } else if (inProgress || lastScore === null) {
    renderIntro();
  } else {
    renderResult();
  }
}
route();

import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from '../dist/catalog.js';
import { createState, validateState, getSelections, getProgress } from '../dist/state.js';
import { getWindowsActions } from '../dist/downloads.js';

test('JSON export and import preserve a plan and its provider-specific completion', () => {
  const plan = createState(false);
  plan.selected = { email: 'tuta', browser: 'brave' };
  plan.preferences.email = 'tuta';
  plan.preferences.browser = 'brave';
  plan.preferences.photos = 'immich';
  plan.completed = ['email:tuta:backup', 'browser:brave:install', 'browser:firefox:verify'];
  assert.deepEqual(validateState(JSON.parse(JSON.stringify(plan))), plan);
});

test('unselected providers and services do not inflate progress', () => {
  const plan = createState(false);
  plan.selected = { browser: 'brave' };
  plan.preferences.browser = 'brave';
  plan.completed = ['browser:brave:backup', 'browser:firefox:backup', 'email:proton-mail:backup'];
  assert.deepEqual(getProgress(plan), { done: 1, total: 5, percent: 20 });
  assert.deepEqual(getProgress(plan, 'email'), { done: 0, total: 0, percent: 0 });
  plan.selected.browser = 'firefox';
  assert.deepEqual(getProgress(plan, 'browser'), { done: 1, total: 5, percent: 20 });
  delete plan.selected.browser;
  assert.deepEqual(getProgress(plan), { done: 0, total: 0, percent: 0 });
});

test('a fully checked plan reaches 100 percent without counting duplicates', () => {
  const plan = createState(false);
  for (const service of catalog) {
    const option = service.options[0];
    plan.selected[service.id] = option.id;
    plan.completed.push(...option.steps.map(step => `${service.id}:${option.id}:${step.id}`));
  }
  plan.completed.push(plan.completed[0]);
  const progress = getProgress(validateState(plan));
  assert.equal(progress.done, progress.total);
  assert.equal(progress.percent, 100);
});

test('import rejects wrong versions, unknown providers, and arbitrary completion keys', () => {
  for (const bad of [null, [], {}, { ...createState(), version: 99 },
    { ...createState(), selected: { browser: 'other' } },
    { ...createState(), preferences: { photos: 'firefox' } },
    { ...createState(), completed: ['browser:firefox:unknown'] },
    { ...createState(), completed: 'browser:firefox:backup' },
    { ...createState(), selected: [] },
    { ...createState(), preferences: [] }
  ]) assert.throws(() => validateState(bad));
});

test('import rejects prototype-shaped selections and strips unrelated properties', () => {
  const polluted = JSON.parse('{"version":1,"selected":{"__proto__":"firefox"},"completed":[]}');
  assert.throws(() => validateState(polluted));
  const state = createState();
  state.credentials = { password: 'never preserve unrelated data' };
  const parsed = validateState(state);
  assert.equal(Object.hasOwn(parsed, 'credentials'), false);
  assert.equal(Object.getPrototypeOf(parsed.selected), Object.prototype);
});

test('selected providers normalize conflicting imported preferences', () => {
  const input = createState(false);
  input.selected.browser = 'brave';
  input.preferences.browser = 'firefox';
  assert.equal(validateState(input).preferences.browser, 'brave');
});

test('every catalog provider has a corresponding Windows action', () => {
  for (const service of catalog) for (const option of service.options) {
    const input = { serviceId: service.id, optionId: option.id };
    const actions = getWindowsActions([input]);
    assert.equal(actions.length, 1, `Missing Windows action for ${service.id}:${option.id}`);
    assert.equal(actions[0].serviceId, service.id);
    assert.equal(actions[0].optionId, option.id);
    assert.ok(actions[0].url.startsWith('https://'));
  }
});

test('selections follow stable catalog ordering and exclude preferences alone', () => {
  const plan = createState(false);
  plan.selected = { photos: 'ente', browser: 'brave', email: 'tuta' };
  assert.deepEqual(getSelections(plan), [
    { serviceId: 'email', optionId: 'tuta' },
    { serviceId: 'browser', optionId: 'brave' },
    { serviceId: 'photos', optionId: 'ente' }
  ]);
  assert.deepEqual(getSelections(createState(false)), []);
});

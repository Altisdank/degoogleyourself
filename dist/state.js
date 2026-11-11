import { catalog } from './catalog.js';

export const STORAGE_KEY = 'friare-plan-v1';
const pairs = new Set(catalog.flatMap(s => s.options.map(o => `${s.id}:${o.id}`)));
const steps = new Set(catalog.flatMap(s => s.options.flatMap(o => o.steps.map(p => `${s.id}:${o.id}:${p.id}`))));
export function createState(suggested = true) {
  return { version: 1, selected: suggested ? { email: 'proton-mail', browser: 'firefox' } : {}, preferences: Object.fromEntries(catalog.map(s => [s.id, s.options[0].id])), completed: [], suggested };
}
export function validateState(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== 1) throw new Error('Filen är inte en flyttplan från Friare (version 1).');
  if (!value.selected || typeof value.selected !== 'object' || Array.isArray(value.selected)) throw new Error('Planen saknar giltiga tjänsteval.');
  if (!Array.isArray(value.completed) || value.completed.length > steps.size) throw new Error('Planen har en ogiltig checklista.');
  const next = createState(false);
  for (const [service, option] of Object.entries(value.selected)) {
    if (typeof option !== 'string' || !pairs.has(`${service}:${option}`)) throw new Error('Planen innehåller ett okänt tjänsteval.');
    next.selected[service] = option;
    next.preferences[service] = option;
  }
  if (value.preferences !== undefined) {
    if (!value.preferences || typeof value.preferences !== 'object' || Array.isArray(value.preferences)) throw new Error('Planens alternativ är ogiltiga.');
    for (const [service, option] of Object.entries(value.preferences)) {
      if (typeof option !== 'string' || !pairs.has(`${service}:${option}`)) throw new Error('Planen innehåller ett okänt alternativ.');
      next.preferences[service] = next.selected[service] || option;
    }
  }
  if (value.completed.some(key => typeof key !== 'string' || !steps.has(key))) throw new Error('Planen innehåller ett okänt kontrollsteg.');
  next.completed = [...new Set(value.completed)];
  next.suggested = value.suggested === true;
  return next;
}
export function getSelections(state) { return catalog.filter(s => state.selected[s.id]).map(s => ({ serviceId: s.id, optionId: state.selected[s.id] })); }
export function getProgress(state, serviceId) {
  let total = 0, done = 0;
  for (const s of catalog) {
    if (serviceId && serviceId !== s.id) continue;
    const option = s.options.find(o => o.id === state.selected[s.id]);
    if (!option) continue;
    for (const step of option.steps) {
      total++;
      if (state.completed.includes(`${s.id}:${option.id}:${step.id}`)) done++;
    }
  }
  return { total, done, percent: total ? Math.round(done / total * 100) : 0 };
}

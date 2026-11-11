import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAddressSuggestions, PROTON_USERNAME_MAX_LENGTH } from '../dist/address-suggestions.js';

const canonical = name => name.toLowerCase().replace(/[._-]/g, '');
const validUsername = /^[A-Za-z0-9]+(?:[_.-][A-Za-z0-9]+)*$/;

test('first suggestion preserves the source name, then adds actual numeric suffixes', () => {
  const result = buildAddressSuggestions('Anna.Lund@gmail.com');
  assert.equal(result.base, 'Anna.Lund');
  assert.equal(result.wasAdjusted, false);
  assert.deepEqual(result.suggestions.map(s => s.username), ['Anna.Lund', 'Anna.Lund1', 'Anna.Lund2', 'Anna.Lund3', 'Anna.Lund4']);
  assert.equal(result.suggestions[0].address, 'Anna.Lund@proton.me');
  assert.equal(result.suggestions[0].isExact, true);
  assert.deepEqual(result.suggestions.map(s => s.sequence), [0, 1, 2, 3, 4]);
  assert.ok(result.suggestions.slice(1).every(s => s.isExact === false));
  assert.ok(result.suggestions.every(s => !Object.hasOwn(s, 'available')));
});

test('next set continues suffixes and supports the other official domain', () => {
  const result = buildAddressSuggestions('namn@gmail.com', { domain: 'protonmail.com', start: 5, count: 3 });
  assert.deepEqual(result.suggestions.map(s => s.address), ['namn5@protonmail.com', 'namn6@protonmail.com', 'namn7@protonmail.com']);
  assert.deepEqual(result.suggestions.map(s => s.sequence), [5, 6, 7]);
  assert.equal(result.suggestions.some(s => s.isExact), false);
});

test('Gmail and Googlemail plus tags do not become part of the proposed account name', () => {
  for (const domain of ['gmail.com', 'googlemail.com', 'GMAIL.COM']) {
    const result = buildAddressSuggestions(`anna.lund+shopping@${domain}`);
    assert.equal(result.base, 'anna.lund');
    assert.equal(result.wasAdjusted, true);
    assert.equal(result.suggestions[0].isExact, false);
    assert.equal(result.sourceEmail, `anna.lund+shopping@${domain.toLowerCase()}`);
  }
  assert.equal(buildAddressSuggestions('anna+shopping@example.com').base, 'annashopping');
});

test('normalization is explicit and never creates invalid separator patterns', () => {
  const result = buildAddressSuggestions('..Åsa._-Öst_@example.com');
  assert.equal(result.base, 'Asa.Ost');
  assert.equal(result.wasAdjusted, true);
  assert.ok(result.suggestions.every(s => validUsername.test(s.username)));
  assert.equal(result.suggestions[0].isExact, false);
});

test('long names are shortened for suffixes and remain within the provider limit', () => {
  const result = buildAddressSuggestions(`${'a'.repeat(64)}@gmail.com`, { start: 9995 });
  assert.equal(result.base.length, PROTON_USERNAME_MAX_LENGTH);
  assert.equal(result.wasAdjusted, true);
  assert.equal(result.suggestions.length, 5);
  assert.ok(result.suggestions.every(s => s.username.length === PROTON_USERNAME_MAX_LENGTH));
  assert.ok(result.suggestions.every(s => validUsername.test(s.username)));
  assert.equal(new Set(result.suggestions.map(s => canonical(s.username))).size, 5);
  assert.equal(buildAddressSuggestions(`${'a'.repeat(39)}.@gmail.com`).base, 'a'.repeat(39));
});

test('case and punctuation variations never masquerade as different candidates', () => {
  const groups = ['John.Doe', 'john_doe', 'JOHN-DOE'].map(local => buildAddressSuggestions(`${local}@example.com`));
  for (const group of groups) {
    assert.equal(new Set(group.suggestions.map(s => canonical(s.username))).size, 5);
  }
  assert.deepEqual(groups[0].suggestions.map(s => canonical(s.username)), groups[1].suggestions.map(s => canonical(s.username)));
  assert.deepEqual(groups[0].suggestions.map(s => canonical(s.username)), groups[2].suggestions.map(s => canonical(s.username)));
});

test('an original long name that already ends in the first suffix is not repeated', () => {
  const result = buildAddressSuggestions(`${'a'.repeat(39)}1@gmail.com`);
  assert.equal(result.suggestions.length, 5);
  assert.equal(result.suggestions[0].isExact, true);
  assert.equal(new Set(result.suggestions.map(s => canonical(s.username))).size, 5);
  assert.deepEqual(result.suggestions.slice(1).map(s => s.username.slice(-1)), ['2', '3', '4', '5']);
  assert.deepEqual(result.suggestions.map(s => s.sequence), [0, 2, 3, 4, 5]);
  const chosen = result.suggestions[2];
  const retry = buildAddressSuggestions(`${'a'.repeat(39)}1@gmail.com`, { start: chosen.sequence + 1 });
  assert.notEqual(canonical(retry.suggestions[0].username), canonical(chosen.username));
  assert.equal(retry.suggestions[0].sequence, 4);
});

test('malformed emails and injection-shaped input are rejected', () => {
  for (const email of [null, {}, '', 'name', '@gmail.com', 'name@@gmail.com', 'name@localhost', 'na me@gmail.com', 'name@gmail.com\nBcc:other@example.com', '<script>@gmail.com', 'name@gmail.com/path', `${'a'.repeat(65)}@gmail.com`, '___@gmail.com', '+tag@gmail.com', '名字@gmail.com']) {
    assert.throws(() => buildAddressSuggestions(email), Error, String(email));
  }
  assert.throws(() => buildAddressSuggestions('a@' + 'b'.repeat(250) + '.com'));
  assert.equal(buildAddressSuggestions('  name@gmail.com  ').sourceEmail, 'name@gmail.com');
});

test('domains and generation ranges are bounded and cannot inject arbitrary destinations', () => {
  for (const domain of ['example.com', 'proton.me/path', 'proton.me?password=x', 'PROTON.ME', 'proton.me\n', '__proto__', {}, null]) {
    assert.throws(() => buildAddressSuggestions('name@gmail.com', {domain}));
  }
  for (const options of [null, [], { start:-1 }, { start:10000 }, { start:1.5 }, { start:'1' }, { count:0 }, { count:6 }, { count:Infinity }, { count:'5' }, { start:9999, count:2 }]) {
    assert.throws(() => buildAddressSuggestions('name@gmail.com', options));
  }
  assert.equal(buildAddressSuggestions('name@gmail.com', {start:9999,count:1}).suggestions[0].username, 'name9999');
});

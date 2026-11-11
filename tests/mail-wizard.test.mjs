import test from 'node:test';
import assert from 'node:assert/strict';
import { protonSignupUrl } from '../dist/mail-wizard.js';
import { buildAddressSuggestions } from '../dist/address-suggestions.js';

test('signup URL pre-fills the chosen address on the official free-plan signup', () => {
  for (const address of ['Anna.Lund@proton.me', 'anna_lund-1@protonmail.com']) {
    const url = new URL(protonSignupUrl(address));
    assert.equal(url.origin, 'https://account.proton.me');
    assert.equal(url.pathname, '/mail/signup');
    assert.equal(url.searchParams.get('plan'), 'free');
    assert.equal(url.searchParams.get('email'), address);
    assert.deepEqual([...url.searchParams.keys()].sort(), ['email', 'plan']);
    assert.equal(url.username, '');
    assert.equal(url.password, '');
    assert.equal(url.hash, '');
  }
});

test('source Gmail, alias tags and credentials are not included in signup handoff', () => {
  const source = 'anna.lund+shopping@gmail.com';
  const suggestion = buildAddressSuggestions(source).suggestions[0];
  const url = new URL(protonSignupUrl(suggestion.address));
  assert.equal(url.searchParams.get('email'), 'anna.lund@proton.me');
  assert.equal(url.toString().includes('gmail'), false);
  assert.equal(url.toString().includes('shopping'), false);
  for (const name of ['password', 'sourceEmail', 'source', 'recoveryEmail', 'token']) {
    assert.equal(url.searchParams.has(name), false);
  }
});

test('signup helper rejects arbitrary destinations, malformed names and URL injection', () => {
  for (const address of [
    '', null, undefined, 12, {}, [],
    'name@gmail.com', 'name@proton.me.evil.example', 'name@proton.me/path',
    'name@proton.me?plan=paid', 'name@proton.me#fragment',
    'name@proton.me&password=secret', 'name@proton.me\n', 'name@proton.me\r\n',
    ' name@proton.me', 'name@proton.me ', 'na me@proton.me',
    'name+tag@proton.me', '.name@proton.me', 'name.@proton.me',
    'name..other@proton.me', 'name_-other@proton.me', 'åsa@proton.me',
    'name@@proton.me', 'name@protonmail.ch'
  ]) assert.throws(() => protonSignupUrl(address), Error, String(address));
});

test('signup helper accepts 40 characters and rejects longer names', () => {
  const accepted = `${'a'.repeat(40)}@proton.me`;
  assert.equal(new URL(protonSignupUrl(accepted)).searchParams.get('email'), accepted);
  assert.throws(() => protonSignupUrl(`${'a'.repeat(41)}@proton.me`));
  assert.equal(new URL(protonSignupUrl('a@proton.me')).searchParams.get('email'), 'a@proton.me');
});

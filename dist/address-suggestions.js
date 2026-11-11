/**
 * Local name suggestions only. These functions never check availability,
 * create an account, send an address, or receive a password.
 * Username syntax and max length match Proton's published WebClients validators:
 * https://github.com/ProtonMail/WebClients/blob/main/packages/shared/lib/helpers/validators.ts
 * https://github.com/ProtonMail/WebClients/blob/main/packages/shared/lib/helpers/formValidators.ts
 * Proton performs the final validation during signup.
 */
export const PROTON_USERNAME_MAX_LENGTH = 40;
const USERNAME_PATTERN = /^[A-Za-z0-9]+(?:[_.-][A-Za-z0-9]+)*$/;
const DOMAINS = new Set(['proton.me', 'protonmail.com']);
const SOURCE_DOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const canonical = username => username.toLowerCase().replace(/[._-]/g, '');
const trimSeparators = username => username.replace(/^[._-]+|[._-]+$/g, '');

function parseSourceEmail(sourceEmail) {
  if (typeof sourceEmail !== 'string') throw new Error('Ange din nuvarande e-postadress.');
  const trimmed = sourceEmail.trim();
  if (!trimmed || trimmed.length > 254) throw new Error('Ange en giltig e-postadress på högst 254 tecken.');
  const parts = trimmed.split('@');
  if (parts.length !== 2) throw new Error('Ange en hel e-postadress, till exempel namn@gmail.com.');
  const [local, domain] = parts;
  if (!local || local.length > 64 || !/^[\p{L}\p{M}\p{N}._%+\-]+$/u.test(local) || !SOURCE_DOMAIN_PATTERN.test(domain)) {
    throw new Error('Kontrollera e-postadressen och försök igen.');
  }
  return { sourceEmail: `${local}@${domain.toLowerCase()}`, local, domain: domain.toLowerCase() };
}

/** Produce nearby names; a suggestion is never a statement of availability. */
export function buildAddressSuggestions(sourceEmail, options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Inställningarna för namnförslag är ogiltiga.');
  const { domain = 'proton.me', start = 0, count = 5 } = options;
  if (!DOMAINS.has(domain)) throw new Error('Välj proton.me eller protonmail.com som domän.');
  if (!Number.isInteger(start) || start < 0 || start > 9999 || !Number.isInteger(count) || count < 1 || count > 5 || start + count - 1 > 9999) {
    throw new Error('Välj ett giltigt intervall med högst fem namnförslag.');
  }
  const parsed = parseSourceEmail(sourceEmail);
  const accountLocal = ['gmail.com', 'googlemail.com'].includes(parsed.domain) ? parsed.local.split('+', 1)[0] : parsed.local;
  let base = accountLocal.normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^A-Za-z0-9._-]/g, '');
  base = trimSeparators(base.replace(/[._-]{2,}/g, separators => separators[0]));
  base = trimSeparators(base.slice(0, PROTON_USERNAME_MAX_LENGTH));
  if (!USERNAME_PATTERN.test(base) || !canonical(base)) throw new Error('Namnet före @ behöver innehålla minst en bokstav a–z eller en siffra.');

  const suggestions = [];
  const seen = new Set();
  for (let index = start; suggestions.length < count && index <= 9999; index++) {
    const suffix = index === 0 ? '' : String(index);
    const stem = trimSeparators(base.slice(0, PROTON_USERNAME_MAX_LENGTH - suffix.length));
    const username = stem + suffix;
    const key = canonical(username);
    if (!USERNAME_PATTERN.test(username) || seen.has(key)) continue;
    seen.add(key);
    suggestions.push({ username, address: `${username}@${domain}`, isExact: username === parsed.local, sequence: index });
  }
  if (suggestions.length !== count) throw new Error('Det går inte att skapa fler namnförslag i det intervallet.');
  return { sourceEmail: parsed.sourceEmail, base, wasAdjusted: base !== parsed.local, suggestions };
}

import { buildAddressSuggestions } from './address-suggestions.js';

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow = '<span aria-hidden="true">→</span>';
const OFFICIAL_SIGNUP = 'https://account.proton.me/mail/signup';
const OFFICIAL_IMPORT = 'https://account.proton.me/mail/easy-switch';

export function protonSignupUrl(address) {
  if (typeof address !== 'string' || address !== address.trim() || !/^[A-Za-z0-9]+(?:[_.-][A-Za-z0-9]+)*@(?:proton\.me|protonmail\.com)$/.test(address) || address.split('@')[0].length > 40) throw new Error('Ogiltig Proton-adress.');
  const url = new URL(OFFICIAL_SIGNUP);
  url.searchParams.set('plan', 'free');
  url.searchParams.set('email', address);
  return url.toString();
}

// This controller holds addresses only in memory. It never accepts a password,
// contacts availability endpoints, or records a signup as externally verified.
export function createMailWizard({ showModal, notify, onChooseProton, onAccountConfirmed, openGuide }) {
  let phase = 'address';
  let sourceEmail = '', domain = 'proton.me', offset = 0, selectedIndex = 0;
  let result = null, selectedAddress = '', actualAddress = '', existingAccount = false;
  const modalContent = () => document.querySelector('#modal-content');
  const steps = () => {
    const active = ['address','suggestions'].includes(phase) ? 0 : phase === 'account' ? 1 : 2;
    return `<ol class="mail-progress" aria-label="Steg i e-postbytet">${['Välj adress',existingAccount ? 'Ditt konto' : 'Skapa konto','Flytta mejlen'].map((label, i) => `<li ${i === active ? 'aria-current="step"' : ''} class="${i === active ? 'active' : i < active ? 'passed' : ''}"><span>${String(i + 1).padStart(2,'0')}</span>${label}</li>`).join('')}</ol>`;
  };
  const shell = content => {
    showModal(`${steps()}${content}<div class="mail-bottom"><button type="button" class="plain-action" data-mail-action="restart">Börja om</button><span>Inga lösenord hanteras av Friare.</span></div>`, 'mail-wizard');
  };
  function renderAddress() {
    phase = 'address';
    shell(`<h2 id="modal-title">Byt Gmail till Proton.</h2><p class="modal-description">Vi använder namnet före @ i din nuvarande adress. Sedan öppnar vi Protons registrering med ditt namnförslag förifyllt.</p>
      <form id="mail-address-form" class="mail-form"><label for="source-email">Din nuvarande Gmail-adress</label><input id="source-email" name="sourceEmail" type="email" autocomplete="email" inputmode="email" maxlength="254" placeholder="ditt.namn@gmail.com" value="${esc(sourceEmail)}" required aria-describedby="address-privacy"><div class="mail-domain-row"><label for="new-domain">Ny e-postdomän</label><select id="new-domain" name="domain"><option value="proton.me" ${domain === 'proton.me' ? 'selected' : ''}>@proton.me</option><option value="protonmail.com" ${domain === 'protonmail.com' ? 'selected' : ''}>@protonmail.com</option></select></div><p id="address-privacy" class="field-help">Adressen används bara här för att ta fram namnförslag. Den sparas inte i din flyttplan.</p><p id="mail-error" class="form-error" role="alert" hidden></p><button class="button primary" type="submit">Föreslå min nya adress ${arrow}</button></form><button class="plain-action existing-action" data-mail-action="existing">Jag har redan ett Proton-konto</button>`);
  }
  function renderSuggestions() {
    phase = 'suggestions';
    result = buildAddressSuggestions(sourceEmail, {domain, start:offset, count:Math.min(5, 10000 - offset)});
    selectedIndex = Math.min(selectedIndex, result.suggestions.length - 1);
    selectedAddress = result.suggestions[selectedIndex].address;
    shell(`<h2 id="modal-title">Välj adress att prova.</h2><p class="modal-description">${offset ? 'Här är nästa nummerförslag.' : 'Börja med samma namn. Om det är upptaget kan du välja ett nummer efter.'} <strong>Proton kontrollerar om adressen är ledig.</strong></p>
      ${result.wasAdjusted ? '<p class="field-help adjusted-name">Namnet har anpassats till Protons skrivregler. Eventuella Gmail-taggar efter + följer inte med.</p>' : ''}
      <fieldset class="address-options"><legend>Adressförslag — ledighet inte kontrollerad</legend>${result.suggestions.map((s, i) => `<label class="address-option"><input type="radio" name="proton-address" value="${i}" ${i === selectedIndex ? 'checked' : ''}><span class="suggested-address">${esc(s.address)}</span><small>${s.isExact ? 'Samma namn' : 'Alternativ'}</small></label>`).join('')}</fieldset>
      <div class="mail-choice-actions"><button class="plain-action" data-mail-action="more" ${offset >= 9995 ? 'disabled' : ''}>Visa fler nummerförslag</button><button class="plain-action" data-mail-action="edit">Ändra Gmail-adress</button></div>
      <div class="mail-signup-actions"><a id="proton-signup-link" class="button primary" href="${esc(protonSignupUrl(selectedAddress))}" target="_blank" rel="noopener noreferrer" data-mail-action="signup">Fortsätt hos Proton ${arrow}</a><button class="button secondary" data-mail-action="copy-name">Kopiera namnet</button></div>
      <p class="field-help">Länken öppnar Protons gratisregistrering i en ny flik och skickar ditt valda adressförslag dit. Lösenord och verifiering hanterar du hos Proton. Om förifyllningen saknas kan du klistra in namnet.</p>`);
  }
  function renderAccount() {
    phase = 'account';
    shell(`<h2 id="modal-title">${existingAccount ? 'Använd ditt Proton-konto.' : 'Slutför kontot hos Proton.'}</h2><p class="modal-description">${existingAccount ? 'Ange adressen till kontot du vill flytta mejlen till.' : 'Låt den här sidan vara kvar. Proton kontrollerar namnet och ber dig välja lösenord, godkänna villkoren och eventuellt verifiera dig.'}</p>
      ${!existingAccount ? `<div class="signup-address"><span>ADRESS ATT PROVA</span><strong>${esc(selectedAddress)}</strong><a class="inline-link" href="${esc(protonSignupUrl(selectedAddress))}" target="_blank" rel="noopener noreferrer">Öppna Proton igen ${arrow}</a></div><div class="mail-choice-actions"><button class="plain-action" data-mail-action="taken">Namnet var upptaget — prova nästa nummer</button><button class="plain-action" data-mail-action="copy-name">Kopiera namnet</button></div>` : ''}
      <div class="guide-note"><strong>Om lösenordet</strong><br>Friare läser eller överför inte ditt Gmail-lösenord. Välj lösenord direkt hos Proton. Låt gärna din lösenordshanterare skapa och spara ett eget lösenord för det nya kontot.</div>
      <form id="mail-account-form" class="mail-form"><label for="confirmed-email">${existingAccount ? 'Din Proton-adress' : 'Adressen du faktiskt skapade hos Proton'}</label><input id="confirmed-email" name="confirmedEmail" type="email" autocomplete="email" maxlength="254" placeholder="ditt.namn@proton.me" value="${esc(actualAddress || selectedAddress)}" required><label class="account-confirm"><input type="checkbox" name="confirmed" required><span>Jag kan logga in på kontot och har sparat mina återställningsuppgifter.</span></label><p id="mail-error" class="form-error" role="alert" hidden></p><button class="button primary" type="submit">Kontot är klart — fortsätt ${arrow}</button></form><p class="field-help">Detta är din egen bekräftelse. Friare kan inte kontrollera kontots status.</p>`);
  }
  function renderImport() {
    phase = 'import';
    shell(`<h2 id="modal-title">Nu tar du med mejlen.</h2><p class="modal-description">Du har bekräftat att du kan använda <strong>${esc(actualAddress)}</strong>. Nästa steg sker i Protons Easy Switch.</p>
      <ol class="mail-import-steps"><li><span>1</span><div><strong>Öppna Easy Switch</strong><p>Logga in på rätt Proton-konto. Om länken inte tar dig till importen: Inställningar → Alla inställningar → Import via Easy Switch.</p></div></li><li><span>2</span><div><strong>Välj Google och godkänn åtkomsten</strong><p>Välj vilka mejl, kontakter och kalendrar som ska importeras. Googles inloggning och medgivande sker hos Google.</p></div></li><li><span>3</span><div><strong>Kontrollera resultatet</strong><p>Granska importstatus och prova gamla mejl, bilagor och ny inkommande post innan du slutar använda Gmail.</p></div></li></ol>
      <div class="mail-signup-actions"><a class="button primary" href="${OFFICIAL_IMPORT}" target="_blank" rel="noopener noreferrer">Öppna Easy Switch ${arrow}</a><button class="button secondary" data-mail-action="guide">Till min checklista</button></div><p class="field-help">Att öppna importverktyget markerar inte flytten som klar. <a href="https://proton.me/support/switch-from-gmail-to-proton" target="_blank" rel="noopener noreferrer">Protons fullständiga instruktioner</a>.</p>`);
  }
  function displayError(message) {
    const error = document.querySelector('#mail-error');
    if (error) { error.textContent = message; error.hidden = false; }
    else notify(message);
  }
  document.addEventListener('submit', event => {
    if (event.target.id === 'mail-address-form') {
      event.preventDefault();
      const form = event.target;
      sourceEmail = form.elements.sourceEmail.value.trim(); domain = form.elements.domain.value;
      offset = 0; selectedIndex = 0; existingAccount = false; actualAddress = '';
      try { renderSuggestions(); } catch (e) { phase = 'address'; displayError(e.message); }
    } else if (event.target.id === 'mail-account-form') {
      event.preventDefault();
      if (!event.target.reportValidity()) return;
      const address = event.target.elements.confirmedEmail.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) || address.length > 254) return displayError('Ange hela e-postadressen till ditt Proton-konto.');
      if (['gmail.com','googlemail.com'].includes(address.split('@')[1].toLowerCase())) return displayError('Ange adressen till din nya Proton-inkorg, inte Gmail-adressen du flyttar från.');
      actualAddress = address;
      onAccountConfirmed(); renderImport();
    }
  });
  document.addEventListener('change', event => {
    if (event.target.name !== 'proton-address' || !modalContent().contains(event.target) || !result) return;
    const index = Number(event.target.value);
    if (!Number.isInteger(index) || !result.suggestions[index]) return;
    selectedIndex = index; selectedAddress = result.suggestions[index].address;
    const anchor = document.querySelector('#proton-signup-link');
    if (anchor) anchor.href = protonSignupUrl(selectedAddress);
  });
  document.addEventListener('click', event => {
    const control = event.target.closest('[data-mail-action]');
    if (!control || control.disabled || !modalContent().contains(control)) return;
    const action = control.dataset.mailAction;
    if (action === 'signup') {
      // Let the real anchor navigation open first. No popup or hidden request.
      setTimeout(() => { if (document.querySelector('#modal').open) renderAccount(); }, 0);
    } else if (action === 'copy-name') {
      if (!navigator.clipboard?.writeText) notify('Markera namnet och kopiera det manuellt.');
      else navigator.clipboard.writeText(selectedAddress.split('@')[0]).then(() => notify('Namnet är kopierat. Klistra in det hos Proton.'), () => notify('Kopiering blockerades. Markera namnet och kopiera manuellt.'));
    } else if (action === 'more' || action === 'taken') {
      const nextSequence = action === 'taken' ? Math.max(1, (result?.suggestions[selectedIndex]?.sequence ?? offset + selectedIndex) + 1) : (result?.suggestions.at(-1)?.sequence ?? offset + 4) + 1;
      if (nextSequence > 9999) return notify('Inga fler nummerförslag. Gå tillbaka och välj ett annat namn.');
      offset = nextSequence;
      selectedIndex = 0;
      try { renderSuggestions(); } catch (e) { displayError(e.message); }
    } else if (action === 'edit') renderAddress();
    else if (action === 'existing') { existingAccount = true; selectedAddress = ''; actualAddress = ''; renderAccount(); }
    else if (action === 'guide') openGuide();
    else if (action === 'restart') { sourceEmail = ''; selectedAddress = ''; actualAddress = ''; result = null; domain = 'proton.me'; offset = 0; selectedIndex = 0; existingAccount = false; renderAddress(); }
  });
  return {
    reset() { phase = 'address'; sourceEmail = ''; selectedAddress = ''; actualAddress = ''; result = null; offset = 0; selectedIndex = 0; domain = 'proton.me'; existingAccount = false; },
    open() {
      onChooseProton();
      if (phase === 'suggestions' && result) renderSuggestions();
      else if (phase === 'account') renderAccount();
      else if (phase === 'import') renderImport();
      else renderAddress();
    }
  };
}

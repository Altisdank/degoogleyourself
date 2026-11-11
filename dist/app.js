import { configureGooglePrefill } from './google-prefill.js';
import { catalog, reviewedAt } from './catalog.js';
import { buildWindowsScript, getWindowsActions } from './downloads.js';
import { STORAGE_KEY, createState, validateState, getSelections, getProgress } from './state.js';
import { createMailWizard } from './mail-wizard.js';

const icons = {
 'arrow-right':'M4 12h16m-6-6 6 6-6 6',
 arrows:'M4 8h16m-5-5 5 5-5 5M20 16H4m5-5-5 5 5 5',
 shield:'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Zm-4 9 3 3 5-6',
 lock:'M6 10h12v11H6zM8 10V7a4 4 0 0 1 8 0v3m-4 5v2',
 mail:'M3 5h18v14H3zM3 6l9 7 9-7',
 globe:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c-5 5-5 13 0 18M12 3c5 5 5 13 0 18',
 search:'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-1 5 6 6',
 cloud:'M7 18a5 5 0 0 1-1-10 6 6 0 0 1 12 1 4.5 4.5 0 0 1 0 9H7Z',
 key:'M14 8a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm-1 3 8 8v3h-3v-3h-3v-3',
 image:'M3 3h18v18H3zM3 16l6-6 5 5 3-3 4 4M15 7h.01',
 checklist:'M9 5h12M9 12h12M9 19h12M2 5l2 2 3-4M2 12l2 2 3-4M2 19l2 2 3-4',
 code:'m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18',
 route:'M5 5a2 2 0 1 1 0 .1M19 19a2 2 0 1 1 0 .1M5 7v7a4 4 0 0 0 4 4h8M10 5h5a4 4 0 0 1 4 4v3',
 download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
 leaf:'M20 3C8 3 2 7 5 15s16 5 15-12ZM4 21 15 10',
 terminal:'m4 6 6 6-6 6m8 0h8',
 plus:'M12 5v14M5 12h14',
 x:'m6 6 12 12M6 18 18 6',
 'check-circle':'M21 12a9 9 0 1 1-3-7M8 11l4 4 9-10',
 check:'m5 12 4 4 10-10',
 external:'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7',
 copy:'M8 8h13v13H8zM16 8V3H3v13h5',
 clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name] || icons['arrow-right']}"></path></svg>`;
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = selector => document.querySelector(selector);
const initials = { 'proton-mail':'PM', 'proton-drive':'PD', 'proton-pass':'PP', tuta:'TU', firefox:'FF', brave:'BR', duckduckgo:'DD', 'brave-search':'BS', nextcloud:'NC', bitwarden:'BW', ente:'EN', immich:'IM' };
const migrationNotes = {
  'proton-mail': 'Mejl, kontakter och kalender via Easy Switch. Du godkänner importen hos Google och Proton.',
  tuta: 'Mejl via MBOX- eller EML-filer. Kräver datorappen och ett abonnemang med importstöd.',
  firefox: 'Bokmärken och historik via importguiden. Lösenord flyttas separat på Windows och Linux.',
  brave: 'Bokmärken och inställningar via importguiden. Chrome-lösenord flyttas separat med en CSV-fil.',
  duckduckgo: 'Byt standardsökmotor i din webbläsare. Din gamla sökhistorik flyttas inte över.',
  'brave-search': 'Välj Brave Search som standardsökmotor. Fungerar också i andra webbläsare än Brave.',
  'proton-drive': 'Exportera med Takeout, ladda upp i Proton Drive. Kontrollera dokument och delningslänkar.',
  nextcloud: 'Välj en leverantör eller egen server. Exportera Drive-filerna och ladda upp dem i Nextcloud.',
  bitwarden: 'Importera direkt från Chrome i datorappen. Använd appen från Bitwardens webbplats.',
  'proton-pass': 'Exportera lösenord till CSV och importera i Proton Pass. Radera exportfilen efter kontroll.',
  ente: 'Importera bilder och metadata från Takeout. Kontrollera album, datum och lagringsutrymme.',
  immich: 'För dig som vill drifta själv. Kräver egen server, bildimport och en separat säkerhetskopia.'
};
const logo = option => `<span class="provider-logo ${option.id}" aria-hidden="true">${initials[option.id] || option.name[0]}</span>`;
const link = (item, className = 'step-link') => `<a class="${className}" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)} ${icon('external')}</a>`;
const findService = id => catalog.find(s => s.id === id);
let state = createState();
let storageAvailable = true;
let storageRecovery = false;
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) { try { state = validateState(JSON.parse(stored)); } catch { storageRecovery = true; } }
} catch { storageAvailable = false; }
let activeFilter = 'all';
let modalView = null;
let modalService = null;
let modalOpener = null;
let modalOpenerSelector = null;
let toastTimer;
function hydrateIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); }); }
function notify(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4400); }
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; } catch { storageAvailable = false; }
  $('#storage-warning').hidden = storageAvailable;
}
function optionFor(service) { return service.options.find(o => o.id === state.preferences[service.id]) || service.options[0]; }
function renderCards() {
  const groups = { communication: ['email','browser','search'], storage: ['drive','photos'], security:['passwords'] };
  const visible = catalog.filter(s => activeFilter === 'all' || groups[activeFilter]?.includes(s.id));
  $('#service-grid').innerHTML = visible.map(service => {
    const option = optionFor(service), selected = Boolean(state.selected[service.id]);
    return `<article class="service-row service-card ${selected ? 'selected' : ''}" id="service-${service.id}">
      <div class="row-origin"><span class="row-number">${String(catalog.indexOf(service) + 1).padStart(2, '0')}</span><h3>${escapeHtml(service.from)}</h3><span class="row-category">${escapeHtml(service.name)}</span></div>
      <div class="row-destination"><div class="destination-select">${icon('arrow-right')}<select id="provider-${service.id}" data-option-service="${service.id}" aria-label="Alternativ till ${escapeHtml(service.from)}">${service.options.map(o => `<option value="${o.id}" ${o.id === option.id ? 'selected' : ''}>${escapeHtml(o.name)}</option>`).join('')}</select></div><p class="row-summary">${escapeHtml(migrationNotes[option.id] || option.description)}</p><div class="row-bottom">${option.id === 'proton-mail' ? `<button class="guide-button" data-action="mail-setup">Starta bytet ${icon('arrow-right')}</button><button class="plain-action row-guide" data-action="guide" data-service="${service.id}">Läs guiden</button>` : option.id === 'bitwarden' ? `<button class="guide-button" data-action="bitwarden-setup">Starta bytet ${icon('arrow-right')}</button><button class="plain-action row-guide" data-action="guide" data-service="passwords">Läs guiden</button>` : `<button class="guide-button" data-action="guide" data-service="${service.id}">Öppna guide ${icon('arrow-right')}</button><span class="row-step-count">${option.steps.length} STEG</span>`}</div></div>
      <label class="selection-control"><input type="checkbox" data-select-service="${service.id}" aria-label="Lägg till ${escapeHtml(service.name)} i flyttplanen" ${selected ? 'checked' : ''}><span>${selected ? 'Vald' : 'Välj'}</span></label></article>`;
  }).join('');
}
function renderPlan() {
  const selected = catalog.filter(s => state.selected[s.id]);
  const progress = getProgress(state);
  $('#header-count').textContent = selected.length;
  $('#plan-intro').textContent = state.suggested ? 'Gmail och Chrome är förvalda. Ändra till det du vill börja med.' : selected.length ? `${selected.length} ${selected.length === 1 ? 'tjänst vald' : 'tjänster valda'}. Fortsätt när det passar dig.` : 'Välj en tjänst i listan för att börja.';
  $('#plan-summary').innerHTML = `<div class="plan-progress-label"><strong>${progress.done} av ${progress.total} steg avbockade</strong><span>${progress.percent}%</span></div><div class="progress-track" role="progressbar" aria-label="Avbockade steg i din flyttplan" aria-valuenow="${progress.percent}" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill" style="width:${progress.percent}%"></div></div>`;
  $('#plan-items').innerHTML = selected.length ? selected.map(s => {
    const o = s.options.find(o => o.id === state.selected[s.id]), p = getProgress(state, s.id);
    return `<div class="plan-item">${logo(o)}<div class="plan-item-info"><strong>${escapeHtml(o.name)}</strong><small>${escapeHtml(s.from)} · ${p.done}/${p.total} steg</small></div><button data-action="guide" data-service="${s.id}" aria-label="Öppna flyttguide för ${escapeHtml(o.name)}">${icon(p.done === p.total ? 'check-circle' : 'arrow-right')}</button></div>`;
  }).join('') : '<p class="empty-plan">Kryssa i en tjänst i listan. Då visas flyttstegen här.</p>';
  $('#storage-warning').hidden = storageAvailable;
}
function renderAll() { renderCards(); renderPlan(); }
function showModal(content, view, service = null) {
  if (!$('#modal').open) {
    modalOpener = document.activeElement;
    const action = modalOpener?.dataset?.action;
    const openerService = modalOpener?.dataset?.service;
    const scope = modalOpener?.closest('.service-card')?.id;
    modalOpenerSelector = scope ? `#${CSS.escape(scope)} [data-action="${CSS.escape(action || '')}"]` : action ? `[data-action="${CSS.escape(action)}"]${openerService ? `[data-service="${CSS.escape(openerService)}"]` : ''}` : null;
  }
  modalView = view; modalService = service;
  $('#modal-content').innerHTML = content;
  if (!$('#modal').open) $('#modal').showModal();
  $('#modal').scrollTop = 0;
  const heading = $('#modal-title');
  if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
}
function showGuide(id) {
  const service = findService(id); if (!service) return;
  const option = optionFor(service), selected = Boolean(state.selected[id]);
  showModal(`<div class="modal-heading">${logo(option)}<div><div class="eyebrow small">${escapeHtml(service.from)} / FLYTTGUIDE</div><h2 id="modal-title">Byt till ${escapeHtml(option.name)}</h2></div></div>
    <p class="modal-description">${escapeHtml(option.description)}</p><div class="modal-controls"><label for="guide-provider" class="modal-label">Välj alternativ</label><select id="guide-provider" data-option-service="${id}">${service.options.map(o => `<option value="${o.id}" ${o.id === option.id ? 'selected' : ''}>${escapeHtml(o.name)}</option>`).join('')}</select><button class="button ${selected ? 'soft' : 'primary'}" data-action="toggle-service" data-service="${id}">${icon(selected ? 'check' : 'plus')}${selected ? 'I min plan · ta bort' : 'Lägg till i min plan'}</button></div>
    <div class="guide-note">Du loggar in och flyttar data direkt hos tjänsterna. Bocka av ett steg först när du har utfört och kontrollerat det. Friare kan inte läsa importstatus.</div>
    <ol class="steps">${option.steps.map((step, i) => {
      const key = `${id}:${option.id}:${step.id}`, done = state.completed.includes(key);
      return `<li class="guide-step ${done ? 'done' : ''}"><input type="checkbox" class="step-checkbox" id="step-${i}" data-step="${key}" ${done ? 'checked' : ''}><div class="step-info"><label for="step-${i}">${i + 1}. ${escapeHtml(step.title)}</label><p>${escapeHtml(step.body)}</p>${step.link ? link(step.link) : ''}</div></li>`;
    }).join('')}</ol><div class="sources-list">Officiella guider · Kontrollerade ${reviewedAt}<br>${option.sources.map(s => link(s)).join('')}</div><div class="plan-actions"><button class="button secondary" data-action="open-plan">${icon('checklist')} Till min flyttplan</button>${link({label:`Besök ${option.name}`,url:option.url},'button soft')}</div>`, 'guide', id);
}
function showPlan() {
  const selections = getSelections(state), progress = getProgress(state);
  showModal(`<div class="eyebrow small">DIN CHECKLISTA</div><h2 id="modal-title">Din flyttplan</h2><p class="modal-description">${progress.done} av ${progress.total} steg avbockade. ${progress.total && progress.done === progress.total ? 'Alla valda steg är avbockade av dig. Gör gärna en sista kontroll.' : 'Fortsätt där du slutade — dina val sparas i den här webbläsaren.'}</p>
    ${selections.length ? selections.map(({serviceId,optionId}) => { const s = findService(serviceId), o = s.options.find(o => o.id === optionId), p = getProgress(state, serviceId); return `<div class="plan-modal-item">${logo(o)}<div><strong>${escapeHtml(s.from)} → ${escapeHtml(o.name)}</strong><p>${p.done} av ${p.total} steg avbockade</p></div><button class="button secondary" data-action="guide" data-service="${s.id}">${p.done === p.total ? 'Granska' : 'Fortsätt'} ${icon('arrow-right')}</button></div>`; }).join('') : '<p class="empty-plan">Din plan är tom. Stäng rutan och lägg till en tjänst för att börja.</p>'}
    <div class="guide-note"><strong>Innan du lämnar Google helt</strong><br>Kontrollera säkerhetskopior, återställningsadresser och tjänster där du använder ”Logga in med Google”. Skapa och testa en annan inloggning där det går. Behåll ditt Google-konto tills allt fungerar.<br>${link({label:'Granska dina Google-kopplingar',url:'https://myaccount.google.com/connections'})}</div>
    <div class="plan-actions"><button class="button primary" data-action="script" ${selections.length ? '' : 'disabled'}>${icon('terminal')} Windows-hjälp</button><button class="button secondary" data-action="export-text">${icon('download')} Spara som text</button><button class="button soft" data-action="export-json">Exportera säkerhetskopia</button></div>`, 'plan');
}
function showScript() {
  const selections = getSelections(state), actions = getWindowsActions(selections);
  showModal(`<div class="eyebrow small">WINDOWS · CMD</div><h2 id="modal-title">Din Windows-hjälp</h2><p class="modal-description">${actions.length ? 'Granska filen och spara den som friare-start.cmd. Öppna den sedan på din Windows-dator. Du får frågan J/N före varje åtgärd.' : 'Välj minst en tjänst i din flyttplan för att skapa en Windows-fil.'}</p>
    <div class="guide-note">${actions.map(a => `${a.type === 'install' ? 'Erbjuder installation' : 'Öppnar efter godkännande'}: <strong>${escapeHtml(a.name)}</strong>${a.packageId ? ` (${escapeHtml(a.packageId)})` : ''}`).join('<br>') || 'Inga tjänster valda.'}</div>
    ${actions.length ? `<pre class="script-code" tabindex="0" aria-label="Hela innehållet i CMD-filen">${escapeHtml(buildWindowsScript(selections))}</pre><div class="plan-actions"><button class="button primary" data-action="download-script">${icon('download')} Hämta CMD-filen</button><button class="button secondary" data-action="copy-script">${icon('copy')} Kopiera innehållet</button></div><p class="sources-list">Körs på Windows. Kräver internet; installation använder WinGet om det finns. Ingen mejl- eller filimport görs av scriptet. Webbläsaren kan inte installera program åt dig.</p>` : '<button class="button primary" data-action="close-modal">Tillbaka till tjänsterna</button>'}`, 'script');
}
function download(filename, data, type) {
  const url = URL.createObjectURL(new Blob([data], {type}));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename;
  document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function exportText() {
  const lines = ['FRIARE – MIN FLYTTPLAN', `Guider kontrollerade: ${reviewedAt}`, '', 'Bockarna betyder att du själv har kontrollerat stegen.', 'Logga in direkt hos tjänsterna. Friare hanterar inte lösenord.', ''];
  for (const {serviceId,optionId} of getSelections(state)) {
    const s = findService(serviceId), o = s.options.find(o => o.id === optionId);
    lines.push(`${s.from} → ${o.name}`, o.url, '');
    o.steps.forEach(step => lines.push(`[${state.completed.includes(`${s.id}:${o.id}:${step.id}`) ? 'x' : ' '}] ${step.title}`, step.body, step.link ? step.link.url : '', ''));
  }
  lines.push('Innan du lämnar Google helt:', 'Kontrollera säkerhetskopior, återställningsadresser och Logga in med Google.', 'https://myaccount.google.com/connections', 'Behåll det gamla tills det nya fungerar.');
  download('friare-flyttplan.txt', '\uFEFF' + lines.join('\r\n'), 'text/plain;charset=utf-8');
  notify('Din flyttplan har förberetts för nedladdning.');
}
function toggleService(id, checked) {
  const service = findService(id); if (!service) return;
  if (checked) state.selected[id] = optionFor(service).id; else delete state.selected[id];
  state.suggested = false; save(); renderAll();
}
function openBitwardenSetup() {
  showModal(`<div class="eyebrow small">CHROME → BITWARDEN</div>
    <h2 id="modal-title">Flytta sparade lösenord</h2>
    <p class="modal-description">Förbered din e-post här. Bitwardens datorapp flyttar sedan dina sparade inloggningar direkt från rätt Chrome-profil.</p>
    <form id="bitwarden-form" class="mail-form">
      <label for="bitwarden-email">E-post för ditt Bitwarden-konto</label>
      <input type="email" id="bitwarden-email" autocomplete="email" maxlength="254" required>
      <button type="button" class="button secondary" id="google-prefill" hidden>Hämta e-post från Google</button>
      <label for="bitwarden-region">Bitwarden-region</label>
      <select id="bitwarden-region"><option value="vault.bitwarden.eu">EU</option><option value="vault.bitwarden.com">USA</option></select>
      <button type="submit" class="button primary">Förbered Bitwarden-inloggning</button>
      <p id="bitwarden-status" role="status"></p>
      <a id="bitwarden-login" class="step-link" target="_blank" rel="noopener noreferrer" hidden>Öppna Bitwarden med e-post ifylld ↗</a>
    </form>
    <ol class="mail-import-steps">
      <li><span>1</span><div><strong>Öppna ditt valv i datorappen</strong><p><a href="https://bitwarden.com/download/" target="_blank" rel="noopener noreferrer">Hämta Bitwarden från Bitwardens webbplats</a>. Skapa ett konto där om du behöver ett.</p></div></li>
      <li><span>2</span><div><strong>Välj Chrome-profil</strong><p>Öppna Arkiv → Importera data. Välj valv, Chrome och direktimport från webbläsaren. Välj profilen där lösenorden finns och godkänn importen.</p></div></li>
    </ol>
    <div class="guide-note">Google kan lämna ut din e-postadress. Dina sparade lösenord hanteras av Bitwarden på datorn.</div>
    <button type="button" class="button secondary" data-action="guide" data-service="passwords">Öppna hela flyttguiden</button>`, 'bitwarden');
  const form = $('#bitwarden-form');
  const email = $('#bitwarden-email');
  const region = $('#bitwarden-region');
  const link = $('#bitwarden-login');
  const status = $('#bitwarden-status');
  const clearLink = () => { link.hidden = true; link.removeAttribute('href'); status.textContent = ''; };
  form.addEventListener('input', clearLink);
  form.addEventListener('change', clearLink);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const host = region.value === 'vault.bitwarden.eu' ? 'vault.bitwarden.eu' : 'vault.bitwarden.com';
    link.href = `https://${host}/#/login?email=${encodeURIComponent(email.value.trim())}`;
    link.hidden = false;
    link.focus();
    status.textContent = 'När du öppnar länken skickas e-postadressen till vald Bitwarden-region.';
  });
  configureGooglePrefill($('#google-prefill'), email, status);
}

function showSources() {
  showModal(`<div class="eyebrow small">ÖPPET OCH OBEROENDE</div><h2 id="modal-title">Källor & om Friare</h2><p class="modal-description">Friare är en oberoende flyttguide. Vi har inga affiliatelänkar och är inte knutna till tjänsterna. Dina val sparas i din webbläsare. Webbplatsen använder inga externa typsnitt, analysverktyg eller spårningsskript.</p><div class="guide-note">Guiderna kontrollerades ${reviewedAt}. Funktioner, abonnemang och importverktyg kan ändras. Följ alltid tjänstens aktuella anvisningar. Märkesnamnen tillhör sina respektive ägare.</div>
    ${catalog.map(s => `<section class="source-group"><h3>${escapeHtml(s.name)}</h3>${s.options.flatMap(o => o.sources).map(source => link(source)).join('')}</section>`).join('')}<section class="source-group"><h3>Bakgrund till projektet</h3><p class="modal-description">Inspirerad av Zack Shutts video om att lämna Google. Den lyfter Proton Mail, Firefox, Brave, Ente och DuckDuckGo och föreslår att börja med ett byte. Friares konkreta flyttsteg bygger på leverantörernas egna guider.</p>${link({label:'Zack Shutt: People Are Actually Leaving Google',url:'https://www.youtube.com/shorts/aPic1UVK9ps'})}</section><div class="plan-actions"><a class="button primary" href="./friare-kallkod.zip" download>${icon('download')} Ladda ner källkod</a></div>`, 'sources');
}

const mailWizard = createMailWizard({
  showModal, notify,
  onChooseProton() {
    state.selected.email = 'proton-mail'; state.preferences.email = 'proton-mail'; state.suggested = false;
    save(); queueMicrotask(renderAll);
  },
  onAccountConfirmed() {
    state.selected.email = 'proton-mail'; state.preferences.email = 'proton-mail';
    state.completed = [...new Set([...state.completed, 'email:proton-mail:account'])];
    state.suggested = false; save(); renderAll();
  },
  openGuide() { showGuide('email'); }
});

document.addEventListener('click', async event => {
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    activeFilter = filter.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(button => { const active = button === filter; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    renderCards(); return;
  }
  const button = event.target.closest('[data-action]'); if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === 'guide') showGuide(button.dataset.service);
  else if (action === 'bitwarden-setup') openBitwardenSetup();
  else if (action === 'mail-setup') mailWizard.open();
  else if (action === 'open-plan') showPlan();
  else if (action === 'close-modal') $('#modal').close();
  else if (action === 'toggle-service') { const id = button.dataset.service; toggleService(id, !state.selected[id]); showGuide(id); }
  else if (action === 'script') showScript();
  else if (action === 'download-script') { download('friare-start.cmd', buildWindowsScript(getSelections(state)), 'application/octet-stream'); notify('CMD-filen har förberetts för nedladdning.'); }
  else if (action === 'copy-script') { try { await navigator.clipboard.writeText(buildWindowsScript(getSelections(state))); notify('CMD-innehållet är kopierat.'); } catch { notify('Kopiering blockerades. Markera texten eller ladda ner filen.'); } }
  else if (action === 'export-text') exportText();
  else if (action === 'export-json') { download('friare-plan.json', JSON.stringify(state, null, 2), 'application/json'); notify('Säkerhetskopian har förberetts för nedladdning.'); }
  else if (action === 'import') $('#import-file').click();
  else if (action === 'sources') showSources();
  else if (action === 'reset') showModal('<h2 id="modal-title">Nollställ din flyttplan?</h2><p class="reset-copy">Dina val och avbockade steg i den här webbläsaren tas bort. Du kan spara en säkerhetskopia först. Dina konton och tjänster påverkas inte.</p><div class="plan-actions"><button class="button secondary" data-action="export-json">Spara säkerhetskopia</button><button class="button danger" data-action="confirm-reset">Nollställ planen</button><button class="button soft" data-action="close-modal">Avbryt</button></div>', 'reset');
  else if (action === 'confirm-reset') { state = createState(false); mailWizard.reset(); save(); renderAll(); $('#modal').close(); notify('Din lokala flyttplan är nollställd.'); }
  else if (action === 'confirm-import' && pendingImport) { state = pendingImport; pendingImport = null; mailWizard.reset(); save(); renderAll(); showPlan(); notify('Din flyttplan är importerad.'); }
});
document.addEventListener('change', event => {
  const input = event.target;
  if (input.dataset.selectService) {
    const id = input.dataset.selectService; toggleService(id, input.checked);
    document.querySelector(`[data-select-service="${id}"]`)?.focus();
  } else if (input.dataset.optionService) {
    const id = input.dataset.optionService, service = findService(id);
    if (!service?.options.some(o => o.id === input.value)) return;
    state.preferences[id] = input.value;
    if (state.selected[id]) state.selected[id] = input.value;
    state.suggested = false; save(); renderAll();
    if ($('#modal').open && modalView === 'guide') { showGuide(id); $('#guide-provider')?.focus(); }
    else document.querySelector(`[data-option-service="${id}"]`)?.focus();
  } else if (input.dataset.step) {
    const key = input.dataset.step, [serviceId,optionId] = key.split(':');
    const service = findService(serviceId); if (!service) return;
    if (input.checked) { state.completed = [...new Set([...state.completed,key])]; state.selected[serviceId] = optionId; }
    else state.completed = state.completed.filter(k => k !== key);
    if (key === 'email:proton-mail:account' && !input.checked) mailWizard.reset();
    state.suggested = false; save(); renderAll();
    input.closest('.guide-step').classList.toggle('done',input.checked);
    const toggle = $('#modal [data-action="toggle-service"]');
    if (toggle) {
      const selected = Boolean(state.selected[serviceId]);
      toggle.className = `button ${selected ? 'soft' : 'primary'}`;
      toggle.innerHTML = `${icon(selected ? 'check' : 'plus')}${selected ? 'I min plan · ta bort' : 'Lägg till i min plan'}`;
    }
  }
});
let pendingImport = null;
$('#import-file').addEventListener('change', async event => {
  const file = event.target.files?.[0]; if (!file) return;
  try {
    if (file.size > 100000) throw new Error('Filen är för stor för att vara en Friare-plan.');
    pendingImport = validateState(JSON.parse(await file.text()));
    const count = getSelections(pendingImport).length;
    showModal(`<h2 id="modal-title">Läs in din sparade plan?</h2><p class="reset-copy">Filen innehåller ${count} ${count === 1 ? 'tjänst' : 'tjänster'}. Den ersätter dina nuvarande lokala val och avbockade steg.</p><div class="plan-actions"><button class="button primary" data-action="confirm-import">Importera planen</button><button class="button secondary" data-action="export-json">Spara nuvarande plan först</button><button class="button soft" data-action="close-modal">Avbryt</button></div>`, 'import');
  } catch (error) { pendingImport = null; notify(error instanceof SyntaxError ? 'Filen kunde inte läsas. Välj en JSON-säkerhetskopia från Friare.' : error.message); }
  event.target.value = '';
});
$('#modal').addEventListener('click', event => {
  if (event.target !== $('#modal')) return;
  const rect = $('#modal').getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('#modal').close();
});
$('#modal').addEventListener('close', () => {
  modalView = null; modalService = null; pendingImport = null;
  const returnTarget = modalOpener?.isConnected ? modalOpener : modalOpenerSelector ? document.querySelector(modalOpenerSelector) : null;
  (returnTarget || $('.header-plan')).focus({preventScroll:true});
  modalOpener = null; modalOpenerSelector = null;
});
hydrateIcons(); renderAll();
if (storageRecovery) notify('Den sparade planen kunde inte läsas. Ett nytt startförslag visas.');

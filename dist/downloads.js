/**
 * Windows actions are an explicit allowlist. Selection data never becomes shell code.
 * Package IDs verified against microsoft/winget-pkgs on 2026-11-11.
 * The generated file is downloaded only; this module never executes commands.
 */
const ACTIONS = Object.freeze({
  'browser:firefox': { type: 'install', name: 'Firefox', packageId: 'Mozilla.Firefox', url: 'https://www.mozilla.org/firefox/new/' },
  'browser:brave': { type: 'install', name: 'Brave', packageId: 'Brave.Brave', url: 'https://brave.com/download/' },
  'passwords:bitwarden': { type: 'install', name: 'Bitwarden', packageId: 'Bitwarden.Bitwarden', url: 'https://bitwarden.com/download/' },
  'drive:proton-drive': { type: 'install', name: 'Proton Drive', packageId: 'Proton.ProtonDrive', url: 'https://proton.me/drive/download' },
  'email:proton-mail': { type: 'guide', name: 'Proton Mail - Gmail-flytt', url: 'https://proton.me/support/switch-from-gmail-to-proton' },
  'email:tuta': { type: 'guide', name: 'Tuta', url: 'https://tuta.com/' },
  'search:duckduckgo': { type: 'guide', name: 'DuckDuckGo', url: 'https://duckduckgo.com/' },
  'search:brave-search': { type: 'guide', name: 'Brave Search', url: 'https://search.brave.com/' },
  'passwords:proton-pass': { type: 'guide', name: 'Proton Pass', url: 'https://proton.me/pass/download' },
  'drive:nextcloud': { type: 'guide', name: 'Nextcloud', url: 'https://nextcloud.com/install/' },
  'photos:ente': { type: 'guide', name: 'Ente Photos', url: 'https://ente.io/download' },
  'photos:immich': { type: 'guide', name: 'Immich', url: 'https://immich.app/' }
});

/** Returns a preview using only supported service/option pairs. */
export function getWindowsActions(selections) {
  if (!Array.isArray(selections)) return [];
  const seen = new Set();
  const actions = [];
  for (const selected of selections) {
    if (!selected || typeof selected.serviceId !== 'string' || typeof selected.optionId !== 'string') continue;
    const key = `${selected.serviceId}:${selected.optionId}`;
    if (!Object.hasOwn(ACTIONS, key) || seen.has(key)) continue;
    seen.add(key);
    actions.push({ serviceId: selected.serviceId, optionId: selected.optionId, ...ACTIONS[key] });
  }
  return actions;
}

function askToOpen(lines, action, label) {
  lines.push(
    `echo Officiell sida: ${action.url}`,
    `choice /C JN /N /M "Oppna sidan for ${action.name}? [J/N] "`,
    `if errorlevel 2 goto ${label}`,
    `if not errorlevel 1 goto ${label}`,
    'cmd /c exit 0',
    `start "" "${action.url}"`,
    `if not errorlevel 1 goto ${label}`,
    'echo Kunde inte oppna webblasaren. Kopiera adressen ovan manuellt.',
    'set "friareFailed=1"'
  );
}

/** Build an inspectable ASCII .cmd file. No external input is interpolated. */
export function buildWindowsScript(selections) {
  const actions = getWindowsActions(selections);
  const lines = [
    '@echo off',
    'setlocal EnableExtensions DisableDelayedExpansion',
    'title Friare - Windows-hjalp',
    'set "friareFailed=0"',
    'echo.',
    'echo FRIARE - byt fran Google i din egen takt',
    'echo =======================================',
    'echo Denna fil fragar fore varje installation och fore varje webbsida.',
    'echo Installationer anvander Windows pakethanterare WinGet.',
    'echo Las eventuella villkor och Windows-dialoger innan du godkanner.',
    'echo Inga Google-program avinstalleras. Inga konton eller filer raderas.',
    'echo Standardappar andras inte. Inga losenord lases eller sparas.',
    'echo Mejl och annan data flyttas av dig hos respektive leverantor.',
    'echo.',
    'echo DIN VALDA HJALP:'
  ];
  if (actions.length === 0) lines.push('echo Inga stodda Windows-atgarder valda. Anvand din flyttplan pa webbsidan.');
  actions.forEach(action => lines.push(action.type === 'install'
    ? `echo - Erbjud installation av ${action.name}: ${action.packageId}`
    : `echo - Erbjud att oppna officiell sida for ${action.name}`));
  actions.forEach((action, index) => {
    const prefix = `friare_${index}`;
    lines.push('echo.', `echo ${index + 1}. ${action.name}`);
    if (action.type === 'guide') {
      askToOpen(lines, action, `${prefix}_end`);
    } else {
      lines.push(
        `echo Paket: ${action.packageId}`,
        `choice /C JN /N /M "Installera ${action.name} med WinGet? [J/N] "`,
        `if errorlevel 2 goto ${prefix}_end`,
        `if not errorlevel 1 goto ${prefix}_end`,
        'where winget.exe >nul 2>&1',
        `if errorlevel 1 goto ${prefix}_missing`,
        `winget.exe install --id ${action.packageId} --exact --source winget`,
        'set "friareExit=%errorlevel%"',
        `if "%friareExit%"=="0" goto ${prefix}_success`,
        `echo WinGet kunde inte bekrafta installationen av ${action.name}. Kod: %friareExit%`,
        'echo Programmet kan redan finnas. Las WinGets meddelande ovan.',
        'set "friareFailed=1"',
        `goto ${prefix}_manual`,
        `:${prefix}_missing`,
        'echo WinGet hittades inte. Ingen installation utfordes.',
        'echo Du kan hamta programmet fran dess officiella webbplats i stallet.',
        'set "friareFailed=1"',
        `:${prefix}_manual`
      );
      askToOpen(lines, action, `${prefix}_end`);
      lines.push(
        `goto ${prefix}_end`,
        `:${prefix}_success`,
        `echo WinGet rapporterade att installationen av ${action.name} ar klar.`,
        'echo Fortsatt med import och installningar enligt din flyttplan.'
      );
    }
    lines.push(`:${prefix}_end`);
  });
  lines.push(
    'echo.',
    'echo Windows-hjalpen har avslutats. Fortsatt i din flyttplan.',
    'echo Att ett program ar installerat betyder inte att din data ar flyttad.',
    'if "%friareFailed%"=="0" goto friare_finish',
    'echo En eller flera atgarder kunde inte bekraftas. Las meddelandena ovan.',
    ':friare_finish',
    'echo Tryck pa valfri tangent for att stanga.',
    'pause >nul',
    'exit /b %friareFailed%',
    ''
  );
  return lines.join('\r\n');
}

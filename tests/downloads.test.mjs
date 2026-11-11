import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// A data URL also works before the parent app's package metadata is written.
const source = await readFile(new URL('../dist/downloads.js', import.meta.url), 'utf8');
const { buildWindowsScript, getWindowsActions } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('selection whitelist rejects unknown IDs and hostile shell text', () => {
  const script = buildWindowsScript([
    { serviceId: 'browser', optionId: 'firefox & calc.exe' },
    { serviceId: 'evil', optionId: 'firefox' },
    { serviceId: '__proto__', optionId: 'constructor' },
    null,
    { serviceId: 'browser', optionId: 'firefox' }
  ]);
  assert.equal((script.match(/^winget\.exe install/gm) || []).length, 1);
  assert.match(script, /--id Mozilla\.Firefox --exact --source winget/);
  assert.doesNotMatch(script, /calc\.exe|__proto__|constructor/);
});

test('selected packages are exact and unselected packages are absent', () => {
  const script = buildWindowsScript([
    { serviceId: 'browser', optionId: 'brave' },
    { serviceId: 'passwords', optionId: 'bitwarden' },
    { serviceId: 'drive', optionId: 'proton-drive' }
  ]);
  for (const id of ['Brave.Brave', 'Bitwarden.Bitwarden', 'Proton.ProtonDrive']) assert.ok(script.includes(`--id ${id} --exact`));
  assert.doesNotMatch(script, /Mozilla\.Firefox/);
});

test('duplicate selections produce only one action and preview is defensive', () => {
  const choice = { serviceId: 'browser', optionId: 'firefox' };
  const actions = getWindowsActions([choice, choice]);
  assert.equal(actions.length, 1);
  actions[0].packageId = 'Other.Package';
  assert.equal(getWindowsActions([choice])[0].packageId, 'Mozilla.Firefox');
  assert.deepEqual(getWindowsActions(undefined), []);
});

test('every installation and opened link has a preceding confirmation', () => {
  const script = buildWindowsScript([
    { serviceId: 'browser', optionId: 'firefox' },
    { serviceId: 'email', optionId: 'proton-mail' }
  ]);
  const lines = script.split('\r\n');
  lines.forEach((line, index) => {
    if (line.startsWith('winget.exe install')) {
      assert.ok(lines.slice(index - 6, index).some(previous => previous.startsWith('choice /C JN')));
      assert.ok(lines.slice(index - 6, index).some(previous => previous.startsWith('if not errorlevel 1 goto')));
    }
    if (line.startsWith('start ""')) {
      assert.ok(lines[index - 4].startsWith('choice /C JN'));
      assert.ok(lines[index - 2].startsWith('if not errorlevel 1 goto'));
      assert.equal(lines[index - 1], 'cmd /c exit 0', 'Clear the choice exit code before detecting launch failure');
    }
  });
});

test('missing winget and nonzero install status never reach a success message', () => {
  const script = buildWindowsScript([{ serviceId: 'browser', optionId: 'firefox' }]);
  assert.match(script, /where winget\.exe >nul 2>&1\r\nif errorlevel 1 goto friare_0_missing/);
  assert.match(script, /set "friareExit=%errorlevel%"\r\nif "%friareExit%"=="0" goto friare_0_success/);
  assert.match(script, /:friare_0_missing\r\n[\s\S]*?set "friareFailed=1"/);
  assert.match(script, /goto friare_0_end\r\n:friare_0_success/);
  assert.match(script, /exit \/b %friareFailed%/);
});

test('output is ASCII CRLF and has no destructive or bypass commands', () => {
  const script = buildWindowsScript([{ serviceId: 'browser', optionId: 'firefox' }]);
  assert.match(script, /^@echo off\r\n/);
  assert.ok([...script].every(char => char.charCodeAt(0) <= 127));
  assert.doesNotMatch(script.replaceAll('\r\n', ''), /[\r\n]/);
  assert.doesNotMatch(script, /(?:^|\r\n)(?:del|erase|rd|rmdir|reg|powershell|curl|bitsadmin|runas)\s/im);
  assert.doesNotMatch(script, /--(?:silent|accept-package-agreements|accept-source-agreements)|executionpolicy|winget(?:\.exe)? uninstall/i);
});

test('empty plan performs no installs or browser launches', () => {
  const script = buildWindowsScript([]);
  assert.doesNotMatch(script, /^winget\.exe|^start ""/m);
  assert.match(script, /Inga stodda Windows-atgarder/);
});

// packages/ui/scripts/guards/bypass.js
// ESM
import { execSync } from 'child_process';

/**
 * Scan for suspicious test-bypass patterns (.only/.skip/etc.) ONLY inside src/.
 * Optional allow-list: ALLOW_BYPASS_PATHS="^packages/ui/src/legacy/,^packages/ui/src/vendor/"
 */
export function scanForBypassPatterns() {
  const allow = (process.env.ALLOW_BYPASS_PATHS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const pattern = [
    // Mocha/Jest/Vitest
    '\\.only\\s*\\(',
    '\\.skip\\s*\\(',
    'describe\\.only',
    'describe\\.skip',
    'it\\.only',
    'it\\.skip',
    'test\\.only',
    'test\\.skip',
    'test\\.todo',
    'vi\\.skipIf',
    'vi\\.runIf',
    // Playwright
    'test\\.fixme',
    // Storybook test runner / feature kill switches
    'SB_DISABLE_TESTS',
    'STORYBOOK_DISABLE',
    // Config-based disabling
    'disableTests\\s*:\\s*true',
    // Older SB story filtering
    'excludeStories',
  ].join('|');

  // Restrict to tracked files under src/** (ignores scripts/, configs, etc.)
  const cmd = `git ls-files -z "src/**" | xargs -0 grep -nEH --color=never ${JSON.stringify(pattern)} || true`;

  let out = '';
  try {
    out = execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
  } catch (e) {
    const stderr = e.stderr?.toString() || '';
    console.error('Bypass pattern scan encountered an error:\n' + stderr);
    process.exit(1);
  }

  if (!out) return;

  const lines = out.split('\n').filter(Boolean);
  const disallowed = lines.filter((line) => {
    if (!allow.length) return true;
    const file = line.split(':', 1)[0] || line;
    return !allow.some((rx) => new RegExp(rx).test(file));
  });

  if (!disallowed.length) return;

  console.error('\nSuspicious test-bypass patterns detected:');
  for (const l of disallowed) console.error(' - ' + l);

  console.error(
    '\nTo fix: remove .only/.skip/test.todo/etc., or set ALLOW_BYPASS_PATHS to ignore specific paths.\n' +
      'Example: ALLOW_BYPASS_PATHS="^packages/ui/src/legacy/"\n',
  );
  process.exit(1);
}

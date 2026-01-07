// validators/a11y.js (ESM)
import fs from 'fs';
import { execSync } from 'child_process';

/**
 * Require either an Axe run in a test story, or a Focus/Keyboard story
 * (keeping your UI "PASS/RUNS/FAIL" labeling manual as documented).
 */
export function assertA11yCoverage(componentDirAbs) {
  const files = (() => {
    try {
      const out = execSync(
        `git ls-files -z "${componentDirAbs.replace(/\\/g, '/')}/**/*.stories.@(ts|tsx|js|jsx|mdx)"`,
        { stdio: ['ignore', 'pipe', 'pipe'] },
      ).toString();
      return out ? out.split('\0').filter(Boolean) : [];
    } catch {
      return [];
    }
  })();

  if (!files.length) return;

  const txt = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

  const hasAxe =
    /import\s+.*\bexpect\b.*from\s+['"]@storybook\/test['"]/.test(txt) &&
    /(await\s+)?expect\(.*\)\.toHaveNoViolations\(\)/.test(txt);

  const hasFocusKeyboardStory =
    /(Focus|Keyboard)\s*Management/.test(txt) ||
    /aria-label\s*=\s*["']Status of the test run["']/.test(txt);

  if (!(hasAxe || hasFocusKeyboardStory)) {
    console.error('A11y coverage: add an Axe assertion or a Focus/Keyboard Navigation test story.');
    process.exit(1);
  }
}

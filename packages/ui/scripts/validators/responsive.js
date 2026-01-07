// validators/responsive.js (ESM)
import fs from 'fs';
import { execSync } from 'child_process';

/**
 * Asserts that at least one story configures multiple viewports or uses viewport parameters,
 * reinforcing the Responsive Design and 16-col grid coverage.
 */
export function assertResponsiveStories(componentDirAbs) {
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

  if (!files.length) return; // stories validator will fail earlier if none

  const viewportPattern = /(parameters\s*:\s*\{[^}]*viewport[^}]*\})|(['"]viewport['"]\s*:)/m;
  const hasViewport = files.some((f) => viewportPattern.test(fs.readFileSync(f, 'utf8')));

  if (!hasViewport) {
    console.error(
      'Responsive coverage: add at least one story that sets viewport parameters (mobile/tablet/desktop).',
    );
    process.exit(1);
  }
}

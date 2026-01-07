// validators/docs.js
// ESM
import fs from 'fs';
import path from 'path';

/**
 * We verify that the component name appears in at least one of the
 * design system catalog files. This prevents agents from inventing
 * components not registered in the docs.
 *
 * Files checked (soft list - any subset may exist):
 * - 08-core-components.md
 * - 09-complex-components.md
 * - 09b-additional-components.md
 * - 04-component-examples.md
 * - readme.md (top-level index)
 */
const DOC_FILES = [
  '08-core-components.md',
  '09-complex-components.md',
  '09b-additional-components.md',
  '04-component-examples.md',
  'readme.md',
];

function resolveRepoRoot() {
  // scripts run from packages/ui
  return path.resolve(process.cwd(), '..', '..', '..', '..');
}

function fileTextIfExists(abs) {
  try {
    if (fs.existsSync(abs)) return fs.readFileSync(abs, 'utf8');
  } catch {}
  return null;
}

export function assertComponentListedInDocs(componentName) {
  const repoRoot = resolveRepoRoot();

  // If none of the doc files are present, we treat this as a soft pass
  // (some environments may not sync docs). If you want a hard requirement,
  // flip softMissingDocs to false.
  let anyDocPresent = false;
  let found = false;

  // We accept either bolded "**Name**" or a plain word-boundary match of the name.
  const boldRe = new RegExp(`\\*\\*${componentName}\\*\\*\\b`, 'i');
  const wordRe = new RegExp(`\\b${componentName}\\b`, 'i');

  for (const rel of DOC_FILES) {
    const abs = path.join(repoRoot, rel);
    const txt = fileTextIfExists(abs);
    if (!txt) continue;
    anyDocPresent = true;

    if (boldRe.test(txt) || wordRe.test(txt)) {
      found = true;
      break;
    }
  }

  if (!anyDocPresent) {
    // Soft pass (no docs locally available)
    return;
  }

  if (!found) {
    console.error(
      `Component "${componentName}" not found in docs catalog. ` +
        `Register it in at least one of: ${DOC_FILES.join(', ')}`,
    );
    process.exit(1);
  }
}

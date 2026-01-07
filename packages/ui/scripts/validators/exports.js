// validators/exports.js (ESM)
import fs from 'fs';
import path from 'path';

/**
 * Ensures component folder exports a public symbol from its index.ts/tsx.
 * Optionally checks a central package export barrel (set CENTRAL_EXPORT to a path).
 */
export function assertFolderBarrelExport(
  componentDirAbs,
  componentName,
  { centralExportPath = null } = {},
) {
  const entry = ['index.ts', 'index.tsx']
    .map((f) => path.join(componentDirAbs, f))
    .find((p) => fs.existsSync(p));

  if (!entry) {
    console.error(`Missing export barrel: expected index.ts or index.tsx in ${componentDirAbs}`);
    process.exit(1);
  }

  const txt = fs.readFileSync(entry, 'utf8');
  // Heuristic: component name appears in an export statement
  const re = new RegExp(
    `export\\s+\\*?\\s*\\{?[^}]*\\b${componentName}\\b[^}]*\\}?\\s*from\\s*['"].\\/`,
    'm',
  );
  const re2 = new RegExp(`export\\s+(?:\\{[^}]*\\}|\\*)\\s*from\\s*['"].\\/`, 'm');
  if (!re.test(txt) && !re2.test(txt)) {
    console.error(
      `index.ts[x] does not appear to export "${componentName}". Ensure it re-exports the symbol.`,
    );
    process.exit(1);
  }

  if (centralExportPath && fs.existsSync(centralExportPath)) {
    const root = fs.readFileSync(centralExportPath, 'utf8');
    const nameRe = new RegExp(`\\b${componentName}\\b`);
    if (!nameRe.test(root)) {
      console.error(
        `Central export barrel does not include "${componentName}". Add it to ${centralExportPath}.`,
      );
      process.exit(1);
    }
  }
}

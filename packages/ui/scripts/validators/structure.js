// validators/structure.js (ESM)
import fs from 'fs';
import path from 'path';

export function assertFolderStructure(componentDirAbs, componentName) {
  const required = [
    `${componentName}.tsx`,
    `${componentName}.stories.tsx`,
    `${componentName}.test.stories.tsx`,
    `${componentName}.types.ts`,
    `tests.md`,
    `track.md`,
    'index.ts', // or index.tsx
  ];

  const present = new Set(fs.readdirSync(componentDirAbs));
  const missing = required.filter(
    (f) => !present.has(f) && !(f === 'index.ts' && present.has('index.tsx')),
  );

  if (missing.length) {
    console.error(
      `Folder structure missing files: ${missing.join(', ')} (see Implementation Guidelines).`,
    );
    process.exit(1);
  }
}

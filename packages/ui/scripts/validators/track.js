// ESM
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const STORY_TITLE_FIELD = 'title';

export function loadTrack(componentDirAbs) {
  const trackPath = path.join(componentDirAbs, 'track.md');
  if (!fs.existsSync(trackPath)) {
    console.error(`track.md not found at ${trackPath}`);
    process.exit(1);
  }
  const md = fs.readFileSync(trackPath, 'utf8');

  const statusMatch = md.match(/\*\*Status\*\*:\s*([^\n\r]+)/i);
  const currentMatch = md.match(/\*\*Current\s*\(BRT\)\*\*:\s*([^\n\r]+)/i);

  // Extract "**Stories**" list inside section "## 5) Storybook Tests"
  const storiesSection = (() => {
    const idx = md.search(/##\s*5\)\s*Storybook Tests/i);
    if (idx < 0) return '';
    const sub = md.slice(idx);
    // Match **Stories** with optional colon and whitespace
    const storiesIdx = sub.search(/\*\*Stories\*\*\s*:?\s*/i);
    if (storiesIdx < 0) return '';
    const after = sub.slice(storiesIdx);
    // Allow matching any heading level (like '###') to find the end of the list.
    // Also match **Stories**: with colon
    const blockMatch = after.match(/\*\*Stories\*\*\s*:?\s*([\s\S]*?)(\n\s*\n|^\s*\*\*|^#)/m);
    return blockMatch ? blockMatch[1] : '';
  })();

  const stories = [];
  if (storiesSection) {
    const lines = storiesSection.split('\n');
    for (const line of lines) {
      // Match list items starting with a hyphen '-' OR asterisk '*'
      // Also handle items without backticks
      const m = line.match(/^\s*[-*]\s*`?([^`]+?)`?\s*$/);
      if (m) {
        const value = m[1].trim();
        if (value.includes('/')) stories.push(value); // e.g. Inputs/Autocomplete/Default
      }
    }
  }

  // Progress Board "planned" tests
  const plannedTests = [];
  const rows = md.split('\n').filter((l) => /^\|/.test(l));
  for (const row of rows) {
    const cols = row.split('|').map((c) => c.trim());
    if (cols.length >= 4 && cols[1] !== 'Test') {
      const testName = cols[1];
      const status = cols[2]?.toLowerCase();
      if (status === 'planned') plannedTests.push(testName);
    }
  }

  return {
    md,
    status: statusMatch ? statusMatch[1].trim() : '',
    current: currentMatch ? currentMatch[1].trim() : '',
    stories,
    plannedTests,
  };
}

function listStoryFiles(componentDirAbs) {
  // Convert absolute path to relative path from cwd for git ls-files
  const relativePath = path.relative(process.cwd(), componentDirAbs);

  try {
    // Try with single-level glob first (git doesn't support ** properly)
    const out = execSync(`git ls-files -z "${relativePath.replace(/\\/g, '/')}/*.stories.*"`, {
      stdio: ['ignore', 'pipe', 'pipe'],
    }).toString();
    return out ? out.split('\0').filter(Boolean) : [];
  } catch {
    try {
      // Fallback: try with double-star (may work in some git versions)
      const out2 = execSync(
        `git ls-files -z "${relativePath.replace(/\\/g, '/')}/**/*.stories.*"`,
        { stdio: ['ignore', 'pipe', 'pipe'] },
      ).toString();
      return out2 ? out2.split('\0').filter(Boolean) : [];
    } catch {
      return [];
    }
  }
}

function grepFile(file, pattern) {
  try {
    const out = execSync(
      `grep -nE --color=never ${JSON.stringify(pattern)} ${JSON.stringify(file)}`,
      { stdio: ['ignore', 'pipe', 'pipe'] },
    ).toString();
    return out.split('\n').filter(Boolean);
  } catch (e) {
    if (e.status === 1) return []; // no match
    throw e;
  }
}

export function checkStoriesDeclaredExist(componentDirAbs, declaredStories) {
  if (!declaredStories.length) {
    console.error('track.md: add a "**Stories**" list under "5) Storybook Tests".');
    process.exit(1);
  }

  const files = listStoryFiles(componentDirAbs);
  if (!files.length) {
    console.error(`No *.stories.* files under ${componentDirAbs}`);
    process.exit(1);
  }

  const problems = [];

  for (const full of declaredStories) {
    const parts = full
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length < 3) {
      problems.push(
        `Invalid story descriptor "${full}". Expected "Category/Component/StoryExport".`,
      );
      continue;
    }
    const metaTitle = parts.slice(0, -1).join('/');
    const exportName = parts.at(-1);

    const titlePattern = `${STORY_TITLE_FIELD}\\s*:\\s*['"]${metaTitle}['"]`;
    const titleMatches = files.filter((f) => grepFile(f, titlePattern).length > 0);

    if (!titleMatches.length) {
      problems.push(`No story file titled '${metaTitle}'.`);
      continue;
    }

    const exportPattern = `export\\s+const\\s+${exportName}\\b`;
    const hasExport = titleMatches.some((f) => grepFile(f, exportPattern).length > 0);
    if (!hasExport)
      problems.push(`Story export "${exportName}" not found in files with title '${metaTitle}'.`);
  }

  if (problems.length) {
    console.error('track.md story checks failed:');
    for (const p of problems) console.error(' - ' + p);
    process.exit(1);
  }
}

export function maybeFailOnPlanned(plannedTests) {
  if (!plannedTests.length) return;
  const msg = `Progress Board still has tests marked "planned": ${plannedTests.join(', ')}`;
  console.warn(msg); // flip to error if you want hard fail
}

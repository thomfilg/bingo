// ESM
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const REQUIRED_STORIES = [
  'Default',
  'AllVariants',
  'AllSizes',
  'AllStates',
  'InteractiveStates',
  'Responsive',
];

const REQUIRED_TEST_STORIES = [
  'BasicInteraction',
  'KeyboardNavigation',
  'ScreenReader',
  'FocusManagement',
  'ResponsiveDesign',
  'ThemeVariations',
  'VisualStates',
  'Performance',
  'EdgeCases',
  'Integration',
];

function repoRootFromGit() {
  try {
    return execSync('git rev-parse --show-toplevel', { stdio: ['ignore','pipe','pipe'] })
      .toString().trim() || null;
  } catch { return null; }
}

// include tracked + untracked (others), respect .gitignore
function listGitFilesUnder(relDir) {
  try {
    const out = execSync(`git ls-files -z -co --exclude-standard ${JSON.stringify(relDir)}`,
      { stdio: ['ignore','pipe','pipe'] }).toString();
    return out ? out.split('\0').filter(Boolean) : [];
  } catch { return []; }
}

function walkStories(absDir, acc = []) {
  const entries = fs.existsSync(absDir) ? fs.readdirSync(absDir, { withFileTypes: true }) : [];
  for (const e of entries) {
    const p = path.join(absDir, e.name);
    if (e.isDirectory()) walkStories(p, acc);
    else if (/\.stories\.(ts|tsx|js|jsx|mdx)$/i.test(e.name)) acc.push(p);
  }
  return acc;
}

function grep(file, pattern) {
  try {
    const out = execSync(
      `grep -nE --color=never ${JSON.stringify(pattern)} ${JSON.stringify(file)}`,
      { stdio: ['ignore','pipe','pipe'] }
    ).toString();
    return out.split('\n').filter(Boolean);
  } catch (e) {
    if (e.status === 1) return []; // no match
    throw e;
  }
}

export function assertStoriesCoverage(componentDirAbs, category, componentName) {
  console.log(`\n📚 Checking stories coverage for ${componentName}...`);
  
  // 1) repo root + rel dir
  const repoRoot = repoRootFromGit() || path.resolve(componentDirAbs, '..', '..', '..', '..');
  const relDir = path.relative(repoRoot, componentDirAbs).replace(/\\/g, '/');

  // 2) get stories via git (tracked + untracked) then fallback to fs walk
  let files = listGitFilesUnder(relDir).map(p => path.join(repoRoot, p))
    .filter(abs => /\.stories\.(ts|tsx|js|jsx|mdx)$/i.test(abs));

  if (!files.length) files = walkStories(componentDirAbs);

  if (!files.length) {
    console.error(`❌ No stories found under ${componentDirAbs}`);
    process.exit(1);
  }

  // Separate regular stories from test stories
  const regularStories = files.filter(f => !f.includes('.test.stories.'));
  const testStories = files.filter(f => f.includes('.test.stories.'));

  console.log(`📁 Found ${files.length} story file(s):`);
  console.log(`   - Regular stories: ${regularStories.length} file(s)`);
  console.log(`   - Test stories: ${testStories.length} file(s)`);

  // Check for required files
  const expectedStoriesFile = path.join(componentDirAbs, `${componentName}.stories.tsx`);
  const expectedTestStoriesFile = path.join(componentDirAbs, `${componentName}.test.stories.tsx`);
  
  const hasStoriesFile = regularStories.some(f => 
    path.basename(f) === `${componentName}.stories.tsx` || 
    path.basename(f) === `${componentName}.stories.ts`
  );
  
  const hasTestStoriesFile = testStories.some(f => 
    path.basename(f) === `${componentName}.test.stories.tsx` || 
    path.basename(f) === `${componentName}.test.stories.ts`
  );

  if (hasStoriesFile) {
    console.log(`✅ ${componentName}.stories.tsx found`);
  } else {
    console.log(`⚠️  ${componentName}.stories.tsx not found (expected at: ${expectedStoriesFile})`);
  }

  if (hasTestStoriesFile) {
    console.log(`✅ ${componentName}.test.stories.tsx found`);
  } else {
    console.log(`⚠️  ${componentName}.test.stories.tsx not found (expected at: ${expectedTestStoriesFile})`);
  }

  // 3) expected CSF title: "Form/Autocomplete" etc.
  const categoryTitle = category.split('-').map(s => s ? s[0].toUpperCase() + s.slice(1) : s).join('');
  const expectedTitle = `${categoryTitle}/${componentName}`;
  const expectedTestTitle = `${categoryTitle}/${componentName}/Tests`;
  
  const titlePattern = `title:\\s*['"]${expectedTitle}['"]`;
  const testTitlePattern = `title:\\s*['"]${expectedTestTitle}['"]`;

  const problems = [];

  // Check regular stories
  console.log(`\n🔍 Checking regular stories (${expectedTitle})...`);
  
  if (!regularStories.length) {
    problems.push(`Missing ${componentName}.stories.tsx file`);
  } else {
    if (!regularStories.some(f => grep(f, titlePattern).length)) {
      problems.push(`Missing CSF title "${expectedTitle}" in regular stories`);
    } else {
      console.log(`   ✓ CSF title "${expectedTitle}" found`);
    }

    if (!regularStories.some(f => grep(f, `tags:.*autodocs`).length)) {
      problems.push(`Missing "tags: ['autodocs']" in regular stories`);
    } else {
      console.log(`   ✓ autodocs tag found`);
    }

    // Check required story exports
    const missingStories = [];
    for (const exp of REQUIRED_STORIES) {
      const re = new RegExp(`export\\s+const\\s+${exp}\\b`);
      const found = regularStories.some(f => re.test(fs.readFileSync(f, 'utf8')));
      if (!found) {
        missingStories.push(exp);
      } else {
        console.log(`   ✓ ${exp} story found`);
      }
    }
    
    if (missingStories.length) {
      problems.push(`Missing required story exports in regular stories: ${missingStories.join(', ')}`);
    }
  }

  // Check test stories
  console.log(`\n🧪 Checking test stories (${expectedTestTitle})...`);
  
  if (!testStories.length) {
    problems.push(`Missing ${componentName}.test.stories.tsx file`);
    console.log(`   ⚠️  No test stories file found`);
  } else {
    if (!testStories.some(f => grep(f, testTitlePattern).length)) {
      // Also check for alternative title format without /Tests
      const altTestTitlePattern = `title:\\s*['"]${expectedTitle}/Tests['"]`;
      if (!testStories.some(f => grep(f, altTestTitlePattern).length)) {
        problems.push(`Missing CSF title "${expectedTestTitle}" in test stories`);
      } else {
        console.log(`   ✓ CSF title with /Tests found`);
      }
    } else {
      console.log(`   ✓ CSF title "${expectedTestTitle}" found`);
    }

    if (!testStories.some(f => grep(f, `tags:.*test`).length)) {
      console.log(`   ⚠️  'test' tag not found in test stories (recommended but not required)`);
    } else {
      console.log(`   ✓ 'test' tag found`);
    }

    // Check required test story exports
    const missingTests = [];
    let foundTests = 0;
    for (const exp of REQUIRED_TEST_STORIES) {
      const re = new RegExp(`export\\s+const\\s+${exp}\\b`);
      const found = testStories.some(f => re.test(fs.readFileSync(f, 'utf8')));
      if (!found) {
        missingTests.push(exp);
      } else {
        foundTests++;
        console.log(`   ✓ ${exp} test found`);
      }
    }
    
    if (foundTests === 0) {
      problems.push(`No test stories found. Expected at least some of: ${REQUIRED_TEST_STORIES.join(', ')}`);
    } else if (missingTests.length === REQUIRED_TEST_STORIES.length) {
      problems.push(`None of the required test stories found`);
    } else if (missingTests.length > 0) {
      console.log(`   ℹ️  Missing test stories (optional): ${missingTests.join(', ')}`);
    }
  }

  // Summary
  console.log(`\n📊 Summary:`);
  if (problems.length) {
    console.error('❌ Stories coverage issues found:\n' + problems.map(p => '   • ' + p).join('\n'));
    process.exit(1);
  } else {
    console.log('✅ All required stories and tests are present!');
  }
}

// Allow running directly for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, componentDir, category, componentName] = process.argv;
  if (!componentDir || !category || !componentName) {
    console.error('Usage: node assertStoriesCoverage.js <componentDir> <category> <componentName>');
    process.exit(1);
  }
  assertStoriesCoverage(path.resolve(componentDir), category, componentName);
}
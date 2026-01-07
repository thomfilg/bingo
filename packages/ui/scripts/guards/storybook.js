import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const pathCache = new Map();
const binCache = new Map();

function binPath(bin) {
  if (!binCache.has(bin)) {
    const binName = process.platform === 'win32' ? `${bin}.cmd` : bin;
    binCache.set(bin, path.join(process.cwd(), 'node_modules', '.bin', binName));
  }
  return binCache.get(bin);
}

function exists(p) {
  if (!pathCache.has(p)) {
    try { 
      fs.accessSync(p, fs.constants.X_OK); 
      pathCache.set(p, true);
    } catch { 
      pathCache.set(p, false);
    }
  }
  return pathCache.get(p);
}

// Get stories that match a specific tag by parsing the stories
function getStoriesWithTag(tag) {
  const storiesDir = path.join(process.cwd(), 'src');
  const storyFiles = [];
  
  function findStories(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        findStories(fullPath);
      } else if (file.endsWith('.stories.tsx') || file.endsWith('.stories.ts') || file.endsWith('.stories.jsx') || file.endsWith('.stories.js')) {
        // Read file and check for the tag
        const content = fs.readFileSync(fullPath, 'utf8');
        // Look for tags in the default export or meta object
        if (content.includes(`'${tag}'`) || content.includes(`"${tag}"`) || content.includes(`\`${tag}\``)) {
          storyFiles.push(fullPath);
        }
      }
    }
  }
  
  try {
    findStories(storiesDir);
  } catch (e) {
    console.error('Error finding stories:', e);
  }
  
  return storyFiles;
}

export async function pingStorybook(url) {
  if (process.env.SKIP_STORYBOOK_PING === 'true') return;
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeout);
    return;
  } catch {
    const curl = exists(binPath('curl')) ? binPath('curl') : 'curl';
    const res = spawnSync(curl, ['-sSfI', url], { stdio: 'ignore' });
    if (res.status !== 0) {
      const v = spawnSync(curl, ['-vL', url], { encoding: 'utf8' });
      if (v.stdout) console.error(v.stdout);
      if (v.stderr) console.error(v.stderr);
      console.error(`Unable to reach Storybook at ${url}`);
      process.exit(1);
    }
  }
}

function run(command, args, env = {}) {
  console.error(`\n> Running: ${[command, ...args].join(' ')}\n`);
  const res = spawnSync(command, args, { 
    stdio: 'inherit', 
    env: { ...process.env, ...env }
  });
  return res.status ?? 1;
}

export function runStorybookTestsFailFast(url, tag, watchMode = false) {
  const testStorybookBin = binPath('test-storybook');
  const storybookBin = binPath('storybook');
  
  const watchArgs = watchMode ? ['--watch'] : [];

  if (exists(testStorybookBin)) {
    const args = ['--url', url, ...watchArgs];
    
    // If we have a tag, try to optimize by passing specific files
    if (tag && String(tag).trim() && !watchMode) {
      const taggedStories = getStoriesWithTag(tag);
      
      if (taggedStories.length === 0) {
        console.error(`No stories found with tag: ${tag}`);
        process.exit(0);
      }
      
      console.error(`Found ${taggedStories.length} story file(s) with tag "${tag}"`);
      
      // IMPORTANT: test-storybook passes extra args to Jest
      // We can pass the file paths directly as positional arguments
      // This tells Jest to only run these specific test files
      args.push(...taggedStories);
      
      // Still include the tag filter to ensure only tagged stories run within those files
      args.push('--includeTags', String(tag));
    } else if (tag) {
      args.push('--includeTags', String(tag));
    }
    
    if (!watchMode) {
      args.push('--ci');
      const maxWorkers = process.env.MAX_WORKERS || '4';
      args.push('--maxWorkers', maxWorkers);
      
      if (process.env.TEST_TIMEOUT) {
        args.push('--testTimeout', process.env.TEST_TIMEOUT);
      }
      
      if (process.env.COVERAGE === 'true') {
        args.push('--coverage');
      }
      
      if (process.env.SHARD) {
        args.push('--shard', process.env.SHARD);
      }
    }
    
    const code = run(testStorybookBin, args);
    if (code !== 0) {
      console.error('\n❌ test-storybook failed. See logs above.');
      process.exit(code);
    }
    return;
  }

  // Fallback for storybook CLI
  if (exists(storybookBin)) {
    const args = ['test', '--url', url];
    
    if (!watchMode && process.env.COVERAGE !== 'true') {
      args.push('--coverage=false');
    }
    
    if (tag && String(tag).trim()) {
      args.push('--includeTags', String(tag));
    }
    
    args.push(...watchArgs);
    
    const code = run(storybookBin, args);
    if (code !== 0) {
      console.error('\n❌ storybook test failed. See logs above.');
      process.exit(code);
    }
    return;
  }

  // Error handling
  const bins = (() => {
    try {
      return fs.readdirSync(path.join(process.cwd(), 'node_modules', '.bin')).sort().join('\n  ');
    } catch {
      return '(node_modules/.bin not found — did you run pnpm install?)';
    }
  })();

  console.error(
    [
      'No Storybook test runner executable found in node_modules/.bin.',
      '',
      'Try:',
      '  pnpm install',
      '  pnpm add -D @storybook/test-runner @storybook/test',
      '',
      `Then this should exist: ${testStorybookBin}`,
      '',
      'Current node_modules/.bin contents:',
      `  ${bins}`,
    ].join('\n')
  );
  process.exit(1);
}
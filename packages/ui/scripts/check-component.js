#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import os from 'os';

// Cache Management
import { 
    isCacheValid, 
    updateCache, 
    saveCache, 
    getCacheEntry,
    setupCacheCleanup 
} from './helpers/cache.js';

// Error Handling
import { extractFailureReason } from './helpers/error.js';

// Guard and Validator Imports
import { assertAllowedChangeScope } from './guards/changeScope.js';
import { scanForBypassPatterns } from './guards/byPass.js';
import { pingStorybook, runStorybookTestsFailFast } from './guards/storybook.js';
import { loadTrack, checkStoriesDeclaredExist } from './validators/track.js';
import { assertComponentListedInDocs } from './validators/docs.js';
import { assertFolderBarrelExport } from './validators/exports.js';
import { assertStoriesCoverage } from './validators/storiesCoverage.js';
import { assertDesignTokensUsage } from './validators/tokens.js';
import { assertResponsiveStories } from './validators/responsive.js';
import { assertA11yCoverage } from './validators/a11y.js';
import { assertFolderStructure } from './validators/structure.js';
import { checkEslintBypass } from './validators/lint.js';

// Setup cache cleanup handlers
setupCacheCleanup();

// ---- Command Line Options Parser ----
function parseArgs(args) {
    const options = {
        category: null,
        component: null,
        singleCheck: null,
        skipCache: false,
        noCache: false,
        skipStorybookPing: false,
        parallel: true,
        maxWorkers: '4',
        batchMode: false,
        storybookUrl: 'http://192.168.166.133:6008',
        testTimeout: null,
        coverage: false,
        shard: null,
        verbose: false,
        help: false,
        cleanupTsconfig: true,
        cacheMaxAge: 24 * 60 * 60 * 1000, // 24 hours in ms
        allowBypassPaths: '',
        tasksFile: null,
        centralExport: null
    };

    let i = 0;
    while (i < args.length) {
        const arg = args[i];
        
        // Help
        if (arg === '--help' || arg === '-h') {
            options.help = true;
            return options;
        }
        
        // Options with values
        if (arg === '--storybook-url' && i + 1 < args.length) {
            options.storybookUrl = args[++i];
        } else if (arg === '--max-workers' && i + 1 < args.length) {
            options.maxWorkers = args[++i];
        } else if (arg === '--test-timeout' && i + 1 < args.length) {
            options.testTimeout = args[++i];
        } else if (arg === '--shard' && i + 1 < args.length) {
            options.shard = args[++i];
        } else if (arg === '--cache-max-age' && i + 1 < args.length) {
            options.cacheMaxAge = parseInt(args[++i]) || options.cacheMaxAge;
        } else if (arg === '--allow-bypass-paths' && i + 1 < args.length) {
            options.allowBypassPaths = args[++i];
        } else if (arg === '--tasks-file' && i + 1 < args.length) {
            options.tasksFile = args[++i];
        } else if (arg === '--central-export' && i + 1 < args.length) {
            options.centralExport = args[++i];
        }
        // Boolean flags
        else if (arg === '--skip-cache') {
            options.skipCache = true;
        } else if (arg === '--no-cache') {
            options.noCache = true;
        } else if (arg === '--skip-storybook-ping') {
            options.skipStorybookPing = true;
        } else if (arg === '--no-parallel') {
            options.parallel = false;
        } else if (arg === '--batch-mode') {
            options.batchMode = true;
        } else if (arg === '--coverage') {
            options.coverage = true;
        } else if (arg === '--verbose' || arg === '-v') {
            options.verbose = true;
        } else if (arg === '--no-cleanup-tsconfig') {
            options.cleanupTsconfig = false;
        }
        // Positional arguments
        else if (!arg.startsWith('-')) {
            if (!options.category) {
                options.category = arg;
            } else if (!options.component) {
                options.component = arg;
            } else if (!options.singleCheck) {
                options.singleCheck = arg;
            }
        }
        // Unknown option
        else {
            console.error(`Unknown option: ${arg}`);
            console.error('Run with --help for usage information');
            process.exit(1);
        }
        
        i++;
    }
    
    return options;
}

function showHelp() {
    console.log(`
Usage: pnpm check:component [options] <category> <ComponentName> [check_name]

Arguments:
  category         Component category (e.g., 'form', 'enhanced', 'complex')
  ComponentName    Component name (e.g., 'Button', 'AddressAutocomplete')
  check_name       Optional: Run only a specific check

Options:
  --skip-cache             Skip cache, force full check
  --no-cache               Disable cache completely (alias for skip-cache)
  --skip-storybook-ping    Skip Storybook reachability check
  --no-parallel            Disable parallel execution mode
  --batch-mode             Running from batch script (reduces output)
  --coverage               Enable test coverage reporting
  --verbose, -v            Verbose output
  --no-cleanup-tsconfig    Don't cleanup generated tsconfig files
  --help, -h               Show this help message

  --storybook-url <url>    Storybook URL (default: http://192.168.166.133:6008)
  --max-workers <n>        Maximum parallel workers (default: 4)
  --test-timeout <ms>      Test timeout in milliseconds
  --shard <spec>           Test shard specification (e.g., 1/3)
  --cache-max-age <ms>     Cache max age in ms (default: 86400000 = 24h)
  --allow-bypass-paths <paths>  Comma-separated paths to allow bypass patterns
  --tasks-file <path>      Path to tasks file
  --central-export <path>  Path to central export barrel file

Available checks:
  scope              Change-scope guard
  structure          Folder structure
  export             Barrel export
  tokens             Design tokens usage
  tasks              components.tasks.md entry check
  docs               Docs catalog check
  track              track.md validation
  tsc                TypeScript check (scoped)
  lint-bypass        ESLint bypass pattern check
  lint-fix           ESLint fix (scoped)
  build              tsup build (scoped)
  lint-verify        ESLint verify (scoped)
  storybook-ping     Storybook reachability
  stories-coverage   Stories coverage
  responsive         Responsive story present
  a11y               Accessibility coverage
  storybook-tests    Storybook tests
  bypass             Test-bypass pattern scan

Examples:
  pnpm check:component form Button
  pnpm check:component enhanced AddressAutocomplete --skip-cache
  pnpm check:component complex DataGrid tsc --no-parallel
  pnpm check:component form Input --storybook-url http://localhost:6006
`);
}

// ---- Helpers ----

const run = (cmd, env = {}) => execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });

// Cache for file system operations
const fsCache = new Map();

const cachedFileExists = (p) => {
  if (!fsCache.has(p)) {
    try {
      fs.accessSync(p, fs.constants.F_OK);
      fsCache.set(p, true);
    } catch {
      fsCache.set(p, false);
    }
  }
  return fsCache.get(p);
};

// ---- Robust Cleanup ----
const tempFiles = new Set();
const cleanupTempFiles = () => {
    for (const file of tempFiles) {
        try {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        } catch {} // Ignore errors during cleanup
    }
    tempFiles.clear();
};

// Ensure cleanup runs on normal exit or interruption (Ctrl+C)
process.on('exit', cleanupTempFiles);
process.on('SIGINT', () => {
    cleanupTempFiles();
    process.exit();
});

// ---- Core Logic ----

/**
 * Defines all the check commands to be run for a component.
 */
function defineChecks(category, component, componentDir, options) {
    const PKG_UI = process.cwd();

    // Set environment variables based on options for backward compatibility
    if (options.skipCache || options.noCache) process.env.SKIP_CACHE = 'true';
    if (options.skipStorybookPing) process.env.SKIP_STORYBOOK_PING = 'true';
    if (options.batchMode) process.env.BATCH_MODE = 'true';
    if (options.maxWorkers) process.env.MAX_WORKERS = options.maxWorkers;
    if (options.testTimeout) process.env.TEST_TIMEOUT = options.testTimeout;
    if (options.coverage) process.env.COVERAGE = 'true';
    if (options.shard) process.env.SHARD = options.shard;
    if (options.verbose) process.env.VERBOSE = 'true';
    if (options.allowBypassPaths) process.env.ALLOW_BYPASS_PATHS = options.allowBypassPaths;
    if (options.tasksFile) process.env.TASKS_FILE = options.tasksFile;
    if (options.centralExport) process.env.CENTRAL_EXPORT = options.centralExport;
    if (!options.cleanupTsconfig) process.env.CLEANUP_TSCONFIG = 'false';
    if (options.cacheMaxAge) process.env.CACHE_MAX_AGE = options.cacheMaxAge.toString();

    return [
        { name: 'scope', description: "Change-scope guard", func: () => assertAllowedChangeScope() },
        { name: 'structure', description: "Folder structure", func: () => assertFolderStructure(componentDir, component) },
        { name: 'export', description: "Barrel export", func: () => assertFolderBarrelExport(componentDir, component, { 
            centralExportPath: options.centralExport 
        }) },
        { name: 'tokens', description: "Design tokens usage", func: () => assertDesignTokensUsage(componentDir) },
        { name: 'docs', description: "Docs catalog check", func: () => assertComponentListedInDocs(component) },
        { name: 'track', description: "track.md validation", func: () => {
            const track = loadTrack(componentDir);
            checkStoriesDeclaredExist(componentDir, track.stories);
        }},
        { name: 'tsc', description: "TypeScript check (scoped)", func: () => {
            if (!cachedFileExists(componentDir)) {
                console.error(`Component directory not found: ${componentDir}`);
                process.exit(1);
            }
            
            // Use temp config method which properly handles globs
            const tempPath = path.join(
                PKG_UI,
                `tsconfig.temp.${Math.random().toString(36).slice(2, 8)}.json`,
            );
            tempFiles.add(tempPath);

            const tempConfig = {
                extends: './tsconfig.json',
                include: [`src/components/${category}/${component}/**/*`],
                exclude: ['node_modules', '**/*.stories.tsx', '**/*.test.tsx']
            };
            fs.writeFileSync(tempPath, JSON.stringify(tempConfig, null, 2));

            try {
                run(`npx tsc --project ${path.basename(tempPath)} --noEmit`);
            } finally {
                try {
                    fs.unlinkSync(tempPath);
                    tempFiles.delete(tempPath);
                } catch {}
            }
        }},
        { name: 'lint-bypass',   description: "ESLint bypass pattern check",  func: () => checkEslintBypass(componentDir) },
        { name: 'lint-fix', description: "ESLint fix (scoped)", func: () => run(`npx eslint "src/components/${category}/${component}/**/*.{ts,tsx}" --fix`) },
        { name: 'build', description: "tsup build (scoped)", func: () => {
            const entry = ['index.tsx', 'index.ts'].map((f) => path.join(componentDir, f)).find((p) => cachedFileExists(p)) || null;
            if (!entry) {
                console.error('Missing entry: expected index.tsx or index.ts in component folder.');
                process.exit(1);
            }
            run(`npx tsup "${entry}" --config tsup.config.ts`);
        }},
        { name: 'lint-verify', description: "ESLint verify (scoped)", func: () => run(`npx eslint "src/components/${category}/${component}/**/*.{ts,tsx}" --max-warnings 0`) },
        { name: 'storybook-ping', description: "Storybook reachability", func: async () => {
            // Skip if already pinged (e.g., from batch script)
            if (options.skipStorybookPing) {
                console.log('  ↳ Skipping (already verified)');
                return;
            }
            await pingStorybook(options.storybookUrl);
        }},
        { name: 'stories-coverage', description: "Stories coverage", func: () => assertStoriesCoverage(componentDir, category, component) },
        { name: 'responsive', description: "Responsive story present", func: () => assertResponsiveStories(componentDir) },
        { name: 'a11y', description: "Accessibility coverage", func: () => assertA11yCoverage(componentDir) },
        { name: 'storybook-tests', description: "Storybook tests", func: () => runStorybookTestsFailFast(options.storybookUrl, `component:${component}`) },
        { name: 'bypass', description: "Test-bypass pattern scan", func: () => scanForBypassPatterns() },
    ];
}

/**
 * Executes checks with smart parallelization based on dependencies
 */
async function runChecksParallel(checks) {
    const checkMap = Object.fromEntries(checks.map(c => [c.name, c]));
    
    // Define execution phases with dependencies
    const phases = [
        {
            name: 'Initial validations',
            parallel: true,
            checks: ['scope', 'structure', 'export', 'tokens', 'tasks', 'docs', 'track']
        },
        {
            name: 'TypeScript compilation',
            parallel: false,
            checks: ['tsc']
        },
        {
            name: 'Code formatting',
            parallel: false,
            checks: ['lint-bypass', 'lint-fix']
        },
        {
            name: 'Build and verification',
            parallel: true,
            checks: ['build', 'lint-verify']
        },
        {
            name: 'Storybook validations',
            parallel: true,
            checks: ['storybook-ping', 'stories-coverage', 'responsive', 'a11y']
        },
        {
            name: 'Integration tests',
            parallel: false,
            checks: ['storybook-tests', 'bypass']
        }
    ];
    
    let totalExecuted = 0;
    const totalChecks = checks.length;
    
    for (const [phaseIndex, phase] of phases.entries()) {
        console.log(`\n[Phase ${phaseIndex + 1}/6] ${phase.name}`);
        console.time(`${phase.name} time`);
        const phaseChecks = phase.checks.filter(name => checkMap[name]);
        if (phaseChecks.length === 0) continue;
        
        if (phase.parallel) {
            // Run checks in parallel
            const promises = phaseChecks.map(async (name) => {
                const check = checkMap[name];
                console.log(`  ↳ Running: ${check.description}`);
                try {
                    await check.func();
                    console.log(`  ✔ Completed: ${check.description}`);
                } catch (error) {
                    console.error(`  ✗ Failed: ${check.description}`);
                    throw error;
                }
                totalExecuted++;
            });
            
            await Promise.all(promises);
        } else {
            // Run checks sequentially
            for (const name of phaseChecks) {
                const check = checkMap[name];
                console.log(`  ↳ Running: ${check.description}`);
                await check.func();
                console.log(`  ✔ Completed: ${check.description}`);
                totalExecuted++;
            }
        }
        
        console.log(`  Phase complete (${totalExecuted}/${totalChecks} checks done)`);
    }
}

/**
 * Executes checks sequentially (fallback mode)
 */
async function runChecksSequential(checks) {
    for (const [index, { description, func }] of checks.entries()) {
        console.log(`\n[${index + 1}/${checks.length}] ${description}`);
        await func();
    }
}

/**
 * Main script entry point.
 */
async function execute() {
    // ---- Parse command line arguments ----
    const options = parseArgs(process.argv.slice(2));
    
    if (options.help) {
        showHelp();
        process.exit(0);
    }
    
    if (!options.category || !options.component) {
        console.error('Error: Missing required arguments');
        console.error('Usage: pnpm check:component [options] <category> <ComponentName> [check_name]');
        console.error('Run with --help for more information');
        process.exit(1);
    }

    // ---- Constants ----
    const PKG_UI = process.cwd();
    const componentDir = path.join(PKG_UI, 'src', 'components', options.category, options.component);

    console.log(`Checking ${options.component} in ${options.category} ...`);
    
    // Check cache validity (only for full runs, not single checks)
    if (!options.singleCheck && !(options.skipCache || options.noCache) && await isCacheValid(options.category, options.component, componentDir)) {
        const cached = getCacheEntry(options.category, options.component);
        const ageMinutes = Math.floor((Date.now() - cached.timestamp) / 60000);
        console.log(`\n✅ ${options.component} component check complete (from cache, ${ageMinutes} minutes old).`);
        console.log(`   Reason: ${cached.reason}`);
        console.log(`   To force re-check, use: pnpm check:component ${options.category} ${options.component} --skip-cache`);
        return;
    }
    
    // Determine execution mode
    const parallelMode = options.parallel && !options.singleCheck;
    if (parallelMode) {
        console.log(`Running in parallel mode (${os.cpus().length} CPU cores available)`);
    }

    // ---- Execution ----
    let checksPassed = true;
    let failureReason = '';
    
    try {
        const allChecks = defineChecks(options.category, options.component, componentDir, options);
        let checksToRun = allChecks;

        if (options.singleCheck) {
            const checkToRun = allChecks.find(c => c.name === options.singleCheck);
            if (!checkToRun) {
                console.error(`\n❌ Error: Unknown check "${options.singleCheck}".`);
                console.error('Available checks are:');
                allChecks.forEach(c => console.error(` - ${c.name}`));
                process.exit(1);
            }
            checksToRun = [checkToRun];
            console.log(`Running single check: ${options.singleCheck}`);
        }

        const startTime = Date.now();
        
        if (parallelMode) {
            await runChecksParallel(checksToRun);
        } else {
            await runChecksSequential(checksToRun);
        }
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n✅ ${options.component} component check complete (${duration}s).`);
        
        // Update cache on success (only for full runs)
        if (!options.singleCheck && !(options.skipCache || options.noCache)) {
            await updateCache(options.category, options.component, componentDir, 'PASS', 'All checks passed');
            saveCache();
        }
    } catch (e) {
        checksPassed = false;
        failureReason = extractFailureReason(e);
        console.error(`\n❌ Check failed for ${options.component}`);
        console.error(e);
        
        // Update cache on failure (only for full runs)
        if (!options.singleCheck && !(options.skipCache || options.noCache)) {
            await updateCache(options.category, options.component, componentDir, 'FAIL', failureReason);
            saveCache();
        }
        
        process.exit(1);
    }
}

async function main() {
    console.log('Starting component check...');
    console.time('Total check time');
    await execute();
    console.timeEnd('Total check time');
}

main();
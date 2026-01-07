#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { pingStorybook } from './guards/storybook.js';
import os from 'os';

import {
    loadCache,
    getComponentHashByName,
    getAllCacheEntries,
    setupCacheCleanup
} from './helpers/cache.js';

// Error Handling
import { extractFailureReason } from './helpers/error.js';

const execAsync = promisify(exec);

const PKG_UI = process.cwd();

// Track created tsconfig files for cleanup
global.createdTsConfigFiles = new Set();

// Setup cache cleanup handlers
setupCacheCleanup();

// ---- Command Line Options Parser ----
function parseArgs(args) {
    const options = {
        skipCache: false,
        noCache: false,
        cleanupTsconfig: true,
        concurrency: null,
        maxWorkers: '4',
        checkTimeout: 45000,
        cacheMaxAge: 24 * 60 * 60 * 1000, // 24 hours in ms
        storybookUrl: 'http://192.168.166.133:6008',
        skipStorybookPing: false,
        parallel: true,
        verbose: false,
        outputFile: 'status.md',
        help: false,
        filter: null, // Filter components by pattern
        category: null, // Filter by category
        failFast: false, // Stop on first failure
        dryRun: false, // Show what would be checked without running
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
        if (arg === '--concurrency' && i + 1 < args.length) {
            options.concurrency = parseInt(args[++i]);
        } else if (arg === '--max-workers' && i + 1 < args.length) {
            options.maxWorkers = args[++i];
        } else if (arg === '--check-timeout' && i + 1 < args.length) {
            options.checkTimeout = parseInt(args[++i]);
        } else if (arg === '--cache-max-age' && i + 1 < args.length) {
            options.cacheMaxAge = parseInt(args[++i]) || options.cacheMaxAge;
        } else if (arg === '--storybook-url' && i + 1 < args.length) {
            options.storybookUrl = args[++i];
        } else if (arg === '--output' && i + 1 < args.length) {
            options.outputFile = args[++i];
        } else if (arg === '--filter' && i + 1 < args.length) {
            options.filter = args[++i];
        } else if (arg === '--category' && i + 1 < args.length) {
            options.category = args[++i];
        }
        // Boolean flags
        else if (arg === '--skip-cache') {
            options.skipCache = true;
        } else if (arg === '--no-cache') {
            options.noCache = true;
        } else if (arg === '--no-cleanup-tsconfig') {
            options.cleanupTsconfig = false;
        } else if (arg === '--skip-storybook-ping') {
            options.skipStorybookPing = true;
        } else if (arg === '--no-parallel') {
            options.parallel = false;
        } else if (arg === '--verbose' || arg === '-v') {
            options.verbose = true;
        } else if (arg === '--fail-fast') {
            options.failFast = true;
        } else if (arg === '--dry-run') {
            options.dryRun = true;
        }
        // Unknown option
        else if (arg.startsWith('-')) {
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
Usage: pnpm batch:check [options]

Options:
  --skip-cache             Skip cache, force full check for all components
  --no-cache               Disable cache completely (alias for skip-cache)
  --no-cleanup-tsconfig    Don't cleanup generated tsconfig files
  --skip-storybook-ping    Skip initial Storybook reachability check
  --no-parallel            Disable parallel execution mode
  --verbose, -v            Verbose output
  --fail-fast              Stop on first component failure
  --dry-run                Show what would be checked without running
  --help, -h               Show this help message

  --concurrency <n>        Max concurrent checks (default: CPU count, max 4)
  --max-workers <n>        Max workers for tests (default: 4)
  --check-timeout <ms>     Timeout for each check in ms (default: 45000)
  --cache-max-age <ms>     Cache max age in ms (default: 86400000 = 24h)
  --storybook-url <url>    Storybook URL (default: http://192.168.166.133:6008)
  --output <file>          Output report file (default: status.md)
  --filter <pattern>       Filter components by pattern (regex)
  --category <name>        Check only components in specified category

Examples:
  pnpm batch:check
  pnpm batch:check --skip-cache
  pnpm batch:check --concurrency 8 --verbose
  pnpm batch:check --category form
  pnpm batch:check --filter "^Button|Input$"
  pnpm batch:check --fail-fast --no-parallel
`);
}

// Analyze component complexity for smart batching
async function analyzeComponentComplexity(component) {
    const componentPath = path.join(PKG_UI, 'src', 'components', component.category, component.name);
    
    try {
        const files = await fs.promises.readdir(componentPath, { recursive: true });
        const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
        const hasStories = files.some(f => f.includes('.stories.'));
        const hasTests = files.some(f => f.includes('.test.') || f.includes('.spec.'));
        const hasMultipleExports = files.filter(f => f.endsWith('index.ts') || f.endsWith('index.tsx')).length > 1;
        
        // Calculate complexity score
        const complexity = 
            tsFiles.length * 2 + 
            (hasStories ? 10 : 0) + 
            (hasTests ? 10 : 0) + 
            (hasMultipleExports ? 5 : 0);
        
        return {
            ...component,
            complexity,
            fileCount: files.length,
            tsFileCount: tsFiles.length
        };
    } catch (error) {
        return {
            ...component,
            complexity: 10, // Default complexity for error cases
            fileCount: 0,
            tsFileCount: 0
        };
    }
}

// Cleanup function for tsconfig files
async function cleanupTsConfigFiles() {
    if (!global.createdTsConfigFiles || global.createdTsConfigFiles.size === 0) {
        return;
    }
    
    console.log('\n🧹 Cleaning up generated tsconfig files...');
    
    for (const filePath of global.createdTsConfigFiles) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`  ✅ Deleted: ${path.relative(PKG_UI, filePath)}`);
            }
        } catch (error) {
            console.error(`  ❌ Failed to delete: ${path.relative(PKG_UI, filePath)}`);
        }
    }
    
    global.createdTsConfigFiles.clear();
}

// Get all component directories with optional filters
function getAllComponents(options) {
    const componentsDir = path.join(PKG_UI, 'src', 'components');
    
    if (!fs.existsSync(componentsDir)) {
        console.error(`❌ Components directory not found: ${componentsDir}`);
        return [];
    }
    
    const categories = fs.readdirSync(componentsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const components = [];
    for (const category of categories) {
        // Apply category filter if specified
        if (options.category && category !== options.category) {
            continue;
        }
        
        const categoryPath = path.join(componentsDir, category);
        const componentNames = fs.readdirSync(categoryPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        
        for (const componentName of componentNames) {
            // Apply name filter if specified
            if (options.filter) {
                const regex = new RegExp(options.filter);
                if (!regex.test(componentName)) {
                    continue;
                }
            }
            
            components.push({ category, name: componentName });
        }
    }
    return components;
}

// Run check for a single component with caching
async function runComponentCheck(category, componentName, options) {
    const componentPath = path.join(PKG_UI, 'src', 'components', category, componentName);
    const tsconfigPath = path.join(componentPath, 'tsconfig.json');
    const cacheKey = `${category}/${componentName}`;
    
    // Load cache
    const cache = getAllCacheEntries();
    
    // Check cache if enabled
    if (!options.skipCache && !options.noCache) {
        const hash = await getComponentHashByName(category, componentName);
        const cached = cache[cacheKey];
        
        if (cached && cached.hash === hash && cached.status === 'PASS') {
            const age = Date.now() - cached.timestamp;
            
            if (age < options.cacheMaxAge) {
                console.log(`✅ ${cacheKey}: CACHED PASS (unchanged)`);
                return { 
                    status: 'PASS', 
                    reason: 'Cached - no changes detected',
                    cached: true 
                };
            }
        }
    }
    
    // Track if a tsconfig file gets created
    const tsconfigExistedBefore = fs.existsSync(tsconfigPath);
    
    try {
        console.log(`🔍 Checking ${category}/${componentName}...`);
        
        // Build command with options
        const cmdArgs = [category, componentName];
        if (options.skipCache || options.noCache) cmdArgs.push('--skip-cache');
        if (options.skipStorybookPing) cmdArgs.push('--skip-storybook-ping');
        if (!options.parallel) cmdArgs.push('--no-parallel');
        if (options.maxWorkers) cmdArgs.push('--max-workers', options.maxWorkers);
        if (options.verbose) cmdArgs.push('--verbose');
        
        const cmd = `pnpm check:component ${cmdArgs.join(' ')}`;
        
        // Execute check with optimizations
        const { stdout, stderr } = await execAsync(cmd, {
            cwd: PKG_UI,
            encoding: 'utf-8',
            maxBuffer: 1024 * 1024 * 10, // 10MB
            timeout: options.checkTimeout,
            env: { 
                ...process.env,
                BATCH_MODE: 'true' // Indicate this is running from batch script
            }
        });
        
        // Track created tsconfig
        if (!tsconfigExistedBefore && fs.existsSync(tsconfigPath)) {
            global.createdTsConfigFiles.add(tsconfigPath);
        }
        
        console.log(`✅ ${category}/${componentName}: PASS`);
        
        return { status: 'PASS', reason: 'All checks passed' };
        
    } catch (error) {
        // Track created tsconfig even on failure
        if (!tsconfigExistedBefore && fs.existsSync(tsconfigPath)) {
            global.createdTsConfigFiles.add(tsconfigPath);
        }
        
        // Extract failure reason
        const errorOutput = (error.stdout || '') + (error.stderr || '') || error.message || 'Unknown error';
        let reason = extractFailureReason(errorOutput);
        
        console.log(`❌ ${category}/${componentName}: FAIL - ${reason}`);
        
        if (options.failFast) {
            throw new Error(`Component ${category}/${componentName} failed: ${reason}`);
        }
        
        return { status: 'FAIL', reason };
    }
}

// Run checks with smart parallelization
async function runChecksInParallel(components, options) {
    const results = [];
    const startTime = Date.now();
    
    // Load cache at the beginning
    loadCache();
    
    // Analyze complexity and sort
    console.log('📊 Analyzing component complexity...');
    const analyzedComponents = await Promise.all(
        components.map(c => analyzeComponentComplexity(c))
    );
    
    // Sort by complexity - simple first for quick wins
    analyzedComponents.sort((a, b) => a.complexity - b.complexity);
    
    console.log(`📈 Complexity range: ${analyzedComponents[0].complexity} - ${analyzedComponents[analyzedComponents.length - 1].complexity}`);
    console.log(`🚀 Starting parallel execution (concurrency: ${options.concurrency})`);
    
    // Process with dynamic concurrency
    const queue = [...analyzedComponents];
    const inProgress = new Map();
    let completed = 0;
    
    while (queue.length > 0 || inProgress.size > 0) {
        // Start new tasks up to concurrency limit
        while (queue.length > 0 && inProgress.size < options.concurrency) {
            const component = queue.shift();
            const promise = runComponentCheck(component.category, component.name, options)
                .then(result => {
                    inProgress.delete(promise);
                    completed++;
                    
                    const progress = ((completed / components.length) * 100).toFixed(1);
                    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                    const rate = (completed / elapsed).toFixed(2);
                    
                    console.log(`[${completed}/${components.length}] Progress: ${progress}% | Time: ${elapsed}s | Rate: ${rate}/s`);
                    
                    return {
                        category: component.category,
                        name: component.name,
                        complexity: component.complexity,
                        ...result
                    };
                });
            
            inProgress.set(promise, component);
        }
        
        // Wait for at least one to complete
        if (inProgress.size > 0) {
            const completed = await Promise.race(inProgress.keys());
            results.push(await completed);
        }
    }
    
    return results;
}

// Generate status markdown report
function generateStatusReport(results, options) {
    const timestamp = new Date().toISOString();
    
    let content = `# Component Check Status Report\n\n`;
    content += `Generated: ${timestamp}\n\n`;
    
    // Add configuration info if verbose
    if (options.verbose) {
        content += `## Configuration\n\n`;
        content += `- Concurrency: ${options.concurrency}\n`;
        content += `- Cache: ${options.skipCache || options.noCache ? 'Disabled' : 'Enabled'}\n`;
        content += `- Parallel mode: ${options.parallel ? 'Enabled' : 'Disabled'}\n`;
        content += `- Timeout: ${options.checkTimeout}ms\n`;
        if (options.filter) content += `- Filter: ${options.filter}\n`;
        if (options.category) content += `- Category: ${options.category}\n`;
        content += `\n`;
    }
    
    content += `## Summary\n\n`;
    
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const cached = results.filter(r => r.cached).length;
    const total = results.length;
    
    content += `- ✅ Passed: ${passed}/${total}\n`;
    content += `- ❌ Failed: ${failed}/${total}\n`;
    content += `- 💾 Cached: ${cached}/${total}\n`;
    content += `- 📊 Success Rate: ${((passed/total) * 100).toFixed(1)}%\n\n`;
    
    // Failure analysis
    if (failed > 0) {
        content += `## Failure Analysis\n\n`;
        
        const failureReasons = {};
        results.filter(r => r.status === 'FAIL').forEach(r => {
            failureReasons[r.reason] = (failureReasons[r.reason] || 0) + 1;
        });
        
        content += `| Failure Reason | Count |\n`;
        content += `|----------------|-------|\n`;
        Object.entries(failureReasons)
            .sort((a, b) => b[1] - a[1])
            .forEach(([reason, count]) => {
                content += `| ${reason} | ${count} |\n`;
            });
        content += `\n`;
    }
    
    // Detailed results
    content += `## Detailed Results\n\n`;
    
    const byCategory = {};
    results.forEach(r => {
        if (!byCategory[r.category]) {
            byCategory[r.category] = [];
        }
        byCategory[r.category].push(r);
    });
    
    content += `| Category | Component | Status | Details | Complexity |\n`;
    content += `|----------|-----------|--------|---------|------------|\n`;
    
    Object.keys(byCategory).sort().forEach(category => {
        byCategory[category]
            .sort((a, b) => a.status === b.status ? a.name.localeCompare(b.name) : a.status === 'FAIL' ? -1 : 1)
            .forEach(result => {
                const statusIcon = result.status === 'PASS' ? '✅' : '❌';
                const cachedIcon = result.cached ? ' 💾' : '';
                content += `| ${category} | ${result.name} | ${statusIcon}${cachedIcon} | ${result.reason} | ${result.complexity || '-'} |\n`;
            });
    });
    
    content += `\n---\n`;
    content += `*Last updated: ${timestamp}*\n`;
    
    return content;
}

// Pre-flight checks
async function preScriptAsserts(options) {
    if (!options.skipStorybookPing) {
        console.log('🔍 Verifying Storybook is running...');
        await pingStorybook(options.storybookUrl);
        console.log('✅ Storybook is reachable\n');
    }
}

// Main execution
async function execute(options) {
    
    // Pre-flight checks
    await preScriptAsserts(options);
    
    // Get all components
    const components = getAllComponents(options);
    
    if (components.length === 0) {
        console.error('❌ No components found to check');
        if (options.filter) console.error(`   Filter pattern: ${options.filter}`);
        if (options.category) console.error(`   Category filter: ${options.category}`);
        process.exit(1);
    }
    
    console.log(`Found ${components.length} components to check`);
    
    // Dry run mode - just show what would be checked
    if (options.dryRun) {
        console.log('\n🔍 DRY RUN - Components that would be checked:\n');
        components.forEach(c => console.log(`  - ${c.category}/${c.name}`));
        console.log(`\nTotal: ${components.length} components`);
        return;
    }
    
    // Determine concurrency
    if (!options.concurrency) {
        const cpuCount = os.cpus().length;
        options.concurrency = Math.max(2, Math.min(cpuCount, 4));
    }
    
    console.log(`System CPUs: ${os.cpus().length}, Using concurrency: ${options.concurrency}`);
    console.log(`Cache: ${options.skipCache || options.noCache ? 'Disabled' : 'Enabled'}`);
    console.log(`Parallel mode: ${options.parallel ? 'Enabled' : 'Disabled'}\n`);
    
    // Run checks
    const startTime = Date.now();
    const results = await runChecksInParallel(components, options);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Generate report
    const statusFile = path.join(PKG_UI, options.outputFile);
    console.log('\n📝 Generating status report...');
    const reportContent = generateStatusReport(results, options);
    fs.writeFileSync(statusFile, reportContent);
    
    console.log(`✨ Status report written to: ${statusFile}`);
    
    // Summary
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const cached = results.filter(r => r.cached).length;
    
    console.log('\n📊 Final Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`💾 From cache: ${cached}`);
    console.log(`📈 Success Rate: ${((passed/results.length) * 100).toFixed(1)}%`);
    console.log(`⏱️  Total time: ${duration}s`);
    console.log(`⚡ Average: ${(duration / components.length).toFixed(2)}s per component`);
    
    // Cleanup
    if (options.cleanupTsconfig) {
        await cleanupTsConfigFiles();
    }
    
    // Exit with appropriate code
    if (failed > 0) {
        console.log(`\n⚠️  ${failed} component(s) failed checks.`);
        process.exit(1);
    } else {
        console.log('\n🎉 All components passed!');
    }
}

// Error handlers
process.on('SIGINT', async () => {
    console.log('\n⚠️  Process interrupted');
    await cleanupTsConfigFiles();
    process.exit(1);
});

process.on('uncaughtException', async (error) => {
    console.error('\n❌ Fatal error:', error);
    await cleanupTsConfigFiles();
    process.exit(1);
});

// Run
async function main() {
    console.log('🚀 Starting batch component check (optimized parallel mode)...\n');
    const options = parseArgs(process.argv.slice(2));
    
    if (options.help) {
        showHelp();
        process.exit(0);
    }
    
    try {
        console.time('Total check time');
        await execute(options);
    } catch (error) {
        console.error('❌ Fatal error:', error);
        await cleanupTsConfigFiles();
        process.exit(1);
    } finally {
        console.timeEnd('Total check time');
    }
}

main();
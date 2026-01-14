#!/usr/bin/env node

/**
 * Auto Code Check Hook
 *
 * This hook automatically invokes the code-checker agent when Claude completes
 * tasks involving code implementation, modification, or development.
 *
 * It analyzes the current working directory for recently modified files and
 * triggers a code quality assessment if coding activities are detected.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  // File extensions to check for code changes
  codeExtensions: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.cs', '.php', '.rb', '.swift', '.kt'],

  // Directories to exclude from scanning
  excludeDirs: ['node_modules', '.git', 'dist', 'build', '.next', '.cache', 'coverage', '__pycache__'],

  // Time window to check for recent modifications (in minutes)
  recentWindow: 10,

  // Minimum number of modified files to trigger code check
  minModifiedFiles: 1,

  // Enable debug logging
  debug: process.env.CLAUDE_DEBUG === 'true',

  // Skip check if these patterns are found in the working directory
  skipPatterns: [
    'package-lock.json',
    'yarn.lock',
    'composer.lock'
  ]
};

/**
 * Log debug messages if debug mode is enabled
 */
function debug(...args) {
  if (CONFIG.debug) {
    console.log('[auto-code-check]', ...args);
  }
}

/**
 * Check if a directory should be excluded from scanning
 */
function shouldExcludeDir(dirName) {
  return CONFIG.excludeDirs.includes(dirName) || dirName.startsWith('.');
}

/**
 * Check if a file extension indicates it's a code file
 */
function isCodeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return CONFIG.codeExtensions.includes(ext);
}

/**
 * Get recently modified files in the current directory
 */
function getRecentlyModifiedFiles(directory = process.cwd()) {
  const recentFiles = [];
  const cutoffTime = Date.now() - (CONFIG.recentWindow * 60 * 1000);

  debug(`Scanning directory: ${directory}`);
  debug(`Looking for files modified after: ${new Date(cutoffTime).toISOString()}`);

  function scanDirectory(dir, depth = 0) {
    // Prevent deep recursion
    if (depth > 5) return;

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);

        try {
          const stats = fs.statSync(fullPath);

          if (stats.isDirectory()) {
            if (!shouldExcludeDir(item)) {
              scanDirectory(fullPath, depth + 1);
            }
          } else if (stats.isFile()) {
            // Check if file was modified recently and is a code file
            if (stats.mtime.getTime() > cutoffTime && isCodeFile(fullPath)) {
              const relativePath = path.relative(directory, fullPath);
              recentFiles.push({
                path: relativePath,
                fullPath: fullPath,
                modified: stats.mtime,
                size: stats.size
              });
              debug(`Found recently modified code file: ${relativePath}`);
            }
          }
        } catch (err) {
          // Skip files we can't stat (permissions, etc.)
          debug(`Skipping ${fullPath}: ${err.message}`);
        }
      }
    } catch (err) {
      debug(`Error scanning directory ${dir}: ${err.message}`);
    }
  }

  scanDirectory(directory);
  return recentFiles;
}

/**
 * Check if we're in a project directory (has package.json, requirements.txt, etc.)
 */
function isProjectDirectory() {
  const projectFiles = [
    'package.json',
    'requirements.txt',
    'composer.json',
    'Cargo.toml',
    'go.mod',
    'pom.xml',
    'build.gradle',
    'Gemfile',
    'setup.py',
    'pyproject.toml'
  ];

  return projectFiles.some(file => fs.existsSync(path.join(process.cwd(), file)));
}

/**
 * Get project type based on files in directory
 */
function getProjectType() {
  const cwd = process.cwd();

  if (fs.existsSync(path.join(cwd, 'package.json'))) {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
    if (pkg.dependencies?.react || pkg.devDependencies?.react) return 'React';
    if (pkg.dependencies?.next || pkg.devDependencies?.next) return 'Next.js';
    if (pkg.dependencies?.express || pkg.devDependencies?.express) return 'Express';
    return 'Node.js';
  }

  if (fs.existsSync(path.join(cwd, 'requirements.txt')) || fs.existsSync(path.join(cwd, 'setup.py'))) {
    return 'Python';
  }

  if (fs.existsSync(path.join(cwd, 'Cargo.toml'))) return 'Rust';
  if (fs.existsSync(path.join(cwd, 'go.mod'))) return 'Go';
  if (fs.existsSync(path.join(cwd, 'pom.xml'))) return 'Java';
  if (fs.existsSync(path.join(cwd, 'composer.json'))) return 'PHP';

  return 'Unknown';
}

/**
 * Invoke the code-checker agent
 */
function invokeCodeChecker(modifiedFiles, projectType) {
  const filesList = modifiedFiles.map(f => f.path).join(', ');

  console.log(`\n🔍 Code Quality Check Triggered`);
  console.log(`Project Type: ${projectType}`);
  console.log(`Modified Files: ${filesList}`);
  console.log(`Invoking code-checker agent...\n`);

  try {
    // Create a prompt for the code-checker agent
    const prompt = `
Please analyze the code quality of this ${projectType} project.

Recently modified files:
${modifiedFiles.map(f => `- ${f.path} (modified: ${f.modified.toISOString()})`).join('\n')}

Focus on:
1. Implementation quality and best practices
2. Potential bugs or issues
3. Code structure and maintainability
4. Test coverage (if tests exist)
5. Security considerations
6. Performance implications

Please provide a structured assessment with specific recommendations for improvement.
    `.trim();

    // Use Claude's agent invocation (this would need to be adapted based on how agents are actually invoked)
    // For now, we'll create a file that can be picked up by Claude
    const reportPath = path.join(process.cwd(), '.claude-code-check-request.json');
    const request = {
      timestamp: new Date().toISOString(),
      agent: 'code-checker',
      prompt: prompt,
      context: {
        projectType: projectType,
        workingDirectory: process.cwd(),
        modifiedFiles: modifiedFiles.map(f => ({
          path: f.path,
          modified: f.modified.toISOString(),
          size: f.size
        }))
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(request, null, 2));

    console.log(`📝 Code check request created: ${reportPath}`);
    console.log(`💡 Tip: You can manually trigger code analysis by asking Claude to review these files.`);

  } catch (error) {
    debug(`Error invoking code-checker: ${error.message}`);
    console.log(`⚠️  Could not automatically invoke code-checker. Error: ${error.message}`);
  }
}

/**
 * Main execution function
 */
function main() {
  try {
    debug('Auto code check hook started');

    // Check if we're in a project directory
    if (!isProjectDirectory()) {
      debug('Not in a project directory, skipping code check');
      return;
    }

    // Get recently modified files
    const modifiedFiles = getRecentlyModifiedFiles();

    debug(`Found ${modifiedFiles.length} recently modified code files`);

    // Check if we have enough modified files to warrant a check
    if (modifiedFiles.length < CONFIG.minModifiedFiles) {
      debug('Not enough modified files to trigger code check');
      return;
    }

    // Skip if only lock files were modified
    const nonLockFiles = modifiedFiles.filter(f =>
      !CONFIG.skipPatterns.some(pattern => f.path.includes(pattern))
    );

    if (nonLockFiles.length === 0) {
      debug('Only lock files modified, skipping code check');
      return;
    }

    // Determine project type
    const projectType = getProjectType();
    debug(`Detected project type: ${projectType}`);

    // Invoke code checker
    invokeCodeChecker(nonLockFiles, projectType);

  } catch (error) {
    debug(`Error in main execution: ${error.message}`);
    // Fail silently to not interrupt Claude's workflow
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  getRecentlyModifiedFiles,
  isProjectDirectory,
  getProjectType,
  invokeCodeChecker
};
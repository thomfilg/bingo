#!/usr/bin/env node
/**
 * /check Setup Script
 *
 * Handles:
 * - Determining worktree path and report folder
 * - Generating CHANGES_HASH from git diff
 * - Checking if reports are up-to-date (cache validation)
 * - Creating folders and cleaning old files
 * - Analyzing impacted apps
 *
 * Usage: node check-setup.js [JIRA_TICKET_ID]
 *
 * Output: JSON object with setup variables
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get Jira ticket ID from args or environment
const JIRA_TICKET_ID = process.argv[2] || process.env.JIRA_TICKET_ID || '';

/**
 * Execute a shell command and return trimmed output
 */
function exec(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', ...options }).trim();
  } catch (error) {
    if (options.throwOnError !== false) {
      return '';
    }
    throw error;
  }
}

/**
 * Get the main worktree path
 */
function getMainWorktreePath() {
  const output = exec('git worktree list');
  const firstLine = output.split('\n')[0];
  return firstLine.split(/\s+/)[0];
}

/**
 * Get current branch name
 */
function getBranchName() {
  return exec('git branch --show-current');
}

/**
 * Generate hash from changed file contents
 * Same changes = same hash, any line change = different hash
 * Uses -w to ignore whitespace-only changes
 */
function generateChangesHash() {
  // Use -w to ignore whitespace changes (prevents false cache misses)
  const diff = exec('git diff origin/main...HEAD -w');
  if (!diff) {
    // No changes, use empty hash
    return 'no-changes';
  }

  // Use Node's crypto for hashing
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(diff).digest('hex');
  return hash.substring(0, 12);
}

/**
 * Check if reports are up-to-date by comparing hashes
 */
function checkReportsCache(reportFolder, currentHash) {
  const readmePath = path.join(reportFolder, 'README.md');

  if (!fs.existsSync(readmePath)) {
    return { cached: false, reason: 'No README.md found' };
  }

  const content = fs.readFileSync(readmePath, 'utf8');
  const match = content.match(/\*\*Changes Hash:\*\*\s*([a-f0-9]{12}|no-changes)/);

  if (!match) {
    return { cached: false, reason: 'No hash found in README.md' };
  }

  const cachedHash = match[1];

  if (cachedHash === currentHash) {
    return {
      cached: true,
      cachedHash,
      readme: content
    };
  }

  return {
    cached: false,
    reason: 'Hash mismatch',
    previousHash: cachedHash,
    currentHash
  };
}

/**
 * Create report folders and clean old files
 */
function setupReportFolder(reportFolder) {
  const screenshotsFolder = path.join(reportFolder, 'screenshots');

  // Create folders
  fs.mkdirSync(screenshotsFolder, { recursive: true });

  // Clean old screenshots
  if (fs.existsSync(screenshotsFolder)) {
    const files = fs.readdirSync(screenshotsFolder);
    for (const file of files) {
      if (/\.(png|jpg|jpeg)$/i.test(file)) {
        fs.unlinkSync(path.join(screenshotsFolder, file));
      }
    }
  }

  // Clean old report files
  if (fs.existsSync(reportFolder)) {
    const files = fs.readdirSync(reportFolder);
    for (const file of files) {
      if (file.endsWith('.md')) {
        fs.unlinkSync(path.join(reportFolder, file));
      }
    }
  }
}

/**
 * Analyze which apps were changed
 */
function getImpactedApps() {
  const output = exec('git diff --name-only origin/main...HEAD');
  if (!output) return [];

  const apps = new Set();
  const lines = output.split('\n');

  for (const line of lines) {
    const match = line.match(/^apps\/([^/]+)\//);
    if (match) {
      apps.add(match[1]);
    }
  }

  return Array.from(apps).sort();
}

/**
 * Get affected files grouped by app and packages
 * Used by QA agents to trace dependencies
 */
function getAffectedFiles() {
  const output = exec('git diff --name-only origin/main...HEAD');
  if (!output) return { apps: {}, packages: [] };

  const result = { apps: {}, packages: [] };
  const lines = output.split('\n').filter(Boolean);

  for (const line of lines) {
    // Check if it's an app file
    const appMatch = line.match(/^apps\/([^/]+)\/(.+)$/);
    if (appMatch) {
      const [, appName, filePath] = appMatch;
      if (!result.apps[appName]) {
        result.apps[appName] = [];
      }
      result.apps[appName].push(filePath);
      continue;
    }

    // Check if it's a package file
    const pkgMatch = line.match(/^packages\/([^/]+)\/(.+)$/);
    if (pkgMatch) {
      result.packages.push(line);
    }
  }

  return result;
}

/**
 * Main execution
 */
function main() {
  const mainWorktreePath = getMainWorktreePath();
  const branchName = getBranchName();

  // Determine report folder
  const taskId = JIRA_TICKET_ID || branchName;
  const reportFolder = path.join(mainWorktreePath, 'tasks', taskId);

  // Generate changes hash
  const changesHash = generateChangesHash();

  // Check cache
  const cacheResult = checkReportsCache(reportFolder, changesHash);

  // Get impacted apps
  const impactedApps = getImpactedApps();

  // Get affected files for QA dependency tracing
  const affectedFiles = getAffectedFiles();

  // Output result
  const result = {
    mainWorktreePath,
    branchName,
    jiraTicketId: JIRA_TICKET_ID || null,
    reportFolder,
    changesHash,
    cache: cacheResult,
    impactedApps,
    affectedFiles,
    screenshotsFolder: path.join(reportFolder, 'screenshots')
  };

  // If not cached, setup the folder
  if (!cacheResult.cached) {
    setupReportFolder(reportFolder);
    result.foldersCreated = true;
  }

  console.log(JSON.stringify(result, null, 2));

  // Exit with code 0 if cached (skip checks), 1 if not cached (run checks)
  // Actually, let's not use exit codes - just output the JSON
  // The calling code will check result.cache.cached
}

main();

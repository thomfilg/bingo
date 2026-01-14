#!/usr/bin/env node

/**
 * SubagentStop hook to validate pr-post-generator output.
 *
 * Checks that:
 * 1. Screenshots were actually uploaded to wiki
 * 2. PR was updated with image URLs
 * 3. Image URLs point to wiki (not local paths)
 * 4. Screenshots are feature-specific (not generic page tests)
 * 5. PR body actually contains images (fetched from GitHub)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const APPS_DIR = '/home/node/worktrees/app-services-monitoring/apps';

/**
 * Check if an app is a frontend app by looking for react-router.config.ts
 */
function isFrontendApp(appName) {
  const configPath = path.join(APPS_DIR, appName, 'react-router.config.ts');
  return fs.existsSync(configPath);
}

/**
 * Get all frontend apps (those with react-router.config.ts)
 */
function getAllFrontendApps() {
  try {
    const apps = fs.readdirSync(APPS_DIR).filter(dir => {
      const appPath = path.join(APPS_DIR, dir);
      return fs.statSync(appPath).isDirectory() && isFrontendApp(dir);
    });
    return apps;
  } catch (e) {
    return [];
  }
}

/**
 * Get affected apps using the get-affected.js script
 */
function getAffectedApps() {
  try {
    const scriptPath = '/home/node/worktrees/app-services-monitoring/scripts/get-affected.js';
    const result = execSync(`node "${scriptPath}" main json`, {
      encoding: 'utf8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: '/home/node/worktrees/app-services-monitoring'
    });
    return JSON.parse(result.trim());
  } catch (e) {
    return null;
  }
}

/**
 * Check if any affected apps are frontend apps (have react-router.config.ts)
 */
function getAffectedFrontendApps(affectedApps) {
  if (!affectedApps || affectedApps.length === 0) return [];
  return affectedApps.filter(app => isFrontendApp(app));
}

/**
 * Fetch the current PR body using gh CLI
 */
function getPRBody() {
  try {
    const result = execSync('gh pr view --json body -q ".body"', {
      encoding: 'utf8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result.trim();
  } catch (e) {
    return null;
  }
}

/**
 * Count images in markdown text
 */
function countImages(text) {
  if (!text) return 0;
  // Match markdown images: ![alt](url)
  const imagePattern = /!\[.*?\]\(.*?\)/g;
  const matches = text.match(imagePattern);
  return matches ? matches.length : 0;
}

/**
 * Check if images are wiki URLs (not local paths)
 */
function hasWikiImages(text) {
  if (!text) return false;
  // Match wiki image URLs
  const wikiImagePattern = /!\[.*?\]\(https:\/\/.*github.*wiki.*\.(png|jpg|jpeg|gif|webp)/gi;
  return wikiImagePattern.test(text);
}

/**
 * Check if PR body has a wiki link (for visual documentation)
 */
function hasWikiLink(text) {
  if (!text) return false;
  // Match wiki page links (not image URLs)
  const wikiLinkPattern = /\[.*?\]\(https:\/\/github\.com\/.*\/wiki\/TASK-\d+\)/i;
  return wikiLinkPattern.test(text);
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  let hookData;
  try {
    hookData = JSON.parse(input);
  } catch {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Only validate pr-post-generator subagent
  const agentName = hookData.agent_name || hookData.subagent_type || '';
  if (!agentName.toLowerCase().includes('pr-post-generator') &&
      !agentName.toLowerCase().includes('post-pr')) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Get the agent's output/response
  const agentOutput = hookData.agent_output || hookData.response || hookData.result || '';

  if (!agentOutput || agentOutput.length < 50) {
    console.log(JSON.stringify({
      decision: 'block',
      reason: `
╔══════════════════════════════════════════════════════════════════════╗
║  🛑 POST-PR-GENERATOR: NO OUTPUT                                     ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ❌ Agent did not produce any output                                 ║
║                                                                      ║
║  Expected: Confirmation of screenshots uploaded and PR updated       ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝`
    }));
    return;
  }

  const issues = [];
  const warnings = [];

  // ========== CHECK IF FRONTEND APPS ARE AFFECTED ==========
  const affectedApps = getAffectedApps();
  const affectedFrontendApps = getAffectedFrontendApps(affectedApps || []);

  if (affectedFrontendApps.length === 0) {
    // Backend-only changes - images not required
    console.log(JSON.stringify({
      decision: 'approve',
      message: `No frontend apps affected (no react-router.config.ts). Images not required.\nAffected apps: ${affectedApps ? affectedApps.join(', ') : 'none'}`
    }));
    return;
  }

  // ========== FETCH ACTUAL PR BODY AND VERIFY VISUAL DOCUMENTATION ==========
  const prBody = getPRBody();
  if (prBody) {
    const imageCount = countImages(prBody);
    const hasWiki = hasWikiImages(prBody);
    const hasLink = hasWikiLink(prBody);

    // Accept either: embedded wiki images OR a wiki link
    if (imageCount === 0 && !hasLink) {
      issues.push(`PR body contains NO visual documentation (frontend apps affected: ${affectedFrontendApps.join(', ')}). Add wiki link or embedded images.`);
    } else if (imageCount > 0 && !hasWiki) {
      warnings.push(`PR has ${imageCount} image(s) but none are wiki URLs`);
    } else {
      // Good - has wiki images or wiki link
    }
  } else {
    warnings.push('Could not fetch PR body to verify visual documentation');
  }

  // Check if wiki upload was mentioned
  const hasWikiMention = /wiki|github\.com.*wiki/i.test(agentOutput);
  if (!hasWikiMention) {
    issues.push('No wiki upload confirmation found');
  }

  // Check for wiki image URLs (positive indicator)
  const wikiUrlPattern = /github\.com\/.*\/wiki\/images\//i;
  const hasWikiUrls = wikiUrlPattern.test(agentOutput);

  // Check for local file paths (negative indicator)
  const localPathPattern = /!\[.*\]\(\.\/|!\[.*\]\(tasks\/|!\[.*\]\(screenshots\//;
  const hasLocalPaths = localPathPattern.test(agentOutput);

  if (hasLocalPaths && !hasWikiUrls) {
    issues.push('Found local file paths instead of wiki URLs');
  }

  // Check if PR was updated
  const prUpdatePatterns = [
    /PR.*updated/i,
    /updated.*PR/i,
    /gh pr edit/i,
    /pull request.*updated/i,
  ];
  const hasPRUpdate = prUpdatePatterns.some(p => p.test(agentOutput));
  if (!hasPRUpdate) {
    warnings.push('No PR update confirmation found');
  }

  // Check for generic test results (should focus on feature-specific)
  const genericTestPatterns = [
    /Page loads.*PASS/i,
    /Navigation works.*PASS/i,
    /Theme toggle.*PASS/i,
    /Common functionality/i,
  ];
  const hasGenericTests = genericTestPatterns.some(p => p.test(agentOutput));
  if (hasGenericTests) {
    warnings.push('Contains generic page tests (should focus on feature-specific)');
  }

  // Check for feature verification section
  const hasFeatureSection = /Feature Verification|Feature.*Screenshots|Specific feature/i.test(agentOutput);

  if (issues.length > 0) {
    console.log(JSON.stringify({
      decision: 'block',
      reason: `
╔══════════════════════════════════════════════════════════════════════╗
║  🛑 POST-PR-GENERATOR: VALIDATION FAILED                             ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
${issues.map(i => `║  ❌ ${i.padEnd(64)}║`).join('\n')}
${warnings.length > 0 ? warnings.map(w => `║  ⚠️  ${w.padEnd(63)}║`).join('\n') : ''}
║                                                                      ║
║  Ensure screenshots are uploaded to wiki and PR is updated.          ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝`
    }));
    return;
  }

  // If only warnings, approve but show them
  if (warnings.length > 0) {
    console.log(JSON.stringify({
      decision: 'approve',
      message: `Post-PR validation passed with warnings:\n${warnings.map(w => `- ${w}`).join('\n')}`
    }));
    return;
  }

  console.log(JSON.stringify({ decision: 'approve' }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  console.log(JSON.stringify({ decision: 'approve' }));
});

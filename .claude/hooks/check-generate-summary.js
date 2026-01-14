#!/usr/bin/env node
/**
 * /check Summary Generator
 *
 * Generates the final README.md summary report after all agents complete.
 *
 * Usage: node check-generate-summary.js <REPORT_FOLDER> <CHANGES_HASH> <JIRA_TICKET_ID> <IMPACTED_APPS_JSON>
 *
 * Output: Writes README.md to report folder
 */

const fs = require('fs');
const path = require('path');

// Get args
const REPORT_FOLDER = process.argv[2];
const CHANGES_HASH = process.argv[3];
const JIRA_TICKET_ID = process.argv[4] || '';
const IMPACTED_APPS = JSON.parse(process.argv[5] || '[]');

if (!REPORT_FOLDER || !CHANGES_HASH) {
  console.error('Usage: node check-generate-summary.js <REPORT_FOLDER> <CHANGES_HASH> [JIRA_TICKET_ID] [IMPACTED_APPS_JSON]');
  process.exit(1);
}

/**
 * Read file content
 */
function readFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Check report status from content
 */
function getReportStatus(content, type) {
  if (!content) return { status: 'MISSING', icon: '❓' };

  // Check for infrastructure failure FIRST (for QA reports)
  if (type === 'qa') {
    if (content.includes('INFRASTRUCTURE_FAILURE') ||
        content.includes('PLAYWRIGHT_UNAVAILABLE') ||
        content.includes('PLAYWRIGHT UNAVAILABLE')) {
      return { status: 'INFRASTRUCTURE_FAILURE', icon: '🛑' };
    }
  }

  const statusChecks = {
    tests: {
      pass: ['✅ PASS', 'APPROVED', 'All.*pass'],
      fail: ['❌ FAIL', 'NEEDS_WORK', 'failed']
    },
    codeReview: {
      pass: ['APPROVED', 'No critical', 'No issues'],
      fail: ['CRITICAL', 'NEEDS_WORK']
    },
    qa: {
      pass: ['✅ PASS', 'All tests passed', 'SUCCESS'],
      fail: ['❌ FAIL', 'FAILED']
    },
    completion: {
      pass: ['COMPLETE', 'DELIVERED'],
      fail: ['INCOMPLETE', 'PENDING']
    }
  };

  const checks = statusChecks[type];
  if (!checks) return { status: 'UNKNOWN', icon: '❓' };

  // Check for failures first
  for (const pattern of checks.fail) {
    if (new RegExp(pattern, 'i').test(content)) {
      return { status: 'NEEDS_WORK', icon: '❌' };
    }
  }

  // Check for pass
  for (const pattern of checks.pass) {
    if (new RegExp(pattern, 'i').test(content)) {
      return { status: 'APPROVED', icon: '✅' };
    }
  }

  return { status: 'UNKNOWN', icon: '❓' };
}

/**
 * Generate summary report
 */
function generateSummary() {
  const timestamp = new Date().toISOString();
  const branchName = require('child_process')
    .execSync('git branch --show-current', { encoding: 'utf8' })
    .trim();

  // Read all reports
  const testsContent = readFile(path.join(REPORT_FOLDER, 'tests.md'));
  const codeReviewContent = readFile(path.join(REPORT_FOLDER, 'code-review.md'));
  const completionContent = readFile(path.join(REPORT_FOLDER, 'completion.md'));

  // Get statuses
  const testsStatus = getReportStatus(testsContent, 'tests');
  const codeReviewStatus = getReportStatus(codeReviewContent, 'codeReview');
  const completionStatus = getReportStatus(completionContent, 'completion');

  // Get QA statuses for each app
  const qaStatuses = {};
  let overallQAStatus = { status: 'APPROVED', icon: '✅' };
  let hasInfraFailure = false;

  for (const app of IMPACTED_APPS) {
    const qaContent = readFile(path.join(REPORT_FOLDER, `qa-${app}.md`));
    qaStatuses[app] = getReportStatus(qaContent, 'qa');

    if (qaStatuses[app].status === 'INFRASTRUCTURE_FAILURE') {
      hasInfraFailure = true;
      overallQAStatus = { status: 'INFRASTRUCTURE_FAILURE', icon: '🛑' };
    } else if (qaStatuses[app].status === 'NEEDS_WORK' && !hasInfraFailure) {
      overallQAStatus = { status: 'NEEDS_WORK', icon: '❌' };
    } else if (qaStatuses[app].status === 'MISSING' && overallQAStatus.status === 'APPROVED') {
      overallQAStatus = { status: 'MISSING', icon: '❓' };
    }
  }

  // Check if code-review-reply.md exists
  const hasReplyFile = fs.existsSync(path.join(REPORT_FOLDER, 'code-review-reply.md'));

  // Determine overall status
  let overallStatus = 'APPROVED';
  const actionItems = [];

  // Infrastructure failure takes precedence
  if (hasInfraFailure) {
    overallStatus = 'INFRASTRUCTURE_FAILURE';
    actionItems.unshift('⚠️ FIX INFRASTRUCTURE: Playwright MCP unavailable - fix before re-running /check');
  }
  if (testsStatus.status === 'NEEDS_WORK') {
    overallStatus = overallStatus === 'INFRASTRUCTURE_FAILURE' ? overallStatus : 'NEEDS_WORK';
    actionItems.push('Fix failing tests (see tests.md)');
  }
  if (codeReviewStatus.status === 'NEEDS_WORK') {
    overallStatus = overallStatus === 'INFRASTRUCTURE_FAILURE' ? overallStatus : 'NEEDS_WORK';
    actionItems.push('Address code review issues (see code-review.md)');
  }
  if (overallQAStatus.status === 'NEEDS_WORK') {
    overallStatus = overallStatus === 'INFRASTRUCTURE_FAILURE' ? overallStatus : 'NEEDS_WORK';
    actionItems.push('Fix QA test failures (see qa-*.md)');
  }
  if (completionStatus.status === 'NEEDS_WORK') {
    overallStatus = overallStatus === 'INFRASTRUCTURE_FAILURE' ? overallStatus : 'NEEDS_WORK';
    actionItems.push('Complete pending requirements (see completion.md)');
  }

  // Build QA rows
  const qaRows = IMPACTED_APPS.map(app => {
    const status = qaStatuses[app] || { status: 'MISSING', icon: '❓' };
    return `| QA Tester (${app}) | ${status.icon} ${status.status} |`;
  }).join('\n');

  // Build QA links
  const qaLinks = IMPACTED_APPS.map(app =>
    `- [qa-${app}.md](./qa-${app}.md)`
  ).join('\n');

  // Generate markdown
  const markdown = `# Quality Check Report
${JIRA_TICKET_ID ? `Jira: ${JIRA_TICKET_ID}` : `Branch: ${branchName}`}
Generated: ${timestamp}
**Changes Hash:** ${CHANGES_HASH}

## Summary
| Check | Status |
|-------|--------|
| Quality Checker (lint/typecheck/tests) | ${testsStatus.icon} ${testsStatus.status} |
| Code Checker | ${codeReviewStatus.icon} ${codeReviewStatus.status} |
${qaRows}
| Completion Checker | ${completionStatus.icon} ${completionStatus.status} |

## Quality Check Results (lint, typecheck, tests)
See: [tests.md](./tests.md)

## Code Checker Report
See: [code-review.md](./code-review.md)

## QA Test Reports
${qaLinks}

## Completion Check
See: [completion.md](./completion.md)

## Generated Report Files
- [tests.md](./tests.md)
- [code-review.md](./code-review.md)
${hasReplyFile ? '- [code-review-reply.md](./code-review-reply.md)\n' : ''}${qaLinks}
- [completion.md](./completion.md)
- [screenshots/](./screenshots/) (QA visual evidence)

## Overall Status
**${overallStatus}**

${actionItems.length > 0 ? `## Action Items
${actionItems.map(item => `- ${item}`).join('\n')}` : '✅ All checks passed! Ready for PR.'}
`;

  // Write README.md
  const readmePath = path.join(REPORT_FOLDER, 'README.md');
  fs.writeFileSync(readmePath, markdown);

  console.log(JSON.stringify({
    readmePath,
    overallStatus,
    infrastructureFailure: hasInfraFailure,
    testsStatus: testsStatus.status,
    codeReviewStatus: codeReviewStatus.status,
    qaStatus: overallQAStatus.status,
    completionStatus: completionStatus.status,
    hasReplyFile,
    actionItems
  }, null, 2));
}

generateSummary();

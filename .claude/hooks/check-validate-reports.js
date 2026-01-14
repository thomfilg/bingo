#!/usr/bin/env node
/**
 * /check Report Validation Script
 *
 * Validates that all required reports exist and have proper content:
 * - QA reports have connectivity verification section
 * - Code review doesn't have unaddressed CRITICAL/IMPORTANT issues
 * - All expected report files exist
 *
 * Usage: node check-validate-reports.js <REPORT_FOLDER> <IMPACTED_APPS_JSON>
 *
 * Output: JSON object with validation results
 */

const fs = require('fs');
const path = require('path');

// Get args
const REPORT_FOLDER = process.argv[2];
const IMPACTED_APPS = JSON.parse(process.argv[3] || '[]');

if (!REPORT_FOLDER) {
  console.error('Usage: node check-validate-reports.js <REPORT_FOLDER> <IMPACTED_APPS_JSON>');
  process.exit(1);
}

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Read file content
 */
function readFile(filePath) {
  if (!fileExists(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Validate QA report has required content
 */
function validateQAReport(filePath, appName) {
  const content = readFile(filePath);

  if (!content) {
    return {
      exists: false,
      valid: false,
      error: `QA report not found: ${filePath}`
    };
  }

  const issues = [];

  // Check for infrastructure failure FIRST
  const hasInfraFailure = content.includes('INFRASTRUCTURE_FAILURE') ||
    content.includes('PLAYWRIGHT_UNAVAILABLE') ||
    content.includes('PLAYWRIGHT UNAVAILABLE');
  if (hasInfraFailure) {
    return {
      exists: true,
      valid: false,
      infrastructureFailure: true,
      issues: ['Infrastructure failure - Playwright unavailable'],
      failed: true
    };
  }

  // Check for Playwright Verification section (MANDATORY)
  const hasPlaywrightVerification = content.includes('## Playwright Verification');
  if (!hasPlaywrightVerification) {
    issues.push('Missing "## Playwright Verification" section');
  }

  // Check for Changes Hash
  if (!content.includes('**Changes Hash:**')) {
    issues.push('Missing "**Changes Hash:**" at top of report');
  }

  // Check for screenshots (required for QA)
  const hasScreenshots = content.includes('![') || content.includes('./screenshots/');
  if (!hasScreenshots) {
    issues.push('No screenshots found - QA reports must include visual evidence');
  }

  // Check for pass/fail status
  const hasStatus = content.includes('PASS') || content.includes('FAIL');
  if (!hasStatus) {
    issues.push('Missing PASS/FAIL status');
  }

  // Check if marked as failed
  const failed = content.includes('❌ FAIL') || content.includes('Status: FAIL');

  return {
    exists: true,
    valid: issues.length === 0 && !failed,
    issues,
    failed,
    hasScreenshots,
    infrastructureFailure: false
  };
}

/**
 * Validate code review report
 */
function validateCodeReview(reportFolder) {
  const filePath = path.join(reportFolder, 'code-review.md');
  const content = readFile(filePath);

  if (!content) {
    return {
      exists: false,
      valid: false,
      error: 'Code review report not found'
    };
  }

  const issues = [];

  // Check for Changes Hash
  if (!content.includes('**Changes Hash:**')) {
    issues.push('Missing "**Changes Hash:**" at top of report');
  }

  // Check for CRITICAL issues
  const criticalMatches = content.match(/🔴\s*CRITICAL|CRITICAL.*must fix|severity.*critical/gi);
  const hasCritical = criticalMatches && criticalMatches.length > 0;

  // Check for IMPORTANT issues
  const importantMatches = content.match(/🟡\s*IMPORTANT|IMPORTANT.*should fix|severity.*important/gi);
  const hasImportant = importantMatches && importantMatches.length > 0;

  // Check if there's a reply file addressing the issues
  const replyPath = path.join(reportFolder, 'code-review-reply.md');
  const hasReply = fileExists(replyPath);

  return {
    exists: true,
    valid: !hasCritical, // Only critical blocks approval
    hasCritical,
    hasImportant,
    hasReply,
    issues,
    requiresAction: hasCritical || hasImportant
  };
}

/**
 * Validate tests report
 */
function validateTestsReport(reportFolder) {
  const filePath = path.join(reportFolder, 'tests.md');
  const content = readFile(filePath);

  if (!content) {
    return {
      exists: false,
      valid: false,
      error: 'Tests report not found'
    };
  }

  const issues = [];

  // Check for Changes Hash
  if (!content.includes('**Changes Hash:**')) {
    issues.push('Missing "**Changes Hash:**" at top of report');
  }

  // Check for pass/fail indicators
  const hasPass = content.includes('✅ PASS') || content.includes('APPROVED');
  const hasFail = content.includes('❌ FAIL') || content.includes('NEEDS_WORK');

  // Check for SKIPPED/BLOCKED tests (acceptable but should note)
  const hasSkipped = content.includes('⚠️ SKIPPED') || content.includes('BLOCKED');

  return {
    exists: true,
    valid: hasPass && !hasFail,
    passed: hasPass && !hasFail,
    hasSkipped,
    issues
  };
}

/**
 * Validate completion report
 */
function validateCompletionReport(reportFolder) {
  const filePath = path.join(reportFolder, 'completion.md');
  const content = readFile(filePath);

  if (!content) {
    return {
      exists: false,
      valid: false,
      error: 'Completion report not found'
    };
  }

  const issues = [];

  // Check for Changes Hash
  if (!content.includes('**Changes Hash:**')) {
    issues.push('Missing "**Changes Hash:**" at top of report');
  }

  // Check for COMPLETE/INCOMPLETE
  const isComplete = content.includes('COMPLETE') && !content.includes('INCOMPLETE');
  const isIncomplete = content.includes('INCOMPLETE');

  return {
    exists: true,
    valid: isComplete,
    complete: isComplete,
    incomplete: isIncomplete,
    issues
  };
}

/**
 * Main validation
 */
function main() {
  const results = {
    reportFolder: REPORT_FOLDER,
    impactedApps: IMPACTED_APPS,
    reports: {},
    overall: {
      valid: true,
      issues: [],
      status: 'APPROVED',
      infrastructureFailure: false
    }
  };

  // Validate QA reports for each impacted app
  results.reports.qa = {};
  let anyQAFailed = false;
  let hasInfrastructureFailure = false;

  for (const app of IMPACTED_APPS) {
    const qaPath = path.join(REPORT_FOLDER, `qa-${app}.md`);
    const validation = validateQAReport(qaPath, app);
    results.reports.qa[app] = validation;

    // Check for infrastructure failure FIRST
    if (validation.infrastructureFailure) {
      hasInfrastructureFailure = true;
      results.overall.issues.push(`Infrastructure failure detected in qa-${app}.md`);
    } else if (!validation.exists) {
      anyQAFailed = true;
      results.overall.issues.push(`QA report missing for ${app}`);
    } else if (!validation.valid || validation.failed) {
      anyQAFailed = true;
      if (validation.issues.length > 0) {
        results.overall.issues.push(`QA report for ${app}: ${validation.issues.join(', ')}`);
      }
      if (validation.failed) {
        results.overall.issues.push(`QA tests failed for ${app}`);
      }
    }
  }

  // Handle infrastructure failure immediately
  if (hasInfrastructureFailure) {
    results.overall.infrastructureFailure = true;
    results.overall.status = 'INFRASTRUCTURE_FAILURE';
    results.overall.valid = false;
    console.log(JSON.stringify(results, null, 2));
    process.exit(2); // Special exit code for infra failure
  }

  // Validate code review
  results.reports.codeReview = validateCodeReview(REPORT_FOLDER);
  if (!results.reports.codeReview.exists) {
    results.overall.issues.push('Code review report missing');
  } else if (results.reports.codeReview.hasCritical) {
    results.overall.issues.push('Code review has CRITICAL issues that must be fixed');
    results.overall.valid = false;
  } else if (results.reports.codeReview.hasImportant) {
    results.overall.issues.push('Code review has IMPORTANT issues (should fix or document)');
  }

  // Validate tests report
  results.reports.tests = validateTestsReport(REPORT_FOLDER);
  if (!results.reports.tests.exists) {
    results.overall.issues.push('Tests report missing');
    results.overall.valid = false;
  } else if (!results.reports.tests.passed) {
    results.overall.issues.push('Tests did not pass');
    results.overall.valid = false;
  }

  // Validate completion report
  results.reports.completion = validateCompletionReport(REPORT_FOLDER);
  if (!results.reports.completion.exists) {
    results.overall.issues.push('Completion report missing');
  } else if (results.reports.completion.incomplete) {
    results.overall.issues.push('Some requirements are incomplete');
  }

  // Determine overall status
  if (anyQAFailed) {
    results.overall.status = 'NEEDS_WORK';
    results.overall.valid = false;
  } else if (!results.overall.valid) {
    results.overall.status = 'NEEDS_WORK';
  } else if (results.overall.issues.length > 0) {
    results.overall.status = 'APPROVED_WITH_NOTES';
  }

  // Check if all required files exist
  const requiredFiles = ['tests.md', 'code-review.md', 'completion.md', 'README.md'];
  for (const file of requiredFiles) {
    if (!fileExists(path.join(REPORT_FOLDER, file))) {
      results.overall.issues.push(`Missing required file: ${file}`);
    }
  }

  console.log(JSON.stringify(results, null, 2));

  // Exit with appropriate code
  process.exit(results.overall.valid ? 0 : 1);
}

main();

#!/usr/bin/env node

/**
 * PostToolUse hook to validate QA screenshots
 *
 * After browser_snapshot is taken, checks for error patterns:
 * - "Application Error"
 * - "TypeError:", "Error:", stack traces
 * - Loading spinners that never resolved
 *
 * Warns the agent but doesn't block (allows documenting errors)
 *
 * EXCEPTION: Skips warning if QA is intentionally testing error scenarios
 * (detected via context clues in recent conversation)
 */

// Patterns that indicate QA is intentionally testing errors
const TESTING_ERRORS_PATTERNS = [
  /test.*error/i,
  /error.*test/i,
  /verify.*error/i,
  /check.*error.*handling/i,
  /error.*scenario/i,
  /error.*state/i,
  /error.*boundary/i,
  /404.*page/i,
  /500.*page/i,
  /invalid.*input/i,
  /negative.*test/i,
  /edge.*case/i,
  /failure.*case/i,
];

const ERROR_PATTERNS = [
  /Application Error/i,
  /TypeError:/,
  /ReferenceError:/,
  /SyntaxError:/,
  /Cannot read propert/i,
  /undefined is not/i,
  /null is not/i,
  /at\s+\w+\s+\(http/,  // Stack trace pattern
  /Unhandled Runtime Error/i,
  /Something went wrong/i,
  /500 Internal Server Error/i,
  /404 Not Found/i,
  /Network Error/i,
];

const LOADING_PATTERNS = [
  /Loading\.\.\./i,
  /Please wait/i,
  /Fetching/i,
];

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  let hookData;
  try {
    hookData = JSON.parse(input);
  } catch {
    // Can't parse, just continue
    console.log(JSON.stringify({}));
    return;
  }

  const toolName = hookData.tool_name;
  const toolOutput = hookData.tool_output || '';

  // Only check browser_snapshot results
  if (toolName !== 'mcp__playwright__browser_snapshot' &&
      toolName !== 'mcp__chrome-devtools__take_snapshot') {
    console.log(JSON.stringify({}));
    return;
  }

  const errors = [];
  const warnings = [];

  // Check if this looks like intentional error testing
  // (based on context clues in the snapshot content or tool input)
  const toolInput = hookData.tool_input || {};
  const inputStr = JSON.stringify(toolInput).toLowerCase();

  let isTestingErrors = false;
  for (const pattern of TESTING_ERRORS_PATTERNS) {
    if (pattern.test(toolOutput) || pattern.test(inputStr)) {
      isTestingErrors = true;
      break;
    }
  }

  // Check for error patterns
  for (const pattern of ERROR_PATTERNS) {
    if (pattern.test(toolOutput)) {
      errors.push(`Error detected: ${pattern.toString()}`);
    }
  }

  // Check for loading patterns (might indicate content didn't load)
  for (const pattern of LOADING_PATTERNS) {
    if (pattern.test(toolOutput)) {
      warnings.push(`Loading indicator found - content may not have fully loaded`);
    }
  }

  // Skip warning if QA is intentionally testing error scenarios
  if (isTestingErrors && errors.length > 0) {
    console.log(JSON.stringify({
      message: '\n✓ Error state detected (expected - testing error scenario)\n'
    }));
    return;
  }

  if (errors.length > 0 || warnings.length > 0) {
    const message = [
      '',
      '⚠️  QA SCREENSHOT VALIDATION',
      '═'.repeat(50),
      ...errors.map(e => `❌ ${e}`),
      ...warnings.map(w => `⚡ ${w}`),
      '',
      'ACTION REQUIRED:',
      '  • Document this error in your QA report',
      '  • Do NOT mark this test as "passed"',
      '  • Check console messages for details',
      '═'.repeat(50),
    ].join('\n');

    // Return as advisory message, don't block
    console.log(JSON.stringify({
      message: message
    }));
    return;
  }

  console.log(JSON.stringify({}));
}

main().catch(err => {
  console.error('QA validator error:', err.message);
  console.log(JSON.stringify({}));
});

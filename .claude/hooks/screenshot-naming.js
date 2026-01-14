#!/usr/bin/env node

/**
 * PreToolUse hook to enforce screenshot naming conventions for QA testing.
 *
 * Validates that screenshots follow the pattern: {N}-{scenario}-{state}.png
 * and are saved to the proper tasks directory.
 */

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

  const toolName = hookData.tool_name || '';
  const toolInput = hookData.tool_input || {};

  // Only check screenshot tools
  if (!toolName.includes('browser_take_screenshot')) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  const filename = toolInput.filename || '';

  // If no filename provided, just approve (Playwright will auto-generate)
  if (!filename) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Check if it's a QA task screenshot (in global tasks directory)
  const isTaskScreenshot = filename.includes('/home/node/worktrees/tasks/') && filename.includes('screenshots/');

  if (!isTaskScreenshot) {
    // Not a task screenshot, approve without validation
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Extract just the filename from the path
  const basename = filename.split('/').pop();

  // Validate naming pattern: {N}-{scenario}-{state}.png
  // Pattern: starts with number, followed by dash, then scenario-state, ends with .png
  const validPattern = /^\d+-[a-z0-9]+-[a-z0-9-]+\.(png|jpeg)$/i;

  if (!validPattern.test(basename)) {
    console.log(JSON.stringify({
      decision: 'block',
      reason: `Screenshot naming violation!

Expected format: {N}-{scenario}-{state}.png
Got: ${basename}

Examples:
  ✅ 1-impersonate-role-menu.png
  ✅ 2-impersonate-role-modal-empty.png
  ✅ 3-login-form-filled.png

  ❌ screenshot.png
  ❌ modal.png
  ❌ impersonate-role.png (missing number prefix)

Fix the filename to follow the convention.`
    }));
    return;
  }

  // Validate number prefix is reasonable (1-99)
  const numberPrefix = parseInt(basename.split('-')[0], 10);
  if (numberPrefix < 1 || numberPrefix > 99) {
    console.log(JSON.stringify({
      decision: 'block',
      reason: `Screenshot number prefix out of range: ${numberPrefix}
Expected: 1-99
Fix the filename to use a valid step number.`
    }));
    return;
  }

  console.log(JSON.stringify({ decision: 'approve' }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  console.log(JSON.stringify({ decision: 'approve' }));
});

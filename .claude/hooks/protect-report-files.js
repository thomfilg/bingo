#!/usr/bin/env node

/**
 * PreToolUse hook to prevent direct editing of report files.
 *
 * Report files should only be created/edited by their designated agents:
 * - code-review.md → code-checker agent
 * - qa*.md → qa-feature-tester agent
 * - tests.md → quality-checker agent
 * - completion.md → completion-checker agent
 *
 * README.md is allowed for anyone to create/edit.
 */

const fs = require('fs');
const path = require('path');

// Map of protected files to their allowed agents
const PROTECTED_FILES = {
  'code-review.md': ['code-checker'],
  'qa.md': ['qa-feature-tester'],
  'qa-': ['qa-feature-tester'],  // qa-*.md pattern
  'tests.md': ['quality-checker'],
  'completion.md': ['completion-checker']
};

// Check if running inside a specific agent
function isRunningInAgent(transcriptPath, allowedAgents) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(transcriptPath, 'utf8');

    for (const agent of allowedAgents) {
      // Check for agent definition frontmatter
      const frontmatterPattern = new RegExp(`^name:\\s*${agent}`, 'm');
      if (frontmatterPattern.test(content)) {
        return true;
      }

      // Check for subagent task invocation pattern
      const subagentPattern = new RegExp(`"subagent_type"\\s*:\\s*"${agent}"`, 'i');
      if (subagentPattern.test(content)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

// Check if file path matches a protected pattern
function getProtectedFileInfo(filePath) {
  if (!filePath) return null;

  const fileName = path.basename(filePath).toLowerCase();

  // Skip README.md - always allowed
  if (fileName === 'readme.md') {
    return null;
  }

  // Check if it's in the global tasks folder
  if (!filePath.includes('/home/node/worktrees/tasks/')) {
    return null;
  }

  for (const [pattern, agents] of Object.entries(PROTECTED_FILES)) {
    if (fileName === pattern || fileName.startsWith(pattern)) {
      return { pattern, agents };
    }
  }

  return null;
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const hookData = JSON.parse(input);
  const toolName = hookData.tool_name;
  const toolInput = hookData.tool_input || {};
  const transcriptPath = hookData.transcript_path;

  // Only check Edit and Write tools
  if (toolName !== 'Edit' && toolName !== 'Write') {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  const filePath = toolInput.file_path || '';
  const protectedInfo = getProtectedFileInfo(filePath);

  if (!protectedInfo) {
    // Not a protected file
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Check if running in an allowed agent
  if (isRunningInAgent(transcriptPath, protectedInfo.agents)) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Block the edit
  console.log(JSON.stringify({
    decision: 'block',
    reason: `🛑 BLOCKED: Cannot edit report file directly!

❌ File: ${path.basename(filePath)}
❌ This file can only be created/edited by: ${protectedInfo.agents.join(', ')} agent(s)

You are trying to edit a verification report file outside of the proper agent context.
This is not allowed because it could bypass quality checks.

If you need to regenerate the report, run /check to invoke the proper agents.`
  }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  console.log(JSON.stringify({ decision: 'approve' }));
});

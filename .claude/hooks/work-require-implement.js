#!/usr/bin/env node

/**
 * PreToolUse hook to enforce /work-implement usage during /work command.
 *
 * When /work is active (after bootstrap, before commit), blocks direct
 * Write/Edit operations unless /work-implement has been invoked.
 */

const fs = require('fs');

// Tools that require /work-implement first
const BLOCKED_TOOLS = ['Write', 'Edit', 'MultiEdit'];

// Files that are allowed without /work-implement (config, non-code files)
const ALLOWED_PATTERNS = [
  /\.md$/,           // Markdown files
  /\.json$/,         // JSON config files
  /\.ya?ml$/,        // YAML files
  /\.env/,           // Environment files
  /\.gitignore$/,    // Git ignore
  /\.eslintrc/,      // ESLint config
  /\.prettierrc/,    // Prettier config
  /package\.json$/,  // Package files
  /tsconfig/,        // TypeScript config
  /\/home\/node\/worktrees\/tasks\//,  // Global task tracking files
  /\.task-/,         // Task files
];

/**
 * Check if /work command is active in the transcript
 */
function isWorkCommandActive(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(transcriptPath, 'utf8');

    // Look for /work invocation (but not /work-implement or /work-pr)
    const workPatterns = [
      /<command-name>\/work<\/command-name>/,
      /"skill"\s*:\s*"work"[^-]/,  // "work" but not "work-implement" or "work-pr"
      /# Start Work Command/  // The command's header from work.md
    ];

    // Check if /work is active
    const hasWork = workPatterns.some(pattern => pattern.test(content));

    if (!hasWork) return false;

    // Check if we're past Step 3 (bootstrap) but before Step 6 (commit)
    // Look for signs that bootstrap is done
    const bootstrapDone = /\/bootstrap\s+TASK-\d+/.test(content) ||
                          /Worktree.*created|worktree.*exists/i.test(content) ||
                          /draft PR.*created/i.test(content);

    // Check if commit step has been reached
    const commitReached = /semantic-commit-writer|Step 6.*commit/i.test(content);

    // Only enforce during implementation phase (after bootstrap, before commit)
    return bootstrapDone && !commitReached;
  } catch {
    return false;
  }
}

/**
 * Check if /work-implement has been invoked
 */
function hasWorkImplementBeenInvoked(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(transcriptPath, 'utf8');

    // Check for /work-implement invocation
    const patterns = [
      /<command-name>\/work-implement<\/command-name>/,
      /"skill"\s*:\s*"work-implement"/,
      /# Implement Command/  // The command's header
    ];

    return patterns.some(pattern => pattern.test(content));
  } catch {
    return false;
  }
}

/**
 * Check if currently inside a developer agent
 */
function isInsideDeveloperAgent(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(transcriptPath, 'utf8');
    const developerAgents = [
      'developer-nodejs-tdd',
      'developer-react-senior',
      'developer-react-ui-architect',
      'developer-devops'
    ];

    // Check if we're inside a developer agent
    for (const agent of developerAgents) {
      const frontmatterPattern = new RegExp(`^name:\\s*${agent}`, 'm');
      if (frontmatterPattern.test(content)) {
        return true;
      }
      // Also check if agent was invoked via Task
      const taskPattern = new RegExp(`"subagent_type"\\s*:\\s*"${agent}"`, 'i');
      if (taskPattern.test(content)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Check if the file being edited is allowed without /work-implement
 */
function isFileAllowed(filePath) {
  if (!filePath) return false;
  return ALLOWED_PATTERNS.some(pattern => pattern.test(filePath));
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

  // Only check blocked tools
  if (!BLOCKED_TOOLS.includes(toolName)) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Check if /work command is active in implementation phase
  if (!isWorkCommandActive(transcriptPath)) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Get the file path being edited
  const filePath = toolInput.file_path || toolInput.path || '';

  // Allow config/non-code files
  if (isFileAllowed(filePath)) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Check if /work-implement has been invoked
  if (hasWorkImplementBeenInvoked(transcriptPath)) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Check if inside a developer agent (which means /work-implement delegated properly)
  if (isInsideDeveloperAgent(transcriptPath)) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Block the operation
  console.log(JSON.stringify({
    decision: 'block',
    reason: `╔══════════════════════════════════════════════════════════════════════╗
║  ⚠️  /work Step 4 requires /work-implement                            ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Direct ${toolName} blocked during /work implementation phase.
║                                                                      ║
║  You MUST invoke /work-implement first:                              ║
║                                                                      ║
║    /work-implement <summary of ticket requirements>                  ║
║                                                                      ║
║  This ensures:                                                       ║
║    ✓ Proper agent delegation (developer-*)                           ║
║    ✓ TodoWrite planning                                              ║
║    ✓ Quality checks before proceeding                                ║
║                                                                      ║
║  See /work Step 4 for details.                                       ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝`
  }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  // On error, approve to avoid blocking legitimate operations
  console.log(JSON.stringify({ decision: 'approve' }));
});

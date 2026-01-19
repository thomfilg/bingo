#!/usr/bin/env node

/**
 * PreToolUse hook to enforce agent usage during /work-implement command.
 *
 * When /work-implement is active, blocks direct Write/Edit operations
 * unless a developer-* agent has been invoked first.
 */

const fs = require('fs');

// Developer agents that satisfy the requirement
const DEVELOPER_AGENTS = [
  'developer-nodejs-tdd',
  'developer-react-senior',
  'developer-react-ui-architect',
  'developer-devops'
];

// Tools that require agent invocation first
const BLOCKED_TOOLS = ['Write', 'Edit', 'MultiEdit'];

// Files that are allowed without agent (config, non-code files)
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
];

/**
 * Check if /work-implement command is active in the transcript
 */
function isWorkImplementActive(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(transcriptPath, 'utf8');

    // Look for /work-implement invocation
    // Pattern: Skill tool with skill: "work-implement" or direct /work-implement mention
    const patterns = [
      /<command-name>\/work-implement<\/command-name>/,
      /"skill"\s*:\s*"work-implement"/,
      /# Implement Command/  // The command's header from work-implement.md
    ];

    return patterns.some(pattern => pattern.test(content));
  } catch {
    return false;
  }
}

/**
 * Check if a developer agent has been invoked
 */
function hasDeveloperAgentBeenInvoked(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(transcriptPath, 'utf8');

    // Check if any developer agent has been called via Task tool
    for (const agent of DEVELOPER_AGENTS) {
      const pattern = new RegExp(`"subagent_type"\\s*:\\s*"${agent}"`, 'i');
      if (pattern.test(content)) {
        return true;
      }
    }

    // Also check if we're currently INSIDE a developer agent
    for (const agent of DEVELOPER_AGENTS) {
      const frontmatterPattern = new RegExp(`^name:\\s*${agent}`, 'm');
      if (frontmatterPattern.test(content)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Check if the file being edited is allowed without agent
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

  // Check if /work-implement is active
  if (!isWorkImplementActive(transcriptPath)) {
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

  // Check if a developer agent has been invoked
  if (hasDeveloperAgentBeenInvoked(transcriptPath)) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Block the operation
  console.log(JSON.stringify({
    decision: 'block',
    reason: `╔══════════════════════════════════════════════════════════════════════╗
║  ⚠️  /work-implement requires agent delegation                        ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Direct ${toolName} blocked. Use a developer agent first:
║                                                                      ║
║  Task({                                                              ║
║    subagent_type: "developer-nodejs-tdd",      // Backend            ║
║    subagent_type: "developer-react-senior",    // React logic        ║
║    subagent_type: "developer-react-ui-architect", // UI design       ║
║    subagent_type: "developer-devops",          // Infrastructure     ║
║    prompt: "Implement: <your task>"                                  ║
║  })                                                                  ║
║                                                                      ║
║  Or for simple config changes, edit allowed files:                   ║
║  (.md, .json, .yml, .env, package.json, tsconfig.*, etc.)            ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝`
  }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  // On error, approve to avoid blocking legitimate operations
  console.log(JSON.stringify({ decision: 'approve' }));
});

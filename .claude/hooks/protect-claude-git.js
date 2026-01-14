#!/usr/bin/env node

/**
 * PreToolUse hook to block direct git commits in .claude directory.
 * Only pnpm run commit / npm run commit is allowed.
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

  const toolName = hookData.tool_name;
  const toolInput = hookData.tool_input || {};

  if (toolName !== 'Bash') {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  const command = toolInput.command || '';

  // Check if this is a git commit command (including git -C path commit)
  const isGitCommit = /\bgit\s+(?:-C\s+\S+\s+)?commit\b/.test(command);

  if (!isGitCommit) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Patterns that indicate .claude directory involvement
  const claudeDirPatterns = [
    /\.claude/,                          // Any mention of .claude
    /\bgit\s+-C\s+\S*\.claude/,          // git -C ~/.claude
    /\bcd\s+\S*\.claude/,                // cd ~/.claude or cd /path/.claude
    /\bpushd\s+\S*\.claude/,             // pushd ~/.claude
  ];

  const targetsClaudeDir = claudeDirPatterns.some(p => p.test(command));

  if (!targetsClaudeDir) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Check if it's being run via the commit script
  const isViaCommitScript =
    command.includes('pnpm run commit') ||
    command.includes('pnpm commit') ||
    command.includes('npm run commit');

  if (isViaCommitScript) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Block direct git commit in .claude directory
  console.log(JSON.stringify({
    decision: 'block',
    reason: `
╔══════════════════════════════════════════════════════════════════════╗
║  🚫 DIRECT GIT COMMIT BLOCKED IN .claude DIRECTORY                   ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Direct git commits are NOT allowed in ~/.claude                     ║
║                                                                      ║
║  The .claude.json file contains machine-specific data that must      ║
║  be cleaned before committing to avoid corruption.                   ║
║                                                                      ║
║  ✅ USE THIS INSTEAD:                                                ║
║                                                                      ║
║     cd ~/.claude && pnpm run commit                                  ║
║                                                                      ║
║  Or with a message:                                                  ║
║                                                                      ║
║     cd ~/.claude && pnpm run commit -- "your message"                ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝`
  }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  console.log(JSON.stringify({ decision: 'approve' }));
});

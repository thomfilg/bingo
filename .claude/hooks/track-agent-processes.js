#!/usr/bin/env node

/**
 * PreToolUse hook to enforce trackable background processes.
 *
 * Blocks background Bash commands unless they use a named session
 * (screen, tmux) that can be killed later.
 */

const BACKGROUND_INDICATORS = [
  'pnpm dev',
  'npm run dev',
  'yarn dev',
  'vite',
  'next dev',
  'node --watch',
  'nodemon',
];

// Patterns that make a process trackable/killable
const TRACKABLE_PATTERNS = [
  /screen\s+-S\s+\S+/,            // screen -S session-name
  /tmux\s+new-session.*-s\s+\S+/, // tmux new-session -s name
  /tmux\s+new\s+-s\s+\S+/,        // tmux new -s name
  /--pid-file[=\s]\S+/,           // writes PID to file
  /echo\s+\$\$\s*>\s*\S+/,        // echo $$ > pidfile
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
  const runInBackground = toolInput.run_in_background === true;

  // Check if this is a background/long-running process
  const isBackgroundProcess = runInBackground ||
    command.includes(' &') ||
    command.endsWith('&') ||
    command.includes('nohup') ||
    BACKGROUND_INDICATORS.some(indicator => command.includes(indicator));

  if (!isBackgroundProcess) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Check if it's trackable
  const isTrackable = TRACKABLE_PATTERNS.some(pattern => pattern.test(command));

  if (isTrackable) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Block untrackable background process
  const agent = process.env.CLAUDE_CURRENT_AGENT || 'agent';

  console.log(JSON.stringify({
    decision: 'block',
    reason: `
╔══════════════════════════════════════════════════════════════════════╗
║  ⚠️  UNTRACKABLE BACKGROUND PROCESS BLOCKED                          ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Background processes must use named sessions for cleanup.           ║
║                                                                      ║
║  Use one of these patterns:                                          ║
║                                                                      ║
║  screen -S ${agent}-dev -dm bash -c 'pnpm dev'
║  tmux new-session -d -s ${agent}-dev 'pnpm dev'
║                                                                      ║
║  Then cleanup with:                                                  ║
║    screen -S ${agent}-dev -X quit
║    tmux kill-session -t ${agent}-dev
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝`
  }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  console.log(JSON.stringify({ decision: 'approve' }));
});

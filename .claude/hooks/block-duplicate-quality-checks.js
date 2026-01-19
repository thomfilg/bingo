#!/usr/bin/env node

/**
 * Stop hook to prevent duplicate lint/typecheck/test runs
 * Only quality-checker agent should run these commands
 * Blocks if:
 * - Agent context is NOT quality-checker AND
 * - Command is pnpm lint, pnpm typecheck, pnpm test, pnpm build, eslint, tsc, vitest, jest
 */

const fs = require('fs');

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const hookData = JSON.parse(input);

  // Prevent infinite loops
  if (hookData.stop_hook_active) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  const transcriptPath = hookData.transcript_path;
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Read transcript
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.trim().split('\n');

  // Get recent messages (last 30 for context)
  const recentMessages = [];
  for (let i = Math.max(0, lines.length - 30); i < lines.length; i++) {
    try {
      recentMessages.push(JSON.parse(lines[i]));
    } catch (e) {}
  }

  // Detect agent context from transcript
  let isQualityCheckerAgent = false;
  let isCodeCheckerAgent = false;
  let isQAAgent = false;
  let isCompletionCheckerAgent = false;
  let currentBashCommand = '';

  for (const msg of recentMessages) {
    const msgContent = msg.message?.content;
    if (!msgContent) continue;

    const contentStr = typeof msgContent === 'string' ? msgContent : JSON.stringify(msgContent);

    // Detect which agent context we're in
    if (/quality-checker|Run lint.*typecheck.*tests|YOU ARE THE ONLY AGENT that runs lint/i.test(contentStr)) {
      isQualityCheckerAgent = true;
    }
    if (/code-checker|Review all recent changes|READ and ANALYZE code only/i.test(contentStr)) {
      isCodeCheckerAgent = true;
    }
    if (/qa-feature-tester|MANUAL tester|Playwright.*MANDATORY/i.test(contentStr)) {
      isQAAgent = true;
    }
    if (/completion-checker|Verify.*requirements.*delivered/i.test(contentStr)) {
      isCompletionCheckerAgent = true;
    }

    // Get current Bash command being executed
    if (Array.isArray(msgContent)) {
      for (const block of msgContent) {
        if (block.type === 'tool_use' && block.name === 'Bash' && block.input?.command) {
          currentBashCommand = block.input.command;
        }
      }
    }
  }

  // If we're in quality-checker context, allow all commands
  if (isQualityCheckerAgent && !isCodeCheckerAgent && !isQAAgent && !isCompletionCheckerAgent) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Check if command is a quality check command
  const qualityCheckPattern = /\b(pnpm\s+(lint|typecheck|test|build)|npm\s+run\s+(lint|typecheck|test|build)|eslint|tsc\b|vitest|jest)\b/i;

  // Bypass: Allow tests in ~/.claude directory (hook unit tests)
  const isClaudeFolderTest = /cd\s+[~$]*(HOME|\/home\/\w+)?\/?\.claude|\.claude\/hooks|test:hooks/.test(currentBashCommand);
  if (isClaudeFolderTest) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Check if we're in a non-quality-checker agent context running quality commands
  if ((isCodeCheckerAgent || isQAAgent || isCompletionCheckerAgent) && qualityCheckPattern.test(currentBashCommand)) {
    const agentType = isCodeCheckerAgent ? 'code-checker' : isQAAgent ? 'qa-feature-tester' : 'completion-checker';

    console.log(JSON.stringify({
      decision: 'block',
      reason: `BLOCKED: ${agentType} agent cannot run lint/typecheck/test commands!

Command attempted: ${currentBashCommand}

ONLY the quality-checker agent is allowed to run:
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build

Your job is to:
${isCodeCheckerAgent ? '- READ and ANALYZE code (use git diff, Read, Grep tools)' : ''}
${isQAAgent ? '- MANUAL testing with Playwright browser tools' : ''}
${isCompletionCheckerAgent ? '- VERIFY requirements (use gh pr diff, Read, Grep tools)' : ''}

Do NOT run quality check commands - quality-checker handles those.`
    }));
    return;
  }

  console.log(JSON.stringify({ decision: 'approve' }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  console.log(JSON.stringify({ decision: 'approve' }));
});

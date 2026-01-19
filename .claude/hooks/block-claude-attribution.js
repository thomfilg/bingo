#!/usr/bin/env node

/**
 * Stop hook to block Claude attribution in commits, PRs, and files
 * Blocks if:
 * - Commit message contains "claude" (case insensitive)
 * - PR description contains "claude"
 * - Any created/modified file contains "claude" string
 */

const fs = require('fs');
const { execSync } = require('child_process');

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

  // Get recent messages
  const recentMessages = [];
  for (let i = Math.max(0, lines.length - 20); i < lines.length; i++) {
    try {
      recentMessages.push(JSON.parse(lines[i]));
    } catch (e) {}
  }

  let isCommitContext = false;
  let isPRContext = false;
  let lastAssistantMessage = '';
  let toolCalls = [];

  for (const msg of recentMessages) {
    const msgContent = msg.message?.content;
    if (!msgContent) continue;

    const contentStr = typeof msgContent === 'string' ? msgContent : JSON.stringify(msgContent);

    // Detect context
    if (/commit-writer|semantic-commit|git commit/i.test(contentStr)) {
      isCommitContext = true;
    }
    if (/pr-generator|pull request|gh pr create|create.*PR/i.test(contentStr)) {
      isPRContext = true;
    }

    // Capture assistant messages
    if (msg.type === 'assistant' || msg.message?.role === 'assistant') {
      lastAssistantMessage = contentStr;

      // Check for tool calls (Bash with git commit, Edit, Write)
      if (Array.isArray(msgContent)) {
        for (const block of msgContent) {
          if (block.type === 'tool_use') {
            toolCalls.push(block);
          }
        }
      }
    }
  }

  const violations = [];

  // Check 1: Commit message contains "claude"
  if (isCommitContext) {
    // Look for git commit command in tool calls
    for (const tool of toolCalls) {
      if (tool.name === 'Bash' && tool.input?.command) {
        const cmd = tool.input.command;
        if (/git commit/i.test(cmd)) {
          // Extract commit message
          const msgMatch = cmd.match(/-m\s*["']([^"']+)["']/i) ||
                          cmd.match(/<<['"]?EOF[\s\S]*?\n([\s\S]*?)\nEOF/i);
          if (msgMatch) {
            const commitMsg = msgMatch[1];
            if (/claude/i.test(commitMsg)) {
              violations.push('Commit message contains "Claude" - remove all Claude attribution');
            }
          }
        }
      }
    }
  }

  // Check 2: PR description contains "claude"
  if (isPRContext) {
    // Look for gh pr create or PR body
    for (const tool of toolCalls) {
      if (tool.name === 'Bash' && tool.input?.command) {
        const cmd = tool.input.command;
        if (/gh pr create|gh pr edit/i.test(cmd) && /claude/i.test(cmd)) {
          violations.push('PR description contains "Claude" - remove all Claude attribution');
        }
      }
      // Check MCP GitHub tool
      if (tool.name?.includes('github') && tool.name?.includes('pull_request')) {
        const inputStr = JSON.stringify(tool.input || {});
        if (/claude/i.test(inputStr)) {
          violations.push('PR description contains "Claude" - remove all Claude attribution');
        }
      }
    }
  }

  // Check 3: Files containing "claude" string
  for (const tool of toolCalls) {
    if (tool.name === 'Write' || tool.name === 'Edit') {
      const filePath = tool.input?.file_path || tool.input?.path || '';
      const fileContent = tool.input?.content || tool.input?.new_string || '';

      // Skip ALL .claude/ folder edits - editing is fine, committing is not
      const isClaudeConfig = /[\/\\]\.claude[\/\\]/i.test(filePath) ||
                             /^\.claude[\/\\]/i.test(filePath);
      if (isClaudeConfig) {
        continue;
      }

      // Block ANY file containing "claude" - no exceptions
      if (/claude/i.test(fileContent)) {
        violations.push(`File "${filePath}" contains "Claude" string - remove it`);
      }
    }
  }

  // Check 4: Block if .claude/ files are in git diff (staged or unstaged)
  try {
    // Check staged files
    const stagedFiles = execSync('git diff --cached --name-only 2>/dev/null || echo ""', { encoding: 'utf8' });
    const claudeFilesStaged = stagedFiles.split('\n').filter(f => f.trim() && (/^\.claude[\/\\]/i.test(f) || /[\/\\]\.claude[\/\\]/i.test(f)));
    for (const file of claudeFilesStaged) {
      violations.push(`File "${file}" is staged for commit - unstage .claude/ config files`);
    }

    // Check unstaged modified files
    const unstagedFiles = execSync('git diff --name-only 2>/dev/null || echo ""', { encoding: 'utf8' });
    const claudeFilesUnstaged = unstagedFiles.split('\n').filter(f => f.trim() && (/^\.claude[\/\\]/i.test(f) || /[\/\\]\.claude[\/\\]/i.test(f)));
    for (const file of claudeFilesUnstaged) {
      violations.push(`File "${file}" has uncommitted changes - revert .claude/ config file changes`);
    }
  } catch (e) {
    // Git not available or not in repo, skip this check
  }

  // Check assistant's text output for Co-Authored-By
  if (/co-authored-by.*claude/i.test(lastAssistantMessage) ||
      /generated.*with.*claude/i.test(lastAssistantMessage) ||
      /created.*by.*claude/i.test(lastAssistantMessage)) {
    violations.push('Output contains Claude attribution text - remove it');
  }

  if (violations.length > 0) {
    console.log(JSON.stringify({
      decision: 'block',
      reason: `BLOCKED: Claude attribution detected!

Violations found:
${violations.map(v => `- ${v}`).join('\n')}

You MUST remove all Claude mentions from:
- Commit messages
- PR titles and descriptions
- File contents (except .claude config files)
- Co-Authored-By headers

Fix these issues before completing.`
    }));
    return;
  }

  console.log(JSON.stringify({ decision: 'approve' }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  console.log(JSON.stringify({ decision: 'approve' }));
});

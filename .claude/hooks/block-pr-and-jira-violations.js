#!/usr/bin/env node

/**
 * Stop hook to enforce workflow rules from reminders
 * Blocks violations of:
 * 1. PR titles must include Jira ID (TASK-XXX)
 * 2. Direct mcp__atlassian__jira_create_issue (must use jira-task-creator agent)
 */

const fs = require('fs');

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const hookData = JSON.parse(input);

  if (hookData.stop_hook_active) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  const transcriptPath = hookData.transcript_path;
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.trim().split('\n');

  const recentMessages = [];
  for (let i = Math.max(0, lines.length - 15); i < lines.length; i++) {
    try {
      recentMessages.push(JSON.parse(lines[i]));
    } catch (e) {}
  }

  const violations = [];
  let toolCalls = [];

  for (const msg of recentMessages) {
    const msgContent = msg.message?.content;
    if (!msgContent) continue;

    if (msg.type === 'assistant' || msg.message?.role === 'assistant') {
      if (Array.isArray(msgContent)) {
        for (const block of msgContent) {
          if (block.type === 'tool_use') {
            toolCalls.push(block);
          }
        }
      }
    }
  }

  for (const tool of toolCalls) {
    // Check Bash commands for PR-related rules
    if (tool.name === 'Bash' && tool.input?.command) {
      const cmd = tool.input.command;

      // Rule 1: PR title must include Jira ID
      if (/gh\s+pr\s+create/i.test(cmd)) {
        const titleMatch = cmd.match(/--title\s+["']([^"']+)["']/i);
        if (titleMatch) {
          const title = titleMatch[1];
          if (!/TASK-\d+/i.test(title)) {
            violations.push({
              rule: 'PR Title Jira ID',
              message: 'PR title must include Jira ID (e.g., TASK-829)',
              suggestion: 'Format: TASK-XXX - type(scope): description'
            });
          }
        }
      }
    }

    // Rule 3: Block direct jira_create_issue (must use jira-task-creator agent)
    // Skip if running inside jira-task-creator agent (detect by transcript content)
    if (tool.name === 'mcp__atlassian__jira_create_issue') {
      // Check if transcript contains jira-task-creator agent initialization
      // Subagent transcripts start with the agent's system prompt containing its name
      const isJiraAgent = content.includes('jira-task-creator') ||
                          content.includes('Jira Task Creator');

      if (!isJiraAgent) {
        violations.push({
          rule: 'Use jira-task-creator agent',
          message: 'Do not call mcp__atlassian__jira_create_issue directly',
          suggestion: 'Use Task tool with subagent_type="jira-task-creator" instead'
        });
      }
    }

  }

  if (violations.length > 0) {
    const violationText = violations.map(v =>
      `❌ ${v.rule}\n   Issue: ${v.message}\n   Fix: ${v.suggestion}`
    ).join('\n\n');

    console.log(JSON.stringify({
      decision: 'block',
      reason: `BLOCKED: Workflow rule violations detected!

${violationText}

Fix these issues before proceeding.`
    }));
    return;
  }

  console.log(JSON.stringify({ decision: 'approve' }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  console.log(JSON.stringify({ decision: 'approve' }));
});

#!/usr/bin/env node

/**
 * Stop hook to enforce using MCP Atlassian tools instead of curl/REST API
 * Blocks if:
 * - curl/REST was used to access Jira/Atlassian endpoints
 * - mcp__atlassian__* tools were not used for Jira operations
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

  // Get all messages from session
  const messages = [];
  for (const line of lines) {
    try {
      messages.push(JSON.parse(line));
    } catch (e) {}
  }

  let usedCurlForJira = false;
  let usedMcpAtlassian = false;
  let jiraRelatedOperation = false;
  const violations = [];
  const curlCommands = [];

  // Patterns for Jira/Atlassian REST API calls
  const atlassianApiPatterns = [
    /atlassian\.net\/rest\/api/i,
    /atlassian\.net\/wiki\/api/i,
    /jira.*\/rest\/api/i,
    /confluence.*\/rest\/api/i,
    /unifiedmusicgroup\.atlassian\.net/i,
    /personal\.atlassian\.net/i,
  ];

  // Patterns for Jira-related operations in user messages
  const jiraOperationPatterns = [
    /\bjira\b/i,
    /\bticket\b/i,
    /\bissue\b/i,
    /\bconfluence\b/i,
    /\bTASK-\d+/i,
    /\b[A-Z]+-\d+\b/,  // Generic Jira ticket pattern
    /\bsprint\b/i,
    /\bepic\b/i,
    /\bstory\b/i,
    /\bbacklog\b/i,
  ];

  // Find index of last user message to only check recent activity
  let lastUserIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.type === 'human' || msg.message?.role === 'user') {
      lastUserIndex = i;
      break;
    }
  }

  // Only check messages after last user message (ignore historical violations)
  const messagesToCheck = lastUserIndex >= 0
    ? messages.slice(lastUserIndex)
    : messages;

  for (const msg of messagesToCheck) {
    const msgContent = msg.message?.content;
    if (!msgContent) continue;

    const contentStr = typeof msgContent === 'string' ? msgContent : JSON.stringify(msgContent);

    // Check if this is a Jira-related operation
    if (msg.type === 'human' || msg.message?.role === 'user') {
      for (const pattern of jiraOperationPatterns) {
        if (pattern.test(contentStr)) {
          jiraRelatedOperation = true;
          break;
        }
      }
    }

    // Check for tool calls
    if (msg.type === 'assistant' || msg.message?.role === 'assistant') {
      if (Array.isArray(msgContent)) {
        for (const block of msgContent) {
          if (block.type === 'tool_use') {
            const toolName = block.name || '';
            const toolInput = block.input || {};

            // Check if MCP Atlassian tools were used
            if (toolName.startsWith('mcp__atlassian__')) {
              usedMcpAtlassian = true;
            }

            // Check for curl/wget calls to Atlassian APIs
            if (toolName === 'Bash') {
              const cmd = toolInput.command || '';

              // Check if command is curl/wget to Atlassian
              if (/^(curl|wget)\s/i.test(cmd.trim()) || /&&\s*(curl|wget)\s/i.test(cmd)) {
                for (const pattern of atlassianApiPatterns) {
                  if (pattern.test(cmd)) {
                    usedCurlForJira = true;
                    curlCommands.push(cmd.substring(0, 100) + (cmd.length > 100 ? '...' : ''));
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Block if curl was used for Jira and MCP was not used
  if (usedCurlForJira && !usedMcpAtlassian) {
    violations.push('Used curl/REST API for Jira/Atlassian instead of MCP tools');
    violations.push('');
    violations.push('Commands detected:');
    for (const cmd of curlCommands) {
      violations.push(`  - ${cmd}`);
    }
  }

  // Also warn if Jira operation was requested but only curl was used
  if (jiraRelatedOperation && usedCurlForJira && !usedMcpAtlassian) {
    violations.push('');
    violations.push('A Jira-related operation was requested but MCP tools were not used.');
  }

  if (violations.length > 0) {
    console.log(JSON.stringify({
      decision: 'block',
      reason: `BLOCKED: Must use MCP Atlassian tools!

${violations.join('\n')}

You MUST use mcp__atlassian__* tools for Jira/Confluence operations:
- mcp__atlassian__jira_get_issue - Get ticket details
- mcp__atlassian__jira_search - Search tickets
- mcp__atlassian__jira_update_issue - Update ticket fields
- mcp__atlassian__jira_transition_issue - Change ticket status
- mcp__atlassian__jira_add_comment - Add comment
- mcp__atlassian__jira_get_transitions - Get available transitions
- mcp__atlassian__confluence_search - Search Confluence
- mcp__atlassian__confluence_get_page - Get page content

DO NOT use curl, wget, or REST API calls directly.
Retry using the appropriate MCP tool.`
    }));
    return;
  }

  console.log(JSON.stringify({ decision: 'approve' }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  console.log(JSON.stringify({ decision: 'approve' }));
});

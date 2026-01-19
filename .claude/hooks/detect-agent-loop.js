#!/usr/bin/env node

/**
 * PreToolUse hook to detect agent loops
 *
 * Detects patterns that indicate an agent is stuck:
 * 1. Same file read 5+ times in recent history
 * 2. Same tool called 10+ times with similar params
 * 3. Warmup-related patterns
 *
 * Uses a state file to track tool calls across turns.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STATE_DIR = '/tmp/claude-loop-detection';
const MAX_FILE_READS = 5;
const MAX_SAME_TOOL_CALLS = 10;
const STATE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// Ensure state directory exists
if (!fs.existsSync(STATE_DIR)) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
}

function getStateFile() {
  // Use cwd hash to separate state per worktree
  const cwd = process.cwd();
  const hash = crypto.createHash('md5').update(cwd).digest('hex').slice(0, 8);
  return path.join(STATE_DIR, `loop-state-${hash}.json`);
}

function loadState() {
  const stateFile = getStateFile();
  try {
    if (fs.existsSync(stateFile)) {
      const data = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      // Check if state is expired
      if (Date.now() - data.lastUpdated > STATE_EXPIRY_MS) {
        return createFreshState();
      }
      return data;
    }
  } catch {
    // Ignore errors, return fresh state
  }
  return createFreshState();
}

function createFreshState() {
  return {
    fileReads: {},
    toolCalls: {},
    lastUpdated: Date.now()
  };
}

function saveState(state) {
  const stateFile = getStateFile();
  state.lastUpdated = Date.now();
  try {
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  } catch {
    // Ignore write errors
  }
}

function checkForLoops(state) {
  const issues = [];

  // Check for repeated file reads
  for (const [filePath, count] of Object.entries(state.fileReads)) {
    if (count >= MAX_FILE_READS) {
      issues.push(`File "${path.basename(filePath)}" read ${count} times`);
    }
  }

  // Check for repeated tool calls with same params
  for (const [toolKey, count] of Object.entries(state.toolCalls)) {
    if (count >= MAX_SAME_TOOL_CALLS) {
      const [toolName] = toolKey.split('::');
      issues.push(`Tool "${toolName}" called ${count}+ times with similar params`);
    }
  }

  return issues;
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  let hookData;
  try {
    hookData = JSON.parse(input);
  } catch {
    // If we can't parse input, approve and exit
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  const toolName = hookData.tool_name;
  const toolInput = hookData.tool_input || {};

  // Load current state
  const state = loadState();

  // Track this tool call
  if (toolName === 'Read' && toolInput.file_path) {
    const filePath = toolInput.file_path;
    state.fileReads[filePath] = (state.fileReads[filePath] || 0) + 1;
  }

  // Track general tool calls (hash params to group similar calls)
  const paramsHash = JSON.stringify(toolInput).slice(0, 100);
  const toolKey = `${toolName}::${paramsHash}`;
  state.toolCalls[toolKey] = (state.toolCalls[toolKey] || 0) + 1;

  // Save updated state
  saveState(state);

  // Check for loop patterns
  const issues = checkForLoops(state);

  if (issues.length > 0) {
    // Reset state to allow fresh start after blocking
    saveState(createFreshState());

    console.log(JSON.stringify({
      decision: 'block',
      reason: `
╔══════════════════════════════════════════════════════════════════════╗
║  🔄 AGENT LOOP DETECTED                                              ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  The agent appears to be stuck in a loop:                            ║
${issues.map(i => `║    • ${i.padEnd(60)}║`).join('\n')}
║                                                                      ║
║  AUTOMATIC ACTIONS:                                                  ║
║    • Loop state has been reset                                       ║
║    • This tool call has been blocked                                 ║
║                                                                      ║
║  MANUAL ACTIONS:                                                     ║
║    • Review what the agent is trying to accomplish                   ║
║    • Consider restarting the conversation                            ║
║    • Check if there's a blocking issue (permissions, etc)            ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝`
    }));
    return;
  }

  console.log(JSON.stringify({ decision: 'approve' }));
}

main().catch(err => {
  // On any error, approve to avoid blocking legitimate work
  console.error('Loop detection hook error:', err.message);
  console.log(JSON.stringify({ decision: 'approve' }));
});

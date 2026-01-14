#!/usr/bin/env node

/**
 * PreToolUse hook to prevent deletion of OTHER task folders.
 *
 * Rules:
 * - ALLOW: Deleting files in CURRENT task folder (for fresh /check)
 * - BLOCK: Deleting OTHER task folders or their contents
 * - BLOCK: Deleting the task folder itself (even current - only files inside)
 */

const path = require('path');
const { execSync } = require('child_process');

// Get current task ID from cwd or git branch
function getCurrentTaskId(cwd) {
  // Try to get from worktree folder name (e.g., app-services-monitoring-TASK-857)
  const worktreeMatch = cwd.match(/TASK-(\d+)/i);
  if (worktreeMatch) {
    return `TASK-${worktreeMatch[1]}`;
  }

  // Try to get from git branch name
  try {
    const branch = execSync('git branch --show-current', {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    const branchMatch = branch.match(/TASK-(\d+)/i);
    if (branchMatch) {
      return `TASK-${branchMatch[1]}`;
    }
  } catch {
    // Ignore git errors
  }

  return null;
}

// Extract task IDs from a command
function extractTaskIdsFromCommand(command) {
  const matches = command.match(/TASK-\d+/gi) || [];
  return [...new Set(matches.map(m => m.toUpperCase()))];
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const hookData = JSON.parse(input);
  const toolName = hookData.tool_name;
  const toolInput = hookData.tool_input || {};

  // Only check Bash commands
  if (toolName !== 'Bash') {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  const command = toolInput.command || '';
  const cwd = process.cwd();

  // Get current task
  const currentTaskId = getCurrentTaskId(cwd);

  // Check if command involves rm on tasks folder
  const isDeleteCommand = /\brm\b/.test(command);
  const involvesTasksFolder = /\/home\/node\/worktrees\/tasks\/|\/tasks\/TASK/i.test(command);

  if (!isDeleteCommand || !involvesTasksFolder) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Extract task IDs mentioned in the command
  const mentionedTasks = extractTaskIdsFromCommand(command);

  // Check if trying to delete a task folder itself (not just files inside)
  // Pattern: rm -rf tasks/TASK-XXX (without /* or specific files)
  const deletingFolderItself = /rm\s+(-[rf]+\s+)*.*\/home\/node\/worktrees\/tasks\/TASK-\d+\s*($|&&|\||\;)/i.test(command) ||
                               /rm\s+(-[rf]+\s+)*.*\/worktrees\/tasks\/TASK-\d+\s*($|&&|\||\;)/i.test(command);

  if (deletingFolderItself) {
    console.log(JSON.stringify({
      decision: 'block',
      reason: `🛑 BLOCKED: Cannot delete task folders!

❌ Command would delete entire task folder:
   ${command}

Task folders contain important artifacts that must be preserved.
You can delete FILES inside the current task folder, but not the folder itself.

If cleanup is needed, ask the user to do it manually.`
    }));
    return;
  }

  // Check if deleting files in a DIFFERENT task folder
  if (mentionedTasks.length > 0 && currentTaskId) {
    const otherTasks = mentionedTasks.filter(t => t !== currentTaskId);

    if (otherTasks.length > 0) {
      console.log(JSON.stringify({
        decision: 'block',
        reason: `🛑 BLOCKED: Cannot delete other task's files!

❌ Command would affect task(s): ${otherTasks.join(', ')}
❌ But you're working on: ${currentTaskId}

Command: ${command}

You can only delete files in your CURRENT task folder (${currentTaskId}).
Other task folders must be preserved.

If cleanup is needed for old tasks, ask the user to do it manually.`
      }));
      return;
    }
  }

  // If no current task detected but trying to delete task files, block
  if (!currentTaskId && mentionedTasks.length > 0) {
    console.log(JSON.stringify({
      decision: 'block',
      reason: `🛑 BLOCKED: Cannot delete task files without active task context!

❌ Command would affect task(s): ${mentionedTasks.join(', ')}
❌ But no current task detected (not in a task worktree/branch)

Command: ${command}

You can only delete task files when working on that specific task.
Ask the user to do cleanup manually.`
    }));
    return;
  }

  // Allow: deleting files in current task folder
  console.log(JSON.stringify({ decision: 'approve' }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  console.log(JSON.stringify({ decision: 'approve' }));
});

#!/usr/bin/env node

/**
 * Enforces that /work-pr is called before /work can complete.
 *
 * Flow:
 * - PreToolUse on /work: Creates .work-session file
 * - PreToolUse on /work-pr: Creates .work-pr-executed file
 * - PostToolUse on /work: Verifies .work-pr-executed exists, blocks if not
 */

const fs = require('fs');
const path = require('path');

const toolInput = JSON.parse(process.env.TOOL_INPUT || '{}');
const hookType = process.env.CLAUDE_HOOK_TYPE || 'PostToolUse'; // PreToolUse or PostToolUse

// Only handle work and work-pr skills
if (!['work', 'work-pr'].includes(toolInput.skill)) {
  process.exit(0);
}

// Extract ticket ID
const args = toolInput.args || '';
const ticketMatch = args.match(/TASK-\d+|\d+/);
if (!ticketMatch) {
  process.exit(0);
}

let ticketId = ticketMatch[0];
if (!ticketId.startsWith('TASK-')) {
  ticketId = `TASK-${ticketId}`;
}

const MAIN_WORKTREE = '/home/node/worktrees/app-services-monitoring';
const TASKS_DIR = path.join(MAIN_WORKTREE, 'tasks', ticketId);
const SESSION_FILE = path.join(TASKS_DIR, '.work-session');
const WORK_PR_EXECUTED_FILE = path.join(TASKS_DIR, '.work-pr-executed');

// Ensure tasks directory exists
if (!fs.existsSync(TASKS_DIR)) {
  fs.mkdirSync(TASKS_DIR, { recursive: true });
}

if (hookType === 'PreToolUse') {
  // ========== PRE TOOL USE ==========

  if (toolInput.skill === 'work') {
    // /work starting - create session file, clear any previous work-pr-executed
    const sessionData = {
      startedAt: new Date().toISOString(),
      ticketId,
      workPrExecuted: false
    };
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));

    // Clear previous work-pr-executed flag (fresh session)
    if (fs.existsSync(WORK_PR_EXECUTED_FILE)) {
      fs.unlinkSync(WORK_PR_EXECUTED_FILE);
    }

    console.log(`📋 /work session started for ${ticketId}`);
  }

  if (toolInput.skill === 'work-pr') {
    // /work-pr being called - mark it as executed
    const executedData = {
      executedAt: new Date().toISOString(),
      ticketId
    };
    fs.writeFileSync(WORK_PR_EXECUTED_FILE, JSON.stringify(executedData, null, 2));
    console.log(`✅ /work-pr marked as executed for ${ticketId}`);
  }

  process.exit(0);

} else {
  // ========== POST TOOL USE ==========

  if (toolInput.skill === 'work') {
    // /work completing - verify /work-pr was called

    const workPrExecuted = fs.existsSync(WORK_PR_EXECUTED_FILE);
    const prShaExists = fs.existsSync(path.join(TASKS_DIR, '.pr-update-sha'));
    const postPrShaExists = fs.existsSync(path.join(TASKS_DIR, '.post-pr-update-sha'));

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║  /work STEP VERIFICATION                                             ║');
    console.log('╠══════════════════════════════════════════════════════════════════════╣');
    console.log(`║  Ticket: ${ticketId.padEnd(58)}║`);
    console.log('╚══════════════════════════════════════════════════════════════════════╝');
    console.log('');

    const checks = [];

    if (workPrExecuted) {
      console.log('✅ /work-pr was executed during this session');
      checks.push(true);
    } else {
      console.log('❌ /work-pr was NOT executed during this session');
      checks.push(false);
    }

    if (prShaExists) {
      console.log('✅ .pr-update-sha exists');
      checks.push(true);
    } else {
      console.log('❌ .pr-update-sha is MISSING');
      checks.push(false);
    }

    if (postPrShaExists) {
      console.log('✅ .post-pr-update-sha exists');
      checks.push(true);
    } else {
      console.log('❌ .post-pr-update-sha is MISSING');
      checks.push(false);
    }

    console.log('');

    // Clean up session file
    if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
    }

    // Block if any check failed
    if (checks.includes(false)) {
      console.log('╔══════════════════════════════════════════════════════════════════════╗');
      console.log('║  🛑 BLOCKED: /work cannot complete without /work-pr                  ║');
      console.log('╠══════════════════════════════════════════════════════════════════════╣');
      console.log('║                                                                      ║');
      console.log('║  You MUST run:  /work-pr ' + ticketId.padEnd(40) + '║');
      console.log('║                                                                      ║');
      console.log('║  This command updates the PR and creates required SHA tracking.     ║');
      console.log('║                                                                      ║');
      console.log('╚══════════════════════════════════════════════════════════════════════╝');
      process.exit(1);
    }

    // All good - clean up work-pr-executed file
    if (fs.existsSync(WORK_PR_EXECUTED_FILE)) {
      fs.unlinkSync(WORK_PR_EXECUTED_FILE);
    }

    console.log('✅ All /work steps verified. Proceeding...');
  }

  process.exit(0);
}

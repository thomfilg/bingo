#!/usr/bin/env node

/**
 * Cleanup script for agent-spawned sessions.
 *
 * Usage:
 *   node cleanup-agent.js                 # List all sessions
 *   node cleanup-agent.js <agent-name>    # Kill sessions for agent
 *   node cleanup-agent.js --all           # Kill all agent sessions
 */

const { execSync } = require('child_process');

const args = process.argv.slice(2).filter(arg => arg !== '--');
const targetAgent = args.find(a => !a.startsWith('-'));
const killAll = args.includes('--all') || args.includes('-a');
const showHelp = args.includes('--help') || args.includes('-h');

if (showHelp) {
  console.log(`
Cleanup Agent Sessions - Kill screen/tmux sessions spawned by agents

Usage: pnpm run cleanup:agent [options] [agent-name]

Options:
  <agent-name>    Kill sessions matching agent name
  -a, --all       Kill all agent sessions
  -h, --help      Show this help

Examples:
  pnpm run cleanup:agent                      # List all sessions
  pnpm run cleanup:agent qa-feature-tester    # Kill QA agent's sessions
  pnpm run cleanup:agent developer            # Kill all developer-* sessions
  pnpm run cleanup:agent -- --all             # Kill all agent sessions
`);
  process.exit(0);
}

function getScreenSessions() {
  try {
    const output = execSync('screen -ls 2>/dev/null || true', { encoding: 'utf8' });
    const sessions = [];
    const regex = /(\d+)\.(\S+)/g;
    let match;
    while ((match = regex.exec(output)) !== null) {
      sessions.push({ type: 'screen', pid: match[1], name: match[2] });
    }
    return sessions;
  } catch {
    return [];
  }
}

function getTmuxSessions() {
  try {
    const output = execSync('tmux list-sessions -F "#{session_name}" 2>/dev/null || true', { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean).map(name => ({ type: 'tmux', name }));
  } catch {
    return [];
  }
}

function killSession(session) {
  try {
    if (session.type === 'screen') {
      execSync(`screen -S ${session.pid}.${session.name} -X quit 2>/dev/null`, { stdio: 'pipe' });
    } else if (session.type === 'tmux') {
      execSync(`tmux kill-session -t "${session.name}" 2>/dev/null`, { stdio: 'pipe' });
    }
    return true;
  } catch {
    return false;
  }
}

function isAgentSession(name) {
  // Match patterns like: developer-nodejs-tdd-dev, qa-feature-tester-dev, agent-dev
  const agentPatterns = [
    /^developer-/,
    /^qa-/,
    /^agent-/,
    /-dev$/,
    /-test$/,
    /-server$/,
  ];
  return agentPatterns.some(pattern => pattern.test(name));
}

function main() {
  const allSessions = [...getScreenSessions(), ...getTmuxSessions()];

  // Filter to agent sessions
  const agentSessions = allSessions.filter(s => isAgentSession(s.name));

  if (allSessions.length === 0) {
    console.log('📋 No screen/tmux sessions found.');
    return;
  }

  if (agentSessions.length === 0 && !targetAgent) {
    console.log('📋 No agent sessions found.');
    console.log(`   (${allSessions.length} other sessions exist)`);
    return;
  }

  // List mode
  if (!targetAgent && !killAll) {
    console.log('📋 Agent Sessions:\n');
    for (const session of agentSessions) {
      const icon = session.type === 'screen' ? '🖥️' : '📺';
      console.log(`  ${icon} [${session.type}] ${session.name}`);
    }

    const otherCount = allSessions.length - agentSessions.length;
    if (otherCount > 0) {
      console.log(`\n   (${otherCount} non-agent sessions hidden)`);
    }

    console.log('\n💡 To kill: pnpm run cleanup:agent <pattern>');
    console.log('   Or: pnpm run cleanup:agent -- --all');
    return;
  }

  // Kill mode
  let toKill;
  if (killAll) {
    toKill = agentSessions;
  } else if (targetAgent) {
    // Match by partial name
    toKill = allSessions.filter(s => s.name.includes(targetAgent));
  } else {
    toKill = [];
  }

  if (toKill.length === 0) {
    console.log(`❌ No sessions matching "${targetAgent || 'agent patterns'}" found.`);
    return;
  }

  console.log(`🔪 Killing ${toKill.length} session(s):\n`);

  let killed = 0;
  for (const session of toKill) {
    const icon = session.type === 'screen' ? '🖥️' : '📺';
    if (killSession(session)) {
      console.log(`  ✓ ${icon} ${session.name}`);
      killed++;
    } else {
      console.log(`  ✗ ${icon} ${session.name} (failed)`);
    }
  }

  console.log(`\n✅ Killed ${killed}/${toKill.length} session(s).`);
}

main();

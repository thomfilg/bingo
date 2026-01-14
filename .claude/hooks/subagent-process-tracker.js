#!/usr/bin/env node

/**
 * Tracks processes spawned by subagents and kills them when agent stops.
 *
 * Flow:
 * - PreToolUse on Task: Record current PIDs
 * - SubagentStop: Kill any new processes spawned during agent lifetime
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TRACKING_DIR = '/tmp/claude-process-tracking';
const hookType = process.env.CLAUDE_HOOK_TYPE || 'SubagentStop';

// Ensure tracking directory exists
if (!fs.existsSync(TRACKING_DIR)) {
  fs.mkdirSync(TRACKING_DIR, { recursive: true });
}

/**
 * Get current user's process PIDs
 */
function getCurrentPids() {
  try {
    const result = execSync('ps -u $(whoami) -o pid= 2>/dev/null', { encoding: 'utf8' });
    return result.split('\n').map(p => p.trim()).filter(Boolean).map(Number);
  } catch (e) {
    return [];
  }
}

/**
 * Get processes that are likely dev servers (worth tracking)
 */
function getDevServerPids() {
  try {
    const patterns = ['pnpm dev', 'vite', 'node.*dev', 'react-router', 'esbuild', 'tsx watch'];
    const result = execSync(`ps aux | grep -E '${patterns.join('|')}' | grep -v grep | awk '{print $2}'`, {
      encoding: 'utf8'
    });
    return result.split('\n').map(p => p.trim()).filter(Boolean).map(Number);
  } catch (e) {
    return [];
  }
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
    process.exit(0);
  }

  const agentId = hookData.agent_id || hookData.task_id || `agent-${Date.now()}`;
  const trackingFile = path.join(TRACKING_DIR, `${agentId}.json`);

  if (hookType === 'PreToolUse') {
    // Record PIDs before subagent starts
    const toolInput = JSON.parse(process.env.TOOL_INPUT || '{}');
    if (toolInput.subagent_type) {
      const pids = getCurrentPids();
      const devPids = getDevServerPids();
      fs.writeFileSync(trackingFile, JSON.stringify({
        startedAt: new Date().toISOString(),
        initialPids: pids,
        initialDevPids: devPids
      }, null, 2));
      console.log(`📋 Tracking processes for subagent: ${agentId}`);
    }
  }

  if (hookType === 'SubagentStop') {
    // Find and kill processes spawned during agent lifetime
    if (fs.existsSync(trackingFile)) {
      const tracking = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));
      const currentDevPids = getDevServerPids();
      const initialDevPids = new Set(tracking.initialDevPids || []);

      // Find new dev server processes
      const newPids = currentDevPids.filter(pid => !initialDevPids.has(pid));

      if (newPids.length > 0) {
        console.log(`🧹 Cleaning up ${newPids.length} dev server process(es) spawned by subagent`);
        newPids.forEach(pid => {
          try {
            execSync(`kill ${pid} 2>/dev/null`, { encoding: 'utf8' });
            console.log(`   Killed PID ${pid}`);
          } catch (e) {
            // Process may have already exited
          }
        });
      }

      // Cleanup tracking file
      fs.unlinkSync(trackingFile);
    }
  }

  console.log(JSON.stringify({ decision: 'approve' }));
}

main().catch(() => {
  console.log(JSON.stringify({ decision: 'approve' }));
});

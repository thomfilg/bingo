/**
 * Tests for track-agent-processes.js hook
 *
 * Run with: cd ~/.claude && pnpm test:hooks
 */

const { spawn } = require('child_process');
const path = require('path');

const HOOK_PATH = path.join(__dirname, '..', 'track-agent-processes.js');

/**
 * Helper to run the hook with given input and optional env vars
 */
function runHook(input, env = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [HOOK_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...env },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      try {
        const result = JSON.parse(stdout.trim());
        resolve({ result, stderr, code });
      } catch (e) {
        reject(new Error(`Failed to parse output: ${stdout}\nStderr: ${stderr}`));
      }
    });

    proc.on('error', reject);

    proc.stdin.write(JSON.stringify(input));
    proc.stdin.end();
  });
}

describe('track-agent-processes hook', () => {
  describe('Non-Bash tools', () => {
    it('should APPROVE Read tool', async () => {
      const { result } = await runHook({
        tool_name: 'Read',
        tool_input: { file_path: '/some/file.js' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE Write tool', async () => {
      const { result } = await runHook({
        tool_name: 'Write',
        tool_input: { file_path: '/some/file.js', content: 'test' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE Task tool', async () => {
      const { result } = await runHook({
        tool_name: 'Task',
        tool_input: { subagent_type: 'code-checker' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Non-background Bash commands', () => {
    it('should APPROVE simple ls command', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'ls -la' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE git status', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'git status' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE pnpm install', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'pnpm install' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE pnpm test', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'pnpm test' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE pnpm build', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'pnpm build' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Background indicators - BLOCKED without trackable pattern', () => {
    const backgroundCommands = [
      { cmd: 'pnpm dev', desc: 'pnpm dev' },
      { cmd: 'npm run dev', desc: 'npm run dev' },
      { cmd: 'yarn dev', desc: 'yarn dev' },
      { cmd: 'vite', desc: 'vite' },
      { cmd: 'next dev', desc: 'next dev' },
      { cmd: 'node --watch server.js', desc: 'node --watch' },
      { cmd: 'nodemon app.js', desc: 'nodemon' },
    ];

    it.each(backgroundCommands)(
      'should BLOCK untrackable "$desc" command',
      async ({ cmd }) => {
        const { result } = await runHook({
          tool_name: 'Bash',
          tool_input: { command: cmd },
        });

        expect(result.decision).toBe('block');
        expect(result.reason).toContain('UNTRACKABLE BACKGROUND PROCESS');
      }
    );
  });

  describe('Background process patterns - BLOCKED', () => {
    it('should BLOCK command with trailing &', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'node server.js &' },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('UNTRACKABLE BACKGROUND PROCESS');
    });

    it('should BLOCK command with & in middle', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'node server.js & echo started' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK nohup command', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'nohup node server.js' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK when run_in_background is true', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'node server.js', run_in_background: true },
      });

      expect(result.decision).toBe('block');
    });
  });

  describe('Trackable patterns - APPROVED', () => {
    describe('screen sessions', () => {
      it('should APPROVE screen -S with session name', async () => {
        const { result } = await runHook({
          tool_name: 'Bash',
          tool_input: { command: "screen -S agent-dev -dm bash -c 'pnpm dev'" },
        });

        expect(result.decision).toBe('approve');
      });

      it('should APPROVE screen -S with complex command', async () => {
        const { result } = await runHook({
          tool_name: 'Bash',
          tool_input: { command: 'screen -S developer-nodejs-server -dm bash -c "cd /app && pnpm dev"' },
        });

        expect(result.decision).toBe('approve');
      });
    });

    describe('tmux sessions', () => {
      it('should APPROVE tmux new-session -s', async () => {
        const { result } = await runHook({
          tool_name: 'Bash',
          tool_input: { command: 'tmux new-session -d -s qa-dev "pnpm dev"' },
        });

        expect(result.decision).toBe('approve');
      });

      it('should APPROVE tmux new -s (shorthand)', async () => {
        const { result } = await runHook({
          tool_name: 'Bash',
          tool_input: { command: 'tmux new -s agent-server -d "node server.js"' },
        });

        expect(result.decision).toBe('approve');
      });

      it('should APPROVE tmux new-session with -d before -s', async () => {
        const { result } = await runHook({
          tool_name: 'Bash',
          tool_input: { command: 'tmux new-session -d -s my-session "pnpm dev"' },
        });

        expect(result.decision).toBe('approve');
      });
    });

    describe('PID file patterns', () => {
      it('should APPROVE command with --pid-file=', async () => {
        const { result } = await runHook({
          tool_name: 'Bash',
          tool_input: { command: 'node server.js --pid-file=/tmp/server.pid &' },
        });

        expect(result.decision).toBe('approve');
      });

      it('should APPROVE command with --pid-file (space separator)', async () => {
        const { result } = await runHook({
          tool_name: 'Bash',
          tool_input: { command: 'node server.js --pid-file /tmp/server.pid &' },
        });

        expect(result.decision).toBe('approve');
      });

      it('should APPROVE command with echo $$ > pidfile', async () => {
        const { result } = await runHook({
          tool_name: 'Bash',
          tool_input: { command: 'echo $$ > /tmp/server.pid && node server.js &' },
        });

        expect(result.decision).toBe('approve');
      });
    });
  });

  describe('Edge cases', () => {
    it('should NOT false-positive on "developer" in path', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'ls /home/developer/projects' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should NOT false-positive on "dev" in package name', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'pnpm add -D @types/node' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should NOT block npm run dev:test (contains dev but also test)', async () => {
      // This actually contains "npm run dev" so it should block
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'npm run dev:test' },
      });

      // Contains 'npm run dev' substring - should block
      expect(result.decision).toBe('block');
    });

    it('should APPROVE pnpm run preview (not dev)', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'pnpm run preview' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Error handling', () => {
    it('should APPROVE on invalid JSON input', async () => {
      const proc = spawn('node', [HOOK_PATH], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      await new Promise((resolve) => {
        proc.on('close', resolve);
        proc.stdin.write('not valid json');
        proc.stdin.end();
      });

      const result = JSON.parse(stdout.trim());
      expect(result.decision).toBe('approve');
    });

    it('should APPROVE when tool_input is missing', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE when command is empty', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: '' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Block message content', () => {
    it('should include helpful session creation examples', async () => {
      const { result } = await runHook(
        {
          tool_name: 'Bash',
          tool_input: { command: 'pnpm dev' },
        },
        { CLAUDE_CURRENT_AGENT: 'developer-nodejs-tdd' }
      );

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('screen -S');
      expect(result.reason).toContain('tmux new-session');
      expect(result.reason).toContain('developer-nodejs-tdd-dev');
    });

    it('should use generic agent name when not set', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'pnpm dev' },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('agent-dev');
    });
  });
});

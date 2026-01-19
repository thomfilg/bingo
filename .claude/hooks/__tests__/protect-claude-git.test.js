/**
 * Tests for protect-claude-git.js hook
 *
 * Run with: cd ~/.claude && pnpm test:hooks
 */

const { spawn } = require('child_process');
const path = require('path');

const HOOK_PATH = path.join(__dirname, '..', 'protect-claude-git.js');

/**
 * Helper to run the hook with given input
 */
function runHook(input) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [HOOK_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
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

describe('protect-claude-git hook', () => {
  describe('Non-Bash tools', () => {
    it('should APPROVE Read tool', async () => {
      const { result } = await runHook({
        tool_name: 'Read',
        tool_input: { file_path: '/home/node/.claude/file.js' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE Write tool', async () => {
      const { result } = await runHook({
        tool_name: 'Write',
        tool_input: { file_path: '/home/node/.claude/file.js' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Git commands outside .claude', () => {
    it('should APPROVE git commit outside .claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'git commit -m "fix bug"' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE git commit in other directories', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cd /home/node/projects && git commit -m "test"' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE git -C /other/path commit', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'git -C /home/node/projects commit -m "msg"' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Git commits in .claude - BLOCKED', () => {
    it('should BLOCK cd ~/.claude && git commit', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cd ~/.claude && git commit -m "msg"' },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('DIRECT GIT COMMIT BLOCKED');
    });

    it('should BLOCK cd /home/node/.claude && git commit', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cd /home/node/.claude && git commit -m "msg"' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK git -C ~/.claude commit', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'git -C ~/.claude commit -m "msg"' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK git -C /home/node/.claude commit', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'git -C /home/node/.claude commit -m "msg"' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK pushd ~/.claude && git commit', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'pushd ~/.claude && git commit -m "msg" && popd' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK (cd ~/.claude; git commit)', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: '(cd ~/.claude; git commit -m "msg")' },
      });

      expect(result.decision).toBe('block');
    });
  });

  describe('Allowed commit script patterns', () => {
    it('should APPROVE cd ~/.claude && pnpm run commit', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cd ~/.claude && pnpm run commit' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE cd ~/.claude && pnpm run commit -- "msg"', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cd ~/.claude && pnpm run commit -- "my message"' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE cd ~/.claude && npm run commit', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cd ~/.claude && npm run commit' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE pnpm commit in .claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cd ~/.claude && pnpm commit' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Non-commit git commands', () => {
    it('should APPROVE git status in .claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cd ~/.claude && git status' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE git add in .claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cd ~/.claude && git add .' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE git log in .claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cd ~/.claude && git log --oneline' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE git diff in .claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cd ~/.claude && git diff' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE git push in .claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cd ~/.claude && git push origin master' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE git pull in .claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cd ~/.claude && git pull' },
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
});

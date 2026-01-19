/**
 * Tests for pr-escaping-validator.js hook
 *
 * Run with: cd ~/.claude && pnpm test:hooks
 */

const { spawn } = require('child_process');
const path = require('path');

const HOOK_PATH = path.join(__dirname, '..', 'pr-escaping-validator.js');

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

describe('pr-escaping-validator hook', () => {
  describe('Non-PR operations', () => {
    it('should APPROVE non-PR bash commands', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'ls -la' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE gh pr view (not create/edit)', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'gh pr view 123' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE gh pr list', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'gh pr list --state open' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE when no tool_input', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE empty content', async () => {
      const { result } = await runHook({
        tool_input: { body: '', title: '', command: '' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('PR creation with valid content', () => {
    it('should APPROVE clean gh pr create', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: `gh pr create --title "feat: add new feature" --body "## Summary
This PR adds a new feature.

\`\`\`typescript
const foo = 'bar';
\`\`\`

| Column A | Column B |
|----------|----------|
| Value 1  | Value 2  |"`,
        },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE gh pr edit with clean content', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: 'gh pr edit 123 --body "Updated body with `inline code`"',
        },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE direct body/title without escaped chars', async () => {
      const { result } = await runHook({
        tool_input: {
          title: 'feat: new feature',
          body: '## Summary\nThis is a clean PR body with `code`.',
        },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Escaped code fence detection', () => {
    it('should BLOCK escaped triple backticks in command', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: 'gh pr create --body "\\`\\`\\`bash\necho hello\n\\`\\`\\`"',
        },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Escaped code fence');
    });

    it('should BLOCK escaped code fence in body field', async () => {
      const { result } = await runHook({
        tool_input: {
          body: 'Here is code:\n\\`\\`\\`\nconst x = 1;\n\\`\\`\\`',
        },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Escaped code fence');
    });
  });

  describe('Escaped single backtick detection', () => {
    it('should BLOCK escaped single backtick in command', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: 'gh pr create --body "Use \\`foo\\` for bar"',
        },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Escaped backtick');
    });

    it('should BLOCK escaped backtick in body', async () => {
      const { result } = await runHook({
        tool_input: {
          body: 'The variable \\`count\\` should be incremented.',
        },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Escaped backtick');
    });
  });

  describe('Escaped pipe detection', () => {
    it('should BLOCK escaped pipe in PR body (Jira table syntax)', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: 'gh pr create --body "\\| Column \\| Header \\|"',
        },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Escaped pipe');
    });

    it('should APPROVE escaped pipe in grep context', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: 'gh pr create --body "Run: grep \'pattern1\\|pattern2\' file.txt"',
        },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE escaped pipe in awk context', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: 'gh pr create --body "Use awk \'/foo\\|bar/\' to filter"',
        },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE escaped pipe in sed context', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: 'gh pr create --body "sed \'s/old\\|new/replaced/g\'"',
        },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE escaped pipe in rg context', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: 'gh pr create --body "rg \'pattern1\\|pattern2\'"',
        },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Escaped braces detection', () => {
    it('should BLOCK escaped braces in PR body', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: 'gh pr create --body "The config is \\{key: value\\}"',
        },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Escaped braces');
    });

    it('should APPROVE escaped braces in sed context', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: 'gh pr create --body "sed \'s/foo\\{2,3\\}/bar/g\'"',
        },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE escaped braces in awk context', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: 'gh pr create --body "awk \'/pattern\\{1,2\\}/\'"',
        },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Escaped angle brackets detection', () => {
    it('should BLOCK escaped angle brackets in PR body', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: 'gh pr create --body "The type is \\<string\\>"',
        },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Escaped angle brackets');
    });

    it('should BLOCK escaped angle brackets in title', async () => {
      const { result } = await runHook({
        tool_input: {
          title: 'feat: add \\<Component\\> support',
          body: 'Adding new component.',
        },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Escaped angle brackets');
    });
  });

  describe('Multiple issues detection', () => {
    it('should report all issues in one block', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: 'gh pr create --body "\\`\\`\\`js\n\\| Table \\|\n\\{config\\}\n\\<type\\>\n\\`\\`\\`"',
        },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Escaped code fence');
      expect(result.reason).toContain('Escaped pipe');
      expect(result.reason).toContain('Escaped braces');
      expect(result.reason).toContain('Escaped angle brackets');
    });
  });

  describe('Content from different field names', () => {
    it('should validate description field', async () => {
      const { result } = await runHook({
        tool_input: {
          description: 'Use \\`foo\\` for this.',
        },
      });

      expect(result.decision).toBe('block');
    });

    it('should validate content field', async () => {
      const { result } = await runHook({
        tool_input: {
          content: '\\| Header \\|',
        },
      });

      expect(result.decision).toBe('block');
    });

    it('should combine title and body for validation', async () => {
      // Title is clean but body has issues
      const { result } = await runHook({
        tool_input: {
          title: 'feat: clean title',
          body: 'Body with \\`escaped\\` backticks',
        },
      });

      expect(result.decision).toBe('block');
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

    it('should APPROVE on empty input', async () => {
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
      expect(result.decision).toBe('approve');
    });
  });

  describe('Edge cases', () => {
    it('should handle multiline PR body in heredoc', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: `gh pr create --body "$(cat <<'EOF'
## Summary
Clean PR body

\`\`\`typescript
const foo = 'bar';
\`\`\`

| A | B |
|---|---|
| 1 | 2 |
EOF
)"`,
        },
      });

      expect(result.decision).toBe('approve');
    });

    it('should detect escaped backticks even with surrounding content', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: 'gh pr create --title "test" --body "Some text before \\`code\\` and after"',
        },
      });

      expect(result.decision).toBe('block');
    });

    it('should not false positive on literal backslash-backtick discussion', async () => {
      // This test documents current behavior - if someone is documenting
      // the escaping issue itself, the hook might flag it
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: {
          command: 'gh pr create --body "Use ` not \\\\` for code"',
        },
      });

      // The \\\\` in the test string becomes \\` after first parse
      // which is what we're trying to detect
      expect(result.decision).toBe('block');
    });
  });
});

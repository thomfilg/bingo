/**
 * Tests for enforce-agent-usage.js hook
 *
 * Run with: cd ~/.claude && pnpm test:hooks
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const HOOK_PATH = path.join(__dirname, '..', 'enforce-agent-usage.js');

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

describe('enforce-agent-usage hook', () => {
  describe('Self-call blocking via Task tool', () => {
    const blockedAgents = [
      'pr-generator',
      'pr-post-generator',
      'semantic-commit-writer',
      'commit-writer',
      'jira-task-creator',
      'code-checker',
      'pr-reviewer',
      'qa-feature-tester',
      'quality-checker',
      'completion-checker',
      'project-coordinator',
      // Developer agents (developer-* prefix)
      'developer-devops',
      'developer-nodejs-tdd',
      'developer-react-ui-architect',
      'developer-react-senior',
    ];

    it.each(blockedAgents)(
      'should BLOCK when %s tries to call itself via Task',
      async (agentName) => {
        const { result } = await runHook(
          {
            tool_name: 'Task',
            tool_input: { subagent_type: agentName },
          },
          { CLAUDE_CURRENT_AGENT: agentName }
        );

        expect(result.decision).toBe('block');
        expect(result.reason).toContain('INFINITE LOOP BLOCKED');
        expect(result.reason).toContain(agentName);
      }
    );

    it('should APPROVE Task call to different agent', async () => {
      const { result } = await runHook(
        {
          tool_name: 'Task',
          tool_input: { subagent_type: 'code-checker' },
        },
        { CLAUDE_CURRENT_AGENT: 'pr-generator' }
      );

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE Task call when not running in any agent', async () => {
      const { result } = await runHook({
        tool_name: 'Task',
        tool_input: { subagent_type: 'pr-generator' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Self-call blocking via Skill tool', () => {
    it('should BLOCK when agent calls itself via Skill', async () => {
      const { result } = await runHook(
        {
          tool_name: 'Skill',
          tool_input: { skill: 'pr-generator' },
        },
        { CLAUDE_CURRENT_AGENT: 'pr-generator' }
      );

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Infinite loop detected');
    });

    it('should BLOCK when agent calls itself via Skill with slash prefix', async () => {
      const { result } = await runHook(
        {
          tool_name: 'Skill',
          tool_input: { skill: '/commit-writer' },
        },
        { CLAUDE_CURRENT_AGENT: 'commit-writer' }
      );

      expect(result.decision).toBe('block');
    });

    it('should APPROVE Skill call to different agent', async () => {
      const { result } = await runHook(
        {
          tool_name: 'Skill',
          tool_input: { skill: 'code-checker' },
        },
        { CLAUDE_CURRENT_AGENT: 'pr-generator' }
      );

      expect(result.decision).toBe('approve');
    });
  });

  describe('Jira ticket creation enforcement', () => {
    it('should BLOCK direct mcp__atlassian__jira_create_issue calls', async () => {
      const { result } = await runHook({
        tool_name: 'mcp__atlassian__jira_create_issue',
        tool_input: { project_key: 'TEST', summary: 'Test issue' },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Jira Ticket Creation');
      expect(result.reason).toContain('jira-task-creator');
    });

    it('should APPROVE mcp__atlassian__jira_create_issue when running in jira-task-creator', async () => {
      const { result } = await runHook(
        {
          tool_name: 'mcp__atlassian__jira_create_issue',
          tool_input: { project_key: 'TEST', summary: 'Test issue' },
        },
        { CLAUDE_CURRENT_AGENT: 'jira-task-creator' }
      );

      expect(result.decision).toBe('approve');
    });
  });

  describe('PR creation enforcement', () => {
    it('should BLOCK direct gh pr create calls', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'gh pr create --title "Test PR"' },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('PR Creation');
      expect(result.reason).toContain('pr-generator');
    });

    it('should APPROVE gh pr create when running in pr-generator', async () => {
      const { result } = await runHook(
        {
          tool_name: 'Bash',
          tool_input: { command: 'gh pr create --title "Test PR"' },
        },
        { CLAUDE_CURRENT_AGENT: 'pr-generator' }
      );

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE gh pr view (non-create PR commands)', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'gh pr view 123' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Git commit enforcement', () => {
    it('should BLOCK direct git commit calls', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'git commit -m "Test commit"' },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Semantic Commits');
      expect(result.reason).toContain('semantic-commit-writer');
    });

    it('should APPROVE git commit when running in semantic-commit-writer', async () => {
      const { result } = await runHook(
        {
          tool_name: 'Bash',
          tool_input: { command: 'git commit -m "Test commit"' },
        },
        { CLAUDE_CURRENT_AGENT: 'semantic-commit-writer' }
      );

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE git commit --amend (bypass pattern)', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'git commit --amend -m "Amended commit"' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE git commit with fixup! prefix', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'git commit -m "fixup! Previous commit"' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE git commit with squash! prefix', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'git commit -m "squash! Previous commit"' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE git add (non-commit commands)', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'git add .' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Wiki screenshot upload enforcement', () => {
    it('should BLOCK direct wiki clone', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'git clone git@github.com:org/repo.wiki.git /tmp/wiki' },
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Wiki Screenshot Upload');
      expect(result.reason).toContain('pr-post-generator');
    });

    it('should APPROVE wiki clone when running in pr-post-generator', async () => {
      const { result } = await runHook(
        {
          tool_name: 'Bash',
          tool_input: { command: 'git clone git@github.com:org/repo.wiki.git /tmp/wiki' },
        },
        { CLAUDE_CURRENT_AGENT: 'pr-post-generator' }
      );

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE branches with wiki in name (not false positive)', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'git push origin feature/wiki-improvements' },
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE regular git push (not wiki-related)', async () => {
      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'git push origin main' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Environment variable detection', () => {
    it('should detect agent via CLAUDE_CURRENT_AGENT env var (case insensitive)', async () => {
      const { result } = await runHook(
        {
          tool_name: 'mcp__atlassian__jira_create_issue',
          tool_input: { project_key: 'TEST' },
        },
        { CLAUDE_CURRENT_AGENT: 'JIRA-TASK-CREATOR' } // uppercase
      );

      expect(result.decision).toBe('approve');
    });

    it('should detect agent via CLAUDE_CURRENT_AGENT env var (mixed case)', async () => {
      const { result } = await runHook(
        {
          tool_name: 'mcp__atlassian__jira_create_issue',
          tool_input: { project_key: 'TEST' },
        },
        { CLAUDE_CURRENT_AGENT: 'Jira-Task-Creator' }
      );

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

    it('should APPROVE for unknown tools', async () => {
      const { result } = await runHook({
        tool_name: 'SomeUnknownTool',
        tool_input: { foo: 'bar' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Non-enforced operations', () => {
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

    it('should APPROVE Grep tool', async () => {
      const { result } = await runHook({
        tool_name: 'Grep',
        tool_input: { pattern: 'test' },
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Transcript-based detection (fallback)', () => {
    const tempDir = os.tmpdir();
    let tempTranscript;

    beforeEach(() => {
      tempTranscript = path.join(tempDir, `test-transcript-${Date.now()}.txt`);
    });

    afterEach(() => {
      if (fs.existsSync(tempTranscript)) {
        fs.unlinkSync(tempTranscript);
      }
    });

    it('should detect agent via transcript frontmatter', async () => {
      fs.writeFileSync(
        tempTranscript,
        `---
name: jira-task-creator
tools: mcp__atlassian__jira_create_issue
---
You are the jira task creator...`
      );

      const { result } = await runHook({
        tool_name: 'mcp__atlassian__jira_create_issue',
        tool_input: { project_key: 'TEST' },
        transcript_path: tempTranscript,
      });

      expect(result.decision).toBe('approve');
    });

    it('should NOT detect agent via subagent_type in transcript (subagent_type means CALLED, not running AS)', async () => {
      // subagent_type in transcript means an agent was CALLED, not that we ARE that agent
      // This was causing false positives - blocking legitimate cross-agent calls
      fs.writeFileSync(
        tempTranscript,
        `Previous context...
{"subagent_type": "pr-generator"}
More context...`
      );

      const { result } = await runHook({
        tool_name: 'Bash',
        tool_input: { command: 'gh pr create --title "Test"' },
        transcript_path: tempTranscript,
      });

      // Should BLOCK because subagent_type doesn't indicate we're RUNNING as that agent
      expect(result.decision).toBe('block');
    });

    it('should NOT detect agent when transcript has different agent', async () => {
      fs.writeFileSync(
        tempTranscript,
        `---
name: code-checker
---
You are the code checker...`
      );

      const { result } = await runHook({
        tool_name: 'mcp__atlassian__jira_create_issue',
        tool_input: { project_key: 'TEST' },
        transcript_path: tempTranscript,
      });

      expect(result.decision).toBe('block');
    });

    it('should prefer env var over transcript', async () => {
      // Transcript says code-checker, but env var says jira-task-creator
      fs.writeFileSync(
        tempTranscript,
        `---
name: code-checker
---
You are the code checker...`
      );

      const { result } = await runHook(
        {
          tool_name: 'mcp__atlassian__jira_create_issue',
          tool_input: { project_key: 'TEST' },
          transcript_path: tempTranscript,
        },
        { CLAUDE_CURRENT_AGENT: 'jira-task-creator' }
      );

      // Env var takes priority, so should approve
      expect(result.decision).toBe('approve');
    });
  });
});

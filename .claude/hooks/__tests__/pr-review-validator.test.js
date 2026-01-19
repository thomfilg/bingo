/**
 * Tests for pr-review-validator.js hook
 *
 * Run with: cd ~/.claude && pnpm test:hooks
 */

const { spawn } = require('child_process');
const path = require('path');

const HOOK_PATH = path.join(__dirname, '..', 'pr-review-validator.js');

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

/**
 * Generate a valid PR review for testing
 */
function createReview(options = {}) {
  const defaults = {
    summary: 'This PR adds a new feature for user authentication.',
    criticalIssues: null,
    suggestions: '- Consider adding more test coverage',
    recommendation: '✅ APPROVE',
    recommendationReason: 'No blocking issues found.',
  };

  const config = { ...defaults, ...options };

  let review = `## Summary
${config.summary}

`;

  if (config.criticalIssues) {
    review += `## Critical Issues 🚨
${config.criticalIssues}

`;
  }

  review += `## Suggestions for Improvement 💡
${config.suggestions}

---

## Final Recommendation

**${config.recommendation}**

${config.recommendationReason}`;

  return review;
}

describe('pr-review-validator hook', () => {
  describe('Agent filtering', () => {
    it('should APPROVE non-pr-reviewer agents', async () => {
      const { result } = await runHook({
        agent_name: 'code-checker',
        agent_output: 'Some output',
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE pr-generator agent', async () => {
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: 'PR description content',
      });

      expect(result.decision).toBe('approve');
    });

    it('should validate pr-reviewer agent', async () => {
      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        agent_output: createReview(),
      });

      expect(result.decision).toBe('approve');
    });

    it('should validate via subagent_type field', async () => {
      const { result } = await runHook({
        subagent_type: 'pr-reviewer',
        agent_output: createReview(),
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Consistent reviews (should APPROVE)', () => {
    it('should APPROVE when no critical issues and APPROVE', async () => {
      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        agent_output: createReview({
          recommendation: '✅ APPROVE',
        }),
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE when critical issues and REQUEST_CHANGES', async () => {
      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        agent_output: createReview({
          criticalIssues: '- Missing error handling in userService.ts:45',
          recommendation: '❌ REQUEST_CHANGES',
          recommendationReason: 'Critical issues must be addressed.',
        }),
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE when critical issues section is empty', async () => {
      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        agent_output: createReview({
          criticalIssues: 'None',
          recommendation: '✅ APPROVE',
        }),
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE when critical issues section says N/A', async () => {
      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        agent_output: createReview({
          criticalIssues: 'N/A',
          recommendation: '✅ APPROVE',
        }),
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE when critical issues section is just a dash', async () => {
      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        agent_output: createReview({
          criticalIssues: '-',
          recommendation: '✅ APPROVE',
        }),
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE NEEDS_CLARIFICATION with questions', async () => {
      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        agent_output: createReview({
          recommendation: '⏸️ NEEDS_CLARIFICATION',
          recommendationReason: 'Need more context on the approach.',
        }),
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Inconsistent reviews (should BLOCK)', () => {
    it('should BLOCK when Critical Issues section has content but APPROVE', async () => {
      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        agent_output: createReview({
          criticalIssues: '- Missing Vault validation in config.ts:23\n- Skipped test handling bug in runner.ts:45',
          recommendation: '✅ APPROVE',
          recommendationReason: 'Looks good overall.',
        }),
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('INCONSISTENT');
      expect(result.reason).toContain('Critical Issues');
    });

    it('should BLOCK when blocking issue mentioned inline with APPROVE', async () => {
      const review = `## Summary
This PR updates the auth flow.

## Issues
There is a **blocking issue** with the token refresh logic.

## Final Recommendation
**✅ APPROVE**
Minor issues can be addressed later.`;

      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        agent_output: review,
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK when critical bug mentioned with APPROVE', async () => {
      const review = `## Summary
This PR fixes the login page.

## Analysis
Found a critical bug in the password validation.

## Final Recommendation
**✅ APPROVE**
Ship it!`;

      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        agent_output: review,
      });

      expect(result.decision).toBe('block');
    });
  });

  describe('Edge cases', () => {
    it('should handle short output gracefully', async () => {
      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        agent_output: 'Too short',
      });

      expect(result.decision).toBe('approve');
    });

    it('should handle empty output', async () => {
      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        agent_output: '',
      });

      expect(result.decision).toBe('approve');
    });

    it('should handle missing output field', async () => {
      const { result } = await runHook({
        agent_name: 'pr-reviewer',
      });

      expect(result.decision).toBe('approve');
    });

    it('should handle array-style content (Claude API format)', async () => {
      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        agent_output: [
          { type: 'text', text: '## Summary\nGood PR.\n\n' },
          { type: 'text', text: '## Final Recommendation\n**✅ APPROVE**' },
        ],
      });

      expect(result.decision).toBe('approve');
    });

    it('should handle response field instead of agent_output', async () => {
      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        response: createReview(),
      });

      expect(result.decision).toBe('approve');
    });

    it('should handle result field instead of agent_output', async () => {
      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        result: createReview(),
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Recommendation format variations', () => {
    it('should detect APPROVE in Final Recommendation line', async () => {
      const review = `## Summary
Good changes.

## Critical Issues 🚨
- Security vulnerability in auth.ts

Final Recommendation: APPROVE`;

      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        agent_output: review,
      });

      expect(result.decision).toBe('block');
    });

    it('should detect REQUEST_CHANGES with underscore', async () => {
      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        agent_output: createReview({
          criticalIssues: '- Major bug found',
          recommendation: '❌ REQUEST_CHANGES',
        }),
      });

      expect(result.decision).toBe('approve');
    });

    it('should detect REQUEST CHANGES with space', async () => {
      const { result } = await runHook({
        agent_name: 'pr-reviewer',
        agent_output: createReview({
          criticalIssues: '- Major bug found',
          recommendation: '❌ REQUEST CHANGES',
        }),
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

    it('should APPROVE when agent_name is missing', async () => {
      const { result } = await runHook({
        agent_output: createReview({
          criticalIssues: '- Bug found',
          recommendation: '✅ APPROVE',
        }),
      });

      expect(result.decision).toBe('approve');
    });
  });
});

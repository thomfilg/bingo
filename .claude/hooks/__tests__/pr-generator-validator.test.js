/**
 * Tests for pr-generator-validator.js hook
 *
 * Run with: cd ~/.claude && pnpm test:hooks
 */

const { spawn } = require('child_process');
const path = require('path');

const HOOK_PATH = path.join(__dirname, '..', 'pr-generator-validator.js');

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
 * Generate a valid PR description for testing
 */
function createValidPR(overrides = {}) {
  const defaults = {
    existingBehavior: 'The system currently does X when condition Y is met.',
    intendedNewBehavior: 'After this change, the system will do Z instead, improving performance.',
    devChecks: `
- [Y] Code follows project conventions
- [Y] Tests added/updated
- [ ] Documentation updated
- [Y] No breaking changes`,
    testingPlan: `
- Verified unit tests pass locally
- Tested integration with staging environment
- Performed manual testing of the happy path and error cases
- Checked that no regressions occur in related features`,
  };

  const config = { ...defaults, ...overrides };

  return `## Existing Behavior
${config.existingBehavior}

## Intended New Behavior
${config.intendedNewBehavior}

## Dev Checks
${config.devChecks}

## Testing Plan
${config.testingPlan}`;
}

describe('pr-generator-validator hook', () => {
  describe('Agent filtering', () => {
    it('should APPROVE non-pr-generator agents', async () => {
      const { result } = await runHook({
        agent_name: 'code-checker',
        agent_output: 'Some output',
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE pr-post-generator agent', async () => {
      const { result } = await runHook({
        agent_name: 'pr-post-generator',
        agent_output: 'Some output',
      });

      expect(result.decision).toBe('approve');
    });

    it('should validate pr-generator agent', async () => {
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: createValidPR(),
      });

      expect(result.decision).toBe('approve');
    });

    it('should validate via subagent_type field', async () => {
      const { result } = await runHook({
        subagent_type: 'pr-generator',
        agent_output: createValidPR(),
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Output length validation', () => {
    it('should BLOCK when output is too short', async () => {
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: 'Too short',
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('OUTPUT TOO SHORT');
    });

    it('should BLOCK when output is empty', async () => {
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: '',
      });

      expect(result.decision).toBe('block');
    });

    it('should BLOCK when output is missing', async () => {
      const { result } = await runHook({
        agent_name: 'pr-generator',
      });

      expect(result.decision).toBe('block');
    });
  });

  describe('Required sections validation', () => {
    it('should APPROVE when all sections present', async () => {
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: createValidPR(),
      });

      expect(result.decision).toBe('approve');
    });

    it('should BLOCK when Existing Behavior missing', async () => {
      const pr = createValidPR().replace(/## Existing Behavior[\s\S]*?(?=## Intended)/, '');
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Missing section: "Existing Behavior"');
    });

    it('should BLOCK when Intended New Behavior missing', async () => {
      const pr = createValidPR().replace(/## Intended New Behavior[\s\S]*?(?=## Dev)/, '');
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Missing section: "Intended New Behavior"');
    });

    it('should BLOCK when Dev Checks missing', async () => {
      const pr = createValidPR().replace(/## Dev Checks[\s\S]*?(?=## Testing)/, '');
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Missing section: "Dev Checks"');
    });

    it('should BLOCK when Testing Plan missing', async () => {
      const pr = createValidPR().replace(/## Testing Plan[\s\S]*$/, '');
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Missing section: "Testing Plan"');
    });

    it('should APPROVE with # instead of ## for sections', async () => {
      const pr = createValidPR().replace(/##/g, '#');
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE with varied spacing in section headers', async () => {
      const pr = createValidPR()
        .replace('## Existing Behavior', '##  Existing  Behavior')
        .replace('## Testing Plan', '## Testing  Plan');
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Forbidden patterns validation', () => {
    it('should BLOCK placeholder text [TO BE ADDED]', async () => {
      const pr = createValidPR({
        testingPlan: '[TO BE ADDED AFTER PR CREATION] This will be filled in later.',
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Placeholder text');
    });

    it('should BLOCK placeholder text TBD]', async () => {
      const pr = createValidPR({
        testingPlan: 'Testing will be done TBD] and verified with manual checks and automation.',
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Placeholder text');
    });

    it('should BLOCK placeholder text [PLACEHOLDER]', async () => {
      const pr = createValidPR({
        intendedNewBehavior: '[PLACEHOLDER] This section needs to be filled in with implementation details.',
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Placeholder text');
    });

    it('should BLOCK TODO: markers', async () => {
      const pr = createValidPR({
        testingPlan: 'TODO: Add proper testing plan here with all test cases.',
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Placeholder text');
    });

    it('should BLOCK [Your analysis here] markers', async () => {
      const pr = createValidPR({
        existingBehavior: '[Your analysis here] The system does something with requests.',
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Empty section markers');
    });
  });

  describe('Checkbox format validation', () => {
    it('should APPROVE [Y] checkboxes', async () => {
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: createValidPR(),
      });

      expect(result.decision).toBe('approve');
    });

    it('should APPROVE [ ] checkboxes', async () => {
      const pr = createValidPR({
        devChecks: `
- [ ] Code follows project conventions
- [ ] Tests added/updated
- [ ] Documentation updated`,
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('approve');
    });

    it('should BLOCK [x] checkboxes (lowercase)', async () => {
      const pr = createValidPR({
        devChecks: `
- [x] Code follows project conventions
- [x] Tests added/updated
- [ ] Documentation updated`,
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Wrong checkbox format');
    });

    it('should BLOCK [X] checkboxes (uppercase)', async () => {
      const pr = createValidPR({
        devChecks: `
- [X] Code follows project conventions
- [X] Tests added/updated
- [ ] Documentation updated`,
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Wrong checkbox format');
    });

    it('should BLOCK mixed valid/invalid checkboxes', async () => {
      const pr = createValidPR({
        devChecks: `
- [Y] Code follows project conventions
- [x] Tests added/updated
- [ ] Documentation updated`,
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('invalid checkbox format');
    });
  });

  describe('Testing Plan content validation', () => {
    it('should APPROVE substantial Testing Plan', async () => {
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: createValidPR(),
      });

      expect(result.decision).toBe('approve');
    });

    it('should BLOCK empty Testing Plan', async () => {
      const pr = createValidPR({
        testingPlan: '',
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Testing Plan section lacks substantive content');
    });

    it('should BLOCK Testing Plan with only whitespace', async () => {
      const pr = createValidPR({
        testingPlan: '   \n\n   ',
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Testing Plan section lacks substantive content');
    });

    it('should BLOCK Testing Plan with only list markers', async () => {
      const pr = createValidPR({
        testingPlan: `
-
-
- `,
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Testing Plan section lacks substantive content');
    });

    it('should BLOCK Testing Plan with too little content', async () => {
      const pr = createValidPR({
        testingPlan: '- Test it works fine now',
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Testing Plan section lacks substantive content');
    });

    it('should APPROVE Testing Plan with 30+ chars of content', async () => {
      const pr = createValidPR({
        testingPlan: '- Verified unit tests pass locally with good coverage',
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Emoji validation', () => {
    it('should APPROVE PR without emojis', async () => {
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: createValidPR(),
      });

      expect(result.decision).toBe('approve');
    });

    it('should BLOCK PR with emojis in content', async () => {
      const pr = createValidPR({
        intendedNewBehavior: 'This change improves performance 🚀 significantly.',
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('emojis');
    });

    it('should BLOCK PR with multiple emojis', async () => {
      const pr = createValidPR({
        testingPlan: '✅ Unit tests pass\n✅ Integration tests pass\n🎉 All good!',
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('emojis');
    });

    it('should BLOCK PR with warning emoji', async () => {
      const pr = createValidPR({
        existingBehavior: '⚠️ The current implementation has a bug.',
      });
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('emojis');
    });
  });

  describe('Multiple issues detection', () => {
    it('should report all issues at once', async () => {
      const pr = `## Existing Behavior
[Your analysis here]

## Intended New Behavior
This is great 🎉

## Dev Checks
- [x] Done
- [X] Also done

## Testing Plan
- `;
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('block');
      expect(result.reason).toContain('Empty section markers');
      expect(result.reason).toContain('emojis');
      expect(result.reason).toContain('Wrong checkbox format');
      expect(result.reason).toContain('Testing Plan section lacks substantive content');
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
        agent_output: createValidPR(),
      });

      expect(result.decision).toBe('approve');
    });
  });

  describe('Edge cases', () => {
    it('should handle sections at different positions', async () => {
      const pr = `Some intro text here

## Existing Behavior
The system does X.

More context about the existing behavior.

## Intended New Behavior
After this change, Y happens.

## Dev Checks
- [Y] Tests pass
- [ ] Docs updated

## Testing Plan
- Verified locally with comprehensive test suite
- Tested in staging environment with real data`;

      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('approve');
    });

    it('should handle sections with extra newlines', async () => {
      const pr = createValidPR().replace(/\n/g, '\n\n');
      const { result } = await runHook({
        agent_name: 'pr-generator',
        agent_output: pr,
      });

      expect(result.decision).toBe('approve');
    });
  });
});

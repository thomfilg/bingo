#!/usr/bin/env node
/**
 * PreToolUse Hook: Validate PR Content Escaping
 * Blocks PR creation/editing if Jira-style escaping is detected
 *
 * Consolidates validate-pr-bash.js and validate-pr-content.js
 *
 * The issue: Claude sometimes outputs Jira-style escaping (\`, \|, \{)
 * in GitHub Markdown where it's not needed and breaks formatting.
 */

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  let hookData;
  try {
    hookData = JSON.parse(input);
  } catch {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  const toolInput = hookData.tool_input || {};
  const command = toolInput.command || '';
  const body = toolInput.body || toolInput.description || toolInput.content || '';
  const title = toolInput.title || '';

  // Only validate PR-related operations
  const isPRCommand = /gh\s+pr\s+(create|edit)/.test(command);
  if (!isPRCommand && !body && !title) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Combine all content to validate
  const content = `${command} ${title} ${body}`;
  const issues = [];

  // Check for escaped code fences: \`\`\`
  if (/\\`\\`\\`/.test(content)) {
    issues.push('Escaped code fence: \\`\\`\\` should be ```');
  }

  // Check for escaped single backticks (but not part of escaped fence)
  // Match \` that's not followed by another ` (to avoid matching \`\`\`)
  if (/\\`(?!`)/.test(content) && !/\\`\\`\\`/.test(content)) {
    issues.push('Escaped backtick: \\` should be `');
  } else if (/\\`\\`\\`/.test(content)) {
    // Already caught above, but check for additional escaped backticks
    const withoutFences = content.replace(/\\`\\`\\`/g, '');
    if (/\\`/.test(withoutFences)) {
      issues.push('Escaped backtick: \\` should be `');
    }
  }

  // Check for escaped pipes (exclude grep/awk/sed regex contexts)
  if (/\\\|/.test(content)) {
    const hasRegexContext = /\b(grep|awk|sed|rg)\b/.test(content);
    if (!hasRegexContext) {
      issues.push('Escaped pipe: \\| should be | (GitHub Markdown doesn\'t need escaping)');
    }
  }

  // Check for escaped braces (exclude sed/awk contexts)
  if (/\\[{}]/.test(content)) {
    const hasRegexContext = /\b(sed|awk)\b/.test(content);
    if (!hasRegexContext) {
      issues.push('Escaped braces: \\{ or \\} should be { or }');
    }
  }

  // Check for escaped angle brackets
  if (/\\[<>]/.test(content)) {
    issues.push('Escaped angle brackets: \\< or \\> should be < or >');
  }

  if (issues.length > 0) {
    console.log(JSON.stringify({
      decision: 'block',
      reason: `
╔══════════════════════════════════════════════════════════════════════╗
║  PR ESCAPING VALIDATION FAILED                                       ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
${issues.map(i => `║  ❌ ${i.padEnd(64)}║`).join('\n')}
║                                                                      ║
║  GitHub Markdown doesn't need Jira-style escaping.                  ║
║  Remove the backslashes and use plain Markdown.                      ║
║                                                                      ║
║  Examples:                                                           ║
║    \\\`\\\`\\\`bash  →  \`\`\`bash                                          ║
║    \\|         →  |                                                  ║
║    \\{\\}       →  {}                                                 ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝`
    }));
    return;
  }

  console.log(JSON.stringify({ decision: 'approve' }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  // On error, approve to avoid blocking legitimate operations
  console.log(JSON.stringify({ decision: 'approve' }));
});

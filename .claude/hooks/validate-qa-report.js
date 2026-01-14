#!/usr/bin/env node
/**
 * SubagentStop Hook: QA Report Validator
 *
 * Validates qa-feature-tester reports before allowing subagent completion.
 * Blocks completion if report doesn't meet requirements.
 *
 * Requirements:
 * 1. Report file must exist at REPORT_PATH
 * 2. Must have "**Changes Hash:**" header
 * 3. Must have "## Playwright Verification" section
 * 4. Must have evidence of Playwright MCP usage (not Puppeteer scripts)
 * 5. Must have at least one screenshot reference
 *
 * Usage: Configured in settings.json under hooks.SubagentStop
 */

const fs = require('fs');
const path = require('path');

// Read hook input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    validateQAReport(data);
  } catch (err) {
    // Parse error - allow completion (don't block on hook errors)
    console.error(`Hook parse error: ${err.message}`);
    process.exit(0);
  }
});

function validateQAReport(data) {
  // Check if this is a QA agent
  const prompt = data.task_prompt || data.prompt || '';
  const subagentType = data.subagent_type || '';

  const isQAAgent = subagentType === 'qa-feature-tester' ||
                    prompt.includes('qa-feature-tester') ||
                    prompt.includes('REPORT_PATH:') && prompt.includes('qa-');

  if (!isQAAgent) {
    // Not a QA agent, allow completion
    process.exit(0);
  }

  // Extract report path from the prompt
  const reportPathMatch = prompt.match(/REPORT_PATH:\s*([^\n\s]+)/);
  if (!reportPathMatch) {
    // Can't determine report path - allow completion but warn
    console.error('Warning: Could not extract REPORT_PATH from prompt');
    process.exit(0);
  }

  const reportPath = reportPathMatch[1].trim();
  const issues = [];

  // Check 1: Report file exists
  if (!fs.existsSync(reportPath)) {
    issues.push(`Report file not created: ${reportPath}`);
  } else {
    const content = fs.readFileSync(reportPath, 'utf8');

    // Check 2: Changes Hash header
    if (!content.includes('**Changes Hash:**')) {
      issues.push('Missing "**Changes Hash:**" header at top of report');
    }

    // Check 3: Playwright Verification section
    if (!content.includes('## Playwright Verification')) {
      issues.push('Missing "## Playwright Verification" section');
    }

    // Check 4: Evidence of Playwright MCP usage (not Puppeteer scripts)
    const hasPlaywrightMCP = content.includes('mcp__playwright__') ||
                             content.includes('mcp__playwright_headed__');
    const hasPuppeteerScript = content.includes('require(\'puppeteer\')') ||
                               content.includes('puppeteer.launch') ||
                               content.includes('.pnpm/puppeteer');

    if (hasPuppeteerScript) {
      issues.push('❌ FORBIDDEN: Report shows Puppeteer script usage instead of Playwright MCP tools');
    }

    if (!hasPlaywrightMCP && !content.includes('INFRASTRUCTURE_FAILURE')) {
      issues.push('No evidence of Playwright MCP tool usage (mcp__playwright__*)');
    }

    // Check 4b: If INFRASTRUCTURE_FAILURE, must have MCP diagnostics
    if (content.includes('INFRASTRUCTURE_FAILURE')) {
      const hasMcpDiagnostics = content.includes('## MCP Diagnostics') ||
                                content.includes('### ListMcpResourcesTool') ||
                                content.includes('ListMcpResourcesTool Result');
      const hasWrapperOutput = content.includes('mcp-wrapper.js') ||
                               content.includes('MCP Wrapper Console');

      if (!hasMcpDiagnostics) {
        issues.push('INFRASTRUCTURE_FAILURE report missing "## MCP Diagnostics" section with ListMcpResourcesTool output');
      }
      if (!hasWrapperOutput) {
        issues.push('INFRASTRUCTURE_FAILURE report missing MCP wrapper console output (node scripts/mcp-wrapper.js playwright)');
      }
    }

    // Check 5: Screenshot references
    const hasScreenshots = content.match(/!\[.*?\]\(.*?\.(png|jpg|jpeg)/i) ||
                          content.includes('./screenshots/') ||
                          content.includes('screenshots/');

    if (!hasScreenshots && !content.includes('INFRASTRUCTURE_FAILURE')) {
      issues.push('No screenshot references found in report');
    }

    // Check 6: Has actual test results (PASS/FAIL status)
    const hasStatus = content.includes('PASS') ||
                      content.includes('FAIL') ||
                      content.includes('INFRASTRUCTURE_FAILURE');

    if (!hasStatus) {
      issues.push('Missing test status (PASS/FAIL/INFRASTRUCTURE_FAILURE)');
    }
  }

  // Output decision
  if (issues.length > 0) {
    const decision = {
      decision: 'block',
      reason: `🛑 QA Report Validation FAILED

The following issues must be fixed before completing:

${issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

📋 Requirements:
- Use Playwright MCP tools (mcp__playwright__*), NOT Puppeteer scripts
- Include "## Playwright Verification" section with tool call results
- Start report with "**Changes Hash:** <hash>"
- Include screenshot evidence
- Report must have PASS/FAIL/INFRASTRUCTURE_FAILURE status

If Playwright MCP is unavailable, run:
  node scripts/mcp-wrapper.js playwright

Then retry testing with mcp__playwright__browser_navigate`
    };

    console.log(JSON.stringify(decision));
  }

  // No output = allow completion
  process.exit(0);
}

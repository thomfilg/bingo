#!/usr/bin/env node

/**
 * SubagentStop hook to validate pr-reviewer output consistency
 * Blocks if review contains "Critical Issues" but recommends "APPROVE"
 */

/**
 * Extract text content from various message formats
 */
function extractTextContent(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');
  }
  return '';
}

/**
 * Check if Critical Issues section has actual content
 */
function hasCriticalIssuesContent(text) {
  // Match the Critical Issues section and check for content
  const sectionRegex = /##\s*Critical\s*Issues[^\n]*\n+([\s\S]*?)(?=##|$)/i;
  const match = text.match(sectionRegex);

  if (!match) {
    // Check for inline mentions of critical/blocking issues
    // BUT exclude negations like "No blocking issues" or "no critical bugs"
    const hasInlineMention = /(?:critical|blocking)\s+(?:issue|problem|bug)/i.test(text);
    const isNegation = /\b(no|without|zero|0)\s+(?:critical|blocking)\s+(?:issue|problem|bug)/i.test(text);
    return hasInlineMention && !isNegation;
  }

  const sectionContent = match[1].trim();
  // Check if section has substantive content (not just "None" or empty)
  if (sectionContent.length < 10) return false;
  if (/^(none|n\/a|no critical issues?|-)$/i.test(sectionContent)) return false;

  return true;
}

/**
 * Check for APPROVE recommendation
 */
function hasApproveRecommendation(text) {
  return /✅\s*APPROVE/i.test(text) ||
         /Final\s*Recommendation[:\s]*.*APPROVE/i.test(text);
}

/**
 * Check for REQUEST_CHANGES recommendation
 */
function hasRequestChangesRecommendation(text) {
  return /❌\s*REQUEST[_\s]?CHANGES/i.test(text) ||
         /Final\s*Recommendation[:\s]*.*REQUEST[_\s]?CHANGES/i.test(text);
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
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Only validate pr-reviewer agent
  const agentName = hookData.agent_name || hookData.subagent_type || '';
  if (!agentName.toLowerCase().includes('pr-reviewer')) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Get the agent's output
  const agentOutput = extractTextContent(
    hookData.agent_output || hookData.response || hookData.result || ''
  );

  if (!agentOutput || agentOutput.length < 100) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Check for logical inconsistency
  const hasCritical = hasCriticalIssuesContent(agentOutput);
  const hasApprove = hasApproveRecommendation(agentOutput);
  const hasRequestChanges = hasRequestChangesRecommendation(agentOutput);

  if (hasCritical && hasApprove && !hasRequestChanges) {
    console.log(JSON.stringify({
      decision: 'block',
      reason: `
╔══════════════════════════════════════════════════════════════════════╗
║  PR-REVIEWER: INCONSISTENT RECOMMENDATION                            ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ❌ You listed "Critical Issues" but recommended "APPROVE"           ║
║                                                                      ║
║  This is logically inconsistent. You must either:                    ║
║                                                                      ║
║  1. Change recommendation to "❌ REQUEST_CHANGES"                    ║
║     if the issues are truly blocking                                 ║
║                                                                      ║
║  2. Recategorize the issues as "Suggestions"                         ║
║     if they're not actually blocking                                 ║
║                                                                      ║
║  Fix your review and regenerate.                                     ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝`
    }));
    return;
  }

  console.log(JSON.stringify({ decision: 'approve' }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  console.log(JSON.stringify({ decision: 'approve' }));
});

#!/usr/bin/env node

/**
 * Stop hook to verify all issues (CRITICAL, IMPORTANT, SUGGESTIONS) in
 * code-review.md have responses in code-review-reply.md.
 *
 * This hook runs at the end of turns and checks:
 * 1. Extracts all issues from code-review.md (CRITICAL, IMPORTANT, NICE-TO-HAVE)
 * 2. Checks if code-review-reply.md exists and has a response for each
 * 3. Blocks if any issue is missing a reply
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get current task ID from cwd or git branch
function getCurrentTaskId(cwd) {
  // Try to get from worktree folder name
  const worktreeMatch = cwd.match(/TASK-(\d+)/i);
  if (worktreeMatch) {
    return `TASK-${worktreeMatch[1]}`;
  }

  // Try to get from git branch name
  try {
    const branch = execSync('git branch --show-current', {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    const branchMatch = branch.match(/TASK-(\d+)/i);
    if (branchMatch) {
      return `TASK-${branchMatch[1]}`;
    }
  } catch {
    // Ignore git errors
  }

  return null;
}

// Extract issues from a specific section of code-review.md
function extractIssuesFromSection(content, sectionPattern, stopPattern) {
  const issues = [];

  // Find the section
  const sectionMatch = content.match(new RegExp(
    sectionPattern + '[^\\n]*\\n([\\s\\S]*?)(?=' + stopPattern + '|$)',
    'i'
  ));

  if (!sectionMatch) return issues;

  const sectionContent = sectionMatch[1];

  // Check for "none found" or similar
  if (/none\s*found|no\s*(critical|important|issues?)|0\s*issues/i.test(sectionContent.substring(0, 200))) {
    return [];
  }

  // Extract individual issue titles
  // Match patterns like:
  // **🔴 Security: Hardcoded Admin Email Fallback**
  // **🟡 Error Handling: Silent Failure**
  // - **Title**: description
  // 1. **Title**: description
  const patterns = [
    /\*\*(?:🔴|🟡|🟢)?\s*([^*\n]+)\*\*/g,  // **Title** or **🔴 Title**
    /[-*]\s*\*\*([^*:]+)\*\*\s*:/g,        // - **Title**:
    /\d+\.\s*\*\*([^*:]+)\*\*\s*:/g,       // 1. **Title**:
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(sectionContent)) !== null) {
      const title = match[1].trim();
      // Filter out non-issue items and headers
      if (title.length > 3 &&
          !title.match(/^(none|n\/a|no\s+|issues?\s*found|CRITICAL|IMPORTANT|NICE-TO-HAVE)/i) &&
          !title.match(/^(File|Description|Impact|Recommendation):/i)) {
        issues.push(title);
      }
    }
  }

  return [...new Set(issues)]; // Remove duplicates
}

// Extract all issues from code-review.md (CRITICAL, IMPORTANT, NICE-TO-HAVE/SUGGESTIONS)
function extractAllIssues(content) {
  const allIssues = {
    critical: [],
    important: [],
    suggestions: []
  };

  // Extract CRITICAL issues
  // Pattern: ### 🔴 CRITICAL ISSUES or ### CRITICAL
  allIssues.critical = extractIssuesFromSection(
    content,
    '###?\\s*(?:🔴\\s*)?CRITICAL\\s*ISSUES?',
    '###?\\s*(?:🟡|IMPORTANT|🟢|NICE-TO-HAVE|SUGGESTIONS?|---)'
  );

  // Extract IMPORTANT issues
  // Pattern: ### 🟡 IMPORTANT ISSUES or ### IMPORTANT
  allIssues.important = extractIssuesFromSection(
    content,
    '###?\\s*(?:🟡\\s*)?IMPORTANT\\s*ISSUES?',
    '###?\\s*(?:🟢|NICE-TO-HAVE|SUGGESTIONS?|---)'
  );

  // Extract NICE-TO-HAVE / SUGGESTIONS
  // Pattern: ### 🟢 NICE-TO-HAVE IMPROVEMENTS or ### SUGGESTIONS
  allIssues.suggestions = extractIssuesFromSection(
    content,
    '###?\\s*(?:🟢\\s*)?(?:NICE-TO-HAVE|SUGGESTIONS?)\\s*(?:IMPROVEMENTS?)?',
    '###?\\s*(?:Test|Security|Performance|Next|Conclusion|---)'
  );

  return allIssues;
}

// Check if a suggestion has a reply
function findReplyForSuggestion(replyContent, suggestionTitle) {
  // Normalize the title for comparison
  const normalizedTitle = suggestionTitle.toLowerCase().replace(/[^\w\s]/g, '').trim();

  // Look for "## Suggestion: [title]" or similar patterns
  const patterns = [
    new RegExp(`##\\s*Suggestion:\\s*${escapeRegex(suggestionTitle)}`, 'i'),
    new RegExp(`##\\s*${escapeRegex(suggestionTitle)}`, 'i'),
    new RegExp(`\\*\\*Suggestion:\\*\\*\\s*${escapeRegex(suggestionTitle)}`, 'i'),
    new RegExp(`[-*]\\s*\\*\\*${escapeRegex(suggestionTitle)}\\*\\*`, 'i')
  ];

  for (const pattern of patterns) {
    if (pattern.test(replyContent)) {
      return true;
    }
  }

  // Fuzzy match - check if similar words appear
  const titleWords = normalizedTitle.split(/\s+/).filter(w => w.length > 3);
  const contentNormalized = replyContent.toLowerCase().replace(/[^\w\s]/g, '');

  // If most words from the title appear near each other in the reply
  let matchCount = 0;
  for (const word of titleWords) {
    if (contentNormalized.includes(word)) {
      matchCount++;
    }
  }

  // If 70%+ of significant words match, consider it a match
  if (titleWords.length > 0 && matchCount / titleWords.length >= 0.7) {
    return true;
  }

  return false;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Check if file was modified in last 10 minutes
function isRecentlyModified(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const now = Date.now();
    const mtime = stats.mtimeMs;
    const tenMinutes = 10 * 60 * 1000;
    return (now - mtime) < tenMinutes;
  } catch {
    return false;
  }
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const cwd = process.cwd();
  const currentTaskId = getCurrentTaskId(cwd);

  if (!currentTaskId) {
    console.log(JSON.stringify({ decision: 'approve' }));
    return;
  }

  // Check directories
  const mainWorktree = '/home/node/worktrees/app-services-monitoring';
  const dirsToCheck = [cwd];
  if (cwd !== mainWorktree) {
    dirsToCheck.push(mainWorktree);
  }

  for (const dir of dirsToCheck) {
    const taskFolder = path.join(dir, 'tasks', currentTaskId);
    const codeReviewPath = path.join(taskFolder, 'code-review.md');
    const replyPath = path.join(taskFolder, 'code-review-reply.md');

    if (!fs.existsSync(codeReviewPath)) continue;
    if (!isRecentlyModified(codeReviewPath)) continue;

    // Read code-review.md and extract all issues (CRITICAL, IMPORTANT, SUGGESTIONS)
    const codeReviewContent = fs.readFileSync(codeReviewPath, 'utf8');
    const allIssues = extractAllIssues(codeReviewContent);

    const totalCritical = allIssues.critical.length;
    const totalImportant = allIssues.important.length;
    const totalSuggestions = allIssues.suggestions.length;
    const totalIssues = totalCritical + totalImportant + totalSuggestions;

    // If no issues found, approve
    if (totalIssues === 0) {
      console.log(JSON.stringify({ decision: 'approve' }));
      return;
    }

    // Check if reply file exists
    if (!fs.existsSync(replyPath)) {
      // Build issue list for display
      const issuesList = [];
      if (totalCritical > 0) {
        issuesList.push(`║  🔴 CRITICAL (${totalCritical}):`);
        allIssues.critical.slice(0, 3).forEach(s => {
          issuesList.push(`║    - ${s.substring(0, 55)}${s.length > 55 ? '...' : ''}`);
        });
        if (totalCritical > 3) issuesList.push(`║    ... and ${totalCritical - 3} more`);
      }
      if (totalImportant > 0) {
        issuesList.push(`║  🟡 IMPORTANT (${totalImportant}):`);
        allIssues.important.slice(0, 3).forEach(s => {
          issuesList.push(`║    - ${s.substring(0, 55)}${s.length > 55 ? '...' : ''}`);
        });
        if (totalImportant > 3) issuesList.push(`║    ... and ${totalImportant - 3} more`);
      }
      if (totalSuggestions > 0) {
        issuesList.push(`║  🟢 SUGGESTIONS (${totalSuggestions}):`);
        allIssues.suggestions.slice(0, 2).forEach(s => {
          issuesList.push(`║    - ${s.substring(0, 55)}${s.length > 55 ? '...' : ''}`);
        });
        if (totalSuggestions > 2) issuesList.push(`║    ... and ${totalSuggestions - 2} more`);
      }

      console.log(JSON.stringify({
        decision: 'block',
        reason: `
╔══════════════════════════════════════════════════════════════════════╗
║  🛑 MISSING CODE REVIEW REPLY                                        ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Task: ${currentTaskId}
║  Found ${totalIssues} issue(s) in code-review.md:
║    🔴 ${totalCritical} CRITICAL | 🟡 ${totalImportant} IMPORTANT | 🟢 ${totalSuggestions} suggestions
║                                                                      ║
║  ❌ code-review-reply.md does not exist                              ║
║                                                                      ║
${issuesList.join('\n')}
║                                                                      ║
║  You MUST create code-review-reply.md with responses.                ║
║  Each issue needs:                                                   ║
║    ## Issue: [title]                                                 ║
║    **Decision:** FIXED | DEFERRED | NOT_APPLICABLE                   ║
║    **Reason:** [specific justification]                              ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝`
      }));
      return;
    }

    // Read reply file and check for missing responses
    const replyContent = fs.readFileSync(replyPath, 'utf8');
    const missingIssues = {
      critical: allIssues.critical.filter(s => !findReplyForSuggestion(replyContent, s)),
      important: allIssues.important.filter(s => !findReplyForSuggestion(replyContent, s)),
      suggestions: allIssues.suggestions.filter(s => !findReplyForSuggestion(replyContent, s))
    };

    const totalMissing = missingIssues.critical.length + missingIssues.important.length + missingIssues.suggestions.length;

    if (totalMissing > 0) {
      // Build missing issues list for display
      const missingList = [];
      if (missingIssues.critical.length > 0) {
        missingList.push(`║  🔴 CRITICAL (missing ${missingIssues.critical.length}):`);
        missingIssues.critical.forEach(s => {
          missingList.push(`║    - ${s.substring(0, 55)}${s.length > 55 ? '...' : ''}`);
        });
      }
      if (missingIssues.important.length > 0) {
        missingList.push(`║  🟡 IMPORTANT (missing ${missingIssues.important.length}):`);
        missingIssues.important.forEach(s => {
          missingList.push(`║    - ${s.substring(0, 55)}${s.length > 55 ? '...' : ''}`);
        });
      }
      if (missingIssues.suggestions.length > 0) {
        missingList.push(`║  🟢 SUGGESTIONS (missing ${missingIssues.suggestions.length}):`);
        missingIssues.suggestions.forEach(s => {
          missingList.push(`║    - ${s.substring(0, 55)}${s.length > 55 ? '...' : ''}`);
        });
      }

      console.log(JSON.stringify({
        decision: 'block',
        reason: `
╔══════════════════════════════════════════════════════════════════════╗
║  🛑 INCOMPLETE CODE REVIEW REPLY                                     ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Task: ${currentTaskId}
║  Missing replies for ${totalMissing}/${totalIssues} issue(s)
║                                                                      ║
${missingList.join('\n')}
║                                                                      ║
║  Add to code-review-reply.md:                                        ║
║    ## Issue: [exact title from above]                                ║
║    **Decision:** FIXED | DEFERRED | NOT_APPLICABLE                   ║
║    **Reason:** [specific justification]                              ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝`
      }));
      return;
    }
  }

  console.log(JSON.stringify({ decision: 'approve' }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  console.log(JSON.stringify({ decision: 'approve' }));
});

#!/usr/bin/env node

/**
 * PreToolUse hook to enforce agent usage for specific operations.
 * If an operation has a designated agent, block direct execution
 * and require the agent to perform it instead.
 */

const fs = require('fs');

// Agents that should NEVER call themselves via Skill or Task tool
const SELF_CALL_BLOCKED_AGENTS = [
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
  'developer-react-senior'
];

// Configuration: Map operations to required agents
const AGENT_ENFORCEMENT_RULES = [
  {
    name: 'Jira Ticket Creation',
    toolName: 'mcp__atlassian__jira_create_issue',
    requiredAgent: 'jira-task-creator',
    agentAliases: ['jira-task-creator', 'Jira Task Creator'],
    message: `❌ Direct Jira issue creation not allowed!

✅ Use Task tool with subagent_type="jira-task-creator" instead

Example:
  Task({
    description: "Create Jira ticket",
    prompt: "Create a Jira task for...",
    subagent_type: "jira-task-creator"
  })

This ensures consistent ticket formatting and validation.`
  },
  {
    name: 'PR Creation',
    toolName: 'Bash',
    commandPattern: /gh\s+pr\s+create/,
    requiredAgent: 'pr-generator',
    agentAliases: ['pr-generator', 'PR Generator', 'Pull Request Generator'],
    message: `❌ Direct PR creation not allowed!

✅ Use Task tool with subagent_type="pr-generator" instead

Example:
  Task({
    description: "Create PR",
    prompt: "Create a pull request for this branch",
    subagent_type: "pr-generator"
  })

This ensures consistent PR descriptions with proper analysis.`
  },
  {
    name: 'Semantic Commits',
    toolName: 'Bash',
    commandPattern: /git\s+commit\s+(?!.*--amend)/,  // git commit but not --amend
    requiredAgent: 'semantic-commit-writer',
    agentAliases: ['semantic-commit-writer', 'commit-writer', 'Commit Writer'],
    // Allow commits in certain scenarios
    allowPatterns: [
      /--allow-empty/,      // Empty commits for testing
      /--amend/,            // Amending commits
      /fixup!/,             // Fixup commits
      /squash!/,            // Squash commits
    ],
    message: `❌ Direct git commit not recommended!

✅ Use Task tool with subagent_type="semantic-commit-writer" instead

Example:
  Task({
    description: "Commit changes",
    prompt: "Commit the staged changes",
    subagent_type: "semantic-commit-writer"
  })

This ensures semantic commit messages following conventions.

💡 To bypass for special cases (amend, fixup), use --amend flag.`
  },
  {
    name: 'Wiki Screenshot Upload',
    toolName: 'Bash',
    commandPattern: /git\s+clone.*\.wiki\.git/,
    requiredAgent: 'pr-post-generator',
    agentAliases: ['pr-post-generator', 'Post PR Generator'],
    message: `❌ Direct wiki operations not allowed!

✅ Use Task tool with subagent_type="pr-post-generator" instead

Example:
  Task({
    description: "Add screenshots to PR",
    prompt: "Upload QA screenshots to wiki and update PR",
    subagent_type: "pr-post-generator"
  })

This ensures consistent screenshot naming and PR description updates.`
  }
];

/**
 * Check if running inside a specific agent by examining transcript.
 * We look for the agent's system prompt marker which only appears
 * when actually running AS that agent, not just talking ABOUT it.
 *
 * Detection methods (in priority order):
 * 1. Environment variable CLAUDE_CURRENT_AGENT (most reliable)
 * 2. Transcript frontmatter parsing (fallback)
 */
function isRunningInAgent(transcriptPath, agentAliases) {
  // Primary: Check environment variable (most reliable, set by orchestrator)
  const currentAgent = process.env.CLAUDE_CURRENT_AGENT;
  if (currentAgent && agentAliases.some(alias =>
    alias.toLowerCase() === currentAgent.toLowerCase()
  )) {
    return true;
  }

  // Fallback: Transcript parsing
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(transcriptPath, 'utf8');

    // Look for patterns that indicate we're RUNNING as the agent:
    // Only check for agent definition frontmatter (appears at start of agent system prompt)
    // DO NOT check for subagent_type - that just means the agent was CALLED, not that we ARE it
    for (const alias of agentAliases) {
      // Check for agent definition frontmatter (only in agent system prompts)
      // This pattern only appears when we ARE running as that specific agent
      const frontmatterPattern = new RegExp(`^name:\\s*${alias}\\s*$`, 'm');
      if (frontmatterPattern.test(content)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Check if a Bash command matches a pattern
 */
function commandMatchesPattern(toolInput, pattern) {
  const command = toolInput?.command || '';
  return pattern.test(command);
}

/**
 * Check if command matches any allow patterns (bypass rules)
 */
function shouldBypass(toolInput, allowPatterns) {
  if (!allowPatterns || allowPatterns.length === 0) {
    return false;
  }
  const command = toolInput?.command || '';
  return allowPatterns.some(pattern => pattern.test(command));
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const hookData = JSON.parse(input);
  const toolName = hookData.tool_name;
  const toolInput = hookData.tool_input || {};
  const transcriptPath = hookData.transcript_path;

  // Block Skill tool calls that would create infinite loops
  if (toolName === 'Skill') {
    const skillName = toolInput?.skill || '';

    // Check if the skill being called is in the blocked list
    for (const blockedAgent of SELF_CALL_BLOCKED_AGENTS) {
      if (skillName === blockedAgent || skillName === `/${blockedAgent}`) {
        // Check if we're running inside that same agent
        if (isRunningInAgent(transcriptPath, [blockedAgent])) {
          console.log(JSON.stringify({
            decision: 'block',
            reason: `BLOCKED: Infinite loop detected!

❌ Agent "${blockedAgent}" cannot call itself via Skill tool.

You ARE the ${blockedAgent} - do the work directly using your available tools.
Do NOT use the Skill tool to invoke yourself or other agents.`
          }));
          return;
        }
      }
    }
  }

  // Block Task tool calls that would create infinite loops (self-invocation)
  if (toolName === 'Task') {
    const subagentType = toolInput?.subagent_type || '';

    // Check if the subagent being called is in the blocked list
    for (const blockedAgent of SELF_CALL_BLOCKED_AGENTS) {
      if (subagentType === blockedAgent) {
        // Check if we're running inside that same agent
        if (isRunningInAgent(transcriptPath, [blockedAgent])) {
          console.log(JSON.stringify({
            decision: 'block',
            reason: `╔══════════════════════════════════════════════════════════════════════╗
║  🔄 INFINITE LOOP BLOCKED                                            ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ❌ Agent "${blockedAgent}" cannot call itself via Task tool.
║                                                                      ║
║  You ARE the ${blockedAgent} agent.
║  Do the work directly using your available tools.                    ║
║                                                                      ║
║  NEVER use Task tool to invoke yourself - this creates               ║
║  infinite recursion loops.                                           ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝`
          }));
          return;
        }
      }
    }
  }

  // Check each enforcement rule
  for (const rule of AGENT_ENFORCEMENT_RULES) {
    let matches = false;

    // Check if this tool/command matches the rule
    if (rule.toolName === toolName) {
      if (rule.commandPattern) {
        // For Bash commands, check the command pattern
        matches = commandMatchesPattern(toolInput, rule.commandPattern);
      } else {
        // For MCP tools, direct name match
        matches = true;
      }
    }

    if (matches) {
      // Check for bypass patterns
      if (shouldBypass(toolInput, rule.allowPatterns)) {
        continue; // Skip this rule, allow the operation
      }

      // Check if running inside the required agent
      if (isRunningInAgent(transcriptPath, rule.agentAliases)) {
        continue; // Allow - running in correct agent
      }

      // Block the operation
      console.log(JSON.stringify({
        decision: 'block',
        reason: `BLOCKED: ${rule.name} requires agent!\n\n${rule.message}`
      }));
      return;
    }
  }

  // No rules matched or all passed - approve
  console.log(JSON.stringify({ decision: 'approve' }));
}

main().catch(err => {
  console.error('Hook error:', err.message);
  // On error, approve to avoid blocking legitimate operations
  console.log(JSON.stringify({ decision: 'approve' }));
});

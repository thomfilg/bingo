---
argument-hint: <app-name> [options-json]
description: Run QA testing for a specific app using Playwright MCP
allowed-tools: Task, Bash, Read, AskUserQuestion
---

# /check-qa - QA Testing for Single App

Run QA testing for a specific application by launching the `qa-feature-tester` agent.

## What This Command Does

1. Parse arguments (app name + optional JSON options)
2. If no arguments → auto-discover affected apps
3. Launch `qa-feature-tester` agent with context
4. Agent handles ALL testing (Playwright, screenshots, report)

---

## Step 1: Parse Arguments

```javascript
const rawArgs = "$ARGUMENTS".trim();

// If no arguments, go to Step 2 (auto-discover)
if (!rawArgs) {
  // Continue to auto-discovery
}

// Parse: "app-name" or "app-name {json}"
const args = rawArgs.split(/\s+(.+)/);
const APP_NAME = args[0];
const options = args[1] ? JSON.parse(args[1]) : {};

// Defaults
const JIRA_TICKET_ID = options.jiraTicketId || '';
const GLOBAL_TASKS = '/home/node/worktrees/tasks';
const REPORT_PATH = options.reportPath || `${GLOBAL_TASKS}/qa-${APP_NAME}.md`;
const CHANGES_HASH = options.changesHash || 'NO_HASH';
const SCREENSHOTS_FOLDER = options.screenshotsFolder || `${GLOBAL_TASKS}/screenshots/${APP_NAME}/`;
const AFFECTED_FILES = options.affectedFiles || [];
const AFFECTED_PACKAGES = options.affectedPackages || [];

// Default URLs
const APP_URL = options.appUrl || {
  'status-site': 'http://host.docker.internal:5175',
  'status-site-admin': 'http://host.docker.internal:5176',
  'as-dashboard': 'http://host.docker.internal:5173',
  'as-dashboard-admin': 'http://host.docker.internal:5174'
}[APP_NAME] || 'http://host.docker.internal:3000';
```

---

## Step 2: Auto-Discover Affected Apps (if no arguments)

**Only run this if `$ARGUMENTS` is empty.**

```bash
# Discover affected apps
AFFECTED_APPS=$(node scripts/get-affected.js main json)
echo "Affected apps: $AFFECTED_APPS"
```

Parse and filter to QA-testable apps:
```javascript
const allAffected = JSON.parse(AFFECTED_APPS);
const qaApps = allAffected.filter(app =>
  ['status-site', 'status-site-admin', 'as-dashboard', 'as-dashboard-admin'].includes(app)
);
```

| Result | Action |
|--------|--------|
| 0 QA apps | Ask user to select |
| 1 QA app | Launch agent for that app |
| 2+ QA apps | Launch agent for EACH app (parallel) |

**If no QA apps found:**
```
AskUserQuestion:
  question: "No QA-testable apps affected. Which app to test?"
  header: "App"
  options:
    - label: "status-site" / description: "Port 5175"
    - label: "as-dashboard" / description: "Port 5173"
    - label: "status-site-admin" / description: "Port 5176"
    - label: "as-dashboard-admin" / description: "Port 5174"
```

---

## Step 3: Launch QA Agent (REQUIRED)

**YOU MUST launch the qa-feature-tester agent using Task tool.**

```
Task(subagent_type: "qa-feature-tester", prompt: "
Test ${APP_NAME} application.

## Context Variables
- JIRA_TICKET_ID: ${JIRA_TICKET_ID}
- REPORT_PATH: ${REPORT_PATH}
- CHANGES_HASH: ${CHANGES_HASH}
- APP_URL: ${APP_URL}
- SCREENSHOTS_FOLDER: ${SCREENSHOTS_FOLDER}

## Files Changed
${AFFECTED_FILES.join('\n') || 'None specified'}

## Packages Changed
${AFFECTED_PACKAGES.join('\n') || 'None specified'}
")
```

**The agent will:**
1. Navigate to app with Playwright MCP
2. Run tests based on affected files
3. Take screenshots
4. Write report to REPORT_PATH
5. Handle infrastructure failures with MCP diagnostics

---

## Examples

### Simple (one app)
```
/check-qa status-site
```
→ Launches qa-feature-tester for status-site with defaults

### With options (from /check)
```
/check-qa as-dashboard {"jiraTicketId":"TASK-856","reportPath":"/home/node/worktrees/tasks/TASK-856/qa-as-dashboard.md","changesHash":"abc123","appUrl":"http://host.docker.internal:5178"}
```

### No arguments (auto-discover)
```
/check-qa
```
→ Runs `node scripts/get-affected.js main json`
→ Launches agent for each affected app

---

## Enforcement

Reports are validated by SubagentStop hook: `~/.claude/hooks/validate-qa-report.js`

**Blocked if:**
- Missing report file
- Missing `**Changes Hash:**` header
- Missing `## Playwright Verification` section
- No `mcp__playwright__` tool evidence
- Puppeteer scripts used instead of MCP
- No screenshots
- INFRASTRUCTURE_FAILURE without MCP diagnostics

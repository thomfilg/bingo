---
argument-hint: [jira-ticket-id]
description: Run full quality check - QA testing, code review, and requirements verification in parallel
allowed-tools: Task, Bash, Read, Write, Edit, Grep, Glob, TodoWrite, mcp__atlassian__jira_get_issue, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_click, mcp__playwright__browser_type, mcp__playwright__browser_fill_form, mcp__playwright__browser_take_screenshot
---

# /check - Full Quality Check

Run all verification agents in parallel: quality-checker (lint, typecheck, tests), code-checker, qa-feature-tester, and completion-checker.

## Arguments

- `$ARGUMENTS` - Optional Jira ticket ID (e.g., TASK-123)
- If not provided, will check current changes without Jira context

---

## Shared Instructions (Referenced by Agents)

**FORBIDDEN_COMMANDS** - Commands that ONLY quality-checker should run:
```
pnpm lint, pnpm typecheck, pnpm test, pnpm build
pnpm affected:lint, pnpm affected:typecheck, pnpm affected:test
make dev-local, pnpm dev (services already running)
```

**REPORT_HEADER** - Every report MUST start with:
```
**Changes Hash:** ${CHANGES_HASH}
```

---

## Step 1: Setup and Cache Check

Run the setup script to initialize variables and check cache:

```bash
SETUP_RESULT=$(node ~/.claude/hooks/check-setup.js "$ARGUMENTS")
echo "$SETUP_RESULT"
```

Parse the JSON output to get:
- `MAIN_WORKTREE_PATH` - Path to main worktree
- `REPORT_FOLDER` - Where to save reports
- `CHANGES_HASH` - Hash for cache validation
- `IMPACTED_APPS` - Array of changed apps
- `AFFECTED_FILES` - Object with `apps` (files per app) and `packages` (changed packages)
- `cache.cached` - Whether reports are up-to-date

**If `cache.cached` is true:**
```
╔══════════════════════════════════════════════════════════════════════╗
║  ✅ REPORTS UP-TO-DATE - SKIPPING CHECKS                             ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Changes Hash: ${CHANGES_HASH} (unchanged)                           ║
║  Reports folder: ${REPORT_FOLDER}                                    ║
║                                                                      ║
║  No code changes since last /check run.                              ║
║  Displaying cached results...                                        ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```
Display the cached README.md and EXIT early.

**If `cache.cached` is false:** Continue with Step 2.

---

## Step 2: Start Dev Environment (DYNAMIC PORTS)

Start database and apps. **Ports are dynamic** - other agents may already be using default ports.

```bash
# Start database and apps, capture ACTUAL ports
ENV_RESULT=$(node ~/.claude/hooks/check-start-env.js '${JSON.stringify(IMPACTED_APPS)}')
RUNNING_APPS=$(echo "$ENV_RESULT" | jq '.runningApps')
echo "Running apps: $RUNNING_APPS"
```

**Example output:**
```json
{
  "status-site": { "port": 5175, "url": "http://host.docker.internal:5175", "pid": 12345 },
  "as-dashboard": { "port": 5178, "url": "http://host.docker.internal:5178", "pid": 12346 }
}
```

⚠️ **CRITICAL:** Ports are NOT guaranteed to match defaults. Another agent may have taken the default port. Always use the values returned by `check-start-env.js`.

**Default ports (reference only - actual ports may differ):**
```
as-dashboard:       5173 (default, may vary)
as-dashboard-admin: 5174 (default, may vary)
status-site:        5175 (default, may vary)
status-site-admin:  5176 (default, may vary)
```

**Database env (shared across all agents):**
```
DB_ENV = {
  DATABASE_HOST: "localhost",
  DATABASE_PORT: "5432",
  DATABASE_NAME: "status-site",
  DATABASE_MASTER_USER_NAME: "postgres",
  DATABASE_MASTER_PASSWORD: "mypassword"
}
```

## Step 3: Verify Playwright (FAIL FAST)

**Before launching QA agents**, verify Playwright works:

```bash
# Quick connectivity check
mcp__playwright__browser_navigate(url: "https://www.google.com")
```

```
╔══════════════════════════════════════════════════════════════════════╗
║  IF PLAYWRIGHT FAILS HERE:                                           ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  🛑 STOP - Do NOT launch QA agents                                   ║
║                                                                      ║
║  1. Try: node scripts/mcp-wrapper.js playwright                      ║
║  2. Check output for errors                                          ║
║  3. Report INFRASTRUCTURE_FAILURE                                    ║
║                                                                      ║
║  QA agents will waste time if Playwright is broken.                  ║
║  Fix infrastructure first, then re-run /check.                       ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

**If Playwright works:** Continue to Step 4.

---

## Step 4: Launch ALL Agents IN PARALLEL

Launch all agents simultaneously in a SINGLE message with multiple Task tool calls.

**Pass these variables to ALL agents:**
- `REPORT_FOLDER` - From Step 1
- `CHANGES_HASH` - From Step 1
- `AFFECTED_FILES` - From Step 1 (for QA agents)
- `RUNNING_APPS` - From Step 2
- `DB_ENV` - Database env vars from Step 2

**Agent Timeouts:**
| Agent | Max Time | On Timeout |
|-------|----------|------------|
| code-checker | 5 min | Mark TIMEOUT, continue |
| quality-checker | 15 min | Mark TIMEOUT, continue |
| qa-feature-tester | 10 min/app | Mark TIMEOUT, continue |
| completion-checker | 5 min | Mark TIMEOUT, continue |

If agent exceeds timeout → report shows TIMEOUT status, other agents continue.

### Agent 1: code-checker

```
Review all recent changes in the current working directory.

REPORT_FOLDER: ${REPORT_FOLDER}
CHANGES_HASH: ${CHANGES_HASH}

🚫 See FORBIDDEN_COMMANDS above (quality-checker handles those)

✅ YOUR JOB - READ and ANALYZE code only:
- git diff to see changes
- Read tool to examine files
- Grep/Glob to search codebase

Focus on: Code quality, bugs, security, performance

Report format with severity levels:
- 🔴 CRITICAL (must fix)
- 🟡 IMPORTANT (should fix)
- 🟢 SUGGESTION (nice to have)

📁 Save to: ${REPORT_FOLDER}/code-review.md
⚠️ Start with REPORT_HEADER
```

### Agent 2: quality-checker

```
Run lint, typecheck, and automated tests.

REPORT_FOLDER: ${REPORT_FOLDER}
CHANGES_HASH: ${CHANGES_HASH}
RUNNING_APPS: ${JSON.stringify(RUNNING_APPS)}

⚠️ RUNNING_APPS contains dynamically assigned ports - do NOT use hardcoded ports.
DB_ENV: ${JSON.stringify(DB_ENV)}

⚠️ YOU ARE THE ONLY AGENT that runs lint/typecheck/tests.

🖥️ SERVER STATUS: Database and apps are ALREADY RUNNING.
- Database: PostgreSQL on localhost:5432
- Apps: ${JSON.stringify(RUNNING_APPS)}

⚠️ For integration/smoke tests, use these env vars:
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=status-site
DATABASE_MASTER_USER_NAME=postgres
DATABASE_MASTER_PASSWORD=mypassword

Commands to run (use LOW_CONCURRENCY=1):
1. LOW_CONCURRENCY=1 pnpm affected:lint
2. LOW_CONCURRENCY=1 pnpm affected:typecheck
3. LOW_CONCURRENCY=1 pnpm affected:test
4. LOW_CONCURRENCY=1 pnpm affected:test:integration (with DB_ENV vars)
5. LOW_CONCURRENCY=1 pnpm affected:test:smoke:ci (with DB_ENV vars)

⚠️ Note: Ensure test runners (Vitest/Jest) use --poolOptions.threads.singleThread
   to prevent spawning parallel workers when LOW_CONCURRENCY=1 is set.

📁 Save to: ${REPORT_FOLDER}/tests.md

⚠️ FIRST LINE MUST BE: **Changes Hash:** ${CHANGES_HASH}

Status: APPROVED (all pass) or NEEDS_WORK (any failures)
```

### Agent 3.x: QA Testing (one per impacted app)

**Use `/check-qa` command** for each app in IMPACTED_APPS, ALL IN PARALLEL.

For each app in `IMPACTED_APPS`, invoke the `/check-qa` skill with JSON parameters:

```javascript
// For each APP_NAME in IMPACTED_APPS:
const qaParams = {
  jiraTicketId: JIRA_TICKET_ID,
  reportPath: `${REPORT_FOLDER}/qa-${APP_NAME}.md`,
  changesHash: CHANGES_HASH,
  appUrl: RUNNING_APPS[APP_NAME].url,
  screenshotsFolder: `${REPORT_FOLDER}/screenshots/${APP_NAME}/`,
  affectedFiles: AFFECTED_FILES.apps[APP_NAME] || [],
  affectedPackages: AFFECTED_FILES.packages || []
};

// Invoke skill:
Skill("check-qa", args: `${APP_NAME} ${JSON.stringify(qaParams)}`)
```

**Example invocations (run in parallel):**

```
# For status-site
Skill("check-qa", args: "status-site {\"jiraTicketId\":\"TASK-856\",\"reportPath\":\"/home/node/worktrees/tasks/TASK-856/qa-status-site.md\",\"changesHash\":\"e44af95d\",\"appUrl\":\"http://host.docker.internal:5175\",\"screenshotsFolder\":\"/home/node/worktrees/tasks/TASK-856/screenshots/status-site/\",\"affectedFiles\":[],\"affectedPackages\":[\"@app-services-monitoring/ui\"]}")

# For as-dashboard
Skill("check-qa", args: "as-dashboard {\"jiraTicketId\":\"TASK-856\",\"reportPath\":\"/home/node/worktrees/tasks/TASK-856/qa-as-dashboard.md\",\"changesHash\":\"e44af95d\",\"appUrl\":\"http://host.docker.internal:5178\",\"screenshotsFolder\":\"/home/node/worktrees/tasks/TASK-856/screenshots/as-dashboard/\",\"affectedFiles\":[\"apps/as-dashboard/src/EmailPreview.tsx\"],\"affectedPackages\":[]}")
```

**What /check-qa does:**
1. Creates screenshots folder
2. Verifies Playwright MCP availability
3. Launches qa-feature-tester agent with context
4. Validates report was created with required sections

**Enforcement:** SubagentStop hook validates QA reports (see `~/.claude/hooks/validate-qa-report.js`)

### Agent 4: completion-checker

```
Verify all requirements have been delivered.

REPORT_FOLDER: ${REPORT_FOLDER}
CHANGES_HASH: ${CHANGES_HASH}
JIRA_TICKET_ID: ${JIRA_TICKET_ID}

🚫 See FORBIDDEN_COMMANDS above

---

## Step 0: Find the correct source for changes

⚠️ **CRITICAL: Check the CORRECT SOURCE!**

╔══════════════════════════════════════════════════════════════════════╗
║  🛑 NEVER just grep local files on main branch!                      ║
║     Changes aren't merged yet - you'll get false negatives.          ║
║                                                                      ║
║  ✅ ALWAYS use gh pr diff or git diff against feature branch         ║
╚══════════════════════════════════════════════════════════════════════╝

**Find and verify PR:**
# Find PR for this ticket
gh pr list --search "${JIRA_TICKET_ID}" --json number,headRefName

# Use PR diff as source of truth
gh pr diff <PR_NUMBER>

**If no PR found (on feature branch):**
git diff origin/main...HEAD

---

## Step 1: Identify requirements

- Read Jira ticket: mcp__atlassian__jira_get_issue(issue_key: "${JIRA_TICKET_ID}")
- Extract acceptance criteria
- Note any sub-tasks or linked issues

---

## Step 2: Verify each requirement IN THE PR DIFF

**For each acceptance criterion:**
# Check if pattern exists in PR changes
gh pr diff <PR_NUMBER> | grep -A5 "pattern"

# List changed files
gh pr view <PR_NUMBER> --json files -q '.files[].path'

# Check specific file was modified
gh pr diff <PR_NUMBER> -- path/to/expected/file.ts

**Verification checklist:**
- [ ] File created/modified as expected?
- [ ] Function/component implemented?
- [ ] Tests added/updated?
- [ ] Types correct?

---

## Step 3: Report status

For each requirement:
| Requirement | Status | Evidence |
|-------------|--------|----------|
| [from Jira] | DELIVERED / PENDING | [file/line from PR diff] |

**Final verdict:** COMPLETE or INCOMPLETE

📁 Save to: ${REPORT_FOLDER}/completion.md
⚠️ Start with: **Changes Hash:** ${CHANGES_HASH}

Include:
- PR number checked
- Each requirement with DELIVERED/PENDING
- Evidence from PR diff (not local files)
- Final status
```

---

## Step 5: Validate and Generate Summary

After all agents complete, validate reports and generate summary.

**First, check for infrastructure failures:**

```bash
# Check if any QA report indicates Playwright failure
if grep -l "PLAYWRIGHT_UNAVAILABLE\|INFRASTRUCTURE_FAILURE" ${REPORT_FOLDER}/qa-*.md 2>/dev/null; then
  echo "🛑 Infrastructure failure detected"
fi
```

**If infrastructure failure detected:**
```
╔══════════════════════════════════════════════════════════════════════╗
║  🛑 CHECK ABORTED - INFRASTRUCTURE FAILURE                           ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  QA testing FAILED due to Playwright unavailability.                 ║
║                                                                      ║
║  ACTION REQUIRED:                                                    ║
║  1. Check Playwright MCP connection                                  ║
║  2. Re-run /check after fixing                                       ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```
Exit with INFRASTRUCTURE_FAILURE status (not APPROVED).

**If no infrastructure failures:** Continue with validation:

```bash
# Validate reports
node ~/.claude/hooks/check-validate-reports.js "${REPORT_FOLDER}" '${JSON.stringify(IMPACTED_APPS)}'

# Generate summary README.md
node ~/.claude/hooks/check-generate-summary.js "${REPORT_FOLDER}" "${CHANGES_HASH}" "${JIRA_TICKET_ID}" '${JSON.stringify(IMPACTED_APPS)}'
```

**Validation rules (causes NEEDS_WORK):**
- 🔴 CRITICAL in code-review.md → NEEDS_WORK
- 🟡 IMPORTANT in code-review.md → NEEDS_WORK
- Missing `**Changes Hash:**` at top of any report → INVALID
- Missing qa-*.md for any impacted app → INCOMPLETE
- Any test failures in tests.md → NEEDS_WORK

**All must pass for APPROVED status.**

---

## Step 6: Final Output

Display summary to user:

```
Quality Check Complete!

| Check | Status |
|-------|--------|
| Quality Checker | ✅/❌ |
| Code Checker | ✅/❌ |
| QA Tester | ✅/❌ |
| Completion | ✅/❌ |

Changes Hash: ${CHANGES_HASH}
Reports saved to: ${REPORT_FOLDER}/

${IF NEEDS_WORK}
❌ Action required - see reports for details.
${ELSE}
✅ All checks passed! Ready for PR.
${ENDIF}
```

---

## Step 7: Cleanup (ALWAYS RUN)

Stop all services started in Step 2:

```bash
# Kill dev servers by PID if available (from RUNNING_APPS)
if [ -n "$ENV_RESULT" ]; then
  echo "$ENV_RESULT" | jq -r '.apps[].pid // empty' 2>/dev/null | while read PID; do
    [ -n "$PID" ] && kill $PID 2>/dev/null || true
  done
fi

# Fallback: Kill by process name
pkill -f "pnpm dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Stop database container
docker stop postgres-local 2>/dev/null || true
```

**Run cleanup regardless of success/failure** to prevent orphaned processes.

⚠️ **Note:** Container name `postgres-local` may differ. Check `check-start-env.js` for actual name.

---

## Quick Reference

| Script | Purpose |
|--------|---------|
| `~/.claude/hooks/check-setup.js` | Setup variables, generate hash, check cache |
| `~/.claude/hooks/check-start-env.js` | Start database and apps |
| `~/.claude/hooks/check-validate-reports.js` | Validate all reports exist and are complete |
| `~/.claude/hooks/check-generate-summary.js` | Generate README.md summary |
| Step 7 cleanup commands | Stop background services (inline, no script) |

| Variable | Description |
|----------|-------------|
| `REPORT_FOLDER` | Where reports are saved |
| `CHANGES_HASH` | 12-char hash for cache validation |
| `IMPACTED_APPS` | Array of changed apps |
| `RUNNING_APPS` | Object with app URLs and ports |
| `DB_ENV` | Database environment variables |

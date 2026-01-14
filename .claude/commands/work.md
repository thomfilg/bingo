# Start Work Command

Start and complete work on a Jira task - creates ticket if needed, bootstraps worktree, implements, tests, and creates PR.

## Idempotent Execution

**This command is IDEMPOTENT** - you can run it multiple times safely. Each run will:

1. **Check each step's status** before executing
2. **Skip completed steps** (e.g., if branch exists, skip branch creation)
3. **Resume from where it left off** (e.g., if implementation is done but tests fail, fix and continue)
4. **ALWAYS re-run `/check`** - verification is NEVER skipped, even if reports exist

```
⚠️  /check is NEVER skipped on re-runs
    - Old reports are deleted and regenerated fresh
    - This ensures current code state is always verified
    - Previous PASS results do NOT carry forward
```

### Step Status Checks

| Step | How to check if complete | Skip if... |
|------|-------------------------|------------|
| 1-2. Ticket | `mcp__atlassian__jira_get_issue` succeeds | Ticket exists |
| 3. Bootstrap | Worktree exists + PR exists (draft) | `git worktree list \| grep TICKET` |
| 4. Implementation | `/work-implement` completed | Code changes in diff vs main |
| 5. Quality checks | `/check` all agents pass | All checks green |
| 6. Commit | `git log -1 --oneline` contains ticket ID | Changes committed |
| 7. `/check` loop | **ALL** reports PASS/APPROVED | **⚠️ NEVER SKIP - always re-run** |
| 7a. Cleanup | Dev processes killed | No processes running |
| 8. Push + PR update | `tasks/{TICKET}/.pr-update-sha` matches HEAD | Skip if SHA unchanged |
| 9. PR ready | `gh pr view --json isDraft -q '.isDraft'` = false | PR marked ready |
| 10. CI | `gh pr checks` all green | CI passes |
| 11. Move reports | Reports in main worktree | Already moved |
| 12. Complete | All above done | Report completion |

**On re-run:** Check status → Skip completed setup steps → **ALWAYS run /check** → **Update PR if SHA changed** → Report status

## Usage

```
/work <description or Jira ticket ID>
```

**Examples:**
- `/work Fix weekend activities not loading when changing weeks`
- `/work TASK-832` (existing ticket)

## Instructions

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  🚨 MANDATORY ON EVERY /work INVOCATION (including re-runs)                  ║
║                                                                              ║
║  Step 7 (/check) MUST ALWAYS RUN - even if reports exist                     ║
║  Step 8 (PR update) uses SHA tracking - skips if HEAD unchanged              ║
║                                                                              ║
║  ❌ FORBIDDEN: Skipping /check based on existing status                      ║
║  ❌ FORBIDDEN: Claiming completion without verifying PR was updated once     ║
║  ❌ FORBIDDEN: Reporting "WORK COMPLETE" without fresh /check                ║
║                                                                              ║
║  ✅ REQUIRED: /check → Read reports → Check PR SHA → Update if needed        ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Step 1: Determine if creating new ticket or using existing

Check if input looks like a Jira ticket ID (e.g., `TASK-XXX`):

```bash
# If input matches pattern TASK-[0-9]+, it's an existing ticket
# Otherwise, create a new ticket
```

### Step 2: Create or fetch Jira ticket

#### If NEW ticket (description provided):
Use the `jira-task-creator` agent to create a professional Jira ticket:

```
Task(jira-task-creator):
  Create a Jira ticket in project TASK with:
  - Summary: <derived from description>
  - Description: <expanded from context>
  - Type: Task (or Bug if fixing something, Story if feature)
```

#### If EXISTING ticket (ID provided):
Fetch ticket details:
```
mcp__atlassian__jira_get_issue(issue_key: "TASK-XXX")
```

### Step 3: Bootstrap worktree

Call `/bootstrap` with the ticket ID to:
- Create branch and worktree
- Copy credentials
- Symlink .claude and CLAUDE.md
- Install dependencies
- Create draft PR
- Transition Jira to "In Progress"

```
/bootstrap TASK-XXX
```

### Step 4: Implement the changes

```
╔══════════════════════════════════════════════════════════════════════╗
║  🔧 MANDATORY: Use /work-implement for implementation                ║
║                                                                      ║
║  This ensures proper agent delegation and quality enforcement.       ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Invoke /work-implement with the ticket requirements:**

```
/work-implement <summary of ticket requirements from Step 2>
```

**Example:**
```
/work-implement Fix weekend activities not loading when changing weeks.
  - Update the useWeekNavigation hook to reset state on week change
  - Ensure ActivityList refetches data when week prop changes
```

The `/work-implement` command will:
1. Analyze the request and search for context
2. Plan with TodoWrite (3-7 subtasks)
3. Select and invoke the appropriate developer agent:
   - `developer-nodejs-tdd` for backend
   - `developer-react-senior` for React logic
   - `developer-react-ui-architect` for UI design
   - `developer-devops` for infrastructure
4. Run quality checks (lint, typecheck, tests)
5. Report completion

**After /work-implement completes, self-review:**
```bash
git diff --stat                              # Check scope
git diff | grep -E "console\.|TODO|FIXME"   # Check for debug code
```

### Step 5: Run quality checks

```bash
# Lint
pnpm lint

# TypeCheck
pnpm typecheck

# Tests
pnpm test
```

Fix any issues before proceeding.

### Step 6: Clean up and commit changes

**First, remove any task tracking files** (these are for local tracking only):

```bash
# Remove task tracking files before committing
rm -f .task-*.md
```

Then use the `semantic-commit-writer` agent:

```
Task(semantic-commit-writer):
  Create a semantic commit message for the changes.
  Ticket: TASK-XXX
```

### Step 7: Run /check and verify outputs (MANDATORY LOOP)

```
╔══════════════════════════════════════════════════════════════════════╗
║  ⚠️  CRITICAL: THIS IS A MANDATORY VERIFICATION LOOP                 ║
║                                                                      ║
║  You CANNOT claim issues are fixed without re-running /check         ║
║  You CANNOT proceed to Step 8 until ALL agents return PASS/APPROVED  ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Loop Algorithm (MUST FOLLOW):**

```
MAX_ITERATIONS = 5
iteration = 0

WHILE iteration < MAX_ITERATIONS:
    iteration++

    1. Run `/check` command
    2. Wait for ALL agent reports to complete
    3. Read EACH report file:
       - tests.md
       - code-review.md
       - qa-*.md (all QA reports)
       - completion.md

    4. IF any report has FAIL/NEEDS_WORK/INCOMPLETE:
       a. Fix the issues identified
       b. Commit fixes (use semantic-commit-writer)
       c. IF iteration >= MAX_ITERATIONS:
          ╔════════════════════════════════════════════════════════════╗
          ║  🛑 ESCALATION: Unable to pass /check after 5 attempts     ║
          ╠════════════════════════════════════════════════════════════╣
          ║  Remaining issues: [list from reports]                     ║
          ║                                                            ║
          ║  Possible causes:                                          ║
          ║  - Environmental issue (not code)                          ║
          ║  - Flaky test                                              ║
          ║  - Unfixable without scope change                          ║
          ║                                                            ║
          ║  ACTION: Manual intervention required                      ║
          ╚════════════════════════════════════════════════════════════╝
          EXIT with BLOCKED status
       d. GOTO step 1 (re-run /check) ← MANDATORY!

    5. IF ALL reports show PASS/APPROVED/COMPLETE:
       EXIT loop → proceed to Step 7a
```

**Report Evaluation:**

| File | Pass Condition | On Fail |
|------|----------------|---------|
| `tests.md` | All lint/typecheck/tests pass | Fix → Re-run /check |
| `code-review.md` | No CRITICAL/IMPORTANT issues | Fix → Re-run /check |
| `code-review-reply.md` | All SUGGESTIONS addressed | Create reply for each |
| `qa-*.md` | All manual tests PASS | Fix → Re-run /check |
| `completion.md` | All requirements DELIVERED | Fix → Re-run /check |

**For code-review.md specifically:**
- 🔴 CRITICAL issues: **MUST fix** → Re-run /check
- 🟡 IMPORTANT issues: **MUST fix** → Re-run /check
- 🟢 SUGGESTIONS: **MUST respond** (see below)
- ⚪ MINOR/style: Can defer (document in code-review-reply.md)

**SUGGESTIONS require a response in `code-review-reply.md`:**

For EACH suggestion in code-review.md, you MUST create an entry in code-review-reply.md:

```markdown
# Code Review Reply

## Suggestion: [exact title from code-review.md]
**Decision:** IMPLEMENTED | DEFERRED | NOT APPLICABLE
**Reason:** [Why you made this decision - be specific]
```

Example:
```markdown
## Suggestion: Add input validation for email field
**Decision:** DEFERRED
**Reason:** Out of scope for this ticket (TASK-857 is about permissions, not validation).
Will create follow-up ticket TASK-XXX for input validation improvements.

## Suggestion: Consider using React.memo for performance
**Decision:** NOT APPLICABLE
**Reason:** Component renders infrequently (only on page load), memoization would add
complexity without measurable benefit.
```

❌ FORBIDDEN: Ignoring suggestions without documenting why
✅ REQUIRED: Every suggestion gets a response in code-review-reply.md

```
❌ FORBIDDEN BEHAVIORS:
   - Claiming "fixed" without re-running /check
   - Marking issues as resolved based on your own judgment
   - Proceeding to Step 8 with ANY failing check
   - Saying "I'll fix this later" for CRITICAL/IMPORTANT issues

✅ REQUIRED BEHAVIORS:
   - Re-run /check after EVERY fix
   - Wait for fresh agent reports
   - Only exit loop when ALL agents approve
```

**Example Loop Execution:**

```
Iteration 1:
  /check → code-review.md has 2 CRITICAL issues
  Fix both issues
  Commit: "fix(queue): correct processing rate logic"

Iteration 2:  ← MANDATORY RE-RUN
  /check → tests.md shows 1 failing test
  Fix the test
  Commit: "fix(queue): update test expectations"

Iteration 3:  ← MANDATORY RE-RUN
  /check → ALL PASS
  EXIT loop → proceed to Step 7a
```

### Step 7a: Clean up dev processes

After `/check` completes successfully, **kill all dev processes** that were started:

```bash
# Kill dev servers started by /check
pkill -f "pnpm dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Kill database if started by make dev-local
pkill -f "docker compose.*dev-local" 2>/dev/null || true
docker compose -f docker-compose.dev-local.yml down 2>/dev/null || true

echo "✅ Cleaned up dev processes"
```

**Why cleanup?**
- Dev servers consume memory/CPU
- Database containers use resources
- Not needed for remaining steps (push, PR, CI)
- Prevents resource leaks in long-running sessions

**When to skip:**
- If running in worktree and user wants to continue development after PR
- In that case, leave processes running and let user manage them

### Step 8: Push and update PR

```
╔══════════════════════════════════════════════════════════════════════╗
║  PR UPDATE VIA /work-pr COMMAND                                      ║
║                                                                      ║
║  Delegates to /work-pr which handles:                                ║
║    • SHA tracking for pr-generator and pr-post-generator             ║
║    • Skips if unchanged (saves time on re-runs)                      ║
║    • Creates tracking files in tasks/{TICKET}/                       ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Step 8a: Push changes (if any unpushed commits):**
```bash
git push
```

**Step 8b: Run /work-pr command:**

```
/work-pr ${TICKET_ID}
```

This command:
1. Checks `.pr-update-sha` → runs pr-generator if SHA changed
2. Checks `.post-pr-update-sha` → runs pr-post-generator if SHA changed
3. Records new SHAs after successful updates
4. Skips if already up-to-date

**Tracking files created in `tasks/{TICKET}/`:**
| File | Tracks |
|------|--------|
| `.pr-update-sha` | Last pr-generator run |
| `.post-pr-update-sha` | Last pr-post-generator run |

```
❌ FORBIDDEN: Claiming "WORK COMPLETE" without running /work-pr at least once
✅ ALLOWED: /work-pr skipping if SHA unchanged (cached)
✅ REQUIRED: PostToolUse hook verifies both SHA files exist
```

### Step 9: Mark PR as ready for review

```bash
gh pr ready
```

### Step 10: Wait for CI to pass

Monitor CI status with progressive polling:

1. **Wait 1 minute**, then check:
   ```bash
   gh pr checks --watch --interval 60
   ```

2. **If not completed**, wait 5 minutes, then check again

3. **If still not completed**, check every minute until done

```bash
# Check CI status
gh pr checks
```

**If CI fails:**
- Review the failing checks
- Fix the issues
- Go back to Step 4

**Only proceed to Step 11 when all CI checks pass.**

### Step 11: Verify and consolidate reports

**MANDATORY: Find ALL reports and move to main worktree**

Reports can end up in wrong locations. Always run this verification:

```bash
TICKET_ID="TASK-XXX"
MAIN_TASKS="/home/node/worktrees/tasks"
TARGET_DIR="${MAIN_TASKS}/${TICKET_ID}"

# Create target directory
mkdir -p "$TARGET_DIR"

# 1. Find all report files for this ticket across ALL worktrees
echo "🔍 Searching for reports..."
find /home/node/worktrees -type f \( -name "*.md" -o -name "*.png" -o -name "*.jpg" \) -path "*${TICKET_ID}*" 2>/dev/null

# 2. Move any reports from current worktree's tasks folder
if [ -d "./tasks/${TICKET_ID}" ] && [ "$(pwd)" != "/home/node/worktrees/app-services-monitoring" ]; then
  echo "📦 Moving reports from current worktree..."
  cp -r ./tasks/${TICKET_ID}/* "$TARGET_DIR/" 2>/dev/null || true
  rm -rf ./tasks/${TICKET_ID}
fi

# 3. Check for qa-*.md files that might be in wrong location
echo "🔍 Checking for misplaced qa-*.md files..."
find /home/node/worktrees -name "qa-*.md" -newer /home/node/worktrees/tasks/${TICKET_ID}/README.md 2>/dev/null | while read f; do
  echo "  Found: $f"
  cp "$f" "$TARGET_DIR/" 2>/dev/null || true
done

# 4. Verify required files exist
echo ""
echo "📋 Report verification:"
for file in README.md tests.md code-review.md completion.md; do
  if [ -f "$TARGET_DIR/$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file MISSING!"
  fi
done

# 5. Check for qa-*.md (may be N/A for CI-only changes)
QA_COUNT=$(ls "$TARGET_DIR"/qa-*.md 2>/dev/null | wc -l)
if [ "$QA_COUNT" -gt 0 ]; then
  echo "  ✅ qa-*.md ($QA_COUNT files)"
else
  echo "  ⚠️  qa-*.md (none - verify if apps were affected)"
fi

echo ""
echo "📁 Final location: $TARGET_DIR"
ls -la "$TARGET_DIR"
```

**Expected files in** `/home/node/worktrees/tasks/TASK-XXX/`:
- `README.md` - Summary report (REQUIRED)
- `tests.md` - Test results (REQUIRED)
- `code-review.md` - Code review (REQUIRED)
- `completion.md` - Requirements check (REQUIRED)
- `qa-*.md` - Per-app QA reports (if apps changed)
- `screenshots/` - Visual evidence (if apps changed)

### Step 12: Report completion

```
⚠️  PREREQUISITE CHECK - Before showing "WORK COMPLETE":
    □ Did /check run in THIS session? (not a previous one)
    □ Did ALL agents return PASS/APPROVED in fresh reports?
    □ Were reports generated AFTER any fixes made?
    □ Was PR update checked? (ran if SHA changed, skipped if cached)

    If ANY answer is NO:
      - Missing /check → Go to Step 7
      - Missing PR SHA check → Go to Step 8
```

```
═══════════════════════════════════════════════════════════
                    WORK COMPLETE
═══════════════════════════════════════════════════════════

Jira Ticket: TASK-XXX
  https://personal.atlassian.net/browse/TASK-XXX

Branch: TASK-XXX-description

PR: #XXX (Ready for Review)
  https://github.com/org/app-services-monitoring/pull/XXX

Reports: /home/node/worktrees/tasks/TASK-XXX/
  ✅ README.md - Summary report
  ✅ tests.md - All tests passing
  ✅ code-review.md - No critical issues
  ✅ code-review-reply.md - All suggestions addressed
  ✅ qa-*.md - Manual tests passing (per-app)
  ✅ completion.md - All requirements met

Next: Request code review from team
```

## Quick Reference

| Step | Command/Tool |
|------|--------------|
| Create ticket | `jira-task-creator` agent |
| Get ticket | `mcp__atlassian__jira_get_issue` |
| Bootstrap | `/bootstrap` command |
| Implement | `/work-implement` command **(MANDATORY)** |
| Commit | `semantic-commit-writer` agent |
| Verify | `/check` → fix → `/check` → ... (MANDATORY loop until ALL pass) |
| Cleanup | `pkill -f "pnpm dev"`, `docker compose down` |
| Update PR | `/work-pr` command **(handles SHA tracking)** |
| Ready | `gh pr ready` |
| CI check | `gh pr checks` (loops until pass) |

## Notes

- Always use `TASK` as the default project key
- Branch names: `<TICKET-ID>-<kebab-case-description>`
- Worktree path: `../app-services-monitoring-<TICKET-ID>`
- PR title format: `TASK-XXX - type(scope): description`

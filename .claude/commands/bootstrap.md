# Setup multiple Jira tasks - creates worktrees, symlinks configs, and opens draft PRs

## Usage

```
/bootstrap <task-ids...>
```

**Examples:**
- `/bootstrap 123` - Bootstrap single task TASK-123
- `/bootstrap 123 456 789` - Bootstrap multiple tasks
- `/bootstrap TASK-123 TASK-456` - Full task IDs also work

## Instructions

### Step 1: Parse task IDs

Extract task IDs from input. If only numbers provided, prefix with `TASK-`:

```bash
# Input: "123 456 789" or "TASK-123 TASK-456"
# Output: TASK-123 TASK-456 TASK-789
```

### Step 2: For EACH task, execute the following steps

Loop through each task ID and perform Steps 3-9.

### Step 3: Fetch Jira ticket details

```
mcp__atlassian__jira_get_issue(issue_key: "TASK-XXX")
```

Extract:
- Summary (for branch name)
- Description (for PR body)
- Status (verify it's not already Done)

### Step 4: Create branch and worktree

```bash
cd ~/worktrees/app-services-monitoring
git fetch origin main

# Generate branch name from ticket
TICKET_ID="TASK-XXX"
SHORT_DESC="short-description-kebab-case"  # Derived from summary
BRANCH_NAME="${TICKET_ID}-${SHORT_DESC}"
WORKTREE_PATH="../app-services-monitoring-${TICKET_ID}"

# Create worktree
git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" origin/main
```

### Step 5: Setup worktree environment

```bash
cd "$WORKTREE_PATH"

# Copy credentials (required)
cp -r ../app-services-monitoring/credentials/* ./credentials/

# Symlink Claude config (required - keeps all worktrees in sync)
ln -s ../app-services-monitoring/.claude .claude

# Create CLAUDE.md symlink (required)
ln -s GEMINI.md CLAUDE.md
```

### Step 6: Install dependencies

```bash
cd "$WORKTREE_PATH"
pnpm install
```

### Step 7: Create initial commit (empty or README update)

```bash
cd "$WORKTREE_PATH"
git commit --allow-empty -m "chore: bootstrap ${TICKET_ID}"
git push -u origin "$BRANCH_NAME"
```

### Step 8: Create draft PR

```bash
gh pr create \
  --title "${TICKET_ID} - chore: bootstrap task" \
  --body "$(cat <<'EOF'
## Summary
Bootstrap PR for ${TICKET_ID}

## Jira
- [${TICKET_ID}](https://personal.atlassian.net/browse/${TICKET_ID})

## Status
- [ ] Implementation in progress
- [ ] Tests passing
- [ ] Ready for review
EOF
)" \
  --draft
```

### Step 9: Transition Jira to "In Progress" (optional)

```
# Get available transitions
mcp__atlassian__jira_get_transitions(issue_key: "TASK-XXX")

# Transition to In Progress if not already
mcp__atlassian__jira_transition_issue(issue_key: "TASK-XXX", transition_id: "<id>")
```

### Step 10: Report results

After processing all tasks, display summary:

```
═══════════════════════════════════════════════════════════
                 BOOTSTRAP COMPLETE
═══════════════════════════════════════════════════════════

Successfully bootstrapped 3 tasks:

┌─────────────────┬────────────────────────────────────────┬─────────┐
│ Task            │ Worktree                               │ PR      │
├─────────────────┼────────────────────────────────────────┼─────────┤
│ TASK-123    │ ~/worktrees/app-services-...-123       │ #401    │
│ TASK-456    │ ~/worktrees/app-services-...-456       │ #402    │
│ TASK-789    │ ~/worktrees/app-services-...-789       │ #403    │
└─────────────────┴────────────────────────────────────────┴─────────┘

Next steps:
1. cd ~/worktrees/app-services-monitoring-TASK-123
2. Implement changes
3. Run /check when ready
4. Mark PR as ready for review
```

## Error Handling

### Task already has worktree
```
⚠️  TASK-123: Worktree already exists at ~/worktrees/app-services-monitoring-TASK-123
    Skipping...
```

### Task not found in Jira
```
❌ TASK-999: Task not found in Jira
   Skipping...
```

### Branch already exists
```
⚠️  TASK-123: Branch already exists
    Using existing branch...
```

## Quick Reference

| Step | Action |
|------|--------|
| 1 | Parse task IDs |
| 2 | Loop through tasks |
| 3 | Fetch Jira details |
| 4 | Create worktree + branch |
| 5 | Copy credentials, .claude, symlink CLAUDE.md |
| 6 | pnpm install |
| 7 | Initial commit + push |
| 8 | Create draft PR |
| 9 | Transition Jira to In Progress |
| 10 | Display summary |

## Notes

- Task IDs can be numbers only (123) or full IDs (TASK-123)
- Default project key: `TASK`
- Worktree path: `../app-services-monitoring-<TICKET-ID>`
- Branch format: `<TICKET-ID>-<kebab-case-description>`
- PRs are created as drafts

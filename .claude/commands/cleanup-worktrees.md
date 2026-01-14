# Cleanup Worktrees Command

Safely clean up git worktrees by thoroughly verifying code has been merged to main.

## Philosophy: Prefer False Negatives

**CRITICAL**: When in doubt, DO NOT DELETE. It's better to leave a worktree that could be deleted than to lose work.

## Instructions

### Step 1: Fetch latest main and list worktrees

```bash
cd ~/worktrees/app-services-monitoring
git fetch origin main
git worktree list
```

### Step 2: For EACH worktree (except main), gather comprehensive data

#### 2.1 Basic git status
```bash
cd <worktree-path>
git status --porcelain
git branch --show-current
git log --oneline -5
```

#### 2.2 Check for uncommitted/unstaged changes
```bash
cd <worktree-path>
git status --porcelain
git stash list
```
- If ANY output → **DO NOT DELETE** - has uncommitted work

#### 2.3 Check for unpushed commits
```bash
cd <worktree-path>
git log origin/main..HEAD --oneline
```

#### 2.4 Check branch status
```bash
cd <worktree-path>
branch=$(git branch --show-current 2>/dev/null || echo "DETACHED")
echo "Branch: $branch"
```
- If "DETACHED" or empty → worktree may be in early stage, check further

### Step 3: Verify code is ACTUALLY merged (not just by name)

**This is critical** - Don't just check if a PR with the same name was merged. Verify the actual changes exist in main.

#### 3.1 For each significant file changed in the worktree
```bash
cd <worktree-path>
# Get files changed vs main
git diff --name-only origin/main...HEAD
```

#### 3.2 For each changed file, verify the changes exist in main
```bash
# Pick key functions/code blocks added in the worktree
# Search for them in main
cd ~/worktrees/app-services-monitoring
git log --oneline --all -S "<unique-code-snippet>" -- <file-path>
grep -r "<unique-identifier>" <relevant-paths>
```

#### 3.3 Check PR status with detailed info
```bash
cd <worktree-path>
branch=$(git branch --show-current)
if [ -n "$branch" ]; then
  gh pr list --head "$branch" --state all --json number,state,mergedAt,title,url
  # Also check if branch was merged via different PR name
  gh pr list --state merged --search "head:$branch" --json number,state,mergedAt,title
fi
```

### Step 4: Extract Jira task ID and check status

#### 4.1 Extract task ID from branch name or folder
```bash
# Branch names follow pattern: TASK-XXX-description
# Folder names follow pattern: app-services-monitoring-TASK-XXX
branch=$(git branch --show-current)
task_id=$(echo "$branch" | grep -oE 'TASK-[0-9]+')
# Or from folder name
folder_name=$(basename "$(pwd)")
task_id=$(echo "$folder_name" | grep -oE 'TASK-[0-9]+')
```

#### 4.2 Check Jira task status
Use `mcp__atlassian__jira_get_issue` with the task ID to check:
- **Backlog/To Do**: DO NOT DELETE - work hasn't started or is planned
- **In Progress**: DO NOT DELETE - actively being worked on
- **In Review/QA**: DO NOT DELETE - work may still need changes
- **Done/Closed**: Can consider deletion IF code verified in main

### Step 5: Handle worktrees with no branches (working stage)

If worktree has no branch or is in detached HEAD state:

#### 5.1 Check for any commits at all
```bash
cd <worktree-path>
git log --oneline | head -10
```

#### 5.2 Check last modification times of files
```bash
ls -la <worktree-path>
find <worktree-path> -type f -name "*.ts" -o -name "*.tsx" -mtime -7 | head -20
```
- Recently modified files suggest active work → DO NOT DELETE

#### 5.3 Check if folder has meaningful changes
```bash
cd <worktree-path>
git diff --stat HEAD~5..HEAD 2>/dev/null || git diff --stat
```

### Step 6: Build verification summary

Create a detailed table for each worktree:

| Worktree | Branch | Jira Status | Uncommitted | Unpushed | PR Status | Code in Main | Safe |
|----------|--------|-------------|-------------|----------|-----------|--------------|------|
| path     | name   | status      | Yes/No      | Yes/No   | state     | Verified/No  | ?    |

### Step 7: Determine safety with conservative approach

**SAFE TO DELETE** (ALL must be true):
- ✅ No uncommitted changes (`git status --porcelain` empty)
- ✅ No stashes (`git stash list` empty)
- ✅ No unpushed commits OR PR is merged
- ✅ **Code verified to exist in main** (not just PR name match)
- ✅ Jira task is Done/Closed (if task ID found)

**NOT SAFE / UNCERTAIN** (ANY of these = DO NOT DELETE):
- ❌ Has uncommitted changes
- ❌ Has stashes
- ❌ Has unpushed commits without merged PR
- ❌ PR is open or in review
- ❌ Jira task is not Done/Closed
- ❌ Cannot verify code exists in main
- ❌ Detached HEAD with recent file modifications
- ❌ No branch and no clear PR history
- ⚠️ Any uncertainty whatsoever

### Step 8: Report to user BEFORE any deletion

Show clearly:

```
═══════════════════════════════════════════════════════════
                WORKTREE CLEANUP ANALYSIS
═══════════════════════════════════════════════════════════

SAFE TO DELETE (code verified in main):
─────────────────────────────────────────
1. /path/to/worktree-1
   Branch: feature-xyz
   Jira: TASK-123 (Done)
   PR: #456 (Merged on 2024-01-15)
   Verification: Key changes found in main at commit abc123

NOT SAFE (do not delete):
─────────────────────────────────────────
1. /path/to/worktree-2
   Branch: feature-abc
   Reason: Has 3 uncommitted files

2. /path/to/worktree-3
   Branch: (none - detached HEAD)
   Reason: Jira TASK-456 is "In Progress"

UNCERTAIN (keeping to be safe):
─────────────────────────────────────────
1. /path/to/worktree-4
   Branch: fix/something
   Reason: Could not verify code in main, keeping as precaution
```

### Step 9: Ask for explicit confirmation

```
Do you want to proceed with deleting the SAFE worktrees?
[List exact worktrees that will be deleted]

Type "yes" to confirm, or specify which ones to skip.
```

### Step 10: Only after confirmation, delete

```bash
cd ~/worktrees/app-services-monitoring

# For each confirmed worktree:
git worktree remove <path> --force
# Only delete branch if it exists and PR was merged
git branch -D <branch-name>
# Delete remote branch if exists
git push origin --delete <branch-name> 2>/dev/null || true
```

### Step 11: Final cleanup

```bash
cd ~/worktrees/app-services-monitoring
git worktree prune
git remote prune origin
git worktree list  # Show final state
```

## CRITICAL RULES

1. **NEVER delete without verifying code is in main** - PR name match is NOT enough
2. **NEVER delete worktrees with Jira tasks not in Done/Closed status**
3. **NEVER delete worktrees in detached HEAD with recent modifications**
4. **NEVER delete without explicit user confirmation**
5. **ALWAYS prefer false negatives** - keep uncertain worktrees
6. **ALWAYS show detailed reasoning** for each decision
7. **ALWAYS verify code existence** by checking actual file contents/functions in main

## Code Verification Examples

### Good verification:
```bash
# Worktree added a new function `calculateMetrics` in src/utils/metrics.ts
# Verify it exists in main:
cd ~/worktrees/app-services-monitoring
grep -r "calculateMetrics" src/utils/metrics.ts
# If found → code is in main
```

### Insufficient verification:
```bash
# Just checking PR was merged by title → NOT ENOUGH
gh pr list --state merged --search "TASK-123"
# This doesn't prove the code is actually there!
```

## Edge Cases

### Worktree with work in progress (no commits yet)
- Check file modification times
- Check Jira task status
- Default: DO NOT DELETE

### Branch pushed but PR not created
- Code may be important work
- Default: DO NOT DELETE

### Old worktree with Done Jira but code not found in main
- May have been closed without merge
- Investigate before deleting
- Default: DO NOT DELETE (could be closed as won't-fix but has useful code)

### Multiple PRs from same branch
- Check ALL PRs, not just the latest
- Verify which one (if any) was actually merged

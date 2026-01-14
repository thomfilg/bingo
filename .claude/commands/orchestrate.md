# Orchestrate Command

Runs `/work` for multiple Jira tasks sequentially, completing one before starting the next.
**Each task runs in its own worktree with isolated Claude session history.**

## Usage

```
/orchestrate <task-ids...>
```

**Examples:**
- `/orchestrate 851 853 899` - Work on 3 tasks sequentially
- `/orchestrate TASK-851` - Work on single task
- `/orchestrate 851 853 899 456` - Work on 4 tasks

## Instructions

### Step 1: Parse task IDs

Extract task IDs from input. If only numbers provided, prefix with `TASK-`:

```bash
# Input: "851 853 899" or "TASK-851 TASK-853"
# Output: ["TASK-851", "TASK-853", "TASK-899"]
```

Store the list of tasks to process.

### Step 2: Initialize tracking

Create a tracking structure for the orchestration:

```
TASKS_TO_PROCESS = [TASK-851, TASK-853, TASK-899]
CURRENT_INDEX = 0
COMPLETED = []
FAILED = []
```

### Step 3: Display initial plan

```
═══════════════════════════════════════════════════════════
               ORCHESTRATE: Sequential Work
═══════════════════════════════════════════════════════════

Tasks to process (in order):
  1. TASK-851  → ~/worktrees/app-services-monitoring-TASK-851
  2. TASK-853  → ~/worktrees/app-services-monitoring-TASK-853
  3. TASK-899  → ~/worktrees/app-services-monitoring-TASK-899

Each task will run in its own worktree with isolated session.

Starting with task 1 of 3...
```

### Step 4: Sequential execution loop

For EACH task in the list, execute sequentially:

```
FOR i = 0 TO length(TASKS_TO_PROCESS) - 1:
    TASK_ID = TASKS_TO_PROCESS[i]
    WORKTREE_PATH = "/home/node/worktrees/app-services-monitoring-${TASK_ID}"

    1. Display progress banner:
       ═══════════════════════════════════════════════════════
                    TASK {i+1} OF {TOTAL}: {TASK_ID}
       ═══════════════════════════════════════════════════════
       Worktree: ${WORKTREE_PATH}

    2. Bootstrap worktree if not exists:
       - Check: git worktree list | grep ${TASK_ID}
       - If not exists, run /bootstrap for this task first
       - This creates the worktree, branch, and draft PR

    3. Spawn new Claude session in worktree:
       ```bash
       cd ${WORKTREE_PATH} && claude -p "/work ${TASK_ID}"
       ```

       IMPORTANT: This spawns a NEW Claude CLI process that:
       - Runs in the worktree directory
       - Has its own session history (stored in worktree/.claude/)
       - Executes /work in isolation
       - Returns when /work completes

    4. Wait for Claude session to complete entirely
       - /work handles: implement → test → PR
       - Do NOT proceed until the spawned session finishes

    5. Check result:
       - If /work completed successfully (exit code 0):
         COMPLETED.push(TASK_ID)
       - If /work failed or was blocked:
         FAILED.push({TASK_ID, reason})
         Ask user: "Continue with next task? (Y/n)"
         - If no: EXIT loop

    6. Display transition message:
       ───────────────────────────────────────────────────────
       ✅ {TASK_ID} complete. Moving to next task...
       ───────────────────────────────────────────────────────
```

### Step 5: Handle failures gracefully

If a `/work` invocation fails or gets blocked:

```
⚠️  TASK BLOCKED: TASK-853

Reason: [reason from /work]

Options:
1. Continue with next task (TASK-899)
2. Stop orchestration

Completed so far: TASK-851
Remaining: TASK-899
```

Use AskUserQuestion to let user decide:
- **Continue** - Skip the failed task and move to next
- **Stop** - End orchestration, show summary

### Step 6: Final summary

After all tasks processed (or user stops):

```
═══════════════════════════════════════════════════════════
              ORCHESTRATION COMPLETE
═══════════════════════════════════════════════════════════

Results:
┌─────────────────┬────────────┬───────────────────────────┐
│ Task            │ Status     │ PR                        │
├─────────────────┼────────────┼───────────────────────────┤
│ TASK-851    │ ✅ Done    │ #401                      │
│ TASK-853    │ ❌ Failed  │ -                         │
│ TASK-899    │ ✅ Done    │ #402                      │
└─────────────────┴────────────┴───────────────────────────┘

Summary:
  ✅ Completed: 2
  ❌ Failed: 1
  ⏭️  Skipped: 0

PRs ready for review:
  - https://github.com/org/app-services-monitoring/pull/401
  - https://github.com/org/app-services-monitoring/pull/402

Failed tasks (need manual attention):
  - TASK-853: [reason]
```

## Key Behaviors

### Sequential Execution (CRITICAL)
- **NEVER** run tasks in parallel
- **ALWAYS** wait for `/work` to complete before starting next
- Each task gets full attention and resources

### Context Isolation
- Each `/work` invocation is independent
- Failures in one task don't affect others
- Worktrees are separate per task

### Progress Visibility
- Clear banners between tasks
- Running count (e.g., "Task 2 of 5")
- Summary shows all results at end

## Error Recovery

### If Claude session gets stuck
```
Claude session has been running for extended time on TASK-853.
Check worktree: ~/worktrees/app-services-monitoring-TASK-853

Manual options:
1. Kill the stuck process: Ctrl+C or find/kill the claude process
2. cd ~/worktrees/app-services-monitoring-TASK-853
3. Check git status, test status manually
4. Resume work: claude -p "/work TASK-853"
```

### If orchestration interrupted
```
Orchestration was interrupted at task 2 of 5.

Completed: TASK-851
In progress: TASK-853
Remaining: TASK-899, TASK-456, TASK-789

To resume remaining tasks: /orchestrate 853 899 456 789
To resume single task: cd ~/worktrees/app-services-monitoring-TASK-853 && claude -p "/work"
```

### Checking progress from main terminal
```bash
# List all worktrees
git worktree list

# Check session history for a specific task
ls -la ~/worktrees/app-services-monitoring-TASK-853/.claude/

# View recent Claude output (if running)
tail -f /tmp/claude-orchestrate-TASK-853.log
```

## Notes

- Default project key: `TASK`
- Each task gets its own worktree via `/bootstrap`
- Each task runs in a **separate Claude CLI session**
- Session history is stored in each worktree's `.claude/` folder
- All `/work` behaviors apply (implement, test, PR)
- Use this for batch processing related tasks
- Best for independent tasks that don't depend on each other

## Session Isolation Benefits

| Benefit | Description |
|---------|-------------|
| **Isolated history** | Each task's conversation is in its own worktree |
| **Independent context** | No cross-contamination between tasks |
| **Resumable** | Can resume any task by going to its worktree |
| **Reviewable** | Check `.claude/` in any worktree to see what happened |
| **Clean failures** | One task failing doesn't corrupt others |

## Spawning Claude Sessions

The orchestrator uses `claude -p` to spawn sessions:

```bash
# Spawns Claude in the worktree directory with /work command
cd /home/node/worktrees/app-services-monitoring-TASK-851 && \
  claude -p "/work TASK-851" 2>&1 | tee /tmp/claude-orchestrate-TASK-851.log

# The -p flag runs the prompt and exits when done
# Output is logged for review
```

This ensures:
- Claude runs in the correct directory (worktree)
- Session history is stored in the worktree
- Output can be monitored via log file
- Exit code indicates success/failure

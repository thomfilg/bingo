# Run Agent Command

Runs a controlled Claude agent via CLI with hook protection and turn limits.

## Usage

```
/run-agent <agent-type> <task-description>
```

## Parameters

- `agent-type`: One of: qa, code-review, explore, implement
- `task-description`: What the agent should do

## Implementation

When invoked, spawn a new Claude CLI process with:

```bash
claude \
  --no-session-persistence \
  --print \
  --max-turns ${MAX_TURNS} \
  --model ${MODEL} \
  --allowedTools "${ALLOWED_TOOLS}" \
  -p "${PROMPT}"
```

### Agent Configurations

| Agent Type | Max Turns | Model | Allowed Tools |
|------------|-----------|-------|---------------|
| qa | 50 | sonnet | Read,Grep,Glob,Bash,mcp__playwright__* (resize to 1370x800 first) |
| code-review | 30 | sonnet | Read,Grep,Glob |
| explore | 20 | haiku | Read,Grep,Glob,Bash |
| implement | 100 | sonnet | Read,Grep,Glob,Bash,Edit,Write |

### Execution Steps

1. **Parse Arguments**
   - Extract agent-type from first argument
   - Extract task-description from remaining arguments

2. **Build Command**
   ```bash
   # Example for QA agent
   claude \
     --no-session-persistence \
     --print \
     --model sonnet \
     --allowedTools "Read,Grep,Glob,Bash,mcp__playwright__browser_navigate,mcp__playwright__browser_snapshot,mcp__playwright__browser_click,mcp__playwright__browser_take_screenshot,mcp__playwright__browser_resize" \
     -p "You are a QA tester. ${TASK_DESCRIPTION}

   IMPORTANT CONSTRAINTS:
   - Maximum turns: 50 (you will be forcefully stopped after this)
   - Save your report to: /home/node/worktrees/tasks/\${TASK_ID}/qa-report.md
   - Take screenshots and save to: /home/node/worktrees/tasks/\${TASK_ID}/screenshots/
   - If you encounter repeated errors, STOP and report what you found

   BROWSER SETUP (do this FIRST):
   - Resize browser to 1370x800: mcp__playwright__browser_resize(width: 1370, height: 800)
   - This ensures full page visibility in screenshots
   "
   ```

3. **Run in Background**
   - Use `run_in_background: true` for long-running tasks
   - Capture output to file for review

4. **Report Results**
   - Show agent output when complete
   - Report any errors or early termination

### Benefits Over Task Tool

| Feature | Task Tool | /run-agent |
|---------|-----------|------------|
| Hooks apply | ❌ No | ✅ Yes |
| Turn limits | ⚠️ Sometimes ignored | ✅ Enforced by CLI |
| Can be killed | ⚠️ Difficult | ✅ Standard process |
| Session saved | ✅ Yes | ❌ No (by design) |

### Example Usage

```
/run-agent qa Test the weekend activities page permissions at http://host.docker.internal:5173/as/weekend_activities

/run-agent code-review Review the changes in apps/as-dashboard/app/routes/as.weekend_activities.tsx

/run-agent explore Find all files that handle user permissions
```

### Error Handling

If the agent hits max-turns:
```
Error: Reached max turns (50)
```

This is expected behavior - it prevents infinite loops. The agent should have saved partial results before being stopped.

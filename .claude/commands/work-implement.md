# Implement Command

Quick implementation without the full /work workflow. Use when you already have a branch set up and just need to implement changes.

## Usage

```
/work-implement <description of what to implement>
```

**Examples:**
- `/work-implement add email categorization for CD notifications`
- `/work-implement fix the weekend activities loading bug`
- `/work-implement create a new Button variant with loading state`

## Instructions

### Step 0: Setup task folder

```bash
# Determine task ID (from branch name or Jira ticket)
BRANCH=$(git branch --show-current)
TICKET_ID=$(echo "$BRANCH" | grep -oE 'TASK-[0-9]+' || echo "task-$(date +%Y%m%d-%H%M%S)")
TASK_DIR="/home/node/worktrees/tasks/${TICKET_ID}"

# Create task folder
mkdir -p "$TASK_DIR"
```

**Save implementation tracking file:**
```markdown
# /home/node/worktrees/tasks/${TICKET_ID}/implement.md

## Implementation: <description>
Date: <timestamp>
Branch: <branch-name>

### Request
<original request>

### Agent Used
<developer-agent-name>

### Changes
<to be filled after implementation>
```

### Step 1: Analyze the request

1. **Understand the scope:**
   - What needs to be implemented?
   - Which files/areas are affected?
   - Is this frontend, backend, or both?

2. **Search for context:**
   ```bash
   # Find related files
   git grep "related_term"
   ```

3. **Check for existing patterns:**
   - Look for similar implementations in the codebase
   - Follow established conventions

### Step 2: Plan with TodoWrite

Break the implementation into 3-7 subtasks:

```
TodoWrite([
  { content: "Research existing patterns", status: "pending", activeForm: "Researching existing patterns" },
  { content: "Implement core logic", status: "pending", activeForm: "Implementing core logic" },
  { content: "Add tests", status: "pending", activeForm: "Adding tests" },
  { content: "Run quality checks", status: "pending", activeForm: "Running quality checks" }
])
```

### Step 3: Select and invoke the appropriate agent

```
╔══════════════════════════════════════════════════════════════════════╗
║  🔧 MANDATORY: You MUST invoke a developer agent                     ║
║                                                                      ║
║  Direct Write/Edit is blocked - use Task() to delegate               ║
╚══════════════════════════════════════════════════════════════════════╝
```

Based on the implementation type:

| Implementation Type | Agent to Use |
|---------------------|--------------|
| Node.js/Express/NestJS backend | `developer-nodejs-tdd` |
| React components with complex logic | `developer-react-senior` |
| React UI with visual design focus | `developer-react-ui-architect` |
| Infrastructure/DevOps | `developer-devops` |

**Invoke the agent:**

```
Task(<agent-name>):
  Implement: <description>

  Context:
  - Current branch: <branch-name>
  - Affected areas: <list affected files/modules>
  - Requirements: <specific requirements>

  Constraints:
  - Follow existing code patterns
  - Keep changes focused on the request
  - Add appropriate tests
```

### Step 4: Run quality checks

After agent completes:

```bash
# Lint
pnpm lint

# TypeCheck
pnpm typecheck

# Tests (if applicable)
pnpm test
```

Fix any issues before completing.

### Step 5: Update task file and report completion

**Update the implementation tracking file:**
```bash
# Update /home/node/worktrees/tasks/${TICKET_ID}/implement.md with results
```

Add the following to the `### Changes` section:
- Files modified with brief descriptions
- Agent used and summary of work done
- Quality check results

**Report to user:**
```
Implementation Complete

Task folder: /home/node/worktrees/tasks/${TICKET_ID}/
Report: implement.md

Agent used: <agent-name>

Changes made:
- <list of changes>

Files modified:
- <list of files>

Quality checks:
- Lint: PASS
- TypeCheck: PASS
- Tests: PASS (if applicable)

Next steps:
- Review the changes: git diff
- Commit when ready: use semantic-commit-writer agent
```

## Notes

- This command does NOT create commits - use `semantic-commit-writer` agent after reviewing
- This command does NOT run /check - use `/check` separately if needed
- This command does NOT create PRs - use `/work` for full workflow
- For complex multi-step features, consider using `/work` instead
- **Agent delegation is MANDATORY** - direct Write/Edit is blocked

# Global Instructions for Claude

## Core Principles
- Be concise and direct in responses
- Minimize output tokens while maintaining quality
- Focus on completing tasks efficiently
- Use specialized agents when their expertise matches the task

## GitHub Operations - CRITICAL
### Pull Request Management
**ALWAYS use `gh` CLI (MCP GitHub tools disabled due to WSL/authentication issues):**
- `gh pr create` - Create new PRs
- `gh pr view` - View PR details
- `gh pr list` - List PRs
- `gh pr merge` - Merge PRs
- `gh pr review` - Add PR reviews
- `gh pr diff` - View PR changes
- `gh pr status` - Check PR status

### Issue Management
**Use `gh` CLI for issues:**
- `gh issue create` - Create issues
- `gh issue view` - View issue details
- `gh issue list` - List issues
- `gh issue comment` - Add comments

### Repository Operations
**Use git commands directly:**
- Standard git commands for branching, committing, pushing
- `gh` CLI for GitHub-specific operations

### Git Worktree Convention
**ALWAYS use `../` (parent directory) for worktrees:**
- Create worktrees in `../<repo-name>-<branch-name>`
- Example: `git worktree add ../app-services-monitoring-TASK-123 -b TASK-123-feature-name main`
- List existing worktrees: `git worktree list`

**Setup for new worktrees:**
```bash
cp -r ../app-services-monitoring/credentials/* ./credentials/
ln -s ../app-services-monitoring/.claude .claude
ln -s GEMINI.md CLAUDE.md
```

## Agent Usage Guidelines
### When to Use Specialized Agents
1. **semantic-commit-writer** - For ALL commit messages
2. **pr-generator** - For creating PR descriptions from git diffs
3. **nodejs-tdd-developer** - For Node.js/Express/NestJS backend development
4. **react-ui-architect** - For React UI components with visual design focus
5. **qa-feature-tester** - For comprehensive manual testing of features (it is not to write automated tests)
6. **devops-expert** - For infrastructure, deployment, CI/CD tasks
7. **requirements-verifier** - ALWAYS call this agent BEFORE declaring a task complete
8. **code-checker** - ALWAYS use when user asks to "check" any file or code

## Preferred Tool Hierarchy
1. **Specialized agents** - For domain-specific tasks
2. **CLI tools** - `gh` for GitHub, standard Unix commands
3. **MCP tools (mcp__\*)** - Disabled by default; @mention to enable when needed
4. **Direct API/SDK calls** - When other options don't exist

**WSL Environment Notes:**
- Most MCP servers disabled due to WSL/Docker Desktop communication issues
- Use `@playwright2` to temporarily enable browser testing
- Use `gh` CLI instead of GitHub MCP tools

## Commit and PR Workflow
1. **Creating commits:** Use semantic-commit-writer agent
2. **Creating PRs:** Use pr-generator agent with `gh pr create`
3. **Updating PRs:** Use pr-generator agent with `gh pr edit`
4. **PR reviews:** Use `gh pr review`

**CRITICAL - PR OPERATIONS:**
- **ALWAYS** use pr-generator agent for PR descriptions
- Use `gh` CLI for all GitHub operations
- pr-generator agent handles description generation only

**CRITICAL - NO ATTRIBUTION:**
- **NEVER** add "Generated with Claude Code" or any Claude attribution
- **NEVER** add "Co-Authored-By: Claude" to commits or PRs
- Keep commit messages and PR descriptions clean and professional
- Do not add any AI-generated markers or signatures

## Code Quality Standards
- Run lint and typecheck after code changes
- Write tests for new functionality
- Follow existing code conventions
- Never commit secrets or credentials
- Use TodoWrite for task planning and tracking

## File Operations
- Prefer editing existing files over creating new ones
- Never create documentation unless explicitly requested
- Always read files before editing them
- Use appropriate search tools (Grep, Glob) before using Agent tool
- **Allowed read operations:** All read operations are permitted in /personal/p/ repository
- **File checking:** When user asks to "check" a file, ALWAYS use code-checker agent

## Security Guidelines
- Never expose or log secrets/keys
- Never commit sensitive information
- Always validate user input
- Follow security best practices in code

## Communication Style
- Be concise - use 1-3 sentences when possible
- No unnecessary preambles or conclusions
- Show file paths with line numbers (file:line format)
- Only use emojis if explicitly requested
- Focus on actions over explanations unless asked
- **NEVER suggest running commands on user's local machine** - always find a way to do it within this environment or via CI/CD

## Testing Approach
- Check for existing test setup before assuming frameworks
- Run existing tests after changes
- Use qa-feature-tester agent for comprehensive testing
- Verify changes don't break existing functionality

## Storybook Development
- **Always run Storybook with --host 0.0.0.0** for external access
- Access Storybook via 192.xxx.xxx.xxx IP addresses, not localhost
- Command: `npx storybook dev --host 0.0.0.0`

## Task Completion Protocol - MANDATORY ENFORCEMENT

**ABSOLUTE REQUIREMENT:** You CANNOT claim a task is complete without following this protocol EXACTLY.

### Step 1: Run Quality Checks (WITH PROOF)
Execute these commands and SHOW THE ACTUAL OUTPUT:
```bash
# 1. Lint
pnpm lint
# Must show: "✅ 0 errors, 0 warnings" or similar

# 2. TypeCheck
pnpm typecheck
# Must show: "✅ No errors" or build success

# 3. Run Tests
pnpm test                    # Unit tests (if applicable)
pnpm test:integration:ci     # Integration tests (if applicable)
pnpm test:smoke:ci          # Smoke tests (if applicable)
# Must show: "✅ X/X tests passed"
```

### Step 2: CALL requirements-verifier Agent
```typescript
Task("requirements-verifier", {
  proof: {
    lint_output: "actual pnpm lint output",
    typecheck_output: "actual pnpm typecheck output",
    test_output: "actual test command output",
    exit_codes: [0, 0, 0] // all must be 0
  }
})
```

### Step 3: Get Agent Approval

#### Step 3.1: Get requirements-verifier Approval
The requirements-verifier agent MUST approve with:
- ✅ All quality checks verified
- ✅ All tests passed with proof
- ✅ No errors or warnings found
  
#### Step 3.2: Get code-checker Approval
The code-checker agent MUST approve thecode

### Step 4: ONLY THEN Inform User
After agents approval, you may inform the user the task is complete. If agents says that is everything ok. If there are any changes claimed for one of those agents, keep working and iterating with it until it says that is complete. On every iteration with them you must go to step 1 again before iterate with code-checker and requirements-verifier

**VIOLATION CONSEQUENCES:**
If you claim completion without this protocol:
- ❌ User will reject your work
- ❌ You must start verification from scratch
- ❌ Trust is damaged

**NO EXCEPTIONS. NO SHORTCUTS. NO SUMMARIES WITHOUT PROOF.**
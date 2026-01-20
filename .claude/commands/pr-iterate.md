# PR Iterate Command

Iterate on PR review comments from Copilot or human reviewers.

## Workflow

1. **Fetch PR review comments** using GitHub API or `gh pr view`
2. **For each comment**, delegate to appropriate developer agent to evaluate:
   - If **AGREE**: Implement the fix
   - If **DISAGREE**: Document the reason
3. **Run tests** to verify fixes don't break anything
4. **Amend commit** with fixes (use correct author/committer)
5. **Force push** to update PR
6. **Report summary** of fixed vs disagreed comments

## Usage

```
/pr-iterate [PR_NUMBER]
```

If PR_NUMBER not provided, find PR for current branch.

## Implementation Steps

### Step 1: Find PR and fetch comments
```bash
# Get PR number for current branch
gh pr list --head $(git branch --show-current) --json number -q '.[0].number'

# Fetch review comments
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments
```

### Step 2: Evaluate each comment
For each comment, use the appropriate developer agent:
- **nodejs-tdd-developer**: For backend/Node.js code
- **react-developer**: For React/frontend code

Ask the agent:
1. Does this comment identify a real issue?
2. If yes, what's the fix?
3. If no, why do we disagree?

### Step 3: Implement fixes
- Make code changes for agreed comments
- Run tests to verify
- Stage changes: `git add -A`

### Step 4: Amend and push
```bash
# Amend with correct author (get from git log)
AUTHOR=$(git log origin/main -1 --format="%an <%ae>")
GIT_COMMITTER_NAME="..." GIT_COMMITTER_EMAIL="..." git commit --amend --no-edit

# Force push
git push --force
```

### Step 5: Mark resolved (if gh available)
```bash
# Resolve comment thread
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments/{comment_id}/replies \
  -X POST -f body="Fixed in latest commit"
```

## Output Format

```markdown
## PR Review Summary

**Fixed (N comments):**
| ID | File | Issue | Fix |
|---|---|---|---|
| ... | ... | ... | ... |

**Disagreed (N comments):**
| ID | File | Issue | Reason |
|---|---|---|---|
| ... | ... | ... | ... |

**Commit:** {commit_hash}
```

## Notes

- Always run tests before pushing
- Never include AI attribution in commits
- Use correct author/committer from repo history
- If `gh` CLI unavailable, use WebFetch for GitHub API

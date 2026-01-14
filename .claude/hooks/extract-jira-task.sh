#!/bin/bash
# Extract Jira task ID from current branch name and remind to include in PR title

# Get current branch name
BRANCH=$(git branch --show-current 2>/dev/null)

if [ -z "$BRANCH" ]; then
    echo "REMINDER: Include Jira task ID in PR title if applicable"
    exit 0
fi

# Extract Jira task ID (pattern: TASK-XXX or similar PROJECT-XXX)
TASK_ID=$(echo "$BRANCH" | grep -oE '[A-Z]+-[0-9]+' | head -1)

if [ -n "$TASK_ID" ]; then
    echo "PR TITLE REQUIREMENT: Include '$TASK_ID' in the PR title"
    echo "Format: $TASK_ID - type(scope): description"
    echo "Example: $TASK_ID - feat(dashboard): add new feature"
else
    echo "REMINDER: No Jira task ID found in branch '$BRANCH'"
    echo "If this PR relates to a Jira task, include it in the title: TASK-XXX - type(scope): description"
fi

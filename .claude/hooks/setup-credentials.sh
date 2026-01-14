#!/bin/bash
# Hook to create credentials.json from environment variables (secrets)
# Secrets should be configured in GitHub Codespaces settings

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CREDS_FILE="$REPO_ROOT/credentials/credentials.json"

# Check if credentials file already exists
if [ -f "$CREDS_FILE" ]; then
  exit 0
fi

# Build credentials JSON from environment variables
# Only create if at least one secret is available
if [ -n "$TRELLO_API_KEY" ] || [ -n "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  mkdir -p "$REPO_ROOT/credentials"

  cat > "$CREDS_FILE" << EOF
{
  "trello": {
    "apiKey": "${TRELLO_API_KEY:-}",
    "token": "${TRELLO_TOKEN:-}",
    "boardId": "${TRELLO_BOARD_ID:-}"
  },
  "github": {
    "personalAccessToken": "${GITHUB_PERSONAL_ACCESS_TOKEN:-}"
  }
}
EOF

  echo "credentials.json created from environment secrets"
fi

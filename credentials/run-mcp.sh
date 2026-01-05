#!/bin/bash
# Generic MCP runner that loads credentials from credentials.json
# Usage: run-mcp.sh <mcp-name> <mcp-package>
# Example: run-mcp.sh trello @delorenj/mcp-server-trello

set -e

MCP_NAME="${1:?Usage: run-mcp.sh <mcp-name> <mcp-package>}"
MCP_PACKAGE="${2:?Usage: run-mcp.sh <mcp-name> <mcp-package>}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CREDS_FILE="$SCRIPT_DIR/credentials.json"

if [ ! -f "$CREDS_FILE" ]; then
  echo "Error: $CREDS_FILE not found." >&2
  echo "Copy credentials.example.json to credentials.json and fill in your credentials." >&2
  exit 1
fi

# Check if MCP section exists
if ! jq -e ".$MCP_NAME" "$CREDS_FILE" > /dev/null 2>&1; then
  echo "Error: No '$MCP_NAME' section in $CREDS_FILE" >&2
  exit 1
fi

# Export all keys from the MCP section as environment variables
# Converts camelCase to SCREAMING_SNAKE_CASE with MCP name prefix
# e.g., apiKey in trello section becomes TRELLO_API_KEY
while IFS='=' read -r key value; do
  snake_key=$(echo "$key" | sed -r 's/([a-z])([A-Z])/\1_\2/g' | tr '[:lower:]' '[:upper:]')
  env_var="${MCP_NAME^^}_${snake_key}"
  export "$env_var"="$value"
done < <(jq -r ".$MCP_NAME | to_entries | .[] | \"\(.key)=\(.value)\"" "$CREDS_FILE")

exec npx -y "$MCP_PACKAGE"

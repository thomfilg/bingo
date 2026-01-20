#!/bin/bash
# Only run in remote environments
if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi

# Install gh CLI (no sudo needed - direct binary install)
GH_VERSION="2.45.0"
curl -L "https://github.com/cli/cli/releases/download/v${GH_VERSION}/gh_${GH_VERSION}_linux_amd64.tar.gz" -o /tmp/gh.tar.gz
tar -xzf /tmp/gh.tar.gz -C /tmp
mkdir -p "$HOME/.local/bin"
mv /tmp/gh_${GH_VERSION}_linux_amd64/bin/gh "$HOME/.local/bin/"
export PATH="$HOME/.local/bin:$PATH"
echo "PATH=$HOME/.local/bin:\$PATH" >> "$CLAUDE_ENV_FILE"

echo "gh CLI installed: $(gh --version)"
exit 0

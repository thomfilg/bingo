#!/bin/bash
set -euo pipefail

# Marketplaces to register. Format: <github-owner>/<repo> or any source
# accepted by `claude plugin marketplace add` (URL, path, npm spec).
MARKETPLACES=(
  "tigredonorte/claude-plugin-work"
)

# Plugins to install. Format: <plugin-name>@<marketplace-name>
# (marketplace-name comes from the `name` field in marketplace.json,
# not the GitHub repo name).
PLUGINS=(
  "work-workflow@work-workflow"
)

for source in "${MARKETPLACES[@]}"; do
  claude plugin marketplace add "$source" >/dev/null 2>&1 || true
done

for spec in "${PLUGINS[@]}"; do
  if ! claude plugin install "$spec" --scope user >/dev/null; then
    echo "session-start hook: failed to install $spec" >&2
  fi
done

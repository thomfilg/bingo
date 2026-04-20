#!/bin/bash
set -euo pipefail

MARKETPLACE_REPO="tigredonorte/claude-plugin-work"
PLUGIN_SPEC="work-workflow@work-workflow"

claude plugin marketplace add "$MARKETPLACE_REPO" >/dev/null 2>&1 || true
claude plugin install "$PLUGIN_SPEC" --scope user >/dev/null

#!/bin/bash
# Detect all Cloudflare Workers in the monorepo
# A worker is any directory containing a wrangler.toml file

set -e

# Find all wrangler.toml files and output their directories as JSON array
workers=$(find . -name "wrangler.toml" -not -path "./node_modules/*" | while read -r file; do
  dirname "$file"
done | sort -u)

# Convert to JSON array
echo "["
first=true
for worker in $workers; do
  if [ "$first" = true ]; then
    first=false
  else
    echo ","
  fi
  # Get worker name from wrangler.toml
  name=$(grep -m1 '^name' "$worker/wrangler.toml" 2>/dev/null | sed 's/name *= *"\([^"]*\)"/\1/' || basename "$worker")
  echo "  {\"path\": \"$worker\", \"name\": \"$name\"}"
done
echo "]"

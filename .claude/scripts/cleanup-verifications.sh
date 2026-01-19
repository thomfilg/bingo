#!/usr/bin/env bash
# Cleanup all verification files (for manual cleanup if needed)

echo "🧹 Cleaning up verification files..."
find . -maxdepth 1 -name ".task-verification-approved-*" -type f -delete
echo "✅ Cleanup complete"

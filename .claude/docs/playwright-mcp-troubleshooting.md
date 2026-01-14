# Playwright MCP Troubleshooting Guide

## Working Configuration (December 2024)

The following configuration works in Docker/WSL devcontainer environment:

```json
"playwright2": {
  "disabled": false,
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@playwright/mcp@latest",
    "--executable-path",
    "/opt/google/chrome/chrome",
    "--headless",
    "--isolated",
    "--no-sandbox"
  ]
}
```

## Required Flags Explained

| Flag | Purpose |
|------|---------|
| `--executable-path /opt/google/chrome/chrome` | Points to system Chrome binary (required because Playwright MCP doesn't auto-detect it) |
| `--headless` | Required in Docker/WSL without X11 display |
| `--isolated` | Uses temporary profile, avoids "Browser already in use" lock errors |
| `--no-sandbox` | Required in Docker containers (namespace permissions) |

## Common Errors and Solutions

### Error: "Browser is already in use for /home/node/.cache/ms-playwright/mcp-chrome-*"

**Cause:** Stale browser profile lock from previous session

**Solution:** Use `--isolated` flag (creates temp profile each time)

### Error: "Browser specified in your config is not installed"

**Cause:** MCP can't find browser or invalid `--browser` value

**Solutions:**
1. Use `--executable-path /opt/google/chrome/chrome` to point directly to Chrome
2. Note: `--browser chromium` is INVALID. Valid values: `chrome`, `firefox`, `webkit`, `msedge`

### Error: "Failed to move to new namespace: Operation not permitted"

**Cause:** Docker container can't create namespaces for Chrome sandbox

**Solution:** Add `--no-sandbox` flag

### Error: "Missing X server or $DISPLAY"

**Cause:** Running in headless environment without display

**Solution:** Add `--headless` flag

### Error: MCP tool not available after config change

**Cause:** Claude Code caches MCP config

**Solution:** Run `/mcp` to reconnect, or restart Claude Code for full reload

## Configuration Location

- Global MCP servers: `~/.claude/.claude.json` > `mcpServers` section
- Project disabled list: `~/.claude/.claude.json` > `projects."<path>".disabledMcpServers`

## Verification Commands

```bash
# Check if Chrome is installed
ls -la /opt/google/chrome/chrome

# Check running MCP processes
ps aux | grep playwright | grep -v grep

# List Playwright browser cache
ls /home/node/.cache/ms-playwright/
```

## If All Else Fails - Full Reset

```bash
# Kill all playwright processes
pkill -f "mcp-server-playwright"

# Clear browser profile locks
rm -rf /home/node/.cache/ms-playwright/mcp-chrome-*
rm -rf /home/node/.cache/ms-playwright/mcp-chromium-*

# Reconnect MCP
# Run /mcp in Claude Code
```

## Summary of Fixes Applied

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| "Browser already in use" | Stale profile locks | `--isolated` flag |
| "Browser not installed" | Invalid `--browser chromium` | `--executable-path /opt/google/chrome/chrome` |
| "Operation not permitted" | Docker namespace restrictions | `--no-sandbox` flag |
| "Missing X server" | No display in container | `--headless` flag |

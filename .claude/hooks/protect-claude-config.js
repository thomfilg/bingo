#!/usr/bin/env node

/**
 * PreToolUse hook to block agents from modifying ~/.claude files
 * unless the user explicitly requested it.
 *
 * Protects against:
 * - Edit/Write/MultiEdit tool calls
 * - Bash commands that write to ~/.claude (echo, cat, cp, mv, sed, etc.)
 * - Symlink-based bypasses
 */

const path = require('path');
const os = require('os');
const fs = require('fs');

const CLAUDE_DIR = path.join(os.homedir(), '.claude');

// Patterns that indicate user explicitly wants to modify claude config
// More restrictive - requires explicit mention of hooks/agents/commands/config
const ALLOWED_PATTERNS = [
  /(?:edit|create|update|fix|change|modify)\s+(?:a\s+)?(?:new\s+)?(?:the\s+)?(?:this\s+)?(?:\w+-)*(?:hook|command|agent)/i,
  /(?:edit|modify|update|change|fix)\s+(?:my\s+)?(?:claude|\.claude)/i,
  /add\s+(?:a\s+)?(?:new\s+)?(?:hook|command|agent)/i,
  /\.claude\/(?:hooks|settings|commands|agents)/i,
  /claude\s+config/i,
  /(?:hook|command|agent)\s+(?:file|script|code)/i,
  /create\s+(?:a\s+)?hook/i,
];

// Bash patterns that could write to files
const BASH_WRITE_PATTERNS = [
  // Basic redirects
  />\s*["']?[^|&;]*\.claude/i,           // redirect: > ~/.claude or >> ~/.claude
  /cat\s+.*>\s*["']?[^|&;]*\.claude/i,   // cat > ~/.claude
  /echo\s+.*>\s*["']?[^|&;]*\.claude/i,  // echo > ~/.claude
  /printf\s+.*>\s*["']?[^|&;]*\.claude/i,// printf > ~/.claude
  /tee\s+.*\.claude/i,                   // tee ~/.claude

  // File operations
  /cp\s+.*\.claude/i,                    // cp ... ~/.claude
  /mv\s+.*\.claude/i,                    // mv ... ~/.claude
  /ln\s+.*\.claude/i,                    // ln ... ~/.claude (symlinks)
  /install\s+.*\.claude/i,               // install ... ~/.claude
  /rsync\s+.*\.claude/i,                 // rsync ... ~/.claude

  // In-place editing
  /sed\s+-i.*\.claude/i,                 // sed -i ... ~/.claude
  /awk\s+.*>\s*["']?[^|&;]*\.claude/i,   // awk > ~/.claude

  // Deletion
  /rm\s+.*\.claude/i,                    // rm ~/.claude
  /rmdir\s+.*\.claude/i,                 // rmdir ~/.claude
  /unlink\s+.*\.claude/i,                // unlink ~/.claude

  // Creation/modification
  /touch\s+.*\.claude/i,                 // touch ~/.claude
  /mkdir\s+.*\.claude/i,                 // mkdir in ~/.claude
  /chmod\s+.*\.claude/i,                 // chmod ~/.claude
  /chown\s+.*\.claude/i,                 // chown ~/.claude

  // Network downloads
  /curl\s+.*-o\s*["']?[^|&;]*\.claude/i,           // curl -o ~/.claude
  /curl\s+.*--output\s*["']?[^|&;]*\.claude/i,     // curl --output ~/.claude
  /wget\s+.*-O\s*["']?[^|&;]*\.claude/i,           // wget -O ~/.claude
  /wget\s+.*--output-document\s*["']?[^|&;]*\.claude/i, // wget --output-document

  // Archive extraction
  /tar\s+.*-C\s*["']?[^|&;]*\.claude/i,            // tar -C ~/.claude
  /tar\s+.*--directory\s*["']?[^|&;]*\.claude/i,   // tar --directory ~/.claude
  /unzip\s+.*-d\s*["']?[^|&;]*\.claude/i,          // unzip -d ~/.claude

  // Interpreter one-liners
  /python[23]?\s+-c\s+.*\.claude/i,      // python -c "...~/.claude..."
  /node\s+-e\s+.*\.claude/i,             // node -e "...~/.claude..."
  /perl\s+-e\s+.*\.claude/i,             // perl -e "...~/.claude..."
  /ruby\s+-e\s+.*\.claude/i,             // ruby -e "...~/.claude..."

  // Subshells and eval
  /sh\s+-c\s+.*\.claude/i,               // sh -c "...~/.claude..."
  /bash\s+-c\s+.*\.claude/i,             // bash -c "...~/.claude..."
  /eval\s+.*\.claude/i,                  // eval "...~/.claude..."

  // Git operations
  /git\s+clone\s+.*\.claude/i,           // git clone ... ~/.claude
  /git\s+checkout\s+.*\.claude/i,        // cd ~/.claude && git checkout
  /git\s+pull\s+.*\.claude/i,            // git pull in ~/.claude

  // Here-documents
  /<<.*>\s*["']?[^|&;]*\.claude/i,       // cat << EOF > ~/.claude
];

/**
 * Resolve path including symlinks to prevent symlink bypass attacks
 */
function resolvePathSafe(filePath) {
  try {
    const resolved = path.resolve(filePath);
    // Try to resolve symlinks if the file/parent exists
    try {
      return fs.realpathSync(resolved);
    } catch {
      // File doesn't exist yet, resolve parent directory
      const dir = path.dirname(resolved);
      try {
        const realDir = fs.realpathSync(dir);
        return path.join(realDir, path.basename(resolved));
      } catch {
        return resolved;
      }
    }
  } catch {
    return path.resolve(filePath);
  }
}

/**
 * Check if a Bash command targets ~/.claude
 */
function bashTargetsClaudeDir(command) {
  if (!command) return false;

  // Expand ~ and $HOME in the command for checking
  const expandedCmd = command
    .replace(/~/g, os.homedir())
    .replace(/\$HOME/g, os.homedir())
    .replace(/\$\{HOME\}/g, os.homedir());

  // Check if command contains .claude path
  if (!expandedCmd.includes('.claude') && !command.includes('.claude')) {
    return false;
  }

  // Check against write patterns
  for (const pattern of BASH_WRITE_PATTERNS) {
    if (pattern.test(command) || pattern.test(expandedCmd)) {
      return true;
    }
  }

  return false;
}

/**
 * Read last N user messages from transcript JSONL file
 * Narrowed to last 3 messages to prevent pattern injection attacks
 */
function getRecentUserMessages(transcriptPath, count = 3) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    return '';
  }

  try {
    const content = fs.readFileSync(transcriptPath, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);

    const userMessages = [];
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);

        if (entry.type === 'user' && entry.message) {
          const msgContent = entry.message.content;

          if (typeof msgContent === 'string') {
            userMessages.push(msgContent);
          } else if (Array.isArray(msgContent)) {
            for (const item of msgContent) {
              if (item.type === 'text' && item.text) {
                userMessages.push(item.text);
              }
            }
          }
        }
      } catch {
        // Skip invalid lines
      }
    }

    return userMessages.slice(-count).join(' ');
  } catch {
    return '';
  }
}

/**
 * Check if user explicitly requested config modification
 */
function userRequestedConfigEdit(transcriptPath) {
  const recentMessages = getRecentUserMessages(transcriptPath, 3);

  for (const pattern of ALLOWED_PATTERNS) {
    if (pattern.test(recentMessages)) {
      return true;
    }
  }

  return false;
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  let hookData;
  try {
    hookData = JSON.parse(input);
  } catch {
    // FAIL CLOSED: Can't parse input, block to be safe
    console.log(JSON.stringify({
      decision: 'block',
      reason: 'Hook error: Could not parse input. Blocking for safety.'
    }));
    return;
  }

  const toolName = hookData.tool_name || '';
  const toolInput = hookData.tool_input || {};
  const transcriptPath = hookData.transcript_path || '';

  // Handle Edit/Write/MultiEdit tools
  if (toolName === 'Edit' || toolName === 'Write' || toolName === 'MultiEdit') {
    const filePath = toolInput.file_path || '';
    if (!filePath) {
      console.log(JSON.stringify({ decision: 'approve' }));
      return;
    }

    const normalizedPath = resolvePathSafe(filePath);

    // Check if path is in ~/.claude
    if (!normalizedPath.startsWith(CLAUDE_DIR)) {
      console.log(JSON.stringify({ decision: 'approve' }));
      return;
    }

    // Allow plan files
    if (normalizedPath.includes('/plans/')) {
      console.log(JSON.stringify({ decision: 'approve' }));
      return;
    }

    // Check if user explicitly requested config modification
    if (userRequestedConfigEdit(transcriptPath)) {
      console.log(JSON.stringify({ decision: 'approve' }));
      return;
    }

    const fileName = path.basename(filePath);
    console.log(JSON.stringify({
      decision: 'block',
      reason: `BLOCKED: ~/.claude/${fileName} - say "update the hook" or "edit .claude" to allow`
    }));
    return;
  }

  // Handle Bash tool - check for write commands targeting ~/.claude
  if (toolName === 'Bash') {
    const command = toolInput.command || '';

    if (bashTargetsClaudeDir(command)) {
      // Check if user explicitly requested config modification
      if (userRequestedConfigEdit(transcriptPath)) {
        console.log(JSON.stringify({ decision: 'approve' }));
        return;
      }

      console.log(JSON.stringify({
        decision: 'block',
        reason: `BLOCKED: Bash command targets ~/.claude - say "update the hook" or "edit .claude" to allow`
      }));
      return;
    }
  }

  // All other tools/commands approved
  console.log(JSON.stringify({ decision: 'approve' }));
}

main().catch(err => {
  // FAIL CLOSED: On any error, block the operation
  console.error('Hook error:', err.message);
  console.log(JSON.stringify({
    decision: 'block',
    reason: `Hook error: ${err.message}. Blocking for safety.`
  }));
});

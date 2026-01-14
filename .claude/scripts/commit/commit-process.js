#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Parse command line arguments (filter out '--' that pnpm adds)
const args = process.argv.slice(2).filter(arg => arg !== '--');

function showHelp() {
  console.log(`
Usage: pnpm run commit [options] [message]

Options:
  -m, --message <msg>  Commit message (can also be passed as positional arg)
  -n, --no-verify      Skip pre-commit hooks
  --amend              Amend the previous commit
  -h, --help           Show this help message

Examples:
  pnpm run commit                           # Interactive mode
  pnpm run commit -- "fix: bug"             # Direct commit with message
  pnpm run commit -- -m "feat: feature"     # Using -m flag
  pnpm run commit -- --amend                # Amend previous commit
  pnpm run commit -- -n "chore: quick fix"  # Skip hooks
`);
  process.exit(0);
}

function parseArgs(args) {
  let message = null;
  let noVerify = false;
  let amend = false;
  let help = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      help = true;
    } else if (arg === '-m' || arg === '--message') {
      // Next arg is the message
      if (i + 1 < args.length) {
        message = args[++i];
      }
    } else if (arg.startsWith('-m')) {
      // -m"message" format
      message = arg.slice(2);
    } else if (arg === '--no-verify' || arg === '-n') {
      noVerify = true;
    } else if (arg === '--amend') {
      amend = true;
    } else if (!message && !arg.startsWith('-')) {
      // Positional argument as message
      message = arg;
    }
  }

  return { message, noVerify, amend, help };
}

// Check for help flag early
if (args.includes('-h') || args.includes('--help')) {
  showHelp();
}

const parsedArgs = parseArgs(args);
const commitMessageFromArgs = parsedArgs.message?.trim() || '';
const isAutoCommit = !!commitMessageFromArgs || parsedArgs.amend;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function hasChanges() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim().length > 0;
  } catch (error) {
    return false;
  }
}

const CLAUDE_CONFIG_PATH = path.join(__dirname, '..', '..', '.claude.json');
const BACKUP_PATH = CLAUDE_CONFIG_PATH + '.backup';

let backupCreated = false;
let commitSuccessful = false;

// Ensure cleanup happens on exit
process.on('exit', (code) => {
  if (backupCreated && fs.existsSync(BACKUP_PATH)) {
    if (!commitSuccessful) {
      console.log('🔄 Restoring .claude.json from backup...');
    }
    try {
      const backupContent = fs.readFileSync(BACKUP_PATH, 'utf8');
      fs.writeFileSync(CLAUDE_CONFIG_PATH, backupContent, 'utf8');
      fs.unlinkSync(BACKUP_PATH);
      if (!commitSuccessful) {
        console.log('✅ Restored local configuration');
      }
    } catch (error) {
      console.error('Failed to restore backup:', error.message);
    }
  }
  rl.close();
});

// Handle unexpected termination
process.on('SIGINT', () => {
  console.log('\n❌ Process interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n❌ Process terminated');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught error:', error.message);
  process.exit(1);
});

async function main() {

  try {
    // Change to the .claude directory
    process.chdir(path.join(__dirname, '..', '..'));

    // Check if there are any changes to commit
    if (!hasChanges()) {
      console.log('✨ No changes to commit - working tree is clean');
      process.exit(0);
    }

    let shouldCommit = isAutoCommit;
    let commitMessage = commitMessageFromArgs;

    if (!isAutoCommit) {
      console.log('📊 Current git status:');
      execSync('git status --short', { stdio: 'inherit' });
      console.log('');
      const response = await question('📝 Would you like to commit these changes? (y/n) ');
      shouldCommit = response.toLowerCase() === 'y';

      if (shouldCommit) {
        const message = await question('Enter commit message (or press Enter for default): ');
        commitMessage = message.trim() || 'chore: update project files';
      }
    }

    if (shouldCommit) {
      if (!commitMessage) {
        commitMessage = 'chore: update project files';
      }

      console.log('');
      console.log('📦 Adding all changes...');
      execSync('git add -A', { stdio: 'inherit' });

      // Backup current .claude.json before cleaning
      if (fs.existsSync(CLAUDE_CONFIG_PATH)) {
        console.log('💾 Backing up local .claude.json...');
        const localConfig = fs.readFileSync(CLAUDE_CONFIG_PATH, 'utf8');
        fs.writeFileSync(BACKUP_PATH, localConfig, 'utf8');
        backupCreated = true;
        console.log(`✅ Created backup at ${BACKUP_PATH}`);
      }

      console.log('🔧 Preparing .claude.json for commit...');

      // Clean .claude.json
      const config = JSON.parse(fs.readFileSync(CLAUDE_CONFIG_PATH, 'utf8'));

      const machineSpecificFields = [
        'numStartups',
        'tipsHistory',
        'promptQueueUseCount',
        'cachedStatsigGates',
        'firstStartTime',
        'userID',
        'projects',
        'claudeCodeFirstTokenDate',
        'shiftEnterKeyBindingInstalled',
        'hasCompletedOnboarding',
        'lastOnboardingVersion',
        'subscriptionNoticeCount',
        'hasAvailableSubscription',
        'hasIdeOnboardingBeenShown',
        's1mAccessCache',
        'fallbackAvailableWarningThreshold',
        'isQualifiedForDataSharing',
        'cachedChangelog',
        'showExpandedTodos',
        'hasSeenTasksHint'
      ];

      const cleanConfig = { ...config };
      let removedFields = 0;

      machineSpecificFields.forEach(field => {
        if (field in cleanConfig) {
          delete cleanConfig[field];
          removedFields++;
        }
      });

      fs.writeFileSync(CLAUDE_CONFIG_PATH, JSON.stringify(cleanConfig, null, 2) + '\n', 'utf8');
      console.log(`✅ Cleaned ${removedFields} machine-specific fields from .claude.json`);

      // Stage the cleaned .claude.json (force to bypass global gitignore)
      execSync('git add -f .claude.json', { stdio: 'inherit' });

      console.log(`📝 Committing with message: "${commitMessage}"`);

      // Build commit command with proper flags
      let commitCmd = 'git commit';
      if (parsedArgs.amend) {
        commitCmd += ' --amend';
      }
      if (parsedArgs.noVerify) {
        commitCmd += ' --no-verify';
      }

      // Use HEREDOC for commit message to handle special characters and multi-line
      const heredocCmd = `${commitCmd} -m "$(cat <<'EOF'\n${commitMessage}\nEOF\n)"`;
      execSync(heredocCmd, { stdio: 'inherit', shell: '/bin/bash' });
      console.log('✅ Changes committed!');

      // Mark commit as successful
      commitSuccessful = true;

      console.log('🔄 Restoring local .claude.json...');
      // The actual restore will happen in the exit handler

      console.log('✨ Done!');
      process.exit(0);
    } else {
      console.log('❌ Commit cancelled');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
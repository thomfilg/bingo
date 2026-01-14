#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Change to the .claude directory
process.chdir(path.join(__dirname, '..', '..'));

const CLAUDE_CONFIG_PATH = '.claude.json';
const BACKUP_PATH = '.claude.json.local-backup';

let backupCreated = false;
let pullSuccessful = false;

// Ensure cleanup happens on exit
process.on('exit', (code) => {
  if (backupCreated && fs.existsSync(BACKUP_PATH)) {
    try {
      if (!pullSuccessful) {
        // Restore original if pull failed
        console.log('🔄 Restoring original .claude.json from backup...');
        const backupContent = fs.readFileSync(BACKUP_PATH, 'utf8');
        fs.writeFileSync(CLAUDE_CONFIG_PATH, backupContent, 'utf8');
      }
      fs.unlinkSync(BACKUP_PATH);
      if (!pullSuccessful) {
        console.log('✅ Restored local configuration');
      }
    } catch (error) {
      console.error('Failed to restore backup:', error.message);
    }
  }
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

function hasLocalChanges() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim().length > 0;
  } catch (error) {
    return false;
  }
}

function hasRemoteChanges() {
  try {
    execSync('git fetch', { stdio: 'pipe' });
    const status = execSync('git status -sb', { encoding: 'utf8' });
    return status.includes('behind');
  } catch (error) {
    console.error('❌ Failed to fetch from remote:', error.message);
    return false;
  }
}

function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'main';
  }
}

async function main() {
  try {
    console.log('🔍 Checking for updates...');

    const branch = getCurrentBranch();
    console.log(`📌 Current branch: ${branch}`);

    // Check if there are remote changes
    if (!hasRemoteChanges()) {
      console.log('✨ Already up to date!');
      process.exit(0);
    }
    console.log('📦 New changes available from remote');
    console.log('');

    // Backup local .claude.json
    if (fs.existsSync(CLAUDE_CONFIG_PATH)) {
      console.log('💾 Backing up local .claude.json...');
      const localConfig = fs.readFileSync(CLAUDE_CONFIG_PATH, 'utf8');
      fs.writeFileSync(BACKUP_PATH, localConfig, 'utf8');
      backupCreated = true;

      // Clean .claude.json before pulling to avoid conflicts
      console.log('🔧 Preparing .claude.json for pull...');
      execSync('node scripts/commit/prepare-commit.js', { stdio: 'pipe' });
    }

    // Check if there are uncommitted changes
    if (hasLocalChanges()) {
      console.log('⚠️  You have uncommitted changes. Please commit or stash them first.');
      console.log('💡 Tip: Use "npm run commit -- \'your message\'" to commit changes');
      process.exit(1);
    }


    // Pull changes
    console.log('⬇️  Pulling changes from remote...');
    execSync('git pull', { stdio: 'inherit' });

    // Mark pull as successful
    pullSuccessful = true;

    // Merge .claude.json files
    if (backupCreated) {
      console.log('🔧 Merging .claude.json configurations...');

      const localConfig = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'));
      const remoteConfig = JSON.parse(fs.readFileSync(CLAUDE_CONFIG_PATH, 'utf8'));

      // Machine-specific fields that should be preserved from local
      const preserveLocalFields = [
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

      // Start with remote config (to get any new shared settings)
      const mergedConfig = { ...remoteConfig };

      // Restore local machine-specific fields
      preserveLocalFields.forEach(field => {
        if (field in localConfig) {
          mergedConfig[field] = localConfig[field];
        }
      });

      // Write merged config
      fs.writeFileSync(CLAUDE_CONFIG_PATH, JSON.stringify(mergedConfig, null, 2) + '\n', 'utf8');

      // Clean up backup (will be deleted in exit handler)
      console.log('✅ Successfully merged configurations');
    }

    console.log('');
    console.log('✨ Pull completed successfully!');

    // Show what changed
    console.log('');
    console.log('📊 Recent commits:');
    execSync('git log --oneline -5', { stdio: 'inherit' });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
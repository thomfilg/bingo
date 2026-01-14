#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CLAUDE_CONFIG_PATH = path.join(__dirname, '..', '..', '.claude.json');
const BACKUP_PATH = CLAUDE_CONFIG_PATH + '.backup';

function cleanClaudeConfig() {
  try {
    if (!fs.existsSync(CLAUDE_CONFIG_PATH)) {
      console.log('❌ .claude.json not found');
      process.exit(1);
    }

    const configContent = fs.readFileSync(CLAUDE_CONFIG_PATH, 'utf8');
    const config = JSON.parse(configContent);

    fs.writeFileSync(BACKUP_PATH, configContent, 'utf8');
    console.log(`✅ Created backup at ${BACKUP_PATH}`);

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

    machineSpecificFields.forEach(field => {
      if (field in cleanConfig) {
        delete cleanConfig[field];
        console.log(`  ➖ Removed field: ${field}`);
      }
    });

    fs.writeFileSync(CLAUDE_CONFIG_PATH, JSON.stringify(cleanConfig, null, 2) + '\n', 'utf8');
    console.log(`✅ Cleaned .claude.json - ready for commit`);

    // Only show next steps if running standalone (not from commit-process)
    if (require.main === module) {
      console.log('\n📋 Next steps:');
      console.log('  1. Review changes: git diff .claude.json');
      console.log('  2. Commit: git add .claude.json && git commit -m "Update claude config"');
      console.log('  3. Restore local data: node scripts/commit/restore-config.js');
    }

  } catch (error) {
    console.error('❌ Error processing .claude.json:', error.message);
    process.exit(1);
  }
}

cleanClaudeConfig();
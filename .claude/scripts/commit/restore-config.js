#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CLAUDE_CONFIG_PATH = path.join(__dirname, '..', '..', '.claude.json');
const BACKUP_PATH = CLAUDE_CONFIG_PATH + '.backup';

function restoreConfig() {
  try {
    if (!fs.existsSync(BACKUP_PATH)) {
      console.log('❌ No backup found at', BACKUP_PATH);
      console.log('💡 Backup is created when running prepare-commit script');
      process.exit(1);
    }

    const backupContent = fs.readFileSync(BACKUP_PATH, 'utf8');
    fs.writeFileSync(CLAUDE_CONFIG_PATH, backupContent, 'utf8');

    console.log(`✅ Restored .claude.json from backup`);

    fs.unlinkSync(BACKUP_PATH);
    console.log(`🗑️  Removed backup file`);

  } catch (error) {
    console.error('❌ Error restoring config:', error.message);
    process.exit(1);
  }
}

restoreConfig();
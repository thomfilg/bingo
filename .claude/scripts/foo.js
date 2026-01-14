#!/usr/bin/env node
/**
 * Generic MCP Server Wrapper
 *
 * Loads credentials from mcp-secrets.json and spawns the target MCP server
 * with the appropriate environment variables.
 *
 * Usage: node mcp-wrapper.js <server-name> [options]
 *
 * Options:
 *   --headed    Run Playwright with visible browser (playwright only)
 *
 * Examples:
 *   node mcp-wrapper.js atlassian
 *   node mcp-wrapper.js postgres-local-dashboard
 *   node mcp-wrapper.js playwright              # Headless (default)
 *   node mcp-wrapper.js playwright --headed     # Visible browser
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Credentials file location (in repository, gitignored)
const CREDENTIALS_FILE = path.join(__dirname, '..', 'credentials', 'mcp-secrets.json');

/**
 * Detect Chrome executable path based on OS
 */
function getChromePath() {
  const platform = process.platform;

  // Common paths by platform
  const chromePaths = {
    linux: [
      '/opt/google/chrome/chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium'
    ],
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium'
    ],
    win32: [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
    ]
  };

  const paths = chromePaths[platform] || [];

  for (const chromePath of paths) {
    if (chromePath && fs.existsSync(chromePath)) {
      return chromePath;
    }
  }

  // Try to find via which/where command
  try {
    if (platform === 'win32') {
      return execSync('where chrome', { encoding: 'utf8' }).trim().split('\n')[0];
    } else {
      return execSync('which google-chrome || which chromium || which chromium-browser',
        { encoding: 'utf8', shell: true }).trim();
    }
  } catch {
    // Chrome not found - warn user
    console.error('WARNING: Chrome/Chromium not found on this system.');
    console.error('Playwright MCP requires Chrome or Chromium to be installed.');
    console.error('');
    console.error('Install Chrome:');
    if (platform === 'darwin') {
      console.error('  macOS: brew install --cask google-chrome');
      console.error('         or download from https://www.google.com/chrome/');
    } else if (platform === 'win32') {
      console.error('  Windows: Download from https://www.google.com/chrome/');
      console.error('           or: winget install Google.Chrome');
    } else {
      console.error('  Linux (Debian/Ubuntu): sudo apt install google-chrome-stable');
      console.error('  Linux (Fedora): sudo dnf install google-chrome-stable');
      console.error('  Linux (Arch): yay -S google-chrome');
    }
    console.error('');
    console.error('Checked paths:', paths.join(', '));
    return null;
  }
}

/**
 * Check if running in Docker/container (likely needs --no-sandbox)
 */
function isRunningInContainer() {
  const platform = process.platform;

  // Windows container detection
  if (platform === 'win32') {
    try {
      const hostname = os.hostname();
      // Windows containers often have auto-generated 12-char hostnames
      return hostname.length === 12 || process.env.CONTAINER_ID !== undefined;
    } catch {
      // Fall through
    }
  }

  // Linux container detection
  try {
    if (fs.existsSync('/.dockerenv')) return true;
    const cgroup = fs.readFileSync('/proc/1/cgroup', 'utf8');
    if (cgroup.includes('docker') || cgroup.includes('kubepods')) return true;
  } catch {
    // Ignore errors
  }
  return false;
}


// Server configurations
const SERVER_CONFIGS = {
  'playwright': {
    command: 'npx',
    args: (options = {}) => {
      const chromePath = getChromePath();
      if (!chromePath) {
        console.error('ERROR: Cannot start Playwright MCP without Chrome.');
        process.exit(1);
      }
      const baseArgs = [
        '-y', '@playwright/mcp@latest',
        '--executable-path', chromePath,
        '--viewport-size', '1370,800'
      ];
      // Add --headless unless --headed flag is passed
      if (!options.headed) {
        baseArgs.push('--headless');
      }
      // Add --isolated for separate browser instance
      if (options.isolated) {
        baseArgs.push('--isolated');
      }
      // Add --no-sandbox for containers (required when running as root)
      if (isRunningInContainer()) {
        baseArgs.push('--no-sandbox');
      }
      return baseArgs;
    },
    noCredentials: true
  },
  'chrome-devtools': {
    command: 'npx',
    args: ['-y', 'chrome-devtools-mcp@latest', '--browserUrl=http://localhost:9222'],
    noCredentials: true
  }
};

function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_FILE)) {
    console.error(`Error: Credentials file not found: ${CREDENTIALS_FILE}`);
    console.error('Please create the file with your MCP server credentials.');
    console.error('See docs/mcp-configuration.md for the expected format.');
    process.exit(1);
  }

  try {
    return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
  } catch (error) {
    console.error(`Error reading credentials: ${error.message}`);
    process.exit(1);
  }
}

function showHelp() {
  console.log('MCP Server Wrapper - Loads credentials and spawns MCP servers\n');
  console.log('Usage: node mcp-wrapper.js <server-name> [options]\n');
  console.log('Available servers:');
  Object.keys(SERVER_CONFIGS).forEach(name => {
    console.log(`  - ${name}`);
  });
  console.log('\nOptions:');
  console.log('  --headed    Run Playwright with visible browser (playwright only)');
  console.log('\nCredentials are loaded from:');
  console.log(`  ${CREDENTIALS_FILE}`);
  console.log('\nExamples:');
  console.log('  node mcp-wrapper.js playwright           # Headless browser (default)');
  console.log('  node mcp-wrapper.js playwright --headed  # Visible browser');
}

// Parse arguments
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

const serverName = args[0];
const config = SERVER_CONFIGS[serverName];

if (!config) {
  console.error(`Error: Unknown server '${serverName}'`);
  console.log('\nAvailable servers:');
  Object.keys(SERVER_CONFIGS).forEach(name => {
    console.log(`  - ${name}`);
  });
  process.exit(1);
}

// Parse additional CLI options
const cliOptions = {
  headed: args.includes('--headed'),
  isolated: args.includes('--isolated')
};

// Build environment variables
const env = { ...process.env };
let credentials = null;

// Load credentials if needed
if (!config.noCredentials) {
  const allCredentials = loadCredentials();
  credentials = allCredentials[config.credentialKey];

  if (!credentials) {
    console.error(`Error: No credentials found for '${config.credentialKey}'`);
    process.exit(1);
  }
}

// Build args - support function or array (pass cliOptions to function)
let finalArgs = typeof config.args === 'function' ? config.args(cliOptions) : [...config.args];

if (config.connectionString && credentials) {
  // Note: server-postgres requires connection string as CLI argument
  // This exposes password in ps aux - acceptable tradeoff for MCP functionality
  const connString = config.connectionString(credentials);
  finalArgs.push(connString);
} else if (credentials) {
  // Set environment variables from credentials
  Object.entries(credentials).forEach(([key, value]) => {
    if (typeof value === 'string') {
      env[key] = value;
    }
  });
}

// Spawn the MCP server
const child = spawn(config.command, finalArgs, {
  stdio: 'inherit',
  env: env,
  shell: process.platform === 'win32'
});

child.on('error', (error) => {
  console.error(`Error spawning ${serverName}: ${error.message}`);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code || 0);
});

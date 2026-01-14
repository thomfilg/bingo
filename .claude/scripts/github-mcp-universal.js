#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Parse command-line arguments and environment variables
const args = process.argv.slice(2);
const forcePersonal = args.includes('--personal') || process.env.GITHUB_MCP_USE_PERSONAL === 'true';
const forceOrg = args.includes('--org') || process.env.GITHUB_MCP_USE_ORG === 'true';

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: github-mcp-universal [options]');
    console.log('Options:');
    console.log('  --personal    Force use of personal GitHub token');
    console.log('  --org         Force use of ORG GitHub token');
    console.log('  --help, -h    Show this help message');
    console.log('');
    console.log('Environment variables:');
    console.log('  GITHUB_MCP_USE_PERSONAL=true    Force use of personal GitHub token');
    console.log('  GITHUB_MCP_USE_ORG=true         Force use of ORG GitHub token');
    console.log('');
    console.log('By default, uses personal token for ~/p/* directories, ORG token elsewhere');
    process.exit(0);
}

// Check for conflicting flags
if (forcePersonal && forceOrg) {
    console.error('Error: Cannot use both --personal and --org flags (or their environment variables)');
    process.exit(1);
}

// Determine environment based on flags or current directory
const currentDir = process.cwd();
const homeDir = os.homedir();

let envFile;
if (forcePersonal) {
    // Force personal env
    envFile = path.join(homeDir, '.claude', '.env.personal');
    console.log('Using personal GitHub token (forced)');
} else if (forceOrg) {
    // Force ORG env
    envFile = path.join(homeDir, '.claude', '.env.org');
    console.log('Using ORG GitHub token (forced)');
} else if (currentDir.startsWith(path.join(homeDir, 'p'))) {
    // Auto-detect: Use personal env for projects in ~/p/
    envFile = path.join(homeDir, '.claude', '.env.personal');
    console.log('Using personal GitHub token (auto-detected from ~/p/)');
} else {
    // Auto-detect: Default to ORG env
    envFile = path.join(homeDir, '.claude', '.env.org');
    console.log('Using ORG GitHub token (default)');
}

// Check if the selected env file exists
if (!fs.existsSync(envFile)) {
    console.error(`Error: Environment file ${envFile} does not exist`);
    process.exit(1);
}

// Load the environment file
try {
    const envContent = fs.readFileSync(envFile, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                envVars[key] = valueParts.join('=');
            }
        }
    });

    // Set environment variables
    Object.assign(process.env, envVars);

    // Run the GitHub MCP server with the loaded token
    const npxProcess = spawn('npx', ['@modelcontextprotocol/server-github'], {
        stdio: 'inherit'
    });

    npxProcess.on('close', (code) => {
        process.exit(code);
    });

} catch (error) {
    console.error('Error loading environment file:', error.message);
    process.exit(1);
}
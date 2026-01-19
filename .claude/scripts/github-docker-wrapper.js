#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the appropriate environment file using getEnv.js
const scriptDir = __dirname;
const getEnvScript = path.join(scriptDir, 'getEnv.js');

const getEnvProcess = spawn('node', [getEnvScript], { stdio: 'pipe' });

let envFile = '';
getEnvProcess.stdout.on('data', (data) => {
    envFile += data.toString().trim();
});

getEnvProcess.on('close', (code) => {
    if (code !== 0) {
        console.error('Error: Failed to get environment file');
        process.exit(1);
    }

    // Check if running in WSL for Docker command selection
    let dockerCmd = 'docker';
    try {
        const versionInfo = fs.readFileSync('/proc/version', 'utf8');
        if (versionInfo.toLowerCase().includes('microsoft')) {
            dockerCmd = 'docker.exe';
        }
    } catch (error) {
        // If we can't read /proc/version, assume non-WSL
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

        // Run the GitHub MCP server via Docker with the loaded token
        const dockerArgs = [
            'run', '-i', '--rm',
            '-e', `GITHUB_PERSONAL_ACCESS_TOKEN=${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
            'ghcr.io/github/github-mcp-server'
        ];

        const dockerProcess = spawn(dockerCmd, dockerArgs, {
            stdio: 'inherit'
        });

        dockerProcess.on('close', (code) => {
            process.exit(code);
        });

    } catch (error) {
        console.error('Error loading environment file:', error.message);
        process.exit(1);
    }
});
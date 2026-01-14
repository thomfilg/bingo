#!/usr/bin/env node
/**
 * /check Environment Starter
 *
 * Starts the dev environment for /check:
 * - Starts database with make dev-local
 * - Starts impacted apps and captures their ports
 * - Returns RUNNING_APPS configuration
 *
 * Usage: node check-start-env.js <IMPACTED_APPS_JSON>
 *
 * Output: JSON object with running apps and their URLs
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');

// Get impacted apps from args
const IMPACTED_APPS = JSON.parse(process.argv[2] || '[]');

// App configurations - which apps are web apps that need to be started
// Ports match Vite/Remix defaults configured in each app
const WEB_APPS = {
  'as-dashboard': { defaultPort: 5173, type: 'vite' },
  'as-dashboard-admin': { defaultPort: 5174, type: 'vite' },
  'status-site': { defaultPort: 5175, type: 'remix' },
  'status-site-admin': { defaultPort: 5176, type: 'remix' }
};

// Database environment variables for integration tests
const DB_ENV = {
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '5432',
  DATABASE_NAME: 'status-site',
  DATABASE_MASTER_USER_NAME: 'postgres',
  DATABASE_MASTER_PASSWORD: 'mypassword'
};

/**
 * Execute a command synchronously
 */
function exec(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', ...options }).trim();
  } catch (error) {
    return null;
  }
}

/**
 * Check if database is already running
 */
function isDatabaseRunning() {
  const result = exec('docker ps --filter "name=postgres" --format "{{.Names}}"');
  return result && result.includes('postgres');
}

/**
 * Check if an app is already running on a port
 */
function isPortInUse(port) {
  const result = exec(`lsof -i :${port} -t 2>/dev/null`);
  return result && result.length > 0;
}

/**
 * Find an available port starting from default
 */
function findAvailablePort(startPort) {
  let port = startPort;
  while (isPortInUse(port) && port < startPort + 100) {
    port++;
  }
  return port;
}

/**
 * Start database if not running
 */
async function startDatabase() {
  if (isDatabaseRunning()) {
    console.error('Database already running');
    return { started: false, alreadyRunning: true };
  }

  console.error('Starting database with make dev-local...');

  return new Promise((resolve) => {
    const proc = spawn('make', ['dev-local'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true
    });

    let output = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
      // Check if database is ready
      if (output.includes('database system is ready') || output.includes('PostgreSQL init')) {
        console.error('Database started');
        resolve({ started: true, pid: proc.pid });
      }
    });

    proc.stderr.on('data', (data) => {
      output += data.toString();
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (isDatabaseRunning()) {
        resolve({ started: true, pid: proc.pid });
      } else {
        resolve({ started: false, error: 'Timeout waiting for database' });
      }
    }, 30000);

    proc.unref();
  });
}

/**
 * Start a web app and capture its port
 */
async function startApp(appName, config) {
  const port = findAvailablePort(config.defaultPort);

  if (isPortInUse(config.defaultPort)) {
    // App might already be running
    console.error(`Port ${config.defaultPort} in use, ${appName} may already be running`);
    return {
      name: appName,
      port: config.defaultPort,
      url: `http://host.docker.internal:${config.defaultPort}`,
      alreadyRunning: true
    };
  }

  console.error(`Starting ${appName} on port ${port}...`);

  return new Promise((resolve) => {
    const proc = spawn('pnpm', ['dev', `--filter=${appName}`], {
      cwd: process.cwd(),
      env: { ...process.env, PORT: port.toString() },
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true
    });

    let output = '';
    let resolved = false;

    const handleOutput = (data) => {
      output += data.toString();

      // Look for "Local:" URL in output
      const match = output.match(/Local:\s*http:\/\/localhost:(\d+)/);
      if (match && !resolved) {
        resolved = true;
        const actualPort = parseInt(match[1], 10);
        console.error(`${appName} started on port ${actualPort}`);
        resolve({
          name: appName,
          port: actualPort,
          url: `http://host.docker.internal:${actualPort}`,
          pid: proc.pid,
          started: true
        });
      }
    };

    proc.stdout.on('data', handleOutput);
    proc.stderr.on('data', handleOutput);

    // Timeout after 60 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        if (isPortInUse(port)) {
          resolve({
            name: appName,
            port: port,
            url: `http://host.docker.internal:${port}`,
            pid: proc.pid,
            started: true,
            note: 'Started but did not detect URL output'
          });
        } else {
          resolve({
            name: appName,
            error: 'Timeout waiting for app to start',
            started: false
          });
        }
      }
    }, 60000);

    proc.unref();
  });
}

/**
 * Main execution
 */
async function main() {
  const result = {
    database: null,
    apps: {},
    env: DB_ENV,
    runningApps: {}
  };

  // Start database
  result.database = await startDatabase();

  // Wait a bit for database to be fully ready
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Start only web apps that were impacted
  const webAppsToStart = IMPACTED_APPS.filter(app => WEB_APPS[app]);

  for (const appName of webAppsToStart) {
    const config = WEB_APPS[appName];
    const appResult = await startApp(appName, config);
    result.apps[appName] = appResult;

    if (appResult.started || appResult.alreadyRunning) {
      result.runningApps[appName] = {
        port: appResult.port,
        url: appResult.url
      };
    }
  }

  // Output result
  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

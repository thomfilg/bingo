import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

// ---- Cache Management ----
const PKG_UI = process.cwd();
const cacheFile = path.join(PKG_UI, '.component-check-cache.json');
let componentCache = {};
let cacheLoadAttempted = false;
let cacheDirty = false;
let lastSaveTime = 0;
const SAVE_THROTTLE_MS = 1000; // Minimum time between saves

/**
 * Load cache from file with proper error handling
 * @returns {Object} The loaded cache object
 */
export function loadCache() {
    if (cacheLoadAttempted) return componentCache;
    cacheLoadAttempted = true;
    
    try {
        if (fs.existsSync(cacheFile)) {
            const cacheContent = fs.readFileSync(cacheFile, 'utf-8');
            componentCache = JSON.parse(cacheContent);
            console.log(`📦 Loaded cache with ${Object.keys(componentCache).length} entries`);
        }
    } catch (error) {
        console.warn('⚠️  Could not load cache:', error.message);
        componentCache = {};
    }
    return componentCache;
}

/**
 * Save cache with file locking to handle concurrency
 * @param {boolean} force - Force save even if not dirty
 * @param {boolean} skipThrottle - Skip throttling (for final saves)
 */
export function saveCache(force = false, skipThrottle = false) {
    if (!cacheDirty && !force) return;
    
    // Throttle saves to prevent excessive disk I/O
    if (!skipThrottle && !force) {
        const now = Date.now();
        if (now - lastSaveTime < SAVE_THROTTLE_MS) {
            // Schedule a deferred save
            setTimeout(() => saveCache(false, true), SAVE_THROTTLE_MS);
            return;
        }
    }
    
    const tempFile = `${cacheFile}.tmp.${process.pid}`;
    const lockFile = `${cacheFile}.lock`;
    let lockAcquired = false;
    
    try {
        // Try to acquire lock (with retry logic)
        let retries = 5;
        while (retries > 0) {
            try {
                // Create lock file exclusively
                fs.writeFileSync(lockFile, process.pid.toString(), { flag: 'wx' });
                lockAcquired = true;
                break;
            } catch (e) {
                if (retries === 1) {
                    // On final retry failure, just log and return
                    console.warn('⚠️  Could not acquire cache lock after retries');
                    return;
                }
                retries--;
                // Wait a bit before retry with exponential backoff
                const waitTime = Math.random() * 100 * (6 - retries) + 50;
                execSync(`sleep ${waitTime / 1000}`);
            }
        }
        
        // Load current cache to merge with our changes
        let currentCache = {};
        if (fs.existsSync(cacheFile)) {
            try {
                currentCache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
            } catch (e) {
                // If cache is corrupted, start fresh
                console.warn('⚠️  Cache file corrupted, will recreate');
            }
        }
        
        // Merge caches, preferring newer entries
        Object.entries(componentCache).forEach(([key, value]) => {
            if (!currentCache[key] || value.timestamp > (currentCache[key].timestamp || 0)) {
                currentCache[key] = value;
            }
        });
        
        // Write to temp file first
        fs.writeFileSync(tempFile, JSON.stringify(currentCache, null, 2));
        
        // Atomic rename
        fs.renameSync(tempFile, cacheFile);
        
        cacheDirty = false;
        lastSaveTime = Date.now();
        
        // Only log in verbose mode or when not in batch mode
        if (process.env.VERBOSE === 'true' || process.env.BATCH_MODE !== 'true') {
            console.log(`💾 Cache updated (${Object.keys(currentCache).length} entries)`);
        }
    } catch (error) {
        console.warn('⚠️  Could not save cache:', error.message);
    } finally {
        // Release lock
        if (lockAcquired) {
            try {
                fs.unlinkSync(lockFile);
            } catch {}
        }
        // Clean up temp file if it exists
        try {
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
        } catch {}
    }
}

/**
 * Calculate hash for a component to detect changes
 * @param {string} componentDir - Path to component directory
 * @returns {Promise<string|null>} Hash of component files or null if error
 */
export async function getComponentHash(componentDir) {
    try {
        const files = await fs.promises.readdir(componentDir, { recursive: true });
        const hashes = [];
        
        for (const file of files) {
            // Skip non-source files
            if (file.includes('node_modules') || file.includes('.git')) continue;
            if (!file.match(/\.(ts|tsx|js|jsx|css|scss|md)$/)) continue;
            
            const filePath = path.join(componentDir, file);
            const stat = await fs.promises.stat(filePath);
            
            if (stat.isFile()) {
                const content = await fs.promises.readFile(filePath);
                hashes.push(crypto.createHash('md5').update(content).digest('hex'));
            }
        }
        
        return crypto.createHash('md5').update(hashes.sort().join('')).digest('hex');
    } catch (error) {
        return null; // Component doesn't exist or error reading
    }
}

/**
 * Alternative hash calculation using category and name
 * @param {string} category - Component category
 * @param {string} name - Component name
 * @returns {Promise<string|null>} Hash of component files or null if error
 */
export async function getComponentHashByName(category, name) {
    const componentPath = path.join(PKG_UI, 'src', 'components', category, name);
    return getComponentHash(componentPath);
}

/**
 * Check if cache is valid for component
 * @param {string} category - Component category
 * @param {string} component - Component name
 * @param {string} componentDir - Path to component directory
 * @returns {Promise<boolean>} True if cache is valid
 */
export async function isCacheValid(category, component, componentDir) {
    if (process.env.SKIP_CACHE === 'true' || process.env.NO_CACHE === 'true') {
        return false;
    }
    
    loadCache();
    const cacheKey = `${category}/${component}`;
    const cached = componentCache[cacheKey];
    
    if (!cached || cached.status !== 'PASS') {
        return false;
    }
    
    // Check if component has changed
    const currentHash = await getComponentHash(componentDir);
    if (currentHash !== cached.hash) {
        return false;
    }
    
    // Check cache age (24 hours by default)
    const maxAge = parseInt(process.env.CACHE_MAX_AGE) || (24 * 60 * 60 * 1000);
    const age = Date.now() - cached.timestamp;
    if (age > maxAge) {
        return false;
    }
    
    return true;
}

/**
 * Update cache entry
 * @param {string} category - Component category
 * @param {string} component - Component name
 * @param {string} componentDir - Path to component directory
 * @param {string} status - Check status (PASS/FAIL)
 * @param {string} reason - Reason for status
 */
export async function updateCache(category, component, componentDir, status, reason) {
    if (process.env.SKIP_CACHE === 'true' || process.env.NO_CACHE === 'true') {
        return;
    }
    
    loadCache();
    const cacheKey = `${category}/${component}`;
    const hash = await getComponentHash(componentDir);
    
    componentCache[cacheKey] = {
        hash,
        status,
        reason,
        timestamp: Date.now()
    };
    
    cacheDirty = true;
}

/**
 * Get cache entry for a component
 * @param {string} category - Component category
 * @param {string} component - Component name
 * @returns {Object|null} Cache entry or null if not found
 */
export function getCacheEntry(category, component) {
    loadCache();
    const cacheKey = `${category}/${component}`;
    return componentCache[cacheKey] || null;
}

/**
 * Clear cache for a specific component
 * @param {string} category - Component category
 * @param {string} component - Component name
 */
export function clearCacheEntry(category, component) {
    loadCache();
    const cacheKey = `${category}/${component}`;
    if (componentCache[cacheKey]) {
        delete componentCache[cacheKey];
        cacheDirty = true;
    }
}

/**
 * Get all cache entries
 * @returns {Object} All cache entries
 */
export function getAllCacheEntries() {
    loadCache();
    return { ...componentCache };
}

/**
 * Clear entire cache
 */
export function clearCache() {
    componentCache = {};
    cacheDirty = true;
    saveCache(true);
}

/**
 * Mark cache as dirty (needs saving)
 */
export function markCacheDirty() {
    cacheDirty = true;
}

/**
 * Check if cache needs saving
 * @returns {boolean} True if cache is dirty
 */
export function isCacheDirty() {
    return cacheDirty;
}

/**
 * Setup cleanup handlers for cache
 */
export function setupCacheCleanup() {
    const cleanup = () => {
        if (cacheDirty) {
            saveCache(true, true); // Force save and skip throttle on exit
        }
    };
    
    process.on('exit', cleanup);
    process.on('SIGINT', () => {
        cleanup();
        process.exit();
    });
}
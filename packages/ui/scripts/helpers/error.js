/**
 * Error handling utilities for component checks
 */

/**
 * Extract meaningful failure reason from error output or error object
 * @param {Error|string} error - The error object or error output string
 * @returns {string} A human-readable failure reason
 */
export function extractFailureReason(error) {
    // Convert error to string if it's an Error object
    const errorStr = typeof error === 'string' ? error : error.toString();
    const errorOutput = error.stdout || error.stderr || errorStr;
    
    // Check for specific error patterns in order of specificity
    
    // TypeScript errors
    if (errorOutput.includes('error TS')) {
        const tsErrorMatch = errorOutput.match(/error TS\d+:/);
        if (tsErrorMatch) {
            return `TypeScript compilation error (${tsErrorMatch[0].replace(':', '')})`;
        }
        return 'TypeScript compilation error';
    }
    
    // ESLint errors
    if (errorOutput.includes('ESLint')) {
        if (errorOutput.includes('no-unused-vars')) return 'ESLint: Unused variables';
        if (errorOutput.includes('no-console')) return 'ESLint: Console statements found';
        if (errorOutput.includes('max-warnings')) return 'ESLint: Too many warnings';
        return 'ESLint validation failed';
    }
    
    // Component structure errors
    if (errorOutput.includes('components.tasks.md')) {
        return 'Missing entry in components.tasks.md';
    }
    
    if (errorOutput.includes('folder structure')) {
        return 'Invalid folder structure';
    }
    
    if (errorOutput.includes('barrel export')) {
        return 'Missing or invalid barrel export';
    }
    
    // Storybook errors
    if (errorOutput.includes('Storybook test')) {
        if (errorOutput.includes('timeout')) return 'Storybook test timeout';
        if (errorOutput.includes('snapshot')) return 'Storybook snapshot mismatch';
        return 'Storybook test failures';
    }
    
    if (errorOutput.includes('Stories coverage')) {
        return 'Missing stories coverage';
    }
    
    if (errorOutput.includes('Storybook')) {
        if (errorOutput.includes('unreachable')) return 'Storybook server unreachable';
        return 'Storybook error';
    }
    
    // Documentation errors
    if (errorOutput.includes('docs catalog')) {
        return 'Component not listed in docs catalog';
    }
    
    // Design token errors
    if (errorOutput.includes('design tokens')) {
        return 'Design tokens usage issue';
    }
    
    // Accessibility errors
    if (errorOutput.includes('a11y') || errorOutput.includes('accessibility')) {
        return 'Accessibility coverage missing';
    }
    
    // Responsive design errors
    if (errorOutput.includes('responsive')) {
        return 'Responsive story missing';
    }
    
    // Build errors
    if (errorOutput.includes('tsup') || errorOutput.includes('build')) {
        if (errorOutput.includes('entry')) return 'Build error: Missing entry file';
        return 'Build failed';
    }
    
    // Track.md errors
    if (errorOutput.includes('track.md')) {
        return 'track.md validation failed';
    }
    
    // Phase-based errors (from parallel execution)
    const phaseMatch = errorOutput.match(/\[Phase (\d+)\/\d+\]\s+(.+?)[\n\r]/);
    if (phaseMatch) {
        const phaseName = phaseMatch[2];
        if (errorOutput.includes('✗ Failed:')) {
            const failedCheck = errorOutput.match(/✗ Failed:\s+(.+)/);
            if (failedCheck) {
                return `${phaseName}: ${failedCheck[1]}`;
            }
        }
        return `Phase ${phaseMatch[1]}: ${phaseName}`;
    }
    
    // Step-based errors (from sequential execution)
    const stepMatch = errorOutput.match(/\[(\d+\/\d+)\]\s+(.+?)(?:\n|$)/);
    if (stepMatch) {
        return `Step ${stepMatch[1]}: ${stepMatch[2]}`;
    }
    
    // Timeout errors
    if (errorOutput.includes('timeout') || errorOutput.includes('ETIMEDOUT')) {
        return 'Check timeout';
    }
    
    // Permission errors
    if (errorOutput.includes('EACCES') || errorOutput.includes('permission denied')) {
        return 'Permission denied';
    }
    
    // File not found errors
    if (errorOutput.includes('ENOENT') || errorOutput.includes('not found')) {
        return 'File or directory not found';
    }
    
    // Generic check failures
    if (errorOutput.includes('Check failed')) {
        return errorOutput.match(/Check failed[^.]*/) || 'Check failed';
    }
    
    // Fall back to error message or generic message
    if (error.message && error.message !== errorOutput) {
        return error.message;
    }
    
    return 'Check failed';
}

/**
 * Format error for logging with context
 * @param {Error|string} error - The error object or string
 * @param {string} component - Component name for context
 * @param {string} category - Category name for context
 * @returns {string} Formatted error message
 */
export function formatError(error, component, category) {
    const reason = extractFailureReason(error);
    return `[${category}/${component}] ${reason}`;
}

/**
 * Check if error is retryable
 * @param {Error|string} error - The error to check
 * @returns {boolean} True if the error might succeed on retry
 */
export function isRetryableError(error) {
    const errorStr = typeof error === 'string' ? error : error.toString();
    
    // Network/timeout errors are retryable
    if (errorStr.includes('ETIMEDOUT') || 
        errorStr.includes('ECONNREFUSED') ||
        errorStr.includes('timeout') ||
        errorStr.includes('unreachable')) {
        return true;
    }
    
    // Lock/permission errors might be retryable
    if (errorStr.includes('EACCES') || 
        errorStr.includes('lock') ||
        errorStr.includes('EBUSY')) {
        return true;
    }
    
    // Compilation and lint errors are not retryable
    if (errorStr.includes('error TS') ||
        errorStr.includes('ESLint') ||
        errorStr.includes('Build failed')) {
        return false;
    }
    
    return false;
}

/**
 * Get error severity level
 * @param {Error|string} error - The error to analyze
 * @returns {string} Severity level: 'critical', 'error', 'warning'
 */
export function getErrorSeverity(error) {
    const reason = extractFailureReason(error);
    
    // Critical errors that block everything
    if (reason.includes('TypeScript compilation') ||
        reason.includes('Build failed') ||
        reason.includes('Missing entry file')) {
        return 'critical';
    }
    
    // Standard errors
    if (reason.includes('ESLint') ||
        reason.includes('test failures') ||
        reason.includes('coverage missing')) {
        return 'error';
    }
    
    // Warnings that might not block
    if (reason.includes('docs catalog') ||
        reason.includes('track.md')) {
        return 'warning';
    }
    
    return 'error';
}
import type { GeneratedCell } from '../generator.interface';

/**
 * Generate a hash from cell values for uniqueness checking
 * The hash is based on cell values in their original order (not sorted),
 * making it position-aware for comparing identical card layouts.
 * @param cells Array of cells to hash
 * @returns Hash string
 */
export function generateCardHash(cells: GeneratedCell[]): string {
  // Create a string representation of cell values
  const values = cells.map(cell => {
    if (cell.type === 'free') return 'F';
    if (cell.type === 'blank') return 'B';
    return String(cell.value);
  });

  // Simple hash: join values with separator
  // This is sufficient for uniqueness checking within a session
  return values.join('-');
}

/**
 * Session data with hashes and last accessed timestamp
 */
interface SessionData {
  hashes: Set<string>;
  lastAccessed: number;
}

/**
 * Session card registry for tracking generated cards
 * Includes TTL-based automatic cleanup to prevent memory leaks
 */
export class CardRegistry {
  private sessions: Map<string, SessionData> = new Map();
  private sessionTTL: number = 60 * 60 * 1000; // 1 hour default
  private cleanupInterval: number = 60 * 1000; // Run cleanup at most every 60 seconds
  private lastCleanupTime: number = 0;

  /**
   * Get the current session TTL in milliseconds
   * @returns TTL in milliseconds
   */
  getSessionTTL(): number {
    return this.sessionTTL;
  }

  /**
   * Set the session TTL in milliseconds
   * @param ttl TTL in milliseconds
   */
  setSessionTTL(ttl: number): void {
    this.sessionTTL = ttl;
  }

  /**
   * Get the cleanup interval in milliseconds
   * @returns Cleanup interval in milliseconds
   */
  getCleanupInterval(): number {
    return this.cleanupInterval;
  }

  /**
   * Set the cleanup interval in milliseconds
   * @param interval Cleanup interval in milliseconds
   */
  setCleanupInterval(interval: number): void {
    this.cleanupInterval = interval;
  }

  /**
   * Get the last accessed timestamp for a session
   * @param sessionId Session identifier
   * @returns Timestamp or undefined if session doesn't exist
   */
  getSessionLastAccessed(sessionId: string): number | undefined {
    return this.sessions.get(sessionId)?.lastAccessed;
  }

  /**
   * Get the count of active sessions
   * @returns Number of active sessions
   */
  getActiveSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Cleanup expired sessions based on TTL
   * @returns Number of sessions cleaned up
   */
  cleanupExpiredSessions(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, data] of this.sessions) {
      if (now - data.lastAccessed > this.sessionTTL) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    this.lastCleanupTime = now;
    return cleanedCount;
  }

  /**
   * Throttled cleanup - only runs if cleanup interval has passed
   * This prevents performance degradation from running cleanup on every operation
   */
  private maybeCleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanupTime >= this.cleanupInterval) {
      this.cleanupExpiredSessions();
    }
  }

  /**
   * Register a card hash for a session
   * Triggers throttled cleanup of expired sessions
   * @param sessionId Session identifier
   * @param hash Card hash
   * @returns True if the card was new (registered), false if duplicate
   */
  register(sessionId: string, hash: string): boolean {
    // Throttled cleanup of expired sessions
    this.maybeCleanup();

    const now = Date.now();
    let sessionData = this.sessions.get(sessionId);

    if (!sessionData) {
      sessionData = {
        hashes: new Set(),
        lastAccessed: now,
      };
      this.sessions.set(sessionId, sessionData);
    } else {
      sessionData.lastAccessed = now;
    }

    if (sessionData.hashes.has(hash)) {
      return false;
    }

    sessionData.hashes.add(hash);
    return true;
  }

  /**
   * Check if a hash exists in a session
   * Updates lastAccessed if session exists, triggers throttled cleanup
   * @param sessionId Session identifier
   * @param hash Card hash
   * @returns True if hash exists (duplicate), false if unique
   */
  exists(sessionId: string, hash: string): boolean {
    // Throttled cleanup of expired sessions
    this.maybeCleanup();

    const sessionData = this.sessions.get(sessionId);

    if (!sessionData) {
      return false;
    }

    // Update last accessed time
    sessionData.lastAccessed = Date.now();

    return sessionData.hashes.has(hash);
  }

  /**
   * Clear all cards for a session
   * @param sessionId Session identifier
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Get count of cards in a session
   * @param sessionId Session identifier
   * @returns Number of cards registered
   */
  getSessionCount(sessionId: string): number {
    return this.sessions.get(sessionId)?.hashes.size ?? 0;
  }
}

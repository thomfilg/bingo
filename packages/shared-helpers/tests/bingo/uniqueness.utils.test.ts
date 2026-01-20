import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CardRegistry,
  generateCardHash,
} from '../../src/bingo/generator/utils/uniqueness.utils';
import type { GeneratedCell } from '../../src/bingo/generator/generator.interface';

describe('generateCardHash', () => {
  it('should generate hash from cell values', () => {
    const cells: GeneratedCell[] = [
      { type: 'number', value: 1 },
      { type: 'number', value: 2 },
      { type: 'free', value: null },
      { type: 'blank', value: null },
      { type: 'number', value: 3 },
    ];

    const hash = generateCardHash(cells);

    expect(hash).toBe('1-2-F-B-3');
  });

  it('should generate same hash for same cells', () => {
    const cells1: GeneratedCell[] = [
      { type: 'number', value: 10 },
      { type: 'number', value: 20 },
    ];
    const cells2: GeneratedCell[] = [
      { type: 'number', value: 10 },
      { type: 'number', value: 20 },
    ];

    expect(generateCardHash(cells1)).toBe(generateCardHash(cells2));
  });

  it('should generate different hash for different cells', () => {
    const cells1: GeneratedCell[] = [
      { type: 'number', value: 10 },
      { type: 'number', value: 20 },
    ];
    const cells2: GeneratedCell[] = [
      { type: 'number', value: 20 },
      { type: 'number', value: 10 },
    ];

    expect(generateCardHash(cells1)).not.toBe(generateCardHash(cells2));
  });
});

describe('CardRegistry', () => {
  let registry: CardRegistry;

  beforeEach(() => {
    registry = new CardRegistry();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('register', () => {
    it('should register new card and return true', () => {
      const result = registry.register('session-1', 'hash-1');

      expect(result).toBe(true);
    });

    it('should return false for duplicate card', () => {
      registry.register('session-1', 'hash-1');
      const result = registry.register('session-1', 'hash-1');

      expect(result).toBe(false);
    });

    it('should allow same hash in different sessions', () => {
      registry.register('session-1', 'hash-1');
      const result = registry.register('session-2', 'hash-1');

      expect(result).toBe(true);
    });
  });

  describe('exists', () => {
    it('should return true for registered hash', () => {
      registry.register('session-1', 'hash-1');

      expect(registry.exists('session-1', 'hash-1')).toBe(true);
    });

    it('should return false for non-registered hash', () => {
      expect(registry.exists('session-1', 'hash-1')).toBe(false);
    });

    it('should return false for hash in different session', () => {
      registry.register('session-1', 'hash-1');

      expect(registry.exists('session-2', 'hash-1')).toBe(false);
    });
  });

  describe('clearSession', () => {
    it('should remove all hashes for a session', () => {
      registry.register('session-1', 'hash-1');
      registry.register('session-1', 'hash-2');
      registry.clearSession('session-1');

      expect(registry.exists('session-1', 'hash-1')).toBe(false);
      expect(registry.exists('session-1', 'hash-2')).toBe(false);
    });

    it('should not affect other sessions', () => {
      registry.register('session-1', 'hash-1');
      registry.register('session-2', 'hash-2');
      registry.clearSession('session-1');

      expect(registry.exists('session-2', 'hash-2')).toBe(true);
    });
  });

  describe('getSessionCount', () => {
    it('should return 0 for non-existent session', () => {
      expect(registry.getSessionCount('session-1')).toBe(0);
    });

    it('should return correct count', () => {
      registry.register('session-1', 'hash-1');
      registry.register('session-1', 'hash-2');
      registry.register('session-1', 'hash-3');

      expect(registry.getSessionCount('session-1')).toBe(3);
    });
  });

  describe('TTL-based automatic cleanup', () => {
    beforeEach(() => {
      // Set cleanup interval to 0 for immediate cleanup in tests
      registry.setCleanupInterval(0);
    });

    it('should have default TTL of 1 hour', () => {
      expect(registry.getSessionTTL()).toBe(60 * 60 * 1000);
    });

    it('should have default cleanup interval of 60 seconds', () => {
      const freshRegistry = new CardRegistry();
      expect(freshRegistry.getCleanupInterval()).toBe(60 * 1000);
    });

    it('should allow setting custom TTL', () => {
      registry.setSessionTTL(30 * 60 * 1000); // 30 minutes

      expect(registry.getSessionTTL()).toBe(30 * 60 * 1000);
    });

    it('should allow setting custom cleanup interval', () => {
      registry.setCleanupInterval(5 * 60 * 1000); // 5 minutes

      expect(registry.getCleanupInterval()).toBe(5 * 60 * 1000);
    });

    it('should update lastAccessed when registering', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      registry.register('session-1', 'hash-1');

      expect(registry.getSessionLastAccessed('session-1')).toBe(now);
    });

    it('should update lastAccessed when checking existence', () => {
      const initialTime = Date.now();
      vi.setSystemTime(initialTime);
      registry.register('session-1', 'hash-1');

      const laterTime = initialTime + 1000;
      vi.setSystemTime(laterTime);
      registry.exists('session-1', 'hash-1');

      expect(registry.getSessionLastAccessed('session-1')).toBe(laterTime);
    });

    it('should not update lastAccessed for non-existent session on exists check', () => {
      expect(registry.getSessionLastAccessed('non-existent')).toBeUndefined();

      registry.exists('non-existent', 'hash-1');

      expect(registry.getSessionLastAccessed('non-existent')).toBeUndefined();
    });

    it('should cleanup expired sessions on register', () => {
      const initialTime = Date.now();
      vi.setSystemTime(initialTime);

      registry.register('session-1', 'hash-1');
      registry.register('session-2', 'hash-2');

      // Advance time past TTL (1 hour + 1ms)
      vi.setSystemTime(initialTime + 60 * 60 * 1000 + 1);

      // Register in a new session should trigger cleanup
      registry.register('session-3', 'hash-3');

      // Old sessions should be cleaned up
      expect(registry.exists('session-1', 'hash-1')).toBe(false);
      expect(registry.exists('session-2', 'hash-2')).toBe(false);
      // New session should still exist
      expect(registry.exists('session-3', 'hash-3')).toBe(true);
    });

    it('should cleanup expired sessions on exists check', () => {
      const initialTime = Date.now();
      vi.setSystemTime(initialTime);

      registry.register('session-1', 'hash-1');

      // Advance time past TTL
      vi.setSystemTime(initialTime + 60 * 60 * 1000 + 1);

      // Checking existence should trigger cleanup and return false
      expect(registry.exists('session-1', 'hash-1')).toBe(false);
    });

    it('should not cleanup sessions that were recently accessed', () => {
      const initialTime = Date.now();
      vi.setSystemTime(initialTime);

      registry.register('session-1', 'hash-1');

      // Advance time but keep session-1 active
      vi.setSystemTime(initialTime + 30 * 60 * 1000); // 30 minutes
      registry.exists('session-1', 'hash-1'); // This updates lastAccessed

      // Advance another 40 minutes (total 70 minutes from start, but only 40 from last access)
      vi.setSystemTime(initialTime + 70 * 60 * 1000);

      // Register new session to trigger cleanup
      registry.register('session-2', 'hash-2');

      // session-1 should still exist (only 40 min since last access)
      expect(registry.exists('session-1', 'hash-1')).toBe(true);
    });

    it('should cleanup multiple expired sessions at once', () => {
      const initialTime = Date.now();
      vi.setSystemTime(initialTime);

      // Register 5 sessions
      for (let i = 1; i <= 5; i++) {
        registry.register(`session-${i}`, `hash-${i}`);
      }

      // Advance time past TTL
      vi.setSystemTime(initialTime + 60 * 60 * 1000 + 1);

      // Keep session-3 active
      vi.setSystemTime(initialTime + 60 * 60 * 1000 + 1);
      // Create new session to trigger cleanup
      registry.register('session-6', 'hash-6');

      // All old sessions should be expired
      expect(registry.getSessionCount('session-1')).toBe(0);
      expect(registry.getSessionCount('session-2')).toBe(0);
      expect(registry.getSessionCount('session-3')).toBe(0);
      expect(registry.getSessionCount('session-4')).toBe(0);
      expect(registry.getSessionCount('session-5')).toBe(0);

      // New session should exist
      expect(registry.getSessionCount('session-6')).toBe(1);
    });

    it('should respect custom TTL for cleanup', () => {
      registry.setSessionTTL(5 * 60 * 1000); // 5 minutes

      const initialTime = Date.now();
      vi.setSystemTime(initialTime);

      registry.register('session-1', 'hash-1');

      // Advance 6 minutes
      vi.setSystemTime(initialTime + 6 * 60 * 1000);

      // Trigger cleanup
      registry.register('session-2', 'hash-2');

      // session-1 should be cleaned up
      expect(registry.exists('session-1', 'hash-1')).toBe(false);
    });

    it('should provide method to manually cleanup expired sessions', () => {
      const initialTime = Date.now();
      vi.setSystemTime(initialTime);

      registry.register('session-1', 'hash-1');
      registry.register('session-2', 'hash-2');

      // Advance time past TTL
      vi.setSystemTime(initialTime + 60 * 60 * 1000 + 1);

      // Manual cleanup
      const cleanedCount = registry.cleanupExpiredSessions();

      expect(cleanedCount).toBe(2);
      expect(registry.getSessionCount('session-1')).toBe(0);
      expect(registry.getSessionCount('session-2')).toBe(0);
    });

    it('should return 0 when no sessions to cleanup', () => {
      const cleanedCount = registry.cleanupExpiredSessions();

      expect(cleanedCount).toBe(0);
    });

    it('should return active session count', () => {
      const initialTime = Date.now();
      vi.setSystemTime(initialTime);

      registry.register('session-1', 'hash-1');
      registry.register('session-2', 'hash-2');
      registry.register('session-3', 'hash-3');

      expect(registry.getActiveSessionCount()).toBe(3);
    });

    it('should throttle cleanup to run only after cleanup interval', () => {
      const throttledRegistry = new CardRegistry();
      throttledRegistry.setCleanupInterval(60 * 1000); // 60 seconds
      throttledRegistry.setSessionTTL(30 * 1000); // 30 seconds TTL

      const initialTime = Date.now();
      vi.setSystemTime(initialTime);

      // First register triggers cleanup (lastCleanupTime was 0), sets lastCleanupTime=initialTime
      throttledRegistry.register('session-1', 'hash-1');

      // Advance 10 seconds
      vi.setSystemTime(initialTime + 10 * 1000);
      throttledRegistry.register('session-2', 'hash-2');

      // Advance to 50 seconds - session-1 is now expired (30s TTL, created at 0s)
      // But cleanup won't run (only 50s since last cleanup, interval is 60s)
      vi.setSystemTime(initialTime + 50 * 1000);
      throttledRegistry.register('session-3', 'hash-3');

      // All 3 sessions still exist (cleanup hasn't run yet)
      expect(throttledRegistry.getActiveSessionCount()).toBe(3);

      // Advance to 61 seconds - NOW cleanup interval has passed
      vi.setSystemTime(initialTime + 61 * 1000);

      // This should trigger cleanup
      throttledRegistry.register('session-4', 'hash-4');

      // session-1 should be cleaned up (created at 0s, TTL 30s, now 61s, 61s > 30s)
      expect(throttledRegistry.exists('session-1', 'hash-1')).toBe(false);
      // session-2 should be cleaned up (created at 10s, TTL 30s, now 61s, 51s > 30s)
      expect(throttledRegistry.exists('session-2', 'hash-2')).toBe(false);
      // session-3 should still exist (created at 50s, TTL 30s, now 61s, 11s < 30s)
      expect(throttledRegistry.exists('session-3', 'hash-3')).toBe(true);
      // session-4 should exist (just created)
      expect(throttledRegistry.exists('session-4', 'hash-4')).toBe(true);
      expect(throttledRegistry.getActiveSessionCount()).toBe(2);
    });
  });
});

/**
 * Unit tests for SessionsService
 * Following TDD - these tests are written FIRST before implementation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  BingoSession,
  BingoSessionPlayer,
  SessionStatus,
} from '../types';
import { SessionsService } from '../services/sessions.service';
import type { SessionsRepository } from '../repositories/sessions.repository';
import { ERROR_MESSAGES } from '../constants/bingo.constants';

// Mock factories
const createMockSession = (overrides: Partial<BingoSession> = {}): BingoSession => ({
  id: 'session-123',
  name: 'Test Session',
  format: '5x5',
  status: 'ACTIVE' as SessionStatus,
  calledNumbers: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

const createMockSessionPlayer = (overrides: Partial<BingoSessionPlayer> = {}): BingoSessionPlayer => ({
  id: 'session-player-123',
  userId: 'user-123',
  sessionId: 'session-123',
  joinedAt: new Date('2024-01-01'),
  ...overrides,
});

const createMockSessionsRepository = (): SessionsRepository => ({
  findById: vi.fn(),
  findPlayerByUserAndSession: vi.fn(),
  getSessionFormat: vi.fn(),
});

describe('SessionsService', () => {
  let sessionsService: SessionsService;
  let mockSessionsRepository: SessionsRepository;

  beforeEach(() => {
    mockSessionsRepository = createMockSessionsRepository();
    sessionsService = new SessionsService(mockSessionsRepository);
  });

  describe('getSessionById', () => {
    it('should return session when it exists', async () => {
      const mockSession = createMockSession();
      vi.mocked(mockSessionsRepository.findById).mockResolvedValue(mockSession);

      const result = await sessionsService.getSessionById('session-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('session-123');
      expect(mockSessionsRepository.findById).toHaveBeenCalledWith('session-123');
    });

    it('should return null when session does not exist', async () => {
      vi.mocked(mockSessionsRepository.findById).mockResolvedValue(null);

      const result = await sessionsService.getSessionById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getSessionPlayer', () => {
    it('should return session player when user is member', async () => {
      const mockPlayer = createMockSessionPlayer();
      vi.mocked(mockSessionsRepository.findPlayerByUserAndSession).mockResolvedValue(mockPlayer);

      const result = await sessionsService.getSessionPlayer('user-123', 'session-123');

      expect(result).toBeDefined();
      expect(result?.userId).toBe('user-123');
      expect(result?.sessionId).toBe('session-123');
    });

    it('should return null when user is not a member', async () => {
      vi.mocked(mockSessionsRepository.findPlayerByUserAndSession).mockResolvedValue(null);

      const result = await sessionsService.getSessionPlayer('user-123', 'session-123');

      expect(result).toBeNull();
    });
  });

  describe('validateSessionMembership', () => {
    it('should return session player when user is a member', async () => {
      const mockPlayer = createMockSessionPlayer();
      vi.mocked(mockSessionsRepository.findPlayerByUserAndSession).mockResolvedValue(mockPlayer);

      const result = await sessionsService.validateSessionMembership('user-123', 'session-123');

      expect(result).toBeDefined();
      expect(result.userId).toBe('user-123');
    });

    it('should throw error when user is not a member', async () => {
      vi.mocked(mockSessionsRepository.findPlayerByUserAndSession).mockResolvedValue(null);

      await expect(
        sessionsService.validateSessionMembership('user-123', 'session-123')
      ).rejects.toThrow(ERROR_MESSAGES.NOT_SESSION_MEMBER);
    });
  });

  describe('getSessionFormat', () => {
    it('should return session format', async () => {
      vi.mocked(mockSessionsRepository.getSessionFormat).mockResolvedValue('5x5');

      const result = await sessionsService.getSessionFormat('session-123');

      expect(result).toBe('5x5');
    });

    it('should return null when session not found', async () => {
      vi.mocked(mockSessionsRepository.getSessionFormat).mockResolvedValue(null);

      const result = await sessionsService.getSessionFormat('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('isSessionActive', () => {
    it('should return true for ACTIVE sessions', async () => {
      const mockSession = createMockSession({ status: 'ACTIVE' as SessionStatus });
      vi.mocked(mockSessionsRepository.findById).mockResolvedValue(mockSession);

      const result = await sessionsService.isSessionActive('session-123');

      expect(result).toBe(true);
    });

    it('should return false for PAUSED sessions', async () => {
      const mockSession = createMockSession({ status: 'PAUSED' as SessionStatus });
      vi.mocked(mockSessionsRepository.findById).mockResolvedValue(mockSession);

      const result = await sessionsService.isSessionActive('session-123');

      expect(result).toBe(false);
    });

    it('should return false for FINISHED sessions', async () => {
      const mockSession = createMockSession({ status: 'FINISHED' as SessionStatus });
      vi.mocked(mockSessionsRepository.findById).mockResolvedValue(mockSession);

      const result = await sessionsService.isSessionActive('session-123');

      expect(result).toBe(false);
    });

    it('should return false when session not found', async () => {
      vi.mocked(mockSessionsRepository.findById).mockResolvedValue(null);

      const result = await sessionsService.isSessionActive('non-existent');

      expect(result).toBe(false);
    });
  });
});

/**
 * Sessions Service
 * Business logic for bingo session operations
 */

import type { BingoSession, BingoSessionPlayer } from '../types';
import type { SessionsRepository } from '../repositories/sessions.repository';
import { ERROR_MESSAGES } from '../constants/bingo.constants';

export class SessionsService {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  /**
   * Get a session by ID
   */
  async getSessionById(sessionId: string): Promise<BingoSession | null> {
    return await this.sessionsRepository.findById(sessionId);
  }

  /**
   * Get a session player by user ID and session ID
   */
  async getSessionPlayer(
    userId: string,
    sessionId: string
  ): Promise<BingoSessionPlayer | null> {
    return await this.sessionsRepository.findPlayerByUserAndSession(userId, sessionId);
  }

  /**
   * Validate that a user is a member of a session
   * Throws an error if the user is not a member
   */
  async validateSessionMembership(
    userId: string,
    sessionId: string
  ): Promise<BingoSessionPlayer> {
    const sessionPlayer = await this.sessionsRepository.findPlayerByUserAndSession(
      userId,
      sessionId
    );

    if (!sessionPlayer) {
      throw new Error(ERROR_MESSAGES.NOT_SESSION_MEMBER);
    }

    return sessionPlayer;
  }

  /**
   * Get the format of a session
   */
  async getSessionFormat(sessionId: string): Promise<string | null> {
    return await this.sessionsRepository.getSessionFormat(sessionId);
  }

  /**
   * Check if a session is active
   */
  async isSessionActive(sessionId: string): Promise<boolean> {
    const session = await this.sessionsRepository.findById(sessionId);
    return session?.status === 'ACTIVE';
  }
}

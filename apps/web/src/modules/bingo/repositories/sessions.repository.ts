/**
 * Sessions Repository Interface and Implementation
 * Handles database operations for bingo sessions
 */

import type { BingoSession, BingoSessionPlayer } from '../types';

/** Repository interface for sessions */
export interface SessionsRepository {
  findById(sessionId: string): Promise<BingoSession | null>;
  findPlayerByUserAndSession(userId: string, sessionId: string): Promise<BingoSessionPlayer | null>;
  getSessionFormat(sessionId: string): Promise<string | null>;
}

/** Prisma client interface for type safety */
interface PrismaClientInterface {
  bingoSession: {
    findUnique: (args: { where: { id: string } }) => Promise<BingoSession | null>;
  };
  bingoSessionPlayer: {
    findUnique: (args: {
      where: { userId_sessionId: { userId: string; sessionId: string } };
    }) => Promise<BingoSessionPlayer | null>;
  };
}

/** Prisma implementation of SessionsRepository */
export class PrismaSessionsRepository implements SessionsRepository {
  constructor(private readonly prisma: PrismaClientInterface) {}

  async findById(sessionId: string): Promise<BingoSession | null> {
    return await this.prisma.bingoSession.findUnique({
      where: { id: sessionId },
    });
  }

  async findPlayerByUserAndSession(
    userId: string,
    sessionId: string
  ): Promise<BingoSessionPlayer | null> {
    return await this.prisma.bingoSessionPlayer.findUnique({
      where: {
        userId_sessionId: { userId, sessionId },
      },
    });
  }

  async getSessionFormat(sessionId: string): Promise<string | null> {
    const session = await this.prisma.bingoSession.findUnique({
      where: { id: sessionId },
    });
    return session?.format ?? null;
  }
}

/**
 * Bingo Types
 * Local type definitions for the bingo module
 * These mirror the Prisma schema and can be used independently
 */

// Enums
export const UserTier = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
} as const;
export type UserTier = typeof UserTier[keyof typeof UserTier];

export const SessionStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
} as const;
export type SessionStatus = typeof SessionStatus[keyof typeof SessionStatus];

export const CardSource = {
  GENERATED: 'GENERATED',
  SCANNED: 'SCANNED',
} as const;
export type CardSource = typeof CardSource[keyof typeof CardSource];

export const CellType = {
  NUMBER: 'NUMBER',
  FREE: 'FREE',
} as const;
export type CellType = typeof CellType[keyof typeof CellType];

// Model interfaces
export interface User {
  id: string;
  email: string;
  tier: UserTier;
  createdAt: Date;
  updatedAt: Date;
}

export interface BingoSession {
  id: string;
  name: string | null;
  format: string;
  status: SessionStatus;
  calledNumbers: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BingoSessionPlayer {
  id: string;
  userId: string;
  sessionId: string;
  joinedAt: Date;
}

export interface BingoCard {
  id: string;
  userId: string | null;
  sessionPlayerId: string | null;
  source: CardSource;
  format: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BingoCell {
  id: string;
  cardId: string;
  index: number;
  value: number | null;
  type: CellType;
  marked: boolean;
}

// Extended interfaces with relations
export interface BingoSessionPlayerWithRelations extends BingoSessionPlayer {
  user?: User;
  session?: BingoSession;
  cards?: BingoCardWithCells[];
}

export interface BingoCardWithCells extends BingoCard {
  cells: BingoCell[];
  user?: User | null;
  sessionPlayer?: BingoSessionPlayer | null;
}

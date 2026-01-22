/**
 * Prisma types and client singleton
 * These types match the Prisma schema and will be compatible with @prisma/client
 * when Prisma generates the client
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

// Full model interfaces with relations
export interface UserWithRelations extends User {
  cards?: BingoCard[];
  sessionPlayers?: BingoSessionPlayer[];
}

export interface BingoSessionWithRelations extends BingoSession {
  players?: BingoSessionPlayerWithRelations[];
}

export interface BingoSessionPlayerWithRelations extends BingoSessionPlayer {
  user?: User;
  session?: BingoSession;
  cards?: BingoCardWithRelations[];
}

export interface BingoCardWithRelations extends BingoCard {
  user?: User | null;
  sessionPlayer?: BingoSessionPlayer | null;
  cells?: BingoCell[];
}

export interface BingoCellWithRelations extends BingoCell {
  card?: BingoCard;
}

// Prisma-compatible operation types
export interface PrismaClientMethods {
  user: {
    findUnique: (args: { where: { id?: string; email?: string }; include?: UserInclude }) => Promise<UserWithRelations | null>;
    findMany: (args?: { where?: Partial<User>; include?: UserInclude }) => Promise<UserWithRelations[]>;
    create: (args: { data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>; include?: UserInclude }) => Promise<UserWithRelations>;
    update: (args: { where: { id: string }; data: Partial<User>; include?: UserInclude }) => Promise<UserWithRelations>;
    delete: (args: { where: { id: string } }) => Promise<User>;
  };
  bingoSession: {
    findUnique: (args: { where: { id: string }; include?: BingoSessionInclude }) => Promise<BingoSessionWithRelations | null>;
    findMany: (args?: { where?: Partial<BingoSession>; include?: BingoSessionInclude }) => Promise<BingoSessionWithRelations[]>;
    create: (args: { data: Omit<BingoSession, 'id' | 'createdAt' | 'updatedAt'>; include?: BingoSessionInclude }) => Promise<BingoSessionWithRelations>;
    update: (args: { where: { id: string }; data: Partial<BingoSession>; include?: BingoSessionInclude }) => Promise<BingoSessionWithRelations>;
    delete: (args: { where: { id: string } }) => Promise<BingoSession>;
  };
  bingoSessionPlayer: {
    findUnique: (args: { where: { id?: string; userId_sessionId?: { userId: string; sessionId: string } }; include?: BingoSessionPlayerInclude }) => Promise<BingoSessionPlayerWithRelations | null>;
    findMany: (args?: { where?: Partial<BingoSessionPlayer>; include?: BingoSessionPlayerInclude }) => Promise<BingoSessionPlayerWithRelations[]>;
    create: (args: { data: Omit<BingoSessionPlayer, 'id' | 'joinedAt'>; include?: BingoSessionPlayerInclude }) => Promise<BingoSessionPlayerWithRelations>;
    delete: (args: { where: { id: string } }) => Promise<BingoSessionPlayer>;
  };
  bingoCard: {
    findUnique: (args: { where: { id: string }; include?: BingoCardInclude }) => Promise<BingoCardWithRelations | null>;
    findMany: (args?: { where?: Partial<BingoCard>; include?: BingoCardInclude }) => Promise<BingoCardWithRelations[]>;
    create: (args: { data: Omit<BingoCard, 'id' | 'createdAt' | 'updatedAt'>; include?: BingoCardInclude }) => Promise<BingoCardWithRelations>;
    update: (args: { where: { id: string }; data: Partial<BingoCard>; include?: BingoCardInclude }) => Promise<BingoCardWithRelations>;
    delete: (args: { where: { id: string } }) => Promise<BingoCard>;
  };
  bingoCell: {
    findUnique: (args: { where: { id?: string; cardId_index?: { cardId: string; index: number } } }) => Promise<BingoCell | null>;
    findMany: (args?: { where?: Partial<BingoCell> }) => Promise<BingoCell[]>;
    create: (args: { data: Omit<BingoCell, 'id'> }) => Promise<BingoCell>;
    createMany: (args: { data: Omit<BingoCell, 'id'>[] }) => Promise<{ count: number }>;
    update: (args: { where: { id?: string; cardId_index?: { cardId: string; index: number } }; data: Partial<BingoCell> }) => Promise<BingoCell>;
    updateMany: (args: { where: Partial<BingoCell>; data: Partial<BingoCell> }) => Promise<{ count: number }>;
    delete: (args: { where: { id: string } }) => Promise<BingoCell>;
  };
  $transaction: <T>(fn: (prisma: PrismaClientMethods) => Promise<T>) => Promise<T>;
  $disconnect: () => Promise<void>;
}

// Include types for relations
export interface UserInclude {
  cards?: boolean | { include?: BingoCardInclude };
  sessionPlayers?: boolean | { include?: BingoSessionPlayerInclude };
}

export interface BingoSessionInclude {
  players?: boolean | { include?: BingoSessionPlayerInclude };
}

export interface BingoSessionPlayerInclude {
  user?: boolean;
  session?: boolean;
  cards?: boolean | { include?: BingoCardInclude };
}

export interface BingoCardInclude {
  user?: boolean;
  sessionPlayer?: boolean | { include?: BingoSessionPlayerInclude };
  cells?: boolean;
}

// Type alias for PrismaClient interface
export type PrismaClient = PrismaClientMethods;

// Lazy-loaded Prisma client singleton
let prismaInstance: PrismaClient | null = null;

/**
 * Get or create the Prisma client instance
 * This function attempts to load @prisma/client dynamically
 * If unavailable, it throws an error
 */
export const getPrismaClient = async (): Promise<PrismaClient> => {
  if (prismaInstance) {
    return prismaInstance;
  }

  try {
    // Attempt to dynamically import @prisma/client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaModule = await import('@prisma/client') as any;
    const RealPrismaClient = prismaModule.PrismaClient || prismaModule.default?.PrismaClient;
    prismaInstance = new RealPrismaClient({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    }) as unknown as PrismaClient;
    return prismaInstance;
  } catch {
    throw new Error(
      'Prisma client not available. Run "pnpm --filter @repo/shared-helpers prisma generate" from the monorepo root, or "pnpm prisma generate" from packages/shared-helpers directory.'
    );
  }
};

/**
 * Set a custom Prisma client instance (for testing)
 */
export const setPrismaClient = (client: PrismaClient): void => {
  prismaInstance = client;
};

/**
 * Reset the Prisma client instance (for testing)
 */
export const resetPrismaClient = (): void => {
  prismaInstance = null;
};

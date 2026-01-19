/**
 * Module Factory
 * Creates instances of modules for API routes
 */

import { createBingoModule, type BingoModule } from '@/modules/bingo/bingo.module';

let bingoModule: BingoModule | null = null;

/** Generic Prisma client interface */
interface PrismaClientInterface {
  bingoCard: unknown;
  bingoCell: unknown;
  bingoSession: unknown;
  bingoSessionPlayer: unknown;
  $transaction: unknown;
}

/**
 * Get or create the bingo module instance
 */
export async function getBingoModule(): Promise<BingoModule> {
  if (bingoModule) {
    return bingoModule;
  }

  // In production, this would get the actual Prisma client
  // For now, we throw an error as the Prisma client needs to be generated
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient() as unknown as PrismaClientInterface;
    bingoModule = createBingoModule(prisma);
    return bingoModule;
  } catch {
    throw new Error(
      'Prisma client not available. Run "pnpm prisma generate" to generate the client.'
    );
  }
}

/**
 * Reset the bingo module (for testing)
 */
export function resetBingoModule(): void {
  bingoModule = null;
}

/**
 * Set a custom bingo module (for testing)
 */
export function setBingoModule(module: BingoModule): void {
  bingoModule = module;
}

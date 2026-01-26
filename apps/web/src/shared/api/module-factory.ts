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

/** Dynamic Prisma module type for runtime import */
interface PrismaModule {
  PrismaClient?: new () => PrismaClientInterface;
  default?: { PrismaClient?: new () => PrismaClientInterface };
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
    const prismaModule = await import('@prisma/client') as unknown as PrismaModule;
    const PrismaClient = prismaModule.PrismaClient ?? prismaModule.default?.PrismaClient;
    if (!PrismaClient) {
      throw new Error('PrismaClient not found in module');
    }
    const prisma = new PrismaClient() as PrismaClientInterface;
    bingoModule = createBingoModule(prisma);
    return bingoModule;
  } catch (error) {
    // Only suggest prisma generate for module-not-found errors
    if (error instanceof Error) {
      const isModuleNotFound =
        error.message.includes("Cannot find module '@prisma/client'") ||
        error.message.includes('PrismaClient not found');
      if (isModuleNotFound) {
        throw new Error(
          'Prisma client not available. Run "pnpm prisma generate" to generate the client.'
        );
      }
      throw error;
    }
    throw new Error('An unknown error occurred while initializing Prisma client.');
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

/**
 * Cells Repository Interface and Implementation
 * Handles database operations for bingo cells
 */

import type { BingoCell } from '../types';

/** Cell update data for bulk operations */
export interface CellUpdate {
  index: number;
  marked: boolean;
}

/** Repository interface for cells */
export interface CellsRepository {
  findByCardId(cardId: string): Promise<BingoCell[]>;
  findByCardIdAndIndex(cardId: string, index: number): Promise<BingoCell | null>;
  updateMarkedStatus(cardId: string, index: number, marked: boolean): Promise<BingoCell>;
  bulkUpdateMarkedStatus(cardId: string, updates: CellUpdate[]): Promise<BingoCell[]>;
  createMany(cells: Omit<BingoCell, 'id'>[]): Promise<{ count: number }>;
}

/** Prisma client interface for type safety */
interface PrismaClientInterface {
  bingoCell: {
    findMany: (args: { where: { cardId: string } }) => Promise<BingoCell[]>;
    findUnique: (args: {
      where: { cardId_index: { cardId: string; index: number } };
    }) => Promise<BingoCell | null>;
    update: (args: {
      where: { cardId_index: { cardId: string; index: number } };
      data: { marked: boolean };
    }) => Promise<BingoCell>;
    createMany: (args: { data: Omit<BingoCell, 'id'>[] }) => Promise<{ count: number }>;
  };
  $transaction: <T>(fn: (tx: PrismaClientInterface) => Promise<T>) => Promise<T>;
}

/** Prisma implementation of CellsRepository */
export class PrismaCellsRepository implements CellsRepository {
  constructor(private readonly prisma: PrismaClientInterface) {}

  async findByCardId(cardId: string): Promise<BingoCell[]> {
    return await this.prisma.bingoCell.findMany({
      where: { cardId },
    });
  }

  async findByCardIdAndIndex(cardId: string, index: number): Promise<BingoCell | null> {
    return await this.prisma.bingoCell.findUnique({
      where: {
        cardId_index: { cardId, index },
      },
    });
  }

  async updateMarkedStatus(cardId: string, index: number, marked: boolean): Promise<BingoCell> {
    return await this.prisma.bingoCell.update({
      where: {
        cardId_index: { cardId, index },
      },
      data: { marked },
    });
  }

  async bulkUpdateMarkedStatus(cardId: string, updates: CellUpdate[]): Promise<BingoCell[]> {
    // Use a transaction to update multiple cells atomically
    const result = await this.prisma.$transaction(async (tx: PrismaClientInterface) => {
      const updatedCells: BingoCell[] = [];

      for (const update of updates) {
        const cell = await tx.bingoCell.update({
          where: {
            cardId_index: { cardId, index: update.index },
          },
          data: { marked: update.marked },
        });
        updatedCells.push(cell);
      }

      return updatedCells;
    });

    return result;
  }

  async createMany(cells: Omit<BingoCell, 'id'>[]): Promise<{ count: number }> {
    return await this.prisma.bingoCell.createMany({
      data: cells,
    });
  }
}

/**
 * Cards Repository Interface and Implementation
 * Handles database operations for bingo cards
 */

import type {
  BingoCard,
  BingoCardWithCells,
} from '../types';

/** Card with cells included - alias for BingoCardWithCells */
export type CardWithCells = BingoCardWithCells;

/** Repository interface for cards */
export interface CardsRepository {
  findById(cardId: string): Promise<CardWithCells | null>;
  findByUserId(userId: string): Promise<CardWithCells[]>;
  findBySessionPlayerId(sessionPlayerId: string): Promise<CardWithCells[]>;
  findStandaloneByUserId(userId: string): Promise<CardWithCells[]>;
  create(data: Omit<BingoCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<BingoCard>;
  update(cardId: string, data: Partial<BingoCard>): Promise<BingoCard>;
  delete(cardId: string): Promise<void>;
}

/** Prisma client interface for type safety */
interface PrismaClientInterface {
  bingoCard: {
    findUnique: (args: {
      where: { id: string };
      include?: { cells?: boolean; sessionPlayer?: boolean };
    }) => Promise<CardWithCells | null>;
    findMany: (args: {
      where: Partial<BingoCard>;
      include?: { cells?: boolean };
    }) => Promise<CardWithCells[]>;
    create: (args: { data: Omit<BingoCard, 'id' | 'createdAt' | 'updatedAt'> }) => Promise<BingoCard>;
    update: (args: { where: { id: string }; data: Partial<BingoCard> }) => Promise<BingoCard>;
    delete: (args: { where: { id: string } }) => Promise<BingoCard>;
  };
}

/** Prisma implementation of CardsRepository */
export class PrismaCardsRepository implements CardsRepository {
  constructor(private readonly prisma: PrismaClientInterface) {}

  async findById(cardId: string): Promise<CardWithCells | null> {
    const card = await this.prisma.bingoCard.findUnique({
      where: { id: cardId },
      include: { cells: true, sessionPlayer: true },
    });

    return card;
  }

  async findByUserId(userId: string): Promise<CardWithCells[]> {
    const cards = await this.prisma.bingoCard.findMany({
      where: { userId },
      include: { cells: true },
    });

    return cards;
  }

  async findBySessionPlayerId(sessionPlayerId: string): Promise<CardWithCells[]> {
    const cards = await this.prisma.bingoCard.findMany({
      where: { sessionPlayerId },
      include: { cells: true },
    });

    return cards;
  }

  async findStandaloneByUserId(userId: string): Promise<CardWithCells[]> {
    const cards = await this.prisma.bingoCard.findMany({
      where: {
        userId,
        sessionPlayerId: null,
        source: 'SCANNED',
      },
      include: { cells: true },
    });

    return cards;
  }

  async create(data: Omit<BingoCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<BingoCard> {
    return await this.prisma.bingoCard.create({ data });
  }

  async update(cardId: string, data: Partial<BingoCard>): Promise<BingoCard> {
    return await this.prisma.bingoCard.update({
      where: { id: cardId },
      data,
    });
  }

  async delete(cardId: string): Promise<void> {
    await this.prisma.bingoCard.delete({
      where: { id: cardId },
    });
  }
}

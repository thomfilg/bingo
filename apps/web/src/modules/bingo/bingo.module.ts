/**
 * Bingo Module
 * Factory for creating bingo-related services and repositories
 */

import { CardsService } from './services/cards.service';
import { CellsService } from './services/cells.service';
import { SessionsService } from './services/sessions.service';
import {
  PrismaCardsRepository,
  PrismaCellsRepository,
  PrismaSessionsRepository,
  type CardsRepository,
  type CellsRepository,
  type SessionsRepository,
} from './repositories';

export interface BingoModule {
  cardsService: CardsService;
  cellsService: CellsService;
  sessionsService: SessionsService;
  cardsRepository: CardsRepository;
  cellsRepository: CellsRepository;
  sessionsRepository: SessionsRepository;
}

/** Generic Prisma client interface */
interface PrismaClientInterface {
  bingoCard: unknown;
  bingoCell: unknown;
  bingoSession: unknown;
  bingoSessionPlayer: unknown;
  $transaction: unknown;
}

/**
 * Create a new instance of the bingo module with all services and repositories
 */
export function createBingoModule(prisma: PrismaClientInterface): BingoModule {
  // Create repositories - cast to any for now as the exact Prisma types are generated
  const cardsRepository = new PrismaCardsRepository(prisma as never);
  const cellsRepository = new PrismaCellsRepository(prisma as never);
  const sessionsRepository = new PrismaSessionsRepository(prisma as never);

  // Create services
  const cardsService = new CardsService(cardsRepository, cellsRepository);
  const cellsService = new CellsService(cellsRepository);
  const sessionsService = new SessionsService(sessionsRepository);

  return {
    cardsService,
    cellsService,
    sessionsService,
    cardsRepository,
    cellsRepository,
    sessionsRepository,
  };
}

/**
 * Create a bingo module with custom repositories (for testing)
 */
export function createBingoModuleWithRepositories(
  cardsRepository: CardsRepository,
  cellsRepository: CellsRepository,
  sessionsRepository: SessionsRepository
): BingoModule {
  const cardsService = new CardsService(cardsRepository, cellsRepository);
  const cellsService = new CellsService(cellsRepository);
  const sessionsService = new SessionsService(sessionsRepository);

  return {
    cardsService,
    cellsService,
    sessionsService,
    cardsRepository,
    cellsRepository,
    sessionsRepository,
  };
}

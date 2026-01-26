/**
 * Cards Service
 * Business logic for bingo card operations
 */

import type {
  BingoCell,
  BingoSessionPlayer,
  User,
} from '../types';
import type { CardsRepository } from '../repositories/cards.repository';
import type { CellsRepository, CellUpdate } from '../repositories/cells.repository';
import type {
  GetSessionCardsResponse,
  GetStandaloneCardsResponse,
  BingoCardDTO,
  StandaloneCardDTO,
  GetCardDetailsResponse,
  BingoCellDTO,
} from '../dto/get-cards.dto';
import type { MarkCellResponse } from '../dto/mark-cell.dto';
import type { BulkMarkCellsResponse } from '../dto/bulk-mark.dto';
import { ERROR_MESSAGES, MAX_BULK_CELLS } from '../constants/bingo.constants';

interface CardWithOwnership {
  userId: string | null;
  sessionPlayer?: { userId: string } | null;
}

export class CardsService {
  constructor(
    private readonly cardsRepository: CardsRepository,
    private readonly cellsRepository: CellsRepository
  ) {}

  /**
   * Validate that a user owns a card either directly or through a session player
   * @throws Error if the user does not own the card
   */
  private validateCardOwnership(card: CardWithOwnership, userId: string): void {
    const isDirectOwner = card.userId === userId;
    const isSessionOwner = card.sessionPlayer?.userId === userId;

    if (!isDirectOwner && !isSessionOwner) {
      throw new Error(ERROR_MESSAGES.NOT_CARD_OWNER);
    }
  }

  /**
   * Get a card by ID with ownership validation
   */
  async getCardById(cardId: string, userId: string): Promise<GetCardDetailsResponse | null> {
    const card = await this.cardsRepository.findById(cardId);

    if (!card) {
      return null;
    }

    // Validate ownership
    this.validateCardOwnership(card, userId);

    const sortedCells = this.sortCellsByIndex(card.cells);

    return {
      id: card.id,
      format: card.format,
      cells: sortedCells.map(cell => this.transformCellToDTO(cell)),
      createdAt: card.createdAt.toISOString(),
      sessionId: card.sessionPlayer?.sessionId ?? undefined,
    };
  }

  /**
   * Get standalone scanned cards for a user (Premium only)
   */
  async getStandaloneCards(user: User): Promise<GetStandaloneCardsResponse> {
    if (user.tier !== 'PREMIUM') {
      throw new Error(ERROR_MESSAGES.PREMIUM_REQUIRED);
    }

    const cards = await this.cardsRepository.findStandaloneByUserId(user.id);

    const standaloneCards: StandaloneCardDTO[] = cards.map(card => ({
      id: card.id,
      format: card.format,
      cells: this.sortCellsByIndex(card.cells).map(cell => this.transformCellToDTO(cell)),
      createdAt: card.createdAt.toISOString(),
    }));

    return { cards: standaloneCards };
  }

  /**
   * Get cards for a session
   */
  async getSessionCards(
    sessionId: string,
    sessionPlayer: BingoSessionPlayer | null,
    sessionFormat: string
  ): Promise<GetSessionCardsResponse> {
    if (!sessionPlayer) {
      throw new Error(ERROR_MESSAGES.NOT_SESSION_MEMBER);
    }

    const cards = await this.cardsRepository.findBySessionPlayerId(sessionPlayer.id);

    const cardDTOs: BingoCardDTO[] = cards.map(card => ({
      id: card.id,
      cells: this.sortCellsByIndex(card.cells).map(cell => this.transformCellToDTO(cell)),
    }));

    return {
      sessionId,
      format: sessionFormat,
      cards: cardDTOs,
    };
  }

  /**
   * Mark or unmark a single cell
   */
  async markCell(
    cardId: string,
    cellIndex: number,
    marked: boolean,
    userId: string
  ): Promise<MarkCellResponse> {
    // Get the card to validate ownership
    const card = await this.cardsRepository.findById(cardId);

    if (!card) {
      throw new Error(ERROR_MESSAGES.CARD_NOT_FOUND);
    }

    // Validate ownership (includes both direct and session player ownership)
    this.validateCardOwnership(card, userId);

    // Get the cell
    const cell = await this.cellsRepository.findByCardIdAndIndex(cardId, cellIndex);

    if (!cell) {
      throw new Error(ERROR_MESSAGES.CELL_NOT_FOUND);
    }

    // Check if trying to unmark a free space
    if (!marked && cell.type === 'FREE') {
      throw new Error(ERROR_MESSAGES.CANNOT_UNMARK_FREE_SPACE);
    }

    // Update the cell
    const updatedCell = await this.cellsRepository.updateMarkedStatus(cardId, cellIndex, marked);

    return {
      cardId,
      cellIndex,
      marked: updatedCell.marked,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Bulk mark/unmark cells
   * @param prefetchedCard Optional pre-fetched card to avoid redundant DB query
   */
  async bulkMarkCells(
    cardId: string,
    updates: CellUpdate[],
    userId: string,
    prefetchedCard?: { userId: string | null; cells: BingoCell[]; sessionPlayer?: { userId: string } | null }
  ): Promise<BulkMarkCellsResponse> {
    // Validate bulk operation size limit
    if (updates.length > MAX_BULK_CELLS) {
      throw new Error(ERROR_MESSAGES.BULK_LIMIT_EXCEEDED);
    }

    // Use pre-fetched card or fetch from repository
    const card = prefetchedCard ?? await this.cardsRepository.findById(cardId);

    if (!card) {
      throw new Error(ERROR_MESSAGES.CARD_NOT_FOUND);
    }

    // Validate ownership (includes both direct and session player ownership)
    this.validateCardOwnership(card, userId);

    // Create a map of cells by index for quick lookup
    const cellMap = new Map(card.cells.map(cell => [cell.index, cell]));

    // Filter out updates that try to unmark free spaces
    const validUpdates = updates.filter(update => {
      const cell = cellMap.get(update.index);
      if (!cell) return false;
      // Skip if trying to unmark a free space
      if (!update.marked && cell.type === 'FREE') return false;
      return true;
    });

    // Perform bulk update
    const updatedCells = await this.cellsRepository.bulkUpdateMarkedStatus(cardId, validUpdates);

    return {
      cardId,
      updatedCells: updatedCells.map(cell => ({
        index: cell.index,
        marked: cell.marked,
      })),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Transform a BingoCell to a BingoCellDTO
   */
  private transformCellToDTO(cell: BingoCell): BingoCellDTO {
    return {
      value: cell.value,
      type: cell.type === 'FREE' ? 'free' : 'number',
      marked: cell.marked,
    };
  }

  /**
   * Sort cells by index in ascending order
   */
  private sortCellsByIndex(cells: BingoCell[]): BingoCell[] {
    return [...cells].sort((a, b) => a.index - b.index);
  }
}

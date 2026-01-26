/**
 * Cells Service
 * Business logic for bingo cell operations
 */

import type { BingoCell } from '../types';
import type { CellsRepository } from '../repositories/cells.repository';
import type { BingoCellDTO } from '../dto/get-cards.dto';

export class CellsService {
  constructor(private readonly cellsRepository: CellsRepository) {}

  /**
   * Get all cells for a card
   */
  async getCellsByCardId(cardId: string): Promise<BingoCell[]> {
    return await this.cellsRepository.findByCardId(cardId);
  }

  /**
   * Get a specific cell by card ID and index
   */
  async getCellByIndex(cardId: string, index: number): Promise<BingoCell | null> {
    return await this.cellsRepository.findByCardIdAndIndex(cardId, index);
  }

  /**
   * Check if a cell is a free space
   */
  isFreeSpace(cell: BingoCell): boolean {
    return cell.type === 'FREE';
  }

  /**
   * Check if a cell can be unmarked
   * Free spaces cannot be unmarked
   */
  canUnmark(cell: BingoCell): boolean {
    return cell.type !== 'FREE';
  }

  /**
   * Transform a BingoCell to a BingoCellDTO
   */
  transformCellToDTO(cell: BingoCell): BingoCellDTO {
    return {
      value: cell.value,
      type: cell.type === 'FREE' ? 'free' : 'number',
      marked: cell.marked,
    };
  }

  /**
   * Sort cells by index in ascending order
   */
  sortCellsByIndex(cells: BingoCell[]): BingoCell[] {
    return [...cells].sort((a, b) => a.index - b.index);
  }

  /**
   * Transform multiple cells to DTOs, sorted by index
   */
  transformCellsToDTOs(cells: BingoCell[]): BingoCellDTO[] {
    const sortedCells = this.sortCellsByIndex(cells);
    return sortedCells.map(cell => this.transformCellToDTO(cell));
  }
}

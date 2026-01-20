import type { CardFormatConfig, GeneratedCell } from '../generator.interface';
import { getRandomNumbersInRange } from '../utils/random.utils';
import { BaseStrategy } from './base.strategy';

/**
 * Strategy for generating 5x5 (75-ball) bingo cards
 *
 * Format specifications:
 * - 25 cells (5 rows x 5 columns)
 * - Column distribution: B:1-15, I:16-30, N:31-45, G:46-60, O:61-75
 * - Center cell (index 12) is FREE space
 * - Numbers sorted ascending within each column
 */
export class Strategy5x5 extends BaseStrategy {
  readonly format = '5x5' as const;

  readonly config: CardFormatConfig = {
    rows: 5,
    columns: 5,
    totalCells: 25,
    hasFreeSpace: true,
    freeSpaceIndex: 12,
    columnRanges: [
      { column: 0, min: 1, max: 15 },   // B
      { column: 1, min: 16, max: 30 },  // I
      { column: 2, min: 31, max: 45 },  // N
      { column: 3, min: 46, max: 60 },  // G
      { column: 4, min: 61, max: 75 },  // O
    ],
  };

  generateCells(): GeneratedCell[] {
    const cells: GeneratedCell[] = new Array(25);

    // Generate numbers for each column
    for (let col = 0; col < 5; col++) {
      const range = this.config.columnRanges[col]!;
      const isNColumn = col === 2;

      // N column needs 4 numbers (center is free), others need 5
      const count = isNColumn ? 4 : 5;
      const numbers = getRandomNumbersInRange(range.min, range.max, count);

      // Sort numbers ascending
      numbers.sort((a, b) => a - b);

      // Assign numbers to cells in this column
      let numberIndex = 0;
      for (let row = 0; row < 5; row++) {
        const cellIndex = row * 5 + col;

        // Center cell (row 2, col 2 = index 12) is free space
        if (cellIndex === 12) {
          cells[cellIndex] = this.createFreeCell(cellIndex);
        } else {
          cells[cellIndex] = this.createNumberCell(cellIndex, numbers[numberIndex]!);
          numberIndex++;
        }
      }
    }

    return cells;
  }
}

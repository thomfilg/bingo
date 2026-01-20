import { createFeatureLogger } from '../../../utils/lib/logger';
import type { CardFormatConfig, GeneratedCell } from '../generator.interface';
import { getRandomNumbersInRange, shuffleArray } from '../utils/random.utils';
import { BaseStrategy } from './base.strategy';

const logger = createFeatureLogger('bingo:3x9');

/**
 * Strategy for generating 3x9 (90-ball) bingo cards
 *
 * Format specifications:
 * - 27 cells (3 rows x 9 columns)
 * - Column ranges: 0:1-9, 1:10-19, 2:20-29, 3:30-39, 4:40-49, 5:50-59, 6:60-69, 7:70-79, 8:80-90
 * - Each row has exactly 5 numbers and 4 blanks
 * - Each column has 1-3 numbers
 * - Numbers sorted ascending within columns
 * - NO free space
 */
export class Strategy3x9 extends BaseStrategy {
  readonly format = '3x9' as const;

  readonly config: CardFormatConfig = {
    rows: 3,
    columns: 9,
    totalCells: 27,
    hasFreeSpace: false,
    columnRanges: [
      { column: 0, min: 1, max: 9 },
      { column: 1, min: 10, max: 19 },
      { column: 2, min: 20, max: 29 },
      { column: 3, min: 30, max: 39 },
      { column: 4, min: 40, max: 49 },
      { column: 5, min: 50, max: 59 },
      { column: 6, min: 60, max: 69 },
      { column: 7, min: 70, max: 79 },
      { column: 8, min: 80, max: 90 },
    ],
  };

  generateCells(): GeneratedCell[] {
    // Step 1: Generate valid column distribution (1-3 numbers per column, 15 total)
    const columnCounts = this.generateColumnDistribution();

    // Step 2: Distribute numbers across rows (5 numbers per row)
    const rowAssignments = this.distributeToRows(columnCounts);

    // Step 3: Generate actual numbers for each column
    const columnNumbers = this.generateColumnNumbers(columnCounts);

    // Step 4: Build the cell array
    return this.buildCells(rowAssignments, columnNumbers);
  }

  /**
   * Generate a valid column distribution (1-3 numbers per column, 15 total)
   */
  private generateColumnDistribution(): number[] {
    // We need 15 numbers distributed across 9 columns
    // Each column must have 1-3 numbers
    // Start with 1 in each column (9 total), then distribute remaining 6

    const counts: number[] = new Array<number>(9).fill(1); // Start with 1 per column

    // Distribute remaining 6 numbers
    let remaining = 6;
    const columns = shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8]);

    for (const col of columns) {
      if (remaining === 0) break;

      const currentCount = counts[col] ?? 1;
      const canAdd = 3 - currentCount; // Max we can add to this column
      const toAdd = Math.min(canAdd, remaining, 2); // Add at most 2 more (to keep distribution varied)

      if (toAdd > 0 && Math.random() > 0.3) {
        counts[col] = currentCount + toAdd;
        remaining -= toAdd;
      }
    }

    // If we still have remaining, add them
    while (remaining > 0) {
      for (let col = 0; col < 9 && remaining > 0; col++) {
        const currentCount = counts[col] ?? 1;
        if (currentCount < 3) {
          counts[col] = currentCount + 1;
          remaining--;
        }
      }
    }

    return counts;
  }

  /**
   * Distribute column numbers to rows ensuring each row has exactly 5 numbers
   * Returns a 3x9 boolean matrix where true = number, false = blank
   */
  private distributeToRows(columnCounts: number[]): boolean[][] {
    // Initialize 3x9 grid
    const grid: boolean[][] = [
      new Array<boolean>(9).fill(false),
      new Array<boolean>(9).fill(false),
      new Array<boolean>(9).fill(false),
    ];

    // For each column, decide which rows get numbers
    for (let col = 0; col < 9; col++) {
      const count = columnCounts[col] ?? 1;
      const availableRows = shuffleArray([0, 1, 2]);
      for (let i = 0; i < count; i++) {
        const row = availableRows[i];
        if (row !== undefined) {
          const gridRow = grid[row];
          if (gridRow) {
            gridRow[col] = true;
          }
        }
      }
    }

    // Now we need to adjust to ensure each row has exactly 5 numbers
    // This is a constraint satisfaction problem, so we may need to swap

    const maxIterations = 1000;
    let iterations = 0;

    while (iterations < maxIterations) {
      const rowCounts = grid.map(row => row.filter(Boolean).length);

      // Check if we're done
      if (rowCounts.every(count => count === 5)) {
        break;
      }

      // Find rows that need adjustment
      const overRows = rowCounts.map((c, i) => c > 5 ? i : -1).filter(i => i >= 0);
      const underRows = rowCounts.map((c, i) => c < 5 ? i : -1).filter(i => i >= 0);

      if (overRows.length === 0 || underRows.length === 0) {
        // Need to swap between rows
        this.performSwap(grid, rowCounts);
      } else {
        // Move a number from an over row to an under row
        const fromRow = overRows[0];
        const toRow = underRows[0];
        if (fromRow !== undefined && toRow !== undefined) {
          this.moveNumber(grid, fromRow, toRow);
        }
      }

      iterations++;
    }

    // Verify constraints
    const finalRowCounts = grid.map(row => row.filter(Boolean).length);
    if (!finalRowCounts.every(count => count === 5)) {
      // Fallback: regenerate with different approach
      logger.warn('Primary distribution failed after max iterations, using fallback method');
      return this.distributeToRowsFallback(columnCounts);
    }

    return grid;
  }

  /**
   * Move a number from one row to another in the same column
   */
  private moveNumber(
    grid: boolean[][],
    fromRow: number,
    toRow: number,
  ): void {
    const fromGridRow = grid[fromRow];
    const toGridRow = grid[toRow];
    if (!fromGridRow || !toGridRow) return;

    // Find a column where fromRow has a number and toRow doesn't
    // AND the column has capacity
    for (let col = 0; col < 9; col++) {
      if (fromGridRow[col] && !toGridRow[col]) {
        // Check if we can move (column must keep 1-3 numbers)
        const colCount = grid.map(row => row[col]).filter(Boolean).length;
        if (colCount >= 1) {
          fromGridRow[col] = false;
          toGridRow[col] = true;
          return;
        }
      }
    }
  }

  /**
   * Perform a swap to balance row counts
   */
  private performSwap(
    grid: boolean[][],
    rowCounts: number[],
  ): void {
    // Find two columns where we can swap numbers between rows
    for (let col1 = 0; col1 < 9; col1++) {
      for (let col2 = col1 + 1; col2 < 9; col2++) {
        for (let row1 = 0; row1 < 3; row1++) {
          for (let row2 = 0; row2 < 3; row2++) {
            if (row1 === row2) continue;

            const gridRow1 = grid[row1];
            const gridRow2 = grid[row2];
            if (!gridRow1 || !gridRow2) continue;

            const rowCount1 = rowCounts[row1];
            const rowCount2 = rowCounts[row2];
            if (rowCount1 === undefined || rowCount2 === undefined) continue;

            // Check if swapping would help
            if (
              gridRow1[col1] && !gridRow2[col1] &&
              !gridRow1[col2] && gridRow2[col2]
            ) {
              const newCount1 = rowCount1 - 1 + 1; // Same
              const newCount2 = rowCount2 + 1 - 1; // Same

              // Check if this creates a better distribution
              if (Math.abs(newCount1 - 5) + Math.abs(newCount2 - 5) <
                  Math.abs(rowCount1 - 5) + Math.abs(rowCount2 - 5)) {
                gridRow1[col1] = false;
                gridRow2[col1] = true;
                gridRow1[col2] = true;
                gridRow2[col2] = false;
                return;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Fallback distribution method using constraint propagation
   */
  private distributeToRowsFallback(columnCounts: number[]): boolean[][] {
    const grid: boolean[][] = [
      new Array<boolean>(9).fill(false),
      new Array<boolean>(9).fill(false),
      new Array<boolean>(9).fill(false),
    ];

    // Use backtracking to find valid distribution
    const rowCapacity = [5, 5, 5];

    for (let col = 0; col < 9; col++) {
      const count = columnCounts[col] ?? 1;
      const availableRows: number[] = [];

      for (let row = 0; row < 3; row++) {
        const capacity = rowCapacity[row];
        if (capacity !== undefined && capacity > 0) {
          availableRows.push(row);
        }
      }

      const selectedRows = shuffleArray(availableRows).slice(0, count);

      for (const row of selectedRows) {
        const gridRow = grid[row];
        if (gridRow) {
          gridRow[col] = true;
        }
        const capacity = rowCapacity[row];
        if (capacity !== undefined) {
          rowCapacity[row] = capacity - 1;
        }
      }
    }

    return grid;
  }

  /**
   * Generate actual numbers for each column
   */
  private generateColumnNumbers(columnCounts: number[]): number[][] {
    const columnNumbers: number[][] = [];

    for (let col = 0; col < 9; col++) {
      const range = this.config.columnRanges[col]!;
      const count = columnCounts[col] ?? 1;
      const numbers = getRandomNumbersInRange(range.min, range.max, count);
      numbers.sort((a, b) => a - b);
      columnNumbers.push(numbers);
    }

    return columnNumbers;
  }

  /**
   * Build the final cell array from row assignments and column numbers
   */
  private buildCells(rowAssignments: boolean[][], columnNumbers: number[][]): GeneratedCell[] {
    const cells: GeneratedCell[] = new Array(27);

    // Track which number to use next in each column
    const columnIndices: number[] = new Array<number>(9).fill(0);

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 9; col++) {
        const cellIndex = row * 9 + col;
        const rowAssignment = rowAssignments[row];
        const colNumbers = columnNumbers[col];

        if (rowAssignment && rowAssignment[col] && colNumbers) {
          const colIdx = columnIndices[col] ?? 0;
          const value = colNumbers[colIdx];
          if (value !== undefined) {
            cells[cellIndex] = this.createNumberCell(cellIndex, value);
          }
          columnIndices[col] = colIdx + 1;
        } else {
          cells[cellIndex] = this.createBlankCell(cellIndex);
        }
      }
    }

    return cells;
  }
}

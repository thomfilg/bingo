import type { BingoFormat } from '../BingoCard.types';

/**
 * Calculates the row and column position of a cell based on its index.
 *
 * @param index - The cell index (0-based)
 * @param format - The bingo format
 * @returns Object with row and column (0-based)
 */
export function getCellPosition(
  index: number,
  format: BingoFormat
): { row: number; column: number } {
  return {
    row: Math.floor(index / format.columns),
    column: index % format.columns,
  };
}

/**
 * Calculates the cell index from row and column position.
 *
 * @param row - The row (0-based)
 * @param column - The column (0-based)
 * @param format - The bingo format
 * @returns The cell index
 */
export function getCellIndex(
  row: number,
  column: number,
  format: BingoFormat
): number {
  return row * format.columns + column;
}

/**
 * Calculates responsive cell size based on format and container constraints.
 *
 * @param format - The bingo format
 * @param containerWidth - Available container width in pixels
 * @param minCellSize - Minimum cell size in pixels (default: 40)
 * @param maxCellSize - Maximum cell size in pixels (default: 80)
 * @returns Optimal cell size in pixels
 */
export function calculateCellSize(
  format: BingoFormat,
  containerWidth: number,
  minCellSize = 40,
  maxCellSize = 80
): number {
  const gapSize = 4; // Gap between cells
  const totalGaps = (format.columns - 1) * gapSize;
  const availableWidth = containerWidth - totalGaps;
  const calculatedSize = Math.floor(availableWidth / format.columns);

  return Math.max(minCellSize, Math.min(maxCellSize, calculatedSize));
}

/**
 * Generates CSS grid template columns string for the given format.
 *
 * @param format - The bingo format
 * @returns CSS grid-template-columns value
 */
export function getGridTemplateColumns(format: BingoFormat): string {
  return `repeat(${format.columns}, 1fr)`;
}

import type { BingoFormat } from '../BingoCard.types';

/**
 * Regular expression to match format strings like "5x5", "3x9", "4X4".
 * Captures rows and columns as separate groups.
 */
const FORMAT_REGEX = /^(\d+)[xX](\d+)$/;

/**
 * Default format when parsing fails.
 */
const DEFAULT_FORMAT: BingoFormat = { rows: 5, columns: 5 };

/**
 * Parses a format string (e.g., "5x5", "3x9") into a BingoFormat object.
 *
 * @param formatString - The format string from the backend (e.g., "5x5")
 * @returns BingoFormat object with rows and columns
 *
 * @example
 * ```ts
 * parseFormat("5x5") // { rows: 5, columns: 5 }
 * parseFormat("3x9") // { rows: 3, columns: 9 }
 * parseFormat("invalid") // { rows: 5, columns: 5 } (default)
 * ```
 */
export function parseFormat(formatString: string): BingoFormat {
  const match = formatString.match(FORMAT_REGEX);

  if (!match) {
    // Invalid format string - return default
    return DEFAULT_FORMAT;
  }

  const rows = parseInt(match[1], 10);
  const columns = parseInt(match[2], 10);

  // Defensive check for NaN (unlikely given regex validation, but safe)
  if (Number.isNaN(rows) || Number.isNaN(columns)) {
    return DEFAULT_FORMAT;
  }

  if (rows <= 0 || columns <= 0) {
    // Invalid dimensions - return default
    return DEFAULT_FORMAT;
  }

  return { rows, columns };
}

/**
 * Validates that a format matches the expected cell count.
 *
 * @param format - The parsed format
 * @param cellCount - The number of cells in the card
 * @returns True if the format matches the cell count
 */
export function validateFormat(format: BingoFormat, cellCount: number): boolean {
  return format.rows * format.columns === cellCount;
}

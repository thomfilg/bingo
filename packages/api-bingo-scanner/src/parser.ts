import type { ScannerOptions, CellResult, STANDARD_BINGO_RANGES } from './types';
import { DEFAULT_OPTIONS } from './types';

/**
 * Common OCR misreads and their corrections
 */
const OCR_CORRECTIONS: Record<string, string> = {
  O: '0',
  o: '0',
  I: '1',
  l: '1',
  '|': '1',
  S: '5',
  s: '5',
  B: '8',
  Z: '2',
  z: '2',
  G: '6',
  g: '9',
  q: '9',
  A: '4',
};

/**
 * Patterns that indicate a FREE space
 */
const FREE_SPACE_PATTERNS = [
  /free/i,
  /\*+/,
  /star/i,
  /centro/i,
  /libre/i,
  /gratis/i,
];

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Cleans OCR text by applying common corrections
 */
export function cleanOcrText(text: string): string {
  let cleaned = text.trim();

  // Remove common non-numeric characters except those that might be misread numbers
  cleaned = cleaned.replace(/[^0-9OoIlSsBZzGgqA|]/g, '');

  // Apply OCR corrections
  for (const [wrong, correct] of Object.entries(OCR_CORRECTIONS)) {
    cleaned = cleaned.replace(new RegExp(escapeRegex(wrong), 'g'), correct);
  }

  return cleaned;
}

/**
 * Extracts a number from OCR text
 * @returns The extracted number or null if not found/invalid
 */
export function extractNumber(
  rawText: string,
  options: Pick<ScannerOptions, 'numberRange'> = {}
): number | null {
  const range = options.numberRange ?? DEFAULT_OPTIONS.numberRange;

  // Check if it's a FREE space
  if (isFreeSpace(rawText)) {
    return null;
  }

  // Clean the text
  const cleaned = cleanOcrText(rawText);

  // Try to extract a number
  const match = cleaned.match(/\d+/);
  if (!match) {
    return null;
  }

  const num = parseInt(match[0], 10);

  // Validate the number is within the expected range
  if (num < range.min || num > range.max) {
    // Try to fix common issues like leading/trailing digits
    const digits = match[0];
    if (digits.length > 2) {
      // Try first two digits
      const firstTwo = parseInt(digits.slice(0, 2), 10);
      if (firstTwo >= range.min && firstTwo <= range.max) {
        return firstTwo;
      }
      // Try last two digits
      const lastTwo = parseInt(digits.slice(-2), 10);
      if (lastTwo >= range.min && lastTwo <= range.max) {
        return lastTwo;
      }
    }
    return null;
  }

  return num;
}

/**
 * Checks if the text indicates a FREE space
 */
export function isFreeSpace(text: string): boolean {
  const trimmed = text.trim();

  // Check against known FREE space patterns
  for (const pattern of FREE_SPACE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }

  // Empty or very short text with no digits might be a FREE space marker
  if (trimmed.length === 0 || (trimmed.length < 3 && !/\d/.test(trimmed))) {
    return true;
  }

  return false;
}

/**
 * Validates a number against the expected range for a specific column
 * Uses standard bingo column rules (B=1-15, I=16-30, N=31-45, G=46-60, O=61-75)
 */
export function validateNumberForColumn(
  number: number,
  column: number,
  ranges: typeof STANDARD_BINGO_RANGES
): boolean {
  const columnLetters = ['B', 'I', 'N', 'G', 'O'];
  const columnLetter = columnLetters[column];

  if (!columnLetter || !ranges[columnLetter]) {
    return true; // No validation if column is out of range
  }

  const range = ranges[columnLetter];
  return number >= range.min && number <= range.max;
}

/**
 * Creates a CellResult from OCR output
 */
export function createCellResult(
  rawText: string,
  confidence: number,
  row: number,
  col: number,
  options: Pick<ScannerOptions, 'numberRange' | 'hasFreeSpace' | 'gridSize'> = {}
): CellResult {
  const gridSize = options.gridSize ?? DEFAULT_OPTIONS.gridSize;
  const hasFreeSpace = options.hasFreeSpace ?? DEFAULT_OPTIONS.hasFreeSpace;

  // Check if this is the center cell and should be FREE
  const isCenterCell =
    hasFreeSpace &&
    row === Math.floor(gridSize.rows / 2) &&
    col === Math.floor(gridSize.cols / 2);

  const detectedFreeSpace = isFreeSpace(rawText);
  const shouldBeFreeSpace = isCenterCell || detectedFreeSpace;

  if (shouldBeFreeSpace) {
    return {
      number: null,
      isFreeSpace: true,
      confidence,
      rawText,
      position: { row, col },
    };
  }

  const number = extractNumber(rawText, options);

  return {
    number,
    isFreeSpace: false,
    confidence,
    rawText,
    position: { row, col },
  };
}

/**
 * Parses a grid of raw OCR results into structured cell results
 */
export function parseGrid(
  ocrResults: Array<{ text: string; confidence: number; row: number; col: number }>,
  options: ScannerOptions = {}
): CellResult[] {
  return ocrResults.map((result) =>
    createCellResult(result.text, result.confidence, result.row, result.col, options)
  );
}

/**
 * Converts an array of CellResults to a 2D grid
 */
export function cellsToGrid(cells: CellResult[], gridSize: { rows: number; cols: number }): (number | null)[][] {
  const grid: (number | null)[][] = Array(gridSize.rows)
    .fill(null)
    .map(() => Array(gridSize.cols).fill(null) as (number | null)[]);

  for (const cell of cells) {
    const { row, col } = cell.position;
    const gridRow = grid[row];
    if (row < gridSize.rows && col < gridSize.cols && gridRow) {
      gridRow[col] = cell.number;
    }
  }

  return grid;
}

/**
 * Flattens a grid to an array in reading order
 */
export function gridToArray(grid: (number | null)[][]): (number | null)[] {
  return grid.flat();
}

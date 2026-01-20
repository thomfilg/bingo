/**
 * @repo/api-bingo-scanner
 *
 * A library to scan bingo cards and detect numbers using OCR.
 *
 * @example
 * Simple usage - get numbers as an array:
 * ```typescript
 * import { scanBingoCard } from '@repo/api-bingo-scanner';
 *
 * const numbers = await scanBingoCard('./bingo-card.png');
 * console.log(numbers); // [5, 22, 34, null, 61, 12, ...] (null = FREE space)
 * ```
 *
 * @example
 * Detailed results with confidence scores:
 * ```typescript
 * import { scanBingoCardDetailed } from '@repo/api-bingo-scanner';
 *
 * const result = await scanBingoCardDetailed('./bingo-card.png');
 * console.log(result.numbers);    // Array of numbers
 * console.log(result.grid);       // 2D grid representation
 * console.log(result.confidence); // Overall confidence score
 * ```
 *
 * @example
 * Scanning multiple cards from a single image:
 * ```typescript
 * import { scanMultipleBingoCards } from '@repo/api-bingo-scanner';
 *
 * // Scan an image containing 6 cards arranged in 2 rows x 3 columns
 * const cards = await scanMultipleBingoCards('./multi-cards.png', {
 *   cardLayout: { rows: 2, cols: 3 }
 * });
 * console.log(cards.length);  // 6
 * console.log(cards[0]);      // [5, 22, 34, null, 61, ...] (first card's numbers)
 * console.log(cards[1]);      // [3, 18, 42, null, 70, ...] (second card's numbers)
 * ```
 *
 * @example
 * Using the BingoScanner class for multiple scans:
 * ```typescript
 * import { BingoScanner } from '@repo/api-bingo-scanner';
 *
 * const scanner = new BingoScanner({
 *   language: 'eng',
 *   confidenceThreshold: 70,
 * });
 *
 * await scanner.initialize();
 *
 * const result1 = await scanner.scan('./card1.png');
 * const result2 = await scanner.scan('./card2.png');
 *
 * await scanner.terminate();
 * ```
 */

// Main scanner exports
export {
  BingoScanner,
  scanBingoCard,
  scanBingoCardDetailed,
  scanMultipleBingoCards,
  scanMultipleBingoCardsDetailed,
} from './scanner';

// Type exports
export type {
  ScannerOptions,
  ScanResult,
  CellResult,
  ImageInput,
  MultiCardScannerOptions,
  MultiCardScanResult,
  DetectedCard,
} from './types';

// Constants exports
export {
  BINGO_COLUMNS,
  STANDARD_BINGO_RANGES,
  DEFAULT_OPTIONS,
  DEFAULT_MULTI_CARD_OPTIONS,
} from './types';

// Parser utilities (for advanced use cases)
export {
  cleanOcrText,
  extractNumber,
  isFreeSpace,
  validateNumberForColumn,
  createCellResult,
  parseGrid,
  cellsToGrid,
  gridToArray,
} from './parser';

// Preprocessing utilities (for advanced use cases)
export {
  preprocessImage,
  extractCell,
  extractAllCells,
  getImageDimensions,
  resizeImage,
} from './preprocessing';

// Card detection utilities (for advanced use cases)
export { detectCards, splitImage, extractCardRegion } from './card-detection';

/**
 * Options for configuring the bingo card scanner
 */
export interface ScannerOptions {
  /**
   * Language for OCR recognition (default: 'eng')
   */
  language?: string;

  /**
   * Whether to preprocess the image for better OCR results (default: true)
   */
  preprocess?: boolean;

  /**
   * Confidence threshold for OCR results (0-100, default: 60)
   */
  confidenceThreshold?: number;

  /**
   * Expected grid size for the bingo card (default: 5x5)
   */
  gridSize?: {
    rows: number;
    cols: number;
  };

  /**
   * Whether the card has a FREE space in the center (default: true)
   */
  hasFreeSpace?: boolean;

  /**
   * Custom number range for validation (default: 1-75 for standard bingo)
   */
  numberRange?: {
    min: number;
    max: number;
  };

  /**
   * Path to Tesseract worker files (optional, uses CDN by default)
   */
  workerPath?: string;

  /**
   * Path to Tesseract core files (optional, uses CDN by default)
   */
  corePath?: string;

  /**
   * Path to Tesseract language data (optional, uses CDN by default)
   */
  langPath?: string;
}

/**
 * Options for multi-card scanning
 */
export interface MultiCardScannerOptions extends ScannerOptions {
  /**
   * Expected number of cards in the image (optional)
   * If not specified, will auto-detect cards
   */
  expectedCards?: number;

  /**
   * Minimum card area as percentage of image area (default: 0.05 = 5%)
   * Cards smaller than this will be ignored
   */
  minCardAreaPercent?: number;

  /**
   * Maximum card area as percentage of image area (default: 0.9 = 90%)
   * Cards larger than this will be ignored
   */
  maxCardAreaPercent?: number;

  /**
   * Card layout hint for better detection
   */
  cardLayout?: {
    rows: number;
    cols: number;
  };
}

/**
 * Represents a detected card region in the image
 */
export interface DetectedCard {
  /**
   * Bounding box of the detected card
   */
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  /**
   * Index of the card (0-based, in reading order)
   */
  index: number;

  /**
   * Extracted image buffer of the card
   */
  imageBuffer: Buffer;
}

/**
 * Result of scanning a single cell in the bingo card
 */
export interface CellResult {
  /**
   * The detected number (null if FREE space or unreadable)
   */
  number: number | null;

  /**
   * Whether this cell is a FREE space
   */
  isFreeSpace: boolean;

  /**
   * OCR confidence score (0-100)
   */
  confidence: number;

  /**
   * Raw text detected by OCR
   */
  rawText: string;

  /**
   * Position in the grid (row, col)
   */
  position: {
    row: number;
    col: number;
  };
}

/**
 * Result of scanning an entire bingo card
 */
export interface ScanResult {
  /**
   * Array of detected numbers in reading order (left to right, top to bottom)
   * FREE spaces are represented as null
   */
  numbers: (number | null)[];

  /**
   * 2D array representation of the bingo card
   */
  grid: (number | null)[][];

  /**
   * Detailed results for each cell
   */
  cells: CellResult[];

  /**
   * Overall confidence score for the scan (0-100)
   */
  confidence: number;

  /**
   * Whether all expected cells were successfully read
   */
  isComplete: boolean;

  /**
   * Number of cells that could not be read
   */
  unreadableCells: number;

  /**
   * Processing time in milliseconds
   */
  processingTime: number;
}

/**
 * Result of scanning multiple bingo cards from a single image
 */
export interface MultiCardScanResult {
  /**
   * Array of number arrays, one per detected card
   * Each inner array contains the numbers for that card
   */
  cards: (number | null)[][];

  /**
   * Detailed results for each card
   */
  cardResults: ScanResult[];

  /**
   * Information about detected card regions
   */
  detectedCards: Omit<DetectedCard, 'imageBuffer'>[];

  /**
   * Total number of cards detected
   */
  cardCount: number;

  /**
   * Overall confidence score across all cards (0-100)
   */
  confidence: number;

  /**
   * Total processing time in milliseconds
   */
  processingTime: number;
}

/**
 * Image input types supported by the scanner
 */
export type ImageInput =
  | string // File path or URL
  | Buffer // Node.js Buffer
  | Uint8Array // Typed array
  | ArrayBuffer; // Array buffer

/**
 * Column letters for standard bingo (B-I-N-G-O)
 */
export const BINGO_COLUMNS = ['B', 'I', 'N', 'G', 'O'] as const;

/**
 * Standard bingo number ranges per column
 */
export const STANDARD_BINGO_RANGES: Record<string, { min: number; max: number }> = {
  B: { min: 1, max: 15 },
  I: { min: 16, max: 30 },
  N: { min: 31, max: 45 },
  G: { min: 46, max: 60 },
  O: { min: 61, max: 75 },
};

/**
 * Default scanner options
 */
export const DEFAULT_OPTIONS: Required<Omit<ScannerOptions, 'workerPath' | 'corePath' | 'langPath'>> = {
  language: 'eng',
  preprocess: true,
  confidenceThreshold: 60,
  gridSize: { rows: 5, cols: 5 },
  hasFreeSpace: true,
  numberRange: { min: 1, max: 75 },
};

/**
 * Default multi-card scanner options
 */
export const DEFAULT_MULTI_CARD_OPTIONS: Required<
  Omit<MultiCardScannerOptions, 'workerPath' | 'corePath' | 'langPath' | 'expectedCards' | 'cardLayout'>
> = {
  ...DEFAULT_OPTIONS,
  minCardAreaPercent: 0.05,
  maxCardAreaPercent: 0.9,
};

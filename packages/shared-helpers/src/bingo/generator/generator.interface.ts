/**
 * Represents a single cell in a bingo card
 */
export interface GeneratedCell {
  /** Cell index (0-based position on the card) */
  index: number;
  /** Cell value: number for regular cells, null for free/blank cells */
  value: number | null;
  /** Cell type indicator */
  type: 'number' | 'free' | 'blank';
}

/**
 * Represents a complete bingo card
 */
export interface BingoCard {
  /** Unique identifier for the card */
  id: string;
  /** Session ID this card belongs to */
  sessionId: string;
  /** Card format type */
  format: '5x5' | '3x9';
  /** Array of cells making up the card */
  cells: GeneratedCell[];
  /** Hash for uniqueness checking */
  hash: string;
  /** Card creation timestamp */
  createdAt: Date;
}

/**
 * Card format configuration
 */
export interface CardFormatConfig {
  /** Number of rows */
  rows: number;
  /** Number of columns */
  columns: number;
  /** Total number of cells */
  totalCells: number;
  /** Whether the format has a free space */
  hasFreeSpace: boolean;
  /** Index of the free space (if applicable) */
  freeSpaceIndex?: number;
  /** Column ranges for number distribution */
  columnRanges: ColumnRange[];
}

/**
 * Defines the number range for a column
 */
export interface ColumnRange {
  /** Column index (0-based) */
  column: number;
  /** Minimum value (inclusive) */
  min: number;
  /** Maximum value (inclusive) */
  max: number;
}

/**
 * Request to generate bingo cards
 */
export interface GenerateCardsRequest {
  /** Number of cards to generate (1-100) */
  count: number;
  /** Card format */
  format: '5x5' | '3x9';
}

/**
 * Response from card generation
 */
export interface GenerateCardsResponse {
  /** Session ID the cards belong to */
  sessionId: string;
  /** Number of cards generated */
  generatedCount: number;
  /** Array of generated cards */
  cards: BingoCard[];
}

/**
 * Generator service interface
 */
export interface GeneratorService {
  /**
   * Generate a single bingo card
   * @param format Card format ('5x5' or '3x9')
   * @param sessionId Session identifier
   * @returns Generated bingo card
   */
  generateCard(format: '5x5' | '3x9', sessionId: string): Promise<BingoCard>;

  /**
   * Generate multiple bingo cards
   * @param format Card format ('5x5' or '3x9')
   * @param sessionId Session identifier
   * @param count Number of cards to generate
   * @returns Array of generated bingo cards
   */
  generateBatch(format: '5x5' | '3x9', sessionId: string, count: number): Promise<BingoCard[]>;

  /**
   * Validate that a card is unique within a session
   * @param card Card to validate
   * @param sessionId Session identifier
   * @returns True if card is unique, false otherwise
   */
  validateUniqueness(card: BingoCard, sessionId: string): Promise<boolean>;
}

/**
 * Strategy interface for different card formats
 */
export interface CardGeneratorStrategy {
  /** Format identifier */
  readonly format: '5x5' | '3x9';
  /** Format configuration */
  readonly config: CardFormatConfig;

  /**
   * Generate cells for a card
   * @returns Array of generated cells
   */
  generateCells(): GeneratedCell[];
}

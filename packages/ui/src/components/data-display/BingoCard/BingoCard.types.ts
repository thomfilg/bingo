// ============================================
// BACKEND DATA TYPES
// ============================================

/**
 * Cell data from the backend.
 */
export interface BingoCell {
  /** Cell value (number or null for free space) */
  value: number | null;
  /** Cell type */
  type: 'number' | 'free';
}

/**
 * Card data from the backend.
 */
export interface BingoCard {
  /** Unique identifier for the card */
  id: string;
  /** Array of cells in the card */
  cells: BingoCell[];
}

/**
 * Response from the backend containing bingo cards.
 */
export interface BingoCardResponse {
  /** Array of bingo cards */
  cards: BingoCard[];
  /** Format string (e.g., "5x5", "3x9") */
  format: string;
}

// ============================================
// PARSED FORMAT
// ============================================

/**
 * Parsed format dimensions.
 */
export interface BingoFormat {
  /** Number of rows */
  rows: number;
  /** Number of columns */
  columns: number;
}

// ============================================
// CELL STATE (Frontend managed)
// ============================================

/**
 * Extended cell state with marked status (managed by frontend).
 */
export interface BingoCellState extends BingoCell {
  /** Whether the cell is marked */
  marked: boolean;
}

// ============================================
// COMPONENT PROPS
// ============================================

/**
 * Props for the BingoCard component (single card).
 */
export interface BingoCardComponentProps {
  /** Card data */
  card: BingoCard;
  /** Parsed format dimensions */
  format: BingoFormat;
  /** Set of marked cell indices */
  markedCells?: Set<number>;
  /** Click handler for cell clicks */
  onCellClick?: (cellIndex: number) => void;
  /** Test ID for testing */
  'data-testid'?: string;
}

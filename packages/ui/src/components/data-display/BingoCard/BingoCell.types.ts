import type { BingoCell } from './BingoCard.types';

/**
 * Props for the BingoCell component.
 */
export interface BingoCellProps {
  /** Cell data from the backend */
  cell: BingoCell;
  /** Cell index in the card (0-based) */
  index: number;
  /** Whether the cell is marked */
  marked?: boolean;
  /** Click handler for marking/unmarking */
  onClick?: () => void;
  /** Test ID for testing */
  'data-testid'?: string;
}

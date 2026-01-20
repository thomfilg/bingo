import type { BingoCardResponse } from './BingoCard.types';

/**
 * Props for the BingoCardView component.
 */
export interface BingoCardViewProps {
  /** Backend response containing cards and format */
  data: BingoCardResponse;
  /** Callback when a cell is marked/unmarked */
  onCellMark?: (cardId: string, cellIndex: number, marked: boolean) => void;
  /** Test ID for testing */
  'data-testid'?: string;
}

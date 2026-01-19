/**
 * DTOs for PATCH /api/cards/:cardId/cells/:cellIndex endpoint
 */

/** Request body for marking a cell */
export interface MarkCellRequest {
  marked: boolean;
}

/** Response for marking a cell */
export interface MarkCellResponse {
  cardId: string;
  cellIndex: number;
  marked: boolean;
  updatedAt: string;
}

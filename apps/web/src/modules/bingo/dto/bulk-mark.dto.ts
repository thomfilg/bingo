/**
 * DTOs for PATCH /api/cards/:cardId/cells/bulk endpoint
 */

/** Cell update in bulk request */
export interface CellUpdate {
  index: number;
  marked: boolean;
}

/** Request body for bulk marking cells */
export interface BulkMarkCellsRequest {
  cells: CellUpdate[];
}

/** Cell update result in bulk response */
export interface UpdatedCell {
  index: number;
  marked: boolean;
}

/** Response for bulk marking cells */
export interface BulkMarkCellsResponse {
  cardId: string;
  updatedCells: UpdatedCell[];
  updatedAt: string;
}

/**
 * DTOs for GET /api/sessions/:sessionId/cards and GET /api/cards endpoints
 */

/** Cell DTO returned in API responses */
export interface BingoCellDTO {
  value: number | null;
  type: 'number' | 'free';
  marked: boolean;
}

/** Card DTO for session cards */
export interface BingoCardDTO {
  id: string;
  cells: BingoCellDTO[];
}

/** Response for GET /api/sessions/:sessionId/cards */
export interface GetSessionCardsResponse {
  sessionId: string;
  format: string;
  cards: BingoCardDTO[];
}

/** Standalone card DTO with metadata */
export interface StandaloneCardDTO {
  id: string;
  format: string;
  cells: BingoCellDTO[];
  createdAt: string;
}

/** Response for GET /api/cards */
export interface GetStandaloneCardsResponse {
  cards: StandaloneCardDTO[];
}

/** Response for GET /api/cards/:cardId */
export interface GetCardDetailsResponse {
  id: string;
  format: string;
  cells: BingoCellDTO[];
  createdAt: string;
  sessionId?: string;
}

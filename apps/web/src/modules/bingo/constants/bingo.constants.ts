/**
 * Bingo game constants
 */

/** Supported bingo card formats */
export const SUPPORTED_FORMATS = ['5x5', '3x9'] as const;
export type SupportedFormat = typeof SUPPORTED_FORMATS[number];

/** Number ranges for each format */
export const FORMAT_NUMBER_RANGES: Record<SupportedFormat, { min: number; max: number }> = {
  '5x5': { min: 1, max: 75 },
  '3x9': { min: 1, max: 90 },
};

/** Grid size for each format */
export const FORMAT_GRID_SIZES: Record<SupportedFormat, { rows: number; cols: number; totalCells: number }> = {
  '5x5': { rows: 5, cols: 5, totalCells: 25 },
  '3x9': { rows: 3, cols: 9, totalCells: 27 },
};

/** Free space index for 5x5 format (center of the grid) */
export const FREE_SPACE_INDEX_5X5 = 12;

/** Maximum number of cells that can be updated in a bulk operation */
export const MAX_BULK_CELLS = 100;

/** Error messages */
export const ERROR_MESSAGES = {
  CARD_NOT_FOUND: 'Card not found',
  CELL_NOT_FOUND: 'Cell not found',
  SESSION_NOT_FOUND: 'Session not found',
  USER_NOT_FOUND: 'User not found',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  INVALID_FORMAT: 'Invalid format',
  INVALID_CELL_INDEX: 'Invalid cell index',
  CANNOT_UNMARK_FREE_SPACE: 'Cannot unmark free space',
  NOT_SESSION_MEMBER: 'User is not a member of this session',
  NOT_CARD_OWNER: 'User does not own this card',
  PREMIUM_REQUIRED: 'Premium subscription required',
  BULK_LIMIT_EXCEEDED: 'Cannot update more than 100 cells at once',
} as const;

/** HTTP status codes */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

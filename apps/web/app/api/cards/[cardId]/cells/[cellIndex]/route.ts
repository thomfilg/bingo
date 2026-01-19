/**
 * PATCH /api/cards/:cardId/cells/:cellIndex
 * Mark or unmark a single cell
 * Requires authentication and card ownership
 */

import { type NextRequest } from 'next/server';
import { getAuthenticatedUser, isAuthenticated } from '@/shared/api/auth';
import {
  jsonResponse,
  unauthorized,
  notFound,
  forbidden,
  badRequest,
  errorResponse,
} from '@/shared/api/response';
import { getBingoModule } from '@/shared/api/module-factory';
import { ERROR_MESSAGES, HTTP_STATUS } from '@/modules/bingo/constants';
import {
  isValidUUID,
  validateMarkCellRequest,
  parseMarkCellRequest,
} from '@/modules/bingo/validators';
import type { MarkCellResponse } from '@/modules/bingo/dto';

interface RouteParams {
  params: Promise<{ cardId: string; cellIndex: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    if (!isAuthenticated(user)) {
      return unauthorized(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Validate card ID
    const { cardId, cellIndex: cellIndexStr } = await params;
    if (!isValidUUID(cardId)) {
      return notFound(ERROR_MESSAGES.CARD_NOT_FOUND);
    }

    // Validate cell index
    const cellIndex = parseInt(cellIndexStr, 10);
    if (isNaN(cellIndex) || cellIndex < 0) {
      return badRequest(ERROR_MESSAGES.INVALID_CELL_INDEX);
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Invalid JSON body');
    }

    // Validate request body
    const validation = validateMarkCellRequest(body);
    if (!validation.valid) {
      return badRequest(validation.error ?? 'Invalid request');
    }

    const markRequest = parseMarkCellRequest(body);
    if (!markRequest) {
      return badRequest('Invalid request body');
    }

    // Get the bingo module
    const { cardsService } = await getBingoModule();

    // Mark the cell
    const response = await cardsService.markCell(
      cardId,
      cellIndex,
      markRequest.marked,
      user.id
    );

    return jsonResponse<MarkCellResponse>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === ERROR_MESSAGES.NOT_CARD_OWNER) {
      return forbidden(message);
    }

    if (message === ERROR_MESSAGES.CARD_NOT_FOUND) {
      return notFound(message);
    }

    if (message === ERROR_MESSAGES.CELL_NOT_FOUND) {
      return notFound(message);
    }

    if (message === ERROR_MESSAGES.CANNOT_UNMARK_FREE_SPACE) {
      return badRequest(message);
    }

    return errorResponse(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

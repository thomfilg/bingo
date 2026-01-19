/**
 * PATCH /api/cards/:cardId/cells/bulk
 * Bulk mark or unmark cells
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
  validateBulkMarkCellsRequest,
  parseBulkMarkCellsRequest,
} from '@/modules/bingo/validators';
import type { BulkMarkCellsResponse } from '@/modules/bingo/dto';

interface RouteParams {
  params: Promise<{ cardId: string }>;
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
    const { cardId } = await params;
    if (!isValidUUID(cardId)) {
      return notFound(ERROR_MESSAGES.CARD_NOT_FOUND);
    }

    // Get the bingo module to find the card's format
    const { cardsService, cardsRepository } = await getBingoModule();

    // Get card to determine format
    const card = await cardsRepository.findById(cardId);
    if (!card) {
      return notFound(ERROR_MESSAGES.CARD_NOT_FOUND);
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Invalid JSON body');
    }

    // Validate request body
    const validation = validateBulkMarkCellsRequest(body, card.format);
    if (!validation.valid) {
      return badRequest(validation.error ?? 'Invalid request');
    }

    const bulkRequest = parseBulkMarkCellsRequest(body, card.format);
    if (!bulkRequest) {
      return badRequest('Invalid request body');
    }

    // Bulk mark cells
    const response = await cardsService.bulkMarkCells(
      cardId,
      bulkRequest.cells,
      user.id
    );

    return jsonResponse<BulkMarkCellsResponse>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === ERROR_MESSAGES.NOT_CARD_OWNER) {
      return forbidden(message);
    }

    if (message === ERROR_MESSAGES.CARD_NOT_FOUND) {
      return notFound(message);
    }

    return errorResponse(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

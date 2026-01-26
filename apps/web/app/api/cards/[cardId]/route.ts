/**
 * GET /api/cards/:cardId
 * Get single card details
 * Requires authentication and card ownership
 */

import { type NextRequest } from 'next/server';
import { getAuthenticatedUser, isAuthenticated } from '@/shared/api/auth';
import {
  jsonResponse,
  unauthorized,
  notFound,
  forbidden,
  errorResponse,
} from '@/shared/api/response';
import { getBingoModule } from '@/shared/api/module-factory';
import { ERROR_MESSAGES, HTTP_STATUS } from '@/modules/bingo/constants';
import { isValidUUID } from '@/modules/bingo/validators';
import type { GetCardDetailsResponse } from '@/modules/bingo/dto';

interface RouteParams {
  params: Promise<{ cardId: string }>;
}

export async function GET(
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

    // Get the bingo module
    const { cardsService } = await getBingoModule();

    // Get card details
    const response = await cardsService.getCardById(cardId, user.id);

    if (!response) {
      return notFound(ERROR_MESSAGES.CARD_NOT_FOUND);
    }

    return jsonResponse<GetCardDetailsResponse>(response);
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

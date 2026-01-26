/**
 * GET /api/cards
 * Get user's standalone scanned cards
 * Requires authentication and premium subscription
 */

import { type NextRequest } from 'next/server';
import { getAuthenticatedUser, isAuthenticated } from '@/shared/api/auth';
import {
  jsonResponse,
  unauthorized,
  forbidden,
  errorResponse,
} from '@/shared/api/response';
import { getBingoModule } from '@/shared/api/module-factory';
import { ERROR_MESSAGES, HTTP_STATUS } from '@/modules/bingo/constants';
import type { GetStandaloneCardsResponse } from '@/modules/bingo/dto';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    if (!isAuthenticated(user)) {
      return unauthorized(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Check premium access
    if (user.tier !== 'PREMIUM') {
      return forbidden(ERROR_MESSAGES.PREMIUM_REQUIRED);
    }

    // Get the bingo module
    const { cardsService } = await getBingoModule();

    // Get standalone cards
    const response = await cardsService.getStandaloneCards(user);

    return jsonResponse<GetStandaloneCardsResponse>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === ERROR_MESSAGES.PREMIUM_REQUIRED) {
      return forbidden(message);
    }

    return errorResponse(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

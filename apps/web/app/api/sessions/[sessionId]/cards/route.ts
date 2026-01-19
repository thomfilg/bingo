/**
 * GET /api/sessions/:sessionId/cards
 * Get user's cards for a specific session
 * Requires authentication and session membership
 */

import { type NextRequest } from 'next/server';
import { getAuthenticatedUser, isAuthenticated } from '@/shared/api/auth';
import {
  jsonResponse,
  unauthorized,
  notFound,
  errorResponse,
} from '@/shared/api/response';
import { getBingoModule } from '@/shared/api/module-factory';
import { ERROR_MESSAGES, HTTP_STATUS } from '@/modules/bingo/constants';
import { isValidUUID } from '@/modules/bingo/validators';
import type { GetSessionCardsResponse } from '@/modules/bingo/dto';

interface RouteParams {
  params: Promise<{ sessionId: string }>;
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

    // Validate session ID
    const { sessionId } = await params;
    if (!isValidUUID(sessionId)) {
      return notFound(ERROR_MESSAGES.SESSION_NOT_FOUND);
    }

    // Get the bingo module
    const { sessionsService, cardsService } = await getBingoModule();

    // Check if session exists
    const session = await sessionsService.getSessionById(sessionId);
    if (!session) {
      return notFound(ERROR_MESSAGES.SESSION_NOT_FOUND);
    }

    // Validate session membership
    const sessionPlayer = await sessionsService.getSessionPlayer(user.id, sessionId);
    if (!sessionPlayer) {
      return errorResponse(ERROR_MESSAGES.NOT_SESSION_MEMBER, HTTP_STATUS.FORBIDDEN);
    }

    // Get cards for the session
    const response = await cardsService.getSessionCards(sessionId, sessionPlayer);

    return jsonResponse<GetSessionCardsResponse>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

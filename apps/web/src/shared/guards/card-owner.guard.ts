/**
 * Card Owner Guard
 * Validates that the authenticated user owns the specified card
 */

import { ERROR_MESSAGES, HTTP_STATUS } from '@/modules/bingo/constants';
import type { User } from '@/modules/bingo/types';
import type { CardsRepository } from '@/modules/bingo/repositories';

export interface CardOwnerValidationResult {
  isOwner: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Validate that a user owns a specific card
 */
export async function validateCardOwnership(
  cardId: string,
  user: User,
  cardsRepository: CardsRepository
): Promise<CardOwnerValidationResult> {
  const card = await cardsRepository.findById(cardId);

  if (!card) {
    return {
      isOwner: false,
      error: ERROR_MESSAGES.CARD_NOT_FOUND,
      statusCode: HTTP_STATUS.NOT_FOUND,
    };
  }

  // Check if user owns the card directly
  if (card.userId === user.id) {
    return { isOwner: true };
  }

  // Check if user owns the card through session player
  if (card.sessionPlayer && card.sessionPlayer.userId === user.id) {
    return { isOwner: true };
  }

  return {
    isOwner: false,
    error: ERROR_MESSAGES.NOT_CARD_OWNER,
    statusCode: HTTP_STATUS.FORBIDDEN,
  };
}

/**
 * Extract card ID from URL path
 */
export function extractCardIdFromPath(pathname: string): string | null {
  const match = pathname.match(/\/api\/cards\/([^/]+)/);
  return match?.[1] ?? null;
}

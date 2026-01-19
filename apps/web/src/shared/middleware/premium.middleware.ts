/**
 * Premium Middleware
 * Validates that the authenticated user has a premium subscription
 */

import type { User } from '@/modules/bingo/types';
import { ERROR_MESSAGES, HTTP_STATUS } from '@/modules/bingo/constants';

export interface PremiumValidationResult {
  isPremium: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Validate that a user has a premium subscription
 */
export function validatePremiumAccess(user: User): PremiumValidationResult {
  if (user.tier === 'PREMIUM') {
    return { isPremium: true };
  }

  return {
    isPremium: false,
    error: ERROR_MESSAGES.PREMIUM_REQUIRED,
    statusCode: HTTP_STATUS.FORBIDDEN,
  };
}

/**
 * Check if a user is premium
 */
export function isPremiumUser(user: User): boolean {
  return user.tier === 'PREMIUM';
}

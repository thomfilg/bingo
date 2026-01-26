/**
 * Authentication Utilities
 * Helper functions for handling authentication in API routes
 *
 * WARNING: This implementation uses HTTP headers for authentication which is
 * INSECURE and intended for development/testing purposes ONLY.
 * In production, replace with proper JWT token or session-based authentication.
 */

import type { NextRequest } from 'next/server';
import type { User, UserTier } from '@/modules/bingo/types';

/**
 * Get the authenticated user from the request
 * In a real application, this would validate a JWT token or session
 * For now, it reads from a header for testing purposes
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  // In production, this would validate a JWT token or session cookie
  // For development/testing, we read from headers
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  const userTier = request.headers.get('x-user-tier') as UserTier | null;

  if (!userId || !userEmail) {
    return null;
  }

  return {
    id: userId,
    email: userEmail,
    tier: userTier || 'FREE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Check if a user is authenticated
 */
export function isAuthenticated(user: User | null): user is User {
  return user !== null;
}

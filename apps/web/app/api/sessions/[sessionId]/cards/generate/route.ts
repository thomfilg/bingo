import { NextRequest, NextResponse } from 'next/server';

import {
  BingoGeneratorService,
  type BingoCard,
  type GenerateCardsRequest,
  type GenerateCardsResponse,
} from '@repo/shared-helpers';

// Singleton instance of the generator service
// NOTE: The internal CardRegistry automatically cleans up sessions that haven't been
// accessed for 1 hour (default TTL). For explicit cleanup, call
// generatorService.clearSession(sessionId) when a session ends.
const generatorService = new BingoGeneratorService();

interface RouteParams {
  params: Promise<{
    sessionId: string;
  }>;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

/**
 * Validate the request body
 */
function validateRequest(body: unknown): GenerateCardsRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be a valid JSON object');
  }

  const request = body as Record<string, unknown>;

  // Validate count
  if (typeof request.count !== 'number') {
    throw new Error('count must be a number');
  }

  if (!Number.isInteger(request.count)) {
    throw new Error('count must be an integer');
  }

  if (request.count < 1 || request.count > 100) {
    throw new Error('count must be between 1 and 100');
  }

  // Validate format
  if (typeof request.format !== 'string' || (request.format !== '5x5' && request.format !== '3x9')) {
    throw new Error('format must be either "5x5" or "3x9"');
  }

  return {
    count: request.count,
    format: request.format,
  };
}

/**
 * POST /api/sessions/[sessionId]/cards/generate
 *
 * Generate bingo cards for a session
 *
 * Request body:
 * {
 *   count: number (1-100)
 *   format: '5x5' | '3x9'
 * }
 *
 * Response (201 Created):
 * {
 *   sessionId: string
 *   generatedCount: number
 *   cards: BingoCard[]
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<GenerateCardsResponse | ErrorResponse>> {
  try {
    const { sessionId } = await params;

    // Validate sessionId (must be non-empty string)
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 },
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 },
      );
    }

    let validatedRequest: GenerateCardsRequest;
    try {
      validatedRequest = validateRequest(body);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid request';
      return NextResponse.json(
        { error: 'Validation error', details: message },
        { status: 400 },
      );
    }

    // Generate cards
    let cards: BingoCard[];
    try {
      cards = await generatorService.generateBatch(
        validatedRequest.format,
        sessionId,
        validatedRequest.count,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      return NextResponse.json(
        { error: 'Card generation failed', details: message },
        { status: 500 },
      );
    }

    // Return successful response
    const response: GenerateCardsResponse = {
      sessionId,
      generatedCount: cards.length,
      cards,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error('Unexpected error in card generation:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

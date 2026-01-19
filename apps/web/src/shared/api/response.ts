/**
 * API Response Utilities
 * Helper functions for creating consistent API responses
 */

import { NextResponse } from 'next/server';
import { HTTP_STATUS } from '@/modules/bingo/constants';

export interface ApiErrorResponse {
  error: string;
  statusCode: number;
}

/**
 * Create a JSON success response
 */
export function jsonResponse<T>(data: T, status: number = HTTP_STATUS.OK): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * Create a JSON error response
 */
export function errorResponse(
  message: string,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error: message, statusCode: status },
    { status }
  );
}

/**
 * Create a 400 Bad Request response
 */
export function badRequest(message: string): NextResponse<ApiErrorResponse> {
  return errorResponse(message, HTTP_STATUS.BAD_REQUEST);
}

/**
 * Create a 401 Unauthorized response
 */
export function unauthorized(message: string = 'Unauthorized'): NextResponse<ApiErrorResponse> {
  return errorResponse(message, HTTP_STATUS.UNAUTHORIZED);
}

/**
 * Create a 403 Forbidden response
 */
export function forbidden(message: string): NextResponse<ApiErrorResponse> {
  return errorResponse(message, HTTP_STATUS.FORBIDDEN);
}

/**
 * Create a 404 Not Found response
 */
export function notFound(message: string): NextResponse<ApiErrorResponse> {
  return errorResponse(message, HTTP_STATUS.NOT_FOUND);
}

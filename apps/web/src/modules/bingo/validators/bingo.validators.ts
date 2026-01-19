/**
 * Validators for bingo-related operations
 */

import {
  SUPPORTED_FORMATS,
  FORMAT_GRID_SIZES,
  FORMAT_NUMBER_RANGES,
  type SupportedFormat,
} from '../constants/bingo.constants';
import type { MarkCellRequest } from '../dto/mark-cell.dto';
import type { BulkMarkCellsRequest, CellUpdate } from '../dto/bulk-mark.dto';

/** Validation result with error message if invalid */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates if the given format is supported
 */
export function isValidFormat(format: string): format is SupportedFormat {
  return SUPPORTED_FORMATS.includes(format as SupportedFormat);
}

/**
 * Validates if a cell index is valid for the given format
 */
export function isValidCellIndex(format: string, index: number): boolean {
  if (!isValidFormat(format)) {
    return false;
  }
  const gridSize = FORMAT_GRID_SIZES[format];
  return Number.isInteger(index) && index >= 0 && index < gridSize.totalCells;
}

/**
 * Validates if a cell value is valid for the given format
 */
export function isValidCellValue(format: string, value: number | null): boolean {
  if (value === null) {
    return true; // Null is valid for free spaces
  }
  if (!isValidFormat(format)) {
    return false;
  }
  const range = FORMAT_NUMBER_RANGES[format];
  return Number.isInteger(value) && value >= range.min && value <= range.max;
}

/**
 * Validates a mark cell request
 */
export function validateMarkCellRequest(request: unknown): ValidationResult {
  if (!request || typeof request !== 'object') {
    return { valid: false, error: 'Request body must be an object' };
  }

  const typedRequest = request as Record<string, unknown>;

  if (typeof typedRequest.marked !== 'boolean') {
    return { valid: false, error: 'marked field must be a boolean' };
  }

  return { valid: true };
}

/**
 * Validates a bulk mark cells request
 */
export function validateBulkMarkCellsRequest(
  request: unknown,
  format: string
): ValidationResult {
  if (!request || typeof request !== 'object') {
    return { valid: false, error: 'Request body must be an object' };
  }

  const typedRequest = request as Record<string, unknown>;

  if (!Array.isArray(typedRequest.cells)) {
    return { valid: false, error: 'cells field must be an array' };
  }

  const cells = typedRequest.cells as unknown[];

  if (cells.length === 0) {
    return { valid: false, error: 'cells array cannot be empty' };
  }

  for (const cell of cells) {
    if (!cell || typeof cell !== 'object') {
      return { valid: false, error: 'Each cell must be an object' };
    }

    const typedCell = cell as Record<string, unknown>;

    if (typeof typedCell.index !== 'number') {
      return { valid: false, error: 'Cell index must be a number' };
    }

    if (!isValidCellIndex(format, typedCell.index)) {
      return {
        valid: false,
        error: `Invalid cell index: ${typedCell.index} for format ${format}`,
      };
    }

    if (typeof typedCell.marked !== 'boolean') {
      return { valid: false, error: 'Cell marked field must be a boolean' };
    }
  }

  return { valid: true };
}

/**
 * Parses and validates mark cell request
 */
export function parseMarkCellRequest(request: unknown): MarkCellRequest | null {
  const validation = validateMarkCellRequest(request);
  if (!validation.valid) {
    return null;
  }
  return request as MarkCellRequest;
}

/**
 * Parses and validates bulk mark cells request
 */
export function parseBulkMarkCellsRequest(
  request: unknown,
  format: string
): BulkMarkCellsRequest | null {
  const validation = validateBulkMarkCellsRequest(request, format);
  if (!validation.valid) {
    return null;
  }
  return request as BulkMarkCellsRequest;
}

/**
 * Validates a UUID string
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Type guard for CellUpdate
 */
export function isCellUpdate(value: unknown): value is CellUpdate {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return typeof obj.index === 'number' && typeof obj.marked === 'boolean';
}

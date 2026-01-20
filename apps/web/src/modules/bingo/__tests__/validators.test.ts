/**
 * Unit tests for bingo validators
 */

import { describe, it, expect } from 'vitest';
import {
  isValidFormat,
  isValidCellIndex,
  isValidCellValue,
  validateMarkCellRequest,
  validateBulkMarkCellsRequest,
  parseMarkCellRequest,
  parseBulkMarkCellsRequest,
  isValidUUID,
} from '../validators/bingo.validators';

describe('Bingo Validators', () => {
  describe('isValidFormat', () => {
    it('should return true for 5x5 format', () => {
      expect(isValidFormat('5x5')).toBe(true);
    });

    it('should return true for 3x9 format', () => {
      expect(isValidFormat('3x9')).toBe(true);
    });

    it('should return false for invalid formats', () => {
      expect(isValidFormat('4x4')).toBe(false);
      expect(isValidFormat('5x6')).toBe(false);
      expect(isValidFormat('')).toBe(false);
      expect(isValidFormat('invalid')).toBe(false);
    });
  });

  describe('isValidCellIndex', () => {
    describe('for 5x5 format', () => {
      it('should return true for valid indices 0-24', () => {
        expect(isValidCellIndex('5x5', 0)).toBe(true);
        expect(isValidCellIndex('5x5', 12)).toBe(true);
        expect(isValidCellIndex('5x5', 24)).toBe(true);
      });

      it('should return false for invalid indices', () => {
        expect(isValidCellIndex('5x5', -1)).toBe(false);
        expect(isValidCellIndex('5x5', 25)).toBe(false);
        expect(isValidCellIndex('5x5', 100)).toBe(false);
      });

      it('should return false for non-integer indices', () => {
        expect(isValidCellIndex('5x5', 1.5)).toBe(false);
      });
    });

    describe('for 3x9 format', () => {
      it('should return true for valid indices 0-26', () => {
        expect(isValidCellIndex('3x9', 0)).toBe(true);
        expect(isValidCellIndex('3x9', 13)).toBe(true);
        expect(isValidCellIndex('3x9', 26)).toBe(true);
      });

      it('should return false for invalid indices', () => {
        expect(isValidCellIndex('3x9', -1)).toBe(false);
        expect(isValidCellIndex('3x9', 27)).toBe(false);
      });
    });

    it('should return false for invalid format', () => {
      expect(isValidCellIndex('invalid', 0)).toBe(false);
    });
  });

  describe('isValidCellValue', () => {
    describe('for 5x5 format (1-75)', () => {
      it('should return true for valid values', () => {
        expect(isValidCellValue('5x5', 1)).toBe(true);
        expect(isValidCellValue('5x5', 75)).toBe(true);
        expect(isValidCellValue('5x5', 42)).toBe(true);
      });

      it('should return false for out of range values', () => {
        expect(isValidCellValue('5x5', 0)).toBe(false);
        expect(isValidCellValue('5x5', 76)).toBe(false);
      });

      it('should return true for null (free space)', () => {
        expect(isValidCellValue('5x5', null)).toBe(true);
      });
    });

    describe('for 3x9 format (1-90)', () => {
      it('should return true for valid values', () => {
        expect(isValidCellValue('3x9', 1)).toBe(true);
        expect(isValidCellValue('3x9', 90)).toBe(true);
        expect(isValidCellValue('3x9', 45)).toBe(true);
      });

      it('should return false for out of range values', () => {
        expect(isValidCellValue('3x9', 0)).toBe(false);
        expect(isValidCellValue('3x9', 91)).toBe(false);
      });
    });
  });

  describe('validateMarkCellRequest', () => {
    it('should validate correct request', () => {
      const result = validateMarkCellRequest({ marked: true });
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate false marked value', () => {
      const result = validateMarkCellRequest({ marked: false });
      expect(result.valid).toBe(true);
    });

    it('should reject non-object request', () => {
      expect(validateMarkCellRequest(null).valid).toBe(false);
      expect(validateMarkCellRequest('string').valid).toBe(false);
      expect(validateMarkCellRequest(123).valid).toBe(false);
    });

    it('should reject missing marked field', () => {
      const result = validateMarkCellRequest({});
      expect(result.valid).toBe(false);
      expect(result.error).toContain('marked');
    });

    it('should reject non-boolean marked field', () => {
      const result = validateMarkCellRequest({ marked: 'true' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('boolean');
    });
  });

  describe('validateBulkMarkCellsRequest', () => {
    it('should validate correct request', () => {
      const result = validateBulkMarkCellsRequest(
        {
          cells: [
            { index: 0, marked: true },
            { index: 1, marked: false },
          ],
        },
        '5x5'
      );
      expect(result.valid).toBe(true);
    });

    it('should reject empty cells array', () => {
      const result = validateBulkMarkCellsRequest({ cells: [] }, '5x5');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject non-array cells', () => {
      const result = validateBulkMarkCellsRequest({ cells: 'invalid' }, '5x5');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('array');
    });

    it('should reject invalid cell index', () => {
      const result = validateBulkMarkCellsRequest(
        { cells: [{ index: 100, marked: true }] },
        '5x5'
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('index');
    });

    it('should reject non-boolean marked in cells', () => {
      const result = validateBulkMarkCellsRequest(
        { cells: [{ index: 0, marked: 'true' }] },
        '5x5'
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('boolean');
    });
  });

  describe('parseMarkCellRequest', () => {
    it('should return parsed request for valid input', () => {
      const result = parseMarkCellRequest({ marked: true });
      expect(result).toEqual({ marked: true });
    });

    it('should return null for invalid input', () => {
      const result = parseMarkCellRequest({ invalid: true });
      expect(result).toBeNull();
    });
  });

  describe('parseBulkMarkCellsRequest', () => {
    it('should return parsed request for valid input', () => {
      const result = parseBulkMarkCellsRequest(
        { cells: [{ index: 0, marked: true }] },
        '5x5'
      );
      expect(result).toEqual({ cells: [{ index: 0, marked: true }] });
    });

    it('should return null for invalid input', () => {
      const result = parseBulkMarkCellsRequest({ cells: [] }, '5x5');
      expect(result).toBeNull();
    });
  });

  describe('isValidUUID', () => {
    it('should return true for valid UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should return false for invalid UUIDs', () => {
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
      expect(isValidUUID('123e4567-e89b-62d3-a456-426614174000')).toBe(false); // Invalid version
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  cleanOcrText,
  extractNumber,
  isFreeSpace,
  validateNumberForColumn,
  createCellResult,
  cellsToGrid,
  gridToArray,
} from '../parser';
import { STANDARD_BINGO_RANGES } from '../types';

describe('cleanOcrText', () => {
  it('should remove non-numeric characters', () => {
    expect(cleanOcrText('abc123def')).toBe('123');
  });

  it('should correct common OCR misreads', () => {
    expect(cleanOcrText('O')).toBe('0');
    expect(cleanOcrText('I')).toBe('1');
    expect(cleanOcrText('l')).toBe('1');
    expect(cleanOcrText('S')).toBe('5');
    expect(cleanOcrText('Z')).toBe('2');
  });

  it('should handle mixed corrections', () => {
    expect(cleanOcrText('1O')).toBe('10');
    expect(cleanOcrText('I5')).toBe('15');
    expect(cleanOcrText('Z3')).toBe('23');
  });

  it('should trim whitespace', () => {
    expect(cleanOcrText('  42  ')).toBe('42');
  });

  it('should handle empty strings', () => {
    expect(cleanOcrText('')).toBe('');
  });
});

describe('extractNumber', () => {
  it('should extract valid numbers', () => {
    expect(extractNumber('42')).toBe(42);
    expect(extractNumber('7')).toBe(7);
    expect(extractNumber('75')).toBe(75);
  });

  it('should handle numbers with surrounding text', () => {
    expect(extractNumber('B15')).toBe(15);
    expect(extractNumber('number: 42')).toBe(42);
  });

  it('should return null for FREE space indicators', () => {
    expect(extractNumber('FREE')).toBeNull();
    expect(extractNumber('free')).toBeNull();
    expect(extractNumber('***')).toBeNull();
  });

  it('should return null for numbers outside default range', () => {
    expect(extractNumber('0')).toBeNull();
    expect(extractNumber('76')).toBeNull();
  });

  it('should extract first/last two digits when out of range', () => {
    // '100' is out of range (1-75), but first two digits '10' is valid
    expect(extractNumber('100')).toBe(10);
    // '123' is out of range, first two digits '12' is valid
    expect(extractNumber('123')).toBe(12);
  });

  it('should respect custom number range', () => {
    expect(extractNumber('100', { numberRange: { min: 1, max: 100 } })).toBe(100);
    expect(extractNumber('5', { numberRange: { min: 10, max: 50 } })).toBeNull();
  });

  it('should handle OCR corrections during extraction', () => {
    expect(extractNumber('1O')).toBe(10); // O -> 0
    expect(extractNumber('I5')).toBe(15); // I -> 1
  });

  it('should return null for empty or whitespace strings', () => {
    expect(extractNumber('')).toBeNull();
    expect(extractNumber('   ')).toBeNull();
  });
});

describe('isFreeSpace', () => {
  it('should detect FREE text', () => {
    expect(isFreeSpace('FREE')).toBe(true);
    expect(isFreeSpace('free')).toBe(true);
    expect(isFreeSpace('Free')).toBe(true);
  });

  it('should detect star patterns', () => {
    expect(isFreeSpace('*')).toBe(true);
    expect(isFreeSpace('***')).toBe(true);
    expect(isFreeSpace('**')).toBe(true);
  });

  it('should detect Spanish FREE space indicators', () => {
    expect(isFreeSpace('centro')).toBe(true);
    expect(isFreeSpace('libre')).toBe(true);
    expect(isFreeSpace('gratis')).toBe(true);
  });

  it('should detect empty or very short non-digit text', () => {
    expect(isFreeSpace('')).toBe(true);
    expect(isFreeSpace('  ')).toBe(true);
    expect(isFreeSpace('X')).toBe(true);
  });

  it('should not detect numbers as FREE space', () => {
    expect(isFreeSpace('42')).toBe(false);
    expect(isFreeSpace('7')).toBe(false);
    expect(isFreeSpace('123')).toBe(false);
  });
});

describe('validateNumberForColumn', () => {
  it('should validate B column (1-15)', () => {
    expect(validateNumberForColumn(1, 0, STANDARD_BINGO_RANGES)).toBe(true);
    expect(validateNumberForColumn(15, 0, STANDARD_BINGO_RANGES)).toBe(true);
    expect(validateNumberForColumn(16, 0, STANDARD_BINGO_RANGES)).toBe(false);
  });

  it('should validate I column (16-30)', () => {
    expect(validateNumberForColumn(16, 1, STANDARD_BINGO_RANGES)).toBe(true);
    expect(validateNumberForColumn(30, 1, STANDARD_BINGO_RANGES)).toBe(true);
    expect(validateNumberForColumn(15, 1, STANDARD_BINGO_RANGES)).toBe(false);
  });

  it('should validate N column (31-45)', () => {
    expect(validateNumberForColumn(31, 2, STANDARD_BINGO_RANGES)).toBe(true);
    expect(validateNumberForColumn(45, 2, STANDARD_BINGO_RANGES)).toBe(true);
    expect(validateNumberForColumn(30, 2, STANDARD_BINGO_RANGES)).toBe(false);
  });

  it('should validate G column (46-60)', () => {
    expect(validateNumberForColumn(46, 3, STANDARD_BINGO_RANGES)).toBe(true);
    expect(validateNumberForColumn(60, 3, STANDARD_BINGO_RANGES)).toBe(true);
    expect(validateNumberForColumn(45, 3, STANDARD_BINGO_RANGES)).toBe(false);
  });

  it('should validate O column (61-75)', () => {
    expect(validateNumberForColumn(61, 4, STANDARD_BINGO_RANGES)).toBe(true);
    expect(validateNumberForColumn(75, 4, STANDARD_BINGO_RANGES)).toBe(true);
    expect(validateNumberForColumn(60, 4, STANDARD_BINGO_RANGES)).toBe(false);
  });

  it('should return true for out of range columns', () => {
    expect(validateNumberForColumn(50, 5, STANDARD_BINGO_RANGES)).toBe(true);
    expect(validateNumberForColumn(50, -1, STANDARD_BINGO_RANGES)).toBe(true);
  });
});

describe('createCellResult', () => {
  it('should create a cell result with a number', () => {
    const result = createCellResult('42', 95, 0, 0);
    expect(result.number).toBe(42);
    expect(result.isFreeSpace).toBe(false);
    expect(result.confidence).toBe(95);
    expect(result.rawText).toBe('42');
    expect(result.position).toEqual({ row: 0, col: 0 });
  });

  it('should detect FREE space in center cell', () => {
    const result = createCellResult('FREE', 90, 2, 2, {
      hasFreeSpace: true,
      gridSize: { rows: 5, cols: 5 },
    });
    expect(result.number).toBeNull();
    expect(result.isFreeSpace).toBe(true);
  });

  it('should mark center cell as FREE even if it has a number', () => {
    const result = createCellResult('42', 90, 2, 2, {
      hasFreeSpace: true,
      gridSize: { rows: 5, cols: 5 },
    });
    expect(result.number).toBeNull();
    expect(result.isFreeSpace).toBe(true);
  });

  it('should not mark center as FREE when hasFreeSpace is false', () => {
    const result = createCellResult('42', 90, 2, 2, {
      hasFreeSpace: false,
      gridSize: { rows: 5, cols: 5 },
    });
    expect(result.number).toBe(42);
    expect(result.isFreeSpace).toBe(false);
  });

  it('should handle unreadable cells', () => {
    const result = createCellResult('???', 20, 0, 0);
    expect(result.number).toBeNull();
    expect(result.isFreeSpace).toBe(false);
  });
});

describe('cellsToGrid', () => {
  it('should convert cells to a 2D grid', () => {
    const cells = [
      { number: 1, isFreeSpace: false, confidence: 90, rawText: '1', position: { row: 0, col: 0 } },
      { number: 2, isFreeSpace: false, confidence: 90, rawText: '2', position: { row: 0, col: 1 } },
      { number: 3, isFreeSpace: false, confidence: 90, rawText: '3', position: { row: 1, col: 0 } },
      { number: 4, isFreeSpace: false, confidence: 90, rawText: '4', position: { row: 1, col: 1 } },
    ];

    const grid = cellsToGrid(cells, { rows: 2, cols: 2 });
    expect(grid).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('should handle FREE spaces (null values)', () => {
    const cells = [
      { number: 1, isFreeSpace: false, confidence: 90, rawText: '1', position: { row: 0, col: 0 } },
      { number: null, isFreeSpace: true, confidence: 90, rawText: 'FREE', position: { row: 0, col: 1 } },
    ];

    const grid = cellsToGrid(cells, { rows: 1, cols: 2 });
    expect(grid).toEqual([[1, null]]);
  });

  it('should handle missing cells', () => {
    const cells = [
      { number: 1, isFreeSpace: false, confidence: 90, rawText: '1', position: { row: 0, col: 0 } },
    ];

    const grid = cellsToGrid(cells, { rows: 2, cols: 2 });
    expect(grid).toEqual([
      [1, null],
      [null, null],
    ]);
  });

  it('should ignore cells outside grid bounds', () => {
    const cells = [
      { number: 1, isFreeSpace: false, confidence: 90, rawText: '1', position: { row: 0, col: 0 } },
      { number: 99, isFreeSpace: false, confidence: 90, rawText: '99', position: { row: 5, col: 5 } },
    ];

    const grid = cellsToGrid(cells, { rows: 2, cols: 2 });
    expect(grid).toEqual([
      [1, null],
      [null, null],
    ]);
  });
});

describe('gridToArray', () => {
  it('should flatten a 2D grid to an array', () => {
    const grid = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    expect(gridToArray(grid)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should handle null values', () => {
    const grid = [
      [1, null, 3],
      [4, 5, null],
    ];
    expect(gridToArray(grid)).toEqual([1, null, 3, 4, 5, null]);
  });

  it('should handle empty grid', () => {
    expect(gridToArray([])).toEqual([]);
  });

  it('should handle single row', () => {
    expect(gridToArray([[1, 2, 3]])).toEqual([1, 2, 3]);
  });
});

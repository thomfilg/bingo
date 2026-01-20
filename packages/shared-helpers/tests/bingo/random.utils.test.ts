import { describe, expect, it } from 'vitest';

import {
  getRandomInt,
  getRandomNumbersInRange,
  shuffleArray,
} from '../../src/bingo/generator/utils/random.utils';

describe('random.utils', () => {
  describe('getRandomInt', () => {
    it('should return a number within the specified range', () => {
      for (let i = 0; i < 100; i++) {
        const result = getRandomInt(1, 10);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
      }
    });

    it('should return the same number when min equals max', () => {
      const result = getRandomInt(5, 5);
      expect(result).toBe(5);
    });

    it('should handle negative numbers', () => {
      for (let i = 0; i < 100; i++) {
        const result = getRandomInt(-10, -1);
        expect(result).toBeGreaterThanOrEqual(-10);
        expect(result).toBeLessThanOrEqual(-1);
      }
    });

    it('should handle mixed positive and negative numbers', () => {
      for (let i = 0; i < 100; i++) {
        const result = getRandomInt(-5, 5);
        expect(result).toBeGreaterThanOrEqual(-5);
        expect(result).toBeLessThanOrEqual(5);
      }
    });

    it('should return integers only', () => {
      for (let i = 0; i < 100; i++) {
        const result = getRandomInt(1, 100);
        expect(Number.isInteger(result)).toBe(true);
      }
    });
  });

  describe('getRandomNumbersInRange', () => {
    it('should return exactly the requested count of numbers', () => {
      const result = getRandomNumbersInRange(1, 15, 5);
      expect(result).toHaveLength(5);
    });

    it('should return numbers within the specified range', () => {
      const result = getRandomNumbersInRange(1, 15, 5);
      result.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(15);
      });
    });

    it('should return unique numbers', () => {
      const result = getRandomNumbersInRange(1, 15, 5);
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });

    it('should return all numbers in range when count equals range size', () => {
      const result = getRandomNumbersInRange(1, 5, 5);
      expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should throw error when count exceeds range size', () => {
      expect(() => getRandomNumbersInRange(1, 5, 10)).toThrow();
    });

    it('should return empty array when count is 0', () => {
      const result = getRandomNumbersInRange(1, 15, 0);
      expect(result).toHaveLength(0);
    });

    it('should handle column ranges for 75-ball bingo', () => {
      // B column: 1-15
      const bColumn = getRandomNumbersInRange(1, 15, 5);
      expect(bColumn).toHaveLength(5);
      bColumn.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(15);
      });

      // I column: 16-30
      const iColumn = getRandomNumbersInRange(16, 30, 5);
      expect(iColumn).toHaveLength(5);
      iColumn.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(16);
        expect(num).toBeLessThanOrEqual(30);
      });
    });

    it('should handle column ranges for 90-ball bingo', () => {
      // First column: 1-9
      const col0 = getRandomNumbersInRange(1, 9, 3);
      expect(col0).toHaveLength(3);
      col0.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(9);
      });

      // Last column: 80-90
      const col8 = getRandomNumbersInRange(80, 90, 3);
      expect(col8).toHaveLength(3);
      col8.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(80);
        expect(num).toBeLessThanOrEqual(90);
      });
    });
  });

  describe('shuffleArray', () => {
    it('should return an array of the same length', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray([...original]);
      expect(shuffled).toHaveLength(original.length);
    });

    it('should contain all original elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray([...original]);
      expect(shuffled.sort((a, b) => a - b)).toEqual(original.sort((a, b) => a - b));
    });

    it('should not mutate the original array', () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];
      shuffleArray(copy);
      // The function returns a new shuffled array, original should be preserved
      expect(original).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle empty array', () => {
      const result = shuffleArray([]);
      expect(result).toEqual([]);
    });

    it('should handle single element array', () => {
      const result = shuffleArray([1]);
      expect(result).toEqual([1]);
    });

    it('should produce different orderings over multiple calls', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = new Set<string>();

      // Run multiple shuffles and collect unique orderings
      for (let i = 0; i < 100; i++) {
        const shuffled = shuffleArray([...original]);
        results.add(JSON.stringify(shuffled));
      }

      // Should have multiple different orderings
      expect(results.size).toBeGreaterThan(1);
    });
  });
});

import { describe, expect, it } from 'vitest';

import type { GeneratedCell } from '../../src/bingo/generator/generator.interface';
import { Strategy5x5 } from '../../src/bingo/generator/strategies/5x5.strategy';

describe('Strategy5x5 (75-ball Bingo)', () => {
  let strategy: Strategy5x5;

  beforeEach(() => {
    strategy = new Strategy5x5();
  });

  describe('config', () => {
    it('should have correct format identifier', () => {
      expect(strategy.format).toBe('5x5');
    });

    it('should have 5 rows and 5 columns', () => {
      expect(strategy.config.rows).toBe(5);
      expect(strategy.config.columns).toBe(5);
    });

    it('should have 25 total cells', () => {
      expect(strategy.config.totalCells).toBe(25);
    });

    it('should have a free space at index 12 (center)', () => {
      expect(strategy.config.hasFreeSpace).toBe(true);
      expect(strategy.config.freeSpaceIndex).toBe(12);
    });

    it('should have correct column ranges (B:1-15, I:16-30, N:31-45, G:46-60, O:61-75)', () => {
      const ranges = strategy.config.columnRanges;
      expect(ranges).toHaveLength(5);

      // B column (0): 1-15
      expect(ranges[0]).toEqual({ column: 0, min: 1, max: 15 });
      // I column (1): 16-30
      expect(ranges[1]).toEqual({ column: 1, min: 16, max: 30 });
      // N column (2): 31-45
      expect(ranges[2]).toEqual({ column: 2, min: 31, max: 45 });
      // G column (3): 46-60
      expect(ranges[3]).toEqual({ column: 3, min: 46, max: 60 });
      // O column (4): 61-75
      expect(ranges[4]).toEqual({ column: 4, min: 61, max: 75 });
    });
  });

  describe('generateCells', () => {
    it('should generate exactly 25 cells', () => {
      const cells = strategy.generateCells();
      expect(cells).toHaveLength(25);
    });

    it('should have cell indices from 0 to 24', () => {
      const cells = strategy.generateCells();
      const indices = cells.map(cell => cell.index);
      expect(indices).toEqual([...Array(25).keys()]);
    });

    it('should have a free space at index 12 (center)', () => {
      const cells = strategy.generateCells();
      const centerCell = cells[12];
      expect(centerCell.type).toBe('free');
      expect(centerCell.value).toBeNull();
      expect(centerCell.index).toBe(12);
    });

    it('should have 24 number cells and 1 free cell', () => {
      const cells = strategy.generateCells();
      const numberCells = cells.filter(cell => cell.type === 'number');
      const freeCells = cells.filter(cell => cell.type === 'free');

      expect(numberCells).toHaveLength(24);
      expect(freeCells).toHaveLength(1);
    });

    describe('column distribution', () => {
      const getColumnCells = (cells: GeneratedCell[], column: number): GeneratedCell[] => {
        return cells.filter((_, index) => index % 5 === column);
      };

      it('should have B column (0) values between 1-15', () => {
        const cells = strategy.generateCells();
        const bColumn = getColumnCells(cells, 0);

        expect(bColumn).toHaveLength(5);
        bColumn.forEach(cell => {
          expect(cell.type).toBe('number');
          expect(cell.value).toBeGreaterThanOrEqual(1);
          expect(cell.value).toBeLessThanOrEqual(15);
        });
      });

      it('should have I column (1) values between 16-30', () => {
        const cells = strategy.generateCells();
        const iColumn = getColumnCells(cells, 1);

        expect(iColumn).toHaveLength(5);
        iColumn.forEach(cell => {
          expect(cell.type).toBe('number');
          expect(cell.value).toBeGreaterThanOrEqual(16);
          expect(cell.value).toBeLessThanOrEqual(30);
        });
      });

      it('should have N column (2) values between 31-45 (except center)', () => {
        const cells = strategy.generateCells();
        const nColumn = getColumnCells(cells, 2);

        expect(nColumn).toHaveLength(5);
        nColumn.forEach(cell => {
          if (cell.index === 12) {
            expect(cell.type).toBe('free');
            expect(cell.value).toBeNull();
          } else {
            expect(cell.type).toBe('number');
            expect(cell.value).toBeGreaterThanOrEqual(31);
            expect(cell.value).toBeLessThanOrEqual(45);
          }
        });
      });

      it('should have G column (3) values between 46-60', () => {
        const cells = strategy.generateCells();
        const gColumn = getColumnCells(cells, 3);

        expect(gColumn).toHaveLength(5);
        gColumn.forEach(cell => {
          expect(cell.type).toBe('number');
          expect(cell.value).toBeGreaterThanOrEqual(46);
          expect(cell.value).toBeLessThanOrEqual(60);
        });
      });

      it('should have O column (4) values between 61-75', () => {
        const cells = strategy.generateCells();
        const oColumn = getColumnCells(cells, 4);

        expect(oColumn).toHaveLength(5);
        oColumn.forEach(cell => {
          expect(cell.type).toBe('number');
          expect(cell.value).toBeGreaterThanOrEqual(61);
          expect(cell.value).toBeLessThanOrEqual(75);
        });
      });
    });

    describe('uniqueness within columns', () => {
      it('should have unique values within each column', () => {
        const cells = strategy.generateCells();

        for (let col = 0; col < 5; col++) {
          const columnCells = cells.filter((_, index) => index % 5 === col);
          const values = columnCells
            .filter(cell => cell.type === 'number')
            .map(cell => cell.value);
          const uniqueValues = new Set(values);

          expect(uniqueValues.size).toBe(values.length);
        }
      });

      it('should have no duplicate values across the entire card', () => {
        const cells = strategy.generateCells();
        const values = cells
          .filter(cell => cell.type === 'number')
          .map(cell => cell.value);
        const uniqueValues = new Set(values);

        expect(uniqueValues.size).toBe(values.length);
      });
    });

    describe('sorting within columns', () => {
      it('should have numbers sorted ascending within each column', () => {
        const cells = strategy.generateCells();

        for (let col = 0; col < 5; col++) {
          const columnCells = cells.filter((_, index) => index % 5 === col);
          const values = columnCells
            .filter(cell => cell.type === 'number')
            .map(cell => cell.value as number);

          // Check that values are sorted ascending
          for (let i = 0; i < values.length - 1; i++) {
            expect(values[i]).toBeLessThan(values[i + 1]);
          }
        }
      });
    });

    describe('randomness', () => {
      it('should generate different cards on multiple calls', () => {
        const cards = new Set<string>();

        for (let i = 0; i < 100; i++) {
          const cells = strategy.generateCells();
          const cardHash = cells
            .map(cell => cell.value ?? 'FREE')
            .join(',');
          cards.add(cardHash);
        }

        // Should have multiple unique cards
        expect(cards.size).toBeGreaterThan(1);
      });
    });
  });
});

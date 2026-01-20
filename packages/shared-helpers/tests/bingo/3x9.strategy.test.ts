import { describe, expect, it } from 'vitest';

import type { GeneratedCell } from '../../src/bingo/generator/generator.interface';
import { Strategy3x9 } from '../../src/bingo/generator/strategies/3x9.strategy';

describe('Strategy3x9 (90-ball Bingo)', () => {
  let strategy: Strategy3x9;

  beforeEach(() => {
    strategy = new Strategy3x9();
  });

  describe('config', () => {
    it('should have correct format identifier', () => {
      expect(strategy.format).toBe('3x9');
    });

    it('should have 3 rows and 9 columns', () => {
      expect(strategy.config.rows).toBe(3);
      expect(strategy.config.columns).toBe(9);
    });

    it('should have 27 total cells', () => {
      expect(strategy.config.totalCells).toBe(27);
    });

    it('should NOT have a free space', () => {
      expect(strategy.config.hasFreeSpace).toBe(false);
      expect(strategy.config.freeSpaceIndex).toBeUndefined();
    });

    it('should have correct column ranges for 90-ball bingo', () => {
      const ranges = strategy.config.columnRanges;
      expect(ranges).toHaveLength(9);

      // Column 0: 1-9
      expect(ranges[0]).toEqual({ column: 0, min: 1, max: 9 });
      // Column 1: 10-19
      expect(ranges[1]).toEqual({ column: 1, min: 10, max: 19 });
      // Column 2: 20-29
      expect(ranges[2]).toEqual({ column: 2, min: 20, max: 29 });
      // Column 3: 30-39
      expect(ranges[3]).toEqual({ column: 3, min: 30, max: 39 });
      // Column 4: 40-49
      expect(ranges[4]).toEqual({ column: 4, min: 40, max: 49 });
      // Column 5: 50-59
      expect(ranges[5]).toEqual({ column: 5, min: 50, max: 59 });
      // Column 6: 60-69
      expect(ranges[6]).toEqual({ column: 6, min: 60, max: 69 });
      // Column 7: 70-79
      expect(ranges[7]).toEqual({ column: 7, min: 70, max: 79 });
      // Column 8: 80-90
      expect(ranges[8]).toEqual({ column: 8, min: 80, max: 90 });
    });
  });

  describe('generateCells', () => {
    it('should generate exactly 27 cells', () => {
      const cells = strategy.generateCells();
      expect(cells).toHaveLength(27);
    });

    it('should have cell indices from 0 to 26', () => {
      const cells = strategy.generateCells();
      const indices = cells.map(cell => cell.index);
      expect(indices).toEqual([...Array(27).keys()]);
    });

    it('should have no free space cells', () => {
      const cells = strategy.generateCells();
      const freeCells = cells.filter(cell => cell.type === 'free');
      expect(freeCells).toHaveLength(0);
    });

    describe('row rules (5 numbers, 4 blanks per row)', () => {
      const getRowCells = (cells: GeneratedCell[], row: number): GeneratedCell[] => {
        return cells.slice(row * 9, (row + 1) * 9);
      };

      it('should have exactly 5 numbers in row 0', () => {
        const cells = strategy.generateCells();
        const row0 = getRowCells(cells, 0);
        const numberCells = row0.filter(cell => cell.type === 'number');
        const blankCells = row0.filter(cell => cell.type === 'blank');

        expect(numberCells).toHaveLength(5);
        expect(blankCells).toHaveLength(4);
      });

      it('should have exactly 5 numbers in row 1', () => {
        const cells = strategy.generateCells();
        const row1 = getRowCells(cells, 1);
        const numberCells = row1.filter(cell => cell.type === 'number');
        const blankCells = row1.filter(cell => cell.type === 'blank');

        expect(numberCells).toHaveLength(5);
        expect(blankCells).toHaveLength(4);
      });

      it('should have exactly 5 numbers in row 2', () => {
        const cells = strategy.generateCells();
        const row2 = getRowCells(cells, 2);
        const numberCells = row2.filter(cell => cell.type === 'number');
        const blankCells = row2.filter(cell => cell.type === 'blank');

        expect(numberCells).toHaveLength(5);
        expect(blankCells).toHaveLength(4);
      });

      it('should have exactly 15 numbers total (5 per row x 3 rows)', () => {
        const cells = strategy.generateCells();
        const numberCells = cells.filter(cell => cell.type === 'number');
        expect(numberCells).toHaveLength(15);
      });

      it('should have exactly 12 blank cells total (4 per row x 3 rows)', () => {
        const cells = strategy.generateCells();
        const blankCells = cells.filter(cell => cell.type === 'blank');
        expect(blankCells).toHaveLength(12);
      });
    });

    describe('column rules (1-3 numbers per column)', () => {
      const getColumnCells = (cells: GeneratedCell[], column: number): GeneratedCell[] => {
        return cells.filter((_, index) => index % 9 === column);
      };

      it('should have 1-3 numbers in each column', () => {
        const cells = strategy.generateCells();

        for (let col = 0; col < 9; col++) {
          const columnCells = getColumnCells(cells, col);
          const numberCells = columnCells.filter(cell => cell.type === 'number');

          expect(numberCells.length).toBeGreaterThanOrEqual(1);
          expect(numberCells.length).toBeLessThanOrEqual(3);
        }
      });

      it('should have total of 15 numbers distributed across columns', () => {
        const cells = strategy.generateCells();
        let totalNumbers = 0;

        for (let col = 0; col < 9; col++) {
          const columnCells = getColumnCells(cells, col);
          const numberCells = columnCells.filter(cell => cell.type === 'number');
          totalNumbers += numberCells.length;
        }

        expect(totalNumbers).toBe(15);
      });

      it('should have numbers within correct ranges for each column', () => {
        const cells = strategy.generateCells();
        const ranges = [
          { min: 1, max: 9 },
          { min: 10, max: 19 },
          { min: 20, max: 29 },
          { min: 30, max: 39 },
          { min: 40, max: 49 },
          { min: 50, max: 59 },
          { min: 60, max: 69 },
          { min: 70, max: 79 },
          { min: 80, max: 90 },
        ];

        for (let col = 0; col < 9; col++) {
          const columnCells = getColumnCells(cells, col);
          const numberCells = columnCells.filter(cell => cell.type === 'number');

          numberCells.forEach(cell => {
            expect(cell.value).toBeGreaterThanOrEqual(ranges[col].min);
            expect(cell.value).toBeLessThanOrEqual(ranges[col].max);
          });
        }
      });
    });

    describe('sorting within columns', () => {
      it('should have numbers sorted ascending within each column', () => {
        const cells = strategy.generateCells();

        for (let col = 0; col < 9; col++) {
          const columnCells = cells.filter((_, index) => index % 9 === col);
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

    describe('uniqueness', () => {
      it('should have unique values within each column', () => {
        const cells = strategy.generateCells();

        for (let col = 0; col < 9; col++) {
          const columnCells = cells.filter((_, index) => index % 9 === col);
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

    describe('blank cells', () => {
      it('should have null value for blank cells', () => {
        const cells = strategy.generateCells();
        const blankCells = cells.filter(cell => cell.type === 'blank');

        blankCells.forEach(cell => {
          expect(cell.value).toBeNull();
        });
      });
    });

    describe('randomness', () => {
      it('should generate different cards on multiple calls', () => {
        const cards = new Set<string>();

        for (let i = 0; i < 100; i++) {
          const cells = strategy.generateCells();
          const cardHash = cells
            .map(cell => cell.value ?? 'BLANK')
            .join(',');
          cards.add(cardHash);
        }

        // Should have multiple unique cards
        expect(cards.size).toBeGreaterThan(1);
      });
    });

    describe('constraint validation', () => {
      it('should always satisfy all constraints over multiple generations', () => {
        // Run multiple generations to ensure constraints are always met
        for (let iteration = 0; iteration < 50; iteration++) {
          const cells = strategy.generateCells();

          // Check row constraints
          for (let row = 0; row < 3; row++) {
            const rowCells = cells.slice(row * 9, (row + 1) * 9);
            const numberCount = rowCells.filter(cell => cell.type === 'number').length;
            expect(numberCount).toBe(5);
          }

          // Check column constraints
          for (let col = 0; col < 9; col++) {
            const colCells = cells.filter((_, index) => index % 9 === col);
            const numberCount = colCells.filter(cell => cell.type === 'number').length;
            expect(numberCount).toBeGreaterThanOrEqual(1);
            expect(numberCount).toBeLessThanOrEqual(3);
          }
        }
      });
    });
  });
});

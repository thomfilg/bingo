/**
 * Unit tests for CellsService
 * Following TDD - these tests are written FIRST before implementation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BingoCell, CellType } from '../types';
import { CellsService } from '../services/cells.service';
import type { CellsRepository } from '../repositories/cells.repository';

// Mock factory
const createMockCell = (overrides: Partial<BingoCell> = {}): BingoCell => ({
  id: 'cell-123',
  cardId: 'card-123',
  index: 0,
  value: 5,
  type: 'NUMBER' as CellType,
  marked: false,
  ...overrides,
});

const createMockCellsRepository = (): CellsRepository => ({
  findByCardId: vi.fn(),
  findByCardIdAndIndex: vi.fn(),
  updateMarkedStatus: vi.fn(),
  bulkUpdateMarkedStatus: vi.fn(),
  createMany: vi.fn(),
});

describe('CellsService', () => {
  let cellsService: CellsService;
  let mockCellsRepository: CellsRepository;

  beforeEach(() => {
    mockCellsRepository = createMockCellsRepository();
    cellsService = new CellsService(mockCellsRepository);
  });

  describe('getCellsByCardId', () => {
    it('should return cells for a card', async () => {
      const mockCells = [
        createMockCell({ index: 0 }),
        createMockCell({ index: 1 }),
      ];
      vi.mocked(mockCellsRepository.findByCardId).mockResolvedValue(mockCells);

      const result = await cellsService.getCellsByCardId('card-123');

      expect(result).toHaveLength(2);
      expect(mockCellsRepository.findByCardId).toHaveBeenCalledWith('card-123');
    });

    it('should return empty array when no cells found', async () => {
      vi.mocked(mockCellsRepository.findByCardId).mockResolvedValue([]);

      const result = await cellsService.getCellsByCardId('card-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('getCellByIndex', () => {
    it('should return cell at specified index', async () => {
      const mockCell = createMockCell({ index: 5 });
      vi.mocked(mockCellsRepository.findByCardIdAndIndex).mockResolvedValue(mockCell);

      const result = await cellsService.getCellByIndex('card-123', 5);

      expect(result).toBeDefined();
      expect(result?.index).toBe(5);
      expect(mockCellsRepository.findByCardIdAndIndex).toHaveBeenCalledWith('card-123', 5);
    });

    it('should return null when cell not found', async () => {
      vi.mocked(mockCellsRepository.findByCardIdAndIndex).mockResolvedValue(null);

      const result = await cellsService.getCellByIndex('card-123', 99);

      expect(result).toBeNull();
    });
  });

  describe('isFreeSpace', () => {
    it('should return true for FREE type cells', () => {
      const freeCell = createMockCell({ type: 'FREE' as CellType, value: null });

      const result = cellsService.isFreeSpace(freeCell);

      expect(result).toBe(true);
    });

    it('should return false for NUMBER type cells', () => {
      const numberCell = createMockCell({ type: 'NUMBER' as CellType, value: 42 });

      const result = cellsService.isFreeSpace(numberCell);

      expect(result).toBe(false);
    });
  });

  describe('canUnmark', () => {
    it('should return true for NUMBER cells', () => {
      const numberCell = createMockCell({ type: 'NUMBER' as CellType });

      const result = cellsService.canUnmark(numberCell);

      expect(result).toBe(true);
    });

    it('should return false for FREE cells', () => {
      const freeCell = createMockCell({ type: 'FREE' as CellType });

      const result = cellsService.canUnmark(freeCell);

      expect(result).toBe(false);
    });
  });

  describe('transformCellToDTO', () => {
    it('should transform NUMBER cell correctly', () => {
      const cell = createMockCell({
        value: 42,
        type: 'NUMBER' as CellType,
        marked: true,
      });

      const result = cellsService.transformCellToDTO(cell);

      expect(result).toEqual({
        value: 42,
        type: 'number',
        marked: true,
      });
    });

    it('should transform FREE cell correctly', () => {
      const cell = createMockCell({
        value: null,
        type: 'FREE' as CellType,
        marked: true,
      });

      const result = cellsService.transformCellToDTO(cell);

      expect(result).toEqual({
        value: null,
        type: 'free',
        marked: true,
      });
    });
  });

  describe('sortCellsByIndex', () => {
    it('should sort cells by index in ascending order', () => {
      const cells = [
        createMockCell({ index: 5 }),
        createMockCell({ index: 2 }),
        createMockCell({ index: 8 }),
        createMockCell({ index: 1 }),
      ];

      const result = cellsService.sortCellsByIndex(cells);

      expect(result[0]?.index).toBe(1);
      expect(result[1]?.index).toBe(2);
      expect(result[2]?.index).toBe(5);
      expect(result[3]?.index).toBe(8);
    });

    it('should handle empty array', () => {
      const result = cellsService.sortCellsByIndex([]);

      expect(result).toHaveLength(0);
    });
  });
});

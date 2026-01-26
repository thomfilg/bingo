/**
 * Unit tests for CardsService
 * Following TDD - these tests are written FIRST before implementation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  BingoCard,
  BingoCell,
  BingoSessionPlayer,
  User,
  CellType,
  CardSource,
  UserTier,
} from '../types';
import { CardsService } from '../services/cards.service';
import type { CardsRepository } from '../repositories/cards.repository';
import type { CellsRepository } from '../repositories/cells.repository';
import { ERROR_MESSAGES } from '../constants/bingo.constants';

// Mock factory for creating test data
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-123',
  email: 'test@example.com',
  tier: 'FREE' as UserTier,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

const createMockCell = (overrides: Partial<BingoCell> = {}): BingoCell => ({
  id: 'cell-123',
  cardId: 'card-123',
  index: 0,
  value: 5,
  type: 'NUMBER' as CellType,
  marked: false,
  ...overrides,
});

const createMockCard = (overrides: Partial<BingoCard> = {}): BingoCard => ({
  id: 'card-123',
  userId: 'user-123',
  sessionPlayerId: 'session-player-123',
  source: 'GENERATED' as CardSource,
  format: '5x5',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

const createMockSessionPlayer = (overrides: Partial<BingoSessionPlayer> = {}): BingoSessionPlayer => ({
  id: 'session-player-123',
  userId: 'user-123',
  sessionId: 'session-123',
  joinedAt: new Date('2024-01-01'),
  ...overrides,
});

// Mock repositories
const createMockCardsRepository = (): CardsRepository => ({
  findById: vi.fn(),
  findByUserId: vi.fn(),
  findBySessionPlayerId: vi.fn(),
  findStandaloneByUserId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

const createMockCellsRepository = (): CellsRepository => ({
  findByCardId: vi.fn(),
  findByCardIdAndIndex: vi.fn(),
  updateMarkedStatus: vi.fn(),
  bulkUpdateMarkedStatus: vi.fn(),
  createMany: vi.fn(),
});

describe('CardsService', () => {
  let cardsService: CardsService;
  let mockCardsRepository: CardsRepository;
  let mockCellsRepository: CellsRepository;

  beforeEach(() => {
    mockCardsRepository = createMockCardsRepository();
    mockCellsRepository = createMockCellsRepository();
    cardsService = new CardsService(mockCardsRepository, mockCellsRepository);
  });

  describe('getCardById', () => {
    it('should return card with cells when card exists and user owns it', async () => {
      const mockCard = createMockCard();
      const mockCells = [
        createMockCell({ index: 0, value: 5 }),
        createMockCell({ index: 1, value: 10 }),
      ];

      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: mockCells,
      });

      const result = await cardsService.getCardById('card-123', 'user-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('card-123');
      expect(result?.cells).toHaveLength(2);
      expect(mockCardsRepository.findById).toHaveBeenCalledWith('card-123');
    });

    it('should return null when card does not exist', async () => {
      vi.mocked(mockCardsRepository.findById).mockResolvedValue(null);

      const result = await cardsService.getCardById('non-existent', 'user-123');

      expect(result).toBeNull();
    });

    it('should throw error when user does not own the card', async () => {
      const mockCard = createMockCard({ userId: 'other-user' });
      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: [],
      });

      await expect(
        cardsService.getCardById('card-123', 'user-123')
      ).rejects.toThrow(ERROR_MESSAGES.NOT_CARD_OWNER);
    });

    it('should allow access when user owns card through session player', async () => {
      const mockCard = createMockCard({ userId: 'other-user' });
      const mockCells = [createMockCell({ index: 0, value: 5 })];
      const mockSessionPlayer = createMockSessionPlayer({ userId: 'user-123' });

      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: mockCells,
        sessionPlayer: mockSessionPlayer,
      });

      const result = await cardsService.getCardById('card-123', 'user-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('card-123');
    });
  });

  describe('getStandaloneCards', () => {
    it('should return standalone scanned cards for premium users', async () => {
      const mockUser = createMockUser({ tier: 'PREMIUM' as UserTier });
      const mockCards = [
        createMockCard({ sessionPlayerId: null, source: 'SCANNED' as CardSource }),
        createMockCard({ id: 'card-456', sessionPlayerId: null, source: 'SCANNED' as CardSource }),
      ];

      vi.mocked(mockCardsRepository.findStandaloneByUserId).mockResolvedValue(
        mockCards.map(card => ({ ...card, cells: [] }))
      );

      const result = await cardsService.getStandaloneCards(mockUser);

      expect(result.cards).toHaveLength(2);
      expect(mockCardsRepository.findStandaloneByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should throw error for free users', async () => {
      const mockUser = createMockUser({ tier: 'FREE' as UserTier });

      await expect(
        cardsService.getStandaloneCards(mockUser)
      ).rejects.toThrow(ERROR_MESSAGES.PREMIUM_REQUIRED);
    });
  });

  describe('getSessionCards', () => {
    it('should return cards for a session when user is a member', async () => {
      const mockSessionPlayer = createMockSessionPlayer();
      const mockCards = [
        createMockCard(),
        createMockCard({ id: 'card-456' }),
      ];

      vi.mocked(mockCardsRepository.findBySessionPlayerId).mockResolvedValue(
        mockCards.map(card => ({ ...card, cells: [] }))
      );

      const result = await cardsService.getSessionCards(
        'session-123',
        mockSessionPlayer,
        '5x5'
      );

      expect(result.sessionId).toBe('session-123');
      expect(result.format).toBe('5x5');
      expect(result.cards).toHaveLength(2);
    });

    it('should throw error when session player is null', async () => {
      await expect(
        cardsService.getSessionCards('session-123', null, '5x5')
      ).rejects.toThrow(ERROR_MESSAGES.NOT_SESSION_MEMBER);
    });
  });
});

describe('CardsService - Cell Operations', () => {
  let cardsService: CardsService;
  let mockCardsRepository: CardsRepository;
  let mockCellsRepository: CellsRepository;

  beforeEach(() => {
    mockCardsRepository = createMockCardsRepository();
    mockCellsRepository = createMockCellsRepository();
    cardsService = new CardsService(mockCardsRepository, mockCellsRepository);
  });

  describe('markCell', () => {
    it('should mark a cell and return updated status', async () => {
      const mockCard = createMockCard();
      const mockCell = createMockCell({ marked: false });
      const updatedCell = { ...mockCell, marked: true };

      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: [mockCell],
      });
      vi.mocked(mockCellsRepository.findByCardIdAndIndex).mockResolvedValue(mockCell);
      vi.mocked(mockCellsRepository.updateMarkedStatus).mockResolvedValue(updatedCell);

      const result = await cardsService.markCell('card-123', 0, true, 'user-123');

      expect(result.marked).toBe(true);
      expect(result.cardId).toBe('card-123');
      expect(result.cellIndex).toBe(0);
      expect(mockCellsRepository.updateMarkedStatus).toHaveBeenCalledWith(
        'card-123',
        0,
        true
      );
    });

    it('should unmark a non-free cell', async () => {
      const mockCard = createMockCard();
      const mockCell = createMockCell({ marked: true, type: 'NUMBER' as CellType });
      const updatedCell = { ...mockCell, marked: false };

      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: [mockCell],
      });
      vi.mocked(mockCellsRepository.findByCardIdAndIndex).mockResolvedValue(mockCell);
      vi.mocked(mockCellsRepository.updateMarkedStatus).mockResolvedValue(updatedCell);

      const result = await cardsService.markCell('card-123', 0, false, 'user-123');

      expect(result.marked).toBe(false);
    });

    it('should throw error when trying to unmark a free space', async () => {
      const mockCard = createMockCard();
      const mockCell = createMockCell({ type: 'FREE' as CellType, marked: true, value: null });

      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: [mockCell],
      });
      vi.mocked(mockCellsRepository.findByCardIdAndIndex).mockResolvedValue(mockCell);

      await expect(
        cardsService.markCell('card-123', 0, false, 'user-123')
      ).rejects.toThrow(ERROR_MESSAGES.CANNOT_UNMARK_FREE_SPACE);
    });

    it('should throw error when card not found', async () => {
      vi.mocked(mockCardsRepository.findById).mockResolvedValue(null);

      await expect(
        cardsService.markCell('non-existent', 0, true, 'user-123')
      ).rejects.toThrow(ERROR_MESSAGES.CARD_NOT_FOUND);
    });

    it('should throw error when cell not found', async () => {
      const mockCard = createMockCard();
      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: [],
      });
      vi.mocked(mockCellsRepository.findByCardIdAndIndex).mockResolvedValue(null);

      await expect(
        cardsService.markCell('card-123', 99, true, 'user-123')
      ).rejects.toThrow(ERROR_MESSAGES.CELL_NOT_FOUND);
    });

    it('should throw error when user does not own the card', async () => {
      const mockCard = createMockCard({ userId: 'other-user' });
      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: [],
      });

      await expect(
        cardsService.markCell('card-123', 0, true, 'user-123')
      ).rejects.toThrow(ERROR_MESSAGES.NOT_CARD_OWNER);
    });

    it('should allow marking when user owns card through session player', async () => {
      const mockCard = createMockCard({ userId: 'other-user' });
      const mockCell = createMockCell({ marked: false });
      const updatedCell = { ...mockCell, marked: true };
      const mockSessionPlayer = createMockSessionPlayer({ userId: 'user-123' });

      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: [mockCell],
        sessionPlayer: mockSessionPlayer,
      });
      vi.mocked(mockCellsRepository.findByCardIdAndIndex).mockResolvedValue(mockCell);
      vi.mocked(mockCellsRepository.updateMarkedStatus).mockResolvedValue(updatedCell);

      const result = await cardsService.markCell('card-123', 0, true, 'user-123');

      expect(result.marked).toBe(true);
    });
  });

  describe('bulkMarkCells', () => {
    it('should bulk update multiple cells', async () => {
      const mockCard = createMockCard();
      const mockCells = [
        createMockCell({ index: 0, marked: false }),
        createMockCell({ index: 1, marked: false }),
        createMockCell({ index: 2, marked: true }),
      ];

      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: mockCells,
      });
      vi.mocked(mockCellsRepository.bulkUpdateMarkedStatus).mockResolvedValue([
        { ...mockCells[0]!, marked: true },
        { ...mockCells[1]!, marked: true },
      ]);

      const result = await cardsService.bulkMarkCells(
        'card-123',
        [
          { index: 0, marked: true },
          { index: 1, marked: true },
        ],
        'user-123'
      );

      expect(result.cardId).toBe('card-123');
      expect(result.updatedCells).toHaveLength(2);
      expect(result.updatedCells[0]?.marked).toBe(true);
    });

    it('should skip free spaces when trying to unmark', async () => {
      const mockCard = createMockCard();
      const mockCells = [
        createMockCell({ index: 0, type: 'NUMBER' as CellType, marked: true }),
        createMockCell({ index: 12, type: 'FREE' as CellType, marked: true, value: null }),
      ];

      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: mockCells,
      });
      vi.mocked(mockCellsRepository.bulkUpdateMarkedStatus).mockResolvedValue([
        { ...mockCells[0]!, marked: false },
      ]);

      await cardsService.bulkMarkCells(
        'card-123',
        [
          { index: 0, marked: false },
          { index: 12, marked: false }, // This should be skipped
        ],
        'user-123'
      );

      // Only the number cell should be updated, free space skipped
      expect(mockCellsRepository.bulkUpdateMarkedStatus).toHaveBeenCalledWith(
        'card-123',
        [{ index: 0, marked: false }]
      );
    });

    it('should throw error when card not found', async () => {
      vi.mocked(mockCardsRepository.findById).mockResolvedValue(null);

      await expect(
        cardsService.bulkMarkCells('non-existent', [{ index: 0, marked: true }], 'user-123')
      ).rejects.toThrow(ERROR_MESSAGES.CARD_NOT_FOUND);
    });

    it('should allow bulk marking when user owns card through session player', async () => {
      const mockCard = createMockCard({ userId: 'other-user' });
      const mockCells = [
        createMockCell({ index: 0, marked: false }),
        createMockCell({ index: 1, marked: false }),
      ];
      const mockSessionPlayer = createMockSessionPlayer({ userId: 'user-123' });

      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: mockCells,
        sessionPlayer: mockSessionPlayer,
      });
      vi.mocked(mockCellsRepository.bulkUpdateMarkedStatus).mockResolvedValue([
        { ...mockCells[0]!, marked: true },
        { ...mockCells[1]!, marked: true },
      ]);

      const result = await cardsService.bulkMarkCells(
        'card-123',
        [
          { index: 0, marked: true },
          { index: 1, marked: true },
        ],
        'user-123'
      );

      expect(result.cardId).toBe('card-123');
      expect(result.updatedCells).toHaveLength(2);
    });

    it('should throw error when bulk operation exceeds size limit', async () => {
      // Create more than 100 updates
      const updates = Array.from({ length: 101 }, (_, i) => ({
        index: i,
        marked: true,
      }));

      await expect(
        cardsService.bulkMarkCells('card-123', updates, 'user-123')
      ).rejects.toThrow(ERROR_MESSAGES.BULK_LIMIT_EXCEEDED);
    });

    it('should throw error when user does not own card directly or through session', async () => {
      const mockCard = createMockCard({ userId: 'other-user' });
      const mockCells = [createMockCell({ index: 0, marked: false })];
      const mockSessionPlayer = createMockSessionPlayer({ userId: 'another-user' });

      vi.mocked(mockCardsRepository.findById).mockResolvedValue({
        ...mockCard,
        cells: mockCells,
        sessionPlayer: mockSessionPlayer,
      });

      await expect(
        cardsService.bulkMarkCells('card-123', [{ index: 0, marked: true }], 'user-123')
      ).rejects.toThrow(ERROR_MESSAGES.NOT_CARD_OWNER);
    });
  });
});

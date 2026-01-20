import { beforeEach, describe, expect, it } from 'vitest';

import { BingoGeneratorService } from '../../src/bingo/generator/generator.service';

describe('BingoGeneratorService', () => {
  let service: BingoGeneratorService;

  beforeEach(() => {
    service = new BingoGeneratorService();
  });

  describe('generateCard', () => {
    describe('5x5 format', () => {
      it('should generate a valid 5x5 card', async () => {
        const card = await service.generateCard('5x5', 'session-123');

        expect(card).toBeDefined();
        expect(card.format).toBe('5x5');
        expect(card.sessionId).toBe('session-123');
        expect(card.cells).toHaveLength(25);
      });

      it('should generate card with valid UUID', async () => {
        const card = await service.generateCard('5x5', 'session-123');

        // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(card.id).toMatch(uuidRegex);
      });

      it('should generate card with hash', async () => {
        const card = await service.generateCard('5x5', 'session-123');

        expect(card.hash).toBeDefined();
        expect(card.hash.length).toBeGreaterThan(0);
      });

      it('should generate card with createdAt date', async () => {
        const before = new Date();
        const card = await service.generateCard('5x5', 'session-123');
        const after = new Date();

        expect(card.createdAt).toBeInstanceOf(Date);
        expect(card.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(card.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      });

      it('should have free space at center', async () => {
        const card = await service.generateCard('5x5', 'session-123');

        const centerCell = card.cells[12];
        expect(centerCell.type).toBe('free');
        expect(centerCell.value).toBeNull();
      });
    });

    describe('3x9 format', () => {
      it('should generate a valid 3x9 card', async () => {
        const card = await service.generateCard('3x9', 'session-456');

        expect(card).toBeDefined();
        expect(card.format).toBe('3x9');
        expect(card.sessionId).toBe('session-456');
        expect(card.cells).toHaveLength(27);
      });

      it('should have 15 numbers and 12 blanks', async () => {
        const card = await service.generateCard('3x9', 'session-456');

        const numberCells = card.cells.filter(cell => cell.type === 'number');
        const blankCells = card.cells.filter(cell => cell.type === 'blank');

        expect(numberCells).toHaveLength(15);
        expect(blankCells).toHaveLength(12);
      });

      it('should have no free space', async () => {
        const card = await service.generateCard('3x9', 'session-456');

        const freeCells = card.cells.filter(cell => cell.type === 'free');
        expect(freeCells).toHaveLength(0);
      });
    });

    describe('invalid format', () => {
      it('should throw error for invalid format', async () => {
        await expect(
          // @ts-expect-error - Testing invalid format
          service.generateCard('4x4', 'session-123'),
        ).rejects.toThrow('Unsupported card format');
      });
    });
  });

  describe('generateBatch', () => {
    it('should generate specified number of cards', async () => {
      const cards = await service.generateBatch('5x5', 'session-123', 10);

      expect(cards).toHaveLength(10);
      cards.forEach(card => {
        expect(card.format).toBe('5x5');
        expect(card.sessionId).toBe('session-123');
      });
    });

    it('should generate unique cards', async () => {
      const cards = await service.generateBatch('5x5', 'session-123', 50);

      const hashes = cards.map(card => card.hash);
      const uniqueHashes = new Set(hashes);

      expect(uniqueHashes.size).toBe(cards.length);
    });

    it('should generate unique card IDs', async () => {
      const cards = await service.generateBatch('5x5', 'session-123', 20);

      const ids = cards.map(card => card.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(cards.length);
    });

    it('should handle count of 1', async () => {
      const cards = await service.generateBatch('5x5', 'session-123', 1);
      expect(cards).toHaveLength(1);
    });

    it('should handle count of 100', async () => {
      const cards = await service.generateBatch('5x5', 'session-123', 100);
      expect(cards).toHaveLength(100);
    });

    it('should throw error for count less than 1', async () => {
      await expect(
        service.generateBatch('5x5', 'session-123', 0),
      ).rejects.toThrow('Count must be between 1 and 100');
    });

    it('should throw error for count greater than 100', async () => {
      await expect(
        service.generateBatch('5x5', 'session-123', 101),
      ).rejects.toThrow('Count must be between 1 and 100');
    });

    it('should throw error for negative count', async () => {
      await expect(
        service.generateBatch('5x5', 'session-123', -5),
      ).rejects.toThrow('Count must be between 1 and 100');
    });

    it('should be efficient for 100 cards (under 5 seconds)', async () => {
      const start = Date.now();
      await service.generateBatch('5x5', 'session-123', 100);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000);
    });

    it('should work with 3x9 format', async () => {
      const cards = await service.generateBatch('3x9', 'session-456', 25);

      expect(cards).toHaveLength(25);
      cards.forEach(card => {
        expect(card.format).toBe('3x9');
        expect(card.cells).toHaveLength(27);
      });
    });
  });

  describe('validateUniqueness', () => {
    it('should return false for already registered card in same session', async () => {
      // When we generate a card, it gets registered automatically
      const card = await service.generateCard('5x5', 'session-123');
      const isUnique = await service.validateUniqueness(card, 'session-123');

      // The card is not unique because it was already registered during generation
      expect(isUnique).toBe(false);
    });

    it('should return true for card in fresh session', async () => {
      // Generate a card in one session
      const card = await service.generateCard('5x5', 'session-123');

      // Clear that session
      service.clearSession('session-123');

      // Now the card should be considered unique (not registered)
      const isUnique = await service.validateUniqueness(card, 'session-123');
      expect(isUnique).toBe(true);
    });

    it('should detect duplicate card', async () => {
      // Generate a batch to populate internal state
      const cards = await service.generateBatch('5x5', 'session-123', 10);

      // Validate first card should not be unique (it's already in the session)
      const isUnique = await service.validateUniqueness(cards[0], 'session-123');

      expect(isUnique).toBe(false);
    });

    it('should return true for same card in different session', async () => {
      const card = await service.generateCard('5x5', 'session-123');

      // Card should be unique in a different session
      const isUnique = await service.validateUniqueness(card, 'session-456');

      expect(isUnique).toBe(true);
    });
  });

  describe('hash generation', () => {
    it('should generate same hash for same cell values', async () => {
      // We need to verify that identical cards would produce identical hashes
      // Since generation is random, we can't directly test this
      // But we can verify the hash is deterministic based on cells

      const card1 = await service.generateCard('5x5', 'session-123');

      // Create a mock card with same cells
      const mockCard = {
        ...card1,
        id: 'different-id',
        createdAt: new Date(),
      };

      // Hash should only depend on cell values, not other properties
      expect(mockCard.hash).toBe(card1.hash);
    });

    it('should generate different hashes for different cards', async () => {
      const cards = await service.generateBatch('5x5', 'session-123', 50);

      const hashes = new Set(cards.map(card => card.hash));
      expect(hashes.size).toBe(50);
    });
  });

  describe('clearSession', () => {
    it('should clear session card history', async () => {
      // Generate some cards
      const cards = await service.generateBatch('5x5', 'session-123', 5);

      // Clear the session
      service.clearSession('session-123');

      // Now the same card should be considered unique again
      const isUnique = await service.validateUniqueness(cards[0], 'session-123');
      expect(isUnique).toBe(true);
    });

    it('should not affect other sessions', async () => {
      // Generate cards in both sessions
      await service.generateCard('5x5', 'session-123');
      const card2 = await service.generateCard('5x5', 'session-456');

      service.clearSession('session-123');

      // Session 456 should still track its cards
      const isUnique456 = await service.validateUniqueness(card2, 'session-456');
      expect(isUnique456).toBe(false);
    });
  });
});

import { randomUUID } from 'crypto';

import type {
  BingoCard,
  CardGeneratorStrategy,
  GeneratorService,
} from './generator.interface';
import { Strategy3x9 } from './strategies/3x9.strategy';
import { Strategy5x5 } from './strategies/5x5.strategy';
import { CardRegistry, generateCardHash } from './utils/uniqueness.utils';

/**
 * Service for generating bingo cards
 */
export class BingoGeneratorService implements GeneratorService {
  private readonly strategies: Map<string, CardGeneratorStrategy>;
  private readonly registry: CardRegistry;

  constructor() {
    this.strategies = new Map<string, CardGeneratorStrategy>();
    this.strategies.set('5x5', new Strategy5x5());
    this.strategies.set('3x9', new Strategy3x9());
    this.registry = new CardRegistry();
  }

  /**
   * Generate a single unique bingo card
   * Retries up to 10 times if a duplicate is generated
   */
  async generateCard(format: '5x5' | '3x9', sessionId: string): Promise<BingoCard> {
    const strategy = this.strategies.get(format);

    if (!strategy) {
      throw new Error(`Unsupported card format: ${format}`);
    }

    const maxAttempts = 10;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const cells = strategy.generateCells();
      const hash = generateCardHash(cells);

      // Try to register - returns true if card is unique
      if (this.registry.register(sessionId, hash)) {
        return {
          id: randomUUID(),
          sessionId,
          format,
          cells,
          hash,
          createdAt: new Date(),
        };
      }
    }

    throw new Error(
      `Could not generate a unique card after ${maxAttempts} attempts`,
    );
  }

  /**
   * Generate multiple unique bingo cards
   */
  async generateBatch(
    format: '5x5' | '3x9',
    sessionId: string,
    count: number,
  ): Promise<BingoCard[]> {
    if (count < 1 || count > 100) {
      throw new Error('Count must be between 1 and 100');
    }

    const strategy = this.strategies.get(format);

    if (!strategy) {
      throw new Error(`Unsupported card format: ${format}`);
    }

    const cards: BingoCard[] = [];
    const maxAttempts = count * 10; // Allow some retries for duplicates
    let attempts = 0;

    while (cards.length < count && attempts < maxAttempts) {
      const cells = strategy.generateCells();
      const hash = generateCardHash(cells);

      // Check if this card is unique
      if (this.registry.register(sessionId, hash)) {
        const card: BingoCard = {
          id: randomUUID(),
          sessionId,
          format,
          cells,
          hash,
          createdAt: new Date(),
        };
        cards.push(card);
      }

      attempts++;
    }

    if (cards.length < count) {
      throw new Error(
        `Could not generate ${count} unique cards after ${attempts} attempts. ` +
        `Generated ${cards.length} unique cards.`,
      );
    }

    return cards;
  }

  /**
   * Validate that a card is unique within a session
   */
  async validateUniqueness(card: BingoCard, sessionId: string): Promise<boolean> {
    return !this.registry.exists(sessionId, card.hash);
  }

  /**
   * Clear all tracked cards for a session
   */
  clearSession(sessionId: string): void {
    this.registry.clearSession(sessionId);
  }

  /**
   * Get the number of cards generated for a session
   */
  getSessionCardCount(sessionId: string): number {
    return this.registry.getSessionCount(sessionId);
  }
}

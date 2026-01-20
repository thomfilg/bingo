import type {
  CardFormatConfig,
  CardGeneratorStrategy,
  GeneratedCell,
} from '../generator.interface';

/**
 * Abstract base class for card generation strategies
 */
export abstract class BaseStrategy implements CardGeneratorStrategy {
  abstract readonly format: '5x5' | '3x9';
  abstract readonly config: CardFormatConfig;

  /**
   * Generate cells for a bingo card
   */
  abstract generateCells(): GeneratedCell[];

  /**
   * Create a number cell
   */
  protected createNumberCell(index: number, value: number): GeneratedCell {
    return {
      index,
      value,
      type: 'number',
    };
  }

  /**
   * Create a free space cell
   */
  protected createFreeCell(index: number): GeneratedCell {
    return {
      index,
      value: null,
      type: 'free',
    };
  }

  /**
   * Create a blank cell
   */
  protected createBlankCell(index: number): GeneratedCell {
    return {
      index,
      value: null,
      type: 'blank',
    };
  }
}

// Generator exports
export { BingoGeneratorService } from './generator/generator.service';
export type {
  BingoCard,
  CardFormatConfig,
  CardGeneratorStrategy,
  ColumnRange,
  GeneratedCell,
  GenerateCardsRequest,
  GenerateCardsResponse,
  GeneratorService,
} from './generator/generator.interface';

// Strategy exports
export { BaseStrategy } from './generator/strategies/base.strategy';
export { Strategy3x9 } from './generator/strategies/3x9.strategy';
export { Strategy5x5 } from './generator/strategies/5x5.strategy';

// Utility exports
export {
  getRandomInt,
  getRandomNumbersInRange,
  shuffleArray,
} from './generator/utils/random.utils';
export {
  CardRegistry,
  generateCardHash,
} from './generator/utils/uniqueness.utils';

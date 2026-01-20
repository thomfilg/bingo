import { describe, it, expect } from 'vitest';
import {
  BINGO_COLUMNS,
  STANDARD_BINGO_RANGES,
  DEFAULT_OPTIONS,
  DEFAULT_MULTI_CARD_OPTIONS,
} from '../types';

describe('BINGO_COLUMNS', () => {
  it('should contain all bingo column letters', () => {
    expect(BINGO_COLUMNS).toEqual(['B', 'I', 'N', 'G', 'O']);
  });

  it('should have exactly 5 elements', () => {
    expect(BINGO_COLUMNS).toHaveLength(5);
  });
});

describe('STANDARD_BINGO_RANGES', () => {
  it('should have correct range for B column (1-15)', () => {
    expect(STANDARD_BINGO_RANGES.B).toEqual({ min: 1, max: 15 });
  });

  it('should have correct range for I column (16-30)', () => {
    expect(STANDARD_BINGO_RANGES.I).toEqual({ min: 16, max: 30 });
  });

  it('should have correct range for N column (31-45)', () => {
    expect(STANDARD_BINGO_RANGES.N).toEqual({ min: 31, max: 45 });
  });

  it('should have correct range for G column (46-60)', () => {
    expect(STANDARD_BINGO_RANGES.G).toEqual({ min: 46, max: 60 });
  });

  it('should have correct range for O column (61-75)', () => {
    expect(STANDARD_BINGO_RANGES.O).toEqual({ min: 61, max: 75 });
  });

  it('should have all 5 columns', () => {
    expect(Object.keys(STANDARD_BINGO_RANGES)).toHaveLength(5);
  });
});

describe('DEFAULT_OPTIONS', () => {
  it('should have english as default language', () => {
    expect(DEFAULT_OPTIONS.language).toBe('eng');
  });

  it('should enable preprocessing by default', () => {
    expect(DEFAULT_OPTIONS.preprocess).toBe(true);
  });

  it('should have 60 as default confidence threshold', () => {
    expect(DEFAULT_OPTIONS.confidenceThreshold).toBe(60);
  });

  it('should have 5x5 as default grid size', () => {
    expect(DEFAULT_OPTIONS.gridSize).toEqual({ rows: 5, cols: 5 });
  });

  it('should have FREE space enabled by default', () => {
    expect(DEFAULT_OPTIONS.hasFreeSpace).toBe(true);
  });

  it('should have 1-75 as default number range', () => {
    expect(DEFAULT_OPTIONS.numberRange).toEqual({ min: 1, max: 75 });
  });
});

describe('DEFAULT_MULTI_CARD_OPTIONS', () => {
  it('should inherit base options', () => {
    expect(DEFAULT_MULTI_CARD_OPTIONS.language).toBe('eng');
    expect(DEFAULT_MULTI_CARD_OPTIONS.preprocess).toBe(true);
    expect(DEFAULT_MULTI_CARD_OPTIONS.gridSize).toEqual({ rows: 5, cols: 5 });
  });

  it('should have 5% as minimum card area percentage', () => {
    expect(DEFAULT_MULTI_CARD_OPTIONS.minCardAreaPercent).toBe(0.05);
  });

  it('should have 90% as maximum card area percentage', () => {
    expect(DEFAULT_MULTI_CARD_OPTIONS.maxCardAreaPercent).toBe(0.9);
  });
});

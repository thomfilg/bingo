import type { BingoCardStyleConfig } from './BingoCardStyle.types';

/**
 * Default style configuration for Bingo Card components.
 * Provides a clean, accessible appearance optimized for light mode.
 * For dark mode support, create a custom theme using BingoStyleProvider.
 */
export const defaultStyle: BingoCardStyleConfig = {
  id: 'default',
  name: 'Default',
  card: {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
    borderRadius: '12px',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    gap: '4px',
  },
  cell: {
    background: '#ffffff',
    backgroundMarked: '#4caf50',
    borderColor: '#e0e0e0',
    borderRadius: '8px',
    textColor: '#333333',
    textColorMarked: '#ffffff',
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  freeSpace: {
    background: '#ffd700',
    textColor: '#333333',
    label: 'FREE',
  },
};

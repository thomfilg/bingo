import type { ReactNode } from 'react';
import type { BingoCardStyleConfig } from '../styles';

/**
 * Value provided by the BingoStyleContext.
 */
export interface BingoStyleContextValue {
  /** Current style configuration */
  style: BingoCardStyleConfig;
}

/**
 * Props for the BingoStyleProvider component.
 */
export interface BingoStyleProviderProps {
  /** Custom theme to apply to all child BingoCard components */
  theme?: BingoCardStyleConfig;
  /** Child components */
  children: ReactNode;
}

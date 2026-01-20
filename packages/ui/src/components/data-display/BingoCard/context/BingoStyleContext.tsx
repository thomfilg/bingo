import { createContext, useContext, useMemo } from 'react';
import { defaultStyle } from '../styles';
import type {
  BingoStyleContextValue,
  BingoStyleProviderProps,
} from './BingoStyleContext.types';

/**
 * Context for providing Bingo card styling to child components.
 * When no provider is present, components use the default style.
 */
const BingoStyleContext = createContext<BingoStyleContextValue | undefined>(
  undefined
);

/**
 * Hook to access the current Bingo style configuration.
 * Falls back to default style when used outside a provider.
 *
 * @returns The current BingoStyleContextValue
 */
export function useBingoStyle(): BingoStyleContextValue {
  const context = useContext(BingoStyleContext);
  if (context === undefined) {
    return { style: defaultStyle };
  }
  return context;
}

/**
 * Provider component for customizing Bingo card styles.
 * Wrap BingoCardView or BingoCard components with this provider
 * to apply a custom theme.
 *
 * @example
 * ```tsx
 * <BingoStyleProvider theme={neonStyle}>
 *   <BingoCardView data={backendResponse} />
 * </BingoStyleProvider>
 * ```
 */
export function BingoStyleProvider({
  theme,
  children,
}: BingoStyleProviderProps) {
  const value = useMemo<BingoStyleContextValue>(
    () => ({
      style: theme ?? defaultStyle,
    }),
    [theme]
  );

  return (
    <BingoStyleContext.Provider value={value}>
      {children}
    </BingoStyleContext.Provider>
  );
}

BingoStyleProvider.displayName = 'BingoStyleProvider';

import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useMemo } from 'react';

import type { BingoCardComponentProps } from './BingoCard.types';
import { BingoCell } from './BingoCell';
import { useBingoStyle } from './context';
import type { BingoCardStyleConfig } from './styles';

export type { BingoCardComponentProps } from './BingoCard.types';

interface StyledCardProps {
  styleConfig: BingoCardStyleConfig;
  columns: number;
}

const StyledCard = styled(Box, {
  shouldForwardProp: (prop) =>
    !['styleConfig', 'columns'].includes(prop as string),
})<StyledCardProps>(({ styleConfig, columns }) => {
  const { card } = styleConfig;

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: card.gap,
    background: card.background,
    borderRadius: card.borderRadius,
    boxShadow: card.shadow,
    padding: card.gap,
    width: '100%',
    maxWidth: '400px',
  };
});

/**
 * BingoCard component renders a single bingo card grid.
 * Handles cell rendering and click interactions.
 *
 * @example
 * ```tsx
 * <BingoCard
 *   card={{
 *     id: 'card-1',
 *     cells: [
 *       { value: 1, type: 'number' },
 *       { value: null, type: 'free' },
 *       // ... more cells
 *     ]
 *   }}
 *   format={{ rows: 5, columns: 5 }}
 *   markedCells={new Set([0, 5, 10])}
 *   onCellClick={(index) => console.log('Clicked cell', index)}
 * />
 * ```
 */
export const BingoCard = React.memo(function BingoCard({
  card,
  format,
  markedCells = new Set(),
  onCellClick,
  'data-testid': dataTestId,
}: BingoCardComponentProps) {
  const { style } = useBingoStyle();
  const testId = dataTestId ?? `bingo-card-${card.id}`;

  // Pre-create click handlers for each cell to avoid inline functions
  const cellClickHandlers = useMemo(
    () =>
      card.cells.map((_, index) => () => {
        onCellClick?.(index);
      }),
    [card.cells.length, onCellClick]
  );

  return (
    <StyledCard
      styleConfig={style}
      columns={format.columns}
      role="group"
      aria-label={`Bingo card ${card.id}`}
      data-testid={testId}
      data-card-id={card.id}
    >
      {card.cells.map((cell, index) => (
        <BingoCell
          key={`${card.id}-cell-${index}`}
          cell={cell}
          index={index}
          marked={markedCells.has(index)}
          onClick={cellClickHandlers[index]}
          data-testid={`bingo-cell-${card.id}-${index}${cell.type === 'free' ? '-free' : ''}`}
        />
      ))}
    </StyledCard>
  );
});

BingoCard.displayName = 'BingoCard';

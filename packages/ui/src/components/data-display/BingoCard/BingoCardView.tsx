import { Box, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useCallback, useMemo, useState } from 'react';

import type { BingoFormat } from './BingoCard.types';
import { BingoCard } from './BingoCard';
import type { BingoCardViewProps } from './BingoCardView.types';
import { parseFormat } from './utils';

export type { BingoCardViewProps } from './BingoCardView.types';

const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  width: '100%',

  [theme.breakpoints.up('md')]: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    justifyItems: 'center',
  },
}));

const StyledScrollContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  overflowX: 'auto',
  paddingBottom: theme.spacing(1),
  scrollSnapType: 'x mandatory',

  '& > *': {
    scrollSnapAlign: 'start',
    flexShrink: 0,
  },

  // Hide scrollbar on mobile for cleaner look
  '&::-webkit-scrollbar': {
    height: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[100],
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[400],
    borderRadius: '3px',
    '&:hover': {
      background: theme.palette.grey[500],
    },
  },

  [theme.breakpoints.up('md')]: {
    display: 'contents',
  },
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const SkeletonCard = styled(Skeleton)(() => ({
  width: '100%',
  maxWidth: '400px',
  aspectRatio: '1 / 1',
  borderRadius: '12px',
}));

/**
 * BingoCardView component is a container that renders multiple bingo cards.
 * Handles card layout, responsive design, and cell marking state management.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <BingoCardView
 *   data={backendResponse}
 *   onCellMark={(cardId, cellIndex, marked) => {
 *     console.log(`Card ${cardId}, cell ${cellIndex}: ${marked}`);
 *   }}
 * />
 *
 * // With custom theme
 * <BingoStyleProvider theme={neonStyle}>
 *   <BingoCardView data={backendResponse} />
 * </BingoStyleProvider>
 * ```
 */
export function BingoCardView({
  data,
  onCellMark,
  'data-testid': dataTestId = 'bingo-card-view',
}: BingoCardViewProps) {
  // Parse format from backend
  // Note: validateFormat utility is available for consumers to check format/cell count matches
  const format: BingoFormat = useMemo(
    () => parseFormat(data.format),
    [data.format]
  );

  // Track marked cells per card
  // Key: cardId, Value: Set of marked cell indices
  const [markedCellsMap, setMarkedCellsMap] = useState<
    Map<string, Set<number>>
  >(() => {
    const map = new Map<string, Set<number>>();
    // Initialize all cards with empty sets, but mark free spaces
    data.cards.forEach((card) => {
      const markedSet = new Set<number>();
      card.cells.forEach((cell, index) => {
        if (cell.type === 'free') {
          markedSet.add(index);
        }
      });
      map.set(card.id, markedSet);
    });
    return map;
  });

  const handleCellClick = useCallback(
    (cardId: string, cellIndex: number) => {
      // Find the card to check if this is a free space cell
      const card = data.cards.find((c) => c.id === cardId);
      if (!card) return;

      // Prevent interaction with free space cells at state level
      const cell = card.cells[cellIndex];
      if (cell?.type === 'free') return;

      setMarkedCellsMap((prevMap) => {
        const newMap = new Map(prevMap);
        const cardMarkedCells = new Set(prevMap.get(cardId) ?? []);

        // Toggle marked state
        const wasMarked = cardMarkedCells.has(cellIndex);
        if (wasMarked) {
          cardMarkedCells.delete(cellIndex);
        } else {
          cardMarkedCells.add(cellIndex);
        }

        newMap.set(cardId, cardMarkedCells);

        // Notify parent
        onCellMark?.(cardId, cellIndex, !wasMarked);

        return newMap;
      });
    },
    [data.cards, onCellMark]
  );

  // Pre-create click handlers for each card to avoid inline functions
  const cardClickHandlers = useMemo(
    () =>
      new Map(
        data.cards.map((card) => [
          card.id,
          (cellIndex: number) => handleCellClick(card.id, cellIndex),
        ])
      ),
    [data.cards, handleCellClick]
  );

  // Empty state
  if (!data.cards || data.cards.length === 0) {
    return (
      <EmptyStateContainer data-testid={`${dataTestId}-empty`}>
        <Typography variant="h6" gutterBottom>
          No Bingo Cards Available
        </Typography>
        <Typography variant="body2">
          There are no bingo cards to display at this time.
        </Typography>
      </EmptyStateContainer>
    );
  }

  return (
    <StyledContainer data-testid={dataTestId} role="region" aria-label="Bingo cards">
      <StyledScrollContainer>
        {data.cards.map((card) => (
          <BingoCard
            key={card.id}
            card={card}
            format={format}
            markedCells={markedCellsMap.get(card.id) ?? new Set()}
            onCellClick={cardClickHandlers.get(card.id)}
          />
        ))}
      </StyledScrollContainer>
    </StyledContainer>
  );
}

BingoCardView.displayName = 'BingoCardView';

/**
 * Loading skeleton for BingoCardView.
 */
export function BingoCardViewSkeleton({
  count = 1,
  'data-testid': dataTestId = 'bingo-card-view-skeleton',
}: {
  count?: number;
  'data-testid'?: string;
}) {
  return (
    <StyledContainer data-testid={dataTestId}>
      <StyledScrollContainer>
        {Array.from({ length: count }, (_, index) => (
          <SkeletonCard
            key={`skeleton-${index}`}
            variant="rectangular"
            animation="wave"
            data-testid={`${dataTestId}-card-${index}`}
          />
        ))}
      </StyledScrollContainer>
    </StyledContainer>
  );
}

BingoCardViewSkeleton.displayName = 'BingoCardViewSkeleton';

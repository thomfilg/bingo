import { Box, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useCallback } from 'react';

import { useBingoStyle } from './context';
import type { BingoCellProps } from './BingoCell.types';
import type { BingoCardStyleConfig } from './styles';

export type { BingoCellProps } from './BingoCell.types';

// Mark animation
const markAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
`;

interface StyledCellProps {
  styleConfig: BingoCardStyleConfig;
  isFreeSpace: boolean;
  isMarked: boolean;
}

const StyledCell = styled(Box, {
  shouldForwardProp: (prop) =>
    !['styleConfig', 'isFreeSpace', 'isMarked'].includes(prop as string),
})<StyledCellProps>(({ theme, styleConfig, isFreeSpace, isMarked }) => {
  const { cell, freeSpace } = styleConfig;

  // Determine background and text color based on state
  let background: string;
  let textColor: string;

  if (isFreeSpace) {
    background = freeSpace.background;
    textColor = freeSpace.textColor;
  } else if (isMarked) {
    background = cell.backgroundMarked;
    textColor = cell.textColorMarked;
  } else {
    background = cell.background;
    textColor = cell.textColor;
  }

  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: '1 / 1',
    background,
    color: textColor,
    border: `2px solid ${cell.borderColor}`,
    borderRadius: cell.borderRadius,
    fontSize: cell.fontSize,
    fontWeight: cell.fontWeight,
    cursor: isFreeSpace ? 'default' : 'pointer',
    userSelect: 'none',
    transition: 'all 0.15s ease-in-out',
    position: 'relative',
    overflow: 'hidden',

    '&:hover': !isFreeSpace
      ? {
          transform: 'scale(1.02)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }
      : {},

    '&:active': !isFreeSpace
      ? {
          transform: 'scale(0.98)',
        }
      : {},

    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: '2px',
    },

    '&[data-marking="true"]': {
      animation: `${markAnimation} 0.2s ease-in-out`,
    },
  };
});

/**
 * BingoCell component renders an individual cell in a bingo card.
 * Handles both number cells and free space cells with proper styling
 * and accessibility support.
 *
 * @example
 * ```tsx
 * <BingoCell
 *   cell={{ value: 42, type: 'number' }}
 *   index={0}
 *   marked={false}
 *   onClick={() => console.log('Cell clicked')}
 * />
 * ```
 */
export const BingoCell = React.memo(function BingoCell({
  cell,
  index,
  marked = false,
  onClick,
  'data-testid': dataTestId,
}: BingoCellProps) {
  const { style } = useBingoStyle();
  const isFreeSpace = cell.type === 'free';

  // Free space is always considered marked
  const isMarked = isFreeSpace || marked;

  const handleClick = useCallback(() => {
    // Free space cannot be unmarked
    if (isFreeSpace) return;
    onClick?.();
  }, [isFreeSpace, onClick]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  const testId = dataTestId ?? `bingo-cell-${index}${isFreeSpace ? '-free' : ''}`;
  const displayValue = isFreeSpace ? style.freeSpace.label : cell.value;

  return (
    <StyledCell
      styleConfig={style}
      isFreeSpace={isFreeSpace}
      isMarked={isMarked}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isFreeSpace ? -1 : 0}
      aria-pressed={isMarked}
      aria-label={
        isFreeSpace
          ? 'Free space, always marked'
          : `Number ${cell.value}${isMarked ? ', marked' : ', not marked'}`
      }
      data-testid={testId}
      data-marked={isMarked}
      data-cell-type={cell.type}
      data-cell-index={index}
    >
      {displayValue}
    </StyledCell>
  );
});

BingoCell.displayName = 'BingoCell';

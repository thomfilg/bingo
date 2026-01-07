import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Box } from '@mui/material';

import { VirtualListProps, VirtualGridProps } from './VirtualList.types';

export const VirtualList: React.FC<VirtualListProps> = ({
  items,
  variant = 'fixed',
  height,
  width = '100%',
  itemHeight = 40,
  estimatedItemHeight = 40,
  overscan = 5,
  renderItem,
  onScroll,
  className,
  style,
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeights = useRef<Map<number, number>>(new Map());

  const getItemHeight = useCallback(
    (index: number): number => {
      if (variant === 'fixed') {
        return itemHeight;
      }

      if (variant === 'variable') {
        const item = items[index];
        if (item?.height) {
          return item.height;
        }

        const measuredHeight = itemHeights.current.get(index);
        if (measuredHeight) {
          return measuredHeight;
        }

        return estimatedItemHeight;
      }

      return itemHeight;
    },
    [variant, itemHeight, estimatedItemHeight, items],
  );

  const getTotalHeight = useMemo(() => {
    if (variant === 'fixed') {
      return items.length * itemHeight;
    }

    let totalHeight = 0;
    for (let i = 0; i < items.length; i++) {
      totalHeight += getItemHeight(i);
    }
    return totalHeight;
  }, [items.length, variant, itemHeight, getItemHeight]);

  const getVisibleRange = useMemo(() => {
    if (variant === 'fixed') {
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const endIndex = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + height) / itemHeight) + overscan,
      );
      return { startIndex, endIndex };
    }

    // For variable height items
    let accumulatedHeight = 0;
    let startIndex = 0;
    let endIndex = items.length - 1;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      if (accumulatedHeight + getItemHeight(i) > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      accumulatedHeight += getItemHeight(i);
    }

    // Find end index
    accumulatedHeight = 0;
    for (let i = 0; i <= startIndex; i++) {
      accumulatedHeight += getItemHeight(i);
    }

    for (let i = startIndex; i < items.length; i++) {
      if (accumulatedHeight > scrollTop + height) {
        endIndex = Math.min(items.length - 1, i + overscan);
        break;
      }
      accumulatedHeight += getItemHeight(i);
    }

    return { startIndex, endIndex };
  }, [scrollTop, height, variant, itemHeight, overscan, items.length, getItemHeight]);

  const getItemOffset = useCallback(
    (index: number): number => {
      if (variant === 'fixed') {
        return index * itemHeight;
      }

      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += getItemHeight(i);
      }
      return offset;
    },
    [variant, itemHeight, getItemHeight],
  );

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    },
    [onScroll],
  );

  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = getVisibleRange;
    const result = [];

    for (let i = startIndex; i <= endIndex; i++) {
      const item = items[i];
      if (!item) continue;

      const offset = getItemOffset(i);
      const itemStyle = {
        position: 'absolute' as const,
        top: offset,
        left: 0,
        width: '100%',
        height: getItemHeight(i),
      };

      result.push({
        item,
        index: i,
        style: itemStyle,
      });
    }

    return result;
  }, [getVisibleRange, items, getItemOffset, getItemHeight]);

  return (
    <Box
      ref={containerRef}
      className={className}
      data-testid={dataTestId}
      role="list"
      aria-label={ariaLabel}
      sx={{
        height,
        width,
        overflow: 'auto',
        position: 'relative',
        ...style,
      }}
      onScroll={handleScroll}
    >
      <Box
        sx={{
          height: getTotalHeight,
          position: 'relative',
        }}
      >
        {visibleItems.map(({ item, index, style }) => renderItem({ item, index, style }))}
      </Box>
    </Box>
  );
};

export const VirtualGrid: React.FC<VirtualGridProps> = ({
  items,
  height,
  width = '100%',
  columnCount,
  rowHeight,
  columnWidth,
  gap = 0,
  overscan = 5,
  renderItem,
  onScroll,
  className,
  style,
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const rowCount = Math.ceil(items.length / columnCount);
  const totalHeight = rowCount * (rowHeight + gap) - gap;

  const computedColumnWidth = useMemo(() => {
    if (columnWidth) return columnWidth;

    const containerWidth = typeof width === 'number' ? width : 300; // fallback
    return (containerWidth - (columnCount - 1) * gap) / columnCount;
  }, [columnWidth, width, columnCount, gap]);

  const getVisibleRange = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / (rowHeight + gap)) - overscan);
    const endRow = Math.min(
      rowCount - 1,
      Math.ceil((scrollTop + height) / (rowHeight + gap)) + overscan,
    );

    return { startRow, endRow };
  }, [scrollTop, height, rowHeight, gap, overscan, rowCount]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop;
      const newScrollLeft = event.currentTarget.scrollLeft;

      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop, newScrollLeft);
    },
    [onScroll],
  );

  const visibleItems = useMemo(() => {
    const { startRow, endRow } = getVisibleRange;
    const result = [];

    for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
      for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        const index = rowIndex * columnCount + columnIndex;
        const item = items[index];

        if (!item) continue;

        const itemStyle = {
          position: 'absolute' as const,
          top: rowIndex * (rowHeight + gap),
          left: columnIndex * (computedColumnWidth + gap),
          width: computedColumnWidth,
          height: rowHeight,
        };

        result.push({
          item,
          index,
          columnIndex,
          rowIndex,
          style: itemStyle,
        });
      }
    }

    return result;
  }, [getVisibleRange, items, columnCount, rowHeight, gap, computedColumnWidth]);

  return (
    <Box
      ref={containerRef}
      className={className}
      data-testid={dataTestId}
      role="grid"
      aria-label={ariaLabel}
      sx={{
        height,
        width,
        overflow: 'auto',
        position: 'relative',
        ...style,
      }}
      onScroll={handleScroll}
    >
      <Box
        sx={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        {visibleItems.map(({ item, index, columnIndex, rowIndex, style }) =>
          renderItem({ item, index, columnIndex, rowIndex, style }),
        )}
      </Box>
    </Box>
  );
};

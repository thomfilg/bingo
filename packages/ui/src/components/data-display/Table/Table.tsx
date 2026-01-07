import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table as MuiTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Checkbox,
  TableSortLabel,
  Box,
  IconButton,
  Menu,
  MenuItem,
  FormControlLabel,
  Switch,
  alpha,
  keyframes,
  useTheme,
  useMediaQuery,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

import { 
  TableProps, 
  ColumnConfig, 
  TableDensity,
  TableHeaderProps,
  TableBodyProps
} from './Table.types';

// Define pulse animation
const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 1;
  }
  70% {
    box-shadow: 0 0 0 10px currentColor;
    opacity: 0;
  }
  100% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 0;
  }
`;

// Density configurations
const getDensityConfig = (density: TableDensity = 'normal') => {
  const configs = {
    compact: {
      rowHeight: 36,
      cellPadding: '6px 12px',
      fontSize: '0.8125rem',
      headerPadding: '8px 12px',
    },
    normal: {
      rowHeight: 52,
      cellPadding: '12px 16px',
      fontSize: '0.875rem',
      headerPadding: '16px 16px',
    },
    comfortable: {
      rowHeight: 68,
      cellPadding: '18px 24px',
      fontSize: '0.875rem',
      headerPadding: '20px 24px',
    },
  };
  return configs[density];
};

const StyledTableContainer = styled(TableContainer, {
  shouldForwardProp: (prop) => !['virtualScrolling', 'containerHeight'].includes(prop as string),
})<{ 
  virtualScrolling?: boolean; 
  containerHeight?: number | string;
}>(({ virtualScrolling, containerHeight }) => ({
  ...(virtualScrolling && {
    height: containerHeight || 400,
    overflow: 'auto',
  }),
}));

const StyledTable = styled(MuiTable, {
  shouldForwardProp: (prop) => 
    !['customVariant', 'glow', 'pulse', 'hoverable', 'density', 'stickyHeader'].includes(prop as string),
})<{ 
  customVariant?: string;
  glow?: boolean; 
  pulse?: boolean;
  hoverable?: boolean;
  density?: TableDensity;
  stickyHeader?: boolean;
}>(({ theme, customVariant, glow, pulse, hoverable, density, stickyHeader }) => {
  const densityConfig = getDensityConfig(density);
  
  return {
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    position: 'relative',

    // Density styles
    '& .MuiTableCell-root': {
      padding: densityConfig.cellPadding,
      fontSize: densityConfig.fontSize,
      height: densityConfig.rowHeight,
    },

    // Sticky header
    ...(stickyHeader && {
      '& .MuiTableHead-root': {
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: theme.palette.background.paper,
        '& .MuiTableCell-root': {
          borderBottom: `2px solid ${theme.palette.divider}`,
          fontWeight: 600,
          padding: densityConfig.headerPadding,
        },
      },
    }),

    // Variant styles
    ...(customVariant === 'default' && {
      backgroundColor: theme.palette.background.paper,
      '& .MuiTableHead-root': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
      },
    }),

    ...(customVariant === 'striped' && {
      backgroundColor: theme.palette.background.paper,
      '& .MuiTableRow-root:nth-of-type(even)': {
        backgroundColor: alpha(theme.palette.action.hover, 0.5),
      },
    }),

    ...(customVariant === 'glass' && {
      backgroundColor: alpha(theme.palette.background.paper, 0.1),
      backdropFilter: 'blur(20px)',
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    }),

    ...(customVariant === 'minimal' && {
      backgroundColor: 'transparent',
      '& .MuiTableCell-root': {
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      },
    }),

    ...(customVariant === 'gradient' && {
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      '& .MuiTableHead-root': {
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.secondary.main, 0.15)})`,
      },
      '& .MuiTableCell-root': {
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
      },
    }),

    // Hoverable rows
    ...(hoverable && {
      '& .MuiTableBody-root .MuiTableRow-root:hover': {
        backgroundColor: alpha(theme.palette.action.hover, 0.8),
        cursor: 'pointer',
      },
    }),

    // Selection styles
    '& .MuiTableRow-root.selected': {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.16),
      },
    },

    // Glow effect
    ...(glow && !pulse && {
      boxShadow: `0 0 20px 5px ${alpha(theme.palette.primary.main, 0.3)} !important`,
      filter: 'brightness(1.05)',
    }),

    // Pulse animation
    ...(pulse && !glow && {
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 'inherit',
        backgroundColor: theme.palette.primary.main,
        opacity: 0.1,
        animation: `${pulseAnimation} 2s infinite`,
        pointerEvents: 'none',
        zIndex: -1,
      },
    }),

    // Both glow and pulse
    ...(glow && pulse && {
      position: 'relative',
      boxShadow: `0 0 20px 5px ${alpha(theme.palette.primary.main, 0.3)} !important`,
      filter: 'brightness(1.05)',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 'inherit',
        backgroundColor: theme.palette.primary.main,
        opacity: 0.1,
        animation: `${pulseAnimation} 2s infinite`,
        pointerEvents: 'none',
        zIndex: -1,
      },
    }),
  };
});

// Virtual Scrolling Hook
const useVirtualScrolling = (
  data: Record<string, unknown>[],
  rowHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const visibleHeight = containerHeight;
    const startIndex = Math.floor(scrollTop / rowHeight);
    const endIndex = Math.min(
      data.length,
      Math.ceil((scrollTop + visibleHeight) / rowHeight)
    );
    
    const start = Math.max(0, startIndex - overscan);
    const end = Math.min(data.length, endIndex + overscan);
    
    return {
      startIndex: start,
      endIndex: end,
      items: data.slice(start, end),
      totalHeight: data.length * rowHeight,
      offsetY: start * rowHeight,
    };
  }, [data, rowHeight, containerHeight, scrollTop, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return { visibleItems, handleScroll };
};

// Responsive Hook
const useResponsive = (
  columns: ColumnConfig[],
  columnPriorities?: number[]
) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [hiddenColumns, setHiddenColumns] = useState<number[]>([]);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (!columnPriorities) return;
    
    let columnsToHide: number[] = [];
    
    if (isMobile) {
      // Hide lowest priority columns on mobile
      columnsToHide = columnPriorities
        .map((priority, index) => ({ priority, index }))
        .sort((a, b) => b.priority - a.priority)
        .slice(0, Math.floor(columns.length / 2))
        .map(item => item.index);
    } else if (isTablet) {
      // Hide some columns on tablet
      columnsToHide = columnPriorities
        .map((priority, index) => ({ priority, index }))
        .sort((a, b) => b.priority - a.priority)
        .slice(0, Math.floor(columns.length / 3))
        .map(item => item.index);
    }
    
    setHiddenColumns(columnsToHide);
  }, [isMobile, isTablet, columnPriorities, columns.length]);

  const visibleColumns = columns.filter((_, index) => !hiddenColumns.includes(index));

  return {
    visibleColumns,
    hiddenColumns,
    isMobile,
    columnMenuAnchor,
    setColumnMenuAnchor,
    setHiddenColumns,
  };
};

// Enhanced Table Header Component
const EnhancedTableHeader: React.FC<TableHeaderProps> = React.memo(({
  columns,
  data,
  sortable,
  sortConfig,
  onSortChange,
  selectable,
  selectedRows = [],
  onSelectAll,
}) => {
  const handleSort = useCallback(
    (columnKey: string) => {
      if (!sortable || !onSortChange) return;
      
      const direction = 
        sortConfig?.key === columnKey && sortConfig.direction === 'asc' ? 'desc' : 'asc';
      onSortChange(columnKey, direction);
    },
    [sortable, onSortChange, sortConfig]
  );

  const handleSelectAll = useCallback(
    (event: React.ChangeEvent<globalThis.HTMLInputElement>) => {
      if (!onSelectAll) return;
      onSelectAll(event.target.checked);
    },
    [onSelectAll]
  );

  return (
    <TableHead>
      <TableRow>
        {selectable && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
              checked={selectedRows.length === data.length && data.length > 0}
              onChange={handleSelectAll}
              inputProps={{ 'aria-label': 'select all' }}
            />
          </TableCell>
        )}
        {columns.map((column) => (
          <TableCell
            key={column.key}
            align={column.align || 'left'}
            style={{ 
              minWidth: column.minWidth,
              width: column.width,
            }}
            aria-sort={
              sortable && column.sortable !== false && sortConfig?.key === column.key
                ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                : undefined
            }
          >
            {sortable && column.sortable !== false ? (
              <TableSortLabel
                active={sortConfig?.key === column.key}
                direction={sortConfig?.key === column.key ? sortConfig.direction : 'asc'}
                onClick={() => handleSort(column.key)}
                data-testid="sort-indicator"
                aria-label={`Sort by ${column.label}`}
              >
                {column.label}
              </TableSortLabel>
            ) : (
              column.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
});

EnhancedTableHeader.displayName = 'EnhancedTableHeader';

// Enhanced Table Body Component  
const EnhancedTableBody: React.FC<TableBodyProps> = React.memo(({
  data,
  columns,
  selectedRows = [],
  onRowClick,
  onRowFocus,
  onRowBlur,
  onSelectionChange,
  rowKeyExtractor,
  selectable,
  renderRow,
  renderCell,
  virtualScrolling,
  containerHeight,
  rowHeight,
  overscan = 5,
}) => {
  const getRowKey = useCallback(
    (rowData: Record<string, unknown>, index: number): string | number => {
      return rowKeyExtractor ? rowKeyExtractor(rowData, index) : (rowData.id as string | number) || index;
    },
    [rowKeyExtractor]
  );

  const isRowSelected = useCallback(
    (rowKey: string | number) => {
      return selectedRows.includes(rowKey);
    },
    [selectedRows]
  );

  const handleRowSelection = useCallback(
    (event: React.MouseEvent | React.ChangeEvent, rowKey: string | number) => {
      // Stop propagation to prevent row click conflict
      event.stopPropagation();
      if (!onSelectionChange) return;
      const isSelected = selectedRows.includes(rowKey);
      onSelectionChange(rowKey, !isSelected);
    },
    [onSelectionChange, selectedRows]
  );

  const renderTableRow = useCallback((rowData: Record<string, unknown>, index: number, offsetY: number = 0) => {
    const rowKey = getRowKey(rowData, index);
    const selected = isRowSelected(rowKey);

    if (renderRow) {
      return renderRow(rowData, index, selected);
    }

    return (
      <TableRow
        key={String(rowKey)}
        selected={selected}
        className={selected ? 'selected' : ''}
        onClick={(event: React.MouseEvent<globalThis.HTMLTableRowElement>) => onRowClick?.(event, rowData)}
        onFocus={(event: React.FocusEvent<globalThis.HTMLTableRowElement>) => onRowFocus?.(event, rowData)}
        onBlur={(event: React.FocusEvent<globalThis.HTMLTableRowElement>) => onRowBlur?.(event, rowData)}
        style={virtualScrolling ? { 
          transform: `translateY(${offsetY}px)`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: rowHeight,
        } : undefined}
      >
        {selectable && (
          <TableCell padding="checkbox">
            <Checkbox
              checked={selected}
              onChange={(event) => handleRowSelection(event, rowKey)}
              onClick={(event) => event.stopPropagation()}
              inputProps={{ 'aria-label': `select row ${index + 1}` }}
            />
          </TableCell>
        )}
        {columns.map((column) => {
          const value = rowData[column.key];
          return (
            <TableCell key={column.key} align={column.align || 'left'}>
              {renderCell 
                ? renderCell(value, column, rowData, index)
                : column.render 
                ? column.render(value, rowData) 
                : (value as React.ReactNode)
              }
            </TableCell>
          );
        })}
      </TableRow>
    );
  }, [getRowKey, isRowSelected, renderRow, renderCell, columns, selectable, handleRowSelection, onRowClick, onRowFocus, onRowBlur, virtualScrolling, rowHeight]);

  const { visibleItems, handleScroll } = useVirtualScrolling(
    data, 
    rowHeight || 40, 
    typeof containerHeight === 'number' ? containerHeight : 400, 
    overscan
  );

  if (virtualScrolling && containerHeight && rowHeight) {

    return (
      <Box
        onScroll={handleScroll}
        style={{
          height: containerHeight,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <TableBody
          style={{
            height: visibleItems.totalHeight,
            position: 'relative',
          }}
        >
          {visibleItems.items.map((rowData, index) => 
            renderTableRow(rowData, visibleItems.startIndex + index, visibleItems.offsetY + index * rowHeight)
          )}
        </TableBody>
      </Box>
    );
  }

  return (
    <TableBody>
      {data.map((rowData, index) => renderTableRow(rowData, index))}
    </TableBody>
  );
});

EnhancedTableBody.displayName = 'EnhancedTableBody';

// Main Table Component
export const Table = React.forwardRef<globalThis.HTMLTableElement, TableProps>(
  ({
    // Basic props
    variant = 'default',
    glow = false,
    pulse = false,
    hoverable = false,
    loading = false,
    children,
    
    // Advanced feature props
    density = 'normal',
    stickyHeader = false,
    selectable = false,
    selectedRows = [],
    onSelectionChange,
    rowKeyExtractor,
    sortable = false,
    sortConfig,
    onSortChange,
    columns,
    data,
    virtualScrolling = false,
    rowHeight = 52,
    overscan = 5,
    responsive = false,
    columnPriorities,
    showColumnToggle = true,
    containerHeight,
    loadingComponent,
    emptyStateComponent,
    renderRow,
    renderCell,
    onRowClick,
    onRowFocus,
    onRowBlur,
    
    ...props
  }, ref) => {
    useTheme(); // Required for responsive behavior
    
    // Use responsive hook if responsive mode is enabled
    const {
      visibleColumns,
      hiddenColumns,
      isMobile,
      columnMenuAnchor,
      setColumnMenuAnchor,
      setHiddenColumns,
    } = useResponsive(
      columns || [],
      responsive ? columnPriorities : undefined
    );

    // Handle selection changes
    const handleSelectionChange = useCallback((rowKey: string | number, selected: boolean) => {
      if (!onSelectionChange) return;
      
      let newSelection: (string | number)[];
      if (selected) {
        newSelection = [...selectedRows, rowKey];
      } else {
        newSelection = selectedRows.filter(key => key !== rowKey);
      }
      onSelectionChange(newSelection);
    }, [selectedRows, onSelectionChange]);

    const handleSelectAll = useCallback((selected: boolean) => {
      if (!onSelectionChange || !data) return;
      
      if (selected) {
        const allKeys = data.map((rowData, index) => 
          rowKeyExtractor ? rowKeyExtractor(rowData, index) : (rowData.id as string | number) || index
        );
        onSelectionChange(allKeys);
      } else {
        onSelectionChange([]);
      }
    }, [data, onSelectionChange, rowKeyExtractor]);

    // Loading state
    if (loading) {
      const loadingRows = Array.from({ length: 5 }, (_, index) => (
        <TableRow key={index}>
          {columns?.map((column) => (
            <TableCell key={column.key}>
              <Skeleton height={20} />
            </TableCell>
          ))}
        </TableRow>
      ));

      return (
        <StyledTableContainer>
          <StyledTable
            ref={ref}
            customVariant={variant}
            glow={glow}
            pulse={pulse}
            hoverable={hoverable}
            density={density}
            stickyHeader={stickyHeader}
            {...props}
          >
            {columns && (
              <EnhancedTableHeader
                columns={responsive ? visibleColumns : columns}
                data={[]}
                sortable={sortable}
                sortConfig={sortConfig}
                onSortChange={onSortChange}
                selectable={selectable}
                selectedRows={selectedRows}
                onSelectAll={handleSelectAll}
                density={density}
                stickyHeader={stickyHeader}
              />
            )}
            <TableBody data-testid="table-loading">
              {loadingComponent || loadingRows}
            </TableBody>
          </StyledTable>
        </StyledTableContainer>
      );
    }

    // Empty state
    if (data && data.length === 0) {
      return (
        <StyledTableContainer>
          <StyledTable
            ref={ref}
            customVariant={variant}
            glow={glow}
            pulse={pulse}
            hoverable={hoverable}
            density={density}
            stickyHeader={stickyHeader}
            {...props}
          >
            {columns && (
              <EnhancedTableHeader
                columns={responsive ? visibleColumns : columns}
                data={[]}
                sortable={sortable}
                sortConfig={sortConfig}
                onSortChange={onSortChange}
                selectable={selectable}
                selectedRows={selectedRows}
                onSelectAll={handleSelectAll}
                density={density}
                stickyHeader={stickyHeader}
              />
            )}
            <TableBody>
              <TableRow>
                <TableCell colSpan={(responsive ? visibleColumns : columns)?.length || 1} align="center">
                  {emptyStateComponent || (
                    <Box py={4} color="text.secondary">
                      No data available
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </StyledTable>
        </StyledTableContainer>
      );
    }

    // Advanced table with columns and data
    if (columns && data) {
      const finalColumns = responsive ? visibleColumns : columns;
      
      return (
        <Box position="relative">
          <StyledTableContainer
            virtualScrolling={virtualScrolling}
            containerHeight={containerHeight}
          >
            <StyledTable
              ref={ref}
              customVariant={variant}
              glow={glow}
              pulse={pulse}
              hoverable={hoverable}
              density={density}
              stickyHeader={stickyHeader}
              {...props}
            >
              <EnhancedTableHeader
                columns={finalColumns}
                data={data}
                sortable={sortable}
                sortConfig={sortConfig}
                onSortChange={onSortChange}
                selectable={selectable}
                selectedRows={selectedRows}
                onSelectAll={handleSelectAll}
                density={density}
                stickyHeader={stickyHeader}
              />
              <EnhancedTableBody
                data={data}
                columns={finalColumns}
                selectedRows={selectedRows}
                onRowClick={onRowClick}
                onRowFocus={onRowFocus}
                onRowBlur={onRowBlur}
                onSelectionChange={handleSelectionChange}
                rowKeyExtractor={rowKeyExtractor}
                density={density}
                selectable={selectable}
                hoverable={hoverable}
                renderRow={renderRow}
                renderCell={renderCell}
                virtualScrolling={virtualScrolling}
                containerHeight={typeof containerHeight === 'number' ? containerHeight : undefined}
                rowHeight={rowHeight}
                overscan={overscan}
              />
            </StyledTable>
          </StyledTableContainer>

          {/* Column Toggle Menu for Responsive */}
          {responsive && isMobile && showColumnToggle && hiddenColumns.length > 0 && (
            <Box position="absolute" top={8} right={8}>
              <IconButton
                onClick={(event) => setColumnMenuAnchor(event.currentTarget)}
                size="small"
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={columnMenuAnchor}
                open={Boolean(columnMenuAnchor)}
                onClose={() => setColumnMenuAnchor(null)}
              >
                {columns.map((column, index) => (
                  <MenuItem key={column.key}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!hiddenColumns.includes(index)}
                          onChange={(e) => {
                            const newHidden = e.target.checked 
                              ? hiddenColumns.filter(i => i !== index)
                              : [...hiddenColumns, index];
                            setHiddenColumns(newHidden);
                          }}
                          size="small"
                        />
                      }
                      label={column.label}
                    />
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
        </Box>
      );
    }

    // Basic table (backward compatibility)
    return (
      <StyledTable
        ref={ref}
        customVariant={variant}
        glow={glow}
        pulse={pulse}
        hoverable={hoverable}
        density={density}
        stickyHeader={stickyHeader}
        {...props}
      >
        {children}
      </StyledTable>
    );
  }
);

Table.displayName = 'Table';
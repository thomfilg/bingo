# DataGrid

> Canonical authoring guidelines for the **DataGrid** component in the Requisio design system.
> **Testing policy:** Use **Storybook Test stories + Storybook Test Runner** only. Do **not** add unit tests or `__tests__/`.

## 1) Purpose & Scope

A **DataGrid** presents large tabular datasets with high-performance rendering and rich interactions:

- Virtualized scrolling (rows + optional columns)
- Sorting, filtering, grouping (optional), and column pinning
- Pagination (client and server modes)
- Column resize/reorder/show-hide
- Row selection (single/multi), row expansion (details)
- Inline cell editing (optional)
- Keyboard navigation and full a11y for assistive tech
- Sticky headers/footers; responsive layout

## 2) Deliverables & File Layout

Create under `packages/ui/src/components/datagrid/`:

- `DataGrid.tsx` — component implementation (not included here)
- `datagrid.css.ts` — tokens/variants styling
- `index.ts` — re-exports
- `DataGrid.stories.tsx` — stories + test stories
- `track.md` — props/lint/types/progress
- `tests.md` — Storybook tests plan and PASS log

Add exports to `packages/ui/src/index.ts`.

## 3) Public API (Interfaces only)

```ts
export type GridSizeMode = 'auto' | 'fixed' | 'fill'; // column sizing strategy
export type GridDensity = 'compact' | 'comfortable' | 'spacious';
export type SortDirection = 'asc' | 'desc' | null;
export type SelectionMode = 'none' | 'single' | 'multi';
export type PaginationMode = 'client' | 'server';
export type SortMode = 'client' | 'server';
export type FilterMode = 'client' | 'server';
export type EditMode = 'none' | 'cell' | 'row';

export interface GridColumn<T = any> {
  /** Unique column id (stable across renders) */
  id: string;
  /** Column header label (string or node) */
  header: React.ReactNode;
  /** Accessor: key or function to derive value from row */
  accessor?: keyof T | ((row: T) => any);
  /** Column type influences default formatting and editors */
  type?: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'currency' | 'actions';
  /** Width hints (px) and min/max constraints */
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  /** Column is initially hidden */
  hidden?: boolean;
  /** Pin to left/right (sticky) */
  pin?: 'left' | 'right';
  /** Enable/disable sort, filter, resize, reorder, edit per column */
  enableSort?: boolean;
  enableFilter?: boolean;
  enableResize?: boolean;
  enableReorder?: boolean;
  enableEdit?: boolean;
  /** Custom renderers */
  cell?: (ctx: { value: any; row: T; rowIndex: number; col: GridColumn<T> }) => React.ReactNode;
  headerCell?: (col: GridColumn<T>) => React.ReactNode;
  /** Cell editor renderer (edit mode) */
  editor?: (ctx: {
    value: any;
    row: T;
    onChange: (next: any) => void;
    commit: () => void;
    cancel: () => void;
  }) => React.ReactNode;
  /** Column-specific filter UI and predicate (client mode) */
  filterComponent?: (ctx: {
    value: any;
    setValue: (next: any) => void;
    col: GridColumn<T>;
  }) => React.ReactNode;
  filterPredicate?: (value: any, filterValue: any, row: T) => boolean;
  /** Accessibility label for header button controls */
  ariaLabel?: string;
}

export interface GridSort {
  id: string; // column id
  dir: SortDirection; // asc | desc | null
}

export interface GridFilter {
  id: string; // column id
  value: any; // opaque filter value per column type
}

export interface GridRowExpansion<T = any> {
  /** Render expanded content */
  render: (row: T, rowIndex: number) => React.ReactNode;
  /** Controlled expanded row ids */
  expandedRowIds?: Array<string | number>;
  /** Uncontrolled defaults */
  defaultExpandedRowIds?: Array<string | number>;
  /** Row id equality uses `getRowId` */
  onChangeExpanded?: (ids: Array<string | number>) => void;
}

export interface GridSelection {
  mode?: SelectionMode; // none | single | multi
  selectedRowIds?: Array<string | number>; // controlled
  defaultSelectedRowIds?: Array<string | number>;
  onChangeSelected?: (ids: Array<string | number>) => void;
}

export interface GridPagination {
  mode?: PaginationMode; // client | server
  pageIndex?: number; // controlled, 0-based
  pageSize?: number; // rows per page
  rowCount?: number; // total rows (server)
  onChangePage?: (nextIndex: number) => void;
  onChangePageSize?: (nextSize: number) => void;
}

export interface GridSorting {
  mode?: SortMode; // client | server
  sortBy?: GridSort[]; // controlled
  defaultSortBy?: GridSort[];
  onChangeSortBy?: (next: GridSort[]) => void;
}

export interface GridFiltering {
  mode?: FilterMode; // client | server
  filters?: GridFilter[]; // controlled
  defaultFilters?: GridFilter[];
  onChangeFilters?: (next: GridFilter[]) => void;
}

export interface GridEditing<T = any> {
  mode?: EditMode; // none | cell | row
  /** Called when a cell (or row) attempts to commit a value */
  onEditCommit?: (ctx: {
    rowId: string | number;
    colId: string;
    value: any;
    row: T;
  }) => Promise<void> | void;
  /** Validation error message per cell (controlled) */
  getCellError?: (rowId: string | number, colId: string) => string | undefined;
}

export interface DataGridProps<T = any> extends React.HTMLAttributes<HTMLElement> {
  /** Dataset (client mode uses this array; server mode renders current page) */
  rows: T[];
  /** Stable row id accessor */
  getRowId?: (row: T, index: number) => string | number;
  /** Column definitions */
  columns: GridColumn<T>[];

  /** Sizing, density, and layout */
  sizeMode?: GridSizeMode; // auto | fixed | fill
  density?: GridDensity; // compact | comfortable | spacious
  rowHeight?: number; // default row height (px)
  headerHeight?: number; // default header height (px)
  footerHeight?: number; // optional

  /** Interaction features */
  selection?: GridSelection;
  pagination?: GridPagination;
  sorting?: GridSorting;
  filtering?: GridFiltering;
  expansion?: GridRowExpansion<T>;
  editing?: GridEditing<T>;

  /** Virtualization toggles */
  virtualizeRows?: boolean; // default: true for large datasets
  virtualizeColumns?: boolean; // optional; default: false

  /** Sticky headers/footers and pinned columns */
  stickyHeader?: boolean;
  stickyFooter?: boolean;

  /** Empty/loading/error states */
  loading?: boolean;
  error?: React.ReactNode; // message or node for error state
  emptyState?: React.ReactNode; // custom empty component

  /** Server-fetch hooks (used by server modes) */
  onRequestData?: (params: {
    pageIndex?: number;
    pageSize?: number;
    sortBy?: GridSort[];
    filters?: GridFilter[];
  }) => void;

  /** Accessibility */
  ariaLabel?: string; // label for entire grid region
  ariaDescription?: string;

  /** Testing id passthrough */
  'data-testid'?: string;
}
```

## 4) Accessibility & Semantics

- Root uses **ARIA grid pattern**:
  - Container: `<div role="grid" aria-rowcount={...} aria-colcount={...}>`
  - Header row: `role="row"` with header cells `role="columnheader"` (sortable headers include `aria-sort="ascending|descending|none"`).
  - Body rows: `role="row"` with `role="gridcell"`; selected rows/cells set `aria-selected="true"`.
  - Row headers (optional): `role="rowheader"`.

- **Keyboard**:
  - Arrow keys move cell focus; Home/End go to first/last cell in row; PageUp/PageDown scroll by viewport.
  - Ctrl/Cmd + Home/End moves to grid start/end.
  - Space/Enter toggle selection or begin edit (edit mode).
  - Esc cancels edit.

- **Focus management**:
  - Use **roving tabindex** pattern; only one focusable cell at a time.
  - Maintain focus visibility using `:focus-visible`.

- **Announcements**:
  - Live region for operations (e.g., “Sorted by Amount, ascending”).
  - Selection count updates announced for multi-select.

- **Headers/controls**:
  - Sortable headers are buttons with clear `aria-label`.
  - Resize handles have `aria-valuenow/min/max` when keyboard-resizable.

## 5) Behavior Rules

- **Sorting**:
  - Controlled via `sorting.sortBy`; on header click cycles `asc → desc → none` (configurable).
  - Server mode: never modify `rows`; emit `onRequestData`.

- **Filtering**:
  - Controlled/Uncontrolled per `GridFiltering`; client mode uses `filterPredicate` or sensible defaults by type.

- **Pagination**:
  - Client mode slices `rows`; server mode emits `onRequestData` and renders provided page.

- **Selection**:
  - Respect `SelectionMode`; shift-click range selection (optional, nice-to-have).
  - In multi-select, `Ctrl/Cmd` toggles without clearing.

- **Resize/Reorder/Pin**:
  - Columns can be resized (drag + keyboard), reordered via drag, and pinned left/right (sticky).

- **Editing**:
  - `EditMode='cell' | 'row'`; commit via Enter/blur; cancel via Esc.
  - Call `onEditCommit`; show validation errors via `getCellError`.

- **Expansion**:
  - Row expand/collapse before/after row; expanded region must be focusable and labelled.

## 6) Styling Contract (data attributes & slots)

- Root: `[data-ui="datagrid"]`
- Attributes on root:
  - `data-density="compact|comfortable|spacious"`
  - `data-size-mode="auto|fixed|fill"`
  - `data-virtual-rows="true|false"`
  - `data-virtual-cols="true|false"`
  - `data-sticky-header="true|false"`

- Slots:
  - `[data-slot="header"]` (row group)
  - `[data-slot="header-row"]`
  - `[data-slot="header-cell"]` (+ `data-sort="asc|desc|none"`)
  - `[data-slot="body"]`
  - `[data-slot="row"]` (+ `data-selected="true|false"`, `data-expanded="true|false"`)
  - `[data-slot="cell"]` (+ `data-editing="true|false"`, `data-col-id="<id>"`)
  - `[data-slot="footer"]`
  - `[data-slot="resize-handle"]`
  - `[data-slot="reorder-handle"]`
  - `[data-slot="pinned-left"]`, `[data-slot="pinned-right"]`
  - States: `data-loading="true|false"`, `data-error="true|false"`, shown via slots

Layout guidance:

- Use CSS variables for row heights, column widths, gaps, and colors.
- Ensure fixed header + virtualized body do not cause layout shifts.
- Avoid absolute positioning for focus rings; use outline/box-shadow tokens.

## 7) Tokens & Theming

Use Requisio tokens only:

- Typography: `--rs-font-size-*, --rs-line-height-*`
- Spacing: `--rs-space-*`
- Colors: `--rs-color-bg|fg|border-*`; state tokens for hover/selected/active/error
- Focus: `--rs-focus-ring`
- Elevation (optional for sticky header shadow): `--rs-shadow-sm`
- Density mapping adjusts `rowHeight`, paddings, and font sizes.

Dark mode:

- Verify AA contrast for header/body text, dividers, selected rows, and focus outlines.

## 8) Performance

- **Virtualization** is required for large datasets (default on for rows).
- Use translation-based row movement to avoid reflow; batch DOM updates.
- Avoid inline functions in hot paths; memoize row/cell renders.
- Refrain from measuring DOM per frame; rely on ResizeObserver for container.

## 9) Storybook Requirements (canonical tests)

Create stories for:

- **Docs**: overview, API, do/don’t; client vs server-mode examples.
- **Tests** (`DataDisplay/DataGrid/Tests/*`):
  - Basic rendering & semantics (ARIA grid)
  - Virtualization correctness (render window, keep indices)
  - Sorting (client & server)
  - Filtering (client & server)
  - Pagination (client & server)
  - Selection (single/multi), keyboard selection
  - Column resize/reorder/pin
  - Editing (start/commit/cancel, validation)
  - Keyboard navigation (cell grid)
  - Sticky header behavior
  - Empty/loading/error states
  - Dark mode contrast
  - Performance smoke (1k–10k rows windowed)

## 10) Acceptance Criteria

- Props comply with interfaces above; defaults documented.
- A11y checks pass for key stories; keyboard navigation complete.
- Storybook tests **PASS** and are recorded in `tests.md`.
- `pnpm check:component data-display DataGrid` clean (lint/types/tests).
- Token-driven theming; no hard-coded colors.
- Virtualization proven in stories without jank.

## 11) Hand-off Checklist (`track.md`)

- Props table with defaults and required flags
- Lint/Type status
- Storybook Tests list (planned → completed) with timestamps
- Screenshots (light/dark; dense modes; pinned columns)
- Known issues / follow-ups

---

# datagrid.md

**Alias notice:** Lowercase alias pointing to the canonical spec in `DataGrid.md`.

- **Canonical spec:** `DataGrid.md`
- **Rationale:** Support pipelines/editors that expect lowercase filenames.
- **Instruction:** Follow API, behaviors, a11y, theming, and Storybook test requirements defined in `DataGrid.md`.

Quick links:

- Purpose & Scope → `DataGrid.md` §1
- Interfaces → `DataGrid.md` §3
- Accessibility → `DataGrid.md` §4
- Tokens & Theming → `DataGrid.md` §7
- Storybook Tests → `DataGrid.md` §9
- Acceptance Criteria → `DataGrid.md` §10

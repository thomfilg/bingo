# Calendar / DatePicker — AI Implementation Description

A reusable calendar that supports **single date selection** and **date range selection (Airbnb-style)** with hover preview, dual-month layout, and full keyboard/a11y support.

---

## Purpose

- Let users pick a **single date** or a **start–end range**.
- Work as an inline calendar, a popover/popup attached to an input, or an always-visible panel.
- Be locale-aware and accessible.

---

## Core UX

- **Header** with month/year and previous/next controls.
- **Month grid** (role `grid`) with weekday headers and day cells (role `gridcell`).
- **Range hover preview**: when a start date is chosen, hovering days previews the end.
- **Dual month** layout for range mode (configurable).
- **Disabled/unavailable days** visibly blocked and non-interactive.
- Optional **footer** with Clear/Apply.

---

## Public API (TypeScript)

```ts
type SelectionMode = 'single' | 'range';

export interface DateRange {
  start?: Date | null;
  end?: Date | null;
}

export interface CalendarProps {
  // Mode
  selectionMode?: SelectionMode; // default: 'single'

  // Controlled values
  value?: Date | null; // single mode
  range?: DateRange; // range mode
  onChange?: (value: Date | null) => void; // single
  onRangeChange?: (range: Required<DateRange>) => void; // fired when both ends chosen
  onIntermediateRangeChange?: (partial: DateRange) => void; // while hovering/choosing

  // Display
  numberOfMonths?: number; // default: 1 in single, 2 in range
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // default: locale
  locale?: string; // e.g. 'en-US'
  showOutsideDays?: boolean; // days from prev/next month
  showWeekNumbers?: boolean;

  // Constraints
  minDate?: Date;
  maxDate?: Date;
  isDateDisabled?: (date: Date) => boolean; // business logic disable
  minRangeLength?: number; // nights, default 1
  maxRangeLength?: number;

  // Behavior
  allowSameDayRange?: boolean; // default: true
  closeOnSelect?: boolean; // for popover host; default: single=true, range=when both set
  fixedRange?: boolean; // pick start then auto-calc end by minRangeLength
  autoFocus?: boolean;

  // Rendering hooks
  renderDay?: (args: {
    date: Date;
    inCurrentMonth: boolean;
    selected: boolean;
    inRange: boolean;
    rangeStart: boolean;
    rangeEnd: boolean;
    disabled: boolean;
    today: boolean;
  }) => React.ReactNode;
  renderHeader?: (ctx: { month: number; year: number }) => React.ReactNode;
  renderFooter?: React.ReactNode;

  // Styling hooks
  className?: string;
  dayClassName?: (args: {
    date: Date;
    inCurrentMonth: boolean;
    selected: boolean;
    inRange: boolean;
    rangeStart: boolean;
    rangeEnd: boolean;
    disabled: boolean;
    today: boolean;
    hovered?: boolean;
  }) => string;
}
```

**Notes**

- Dates are treated as **date-only**. Internally normalize to a safe noon time (`setHours(12,0,0,0)`) to avoid DST edge cases.
- For popover use, you can wrap this Calendar in an `InputDate`/`InputDateRange` component; this spec focuses on the calendar panel itself.

---

## Visual & Interaction Details

### Single mode

- Clicking a day sets `value` and triggers `onChange`.
- If `closeOnSelect` true, host popover should close.

### Range mode (Airbnb-like)

- First click sets `range.start`.
- Hovering highlights tentative `[start → hovered]` if valid.
- Second click sets `range.end` (order-agnostic: clicking an earlier date than start swaps).
- Enforce `minRangeLength`/`maxRangeLength`. If invalid, ignore or snap (configurable via your handler).
- Fire `onIntermediateRangeChange` as user hovers. Fire `onRangeChange` once both ends are chosen.

### Navigation

- Header buttons move month (or year with modifier keys if desired).
- Month pagination respects `minDate`/`maxDate`.

### States & Styles (suggested class hooks)

- `.cal-root`, `.cal-header`, `.cal-nav`, `.cal-grid`, `.cal-weekdays`, `.cal-row`, `.cal-cell`
- Day modifiers: `.is-today`, `.is-selected`, `.is-inRange`, `.is-rangeStart`, `.is-rangeEnd`, `.is-disabled`, `.is-outside`, `.is-hovered`
- Range hover overlay uses a soft background; start/end get pills with rounded caps.

---

## Accessibility

- Container month: `role="grid"`, labelled by month/year (e.g., `aria-labelledby="cal-2025-09"`).
- Weekday headers: `role="columnheader"`, short names with `abbr` for SR if needed.
- Day cells: `role="gridcell"`, `aria-selected` true for selected day(s). For ranges, set `aria-selected="true"` on all in range or use `aria-current="date"` for today.
- Disabled days: `aria-disabled="true"`.
- Keyboard support (roving focus within the grid):
  - Arrow keys: move by 1 day (left/right) or 1 week (up/down).
  - Home/End: move to start/end of week.
  - PageUp/PageDown: previous/next month (with Shift for year).
  - Enter/Space: select day (first selects start; second sets end in range mode).
  - Escape: clears hover preview; host can close popover.

- Focus should remain inside the grid; header nav is reachable via Tab.

---

## Keyboard Selection Logic (range)

1. No selection → Enter picks start.
2. Start set, no end → Enter on a valid day sets end; if chosen day < start, swap.
3. If `allowSameDayRange=false`, prevent start==end selection.
4. Enforce range length constraints before commit.

---

## Edge Cases

- Dates outside min/max visually disabled; ensure range hover doesn’t cross blocked dates.
- Crossing month boundaries in dual-month layout keeps continuous preview.
- RTL locales: reverse arrow navigation horizontally.
- Week numbers: compute ISO-8601 if enabled.
- When `fixedRange` is true, second click is optional: end auto-computed from start and `minRangeLength`.

---

## Testing Scenarios

- Single date: click selection, keyboard selection, today highlight.
- Range: start/end selection, hover preview, crossing months, swapping when end < start.
- Constraints: min/maxDate, disabled dates, min/max range length.
- Navigation: header prev/next, PageUp/PageDown, year jump.
- A11y: roles, `aria-selected`, `aria-disabled`, roving focus, SR labels.
- Locale: first day of week, month/weekday names in different locales.
- Performance: rendering 2 months, 12 months stress, no excessive reflows.
- Edge: DST boundaries, year change (Dec→Jan), RTL mode.

---

## Storybook Stories

- `Date/Calendar/Single/Default`
- `Date/Calendar/Range/Airbnb`
- `Date/Calendar/WithDisabledDates`
- `Date/Calendar/MinMaxRangeLength`
- `Date/Calendar/LocaleFirstDayOfWeek`
- `Date/Calendar/KeyboardOnly`
- `Date/Calendar/CustomDayRenderer`
- `Date/Calendar/WithFooterApplyClear`
- `Date/Calendar/WeekNumbers`
- `Date/Calendar/RTL`

---

## Implementation Notes

- Generate month matrix once per visible month; memoize by `{year, month, locale, firstDayOfWeek}`.
- Normalize each date to noon local to avoid DST off-by-one.
- Keep internal hover state for preview (`hoveredDate`).
- Provide a small date utility module (startOfDay, isSameDay, isBetween, clampToBounds).
- For dual months, render two synchronized grids; next/prev move both together.
- Avoid external heavy date libraries if possible; if used, tree-shake.

---

## File Structure (suggestion)

```
packages/ui/src/date/calendar/
  Calendar.tsx
  hooks/useMonthMatrix.ts
  utils/date.ts
  Calendar.scss (or Tailwind)
  index.ts
  __tests__/Calendar.stories.tsx
  __tests__/Calendar.interactions.test.tsx
```

---

## Definition of Done

- Zero ESLint/TS errors.
- Keyboard and screen reader usable.
- All scenarios above covered by stories and interaction tests.
- Accurate range hover and selection across months and constraints.
- Locale and first-day-of-week honored.
- No memory leaks; minimal re-renders.

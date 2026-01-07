# Autocomplete — AI Build Instructions

> Goal: Implement an agnostic, accessible, and high‑performance Autocomplete component usable for search boxes, dataset filters, tag inputs, and command palettes. Keep it framework-idiomatic (React), type-safe (TypeScript), testable, and styling-agnostic (SCSS or Tailwind adapters allowed).

---

## 1) Summary

- **Pattern**: ARIA Combobox with popup listbox.
- **Input**: Controlled string value (`value`, `onChange`).
- **Suggestions**: Controlled array of generic items (`T`).
- **Selection**: Emits `onSelect(item)`; optional multi-select with chips.
- **Inline completion**: Optional ghost remainder and `Tab/→` acceptance.
- **Modes**: Free text, async (remote), multiple (chips), custom render, command palette.
- **Performance**: Debounce, precompute highlights, (optional) virtualization for large lists.

---

## 2) Non-Functional Constraints

- **Accessibility first**: Follow WAI-ARIA Combobox with Listbox pattern.
- **No global side effects**: All listeners cleaned up; no scroll lock needed.
- **No external heavy deps**: Avoid large libs; expose escape hatches for virtualization.
- **Deterministic focus**: Works keyboard-only; predictable `Tab` order.
- **SSR-friendly**: Guard window/document usage.

---

## 3) Public API (TypeScript)

```ts
export interface AutocompleteProps<T = any> {
  /** Controlled input value */
  value: string;
  /** Input value change */
  onChange: (val: string) => void;

  /** Suggestion items (generic) */
  suggestions: T[];
  /** Unique key extractor */
  getKey?: (item: T) => string;
  /** Text label extractor */
  getLabel?: (item: T) => string;
  /** Optional description extractor (for SR and UI) */
  getDescription?: (item: T) => string | undefined;
  /** Custom row renderer */
  renderSuggestion?: (item: T, state: { active: boolean; query: string }) => React.ReactNode;
  /** Called when a suggestion is chosen */
  onSelect?: (item: T) => void;

  /** Allow values not in suggestions */
  allowFreeText?: boolean;
  /** Enable multiple selection (chips) */
  multiple?: boolean;
  /** Selected items in multiple mode */
  selectedItems?: T[];
  /** Update selected items in multiple mode */
  onSelectedItemsChange?: (items: T[]) => void;

  /** Async mode flags */
  async?: boolean;
  isLoading?: boolean;
  /** Debounce in ms for local filtering or remote fetch triggers */
  debounceMs?: number;

  /** Inline completion remainder visibility */
  showGhostText?: boolean;
  /** Case/fuzzy options (local filtering only) */
  matchMode?: 'startsWith' | 'contains' | 'fuzzy';

  /** A11y & structure */
  id?: string; // base id for combobox; derive popup ids from this
  inputAriaLabel?: string; // if no visible label is present
  placeholder?: string;
  autoFocus?: boolean;

  /** Styling hooks */
  className?: string; // root
  inputClassName?: string;
  listClassName?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  chipClassName?: string;

  /** Portal the popup if desired */
  portal?: boolean | { container?: Element };
  /** Max visible items before scroll */
  maxVisibleItems?: number;
}
```

**Defaults**

- `getKey = (i:any) => String((i && (i.id ?? i.key ?? i.value ?? i.label)) ?? i)`
- `getLabel = (i:any) => String(i?.label ?? i?.name ?? i?.text ?? i)`
- `debounceMs = 150`, `matchMode = 'contains'`, `showGhostText = true`

---

## 4) States & Derived Data

- `open: boolean` — popup visibility.
- `activeIndex: number` — highlighted suggestion index (−1 when none).
- `ghost: string` — inline completion remainder (if enabled).
- `inputValue: string` — mirror of `value` for IME composition handling.
- `composition: boolean` — true during IME composition (don’t navigate).
- `listId`, `activeId` — derived for aria.

Derived collections:

- `filteredSuggestions` — if **local** filtering is used; otherwise pass-through.
- `virtualWindow` — optional slice when virtualizing.

---

## 5) Accessibility (MUST)

Implement WAI-ARIA **Combobox** w/ **Listbox**:

- Input element: `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls={listId}`, `aria-activedescendant={activeId || undefined}`.
- Popup list: `role="listbox"`, owns `role="option"` children with `id`.
- Keyboard:
  - `ArrowDown/ArrowUp`: move active item; open if closed and suggestions exist.
  - `Enter`: select active item (or submit free text if allowed).
  - `Tab` or `ArrowRight` when `ghost` present: accept remainder.
  - `Esc`: close popup, keep focus in input; second `Esc` clears value (optional).
  - Respect **IME composition**: ignore arrows/enter while composing.

- Focus trap not required; focus stays in input; popup click should not blur input prematurely.
- Screen reader announcements: update `aria-activedescendant` and include label + optional description via `aria-describedby`.

---

## 6) Behavior Spec

### Opening/Closing

- Open when input has focus and there are suggestions (or async loading) and either `value.length > 0` or `force open` rules.
- Close on: blur (after short timeout to allow click), `Esc`, selection, or when input emptied (configurable).

### Inline Ghost Text

- Compute `ghost` only if `showGhostText` and first suggestion label startsWith query (case-insensitive).
- Accept remainder on `Tab` or `ArrowRight`.

### Selection

- Single mode: `onSelect(item)` and optionally fill `value = getLabel(item)`.
- Multiple mode: append to `selectedItems` if not present; clear input; keep popup open.

### Async

- When `async=true`, **do not** filter locally unless asked; instead emit `onChange` with debounced value to trigger upstream fetch. Show spinner when `isLoading`.

### Virtualization (optional)

- If `suggestions.length > 200`, allow `virtualize=true` in future; for now expose `maxVisibleItems` with overflow scroll. Keep active item scrolled into view.

---

## 7) Rendering Structure (Reference)

```tsx
<div className={cx('ac-root', className)} id={id}>
  {multiple && <Chips ... />}
  <div className="ac-inputWrap">
    <input /* combobox roles/attrs */ />
    {showGhostText && <span className="ac-ghost" aria-hidden>{ghost}</span>}
    {isLoading && <Spinner className="ac-spinner" />}
  </div>
  {open && (
    <PortalIf portal={portal}>
      <ul role="listbox" id={listId} className={listClassName}>
        {visibleItems.map((it, i) => (
          <li role="option"
              id={optionId(i)}
              aria-selected={i===activeIndex}
              className={cx(itemClassName, i===activeIndex && activeItemClassName)}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(it)}>
            {renderSuggestion ? renderSuggestion(it, { active: i===activeIndex, query: value }) : (
              <DefaultRow label={getLabel(it)} query={value} />
            )}
          </li>
        ))}
      </ul>
    </PortalIf>
  )}
</div>
```

---

## 8) Keyboard Map

- **ArrowDown/Up**: cycle active; wrap disabled by default.
- **Enter**: select active; if no active and `allowFreeText`, confirm free text.
- **Tab/→**: accept ghost remainder (if any).
- **Esc**: close popup; keep input value.
- **Backspace** (multiple): remove last chip when input empty.

---

## 9) Styles (agnostic contract)

Provide minimal class hooks and CSS vars; leave theme to DS:

- `.ac-root`, `.ac-inputWrap`, `.ac-ghost`, `.ac-spinner`, `.ac-list`, `.ac-item`, `.ac-item--active`, `.ac-chip`.
- CSS vars: `--ac-radius`, `--ac-shadow`, `--ac-maxHeight`, `--ac-gap`.

Ghost text is positioned as a twin overlay behind the caret (use a stacked container with the real input on top, or pseudo-element when using monospace; choose the twin overlay approach for variable fonts).

---

## 10) Performance Notes

- Debounce input changes (default 150ms). Cancel on unmount.
- Memoize derived labels and highlight splits.
- Keep scrolling of active item cheap (use `scrollIntoView({ block: 'nearest' })`).
- Avoid reflow on every key by not measuring DOM repeatedly.

---

## 11) Testing Checklist

**Unit/Interaction**

- Open/close rules; blur timeout click-through works.
- Keyboard nav including IME composition guard.
- Ghost acceptance on `Tab/→`.
- `onSelect` called with correct item.
- Multiple mode: chip add/remove; backspace behavior.
- Async: spinner visibility; no local filter unless configured.
- A11y: roles, aria-\* updates, `aria-activedescendant` correctness.

**Visual/Stories**

- Default, Ghost Text, Async Loading, Multiple Tags, Custom Renderer, Accessibility story.

**Performance**

- 500-suggestion interaction within 16ms budget for nav.

Run via:

```bash
cd packages/ui
pnpm check:component inputs Autocomplete
```

---

## 12) File & Story Structure

```
packages/ui/src/inputs/autocomplete/
  Autocomplete.tsx
  Autocomplete.types.ts
  Autocomplete.scss (or .css / Tailwind variant)
  index.ts
  __tests__/Autocomplete.stories.tsx
  __tests__/Autocomplete.interactions.test.tsx
```

Storybook stories to include:

- `Inputs/Autocomplete/Default`
- `Inputs/Autocomplete/WithGhostText`
- `Inputs/Autocomplete/AsyncLoading`
- `Inputs/Autocomplete/MultipleTags`
- `Inputs/Autocomplete/CustomRenderer`
- `Inputs/Autocomplete/Accessibility`

---

## 13) Pseudocode (Core Hooks)

```ts
useEffect(() => {
  if (!showGhostText) return setGhost('');
  const first = suggestions[0];
  const label = first ? getLabel(first) : '';
  const q = value ?? '';
  if (!q || !label) return setGhost('');
  if (label.toLowerCase().startsWith(q.toLowerCase())) setGhost(label.slice(q.length));
  else setGhost('');
}, [value, suggestions, showGhostText]);

const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (composition) return; // IME guard
  switch (e.key) {
    case 'ArrowDown':
      openIfAny();
      move(+1);
      e.preventDefault();
      break;
    case 'ArrowUp':
      move(-1);
      e.preventDefault();
      break;
    case 'Enter':
      selectActiveOrFreeText();
      e.preventDefault();
      break;
    case 'Tab':
    case 'ArrowRight':
      if (ghost) {
        acceptGhost();
        e.preventDefault();
      }
      break;
    case 'Escape':
      close();
      break;
  }
};
```

---

## 14) Definition of Done (DOD)

- API implemented with defaults; zero ESLint/TS errors.
- Full ARIA combobox compliance; keyboard-only usable.
- Stories + interaction tests passing.
- No memory leaks; event listeners cleaned on unmount.
- Handles 500 suggestions smoothly; optional virtualization path documented.
- Docs updated with examples for search, filter, and command palette scenarios.

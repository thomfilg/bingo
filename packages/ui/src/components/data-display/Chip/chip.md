# Chip Component

**Purpose:** Compact tag/label with optional avatar, selection, and deletion.

```ts
interface ChipProps {
  label: string;
  variant?: 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  color?: ColorValue; // theme token
  avatarSrc?: string; // or avatar node via `avatar`
  avatar?: React.ReactNode;
  icon?: React.ReactNode; // leading icon
  selected?: boolean;
  selectable?: boolean;
  deletable?: boolean;
  disabled?: boolean;

  onClick?: () => void; // select/toggle
  onDelete?: () => void; // shown when deletable
  className?: string;
}
```

**Features**

- Filled/Outlined variants; optional avatar or icon.
- Selectable (toggle) and/or deletable (× button).
- Keyboard: Space/Enter activates; Delete/Backspace triggers remove when focused.

**A11y**

- `role="option"` when in a listbox; otherwise `button` if clickable.
- Delete control labeled via `aria-label="Remove <label>"`.

**Stories / Tests**

- Filled/Outlined; With avatar; Selectable; Deletable; Disabled; Keyboard remove.

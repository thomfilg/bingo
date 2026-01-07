# Banner Component

**Purpose:** Page-level notification bar for system messages.

```ts
interface BannerProps {
  variant?: 'info' | 'success' | 'warning' | 'critical';
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: Array<{ label: string; onClick: () => void; variant?: 'primary' | 'secondary' }>;
  sticky?: boolean; // affix to top on scroll
  fullWidth?: boolean; // span container or viewport
  className?: string;
}
```

**Features**

- Strong visual hierarchy by variant; optional sticky behavior.
- Inline actions (primary/secondary) and dismiss control.
- Supports compact and spacious density via CSS modifiers.

**A11y**

- `role="status"` for info/success; `role="alert"` for warning/critical.
- If `dismissible`, the close button has `aria-label="Dismiss"`.
- Do not auto-focus; rely on live regions for screen readers.

**Stories / Tests**

- Variants; With/without actions; Dismissible; Sticky; Responsive.

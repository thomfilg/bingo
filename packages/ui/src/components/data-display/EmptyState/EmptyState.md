# EmptyState Component

**Purpose:** Friendly placeholder for “no data / no results / error” with illustration and actions.

```ts
interface EmptyStateProps {
  variant?: 'default' | 'illustrated' | 'minimal' | 'action';
  title: string;
  description?: string;
  illustration?: React.ReactNode; // SVG/Lottie/etc
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  helpLink?: { label: string; href: string; external?: boolean };
  className?: string;
}
```

**Features**

- Clear title + optional description and help link.
- Optional illustration area sized responsively.
- Action variant surfaces primary/secondary CTAs.

**A11y**

- Wrap in `role="region"` with `aria-labelledby` to the title id.
- Provide `alt` text for non-decorative illustrations.

**Stories / Tests**

- No Results; No Permissions; Network Error; With Actions; Illustrated vs Minimal.

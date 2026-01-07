# Stepper Component

**Purpose:** Visual step progress for multi-step flows (linear or non-linear), with vertical/horizontal orientations.

```ts
interface Step {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
  disabled?: boolean;
}

interface StepperProps {
  steps: Step[];
  activeId: string; // current step id
  completed?: Set<string>; // completed step ids
  orientation?: 'horizontal' | 'vertical';
  variant?: 'linear' | 'non-linear';
  onStepChange?: (id: string) => void; // click/keyboard nav
  clickable?: boolean; // allow jumping (non-linear)
  renderConnector?: (
    from: Step,
    to: Step,
    state: { completed: boolean; active: boolean },
  ) => React.ReactNode;
  className?: string;
}
```

**Features**

- Numbered dots or checkmarks; connectors showing progress.
- Optional descriptions and “optional” flag per step.
- Linear mode restricts forward navigation until prior steps complete.

**A11y**

- Render as an ordered list `<ol>`; set `aria-current="step"` on active.
- If steps are interactive, each step is a `<button>` or link within the list item.

**Stories / Tests**

- Horizontal/Vertical; Linear vs Non-linear (clickable); With optional steps; Disabled steps; Keyboard nav.

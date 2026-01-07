# ToggleGroup Component

A flexible toggle button group component that allows single or multiple selection from a set of options. Built on top of MUI's ToggleButtonGroup with enhanced styling and additional features.

## Purpose

The ToggleGroup component is ideal for:

- Allowing users to select from mutually exclusive options (single selection)
- Enabling multiple selections from a group of related options
- Creating tool bars with toggle functionality (text formatting, alignment, etc.)
- Building interface controls that require on/off states for multiple items

## Features

- **Multiple Selection Modes**: Single, multiple, or exclusive selection
- **Rich Options**: Support for icons, labels, and disabled states
- **Visual Effects**: Glass morphism, gradient, and glow effects
- **Responsive Sizing**: Five size variants (xs, sm, md, lg, xl)
- **Theme Integration**: Six color themes with consistent styling
- **Accessibility**: Full keyboard navigation and screen reader support

## Props

### Core Props

| Prop      | Type                                                                          | Default     | Description                        |
| --------- | ----------------------------------------------------------------------------- | ----------- | ---------------------------------- |
| `options` | `ToggleOption[]`                                                              | -           | Array of toggle options to display |
| `variant` | `'single' \| 'multiple' \| 'exclusive'`                                       | `'single'`  | Selection behavior mode            |
| `color`   | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'neutral'` | `'primary'` | Color theme                        |
| `size`    | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                        | `'md'`      | Component size                     |

### Visual Enhancement Props

| Prop       | Type      | Default | Description                         |
| ---------- | --------- | ------- | ----------------------------------- |
| `glow`     | `boolean` | `false` | Adds subtle glow effect             |
| `glass`    | `boolean` | `false` | Applies glass morphism styling      |
| `gradient` | `boolean` | `false` | Enables gradient background effects |

### ToggleOption Interface

```typescript
interface ToggleOption {
  value: string; // Unique identifier for the option
  label: string; // Display text for the option
  icon?: ReactNode; // Optional icon to display
  disabled?: boolean; // Whether the option is disabled
}
```

## Usage Examples

### Basic Usage

```tsx
import { ToggleGroup } from '@repo/ui';

const alignOptions = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

function BasicExample() {
  const [value, setValue] = useState('');

  return (
    <ToggleGroup
      options={alignOptions}
      value={value}
      onChange={(event, newValue) => setValue(newValue || '')}
    />
  );
}
```

### Multiple Selection

```tsx
const formatOptions = [
  { value: 'bold', label: 'Bold', icon: <Bold size={16} /> },
  { value: 'italic', label: 'Italic', icon: <Italic size={16} /> },
  { value: 'underline', label: 'Underline', icon: <Underline size={16} /> },
];

function MultipleExample() {
  const [values, setValues] = useState(['bold']);

  return (
    <ToggleGroup
      variant="multiple"
      options={formatOptions}
      value={values}
      onChange={(event, newValues) => setValues(newValues || [])}
      color="secondary"
    />
  );
}
```

### With Visual Effects

```tsx
function StyledExample() {
  const [theme, setTheme] = useState('light');

  return (
    <ToggleGroup
      glass
      gradient
      glow
      options={themeOptions}
      value={theme}
      onChange={(event, newTheme) => setTheme(newTheme || 'light')}
      color="success"
      size="lg"
    />
  );
}
```

## Selection Modes

### Single Selection

- Default behavior
- Only one option can be selected at a time
- Clicking selected option deselects it
- Value type: `string | null`

### Multiple Selection

- Multiple options can be selected simultaneously
- Clicking toggles individual options on/off
- Value type: `string[]`

### Exclusive Selection

- Exactly one option must always be selected
- Clicking selected option does not deselect it
- Useful for required choices like themes or modes
- Value type: `string`

## Accessibility

The ToggleGroup component follows WCAG guidelines:

- **Keyboard Navigation**: Full keyboard support with Tab, Space, and Enter keys
- **Screen Readers**: Proper ARIA attributes for group role and state announcements
- **Focus Management**: Clear focus indicators and logical tab order
- **High Contrast**: Respects system high contrast preferences
- **Touch Targets**: Minimum 44px touch targets for mobile accessibility

## Best Practices

1. **Option Labels**: Use clear, concise labels that describe the action or state
2. **Icon Usage**: Combine icons with labels for better usability, use icons alone only for universally recognized actions
3. **Group Size**: Limit to 2-8 options for optimal usability
4. **Disabled States**: Provide clear visual feedback for disabled options
5. **Loading States**: Handle loading scenarios gracefully with appropriate feedback
6. **Responsive Design**: Test across different screen sizes and orientations

## Common Patterns

### Toolbar Controls

Perfect for text editor toolbars, media controls, or any interface requiring multiple toggle states.

### Settings Panels

Use exclusive mode for required settings like theme selection or display modes.

### Filtering Interfaces

Multiple selection mode works well for filter controls where users can select multiple criteria.

### Form Controls

Integration with form libraries for controlled form state management.

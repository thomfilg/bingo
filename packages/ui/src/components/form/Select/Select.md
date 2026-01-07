# Select Component

A customizable select dropdown component with comprehensive functionality for choosing from a list of options.

## Overview

The Select component provides a dropdown interface for selecting one option from a list. Built on MUI's Select component, it includes enhanced styling, accessibility features, and supports various visual variants including glass and gradient effects.

## Usage

```tsx
import { Select } from '@repo/ui';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

function MyComponent() {
  return (
    <Select
      options={options}
      label="Select an option"
      placeholder="Choose one"
      onValueChange={(value) => console.log('Selected:', value)}
    />
  );
}
```

## Props

### Required Props

- `options`: Array of option objects with `value`, `label`, and optional `disabled` properties

### Optional Props

- `value`: Currently selected value (controlled)
- `defaultValue`: Initial value for uncontrolled usage
- `onValueChange`: Callback function when selection changes
- `label`: Label text displayed above the select
- `placeholder`: Placeholder text when no option is selected
- `helperText`: Helper text displayed below the select
- `error`: Whether to display error state styling
- `disabled`: Whether the select is disabled
- `size`: Size variant ('small' | 'medium')
- `variant`: Visual style ('default' | 'glass' | 'gradient')
- `glow`: Whether to show glow effect on hover/focus
- `pulse`: Whether to show pulse animation
- `fullWidth`: Whether select should take full width of container

## Visual Variants

### Default

Standard Material-UI select styling with theme colors.

### Glass

Glassmorphism effect with blur backdrop and translucent appearance.

### Gradient

Animated gradient border that changes on hover and focus.

## Accessibility Features

- Full keyboard navigation support (Arrow keys, Enter, Escape)
- Screen reader compatibility with proper ARIA labels
- Focus management and visual focus indicators
- Support for disabled states

## Examples

### Basic Usage

```tsx
<Select
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
  ]}
  label="Country"
  placeholder="Select your country"
/>
```

### With Error State

```tsx
<Select
  options={options}
  label="Required Field"
  placeholder="Please select an option"
  error={true}
  helperText="This field is required"
/>
```

### Glass Variant with Effects

```tsx
<Select
  options={options}
  label="Glass Select"
  variant="glass"
  glow={true}
  pulse={true}
  placeholder="Choose an option"
/>
```

## Best Practices

- Always provide descriptive labels for accessibility
- Use helper text to provide additional context
- Consider using error states for form validation
- For long lists, consider grouping options or adding search functionality
- Test keyboard navigation to ensure accessibility compliance
- Use appropriate size variants based on your layout needs

## Integration Notes

- Works seamlessly with form libraries like React Hook Form
- Supports controlled and uncontrolled usage patterns
- Integrates with MUI theme system for consistent styling
- Compatible with all major browsers and screen readers

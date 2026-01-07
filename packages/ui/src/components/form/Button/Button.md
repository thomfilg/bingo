# Button Component

## Overview

The Button component is a versatile and highly customizable interactive element that provides clickable functionality with extensive visual styling options. It supports multiple variants, colors, sizes, and special effects while maintaining full accessibility compliance.

## Features

- **Multiple Variants**: solid, outline, ghost, glass, gradient
- **Color Themes**: primary, secondary, success, warning, danger, neutral
- **Size Options**: xs, sm, md, lg, xl
- **Special Effects**: glow, pulse animations
- **Loading States**: Built-in loading spinner
- **Icon Support**: Leading icons with automatic loading state handling
- **Accessibility**: Full ARIA support, keyboard navigation
- **Responsive Design**: Adapts to different screen sizes

## Usage

```tsx
import { Button } from '@repo/ui';

// Basic usage
<Button onClick={handleClick}>Click Me</Button>

// With variant and color
<Button variant="outline" color="secondary">
  Secondary Action
</Button>

// With icon and loading state
<Button icon={<SaveIcon />} loading={isLoading}>
  Save Changes
</Button>

// With special effects
<Button variant="gradient" glow pulse>
  Special Button
</Button>
```

## Props

| Prop        | Type                                                                          | Default     | Description                               |
| ----------- | ----------------------------------------------------------------------------- | ----------- | ----------------------------------------- |
| `variant`   | `'solid' \| 'outline' \| 'ghost' \| 'glass' \| 'gradient'`                    | `'solid'`   | Visual style variant                      |
| `color`     | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'neutral'` | `'primary'` | Color theme                               |
| `size`      | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                        | `'md'`      | Button size                               |
| `loading`   | `boolean`                                                                     | `false`     | Shows loading spinner and disables button |
| `disabled`  | `boolean`                                                                     | `false`     | Disables button interaction               |
| `icon`      | `ReactNode`                                                                   | -           | Icon element to display before text       |
| `glow`      | `boolean`                                                                     | `false`     | Adds glow visual effect                   |
| `pulse`     | `boolean`                                                                     | `false`     | Adds pulse animation effect               |
| `ripple`    | `boolean`                                                                     | `true`      | Enables/disables ripple effect on click   |
| `fullWidth` | `boolean`                                                                     | `false`     | Makes button take full width of container |
| `onClick`   | `(event: MouseEvent) => void`                                                 | -           | Click event handler                       |
| `onFocus`   | `(event: FocusEvent) => void`                                                 | -           | Focus event handler                       |
| `onBlur`    | `(event: FocusEvent) => void`                                                 | -           | Blur event handler                        |
| `children`  | `ReactNode`                                                                   | -           | Button content                            |
| `className` | `string`                                                                      | -           | Additional CSS classes                    |

## Variants

### Solid

Default filled button with background color and high emphasis.

```tsx
<Button variant="solid">Solid Button</Button>
```

### Outline

Button with border and transparent background.

```tsx
<Button variant="outline">Outline Button</Button>
```

### Ghost

Minimal button with no border or background.

```tsx
<Button variant="ghost">Ghost Button</Button>
```

### Glass

Glassmorphism effect with blur and transparency.

```tsx
<Button variant="glass">Glass Button</Button>
```

### Gradient

Gradient background with smooth color transitions.

```tsx
<Button variant="gradient">Gradient Button</Button>
```

## Accessibility

The Button component follows WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: Supports Tab, Enter, and Space key activation
- **Focus Management**: Clear focus indicators
- **ARIA Attributes**: Supports aria-label, aria-describedby, aria-pressed
- **Screen Reader**: Announces button state and content
- **Disabled State**: Properly communicates disabled state

### Keyboard Shortcuts

- `Tab`: Navigate to button
- `Enter`: Activate button
- `Space`: Activate button
- `Escape`: Cancel interaction (when applicable)

## Best Practices

1. **Use semantic colors**: Choose colors that match the action intent (danger for destructive actions, success for confirmations)

2. **Provide clear labels**: Button text should clearly describe the action

3. **Consider loading states**: Show loading spinner for async operations

4. **Size appropriately**: Use larger sizes for primary actions, smaller for secondary

5. **Maintain consistency**: Use the same variant for similar actions across the app

## Examples

### Form Actions

```tsx
<Stack direction="row" spacing={2}>
  <Button type="submit" variant="solid" color="primary">
    Submit
  </Button>
  <Button type="reset" variant="outline" color="neutral">
    Reset
  </Button>
  <Button variant="ghost" onClick={handleCancel}>
    Cancel
  </Button>
</Stack>
```

### Destructive Action

```tsx
<Button variant="solid" color="danger" icon={<DeleteIcon />} onClick={handleDelete}>
  Delete Account
</Button>
```

### Call to Action

```tsx
<Button variant="gradient" size="lg" glow pulse onClick={handleGetStarted}>
  Get Started Now
</Button>
```

## Theming

The Button component integrates with MUI's theme system:

```tsx
// Custom theme colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});
```

## Performance

- Component uses React.forwardRef for ref forwarding
- Styled with MUI's styled API for optimal performance
- Animation effects use CSS keyframes for smooth 60fps animations
- Lazy loads icons when in loading state

## Related Components

- IconButton - For icon-only buttons
- ButtonGroup - For grouping related buttons
- ToggleButton - For togglable button states
- Fab - For floating action buttons

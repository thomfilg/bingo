# Tooltip Component

## Overview

The Tooltip component displays contextual information when users hover over or focus on an element. Built on MUI's Tooltip with custom styling for variants, sizes, and effects like glow and pulse animations.

## Features

- **Multiple Variants**: Default, dark, light, and glass morphism styles
- **Size Options**: Small, medium, and large sizes
- **Visual Effects**: Glow effect and pulse animation support
- **Accessibility**: Full ARIA support and screen reader compatibility
- **Responsive**: Adapts to different screen sizes and viewport widths
- **Performance**: Optimized with zero delays for testing and smooth animations

## Props

### Core Props

| Prop       | Type                                        | Default     | Description                                     |
| ---------- | ------------------------------------------- | ----------- | ----------------------------------------------- |
| `title`    | `React.ReactNode`                           | -           | **Required.** Tooltip content to display        |
| `children` | `React.ReactElement`                        | -           | **Required.** Element that triggers the tooltip |
| `variant`  | `'default' \| 'dark' \| 'light' \| 'glass'` | `'default'` | Visual style variant                            |
| `size`     | `'sm' \| 'md' \| 'lg'`                      | `'md'`      | Size of the tooltip                             |
| `glow`     | `boolean`                                   | `false`     | Whether tooltip has glow effect                 |
| `pulse`    | `boolean`                                   | `false`     | Whether tooltip has pulse animation             |
| `maxWidth` | `number`                                    | `300`       | Maximum width of tooltip in pixels              |

### Additional Props

All MUI TooltipProps are supported except `variant` (which is replaced by our custom variant prop).

## Usage Examples

### Basic Tooltip

```tsx
import { Tooltip, Button } from '@repo/ui';

<Tooltip title="This is a basic tooltip">
  <Button>Hover me</Button>
</Tooltip>;
```

### Variant Examples

```tsx
// Dark variant
<Tooltip title="Dark tooltip" variant="dark">
  <Button>Dark</Button>
</Tooltip>

// Light variant
<Tooltip title="Light tooltip" variant="light">
  <Button>Light</Button>
</Tooltip>

// Glass morphism variant
<Tooltip title="Glass tooltip" variant="glass">
  <Button>Glass</Button>
</Tooltip>
```

### Size Variations

```tsx
// Small tooltip
<Tooltip title="Small tooltip" size="sm">
  <Button size="small">Small</Button>
</Tooltip>

// Large tooltip
<Tooltip title="Large tooltip" size="lg">
  <Button size="large">Large</Button>
</Tooltip>
```

### Visual Effects

```tsx
// Glow effect
<Tooltip title="Glowing tooltip" glow>
  <Button>Glow Effect</Button>
</Tooltip>

// Pulse animation
<Tooltip title="Pulsing tooltip" pulse>
  <Button>Pulse Effect</Button>
</Tooltip>

// Combined effects
<Tooltip title="Glow and pulse" glow pulse>
  <Button>Combined</Button>
</Tooltip>
```

### Click Trigger

```tsx
<Tooltip title="Click to see" trigger="click">
  <Button>Click me</Button>
</Tooltip>
```

### Placement Options

```tsx
<Tooltip title="Top placement" placement="top">
  <Button>Top</Button>
</Tooltip>

<Tooltip title="Right placement" placement="right">
  <Button>Right</Button>
</Tooltip>
```

## Accessibility

The Tooltip component includes comprehensive accessibility features:

- **ARIA Attributes**: Proper `role="tooltip"` and ARIA labeling
- **Keyboard Navigation**: Full keyboard support with focus management
- **Screen Reader**: Compatible with screen reader technologies
- **Focus Management**: Maintains focus on trigger elements
- **High Contrast**: Supports high contrast mode and theme variations

## Best Practices

1. **Keep content concise** - Tooltips should provide brief, helpful information
2. **Use appropriate triggers** - Hover for supplementary info, click for important details
3. **Consider mobile users** - Use click triggers or alternative patterns for touch devices
4. **Avoid essential information** - Don't put critical information only in tooltips
5. **Test accessibility** - Ensure tooltips work with keyboard navigation and screen readers
6. **Performance** - Use the component's built-in optimizations for smooth interactions

## Theme Integration

The Tooltip component integrates with the MUI theme system:

```tsx
// Uses theme colors and spacing
<Tooltip title="Themed tooltip" variant="default">
  <Button>Themed</Button>
</Tooltip>
```

## Performance Notes

- Zero enter/leave delays for optimal testing experience
- Efficient re-rendering with proper memoization
- Lightweight animations that don't impact performance
- Portal-based rendering for optimal z-index management

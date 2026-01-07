# Progress Component

## Overview

The Progress component provides a versatile way to display the progress of tasks and operations to users. It supports multiple visual variants including linear, circular, segmented, and gradient styles with customizable animations and effects.

## Features

- **Multiple Variants**: Linear, circular, segmented, and gradient progress indicators
- **Visual Effects**: Glow and pulse animations for enhanced feedback
- **Accessibility**: Full ARIA support with proper role and value attributes
- **Customization**: Size, color, and label options
- **Real-time Updates**: Supports dynamic value changes and indeterminate states

## Usage

### Basic Usage

```tsx
import { Progress } from '@repo/ui';

// Basic linear progress
<Progress value={75} />

// With label
<Progress value={60} showLabel />

// Circular progress
<Progress variant="circular" value={80} showLabel />
```

### Variants

#### Linear Progress

The default linear progress bar for typical loading scenarios:

```tsx
<Progress variant="linear" value={65} showLabel />
```

#### Circular Progress

Circular progress indicator for compact spaces:

```tsx
<Progress variant="circular" value={75} size="lg" showLabel />
```

#### Segmented Progress

Segmented progress for step-based processes:

```tsx
<Progress variant="segmented" value={60} segments={5} showLabel />
```

#### Gradient Progress

Enhanced progress with gradient fill:

```tsx
<Progress variant="gradient" value={80} glow showLabel />
```

### Effects and Animations

#### Glow Effect

Adds a subtle glow around the progress indicator:

```tsx
<Progress value={70} glow />
```

#### Pulse Animation

Creates a pulsing animation for active progress:

```tsx
<Progress value={45} pulse />
```

#### Combined Effects

Both effects can be used together:

```tsx
<Progress variant="circular" value={90} glow pulse showLabel />
```

### Indeterminate State

Show loading without specific progress value:

```tsx
<Progress variant="linear" />
<Progress variant="circular" />
```

## Props

| Prop           | Type                                                                         | Default     | Description                            |
| -------------- | ---------------------------------------------------------------------------- | ----------- | -------------------------------------- |
| `value`        | `number`                                                                     | -           | Progress value (0-100)                 |
| `variant`      | `'linear' \| 'circular' \| 'segmented' \| 'gradient' \| 'glass'`             | `'linear'`  | Visual style variant                   |
| `size`         | `'sm' \| 'md' \| 'lg'`                                                       | `'md'`      | Component size                         |
| `color`        | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error' \| 'neutral'` | `'primary'` | Progress color theme                   |
| `glow`         | `boolean`                                                                    | `false`     | Enable glow effect                     |
| `pulse`        | `boolean`                                                                    | `false`     | Enable pulse animation                 |
| `showLabel`    | `boolean`                                                                    | `false`     | Display progress percentage            |
| `label`        | `string`                                                                     | -           | Custom label text                      |
| `segments`     | `number`                                                                     | `8`         | Number of segments (segmented variant) |
| `thickness`    | `number`                                                                     | -           | Circle thickness (circular variant)    |
| `circularSize` | `number`                                                                     | -           | Circle size (circular variant)         |

## Accessibility

The Progress component includes comprehensive accessibility support:

- **ARIA Role**: Uses `progressbar` role for screen readers
- **ARIA Values**: Provides `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` attributes
- **ARIA Label**: Supports `aria-label` for custom descriptions
- **Screen Reader**: Announces progress changes and completion states
- **Keyboard**: No keyboard interaction required for progress indicators

### Screen Reader Support

```tsx
<Progress value={75} showLabel aria-label="File upload progress: 75% complete" />
```

## Examples

### File Upload Progress

```tsx
const [progress, setProgress] = useState(0);

return (
  <Progress variant="gradient" value={progress} showLabel glow aria-label="File upload progress" />
);
```

### Skill Level Indicator

```tsx
<Progress variant="segmented" segments={5} value={80} color="success" label="Advanced" />
```

### System Dashboard

```tsx
<Progress
  variant="circular"
  value={72}
  showLabel
  color="warning"
  size="lg"
  glow
  aria-label="CPU usage at 72%"
/>
```

## Best Practices

1. **Use appropriate variants**: Linear for general progress, circular for compact spaces, segmented for step-based processes
2. **Include labels**: Always use `showLabel` or custom `label` for clarity
3. **Choose meaningful colors**: Use semantic colors (success for completion, warning for high usage, error for problems)
4. **Provide ARIA labels**: Include descriptive `aria-label` attributes for screen readers
5. **Consider effects**: Use glow and pulse effects sparingly for critical progress indicators
6. **Update regularly**: For real-time progress, update values frequently enough to appear smooth
7. **Handle completion**: Provide clear visual or textual feedback when progress reaches 100%

## Theme Integration

The Progress component integrates with the MUI theme system and supports:

- Custom color palettes
- Consistent spacing and sizing
- Dark/light theme variants
- Responsive design tokens
- Glass morphism effects (when using glass variant)

# Transition Component

A flexible and comprehensive transition wrapper component that provides smooth animations for UI elements using Material-UI's transition components.

## Overview

The Transition component wraps content and applies various animation effects when elements enter or leave the DOM. It supports multiple transition variants including fade, slide, scale, collapse, grow, and zoom, with customizable timing, easing, and directional options.

## Features

- **Multiple Transition Variants**: Choose from fade, slide, scale, collapse, grow, or zoom animations
- **Directional Control**: Slide transitions support up, down, left, and right directions
- **Customizable Timing**: Configure duration and delay for precise control
- **Theme Integration**: Automatically uses Material-UI theme values for consistent animations
- **Intelligent Defaults**: Each variant has optimized default timing and easing values
- **Flexible Configuration**: Supports both simple number values and complex enter/exit objects

## Usage

### Basic Usage

```tsx
import { Transition } from '@repo/ui';

// Simple fade transition
<Transition variant="fade" in={show}>
  <Card>Your content here</Card>
</Transition>;
```

### With Direction (Slide)

```tsx
<Transition variant="slide" direction="up" in={show}>
  <Card>Slides up from bottom</Card>
</Transition>
```

### Custom Timing

```tsx
<Transition
  variant="fade"
  in={show}
  duration={500} // 500ms duration
  delay={200} // 200ms delay before starting
>
  <Card>Custom timing</Card>
</Transition>
```

### Complex Duration/Easing

```tsx
<Transition
  variant="scale"
  in={show}
  duration={{ enter: 300, exit: 200 }}
  easing={{ enter: 'ease-out', exit: 'ease-in' }}
>
  <Card>Different enter/exit timing</Card>
</Transition>
```

## Props

| Prop        | Type                                                             | Default       | Description                        |
| ----------- | ---------------------------------------------------------------- | ------------- | ---------------------------------- |
| `children`  | `ReactNode`                                                      | -             | Content to animate                 |
| `variant`   | `'fade' \| 'slide' \| 'scale' \| 'collapse' \| 'grow' \| 'zoom'` | `'fade'`      | Type of transition animation       |
| `in`        | `boolean`                                                        | -             | Controls whether content is shown  |
| `direction` | `'up' \| 'down' \| 'left' \| 'right'`                            | `'up'`        | Direction for slide transitions    |
| `duration`  | `number \| { enter: number, exit: number }`                      | Theme default | Animation duration in milliseconds |
| `delay`     | `number`                                                         | `0`           | Delay before animation starts      |
| `easing`    | `string \| { enter: string, exit: string }`                      | Theme default | CSS easing function                |

## Transition Variants

### Fade

Smoothly transitions opacity from 0 to 1. Best for subtle entrances and exits.

### Slide

Slides content in from a specified direction. Perfect for panels, drawers, and directional reveals.

### Scale/Grow

Scales content from 0 to full size from the center point. Great for popups and emphasis.

### Collapse

Animates height from 0 to auto. Ideal for expandable sections and accordions.

### Zoom

Sharp zoom effect with scaling transform. Good for dramatic entrances.

## Accessibility

- Respects user's motion preferences via `prefers-reduced-motion`
- Properly manages focus during transitions
- Maintains ARIA attributes on wrapped content
- Supports keyboard navigation through transitioned elements

## Best Practices

1. **Choose Appropriate Variants**: Use fade for subtle changes, slide for directional movement, and scale/zoom for emphasis
2. **Consistent Timing**: Use theme-based durations for consistency across your app
3. **Performance**: Avoid transitioning too many elements simultaneously
4. **Mobile Considerations**: Test transitions on lower-powered devices
5. **Accessibility**: Provide options to disable animations for users who prefer reduced motion

## Examples

### Notification Banner

```tsx
<Transition variant="slide" direction="down" in={showNotification}>
  <Alert severity="info">New message received!</Alert>
</Transition>
```

### Modal Overlay

```tsx
<Transition variant="fade" in={modalOpen} duration={300}>
  <Backdrop />
</Transition>
<Transition variant="scale" in={modalOpen} delay={100}>
  <Modal>Content</Modal>
</Transition>
```

### Collapsible FAQ

```tsx
<Transition variant="collapse" in={expanded}>
  <Box>
    <Typography>Answer content that expands/collapses</Typography>
  </Box>
</Transition>
```

## Related Components

- [Portal](../Portal) - For rendering content outside the DOM hierarchy
- [Modal](../../feedback/Modal) - Uses transitions for overlay effects
- [Drawer](../../layout/Drawer) - Implements slide transitions
- [Accordion](../../layout/Accordion) - Uses collapse transitions

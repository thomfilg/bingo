# LottieAnimation Component

A sophisticated Lottie animation component with multiple size presets, interactive controls, and visual effects. Supports JSON animation files, custom backgrounds (glass/solid), glow effects, and progress tracking. Includes loading states and accessibility features.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string \| object` | - | Path to JSON animation file or animation object |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` | Predefined size configurations |
| `autoplay` | `boolean` | `true` | Whether to start animation automatically |
| `loop` | `boolean` | `true` | Whether animation should loop |
| `onComplete` | `() => void` | - | Callback when animation completes |
| `speed` | `number` | `1` | Animation playback speed |
| `direction` | `1 \| -1` | `1` | Animation direction (forward/backward) |
| `className` | `string` | - | Additional CSS classes |
| `style` | `React.CSSProperties` | - | Custom inline styles |
| `background` | `'glass' \| 'solid' \| 'none'` | `'none'` | Background styling |
| `glow` | `boolean` | `false` | Enable glow effect around animation |
| `interactive` | `boolean` | `false` | Allow click to play/pause |
| `onSegmentComplete` | `(segment: number) => void` | - | Callback for segment completion |
| `segments` | `[number, number]` | - | Animation segment range to play |

## Usage Examples

### Basic Usage

```tsx
import { LottieAnimation } from '@repo/ui';

export function BasicExample() {
  return (
    <LottieAnimation
      src="/animations/loading.json"
      size="md"
      autoplay
      loop
    />
  );
}
```

### Interactive Animation with Glass Background

```tsx
import { LottieAnimation } from '@repo/ui';

export function InteractiveExample() {
  const handleComplete = () => {
    console.log('Animation completed!');
  };

  return (
    <LottieAnimation
      src="/animations/celebration.json"
      size="lg"
      background="glass"
      glow
      interactive
      loop={false}
      onComplete={handleComplete}
    />
  );
}
```

### Custom Speed and Direction

```tsx
import { LottieAnimation } from '@repo/ui';

export function CustomExample() {
  return (
    <LottieAnimation
      src="/animations/progress.json"
      size="xl"
      speed={0.5}
      direction={-1}
      background="solid"
    />
  );
}
```

## Size Variants

- `sm`: 120px × 120px
- `md`: 200px × 200px
- `lg`: 300px × 300px
- `xl`: 400px × 400px
- `2xl`: 500px × 500px

## Background Variants

- `none`: No background styling
- `glass`: Glass morphism effect with backdrop blur
- `solid`: Solid background with shadow

## Accessibility Notes

- The component includes appropriate ARIA labels for screen readers
- Interactive animations can be controlled via keyboard
- Respects user's reduced motion preferences
- Loading states are announced to assistive technologies

## Best Practices

- Use appropriate animation sizes for your layout
- Consider performance with large or complex animations
- Provide fallback content for accessibility
- Use the `onComplete` callback for chaining animations
- Test animations across different devices and connection speeds
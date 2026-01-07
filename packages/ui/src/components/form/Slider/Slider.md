# Slider Component

## Overview

The Slider component allows users to select values from a continuous or discrete range by dragging a thumb along a track. It's built on top of MUI's Slider with enhanced theming, glow effects, and comprehensive accessibility features.

## Usage

```tsx
import { Slider } from '@/components/form/Slider';

// Basic usage
<Slider value={50} onChange={(e, value) => setValue(value)} />

// Range slider
<Slider value={[20, 60]} onChange={(e, value) => setRange(value)} />

// With marks
<Slider value={30} marks step={10} min={0} max={100} />

// Vertical orientation
<Slider value={50} orientation="vertical" />

// With glow effect
<Slider value={75} enableGlow />
```

## Props

| Prop              | Type                                                                    | Default      | Description                      |
| ----------------- | ----------------------------------------------------------------------- | ------------ | -------------------------------- |
| value             | number \| number[]                                                      | -            | Current value or range           |
| onChange          | (event, value) => void                                                  | -            | Callback when value changes      |
| min               | number                                                                  | 0            | Minimum value                    |
| max               | number                                                                  | 100          | Maximum value                    |
| step              | number                                                                  | 1            | Step increment                   |
| marks             | boolean \| Mark[]                                                       | false        | Show tick marks                  |
| disabled          | boolean                                                                 | false        | Disable slider interaction       |
| orientation       | 'horizontal' \| 'vertical'                                              | 'horizontal' | Slider orientation               |
| valueLabelDisplay | 'on' \| 'auto' \| 'off'                                                 | 'off'        | When to display value label      |
| valueLabelFormat  | string \| func                                                          | -            | Format value label               |
| getAriaLabel      | (index) => string                                                       | -            | Aria label for thumbs            |
| getAriaValueText  | (value, index) => string                                                | -            | Aria value text                  |
| color             | 'primary' \| 'secondary' \| 'error' \| 'warning' \| 'info' \| 'success' | 'primary'    | Theme color                      |
| size              | 'small' \| 'medium'                                                     | 'medium'     | Component size                   |
| track             | 'normal' \| 'inverted' \| false                                         | 'normal'     | Track display mode               |
| disableSwap       | boolean                                                                 | false        | Disable thumb swap in range mode |
| enableGlow        | boolean                                                                 | false        | Enable glow effect               |
| sx                | SxProps                                                                 | -            | Custom MUI styles                |

## Features

### Value Selection

- Single value selection with draggable thumb
- Range selection with two thumbs
- Precise value control with step increments
- Click-to-position on track

### Keyboard Navigation

- **Arrow Keys**: Increase/decrease by step
- **Page Up/Down**: Large increment/decrement
- **Home/End**: Jump to min/max
- **Tab**: Navigate between thumbs in range mode

### Accessibility

- ARIA attributes for screen readers
- Keyboard-only navigation support
- Focus indicators
- Value announcements
- Custom labels and descriptions

### Visual Features

- Multiple color themes
- Size variants
- Glow effects for enhanced visibility
- Value labels with custom formatting
- Tick marks with labels
- Vertical and horizontal orientations

## Examples

### Basic Slider

```tsx
<Slider value={value} onChange={(e, v) => setValue(v)} min={0} max={100} />
```

### Range Slider

```tsx
<Slider value={[20, 80]} onChange={(e, v) => setRange(v)} min={0} max={100} />
```

### With Custom Marks

```tsx
const marks = [
  { value: 0, label: '0°C' },
  { value: 20, label: '20°C' },
  { value: 37, label: '37°C' },
  { value: 100, label: '100°C' },
];

<Slider value={value} marks={marks} step={null} valueLabelDisplay="auto" />;
```

### Vertical Slider

```tsx
<Slider value={value} orientation="vertical" sx={{ height: 300 }} />
```

### With Glow Effect

```tsx
<Slider value={value} enableGlow color="primary" />
```

### Custom Value Label

```tsx
<Slider value={value} valueLabelDisplay="on" valueLabelFormat={(v) => `${v}%`} />
```

## Styling

The component accepts MUI's `sx` prop for custom styling:

```tsx
<Slider
  sx={{
    '& .MuiSlider-track': {
      border: 'none',
    },
    '& .MuiSlider-thumb': {
      width: 24,
      height: 24,
      backgroundColor: '#fff',
      '&:before': {
        boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
      },
    },
  }}
/>
```

## Best Practices

1. **Provide Labels**: Always include aria-label or aria-labelledby for accessibility
2. **Value Feedback**: Show current value through labels or separate display
3. **Appropriate Steps**: Choose step values that make sense for your use case
4. **Range Validation**: Ensure min/max values are appropriate
5. **Keyboard Support**: Test keyboard navigation thoroughly
6. **Mobile Touch**: Ensure thumb is large enough for touch interaction
7. **Color Contrast**: Maintain sufficient contrast for visibility

## Accessibility

The Slider component follows WAI-ARIA authoring practices:

- Uses `role="slider"` for single value
- Provides `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Supports `aria-label` and `aria-labelledby`
- Full keyboard navigation support
- Focus management for range sliders
- Screen reader announcements for value changes

## Performance Considerations

- The component is optimized for smooth dragging
- Uses React.memo to prevent unnecessary re-renders
- Debounced value updates available through controlled mode
- Efficient event handling for mouse and touch events

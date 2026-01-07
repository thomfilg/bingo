# Popover

A flexible popover component built on top of Material-UI's Popover, providing enhanced styling variants and interactive effects.

## Props

### `variant` (optional)

- **Type:** `'default' | 'glass' | 'arrow'`
- **Default:** `'default'`
- **Description:** The visual variant of the popover
  - `default`: Standard popover with solid background and shadow
  - `glass`: Glassmorphism effect with backdrop blur and transparency
  - `arrow`: Enhanced popover with stronger shadows (intended for arrow variants)

### `glow` (optional)

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Whether the popover should have a glowing effect using the primary theme color

### `pulse` (optional)

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Whether the popover should have a subtle pulse animation effect

### `arrow` (optional)

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Whether to show an arrow pointing to the anchor (currently defined in types but not implemented in component)

### `maxWidth` (optional)

- **Type:** `number`
- **Default:** `400`
- **Description:** Maximum width of the popover in pixels

### Inherited Props

All other props from Material-UI's `PopoverProps` are supported, including:

- `open`: Controls whether the popover is open
- `anchorEl`: The element the popover is anchored to
- `onClose`: Callback fired when the popover requests to be closed
- `anchorOrigin`: The anchor point on the anchor element
- `transformOrigin`: The transform origin point on the popover

## Usage Examples

### Basic Popover

```tsx
<Popover open={open} anchorEl={anchorEl} onClose={handleClose}>
  <Typography sx={{ p: 2 }}>Basic popover content</Typography>
</Popover>
```

### Glass Effect Popover

```tsx
<Popover variant="glass" open={open} anchorEl={anchorEl} onClose={handleClose}>
  <Typography sx={{ p: 2 }}>Glass effect popover</Typography>
</Popover>
```

### Popover with Glow Effect

```tsx
<Popover glow open={open} anchorEl={anchorEl} onClose={handleClose}>
  <Typography sx={{ p: 2 }}>Glowing popover</Typography>
</Popover>
```

### Animated Popover

```tsx
<Popover pulse open={open} anchorEl={anchorEl} onClose={handleClose}>
  <Typography sx={{ p: 2 }}>Pulsing popover</Typography>
</Popover>
```

## Accessibility Notes

- The component inherits all accessibility features from Material-UI's Popover
- Proper focus management is handled automatically
- Escape key closes the popover by default
- Screen readers can navigate the content properly
- ARIA attributes are applied automatically

## Best Practices

1. **Positioning**: Use appropriate `anchorOrigin` and `transformOrigin` props to ensure the popover appears in the optimal location
2. **Content**: Keep popover content concise and focused on the primary action or information
3. **Interactive Elements**: Ensure interactive elements within the popover are keyboard accessible
4. **Mobile**: Consider the mobile experience - popovers should adapt well to smaller screens
5. **Performance**: Use the `glow` and `pulse` effects sparingly as they involve CSS animations and filters

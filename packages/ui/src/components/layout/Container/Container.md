# Container Component

A responsive container component that constrains content width and provides consistent padding. Built on MUI Container with enhanced variants and responsive behavior.

## Purpose

The Container component is used to center content horizontally and limit its maximum width for better readability on larger screens. It provides flexible layout constraints and responsive behavior for content organization.

## Props

### Required Props

- `children` (ReactNode): Content to render inside the container

### Optional Props

- `maxWidth` ('xs' | 'sm' | 'md' | 'lg' | 'xl' | false | string): Maximum width constraint (default: 'lg')
- `variant` ('default' | 'fluid' | 'centered' | 'padded'): Container style variant (default: 'default')
- `padding` ('none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'): Padding size (default: 'md')
- `responsive` (boolean): Enable responsive padding behavior (default: true)
- Standard MUI Container props are also supported

## Usage Examples

### Basic Container

```tsx
import { Container } from '@repo/ui';

<Container>
  <p>Your content goes here</p>
</Container>;
```

### Fluid Container

```tsx
<Container variant="fluid">
  <p>This container expands to full width</p>
</Container>
```

### Centered Container

```tsx
<Container variant="centered">
  <p>This content is centered in the viewport</p>
</Container>
```

### Container with Custom Padding

```tsx
<Container padding="xl">
  <p>Container with extra large padding</p>
</Container>
```

### Non-responsive Container

```tsx
<Container responsive={false}>
  <p>This container maintains fixed padding across all screen sizes</p>
</Container>
```

## Variants

### default

Standard container with responsive width constraints and default padding.

### fluid

Expands to fill the full width of its parent container.

### centered

Centers its content both horizontally and vertically in the viewport.

### padded

Adds extra vertical padding, useful for main content areas.

## Size Options

- **xs**: Maximum width 444px
- **sm**: Maximum width 600px
- **md**: Maximum width 900px
- **lg**: Maximum width 1200px
- **xl**: Maximum width 1536px
- **false**: No maximum width constraint

## Padding Options

- **none**: No padding
- **xs**: 8px padding
- **sm**: 16px padding
- **md**: 24px padding (default)
- **lg**: 32px padding
- **xl**: 48px padding

## Accessibility

- The component maintains semantic HTML structure
- Supports all standard ARIA attributes through MUI Container
- Responsive design ensures content remains accessible on all device sizes
- Focus management is handled by child components

## Best Practices

- Use `maxWidth="md"` for optimal reading experience with text content
- Enable `responsive` prop for mobile-friendly layouts
- Use `variant="padded"` for main page sections that need extra spacing
- Combine with other layout components (Grid, Stack) for complex layouts
- Avoid nesting containers unless specifically needed for design purposes

## Design Tokens

The component uses MUI theme tokens for:

- Spacing (for padding values)
- Breakpoints (for responsive behavior)
- Maximum width constraints (following MUI's breakpoint system)

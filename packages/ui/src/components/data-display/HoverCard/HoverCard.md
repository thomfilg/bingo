# HoverCard Component

## Purpose

The HoverCard component displays additional information in a card-style popup when hovering over a trigger element. It's commonly used for showing contextual information, user details, preview content, or tooltips with rich content without cluttering the main interface.

## Props

### Core Props

- `variant?: 'default' | 'glass' | 'detailed' | 'minimal'` - The visual style of the hover card
- `title?: string` - The title displayed in the hover card
- `description?: string` - The description text displayed below the title
- `children?: React.ReactNode` - Custom content to render inside the hover card
- `trigger?: React.ReactElement` - Custom trigger element that activates the hover card

### Visual Props

- `glow?: boolean` - Adds a glow effect to the card
- `pulse?: boolean` - Adds a pulse animation to the card
- `showArrow?: boolean` - Shows an arrow pointing to the trigger element
- `animation?: 'fade' | 'scale' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'` - The animation type for entrance/exit
- `avatar?: string | React.ReactElement` - Avatar/image to display (for detailed variant)

### Positioning Props

- `placement?: HoverCardPlacement` - Position relative to trigger ('top', 'bottom', 'left', 'right' and their variants)
- `offset?: number` - Distance from trigger element in pixels (default: 8)
- `maxWidth?: number` - Maximum width of the card (default: 400)

### Interaction Props

- `enterDelay?: number` - Delay before showing the card in milliseconds (default: 700)
- `exitDelay?: number` - Delay before hiding the card in milliseconds (default: 0)
- `touchEnabled?: boolean` - Enable touch/click interaction on mobile devices (default: true)
- `disabled?: boolean` - Disable the hover card

### Loading State Props

- `loading?: boolean` - Show loading state
- `loadingComponent?: React.ReactNode` - Custom loading component

### Event Props

- `onOpen?: () => void` - Callback when the hover card opens
- `onClose?: () => void` - Callback when the hover card closes

## Usage Examples

### Basic Usage

```tsx
<HoverCard title="User Information" description="View detailed user profile">
  <Button>Hover me</Button>
</HoverCard>
```

### With Custom Trigger

```tsx
<HoverCard
  title="Product Details"
  description="Premium features included"
  trigger={
    <IconButton>
      <InfoIcon />
    </IconButton>
  }
/>
```

### Detailed Variant with Avatar

```tsx
<HoverCard
  variant="detailed"
  avatar="/user-avatar.jpg"
  title="John Doe"
  description="Senior Developer"
>
  <Typography>Additional content here</Typography>
</HoverCard>
```

### Glass Effect with Animation

```tsx
<HoverCard
  variant="glass"
  glow
  animation="scale"
  title="Modern UI"
  description="Beautiful glass morphism effect"
>
  <Chip label="Premium" />
</HoverCard>
```

### With Loading State

```tsx
<HoverCard loading={isLoading} loadingComponent={<CustomLoader />} title="Dynamic Content">
  <Link>Hover for details</Link>
</HoverCard>
```

## Accessibility Notes

- The component supports keyboard navigation (Escape key to close)
- Proper ARIA attributes are applied to the popover
- Focus management is handled automatically
- Touch support for mobile devices can be enabled/disabled
- Screen reader friendly with proper labeling

## Best Practices

1. **Content**: Keep hover card content concise and relevant
2. **Delays**: Use appropriate enter/exit delays for better UX
3. **Placement**: Choose placement that doesn't obscure important content
4. **Mobile**: Consider touch interaction for mobile users
5. **Loading**: Provide loading states for dynamic content
6. **Performance**: Avoid heavy content in hover cards
7. **Accessibility**: Ensure content is accessible via keyboard navigation

## Variants Guide

- **default**: Standard card with shadow and border
- **glass**: Glass morphism effect with blur backdrop
- **detailed**: Rich layout with avatar support
- **minimal**: Compact design with minimal styling

## Animation Types

- **fade**: Simple fade in/out
- **scale**: Scale from center point
- **slide-up**: Slide from bottom
- **slide-down**: Slide from top
- **slide-left**: Slide from right
- **slide-right**: Slide from left

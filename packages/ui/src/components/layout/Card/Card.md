# Card Component

## Overview

The Card component provides a flexible, customizable container for organizing content with consistent styling, padding, and visual hierarchy. It supports multiple visual variants, interactive states, loading states, and comprehensive accessibility features.

## Features

- **Multiple Variants**: elevated, outlined, glass, gradient, neumorphic
- **Interactive States**: hover effects, click handling, focus management
- **Visual Effects**: glow effects, pulse animations, border radius options
- **Loading States**: integrated loading indicator with overlay
- **Responsive Design**: adapts to different screen sizes
- **Accessibility**: full ARIA support and keyboard navigation
- **Sub-components**: CardHeader, CardContent, CardActions, CardMedia

## Usage

### Basic Card

```tsx
import { Card, CardContent } from '@/components/layout/Card';

<Card variant="elevated">
  <CardContent>Basic card content</CardContent>
</Card>;
```

### Interactive Card

```tsx
<Card variant="outlined" interactive onClick={() => console.log('Card clicked')}>
  <CardContent>Click me!</CardContent>
</Card>
```

### Glass Effect Card

```tsx
<Card variant="glass" glow>
  <CardContent>Modern glass effect</CardContent>
</Card>
```

### Complete Card with All Components

```tsx
<Card variant="elevated" interactive>
  <CardMedia image="/path/to/image.jpg" title="Card image" height={200} />
  <CardHeader
    title="Card Title"
    subtitle="Card subtitle"
    avatar={<Avatar>A</Avatar>}
    action={
      <IconButton>
        <MoreVert />
      </IconButton>
    }
  />
  <CardContent>Card content goes here</CardContent>
  <CardActions alignment="right">
    <Button>Cancel</Button>
    <Button variant="contained">Save</Button>
  </CardActions>
</Card>
```

## Props

### Card Props

| Prop         | Type                                                              | Default    | Description                                       |
| ------------ | ----------------------------------------------------------------- | ---------- | ------------------------------------------------- |
| children     | ReactNode                                                         | -          | Content to display within the card                |
| variant      | 'elevated' \| 'outlined' \| 'glass' \| 'gradient' \| 'neumorphic' | 'elevated' | Visual style variant                              |
| interactive  | boolean                                                           | false      | Enables hover/focus states for clickable cards    |
| glow         | boolean                                                           | false      | Adds glow effect around the card                  |
| pulse        | boolean                                                           | false      | Adds pulsing animation effect                     |
| borderRadius | 'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'                  | 'md'       | Border radius size                                |
| loading      | boolean                                                           | false      | Shows loading indicator and disables interactions |
| onClick      | MouseEventHandler                                                 | -          | Click event handler                               |
| onFocus      | FocusEventHandler                                                 | -          | Focus event handler                               |
| onBlur       | FocusEventHandler                                                 | -          | Blur event handler                                |

### CardHeader Props

| Prop     | Type      | Default | Description                                   |
| -------- | --------- | ------- | --------------------------------------------- |
| title    | ReactNode | -       | Primary header text                           |
| subtitle | ReactNode | -       | Secondary header text                         |
| action   | ReactNode | -       | Action element (usually buttons/icons)        |
| avatar   | ReactNode | -       | Avatar element                                |
| children | ReactNode | -       | Custom header content (overrides other props) |

### CardContent Props

| Prop     | Type      | Default | Description                        |
| -------- | --------- | ------- | ---------------------------------- |
| children | ReactNode | -       | Content to display                 |
| dense    | boolean   | false   | Reduces padding for compact layout |

### CardActions Props

| Prop           | Type                                             | Default | Description                             |
| -------------- | ------------------------------------------------ | ------- | --------------------------------------- |
| children       | ReactNode                                        | -       | Action buttons/elements                 |
| disableSpacing | boolean                                          | false   | Removes default spacing between actions |
| alignment      | 'left' \| 'center' \| 'right' \| 'space-between' | 'left'  | Alignment of action buttons             |

### CardMedia Props

| Prop      | Type             | Default | Description            |
| --------- | ---------------- | ------- | ---------------------- |
| component | ElementType      | 'div'   | Component to render as |
| image     | string           | -       | Image URL              |
| title     | string           | -       | Image alt text         |
| height    | number \| string | 200     | Media height           |
| children  | ReactNode        | -       | Custom media content   |

## Variants

### Elevated

Default Material Design elevated card with shadow.

### Outlined

Card with border instead of shadow, minimal appearance.

### Glass

Modern glassmorphism effect with backdrop blur.

### Gradient

Card with gradient background and contrast text.

### Neumorphic

Soft UI design with inset/outset shadow effects.

## Accessibility

- Proper ARIA attributes for interactive cards
- Keyboard navigation support (Tab, Enter, Space)
- Focus management with visible focus indicators
- Screen reader compatibility
- Loading state announcements

## Best Practices

1. **Content Organization**: Use CardHeader for titles, CardContent for main content, and CardActions for buttons
2. **Interactive Feedback**: Enable `interactive` prop for clickable cards to provide visual feedback
3. **Loading States**: Use the `loading` prop to prevent interactions during async operations
4. **Accessibility**: Always provide meaningful titles and alt text for media
5. **Performance**: Use appropriate variants - glass effects may impact performance on older devices
6. **Responsive Design**: Test cards across different screen sizes, especially with media content

## Examples

### Product Card

```tsx
<Card variant="elevated" interactive>
  <CardMedia image="/product.jpg" title="Product" height={240} />
  <CardContent>
    <Typography variant="h6">Product Name</Typography>
    <Typography color="text.secondary">$99.99</Typography>
  </CardContent>
  <CardActions>
    <Button size="small">Add to Cart</Button>
    <Button size="small">Learn More</Button>
  </CardActions>
</Card>
```

### Profile Card

```tsx
<Card variant="glass" glow>
  <CardHeader
    avatar={<Avatar src="/avatar.jpg" />}
    title="John Doe"
    subtitle="Software Engineer"
    action={
      <IconButton>
        <Settings />
      </IconButton>
    }
  />
  <CardContent>
    <Typography>Full-stack developer with 5 years of experience in React and Node.js.</Typography>
  </CardContent>
</Card>
```

# Avatar Component

## Overview

The Avatar component displays user profile pictures, initials, or icons in a visually appealing format. It provides comprehensive fallback mechanisms when images fail to load and supports various sizes, variants, and visual effects.

## Features

- **Image Support**: Display user profile pictures with automatic loading states
- **Fallback Handling**: Graceful degradation to initials or icons when images fail
- **Multiple Variants**: Circle, square, rounded, and status indicator variants
- **Size Options**: Six predefined sizes from xs to xxl
- **Visual Effects**: Glow, pulse, and bordered styles
- **Status Indicators**: Online, offline, away, and busy status badges
- **Theme Integration**: Full MUI theme color support
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA attributes
- **Interactive States**: Hover, focus, and click interactions
- **Group Support**: AvatarGroup for displaying multiple avatars with overflow handling
- **Loading States**: Shimmer animation during image loading
- **Error Handling**: Automatic fallback display on image load errors

## Usage

### Basic Usage

```tsx
import { Avatar } from '@repo/ui';

// With image
<Avatar
  src="/path/to/image.jpg"
  alt="User Name"
/>

// With fallback text
<Avatar fallback="JD" />

// With icon
<Avatar icon={<PersonIcon />} />
```

### Size Variations

```tsx
<Avatar fallback="XS" size="xs" />  // 24x24px
<Avatar fallback="SM" size="sm" />  // 32x32px
<Avatar fallback="MD" size="md" />  // 40x40px (default)
<Avatar fallback="LG" size="lg" />  // 48x48px
<Avatar fallback="XL" size="xl" />  // 64x64px
<Avatar fallback="XXL" size="xxl" /> // 80x80px
```

### Variants

```tsx
// Circle (default)
<Avatar variant="circle" fallback="CI" />

// Square
<Avatar variant="square" fallback="SQ" />

// Rounded
<Avatar variant="rounded" fallback="RN" />

// With status indicator
<Avatar variant="status" status="online" fallback="ON" />
```

### Visual Effects

```tsx
// Glow effect
<Avatar glow fallback="GL" />

// Pulse animation
<Avatar pulse fallback="PL" />

// Bordered
<Avatar bordered fallback="BD" />

// Combined effects
<Avatar glow pulse bordered fallback="CB" />
```

### Status Indicators

```tsx
<Avatar variant="status" status="online" fallback="ON" />
<Avatar variant="status" status="offline" fallback="OF" />
<Avatar variant="status" status="away" fallback="AW" />
<Avatar variant="status" status="busy" fallback="BS" />
```

### Interactive Avatars

```tsx
// Clickable avatar
<Avatar
  interactive
  onClick={handleClick}
  fallback="CL"
/>

// With custom interaction handler
<Avatar
  onClick={(e) => console.log('Avatar clicked')}
  fallback="IN"
/>
```

### Avatar Groups

```tsx
import { AvatarGroup } from '@repo/ui';

<AvatarGroup max={3} overlap={8}>
  <Avatar fallback="A1" />
  <Avatar fallback="A2" />
  <Avatar fallback="A3" />
  <Avatar fallback="A4" />
  <Avatar fallback="A5" />
</AvatarGroup>;
// Displays first 3 avatars plus "+2" overflow indicator
```

### Loading States

```tsx
// Manual loading state
<Avatar loading fallback="LD" />

// Automatic loading during image fetch
<Avatar src="/slow-loading-image.jpg" fallback="SL" />
```

### Error Handling

```tsx
<Avatar
  src="/invalid-image.jpg"
  fallback="ER"
  onError={(e) => console.log('Image failed to load')}
  showFallbackOnError={true}
/>
```

### Theme Integration

```tsx
// Using theme colors
<Avatar color="primary" fallback="PR" />
<Avatar color="secondary" fallback="SC" />
<Avatar color="error" fallback="ER" />
<Avatar color="warning" fallback="WN" />
<Avatar color="success" fallback="SU" />
<Avatar color="neutral" fallback="NT" />
```

## Props

| Prop                  | Type                                                                         | Default     | Description                                            |
| --------------------- | ---------------------------------------------------------------------------- | ----------- | ------------------------------------------------------ |
| `variant`             | `'circle' \| 'square' \| 'rounded' \| 'status'`                              | `'circle'`  | Shape variant of the avatar                            |
| `size`                | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl'`                              | `'md'`      | Size of the avatar                                     |
| `src`                 | `string`                                                                     | -           | Image URL for the avatar                               |
| `alt`                 | `string`                                                                     | -           | Alternative text for the image                         |
| `fallback`            | `string \| ReactNode`                                                        | -           | Content to display when image is not available         |
| `icon`                | `ReactNode`                                                                  | -           | Icon to display instead of image or text               |
| `glow`                | `boolean`                                                                    | `false`     | Apply glow effect to the avatar                        |
| `pulse`               | `boolean`                                                                    | `false`     | Apply pulse animation to the avatar                    |
| `bordered`            | `boolean`                                                                    | `false`     | Add border to the avatar                               |
| `status`              | `'online' \| 'offline' \| 'away' \| 'busy'`                                  | -           | Status indicator (requires variant="status")           |
| `color`               | `'primary' \| 'secondary' \| 'error' \| 'warning' \| 'success' \| 'neutral'` | `'primary'` | Theme color for the avatar background                  |
| `loading`             | `boolean`                                                                    | `false`     | Show loading state with shimmer effect                 |
| `interactive`         | `boolean`                                                                    | `false`     | Enable interactive hover/focus states                  |
| `onClick`             | `(event: MouseEvent) => void`                                                | -           | Click handler (automatically makes avatar interactive) |
| `onError`             | `(event: SyntheticEvent) => void`                                            | -           | Error handler for image load failures                  |
| `showFallbackOnError` | `boolean`                                                                    | `true`      | Show fallback content when image fails to load         |
| `animationDelay`      | `number`                                                                     | `0`         | Delay before fade-in animation (ms)                    |
| `className`           | `string`                                                                     | -           | Additional CSS classes                                 |
| `children`            | `ReactNode`                                                                  | -           | Custom content for the avatar                          |

## AvatarGroup Props

| Prop        | Type        | Default | Description                          |
| ----------- | ----------- | ------- | ------------------------------------ |
| `max`       | `number`    | `4`     | Maximum number of avatars to display |
| `overlap`   | `number`    | `8`     | Pixel overlap between avatars        |
| `className` | `string`    | -       | Additional CSS classes               |
| `children`  | `ReactNode` | -       | Avatar components to group           |

## Accessibility

The Avatar component is fully accessible with:

- **ARIA Labels**: Proper aria-label attributes for screen readers
- **Alt Text**: Support for alt text on images
- **Keyboard Navigation**: Full keyboard support for interactive avatars
- **Focus Management**: Clear focus indicators with proper outline
- **Role Attributes**: Correct role="button" for interactive avatars
- **Status Announcements**: Screen reader friendly status indicators
- **Color Contrast**: WCAG 2.1 AA compliant color combinations

### Best Practices

1. Always provide `alt` text for image avatars
2. Use descriptive `aria-label` for icon-only avatars
3. Include status descriptions for screen readers when using status indicators
4. Ensure sufficient color contrast between avatar background and text
5. Use semantic HTML and proper ARIA attributes

## Examples

### User Profile Card

```tsx
<Card>
  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Avatar src="/user-profile.jpg" alt="John Doe" size="lg" bordered />
    <Box>
      <Typography variant="h6">John Doe</Typography>
      <Typography variant="body2" color="text.secondary">
        Senior Developer
      </Typography>
    </Box>
  </CardContent>
</Card>
```

### Team Members List

```tsx
<AvatarGroup max={5}>
  {teamMembers.map((member) => (
    <Avatar key={member.id} src={member.avatar} alt={member.name} fallback={member.initials} />
  ))}
</AvatarGroup>
```

### Status Indicator in Chat

```tsx
<ListItem>
  <ListItemAvatar>
    <Avatar variant="status" status={user.status} src={user.avatar} fallback={user.initials} />
  </ListItemAvatar>
  <ListItemText primary={user.name} secondary={user.lastMessage} />
</ListItem>
```

## Performance Considerations

- Images are lazy-loaded with loading states
- Animations use CSS transforms for better performance
- Shimmer effects use CSS animations instead of JavaScript
- Component uses React.memo for optimization when appropriate
- Proper image sizing prevents layout shifts

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch interactions

## Related Components

- [Badge](../Badge/Badge.md) - For notification indicators
- [Chip](../Chip/Chip.md) - For compact user representations
- [Skeleton](../../layout/Skeleton/Skeleton.md) - For loading placeholders

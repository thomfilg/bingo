# Carousel Component

## Purpose

The Carousel component is a versatile data display component that presents content in a rotating, sequential manner. It supports various visual styles, animations, and interactive features for engaging content presentation.

## Usage

```tsx
import { Carousel } from '@/components/data-display/Carousel';

<Carousel
  items={[
    { id: '1', content: 'Slide 1', image: '/image1.jpg', title: 'First Slide' },
    { id: '2', content: 'Slide 2', image: '/image2.jpg', title: 'Second Slide' },
  ]}
  variant="glass"
  autoPlay={true}
  showIndicators={true}
/>;
```

## Props

### items

- **Type**: `CarouselItem[]`
- **Required**: Yes
- **Description**: Array of carousel items with content, images, titles, and descriptions

### variant

- **Type**: `'default' | 'glass' | 'gradient' | 'elevated' | 'minimal' | 'cards'`
- **Default**: `'default'`
- **Description**: Visual style variant of the carousel

### size

- **Type**: `'xs' | 'sm' | 'md' | 'lg' | 'xl'`
- **Default**: `'md'`
- **Description**: Size of the carousel

### color

- **Type**: `'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'`
- **Default**: `'primary'`
- **Description**: Color theme for controls and visual effects

### autoPlay

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enable automatic slide progression

### autoPlayInterval

- **Type**: `number`
- **Default**: `3000`
- **Description**: Interval between auto-play slides in milliseconds

### loop

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Enable looping when reaching first/last slide

### showIndicators

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show dot indicators for navigation

### showArrows

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show navigation arrows

### showThumbnails

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Show thumbnail navigation

### pauseOnHover

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Pause autoplay when hovering over the carousel

### animation

- **Type**: `'slide' | 'fade' | 'zoom' | 'flip'`
- **Default**: `'slide'`
- **Description**: Slide transition animation type

### height

- **Type**: `number | string`
- **Default**: `400`
- **Description**: Height of the carousel

### width

- **Type**: `number | string`
- **Default**: `'100%'`
- **Description**: Width of the carousel

### indicatorPosition

- **Type**: `'top' | 'bottom' | 'left' | 'right'`
- **Default**: `'bottom'`
- **Description**: Position of the indicator dots

### arrowPosition

- **Type**: `'overlay' | 'outside' | 'inside'`
- **Default**: `'overlay'`
- **Description**: Position of navigation arrows

### glow

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enable glow effect

### pulse

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enable pulsing animation

### glass

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enable glass morphism effect

### gradient

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enable gradient backgrounds

### loading

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Show loading state

### disabled

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Disable all carousel interactions

### onClick

- **Type**: `(item: CarouselItem, index: number) => void`
- **Description**: Callback when a carousel item is clicked

### onChange

- **Type**: `(index: number) => void`
- **Description**: Callback when the active slide changes

### onFocus

- **Type**: `FocusEventHandler<HTMLDivElement>`
- **Description**: Focus event handler

### onBlur

- **Type**: `FocusEventHandler<HTMLDivElement>`
- **Description**: Blur event handler

## Examples

### Basic Carousel

```tsx
<Carousel
  items={[
    { id: '1', content: 'Slide 1' },
    { id: '2', content: 'Slide 2' },
  ]}
/>
```

### Autoplay with Thumbnails

```tsx
<Carousel
  items={items}
  autoPlay={true}
  autoPlayInterval={5000}
  showThumbnails={true}
  pauseOnHover={true}
/>
```

### Glass Effect with Gradient

```tsx
<Carousel items={items} variant="glass" gradient={true} glow={true} animation="fade" />
```

### Cards Layout

```tsx
<Carousel items={items} variant="cards" showArrows={true} arrowPosition="outside" size="lg" />
```

## Accessibility

- **Keyboard Navigation**: Supports arrow keys for navigation (Left/Right arrows)
- **ARIA Attributes**: Includes proper ARIA labels and roles for screen readers
- **Focus Management**: Maintains proper focus states and tab order
- **Screen Reader Support**: Announces slide changes and current position
- **Alt Text**: Supports alt text for images
- **Pause Controls**: Can be paused/resumed with keyboard

## Best Practices

1. **Content Structure**: Ensure carousel items have consistent structure for better user experience
2. **Image Optimization**: Use optimized images to improve performance
3. **Autoplay Consideration**: Consider user preference for motion when using autoplay
4. **Mobile Experience**: Test swipe gestures on touch devices
5. **Fallback Content**: Provide meaningful content when images fail to load
6. **Indicator Clarity**: Ensure indicators are visible against carousel content
7. **Performance**: Limit the number of items for better performance

## Related Components

- `Gallery`: For displaying image collections
- `Slider`: For numeric range selection
- `Tabs`: For switchable content panels
- `Timeline`: For chronological content display

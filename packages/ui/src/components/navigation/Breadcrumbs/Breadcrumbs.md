# Breadcrumbs Component

A hierarchical navigation component that displays a user's current location within a website structure and allows easy navigation to parent levels.

## Purpose

The Breadcrumbs component provides clear navigation hierarchy, showing users exactly where they are in the application and allowing them to navigate back to parent levels with a single click. It supports various visual styles, responsive behavior, and comprehensive accessibility features.

## Props

### BreadcrumbsProps

| Prop               | Type                                                              | Default     | Description                                        |
| ------------------ | ----------------------------------------------------------------- | ----------- | -------------------------------------------------- |
| `variant`          | `'default' \| 'glass' \| 'elevated' \| 'outlined'`                | `'default'` | Visual appearance variant                          |
| `separatorType`    | `'default' \| 'slash' \| 'arrow' \| 'chevron' \| 'dot' \| 'pipe'` | `'default'` | Type of separator between items                    |
| `items`            | `BreadcrumbItem[]`                                                | -           | **Required.** Array of breadcrumb items            |
| `separator`        | `ReactNode`                                                       | -           | Custom separator element (overrides separatorType) |
| `maxItems`         | `number`                                                          | `8`         | Maximum items before collapsing                    |
| `mobileMaxItems`   | `number`                                                          | `3`         | Maximum items on mobile devices                    |
| `collapseBehavior` | `'menu' \| 'ellipsis'`                                            | `'menu'`    | How to handle collapsed items                      |
| `showHomeIcon`     | `boolean`                                                         | `true`      | Whether to show home icon for first item           |
| `size`             | `'sm' \| 'md' \| 'lg'`                                            | `'md'`      | Component size                                     |
| `color`            | `'default' \| 'primary' \| 'secondary'`                           | `'default'` | Color scheme                                       |
| `elevation`        | `0 \| 1 \| 2 \| 3 \| 4 \| 5`                                      | `1`         | Elevation for glass/elevated variants              |
| `ariaLabel`        | `string`                                                          | -           | Custom aria-label for navigation                   |

### BreadcrumbItem

| Prop        | Type              | Default | Description                         |
| ----------- | ----------------- | ------- | ----------------------------------- |
| `label`     | `string`          | -       | **Required.** Display text          |
| `href`      | `string`          | -       | Link URL                            |
| `icon`      | `ReactNode`       | -       | Icon before label                   |
| `active`    | `boolean`         | `false` | Whether this is current/active item |
| `onClick`   | `(event) => void` | -       | Click handler                       |
| `tooltip`   | `string`          | -       | Tooltip text on hover               |
| `ariaLabel` | `string`          | -       | Custom aria-label                   |

## Basic Usage

```tsx
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Electronics', href: '/products/electronics' },
  { label: 'Smartphones', active: true },
];

<Breadcrumbs items={items} />;
```

## Visual Variants

### Default

Standard breadcrumbs with minimal styling.

```tsx
<Breadcrumbs variant="default" items={items} />
```

### Glass Morphism

Modern glass effect with backdrop blur.

```tsx
<Breadcrumbs variant="glass" items={items} />
```

### Elevated

Card-like appearance with shadow.

```tsx
<Breadcrumbs variant="elevated" elevation={2} items={items} />
```

### Outlined

Simple border outline style.

```tsx
<Breadcrumbs variant="outlined" items={items} />
```

## Separator Types

Control the visual separator between breadcrumb items:

```tsx
<Breadcrumbs separatorType="slash" items={items} />
<Breadcrumbs separatorType="arrow" items={items} />
<Breadcrumbs separatorType="chevron" items={items} />
<Breadcrumbs separatorType="dot" items={items} />
<Breadcrumbs separatorType="pipe" items={items} />
```

## Responsive Behavior

Automatically collapses on smaller screens:

```tsx
<Breadcrumbs
  items={items}
  maxItems={8}
  mobileMaxItems={3}
  collapseBehavior="menu" // or "ellipsis"
/>
```

## Accessibility Features

- **ARIA Support**: Proper `role="navigation"` and `aria-label` attributes
- **Keyboard Navigation**: Full keyboard support with Tab and Enter
- **Screen Reader**: Accessible labels and structure
- **Focus Management**: Clear focus indicators and logical tab order

### Accessibility Example

```tsx
<Breadcrumbs items={items} ariaLabel="Page navigation breadcrumb" />
```

## Interactive Features

### With Icons

```tsx
const itemsWithIcons = [
  { label: 'Home', href: '/', icon: <HomeIcon /> },
  { label: 'Products', href: '/products', icon: <ShoppingIcon /> },
  { label: 'Current Page', active: true },
];

<Breadcrumbs items={itemsWithIcons} />;
```

### With Click Handlers

```tsx
const handleBreadcrumbClick = (event, href) => {
  event.preventDefault();
  // Custom navigation logic
  router.push(href);
};

const clickableItems = [
  { label: 'Home', href: '/', onClick: handleBreadcrumbClick },
  { label: 'Products', href: '/products', onClick: handleBreadcrumbClick },
  { label: 'Current', active: true },
];
```

### With Tooltips

```tsx
const itemsWithTooltips = [
  { label: 'Home', href: '/', tooltip: 'Go to homepage' },
  { label: 'Products', href: '/products', tooltip: 'Browse all products' },
  { label: 'Current', active: true, tooltip: 'Current page' },
];
```

## Sizing

```tsx
<Breadcrumbs size="sm" items={items} />
<Breadcrumbs size="md" items={items} />
<Breadcrumbs size="lg" items={items} />
```

## Color Schemes

```tsx
<Breadcrumbs color="default" items={items} />
<Breadcrumbs color="primary" items={items} />
<Breadcrumbs color="secondary" items={items} />
```

## Best Practices

### Navigation Structure

- Always include a "Home" or root level item
- Ensure breadcrumbs reflect the actual site hierarchy
- Keep labels concise but descriptive
- Use the `active` prop for the current page

### Responsive Design

- Set appropriate `mobileMaxItems` for mobile experience
- Consider using `collapseBehavior="ellipsis"` for simpler mobile layouts
- Test on various screen sizes

### Accessibility

- Provide meaningful `ariaLabel` attributes
- Use semantic HTML structure
- Ensure adequate color contrast
- Test with screen readers

### Performance

- Avoid excessive nesting levels (keep under 8 items)
- Use `maxItems` prop to prevent overcrowding
- Consider lazy loading for dynamic breadcrumb data

## Common Patterns

### E-commerce Navigation

```tsx
const ecommerceItems = [
  { label: 'Home', href: '/', icon: <HomeIcon /> },
  { label: 'Electronics', href: '/electronics' },
  { label: 'Smartphones', href: '/electronics/smartphones' },
  { label: 'iPhone', active: true },
];

<Breadcrumbs variant="outlined" items={ecommerceItems} showHomeIcon={true} maxItems={6} />;
```

### Admin Dashboard

```tsx
const adminItems = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Edit User', active: true },
];

<Breadcrumbs variant="glass" color="primary" items={adminItems} separatorType="chevron" />;
```

### Documentation Site

```tsx
const docsItems = [
  { label: 'Docs', href: '/docs' },
  { label: 'Components', href: '/docs/components' },
  { label: 'Navigation', href: '/docs/components/navigation' },
  { label: 'Breadcrumbs', active: true },
];

<Breadcrumbs variant="elevated" items={docsItems} separatorType="arrow" size="sm" />;
```

## Migration Notes

When migrating from other breadcrumb implementations:

- Convert separator props to `separatorType` enum values
- Restructure data to use `BreadcrumbItem[]` format
- Update accessibility attributes to use new prop names
- Test responsive behavior with new collapse options

# NavigationMenu Component

## Overview

A flexible and feature-rich navigation menu component that supports horizontal, vertical, and mega menu layouts. The NavigationMenu provides comprehensive navigation patterns for modern web applications with support for nested items, collapsible sidebars, badges, and responsive designs.

## Component API

### NavigationMenuProps

| Prop              | Type                                      | Default    | Description                                              |
| ----------------- | ----------------------------------------- | ---------- | -------------------------------------------------------- |
| variant           | `'horizontal' \| 'vertical' \| 'mega'`   | 'vertical' | Layout variant of the navigation menu                   |
| items             | `NavigationMenuItem[]`                   | required   | Array of menu items to display                          |
| color             | `'default' \| 'primary' \| 'secondary'`  | 'default'  | Color scheme of the menu                                |
| size              | `'sm' \| 'md' \| 'lg'`                   | 'md'       | Size of the menu items                                  |
| collapsible       | `boolean`                                 | false      | Whether the vertical menu can be collapsed              |
| collapsed         | `boolean`                                 | undefined  | Controlled collapsed state                              |
| onCollapseChange  | `(collapsed: boolean) => void`           | undefined  | Callback when collapse state changes                    |
| logo              | `ReactNode`                               | undefined  | Custom logo/brand element                               |
| endContent        | `ReactNode`                               | undefined  | Additional content to render at the end                 |
| maxWidth          | `number \| string`                       | undefined  | Maximum width for mega menu                             |
| showDividers      | `boolean`                                 | false      | Whether to show dividers between sections               |
| className         | `string`                                  | undefined  | Custom CSS class name                                   |
| style             | `React.CSSProperties`                     | undefined  | Custom inline styles                                    |

### NavigationMenuItem

| Prop         | Type                                         | Default   | Description                                   |
| ------------ | -------------------------------------------- | --------- | --------------------------------------------- |
| id           | `string`                                     | required  | Unique identifier for the menu item          |
| label        | `string`                                     | required  | Label to display for the menu item           |
| icon         | `ReactNode`                                  | undefined | Icon to display before the label             |
| href         | `string`                                     | undefined | URL to navigate to                           |
| active       | `boolean`                                    | false     | Whether the item is currently active         |
| disabled     | `boolean`                                    | false     | Whether the item is disabled                 |
| onClick      | `(event: React.MouseEvent) => void`         | undefined | Click handler for the menu item              |
| badge        | `number \| string`                          | undefined | Badge/notification count                     |
| children     | `NavigationMenuItem[]`                      | undefined | Nested items for submenu                     |
| description  | `string`                                     | undefined | Description text for the item                |
| showChevron  | `boolean`                                    | false     | Whether to show a chevron for submenu        |
| target       | `'_blank' \| '_self' \| '_parent' \| '_top'`| '_self'   | Target for the link                          |

## Usage Examples

### Basic Vertical Navigation

```tsx
import { NavigationMenu } from '@repo/ui';
import { Dashboard, ShoppingCart, People } from '@mui/icons-material';

const items = [
  {
    id: '1',
    label: 'Dashboard',
    icon: <Dashboard />,
    href: '/dashboard',
    active: true,
  },
  {
    id: '2',
    label: 'Orders',
    icon: <ShoppingCart />,
    href: '/orders',
    badge: 5,
  },
  {
    id: '3',
    label: 'Customers',
    icon: <People />,
    href: '/customers',
  },
];

function MyApp() {
  return <NavigationMenu variant="vertical" items={items} />;
}
```

### Collapsible Sidebar

```tsx
import { NavigationMenu } from '@repo/ui';
import { useState } from 'react';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <NavigationMenu
      variant="vertical"
      items={items}
      collapsible
      collapsed={collapsed}
      onCollapseChange={setCollapsed}
      logo={<Logo />}
    />
  );
}
```

### Horizontal Navigation Bar

```tsx
import { NavigationMenu } from '@repo/ui';

const horizontalItems = [
  { id: '1', label: 'Home', href: '/', active: true },
  { id: '2', label: 'Products', href: '/products' },
  { id: '3', label: 'About', href: '/about' },
  { id: '4', label: 'Contact', href: '/contact' },
];

function TopNav() {
  return <NavigationMenu variant="horizontal" items={horizontalItems} />;
}
```

### Mega Menu

```tsx
import { NavigationMenu } from '@repo/ui';

const megaMenuItems = [
  {
    id: 'products',
    label: 'Products',
    children: [
      { id: 'electronics', label: 'Electronics', href: '/electronics' },
      { id: 'clothing', label: 'Clothing', href: '/clothing' },
      { id: 'books', label: 'Books', href: '/books' },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    children: [
      { id: 'consulting', label: 'Consulting', href: '/consulting' },
      { id: 'support', label: 'Support', href: '/support' },
    ],
  },
];

function MegaNav() {
  return (
    <NavigationMenu
      variant="mega"
      items={megaMenuItems}
      logo={<Logo />}
    />
  );
}
```

### Nested Navigation with Submenus

```tsx
const nestedItems = [
  {
    id: '1',
    label: 'Products',
    icon: <Inventory />,
    children: [
      {
        id: '1-1',
        label: 'Categories',
        children: [
          { id: '1-1-1', label: 'Electronics', href: '#' },
          { id: '1-1-2', label: 'Clothing', href: '#' },
        ],
      },
      { id: '1-2', label: 'Brands', href: '#' },
    ],
  },
];
```

## Accessibility

The NavigationMenu component follows WAI-ARIA guidelines for navigation:

- **Keyboard Navigation**: Full keyboard support with Tab, Enter, Space, and Arrow keys
- **Screen Reader Support**: Proper ARIA labels and roles
- **Focus Management**: Clear focus indicators and logical tab order
- **Active State**: Visual and semantic indication of current page/section
- **Disabled State**: Proper handling of disabled menu items

### Keyboard Shortcuts

- `Tab` - Navigate between menu items
- `Enter` / `Space` - Activate menu item or toggle submenu
- `Arrow Up/Down` - Navigate vertically in vertical menus
- `Arrow Left/Right` - Navigate horizontally in horizontal menus
- `Escape` - Close open submenus

## Best Practices

1. **Clear Hierarchy**: Organize navigation items in a logical hierarchy
2. **Consistent Icons**: Use consistent iconography throughout the menu
3. **Active States**: Always indicate the current active page/section
4. **Responsive Design**: Consider using different variants for different screen sizes
5. **Badge Usage**: Use badges sparingly for important notifications
6. **Accessible Labels**: Provide clear, descriptive labels for all menu items
7. **Performance**: For large menus, consider implementing virtualization

## Theming

The NavigationMenu component integrates with Material-UI's theming system:

```tsx
const theme = createTheme({
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
  },
});
```

## Related Components

- `Sidebar` - For complete sidebar implementations
- `Breadcrumbs` - For breadcrumb navigation
- `Tabs` - For tab-based navigation
- `Drawer` - For mobile navigation drawers
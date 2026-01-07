# Sidebar

A flexible navigation sidebar component that supports multiple variants and provides a structured layout for header, content, and footer sections.

## Features

- **Multiple Variants**: Fixed, collapsible, floating, and glass morphism styles
- **Flexible Positioning**: Support for left or right positioning
- **Responsive Behavior**: Collapsible variant with smooth transitions
- **Composable Structure**: Header, content, and footer sections
- **Theme Integration**: Full Material-UI theme support with design tokens

## Basic Usage

```tsx
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@repo/ui';

function App() {
  return (
    <Sidebar variant="fixed">
      <SidebarHeader>
        <Typography variant="h6">My App</Typography>
      </SidebarHeader>

      <SidebarContent>
        <List>
          <ListItem button>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
        </List>
      </SidebarContent>

      <SidebarFooter>
        <Typography variant="caption">Footer content</Typography>
      </SidebarFooter>
    </Sidebar>
  );
}
```

## Variants

### Fixed Sidebar

Default variant with a solid background and border.

```tsx
<Sidebar variant="fixed">{/* content */}</Sidebar>
```

### Collapsible Sidebar

Supports expand/collapse functionality with smooth transitions.

```tsx
const [open, setOpen] = useState(true);

<Sidebar
  variant="collapsible"
  open={open}
  onToggle={() => setOpen(!open)}
  width={280}
  collapsedWidth={64}
>
  {/* content */}
</Sidebar>;
```

### Floating Sidebar

Positioned as a floating overlay with shadow and rounded corners.

```tsx
<Sidebar variant="floating">{/* content */}</Sidebar>
```

### Glass Morphism

Translucent effect with backdrop blur for modern interfaces.

```tsx
<Sidebar variant="glass">{/* content */}</Sidebar>
```

## Props

### Sidebar Props

| Prop             | Type                                                | Default   | Description                                 |
| ---------------- | --------------------------------------------------- | --------- | ------------------------------------------- |
| `children`       | `ReactNode`                                         | -         | Content to render inside the sidebar        |
| `variant`        | `'fixed' \| 'collapsible' \| 'floating' \| 'glass'` | `'fixed'` | Visual style variant                        |
| `open`           | `boolean`                                           | `true`    | Controls visibility for collapsible variant |
| `onToggle`       | `() => void`                                        | -         | Callback when sidebar toggle state changes  |
| `width`          | `number`                                            | `280`     | Sidebar width in pixels when expanded       |
| `collapsedWidth` | `number`                                            | `64`      | Sidebar width in pixels when collapsed      |
| `position`       | `'left' \| 'right'`                                 | `'left'`  | Sidebar positioning                         |
| `className`      | `string`                                            | -         | Additional CSS class name                   |

### Composition Components

All composition components (`SidebarHeader`, `SidebarContent`, `SidebarFooter`) accept:

| Prop       | Type        | Description       |
| ---------- | ----------- | ----------------- |
| `children` | `ReactNode` | Content to render |

## Advanced Examples

### Responsive Navigation

```tsx
function ResponsiveNavigation() {
  const [open, setOpen] = useState(window.innerWidth >= 768);

  return (
    <Sidebar
      variant={window.innerWidth >= 768 ? 'fixed' : 'floating'}
      open={open}
      onToggle={() => setOpen(!open)}
    >
      <SidebarHeader>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Navigation</Typography>
          <IconButton onClick={() => setOpen(!open)}>
            <MenuIcon />
          </IconButton>
        </Box>
      </SidebarHeader>

      <SidebarContent>
        <NavigationList />
      </SidebarContent>
    </Sidebar>
  );
}
```

### Right-Positioned Sidebar

```tsx
<Sidebar variant="fixed" position="right">
  <SidebarHeader>
    <Typography variant="h6">Settings Panel</Typography>
  </SidebarHeader>

  <SidebarContent>
    <SettingsForm />
  </SidebarContent>
</Sidebar>
```

## Styling

The component uses Material-UI's theming system and supports custom styling:

```tsx
<Sidebar
  variant="fixed"
  sx={{
    '& .MuiBox-root': {
      backgroundColor: 'primary.light',
    },
  }}
>
  {/* content */}
</Sidebar>
```

## Accessibility

- Proper semantic structure with landmark roles
- Keyboard navigation support
- Focus management for interactive elements
- Screen reader compatible
- Follows WCAG 2.1 AA guidelines

## Best Practices

1. **Use appropriate variant**: Choose the variant that best fits your layout needs
2. **Responsive design**: Consider mobile experience with floating variant
3. **Content structure**: Use the composition components for consistent spacing
4. **Keyboard support**: Ensure all interactive elements are keyboard accessible
5. **Performance**: Use React.memo for complex sidebar content to prevent unnecessary re-renders

## Related Components

- [Navigation Menu](/docs/navigation-navigationmenu--docs) - For dropdown navigation
- [Drawer](/docs/layout-drawer--docs) - For overlay navigation panels
- [Container](/docs/layout-container--docs) - For main content layout

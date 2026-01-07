# Drawer Component

A slide-out drawer component that can be positioned from any side of the screen. Built on top of MUI's Drawer with additional variants including glass effect, persistent and temporary modes, with customizable dimensions and backdrop behavior.

## Purpose and Use Cases

The Drawer component is perfect for:

- Navigation menus that slide out from the side
- Contextual panels with additional information or controls
- Modal-like content that needs to overlay the main interface
- Settings panels or configuration screens
- Filter panels in data tables or search interfaces
- Temporary workspace areas that can be shown/hidden

## Props Documentation

### Core Props

| Prop       | Type         | Default | Description                         |
| ---------- | ------------ | ------- | ----------------------------------- |
| `children` | `ReactNode`  | -       | Content to render inside the drawer |
| `open`     | `boolean`    | `false` | Controls drawer visibility          |
| `onClose`  | `() => void` | -       | Callback when drawer should close   |

### Positioning Props

| Prop     | Type                                     | Default  | Description                          |
| -------- | ---------------------------------------- | -------- | ------------------------------------ |
| `anchor` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` | Position where drawer slides from    |
| `width`  | `number \| string`                       | `240`    | Drawer width for left/right anchors  |
| `height` | `number \| string`                       | `300`    | Drawer height for top/bottom anchors |

### Behavior Props

| Prop           | Type                                         | Default       | Description                             |
| -------------- | -------------------------------------------- | ------------- | --------------------------------------- |
| `variant`      | `'temporary' \| 'persistent' \| 'permanent'` | `'temporary'` | Drawer behavior type                    |
| `backdrop`     | `boolean`                                    | `true`        | Show backdrop behind drawer             |
| `hideBackdrop` | `boolean`                                    | `false`       | Hide backdrop (overrides backdrop prop) |
| `keepMounted`  | `boolean`                                    | `false`       | Keep drawer in DOM when closed          |

### Styling Props

| Prop        | Type      | Default | Description                      |
| ----------- | --------- | ------- | -------------------------------- |
| `glass`     | `boolean` | `false` | Enable glass/blur effect styling |
| `className` | `string`  | -       | Additional CSS class names       |

## Sub-components

### DrawerHeader

Header section for the drawer with optional close button.

| Prop              | Type         | Default | Description                |
| ----------------- | ------------ | ------- | -------------------------- |
| `children`        | `ReactNode`  | -       | Header content             |
| `onClose`         | `() => void` | -       | Close button click handler |
| `showCloseButton` | `boolean`    | `true`  | Show/hide close button     |

### DrawerContent

Content area with consistent padding and scrollable behavior.

| Prop       | Type               | Default | Description       |
| ---------- | ------------------ | ------- | ----------------- |
| `children` | `ReactNode`        | -       | Content to render |
| `padding`  | `number \| string` | `16`    | Content padding   |

## Usage Examples

### Basic Navigation Drawer

```tsx
import { Drawer, DrawerHeader, DrawerContent } from '@/components/layout/Drawer';

function NavigationDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onClose={() => setOpen(false)} anchor="left" width={280}>
      <DrawerHeader onClose={() => setOpen(false)}>Navigation</DrawerHeader>
      <DrawerContent>
        <nav>
          <a href="/dashboard">Dashboard</a>
          <a href="/settings">Settings</a>
          <a href="/profile">Profile</a>
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
```

### Glass Effect Filter Panel

```tsx
<Drawer
  open={filtersOpen}
  onClose={() => setFiltersOpen(false)}
  anchor="right"
  glass={true}
  width={320}
>
  <DrawerHeader onClose={() => setFiltersOpen(false)}>Filters</DrawerHeader>
  <DrawerContent>
    <FilterForm onApply={handleApplyFilters} />
  </DrawerContent>
</Drawer>
```

### Persistent Settings Panel

```tsx
<Drawer
  open={settingsOpen}
  onClose={() => setSettingsOpen(false)}
  variant="persistent"
  anchor="right"
  hideBackdrop={true}
  width={400}
>
  <DrawerHeader>Settings</DrawerHeader>
  <DrawerContent>
    <SettingsPanel />
  </DrawerContent>
</Drawer>
```

## Accessibility Notes

The Drawer component includes comprehensive accessibility features:

- **ARIA Labels**: Proper `aria-label` attributes for screen readers
- **Focus Management**: Focus is trapped within the drawer when open
- **Keyboard Navigation**: Supports Escape key to close, Tab navigation within
- **Screen Reader Support**: Announces drawer state changes
- **Role Attributes**: Proper `role="dialog"` for modal behavior

### Best Practices

1. **Always provide `onClose`**: Even for persistent drawers, provide a way to close
2. **Use descriptive headers**: Help users understand the drawer's purpose
3. **Manage focus**: Focus the first interactive element when drawer opens
4. **Keyboard shortcuts**: Consider Escape key handling for better UX
5. **Mobile considerations**: Use full-width drawers on small screens

## Theme Integration

The Drawer component integrates with MUI's theme system:

- Respects theme breakpoints for responsive behavior
- Uses theme spacing for consistent padding and margins
- Inherits theme typography for text content
- Supports theme palette colors for backgrounds and borders
- Glass effect uses theme-aware backdrop blur values

## Performance Considerations

- Use `keepMounted={false}` for drawers that are rarely opened
- Consider lazy loading heavy content within drawers
- Glass effect may impact performance on older devices
- Persistent drawers remain in the DOM but can be optimized with content virtualization

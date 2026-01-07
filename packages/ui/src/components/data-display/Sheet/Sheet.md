# Sheet Component

A flexible and feature-rich sheet component that provides sliding panels from any edge of the viewport. The Sheet component supports dragging, swipe gestures, snap points, and multiple visual variants including glass morphism and gradient effects.

## Purpose and Use Cases

The Sheet component is ideal for:

- Mobile-first navigation menus and action panels
- Form overlays and modal dialogs that slide in from edges
- Draggable bottom sheets with snap points for mobile experiences
- Side panels for filtering, settings, or additional content
- Contextual information panels that don't block the main content
- Touch-enabled interfaces with swipe gestures

## Props Documentation

### Core Props

- **open** (boolean): Controls whether the sheet is open or closed
- **onOpenChange** ((open: boolean) => void): Callback fired when the open state changes
- **children** (React.ReactNode): Content to render inside the sheet
- **title** (string): Optional title displayed in the sheet header
- **description** (string): Optional description text displayed below the title

### Positioning and Sizing

- **position** ('top' | 'right' | 'bottom' | 'left'): Edge from which the sheet slides (default: 'bottom')
- **size** ('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'): Predefined size options (default: 'md')
- **fullHeight** (boolean): Expand sheet to full viewport height

### Visual Variants

- **variant** ('default' | 'draggable' | 'glass' | 'gradient' | 'elevated' | 'minimal'): Visual style variant (default: 'default')
- **color** (MUI color): Theme color for accents and highlights
- **glass** (boolean): Enable glass morphism effect with backdrop blur
- **gradient** (boolean): Enable gradient background
- **glow** (boolean): Enable animated glow effect
- **pulse** (boolean): Enable pulse animation effect
- **rounded** (boolean): Apply rounded corners to the sheet
- **elevation** (number): Shadow depth level (0-24)

### Interactive Behavior

- **swipeable** (boolean): Enable swipe gestures for touch devices (default: true)
- **draggable** (boolean): Enable drag handle and dragging behavior
- **showHandle** (boolean): Show visual drag handle indicator (default: true)
- **disabled** (boolean): Disable all user interactions
- **loading** (boolean): Show loading spinner and disable interactions
- **persistent** (boolean): Prevent sheet from being closed by user actions

### Snap Points (for draggable variant)

- **snapPoints** (number[]): Array of snap positions as percentages (0-1) (default: [0.25, 0.5, 0.75, 1])
- **defaultSnapPoint** (number): Initial snap position (default: 0.5)
- **onSnapPointChange** ((point: number) => void): Callback when snap point changes
- **minSnapPoint** (number): Minimum allowed snap point (default: 0)
- **maxSnapPoint** (number): Maximum allowed snap point (default: 1)

### Animation and Physics

- **velocityThreshold** (number): Velocity threshold for snap detection (default: 0.5)
- **dragResistance** (number): Resistance factor at boundaries (default: 0.3)
- **animationConfig** (object): Spring animation configuration with tension, friction, and velocity

### Overlay and Closing

- **showOverlay** (boolean): Show backdrop overlay behind sheet (default: true)
- **closeOnOverlayClick** (boolean): Close sheet when overlay is clicked (default: true)
- **closeOnEscape** (boolean): Close sheet on Escape key press (default: true)
- **showCloseButton** (boolean): Show close button in header (default: true)

### Event Handlers

- **onClick** (() => void): Click event handler
- **onFocus** (() => void): Focus event handler
- **onBlur** (() => void): Blur event handler
- **onClose** (() => void): Called when sheet closes
- **onOpen** (() => void): Called when sheet opens
- **onDragStart** (() => void): Called when dragging starts
- **onDragEnd** (() => void): Called when dragging ends

### Content Sections

- **header** (React.ReactNode): Custom header content (overrides title/description)
- **footer** (React.ReactNode): Footer content rendered at bottom of sheet

## Usage Examples

### Basic Sheet

```tsx
import { Sheet } from '@/components/data-display/Sheet';

function BasicExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Sheet</button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title="Settings"
        description="Adjust your preferences"
      >
        <div>Sheet content goes here</div>
      </Sheet>
    </>
  );
}
```

### Draggable Bottom Sheet with Snap Points

```tsx
<Sheet
  open={open}
  onOpenChange={setOpen}
  position="bottom"
  variant="draggable"
  snapPoints={[0.1, 0.5, 0.9]}
  defaultSnapPoint={0.5}
  onSnapPointChange={(point) => console.log('Snapped to:', point)}
  showHandle
>
  <div>Draggable content</div>
</Sheet>
```

### Glass Morphism Side Panel

```tsx
<Sheet
  open={open}
  onOpenChange={setOpen}
  position="right"
  variant="glass"
  glass
  size="lg"
  title="Filters"
>
  <FilterContent />
</Sheet>
```

### Full-Screen Modal Sheet

```tsx
<Sheet
  open={open}
  onOpenChange={setOpen}
  size="full"
  fullHeight
  showOverlay
  closeOnEscape
  title="Create New Item"
  footer={
    <div>
      <button onClick={() => setOpen(false)}>Cancel</button>
      <button onClick={handleSave}>Save</button>
    </div>
  }
>
  <FormContent />
</Sheet>
```

## Accessibility Notes

- **Focus Management**: Sheet traps focus when open and returns focus to trigger element on close
- **Keyboard Navigation**:
  - Escape key closes the sheet (when closeOnEscape is true)
  - Tab cycles through focusable elements within the sheet
  - Shift+Tab cycles backwards
- **ARIA Attributes**:
  - Uses role="dialog" for modal behavior
  - aria-labelledby points to the title
  - aria-describedby points to the description
  - aria-modal="true" when overlay is shown
- **Screen Readers**: Announces sheet opening/closing and reads title/description
- **Touch Gestures**: Swipe gestures are accessible on touch devices when swipeable is enabled

## Best Practices

1. **Position Selection**: Choose position based on content and device:
   - Bottom sheets work best on mobile devices
   - Side sheets are ideal for desktop filtering/navigation
   - Top sheets for notifications or alerts

2. **Snap Points**: For draggable sheets, provide meaningful snap points:
   - Include a minimal peek state (e.g., 0.1)
   - Provide a comfortable reading position (e.g., 0.5)
   - Allow full expansion for detailed content (e.g., 1.0)

3. **Loading States**: Always show loading state during async operations:

   ```tsx
   <Sheet loading={isLoading}>{content}</Sheet>
   ```

4. **Responsive Design**: Adjust size and position based on viewport:

   ```tsx
   <Sheet
     position={isMobile ? 'bottom' : 'right'}
     size={isMobile ? 'full' : 'lg'}
   >
   ```

5. **Performance**: For sheets with heavy content:
   - Use lazy loading for content
   - Implement virtualization for long lists
   - Debounce drag events if needed

6. **Accessibility**: Always provide:
   - Clear title and description
   - Proper focus management
   - Keyboard navigation support
   - Escape key to close (unless persistent)

7. **Visual Hierarchy**: Use variants consistently:
   - Default for standard overlays
   - Glass for elegant, semi-transparent panels
   - Elevated for important actions
   - Minimal for subtle, non-intrusive content

## Related Components

- **Drawer**: MUI's native drawer component (Sheet extends this)
- **Modal**: For centered dialog boxes
- **Popover**: For small contextual overlays
- **Dialog**: For important user decisions
- **Sidebar**: For persistent navigation panels

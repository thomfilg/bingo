# AlertDialog Component

## Overview

The AlertDialog component provides a modal dialog for alerts, confirmations, and critical user interactions. It supports multiple visual variants, animation effects, and comprehensive accessibility features.

## Purpose and Use Cases

- **Confirmations**: Ask users to confirm destructive or important actions
- **Warnings**: Alert users about potential issues or consequences
- **Information**: Display important information that requires acknowledgment
- **Form Submission**: Confirm form submissions or data changes
- **Logout/Delete Actions**: Confirm irreversible actions with destructive variant

## Props Documentation

### Core Props

| Prop          | Type       | Default | Description                                              |
| ------------- | ---------- | ------- | -------------------------------------------------------- |
| `open`        | `boolean`  | -       | Controls whether the dialog is visible                   |
| `onClose`     | `function` | -       | Callback fired when the dialog is requested to be closed |
| `title`       | `string`   | -       | The title text displayed in the dialog header            |
| `description` | `string`   | -       | The main content text of the dialog                      |

### Action Props

| Prop              | Type       | Default   | Description                                       |
| ----------------- | ---------- | --------- | ------------------------------------------------- |
| `onConfirm`       | `function` | -         | Callback fired when the confirm button is clicked |
| `onCancel`        | `function` | -         | Callback fired when the cancel button is clicked  |
| `confirmText`     | `string`   | 'Confirm' | Text for the confirm button                       |
| `cancelText`      | `string`   | 'Cancel'  | Text for the cancel button                        |
| `showCancel`      | `boolean`  | true      | Whether to show the cancel button                 |
| `confirmDisabled` | `boolean`  | false     | Whether the confirm button is disabled            |
| `loading`         | `boolean`  | false     | Shows loading state on confirm button             |

### Visual Props

| Prop      | Type                                    | Default   | Description                                                             |
| --------- | --------------------------------------- | --------- | ----------------------------------------------------------------------- |
| `variant` | `'default' \| 'destructive' \| 'glass'` | 'default' | Visual style variant                                                    |
| `glow`    | `boolean`                               | false     | Adds a glowing effect to the dialog                                     |
| `pulse`   | `boolean`                               | false     | Adds a pulsing animation effect                                         |
| `icon`    | `ReactNode`                             | -         | Custom icon to display (auto-selected based on variant if not provided) |

### Content Props

| Prop       | Type        | Default | Description                                      |
| ---------- | ----------- | ------- | ------------------------------------------------ |
| `children` | `ReactNode` | -       | Additional content to display in the dialog body |

## Usage Examples

### Basic Confirmation Dialog

```tsx
import { AlertDialog } from '@repo/ui';

function DeleteConfirmation() {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    // Perform delete action
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Delete Item</Button>
      <AlertDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
```

### Destructive Action Dialog

```tsx
<AlertDialog
  open={open}
  variant="destructive"
  title="Delete Account"
  description="This will permanently delete your account and all associated data."
  confirmText="Delete Account"
  onConfirm={handleDelete}
  onClose={() => setOpen(false)}
/>
```

### Glass Morphism Effect

```tsx
<AlertDialog
  open={open}
  variant="glass"
  glow={true}
  title="Premium Feature"
  description="Upgrade to premium to access this feature."
  confirmText="Upgrade Now"
  onConfirm={handleUpgrade}
  onClose={() => setOpen(false)}
/>
```

### Loading State

```tsx
<AlertDialog
  open={open}
  title="Saving Changes"
  description="Please wait while we save your changes..."
  loading={isLoading}
  confirmText="Save"
  onConfirm={handleSave}
  onClose={() => setOpen(false)}
/>
```

### Without Cancel Button

```tsx
<AlertDialog
  open={open}
  title="Terms Updated"
  description="Our terms of service have been updated. Please review and accept to continue."
  showCancel={false}
  confirmText="Accept"
  onConfirm={handleAccept}
  onClose={() => setOpen(false)}
/>
```

### With Custom Content

```tsx
<AlertDialog
  open={open}
  title="Export Data"
  onConfirm={handleExport}
  onClose={() => setOpen(false)}
>
  <RadioGroup value={format} onChange={setFormat}>
    <FormControlLabel value="csv" control={<Radio />} label="CSV" />
    <FormControlLabel value="json" control={<Radio />} label="JSON" />
    <FormControlLabel value="xml" control={<Radio />} label="XML" />
  </RadioGroup>
</AlertDialog>
```

## Accessibility Notes

### Keyboard Navigation

- **Tab**: Navigate between focusable elements
- **Shift+Tab**: Navigate backwards
- **Enter**: Activate focused button
- **Escape**: Close the dialog (triggers cancel)

### Screen Reader Support

- Proper ARIA attributes for dialog role
- Title announced when dialog opens
- Focus trapped within dialog
- Focus returns to trigger element on close
- Buttons have clear accessible labels

### Focus Management

- Auto-focus on confirm button when dialog opens
- Focus trapped within dialog boundaries
- Focus restoration to trigger element on close
- Close button accessible via keyboard

## Best Practices

### Do's

- Use descriptive titles and descriptions
- Use the destructive variant for dangerous actions
- Provide clear action labels (not just "OK" and "Cancel")
- Include loading states for async operations
- Keep descriptions concise but informative

### Don'ts

- Don't use for non-critical information (use Toast/Snackbar instead)
- Don't nest dialogs within dialogs
- Don't disable the backdrop click without good reason
- Don't use for complex forms (use Modal instead)
- Don't overuse animation effects

## Variants Guide

### Default Variant

- Standard appearance with primary color scheme
- Use for general confirmations and information

### Destructive Variant

- Red/error color scheme with warning icon
- Use for delete, remove, or irreversible actions
- Automatically shows error icon

### Glass Variant

- Semi-transparent with backdrop blur effect
- Use for premium or special features
- Works well with glow effect

## Animation Effects

### Glow Effect

- Adds a soft glow around the dialog
- Use sparingly for emphasis
- Works well with glass variant

### Pulse Effect

- Creates a pulsing animation
- Use for urgent or time-sensitive actions
- Can be combined with glow

## Integration with Forms

The AlertDialog can be used with form submissions:

```tsx
const handleSubmit = async (data) => {
  setConfirmOpen(true);
  setFormData(data);
};

const handleConfirm = async () => {
  setLoading(true);
  await submitForm(formData);
  setLoading(false);
  setConfirmOpen(false);
};
```

## Theme Integration

The component automatically adapts to your MUI theme:

- Uses theme colors for variants
- Responds to light/dark mode
- Follows theme spacing and typography
- Respects theme transitions and animations

## Performance Considerations

- Dialog content is not rendered when closed
- Uses React Portal for optimal rendering
- Animations use CSS transforms for smooth performance
- Lazy renders heavy content with loading states

# Toast Component

## Overview

The Toast component provides a non-intrusive notification system for displaying temporary messages to users. It supports multiple severity levels, action buttons, promise-based notifications, and glass morphism effects. The component follows a provider-consumer pattern for centralized toast management across the application.

## Features

- **Multiple Variants**: Support for default, success, error, warning, info, and promise-based toasts
- **Auto-dismissal**: Configurable duration with automatic dismissal
- **Manual Control**: Optional close button and persistent mode
- **Action Support**: Add custom action buttons to toasts
- **Promise Notifications**: Track async operations with loading, success, and error states
- **Glass Morphism**: Optional glass effect for modern UI aesthetics
- **Positioning**: Flexible positioning (top-left, top-center, top-right, bottom-left, bottom-center, bottom-right)
- **Stacking**: Smart stacking with configurable maximum toast count
- **Accessibility**: Full keyboard navigation and screen reader support
- **Animations**: Smooth slide-in/out transitions

## Props

### Toast Component Props

| Prop       | Type                                                                    | Default     | Description                              |
| ---------- | ----------------------------------------------------------------------- | ----------- | ---------------------------------------- |
| message    | `string`                                                                | (required)  | The message to display in the toast      |
| variant    | `'default' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'promise'` | `'default'` | The visual style variant of the toast    |
| duration   | `number`                                                                | `5000`      | Auto-dismiss duration in milliseconds    |
| persistent | `boolean`                                                               | `false`     | If true, toast won't auto-dismiss        |
| closable   | `boolean`                                                               | `true`      | If true, shows a close button            |
| glass      | `boolean`                                                               | `false`     | Enables glass morphism effect            |
| action     | `{ label: string; onClick: () => void }`                                | `undefined` | Action button configuration              |
| promise    | `{ loading: string; success: string; error: string }`                   | `undefined` | Messages for promise-based notifications |
| onClose    | `() => void`                                                            | `undefined` | Callback when toast is closed            |

### ToastContainer Props

| Prop      | Type                                                                                              | Default          | Description                         |
| --------- | ------------------------------------------------------------------------------------------------- | ---------------- | ----------------------------------- |
| position  | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | `'bottom-right'` | Position of the toast container     |
| maxToasts | `number`                                                                                          | `5`              | Maximum number of toasts to display |
| gap       | `number`                                                                                          | `12`             | Gap between toasts in pixels        |

## Usage

### Basic Usage

```tsx
import { ToastProvider, useToast, ToastContainer } from '@repo/ui';

// Wrap your app with ToastProvider
function App() {
  return (
    <ToastProvider>
      <YourAppContent />
      <ToastContainer position="bottom-right" maxToasts={5} />
    </ToastProvider>
  );
}

// Use toast in any component
function MyComponent() {
  const { addToast } = useToast();

  const handleClick = () => {
    addToast({
      message: 'Operation completed successfully!',
      variant: 'success',
    });
  };

  return <button onClick={handleClick}>Show Toast</button>;
}
```

### Promise-based Notifications

```tsx
const { promise } = useToast();

const handleAsyncOperation = async () => {
  await promise(someAsyncOperation(), {
    loading: 'Processing your request...',
    success: 'Request completed successfully!',
    error: 'Failed to process request',
  });
};
```

### With Action Button

```tsx
const { addToast } = useToast();

const showActionToast = () => {
  addToast({
    message: 'New update available',
    variant: 'info',
    action: {
      label: 'Update Now',
      onClick: () => {
        console.log('Updating...');
      },
    },
    persistent: true,
  });
};
```

### Persistent Toast

```tsx
const { addToast } = useToast();

const showPersistentToast = () => {
  addToast({
    message: 'This toast will not auto-dismiss',
    variant: 'warning',
    persistent: true,
    closable: true,
  });
};
```

### Glass Effect

```tsx
const { addToast } = useToast();

const showGlassToast = () => {
  addToast({
    message: 'Beautiful glass morphism effect',
    variant: 'default',
    glass: true,
  });
};
```

## Context API

The Toast component provides a context API through `useToast` hook:

### Methods

- `addToast(options: ToastOptions): string` - Adds a new toast and returns its ID
- `removeToast(id: string): void` - Removes a specific toast
- `clearAllToasts(): void` - Removes all toasts
- `promise<T>(promise: Promise<T>, messages: PromiseMessages): Promise<T>` - Handles promise-based notifications

## Accessibility

The Toast component is fully accessible:

- **ARIA Roles**: Uses `role="alert"` for screen reader announcements
- **ARIA Labels**: Proper labeling for close buttons and actions
- **Keyboard Navigation**:
  - `Escape` - Closes the focused toast
  - `Tab` - Navigates between interactive elements
- **Focus Management**: Proper focus handling for action buttons
- **Screen Reader Support**: Announces new toasts automatically

## Styling

The Toast component uses Material-UI theming and supports:

- Theme-aware colors for different variants
- Responsive design that adapts to viewport size
- Glass morphism effect with backdrop blur
- Smooth animations for enter/exit transitions
- Custom positioning and stacking

## Best Practices

1. **Use appropriate variants**: Choose the variant that matches the message type (success, error, warning, info)
2. **Keep messages concise**: Toast messages should be brief and actionable
3. **Avoid overlapping actions**: Don't show too many toasts at once (use `maxToasts` prop)
4. **Use persistent mode sparingly**: Only for critical messages that require user attention
5. **Provide actions when needed**: Add action buttons for toasts that require user response
6. **Handle promises properly**: Use the promise method for async operations to provide loading feedback

## Examples

### Error Handling

```tsx
try {
  await saveData();
  addToast({
    message: 'Data saved successfully',
    variant: 'success',
  });
} catch (error) {
  addToast({
    message: 'Failed to save data. Please try again.',
    variant: 'error',
    action: {
      label: 'Retry',
      onClick: () => saveData(),
    },
  });
}
```

### Form Submission

```tsx
const handleSubmit = async (formData) => {
  await promise(submitForm(formData), {
    loading: 'Submitting form...',
    success: 'Form submitted successfully!',
    error: 'Failed to submit form. Please check your inputs.',
  });
};
```

## Related Components

- Alert - For inline notifications
- Snackbar - Alternative notification component
- Modal - For more prominent notifications
- Banner - For persistent page-level notifications

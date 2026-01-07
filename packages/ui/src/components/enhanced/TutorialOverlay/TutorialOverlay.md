# TutorialOverlay Component

An interactive tutorial overlay component for creating product tours, onboarding flows, and feature highlights. Provides step-by-step walkthroughs with highlighted elements, tooltips, navigation controls, and customizable styling.

## Features

- Interactive step-by-step tutorials
- Element highlighting and spotlighting
- Multiple visual variants (tooltip, modal, highlight, spotlight)
- Progress indicators and navigation controls
- Customizable positioning and styling
- Skip functionality and completion callbacks
- Responsive design and mobile support
- Accessibility compliance with ARIA attributes

## Usage

```tsx
import { TutorialOverlay } from '@repo/ui';

const steps = [
  {
    id: '1',
    target: '#welcome-section',
    title: 'Welcome',
    content: 'This is your dashboard overview.',
    position: 'bottom',
  },
  {
    id: '2',
    target: '#navigation',
    title: 'Navigation',
    content: 'Use this menu to navigate between sections.',
    position: 'right',
  },
];

function App() {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <>
      <button onClick={() => setShowTutorial(true)}>Start Tutorial</button>

      {showTutorial && (
        <TutorialOverlay
          steps={steps}
          onComplete={() => setShowTutorial(false)}
          onSkip={() => setShowTutorial(false)}
          variant="spotlight"
          showProgress
          allowSkip
          animated
        />
      )}
    </>
  );
}
```

## Props

### Required Props

- `steps`: Array of tutorial step definitions
- `onComplete`: Callback function when tutorial completes

### Optional Props

- `variant`: Visual style variant ('tooltip' | 'modal' | 'highlight' | 'spotlight')
- `position`: Tooltip positioning ('top' | 'bottom' | 'left' | 'right' | 'center')
- `showProgress`: Show progress indicator (boolean)
- `allowSkip`: Allow users to skip tutorial (boolean)
- `animated`: Enable animations (boolean)
- `onSkip`: Callback when tutorial is skipped
- `onStepChange`: Callback when step changes
- `onStepComplete`: Callback when individual step completes

### Step Object Structure

```tsx
interface TutorialStep {
  id: string;
  target: string; // CSS selector for target element
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: string; // Custom action button text
  requiresAction?: boolean; // Wait for user action
}
```

## Variants

### Tooltip

Standard tooltip-style overlay with arrow pointing to target element.

### Modal

Full-screen modal with highlighted target element.

### Highlight

Highlighted target element with subtle overlay.

### Spotlight

Dramatic spotlight effect focusing on target element.

## Accessibility

- ARIA landmarks and labels
- Keyboard navigation support (Tab, Escape, Enter)
- Screen reader compatibility
- Focus management and restoration
- High contrast support

## Best Practices

1. **Keep steps concise**: Limit tutorial steps to essential information
2. **Logical flow**: Order steps in natural user workflow
3. **Allow skipping**: Always provide skip option for returning users
4. **Progressive disclosure**: Break complex features into multiple tutorials
5. **Test on devices**: Verify functionality on mobile and tablet
6. **Provide context**: Ensure target elements are visible and accessible

## Examples

### Onboarding Flow

Guide new users through initial setup and key features.

### Feature Highlights

Introduce new functionality or updates to existing users.

### Interactive Tours

Multi-step tutorials requiring user interaction at each step.

### Contextual Help

Just-in-time assistance for specific workflows or features.

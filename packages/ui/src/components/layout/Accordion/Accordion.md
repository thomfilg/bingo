# Accordion Component

A customizable collapsible panel component for organizing and displaying content in a space-efficient manner.

## Overview

The Accordion component provides expandable/collapsible content sections with smooth animations and flexible styling options. It supports single or multiple panel expansion, keyboard navigation, and comprehensive accessibility features.

## Props

### Accordion Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | The content of the accordion (AccordionSummary and AccordionDetails) |
| `defaultExpanded` | boolean | false | If true, the accordion is expanded by default |
| `disabled` | boolean | false | If true, the accordion is disabled |
| `expanded` | boolean | - | If true, the accordion is expanded (controlled) |
| `onChange` | function | - | Callback fired when the accordion state changes |
| `variant` | 'default' \| 'glass' \| 'bordered' \| 'separated' | 'default' | Visual style variant |
| `TransitionComponent` | elementType | Collapse | The component used for the collapse transition |
| `TransitionProps` | object | - | Props applied to the transition element |

### AccordionSummary Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | The content of the accordion summary |
| `expandIcon` | ReactNode | - | The icon to display as the expand indicator |
| `focusVisibleClassName` | string | - | Class applied when the summary is keyboard focused |
| `onClick` | function | - | Callback fired when the summary is clicked |

### AccordionDetails Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | The content of the accordion details |
| `sx` | object | - | System sx prop for custom styling |

### AccordionActions Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Action buttons for the accordion |
| `disableSpacing` | boolean | false | If true, removes additional spacing between actions |

## Usage

### Basic Usage

```tsx
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

function BasicAccordion() {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography>Accordion Title</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          Accordion content goes here.
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}
```

### Controlled Accordion

```tsx
function ControlledAccordion() {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (event, isExpanded) => {
    setExpanded(isExpanded);
  };

  return (
    <Accordion expanded={expanded} onChange={handleChange}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography>Controlled Accordion</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>This accordion's state is controlled.</Typography>
      </AccordionDetails>
    </Accordion>
  );
}
```

### Multiple Accordions with Exclusive Expansion

```tsx
function ExclusiveAccordions() {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <>
      <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Panel 1</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Content for panel 1</Typography>
        </AccordionDetails>
      </Accordion>
      
      <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Panel 2</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Content for panel 2</Typography>
        </AccordionDetails>
      </Accordion>
    </>
  );
}
```

### With Actions

```tsx
function AccordionWithActions() {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography>Settings</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>Configure your settings here.</Typography>
      </AccordionDetails>
      <AccordionActions>
        <Button>Cancel</Button>
        <Button variant="contained">Save</Button>
      </AccordionActions>
    </Accordion>
  );
}
```

## Variants

### Default
Standard Material-UI accordion styling.

### Glass
Features a frosted glass effect with backdrop blur and transparency.

### Bordered
Clean borders with rounded corners.

### Separated
Elevated shadows with spacing between items.

## Accessibility

- **ARIA Attributes**: Proper `aria-expanded`, `aria-controls`, and `aria-labelledby` attributes
- **Keyboard Navigation**: 
  - `Tab` - Navigate between accordion headers
  - `Enter` or `Space` - Expand/collapse focused accordion
  - `Arrow Keys` - Navigate between accordion items when focused
- **Screen Reader Support**: Announces expansion state changes
- **Focus Management**: Maintains proper focus flow and visual focus indicators

## Best Practices

1. **Use clear, descriptive headers** that indicate the content within each section
2. **Keep content concise** to maintain a good user experience
3. **Consider default expanded state** for important content that users should see immediately
4. **Group related content** in the same accordion panel
5. **Provide visual feedback** for hover and focus states
6. **Test with keyboard navigation** to ensure accessibility

## Performance Considerations

- Use `React.memo` for expensive child components to prevent unnecessary re-renders
- Consider lazy loading content for accordions with heavy content
- Limit the number of accordions on a single page for better performance
- Use the `TransitionProps` to customize animation duration for better perceived performance
# Timeline Component

A flexible and animated timeline component for displaying chronological events and milestones.

## Features

- **Multiple Variants**: Default, compact, and detailed display modes
- **Orientation Support**: Vertical and horizontal timeline layouts
- **Interactive Elements**: Expandable items with metadata and actions
- **Animation Support**: Slide-in animations and pulsing indicators
- **Customizable**: Custom icons, colors, and styling options
- **Responsive**: Adapts to different screen sizes
- **Accessible**: Full keyboard navigation and screen reader support

## Usage

```tsx
import { Timeline } from '@/components/enhanced/Timeline';

const items = [
  {
    id: '1',
    title: 'Project Started',
    description: 'Initial project setup and planning phase',
    timestamp: '2 hours ago',
    icon: <StartIcon />,
    color: '#4CAF50',
    metadata: { status: 'completed', duration: '1 week' },
    action: { label: 'View Details', onClick: () => {} },
  },
  {
    id: '2',
    title: 'Development Phase',
    description: 'Core functionality implementation',
    timestamp: '1 hour ago',
    color: '#2196F3',
  },
];

<Timeline
  items={items}
  variant="default"
  orientation="vertical"
  animated={true}
  showConnector={true}
  onItemClick={(item) => console.log(item)}
/>;
```

## Props

### TimelineProps

| Prop          | Type                                   | Default      | Description                              |
| ------------- | -------------------------------------- | ------------ | ---------------------------------------- |
| items         | `TimelineItem[]`                       | -            | Array of timeline items to display       |
| variant       | `'default' \| 'compact' \| 'detailed'` | `'default'`  | Display variant                          |
| orientation   | `'vertical' \| 'horizontal'`           | `'vertical'` | Timeline orientation                     |
| showConnector | `boolean`                              | `true`       | Show connecting lines between items      |
| animated      | `boolean`                              | `true`       | Enable slide-in animations               |
| alternating   | `boolean`                              | `false`      | Alternate item positions (vertical only) |
| onItemClick   | `(item: TimelineItem) => void`         | -            | Callback when item is clicked            |

### TimelineItem

| Prop        | Type                                   | Required | Description                       |
| ----------- | -------------------------------------- | -------- | --------------------------------- |
| id          | `string`                               | ✓        | Unique identifier for the item    |
| title       | `string`                               | ✓        | Main title text                   |
| description | `string`                               | -        | Detailed description              |
| timestamp   | `string`                               | ✓        | Time/date display text            |
| icon        | `React.ReactNode`                      | -        | Custom icon component             |
| color       | `string`                               | -        | Custom color for the timeline dot |
| action      | `{label: string, onClick: () => void}` | -        | Action button configuration       |
| expanded    | `boolean`                              | -        | Initial expanded state            |
| metadata    | `Record<string, string>`               | -        | Key-value metadata pairs          |

## Variants

### Default

Standard timeline with expandable items and full feature set.

### Compact

Minimal design with condensed spacing and always-visible descriptions.

### Detailed

Expanded view with all details visible by default.

## Accessibility

- Full keyboard navigation support
- Screen reader compatible with proper ARIA attributes
- Focus management for interactive elements
- Semantic HTML structure

## Examples

### Basic Timeline

```tsx
<Timeline items={basicItems} />
```

### Horizontal Timeline

```tsx
<Timeline items={items} orientation="horizontal" variant="compact" />
```

### Alternating Timeline

```tsx
<Timeline items={items} alternating={true} animated={true} />
```

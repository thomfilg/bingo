# Chart Component

A comprehensive charting component built on Recharts, providing multiple chart types with extensive customization options and visual effects.

## Usage

```tsx
import { Chart } from '@repo/ui';

// Basic line chart
<Chart
  data={data}
  series={[{ dataKey: 'value', name: 'Sales' }]}
  type="line"
/>

// Bar chart with multiple series
<Chart
  data={data}
  series={[
    { dataKey: 'sales', name: 'Sales', color: '#8884d8' },
    { dataKey: 'revenue', name: 'Revenue', color: '#82ca9d' }
  ]}
  type="bar"
  showLegend
/>

// Pie chart
<Chart
  data={pieData}
  series={[{ dataKey: 'value', name: 'Market Share' }]}
  type="pie"
  showTooltip
/>
```

## Props

### Required Props

- `data` (array): The data array to visualize
- `series` (ChartSeries[]): Configuration for data series

### Chart Configuration

- `type` ('line' | 'bar' | 'area' | 'pie' | 'radar' | 'scatter' | 'composed'): Chart type
- `variant` ('default' | 'glass' | 'gradient' | 'elevated' | 'minimal' | 'neon'): Visual style variant
- `size` ('xs' | 'sm' | 'md' | 'lg' | 'xl'): Predefined size presets
- `color` ('primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'): Color theme
- `height` (number): Custom height in pixels
- `width` (string | number): Chart width (default: '100%')

### Visual Effects

- `glow` (boolean): Enable glow effect
- `pulse` (boolean): Enable pulsing animation
- `glass` (boolean): Enable glass morphism effect
- `gradient` (boolean): Enable gradient backgrounds
- `animate` (boolean): Enable animations (default: true)
- `animationDuration` (number): Animation duration in ms (default: 1500)

### Data Configuration

- `xAxisKey` (string): Key for X-axis data (default: 'name')
- `yAxisLabel` (string): Y-axis label text
- `xAxisLabel` (string): X-axis label text
- `curved` (boolean): Use curved lines for line/area charts (default: true)
- `stacked` (boolean): Stack data series for bar/area charts
- `showValues` (boolean): Display data values on chart

### Display Options

- `title` (string): Chart title
- `subtitle` (string): Chart subtitle
- `showLegend` (boolean): Show chart legend (default: true)
- `showTooltip` (boolean): Show hover tooltips (default: true)
- `showCartesianGrid` (boolean): Show grid lines (default: true)
- `margin` (object): Chart margins configuration
- `colors` (string[]): Custom color palette
- `responsive` (boolean): Enable responsive behavior (default: true)

### States

- `loading` (boolean): Show loading state
- `disabled` (boolean): Disable chart interactions

### Event Handlers

- `onClick` (function): Click event handler
- `onFocus` (function): Focus event handler
- `onBlur` (function): Blur event handler

## Chart Types

### Line Chart
Best for showing trends over time or continuous data.

### Bar Chart
Ideal for comparing discrete categories or showing distributions.

### Area Chart
Similar to line charts but emphasizes volume/magnitude.

### Pie Chart
Perfect for showing parts of a whole or percentages.

### Radar Chart
Useful for multivariate comparisons across multiple axes.

### Scatter Chart
Great for showing correlations between two variables.

### Composed Chart
Combines multiple chart types in a single visualization.

## Accessibility

- Keyboard navigation support
- Screen reader compatible with proper ARIA attributes
- High contrast mode support
- Focus indicators for interactive elements
- Descriptive tooltips and labels

## Best Practices

1. **Choose the Right Chart Type**: Select chart type based on data characteristics and insights needed
2. **Keep It Simple**: Avoid cluttering with too many data series or visual effects
3. **Use Consistent Colors**: Maintain color consistency across related charts
4. **Provide Context**: Always include titles, labels, and legends where appropriate
5. **Responsive Design**: Ensure charts adapt well to different screen sizes
6. **Loading States**: Show loading indicators for async data
7. **Error Handling**: Provide fallback UI for invalid or missing data

## Examples

### Sales Dashboard
```tsx
<Chart
  data={salesData}
  series={[
    { dataKey: 'revenue', name: 'Revenue', color: 'primary' },
    { dataKey: 'profit', name: 'Profit', color: 'success' }
  ]}
  type="composed"
  variant="glass"
  title="Monthly Sales Performance"
  showLegend
  showTooltip
  animate
/>
```

### Market Share Pie
```tsx
<Chart
  data={marketData}
  series={[{ dataKey: 'share', name: 'Market Share' }]}
  type="pie"
  variant="gradient"
  size="lg"
  showTooltip
  colors={['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c']}
/>
```

### Performance Metrics
```tsx
<Chart
  data={performanceData}
  series={[
    { dataKey: 'cpu', name: 'CPU Usage' },
    { dataKey: 'memory', name: 'Memory' },
    { dataKey: 'disk', name: 'Disk I/O' }
  ]}
  type="radar"
  variant="neon"
  glass
  glow
/>
```
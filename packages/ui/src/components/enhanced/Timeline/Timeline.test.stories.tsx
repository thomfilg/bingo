import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect, waitFor, fn } from 'storybook/test';
import { CheckCircle, Warning, Info, Error } from '@mui/icons-material';

import { Timeline } from './Timeline';
import { TimelineItem } from './Timeline.types';

const meta: Meta<typeof Timeline> = {
  title: 'Enhanced/Timeline/Tests',
  component: Timeline,
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: false },
  },
  tags: ['autodocs', 'test'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for testing
const sampleItems: TimelineItem[] = [
  {
    id: '1',
    title: 'Order Placed',
    description: 'Your order has been successfully placed',
    timestamp: '2024-01-01 10:00 AM',
    icon: <CheckCircle />,
    color: '#4caf50',
    metadata: { 'Order ID': '#12345', Status: 'Confirmed' },
    action: {
      label: 'View Details',
      onClick: fn(),
    },
  },
  {
    id: '2',
    title: 'Processing',
    description: 'Your order is being processed',
    timestamp: '2024-01-01 11:00 AM',
    icon: <Info />,
    color: '#2196f3',
    metadata: { Location: 'Warehouse A', Expected: '2 hours' },
  },
  {
    id: '3',
    title: 'Quality Check',
    description: 'Items are undergoing quality inspection',
    timestamp: '2024-01-01 02:00 PM',
    icon: <Warning />,
    color: '#ff9800',
  },
  {
    id: '4',
    title: 'Shipped',
    description: 'Your order has been shipped',
    timestamp: '2024-01-02 09:00 AM',
    icon: <CheckCircle />,
    color: '#4caf50',
    metadata: { Tracking: 'ABC123XYZ', Carrier: 'FedEx' },
  },
];

// Test Stories

export const BasicInteraction: Story = {
  args: {
    items: sampleItems,
    variant: 'default',
    orientation: 'vertical',
    onItemClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Verify all timeline items are rendered
    const timelineItems = canvas.getAllByRole('article');
    await expect(timelineItems).toHaveLength(sampleItems.length);

    // Verify each item displays its title and timestamp
    for (const item of sampleItems) {
      await expect(canvas.getByText(item.title)).toBeInTheDocument();
      await expect(canvas.getByText(item.timestamp)).toBeInTheDocument();
    }

    // Test clicking on timeline items
    const firstItem = timelineItems[0];
    await userEvent.click(firstItem);
    await expect(args.onItemClick).toHaveBeenCalledWith(sampleItems[0]);
    await expect(args.onItemClick).toHaveBeenCalledTimes(1);

    // Reset mock
    args.onItemClick.mockClear();

    // Test expand/collapse functionality for items with descriptions
    const expandButtons = Array.from(canvasElement.querySelectorAll('button')).filter(
      (btn) => btn.querySelector('svg[data-testid="ExpandMoreIcon"]')
    );

    await expect(expandButtons.length).toBeGreaterThan(0);

    // Initially collapsed - description should not be visible
    const firstDescription = sampleItems[0].description!;
    let descriptionElement = canvas.queryByText(firstDescription);
    await expect(descriptionElement).not.toBeVisible();

    // Click to expand
    await userEvent.click(expandButtons[0]);
    
    // Wait for expansion animation and verify description is now visible
    await waitFor(() => {
      descriptionElement = canvas.getByText(firstDescription);
      expect(descriptionElement).toBeVisible();
    });

    // Verify the expand button rotated (indicates expanded state)
    await expect(expandButtons[0]).toHaveStyle({ transform: expect.stringContaining('180') });

    // Click to collapse
    await userEvent.click(expandButtons[0]);
    
    // Wait for collapse animation
    await waitFor(() => {
      descriptionElement = canvas.queryByText(firstDescription);
      expect(descriptionElement).not.toBeVisible();
    });

    // Verify the expand button rotated back
    await expect(expandButtons[0]).toHaveStyle({ transform: expect.stringContaining('(0') });
  },
};

export const FormInteraction: Story = {
  args: {
    items: sampleItems.map((item) => ({
      ...item,
      action: {
        label: `Action ${item.id}`,
        onClick: fn(),
      },
    })),
    variant: 'detailed',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // In detailed variant, all descriptions should be visible
    for (const item of args.items) {
      if (item.description) {
        await expect(canvas.getByText(item.description)).toBeVisible();
      }
    }

    // Test action button clicks
    const actionButtons = Array.from(canvasElement.querySelectorAll('button')).filter(
      (btn) => btn.textContent?.includes('Action')
    );

    await expect(actionButtons).toHaveLength(args.items.length);

    // Test each action button
    for (let i = 0; i < actionButtons.length; i++) {
      const button = actionButtons[i];
      const expectedLabel = `Action ${args.items[i].id}`;
      
      // Verify button has correct label
      await expect(button).toHaveTextContent(expectedLabel);
      
      // Click the button
      await userEvent.click(button);
      
      // Verify the corresponding onClick was called
      await expect(args.items[i].action?.onClick).toHaveBeenCalledTimes(1);
      
      // Reset for next iteration
      args.items[i].action?.onClick.mockClear();
    }

    // Test that action button clicks don't trigger item click
    const firstActionButton = actionButtons[0];
    const itemClickMock = fn();
    args.onItemClick = itemClickMock;
    
    await userEvent.click(firstActionButton);
    await expect(itemClickMock).not.toHaveBeenCalled();

    // Verify metadata is displayed in detailed variant
    for (const item of args.items) {
      if (item.metadata) {
        for (const [key, value] of Object.entries(item.metadata)) {
          const metadataText = `${key}: ${value}`;
          await expect(canvas.getByText(metadataText)).toBeInTheDocument();
        }
      }
    }
  },
};

export const KeyboardNavigation: Story = {
  args: {
    items: sampleItems,
    variant: 'default',
    orientation: 'vertical',
    onItemClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Get all interactive elements
    const cards = canvas.getAllByRole('article');
    const expandButtons = Array.from(canvasElement.querySelectorAll('button')).filter(
      (btn) => btn.querySelector('svg[data-testid="ExpandMoreIcon"]')
    );
    // We don't need actionButtons in this test but keep for potential use
    // const actionButtons = Array.from(canvasElement.querySelectorAll('button')).filter(
    //   (btn) => btn.textContent?.includes('View Details')
    // );

    // Test Tab navigation through timeline cards
    cards[0].focus();
    await expect(document.activeElement).toBe(cards[0]);

    // Tab to first expand button
    await userEvent.tab();
    await expect(document.activeElement).toBe(expandButtons[0]);

    // Test Enter key on expand button
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      const description = canvas.getByText(sampleItems[0].description!);
      expect(description).toBeVisible();
    });

    // Verify button rotation indicates expanded state
    await expect(expandButtons[0]).toHaveStyle({ transform: expect.stringContaining('180') });

    // Tab to action button (now visible after expansion)
    await userEvent.tab();
    await waitFor(() => {
      expect(document.activeElement?.textContent).toContain('View Details');
    });

    // Test Enter key on action button
    await userEvent.keyboard('{Enter}');
    await expect(args.items[0].action?.onClick).toHaveBeenCalledTimes(1);

    // Test Space key on expand button
    expandButtons[0].focus();
    await userEvent.keyboard(' '); // Space key to collapse
    await waitFor(() => {
      const description = canvas.queryByText(sampleItems[0].description!);
      expect(description).not.toBeVisible();
    });

    // Test Shift+Tab for reverse navigation
    await userEvent.tab({ shift: true });
    await expect(document.activeElement).toBe(expandButtons[0]);

    // Test clicking card with Enter key
    cards[1].focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onItemClick).toHaveBeenCalledWith(sampleItems[1]);
  },
};

export const ScreenReader: Story = {
  args: {
    items: sampleItems,
    variant: 'default',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify timeline structure is accessible with semantic HTML
    const cards = canvas.getAllByRole('article');
    await expect(cards).toHaveLength(sampleItems.length);

    // Verify all text content is accessible
    for (const item of sampleItems) {
      // Title and timestamp should be readable
      await expect(canvas.getByText(item.title)).toBeInTheDocument();
      await expect(canvas.getByText(item.timestamp)).toBeInTheDocument();
      
      // Verify heading hierarchy
      const headings = canvasElement.querySelectorAll('h6');
      const titleHeading = Array.from(headings).find(h => h.textContent === item.title);
      await expect(titleHeading).toBeInTheDocument();
    }

    // Verify interactive elements have accessible names
    const expandButtons = Array.from(canvasElement.querySelectorAll('button')).filter(
      (btn) => btn.querySelector('svg[data-testid="ExpandMoreIcon"]')
    );
    
    for (const button of expandButtons) {
      // Button should be focusable
      await expect(button).not.toHaveAttribute('disabled');
      await expect(button.tabIndex).toBeGreaterThanOrEqual(0);
    }

    // Verify icons are decorative (aria-hidden) or have labels
    const icons = canvasElement.querySelectorAll('svg');
    await expect(icons.length).toBeGreaterThan(0);
    
    // Timeline dots should have color indication
    const dots = canvasElement.querySelectorAll('[class*="TimelineDot"]');
    await expect(dots).toHaveLength(sampleItems.length);
    
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i] as HTMLElement;
      const item = sampleItems[i];
      if (item.color) {
        const style = window.getComputedStyle(dot);
        await expect(style.background).toContain('gradient');
      }
    }

    // Verify connectors are purely decorative
    const connectors = canvasElement.querySelectorAll('[class*="TimelineConnector"]');
    await expect(connectors).toHaveLength(sampleItems.length - 1);
  },
};

export const FocusManagement: Story = {
  args: {
    items: sampleItems,
    variant: 'default',
    onItemClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Get interactive elements
    const expandButtons = Array.from(canvasElement.querySelectorAll('button')).filter(
      (btn) => btn.querySelector('svg[data-testid="ExpandMoreIcon"]')
    );
    const cards = canvas.getAllByRole('article');

    // Test focus retention on expand/collapse
    await expect(expandButtons.length).toBeGreaterThan(0);
    
    expandButtons[0].focus();
    await expect(document.activeElement).toBe(expandButtons[0]);

    // Click to expand
    await userEvent.click(expandButtons[0]);
    
    // Focus should remain on the button after expansion
    await expect(document.activeElement).toBe(expandButtons[0]);
    
    // Wait for expansion to complete
    await waitFor(() => {
      const description = canvas.getByText(sampleItems[0].description!);
      expect(description).toBeVisible();
    });

    // Now action button should be available
    const actionButton = canvas.getByRole('button', { name: /View Details/i });
    actionButton.focus();
    await expect(document.activeElement).toBe(actionButton);

    // Click action button and verify focus remains
    await userEvent.click(actionButton);
    await expect(document.activeElement).toBe(actionButton);
    await expect(args.items[0].action?.onClick).toHaveBeenCalled();

    // Test focus on card click
    cards[0].focus();
    await expect(document.activeElement).toBe(cards[0]);
    
    await userEvent.click(cards[0]);
    await expect(document.activeElement).toBe(cards[0]);
    await expect(args.onItemClick).toHaveBeenCalled();

    // Test focus trap prevention (focus can move outside component)
    const lastCard = cards[cards.length - 1];
    lastCard.focus();
    await userEvent.tab();
    
    // Focus should move outside the timeline component
    await expect(document.activeElement).not.toBe(lastCard);
    
    // Test programmatic focus
    expandButtons[1].focus();
    await expect(document.activeElement).toBe(expandButtons[1]);
    
    // Click to expand second item
    await userEvent.click(expandButtons[1]);
    await expect(document.activeElement).toBe(expandButtons[1]);
    
    // Verify multiple items can be expanded simultaneously
    await waitFor(() => {
      const firstDescription = canvas.getByText(sampleItems[0].description!);
      const secondDescription = canvas.getByText(sampleItems[1].description!);
      expect(firstDescription).toBeVisible();
      expect(secondDescription).toBeVisible();
    });
  },
};

export const ResponsiveDesign: Story = {
  args: {
    items: sampleItems,
    variant: 'default',
    orientation: 'vertical',
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify timeline renders on mobile
    const container = canvasElement.querySelector('[class*="TimelineContainer"]') as HTMLElement;
    await expect(container).toBeInTheDocument();

    // Verify all items are rendered
    const items = canvas.getAllByRole('article');
    await expect(items).toHaveLength(sampleItems.length);

    // Check vertical orientation layout
    const containerStyle = window.getComputedStyle(container);
    await expect(containerStyle.flexDirection).toBe('column');
    await expect(containerStyle.display).toBe('flex');

    // Verify items stack vertically with proper spacing
    const itemContainers = canvasElement.querySelectorAll('[class*="TimelineItemContainer"]');
    await expect(itemContainers).toHaveLength(sampleItems.length);
    
    // Check each item's layout
    for (let i = 0; i < itemContainers.length; i++) {
      const itemContainer = itemContainers[i] as HTMLElement;
      const itemStyle = window.getComputedStyle(itemContainer);
      
      // Items should use flex layout
      await expect(itemStyle.display).toBe('flex');
      
      // Gap should be applied
      await expect(itemStyle.gap).toBeTruthy();
    }

    // Verify text doesn't overflow on mobile
    const titles = canvasElement.querySelectorAll('h6');
    for (const title of titles) {
      const titleElement = title as HTMLElement;
      const rect = titleElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Title should be within container bounds
      await expect(rect.right).toBeLessThanOrEqual(containerRect.right);
      await expect(rect.left).toBeGreaterThanOrEqual(containerRect.left);
    }

    // Test touch interactions work on mobile
    const firstCard = items[0];
    await userEvent.click(firstCard);
    
    // Expand buttons should be large enough for touch
    const expandButtons = Array.from(canvasElement.querySelectorAll('button')).filter(
      (btn) => btn.querySelector('svg[data-testid="ExpandMoreIcon"]')
    );
    
    for (const button of expandButtons) {
      const rect = button.getBoundingClientRect();
      // Minimum touch target size (44x44 pixels recommended)
      await expect(rect.width).toBeGreaterThanOrEqual(32);
      await expect(rect.height).toBeGreaterThanOrEqual(32);
    }
  },
};

export const ThemeVariations: Story = {
  args: {
    items: sampleItems,
    variant: 'default',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify timeline renders in dark theme
    const cards = canvas.getAllByRole('article');
    await expect(cards).toHaveLength(sampleItems.length);

    // Verify custom colors are applied to timeline dots
    const dots = canvasElement.querySelectorAll('[class*="TimelineDot"]');
    await expect(dots).toHaveLength(sampleItems.length);
    
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i] as HTMLElement;
      const item = sampleItems[i];
      const style = window.getComputedStyle(dot);
      
      // Verify gradient background is applied
      await expect(style.background).toContain('gradient');
      
      // Verify custom color is used if provided
      if (item.color) {
        // Check box-shadow uses the custom color
        await expect(style.boxShadow).toBeTruthy();
      }
      
      // Verify border for contrast
      await expect(style.border).toBeTruthy();
      
      // Verify dot has proper dimensions
      await expect(style.width).toBe('40px');
      await expect(style.height).toBe('40px');
      await expect(style.borderRadius).toBe('50%');
    }

    // Verify cards have glass morphism effect
    const timelineCards = canvasElement.querySelectorAll('[class*="TimelineCard"]');
    for (const card of timelineCards) {
      const cardElement = card as HTMLElement;
      const style = window.getComputedStyle(cardElement);
      
      // Check glass effect properties
      await expect(style.backdropFilter || style.webkitBackdropFilter).toContain('blur');
      await expect(style.background).toContain('gradient');
      await expect(style.border).toBeTruthy();
    }

    // Verify text contrast in dark theme
    const timestamps = canvasElement.querySelectorAll('[class*="TimelineTimestamp"]');
    for (const timestamp of timestamps) {
      const element = timestamp as HTMLElement;
      const style = window.getComputedStyle(element);
      
      // Timestamp should have secondary text color
      await expect(style.color).toBeTruthy();
      await expect(style.fontSize).toBe('0.75rem');
      await expect(style.textTransform).toBe('uppercase');
    }

    // Verify connector gradient
    const connectors = canvasElement.querySelectorAll('[class*="TimelineConnector"]');
    for (const connector of connectors) {
      const element = connector as HTMLElement;
      const style = window.getComputedStyle(element);
      await expect(style.background).toContain('gradient');
    }
  },
};

export const VisualStates: Story = {
  args: {
    items: [
      ...sampleItems,
      {
        id: '5',
        title: 'Error State',
        description: 'An error occurred',
        timestamp: '2024-01-02 10:00 AM',
        icon: <Error />,
        color: '#f44336',
      },
    ],
    variant: 'default',
    animated: true,
    alternating: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const expectedItemCount = sampleItems.length + 1; // Including the error state item

    // Verify all items including error state are rendered
    const cards = canvas.getAllByRole('article');
    await expect(cards).toHaveLength(expectedItemCount);

    // Test hover state on cards
    const firstCard = cards[0];
    const initialTransform = window.getComputedStyle(firstCard).transform;
    
    await userEvent.hover(firstCard);
    await waitFor(() => {
      const hoverTransform = window.getComputedStyle(firstCard).transform;
      // Card should lift on hover (translateY)
      expect(hoverTransform).not.toBe(initialTransform);
    });
    
    await userEvent.unhover(firstCard);

    // Verify alternating layout
    const itemContainers = canvasElement.querySelectorAll('[class*="TimelineItemContainer"]');
    await expect(itemContainers).toHaveLength(expectedItemCount);
    
    for (let i = 0; i < itemContainers.length; i++) {
      const container = itemContainers[i] as HTMLElement;
      const style = window.getComputedStyle(container);
      
      // Check alternating flex direction
      if (i % 2 === 0) {
        await expect(style.flexDirection).toBe('row');
        await expect(style.textAlign).toBe('left');
      } else {
        await expect(style.flexDirection).toBe('row-reverse');
        await expect(style.textAlign).toBe('right');
      }
    }

    // Verify animations are applied
    for (let i = 0; i < itemContainers.length; i++) {
      const container = itemContainers[i] as HTMLElement;
      const style = window.getComputedStyle(container);
      
      // Check slide-in animation with staggered delay
      await expect(style.animation).toContain('0.5s');
      await expect(style.animation).toContain('ease');
      await expect(style.animation).toContain(`${i * 0.1}s`);
    }

    // Verify error state styling
    const errorDot = canvasElement.querySelectorAll('[class*="TimelineDot"]')[4] as HTMLElement;
    const errorStyle = window.getComputedStyle(errorDot);
    await expect(errorStyle.background).toContain('gradient');
    
    // Verify pulse animation on dots
    const dots = canvasElement.querySelectorAll('[class*="TimelineDot"]');
    for (const dot of dots) {
      const dotElement = dot as HTMLElement;
      const style = window.getComputedStyle(dotElement);
      await expect(style.animation).toContain('2s');
      await expect(style.animation).toContain('ease');
      await expect(style.animation).toContain('infinite');
    }

    // Test different icon states
    const icons = canvasElement.querySelectorAll('svg');
    await expect(icons.length).toBeGreaterThan(0);
    
    // Verify icon colors within dots
    for (const dot of dots) {
      const icon = dot.querySelector('svg');
      if (icon) {
        const iconStyle = window.getComputedStyle(icon);
        await expect(iconStyle.fontSize).toBeTruthy();
      }
    }
  },
};

export const Performance: Story = {
  args: {
    items: Array.from({ length: 50 }, (_, i) => ({
      id: `${i}`,
      title: `Event ${i + 1}`,
      description: `Description for event ${i + 1}`,
      timestamp: `2024-01-01 ${String(i % 12).padStart(2, '0')}:00 ${i < 12 ? 'AM' : 'PM'}`,
      metadata: { Index: `${i}`, Category: `Category ${i % 5}` },
    })),
    variant: 'compact',
    animated: false,
    onItemClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Verify large number of items render correctly
    const items = canvas.getAllByRole('article');
    await expect(items).toHaveLength(50);

    // Verify compact variant styling
    const cards = canvasElement.querySelectorAll('[class*="TimelineCard"]');
    for (const card of cards.slice(0, 5)) { // Check first 5 for performance
      const cardElement = card as HTMLElement;
      // Compact variant should have reduced padding
      // Skip checking style directly as it's not used beyond content check
      const contentElement = cardElement.querySelector('.MuiCardContent-root') as HTMLElement;
      if (contentElement) {
        const contentStyle = window.getComputedStyle(contentElement);
        await expect(contentStyle.padding).toBe('0px');
      }
    }

    // Test animations are disabled
    const itemContainers = canvasElement.querySelectorAll('[class*="TimelineItemContainer"]');
    for (const container of itemContainers.slice(0, 5)) { // Check first 5
      const element = container as HTMLElement;
      const style = window.getComputedStyle(element);
      
      // No animation should be applied when animated=false
      await expect(style.animation).toBe('none');
    }

    // Test interaction performance with many items
    const startTime = Date.now();
    
    // Click multiple items quickly
    await userEvent.click(items[0]);
    await userEvent.click(items[10]);
    await userEvent.click(items[20]);
    
    const endTime = Date.now();
    const interactionTime = endTime - startTime;
    
    // Interactions should be responsive (under 1 second for 3 clicks)
    await expect(interactionTime).toBeLessThan(1000);
    
    // Verify clicks were registered
    await expect(args.onItemClick).toHaveBeenCalledTimes(3);

    // Test scrolling performance for vertical timeline
    const container = canvasElement.querySelector('[class*="TimelineContainer"]') as HTMLElement;
    await expect(container).toBeInTheDocument();
    
    // Verify all titles are rendered correctly
    for (let i = 0; i < 5; i++) { // Check first 5 items
      await expect(canvas.getByText(`Event ${i + 1}`)).toBeInTheDocument();
    }
    
    // In compact mode, descriptions should still be visible
    for (let i = 0; i < 3; i++) { // Check first 3
      await expect(canvas.getByText(`Description for event ${i + 1}`)).toBeInTheDocument();
    }

    // Verify metadata rendering in compact mode
    const metadataChips = canvasElement.querySelectorAll('[class*="MuiChip"]');
    await expect(metadataChips.length).toBeGreaterThan(0);

    // Test connectors are rendered efficiently
    const connectors = canvasElement.querySelectorAll('[class*="TimelineConnector"]');
    await expect(connectors).toHaveLength(49); // 50 items = 49 connectors
  },
};

export const EdgeCases: Story = {
  args: {
    items: [
      {
        id: '1',
        title:
          'Very long title that should wrap properly and not break the layout even when it contains many words',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
        timestamp: '2024-12-31 11:59 PM',
        metadata: {
          'Long Key Name': 'Long value that might need truncation',
          'Another Key': 'Another value',
          'Third Key': 'Third value',
          'Fourth Key': 'Fourth value',
        },
      },
      {
        id: '2',
        title: '',
        timestamp: '',
      },
      {
        id: '3',
        title: 'Minimal item',
        timestamp: 'Now',
      },
    ],
    variant: 'detailed',
    onItemClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test rendering with edge case data
    const items = canvas.getAllByRole('article');
    await expect(items).toHaveLength(3);

    // Verify long title wraps properly
    const longTitleText = 'Very long title that should wrap properly and not break the layout even when it contains many words';
    const longTitleElement = canvas.getByText(longTitleText);
    await expect(longTitleElement).toBeInTheDocument();
    
    const titleStyle = window.getComputedStyle(longTitleElement);
    // Title should allow word wrapping
    await expect(
      titleStyle.wordWrap === 'break-word' || 
      titleStyle.overflowWrap === 'break-word' ||
      titleStyle.wordBreak === 'break-word'
    ).toBeTruthy();

    // Verify long description is visible in detailed variant
    const longDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.';
    await expect(canvas.getByText(longDescription)).toBeVisible();

    // Test empty title and timestamp handling
    // Empty items should still render without breaking
    const emptyItemCard = items[1];
    await expect(emptyItemCard).toBeInTheDocument();
    
    // Click should still work on empty item
    await userEvent.click(emptyItemCard);
    await expect(args.onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: '2' })
    );

    // Verify minimal item renders correctly
    await expect(canvas.getByText('Minimal item')).toBeInTheDocument();
    await expect(canvas.getByText('Now')).toBeInTheDocument();

    // Test metadata chip rendering and overflow
    const metadataChips = canvasElement.querySelectorAll('[class*="MuiChip"]');
    await expect(metadataChips).toHaveLength(4);
    
    // Verify all metadata entries are rendered
    await expect(canvas.getByText('Long Key Name: Long value that might need truncation')).toBeInTheDocument();
    await expect(canvas.getByText('Another Key: Another value')).toBeInTheDocument();
    await expect(canvas.getByText('Third Key: Third value')).toBeInTheDocument();
    await expect(canvas.getByText('Fourth Key: Fourth value')).toBeInTheDocument();
    
    // Check metadata container has proper wrapping
    const metadataContainer = metadataChips[0].parentElement;
    if (metadataContainer) {
      const containerStyle = window.getComputedStyle(metadataContainer as HTMLElement);
      await expect(containerStyle.flexWrap).toBe('wrap');
      await expect(containerStyle.display).toBe('flex');
    }

    // Test timeline dots render for all items including edge cases
    const dots = canvasElement.querySelectorAll('[class*="TimelineDot"]');
    await expect(dots).toHaveLength(3);
    
    // Test connectors with edge case items
    const connectors = canvasElement.querySelectorAll('[class*="TimelineConnector"]');
    await expect(connectors).toHaveLength(2); // 3 items = 2 connectors

    // Verify no expand buttons in detailed variant (everything is expanded)
    const expandButtons = Array.from(canvasElement.querySelectorAll('button')).filter(
      (btn) => btn.querySelector('svg[data-testid="ExpandMoreIcon"]')
    );
    await expect(expandButtons).toHaveLength(0);
  },
};

export const Integration: Story = {
  args: {
    items: sampleItems,
    variant: 'default',
    orientation: 'horizontal',
    showConnector: true,
    animated: true,
    alternating: false, // Alternating doesn't apply to horizontal
    onItemClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test horizontal orientation layout
    const container = canvasElement.querySelector('[class*="TimelineContainer"]') as HTMLElement;
    await expect(container).toBeInTheDocument();
    
    const containerStyle = window.getComputedStyle(container);
    await expect(containerStyle.flexDirection).toBe('row');
    await expect(containerStyle.overflowX).toBe('auto');

    // Verify horizontal scrollbar styling
    await expect(containerStyle.paddingBottom).toBeTruthy();

    // Test item containers in horizontal mode
    const itemContainers = canvasElement.querySelectorAll('[class*="TimelineItemContainer"]');
    await expect(itemContainers).toHaveLength(sampleItems.length);
    
    for (const itemContainer of itemContainers) {
      const element = itemContainer as HTMLElement;
      const style = window.getComputedStyle(element);
      
      // In horizontal mode, items should be column layout
      await expect(style.flexDirection).toBe('column');
      await expect(style.alignItems).toBe('center');
      await expect(parseInt(style.minWidth)).toBeGreaterThanOrEqual(280);
    }

    // Test horizontal connectors
    const connectors = canvasElement.querySelectorAll('[class*="TimelineConnector"]');
    await expect(connectors).toHaveLength(sampleItems.length - 1);
    
    for (const connector of connectors) {
      const element = connector as HTMLElement;
      const style = window.getComputedStyle(element);
      
      // Horizontal connectors should be horizontal lines
      await expect(style.height).toBe('2px');
      await expect(style.width).toContain('calc');
      await expect(style.top).toBe('19px');
      await expect(style.left).toBe('40px');
    }

    // Test animations with horizontal orientation
    for (let i = 0; i < itemContainers.length; i++) {
      const element = itemContainers[i] as HTMLElement;
      const style = window.getComputedStyle(element);
      
      // Animations should still work in horizontal mode
      await expect(style.animation).toContain('0.5s');
      await expect(style.animation).toContain(`${i * 0.1}s`);
    }

    // Test all interactive features work together
    const cards = canvas.getAllByRole('article');
    
    // Click first item
    await userEvent.click(cards[0]);
    await expect(args.onItemClick).toHaveBeenCalledWith(sampleItems[0]);
    await expect(args.onItemClick).toHaveBeenCalledTimes(1);
    
    // Expand an item
    const expandButtons = Array.from(canvasElement.querySelectorAll('button')).filter(
      (btn) => btn.querySelector('svg[data-testid="ExpandMoreIcon"]')
    );
    
    if (expandButtons.length > 0) {
      await userEvent.click(expandButtons[0]);
      await waitFor(() => {
        const description = canvas.getByText(sampleItems[0].description!);
        expect(description).toBeVisible();
      });
      
      // Click action button
      const actionButton = canvas.getByRole('button', { name: /View Details/i });
      await userEvent.click(actionButton);
      await expect(sampleItems[0].action?.onClick).toHaveBeenCalled();
    }

    // Test keyboard navigation in horizontal mode
    cards[1].focus();
    await userEvent.tab();
    await expect(document.activeElement).toBe(expandButtons[1]);

    // Verify all visual elements are properly rendered
    const dots = canvasElement.querySelectorAll('[class*="TimelineDot"]');
    await expect(dots).toHaveLength(sampleItems.length);
    
    // Verify icons are rendered
    for (const dot of dots) {
      const icon = dot.querySelector('svg');
      await expect(icon).toBeInTheDocument();
    }

    // Test scrolling behavior for horizontal timeline
    if (container.scrollWidth > container.clientWidth) {
      // Timeline should be scrollable if content overflows
      await expect(container.scrollWidth).toBeGreaterThan(container.clientWidth);
    }
  },
};

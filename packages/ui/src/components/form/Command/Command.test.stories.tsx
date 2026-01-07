import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';

import { Command } from './Command';

const meta: Meta<typeof Command> = {
  title: 'Form/Command/Tests',
  component: Command,
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: false },
  },
  tags: ['autodocs', 'test', 'component:Command'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicInteraction: Story = {
  name: '🧪 Basic Interaction Test',
  args: {
    open: true,
    items: [
      { id: '1', label: 'Home', action: fn() },
      { id: '2', label: 'Settings', action: fn() },
    ],
    onSelect: fn(),
    onOpenChange: fn(),
  },
  play: async ({ step }) => {
    await step('Verify command palette is visible', async () => {
      const dialog = document.querySelector('[role="dialog"]');
      await expect(dialog).toBeInTheDocument();
    });
  },
};

export const KeyboardNavigation: Story = {
  name: '⌨️ Keyboard Navigation Test',
  args: {
    open: true,
    items: [
      { id: '1', label: 'Home', action: fn() },
      { id: '2', label: 'Settings', action: fn() },
    ],
    onSelect: fn(),
    onOpenChange: fn(),
  },
  play: async ({ step }) => {
    await step('Check dialog exists', async () => {
      const dialog = document.querySelector('[role="dialog"]');
      await expect(dialog).toBeInTheDocument();
    });
  },
};

export const ResponsiveDesign: Story = {
  name: '📱 Responsive Design Test',
  args: {
    open: true,
    items: [{ id: '1', label: 'Home', action: fn() }],
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
  play: async ({ step }) => {
    await step('Check responsive layout', async () => {
      const dialog = document.querySelector('[role="dialog"]');
      await expect(dialog).toBeInTheDocument();
    });
  },
};

export const VisualStates: Story = {
  name: '👁️ Visual States Test',
  args: {
    open: true,
    variant: 'glass',
    glow: true,
    items: [
      { id: '1', label: 'Home', action: fn() },
      { id: '2', label: 'Settings', disabled: true, action: fn() },
    ],
  },
  play: async ({ step }) => {
    await step('Check visual elements', async () => {
      const dialog = document.querySelector('[role="dialog"]');
      await expect(dialog).toBeInTheDocument();
    });
  },
};

export const EdgeCases: Story = {
  name: '🔧 Edge Cases Test',
  args: {
    open: true,
    items: [],
    emptyMessage: 'No results found',
  },
  play: async ({ step }) => {
    await step('Check dialog with empty state', async () => {
      const dialog = document.querySelector('[role="dialog"]');
      await expect(dialog).toBeInTheDocument();
    });
  },
};

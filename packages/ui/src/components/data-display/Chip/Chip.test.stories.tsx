import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect, fn } from 'storybook/test';
import { Star } from '@mui/icons-material';

import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'DataDisplay/Chip/Tests',
  component: Chip,
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: false },
  },
  tags: ['autodocs', 'test', 'component:Chip'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicInteraction: Story = {
  args: {
    label: 'Click me',
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button');

    // Test initial render
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveTextContent('Click me');

    // Test click interaction
    await userEvent.click(chip);
    expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const KeyboardNavigation: Story = {
  args: {
    label: 'Keyboard Chip',
    selectable: true,
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('option');

    // Focus the chip
    chip.focus();
    expect(chip).toHaveFocus();

    // Test Enter key
    await userEvent.keyboard('{Enter}');
    expect(args.onClick).toHaveBeenCalled();

    // Clear the mock
    args.onClick.mockClear();

    // Test Space key
    await userEvent.keyboard(' ');
    expect(args.onClick).toHaveBeenCalled();
  },
};

export const FocusManagement: Story = {
  args: {
    label: 'Focus Test',
    onClick: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button');

    // Test programmatic focus
    chip.focus();
    expect(chip).toHaveFocus();
  },
};

export const ResponsiveDesign: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        maxWidth: '300px',
      }}
    >
      {Array.from({ length: 8 }, (_, i) => (
        <Chip key={i} label={`Responsive ${i + 1}`} size="small" onClick={() => {}} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chips = canvas.getAllByRole('button');

    // Test responsive wrapping
    expect(chips).toHaveLength(8);

    // Test chip visibility
    chips.forEach((chip) => {
      expect(chip).toBeVisible();
    });
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const ThemeVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Chip label="Primary" color="primary" onClick={() => {}} />
        <Chip label="Secondary" color="secondary" onClick={() => {}} />
        <Chip label="Success" color="success" onClick={() => {}} />
        <Chip label="Error" color="error" onClick={() => {}} />
        <Chip label="Warning" color="warning" onClick={() => {}} />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Chip label="Primary Outlined" color="primary" variant="outlined" onClick={() => {}} />
        <Chip label="Secondary Outlined" color="secondary" variant="outlined" onClick={() => {}} />
        <Chip label="Success Outlined" color="success" variant="outlined" onClick={() => {}} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chips = canvas.getAllByRole('button');

    // Test theme color application
    expect(chips).toHaveLength(8);

    // Test filled vs outlined variants
    const filledChips = chips.slice(0, 5);
    const outlinedChips = chips.slice(5, 8);

    filledChips.forEach((chip) => {
      expect(chip).toBeVisible();
    });

    outlinedChips.forEach((chip) => {
      expect(chip).toBeVisible();
    });
  },
};

export const VisualStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Chip label="Normal" onClick={() => {}} />
      <Chip label="Selected" selectable selected onClick={() => {}} />
      <Chip label="Disabled" disabled onClick={() => {}} />
      <Chip
        label="With Avatar"
        avatarSrc="https://mui.com/static/images/avatar/1.jpg"
        onClick={() => {}}
      />
      <Chip label="With Icon" icon={<Star />} onClick={() => {}} />
      <Chip label="Deletable" deletable onDelete={() => {}} onClick={() => {}} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test different visual states
    const normalChip = canvas.getByText('Normal');
    expect(normalChip).toBeVisible();

    const selectedChip = canvas.getByRole('option', { name: 'Selected' });
    expect(selectedChip).toHaveAttribute('aria-selected', 'true');

    const disabledChip = canvasElement.querySelector('.MuiChip-root.Mui-disabled');
    expect(disabledChip).toBeInTheDocument();
    expect(disabledChip).toHaveTextContent('Disabled');

    const avatarChip = canvas.getByText('With Avatar');
    expect(avatarChip).toBeVisible();

    const iconChip = canvas.getByText('With Icon');
    expect(iconChip).toBeVisible();

    const deletableChip = canvas.getByText('Deletable');
    expect(deletableChip).toBeVisible();
    // MUI Chip delete button has an svg icon with a test ID
    const deleteButtons = canvasElement.querySelectorAll('[data-testid="CancelIcon"]');
    expect(deleteButtons.length).toBeGreaterThan(0);
  },
};

export const EdgeCases: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Chip label="" onClick={() => {}} /> {/* Empty label */}
        <Chip label="A" onClick={() => {}} /> {/* Single character */}
        <Chip
          label="This is an extremely long label that should be truncated or handled gracefully by the component"
          onClick={() => {}}
        />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Chip label="No handlers" onClick={() => {}} /> {/* No click handlers */}
        <Chip
          label="Multiple states"
          selectable
          selected
          deletable
          onDelete={() => {}}
          onClick={() => {}}
        />
        <Chip label="Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?" onClick={() => {}} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test empty label handling - get all chips first
    const allChips = canvas.getAllByRole('button');
    const emptyChip = allChips[0]; // First chip has empty label
    expect(emptyChip).toBeInTheDocument();

    // Test single character
    const singleChar = canvas.getByText('A');
    expect(singleChar).toBeVisible();

    // Test long label
    const longLabel = canvas.getByText(/This is an extremely long label/);
    expect(longLabel).toBeVisible();

    // Test special characters
    const specialChars = canvas.getByText(/Special chars:/);
    expect(specialChars).toBeVisible();

    // Test multiple states
    const multipleStates = canvas.getByRole('option', { name: 'Multiple states' });
    expect(multipleStates).toBeVisible();
    expect(multipleStates).toHaveAttribute('aria-selected', 'true');

    // Check for delete button presence on deletable chip
    const deleteIcons = canvasElement.querySelectorAll('[data-testid="CancelIcon"]');
    expect(deleteIcons.length).toBeGreaterThan(0);
  },
};

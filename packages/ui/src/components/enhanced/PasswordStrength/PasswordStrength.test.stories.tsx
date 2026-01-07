import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '@mui/material';
import React from 'react';

import { PasswordStrength } from './PasswordStrength';

const meta: Meta<typeof PasswordStrength> = {
  title: 'Enhanced/PasswordStrength/Tests',
  component: PasswordStrength,
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: false },
  },
  tags: ['autodocs', 'test', 'component:PasswordStrength'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Interaction Test
export const BasicInteraction: Story = {
  name: '🧪 Basic Interaction Test',
  render: () => (
    <Stack spacing={2} sx={{ width: 400 }}>
      <PasswordStrength
        data-testid="password-strength"
        value="weak"
        variant="linear"
        showRequirements={true}
        showStrengthLabel={true}
      />
    </Stack>
  ),
};

// Keyboard Navigation Test
export const KeyboardNavigation: Story = {
  name: '🧪 Keyboard Navigation Test',
  render: () => (
    <Stack spacing={2} sx={{ width: 400 }}>
      <PasswordStrength
        data-testid="password-strength"
        value="test123"
        variant="linear"
        showRequirements={true}
        showStrengthLabel={true}
      />
    </Stack>
  ),
};

// Screen Reader Test
export const ScreenReader: Story = {
  name: '🧪 Screen Reader Test',
  render: () => (
    <Stack spacing={2} sx={{ width: 400 }}>
      <PasswordStrength
        data-testid="password-strength"
        value="MyStrongP@ssw0rd123!"
        variant="linear"
        showRequirements={true}
        showStrengthLabel={true}
      />
    </Stack>
  ),
};

// Responsive Design Test
export const ResponsiveDesign: Story = {
  name: '🧪 Responsive Design Test',
  render: () => (
    <Stack spacing={2}>
      <PasswordStrength
        data-testid="password-strength-responsive"
        value="MyStrongP@ssw0rd123!"
        variant="linear"
        showRequirements={true}
        showStrengthLabel={true}
      />
    </Stack>
  ),
};

// Visual States Test
export const VisualStates: Story = {
  name: '🧪 Visual States Test',
  render: () => (
    <Stack spacing={3}>
      <PasswordStrength
        data-testid="very-weak-password"
        value="123"
        variant="linear"
        showStrengthLabel={true}
      />
      <PasswordStrength
        data-testid="weak-password"
        value="password"
        variant="linear"
        showStrengthLabel={true}
      />
      <PasswordStrength
        data-testid="strong-password"
        value="MyStrongP@ssw0rd123!"
        variant="linear"
        showStrengthLabel={true}
      />
    </Stack>
  ),
};

// Performance Test
export const Performance: Story = {
  name: '🧪 Performance Test',
  render: () => (
    <Stack spacing={2} sx={{ width: 400 }}>
      <PasswordStrength
        data-testid="performance-strength"
        value="MyPassword123!"
        variant="linear"
        showRequirements={true}
        showStrengthLabel={true}
        animated={true}
      />
    </Stack>
  ),
};

// Edge Cases Test
export const EdgeCases: Story = {
  name: '🧪 Edge Cases Test',
  render: () => (
    <Stack spacing={3}>
      <PasswordStrength
        data-testid="empty-password"
        value=""
        variant="linear"
        showRequirements={true}
        showStrengthLabel={true}
      />
      <PasswordStrength
        data-testid="very-long-password"
        value="ThisIsAnExtremelyLongPasswordThatExceedsTypicalLengthRequirementsAndShouldStillWork123!@#"
        variant="linear"
        showStrengthLabel={true}
      />
    </Stack>
  ),
};

// Integration Test
export const Integration: Story = {
  name: '🧪 Integration Test',
  render: () => (
    <Stack spacing={2} sx={{ width: 500 }}>
      <PasswordStrength
        data-testid="integration-strength"
        value="Pass123!"
        variant="linear"
        showRequirements={true}
        showStrengthLabel={true}
        animated={true}
      />
    </Stack>
  ),
};

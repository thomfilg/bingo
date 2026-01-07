import type { Meta, StoryObj } from '@storybook/react-vite';
import { Save, Delete, Add, ArrowForward } from '@mui/icons-material';
import { Stack } from '@mui/material';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Form/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs', 'component:Button'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['solid', 'outline', 'ghost', 'glass', 'gradient'],
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'warning', 'danger', 'neutral'],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    loading: {
      control: { type: 'boolean' },
    },
    glow: {
      control: { type: 'boolean' },
    },
    pulse: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'solid',
  },
};

export const AllVariants: Story = {
  render: () => (
    <Stack spacing={2} direction="row">
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="glass">Glass</Button>
      <Button variant="gradient">Gradient</Button>
    </Stack>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <Stack spacing={2} direction="row" alignItems="center">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </Stack>
  ),
};

export const AllColors: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack spacing={2} direction="row">
        <Button color="primary">Primary</Button>
        <Button color="secondary">Secondary</Button>
        <Button color="success">Success</Button>
        <Button color="warning">Warning</Button>
        <Button color="danger">Danger</Button>
        <Button color="neutral">Neutral</Button>
      </Stack>
      <Stack spacing={2} direction="row">
        <Button variant="outline" color="primary">
          Primary
        </Button>
        <Button variant="outline" color="secondary">
          Secondary
        </Button>
        <Button variant="outline" color="success">
          Success
        </Button>
        <Button variant="outline" color="warning">
          Warning
        </Button>
        <Button variant="outline" color="danger">
          Danger
        </Button>
        <Button variant="outline" color="neutral">
          Neutral
        </Button>
      </Stack>
    </Stack>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Stack spacing={2} direction="row">
      <Button icon={<Save />}>Save</Button>
      <Button variant="outline" icon={<Add />} color="success">
        Add Item
      </Button>
      <Button variant="ghost" icon={<Delete />} color="danger">
        Delete
      </Button>
      <Button variant="gradient" icon={<ArrowForward />}>
        Continue
      </Button>
    </Stack>
  ),
};

export const LoadingStates: Story = {
  render: () => (
    <Stack spacing={2} direction="row">
      <Button loading>Loading</Button>
      <Button variant="outline" loading color="secondary">
        Processing
      </Button>
      <Button variant="glass" loading>
        Please Wait
      </Button>
      <Button variant="gradient" loading>
        Submitting
      </Button>
    </Stack>
  ),
};

export const SpecialEffects: Story = {
  render: () => (
    <Stack spacing={2} direction="row">
      <Button glow>Glow Effect</Button>
      <Button pulse color="secondary">
        Pulse Animation
      </Button>
      <Button glow pulse variant="gradient">
        Both Effects
      </Button>
      <Button variant="glass" glow>
        Glass with Glow
      </Button>
    </Stack>
  ),
};

export const DisabledStates: Story = {
  render: () => (
    <Stack spacing={2} direction="row">
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>
        Disabled Outline
      </Button>
      <Button variant="ghost" disabled>
        Disabled Ghost
      </Button>
      <Button variant="glass" disabled>
        Disabled Glass
      </Button>
      <Button variant="gradient" disabled>
        Disabled Gradient
      </Button>
    </Stack>
  ),
};

export const ComplexExample: Story = {
  render: () => (
    <Stack spacing={3}>
      <Stack spacing={2} direction="row">
        <Button variant="gradient" size="lg" glow icon={<Save />}>
          Save Changes
        </Button>
        <Button variant="glass" size="lg" icon={<ArrowForward />}>
          Continue
        </Button>
      </Stack>
      <Stack spacing={2} direction="row">
        <Button variant="outline" color="danger" icon={<Delete />}>
          Delete Account
        </Button>
        <Button variant="ghost" color="neutral">
          Cancel
        </Button>
      </Stack>
    </Stack>
  ),
};

export const AllStates: Story = {
  render: () => (
    <Stack spacing={3}>
      <Stack spacing={2} direction="row">
        <Button>Default</Button>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
      </Stack>
      <Stack spacing={2} direction="row">
        <Button variant="outline">Outline Default</Button>
        <Button variant="outline" disabled>
          Outline Disabled
        </Button>
        <Button variant="outline" loading>
          Outline Loading
        </Button>
      </Stack>
      <Stack spacing={2} direction="row">
        <Button variant="ghost">Ghost Default</Button>
        <Button variant="ghost" disabled>
          Ghost Disabled
        </Button>
        <Button variant="ghost" loading>
          Ghost Loading
        </Button>
      </Stack>
    </Stack>
  ),
};

export const InteractiveStates: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack spacing={2} direction="row">
        <Button>Normal</Button>
        <Button className="hover">Hover</Button>
        <Button className="focus">Focus</Button>
        <Button className="active">Active</Button>
      </Stack>
      <Stack spacing={2} direction="row">
        <Button variant="outline">Normal</Button>
        <Button variant="outline" className="hover">
          Hover
        </Button>
        <Button variant="outline" className="focus">
          Focus
        </Button>
        <Button variant="outline" className="active">
          Active
        </Button>
      </Stack>
    </Stack>
  ),
};

export const Responsive: Story = {
  parameters: {
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '900px' } },
      },
      defaultViewport: 'responsive',
    },
  },
  render: () => (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: '600px' }}>
      <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
        <Button fullWidth>Responsive Button 1</Button>
        <Button fullWidth variant="outline">
          Responsive Button 2
        </Button>
      </Stack>
      <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
        <Button size="sm">Small on Mobile</Button>
        <Button size="md">Medium on Tablet</Button>
        <Button size="lg">Large on Desktop</Button>
      </Stack>
    </Stack>
  ),
};

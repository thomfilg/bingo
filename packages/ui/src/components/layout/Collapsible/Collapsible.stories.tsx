import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Typography, Card, Box } from '@mui/material';

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './Collapsible';

const meta: Meta<typeof Collapsible> = {
  title: 'Layout/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs', 'component:Collapsible'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'smooth', 'spring'],
    },
    duration: {
      control: { type: 'number' },
      min: 100,
      max: 1000,
      step: 50,
    },
    keepMounted: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    variant: 'default',
    duration: 300,
    keepMounted: false,
    onToggle: fn(),
  },
  render: (args) => (
    <Collapsible {...args}>
      <CollapsibleContent>
        <Typography variant="body1">
          This is the default collapsible content. It uses MUI's built-in Collapse component for
          smooth animations.
        </Typography>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Default Variant
      </Typography>
      <Collapsible open={true} variant="default" duration={300}>
        <CollapsibleContent>
          <Typography variant="body2">Default variant content</Typography>
        </CollapsibleContent>
      </Collapsible>

      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        Smooth Variant
      </Typography>
      <Collapsible open={true} variant="smooth" duration={300}>
        <CollapsibleContent>
          <Typography variant="body2">Smooth variant content</Typography>
        </CollapsibleContent>
      </Collapsible>

      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        Spring Variant
      </Typography>
      <Collapsible open={true} variant="spring" duration={300}>
        <CollapsibleContent>
          <Typography variant="body2">Spring variant content</Typography>
        </CollapsibleContent>
      </Collapsible>
    </Box>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Small Content
      </Typography>
      <Collapsible open={true} variant="smooth" duration={250}>
        <CollapsibleContent>
          <Typography variant="body2">Short content example.</Typography>
        </CollapsibleContent>
      </Collapsible>

      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        Medium Content
      </Typography>
      <Collapsible open={true} variant="smooth" duration={350}>
        <CollapsibleContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This is a medium-sized content area with multiple paragraphs.
          </Typography>
          <Typography variant="body2">
            The animation duration can be adjusted based on content size.
          </Typography>
        </CollapsibleContent>
      </Collapsible>
    </Box>
  ),
};

export const AllStates: Story = {
  render: () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Open State
      </Typography>
      <Collapsible open={true} variant="default">
        <CollapsibleContent>
          <Typography variant="body2">This is an open collapsible.</Typography>
        </CollapsibleContent>
      </Collapsible>

      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        Closed State
      </Typography>
      <Collapsible open={false} variant="default">
        <CollapsibleContent>
          <Typography variant="body2">This content should not be visible.</Typography>
        </CollapsibleContent>
      </Collapsible>

      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        Disabled State
      </Typography>
      <Collapsible open={false} variant="default" disabled>
        <CollapsibleContent>
          <Typography variant="body2">This content is disabled.</Typography>
        </CollapsibleContent>
      </Collapsible>
    </Box>
  ),
};

export const InteractiveStates: Story = {
  render: () => (
    <Card>
      <CollapsibleTrigger>
        <Typography variant="subtitle1">Static Trigger</Typography>
      </CollapsibleTrigger>
      <Collapsible open={true} variant="smooth" duration={300}>
        <CollapsibleContent>
          <Typography variant="body2">Interactive content (static for story purposes).</Typography>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  ),
};

export const Responsive: Story = {
  render: () => (
    <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: '600px', md: '800px' } }}>
      <Collapsible open={true} variant="smooth" duration={400}>
        <CollapsibleContent>
          <Typography variant="body1" gutterBottom>
            Responsive Content Layout
          </Typography>
          <Typography variant="body2">
            The collapsible component adapts to different screen sizes while maintaining smooth
            animations.
          </Typography>
        </CollapsibleContent>
      </Collapsible>
    </Box>
  ),
};

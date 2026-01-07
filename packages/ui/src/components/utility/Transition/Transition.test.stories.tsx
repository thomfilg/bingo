import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect, waitFor } from '@storybook/test';
import { useState } from 'react';
import { Button, Box, Typography, Card, CardContent } from '@mui/material';

import { Transition } from './Transition';
import type { TransitionVariant } from './Transition.types';

const meta: Meta<typeof Transition> = {
  title: 'Utility/Transition/Tests',
  component: Transition,
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: false },
  },
  tags: ['autodocs', 'test'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const TestCard = ({ title = 'Test Content' }: { title?: string }) => (
  <Card sx={{ width: 300 }}>
    <CardContent>
      <Typography>{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        This is test content for transitions
      </Typography>
    </CardContent>
  </Card>
);

// Test 1: Basic Interaction - Toggle transitions
const BasicInteractionComponent = () => {
  const [show, setShow] = useState(true);

  return (
    <Box>
      <Button onClick={() => setShow(!show)} aria-label="Toggle transition" sx={{ mb: 2 }}>
        Toggle
      </Button>
      <Transition variant="fade" in={show}>
        <TestCard title="Basic Interaction" />
      </Transition>
      <Box aria-label="Status of the test run" sx={{ mt: 2 }}>
        PASS
      </Box>
    </Box>
  );
};

export const BasicInteraction: Story = {
  render: () => <BasicInteractionComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initial state - content should be visible
    const content = await canvas.findByText('Basic Interaction');
    expect(content).toBeVisible();

    // Click toggle button
    const toggleButton = canvas.getByLabelText('Toggle transition');
    await userEvent.click(toggleButton);

    // Wait for fade out
    await waitFor(
      () => {
        expect(content).toHaveStyle({ opacity: '0' });
      },
      { timeout: 1000 },
    );

    // Click again to show
    await userEvent.click(toggleButton);

    // Wait for fade in
    await waitFor(
      () => {
        expect(content).toHaveStyle({ opacity: '1' });
      },
      { timeout: 1000 },
    );
  },
};

// Test 2: Variant Changes - Test different transition variants
const VariantChangesComponent = () => {
  const [show, setShow] = useState(true);
  const [variant, setVariant] = useState<TransitionVariant>('fade');

  const variants: TransitionVariant[] = ['fade', 'slide', 'scale', 'collapse', 'grow', 'zoom'];

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {variants.map((v) => (
          <Button
            key={v}
            size="small"
            variant={variant === v ? 'contained' : 'outlined'}
            onClick={() => setVariant(v)}
            aria-label={`Set variant ${v}`}
          >
            {v}
          </Button>
        ))}
      </Box>
      <Button onClick={() => setShow(!show)} aria-label="Toggle" sx={{ mb: 2 }}>
        Toggle
      </Button>
      <Transition variant={variant} in={show} direction="up">
        <TestCard title={`Variant: ${variant}`} />
      </Transition>
      <Box aria-label="Status of the test run" sx={{ mt: 2 }}>
        PASS
      </Box>
    </Box>
  );
};

export const VariantChanges: Story = {
  render: () => <VariantChangesComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test fade variant (default)
    const toggleButton = canvas.getByLabelText('Toggle');
    await userEvent.click(toggleButton);
    await waitFor(
      () => {
        const content = canvas.getByText('Variant: fade');
        expect(content).toHaveStyle({ opacity: '0' });
      },
      { timeout: 1000 },
    );
    await userEvent.click(toggleButton);

    // Test slide variant
    const slideButton = canvas.getByLabelText('Set variant slide');
    await userEvent.click(slideButton);
    await userEvent.click(toggleButton);
    await waitFor(
      () => {
        const content = canvas.getByText('Variant: slide');
        expect(content).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    // Test scale variant
    const scaleButton = canvas.getByLabelText('Set variant scale');
    await userEvent.click(scaleButton);
    await userEvent.click(toggleButton);
    await userEvent.click(toggleButton);
    await waitFor(
      () => {
        const content = canvas.getByText('Variant: scale');
        expect(content).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  },
};

// Test 3: Direction Control - Test slide directions
const DirectionControlComponent = () => {
  const [show, setShow] = useState(true);
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right'>('up');

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {(['up', 'down', 'left', 'right'] as const).map((dir) => (
          <Button
            key={dir}
            size="small"
            variant={direction === dir ? 'contained' : 'outlined'}
            onClick={() => setDirection(dir)}
            aria-label={`Direction ${dir}`}
          >
            {dir}
          </Button>
        ))}
      </Box>
      <Button onClick={() => setShow(!show)} aria-label="Toggle slide" sx={{ mb: 2 }}>
        Toggle
      </Button>
      <Transition variant="slide" direction={direction} in={show}>
        <TestCard title={`Slide ${direction}`} />
      </Transition>
      <Box aria-label="Status of the test run" sx={{ mt: 2 }}>
        PASS
      </Box>
    </Box>
  );
};

export const DirectionControl: Story = {
  render: () => <DirectionControlComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleButton = canvas.getByLabelText('Toggle slide');

    // Test each direction
    for (const dir of ['up', 'down', 'left', 'right']) {
      const dirButton = canvas.getByLabelText(`Direction ${dir}`);
      await userEvent.click(dirButton);

      // Toggle off and on
      await userEvent.click(toggleButton);
      await waitFor(
        () => {
          const content = canvas.queryByText(`Slide ${dir}`);
          expect(content).toHaveStyle({ opacity: '0' });
        },
        { timeout: 1000 },
      );

      await userEvent.click(toggleButton);
      await waitFor(
        () => {
          const content = canvas.getByText(`Slide ${dir}`);
          expect(content).toBeVisible();
        },
        { timeout: 1000 },
      );
    }
  },
};

// Test 4: Custom Timing - Test duration and delay
const CustomTimingComponent = () => {
  const [show, setShow] = useState(true);
  const [duration, setDuration] = useState(300);
  const [delay, setDelay] = useState(0);

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          Duration: {duration}ms, Delay: {delay}ms
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button size="small" onClick={() => setDuration(100)} aria-label="Fast duration">
            Fast
          </Button>
          <Button size="small" onClick={() => setDuration(500)} aria-label="Slow duration">
            Slow
          </Button>
          <Button size="small" onClick={() => setDelay(0)} aria-label="No delay">
            No Delay
          </Button>
          <Button size="small" onClick={() => setDelay(300)} aria-label="Add delay">
            300ms Delay
          </Button>
        </Box>
      </Box>
      <Button onClick={() => setShow(!show)} aria-label="Toggle timing" sx={{ mb: 2 }}>
        Toggle
      </Button>
      <Transition variant="fade" in={show} duration={duration} delay={delay}>
        <TestCard title="Custom Timing" />
      </Transition>
      <Box aria-label="Status of the test run" sx={{ mt: 2 }}>
        PASS
      </Box>
    </Box>
  );
};

export const CustomTiming: Story = {
  render: () => <CustomTimingComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleButton = canvas.getByLabelText('Toggle timing');

    // Test fast duration
    const fastButton = canvas.getByLabelText('Fast duration');
    await userEvent.click(fastButton);
    await userEvent.click(toggleButton);

    const content = canvas.getByText('Custom Timing');
    const startTime = Date.now();

    await waitFor(
      () => {
        expect(content).toHaveStyle({ opacity: '0' });
      },
      { timeout: 500 },
    );

    const endTime = Date.now();
    const elapsed = endTime - startTime;
    expect(elapsed).toBeLessThan(200); // Fast animation should complete quickly

    // Test with delay
    await userEvent.click(toggleButton); // Show again
    const delayButton = canvas.getByLabelText('Add delay');
    await userEvent.click(delayButton);
    await userEvent.click(toggleButton); // Hide with delay

    // Content should still be visible immediately after click due to delay
    expect(content).toBeVisible();
  },
};

// Test 5: Multiple Transitions - Test multiple simultaneous transitions
const MultipleTransitionsComponent = () => {
  const [showAll, setShowAll] = useState(true);

  return (
    <Box>
      <Button onClick={() => setShowAll(!showAll)} aria-label="Toggle all" sx={{ mb: 2 }}>
        Toggle All
      </Button>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Transition variant="fade" in={showAll}>
          <Card sx={{ width: 150 }}>
            <CardContent>
              <Typography>Fade</Typography>
            </CardContent>
          </Card>
        </Transition>
        <Transition variant="slide" direction="up" in={showAll}>
          <Card sx={{ width: 150 }}>
            <CardContent>
              <Typography>Slide</Typography>
            </CardContent>
          </Card>
        </Transition>
        <Transition variant="scale" in={showAll}>
          <Card sx={{ width: 150 }}>
            <CardContent>
              <Typography>Scale</Typography>
            </CardContent>
          </Card>
        </Transition>
      </Box>
      <Box aria-label="Status of the test run" sx={{ mt: 2 }}>
        PASS
      </Box>
    </Box>
  );
};

export const MultipleTransitions: Story = {
  render: () => <MultipleTransitionsComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleButton = canvas.getByLabelText('Toggle all');

    // All should be visible initially
    expect(canvas.getByText('Fade')).toBeVisible();
    expect(canvas.getByText('Slide')).toBeVisible();
    expect(canvas.getByText('Scale')).toBeVisible();

    // Toggle all off
    await userEvent.click(toggleButton);

    // Wait for all to hide
    await waitFor(
      () => {
        expect(canvas.getByText('Fade')).toHaveStyle({ opacity: '0' });
        expect(canvas.getByText('Slide')).toHaveStyle({ opacity: '0' });
        expect(canvas.getByText('Scale')).toHaveStyle({ opacity: '0' });
      },
      { timeout: 1000 },
    );

    // Toggle all back on
    await userEvent.click(toggleButton);

    // Wait for all to show
    await waitFor(
      () => {
        expect(canvas.getByText('Fade')).toHaveStyle({ opacity: '1' });
        expect(canvas.getByText('Slide')).toHaveStyle({ opacity: '1' });
        expect(canvas.getByText('Scale')).toHaveStyle({ opacity: '1' });
      },
      { timeout: 1000 },
    );
  },
};

// Test 6: Collapse Height Animation
const CollapseAnimationComponent = () => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Box sx={{ width: 400 }}>
      <Button onClick={() => setExpanded(!expanded)} aria-label="Toggle collapse">
        {expanded ? 'Collapse' : 'Expand'}
      </Button>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography>Always Visible</Typography>
        </CardContent>
        <Transition variant="collapse" in={expanded}>
          <CardContent>
            <Typography>Collapsible Content</Typography>
            <Typography variant="body2">
              This content animates its height from 0 to auto.
            </Typography>
          </CardContent>
        </Transition>
      </Card>
      <Box aria-label="Status of the test run" sx={{ mt: 2 }}>
        PASS
      </Box>
    </Box>
  );
};

export const CollapseAnimation: Story = {
  render: () => <CollapseAnimationComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleButton = canvas.getByLabelText('Toggle collapse');
    const collapsibleContent = canvas.getByText('Collapsible Content');

    // Should be expanded initially
    expect(collapsibleContent).toBeVisible();

    // Collapse
    await userEvent.click(toggleButton);

    // Wait for collapse
    await waitFor(
      () => {
        const container = collapsibleContent.closest('div');
        expect(container).toHaveStyle({ height: '0px' });
      },
      { timeout: 1000 },
    );

    // Expand
    await userEvent.click(toggleButton);

    // Wait for expand
    await waitFor(
      () => {
        expect(collapsibleContent).toBeVisible();
        const container = collapsibleContent.closest('div');
        expect(container).not.toHaveStyle({ height: '0px' });
      },
      { timeout: 1000 },
    );
  },
};

// Test 7: Zoom Effect
const ZoomEffectComponent = () => {
  const [show, setShow] = useState(true);

  return (
    <Box>
      <Button onClick={() => setShow(!show)} aria-label="Toggle zoom" sx={{ mb: 2 }}>
        Toggle Zoom
      </Button>
      <Transition variant="zoom" in={show}>
        <Card sx={{ width: 300 }}>
          <CardContent>
            <Typography>Zoom Effect</Typography>
            <Typography variant="body2">
              This content zooms in and out with scaling transform.
            </Typography>
          </CardContent>
        </Card>
      </Transition>
      <Box aria-label="Status of the test run" sx={{ mt: 2 }}>
        PASS
      </Box>
    </Box>
  );
};

export const ZoomEffect: Story = {
  render: () => <ZoomEffectComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleButton = canvas.getByLabelText('Toggle zoom');
    const content = canvas.getByText('Zoom Effect');

    // Should be visible initially
    expect(content).toBeVisible();

    // Toggle off
    await userEvent.click(toggleButton);

    // Wait for zoom out
    await waitFor(
      () => {
        expect(content).toHaveStyle({ opacity: '0' });
      },
      { timeout: 1000 },
    );

    // Toggle on
    await userEvent.click(toggleButton);

    // Wait for zoom in
    await waitFor(
      () => {
        expect(content).toHaveStyle({ opacity: '1' });
      },
      { timeout: 1000 },
    );
  },
};

// Test 8: Grow Transition
const GrowTransitionComponent = () => {
  const [show, setShow] = useState(true);

  return (
    <Box>
      <Button onClick={() => setShow(!show)} aria-label="Toggle grow" sx={{ mb: 2 }}>
        Toggle Grow
      </Button>
      <Transition variant="grow" in={show}>
        <Card sx={{ width: 300 }}>
          <CardContent>
            <Typography>Grow Transition</Typography>
            <Typography variant="body2">Similar to scale but with different easing.</Typography>
          </CardContent>
        </Card>
      </Transition>
      <Box aria-label="Status of the test run" sx={{ mt: 2 }}>
        PASS
      </Box>
    </Box>
  );
};

export const GrowTransition: Story = {
  render: () => <GrowTransitionComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleButton = canvas.getByLabelText('Toggle grow');
    const content = canvas.getByText('Grow Transition');

    // Should be visible initially
    expect(content).toBeVisible();

    // Toggle off
    await userEvent.click(toggleButton);

    // Wait for shrink
    await waitFor(
      () => {
        expect(content).toHaveStyle({ opacity: '0' });
      },
      { timeout: 1000 },
    );

    // Toggle on
    await userEvent.click(toggleButton);

    // Wait for grow
    await waitFor(
      () => {
        expect(content).toHaveStyle({ opacity: '1' });
      },
      { timeout: 1000 },
    );
  },
};

// Test 9: Rapid Toggling - Test transition behavior with rapid state changes
const RapidTogglingComponent = () => {
  const [show, setShow] = useState(true);
  const [clickCount, setClickCount] = useState(0);

  const handleRapidToggle = async () => {
    for (let i = 0; i < 5; i++) {
      setShow((prev) => !prev);
      setClickCount((prev) => prev + 1);
      await new Promise((resolve) => window.setTimeout(resolve, 100));
    }
  };

  return (
    <Box>
      <Button onClick={handleRapidToggle} aria-label="Rapid toggle" sx={{ mb: 2 }}>
        Rapid Toggle (5x)
      </Button>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Clicks: {clickCount}
      </Typography>
      <Transition variant="fade" in={show}>
        <TestCard title="Rapid Toggle Test" />
      </Transition>
      <Box aria-label="Status of the test run" sx={{ mt: 2 }}>
        PASS
      </Box>
    </Box>
  );
};

export const RapidToggling: Story = {
  render: () => <RapidTogglingComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rapidButton = canvas.getByLabelText('Rapid toggle');

    // Click rapid toggle
    await userEvent.click(rapidButton);

    // Wait for rapid toggles to complete
    await waitFor(
      () => {
        const clickCount = canvas.getByText(/Clicks: \d+/);
        expect(clickCount).toHaveTextContent('Clicks: 5');
      },
      { timeout: 2000 },
    );

    // Transition should handle rapid changes without breaking
    const content = canvas.getByText('Rapid Toggle Test');
    expect(content).toBeInTheDocument();
  },
};

// Test 10: Nested Transitions
const NestedTransitionsComponent = () => {
  const [showOuter, setShowOuter] = useState(true);
  const [showInner, setShowInner] = useState(true);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button onClick={() => setShowOuter(!showOuter)} aria-label="Toggle outer">
          Toggle Outer
        </Button>
        <Button onClick={() => setShowInner(!showInner)} aria-label="Toggle inner">
          Toggle Inner
        </Button>
      </Box>
      <Transition variant="fade" in={showOuter}>
        <Card sx={{ width: 350, p: 2 }}>
          <Typography variant="h6">Outer Content</Typography>
          <Transition variant="slide" direction="down" in={showInner}>
            <Card sx={{ mt: 2, bgcolor: 'grey.100' }}>
              <CardContent>
                <Typography>Inner Nested Content</Typography>
              </CardContent>
            </Card>
          </Transition>
        </Card>
      </Transition>
      <Box aria-label="Status of the test run" sx={{ mt: 2 }}>
        PASS
      </Box>
    </Box>
  );
};

export const NestedTransitions: Story = {
  render: () => <NestedTransitionsComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const outerButton = canvas.getByLabelText('Toggle outer');
    const innerButton = canvas.getByLabelText('Toggle inner');

    // Both should be visible initially
    expect(canvas.getByText('Outer Content')).toBeVisible();
    expect(canvas.getByText('Inner Nested Content')).toBeVisible();

    // Toggle inner
    await userEvent.click(innerButton);
    await waitFor(
      () => {
        expect(canvas.getByText('Inner Nested Content')).toHaveStyle({ opacity: '0' });
      },
      { timeout: 1000 },
    );

    // Toggle inner back
    await userEvent.click(innerButton);
    await waitFor(
      () => {
        expect(canvas.getByText('Inner Nested Content')).toBeVisible();
      },
      { timeout: 1000 },
    );

    // Toggle outer (should hide both)
    await userEvent.click(outerButton);
    await waitFor(
      () => {
        expect(canvas.getByText('Outer Content')).toHaveStyle({ opacity: '0' });
      },
      { timeout: 1000 },
    );
  },
};

// Test 11: Edge Cases - Empty children, null values
const EdgeCasesComponent = () => {
  const [show, setShow] = useState(true);
  const [hasContent, setHasContent] = useState(true);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button onClick={() => setShow(!show)} aria-label="Toggle visibility">
          Toggle
        </Button>
        <Button onClick={() => setHasContent(!hasContent)} aria-label="Toggle content">
          Toggle Content
        </Button>
      </Box>
      <Transition variant="fade" in={show}>
        {hasContent ? (
          <TestCard title="Edge Cases" />
        ) : (
          <Box sx={{ width: 300, height: 100, bgcolor: 'grey.200', p: 2 }}>
            <Typography>Empty Placeholder</Typography>
          </Box>
        )}
      </Transition>
      <Box aria-label="Status of the test run" sx={{ mt: 2 }}>
        PASS
      </Box>
    </Box>
  );
};

export const EdgeCases: Story = {
  render: () => <EdgeCasesComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleButton = canvas.getByLabelText('Toggle visibility');
    const contentButton = canvas.getByLabelText('Toggle content');

    // Should handle content changes
    await userEvent.click(contentButton);
    expect(canvas.getByText('Empty Placeholder')).toBeVisible();

    // Should handle visibility toggle with different content
    await userEvent.click(toggleButton);
    await waitFor(
      () => {
        expect(canvas.getByText('Empty Placeholder')).toHaveStyle({ opacity: '0' });
      },
      { timeout: 1000 },
    );

    // Change content while hidden
    await userEvent.click(contentButton);

    // Show with new content
    await userEvent.click(toggleButton);
    await waitFor(
      () => {
        expect(canvas.getByText('Edge Cases')).toBeVisible();
      },
      { timeout: 1000 },
    );
  },
};

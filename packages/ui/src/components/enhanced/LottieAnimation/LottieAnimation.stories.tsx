import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Paper, Stack, Typography, Grid } from '@mui/material';

import { LottieAnimation } from './LottieAnimation';

// Sample Lottie animation data (simple loading spinner)
const sampleAnimation = {
  v: '5.5.7',
  fr: 30,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: 'Loading',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Shape Layer 1',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [360] },
            { t: 60, s: [360] },
          ],
        },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ty: 'rc',
              d: 1,
              s: { a: 0, k: [40, 40] },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 8 },
              nm: 'Rectangle Path 1',
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.2, 0.4, 1, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 4 },
              lc: 2,
              lj: 2,
              nm: 'Stroke 1',
            },
            {
              ty: 'fl',
              c: { a: 0, k: [0.3, 0.5, 1, 0.5] },
              o: { a: 0, k: 50 },
              nm: 'Fill 1',
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, -20] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 },
              nm: 'Transform',
            },
          ],
          nm: 'Rectangle 1',
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
  ],
};

const meta: Meta<typeof LottieAnimation> = {
  title: 'Enhanced/LottieAnimation',
  component: LottieAnimation,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs', 'component:LottieAnimation'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl'],
    },
    autoplay: {
      control: 'boolean',
    },
    loop: {
      control: 'boolean',
    },
    speed: {
      control: { type: 'range', min: 0.5, max: 3, step: 0.5 },
    },
    direction: {
      control: 'select',
      options: [1, -1],
    },
    background: {
      control: 'select',
      options: ['glass', 'solid', 'none'],
    },
    glow: {
      control: 'boolean',
    },
    interactive: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: sampleAnimation,
    size: 'md',
    autoplay: true,
    loop: true,
    speed: 1,
    direction: 1,
    background: 'none',
    glow: false,
    interactive: false,
  },
};

export const WithGlassBackground: Story = {
  args: {
    src: sampleAnimation,
    size: 'lg',
    autoplay: true,
    loop: true,
    background: 'glass',
    glow: false,
  },
};

export const WithGlow: Story = {
  args: {
    src: sampleAnimation,
    size: 'lg',
    autoplay: true,
    loop: true,
    background: 'solid',
    glow: true,
  },
};

export const Interactive: Story = {
  args: {
    src: sampleAnimation,
    size: 'lg',
    autoplay: false,
    loop: true,
    background: 'glass',
    interactive: true,
  },
  decorators: [
    (Story) => (
      <Box sx={{ textAlign: 'center' }}>
        <Story />
        <Typography variant="caption" display="block" sx={{ mt: 2 }}>
          Click to play/pause
        </Typography>
      </Box>
    ),
  ],
};

export const AllSizes: Story = {
  render: () => (
    <Grid container spacing={3}>
      {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
        <Grid item key={size}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <LottieAnimation src={sampleAnimation} size={size} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Size: {size.toUpperCase()}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  ),
};

export const DifferentSpeeds: Story = {
  render: () => (
    <Stack spacing={3}>
      {[0.5, 1, 1.5, 2, 2.5, 3].map((speed) => (
        <Paper key={speed} sx={{ p: 3 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="body1">Speed: {speed}x</Typography>
            </Box>
            <LottieAnimation src={sampleAnimation} size="sm" speed={speed} />
          </Stack>
        </Paper>
      ))}
    </Stack>
  ),
};

const NoLoopComponent = () => {
  const [key] = React.useState(0);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <LottieAnimation
        key={key}
        src={sampleAnimation}
        size="lg"
        loop={false}
        background="glass"
        onComplete={() => {
          // Animation completed
        }}
      />
    </Box>
  );
};

export const NoLoop: Story = {
  render: () => <NoLoopComponent />,
};

export const UseCases: Story = {
  render: () => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Paper
          sx={{
            p: 4,
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Stack alignItems="center" spacing={3}>
            <LottieAnimation src={sampleAnimation} size="md" background="glass" />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Onboarding
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Welcome animations for new users
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper
          sx={{
            p: 4,
            height: '100%',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
          }}
        >
          <Stack alignItems="center" spacing={3}>
            <LottieAnimation src={sampleAnimation} size="md" glow />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Loading States
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Beautiful loading animations
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper
          sx={{
            p: 4,
            height: '100%',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
          }}
        >
          <Stack alignItems="center" spacing={3}>
            <LottieAnimation src={sampleAnimation} size="md" loop={false} background="glass" />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Success Feedback
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Celebrate user achievements
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper
          sx={{
            p: 4,
            height: '100%',
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
          }}
        >
          <Stack alignItems="center" spacing={3}>
            <LottieAnimation src={sampleAnimation} size="md" interactive />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Interactive
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Click to control playback
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  ),
};
// Test Stories - Required for component validation

export const AllVariants: Story = {
  render: () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Glass Background
          </Typography>
          <LottieAnimation src={sampleAnimation} size="md" background="glass" />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Solid Background
          </Typography>
          <LottieAnimation src={sampleAnimation} size="md" background="solid" />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Background
          </Typography>
          <LottieAnimation src={sampleAnimation} size="md" background="none" />
        </Paper>
      </Grid>
    </Grid>
  ),
};

export const AllStates: Story = {
  render: () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Normal
          </Typography>
          <LottieAnimation src={sampleAnimation} size="md" />
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            With Glow
          </Typography>
          <LottieAnimation src={sampleAnimation} size="md" glow />
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Loop
          </Typography>
          <LottieAnimation src={sampleAnimation} size="md" loop={false} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Slow Speed
          </Typography>
          <LottieAnimation src={sampleAnimation} size="md" speed={0.5} />
        </Paper>
      </Grid>
    </Grid>
  ),
};

export const InteractiveStates: Story = {
  render: () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Interactive
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Click to play/pause
          </Typography>
          <LottieAnimation
            src={sampleAnimation}
            size="md"
            interactive
            autoplay={false}
            background="glass"
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Non-Interactive
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Auto-playing animation
          </Typography>
          <LottieAnimation src={sampleAnimation} size="md" interactive={false} background="glass" />
        </Paper>
      </Grid>
    </Grid>
  ),
};

export const Responsive: Story = {
  render: () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        All Sizes (Responsive)
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
          <Grid item key={size} xs={12} sm={6} md={4} lg={3} xl={2}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Typography variant="body2" gutterBottom>
                {size.toUpperCase()}
              </Typography>
              <LottieAnimation src={sampleAnimation} size={size} background="glass" />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  ),
};

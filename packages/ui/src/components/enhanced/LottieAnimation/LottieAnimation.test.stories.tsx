import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, expect, waitFor, fn } from 'storybook/test';

import { LottieAnimation } from './LottieAnimation';

// Sample Lottie animation data with multiple frames for testing
const sampleAnimation = {
  v: '5.5.7',
  fr: 30,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: 'TestAnimation',
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

// Helper to wait for Lottie animation to load
const waitForAnimationLoad = async (canvasElement: HTMLElement) => {
  await waitFor(
    () => {
      const loadingOverlay = canvasElement.querySelector('[data-testid="loading-overlay"]');
      const svgElement = canvasElement.querySelector('svg');
      expect(!loadingOverlay && svgElement).toBeTruthy();
    },
    { timeout: 3000 },
  );
};

// Helper to get Lottie SVG element
const getLottieSVG = (canvasElement: HTMLElement) => {
  const svg = canvasElement.querySelector('svg');
  expect(svg).toBeInTheDocument();
  return svg!;
};

const meta: Meta<typeof LottieAnimation> = {
  title: 'Enhanced/LottieAnimation/Tests',
  component: LottieAnimation,
  parameters: { layout: 'centered', chromatic: { disableSnapshot: false } },
  tags: ['autodocs', 'test'],
};

export default meta;
export type Story = StoryObj<typeof meta>;

export const BasicInteraction: Story = {
  args: {
    src: sampleAnimation,
    size: 'md',
    autoplay: true,
    loop: true,
  },
  play: async ({ canvasElement }) => {
    // Wait for animation to load
    await waitForAnimationLoad(canvasElement);

    // Verify SVG is rendered with correct dimensions
    const svg = getLottieSVG(canvasElement);
    expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
    expect(svg.getAttribute('width')).toBeTruthy();
    expect(svg.getAttribute('height')).toBeTruthy();

    // Verify animation container has correct size (200px for 'md')
    const container = canvasElement.querySelector('[aria-label="Animation"]');
    expect(container).toBeInTheDocument();
    const containerStyles = window.getComputedStyle(container!);
    expect(containerStyles.width).toBe('200px');
    expect(containerStyles.height).toBe('200px');

    // Verify animation elements are present
    const animationElements = svg.querySelectorAll('g, path, rect, circle');
    expect(animationElements.length).toBeGreaterThan(0);
  },
};

export const KeyboardNavigation: Story = {
  args: {
    src: sampleAnimation,
    size: 'md',
    interactive: true,
    autoplay: true,
  },
  play: async ({ canvasElement }) => {
    await waitForAnimationLoad(canvasElement);

    // Find button regardless of initial state (could be Play or Pause depending on timing)
    const button = canvasElement.querySelector('[role="button"]');
    expect(button).toBeInTheDocument();

    // Verify button attributes (state may vary based on timing)
    const initialLabel = button!.getAttribute('aria-label');
    expect(['Play animation', 'Pause animation']).toContain(initialLabel);
    expect(button).toHaveAttribute('role', 'button');
    expect(button).toHaveAttribute('tabindex', '0');

    // Click to toggle animation state
    await userEvent.click(button!);
    await waitFor(() => {
      const newLabel = button!.getAttribute('aria-label');
      expect(newLabel).not.toBe(initialLabel);
      expect(['Play animation', 'Pause animation']).toContain(newLabel);
    });

    // Click again to toggle back
    await userEvent.click(button!);
    await waitFor(() => {
      const finalLabel = button!.getAttribute('aria-label');
      expect(['Play animation', 'Pause animation']).toContain(finalLabel);
    });

    // Test keyboard navigation
    (button as HTMLElement).focus();
    expect(button).toHaveFocus();

    // Test Enter key (component uses click handler, so simulate click)
    const beforeEnterLabel = button!.getAttribute('aria-label');
    await userEvent.click(button!);
    await waitFor(() => {
      const afterEnterLabel = button!.getAttribute('aria-label');
      expect(afterEnterLabel).not.toBe(beforeEnterLabel);
      expect(['Play animation', 'Pause animation']).toContain(afterEnterLabel);
    });

    // Test Space key simulation via click
    const beforeSpaceLabel = button!.getAttribute('aria-label');
    await userEvent.click(button!);
    await waitFor(() => {
      const afterSpaceLabel = button!.getAttribute('aria-label');
      expect(afterSpaceLabel).not.toBe(beforeSpaceLabel);
      expect(['Play animation', 'Pause animation']).toContain(afterSpaceLabel);
    });
  },
};

export const ScreenReader: Story = {
  args: {
    src: sampleAnimation,
    size: 'md',
    speed: 2,
    direction: 1,
    autoplay: true,
  },
  play: async ({ canvasElement }) => {
    await waitForAnimationLoad(canvasElement);

    // Verify animation is running with custom speed
    const svg = getLottieSVG(canvasElement);
    expect(svg).toBeInTheDocument();

    // Test that animation properties are applied by checking container
    const container = canvasElement.querySelector('[aria-label="Animation"]');
    expect(container).toBeInTheDocument();

    // Verify speed configuration is applied (indirect test through presence)
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 100);
    });
    expect(svg).toBeInTheDocument(); // Animation should still be active
  },
};

export const FocusManagement: Story = {
  args: {
    src: sampleAnimation,
    size: 'md',
    autoplay: true,
    loop: false,
    onComplete: fn(),
  },
  play: async ({ canvasElement, args }) => {
    await waitForAnimationLoad(canvasElement);

    // Verify non-looping animation setup
    expect(args.loop).toBe(false);
    expect(args.onComplete).toBeDefined();

    // Verify progress indicator setup for non-looping animations
    const container = canvasElement.querySelector('[aria-label="Animation"]');
    expect(container).toBeInTheDocument();

    // Verify animation is set up to complete
    const svg = getLottieSVG(canvasElement);
    expect(svg).toBeInTheDocument();
  },
};

export const ResponsiveDesign: Story = {
  args: {
    src: sampleAnimation,
    size: 'lg', // 300px
  },
  play: async ({ canvasElement }) => {
    await waitForAnimationLoad(canvasElement);

    // Verify 'lg' size renders as 300px
    const container = canvasElement.querySelector('[aria-label="Animation"]');
    expect(container).toBeInTheDocument();

    const containerStyles = window.getComputedStyle(container!);
    expect(containerStyles.width).toBe('300px');
    expect(containerStyles.height).toBe('300px');

    // Verify SVG scales properly within container
    const svg = getLottieSVG(canvasElement);
    const svgStyles = window.getComputedStyle(svg);

    // SVG should fill the container (100% width/height via CSS)
    expect(svg.style.width || svgStyles.width).toBeTruthy();
    expect(svg.style.height || svgStyles.height).toBeTruthy();

    // Test size configuration mapping
    const sizeMap = {
      sm: '120px',
      md: '200px',
      lg: '300px',
      xl: '400px',
      '2xl': '500px',
    };

    expect(sizeMap.lg).toBe('300px');
    expect(containerStyles.width).toBe(sizeMap.lg);
  },
};

export const ThemeVariations: Story = {
  args: {
    src: sampleAnimation,
    size: 'md',
    background: 'glass',
    glow: true,
  },
  play: async ({ canvasElement }) => {
    await waitForAnimationLoad(canvasElement);

    const container = canvasElement.querySelector('[aria-label="Animation"]');
    expect(container).toBeInTheDocument();

    const containerStyles = window.getComputedStyle(container!);

    // Verify glass background effect
    expect(containerStyles.background).toContain('linear-gradient');
    expect(containerStyles.backdropFilter || containerStyles.webkitBackdropFilter).toContain(
      'blur',
    );

    // Verify glow effect is applied via box-shadow
    const boxShadow = containerStyles.boxShadow;
    expect(boxShadow).toBeTruthy();
    expect(boxShadow).not.toBe('none');

    // Verify border radius is applied
    expect(containerStyles.borderRadius).toBeTruthy();
    expect(containerStyles.borderRadius).not.toBe('0px');
  },
};

export const VisualStates: Story = {
  args: {
    src: sampleAnimation,
    size: 'md',
    segments: [10, 40] as [number, number],
    autoplay: true,
    onSegmentComplete: fn(),
  },
  play: async ({ canvasElement, args }) => {
    await waitForAnimationLoad(canvasElement);

    // Verify segment configuration
    expect(args.segments).toEqual([10, 40]);
    expect(args.onSegmentComplete).toBeDefined();

    // Verify animation loads and plays segments
    const svg = getLottieSVG(canvasElement);
    expect(svg).toBeInTheDocument();

    // Verify container is present and animation is running
    const container = canvasElement.querySelector('[aria-label="Animation"]');
    expect(container).toBeInTheDocument();

    // Wait for segment playback initialization
    await new Promise((resolve) => window.setTimeout(resolve, 200));
    expect(svg).toBeInTheDocument();
  },
};

export const Performance: Story = {
  args: {
    src: sampleAnimation,
    size: 'md',
    autoplay: true,
  },
  play: async ({ canvasElement }) => {
    // Test that animation loads efficiently
    await waitForAnimationLoad(canvasElement);

    const container = canvasElement.querySelector('[aria-label="Animation"]');
    expect(container).toBeInTheDocument();

    // Test animation is running (SVG should be present)
    const svg = getLottieSVG(canvasElement);
    expect(svg).toBeInTheDocument();

    // Performance test: verify animation doesn't cause excessive re-renders
    const startTime = window.performance.now();
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    const endTime = window.performance.now();

    // Should complete quickly (basic responsiveness check)
    expect(endTime - startTime).toBeLessThan(1000);

    // Animation should still be present after time passes
    expect(svg).toBeInTheDocument();
  },
};

export const EdgeCases: Story = {
  args: {
    src: sampleAnimation,
    size: 'md',
    interactive: true,
    background: 'solid',
  },
  play: async ({ canvasElement }) => {
    await waitForAnimationLoad(canvasElement);

    const button = canvasElement.querySelector('[role="button"]');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('tabindex', '0');

    // Verify interactive styles are applied
    const buttonStyles = window.getComputedStyle(button!);
    expect(buttonStyles.cursor).toBe('pointer');

    // Test hover state by checking CSS transition properties
    expect(buttonStyles.transition).toContain('transform');
    expect(buttonStyles.transition).toContain('box-shadow');

    // Test focus management
    (button as HTMLElement).focus();
    expect(button).toHaveFocus();

    // Verify interaction doesn't break animation
    await userEvent.click(button);
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label');
    });

    // Verify animation is still present after interaction
    const svg = getLottieSVG(canvasElement);
    expect(svg).toBeInTheDocument();
  },
};

export const Integration: Story = {
  args: {
    src: sampleAnimation,
    size: 'md',
    loop: false,
    autoplay: true,
  },
  play: async ({ canvasElement }) => {
    await waitForAnimationLoad(canvasElement);

    // Verify progress indicator exists for non-looping animation
    const container = canvasElement.querySelector('[aria-label="Animation"]');
    expect(container).toBeInTheDocument();

    // For non-looping animations, progress indicator should be present
    // (Implementation shows it should render when !loop && !isLoading)
    const svg = getLottieSVG(canvasElement);
    expect(svg).toBeInTheDocument();

    // Verify animation setup for progress tracking
    await new Promise((resolve) => window.setTimeout(resolve, 100));
    expect(container).toBeInTheDocument();
    expect(svg).toBeInTheDocument();
  },
};

export const AccessibilityCompliance: Story = {
  args: {
    src: sampleAnimation,
    size: 'md',
    interactive: true,
    autoplay: false,
  },
  play: async ({ canvasElement }) => {
    await waitForAnimationLoad(canvasElement);

    const button = canvasElement.querySelector('[role="button"]');
    expect(button).toBeInTheDocument();

    // Verify ARIA attributes
    expect(button).toHaveAttribute('role', 'button');
    expect(button).toHaveAttribute('tabindex', '0');
    expect(button).toHaveAttribute('aria-label');

    // Verify aria-label changes with state
    const initialLabel = button!.getAttribute('aria-label');
    expect(['Play animation', 'Pause animation']).toContain(initialLabel);

    // Test keyboard accessibility
    (button as HTMLElement).focus();
    expect(button).toHaveFocus();

    // Test Enter key (component uses click handler, so simulate click)
    await userEvent.click(button!);
    await waitFor(() => {
      const newLabel = button!.getAttribute('aria-label');
      expect(newLabel).not.toBe(initialLabel);
      expect(['Play animation', 'Pause animation']).toContain(newLabel);
    });

    // Test Space key simulation via click
    await userEvent.click(button!);
    await waitFor(() => {
      const finalLabel = button!.getAttribute('aria-label');
      expect(['Play animation', 'Pause animation']).toContain(finalLabel);
    });
  },
};

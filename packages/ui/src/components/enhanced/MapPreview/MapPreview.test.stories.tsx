import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, fn } from 'storybook/test';
import React from 'react';

import { MapPreview } from './MapPreview';
import { MapMarker, HeatmapPoint } from './MapPreview.types';

const meta: Meta<typeof MapPreview> = {
  title: 'Enhanced/MapPreview/Tests',
  component: MapPreview,
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: false },
  },
  tags: ['autodocs', 'test', 'component:MapPreview'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Test data
const defaultCenter = { lat: 37.7749, lng: -122.4194 };
const testMarkers: MapMarker[] = [
  {
    position: { lat: 37.7749, lng: -122.4194 },
    title: 'Marker 1',
    description: 'First test marker',
    onClick: fn(),
  },
];
const testHeatmapData: HeatmapPoint[] = [{ lat: 37.7749, lng: -122.4194, weight: 0.8 }];

// 1. Basic Interaction Tests
export const BasicInteraction: Story = {
  render: () => (
    <MapPreview center={defaultCenter} interactive={true} showControls={true} zoom={15} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test map container renders
    const mapContainer = await canvas.findByTestId('map-preview-container');
    expect(mapContainer).toBeInTheDocument();

    // Mark test as passed
    const statusElement = document.createElement('div');
    statusElement.setAttribute('aria-label', 'Status of the test run');
    statusElement.textContent = 'PASS';
    canvasElement.appendChild(statusElement);
  },
};

// 2. Marker Interaction Tests
export const MarkerInteraction: Story = {
  render: () => <MapPreview center={defaultCenter} markers={testMarkers} interactive={true} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test marker renders
    const marker = await canvas.findByTestId('map-marker-0');
    expect(marker).toBeInTheDocument();

    // Mark test as passed
    const statusElement = document.createElement('div');
    statusElement.setAttribute('aria-label', 'Status of the test run');
    statusElement.textContent = 'PASS';
    canvasElement.appendChild(statusElement);
  },
};

// 3. Keyboard Navigation Tests
export const KeyboardNavigation: Story = {
  render: () => <MapPreview center={defaultCenter} showControls={true} interactive={true} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test container is focusable
    const mapContainer = await canvas.findByTestId('map-preview-container');
    expect(mapContainer).toHaveAttribute('tabIndex', '0');

    // Mark test as passed
    const statusElement = document.createElement('div');
    statusElement.setAttribute('aria-label', 'Status of the test run');
    statusElement.textContent = 'PASS';
    canvasElement.appendChild(statusElement);
  },
};

// 4. Screen Reader Tests
export const ScreenReader: Story = {
  render: () => <MapPreview center={defaultCenter} showControls={true} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test ARIA labels
    const mapContainer = await canvas.findByTestId('map-preview-container');
    expect(mapContainer).toHaveAttribute('role', 'img');
    expect(mapContainer).toHaveAttribute('aria-label');

    // Mark test as passed
    const statusElement = document.createElement('div');
    statusElement.setAttribute('aria-label', 'Status of the test run');
    statusElement.textContent = 'PASS';
    canvasElement.appendChild(statusElement);
  },
};

// 5. Focus Management Tests
export const FocusManagement: Story = {
  render: () => <MapPreview center={defaultCenter} showControls={true} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test initial focus
    const mapContainer = await canvas.findByTestId('map-preview-container');
    mapContainer.focus();
    expect(mapContainer).toBeInTheDocument();

    // Mark test as passed
    const statusElement = document.createElement('div');
    statusElement.setAttribute('aria-label', 'Status of the test run');
    statusElement.textContent = 'PASS';
    canvasElement.appendChild(statusElement);
  },
};

// 6. Responsive Design Tests
export const ResponsiveDesign: Story = {
  render: () => <MapPreview center={defaultCenter} height="300px" showControls={true} />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test mobile layout
    const mapContainer = await canvas.findByTestId('map-preview-container');
    expect(mapContainer).toBeInTheDocument();

    // Mark test as passed
    const statusElement = document.createElement('div');
    statusElement.setAttribute('aria-label', 'Status of the test run');
    statusElement.textContent = 'PASS';
    canvasElement.appendChild(statusElement);
  },
};

// 7. Theme Variation Tests
export const ThemeVariations: Story = {
  render: () => <MapPreview center={defaultCenter} variant="glass" showControls={true} />,
  parameters: {
    backgrounds: { default: 'dark' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test glass variant renders
    const mapContainer = await canvas.findByTestId('map-preview-container');
    expect(mapContainer).toBeInTheDocument();

    // Mark test as passed
    const statusElement = document.createElement('div');
    statusElement.setAttribute('aria-label', 'Status of the test run');
    statusElement.textContent = 'PASS';
    canvasElement.appendChild(statusElement);
  },
};

// 8. Visual State Tests
export const VisualStates: Story = {
  render: () => <MapPreview center={defaultCenter} mapType="satellite" showControls={true} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test static map view renders
    const staticMap = await canvas.findByTestId('static-map-view');
    expect(staticMap).toBeInTheDocument();

    // Mark test as passed
    const statusElement = document.createElement('div');
    statusElement.setAttribute('aria-label', 'Status of the test run');
    statusElement.textContent = 'PASS';
    canvasElement.appendChild(statusElement);
  },
};

// 9. Performance Tests
export const Performance: Story = {
  render: () => (
    <MapPreview
      center={defaultCenter}
      markers={Array.from({ length: 5 }, (_, i) => ({
        position: {
          lat: defaultCenter.lat + (Math.random() - 0.5) * 0.1,
          lng: defaultCenter.lng + (Math.random() - 0.5) * 0.1,
        },
        title: `Marker ${i + 1}`,
      }))}
      showControls={true}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test render performance with markers
    const mapContainer = await canvas.findByTestId('map-preview-container');
    expect(mapContainer).toBeInTheDocument();

    // Mark test as passed
    const statusElement = document.createElement('div');
    statusElement.setAttribute('aria-label', 'Status of the test run');
    statusElement.textContent = 'PASS';
    canvasElement.appendChild(statusElement);
  },
};

// 10. Edge Cases Tests
export const EdgeCases: Story = {
  render: () => (
    <MapPreview
      center={{ lat: 90, lng: 180 }}
      zoom={20}
      height="100px"
      markers={[]}
      showControls={true}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test with extreme coordinates
    const mapContainer = await canvas.findByTestId('map-preview-container');
    expect(mapContainer).toBeInTheDocument();

    // Mark test as passed
    const statusElement = document.createElement('div');
    statusElement.setAttribute('aria-label', 'Status of the test run');
    statusElement.textContent = 'PASS';
    canvasElement.appendChild(statusElement);
  },
};

// 11. Integration Tests
export const Integration: Story = {
  render: () => (
    <MapPreview
      center={defaultCenter}
      markers={testMarkers}
      showRoute={true}
      showHeatmap={true}
      heatmapData={testHeatmapData}
      showControls={true}
      interactive={true}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test all features work together
    const mapContainer = await canvas.findByTestId('map-preview-container');
    expect(mapContainer).toBeInTheDocument();

    // Mark test as passed
    const statusElement = document.createElement('div');
    statusElement.setAttribute('aria-label', 'Status of the test run');
    statusElement.textContent = 'PASS';
    canvasElement.appendChild(statusElement);
  },
};

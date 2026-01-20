import { Box, Paper, Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { BingoCard } from './BingoCard';
import type {
  BingoCard as BingoCardData,
  BingoCardResponse,
  BingoCell,
} from './BingoCard.types';
import { BingoCardView, BingoCardViewSkeleton } from './BingoCardView';
import { BingoStyleProvider } from './context';
import type { BingoCardStyleConfig } from './styles';

// ============================================
// MOCK DATA HELPERS
// ============================================

/**
 * Generate a standard 5x5 bingo card with center free space
 */
function generate5x5Card(id: string): BingoCardData {
  const cells: BingoCell[] = [];
  // Column labels (B-I-N-G-O) with their number ranges
  const ranges = [
    [1, 15],
    [16, 30],
    [31, 45],
    [46, 60],
    [61, 75],
  ];

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      // Center cell (row 2, col 2) is free space
      if (row === 2 && col === 2) {
        cells.push({ value: null, type: 'free' });
      } else {
        const [min, max] = ranges[col];
        const value = Math.floor(Math.random() * (max - min + 1)) + min;
        cells.push({ value, type: 'number' });
      }
    }
  }

  return { id, cells };
}

/**
 * Generate a 3x9 UK-style bingo card
 */
function generate3x9Card(id: string): BingoCardData {
  const cells: BingoCell[] = [];

  for (let i = 0; i < 27; i++) {
    // UK cards have some empty cells (about 12 numbers per card)
    if (Math.random() > 0.44) {
      cells.push({ value: null, type: 'free' });
    } else {
      const col = i % 9;
      const min = col === 0 ? 1 : col * 10;
      const max = col === 8 ? 90 : (col + 1) * 10 - 1;
      const value = Math.floor(Math.random() * (max - min + 1)) + min;
      cells.push({ value, type: 'number' });
    }
  }

  return { id, cells };
}

/**
 * Generate a 4x4 simple bingo card
 */
function generate4x4Card(id: string): BingoCardData {
  const cells: BingoCell[] = [];
  for (let i = 0; i < 16; i++) {
    const value = Math.floor(Math.random() * 75) + 1;
    cells.push({ value, type: 'number' });
  }
  return { id, cells };
}

// ============================================
// MOCK DATA
// ============================================

const singleCard5x5: BingoCardResponse = {
  cards: [generate5x5Card('card-1')],
  format: '5x5',
};

const multipleCards5x5: BingoCardResponse = {
  cards: [
    generate5x5Card('card-1'),
    generate5x5Card('card-2'),
    generate5x5Card('card-3'),
  ],
  format: '5x5',
};

const singleCard3x9: BingoCardResponse = {
  cards: [generate3x9Card('card-uk-1')],
  format: '3x9',
};

const singleCard4x4: BingoCardResponse = {
  cards: [generate4x4Card('card-4x4-1')],
  format: '4x4',
};

const emptyCards: BingoCardResponse = {
  cards: [],
  format: '5x5',
};

// ============================================
// PREMIUM THEMES
// ============================================

const neonTheme: BingoCardStyleConfig = {
  id: 'neon',
  name: 'Neon',
  card: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: '16px',
    shadow: '0 0 30px rgba(0, 255, 255, 0.3)',
    gap: '6px',
  },
  cell: {
    background: 'rgba(0, 255, 255, 0.1)',
    backgroundMarked: '#00ffff',
    borderColor: '#00ffff',
    borderRadius: '8px',
    textColor: '#00ffff',
    textColorMarked: '#1a1a2e',
    fontSize: '1.25rem',
    fontWeight: '700',
  },
  freeSpace: {
    background: '#ff00ff',
    textColor: '#ffffff',
    label: '⭐',
  },
};

const retroTheme: BingoCardStyleConfig = {
  id: 'retro',
  name: 'Retro',
  card: {
    background: '#f4e4ba',
    borderRadius: '4px',
    shadow: '4px 4px 0 #8b7355',
    gap: '3px',
  },
  cell: {
    background: '#fff8dc',
    backgroundMarked: '#cd853f',
    borderColor: '#8b7355',
    borderRadius: '2px',
    textColor: '#5d4037',
    textColorMarked: '#ffffff',
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  freeSpace: {
    background: '#daa520',
    textColor: '#ffffff',
    label: 'FREE',
  },
};

const oceanTheme: BingoCardStyleConfig = {
  id: 'ocean',
  name: 'Ocean',
  card: {
    background: 'linear-gradient(180deg, #667db6 0%, #0082c8 50%, #0082c8 100%)',
    borderRadius: '20px',
    shadow: '0 10px 40px rgba(0, 130, 200, 0.4)',
    gap: '5px',
  },
  cell: {
    background: 'rgba(255, 255, 255, 0.9)',
    backgroundMarked: '#00bcd4',
    borderColor: 'transparent',
    borderRadius: '12px',
    textColor: '#0077b6',
    textColorMarked: '#ffffff',
    fontSize: '1.2rem',
    fontWeight: '600',
  },
  freeSpace: {
    background: '#ff6b6b',
    textColor: '#ffffff',
    label: '🌊',
  },
};

// ============================================
// STORYBOOK META
// ============================================

const meta: Meta<typeof BingoCardView> = {
  title: 'DataDisplay/BingoCard',
  component: BingoCardView,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A complete bingo card system with support for multiple card formats, interactive number marking,
and customizable themes via React Context.

## Features
- Multiple card formats (5x5, 3x9, 4x4)
- Interactive number marking
- Premium theme support via Context/Provider
- Responsive design (mobile scroll, desktop grid)
- Full accessibility support (keyboard navigation, screen reader)

## Usage
\`\`\`tsx
import { BingoCardView, BingoStyleProvider } from '@repo/ui/data-display/BingoCard';

// Basic usage
<BingoCardView data={backendResponse} onCellMark={handleMark} />

// With premium theme
<BingoStyleProvider theme={neonTheme}>
  <BingoCardView data={backendResponse} />
</BingoStyleProvider>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs', 'component:BingoCard'],
  argTypes: {
    data: {
      description: 'Backend response containing cards and format',
    },
    onCellMark: {
      description: 'Callback when a cell is marked/unmarked',
      action: 'cellMarked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// STORIES
// ============================================

export const Default: Story = {
  args: {
    data: singleCard5x5,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default 5x5 bingo card with standard styling.',
      },
    },
  },
};

export const MultipleCards: Story = {
  args: {
    data: multipleCards5x5,
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple bingo cards displayed in a responsive grid layout.',
      },
    },
  },
  render: (args) => (
    <Box sx={{ width: '100%', maxWidth: '900px' }}>
      <BingoCardView {...args} />
    </Box>
  ),
};

export const UKFormat3x9: Story = {
  args: {
    data: singleCard3x9,
  },
  parameters: {
    docs: {
      description: {
        story: 'UK-style 3x9 bingo card with 90-number format.',
      },
    },
  },
};

export const SimpleFormat4x4: Story = {
  args: {
    data: singleCard4x4,
  },
  parameters: {
    docs: {
      description: {
        story: 'Simple 4x4 bingo card format.',
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    data: emptyCards,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no cards are available.',
      },
    },
  },
};

export const LoadingSkeleton: Story = {
  render: () => (
    <Box sx={{ width: '100%', maxWidth: '900px' }}>
      <BingoCardViewSkeleton count={3} />
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading skeleton while cards are being fetched.',
      },
    },
  },
};

export const WithNeonTheme: Story = {
  args: {
    data: singleCard5x5,
  },
  render: (args) => (
    <Box sx={{ p: 4, bgcolor: '#0a0a1a' }}>
      <BingoStyleProvider theme={neonTheme}>
        <BingoCardView {...args} />
      </BingoStyleProvider>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Neon-themed bingo card using the BingoStyleProvider.',
      },
    },
    backgrounds: { default: 'dark' },
  },
};

export const WithRetroTheme: Story = {
  args: {
    data: singleCard5x5,
  },
  render: (args) => (
    <Box sx={{ p: 4, bgcolor: '#d4c4a8' }}>
      <BingoStyleProvider theme={retroTheme}>
        <BingoCardView {...args} />
      </BingoStyleProvider>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Retro-themed bingo card with vintage styling.',
      },
    },
  },
};

export const WithOceanTheme: Story = {
  args: {
    data: singleCard5x5,
  },
  render: (args) => (
    <Box sx={{ p: 4, bgcolor: '#e8f4f8' }}>
      <BingoStyleProvider theme={oceanTheme}>
        <BingoCardView {...args} />
      </BingoStyleProvider>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Ocean-themed bingo card with water-inspired colors.',
      },
    },
  },
};

export const ThemeComparison: Story = {
  render: () => (
    <Stack spacing={4} sx={{ width: '100%', maxWidth: '1200px' }}>
      <Typography variant="h5" gutterBottom>
        Theme Comparison
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Default Theme
          </Typography>
          <BingoCardView data={singleCard5x5} />
        </Box>

        <Box sx={{ flex: 1, p: 2, bgcolor: '#0a0a1a', borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: '#00ffff' }}>
            Neon Theme
          </Typography>
          <BingoStyleProvider theme={neonTheme}>
            <BingoCardView data={singleCard5x5} />
          </BingoStyleProvider>
        </Box>

        <Box sx={{ flex: 1, p: 2, bgcolor: '#d4c4a8', borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: '#5d4037' }}>
            Retro Theme
          </Typography>
          <BingoStyleProvider theme={retroTheme}>
            <BingoCardView data={singleCard5x5} />
          </BingoStyleProvider>
        </Box>
      </Stack>
    </Stack>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Side-by-side comparison of different themes.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: function InteractiveDemoStory() {
    const [markedHistory, setMarkedHistory] = useState<string[]>([]);

    const handleCellMark = (
      cardId: string,
      cellIndex: number,
      marked: boolean
    ) => {
      const action = marked ? 'Marked' : 'Unmarked';
      setMarkedHistory((prev) => [
        `${action} cell ${cellIndex} on card ${cardId}`,
        ...prev.slice(0, 9),
      ]);
    };

    return (
      <Stack spacing={3} sx={{ width: '100%', maxWidth: '600px' }}>
        <Typography variant="h6">Interactive Demo</Typography>
        <Typography variant="body2" color="text.secondary">
          Click on cells to mark/unmark them. History is shown below.
        </Typography>

        <BingoCardView data={singleCard5x5} onCellMark={handleCellMark} />

        <Paper sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
          <Typography variant="subtitle2" gutterBottom>
            Mark History
          </Typography>
          {markedHistory.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No actions yet. Click on a cell to mark it.
            </Typography>
          ) : (
            <Stack spacing={0.5}>
              {markedHistory.map((entry, index) => (
                <Typography key={index} variant="body2">
                  {entry}
                </Typography>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing cell marking with event history.',
      },
    },
  },
};

export const MobileScrolling: Story = {
  args: {
    data: multipleCards5x5,
  },
  render: (args) => (
    <Box
      sx={{
        width: '375px',
        p: 2,
        bgcolor: 'grey.100',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Typography variant="subtitle2" gutterBottom>
        Mobile View (375px width)
      </Typography>
      <BingoCardView {...args} />
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Mobile viewport showing horizontal scrolling for multiple cards.',
      },
    },
  },
};

export const AccessibilityDemo: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: '600px' }}>
      <Typography variant="h6">Accessibility Features</Typography>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Keyboard Navigation
        </Typography>
        <Typography variant="body2" paragraph>
          • <strong>Tab</strong>: Navigate between cells
        </Typography>
        <Typography variant="body2" paragraph>
          • <strong>Enter / Space</strong>: Mark/unmark cell
        </Typography>
        <Typography variant="body2">
          • <strong>Free space</strong>: Skipped in tab order (always marked)
        </Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Screen Reader Support
        </Typography>
        <Typography variant="body2" paragraph>
          • Each cell announces its number and marked state
        </Typography>
        <Typography variant="body2" paragraph>
          • Free space is announced as "Free space"
        </Typography>
        <Typography variant="body2">
          • Card grid has role="grid" with proper ARIA labels
        </Typography>
      </Paper>

      <Typography variant="body2" color="text.secondary">
        Try navigating the card below with keyboard only:
      </Typography>

      <BingoCardView data={singleCard5x5} />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of accessibility features including keyboard navigation and screen reader support.',
      },
    },
  },
};

export const SingleCardComponent: Story = {
  render: () => {
    const card = generate5x5Card('standalone-card');
    const [markedCells, setMarkedCells] = useState<Set<number>>(new Set([12])); // Center is free

    const handleCellClick = (cellIndex: number) => {
      setMarkedCells((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(cellIndex)) {
          newSet.delete(cellIndex);
        } else {
          newSet.add(cellIndex);
        }
        return newSet;
      });
    };

    return (
      <Stack spacing={2}>
        <Typography variant="h6">Single BingoCard Component</Typography>
        <Typography variant="body2" color="text.secondary">
          The BingoCard component can be used standalone for custom layouts.
        </Typography>
        <BingoCard
          card={card}
          format={{ rows: 5, columns: 5 }}
          markedCells={markedCells}
          onCellClick={handleCellClick}
        />
      </Stack>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Using the BingoCard component directly for custom implementations.',
      },
    },
  },
};

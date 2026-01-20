import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { BingoCard } from './BingoCard';
import type {
  BingoCard as BingoCardData,
  BingoCardResponse,
  BingoCell,
} from './BingoCard.types';
import { BingoCardView } from './BingoCardView';
import { BingoStyleProvider } from './context';
import type { BingoCardStyleConfig } from './styles';

// ============================================
// MOCK DATA
// ============================================

/**
 * Fixed 5x5 card for predictable testing
 */
const testCard5x5: BingoCardData = {
  id: 'test-card-1',
  cells: [
    { value: 5, type: 'number' },
    { value: 18, type: 'number' },
    { value: 31, type: 'number' },
    { value: 49, type: 'number' },
    { value: 62, type: 'number' },
    { value: 10, type: 'number' },
    { value: 22, type: 'number' },
    { value: 35, type: 'number' },
    { value: 55, type: 'number' },
    { value: 70, type: 'number' },
    { value: 3, type: 'number' },
    { value: 27, type: 'number' },
    { value: null, type: 'free' }, // Center free space (index 12)
    { value: 46, type: 'number' },
    { value: 65, type: 'number' },
    { value: 12, type: 'number' },
    { value: 16, type: 'number' },
    { value: 42, type: 'number' },
    { value: 51, type: 'number' },
    { value: 73, type: 'number' },
    { value: 7, type: 'number' },
    { value: 29, type: 'number' },
    { value: 38, type: 'number' },
    { value: 59, type: 'number' },
    { value: 68, type: 'number' },
  ],
};

const testData5x5: BingoCardResponse = {
  cards: [testCard5x5],
  format: '5x5',
};

const testDataMultiple: BingoCardResponse = {
  cards: [
    testCard5x5,
    {
      id: 'test-card-2',
      cells: testCard5x5.cells.map((cell) => ({
        ...cell,
        value: cell.type === 'free' ? null : (cell.value ?? 0) + 1,
      })),
    },
  ],
  format: '5x5',
};

const testData3x9: BingoCardResponse = {
  cards: [
    {
      id: 'test-card-3x9',
      cells: Array.from({ length: 27 }, (_, i) => ({
        value: i % 3 === 0 ? null : i + 1,
        type: i % 3 === 0 ? 'free' : 'number',
      })) as BingoCell[],
    },
  ],
  format: '3x9',
};

const emptyData: BingoCardResponse = {
  cards: [],
  format: '5x5',
};

const neonTheme: BingoCardStyleConfig = {
  id: 'neon-test',
  name: 'Neon Test',
  card: {
    background: '#1a1a2e',
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

// ============================================
// STORYBOOK META
// ============================================

const meta: Meta<typeof BingoCardView> = {
  title: 'DataDisplay/BingoCard/Tests',
  component: BingoCardView,
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: false },
  },
  tags: ['autodocs', 'test', 'component:BingoCard'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// INTERACTION TESTS
// ============================================

export const CellMarkingTest: Story = {
  name: '🧪 Cell Marking Test',
  args: {
    data: testData5x5,
    onCellMark: fn(),
  },
  play: async ({ canvasElement, step, args }) => {
    const canvas = within(canvasElement);

    await step('Verify initial card render', async () => {
      const card = canvas.getByTestId('bingo-card-test-card-1');
      await expect(card).toBeInTheDocument();
    });

    await step('Verify all cells are rendered', async () => {
      // 25 cells in a 5x5 grid
      const cells = canvas.getAllByRole('button');
      // 24 clickable cells (excluding free space which has tabIndex -1)
      // Free space is also rendered with role button but not focusable
      await expect(cells.length).toBeGreaterThanOrEqual(24);
    });

    await step('Click a number cell to mark it', async () => {
      const cell = canvas.getByTestId('bingo-cell-test-card-1-0');
      await expect(cell).toHaveAttribute('data-marked', 'false');

      await userEvent.click(cell);

      await expect(cell).toHaveAttribute('data-marked', 'true');
      await expect(args.onCellMark).toHaveBeenCalledWith('test-card-1', 0, true);
    });

    await step('Click the same cell to unmark it', async () => {
      const cell = canvas.getByTestId('bingo-cell-test-card-1-0');
      await userEvent.click(cell);

      await expect(cell).toHaveAttribute('data-marked', 'false');
      await expect(args.onCellMark).toHaveBeenCalledWith('test-card-1', 0, false);
    });

    await step('Free space should always be marked', async () => {
      const freeSpaceCell = canvas.getByTestId('bingo-cell-test-card-1-12-free');
      await expect(freeSpaceCell).toHaveAttribute('data-marked', 'true');
      await expect(freeSpaceCell).toHaveAttribute('data-cell-type', 'free');
    });

    await step('Clicking free space should not trigger callback', async () => {
      const freeSpaceCell = canvas.getByTestId('bingo-cell-test-card-1-12-free');
      const callCountBefore = (args.onCellMark as ReturnType<typeof fn>).mock.calls.length;

      await userEvent.click(freeSpaceCell);

      const callCountAfter = (args.onCellMark as ReturnType<typeof fn>).mock.calls.length;
      await expect(callCountAfter).toBe(callCountBefore);
    });
  },
};

export const KeyboardNavigationTest: Story = {
  name: '⌨️ Keyboard Navigation Test',
  args: {
    data: testData5x5,
    onCellMark: fn(),
  },
  play: async ({ canvasElement, step, args }) => {
    const canvas = within(canvasElement);

    await step('Tab to first focusable cell', async () => {
      await userEvent.tab();
      const firstCell = canvas.getByTestId('bingo-cell-test-card-1-0');
      await expect(firstCell).toHaveFocus();
    });

    await step('Press Enter to mark cell', async () => {
      const firstCell = canvas.getByTestId('bingo-cell-test-card-1-0');
      await userEvent.keyboard('{Enter}');

      await expect(firstCell).toHaveAttribute('data-marked', 'true');
      await expect(args.onCellMark).toHaveBeenCalledWith('test-card-1', 0, true);
    });

    await step('Press Space to unmark cell', async () => {
      const firstCell = canvas.getByTestId('bingo-cell-test-card-1-0');
      await userEvent.keyboard(' ');

      await expect(firstCell).toHaveAttribute('data-marked', 'false');
    });

    await step('Tab through cells (skipping free space)', async () => {
      // Tab multiple times to reach cells around free space
      for (let i = 0; i < 12; i++) {
        await userEvent.tab();
      }
      // Should skip free space (index 12) and land on next cell
      const focusedElement = document.activeElement;
      await expect(focusedElement).not.toHaveAttribute('data-cell-type', 'free');
    });
  },
};

export const FreeSpaceDisplayTest: Story = {
  name: '⭐ Free Space Display Test',
  args: {
    data: testData5x5,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Free space shows correct label', async () => {
      const freeSpaceCell = canvas.getByTestId('bingo-cell-test-card-1-12-free');
      await expect(freeSpaceCell).toHaveTextContent('FREE');
    });

    await step('Free space has correct aria-label', async () => {
      const freeSpaceCell = canvas.getByTestId('bingo-cell-test-card-1-12-free');
      await expect(freeSpaceCell).toHaveAttribute('aria-label', 'Free space, always marked');
    });

    await step('Free space is not focusable', async () => {
      const freeSpaceCell = canvas.getByTestId('bingo-cell-test-card-1-12-free');
      await expect(freeSpaceCell).toHaveAttribute('tabIndex', '-1');
    });
  },
};

export const CustomThemeTest: Story = {
  name: '🎨 Custom Theme Test',
  render: (args) => (
    <Box sx={{ p: 2, bgcolor: '#0a0a1a' }}>
      <BingoStyleProvider theme={neonTheme}>
        <BingoCardView {...args} />
      </BingoStyleProvider>
    </Box>
  ),
  args: {
    data: testData5x5,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Card renders with custom theme', async () => {
      const card = canvas.getByTestId('bingo-card-test-card-1');
      await expect(card).toBeInTheDocument();
    });

    await step('Free space shows custom label', async () => {
      const freeSpaceCell = canvas.getByTestId('bingo-cell-test-card-1-12-free');
      await expect(freeSpaceCell).toHaveTextContent('⭐');
    });

    await step('Cells have custom styling applied', async () => {
      const cell = canvas.getByTestId('bingo-cell-test-card-1-0');
      const styles = window.getComputedStyle(cell);
      // Check that custom border color is applied (cyan)
      await expect(styles.borderColor).toBe('rgb(0, 255, 255)');
    });
  },
};

export const EmptyStateTest: Story = {
  name: '📭 Empty State Test',
  args: {
    data: emptyData,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Empty state message is displayed', async () => {
      const emptyMessage = canvas.getByText('No Bingo Cards Available');
      await expect(emptyMessage).toBeInTheDocument();
    });

    await step('Empty state container has correct testid', async () => {
      const emptyContainer = canvas.getByTestId('bingo-card-view-empty');
      await expect(emptyContainer).toBeInTheDocument();
    });

    await step('Secondary text is shown', async () => {
      const secondaryText = canvas.getByText(
        'There are no bingo cards to display at this time.'
      );
      await expect(secondaryText).toBeInTheDocument();
    });
  },
};

export const MultipleCardsTest: Story = {
  name: '🃏 Multiple Cards Test',
  args: {
    data: testDataMultiple,
    onCellMark: fn(),
  },
  play: async ({ canvasElement, step, args }) => {
    const canvas = within(canvasElement);

    await step('Both cards are rendered', async () => {
      const card1 = canvas.getByTestId('bingo-card-test-card-1');
      const card2 = canvas.getByTestId('bingo-card-test-card-2');
      await expect(card1).toBeInTheDocument();
      await expect(card2).toBeInTheDocument();
    });

    await step('Marking cell on card 1 does not affect card 2', async () => {
      const card1Cell = canvas.getByTestId('bingo-cell-test-card-1-0');
      const card2Cell = canvas.getByTestId('bingo-cell-test-card-2-0');

      await userEvent.click(card1Cell);

      await expect(card1Cell).toHaveAttribute('data-marked', 'true');
      await expect(card2Cell).toHaveAttribute('data-marked', 'false');
    });

    await step('Callback includes correct card ID', async () => {
      const card2Cell = canvas.getByTestId('bingo-cell-test-card-2-5');
      await userEvent.click(card2Cell);

      await expect(args.onCellMark).toHaveBeenCalledWith('test-card-2', 5, true);
    });
  },
};

export const DifferentFormatTest: Story = {
  name: '📐 Different Format (3x9) Test',
  args: {
    data: testData3x9,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('3x9 card renders correctly', async () => {
      const card = canvas.getByTestId('bingo-card-test-card-3x9');
      await expect(card).toBeInTheDocument();
    });

    await step('Correct number of cells rendered', async () => {
      // 27 cells for 3x9 grid
      const allCells = canvasElement.querySelectorAll('[data-cell-index]');
      await expect(allCells.length).toBe(27);
    });

    await step('Grid has correct structure', async () => {
      const card = canvas.getByTestId('bingo-card-test-card-3x9');
      const styles = window.getComputedStyle(card);
      // Should have 9 columns
      await expect(styles.gridTemplateColumns).toContain('repeat(9');
    });
  },
};

export const AriaAttributesTest: Story = {
  name: '♿ ARIA Attributes Test',
  args: {
    data: testData5x5,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Card has role="grid"', async () => {
      const card = canvas.getByRole('grid');
      await expect(card).toBeInTheDocument();
    });

    await step('Card has aria-label', async () => {
      const card = canvas.getByRole('grid');
      await expect(card).toHaveAttribute('aria-label', 'Bingo card test-card-1');
    });

    await step('Cells have role="button"', async () => {
      const buttons = canvas.getAllByRole('button');
      await expect(buttons.length).toBeGreaterThan(0);
    });

    await step('Number cells have correct aria-label', async () => {
      const cell = canvas.getByTestId('bingo-cell-test-card-1-0');
      await expect(cell).toHaveAttribute(
        'aria-label',
        'Number 5, not marked'
      );
    });

    await step('Marked cells update aria-pressed', async () => {
      const cell = canvas.getByTestId('bingo-cell-test-card-1-0');
      await expect(cell).toHaveAttribute('aria-pressed', 'false');

      await userEvent.click(cell);

      await expect(cell).toHaveAttribute('aria-pressed', 'true');
    });

    await step('Container has region role', async () => {
      const container = canvas.getByRole('region');
      await expect(container).toHaveAttribute('aria-label', 'Bingo cards');
    });
  },
};

export const SingleCardComponentTest: Story = {
  name: '🎯 Single Card Component Test',
  render: () => {
    const [markedCells, setMarkedCells] = React.useState<Set<number>>(
      new Set([12])
    );

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
      <BingoCard
        card={testCard5x5}
        format={{ rows: 5, columns: 5 }}
        markedCells={markedCells}
        onCellClick={handleCellClick}
        data-testid="standalone-card"
      />
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Standalone card renders', async () => {
      const card = canvas.getByTestId('standalone-card');
      await expect(card).toBeInTheDocument();
    });

    await step('Pre-marked cells are displayed correctly', async () => {
      // Center cell (index 12) should be marked (free space)
      const freeSpace = canvasElement.querySelector('[data-cell-index="12"]');
      await expect(freeSpace).toHaveAttribute('data-marked', 'true');
    });

    await step('Cell marking works on standalone component', async () => {
      const cell = canvasElement.querySelector('[data-cell-index="0"]');
      await expect(cell).toHaveAttribute('data-marked', 'false');

      if (cell) {
        await userEvent.click(cell);
        await expect(cell).toHaveAttribute('data-marked', 'true');
      }
    });
  },
};

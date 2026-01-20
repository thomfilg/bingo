# BingoCard Component

A complete bingo card system with support for multiple card formats, interactive number marking, and customizable themes via React Context.

## Features

- **Multiple Card Formats**: Support for 5x5 (American), 3x9 (UK), and custom formats
- **Interactive Marking**: Click to mark/unmark cells with visual feedback
- **Theme System**: Premium styling via Context/Provider pattern
- **Responsive Design**: Mobile-first with horizontal scrolling, desktop grid layout
- **Full Accessibility**: Keyboard navigation, ARIA attributes, screen reader support
- **Loading States**: Built-in skeleton component for loading states
- **Empty State**: Graceful handling when no cards are available

## Installation

The component is part of the UI library and can be imported directly:

```tsx
import {
  BingoCardView,
  BingoStyleProvider
} from '@repo/ui/data-display/BingoCard';
```

## Usage

### Basic Usage

```tsx
import { BingoCardView } from '@repo/ui/data-display/BingoCard';

function MyBingoGame() {
  const handleCellMark = (cardId, cellIndex, marked) => {
    console.log(`Card ${cardId}, cell ${cellIndex}: ${marked ? 'marked' : 'unmarked'}`);
  };

  return (
    <BingoCardView
      data={backendResponse}
      onCellMark={handleCellMark}
    />
  );
}
```

### With Custom Theme

```tsx
import { BingoCardView, BingoStyleProvider } from '@repo/ui/data-display/BingoCard';
import type { BingoCardStyleConfig } from '@repo/ui/data-display/BingoCard';

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

function PremiumBingoGame() {
  return (
    <BingoStyleProvider theme={neonTheme}>
      <BingoCardView data={backendResponse} />
    </BingoStyleProvider>
  );
}
```

### Single Card Component

For custom layouts, you can use the `BingoCard` component directly:

```tsx
import { BingoCard } from '@repo/ui/data-display/BingoCard';

function CustomLayout() {
  const [markedCells, setMarkedCells] = useState(new Set([12])); // Center free space

  const handleCellClick = (cellIndex) => {
    setMarkedCells(prev => {
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
      card={cardData}
      format={{ rows: 5, columns: 5 }}
      markedCells={markedCells}
      onCellClick={handleCellClick}
    />
  );
}
```

### Loading State

```tsx
import { BingoCardViewSkeleton } from '@repo/ui/data-display/BingoCard';

function LoadingState() {
  return <BingoCardViewSkeleton count={3} />;
}
```

## API Reference

### BingoCardView

The main container component for rendering multiple bingo cards.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `BingoCardResponse` | Required | Backend response containing cards and format |
| `onCellMark` | `(cardId: string, cellIndex: number, marked: boolean) => void` | - | Callback when a cell is marked/unmarked |
| `data-testid` | `string` | `'bingo-card-view'` | Test ID for testing |

### BingoCard

Single card component for custom layouts.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `card` | `BingoCard` | Required | Card data from backend |
| `format` | `BingoFormat` | Required | Parsed format dimensions |
| `markedCells` | `Set<number>` | `new Set()` | Set of marked cell indices |
| `onCellClick` | `(cellIndex: number) => void` | - | Click handler for cells |
| `data-testid` | `string` | `'bingo-card-{id}'` | Test ID for testing |

### BingoStyleProvider

Context provider for custom themes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `BingoCardStyleConfig` | `defaultStyle` | Custom theme configuration |
| `children` | `ReactNode` | Required | Child components |

### BingoCardStyleConfig

Configuration interface for custom themes.

```typescript
interface BingoCardStyleConfig {
  id: string;
  name: string;
  card: {
    background: string;
    borderRadius: string;
    shadow: string;
    gap: string;
  };
  cell: {
    background: string;
    backgroundMarked: string;
    borderColor: string;
    borderRadius: string;
    textColor: string;
    textColorMarked: string;
    fontSize: string;
    fontWeight: string;
  };
  freeSpace: {
    background: string;
    textColor: string;
    label: string;
  };
}
```

## Data Contract

### BingoCardResponse (Backend)

```typescript
interface BingoCardResponse {
  cards: BingoCard[];
  format: string; // e.g., '5x5', '3x9'
}

interface BingoCard {
  id: string;
  cells: BingoCell[];
}

interface BingoCell {
  value: number | null;
  type: 'number' | 'free';
}
```

## Accessibility

The component follows WCAG 2.1 guidelines:

- **Keyboard Navigation**:
  - `Tab` - Navigate between cells
  - `Enter` / `Space` - Mark/unmark cell
  - Free space is skipped in tab order

- **ARIA Attributes**:
  - `role="grid"` on card container
  - `role="button"` on cells
  - `aria-pressed` for marked state
  - `aria-label` for screen reader announcements

- **Focus Management**:
  - Visible focus indicator on keyboard navigation
  - Free space is not focusable (always marked)

## Test IDs

| Element | Test ID Pattern |
|---------|-----------------|
| View container | `bingo-card-view` |
| Single card | `bingo-card-{cardId}` |
| Cell | `bingo-cell-{cardId}-{index}` |
| Free space | `bingo-cell-{cardId}-{index}-free` |
| Marked cell | Attribute: `data-marked="true"` |
| Empty state | `bingo-card-view-empty` |
| Skeleton | `bingo-card-view-skeleton` |

## Utilities

### parseFormat

Parses format strings from the backend.

```typescript
import { parseFormat } from '@repo/ui/data-display/BingoCard';

const format = parseFormat('5x5'); // { rows: 5, columns: 5 }
const ukFormat = parseFormat('3x9'); // { rows: 3, columns: 9 }
```

### useBingoStyle

Hook to access the current style configuration (for custom components).

```typescript
import { useBingoStyle } from '@repo/ui/data-display/BingoCard';

function CustomCell() {
  const { style } = useBingoStyle();
  return <div style={{ background: style.cell.background }}>...</div>;
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

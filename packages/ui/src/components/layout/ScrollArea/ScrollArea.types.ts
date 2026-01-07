import { BoxProps } from '@mui/material';
import { ReactNode } from 'react';

export type ScrollOrientation = 'vertical' | 'horizontal' | 'both';
export type ScrollbarSize = 'thin' | 'medium' | 'thick';
export type ScrollAreaVariant = 'default' | 'overlay' | 'glass';

export interface ScrollAreaProps extends Omit<BoxProps, 'ref'> {
  /** Content to be rendered inside the scrollable area */
  children: ReactNode;

  /** Width of the scroll area container */
  width?: number | string;

  /** Height of the scroll area container */
  height?: number | string;

  /** Maximum height before scrolling is enabled */
  maxHeight?: number | string;

  /** Maximum width before scrolling is enabled */
  maxWidth?: number | string;

  /** Scroll orientation */
  orientation?: ScrollOrientation;

  /** Size of the scrollbar */
  scrollbarSize?: ScrollbarSize;

  /** Whether scrollbars auto-hide when not in use */
  autoHide?: boolean;

  /** Auto-hide delay in milliseconds */
  autoHideDelay?: number;

  /** Enable smooth scrolling behavior */
  smoothScroll?: boolean;

  /** Visual variant of the scroll area */
  variant?: ScrollAreaVariant;

  /** Scroll event handler */
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;

  /** Show scroll-to-top button */
  scrollToTopButton?: boolean;

  /** Threshold for showing scroll-to-top button (in pixels) */
  scrollToTopThreshold?: number;

  /** Custom scrollbar color */
  scrollbarColor?: string;

  /** Custom scrollbar track color */
  scrollbarTrackColor?: string;

  /** Padding for scroll content */
  contentPadding?: number | string;

  /** Always show scrollbars */
  alwaysShowScrollbar?: boolean;

  /** Disable scrolling */
  disabled?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Empty state content */
  emptyContent?: ReactNode;

  /** Test ID for testing */
  testId?: string;
}

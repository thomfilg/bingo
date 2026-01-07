import { ReactNode } from 'react';

export type ResizableVariant = 'horizontal' | 'vertical' | 'both';
export type ResizeHandle =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'topRight'
  | 'bottomRight'
  | 'bottomLeft'
  | 'topLeft';

export interface ResizableProps {
  children: ReactNode;
  variant?: ResizableVariant;
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  onResize?: (width: number, height: number) => void;
  disabled?: boolean;
  handles?: ResizeHandle[];
  className?: string;
  'data-testid'?: string;
}

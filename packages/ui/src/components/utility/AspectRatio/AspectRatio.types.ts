import { ReactNode } from 'react';
import { BoxProps } from '@mui/material';

export type AspectRatioVariant = '16:9' | '4:3' | '1:1' | '3:2' | '21:9' | 'custom';

export interface AspectRatioProps extends Omit<BoxProps, 'children'> {
  children: ReactNode;
  variant?: AspectRatioVariant;
  ratio?: number; // For custom ratios (width / height)
  maxWidth?: number | string;
  maxHeight?: number | string;
}
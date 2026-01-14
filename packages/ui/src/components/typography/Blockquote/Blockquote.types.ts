import type React from 'react';

export type BlockquoteVariant = 'default' | 'bordered' | 'citation';

export interface BlockquoteProps extends React.HTMLAttributes<HTMLElement> {
  variant?: BlockquoteVariant;
  author?: string;
  source?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  children: React.ReactNode;
}
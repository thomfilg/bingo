import React from 'react';

export type CodeVariant = 'inline' | 'block' | 'highlight';

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  variant?: CodeVariant;
  language?: string;
  copyable?: boolean;
  lineNumbers?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
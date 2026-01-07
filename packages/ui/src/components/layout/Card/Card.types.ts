import { CardProps as MuiCardProps } from '@mui/material';
import { ReactNode } from 'react';

export type CardVariant = 'elevated' | 'outlined' | 'glass' | 'gradient' | 'neumorphic';
export type CardEntranceAnimation = 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom' | 'grow' | 'none';

export interface CardProps extends Omit<MuiCardProps, 'variant'> {
  children: ReactNode;
  variant?: CardVariant;
  interactive?: boolean;
  glow?: boolean;
  pulse?: boolean;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  loading?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onExpandToggle?: (expanded: boolean) => void;
  entranceAnimation?: CardEntranceAnimation;
  animationDelay?: number;
  skeleton?: boolean;
  hoverScale?: number;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onFocus?: React.FocusEventHandler<HTMLDivElement>;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
}

export interface CardHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  avatar?: ReactNode;
  children?: ReactNode;
}

export interface CardContentProps {
  children: ReactNode;
  dense?: boolean;
}

export interface CardActionsProps {
  children: ReactNode;
  disableSpacing?: boolean;
  alignment?: 'left' | 'center' | 'right' | 'space-between';
}

export interface CardMediaProps {
  component?: React.ElementType;
  image?: string;
  title?: string;
  height?: number | string;
  children?: ReactNode;
}
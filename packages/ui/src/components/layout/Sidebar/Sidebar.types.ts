import { ReactNode, HTMLAttributes } from 'react';

export type SidebarVariant = 'fixed' | 'collapsible' | 'floating' | 'glass';

export interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: SidebarVariant;
  open?: boolean;
  onToggle?: () => void;
  width?: number;
  collapsedWidth?: number;
  position?: 'left' | 'right';
  className?: string;
}

export interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface SidebarContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface SidebarFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

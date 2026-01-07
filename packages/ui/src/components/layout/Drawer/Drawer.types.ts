import { ReactNode, HTMLAttributes } from 'react';

export type DrawerVariant = 'left' | 'right' | 'top' | 'bottom' | 'glass';
export type DrawerAnchor = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  variant?: DrawerVariant;
  anchor?: DrawerAnchor;
  width?: number | string;
  height?: number | string;
  persistent?: boolean;
  temporary?: boolean;
  backdrop?: boolean;
  hideBackdrop?: boolean;
  keepMounted?: boolean;
  className?: string;
}

export interface DrawerHeaderProps {
  children: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export interface DrawerContentProps {
  children: ReactNode;
  padding?: boolean;
}

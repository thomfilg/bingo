import { ReactNode } from 'react';

export type ChipVariant = 'filled' | 'outlined';
export type ChipSize = 'small' | 'medium';

export interface ChipProps {
  /** Text content displayed in the chip */
  label: string;
  
  /** Visual style variant */
  variant?: ChipVariant;
  
  /** Size of the chip */
  size?: ChipSize;
  
  /** Theme color token */
  color?: string;
  
  /** Source URL for avatar image */
  avatarSrc?: string;
  
  /** Custom avatar React node (overrides avatarSrc) */
  avatar?: ReactNode;
  
  /** Leading icon React node */
  icon?: ReactNode;
  
  /** Current selection state */
  selected?: boolean;
  
  /** Enables selection toggle capability */
  selectable?: boolean;
  
  /** Shows delete button */
  deletable?: boolean;
  
  /** Disables all interactions */
  disabled?: boolean;
  
  /** Click/selection handler */
  onClick?: () => void;
  
  /** Delete action handler */
  onDelete?: () => void;
  
  /** Additional CSS classes */
  className?: string;
}
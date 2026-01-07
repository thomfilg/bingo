import { ButtonProps as MuiButtonProps } from '@mui/material';
import * as React from 'react';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'color' | 'size'> {
  /**
   * The variant of the button
   */
  variant?: 'solid' | 'outline' | 'ghost' | 'glass' | 'gradient';
  
  /**
   * The color of the button
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  
  /**
   * The size of the button
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Whether the button is in loading state
   */
  loading?: boolean;
  
  /**
   * Icon to display in the button
   */
  icon?: React.ReactNode;
  
  /**
   * Whether the button should have a glow effect
   */
  glow?: boolean;
  
  /**
   * Whether the button should have a pulse animation
   */
  pulse?: boolean;
  
  /**
   * Whether to show ripple effect on click
   */
  ripple?: boolean;
  
  /**
   * Click handler
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  
  /**
   * Focus handler
   */
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  
  /**
   * Blur handler
   */
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
}
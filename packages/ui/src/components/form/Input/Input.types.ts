import React, { InputHTMLAttributes, ReactNode } from 'react';

export type InputVariant = 'outlined' | 'filled' | 'glass' | 'underline' | 'gradient';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: boolean;
  helperText?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  fullWidth?: boolean;
  floating?: boolean;
  glow?: boolean;
  pulse?: boolean;
  loading?: boolean;
  onClick?: React.MouseEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  'data-testid'?: string;
}

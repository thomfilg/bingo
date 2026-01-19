import type { SelectProps as MuiSelectProps } from '@mui/material';

export type SelectVariant = 'default' | 'glass' | 'gradient';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<MuiSelectProps, 'variant'> {
  /**
   * Visual variant of the select component
   * @default 'default'
   */
  variant?: SelectVariant;
  /**
   * Array of options to display in the select
   */
  options: SelectOption[];
  /**
   * Label for the select field
   */
  label?: string;
  /**
   * Helper text to display below the select
   */
  helperText?: string;
  /**
   * Whether the select should take full width
   * @default true
   */
  fullWidth?: boolean;
  /**
   * Size of the select component
   * @default 'medium'
   */
  size?: 'small' | 'medium';
  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string;
  /**
   * Whether to show a glow effect
   * @default false
   */
  glow?: boolean;
  /**
   * Whether to show a pulse animation
   * @default false
   */
  pulse?: boolean;
  /**
   * Test ID for testing purposes
   */
  'data-testid'?: string;
}

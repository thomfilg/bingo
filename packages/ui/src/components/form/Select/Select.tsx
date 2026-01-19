import {
  alpha,
  FormControl,
  FormHelperText,
  InputLabel,
  keyframes,
  MenuItem,
  Select as MuiSelect,
  styled,
} from '@mui/material';
import React from 'react';

import type { SelectProps } from './Select.types';

// Define pulse animation
const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 1;
  }
  70% {
    box-shadow: 0 0 0 10px currentColor;
    opacity: 0;
  }
  100% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 0;
  }
`;

const StyledFormControl = styled(FormControl, {
  shouldForwardProp: (prop) => prop !== 'customVariant' && prop !== 'glow' && prop !== 'pulse',
})<{
  customVariant?: SelectProps['variant'];
  glow?: boolean;
  pulse?: boolean;
}>(({ theme, customVariant, glow, pulse }) => ({
  position: 'relative',

  // Glow effect
  ...(glow && {
    '& .MuiOutlinedInput-root': {
      boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`,
      '&.Mui-focused': {
        boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`,
      },
    },
  }),

  // Pulse animation
  ...(pulse && {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '0',
      right: '0',
      height: '56px',
      transform: 'translateY(-50%)',
      borderRadius: theme.spacing(0.5),
      backgroundColor: theme.palette.primary.main,
      opacity: 0.3,
      animation: `${pulseAnimation} 2s infinite`,
      pointerEvents: 'none',
      zIndex: -1,
    },
  }),

  '& .MuiOutlinedInput-root': {
    transition: 'all 0.3s ease',

    // Glass variant
    ...(customVariant === 'glass' && {
      backgroundColor: alpha(theme.palette.background.paper, 0.1),
      backdropFilter: 'blur(20px)',
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      '& fieldset': {
        border: 'none',
      },
      '&:hover': {
        backgroundColor: alpha(theme.palette.background.paper, 0.15),
        borderColor: alpha(theme.palette.primary.main, 0.3),
      },
      '&.Mui-focused': {
        backgroundColor: alpha(theme.palette.background.paper, 0.2),
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
      },
    }),

    // Gradient variant
    ...(customVariant === 'gradient' && {
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
      border: `2px solid transparent`,
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      position: 'relative',
      '& fieldset': {
        border: 'none',
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 'inherit',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
        padding: '2px',
        zIndex: -1,
      },
      '&:hover': {
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.secondary.main, 0.15)})`,
      },
      '&.Mui-focused': {
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
        '&::before': {
          background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
        },
      },
    }),

    // Default styles
    ...((customVariant === 'default' || !customVariant) && {
      '& fieldset': {
        borderColor: alpha(theme.palette.divider, 0.23),
      },
      '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      },
      '&.Mui-error fieldset': {
        borderColor: theme.palette.error.main,
      },
    }),
  },
}));

const StyledSelect = styled(MuiSelect)(({ theme }) => ({
  '& .MuiSelect-select': {
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
  },
}));

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      variant = 'default',
      options,
      label,
      helperText,
      fullWidth = true,
      size = 'medium',
      error,
      placeholder,
      glow = false,
      pulse = false,
      'data-testid': dataTestId,
      value,
      ...props
    },
    ref,
  ) => {
    const labelId = React.useId();
    const helperTextId = React.useId();
    const selectId = React.useId();

    // Filter out custom props that shouldn't be passed to MUI components
    const muiSelectProps = props;

    // Ensure value is properly handled for MUI Select
    const selectValue = value !== undefined ? value : '';

    return (
      <StyledFormControl
        fullWidth={fullWidth}
        size={size}
        error={error}
        customVariant={variant}
        glow={glow}
        pulse={pulse}
        ref={ref}
        data-testid={dataTestId}
      >
        {label && (
          <InputLabel id={labelId} htmlFor={selectId}>
            {label}
          </InputLabel>
        )}
        <StyledSelect
          id={selectId}
          labelId={label ? labelId : undefined}
          label={label}
          displayEmpty={!!placeholder}
          aria-describedby={helperText ? helperTextId : undefined}
          data-testid={dataTestId ? `${dataTestId}-select` : 'select'}
          value={selectValue}
          {...muiSelectProps}
        >
          {placeholder && (
            <MenuItem value="" disabled>
              {placeholder}
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              data-testid={
                dataTestId ? `${dataTestId}-option-${option.value}` : `option-${option.value}`
              }
            >
              {option.label}
            </MenuItem>
          ))}
        </StyledSelect>
        {helperText && (
          <FormHelperText id={helperTextId} error={error}>
            {helperText}
          </FormHelperText>
        )}
      </StyledFormControl>
    );
  },
);

Select.displayName = 'Select';

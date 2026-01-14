import {
  alpha,
  CircularProgress,
  InputAdornment,
  keyframes,
  styled,
  TextField,
} from '@mui/material';
import React from 'react';

import type { InputProps } from './Input.types';

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

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) =>
    !['customVariant', 'floating', 'glow', 'pulse', 'loading'].includes(prop as string),
})<{
  customVariant?: InputProps['variant'];
  floating?: boolean;
  glow?: boolean;
  pulse?: boolean;
  loading?: boolean;
}>(({ theme, customVariant, floating, glow, pulse, loading }) => ({
  position: 'relative',
  opacity: loading ? 0.7 : 1,

  // Glow effect
  ...(glow && {
    '& .MuiInputBase-root': {
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

  '& .MuiInputBase-root': {
    transition: 'all 0.3s ease',

    ...(customVariant === 'glass' && {
      backgroundColor: alpha(theme.palette.background.paper, 0.1),
      backdropFilter: 'blur(20px)',
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
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

    ...(customVariant === 'underline' && {
      '&:before': {
        borderBottomColor: alpha(theme.palette.divider, 0.42),
      },
      '&:hover:not(.Mui-disabled):before': {
        borderBottomColor: theme.palette.primary.main,
      },
      '&:after': {
        borderBottomColor: theme.palette.primary.main,
      },
    }),

    ...(customVariant === 'gradient' && {
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
      border: `2px solid transparent`,
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      position: 'relative',
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
  },

  ...(floating && {
    '& .MuiInputLabel-root': {
      transform: 'translate(14px, 16px) scale(1)',
      '&.MuiInputLabel-shrink': {
        transform: 'translate(14px, -9px) scale(0.75)',
        backgroundColor: theme.palette.background.paper,
        padding: '0 4px',
      },
    },
  }),

  '& .MuiOutlinedInput-root': {
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
  },

  '& .MuiFilledInput-root': {
    backgroundColor: alpha(theme.palette.action.hover, 0.04),
    '&:hover': {
      backgroundColor: alpha(theme.palette.action.hover, 0.08),
    },
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.action.hover, 0.12),
    },
  },
}));

const sizeMap = {
  sm: { size: 'small' as const },
  md: { size: 'medium' as const },
  lg: { size: 'medium' as const, sx: { '& .MuiInputBase-input': { padding: '16px 14px' } } },
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'outlined',
      size = 'md',
      label,
      error,
      helperText,
      startAdornment,
      endAdornment,
      fullWidth = true,
      floating = false,
      glow = false,
      pulse = false,
      loading = false,
      onClick,
      onFocus,
      onBlur,
      'data-testid': dataTestId,
      ...props
    },
    ref,
  ) => {
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(e);
    };

    const muiVariant =
      variant === 'glass'
        ? 'outlined'
        : variant === 'underline'
          ? 'standard'
          : variant === 'gradient'
            ? 'outlined'
            : variant;

    const sizeProps = sizeMap[size];

    return (
      <StyledTextField
        ref={ref}
        variant={muiVariant as 'outlined' | 'filled' | 'standard'}
        customVariant={variant}
        floating={floating}
        glow={glow}
        pulse={pulse}
        loading={loading}
        label={label}
        error={error}
        helperText={helperText}
        fullWidth={fullWidth}
        disabled={loading || props.disabled}
        onClick={!loading ? onClick : undefined}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputProps={{
          'data-testid': dataTestId,
        }}
        InputProps={{
          startAdornment: startAdornment && (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ),
          endAdornment: (
            <>
              {loading && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              )}
              {!loading && endAdornment && (
                <InputAdornment position="end">{endAdornment}</InputAdornment>
              )}
            </>
          ),
        }}
        {...sizeProps}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

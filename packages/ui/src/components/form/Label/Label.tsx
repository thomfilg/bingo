import React, { forwardRef } from 'react';
import {
  Tooltip,
  Box,
  CircularProgress,
  useTheme,
  alpha,
  Typography,
} from '@mui/material';

import { LabelProps } from './Label.types';

export const Label = forwardRef<globalThis.HTMLLabelElement, LabelProps>(({
  children,
  htmlFor,
  required = false,
  disabled = false,
  error = false,
  variant = 'default',
  size = 'md',
  color = 'default',
  glow = false,
  pulse = false,
  ripple = false,
  loading = false,
  className,
  style,
  tooltip,
  helperText,
  asteriskPlacement = 'end',
  icon,
  iconPosition = 'start',
  onClick,
  onFocus,
  onBlur,
  srOnly = false,
  weight = 'regular',
  transform = 'none',
  align = 'left',
  nowrap = false,
  truncate = false,
  ...props
}, ref) => {
  const theme = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return {
          fontSize: '0.75rem',
          lineHeight: 1.2,
          padding: theme.spacing(0.25, 0.5),
        };
      case 'sm':
        return {
          fontSize: '0.875rem',
          lineHeight: 1.3,
          padding: theme.spacing(0.5, 0.75),
        };
      case 'md':
        return {
          fontSize: '1rem',
          lineHeight: 1.5,
          padding: theme.spacing(0.75, 1),
        };
      case 'lg':
        return {
          fontSize: '1.125rem',
          lineHeight: 1.6,
          padding: theme.spacing(1, 1.25),
        };
      case 'xl':
        return {
          fontSize: '1.25rem',
          lineHeight: 1.7,
          padding: theme.spacing(1.25, 1.5),
        };
      default:
        return {
          fontSize: '1rem',
          lineHeight: 1.5,
          padding: theme.spacing(0.75, 1),
        };
    }
  };

  const getColorStyles = () => {
    if (error) {
      return { color: theme.palette.error.main };
    }
    if (disabled) {
      return { color: theme.palette.text.disabled };
    }
    if (color === 'default') {
      return { color: theme.palette.text.primary };
    }
    return { color: theme.palette[color].main };
  };

  const getVariantStyles = () => {
    const baseStyles = {
      display: srOnly ? 'none' : 'inline-flex',
      alignItems: 'center',
      gap: theme.spacing(0.5),
      transition: theme.transitions.create(['all'], {
        duration: theme.transitions.duration.standard,
      }),
      cursor: onClick ? 'pointer' : 'default',
      textAlign: align,
      fontWeight: getFontWeight(),
      textTransform: transform,
      whiteSpace: nowrap ? 'nowrap' : 'normal',
      overflow: truncate ? 'hidden' : 'visible',
      textOverflow: truncate ? 'ellipsis' : 'clip',
      position: 'relative' as const,
      ...getSizeStyles(),
      ...getColorStyles(),
    };

    const glowStyles = glow ? {
      textShadow: `0 0 10px ${alpha(getColorStyles().color || theme.palette.primary.main, 0.5)}`,
    } : {};

    const pulseStyles = pulse ? {
      animation: 'pulse 2s infinite',
      '@keyframes pulse': {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.6 },
        '100%': { opacity: 1 },
      },
    } : {};

    const rippleStyles = ripple && onClick ? {
      overflow: 'hidden',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 0,
        height: 0,
        borderRadius: '50%',
        backgroundColor: alpha(theme.palette.primary.main, 0.3),
        transform: 'translate(-50%, -50%)',
        transition: 'width 0.6s, height 0.6s',
      },
      '&:active::after': {
        width: '300%',
        height: '300%',
      },
    } : {};

    switch (variant) {
      case 'filled':
        return {
          ...baseStyles,
          ...glowStyles,
          ...pulseStyles,
          ...rippleStyles,
          backgroundColor: alpha(getColorStyles().color || theme.palette.primary.main, 0.1),
          borderRadius: theme.spacing(0.5),
          '&:hover': onClick ? {
            backgroundColor: alpha(getColorStyles().color || theme.palette.primary.main, 0.15),
          } : {},
        };

      case 'outlined':
        return {
          ...baseStyles,
          ...glowStyles,
          ...pulseStyles,
          ...rippleStyles,
          border: `1px solid ${alpha(getColorStyles().color || theme.palette.primary.main, 0.5)}`,
          borderRadius: theme.spacing(0.5),
          '&:hover': onClick ? {
            borderColor: getColorStyles().color || theme.palette.primary.main,
            backgroundColor: alpha(getColorStyles().color || theme.palette.primary.main, 0.05),
          } : {},
        };

      case 'glass':
        return {
          ...baseStyles,
          ...glowStyles,
          ...pulseStyles,
          ...rippleStyles,
          backgroundColor: alpha(theme.palette.background.paper, 0.1),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          borderRadius: theme.spacing(0.5),
          '&:hover': onClick ? {
            backgroundColor: alpha(theme.palette.background.paper, 0.15),
            borderColor: alpha(theme.palette.primary.main, 0.3),
          } : {},
        };

      case 'gradient': {
        const gradientColor = color === 'default' ? 'primary' : color;
        return {
          ...baseStyles,
          ...glowStyles,
          ...pulseStyles,
          ...rippleStyles,
          background: `linear-gradient(135deg, ${theme.palette[gradientColor].light}, ${theme.palette[gradientColor].main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          '&:hover': onClick ? {
            background: `linear-gradient(135deg, ${theme.palette[gradientColor].main}, ${theme.palette[gradientColor].dark})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          } : {},
        };
      }

      case 'minimal':
        return {
          ...baseStyles,
          ...glowStyles,
          ...pulseStyles,
          ...rippleStyles,
          padding: 0,
          '&:hover': onClick ? {
            color: theme.palette.primary.main,
          } : {},
        };

      default:
        return {
          ...baseStyles,
          ...glowStyles,
          ...pulseStyles,
          ...rippleStyles,
        };
    }
  };

  const getFontWeight = () => {
    switch (weight) {
      case 'light': return 300;
      case 'regular': return 400;
      case 'medium': return 500;
      case 'semibold': return 600;
      case 'bold': return 700;
      default: return 400;
    }
  };

  const renderAsterisk = () => {
    if (!required) return null;
    return (
      <Box
        component="span"
        sx={{
          color: theme.palette.error.main,
          marginLeft: asteriskPlacement === 'end' ? theme.spacing(0.5) : 0,
          marginRight: asteriskPlacement === 'start' ? theme.spacing(0.5) : 0,
        }}
      >
        *
      </Box>
    );
  };

  const renderIcon = () => {
    if (!icon) return null;
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          fontSize: 'inherit',
        }}
      >
        {icon}
      </Box>
    );
  };

  const renderLoading = () => {
    if (!loading) return null;
    return (
      <CircularProgress
        size={getSizeStyles().fontSize}
        sx={{
          color: getColorStyles().color,
          marginLeft: theme.spacing(0.5),
        }}
      />
    );
  };

  const labelContent = (
    <Box
      component="label"
      ref={ref}
      htmlFor={htmlFor}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
      className={className}
      sx={{
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {asteriskPlacement === 'start' && renderAsterisk()}
      {iconPosition === 'start' && renderIcon()}
      {children}
      {iconPosition === 'end' && renderIcon()}
      {asteriskPlacement === 'end' && renderAsterisk()}
      {renderLoading()}
    </Box>
  );

  const wrappedContent = tooltip ? (
    <Tooltip title={tooltip} arrow>
      {labelContent}
    </Tooltip>
  ) : labelContent;

  return (
    <>
      {srOnly && (
        <Box
          component="label"
          htmlFor={htmlFor}
          sx={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          {children}
        </Box>
      )}
      {!srOnly && wrappedContent}
      {helperText && !srOnly && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: error ? theme.palette.error.main : theme.palette.text.secondary,
            marginTop: theme.spacing(0.5),
            fontSize: '0.75rem',
          }}
        >
          {helperText}
        </Typography>
      )}
    </>
  );
});

Label.displayName = 'Label';
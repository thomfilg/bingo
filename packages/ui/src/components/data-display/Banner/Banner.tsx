import { 
  CheckCircle, 
  Close,
  Error, 
  Info, 
  Warning, 
} from '@mui/icons-material';
import {
  alpha,
  Box,
  Button,
  IconButton,
  keyframes,
  Typography,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import React from 'react';

import type { BannerProps, BannerVariant } from './Banner.types';

// Animations
const fadeInSlide = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 0.7;
  }
  70% {
    box-shadow: 0 0 0 8px currentColor;
    opacity: 0;
  }
  100% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 0;
  }
`;

const getVariantIcon = (variant: BannerVariant) => {
  const iconMap: Record<BannerVariant, React.ReactNode> = {
    info: <Info />,
    success: <CheckCircle />,
    warning: <Warning />,
    critical: <Error />,
  };
  return iconMap[variant];
};

const getVariantColor = (theme: Theme, variant: BannerVariant) => {
  const colorMap = {
    info: theme.palette.info,
    success: theme.palette.success,
    warning: theme.palette.warning,
    critical: theme.palette.error,
  };
  return colorMap[variant];
};

const StyledBanner = styled(Box, {
  shouldForwardProp: (prop) => !['variant', 'sticky', 'fullWidth'].includes(prop as string),
})<{
  variant: BannerVariant;
  sticky: boolean;
  fullWidth: boolean;
}>(({ theme, variant, sticky, fullWidth }) => {
  const colorPalette = getVariantColor(theme, variant);

  return {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.spacing(1),
    backgroundColor: alpha(colorPalette.main, 0.1),
    border: `1px solid ${alpha(colorPalette.main, 0.2)}`,
    color: colorPalette.main,
    position: sticky ? 'sticky' : 'relative',
    top: sticky ? 0 : 'auto',
    zIndex: sticky ? theme.zIndex.appBar : 'auto',
    width: fullWidth ? '100vw' : '100%',
    marginLeft: fullWidth ? '50%' : 0,
    transform: fullWidth ? 'translateX(-50%)' : 'none',
    animation: `${fadeInSlide} 0.3s ease-out`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

    // Enhanced accessibility and focus styles
    '&:focus-within': {
      outline: `3px solid ${alpha(colorPalette.main, 0.5)}`,
      outlineOffset: '2px',
    },

    // Icon container
    '.banner-icon': {
      flexShrink: 0,
      marginTop: theme.spacing(0.25),
      color: colorPalette.main,
      fontSize: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',

      '&::before': {
        content: '""',
        position: 'absolute',
        inset: -4,
        borderRadius: '50%',
        background: alpha(colorPalette.main, 0.1),
        animation: `${pulseAnimation} 3s infinite`,
      },
    },

    // Content area
    '.banner-content': {
      flex: 1,
      minWidth: 0, // Prevents flex item overflow
    },

    // Title styles
    '.banner-title': {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.4,
      marginBottom: theme.spacing(0.5),
      color: colorPalette.dark || colorPalette.main,
    },

    // Description styles  
    '.banner-description': {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      opacity: 0.9,
      color: 'inherit',
    },

    // Actions area
    '.banner-actions': {
      display: 'flex',
      flexShrink: 0,
      gap: theme.spacing(1),
      alignItems: 'center',
      marginTop: theme.spacing(1),

      [theme.breakpoints.up('sm')]: {
        marginTop: 0,
        marginLeft: theme.spacing(2),
      },
    },

    // Dismiss button
    '.banner-dismiss': {
      color: 'inherit',
      opacity: 0.7,
      marginLeft: theme.spacing(1),
      flexShrink: 0,

      '&:hover': {
        opacity: 1,
        backgroundColor: alpha(colorPalette.main, 0.1),
        transform: 'rotate(90deg)',
      },

      '&:focus': {
        opacity: 1,
        outline: `2px solid ${colorPalette.main}`,
        outlineOffset: '2px',
      },
    },

    // Responsive layout
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: theme.spacing(1),
      
      '.banner-content': {
        order: 1,
      },

      '.banner-actions': {
        order: 2,
        justifyContent: 'flex-start',
        marginTop: theme.spacing(1),
        marginLeft: 0,
      },
    },

    // Glass effect variant (optional enhancement)
    '&.banner-glass': {
      backgroundColor: alpha(theme.palette.background.paper, 0.1),
      backdropFilter: 'blur(20px)',
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      color: theme.palette.text.primary,
      
      '.banner-icon': {
        color: colorPalette.main,
      },
    },
  };
});

export const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      variant = 'info',
      title,
      description,
      icon,
      dismissible = false,
      onDismiss,
      actions,
      sticky = false,
      fullWidth = false,
      className,
      children,
      'data-testid': dataTestId = 'banner',
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = React.useState(true);

    const handleDismiss = React.useCallback(() => {
      setVisible(false);
      onDismiss?.();
    }, [onDismiss]);

    const displayIcon = icon || getVariantIcon(variant);

    // Determine appropriate ARIA role based on variant
    const ariaRole = variant === 'warning' || variant === 'critical' ? 'alert' : 'status';
    const ariaLive = variant === 'critical' ? 'assertive' : 'polite';

    if (!visible) {
      return null;
    }

    return (
      <StyledBanner
        ref={ref}
        variant={variant}
        sticky={sticky}
        fullWidth={fullWidth}
        className={className}
        role={ariaRole}
        aria-live={ariaLive}
        aria-atomic="true"
        tabIndex={0}
        data-testid={dataTestId}
        {...props}
      >
        {/* Icon */}
        {displayIcon && (
          <Box className="banner-icon" aria-hidden="true" data-testid={dataTestId ? `${dataTestId}-icon` : 'banner-icon'}>
            {displayIcon}
          </Box>
        )}

        {/* Main content */}
        <Box className="banner-content">
          {title && (
            <Typography className="banner-title" variant="subtitle2" component="div" data-testid={dataTestId ? `${dataTestId}-title` : 'banner-title'}>
              {title}
            </Typography>
          )}
          {description && (
            <Typography className="banner-description" variant="body2" component="div" data-testid={dataTestId ? `${dataTestId}-message` : 'banner-message'}>
              {description}
            </Typography>
          )}
          {children}
        </Box>

        {/* Actions and dismiss button container */}
        <Box display="flex" alignItems="center" gap={1}>
          {/* Action buttons */}
          {actions && actions.length > 0 && (
            <Box className="banner-actions">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  size="small"
                  variant={action.variant === 'primary' ? 'contained' : 'outlined'}
                  onClick={action.onClick}
                  data-testid={dataTestId ? `${dataTestId}-action` : 'banner-action'}
                  sx={(theme) => ({
                    minWidth: 'auto',
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    borderRadius: 1,
                    
                    ...(action.variant === 'primary' && {
                      backgroundColor: getVariantColor(theme, variant).main,
                      color: theme.palette.getContrastText(getVariantColor(theme, variant).main),
                      
                      '&:hover': {
                        backgroundColor: getVariantColor(theme, variant).dark || getVariantColor(theme, variant).main,
                        transform: 'translateY(-1px)',
                      },
                    }),
                    
                    ...(action.variant === 'secondary' && {
                      borderColor: getVariantColor(theme, variant).main,
                      color: getVariantColor(theme, variant).main,
                      
                      '&:hover': {
                        backgroundColor: alpha(getVariantColor(theme, variant).main, 0.1),
                        borderColor: getVariantColor(theme, variant).main,
                        transform: 'translateY(-1px)',
                      },
                    }),
                  })}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Dismiss button */}
          {dismissible && (
            <IconButton
              className="banner-dismiss"
              size="small"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              data-testid={dataTestId ? `${dataTestId}-close` : 'banner-close'}
              sx={{ transition: 'all 0.2s ease' }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>
      </StyledBanner>
    );
  },
);

Banner.displayName = 'Banner';
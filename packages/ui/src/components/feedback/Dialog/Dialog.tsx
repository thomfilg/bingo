import React from 'react';
import {
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  IconButton,
  Typography,
  Box,
  Drawer,
  useTheme,
  alpha,
  Backdrop,
  keyframes,
  SxProps,
  Theme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

import {
  DialogProps,
  DialogHeaderProps,
  DialogContentProps,
  DialogActionsProps,
} from './Dialog.types';

// Define pulse animation
const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 1;
  }
  70% {
    box-shadow: 0 0 0 20px currentColor;
    opacity: 0;
  }
  100% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 0;
  }
`;

export const Dialog: React.FC<DialogProps> = ({
  children,
  variant = 'default',
  size = 'md',
  title,
  description,
  showCloseButton = true,
  backdrop = true,
  persistent = false,
  glass = false,
  gradient = false,
  glow = false,
  pulse = false,
  borderRadius = 'lg',
  onClose,
  open,
  ...props
}) => {
  const theme = useTheme();

  const getBorderRadius = () => {
    switch (borderRadius) {
      case 'none': return 0;
      case 'sm': return theme.spacing(0.5);
      case 'md': return theme.spacing(1);
      case 'lg': return theme.spacing(2);
      case 'xl': return theme.spacing(3);
      default: return theme.spacing(2);
    }
  };

  const getMaxWidth = () => {
    switch (size) {
      case 'xs': return 400;
      case 'sm': return 600;
      case 'md': return 800;
      case 'lg': return 1000;
      case 'xl': return 1200;
      default: return 800;
    }
  };

  const getVariantStyles = (): SxProps<Theme> => {
    const baseStyles = {
      borderRadius: getBorderRadius(),
      maxWidth: getMaxWidth(),
      width: '90vw',
      margin: theme.spacing(2),
      transition: theme.transitions.create([
        'box-shadow',
        'background-color',
        'backdrop-filter',
      ], {
        duration: theme.transitions.duration.standard,
      }),
    };

    const glowStyles = glow ? {
      boxShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.3)}`,
    } : {};

    const pulseStyles = pulse ? {
      position: 'relative' as const,
      '&::after': {
        content: '""',
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 'inherit',
        backgroundColor: theme.palette.primary.main,
        opacity: 0.3,
        animation: `${pulseAnimation} 2s infinite`,
        pointerEvents: 'none' as const,
        zIndex: -1,
      },
    } : {};

    switch (variant) {
      case 'glass':
        return {
          ...baseStyles,
          ...glowStyles,
          ...pulseStyles,
          backgroundColor: alpha(theme.palette.background.paper, 0.1),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
        };

      case 'fullscreen':
        return {
          borderRadius: 0,
          margin: 0,
          width: '100vw',
          height: '100vh',
          maxWidth: 'none',
          maxHeight: 'none',
          ...glowStyles,
          ...pulseStyles,
        };

      case 'drawer':
        return {
          borderRadius: `${getBorderRadius()}px 0 0 ${getBorderRadius()}px`,
          margin: 0,
          width: getMaxWidth(),
          height: '100vh',
          maxHeight: 'none',
          position: 'absolute' as const,
          right: 0,
          ...glowStyles,
          ...pulseStyles,
        };

      default: {
        const gradientStyles = gradient ? {
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          backdropFilter: 'blur(10px)',
        } : {};

        return {
          ...baseStyles,
          ...glowStyles,
          ...pulseStyles,
          ...gradientStyles,
          backgroundColor: glass 
            ? alpha(theme.palette.background.paper, 0.1)
            : theme.palette.background.paper,
          backdropFilter: glass ? 'blur(20px)' : 'none',
          border: glass 
            ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            : 'none',
        };
      }
    }
  };

  const handleClose = (event: object, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (persistent && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
      return;
    }
    onClose?.();
  };

  if (variant === 'drawer') {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        {...props}
      >
        <Box
          sx={{
            ...getVariantStyles(),
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {title && (
            <DialogHeader
              title={title}
              subtitle={description}
              showCloseButton={showCloseButton}
              onClose={onClose}
            />
          )}
          {children}
        </Box>
      </Drawer>
    );
  }

  const BackdropComponent = backdrop ? Backdrop : undefined;

  return (
    <MuiDialog
      open={open}
      onClose={handleClose}
      fullScreen={variant === 'fullscreen'}
      BackdropComponent={BackdropComponent}
      BackdropProps={{
        sx: {
          backgroundColor: glass 
            ? alpha(theme.palette.common.black, 0.2)
            : alpha(theme.palette.common.black, 0.5),
          backdropFilter: glass ? 'blur(8px)' : 'none',
        },
      }}
      PaperProps={{
        sx: getVariantStyles(),
      }}
      {...props}
    >
      {title && (
        <DialogHeader
          title={title}
          subtitle={description}
          showCloseButton={showCloseButton}
          onClose={onClose}
        />
      )}
      {children}
    </MuiDialog>
  );
};

export const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  title,
  subtitle,
  showCloseButton = true,
  onClose,
}) => {
  if (children) {
    return (
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        {children}
      </Box>
    );
  }

  return (
    <MuiDialogTitle
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pb: subtitle ? 1 : 2,
      }}
    >
      <Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {showCloseButton && onClose && (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
    </MuiDialogTitle>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({
  children,
  dividers = false,
  dense = false,
  ...props
}) => {
  return (
    <MuiDialogContent
      dividers={dividers}
      sx={{
        padding: dense ? 1.5 : 3,
        '&.MuiDialogContent-dividers': {
          borderTop: dividers ? '1px solid' : 'none',
          borderBottom: dividers ? '1px solid' : 'none',
          borderColor: 'divider',
        },
      }}
      {...props}
    >
      {children}
    </MuiDialogContent>
  );
};

export const DialogActions: React.FC<DialogActionsProps> = ({
  children,
  alignment = 'right',
  spacing = 1,
  ...props
}) => {
  const getJustifyContent = () => {
    switch (alignment) {
      case 'left': return 'flex-start';
      case 'center': return 'center';
      case 'right': return 'flex-end';
      case 'space-between': return 'space-between';
      default: return 'flex-end';
    }
  };

  return (
    <MuiDialogActions
      sx={{
        justifyContent: getJustifyContent(),
        gap: spacing,
        p: 2,
      }}
      {...props}
    >
      {children}
    </MuiDialogActions>
  );
};
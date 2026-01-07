import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  IconButton,
  alpha,
  keyframes,
  CircularProgress,
  Typography,
} from '@mui/material';
import type { ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Close, Error, Info } from '@mui/icons-material';

import { AlertDialogProps } from './AlertDialog.types';

// Define pulse animation
const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 1;
  }
  70% {
    box-shadow: 0 0 0 15px currentColor;
    opacity: 0;
  }
  100% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 0;
  }
`;

const StyledDialog = styled(Dialog, {
  shouldForwardProp: (prop) => 
    !['customVariant', 'glow', 'pulse'].includes(prop as string),
})<{ 
  customVariant?: string; 
  glow?: boolean; 
  pulse?: boolean; 
}>(({ theme, customVariant, glow, pulse }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',

    // Variant styles
    ...(customVariant === 'default' && {
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    }),

    ...(customVariant === 'destructive' && {
      backgroundColor: alpha(theme.palette.error.main, 0.05),
      border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
    }),

    ...(customVariant === 'glass' && {
      backgroundColor: alpha(theme.palette.background.paper, 0.1),
      backdropFilter: 'blur(20px)',
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    }),

    // Glow effect
    ...(glow && !pulse && {
      boxShadow: `0 0 30px 10px ${alpha(theme.palette.primary.main, 0.3)} !important`,
      filter: 'brightness(1.05)',
    }),

    // Pulse animation
    ...(pulse && !glow && {
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 'inherit',
        backgroundColor: theme.palette.primary.main,
        opacity: 0.1,
        animation: `${pulseAnimation} 2s infinite`,
        pointerEvents: 'none',
        zIndex: -1,
      },
    }),

    // Both glow and pulse
    ...(glow && pulse && {
      position: 'relative',
      boxShadow: `0 0 30px 10px ${alpha(theme.palette.primary.main, 0.3)} !important`,
      filter: 'brightness(1.05)',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 'inherit',
        backgroundColor: theme.palette.primary.main,
        opacity: 0.1,
        animation: `${pulseAnimation} 2s infinite`,
        pointerEvents: 'none',
        zIndex: -1,
      },
    }),
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  paddingRight: theme.spacing(6), // Space for close button
  '& .MuiTypography-root': {
    fontWeight: 600,
    fontSize: '1.25rem',
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(2),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3, 3, 3),
  gap: theme.spacing(1),
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.grey[500],
}));

export const AlertDialog = React.forwardRef<HTMLDivElement, AlertDialogProps>(
  ({
    variant = 'default',
    glow = false,
    pulse = false,
    title,
    description,
    icon,
    cancelText = 'Cancel',
    confirmText = 'Confirm',
    onCancel,
    onConfirm,
    showCancel = true,
    loading = false,
    confirmDisabled = false,
    children,
    onClose,
    ...props
  }, ref) => {
    
    const handleCancel = () => {
      onCancel?.();
      onClose?.({}, 'backdropClick');
    };

    const handleConfirm = () => {
      onConfirm?.();
    };

    const getVariantIcon = () => {
      if (icon) return icon;
      
      switch (variant) {
        case 'destructive':
          return <Error color="error" />;
        default:
          return <Info color="primary" />;
      }
    };

    const getConfirmButtonVariant = (): ButtonProps['variant'] => {
      switch (variant) {
        case 'destructive':
          return 'contained';
        default:
          return 'contained';
      }
    };

    const getConfirmButtonColor = () => {
      switch (variant) {
        case 'destructive':
          return 'error';
        default:
          return 'primary';
      }
    };

    return (
      <StyledDialog
        ref={ref}
        customVariant={variant}
        glow={glow}
        pulse={pulse}
        onClose={onClose}
        {...props}
      >
        <CloseButton
          aria-label="close"
          onClick={handleCancel}
          size="small"
        >
          <Close />
        </CloseButton>
        
        {title && (
          <StyledDialogTitle>
            {(icon !== null) && getVariantIcon()}
            <Typography variant="h6" component="span">
              {title}
            </Typography>
          </StyledDialogTitle>
        )}
        
        <StyledDialogContent>
          {description && (
            <DialogContentText>
              {description}
            </DialogContentText>
          )}
          {children}
        </StyledDialogContent>
        
        <StyledDialogActions>
          {showCancel && (
            <Button
              onClick={handleCancel}
              variant="outlined"
              color="inherit"
              disabled={loading}
            >
              {cancelText}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            variant={getConfirmButtonVariant()}
            color={getConfirmButtonColor()}
            disabled={confirmDisabled || loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
            autoFocus
          >
            {confirmText}
          </Button>
        </StyledDialogActions>
      </StyledDialog>
    );
  }
);

AlertDialog.displayName = 'AlertDialog';
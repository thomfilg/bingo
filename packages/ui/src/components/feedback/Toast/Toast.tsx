import {
  CheckCircle as SuccessIcon,
  Close as CloseIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Alert,
  alpha,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Portal,
  Slide,
  Typography,
  useTheme,
} from '@mui/material';
import React, { createContext, useCallback,useContext, useState } from 'react';

import type { ToastContainerProps, ToastContextType, ToastItem,ToastProps } from './Toast.types';

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastProps, 'id'>): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastItem = {
        ...toast,
        id,
        timestamp: Date.now(),
      };

      setToasts((prev) => [...prev, newToast]);

      if (!toast.persistent && toast.duration !== 0) {
        const duration = toast.duration ?? 5000;
        window.setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast],
  );

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const promise = useCallback(
    async <T,>(
      promiseToResolve: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
      },
    ): Promise<T> => {
      const toastId = addToast({
        message: options.loading,
        variant: 'promise',
        persistent: true,
      });

      try {
        const data = await promiseToResolve;

        removeToast(toastId);
        addToast({
          message: typeof options.success === 'function' ? options.success(data) : options.success,
          variant: 'success',
        });

        return data;
      } catch (error) {
        removeToast(toastId);
        addToast({
          message: typeof options.error === 'function' ? options.error(error) : options.error,
          variant: 'error',
        });

        throw error;
      }
    },
    [addToast, removeToast],
  );

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    promise,
  };

  return <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>;
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const Toast: React.FC<ToastProps> = ({
  id = '',
  message,
  variant = 'default',
  closable = true,
  action,
  glass = false,
  onClose,
  dataTestId = 'toast',
}) => {
  const theme = useTheme();

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      case 'promise':
        return <CircularProgress size={20} />;
      default:
        return null;
    }
  };

  const getVariantStyles = () => {
    const baseStyles = {
      borderRadius: theme.spacing(1.5),
      transition: theme.transitions.create(['background-color', 'backdrop-filter'], {
        duration: theme.transitions.duration.standard,
      }),
    };

    if (glass) {
      return {
        ...baseStyles,
        backgroundColor: alpha(theme.palette.background.paper, 0.1),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      };
    }

    return baseStyles;
  };

  const handleClose = () => {
    if (onClose && id) {
      onClose(id);
    }
  };

  return (
    <Alert
      data-testid={dataTestId}
      icon={getIcon()}
      severity={variant === 'default' || variant === 'promise' ? 'info' : variant}
      onClose={closable ? handleClose : undefined}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {action && (
            <Button
              data-testid={`${dataTestId}-action`}
              color="inherit"
              size="small"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {closable && (
            <IconButton
              data-testid={`${dataTestId}-close`}
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      }
      sx={getVariantStyles()}
    >
      <Typography data-testid={`${dataTestId}-message`} variant="body2">{message}</Typography>
    </Alert>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  maxToasts = 5,
  gap = 8,
  className,
  dataTestId = 'toast-container',
}) => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('ToastContainer must be used within a ToastProvider');
  }

  const { toasts, removeToast } = context;

  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: `${gap}px`,
      padding: '16px',
      pointerEvents: 'none',
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: 0, left: 0 };
      case 'top-center':
        return { ...baseStyles, top: 0, left: '50%', transform: 'translateX(-50%)' };
      case 'top-right':
        return { ...baseStyles, top: 0, right: 0 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 0, left: 0, flexDirection: 'column-reverse' };
      case 'bottom-center':
        return {
          ...baseStyles,
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          flexDirection: 'column-reverse',
        };
      case 'bottom-right':
        return { ...baseStyles, bottom: 0, right: 0, flexDirection: 'column-reverse' };
      default:
        return { ...baseStyles, top: 0, right: 0 };
    }
  };

  return (
    <Portal>
      <Box data-testid={dataTestId} className={className} sx={getPositionStyles()}>
        {toasts.slice(0, maxToasts).map((toast, index) => (
          <Slide
            key={toast.id}
            direction={position.includes('left') ? 'right' : 'left'}
            in={true}
            timeout={300}
            style={{ pointerEvents: 'auto' }}
          >
            <Box data-testid={`${dataTestId}-item-${index}`}>
              <Toast {...toast} onClose={removeToast} dataTestId={toast.dataTestId || `toast-${index}`} />
            </Box>
          </Slide>
        ))}
      </Box>
    </Portal>
  );
};

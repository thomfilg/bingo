import { Close } from '@mui/icons-material';
import { alpha,Box, Drawer as MuiDrawer, IconButton, Typography, useTheme } from '@mui/material';
import React from 'react';

import type { DrawerContentProps,DrawerHeaderProps, DrawerProps } from './Drawer.types';

export const Drawer: React.FC<DrawerProps> = ({
  children,
  open,
  onClose,
  variant = 'left',
  anchor,
  width = 280,
  height = '100%',
  persistent = false,
  backdrop = true,
  hideBackdrop = false,
  keepMounted = false,
  className,
  dataTestId,
  ...rest
}) => {
  const theme = useTheme();

  const getAnchor = (): 'left' | 'right' | 'top' | 'bottom' => {
    if (anchor) return anchor;

    // Map variant to anchor position
    switch (variant) {
      case 'right':
        return 'right';
      case 'top':
        return 'top';
      case 'bottom':
        return 'bottom';
      case 'glass':
        return 'right';
      case 'left':
      default:
        return 'left';
    }
  };

  const getDrawerStyles = () => {
    const baseStyles = {
      width: ['left', 'right'].includes(getAnchor()) ? width : '100%',
      height: ['top', 'bottom'].includes(getAnchor()) ? height : '100%',
      flexShrink: 0,
    };

    if (variant === 'glass') {
      return {
        ...baseStyles,
        '& .MuiDrawer-paper': {
          width,
          height: '100%',
          backgroundColor: alpha(theme.palette.background.paper, 0.1),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
        },
      };
    }

    return {
      ...baseStyles,
      '& .MuiDrawer-paper': {
        width: ['left', 'right'].includes(getAnchor()) ? width : '100%',
        height: ['top', 'bottom'].includes(getAnchor()) ? height : '100%',
        boxSizing: 'border-box',
      },
    };
  };

  return (
    <MuiDrawer
      anchor={getAnchor()}
      open={open}
      onClose={onClose}
      variant={persistent ? 'persistent' : 'temporary'}
      ModalProps={{
        keepMounted,
        hideBackdrop,
        BackdropProps: {
          invisible: !backdrop,
        },
      }}
      sx={getDrawerStyles()}
      className={className}
      data-testid={dataTestId || 'drawer'}
      {...rest}
    >
      {children}
    </MuiDrawer>
  );
};

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  children,
  onClose,
  showCloseButton = true,
  dataTestId,
}) => {
  const theme = useTheme();

  return (
    <Box
      data-testid={dataTestId || 'drawer-header'}
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(2),
        borderBottom: `1px solid ${theme.palette.divider}`,
        minHeight: 64,
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ flex: 1 }} data-testid={dataTestId ? `${dataTestId}-title` : 'drawer-title'}>
        {typeof children === 'string' ? <Typography variant="h6">{children}</Typography> : children}
      </Box>
      {showCloseButton && onClose && (
        <IconButton
          onClick={onClose}
          edge="end"
          aria-label="Close drawer"
          data-testid={dataTestId ? `${dataTestId}-close` : 'drawer-close'}
        >
          <Close />
        </IconButton>
      )}
    </Box>
  );
};

export const DrawerContent: React.FC<DrawerContentProps> = ({ children, padding = true, dataTestId }) => {
  const theme = useTheme();

  return (
    <Box
      data-testid={dataTestId || 'drawer-content'}
      sx={{
        flex: 1,
        overflow: 'auto',
        padding: padding ? theme.spacing(2) : 0,
      }}
    >
      {children}
    </Box>
  );
};

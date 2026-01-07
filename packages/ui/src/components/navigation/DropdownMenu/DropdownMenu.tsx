import React, { useState, useRef, cloneElement, isValidElement } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ChevronRight, MoreVert } from '@mui/icons-material';

import { DropdownMenuProps, DropdownMenuItem } from './DropdownMenu.types';

const StyledMenu = styled(Menu, {
  shouldForwardProp: (prop) => prop !== 'customVariant' && prop !== 'size',
})<{ customVariant?: string; size?: string }>(({ theme, customVariant, size }) => ({
  '& .MuiPaper-root': {
    minWidth: 180,
    borderRadius: theme.spacing(1),

    ...(customVariant === 'glass' && {
      backgroundColor: alpha(
        theme.palette.mode === 'dark'
          ? theme.palette.background.paper
          : theme.palette.background.paper,
        0.75,
      ),
      backdropFilter: 'blur(24px) saturate(1.8)',
      WebkitBackdropFilter: 'blur(24px) saturate(1.8)', // Safari support
      border: `1px solid ${alpha(
        theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
        0.12,
      )}`,
      boxShadow: [
        `0 8px 32px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.4 : 0.12)}`,
        `0 0 0 1px ${alpha(
          theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
          0.05,
        )}`,
        `inset 0 1px 0 ${alpha(
          theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.white,
          theme.palette.mode === 'dark' ? 0.2 : 0.8,
        )}`,
      ].join(', '),
      // Enhanced glass morphism with subtle gradient overlay
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 50%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.8)} 0%, transparent 50%)`,
        borderRadius: 'inherit',
        pointerEvents: 'none',
        zIndex: 1,
      },
      // Ensure content appears above the overlay
      '& .MuiList-root': {
        position: 'relative',
        zIndex: 2,
      },
    }),

    ...(customVariant === 'minimal' && {
      boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
      border: `1px solid ${theme.palette.divider}`,
    }),

    ...(size === 'sm' && {
      '& .MuiMenuItem-root': {
        fontSize: '0.875rem',
        minHeight: 32,
        padding: theme.spacing(0.75, 2),
      },
    }),

    ...(size === 'lg' && {
      '& .MuiMenuItem-root': {
        fontSize: '1.125rem',
        minHeight: 48,
        padding: theme.spacing(1.5, 3),
      },
    }),
  },
}));

const StyledMenuItem = styled(MenuItem, {
  shouldForwardProp: (prop) => !['color', 'showIconSpace'].includes(prop as string),
})<{ color?: string; showIconSpace?: boolean }>(({ theme, color, showIconSpace }) => ({
  borderRadius: theme.spacing(0.5),
  margin: theme.spacing(0.5, 1),
  transition: 'all 0.2s ease',

  ...(showIconSpace && {
    paddingLeft: theme.spacing(5),
  }),

  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },

  ...(color &&
    color !== 'default' && {
      color:
        theme.palette[color as 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success']
          ?.main || theme.palette.text.primary,
      '& .MuiListItemIcon-root': {
        color:
          theme.palette[color as 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success']
            ?.main || theme.palette.text.primary,
      },
      '&:hover': {
        backgroundColor: alpha(
          theme.palette[color as 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success']
            ?.main || theme.palette.primary.main,
          0.08,
        ),
      },
    }),
}));

const MenuHeader = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
  letterSpacing: 0.5,
}));

const ShortcutText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginLeft: 'auto',
  paddingLeft: theme.spacing(2),
}));

const renderMenuItem = (
  item: DropdownMenuItem,
  handleItemClick: (item: DropdownMenuItem) => void,
  showIconSpace?: boolean,
  size?: string,
) => {
  if (item.type === 'divider') {
    return <Divider key={item.id} sx={{ my: 0.5 }} />;
  }

  if (item.type === 'header') {
    return <MenuHeader key={item.id}>{item.label}</MenuHeader>;
  }

  if (item.component) {
    return (
      <Box key={item.id} sx={{ px: 2, py: 1 }}>
        {item.component}
      </Box>
    );
  }

  const hasIcon = !!item.icon;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <StyledMenuItem
      key={item.id}
      disabled={item.disabled}
      onClick={!item.disabled ? () => handleItemClick(item) : undefined} // ← change
      color={item.color}
      showIconSpace={showIconSpace && !hasIcon}
    >
      {hasIcon && (
        <ListItemIcon sx={{ minWidth: size === 'sm' ? 32 : 40 }}>{item.icon}</ListItemIcon>
      )}
      <ListItemText primary={item.label} />
      {item.shortcut && <ShortcutText variant="caption">{item.shortcut}</ShortcutText>}
      {hasChildren && item.showChevron !== false && (
        <ChevronRight fontSize="small" sx={{ ml: 1, opacity: 0.5 }} />
      )}
    </StyledMenuItem>
  );
};

export const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  (
    {
      variant = 'default',
      items,
      trigger,
      open: controlledOpen,
      onOpen,
      onClose,
      size = 'md',
      maxHeight = 400,
      minWidth = 180,
      closeOnItemClick = true,
      showIconSpace = false,
      anchorEl: providedAnchorEl,
      ...menuProps
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const anchorRef = useRef<HTMLElement>(null);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const anchorEl = providedAnchorEl || anchorRef.current;

    const handleOpen = () => {
      if (!isControlled) {
        setInternalOpen(true);
      }
      onOpen?.();
    };

    const handleClose = () => {
      if (!isControlled) {
        setInternalOpen(false);
      }
      onClose?.();
    };

    const handleItemClick = (item: DropdownMenuItem) => {
      if (item.onClick) {
        item.onClick();
      }
      if (closeOnItemClick && !item.children?.length) {
        handleClose();
      }
    };

    const handleTriggerClick = (event: React.MouseEvent<HTMLElement>) => {
      if (!isControlled) {
        if (open) {
          handleClose();
        } else {
          (anchorRef as React.MutableRefObject<HTMLElement>).current = event.currentTarget;
          handleOpen();
        }
      }
    };

    const triggerElement = trigger ? (
      isValidElement(trigger) ? (
        cloneElement(trigger as React.ReactElement, {
          onClick: handleTriggerClick,
          ref: anchorRef,
        })
      ) : (
        <Box ref={anchorRef} onClick={handleTriggerClick}>
          {trigger}
        </Box>
      )
    ) : (
      <Box
        ref={anchorRef}
        onClick={handleTriggerClick}
        sx={{ cursor: 'pointer', display: 'inline-flex' }}
      >
        <MoreVert />
      </Box>
    );

    return (
      <>
        {trigger !== undefined && triggerElement}
        <StyledMenu
          ref={ref}
          anchorEl={anchorEl}
          open={Boolean(anchorEl) && open}
          onClose={handleClose}
          customVariant={variant}
          size={size}
          PaperProps={{
            sx: {
              maxHeight: maxHeight,
              minWidth: minWidth,
              overflow: 'auto',
            },
          }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          {...menuProps}
        >
          {items.map((item) => renderMenuItem(item, handleItemClick, showIconSpace, size))}
        </StyledMenu>
      </>
    );
  },
);

DropdownMenu.displayName = 'DropdownMenu';

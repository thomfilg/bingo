import React, { forwardRef, KeyboardEvent, ReactElement } from 'react';
import { Chip as MuiChip, Avatar } from '@mui/material';

import { ChipProps } from './Chip.types';

export const Chip = forwardRef<HTMLDivElement, ChipProps>(({
  label,
  variant = 'filled',
  size = 'medium',
  color = 'primary',
  avatarSrc,
  avatar,
  icon,
  selected,
  selectable,
  deletable,
  disabled,
  onClick,
  onDelete,
  className,
  ...props
}, ref) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (disabled) return;

    // Handle delete/backspace keys for deletion
    if ((event.key === 'Delete' || event.key === 'Backspace') && deletable && onDelete) {
      event.preventDefault();
      onDelete();
      return;
    }

    // Handle enter/space for selection
    if ((event.key === 'Enter' || event.key === ' ') && (onClick || selectable)) {
      event.preventDefault();
      onClick?.();
    }
  };

  const getAvatarComponent = (): ReactElement | undefined => {
    if (avatar && React.isValidElement(avatar)) {
      return avatar;
    }
    if (avatarSrc) {
      return <Avatar src={avatarSrc} sx={{ width: 24, height: 24 }} />;
    }
    return undefined;
  };

  // Determine the role based on context
  const role = selectable ? 'option' : (onClick ? 'button' : undefined);
  
  // Determine if clickable
  const clickable = !disabled && (!!onClick || selectable);

  return (
    <MuiChip
      ref={ref}
      label={label}
      variant={variant}
      size={size}
      color={color as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default' | undefined}
      avatar={getAvatarComponent()}
      icon={icon && React.isValidElement(icon) ? icon : undefined}
      onDelete={deletable ? onDelete : undefined}
      disabled={disabled}
      clickable={clickable}
      onClick={clickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      className={className}
      role={role}
      aria-selected={selectable ? selected : undefined}
      sx={{
        // Enhanced styling for glass effect and states
        ...(variant === 'outlined' && {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }),
        ...(selected && {
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.16)'
              : 'rgba(0, 0, 0, 0.08)',
        }),
        '&:hover': {
          ...(clickable && !disabled && {
            transform: 'translateY(-1px)',
            boxShadow: (theme) => 
              theme.palette.mode === 'dark'
                ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                : '0 4px 12px rgba(0, 0, 0, 0.15)',
          }),
        },
        '&:active': {
          ...(clickable && !disabled && {
            transform: 'translateY(0px)',
          }),
        },
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      {...props}
    />
  );
});

Chip.displayName = 'Chip';
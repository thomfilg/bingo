import CancelIcon from '@mui/icons-material/Cancel';
import { Avatar, Chip as MuiChip } from '@mui/material';
import type { KeyboardEvent, ReactElement } from 'react';
import React, { forwardRef } from 'react';

import type { ChipProps } from './Chip.types';

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
  dataTestId,
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

  // Enhance icon with test ID if present
  const enhancedIcon = icon && React.isValidElement(icon)
    ? React.cloneElement(icon as ReactElement, {
        'data-testid': dataTestId ? `${dataTestId}-icon` : 'chip-icon',
      } as Record<string, unknown>)
    : undefined;

  // Wrap label with test ID
  const enhancedLabel = (
    <span data-testid={dataTestId ? `${dataTestId}-label` : 'chip-label'}>
      {label}
    </span>
  );

  // Custom delete icon with test ID
  const enhancedDeleteIcon = deletable ? (
    <CancelIcon data-testid={dataTestId ? `${dataTestId}-delete` : 'chip-delete'} />
  ) : undefined;

  return (
    <MuiChip
      ref={ref}
      label={enhancedLabel}
      variant={variant}
      size={size}
      color={color as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default' | undefined}
      avatar={getAvatarComponent()}
      icon={enhancedIcon}
      onDelete={deletable ? onDelete : undefined}
      deleteIcon={enhancedDeleteIcon}
      disabled={disabled}
      clickable={clickable}
      onClick={clickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      className={className}
      role={role}
      aria-selected={selectable ? selected : undefined}
      data-testid={dataTestId || 'chip'}
      sx={{
        // Enhanced styling for outlined variant
        ...(variant === 'outlined' && {
          borderWidth: '1px',
          borderStyle: 'solid',
          backgroundColor: 'transparent',
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
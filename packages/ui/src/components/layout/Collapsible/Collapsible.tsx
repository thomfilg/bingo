import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, useTheme, Collapse } from '@mui/material';

import { CollapsibleProps, CollapsibleTriggerProps, CollapsibleContentProps } from './Collapsible.types';

export const Collapsible: React.FC<CollapsibleProps> = ({
  children,
  open,
  variant = 'default',
  duration = 300,
  easing,
  onToggle,
  disabled = false,
  keepMounted = false,
  sx,
  className,
  ...otherProps
}) => {
  const theme = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');

  const getTransitionSettings = () => {
    switch (variant) {
      case 'smooth':
        return {
          duration,
          easing: easing || theme.transitions.easing.easeInOut,
        };
      case 'spring':
        return {
          duration: duration * 1.2,
          easing: easing || 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        };
      default:
        return {
          duration,
          easing: easing || theme.transitions.easing.easeInOut,
        };
    }
  };

  const transition = getTransitionSettings();

  const measureHeight = useCallback(() => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      setHeight(scrollHeight);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setHeight(0);
    } else if (contentRef.current) {
      measureHeight();
    }
  }, [open, measureHeight, children]);

  // Trigger onToggle callback when open state changes
  useEffect(() => {
    if (onToggle && !disabled) {
      onToggle(open);
    }
  }, [open, onToggle, disabled]);


  if (variant === 'default') {
    // Use MUI's built-in Collapse for default variant
    return (
      <Collapse
        in={open && !disabled}
        timeout={disabled ? 0 : duration}
        sx={{
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
          ...sx,
        }}
        className={className}
        unmountOnExit={!keepMounted}
        data-disabled={disabled}
        role="region"
        aria-expanded={open && !disabled}
        aria-hidden={disabled || !open}
        {...otherProps}
      >
        <Box>{children}</Box>
      </Collapse>
    );
  }

  // Custom implementation for smooth and spring variants
  return (
    <Box
      component="div"
      sx={{
        overflow: 'hidden',
        height: open && !disabled ? height : 0,
        transition: disabled ? 'none' : `height ${transition.duration}ms ${transition.easing}`,
        willChange: disabled ? 'auto' : 'height',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        ...sx,
      }}
      className={className}
      data-disabled={disabled}
      role="region"
      aria-expanded={open && !disabled}
      aria-hidden={disabled || !open}
      {...otherProps}
    >
      <Box ref={contentRef}>
        {(keepMounted || (open && !disabled)) && children}
      </Box>
    </Box>
  );
};

export const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({
  children,
  onClick,
  disabled = false,
  expanded = false,
  className,
  ...otherProps
}) => {
  const theme = useTheme();

  return (
    <Box
      component="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={className}
      aria-expanded={expanded}
      aria-disabled={disabled}
      role="button"
      tabIndex={disabled ? -1 : 0}
      data-state={expanded ? 'open' : 'closed'}
      sx={{
        width: '100%',
        padding: theme.spacing(1, 2),
        border: 'none',
        backgroundColor: expanded ? theme.palette.action.selected : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: theme.transitions.create(['background-color', 'opacity'], {
          duration: theme.transitions.duration.short,
        }),
        opacity: disabled ? 0.6 : 1,
        '&:hover': {
          backgroundColor: disabled ? 'transparent' : 
            expanded ? theme.palette.action.selected : theme.palette.action.hover,
        },
        '&:focus': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
        '&:active': {
          backgroundColor: disabled ? 'transparent' : theme.palette.action.focus,
        },
      }}
      {...otherProps}
    >
      {children}
    </Box>
  );
};

export const CollapsibleContent: React.FC<CollapsibleContentProps> = ({
  children,
  className,
  ...otherProps
}) => {
  const theme = useTheme();

  return (
    <Box
      className={className}
      sx={{
        padding: theme.spacing(2),
      }}
      {...otherProps}
    >
      {children}
    </Box>
  );
};
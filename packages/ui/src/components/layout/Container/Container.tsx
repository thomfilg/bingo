import React from 'react';
import { Container as MuiContainer, useTheme } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

import { ContainerProps } from './Container.types';

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'lg',
  variant = 'default',
  padding = 'md',
  responsive = true,
  sx,
  ...props
}) => {
  const theme = useTheme();

  const getPadding = () => {
    const paddingMap = {
      none: 0,
      xs: theme.spacing(1),
      sm: theme.spacing(2),
      md: theme.spacing(3),
      lg: theme.spacing(4),
      xl: theme.spacing(6),
    };
    return paddingMap[padding] || theme.spacing(3);
  };

  const getMaxWidth = (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false => {
    if (variant === 'fluid') return false;
    if (variant === 'centered') return 'md';
    if (typeof maxWidth === 'string' && ['xs', 'sm', 'md', 'lg', 'xl'].includes(maxWidth)) {
      return maxWidth as 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    }
    if (maxWidth === false) return false;
    return 'lg'; // default fallback
  };

  const containerStyles: SxProps<Theme> = {
    ...(variant === 'centered' && {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
    }),
    ...(variant === 'padded' && {
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(8),
    }),
    padding: getPadding(),
    ...(responsive && {
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
      },
    }),
    ...(sx || {}),
  };

  return (
    <MuiContainer maxWidth={getMaxWidth()} sx={containerStyles} {...props}>
      {children}
    </MuiContainer>
  );
};

import React from 'react';
import { Box, useTheme } from '@mui/material';

import { SpacerProps } from './Spacer.types';

export const Spacer: React.FC<SpacerProps> = ({
  size = 'md',
  direction = 'both',
  width,
  height,
  flex = false,
  className,
  'data-testid': dataTestId,
}) => {
  const theme = useTheme();

  const getSpacing = () => {
    switch (size) {
      case 'xs':
        return theme.spacing(0.5);
      case 'sm':
        return theme.spacing(1);
      case 'md':
        return theme.spacing(2);
      case 'lg':
        return theme.spacing(3);
      case 'xl':
        return theme.spacing(4);
      default:
        return theme.spacing(2);
    }
  };

  const getDimensions = () => {
    const spacing = getSpacing();

    let finalWidth = width;
    let finalHeight = height;

    if (direction === 'horizontal' || direction === 'both') {
      finalWidth = width ?? spacing;
    }

    if (direction === 'vertical' || direction === 'both') {
      finalHeight = height ?? spacing;
    }

    return { width: finalWidth, height: finalHeight };
  };

  const dimensions = getDimensions();

  return (
    <Box
      className={className}
      data-testid={dataTestId}
      sx={{
        width: dimensions.width,
        height: dimensions.height,
        flex: flex ? 1 : undefined,
        flexShrink: 0,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
      aria-hidden="true"
    />
  );
};

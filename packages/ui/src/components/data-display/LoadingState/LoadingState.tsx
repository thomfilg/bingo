import { Box, CircularProgress, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import { Skeleton } from '../../layout/Skeleton/Skeleton';

import type { LoadingStateProps, LoadingStateSize } from './LoadingState.types';

const sizeMap: Record<LoadingStateSize, { spinner: number; text: 'body2' | 'body1' | 'h6' }> = {
  sm: { spinner: 24, text: 'body2' },
  md: { spinner: 40, text: 'body1' },
  lg: { spinner: 56, text: 'h6' },
};

export const LoadingState: React.FC<LoadingStateProps> = React.memo(
  ({
    variant = 'spinner',
    message,
    size = 'md',
    skeletonRows = 3,
    className,
    dataTestId,
  }) => {
    const theme = useTheme();
    const sizeConfig = sizeMap[size];

    if (variant === 'skeleton') {
      return (
        <Box
          role="status"
          aria-busy="true"
          aria-label={message || 'Loading content'}
          className={className}
          data-testid={dataTestId || 'loading-state'}
          sx={{
            width: '100%',
            padding: theme.spacing(3),
          }}
        >
          <Stack spacing={2}>
            {Array.from({ length: skeletonRows }).map((_, index) => (
              <Skeleton
                key={`skeleton-row-${index}`}
                variant="rectangular"
                animation="wave"
                height={size === 'sm' ? 20 : size === 'md' ? 28 : 36}
                width={index === skeletonRows - 1 ? '60%' : '100%'}
                borderRadius={4}
                data-testid={dataTestId ? `${dataTestId}-skeleton-${index}` : undefined}
              />
            ))}
          </Stack>
          {message && (
            <Typography
              variant={sizeConfig.text}
              color="text.secondary"
              sx={{ mt: 2, textAlign: 'center' }}
              data-testid={dataTestId ? `${dataTestId}-message` : 'loading-state-message'}
            >
              {message}
            </Typography>
          )}
        </Box>
      );
    }

    return (
      <Box
        role="status"
        aria-busy="true"
        aria-label={message || 'Loading'}
        className={className}
        data-testid={dataTestId || 'loading-state'}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing(6),
          minHeight: 200,
          gap: theme.spacing(2),
        }}
      >
        <CircularProgress
          size={sizeConfig.spinner}
          data-testid={dataTestId ? `${dataTestId}-spinner` : 'loading-state-spinner'}
        />
        {message && (
          <Typography
            variant={sizeConfig.text}
            color="text.secondary"
            data-testid={dataTestId ? `${dataTestId}-message` : 'loading-state-message'}
          >
            {message}
          </Typography>
        )}
      </Box>
    );
  },
);

LoadingState.displayName = 'LoadingState';

export default LoadingState;

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import type { ErrorStateProps } from './ErrorState.types';

export const ErrorState: React.FC<ErrorStateProps> = React.memo(
  ({
    message,
    title,
    onRetry,
    retryLabel = 'Retry',
    severity = 'error',
    icon,
    className,
    dataTestId,
  }) => {
    const theme = useTheme();
    const titleId = React.useId();

    const color = severity === 'error' ? theme.palette.error : theme.palette.warning;

    const defaultIcon =
      severity === 'error' ? (
        <ErrorOutlineIcon sx={{ fontSize: 48, color: color.main }} />
      ) : (
        <WarningAmberIcon sx={{ fontSize: 48, color: color.main }} />
      );

    return (
      <Box
        role="alert"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={`${titleId}-message`}
        className={className}
        data-testid={dataTestId || 'error-state'}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: theme.spacing(6),
          minHeight: 200,
          gap: theme.spacing(2),
        }}
      >
        <Box
          data-testid={dataTestId ? `${dataTestId}-icon` : 'error-state-icon'}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: color.light,
            opacity: 0.9,
          }}
        >
          {icon || defaultIcon}
        </Box>

        <Stack spacing={1} alignItems="center">
          {title && (
            <Typography
              id={titleId}
              variant="h6"
              component="h3"
              data-testid={dataTestId ? `${dataTestId}-title` : 'error-state-title'}
              sx={{
                fontWeight: theme.typography.fontWeightMedium,
                color: theme.palette.text.primary,
              }}
            >
              {title}
            </Typography>
          )}

          <Typography
            id={`${titleId}-message`}
            variant="body2"
            color="text.secondary"
            data-testid={dataTestId ? `${dataTestId}-message` : 'error-state-message'}
            sx={{
              maxWidth: 400,
              lineHeight: 1.6,
            }}
          >
            {message}
          </Typography>
        </Stack>

        {onRetry && (
          <Button
            variant="outlined"
            color={severity}
            onClick={onRetry}
            startIcon={<RefreshIcon />}
            data-testid={dataTestId ? `${dataTestId}-retry-button` : 'error-state-retry-button'}
            sx={{
              mt: theme.spacing(1),
              minWidth: 120,
            }}
          >
            {retryLabel}
          </Button>
        )}
      </Box>
    );
  },
);

ErrorState.displayName = 'ErrorState';

export default ErrorState;

import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  Button,
  Link,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';

import type { EmptyStateProps } from './EmptyState.types';

export const EmptyState: React.FC<EmptyStateProps> = React.memo(({
  variant = 'default',
  title,
  description,
  illustration,
  primaryAction,
  secondaryAction,
  helpLink,
  onRefresh,
  refreshLabel = 'Refresh',
  onCreate,
  createLabel = 'Create New',
  className,
  dataTestId,
}) => {
  const theme = useTheme();
  const titleId = React.useId();

  return (
    <Box
      role="region"
      aria-labelledby={titleId}
      className={className}
      data-testid={dataTestId || 'empty-state'}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: theme.spacing(6),
        minHeight: 200,
        gap: theme.spacing(3),
      }}
    >
      {/* Illustration */}
      {illustration && (
        <Box
          data-testid={dataTestId ? `${dataTestId}-icon` : 'empty-state-icon'}
          sx={{
            maxWidth: variant === 'illustrated' ? 240 : 120,
            width: '100%',
            height: 'auto',
            opacity: variant === 'minimal' ? 0.6 : 0.8,
            display: variant === 'minimal' ? 'none' : 'block',
          }}
        >
          {illustration}
        </Box>
      )}

      {/* Content */}
      <Stack spacing={2} alignItems="center">
        <Typography
          id={titleId}
          variant="h6"
          component="h3"
          data-testid={dataTestId ? `${dataTestId}-title` : 'empty-state-title'}
          sx={{
            fontWeight: theme.typography.fontWeightMedium,
            color: theme.palette.text.primary,
            maxWidth: 400,
          }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            data-testid={dataTestId ? `${dataTestId}-description` : 'empty-state-description'}
            sx={{
              maxWidth: 480,
              lineHeight: 1.6,
            }}
          >
            {description}
          </Typography>
        )}

        {/* Actions */}
        {(variant === 'action' || primaryAction || secondaryAction || onCreate || onRefresh) && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            sx={{ mt: theme.spacing(2) }}
          >
            {primaryAction && (
              <Button
                variant="contained"
                onClick={primaryAction.onClick}
                data-testid={dataTestId ? `${dataTestId}-primary-action` : 'empty-state-primary-action'}
                sx={{ minWidth: 120 }}
              >
                {primaryAction.label}
              </Button>
            )}

            {onCreate && (
              <Button
                variant="contained"
                onClick={onCreate}
                startIcon={<AddIcon />}
                data-testid={dataTestId ? `${dataTestId}-create-button` : 'empty-state-create-button'}
                sx={{ minWidth: 120 }}
              >
                {createLabel}
              </Button>
            )}

            {secondaryAction && (
              <Button
                variant="outlined"
                onClick={secondaryAction.onClick}
                data-testid={dataTestId ? `${dataTestId}-secondary-action` : 'empty-state-secondary-action'}
                sx={{ minWidth: 120 }}
              >
                {secondaryAction.label}
              </Button>
            )}

            {onRefresh && (
              <Button
                variant="outlined"
                onClick={onRefresh}
                startIcon={<RefreshIcon />}
                data-testid={dataTestId ? `${dataTestId}-refresh-button` : 'empty-state-refresh-button'}
                sx={{ minWidth: 120 }}
              >
                {refreshLabel}
              </Button>
            )}

          </Stack>
        )}

        {/* Help Link */}
        {helpLink && (
          <Link
            href={helpLink.href}
            target={helpLink.external ? '_blank' : undefined}
            rel={helpLink.external ? 'noopener noreferrer' : undefined}
            data-testid={dataTestId ? `${dataTestId}-help-link` : 'empty-state-help-link'}
            sx={{
              mt: theme.spacing(1),
              color: theme.palette.primary.main,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {helpLink.label}
            {helpLink.external && ' ↗'}
          </Link>
        )}
      </Stack>
    </Box>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
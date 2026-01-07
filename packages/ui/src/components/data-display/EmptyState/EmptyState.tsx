import React from 'react';
import {
  Box,
  Button,
  Link,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

import { EmptyStateProps } from './EmptyState.types';

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  title,
  description,
  illustration,
  primaryAction,
  secondaryAction,
  helpLink,
  className,
}) => {
  const theme = useTheme();
  const titleId = React.useId();

  return (
    <Box
      role="region"
      aria-labelledby={titleId}
      className={className}
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
            sx={{
              maxWidth: 480,
              lineHeight: 1.6,
            }}
          >
            {description}
          </Typography>
        )}

        {/* Actions */}
        {(variant === 'action' || primaryAction || secondaryAction) && (
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
                sx={{ minWidth: 120 }}
              >
                {primaryAction.label}
              </Button>
            )}

            {secondaryAction && (
              <Button
                variant="outlined"
                onClick={secondaryAction.onClick}
                sx={{ minWidth: 120 }}
              >
                {secondaryAction.label}
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
};

export default EmptyState;
import React from 'react';
import { Box, Stack, styled } from '@mui/material';

import {
  FormProps,
  FormFieldProps,
  FormLabelProps,
  FormControlProps,
  FormMessageProps,
} from './Form.types';

const StyledForm = styled('form')<{ variant?: FormProps['variant'] }>(({ theme, variant }) => ({
  width: '100%',
  ...(variant === 'inline' && {
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
  }),
}));

const spacingMap = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
};

const maxWidthMap = {
  sm: '600px',
  md: '900px',
  lg: '1200px',
  xl: '1536px',
  full: '100%',
};

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ variant = 'vertical', maxWidth = 'full', spacing = 'md', children, ...props }, ref) => {
    return (
      <StyledForm ref={ref} variant={variant} role="form" {...props}>
        <Box sx={{ maxWidth: maxWidthMap[maxWidth], width: '100%' }}>
          {variant === 'inline' ? (
            children
          ) : (
            <Stack spacing={spacingMap[spacing]}>{children}</Stack>
          )}
        </Box>
      </StyledForm>
    );
  },
);

Form.displayName = 'Form';

const StyledFormField = styled(Box)<{ variant?: 'vertical' | 'horizontal' }>(
  ({ theme, variant }) => ({
    display: variant === 'horizontal' ? 'grid' : 'flex',
    flexDirection: variant === 'horizontal' ? undefined : 'column',
    gridTemplateColumns: variant === 'horizontal' ? '200px 1fr' : undefined,
    gap: theme.spacing(1),
    alignItems: variant === 'horizontal' ? 'center' : undefined,
  }),
);

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  required,
  error,
  helperText,
  children,
}) => {
  return (
    <StyledFormField>
      {label && (
        <FormLabel required={required} error={!!error} htmlFor={name}>
          {label}
        </FormLabel>
      )}
      <FormControl fullWidth>
        {children}
        {(error || helperText) && <FormMessage error={!!error}>{error || helperText}</FormMessage>}
      </FormControl>
    </StyledFormField>
  );
};

const StyledFormLabel = styled('label')<{ error?: boolean }>(({ theme, error }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: error ? theme.palette.error.main : theme.palette.text.primary,
  marginBottom: theme.spacing(0.5),
  display: 'block',
  '&::after': {
    content: '" *"',
    color: theme.palette.error.main,
    display: 'var(--required-display, none)',
  },
}));

export const FormLabel: React.FC<FormLabelProps> = ({ required, error, children, htmlFor }) => {
  return (
    <StyledFormLabel
      error={error}
      htmlFor={htmlFor}
      style={{ '--required-display': required ? 'inline' : 'none' } as React.CSSProperties}
    >
      {children}
    </StyledFormLabel>
  );
};

const StyledFormControl = styled(Box)<{ fullWidth?: boolean }>(({ fullWidth }) => ({
  width: fullWidth ? '100%' : 'auto',
  position: 'relative',
}));

export const FormControl: React.FC<FormControlProps> = ({ fullWidth = true, children }) => {
  // Don't pass error prop to the DOM element
  return <StyledFormControl fullWidth={fullWidth}>{children}</StyledFormControl>;
};

const StyledFormMessage = styled('span')<{ error?: boolean }>(({ theme, error }) => ({
  fontSize: '0.75rem',
  marginTop: theme.spacing(0.5),
  color: error ? theme.palette.error.main : theme.palette.text.secondary,
  display: 'block',
}));

export const FormMessage: React.FC<FormMessageProps> = ({ error, children }) => {
  return <StyledFormMessage error={error}>{children}</StyledFormMessage>;
};

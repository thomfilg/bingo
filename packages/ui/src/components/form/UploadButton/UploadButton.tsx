import React, { useRef, useState, useCallback } from 'react';
import { Box, Button, Typography, LinearProgress, useTheme } from '@mui/material';
import { CloudUploadOutlined, AttachFileOutlined } from '@mui/icons-material';

import { UploadButtonProps, UploadButtonState } from './UploadButton.types';

const UploadButton = React.forwardRef<HTMLInputElement, UploadButtonProps>(
  (
    {
      variant = 'default',
      label = 'Upload File',
      accept,
      capture,
      disabled = false,
      onSelect,
      onUpload,
      uploading: externalUploading = false,
      progress: externalProgress = 0,
      maxSizeMB,
      validate,
      helperText,
      errorText,
      icon,
      className,
      'data-testid': dataTestId,
    },
    ref,
  ) => {
    const theme = useTheme();
    const inputRef = useRef<HTMLInputElement>(null);
    const [state, setState] = useState<UploadButtonState>({
      isDragOver: false,
      isUploading: false,
      uploadProgress: 0,
      error: null,
    });

    // Use external state if provided, otherwise internal state
    const isUploading = externalUploading || state.isUploading;
    const progress = externalUploading ? externalProgress : state.uploadProgress;
    const currentError = errorText || state.error;

    const validateFile = useCallback(
      (file: globalThis.File): string | null => {
        // Size validation
        if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
          return `File size must be less than ${maxSizeMB}MB`;
        }

        // Custom validation
        if (validate) {
          return validate(file);
        }

        return null;
      },
      [maxSizeMB, validate],
    );

    const handleFileSelect = useCallback(
      async (file: globalThis.File) => {
        const validationError = validateFile(file);
        if (validationError) {
          setState((prev) => ({ ...prev, error: validationError }));
          return;
        }

        // Clear any previous errors
        setState((prev) => ({ ...prev, error: null }));

        // Always call onSelect
        onSelect(file);

        // Handle built-in upload if provided
        if (onUpload && !externalUploading) {
          try {
            setState((prev) => ({ ...prev, isUploading: true, uploadProgress: 0 }));

            // Simulate progress for demonstration (in real implementation, this would be handled by the upload function)
            const progressInterval = globalThis.setInterval(() => {
              setState((prev) => {
                if (prev.uploadProgress >= 90) {
                  globalThis.clearInterval(progressInterval);
                  return prev;
                }
                return { ...prev, uploadProgress: prev.uploadProgress + 10 };
              });
            }, 100);

            await onUpload(file);

            globalThis.clearInterval(progressInterval);
            setState((prev) => ({ ...prev, isUploading: false, uploadProgress: 100 }));

            // Reset progress after a delay
            globalThis.setTimeout(() => {
              setState((prev) => ({ ...prev, uploadProgress: 0 }));
            }, 1000);
          } catch (error) {
            setState((prev) => ({
              ...prev,
              isUploading: false,
              uploadProgress: 0,
              error: error instanceof Error ? error.message : 'Upload failed',
            }));
          }
        }
      },
      [onSelect, onUpload, validateFile, externalUploading],
    );

    const handleInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          handleFileSelect(file);
        }
      },
      [handleFileSelect],
    );

    const handleDragEnter = useCallback(
      (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (!disabled) {
          setState((prev) => ({ ...prev, isDragOver: true }));
        }
      },
      [disabled],
    );

    const handleDragLeave = useCallback((event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setState((prev) => ({ ...prev, isDragOver: false }));
    }, []);

    const handleDragOver = useCallback((event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    }, []);

    const handleDrop = useCallback(
      (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setState((prev) => ({ ...prev, isDragOver: false }));

        if (disabled) return;

        const file = event.dataTransfer.files[0];
        if (file) {
          handleFileSelect(file);
        }
      },
      [disabled, handleFileSelect],
    );

    const handleButtonClick = useCallback(() => {
      inputRef.current?.click();
    }, []);

    // Generate unique ID for accessibility
    const inputId = `upload-button-${React.useId()}`;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = currentError ? `${inputId}-error` : undefined;

    const renderDropzone = () => (
      <Box
        component="div"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        sx={{
          border: `2px dashed ${state.isDragOver ? theme.palette.primary.main : theme.palette.divider}`,
          borderRadius: 2,
          padding: 3,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: state.isDragOver ? theme.palette.primary.main + '0A' : 'transparent',
          transition: 'all 0.2s ease-in-out',
          ...(!disabled && {
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: theme.palette.primary.main + '05',
            },
          }),
          opacity: disabled ? 0.6 : 1,
        }}
        className={className}
        data-testid={dataTestId}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleButtonClick();
          }
        }}
        aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}
        aria-label={`Upload file dropzone. ${label}`}
      >
        <Box sx={{ mb: 2 }}>
          {icon || <CloudUploadOutlined sx={{ fontSize: 48, color: 'text.secondary' }} />}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Drop your file here or click to browse
        </Typography>
      </Box>
    );

    const renderButton = () => (
      <Button
        variant={variant === 'outline' ? 'outlined' : variant === 'ghost' ? 'text' : 'contained'}
        disabled={disabled || isUploading}
        onClick={handleButtonClick}
        startIcon={icon || <AttachFileOutlined />}
        className={className}
        data-testid={dataTestId}
        aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}
        sx={{
          ...(variant === 'ghost' && {
            '&:hover': {
              backgroundColor: theme.palette.primary.main + '08',
            },
          }),
        }}
      >
        {isUploading ? 'Uploading...' : label}
      </Button>
    );

    return (
      <Box>
        <input
          ref={ref || inputRef}
          id={inputId}
          type="file"
          accept={accept}
          capture={capture}
          onChange={handleInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
          aria-hidden="true"
        />

        {variant === 'dropzone' ? renderDropzone() : renderButton()}

        {isUploading && progress > 0 && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1 }} />
            <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
              {Math.round(progress)}% uploaded
            </Typography>
          </Box>
        )}

        {helperText && !currentError && (
          <Typography
            id={helperId}
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.5 }}
          >
            {helperText}
          </Typography>
        )}

        {currentError && (
          <Typography
            id={errorId}
            variant="caption"
            color="error"
            sx={{ display: 'block', mt: 0.5 }}
            role="alert"
          >
            {currentError}
          </Typography>
        )}

        {/* Screen reader announcements for drag and drop */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          style={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
        >
          {variant === 'dropzone' && state.isDragOver && 'File ready to drop'}
          {isUploading && `Upload in progress: ${Math.round(progress)}%`}
          {currentError && `Error: ${currentError}`}
        </div>
      </Box>
    );
  },
);

UploadButton.displayName = 'UploadButton';

export { UploadButton };
export type { UploadButtonProps, UploadButtonState };

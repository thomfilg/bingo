import React, { useState } from 'react';
import { Box, IconButton, Tooltip, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ContentCopy, Check } from '@mui/icons-material';

import { CodeProps } from './Code.types';

const StyledCodeContainer = styled(Box, {
  shouldForwardProp: (prop) =>
    !['customVariant', 'customSize', 'copyable'].includes(prop as string),
})<{
  customVariant?: string;
  customSize?: string;
  copyable?: boolean;
}>(({ theme, customVariant = 'inline', customSize = 'md', copyable }) => {
  // Size mapping
  const sizeMap = {
    xs: { fontSize: '0.75rem', padding: '2px 4px' },
    sm: { fontSize: '0.8125rem', padding: '3px 6px' },
    md: { fontSize: '0.875rem', padding: '4px 8px' },
    lg: { fontSize: '1rem', padding: '6px 12px' },
  };

  const blockSizeMap = {
    xs: { fontSize: '0.75rem', padding: '8px 12px' },
    sm: { fontSize: '0.8125rem', padding: '12px 16px' },
    md: { fontSize: '0.875rem', padding: '16px 20px' },
    lg: { fontSize: '1rem', padding: '20px 24px' },
  };

  const baseStyles = {
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", "Courier New", monospace',
    lineHeight: 1.5,
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.2s ease',
    position: 'relative' as const,
  };

  // Variant-specific styles
  const variantStyles = {
    inline: {
      ...baseStyles,
      display: 'inline',
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      color: theme.palette.primary.main,
      border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
      ...sizeMap[customSize as keyof typeof sizeMap],
    },
    block: {
      ...baseStyles,
      display: 'block',
      backgroundColor:
        theme.palette.mode === 'dark'
          ? alpha(theme.palette.grey[900], 0.95)
          : alpha(theme.palette.grey[100], 0.95),
      color:
        theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary,
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      overflow: 'auto',
      whiteSpace: 'pre' as const,
      ...blockSizeMap[customSize as keyof typeof blockSizeMap],
      ...(copyable && {
        paddingTop: blockSizeMap[customSize as keyof typeof blockSizeMap].padding.split(' ')[0],
        paddingRight: '60px',
      }),
    },
    highlight: {
      ...baseStyles,
      display: 'block',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
      color: theme.palette.text.primary,
      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      borderLeft: `4px solid ${theme.palette.primary.main}`,
      overflow: 'auto',
      whiteSpace: 'pre' as const,
      ...blockSizeMap[customSize as keyof typeof blockSizeMap],
      ...(copyable && {
        paddingTop: blockSizeMap[customSize as keyof typeof blockSizeMap].padding.split(' ')[0],
        paddingRight: '60px',
      }),
    },
  };

  return variantStyles[customVariant as keyof typeof variantStyles] || variantStyles.inline;
});

const StyledCode = styled('code')({
  margin: 0,
  padding: 0,
  backgroundColor: 'transparent',
  border: 'none',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  color: 'inherit',
});

const CopyButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  width: 32,
  height: 32,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.8)
      : theme.palette.background.paper,
  backdropFilter: theme.palette.mode === 'dark' ? 'blur(8px)' : 'none',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  boxShadow: theme.palette.mode === 'light' ? theme.shadows[1] : 'none',
  '&:hover': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.9)
        : theme.palette.grey[100],
    transform: 'scale(1.05)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: 16,
  },
}));

const LanguageLabel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(2),
  fontSize: '0.75rem',
  fontWeight: 500,
  color: alpha(theme.palette.text.primary, 0.6),
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.8)
      : theme.palette.background.paper,
  padding: '2px 8px',
  borderRadius: theme.shape.borderRadius / 2,
  backdropFilter: theme.palette.mode === 'dark' ? 'blur(8px)' : 'none',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  boxShadow: theme.palette.mode === 'light' ? theme.shadows[1] : 'none',
}));

export const Code = React.forwardRef<HTMLElement, CodeProps>(
  (
    {
      variant = 'inline',
      language,
      copyable = false,
      lineNumbers = false,
      size = 'md',
      children,
      ...props
    },
    ref,
  ) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      if (typeof children === 'string') {
        try {
          await navigator.clipboard.writeText(children);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          // Silently fail if clipboard access is denied
        }
      }
    };

    const isBlock = variant === 'block' || variant === 'highlight';
    const shouldShowCopy = copyable && isBlock;
    const shouldShowLanguage = language && isBlock;

    // Process children for line numbers if needed
    const processedChildren = React.useMemo(() => {
      if (!lineNumbers || !isBlock || typeof children !== 'string') {
        return children;
      }

      return children.split('\n').map((line, index) => {
        // Use line content hash + line number for more stable keys
        const stableKey = `line-${index + 1}-${line.slice(0, 10).replace(/\s+/g, '')}-${line.length}`;
        
        return (
          <div key={stableKey} style={{ display: 'flex' }}>
            <span
              style={{
                display: 'inline-block',
                minWidth: '3em',
                opacity: 0.5,
                userSelect: 'none',
                marginRight: '1em',
                textAlign: 'right',
              }}
            >
              {index + 1}
            </span>
            <span>{line}</span>
          </div>
        );
      });
    }, [children, lineNumbers, isBlock]);

    return (
      <StyledCodeContainer
        ref={ref}
        component={variant === 'inline' ? 'span' : 'div'}
        customVariant={variant}
        customSize={size}
        copyable={shouldShowCopy}
        {...props}
      >
        {shouldShowLanguage && <LanguageLabel>{language}</LanguageLabel>}

        <StyledCode>{processedChildren}</StyledCode>

        {shouldShowCopy && (
          <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
            <CopyButton onClick={handleCopy} size="small" color={copied ? 'success' : 'default'}>
              {copied ? <Check /> : <ContentCopy />}
            </CopyButton>
          </Tooltip>
        )}
      </StyledCodeContainer>
    );
  },
);

Code.displayName = 'Code';
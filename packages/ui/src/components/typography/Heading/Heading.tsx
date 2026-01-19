import type { Theme } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

import type { HeadingProps } from './Heading.types';

const getColorFromTheme = (theme: Theme, color: string) => {
  if (color === 'neutral') {
    return theme.palette.text.primary;
  }

  const colorMap: Record<string, string> = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    danger: theme.palette.error.main,
  };

  return colorMap[color] || theme.palette.text.primary;
};

// Create styled versions of each heading element
const createStyledHeading = () =>
  styled('h1', {
    shouldForwardProp: (prop) =>
      !['customLevel', 'customColor', 'customWeight', 'gradient'].includes(prop as string),
  })<{
    customLevel?: string;
    customColor?: string;
    customWeight?: string;
    gradient?: boolean;
  }>(({ theme, customLevel = 'h2', customColor = 'neutral', customWeight = 'bold', gradient }) => {
    const textColor = getColorFromTheme(theme, customColor);

    // Weight mapping
    const weightMap = {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    };

    // Level-specific styles
    const levelStyles = {
      h1: {
        fontSize: '3rem',
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        fontWeight:
          customWeight === 'normal' ? 700 : weightMap[customWeight as keyof typeof weightMap],
      },
      h2: {
        fontSize: '2.5rem',
        lineHeight: 1.2,
        letterSpacing: '-0.015em',
        fontWeight:
          customWeight === 'normal' ? 700 : weightMap[customWeight as keyof typeof weightMap],
      },
      h3: {
        fontSize: '2rem',
        lineHeight: 1.25,
        letterSpacing: '-0.01em',
        fontWeight:
          customWeight === 'normal' ? 600 : weightMap[customWeight as keyof typeof weightMap],
      },
      h4: {
        fontSize: '1.5rem',
        lineHeight: 1.3,
        letterSpacing: '-0.005em',
        fontWeight:
          customWeight === 'normal' ? 600 : weightMap[customWeight as keyof typeof weightMap],
      },
      h5: {
        fontSize: '1.25rem',
        lineHeight: 1.4,
        fontWeight:
          customWeight === 'normal' ? 600 : weightMap[customWeight as keyof typeof weightMap],
      },
      h6: {
        fontSize: '1.125rem',
        lineHeight: 1.4,
        fontWeight:
          customWeight === 'normal' ? 600 : weightMap[customWeight as keyof typeof weightMap],
      },
      display: {
        fontSize: '4rem',
        lineHeight: 0.95,
        letterSpacing: '-0.03em',
        fontWeight:
          customWeight === 'normal' ? 800 : weightMap[customWeight as keyof typeof weightMap],
      },
    };

    const baseStyles = {
      fontFamily: theme.typography.h1.fontFamily,
      margin: 0,
      transition: 'all 0.2s ease',
      ...levelStyles[customLevel as keyof typeof levelStyles],
    };

    // Gradient text effect
    if (gradient) {
      const gradientColor =
        customColor === 'primary'
          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
          : customColor === 'secondary'
            ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`
            : customColor === 'success'
              ? `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.dark} 100%)`
              : customColor === 'warning'
                ? `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.dark} 100%)`
                : customColor === 'danger'
                  ? `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.dark} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`;

      return {
        ...baseStyles,
        background: gradientColor,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        MozBackgroundClip: 'text',
        MozTextFillColor: 'transparent',
      };
    }

    return {
      ...baseStyles,
      color: textColor,
    };
  });

// Create styled components for each heading level
const StyledH1 = createStyledHeading().withComponent('h1');
const StyledH2 = createStyledHeading().withComponent('h2');
const StyledH3 = createStyledHeading().withComponent('h3');
const StyledH4 = createStyledHeading().withComponent('h4');
const StyledH5 = createStyledHeading().withComponent('h5');
const StyledH6 = createStyledHeading().withComponent('h6');

export const Heading = React.forwardRef<globalThis.HTMLHeadingElement, HeadingProps>(
  (
    { level = 'h2', color = 'neutral', weight = 'bold', gradient = false, children, ...props },
    ref,
  ) => {
    const commonProps = {
      ref,
      customLevel: level,
      customColor: color,
      customWeight: weight,
      gradient,
      ...props,
    };

    // Return the appropriate styled heading component based on level
    switch (level) {
      case 'h1':
      case 'display':
        return <StyledH1 {...commonProps}>{children}</StyledH1>;
      case 'h2':
        return <StyledH2 {...commonProps}>{children}</StyledH2>;
      case 'h3':
        return <StyledH3 {...commonProps}>{children}</StyledH3>;
      case 'h4':
        return <StyledH4 {...commonProps}>{children}</StyledH4>;
      case 'h5':
        return <StyledH5 {...commonProps}>{children}</StyledH5>;
      case 'h6':
        return <StyledH6 {...commonProps}>{children}</StyledH6>;
      default:
        return <StyledH2 {...commonProps}>{children}</StyledH2>;
    }
  },
);

Heading.displayName = 'Heading';

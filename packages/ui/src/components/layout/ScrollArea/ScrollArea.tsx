import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Fab, Zoom, alpha, useTheme, CircularProgress } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';

import { ScrollAreaProps } from './ScrollArea.types';

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  width = '100%',
  height = '100%',
  maxHeight,
  maxWidth,
  orientation = 'vertical',
  scrollbarSize = 'medium',
  autoHide = true,
  autoHideDelay = 1000,
  smoothScroll = true,
  variant = 'default',
  onScroll,
  scrollToTopButton = false,
  scrollToTopThreshold = 100,
  scrollbarColor,
  scrollbarTrackColor,
  contentPadding = 0,
  alwaysShowScrollbar = false,
  disabled = false,
  loading = false,
  emptyContent,
  testId = 'scroll-area',
  sx,
  ...props
}) => {
  const theme = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | undefined>();

  // Get scrollbar size in pixels
  const getScrollbarSize = () => {
    switch (scrollbarSize) {
      case 'thin':
        return 8;
      case 'thick':
        return 16;
      default:
        return 12;
    }
  };

  // Get scrollbar colors
  const getScrollbarColors = () => {
    const defaultScrollbarColor =
      variant === 'glass'
        ? alpha(theme.palette.primary.main, 0.5)
        : theme.palette.mode === 'dark'
          ? theme.palette.grey[600]
          : theme.palette.grey[400];

    const defaultTrackColor =
      variant === 'glass'
        ? alpha(theme.palette.background.paper, 0.1)
        : theme.palette.mode === 'dark'
          ? theme.palette.grey[900]
          : theme.palette.grey[200];

    return {
      scrollbar: scrollbarColor || defaultScrollbarColor,
      track: scrollbarTrackColor || defaultTrackColor,
    };
  };

  // Get overflow style based on orientation
  const getOverflowStyle = () => {
    if (disabled) return { overflow: 'hidden' as const };

    switch (orientation) {
      case 'horizontal':
        return {
          overflow: 'hidden' as const,
          overflowX: 'auto' as const,
          overflowY: 'hidden' as const,
        };
      case 'both':
        return { overflow: 'auto' as const };
      default:
        return {
          overflow: 'hidden' as const,
          overflowY: 'auto' as const,
          overflowX: 'hidden' as const,
        };
    }
  };

  // Handle scroll event
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (disabled) return;

      // Handle auto-hide behavior
      if (autoHide && !alwaysShowScrollbar) {
        setIsScrolling(true);
        if (scrollTimeoutRef.current) {
          window.clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = window.setTimeout(() => {
          setIsScrolling(false);
        }, autoHideDelay);
      }

      // Check if should show scroll to top button
      if (scrollToTopButton && scrollRef.current) {
        const scrollTop = scrollRef.current.scrollTop;
        setShowScrollToTop(scrollTop > scrollToTopThreshold);
      }

      // Call user's onScroll handler
      if (onScroll) {
        onScroll(event);
      }
    },
    [
      disabled,
      autoHide,
      alwaysShowScrollbar,
      autoHideDelay,
      scrollToTopButton,
      scrollToTopThreshold,
      onScroll,
    ],
  );

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: smoothScroll ? 'smooth' : 'auto',
      });
    }
  }, [smoothScroll]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Get variant-specific styles
  const getVariantStyles = () => {
    const colors = getScrollbarColors();
    const size = getScrollbarSize();

    const baseScrollbarStyles = {
      '&::-webkit-scrollbar': {
        width: orientation !== 'horizontal' ? size : '100%',
        height: orientation !== 'vertical' ? size : '100%',
      },
      '&::-webkit-scrollbar-track': {
        background: colors.track,
        borderRadius: size / 2,
      },
      '&::-webkit-scrollbar-thumb': {
        background: colors.scrollbar,
        borderRadius: size / 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          background: theme.palette.primary.main,
        },
      },
      '&::-webkit-scrollbar-corner': {
        background: colors.track,
      },
      scrollbarWidth: scrollbarSize === 'thin' ? ('thin' as const) : ('auto' as const),
      scrollbarColor: `${colors.scrollbar} ${colors.track}`,
    };

    switch (variant) {
      case 'overlay':
        return {
          '&::-webkit-scrollbar': {
            width: orientation !== 'horizontal' ? size : '100%',
            height: orientation !== 'vertical' ? size : '100%',
            position: 'absolute',
            right: 0,
            top: 0,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
            borderRadius: size / 2,
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(
              colors.scrollbar,
              autoHide && !isScrolling && !alwaysShowScrollbar ? 0 : 0.5,
            ),
            borderRadius: size / 2,
            transition: 'all 0.2s ease',
            border: `2px solid transparent`,
            backgroundClip: 'padding-box',
            '&:hover': {
              background: theme.palette.primary.main,
            },
          },
          '&::-webkit-scrollbar-corner': {
            background: colors.track,
          },
          scrollbarWidth: scrollbarSize === 'thin' ? ('thin' as const) : ('auto' as const),
          scrollbarColor: `${colors.scrollbar} ${colors.track}`,
        };

      case 'glass':
        return {
          '&::-webkit-scrollbar': {
            width: orientation !== 'horizontal' ? size : '100%',
            height: orientation !== 'vertical' ? size : '100%',
          },
          '&::-webkit-scrollbar-track': {
            background: alpha(theme.palette.background.paper, 0.1),
            borderRadius: size / 2,
            backdropFilter: 'blur(5px)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.secondary.main, 0.3)})`,
            borderRadius: size / 2,
            transition: 'all 0.2s ease',
            boxShadow: `inset 0 0 6px ${alpha(theme.palette.common.white, 0.3)}`,
            '&:hover': {
              background: theme.palette.primary.main,
            },
          },
          '&::-webkit-scrollbar-corner': {
            background: colors.track,
          },
          scrollbarWidth: scrollbarSize === 'thin' ? ('thin' as const) : ('auto' as const),
          scrollbarColor: `${colors.scrollbar} ${colors.track}`,
          backdropFilter: 'blur(10px)',
        };

      default:
        return {
          ...baseScrollbarStyles,
          '&::-webkit-scrollbar-thumb': {
            background: colors.scrollbar,
            borderRadius: size / 2,
            transition: 'all 0.2s ease',
            opacity: autoHide && !isScrolling && !alwaysShowScrollbar ? 0 : 1,
            '&:hover': {
              background: theme.palette.primary.main,
            },
          },
        };
    }
  };

  // Render empty content if no children and emptyContent is provided
  const renderContent = () => {
    if (!children && emptyContent) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: 200,
            color: theme.palette.text.secondary,
          }}
        >
          {emptyContent}
        </Box>
      );
    }
    return children;
  };

  return (
    <Box
      data-testid={testId}
      sx={{
        position: 'relative',
        width,
        height,
        maxHeight,
        maxWidth,
        ...sx,
      }}
      {...props}
    >
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        role="region"
        aria-label="Scrollable content"
        aria-busy={loading}
        tabIndex={disabled ? -1 : 0}
        sx={{
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          padding: contentPadding,
          opacity: loading ? 0.5 : 1,
          pointerEvents: disabled || loading ? 'none' : 'auto',
          transition: 'opacity 0.3s ease',
          '&:focus': {
            outline: 'none',
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: -2,
            },
          },
          ...getOverflowStyle(),
          ...getVariantStyles(),
        }}
        style={{
          scrollBehavior: smoothScroll ? 'smooth' : 'auto',
        }}
      >
        {renderContent()}
      </Box>

      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Scroll to top button */}
      {scrollToTopButton && !disabled && !loading && (
        <Zoom in={showScrollToTop}>
          <Fab
            size="small"
            aria-label="Scroll to top"
            onClick={scrollToTop}
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              zIndex: 1,
              backgroundColor:
                variant === 'glass'
                  ? alpha(theme.palette.primary.main, 0.2)
                  : theme.palette.primary.main,
              backdropFilter: variant === 'glass' ? 'blur(10px)' : 'none',
              '&:hover': {
                backgroundColor:
                  variant === 'glass'
                    ? alpha(theme.palette.primary.main, 0.3)
                    : theme.palette.primary.dark,
              },
            }}
          >
            <KeyboardArrowUp />
          </Fab>
        </Zoom>
      )}
    </Box>
  );
};

import React, { FC, useEffect, useRef, useState } from 'react';
import { Box, alpha, styled, useTheme } from '@mui/material';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

import { LottieSize, LottieAnimationProps } from './LottieAnimation.types';

// Size configurations
const sizeConfigs: Record<LottieSize, number> = {
  sm: 120,
  md: 200,
  lg: 300,
  xl: 400,
  '2xl': 500,
};

// Styled components
const LottieContainer = styled(Box)<{
  containerSize: number;
  background: 'glass' | 'solid' | 'none';
  glow: boolean;
  interactive: boolean;
}>(({ theme, containerSize, background, glow, interactive }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: containerSize,
  height: containerSize,
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.short,
  }),

  ...(background === 'glass' && {
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.18)}`,
  }),

  ...(background === 'solid' && {
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[2],
  }),

  ...(glow && {
    boxShadow: `
      0 0 20px ${alpha(theme.palette.primary.main, 0.3)},
      0 0 40px ${alpha(theme.palette.primary.main, 0.2)},
      0 0 60px ${alpha(theme.palette.primary.main, 0.1)}
    `,
  }),

  ...(interactive && {
    cursor: 'pointer',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: theme.shadows[8],
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
  }),

  '& > div': {
    width: '100% !important',
    height: '100% !important',
  },
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(4px)',
  zIndex: 1,
}));

const ProgressIndicator = styled(Box)<{ progress: number }>(({ theme, progress }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 4,
  background: alpha(theme.palette.primary.main, 0.1),
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: `${progress}%`,
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
    transition: 'width 0.3s ease',
  },
}));

// Main component
export const LottieAnimation: FC<LottieAnimationProps> = ({
  src,
  size = 'md',
  autoplay = true,
  loop = true,
  onComplete,
  speed = 1,
  direction = 1,
  className,
  style,
  background = 'none',
  glow = false,
  interactive = false,
  onSegmentComplete,
  segments,
}) => {
  const theme = useTheme();
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const containerSize = sizeConfigs[size];

  // Load animation data if src is a string (URL)
  useEffect(() => {
    const loadAnimation = async () => {
      if (typeof src === 'string') {
        setIsLoading(true);
        try {
          const response = await window.fetch(src);
          const data = await response.json();
          setAnimationData(data);
          setIsLoading(false);
        } catch {
          // Silently handle fetch errors - animation will remain in loading state
          setIsLoading(false);
        }
      } else {
        // src is already a JSON object
        setAnimationData(src);
        setIsLoading(false);
      }
    };

    loadAnimation();
  }, [src]);

  // Handle animation complete
  const handleComplete = () => {
    if (!loop && onComplete) {
      onComplete();
    }
    setProgress(100);
  };

  // Handle animation progress
  const handleEnterFrame = () => {
    if (lottieRef.current) {
      const currentFrame = lottieRef.current.getDuration(true)
        ? (lottieRef.current as { animationItem?: { currentFrame?: number } }).animationItem
            ?.currentFrame || 0
        : 0;
      const totalFrames = lottieRef.current.getDuration(true) || 1;
      const progressPercentage = (currentFrame / totalFrames) * 100;
      setProgress(progressPercentage);
    }
  };

  // Handle interactive click
  const handleClick = () => {
    if (!interactive) return;

    if (lottieRef.current) {
      if (isPlaying) {
        lottieRef.current.pause();
        setIsPlaying(false);
      } else {
        lottieRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Apply speed and direction
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(speed);
      lottieRef.current.setDirection(direction);

      if (segments) {
        lottieRef.current.playSegments(segments as [number, number], true);
      }
    }
  }, [speed, direction, segments]);

  if (!animationData) {
    return (
      <LottieContainer
        containerSize={containerSize}
        background={background}
        glow={glow}
        interactive={false}
        className={className}
        style={style}
      >
        <LoadingOverlay>
          <Box
            sx={{
              width: 40,
              height: 40,
              border: `3px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderTop: `3px solid ${theme.palette.primary.main}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' },
              },
            }}
          />
        </LoadingOverlay>
      </LottieContainer>
    );
  }

  return (
    <LottieContainer
      containerSize={containerSize}
      background={background}
      glow={glow}
      interactive={interactive}
      className={className}
      style={style}
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? (isPlaying ? 'Pause animation' : 'Play animation') : 'Animation'}
    >
      {isLoading && (
        <LoadingOverlay>
          <Box
            sx={{
              width: 40,
              height: 40,
              border: `3px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderTop: `3px solid ${theme.palette.primary.main}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' },
              },
            }}
          />
        </LoadingOverlay>
      )}

      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        onComplete={handleComplete}
        onEnterFrame={handleEnterFrame}
        onSegmentStart={onSegmentComplete ? () => onSegmentComplete(0) : undefined}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice',
        }}
      />

      {!loop && !isLoading && <ProgressIndicator progress={progress} />}
    </LottieContainer>
  );
};

// Export default
export default LottieAnimation;

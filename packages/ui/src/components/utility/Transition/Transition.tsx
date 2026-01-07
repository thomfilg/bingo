import React from 'react';
import {
  Fade,
  Slide,
  Grow,
  Collapse,
  Zoom,
  useTheme,
} from '@mui/material';

import { CustomTransitionProps } from './Transition.types';

export const Transition: React.FC<CustomTransitionProps> = ({
  children,
  variant = 'fade',
  direction = 'up',
  duration,
  delay = 0,
  easing,
  in: inProp,
  ...props
}) => {
  const theme = useTheme();

  const getDuration = () => {
    if (typeof duration === 'number') {
      return duration;
    }
    
    if (typeof duration === 'object') {
      return duration;
    }

    // Default durations based on variant
    switch (variant) {
      case 'fade':
        return theme.transitions.duration.shorter;
      case 'slide':
        return theme.transitions.duration.enteringScreen;
      case 'scale':
      case 'grow':
      case 'zoom':
        return theme.transitions.duration.shorter;
      case 'collapse':
        return theme.transitions.duration.standard;
      default:
        return theme.transitions.duration.standard;
    }
  };

  const getEasing = () => {
    if (typeof easing === 'string') {
      return easing;
    }
    
    if (typeof easing === 'object') {
      return easing;
    }

    // Default easing based on variant
    switch (variant) {
      case 'slide':
        return theme.transitions.easing.easeOut;
      case 'scale':
      case 'grow':
      case 'zoom':
        return theme.transitions.easing.easeInOut;
      default:
        return theme.transitions.easing.easeInOut;
    }
  };

  const transitionProps = {
    in: inProp,
    timeout: getDuration(),
    easing: getEasing(),
    style: {
      transitionDelay: `${delay}ms`,
    },
    ...props,
  };

  switch (variant) {
    case 'fade':
      return (
        <Fade {...transitionProps}>
          <div>{children}</div>
        </Fade>
      );

    case 'slide':
      return (
        <Slide direction={direction} {...transitionProps}>
          <div>{children}</div>
        </Slide>
      );

    case 'scale':
    case 'grow':
      return (
        <Grow {...transitionProps}>
          <div>{children}</div>
        </Grow>
      );

    case 'collapse':
      return (
        <Collapse {...transitionProps}>
          <div>{children}</div>
        </Collapse>
      );

    case 'zoom':
      return (
        <Zoom {...transitionProps}>
          <div>{children}</div>
        </Zoom>
      );

    default:
      return (
        <Fade {...transitionProps}>
          <div>{children}</div>
        </Fade>
      );
  }
};
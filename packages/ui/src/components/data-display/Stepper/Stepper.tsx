import React from 'react';
import {
  Box,
  Typography,
  Button,
  styled,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

import { StepperProps, StepItemProps } from './Stepper.types';

const StepperRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'orientation',
})<{ orientation: 'horizontal' | 'vertical' }>(({ orientation }) => ({
  display: 'flex',
  flexDirection: orientation === 'horizontal' ? 'row' : 'column',
  alignItems: orientation === 'horizontal' ? 'center' : 'flex-start',
}));

const StepItem = styled(Box, {
  shouldForwardProp: (prop) => !['orientation', 'isLast'].includes(prop as string),
})<{ orientation: 'horizontal' | 'vertical'; isLast: boolean }>(({ orientation, isLast }) => ({
  display: 'flex',
  flexDirection: orientation === 'horizontal' ? 'column' : 'row',
  alignItems: 'center',
  flex: orientation === 'horizontal' && !isLast ? 1 : 'none',
  position: 'relative',
}));

const StepButton = styled(Button, {
  shouldForwardProp: (prop) => !['isActive', 'isCompleted', 'clickable'].includes(prop as string),
})<{ isActive: boolean; isCompleted: boolean; clickable: boolean }>(
  ({ theme, isActive, isCompleted, clickable }) => ({
    minWidth: 48,
    height: 48,
    borderRadius: '50%',
    padding: 0,
    backgroundColor: isCompleted
      ? theme.palette.primary.main
      : isActive
      ? theme.palette.primary.main
      : theme.palette.grey[300],
    color: isCompleted || isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
    cursor: clickable ? 'pointer' : 'default',
    pointerEvents: clickable ? 'auto' : 'none',
    transition: theme.transitions.create(['background-color', 'transform'], {
      duration: theme.transitions.duration.short,
    }),
    '&:hover': clickable
      ? {
          backgroundColor: isCompleted
            ? theme.palette.primary.dark
            : isActive
            ? theme.palette.primary.dark
            : theme.palette.grey[400],
          transform: 'scale(1.05)',
        }
      : {},
    '&:disabled': {
      backgroundColor: theme.palette.grey[300],
      color: theme.palette.text.disabled,
    },
  }),
);

const StepConnector = styled(Box, {
  shouldForwardProp: (prop) => !['orientation', 'isCompleted'].includes(prop as string),
})<{ orientation: 'horizontal' | 'vertical'; isCompleted: boolean }>(
  ({ theme, orientation, isCompleted }) => ({
    backgroundColor: isCompleted ? theme.palette.primary.main : theme.palette.grey[300],
    transition: theme.transitions.create('background-color', {
      duration: theme.transitions.duration.short,
    }),
    ...(orientation === 'horizontal'
      ? {
          width: '100%',
          height: 2,
          margin: '0 8px',
        }
      : {
          width: 2,
          height: 32,
          margin: '8px 0',
          marginLeft: 23, // Center with step button
        }),
  }),
);

const StepLabel = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'orientation',
})<{ orientation: 'horizontal' | 'vertical' }>(({ orientation }) => ({
  textAlign: orientation === 'horizontal' ? 'center' : 'left',
  marginTop: orientation === 'horizontal' ? 8 : 0,
  marginLeft: orientation === 'vertical' ? 16 : 0,
}));

const StepperItem: React.FC<StepItemProps> = ({
  step,
  index,
  isActive,
  isCompleted,
  isLast,
  orientation,
  variant,
  clickable,
  onStepClick,
  renderConnector,
  nextStep,
}) => {
  const isClickable = clickable && !step.disabled && (variant === 'non-linear' || !isActive);

  const handleStepClick = () => {
    if (isClickable && onStepClick) {
      onStepClick(step.id);
    }
  };

  return (
    <StepItem orientation={orientation} isLast={isLast} role="listitem">
      <Box display="flex" flexDirection={orientation === 'horizontal' ? 'column' : 'row'} alignItems="center">
        <StepButton
          isActive={isActive}
          isCompleted={isCompleted}
          clickable={isClickable}
          onClick={handleStepClick}
          disabled={step.disabled}
          aria-current={isActive ? 'step' : undefined}
          aria-label={`Step ${index + 1}: ${step.label}${step.optional ? ' (optional)' : ''}${
            isCompleted ? ' (completed)' : isActive ? ' (current)' : ''
          }`}
        >
          {isCompleted ? (
            <CheckCircle />
          ) : (
            <Typography variant="body2" fontWeight="bold">
              {index + 1}
            </Typography>
          )}
        </StepButton>

        <StepLabel orientation={orientation}>
          <Typography
            variant="body2"
            fontWeight={isActive ? 'bold' : 'normal'}
            color={isActive ? 'primary' : 'textPrimary'}
          >
            {step.label}
            {step.optional && (
              <Typography
                component="span"
                variant="caption"
                color="textSecondary"
                sx={{ ml: 1 }}
              >
                (optional)
              </Typography>
            )}
          </Typography>
          {step.description && (
            <Typography variant="caption" color="textSecondary" display="block">
              {step.description}
            </Typography>
          )}
        </StepLabel>
      </Box>

      {!isLast && (
        <>
          {renderConnector && nextStep ? (
            renderConnector(step, nextStep, { completed: isCompleted, active: isActive })
          ) : (
            <StepConnector orientation={orientation} isCompleted={isCompleted} />
          )}
        </>
      )}
    </StepItem>
  );
};

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeId,
  completed = new Set(),
  orientation = 'horizontal',
  variant = 'linear',
  onStepChange,
  clickable,
  renderConnector,
  className,
  'data-testid': dataTestId,
}) => {
  // Determine clickable behavior
  const isClickable = clickable ?? variant === 'non-linear';

  return (
    <StepperRoot
      component="ol"
      orientation={orientation}
      className={className}
      data-testid={dataTestId}
      sx={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
      }}
    >
      {steps.map((step, index) => {
        const isActive = step.id === activeId;
        const isCompleted = completed.has(step.id);
        const isLast = index === steps.length - 1;
        const nextStep = !isLast ? steps[index + 1] : undefined;

        return (
          <StepperItem
            key={step.id}
            step={step}
            index={index}
            isActive={isActive}
            isCompleted={isCompleted}
            isLast={isLast}
            orientation={orientation}
            variant={variant}
            clickable={isClickable}
            onStepClick={onStepChange}
            renderConnector={renderConnector}
            nextStep={nextStep}
          />
        );
      })}
    </StepperRoot>
  );
};
import React from 'react';
import { 
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  AccordionActions as MuiAccordionActions,
  useTheme,
  alpha
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { 
  AccordionProps, 
  AccordionSummaryProps, 
  AccordionDetailsProps, 
  AccordionActionsProps 
} from './Accordion.types';

export const Accordion: React.FC<AccordionProps> = ({
  children,
  variant = 'default',
  disabled = false,
  defaultExpanded = false,
  expanded,
  onChange,
  sx,
  'data-testid': testId = 'accordion',
  ...props
}) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    const baseTransition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
    switch (variant) {
      case 'glass':
        return {
          backgroundColor: alpha(theme.palette.background.paper, 0.08),
          backdropFilter: 'blur(24px) saturate(180%)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          borderRadius: theme.spacing(1.5),
          transition: baseTransition,
          '&:before': {
            display: 'none',
          },
          '&:hover': {
            backgroundColor: alpha(theme.palette.background.paper, 0.12),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            transform: 'translateY(-1px)',
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
          },
          '&.Mui-expanded': {
            backgroundColor: alpha(theme.palette.background.paper, 0.15),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          },
        };
      case 'bordered':
        return {
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.spacing(1),
          transition: baseTransition,
          '&:before': {
            display: 'none',
          },
          '&:not(:last-child)': {
            marginBottom: theme.spacing(1),
          },
          '&:hover': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}`,
          },
          '&.Mui-expanded': {
            borderColor: theme.palette.primary.main,
          },
        };
      case 'separated':
        return {
          boxShadow: theme.shadows[2],
          borderRadius: theme.spacing(1.5),
          transition: baseTransition,
          '&:before': {
            display: 'none',
          },
          '&:not(:last-child)': {
            marginBottom: theme.spacing(2),
          },
          '&:hover': {
            boxShadow: theme.shadows[4],
            transform: 'translateY(-2px)',
          },
          '&.Mui-expanded': {
            boxShadow: theme.shadows[6],
            transform: 'translateY(-1px)',
          },
        };
      default:
        return {
          transition: baseTransition,
          '&:hover': {
            backgroundColor: alpha(theme.palette.action.hover, 0.04),
          },
        };
    }
  };

  return (
    <MuiAccordion
      disabled={disabled}
      defaultExpanded={defaultExpanded}
      expanded={expanded}
      onChange={onChange}
      data-testid={testId}
      sx={{
        ...getVariantStyles(),
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiAccordion>
  );
};

export const AccordionSummary: React.FC<AccordionSummaryProps> = ({
  children,
  expandIcon = <ExpandMoreIcon />,
  disabled = false,
  'data-testid': testId = 'accordion-summary',
  ...props
}) => {
  const theme = useTheme();
  
  return (
    <MuiAccordionSummary
      expandIcon={expandIcon}
      disabled={disabled}
      data-testid={testId}
      sx={{
        minHeight: 56,
        '& .MuiAccordionSummary-expandIconWrapper': {
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          color: theme.palette.text.secondary,
        },
        '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
          transform: 'rotate(180deg)',
          color: theme.palette.primary.main,
        },
        '&:hover': {
          backgroundColor: alpha(theme.palette.action.hover, 0.04),
          '& .MuiAccordionSummary-expandIconWrapper': {
            color: theme.palette.primary.main,
          },
        },
        '&.Mui-focusVisible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
        // Enhanced keyboard navigation styles
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: -2,
        },
      }}
      {...props}
    >
      {children}
    </MuiAccordionSummary>
  );
};

export const AccordionDetails: React.FC<AccordionDetailsProps> = ({
  children,
  'data-testid': testId = 'accordion-details',
  ...props
}) => {
  const theme = useTheme();

  return (
    <MuiAccordionDetails 
      data-testid={testId}
      sx={{
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        // Smooth content reveal animation
        '& > *': {
          animation: 'fadeInUp 0.4s ease-out',
        },
        '@keyframes fadeInUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(8px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
      {...props}
    >
      {children}
    </MuiAccordionDetails>
  );
};

export const AccordionActions: React.FC<AccordionActionsProps> = ({
  children,
  disableSpacing = false,
  'data-testid': testId = 'accordion-actions',
  ...props
}) => {
  const theme = useTheme();

  return (
    <MuiAccordionActions 
      disableSpacing={disableSpacing}
      data-testid={testId}
      sx={{
        padding: theme.spacing(1, 2),
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.5),
        backdropFilter: 'blur(8px)',
        // Animate button entries
        '& > *': {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      }}
      {...props}
    >
      {children}
    </MuiAccordionActions>
  );
};
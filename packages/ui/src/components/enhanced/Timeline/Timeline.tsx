import React, { FC } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
  alpha,
  keyframes,
  styled,
  Collapse,
  Fade,
} from '@mui/material';
import { ExpandMore as ExpandIcon, Circle as DotIcon } from '@mui/icons-material';

// Types
export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  color?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  expanded?: boolean;
  metadata?: Record<string, string>;
}

export interface TimelineProps {
  items: TimelineItem[];
  variant?: 'default' | 'compact' | 'detailed';
  orientation?: 'vertical' | 'horizontal';
  showConnector?: boolean;
  animated?: boolean;
  alternating?: boolean;
  onItemClick?: (item: TimelineItem) => void;
}

// Animation keyframes
const slideInAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

// Styled components
const TimelineContainer = styled(Box)<{ orientation: 'vertical' | 'horizontal' }>(
  ({ theme, orientation }) => ({
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    gap: theme.spacing(2),
    position: 'relative',
    width: '100%',
    ...(orientation === 'horizontal' && {
      overflowX: 'auto',
      paddingBottom: theme.spacing(2),
      '&::-webkit-scrollbar': {
        height: 8,
      },
      '&::-webkit-scrollbar-track': {
        background: alpha(theme.palette.action.disabled, 0.1),
        borderRadius: 4,
      },
      '&::-webkit-scrollbar-thumb': {
        background: alpha(theme.palette.primary.main, 0.3),
        borderRadius: 4,
        '&:hover': {
          background: alpha(theme.palette.primary.main, 0.5),
        },
      },
    }),
  }),
);

const TimelineItemContainer = styled(Box, {
  shouldForwardProp: (prop) => !['animated', 'alternating', 'index'].includes(prop as string),
})<{
  animated: boolean;
  alternating: boolean;
  index: number;
  orientation: 'vertical' | 'horizontal';
}>(({ theme, animated, alternating, index, orientation }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  position: 'relative',
  ...(animated && {
    animation: `${slideInAnimation} 0.5s ease ${index * 0.1}s both`,
  }),
  ...(orientation === 'vertical' &&
    alternating && {
      flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
      textAlign: index % 2 === 0 ? 'left' : 'right',
    }),
  ...(orientation === 'horizontal' && {
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 280,
  }),
}));

const TimelineConnector = styled(Box, {
  shouldForwardProp: (prop) => !['isLast'].includes(prop as string),
})<{
  orientation: 'vertical' | 'horizontal';
  isLast: boolean;
}>(({ theme, orientation, isLast }) => ({
  position: 'absolute',
  background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.3)} 100%)`,
  ...(orientation === 'vertical'
    ? {
        width: 2,
        height: isLast ? 0 : 'calc(100% + 16px)',
        left: 19,
        top: 40,
      }
    : {
        height: 2,
        width: isLast ? 0 : 'calc(100% + 16px)',
        top: 19,
        left: 40,
      }),
}));

const TimelineDot = styled(Box, {
  shouldForwardProp: (prop) => !['dotColor', 'hasIcon'].includes(prop as string),
})<{ dotColor?: string; hasIcon: boolean }>(({ theme, dotColor, hasIcon }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: dotColor
    ? `linear-gradient(135deg, ${dotColor} 0%, ${alpha(dotColor, 0.8)} 100%)`
    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  boxShadow: `0 4px 12px ${alpha(dotColor || theme.palette.primary.main, 0.3)}`,
  border: `2px solid ${theme.palette.background.paper}`,
  zIndex: 1,
  flexShrink: 0,
  animation: `${pulseAnimation} 2s ease infinite`,
  '& svg': {
    fontSize: hasIcon ? '1.2rem' : '0.8rem',
    color: theme.palette.background.paper,
  },
}));

const TimelineCard = styled(Card, {
  shouldForwardProp: (prop) => !['timelineVariant'].includes(prop as string),
})<{ timelineVariant: 'default' | 'compact' | 'detailed' }>(({ theme, timelineVariant }) => ({
  flex: 1,
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.18)}`,
  transition: theme.transitions.create(['transform', 'box-shadow']),
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
  ...(timelineVariant === 'compact' && {
    padding: theme.spacing(1.5),
    '& .MuiCardContent-root': {
      padding: 0,
      '&:last-child': {
        paddingBottom: 0,
      },
    },
  }),
}));

const TimelineTimestamp = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  fontWeight: 500,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
}));

const MetadataChip = styled(Chip)(({ theme }) => ({
  height: 24,
  fontSize: '0.75rem',
  background: alpha(theme.palette.primary.main, 0.08),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

// Main component
export const Timeline: FC<TimelineProps> = ({
  items,
  variant = 'default',
  orientation = 'vertical',
  showConnector = true,
  animated = true,
  alternating = false,
  onItemClick,
}) => {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const handleExpandClick = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleItemClick = (item: TimelineItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const renderTimelineItem = (item: TimelineItem, index: number) => {
    const isExpanded = expandedItems.has(item.id);
    const isLast = index === items.length - 1;

    return (
      <TimelineItemContainer
        key={item.id}
        animated={animated}
        alternating={alternating && orientation === 'vertical'}
        index={index}
        orientation={orientation}
      >
        <Box sx={{ position: 'relative' }}>
          <TimelineDot dotColor={item.color} hasIcon={!!item.icon}>
            {item.icon || <DotIcon />}
          </TimelineDot>
          {showConnector && !isLast && (
            <TimelineConnector orientation={orientation} isLast={isLast} />
          )}
        </Box>

        <TimelineCard
          timelineVariant={variant}
          onClick={() => handleItemClick(item)}
          role="article"
          aria-label={`Timeline item: ${item.title}`}
        >
          <CardContent>
            <Stack spacing={1}>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
              >
                <Box sx={{ flex: 1 }}>
                  <TimelineTimestamp>{item.timestamp}</TimelineTimestamp>
                  <Typography
                    variant={variant === 'compact' ? 'body2' : 'h6'}
                    fontWeight={variant === 'compact' ? 500 : 600}
                    sx={{ mt: 0.5 }}
                  >
                    {item.title}
                  </Typography>
                </Box>
                {item.description && variant !== 'compact' && (
                  <IconButton
                    size="small"
                    onClick={(e) => handleExpandClick(item.id, e)}
                    aria-label={isExpanded ? 'Collapse item details' : 'Expand item details'}
                    sx={{
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    <ExpandIcon />
                  </IconButton>
                )}
              </Box>

              {variant === 'compact' && item.description && (
                <Typography variant="caption" color="text.secondary">
                  {item.description}
                </Typography>
              )}

              {variant !== 'compact' && (
                <Collapse in={isExpanded || variant === 'detailed'}>
                  <Fade in={isExpanded || variant === 'detailed'}>
                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                      {item.description && (
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      )}

                      {item.metadata && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {Object.entries(item.metadata).map(([key, value]) => (
                            <MetadataChip key={key} label={`${key}: ${value}`} size="small" />
                          ))}
                        </Box>
                      )}

                      {item.action && (
                        <Box>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={(e) => {
                              e.stopPropagation();
                              item.action!.onClick();
                            }}
                            sx={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                            }}
                          >
                            {item.action.label}
                          </Button>
                        </Box>
                      )}
                    </Stack>
                  </Fade>
                </Collapse>
              )}
            </Stack>
          </CardContent>
        </TimelineCard>
      </TimelineItemContainer>
    );
  };

  return (
    <TimelineContainer orientation={orientation}>
      {items.map((item, index) => renderTimelineItem(item, index))}
    </TimelineContainer>
  );
};

// Export default
export default Timeline;

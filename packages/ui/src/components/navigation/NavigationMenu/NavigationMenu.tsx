import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Collapse,
  Typography,
  Divider,
  alpha,
  Paper,
  Fade,
  Grow,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { ExpandMore, ChevronRight, Menu as MenuIcon } from '@mui/icons-material';

import { NavigationMenuProps, NavigationMenuItem } from './NavigationMenu.types';

// Animation keyframes
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

const NavigationContainer = styled(Box, {
  shouldForwardProp: (prop) => !['variant', 'collapsed'].includes(prop as string),
})<{ variant?: string; collapsed?: boolean }>(({ theme, variant, collapsed }) => ({
  display: 'flex',
  position: 'relative',
  animation: `${slideIn} 0.4s ease-out`,
  ...(variant === 'horizontal' && {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
    backdropFilter: 'blur(10px)',
    borderRadius: theme.spacing(2),
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  }),
  ...(variant === 'vertical' && {
    flexDirection: 'column',
    width: collapsed ? 80 : 280,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    height: '100%',
    background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
    backdropFilter: 'blur(12px)',
    borderRadius: theme.spacing(2),
    boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.1)}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '200px',
      background: `radial-gradient(ellipse at top, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
      pointerEvents: 'none',
    },
  }),
  ...(variant === 'mega' && {
    flexDirection: 'column',
    width: '100%',
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
    backdropFilter: 'blur(15px)',
    borderRadius: theme.spacing(3),
    overflow: 'hidden',
    boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.12)}`,
  }),
}));

const StyledList = styled(List, {
  shouldForwardProp: (prop) => !['variant', 'size'].includes(prop as string),
})<{ variant?: string; size?: string }>(({ theme, variant }) => ({
  padding: 0,
  width: '100%',
  ...(variant === 'horizontal' && {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  }),
  ...(variant === 'mega' && {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
  }),
}));

const StyledListItem = styled(ListItem, {
  shouldForwardProp: (prop) => !['variant', 'active', 'size', 'level'].includes(prop as string),
})<{ variant?: string; active?: boolean; size?: string; level?: number }>(
  ({ theme, variant, level = 0 }) => ({
    padding: 0,
    ...(variant === 'horizontal' && {
      width: 'auto',
    }),
    ...(level > 0 && {
      paddingLeft: theme.spacing(2 * level),
    }),
  }),
);

const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => !['variant', 'active', 'size', 'collapsed'].includes(prop as string),
})<{ variant?: string; active?: boolean; size?: string; collapsed?: boolean }>(
  ({ theme, variant, active, size, collapsed }) => ({
    borderRadius: theme.spacing(1.5),
    margin: theme.spacing(0.5),
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transformStyle: 'preserve-3d',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },

    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '100%',
      height: '100%',
      background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.3)} 0%, transparent 70%)`,
      transform: 'translate(-50%, -50%) scale(0)',
      transition: 'transform 0.6s ease',
      borderRadius: '50%',
    },

    ...(size === 'sm' && {
      padding: theme.spacing(1, 1.5),
      fontSize: '0.875rem',
      '& .MuiListItemIcon-root': {
        transform: 'scale(0.85)',
      },
    }),
    ...(size === 'lg' && {
      padding: theme.spacing(2, 2.5),
      fontSize: '1.125rem',
      '& .MuiListItemIcon-root': {
        transform: 'scale(1.15)',
      },
    }),

    ...(variant === 'horizontal' && {
      borderRadius: theme.spacing(1.5),
      margin: theme.spacing(0, 0.5),
      background: alpha(theme.palette.background.paper, 0.6),
      backdropFilter: 'blur(8px)',
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    }),

    ...(collapsed && {
      justifyContent: 'center',
      minHeight: 56,
      '& .MuiListItemIcon-root': {
        margin: 0,
      },
    }),

    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
      backgroundColor: alpha(theme.palette.primary.main, 0.04),

      '&::before': {
        opacity: 1,
      },

      '& .MuiListItemIcon-root': {
        transform: collapsed
          ? 'scale(1.1)'
          : size === 'sm'
            ? 'scale(0.95) rotate(-5deg)'
            : size === 'lg'
              ? 'scale(1.25) rotate(-5deg)'
              : 'scale(1.1) rotate(-5deg)',
        transition: 'transform 0.3s ease',
      },

      '& .MuiListItemText-primary': {
        transform: 'translateX(4px)',
        transition: 'transform 0.3s ease',
      },
    },

    '&:active': {
      transform: 'scale(0.98)',
      '&::after': {
        transform: 'translate(-50%, -50%) scale(2)',
      },
    },

    ...(active && {
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
      color: theme.palette.primary.main,
      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
      animation: `${pulseGlow} 2s infinite`,

      '& .MuiListItemIcon-root': {
        color: theme.palette.primary.main,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
      },

      '&::before': {
        opacity: 1,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
      },

      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        transform: 'translateY(-3px) scale(1.02)',
        boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.25)}`,
      },
    }),
  }),
);

const LogoContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  position: 'relative',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.dark, 0.04)} 100%)`,
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '200%',
    height: '200%',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 70%)`,
    animation: `${slideIn} 1s ease-out`,
  },

  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
}));

const CollapseButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  margin: theme.spacing(1),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.dark, 0.04)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    transform: 'scale(1.05)',
    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.2)}`,

    '& .MuiListItemIcon-root': {
      transform: 'rotate(180deg)',
      transition: 'transform 0.3s ease',
    },
  },

  '&:active': {
    transform: 'scale(0.98)',
  },
}));

const megaMenuSlide = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const MegaMenuSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
  boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.08)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  position: 'relative',
  overflow: 'hidden',
  animation: `${megaMenuSlide} 0.5s ease-out`,
  animationFillMode: 'both',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.primary.main} 100%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 3s ease-in-out infinite',
  },

  '@keyframes shimmer': {
    '0%': {
      backgroundPosition: '200% 0',
    },
    '100%': {
      backgroundPosition: '-200% 0',
    },
  },

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 15px 40px ${alpha(theme.palette.common.black, 0.12)}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  '&:nth-of-type(1)': { animationDelay: '0.1s' },
  '&:nth-of-type(2)': { animationDelay: '0.2s' },
  '&:nth-of-type(3)': { animationDelay: '0.3s' },
  '&:nth-of-type(4)': { animationDelay: '0.4s' },
}));

interface MenuItemRendererProps {
  item: NavigationMenuItem;
  variant: string;
  size: string;
  collapsed: boolean;
  level: number;
  onItemClick?: (item: NavigationMenuItem) => void;
}

const MenuItemRenderer: React.FC<MenuItemRendererProps> = ({
  item,
  variant,
  size,
  collapsed,
  level,
  onItemClick,
}) => {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (hasChildren) {
      setOpen(!open);
    }
    if (item.onClick) {
      item.onClick(event);
    }
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const itemContent = (
    <StyledListItem key={item.id} variant={variant} active={item.active} size={size} level={level}>
      <StyledListItemButton
        variant={variant}
        active={item.active}
        size={size}
        collapsed={collapsed}
        disabled={item.disabled}
        onClick={handleClick}
        {...(item.href && !hasChildren
          ? {
              component: 'a' as React.ElementType,
              href: item.href,
              target: item.target,
            }
          : {})}
      >
        {item.icon && (
          <ListItemIcon
            sx={{
              minWidth: collapsed ? 0 : 40,
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              '& svg': {
                filter: item.active ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' : 'none',
                transition: 'all 0.3s ease',
              },
            }}
          >
            <Grow in={true} timeout={600}>
              <Box>{item.icon}</Box>
            </Grow>
          </ListItemIcon>
        )}
        {!collapsed && (
          <Fade in={!collapsed} timeout={400}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <ListItemText
                primary={item.label}
                secondary={item.description}
                primaryTypographyProps={{
                  variant: size === 'sm' ? 'body2' : size === 'lg' ? 'h6' : 'body1',
                  sx: {
                    fontWeight: item.active ? 600 : 400,
                    transition: 'all 0.3s ease',
                  },
                }}
                secondaryTypographyProps={{
                  sx: {
                    opacity: 0.7,
                    transition: 'all 0.3s ease',
                  },
                }}
              />
              {item.badge && (
                <Badge
                  badgeContent={item.badge}
                  color="error"
                  sx={{
                    mr: 1,
                    '& .MuiBadge-badge': {
                      animation:
                        typeof item.badge === 'number' && item.badge > 0
                          ? `${pulseGlow} 2s infinite`
                          : 'none',
                      background: 'linear-gradient(135deg, #ff5252 0%, #ff1744 100%)',
                      boxShadow: '0 2px 8px rgba(255, 23, 68, 0.4)',
                    },
                  }}
                />
              )}
              {hasChildren && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'transform 0.3s ease',
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  {variant === 'horizontal' ? <ChevronRight fontSize="small" /> : <ExpandMore />}
                </Box>
              )}
            </Box>
          </Fade>
        )}
      </StyledListItemButton>
    </StyledListItem>
  );

  if (hasChildren && variant !== 'horizontal') {
    return (
      <React.Fragment key={item.id}>
        {itemContent}
        {!collapsed && (
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) =>
                renderMenuItem(child, variant, size, collapsed, level + 1, onItemClick),
              )}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  }

  return itemContent;
};

const renderMenuItem = (
  item: NavigationMenuItem,
  variant: string = 'vertical',
  size: string = 'md',
  collapsed: boolean = false,
  level: number = 0,
  onItemClick?: (item: NavigationMenuItem) => void,
): React.ReactNode => {
  return (
    <MenuItemRenderer
      key={item.id}
      item={item}
      variant={variant}
      size={size}
      collapsed={collapsed}
      level={level}
      onItemClick={onItemClick}
    />
  );
};

export const NavigationMenu = React.forwardRef<HTMLDivElement, NavigationMenuProps>(
  (
    {
      variant = 'vertical',
      items,
      size = 'md',
      collapsible = false,
      collapsed: controlledCollapsed,
      onCollapseChange,
      logo,
      endContent,
      maxWidth,
      showDividers = false,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const [internalCollapsed, setInternalCollapsed] = useState(false);

    const isControlled = controlledCollapsed !== undefined;
    const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

    const handleCollapseToggle = () => {
      if (!isControlled) {
        setInternalCollapsed(!collapsed);
      }
      onCollapseChange?.(!collapsed);
    };

    if (variant === 'mega') {
      return (
        <NavigationContainer
          ref={ref}
          variant={variant}
          className={className}
          style={{ maxWidth, ...style }}
          {...props}
        >
          <Paper elevation={1} sx={{ width: '100%', overflow: 'hidden' }}>
            {logo && <LogoContainer>{logo}</LogoContainer>}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 3,
                p: 3,
              }}
            >
              {items.map((section, sectionIndex) => (
                <MegaMenuSection key={section.id}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2.5,
                      color: 'primary.main',
                      fontWeight: 600,
                      position: 'relative',
                      paddingBottom: 1,

                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '40px',
                        height: '3px',
                        background: (theme) =>
                          `linear-gradient(90deg, ${theme.palette.primary.main} 0%, transparent 100%)`,
                        borderRadius: '2px',
                      },
                    }}
                  >
                    {section.label}
                  </Typography>
                  <List sx={{ p: 0 }}>
                    {section.children?.map((item, itemIndex) => (
                      <Box
                        key={item.id}
                        sx={{
                          animation: `${slideIn} 0.4s ease-out`,
                          animationDelay: `${sectionIndex * 0.1 + itemIndex * 0.05}s`,
                          animationFillMode: 'both',
                        }}
                      >
                        {renderMenuItem(item, variant, size, false, 0)}
                      </Box>
                    ))}
                  </List>
                </MegaMenuSection>
              ))}
            </Box>
          </Paper>
        </NavigationContainer>
      );
    }

    return (
      <NavigationContainer
        ref={ref}
        variant={variant}
        collapsed={collapsed}
        className={className}
        style={style}
        {...props}
      >
        <Paper
          elevation={variant === 'horizontal' ? 1 : 0}
          sx={{
            width: '100%',
            height: variant === 'vertical' ? '100%' : 'auto',
            overflow: 'hidden',
          }}
        >
          {logo && variant === 'vertical' && (
            <LogoContainer>
              {collapsed ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <MenuIcon />
                </Box>
              ) : (
                logo
              )}
            </LogoContainer>
          )}

          {collapsible && variant === 'vertical' && (
            <CollapseButton onClick={handleCollapseToggle}>
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}>
                <MenuIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Collapse" />}
            </CollapseButton>
          )}

          <StyledList variant={variant} size={size}>
            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                <Box
                  sx={{
                    animation: `${slideIn} 0.4s ease-out`,
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'both',
                  }}
                >
                  {renderMenuItem(item, variant, size, collapsed, 0)}
                </Box>
                {showDividers && index < items.length - 1 && (
                  <Divider
                    sx={{
                      my: 1,
                      opacity: 0.5,
                      background: (theme) =>
                        `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.divider, 0.5)} 50%, transparent 100%)`,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </StyledList>

          {endContent && (
            <Fade in={true} timeout={600}>
              <Box
                sx={{
                  mt: 'auto',
                  p: 2,
                  borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  background: (theme) =>
                    `linear-gradient(180deg, transparent 0%, ${alpha(theme.palette.background.default, 0.5)} 100%)`,
                }}
              >
                {endContent}
              </Box>
            </Fade>
          )}
        </Paper>
      </NavigationContainer>
    );
  },
);

NavigationMenu.displayName = 'NavigationMenu';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  InputAdornment,
  Chip,
  Divider,
  CircularProgress,
  alpha,
  useTheme,
  Fade,
  Grow,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

import {
  CommandProps,
  CommandInputProps,
  CommandListProps,
  CommandGroupProps,
  CommandItemProps,
  CommandEmptyProps,
  CommandLoadingProps,
  CommandSeparatorProps,
  CommandItem,
} from './Command.types';

export const Command: React.FC<CommandProps> = ({
  open = false,
  onOpenChange,
  items = [],
  placeholder = 'Type a command or search...',
  value = '',
  onValueChange,
  onSelect,
  variant = 'default',
  size = 'md',
  color = 'primary',
  glow = false,
  pulse = false,
  loading = false,
  disabled = false,
  className,
  style,
  maxHeight = 400,
  emptyMessage = 'No results found',
  showCategories = true,
  showShortcuts = true,
  showDescriptions = true,
  autoFocus = true,
  closeOnSelect = true,
  customFilter,
  onFocus,
  onBlur,
  onClick,
  children,
}) => {
  const theme = useTheme();
  const [internalValue, setInternalValue] = useState(value);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (open && autoFocus) {
      window.setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, autoFocus]);

  const handleValueChange = useCallback((newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
    setSelectedIndex(0);
  }, [onValueChange]);

  const filteredItems = useMemo(() => {
    if (!internalValue) return items;
    
    if (customFilter) {
      return items.filter(item => customFilter(item, internalValue));
    }

    const searchLower = internalValue.toLowerCase();
    return items.filter(item => {
      const searchTargets = [
        item.label.toLowerCase(),
        item.description?.toLowerCase(),
        ...(item.keywords || []).map(k => k.toLowerCase()),
      ];
      return searchTargets.some(target => target?.includes(searchLower));
    });
  }, [items, internalValue, customFilter]);


  const handleSelect = useCallback((item: CommandItem) => {
    if (item.disabled) return;
    
    item.action?.();
    onSelect?.(item);
    
    if (closeOnSelect) {
      onOpenChange?.(false);
      setInternalValue('');
    }
  }, [onSelect, onOpenChange, closeOnSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const flatItems = filteredItems.filter(item => !item.disabled);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % flatItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + flatItems.length) % flatItems.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          handleSelect(flatItems[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onOpenChange?.(false);
        break;
    }
  }, [filteredItems, selectedIndex, handleSelect, onOpenChange]);

  const getVariantStyles = () => {
    const baseStyles = {
      transition: theme.transitions.create(['all'], {
        duration: theme.transitions.duration.standard,
      }),
    };

    const glowStyles = glow ? {
      boxShadow: `0 0 20px ${alpha(theme.palette[color].main, 0.4)}`,
    } : {};

    const pulseStyles = pulse ? {
      animation: 'pulse 2s infinite',
      '@keyframes pulse': {
        '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette[color].main, 0.4)}` },
        '70%': { boxShadow: `0 0 0 10px ${alpha(theme.palette[color].main, 0)}` },
        '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette[color].main, 0)}` },
      },
    } : {};

    switch (variant) {
      case 'glass':
        return {
          ...baseStyles,
          ...glowStyles,
          ...pulseStyles,
          backgroundColor: alpha(theme.palette.background.paper, 0.1),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        };
      
      case 'gradient':
        return {
          ...baseStyles,
          ...glowStyles,
          ...pulseStyles,
          background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
          color: theme.palette[color].contrastText,
        };
      
      case 'elevated':
        return {
          ...baseStyles,
          ...glowStyles,
          ...pulseStyles,
          boxShadow: theme.shadows[8],
        };
      
      case 'minimal':
        return {
          ...baseStyles,
          ...glowStyles,
          ...pulseStyles,
          border: 'none',
          boxShadow: 'none',
        };
      
      default:
        return {
          ...baseStyles,
          ...glowStyles,
          ...pulseStyles,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs': return { width: 400, fontSize: '0.75rem' };
      case 'sm': return { width: 450, fontSize: '0.875rem' };
      case 'md': return { width: 500, fontSize: '1rem' };
      case 'lg': return { width: 550, fontSize: '1.125rem' };
      case 'xl': return { width: 600, fontSize: '1.25rem' };
      default: return { width: 500, fontSize: '1rem' };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange?.(false)}
      maxWidth={false}
      PaperProps={{
        sx: {
          ...getVariantStyles(),
          ...getSizeStyles(),
          overflow: 'hidden',
          ...style,
        },
        className,
      }}
      TransitionComponent={variant === 'glass' ? Fade : Grow}
      onClick={onClick}
    >
      <Box sx={{ p: 0 }}>
        <CommandInput
          placeholder={placeholder}
          value={internalValue}
          onChange={handleValueChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          autoFocus={autoFocus}
          onKeyDown={handleKeyDown}
        />
        
        <Divider />
        
        <DialogContent sx={{ p: 0, maxHeight, overflow: 'auto' }}>
          {loading ? (
            <CommandLoading />
          ) : filteredItems.length === 0 ? (
            <CommandEmpty message={emptyMessage} />
          ) : (
            <CommandList
              items={filteredItems}
              value={internalValue}
              onSelect={handleSelect}
              showCategories={showCategories}
              showShortcuts={showShortcuts}
              showDescriptions={showDescriptions}
            />
          )}
          {children}
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export const CommandInput: React.FC<CommandInputProps> = ({
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled,
  autoFocus,
  onKeyDown,
  className,
  style,
}) => {
  return (
    <TextField
      fullWidth
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      variant="standard"
      className={className}
      sx={{
        p: 2,
        '& .MuiInput-underline:before': { border: 'none' },
        '& .MuiInput-underline:after': { border: 'none' },
        ...style,
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => onChange?.('')}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export const CommandList: React.FC<CommandListProps> = ({
  items = [],
  onSelect,
  emptyMessage,
  showCategories,
  showShortcuts,
  showDescriptions,
  loading,
  className,
  style,
}) => {
  const groupedItems = useMemo(() => {
    if (!showCategories) return { '': items };
    
    const groups: Record<string, CommandItem[]> = {};
    items.forEach(item => {
      const category = item.category || '';
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    });
    return groups;
  }, [items, showCategories]);

  if (loading) return <CommandLoading />;
  if (items.length === 0) return <CommandEmpty message={emptyMessage} />;

  return (
    <List className={className} sx={style}>
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <CommandGroup
          key={category}
          heading={category}
          items={categoryItems}
          onSelect={onSelect}
          showShortcuts={showShortcuts}
          showDescriptions={showDescriptions}
        />
      ))}
    </List>
  );
};

export const CommandGroup: React.FC<CommandGroupProps> = ({
  heading,
  items = [],
  onSelect,
  showShortcuts,
  showDescriptions,
  className,
  style,
}) => {
  return (
    <Box className={className} sx={style}>
      {heading && (
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            display: 'block',
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {heading}
        </Typography>
      )}
      {items.map((item) => (
        <CommandItemComponent
          key={item.id}
          {...item}
          onSelect={() => onSelect?.(item)}
          showShortcut={showShortcuts}
          showDescription={showDescriptions}
        />
      ))}
    </Box>
  );
};

const CommandItemComponent: React.FC<CommandItemProps> = ({
  label,
  description,
  icon,
  shortcut,
  disabled,
  selected,
  onSelect,
  showShortcut,
  showDescription,
  className,
  style,
}) => {
  const theme = useTheme();
  
  return (
    <ListItemButton
      onClick={onSelect}
      disabled={disabled}
      selected={selected}
      className={className}
      sx={{
        py: 1.5,
        px: 2,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },
        '&.Mui-selected': {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.16),
          },
        },
        ...style,
      }}
    >
      {icon && (
        <ListItemIcon sx={{ minWidth: 40 }}>
          {icon}
        </ListItemIcon>
      )}
      
      <ListItemText
        primary={label}
        secondary={showDescription && description}
        primaryTypographyProps={{
          fontSize: '0.875rem',
          fontWeight: selected ? 600 : 400,
        }}
        secondaryTypographyProps={{
          fontSize: '0.75rem',
        }}
      />
      
      {showShortcut && shortcut && (
        <Chip
          label={shortcut}
          size="small"
          variant="outlined"
          sx={{
            height: 20,
            fontSize: '0.7rem',
            ml: 1,
          }}
        />
      )}
    </ListItemButton>
  );
};

export const CommandEmpty: React.FC<CommandEmptyProps> = ({
  message = 'No results found',
  className,
  style,
}) => {
  return (
    <Box
      className={className}
      sx={{
        p: 4,
        textAlign: 'center',
        color: 'text.secondary',
        ...style,
      }}
    >
      <Typography variant="body2">{message}</Typography>
    </Box>
  );
};

export const CommandLoading: React.FC<CommandLoadingProps> = ({
  message = 'Loading...',
  className,
  style,
}) => {
  return (
    <Box
      className={className}
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        ...style,
      }}
    >
      <CircularProgress size={24} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export const CommandSeparator: React.FC<CommandSeparatorProps> = ({
  className,
  style,
}) => {
  return <Divider className={className} sx={{ my: 1, ...style }} />;
};
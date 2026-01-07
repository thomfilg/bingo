import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  CircularProgress,
  Typography,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { AutocompleteProps, AutocompleteOption, SuggestionItemState } from './Autocomplete.types';

const StyledPopper = styled(Popper)(({ theme }) => ({
  zIndex: theme.zIndex.tooltip,
  width: '100%',
  maxHeight: 300,
  overflow: 'auto',
}));

const InlineSuggestionDisplay = styled('div')(() => ({
  position: 'absolute',
  pointerEvents: 'none',
  left: '14px', // Match TextField padding
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: 'inherit',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  zIndex: 1,
}));

const UserTextTwin = styled('span')({
  visibility: 'hidden',
});

const GhostText = styled('span')(({ theme }) => ({
  color: theme.palette.text.secondary,
  opacity: 0.6,
}));

const ChipContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  marginBottom: theme.spacing(1),
}));

// Default helper functions
const defaultGetKey = <T,>(item: T): string => {
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    return String(obj.id ?? obj.key ?? obj.value ?? obj.label ?? obj);
  }
  return String(item);
};

const defaultGetLabel = <T,>(item: T): string => {
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    return String(obj.label ?? obj.name ?? obj.text ?? obj);
  }
  return String(item);
};

export const Autocomplete = <T = AutocompleteOption,>({
  value,
  onChange,
  suggestions = [],
  getKey = defaultGetKey,
  getLabel = defaultGetLabel,
  getDescription,
  renderSuggestion,
  onSelect,
  allowFreeText = true,
  multiple = false,
  selectedItems = [],
  onSelectedItemsChange,
  async = false,
  isLoading = false,
  debounceMs = 150,
  showGhostText = true,
  matchMode = 'contains',
  id: customId,
  inputAriaLabel,
  placeholder = 'Type to search...',
  autoFocus = false,
  disabled = false,
  className,
  inputClassName,
  listClassName,
  itemClassName,
  activeItemClassName,
  chipClassName,
  portal = false,
  maxVisibleItems = 10,
}: AutocompleteProps<T>) => {
  const componentId = useId();
  const id = customId || componentId;
  const listId = `${id}-listbox`;
  const optionIdPrefix = `${id}-option`;

  // State
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [ghost, setGhost] = useState('');
  const [inputValue, setInputValue] = useState(value);
  const [composition, setComposition] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<T[]>(suggestions);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [justCompletedGhost, setJustCompletedGhost] = useState(false);
  const [userClosedDropdown, setUserClosedDropdown] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const debounceRef = useRef<number>();

  // Debounced onChange
  const debouncedOnChange = useCallback(
    (val: string) => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }

      debounceRef.current = window.setTimeout(() => {
        onChange(val);
      }, debounceMs);
    },
    [onChange, debounceMs],
  );

  // Filter suggestions for local filtering
  useEffect(() => {
    if (async) {
      // In async mode, don't filter locally
      setFilteredSuggestions(suggestions);
      return;
    }

    if (!value.trim()) {
      setFilteredSuggestions(suggestions);
      return;
    }

    const filtered = suggestions.filter((item) => {
      const label = getLabel(item).toLowerCase();
      const query = value.toLowerCase();

      switch (matchMode) {
        case 'startsWith':
          return label.startsWith(query);
        case 'contains':
          return label.includes(query);
        case 'fuzzy': {
          // Simple fuzzy matching - all chars present in order
          let labelIndex = 0;
          for (let queryIndex = 0; queryIndex < query.length; queryIndex++) {
            const char = query[queryIndex];
            if (char) {
              labelIndex = label.indexOf(char, labelIndex);
              if (labelIndex === -1) return false;
              labelIndex++;
            }
          }
          return true;
        }
        default:
          return label.includes(query);
      }
    });

    setFilteredSuggestions(filtered);

    // Open dropdown immediately when we have filtered results and input is focused
    // but not if we just completed a ghost text completion or user explicitly closed it
    if (
      filtered.length > 0 &&
      value.trim() &&
      isInputFocused &&
      !composition &&
      !justCompletedGhost &&
      !userClosedDropdown
    ) {
      setOpen(true);
      if (activeIndex === -1) {
        setActiveIndex(0);
      }
    }
  }, [
    suggestions,
    value,
    async,
    getLabel,
    matchMode,
    isInputFocused,
    composition,
    activeIndex,
    justCompletedGhost,
    userClosedDropdown,
  ]);

  // Ghost text computation using Filter.tsx proven pattern
  useEffect(() => {
    if (value && isInputFocused && !composition && showGhostText) {
      const firstSuggestion = filteredSuggestions.find((s) => {
        const label = getLabel(s);
        return (
          label.toLowerCase().startsWith(value.toLowerCase()) &&
          label.toLowerCase() !== value.toLowerCase()
        );
      });

      if (firstSuggestion) {
        setGhost(getLabel(firstSuggestion).slice(value.length));
      } else {
        setGhost('');
      }
    } else {
      setGhost('');
    }
  }, [value, filteredSuggestions, isInputFocused, composition, showGhostText, getLabel]);

  // Additional open/close logic for loading states
  useEffect(() => {
    if (isLoading && value.trim().length > 0 && !disabled) {
      setOpen(true);
    }

    if (disabled) {
      setOpen(false);
      setActiveIndex(-1);
    }
  }, [isLoading, value, disabled]);

  // Reset ghost completion flag after a short delay
  useEffect(() => {
    if (justCompletedGhost) {
      const timer = setTimeout(() => {
        setJustCompletedGhost(false);
      }, 50); // Short delay to allow the filtering effect to run once with the flag set
      return () => clearTimeout(timer);
    }
  }, [justCompletedGhost]);

  // Ghost text completion is now handled directly in keyboard handler

  // Select item
  const selectItem = useCallback(
    (item: T) => {
      if (multiple) {
        // Multi-select mode: add to selected items
        const isAlreadySelected = selectedItems.some(
          (selected) => getKey(selected) === getKey(item),
        );
        if (!isAlreadySelected) {
          const newItems = [...selectedItems, item];
          onSelectedItemsChange?.(newItems);
        }
        setInputValue('');
        debouncedOnChange('');
        setOpen(false);
        setActiveIndex(-1);
      } else {
        // Single select mode: set value and close
        const newValue = getLabel(item);
        setInputValue(newValue);
        debouncedOnChange(newValue);
        setOpen(false);
        setActiveIndex(-1);
      }

      onSelect?.(item);
      inputRef.current?.focus();
    },
    [multiple, selectedItems, getKey, onSelectedItemsChange, getLabel, debouncedOnChange, onSelect],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (composition) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (!open && filteredSuggestions.length > 0) {
            setOpen(true);
            setUserClosedDropdown(false); // Reset when user explicitly opens with arrow
          }
          setActiveIndex((prev) => {
            const max = Math.min(filteredSuggestions.length - 1, maxVisibleItems - 1);
            return prev < max ? prev + 1 : prev;
          });
          break;

        case 'ArrowUp':
          event.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;

        case 'Enter':
          event.preventDefault();
          if (open && activeIndex >= 0 && activeIndex < filteredSuggestions.length) {
            const selectedItem = filteredSuggestions[activeIndex];
            if (selectedItem) {
              selectItem(selectedItem);
            }
          } else if (allowFreeText && value.trim()) {
            // Allow free text submission
            setOpen(false);
          }
          break;

        case 'Tab':
          // Tab completion: preserve user's case (concatenate value + ghost)
          if (ghost && isInputFocused && filteredSuggestions.length > 0) {
            event.preventDefault();
            const newValue = value + ghost;
            setJustCompletedGhost(true);
            setInputValue(newValue);
            debouncedOnChange(newValue);
            setGhost('');
            setOpen(false);
            setActiveIndex(-1);
            return;
          }
          break;

        case 'ArrowRight':
          // ArrowRight completion: use original suggestion case
          if (ghost && isInputFocused && filteredSuggestions.length > 0) {
            event.preventDefault();
            // Find the first matching suggestion to get the complete original value
            const firstSuggestion = filteredSuggestions.find((s) => {
              const label = getLabel(s);
              return (
                label.toLowerCase().startsWith(value.toLowerCase()) &&
                label.toLowerCase() !== value.toLowerCase()
              );
            });
            if (firstSuggestion) {
              const newValue = getLabel(firstSuggestion); // Use complete original suggestion to preserve case
              setJustCompletedGhost(true);
              setInputValue(newValue);
              debouncedOnChange(newValue);
            }
            setGhost('');
            setOpen(false);
            setActiveIndex(-1);
            return;
          }
          break;

        case 'Escape':
          event.preventDefault();
          setOpen(false);
          setActiveIndex(-1);
          setUserClosedDropdown(true);
          if (event.detail === 2) {
            // Double escape clears value
            setInputValue('');
            debouncedOnChange('');
          }
          break;

        case 'Backspace':
          if (multiple && value === '' && selectedItems.length > 0) {
            // Remove last chip when input is empty
            const newItems = selectedItems.slice(0, -1);
            onSelectedItemsChange?.(newItems);
          }
          break;
      }
    },
    [
      composition,
      open,
      filteredSuggestions,
      activeIndex,
      maxVisibleItems,
      allowFreeText,
      value,
      ghost,
      isInputFocused,
      multiple,
      selectedItems,
      onSelectedItemsChange,
      debouncedOnChange,
      selectItem,
      getLabel,
    ],
  );

  // Remove selected item (chip)
  const removeSelectedItem = useCallback(
    (item: T) => {
      const newItems = selectedItems.filter((selected) => getKey(selected) !== getKey(item));
      onSelectedItemsChange?.(newItems);
      inputRef.current?.focus();
    },
    [selectedItems, getKey, onSelectedItemsChange],
  );

  // Input change handler
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInputValue(newValue);
      debouncedOnChange(newValue);
      setActiveIndex(-1);
      setUserClosedDropdown(false); // Reset when user starts typing
    },
    [debouncedOnChange],
  );

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsInputFocused(true);
    // Open dropdown if there's content and suggestions
    if (inputValue.trim() && filteredSuggestions.length > 0) {
      setOpen(true);
      if (activeIndex === -1) {
        setActiveIndex(0);
      }
    }
  }, [filteredSuggestions, inputValue, activeIndex]);

  // Handle input blur with timeout pattern from Filter
  const handleInputBlur = useCallback(() => {
    window.setTimeout(() => {
      setIsInputFocused(false);
    }, 150);
  }, []);

  // Handle click away
  const handleClickAway = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
    setUserClosedDropdown(true); // Track that user closed it via click away
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const elementId = `${optionIdPrefix}-${activeIndex}`;
      // Use attribute selector to avoid CSS.escape dependency
      const activeElement = listRef.current.querySelector(`[id="${elementId}"]`);
      activeElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, optionIdPrefix]);

  // Sync value prop with input value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const getActiveId = () => {
    return activeIndex >= 0 ? `${optionIdPrefix}-${activeIndex}` : undefined;
  };

  const renderDefaultSuggestion = (item: T, state: SuggestionItemState) => {
    const label = getLabel(item);
    const description = getDescription?.(item);

    // Highlight matching text
    let displayLabel = label;
    if (state.query && matchMode !== 'fuzzy') {
      const regex = new RegExp(`(${state.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      displayLabel = label.replace(regex, '<mark>$1</mark>');
    }

    return (
      <>
        <ListItemText
          primary={<span dangerouslySetInnerHTML={{ __html: displayLabel }} />}
          secondary={description}
        />
      </>
    );
  };

  const visibleSuggestions = filteredSuggestions.slice(0, maxVisibleItems);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box className={className}>
        {/* Selected items (chips) for multiple mode */}
        {multiple && selectedItems.length > 0 && (
          <ChipContainer>
            {selectedItems.map((item, index) => (
              <Chip
                key={`${getKey(item)}-${index}`}
                label={getLabel(item)}
                onDelete={() => removeSelectedItem(item)}
                size="small"
                className={chipClassName}
              />
            ))}
          </ChipContainer>
        )}

        {/* Input field with ghost text */}
        <Box sx={{ position: 'relative' }}>
          {/* Ghost text overlay using Filter pattern */}
          {ghost && showGhostText && isInputFocused && (
            <InlineSuggestionDisplay>
              <UserTextTwin>{inputValue}</UserTextTwin>
              <GhostText>{ghost}</GhostText>
            </InlineSuggestionDisplay>
          )}

          <TextField
            ref={inputRef}
            fullWidth
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onCompositionStart={() => setComposition(true)}
            onCompositionEnd={() => setComposition(false)}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className={inputClassName}
            InputProps={{
              endAdornment: isLoading ? <CircularProgress size={20} /> : undefined,
            }}
            // ARIA attributes for combobox
            inputProps={{
              role: 'combobox',
              'aria-expanded': open,
              'aria-controls': open ? listId : undefined,
              'aria-activedescendant': getActiveId(),
              'aria-autocomplete': 'list',
              'aria-label': inputAriaLabel,
              id: id,
            }}
          />
        </Box>

        {/* Suggestions dropdown */}
        {open && (
          <StyledPopper
            open={open}
            anchorEl={inputRef.current}
            placement="bottom-start"
            disablePortal={!portal}
            modifiers={[
              {
                name: 'sameWidth',
                enabled: true,
                fn: ({ state }) => {
                  if (state.elements.reference && state.styles.popper) {
                    state.styles.popper.width = `${state.rects.reference.width}px`;
                  }
                },
                phase: 'beforeWrite',
                requires: ['computeStyles'],
              },
            ]}
          >
            <Paper elevation={8} className={listClassName}>
              <List
                ref={listRef}
                role="listbox"
                id={listId}
                dense
                sx={{ maxHeight: 300, overflow: 'auto' }}
              >
                {visibleSuggestions.map((item, index) => (
                  <ListItem
                    key={getKey(item)}
                    id={`${optionIdPrefix}-${index}`}
                    role="option"
                    component="div"
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: index === activeIndex ? 'action.hover' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                    aria-selected={index === activeIndex}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectItem(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`${itemClassName} ${
                      index === activeIndex ? activeItemClassName : ''
                    }`}
                  >
                    {renderSuggestion
                      ? renderSuggestion(item, { active: index === activeIndex, query: value })
                      : renderDefaultSuggestion(item, {
                          active: index === activeIndex,
                          query: value,
                        })}
                  </ListItem>
                ))}

                {/* Loading state */}
                {isLoading && (
                  <ListItem>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Loading...
                      </Typography>
                    </Box>
                  </ListItem>
                )}

                {/* No results state */}
                {!isLoading && visibleSuggestions.length === 0 && value.trim() && (
                  <ListItem>
                    <Typography variant="body2" color="text.secondary">
                      No results found
                    </Typography>
                  </ListItem>
                )}
              </List>
            </Paper>
          </StyledPopper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

Autocomplete.displayName = 'Autocomplete';

export default Autocomplete;

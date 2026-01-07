import React, { FC, useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
  styled,
  useTheme,
  Typography,
} from '@mui/material';
import { Phone as PhoneIcon, ArrowDropDown } from '@mui/icons-material';
import { parsePhoneNumber, CountryCode } from 'libphonenumber-js';

import type { PhoneInputProps, CountryData } from './PhoneInput.types';

// Country data with expanded support
const countries: CountryData[] = [
  { code: 'US' as CountryCode, name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'GB' as CountryCode, name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'CA' as CountryCode, name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { code: 'AU' as CountryCode, name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { code: 'DE' as CountryCode, name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { code: 'FR' as CountryCode, name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'IT' as CountryCode, name: 'Italy', dial: '+39', flag: '🇮🇹' },
  { code: 'ES' as CountryCode, name: 'Spain', dial: '+34', flag: '🇪🇸' },
  { code: 'NL' as CountryCode, name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
  { code: 'JP' as CountryCode, name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { code: 'CN' as CountryCode, name: 'China', dial: '+86', flag: '🇨🇳' },
  { code: 'IN' as CountryCode, name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'BR' as CountryCode, name: 'Brazil', dial: '+55', flag: '🇧🇷' },
  { code: 'MX' as CountryCode, name: 'Mexico', dial: '+52', flag: '🇲🇽' },
  { code: 'KR' as CountryCode, name: 'South Korea', dial: '+82', flag: '🇰🇷' },
  { code: 'SE' as CountryCode, name: 'Sweden', dial: '+46', flag: '🇸🇪' },
  { code: 'NO' as CountryCode, name: 'Norway', dial: '+47', flag: '🇳🇴' },
  { code: 'DK' as CountryCode, name: 'Denmark', dial: '+45', flag: '🇩🇰' },
  { code: 'CH' as CountryCode, name: 'Switzerland', dial: '+41', flag: '🇨🇭' },
  { code: 'AT' as CountryCode, name: 'Austria', dial: '+43', flag: '🇦🇹' },
  { code: 'BE' as CountryCode, name: 'Belgium', dial: '+32', flag: '🇧🇪' },
  { code: 'FI' as CountryCode, name: 'Finland', dial: '+358', flag: '🇫🇮' },
  { code: 'IE' as CountryCode, name: 'Ireland', dial: '+353', flag: '🇮🇪' },
  { code: 'PT' as CountryCode, name: 'Portugal', dial: '+351', flag: '🇵🇹' },
  { code: 'GR' as CountryCode, name: 'Greece', dial: '+30', flag: '🇬🇷' },
  { code: 'PL' as CountryCode, name: 'Poland', dial: '+48', flag: '🇵🇱' },
  { code: 'CZ' as CountryCode, name: 'Czech Republic', dial: '+420', flag: '🇨🇿' },
  { code: 'HU' as CountryCode, name: 'Hungary', dial: '+36', flag: '🇭🇺' },
  { code: 'RU' as CountryCode, name: 'Russia', dial: '+7', flag: '🇷🇺' },
  { code: 'ZA' as CountryCode, name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { code: 'EG' as CountryCode, name: 'Egypt', dial: '+20', flag: '🇪🇬' },
  { code: 'NG' as CountryCode, name: 'Nigeria', dial: '+234', flag: '🇳🇬' },
  { code: 'KE' as CountryCode, name: 'Kenya', dial: '+254', flag: '🇰🇪' },
  { code: 'AR' as CountryCode, name: 'Argentina', dial: '+54', flag: '🇦🇷' },
  { code: 'CL' as CountryCode, name: 'Chile', dial: '+56', flag: '🇨🇱' },
  { code: 'CO' as CountryCode, name: 'Colombia', dial: '+57', flag: '🇨🇴' },
  { code: 'PE' as CountryCode, name: 'Peru', dial: '+51', flag: '🇵🇪' },
  { code: 'MY' as CountryCode, name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
  { code: 'SG' as CountryCode, name: 'Singapore', dial: '+65', flag: '🇸🇬' },
  { code: 'TH' as CountryCode, name: 'Thailand', dial: '+66', flag: '🇹🇭' },
  { code: 'VN' as CountryCode, name: 'Vietnam', dial: '+84', flag: '🇻🇳' },
  { code: 'PH' as CountryCode, name: 'Philippines', dial: '+63', flag: '🇵🇭' },
  { code: 'ID' as CountryCode, name: 'Indonesia', dial: '+62', flag: '🇮🇩' },
  { code: 'TR' as CountryCode, name: 'Turkey', dial: '+90', flag: '🇹🇷' },
  { code: 'IL' as CountryCode, name: 'Israel', dial: '+972', flag: '🇮🇱' },
  { code: 'AE' as CountryCode, name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
  { code: 'SA' as CountryCode, name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
].sort((a, b) => a.name.localeCompare(b.name));

// Styled components
const GlassTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.18)}`,
    transition: theme.transitions.create(['border-color', 'box-shadow', 'background']),
    '&:hover': {
      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused': {
      background: theme.palette.background.paper,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
    },
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputLabel-root': {
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

const CountrySelector = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: theme.transitions.create(['background-color']),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

const CountryMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.18)}`,
    maxHeight: 400,
  },
}));

// Helper functions with enhanced validation
const formatPhoneNumber = (value: string, country: CountryCode): string => {
  if (!value || value.trim() === '') return value;

  try {
    const phoneNumber = parsePhoneNumber(value, country);
    if (phoneNumber && phoneNumber.isValid()) {
      return phoneNumber.formatInternational();
    }
  } catch {
    // Silently handle formatting errors
  }
  return value;
};

const validatePhoneNumber = (value: string, country: CountryCode): boolean => {
  if (!value || value.trim() === '') return false;

  try {
    const phoneNumber = parsePhoneNumber(value, country);
    return phoneNumber ? phoneNumber.isValid() : false;
  } catch {
    // Silently handle validation errors
    return false;
  }
};

// Enhanced helper to detect country from number
const detectCountryFromNumber = (value: string): CountryCode | undefined => {
  if (!value || !value.startsWith('+')) return undefined;

  try {
    const phoneNumber = parsePhoneNumber(value);
    return phoneNumber?.country;
  } catch {
    return undefined;
  }
};

// Main component
export const PhoneInput: FC<PhoneInputProps> = ({
  variant = 'outlined',
  label = 'Phone Number',
  placeholder = 'Enter phone number',
  icon = <PhoneIcon />,
  defaultValue = '',
  countryCode: initialCountryCode = 'US',
  floating = false,
  onChange,
  helper,
  error = false,
  errorMessage,
  disabled = false,
  required = false,
  fullWidth = true,
}) => {
  const theme = useTheme();
  const [value, setValue] = useState(defaultValue);
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find((c) => c.code === initialCountryCode) || countries[0],
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isValid, setIsValid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const onChangeRef = useRef(onChange);

  // Update ref when onChange changes
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!selectedCountry) return;

    const valid = validatePhoneNumber(value, selectedCountry.code);
    setIsValid(valid);

    if (onChangeRef.current) {
      onChangeRef.current(value, valid, selectedCountry.code);
    }
  }, [value, selectedCountry]);

  const handleCountryClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCountryClose = () => {
    setAnchorEl(null);
  };

  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country);
    handleCountryClose();

    // Reformat number with new country code
    if (value) {
      const formatted = formatPhoneNumber(value, country.code);
      setValue(formatted);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);

    // Auto-detect country if user types international format
    if (newValue.startsWith('+')) {
      const detectedCountry = detectCountryFromNumber(newValue);
      if (detectedCountry) {
        const detectedCountryData = countries.find((c) => c.code === detectedCountry);
        if (detectedCountryData && detectedCountryData.code !== selectedCountry?.code) {
          setSelectedCountry(detectedCountryData);
        }
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value && selectedCountry) {
      const formatted = formatPhoneNumber(value, selectedCountry.code);
      setValue(formatted);
    }
  };

  const TextFieldComponent = variant === 'glass' ? GlassTextField : TextField;

  return (
    <>
      <TextFieldComponent
        variant={variant === 'glass' ? 'outlined' : variant}
        label={floating ? undefined : label}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        error={error || (!isValid && value !== '' && !isFocused)}
        helperText={
          errorMessage ||
          (!isValid && value !== '' && !isFocused
            ? `Invalid phone number for ${selectedCountry?.name || 'selected country'}`
            : helper)
        }
        disabled={disabled}
        required={required}
        fullWidth={fullWidth}
        type="tel"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <CountrySelector
                onClick={handleCountryClick}
                role="button"
                aria-label="Select country"
                aria-expanded={Boolean(anchorEl)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setAnchorEl(e.currentTarget as HTMLElement);
                  }
                }}
              >
                <Typography variant="h6" component="span" sx={{ mr: 0.5 }}>
                  {selectedCountry?.flag}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                  {selectedCountry?.dial}
                </Typography>
                <ArrowDropDown fontSize="small" />
              </CountrySelector>
            </InputAdornment>
          ),
          endAdornment: icon && (
            <InputAdornment position="end">
              <Box
                sx={{
                  color: isValid ? theme.palette.success.main : theme.palette.text.secondary,
                  transition: 'color 0.3s ease',
                }}
              >
                {icon}
              </Box>
            </InputAdornment>
          ),
        }}
        sx={{
          '& input': {
            letterSpacing: '0.5px',
          },
        }}
      />

      <CountryMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCountryClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {countries.map((country) => (
          <MenuItem
            key={country.code}
            onClick={() => handleCountrySelect(country)}
            selected={country.code === selectedCountry?.code}
            sx={{
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Typography variant="h5" component="span">
                {country.flag}
              </Typography>
            </ListItemIcon>
            <ListItemText
              primary={country.name}
              secondary={country.dial}
              primaryTypographyProps={{ fontSize: '0.9rem' }}
              secondaryTypographyProps={{ fontSize: '0.8rem' }}
            />
          </MenuItem>
        ))}
      </CountryMenu>
    </>
  );
};

// Export default
export default PhoneInput;

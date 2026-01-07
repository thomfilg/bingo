# PhoneInput Component

## Overview

An international phone number input component with country selection, automatic formatting, and validation using libphonenumber-js. Features a dropdown country selector with flags, dial codes, and real-time phone number validation with glass morphism styling options.

## Props

| Prop         | Type                              | Default              | Description                                     |
| ------------ | --------------------------------- | -------------------- | ----------------------------------------------- |
| variant      | 'glass' \| 'outlined' \| 'filled' | 'outlined'           | Input styling variant                           |
| label        | string                            | 'Phone Number'       | Input field label                               |
| placeholder  | string                            | 'Enter phone number' | Placeholder text                                |
| icon         | React.ReactNode                   | PhoneIcon            | Custom end adornment icon                       |
| defaultValue | string                            | ''                   | Initial phone number value                      |
| countryCode  | CountryCode                       | 'US'                 | Default selected country                        |
| floating     | boolean                           | false                | Floating label style                            |
| onChange     | function                          | undefined            | Callback with value, validity, and country code |
| helper       | string                            | undefined            | Helper text below input                         |
| error        | boolean                           | false                | Error state                                     |
| errorMessage | string                            | undefined            | Custom error message                            |
| disabled     | boolean                           | false                | Disabled state                                  |
| required     | boolean                           | false                | Required field indicator                        |
| fullWidth    | boolean                           | true                 | Full width styling                              |

## Usage Examples

### Basic Usage

```tsx
import { PhoneInput } from '@ui/components/enhanced';

<PhoneInput label="Phone Number" placeholder="Enter your phone number" />;
```

### Glass Variant

```tsx
<PhoneInput variant="glass" label="Phone Number" countryCode="BR" />
```

### With Validation

```tsx
<PhoneInput
  label="Phone Number"
  onChange={(value, isValid, countryCode) => {
    console.log('Phone:', value, 'Valid:', isValid, 'Country:', countryCode);
  }}
/>
```

### With Error Handling

```tsx
<PhoneInput label="Phone Number" error={true} errorMessage="Please enter a valid phone number" />
```

## Features

- **International Support**: Supports 15 major countries with flags and dial codes
- **Real-time Validation**: Uses libphonenumber-js for accurate validation
- **Automatic Formatting**: Formats phone numbers according to international standards
- **Glass Morphism**: Optional glass effect styling with backdrop blur
- **Accessibility**: Full keyboard navigation and screen reader support
- **Country Selection**: Dropdown with flag icons and country names

## Accessibility

- Full keyboard navigation support
- Screen reader compatible with proper ARIA labels
- Focus management between country selector and input field
- Proper error state announcements

## Best Practices

1. Always provide a meaningful label
2. Use appropriate error messages for validation
3. Consider the user's likely country when setting defaultCountryCode
4. Test with various phone number formats
5. Provide helper text when needed to guide users

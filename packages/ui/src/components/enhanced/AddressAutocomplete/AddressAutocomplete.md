# AddressAutocomplete Component

A sophisticated address input component with Google Maps integration for autocomplete functionality. Provides structured address data with coordinates and supports different visual variants.

## Features

- **Google Maps Integration**: Real-time address suggestions via Google Places API
- **Glass Morphism Effect**: Beautiful glass variant with blur and transparency
- **Current Location Support**: Optional button to use device's current location
- **Geographic Restrictions**: Limit results to specific countries or place types
- **Structured Data**: Returns complete address details including coordinates
- **Accessible**: Full keyboard navigation and screen reader support
- **Responsive**: Adapts to different screen sizes
- **Multiple Variants**: Glass, outlined, and filled styles

## Usage

```tsx
import { AddressAutocomplete } from '@repo/ui';

function AddressForm() {
  const handleAddressSelect = (address: AddressDetails) => {
    console.log('Selected:', address);
    // address contains: formatted, street, city, state, country, postalCode, coordinates
  };

  return (
    <AddressAutocomplete
      variant="outlined"
      label="Delivery Address"
      placeholder="Enter your address..."
      googleMapsApiKey="your-api-key"
      onSelect={handleAddressSelect}
      getCurrentLocation
      helperText="We'll deliver to this address"
    />
  );
}
```

## Props

| Prop                | Type                                        | Default      | Description                                           |
| ------------------- | ------------------------------------------- | ------------ | ----------------------------------------------------- |
| `variant`           | `'glass' \| 'outlined' \| 'filled'`        | `'outlined'` | Visual style variant                                 |
| `label`             | `string`                                    | -            | Input field label                                    |
| `placeholder`       | `string`                                    | -            | Placeholder text                                     |
| `icon`              | `ReactNode`                                 | -            | Custom icon for the input                            |
| `onSelect`          | `(address: AddressDetails) => void`        | **Required** | Callback when address is selected                    |
| `googleMapsApiKey`  | `string`                                    | **Required** | Google Maps API key                                  |
| `floating`          | `boolean`                                   | `false`      | Use floating label style                             |
| `restrictions`      | `{ country?: string[], types?: string[] }` | -            | Geographic/type restrictions                         |
| `error`             | `boolean`                                   | `false`      | Show error state                                     |
| `helperText`        | `string`                                    | -            | Helper text below input                              |
| `disabled`          | `boolean`                                   | `false`      | Disable the input                                    |
| `required`          | `boolean`                                   | `false`      | Mark as required field                               |
| `fullWidth`         | `boolean`                                   | `false`      | Take full container width                            |
| `defaultValue`      | `string`                                    | -            | Initial input value                                  |
| `getCurrentLocation`| `boolean`                                   | `false`      | Show current location button                         |

## AddressDetails Type

```typescript
interface AddressDetails {
  formatted: string;      // Full formatted address
  street: string;         // Street name and number
  city: string;           // City name
  state: string;          // State/Province
  country: string;        // Country name
  postalCode: string;     // ZIP/Postal code
  coordinates: {
    lat: number;          // Latitude
    lng: number;          // Longitude
  };
}
```

## Examples

### Basic Usage

```tsx
<AddressAutocomplete
  label="Address"
  placeholder="Enter address..."
  googleMapsApiKey="your-key"
  onSelect={(address) => console.log(address)}
/>
```

### Glass Variant with Current Location

```tsx
<AddressAutocomplete
  variant="glass"
  label="Location"
  getCurrentLocation
  googleMapsApiKey="your-key"
  onSelect={handleSelect}
/>
```

### Restricted to US Addresses

```tsx
<AddressAutocomplete
  label="US Address"
  restrictions={{ country: ['us'] }}
  googleMapsApiKey="your-key"
  onSelect={handleSelect}
  helperText="Only US addresses allowed"
/>
```

### Business Locations Only

```tsx
<AddressAutocomplete
  label="Business Location"
  icon={<BusinessIcon />}
  restrictions={{ types: ['establishment'] }}
  googleMapsApiKey="your-key"
  onSelect={handleSelect}
/>
```

### With Form Validation

```tsx
<AddressAutocomplete
  label="Required Address"
  required
  error={hasError}
  helperText={errorMessage}
  googleMapsApiKey="your-key"
  onSelect={handleSelect}
/>
```

## Accessibility

- Full keyboard navigation support
- Proper ARIA labels and roles
- Screen reader announcements for suggestions
- Focus management for dropdown
- Support for Tab, Arrow keys, Enter, and Escape

## Best Practices

1. **API Key Security**: Store Google Maps API key in environment variables
2. **Error Handling**: Implement proper error handling for API failures
3. **Loading States**: Show loading indicator while fetching suggestions
4. **Validation**: Validate selected address before form submission
5. **Restrictions**: Use geographic restrictions to improve relevance
6. **Debouncing**: Component internally debounces API calls

## Notes

- Requires valid Google Maps API key with Places API enabled
- Component handles API rate limiting internally
- Suggestions are debounced to minimize API calls
- Supports both residential and commercial addresses
- Coordinates are provided for mapping integrations
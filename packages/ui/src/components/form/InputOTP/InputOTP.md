# InputOTP Component

## Overview

The InputOTP component provides a specialized input field for one-time passwords and verification codes. It splits the input into individual digit boxes with automatic focus management, making it ideal for SMS verification codes, two-factor authentication, and other security-related inputs.

## Features

- **Multiple Input Variants**: Supports numeric-only, alphanumeric, and masked input modes
- **Auto-Focus Management**: Automatically advances focus to the next input as users type
- **Keyboard Navigation**: Full support for arrow keys, backspace, and tab navigation
- **Paste Support**: Users can paste complete codes for quick entry
- **Visual Effects**: Optional glass morphism and gradient effects for modern UI design
- **Flexible Sizing**: Five size variants from extra-small to extra-large
- **Theme Integration**: Six color themes matching your design system
- **Accessibility**: WCAG compliant with proper ARIA attributes and keyboard support
- **Responsive Design**: Adapts to different screen sizes and touch interfaces

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'numeric' \| 'alphanumeric' \| 'masked'` | `'numeric'` | Input validation type |
| `length` | `number` | `6` | Number of input digits |
| `value` | `string` | `''` | Current OTP value |
| `onChange` | `(value: string) => void` | - | Callback when value changes |
| `onComplete` | `(value: string) => void` | - | Callback when all digits are filled |
| `color` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'neutral'` | `'primary'` | Theme color |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Input size |
| `autoFocus` | `boolean` | `false` | Auto-focus first input on mount |
| `disabled` | `boolean` | `false` | Disable all inputs |
| `error` | `boolean` | `false` | Show error state |
| `glass` | `boolean` | `false` | Apply glass morphism effect |
| `gradient` | `boolean` | `false` | Apply gradient focus effect |
| `className` | `string` | - | Additional CSS classes |
| `aria-label` | `string` | - | Accessibility label |

## Usage Examples

### Basic Usage

```tsx
import { InputOTP } from '@repo/ui';

function VerificationForm() {
  const [code, setCode] = useState('');

  const handleComplete = (value: string) => {
    console.log('Verification code:', value);
    // Submit verification code
  };

  return (
    <InputOTP
      value={code}
      onChange={setCode}
      onComplete={handleComplete}
      autoFocus
    />
  );
}
```

### SMS Verification

```tsx
<InputOTP
  variant="numeric"
  length={4}
  color="primary"
  size="lg"
  autoFocus
  onComplete={(code) => verifySMSCode(code)}
  aria-label="Enter SMS verification code"
/>
```

### Two-Factor Authentication

```tsx
<InputOTP
  variant="numeric"
  length={6}
  color="success"
  glass
  onComplete={(code) => verify2FA(code)}
  aria-label="Enter 6-digit authenticator code"
/>
```

### Masked Security PIN

```tsx
<InputOTP
  variant="masked"
  length={4}
  color="warning"
  onComplete={(pin) => validatePIN(pin)}
  aria-label="Enter your security PIN"
/>
```

### Alphanumeric Code

```tsx
<InputOTP
  variant="alphanumeric"
  length={8}
  color="secondary"
  gradient
  onComplete={(code) => validateCode(code)}
  aria-label="Enter product activation code"
/>
```

### Error State Handling

```tsx
function CodeVerification() {
  const [code, setCode] = useState('');
  const [hasError, setHasError] = useState(false);

  const handleComplete = async (value: string) => {
    const isValid = await verifyCode(value);
    setHasError(!isValid);
    
    if (isValid) {
      // Proceed with success
    }
  };

  return (
    <>
      <InputOTP
        value={code}
        onChange={setCode}
        onComplete={handleComplete}
        error={hasError}
        color={hasError ? 'danger' : 'primary'}
      />
      {hasError && (
        <Typography color="error" variant="caption">
          Invalid verification code. Please try again.
        </Typography>
      )}
    </>
  );
}
```

## Keyboard Shortcuts

- **Arrow Left/Right**: Navigate between input fields
- **Backspace**: Delete current digit and move to previous field
- **Tab**: Move to next field
- **Shift+Tab**: Move to previous field
- **Delete**: Clear current field
- **Paste (Ctrl/Cmd+V)**: Paste complete code

## Accessibility

The InputOTP component is designed with accessibility in mind:

- **ARIA Labels**: Each input field has proper ARIA attributes
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Focus Management**: Clear focus indicators and logical tab order
- **Screen Reader Support**: Announces field positions and values
- **Error States**: Clear visual and semantic error indicators

### Best Practices

1. **Always provide an aria-label** describing what code is being entered
2. **Use appropriate variants** - numeric for numbers only, masked for PINs
3. **Provide clear error messages** when verification fails
4. **Consider mobile users** - use larger sizes on touch devices
5. **Test with keyboard navigation** to ensure accessibility

## Styling

The component supports various visual customizations:

### Size Variants
- `xs`: Extra small (compact forms)
- `sm`: Small (mobile interfaces)
- `md`: Medium (default desktop)
- `lg`: Large (prominent forms)
- `xl`: Extra large (accessibility focus)

### Color Themes
- `primary`: Main brand color
- `secondary`: Alternative brand color
- `success`: Positive feedback
- `warning`: Caution state
- `danger`: Error or critical state
- `neutral`: Subtle appearance

### Visual Effects
- **Glass Morphism**: Modern frosted glass effect
- **Gradient**: Dynamic gradient on focus
- **Combined**: Both effects for premium feel

## Performance Considerations

- **Controlled Component**: Use React.memo if parent re-renders frequently
- **Debounced Callbacks**: onChange fires on every keystroke, consider debouncing
- **Paste Handling**: Efficiently processes pasted content without blocking UI
- **Focus Management**: Uses refs to avoid unnecessary re-renders

## Common Use Cases

1. **SMS Verification**: 4-6 digit codes for phone number verification
2. **Email Verification**: 6-8 character codes for email confirmation
3. **Two-Factor Auth**: 6-digit TOTP codes from authenticator apps
4. **Security PINs**: 4-digit masked inputs for banking/security
5. **Product Keys**: 8-16 character alphanumeric activation codes
6. **Coupon Codes**: Variable length promotional codes
7. **Access Codes**: Meeting or session join codes

## Migration Guide

If migrating from a text input to InputOTP:

```tsx
// Before
<TextField
  value={code}
  onChange={(e) => setCode(e.target.value)}
  maxLength={6}
/>

// After
<InputOTP
  value={code}
  onChange={setCode}
  length={6}
  onComplete={handleVerification}
/>
```

## Related Components

- `TextField`: For general text input needs
- `PasswordStrength`: For password creation with strength indicators
- `PhoneInput`: For international phone number input
- `Form`: For complete form management
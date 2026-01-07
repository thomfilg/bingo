# Form Component

The Form component provides a flexible container for building forms with consistent spacing, layout, and validation patterns. It includes sub-components for form fields, labels, controls, and messages with built-in validation display and accessibility features.

## Usage

```tsx
import { Form, FormField, FormLabel, FormControl, FormMessage } from '@repo/ui';

function MyForm() {
  return (
    <Form variant="vertical" maxWidth="md" spacing="md">
      <FormField name="email" label="Email" required>
        <Input type="email" placeholder="Enter your email" />
      </FormField>
      <FormField name="password" label="Password" required>
        <Input type="password" placeholder="Enter your password" />
      </FormField>
      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

## Props

### Form Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'vertical' \| 'horizontal' \| 'inline' \| 'stepped'` | `'vertical'` | Form layout variant |
| maxWidth | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Maximum width constraint for the form |
| spacing | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Spacing between form elements |
| onSubmit | `(event: FormEvent) => void` | - | Form submission handler |
| children | `ReactNode` | - | Form content |

### FormField Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | `string` | - | Field identifier |
| label | `string` | - | Field label text |
| required | `boolean` | `false` | Shows required indicator |
| error | `string` | - | Error message to display |
| helperText | `string` | - | Helper text to display |
| children | `ReactNode` | - | Field input component |

### FormLabel Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| required | `boolean` | `false` | Shows required asterisk |
| error | `boolean` | `false` | Error state styling |
| htmlFor | `string` | - | Associates with input |
| children | `ReactNode` | - | Label content |

### FormControl Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| error | `boolean` | `false` | Error state |
| fullWidth | `boolean` | `true` | Full width layout |
| children | `ReactNode` | - | Control content |

### FormMessage Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| error | `boolean` | `false` | Error state styling |
| children | `ReactNode` | - | Message content |

## Layout Variants

### Vertical Layout
Default layout with fields stacked vertically:
```tsx
<Form variant="vertical">
  <FormField name="field1" label="Field 1">
    <Input />
  </FormField>
  <FormField name="field2" label="Field 2">
    <Input />
  </FormField>
</Form>
```

### Horizontal Layout
Labels positioned horizontally beside inputs:
```tsx
<Form variant="horizontal">
  <FormField name="field1" label="Field 1">
    <Input />
  </FormField>
</Form>
```

### Inline Layout
All elements in a single row:
```tsx
<Form variant="inline">
  <Input placeholder="Search..." />
  <Button>Search</Button>
</Form>
```

## Validation

Display validation errors and helper text:
```tsx
<FormField 
  name="email" 
  label="Email" 
  required 
  error="Please enter a valid email"
  helperText="We'll never share your email"
>
  <Input type="email" error />
</FormField>
```

## Accessibility

- Proper label association with inputs using `htmlFor`
- Required field indicators with ARIA attributes
- Error messages announced to screen readers
- Keyboard navigation support
- Focus management for form interactions

## Best Practices

1. Always provide labels for form fields
2. Use appropriate input types (email, tel, number, etc.)
3. Group related fields together
4. Provide clear error messages
5. Include helper text for complex fields
6. Make forms responsive for mobile devices
7. Implement proper validation feedback
8. Consider progressive disclosure for complex forms

## Examples

### Login Form
```tsx
<Form variant="vertical" maxWidth="sm">
  <FormField name="email" label="Email" required>
    <Input type="email" />
  </FormField>
  <FormField name="password" label="Password" required>
    <Input type="password" />
  </FormField>
  <FormField name="remember">
    <Checkbox label="Remember me" />
  </FormField>
  <Button type="submit" fullWidth>Login</Button>
</Form>
```

### Contact Form
```tsx
<Form variant="vertical" maxWidth="md">
  <Stack direction="row" spacing={2}>
    <FormField name="firstName" label="First Name" required>
      <Input />
    </FormField>
    <FormField name="lastName" label="Last Name" required>
      <Input />
    </FormField>
  </Stack>
  <FormField name="email" label="Email" required>
    <Input type="email" />
  </FormField>
  <FormField name="message" label="Message" required>
    <Textarea rows={4} />
  </FormField>
  <Button type="submit">Send Message</Button>
</Form>
```
# RichTextEditor

A comprehensive rich text editor component with formatting capabilities, built on MUI and integrated with modern rich text editing libraries. Provides a complete set of text editing features including bold, italic, underline, lists, links, and more.

## Features

- **Rich Text Formatting**: Bold, italic, underline, strikethrough
- **Lists**: Ordered and unordered lists
- **Links and Images**: Insert links and images
- **Code Blocks**: Formatted code blocks with syntax highlighting
- **Quotes**: Blockquote formatting
- **Character Count**: Optional character limit with visual feedback
- **Accessibility**: Full ARIA support and keyboard navigation
- **Theming**: Full MUI theme integration
- **Customizable Toolbar**: Configure which tools are available

## Usage

### Basic Usage

```tsx
import { RichTextEditor } from '@repo/ui';

function App() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start writing your content..."
    />
  );
}
```

### With Custom Toolbar

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  toolbar={{
    bold: true,
    italic: true,
    underline: false,
    orderedList: true,
    unorderedList: true,
    link: true,
    image: false,
  }}
/>
```

### With Character Limit

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  maxLength={500}
  placeholder="Keep it under 500 characters..."
/>
```

### Read-Only Mode

```tsx
<RichTextEditor
  value={content}
  readOnly
  toolbar={{}} // Hide toolbar in read-only mode
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | The current value of the rich text editor content |
| `onChange` | `(value: string) => void` | - | Callback when the content changes |
| `placeholder` | `string` | `'Start typing...'` | Placeholder text when empty |
| `disabled` | `boolean` | `false` | Whether the editor is disabled |
| `readOnly` | `boolean` | `false` | Whether the editor is read-only |
| `toolbar` | `ToolbarConfig` | Default config | Configuration for toolbar buttons and features |
| `height` | `number \| string` | `300` | Height of the editor |
| `maxLength` | `number` | - | Maximum number of characters allowed |
| `onFocus` | `() => void` | - | Callback when editor receives focus |
| `onBlur` | `() => void` | - | Callback when editor loses focus |
| `className` | `string` | - | Additional CSS classes |
| `data-testid` | `string` | - | Test ID for testing purposes |
| `aria-label` | `string` | `'Rich text editor'` | ARIA label for accessibility |
| `aria-describedby` | `string` | - | ARIA described by for accessibility |

## ToolbarConfig

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `bold` | `boolean` | `true` | Show bold button |
| `italic` | `boolean` | `true` | Show italic button |
| `underline` | `boolean` | `true` | Show underline button |
| `strikethrough` | `boolean` | `false` | Show strikethrough button |
| `orderedList` | `boolean` | `true` | Show ordered list button |
| `unorderedList` | `boolean` | `true` | Show unordered list button |
| `link` | `boolean` | `true` | Show link button |
| `image` | `boolean` | `false` | Show image button |
| `codeBlock` | `boolean` | `false` | Show code block button |
| `quote` | `boolean` | `false` | Show quote button |
| `customItems` | `ToolbarItem[]` | `[]` | Custom toolbar items |

## Keyboard Shortcuts

- **Ctrl/Cmd + B**: Bold
- **Ctrl/Cmd + I**: Italic  
- **Ctrl/Cmd + U**: Underline
- **Ctrl/Cmd + K**: Insert Link
- **Tab**: Indent (in lists)
- **Shift + Tab**: Outdent (in lists)

## Accessibility

The RichTextEditor component follows WAI-ARIA guidelines:

- Proper ARIA roles and labels
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- High contrast mode support

### Screen Reader Support

- Content changes are announced
- Toolbar buttons have descriptive labels
- Character count is announced when approaching limit

### Keyboard Navigation

- All toolbar buttons are keyboard accessible
- Standard text editing keyboard shortcuts work
- Tab navigation follows logical order

## Best Practices

1. **Content Validation**: Always validate and sanitize rich text content on the server side
2. **Character Limits**: Use `maxLength` for forms with content restrictions
3. **Accessibility**: Provide meaningful `aria-label` and `aria-describedby` attributes
4. **Performance**: Consider debouncing the `onChange` callback for frequent updates
5. **Theming**: Use MUI theme tokens for consistent styling

## Examples

See the Storybook stories for comprehensive usage examples and interactive demos.
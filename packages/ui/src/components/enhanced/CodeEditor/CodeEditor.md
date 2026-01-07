# CodeEditor

A powerful Monaco-based code editor component with syntax highlighting, themes, and advanced features like auto-formatting, fullscreen mode, and live editing.

## Overview

The CodeEditor component provides a feature-rich code editing experience using the Monaco Editor (the same editor that powers VS Code). It supports multiple programming languages, themes, and includes a comprehensive toolbar for enhanced functionality.

## Features

- **Multi-language Support**: JavaScript, TypeScript, JSON, CSS, HTML, YAML, Markdown, SQL, Python
- **Theming**: Light, dark, and auto themes with custom styling
- **Interactive Toolbar**: Copy, format, word wrap, and fullscreen controls
- **Accessibility**: Full keyboard navigation and screen reader support
- **Live Editing**: Real-time change detection with save callbacks
- **Customizable**: Adjustable font size, line numbers, minimap, and more
- **Glass Effect**: Modern glassmorphism design with backdrop blur

## Usage Examples

### Basic Usage

```tsx
import { CodeEditor } from '@company/ui-components';

function App() {
  const [code, setCode] = useState('console.log("Hello World");');

  return <CodeEditor language="javascript" value={code} onChange={setCode} height="400px" />;
}
```

### Read-Only Mode

```tsx
<CodeEditor
  language="json"
  value='{"name": "example", "version": "1.0.0"}'
  readOnly
  height="300px"
/>
```

### With Save Callback

```tsx
function EditorWithSave() {
  const [code, setCode] = useState('');

  const handleSave = (value: string) => {
    console.log('Saving code:', value);
    // Implement your save logic here
  };

  return (
    <CodeEditor
      language="typescript"
      value={code}
      onChange={setCode}
      onSave={handleSave}
      height="500px"
    />
  );
}
```

## Props Documentation

### Required Props

- **`language`** (`EditorLanguage`): Programming language for syntax highlighting
  - Options: `'javascript' | 'typescript' | 'json' | 'css' | 'html' | 'yaml' | 'markdown' | 'sql' | 'python'`
- **`value`** (`string`): Current code content

### Optional Props

- **`height`** (`string`): Editor height (default: `'400px'`)
- **`theme`** (`EditorTheme`): Color theme (default: `'auto'`)
  - Options: `'light' | 'dark' | 'auto'`
- **`onChange`** (`(value: string) => void`): Callback when content changes
- **`readOnly`** (`boolean`): Read-only mode (default: `false`)
- **`lineNumbers`** (`boolean`): Show line numbers (default: `true`)
- **`minimap`** (`boolean`): Show minimap navigation (default: `false`)
- **`fontSize`** (`number`): Font size in pixels (default: `14`)
- **`wordWrap`** (`boolean`): Enable word wrapping (default: `false`)
- **`showToolbar`** (`boolean`): Display toolbar with actions (default: `true`)
- **`autoFormat`** (`boolean`): Auto-format code on load (default: `false`)
- **`placeholder`** (`string`): Placeholder text when empty
- **`onSave`** (`(value: string) => void`): Callback for Ctrl+S save action

## Accessibility

The CodeEditor component is designed with accessibility in mind:

- **Keyboard Navigation**: Full support for keyboard-only users
- **Screen Reader**: Proper ARIA labels and descriptions
- **Focus Management**: Logical tab order through interactive elements
- **High Contrast**: Supports system high contrast themes
- **Keyboard Shortcuts**:
  - `Ctrl+S` (or `Cmd+S`): Save current content
  - `Escape`: Exit fullscreen mode
  - Standard Monaco editor shortcuts

## Toolbar Features

### Copy to Clipboard

- Copies the entire editor content to the clipboard
- Provides visual feedback when copy is successful

### Format Code

- Auto-formats the current code using Monaco's built-in formatters
- Only available when not in read-only mode

### Word Wrap Toggle

- Toggles word wrapping on/off
- Visual indicator shows current state

### Fullscreen Mode

- Expands the editor to full screen
- Exit with button click or Escape key

## Best Practices

1. **Language Selection**: Always specify the correct language for proper syntax highlighting
2. **Height Management**: Use appropriate height values for your use case
3. **Performance**: For large files, consider using the minimap and word wrap options
4. **Accessibility**: Always provide meaningful placeholder text for empty editors
5. **Save Handling**: Implement the `onSave` callback for better user experience
6. **Theme Consistency**: Use 'auto' theme to match your application's theme system

## Browser Support

- Chrome 70+
- Firefox 70+
- Safari 12+
- Edge 79+

## Dependencies

- `@monaco-editor/react`: Monaco Editor React wrapper
- `@mui/material`: Material-UI components and theming
- `@mui/icons-material`: Material-UI icons

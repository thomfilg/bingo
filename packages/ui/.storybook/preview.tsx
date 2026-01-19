import { createTheme, CssBaseline,ThemeProvider } from '@mui/material';
import type { Preview } from '@storybook/react-vite';
import React from 'react';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366F1',
    },
    secondary: {
      main: '#8B5CF6',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#818CF8',
    },
    secondary: {
      main: '#A78BFA',
    },
  },
});

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Navigation', '*'],
        locales: 'en-US',
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === 'dark' ? darkTheme : lightTheme;
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Story />
        </ThemeProvider>
      );
    },
  ],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: ['light', 'dark'],
        showName: true,
      },
    },
  },
};

export default preview;
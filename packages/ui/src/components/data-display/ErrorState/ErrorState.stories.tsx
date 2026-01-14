import BugReportIcon from '@mui/icons-material/BugReport';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ErrorState } from './ErrorState';

const meta: Meta<typeof ErrorState> = {
  title: 'DataDisplay/AsyncStates/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An error state component that displays error messages with optional retry functionality.',
      },
    },
  },
  tags: ['autodocs', 'component:ErrorState'],
  argTypes: {
    severity: {
      control: 'radio',
      options: ['error', 'warning'],
      description: 'Visual severity of the error state',
    },
    message: {
      control: 'text',
      description: 'The error message to display',
    },
    title: {
      control: 'text',
      description: 'Optional title for the error state',
    },
    retryLabel: {
      control: 'text',
      description: 'Custom label for the retry button',
    },
    onRetry: {
      action: 'retry clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'Something went wrong while loading the data.',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
    onRetry: fn(),
  },
};

export const WithRetryButton: Story = {
  args: {
    message: 'Failed to load data. Please try again.',
    onRetry: fn(),
  },
};

export const CustomRetryLabel: Story = {
  args: {
    message: 'The request timed out.',
    onRetry: fn(),
    retryLabel: 'Try Again',
  },
};

export const WarningSeverity: Story = {
  args: {
    severity: 'warning',
    title: 'Warning',
    message: 'Some items could not be loaded. You can continue with partial data.',
    onRetry: fn(),
  },
};

export const NetworkError: Story = {
  args: {
    title: 'Network Error',
    message: 'Unable to reach the server. Please check your connection and try again.',
    onRetry: fn(),
  },
};

export const ServerError: Story = {
  args: {
    title: 'Server Error',
    message: 'The server encountered an unexpected error. Our team has been notified.',
    onRetry: fn(),
    retryLabel: 'Reload Page',
  },
};

export const CustomIcon: Story = {
  args: {
    title: 'Bug Detected',
    message: "We've found a bug in your code. Please review the error logs.",
    icon: <BugReportIcon sx={{ fontSize: 48, color: 'error.main' }} />,
    onRetry: fn(),
    retryLabel: 'View Logs',
  },
};

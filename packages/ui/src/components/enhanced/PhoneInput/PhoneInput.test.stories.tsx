import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect, waitFor, fn } from '@storybook/test';

import { PhoneInput } from './PhoneInput';

const meta: Meta<typeof PhoneInput> = {
  title: 'Enhanced/PhoneInput/Tests',
  component: PhoneInput,
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: false },
    docs: {
      description: {
        component: 'Test stories for PhoneInput component validation and interactions',
      },
    },
  },
  tags: ['autodocs', 'test'],
  args: {
    label: 'Phone Number',
    placeholder: 'Enter phone number',
    countryCode: 'US',
    onChange: fn(),
  },
};

export default meta;
export type Story = StoryObj<typeof meta>;

// 1. Interaction Tests
export const BasicInteraction: Story = {
  args: {
    label: 'Phone Number',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Find input field
    const input = canvas.getByRole('textbox');
    await expect(input).toBeInTheDocument();
    await expect(input).toHaveAttribute('type', 'tel');

    // Clear any existing value
    await userEvent.clear(input);

    // Type a US phone number
    await userEvent.type(input, '5551234567');
    
    // Verify onChange was called with each keystroke
    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalled();
      const lastCall = args.onChange.mock.calls[args.onChange.mock.calls.length - 1];
      expect(lastCall[0]).toContain('5551234567');
    });

    // Blur to trigger formatting
    await userEvent.tab();
    
    // Verify the value is formatted after blur
    await waitFor(() => {
      const formattedValue = input.getAttribute('value');
      expect(formattedValue).toMatch(/\+1.*555.*123.*4567/);
    });
  },
};

// 2. Form Interaction Tests
export const FormInteraction: Story = {
  args: {
    required: true,
    error: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox');
    await expect(input).toBeInTheDocument();

    // Clear any existing value
    await userEvent.clear(input);
    
    // Type an invalid phone number
    await userEvent.type(input, '123');
    
    // Blur to trigger validation
    await userEvent.tab();

    // Should show validation error
    await waitFor(() => {
      const helperText = canvas.getByText('Invalid phone number');
      expect(helperText).toBeVisible();
    });

    // Clear and type a valid number
    await userEvent.click(input);
    await userEvent.clear(input);
    await userEvent.type(input, '5551234567');
    await userEvent.tab();

    // Error should be gone
    await waitFor(() => {
      const errorText = canvas.queryByText('Invalid phone number');
      expect(errorText).not.toBeInTheDocument();
    });
  },
};

// 3. Keyboard Navigation Tests
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find country selector button
    const countrySelector = canvas.getByRole('button', { name: /select country/i });
    await expect(countrySelector).toBeInTheDocument();
    
    // Tab to country selector
    await userEvent.tab();
    await expect(countrySelector).toHaveFocus();

    // Press Enter to open country menu
    await userEvent.keyboard('[Enter]');

    // Verify menu is open and contains countries
    await waitFor(() => {
      const unitedStates = canvas.getByText('United States');
      expect(unitedStates).toBeVisible();
      
      const unitedKingdom = canvas.getByText('United Kingdom');
      expect(unitedKingdom).toBeVisible();
    });

    // Navigate with arrow keys
    await userEvent.keyboard('[ArrowDown]');
    await userEvent.keyboard('[ArrowDown]');
    
    // Select with Enter
    await userEvent.keyboard('[Enter]');
    
    // Menu should close
    await waitFor(() => {
      const menu = canvas.queryByRole('menu');
      expect(menu).not.toBeInTheDocument();
    });
  },
};

// 4. Screen Reader Tests
export const ScreenReader: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for proper ARIA labels
    const input = canvas.getByRole('textbox');
    await expect(input).toHaveAttribute('type', 'tel');

    // Check label association
    const label = canvas.getByText('Phone Number');
    await expect(label).toBeInTheDocument();

    // Check for country selector accessibility
    const countryButton = canvas.getByRole('button', { name: /select country/i });
    await expect(countryButton).toHaveAttribute('aria-expanded', 'false');
    await expect(countryButton).toHaveAttribute('aria-label', 'Select country');
    
    // Open menu and check expanded state
    await userEvent.click(countryButton);
    await waitFor(() => {
      expect(countryButton).toHaveAttribute('aria-expanded', 'true');
    });
    
    // Close menu
    await userEvent.keyboard('[Escape]');
    await waitFor(() => {
      expect(countryButton).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

// 5. Focus Management Tests
export const FocusManagement: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox');

    // Focus the input
    await userEvent.click(input);
    await expect(input).toHaveFocus();

    // Tab away and back
    await userEvent.tab();
    await userEvent.tab({ shift: true });
    await expect(input).toHaveFocus();
  },
};

// 6. Responsive Design Tests
export const ResponsiveDesign: Story = {
  parameters: {
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
      },
      defaultViewport: 'mobile',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox');
    await expect(input).toBeVisible();

    // Verify component renders properly on mobile
    const container = input.closest('.MuiTextField-root');
    expect(container).not.toBeNull();
    
    // Verify country selector is accessible on mobile
    const countryButton = canvas.getByRole('button', { name: /select country/i });
    await expect(countryButton).toBeVisible();
    
    // Test input functionality on mobile
    await userEvent.clear(input);
    await userEvent.click(input);
    await expect(input).toHaveFocus();
    
    // Type phone number on mobile viewport
    await userEvent.type(input, '5551234567');
    await waitFor(() => {
      expect(input).toHaveValue('5551234567');
    });
    
    // Test country selection on mobile
    await userEvent.click(countryButton);
    await waitFor(() => {
      expect(canvas.getByText('United States')).toBeVisible();
    });
    
    // Close menu by clicking outside
    await userEvent.click(input);
  },
};

// 7. Theme Variation Tests
export const ThemeVariations: Story = {
  args: {
    variant: 'glass',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox');
    await expect(input).toBeInTheDocument();

    // Check if glass variant applies styles
    const inputRoot = input.closest('.MuiOutlinedInput-root');
    expect(inputRoot).toBeTruthy();
    
    const styles = window.getComputedStyle(inputRoot!);
    // Glass effect should have backdrop blur
    expect(styles.backdropFilter || styles.webkitBackdropFilter).toMatch(/blur/);
    
    // Check hover effect
    await userEvent.hover(inputRoot!);
    await waitFor(() => {
      const hoverStyles = window.getComputedStyle(inputRoot!);
      expect(hoverStyles.background).toBeTruthy();
    });
  },
};

// 8. Visual State Tests
export const VisualStates: Story = {
  args: {
    error: true,
    errorMessage: 'Invalid phone number',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check error state
    const input = canvas.getByRole('textbox');
    await expect(input).toHaveAttribute('aria-invalid', 'true');

    const errorText = canvas.getByText('Invalid phone number');
    await expect(errorText).toBeVisible();
  },
};

// 9. Performance Tests
export const Performance: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox');
    
    // Test rapid input - verify input responsiveness
    await userEvent.clear(input);
    const testNumber = '5551234567';
    
    await userEvent.type(input, testNumber);
    
    // Verify all digits were entered correctly
    await waitFor(() => {
      expect(input).toHaveValue(testNumber);
    });
    
    // Test country switching functionality
    const countryButton = canvas.getByRole('button', { name: /select country/i });
    await userEvent.click(countryButton);
    
    // Wait for menu to appear
    await waitFor(() => {
      const ukOption = canvas.getByText('United Kingdom');
      expect(ukOption).toBeVisible();
    });
    
    // Select UK
    await userEvent.click(canvas.getByText('United Kingdom'));
    
    // Verify country changed successfully
    await waitFor(() => {
      const dialCode = canvas.getByText('+44');
      expect(dialCode).toBeVisible();
    });
  },
};

// 10. Edge Cases Tests
export const EdgeCases: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox');

    // Test with letters - should accept them as phone numbers can contain letters
    await userEvent.clear(input);
    await userEvent.type(input, 'abc123');
    await waitFor(() => {
      const value = input.getAttribute('value');
      expect(value).toBe('abc123');
    });

    // Test with very long input - should accept up to reasonable length
    await userEvent.clear(input);
    const longNumber = '12345678901234567890';
    await userEvent.type(input, longNumber);
    
    await waitFor(() => {
      const value = input.getAttribute('value');
      expect(value).toBe(longNumber);
      expect(value.length).toBe(20);
    });

    // Test with formatted input characters
    await userEvent.clear(input);
    await userEvent.type(input, '555-123-4567');
    await userEvent.tab();
    
    // Should format the number with international format
    await waitFor(() => {
      const value = input.getAttribute('value');
      expect(value).toMatch(/\+1.*555.*123.*4567/);
    });

    // Test paste event with formatted number
    await userEvent.clear(input);
    await userEvent.paste('+1 (555) 123-4567');
    
    // Should handle pasted formatted numbers
    await waitFor(() => {
      const value = input.getAttribute('value');
      expect(value).toBe('+1 (555) 123-4567');
    });
  },
};

// 11. Country Code Selection Test
export const CountryCodeSelection: Story = {
  args: {
    countryCode: 'US',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Verify initial US country
    const dialCode = canvas.getByText('+1');
    await expect(dialCode).toBeVisible();

    // Open country selector
    const countryButton = canvas.getByRole('button', { name: /select country/i });
    await userEvent.click(countryButton);

    // Verify all countries are shown
    await waitFor(() => {
      expect(canvas.getByText('United States')).toBeVisible();
      expect(canvas.getByText('United Kingdom')).toBeVisible();
      expect(canvas.getByText('Germany')).toBeVisible();
      expect(canvas.getByText('France')).toBeVisible();
      expect(canvas.getByText('Japan')).toBeVisible();
    });

    // Select Germany
    await userEvent.click(canvas.getByText('Germany'));

    // Verify country changed
    await waitFor(() => {
      const germanDialCode = canvas.getByText('+49');
      expect(germanDialCode).toBeVisible();
    });

    // Type a German phone number
    const input = canvas.getByRole('textbox');
    await userEvent.type(input, '30123456789');
    
    // Verify onChange called with German country code
    await waitFor(() => {
      const lastCall = args.onChange.mock.calls[args.onChange.mock.calls.length - 1];
      expect(lastCall[2]).toBe('DE');
    });
  },
};

// 12. Phone Number Formatting Test
export const PhoneNumberFormatting: Story = {
  args: {
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    // Test US number formatting
    await userEvent.type(input, '2125551234');
    await userEvent.tab();

    await waitFor(() => {
      const value = input.getAttribute('value');
      expect(value).toMatch(/\+1.*212.*555.*1234/);
    });

    // Change to UK and test UK formatting
    const countryButton = canvas.getByRole('button', { name: /select country/i });
    await userEvent.click(countryButton);
    await waitFor(() => {
      expect(canvas.getByText('United Kingdom')).toBeVisible();
    });
    await userEvent.click(canvas.getByText('United Kingdom'));

    // Clear and type UK number
    await userEvent.clear(input);
    await userEvent.type(input, '2079460958');
    await userEvent.tab();

    await waitFor(() => {
      const value = input.getAttribute('value');
      expect(value).toMatch(/\+44.*20.*7946.*0958/);
    });

    // Verify validation status in onChange
    await waitFor(() => {
      const calls = args.onChange.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[1]).toBe(true); // Should be valid
    });
  },
};

// 13. Integration Tests
export const Integration: Story = {
  args: {
    countryCode: 'GB',
    defaultValue: '+44 20 7946 0958',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox');

    // Verify initial value is set
    await expect(input).toHaveValue('+44 20 7946 0958');

    // Verify UK country is selected initially
    const countrySelector = canvas.getByRole('button', { name: /select country/i });
    const dialCode = canvas.getByText('+44');
    await expect(dialCode).toBeVisible();

    // Change country to United States
    await userEvent.click(countrySelector);

    // Wait for menu to open
    await waitFor(() => {
      const usOption = canvas.getByText('United States');
      expect(usOption).toBeVisible();
    });

    // Select United States
    await userEvent.click(canvas.getByText('United States'));

    // Verify country changed
    await waitFor(() => {
      const newDialCode = canvas.getByText('+1');
      expect(newDialCode).toBeVisible();
    });

    // Verify onChange was called with country change
    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalled();
      const lastCall = args.onChange.mock.calls[args.onChange.mock.calls.length - 1];
      expect(lastCall[2]).toBe('US'); // Country code should be US
    });

    // Type a new number with US format
    await userEvent.clear(input);
    await userEvent.type(input, '2125551234');
    await userEvent.tab();

    // Verify US formatting is applied
    await waitFor(() => {
      const value = input.getAttribute('value');
      expect(value).toMatch(/\+1.*212.*555.*1234/);
    });
  },
};

// 14. Enhanced Validation Tests  
export const EnhancedValidation: Story = {
  args: {
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    // Test invalid US number
    await userEvent.clear(input);
    await userEvent.type(input, '123');
    await userEvent.tab();
    
    await waitFor(() => {
      const helperText = canvas.getByText(/Invalid phone number for United States/);
      expect(helperText).toBeVisible();
    });

    // Test valid US number  
    await userEvent.clear(input);
    await userEvent.type(input, '2125551234');
    await userEvent.tab();
    
    await waitFor(() => {
      const errorText = canvas.queryByText(/Invalid phone number/);
      expect(errorText).not.toBeInTheDocument();
    });

    // Verify onChange called with validation result
    await waitFor(() => {
      const lastCall = args.onChange.mock.calls[args.onChange.mock.calls.length - 1];
      expect(lastCall[1]).toBe(true); // Should be valid
      expect(lastCall[2]).toBe('US'); // Country code
    });
  },
};

// 15. Auto-Country Detection Tests
export const AutoCountryDetection: Story = {
  args: {
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    // Type German international number
    await userEvent.clear(input);
    await userEvent.type(input, '+49301234567');
    
    // Should auto-detect Germany
    await waitFor(() => {
      const germanDialCode = canvas.getByText('+49');
      expect(germanDialCode).toBeVisible();
    });

    // Verify onChange called with German country
    await waitFor(() => {
      const lastCall = args.onChange.mock.calls[args.onChange.mock.calls.length - 1];
      expect(lastCall[2]).toBe('DE');
    });

    // Type UK international number
    await userEvent.clear(input);
    await userEvent.type(input, '+442079460958');
    
    // Should auto-detect UK
    await waitFor(() => {
      const ukDialCode = canvas.getByText('+44');
      expect(ukDialCode).toBeVisible();
    });

    // Verify onChange called with UK country
    await waitFor(() => {
      const lastCall = args.onChange.mock.calls[args.onChange.mock.calls.length - 1];
      expect(lastCall[2]).toBe('GB');
    });
  },
};

// 16. Extended Country Support Tests
export const ExtendedCountrySupport: Story = {
  args: {
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test country selection from extended list
    const countryButton = canvas.getByRole('button', { name: /select country/i });
    await userEvent.click(countryButton);

    // Verify extended countries are available (should be sorted alphabetically)
    await waitFor(() => {
      expect(canvas.getByText('Argentina')).toBeVisible();
      expect(canvas.getByText('Belgium')).toBeVisible();
      expect(canvas.getByText('Denmark')).toBeVisible();
      expect(canvas.getByText('Finland')).toBeVisible();
      expect(canvas.getByText('Singapore')).toBeVisible();
      expect(canvas.getByText('Sweden')).toBeVisible();
      expect(canvas.getByText('United Arab Emirates')).toBeVisible();
    });

    // Select Singapore
    await userEvent.click(canvas.getByText('Singapore'));

    // Verify Singapore dial code appears
    await waitFor(() => {
      const singaporeDialCode = canvas.getByText('+65');
      expect(singaporeDialCode).toBeVisible();
    });

    // Type Singapore number
    const input = canvas.getByRole('textbox');
    await userEvent.type(input, '81234567');
    
    // Verify onChange called with Singapore country code
    await waitFor(() => {
      const lastCall = args.onChange.mock.calls[args.onChange.mock.calls.length - 1];
      expect(lastCall[2]).toBe('SG');
    });
  },
};

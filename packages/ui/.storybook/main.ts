import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  async viteFinal(config) {
    const { default: istanbul } = await import('vite-plugin-istanbul');

    config.build = config.build || {};
    config.build.rollupOptions = config.build.rollupOptions || {};
    config.build.rollupOptions.onwarn = (warning, warn) => {
      // Ignore "use client" directive warnings
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
        return;
      }
      // Ignore sourcemap warnings
      if (warning.message.includes('sourcemap')) {
        return;
      }
      // Log other warnings
      warn(warning);
    };

    return mergeConfig(config, {
      plugins: [
        istanbul({
          include: ['src/**/*.{ts,tsx}'],
          exclude: ['node_modules', 'test/', '**/*.stories.{ts,tsx}', '**/*.test.{ts,tsx}'],
          requireEnv: false,
          forceBuildInstrument: true,
        }),
      ],
    });
  },
};

export default config;

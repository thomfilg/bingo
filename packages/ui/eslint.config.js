// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import tsParser from '@typescript-eslint/parser';
import storybook from "eslint-plugin-storybook";
import globals from 'globals';

import { config } from "@repo/eslint-config/base";

export default [
  {
    ignores: [
      'packages/ui/scripts/check-component.js',
      'packages/ui/tsup.config.ts',
      'node_modules/**',
      'dist/**',
      'build/**',
      'storybook-static/**',
      'packages/ui/scripts/**',
      'packages/ui/scripts/**/*',
      'scripts/**',
      'scripts/**/*',
      'tsup.config.ts',
    ],
  },
  ...config,
  ...storybook.configs["flat/recommended"],
  // Override parser for all TypeScript files after storybook config
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        React: 'readonly',
        google: 'readonly',
        // Node-specific globals needed for build tools
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
      },
    },
    rules: {
      // Use TypeScript's unused vars instead of base rule
      'no-unused-vars': 'off',
    },
  },
  // UI-specific rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'error',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      // Turbo env vars not relevant for UI lib
      'turbo/no-undeclared-env-vars': 'off',
      // Allow underscore-prefixed unused vars (intentionally unused params)
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
    },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
    },
  },
];

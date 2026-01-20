import { config } from "@repo/eslint-config/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
    ],
  },
  ...config,
  // Package-specific overrides
  {
    rules: {
      // These env vars are used at runtime in different environments
      'turbo/no-undeclared-env-vars': 'off',
      // Allow unused vars prefixed with underscore
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      // These are from existing code in shared-helpers
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
      // Allow empty catch blocks for intentional error swallowing
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
];

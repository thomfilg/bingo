// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import rootConfig from '../../eslint.config.js';

export default [{
  ignores: [
    'packages/ui/scripts/check-component.js',
    'packages/ui/tsup.config.ts',
    // (keep any others you want globally ignored)
    'node_modules/**',
    'dist/**',
    'build/**',
    'storybook-static/**',
    'packages/ui/scripts/**',
    'packages/ui/scripts/**/*',
    'scripts/**',
    'scripts/**/*',
  ],
}, ...rootConfig, {
  files: ['**/*.{js,jsx,ts,tsx}'],
  rules: {
    'no-console': 'error',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
  },
  settings: {
    'import/resolver': { typescript: { project: './tsconfig.json' } },
  },
}, ...storybook.configs["flat/recommended"]];

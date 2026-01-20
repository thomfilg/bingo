import rootConfig from '../../eslint.config.mjs';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
    ],
  },
  ...rootConfig,
];

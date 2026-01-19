import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        '*.config.ts',
        '*.config.js',
        'app/**/*.tsx', // Exclude React components
      ],
    },
    include: ['src/**/*.{test,spec}.ts', 'src/**/__tests__/**/*.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

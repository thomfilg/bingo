import { glob } from 'glob';
import { defineConfig } from 'tsup';

export default defineConfig(() => {
  const component = process.env.COMPONENT;

  const entry = component
    ? glob.sync(`src/components/**/${component}/index.{ts,tsx}`)
    : ['src/index.ts'];

  if (component && entry.length === 0) {
    console.error(`Component "${component}" not found!`);
    process.exit(1);
  }

  return {
    entry,
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    outDir: component ? `dist/${component}` : 'dist',
    external: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
    ],
  };
});

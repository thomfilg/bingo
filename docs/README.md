# Bingo

Turborepo monorepo with Next.js and Cloudflare deployment.

## Apps and Packages

- `web`: [Next.js](https://nextjs.org/) app
- `@repo/ui`: React component library
- `@repo/eslint-config`: ESLint configurations
- `@repo/typescript-config`: TypeScript configs

## Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build
pnpm build

# Lint and type check
pnpm lint
pnpm check-types
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Cloudflare setup.

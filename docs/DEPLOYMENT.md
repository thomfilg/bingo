# Deployment Guide

This monorepo supports **free deployment** on Cloudflare with automatic worker detection.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare (Free)                    │
│  ┌─────────────────────────┐  ┌─────────────────────┐   │
│  │     Pages (Next.js)     │  │   Workers (APIs)    │   │
│  └─────────────────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   Neon Postgres (Free)  │
              │       512MB storage     │
              └─────────────────────────┘
```

## Apps

| App | Type | Local Port |
|-----|------|------------|
| `web` | Next.js | 3000 |

## CI/CD Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | PR to main | Lint, type-check, build |
| `cd.yml` | Push to main | Build, deploy workers, trigger post-cd |
| `post-cd.yml` | After cd.yml | Smoke, integration, e2e tests |

---

## Cloudflare Workers (Auto-Detected)

Any folder with a `wrangler.toml` file is automatically detected and deployed as a Worker.

### Creating a New Worker

1. Create a folder anywhere in the repo (e.g., `apps/my-api/` or `workers/my-worker/`)
2. Add a `wrangler.toml`:

```toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2024-12-01"
```

3. Add your code in `src/index.ts`
4. Push to main - it deploys automatically!

### Required Secrets

Add to GitHub Settings > Secrets:
- `CLOUDFLARE_API_TOKEN` - Create at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) with "Edit Workers" permission
- `CLOUDFLARE_ACCOUNT_ID` - Found in Cloudflare dashboard URL or Workers & Pages overview

### Manual Deploy

```bash
cd apps/my-worker
npx wrangler deploy
```

---

## Cloudflare Pages (Next.js Apps)

**Free**: Unlimited bandwidth, 500 builds/month

### Automatic Deployment (Recommended)

Apps with a `deploy/config.json` file are automatically deployed when you push to main. The CD workflow handles building and deploying to Cloudflare Pages.

Example `apps/web/deploy/config.json`:
```json
{
  "name": "bingo-web",
  "provider": "cloudflare-pages",
  "build": {
    "command": "pnpm turbo build --filter=web",
    "outputPath": "apps/web/out"
  }
}
```

**Note**: For Cloudflare Pages, use `output: 'export'` in your `next.config.js` to generate static files in the `out` directory.

### Manual Setup (Alternative)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) > Workers & Pages
2. Create application > Pages > Connect to Git
3. Select this repository
4. Configure:
   - **Build command**: `pnpm install && pnpm turbo build --filter=web`
   - **Build output directory**: `apps/web/out`
   - **Root directory**: `/`
5. Add environment variable: `NODE_VERSION` = `20`
6. Deploy

---

## Free Database: Neon Postgres

**Neon** offers 512MB free PostgreSQL with serverless scaling.

### Setup (3 minutes)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string

### Usage in Workers

```typescript
// Install: pnpm add @neondatabase/serverless
import { neon } from '@neondatabase/serverless';

export default {
  async fetch(request: Request, env: Env) {
    const sql = neon(env.DATABASE_URL);
    const result = await sql`SELECT * FROM users`;
    return Response.json(result);
  }
};
```

Add to `wrangler.toml`:
```toml
[vars]
DATABASE_URL = "postgresql://..." # Or use secrets
```

### Usage in Next.js

```typescript
// Install: pnpm add @neondatabase/serverless
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function getUsers() {
  return await sql`SELECT * FROM users`;
}
```

### Free Database Comparison

| Provider | Storage | Best For |
|----------|---------|----------|
| **Neon** | 512MB | Postgres, serverless, branching |
| **Supabase** | 500MB | Postgres + Auth + Storage |
| **MongoDB Atlas** | 512MB | Document database |
| **Turso** | 9GB | SQLite, edge-optimized |

---

## Local Development

```bash
# Install dependencies
pnpm install

# Run all apps
pnpm dev

# Run specific app
pnpm dev --filter=web

# Build
pnpm build

# Lint and type check
pnpm lint
pnpm check-types
```

## Environment Variables

### Local Development
Create `.env.local` in each app:
```
DATABASE_URL=postgresql://username:password@project-name.region.neon.tech/dbname?sslmode=require
```

### Production
- **Cloudflare Workers**: `wrangler secret put DATABASE_URL`
- **Cloudflare Pages**: Settings > Environment Variables

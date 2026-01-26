# Bingo Project

## Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for Digital Ocean deployment instructions.

**When to use deployment scripts:**
- When user asks to "run a server", "deploy", or "test on a real server"
- When Claude needs a complete running server (e.g., for E2E testing, API testing, or integration verification)
- Use `./scripts/ephemeral/deploy-cloud-init.sh` to create a new droplet with the current branch

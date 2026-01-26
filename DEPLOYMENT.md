# Deployment

## Digital Ocean Deployment

Deploy the application to Digital Ocean droplets using the scripts in `scripts/ephemeral/`.

### Quick Start

```bash
# Set required environment variables
export DO_API_TOKEN="your-digitalocean-api-token"
export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Deploy
./scripts/ephemeral/deploy-cloud-init.sh -n bingo-prod -b main
```

### Scripts

| Script | Description |
|--------|-------------|
| `deploy-cloud-init.sh` | Deploy via cloud-init (recommended, no SSH needed) |
| `deploy.sh` | Deploy via SSH (for redeployments) |

### deploy-cloud-init.sh

Creates a new droplet and deploys automatically using cloud-init.

```bash
# Basic deployment
./scripts/ephemeral/deploy-cloud-init.sh

# With options
./scripts/ephemeral/deploy-cloud-init.sh -n my-app -b main -s s-4vcpu-8gb

# List active droplets
./scripts/ephemeral/deploy-cloud-init.sh -l

# Destroy a droplet
./scripts/ephemeral/deploy-cloud-init.sh -d <droplet-id>
```

**Options:**
- `-n, --name` - Droplet name (default: bingo-TIMESTAMP)
- `-s, --size` - Droplet size (default: s-2vcpu-4gb)
- `-b, --branch` - Git branch to deploy (default: main)
- `-d, --destroy` - Destroy droplet by ID
- `-l, --list` - List running droplets

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DO_API_TOKEN` | Yes | Digital Ocean API token |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `DO_SSH_PRIVATE_KEY_B64` | No | SSH key for `deploy.sh` |

### Endpoints

After deployment, the following endpoints are available:

- `http://<IP>/` - Web application
- `http://<IP>/docs` - Documentation
- `http://<IP>/api` - API endpoints
- `http://<IP>/health` - Health check

### Architecture

The deployment uses:
- **nginx** - Reverse proxy on port 80
- **PostgreSQL** - Database
- **Redis** - Caching
- **Docker Compose** - Container orchestration

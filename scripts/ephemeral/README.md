# Ephemeral Test Server (Digital Ocean)

Scripts for running tests on ephemeral Digital Ocean droplets.

## Prerequisites

1. **Digital Ocean Account** - Get API token from [DO Console](https://cloud.digitalocean.com/account/api/tokens)
2. **SSH Key** - Add your SSH public key to Digital Ocean at [Security Settings](https://cloud.digitalocean.com/account/security)
3. **Required tools**: `curl`, `jq`

## Quick Start

```bash
# Set environment variables (single line, .env compatible)
export DO_API_TOKEN="your-digitalocean-api-token"
export DO_SSH_PRIVATE_KEY_B64="base64-encoded-private-key"

# Run full test workflow
./run-ephemeral-test.sh https://github.com/user/repo.git main "pnpm test"
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DO_API_TOKEN` | Yes | Digital Ocean API token |
| `DO_SSH_PRIVATE_KEY_B64` | Yes | SSH private key base64 encoded (single line) |
| `GITHUB_TOKEN` | No | For private repositories |
| `DROPLET_SIZE` | No | Droplet size (default: `s-2vcpu-4gb`) |
| `SSH_KEY_ID` | No | Digital Ocean SSH key ID (auto-detected if not set) |
| `KEEP_SERVER` | No | Set to `true` to keep droplet after tests |

## How to Encode Your SSH Key

```bash
# Encode your private key to base64 (single line)
cat ~/.ssh/your_key | base64 -w 0

# Copy the output and set as env var
export DO_SSH_PRIVATE_KEY_B64="paste-here"
```

## .env Example

```env
DO_API_TOKEN=dop_v1_xxxxxxxxxxxxxxxx
DO_SSH_PRIVATE_KEY_B64=LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0t...
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

## Scripts

| Script | Description |
|--------|-------------|
| `run-ephemeral-test.sh` | Full workflow: create, clone, test, destroy |
| `create-server.sh` | Create a new Digital Ocean droplet |
| `destroy-server.sh` | Destroy the current droplet |
| `connect.sh` | SSH into the droplet |

## Droplet Sizes

| Size | vCPU | RAM | Price/hr |
|------|------|-----|----------|
| `s-1vcpu-1gb` | 1 | 1GB | $0.007 |
| `s-2vcpu-4gb` | 2 | 4GB | $0.036 |
| `s-4vcpu-8gb` | 4 | 8GB | $0.071 |

## Examples

### Keep droplet for debugging:
```bash
KEEP_SERVER=true ./run-ephemeral-test.sh https://github.com/org/repo.git main "pnpm test"
```

### Larger droplet:
```bash
DROPLET_SIZE=s-4vcpu-8gb ./run-ephemeral-test.sh https://github.com/org/repo.git main "pnpm test"
```

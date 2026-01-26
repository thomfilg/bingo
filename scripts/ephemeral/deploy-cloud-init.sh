#!/bin/bash

# ============================================================
# Deploy to Digital Ocean using Cloud-Init (No SSH required)
# ============================================================
# Creates a droplet that auto-deploys via cloud-init user-data
#
# Usage: ./deploy-cloud-init.sh [options]
#
# Options:
#   -n, --name NAME       Droplet name (default: bingo-TIMESTAMP)
#   -s, --size SIZE       Droplet size (default: s-2vcpu-4gb)
#   -b, --branch BRANCH   Git branch to deploy (default: main)
#   -d, --destroy ID      Destroy existing droplet by ID
#   -l, --list            List running droplets
#   -h, --help            Show this help
#
# Environment variables:
#   DO_API_TOKEN          - Digital Ocean API token (required)
#   GITHUB_TOKEN          - For private repositories (optional)
#   GOOGLE_CLIENT_ID      - Google OAuth client ID (optional)
#   GOOGLE_CLIENT_SECRET  - Google OAuth client secret (optional)
# ============================================================

set -e

# Default values
DROPLET_NAME="bingo-$(date +%s)"
DROPLET_SIZE="s-2vcpu-4gb"
BRANCH="main"
REGION="nyc1"
IMAGE="ubuntu-24-04-x64"
REPO_URL="https://github.com/tigredonorte/bingo.git"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--name) DROPLET_NAME="$2"; shift 2 ;;
        -s|--size) DROPLET_SIZE="$2"; shift 2 ;;
        -b|--branch) BRANCH="$2"; shift 2 ;;
        -d|--destroy)
            echo "Destroying droplet: $2"
            curl -sk -X DELETE "https://api.digitalocean.com/v2/droplets/$2" \
                -H "Authorization: Bearer $DO_API_TOKEN"
            echo "Done"
            exit 0
            ;;
        -l|--list)
            echo "Active droplets:"
            curl -sk "https://api.digitalocean.com/v2/droplets" \
                -H "Authorization: Bearer $DO_API_TOKEN" | \
                jq -r '.droplets[] | "  \(.id) | \(.name) | \(.networks.v4[0].ip_address) | \(.status)"'
            exit 0
            ;;
        -h|--help) head -25 "$0" | tail -20; exit 0 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Validate
if [ -z "$DO_API_TOKEN" ]; then
    echo "Error: DO_API_TOKEN required"
    exit 1
fi

# Get SSH key ID (may fail if token lacks account:read scope)
SSH_RESPONSE=$(curl -sk "https://api.digitalocean.com/v2/account/keys" \
    -H "Authorization: Bearer $DO_API_TOKEN")

SSH_KEY_ID=$(echo "$SSH_RESPONSE" | jq -r '.ssh_keys[0].id // empty' 2>/dev/null || echo "")

if [ -z "$SSH_KEY_ID" ] || [ "$SSH_KEY_ID" = "null" ]; then
    echo "Warning: Could not get SSH keys (token may lack account:read scope)"
    echo "         Droplet will have no SSH access"
    SSH_KEYS_JSON="[]"
else
    echo "Using SSH key ID: $SSH_KEY_ID"
    SSH_KEYS_JSON="[\"$SSH_KEY_ID\"]"
fi

# Prepare GitHub clone URL
if [ -n "$GITHUB_TOKEN" ]; then
    CLONE_URL=$(echo "$REPO_URL" | sed "s|https://|https://${GITHUB_TOKEN}@|")
else
    CLONE_URL="$REPO_URL"
fi

echo ""
echo "============================================================"
echo "  BINGO CLOUD-INIT DEPLOYMENT"
echo "============================================================"
echo "  Name:   $DROPLET_NAME"
echo "  Size:   $DROPLET_SIZE"
echo "  Branch: $BRANCH"
echo "  Repo:   $REPO_URL"
echo ""

# Build OAuth environment section if credentials are available
OAUTH_ENV=""
if [ -n "$GOOGLE_CLIENT_ID" ] && [ -n "$GOOGLE_CLIENT_SECRET" ]; then
    OAUTH_ENV="GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET"
    echo "  OAuth:  Google credentials configured"
fi

# Cloud-init script
# Note: Uses official Docker install script (docker.io package lacks compose plugin)
CLOUD_INIT=$(cat <<CLOUDINIT
#cloud-config
package_update: true
packages:
  - git
  - curl
  - jq

runcmd:
  # Install Docker using official script (includes compose plugin)
  - curl -fsSL https://get.docker.com | sh
  - systemctl enable docker
  - systemctl start docker

  # Clone repository
  - git clone --branch $BRANCH --depth 1 "$CLONE_URL" /app

  # Create environment file with OAuth credentials
  - |
    IP=\$(curl -sk http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address)
    cat > /app/.env << ENVEOF
POSTGRES_USER=bingo
POSTGRES_PASSWORD=bingo_secret_\$(openssl rand -hex 8)
POSTGRES_DB=bingo
AUTH_SECRET=\$(openssl rand -hex 32)
AUTH_URL=http://\$IP
AUTH_TRUST_HOST=true
$OAUTH_ENV
ENVEOF

  # Start services
  - cd /app && docker compose up -d --build

  # Signal completion
  - echo "DEPLOYMENT_COMPLETE" > /tmp/deploy-status
  - |
    IP=\$(curl -sk http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address)
    echo "Deployment complete!" > /tmp/deploy-info
    echo "Web: http://\$IP" >> /tmp/deploy-info
    echo "Docs: http://\$IP/docs" >> /tmp/deploy-info
    echo "Health: http://\$IP/health" >> /tmp/deploy-info
CLOUDINIT
)

# Create droplet
echo "Creating droplet..."

RESPONSE=$(curl -sk -X POST "https://api.digitalocean.com/v2/droplets" \
    -H "Authorization: Bearer $DO_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"$DROPLET_NAME\",
        \"size\": \"$DROPLET_SIZE\",
        \"image\": \"$IMAGE\",
        \"region\": \"$REGION\",
        \"ssh_keys\": $SSH_KEYS_JSON,
        \"user_data\": $(echo "$CLOUD_INIT" | jq -Rs .)
    }")

DROPLET_ID=$(echo "$RESPONSE" | jq -r '.droplet.id')

if [ "$DROPLET_ID" = "null" ] || [ -z "$DROPLET_ID" ]; then
    echo "Error creating droplet:"
    echo "$RESPONSE" | jq '.'
    exit 1
fi

echo "Droplet ID: $DROPLET_ID"
echo "Waiting for IP..."

# Wait for IP
for i in {1..30}; do
    DROPLET_INFO=$(curl -sk "https://api.digitalocean.com/v2/droplets/$DROPLET_ID" \
        -H "Authorization: Bearer $DO_API_TOKEN")

    STATUS=$(echo "$DROPLET_INFO" | jq -r '.droplet.status')
    IP=$(echo "$DROPLET_INFO" | jq -r '.droplet.networks.v4[] | select(.type=="public") | .ip_address' | head -1)

    if [ "$STATUS" = "active" ] && [ -n "$IP" ] && [ "$IP" != "null" ]; then
        break
    fi
    echo "  Status: $STATUS - waiting... ($i/30)"
    sleep 5
done

if [ -z "$IP" ] || [ "$IP" = "null" ]; then
    echo "Error: Could not get IP address"
    exit 1
fi

echo ""
echo "============================================================"
echo "  DROPLET CREATED"
echo "============================================================"
echo ""
echo "  ID:     $DROPLET_ID"
echo "  IP:     $IP"
echo "  Status: $STATUS"
echo ""
echo "  Cloud-init is now installing Docker and deploying..."
echo "  This takes 5-8 minutes."
echo ""
echo "  Endpoints (via nginx reverse proxy on port 80):"
echo "    http://$IP/          # Web app"
echo "    http://$IP/docs      # Docs"
echo "    http://$IP/api       # API"
echo "    http://$IP/health    # Health check"
echo ""
echo "  Destroy:"
echo "    ./deploy-cloud-init.sh -d $DROPLET_ID"
echo ""

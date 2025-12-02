# CI/CD Pipeline Setup Guide

## Overview

This project uses **Docker-based CI/CD** with GitHub Actions. On every push to `main`:
1. Tests run
2. Docker images are built and pushed to GitHub Container Registry
3. Server pulls new images and restarts services

## Quick Start

### 1. GitHub Secrets (Required)

Go to **GitHub → Settings → Secrets → Actions** and add:

| Secret | Description | Example |
|--------|-------------|---------|
| `SSH_PRIVATE_KEY` | Private SSH key for server access | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_HOST` | Server IP or hostname | `123.45.67.89` |
| `SERVER_USER` | Deploy user on server | `deployuser` |
| `DEPLOY_PATH` | Deployment directory | `/opt/optibid` |

### 2. Server Setup

SSH into your server and run:

```bash
# Download and run setup script
curl -O https://raw.githubusercontent.com/YOUR_REPO/main/scripts/server-setup.sh
chmod +x server-setup.sh
sudo ./server-setup.sh
```

Or manually:

```bash
# Create deploy user
sudo useradd -m -s /bin/bash deployuser
sudo usermod -aG docker deployuser

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Create deployment directory
sudo mkdir -p /opt/optibid
sudo chown deployuser:deployuser /opt/optibid

# Add SSH key for GitHub Actions
mkdir -p ~/.ssh
echo "YOUR_PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. Generate SSH Keys

On your local machine:

```bash
# Generate new key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_deploy.pub deployuser@your-server

# Add private key to GitHub Secrets (SSH_PRIVATE_KEY)
cat ~/.ssh/github_deploy
```

### 4. Environment Variables

Create `/opt/optibid/.env` on your server:

```env
# Database
POSTGRES_DB=optibid
POSTGRES_USER=optibid
POSTGRES_PASSWORD=your_secure_password_here

# Redis
REDIS_PASSWORD=your_secure_password_here

# ClickHouse
CLICKHOUSE_PASSWORD=your_secure_password_here

# Application
SECRET_KEY=generate_64_char_random_string
API_URL=https://your-domain.com

# GitHub
GITHUB_REPOSITORY=your-username/your-repo

# Monitoring
GRAFANA_PASSWORD=your_secure_password_here
```

### 5. SSL Certificate

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Pipeline Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Push to   │────▶│   GitHub    │────▶│   Build &   │
│    main     │     │   Actions   │     │    Test     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐     ┌──────▼──────┐
                    │   Server    │◀────│ Push Images │
                    │   Deploy    │     │   to GHCR   │
                    └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  Pull &     │
                    │  Restart    │
                    └─────────────┘
```

## Files Created

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | GitHub Actions workflow |
| `docker-compose.prod.yml` | Production compose file |
| `enterprise-marketing/Dockerfile` | Frontend Docker image |
| `scripts/server-setup.sh` | Server provisioning script |
| `enterprise-marketing/app/api/health/route.ts` | Health check endpoint |

## Manual Deployment

If you need to deploy manually:

```bash
# On server
cd /opt/optibid

# Pull latest images
docker compose pull

# Restart services
docker compose up -d

# Check logs
docker compose logs -f frontend
```

## Rollback

```bash
# List available image tags
docker images ghcr.io/your-repo/frontend

# Update compose to use specific tag
# Edit docker-compose.yml: image: ghcr.io/your-repo/frontend:abc1234

# Restart
docker compose up -d
```

## Monitoring

- **Grafana**: https://your-domain.com:3001
- **Prometheus**: http://localhost:9090 (internal only)
- **Health Check**: https://your-domain.com/api/health

## Troubleshooting

### Build fails
```bash
# Check GitHub Actions logs
# Ensure all secrets are set correctly
```

### Deploy fails
```bash
# SSH to server and check
docker compose logs
docker ps -a
```

### Container won't start
```bash
# Check environment variables
cat /opt/optibid/.env

# Check disk space
df -h

# Check Docker logs
docker logs optibid-frontend
```

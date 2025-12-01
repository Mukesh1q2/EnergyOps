# VPS Deployment Setup Guide

This guide explains how to configure your VPS (Virtual Private Server) to work with the Docker CI/CD pipeline set up in this repository.

## 1. Initial Server Setup (Run on VPS)

Login to your server as `root` (or a user with sudo privileges) and run the following commands.

### Create a Deploy User
Create a dedicated user for deployments to improve security.

```bash
# Create user 'deployuser'
sudo adduser --disabled-password --gecos "" deployuser

# Add to docker group (allows running docker without sudo)
sudo usermod -aG docker deployuser
```

### Install Docker & Docker Compose
(Instructions for Ubuntu/Debian)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

# Install Docker Compose plugin
sudo apt-get install -y docker-compose-plugin

# Enable and start Docker service
sudo systemctl enable --now docker
```

### Setup SSH Access
You need to generate an SSH key pair. The private key will be stored in GitHub Secrets, and the public key will be on the server.

**On your LOCAL machine (not the VPS):**
```bash
# Generate a new ed25519 key pair (no passphrase)
ssh-keygen -t ed25519 -f github_deploy_key -C "github-actions-deploy" -N ""

# This creates github_deploy_key (Private) and github_deploy_key.pub (Public)
```

**Back on the VPS:**
Add the public key to the deploy user's authorized keys.

```bash
# Create .ssh directory
sudo mkdir -p /home/deployuser/.ssh

# Add the public key content (Replace 'ssh-ed25519 AAAA...' with content of github_deploy_key.pub)
echo "ssh-ed25519 AAAA.... your_public_key_content_here" | sudo tee -a /home/deployuser/.ssh/authorized_keys

# Set correct permissions
sudo chown -R deployuser:deployuser /home/deployuser/.ssh
sudo chmod 700 /home/deployuser/.ssh
sudo chmod 600 /home/deployuser/.ssh/authorized_keys
```

### Create Deploy Directory
Create the folder where the application will live.

```bash
# Create directory
sudo mkdir -p /var/www/energyops

# Change ownership to deploy user
sudo chown -R deployuser:deployuser /var/www/energyops
```

---

## 2. GitHub Configuration

Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.

Add the following secrets:

| Secret Name | Value Description |
|-------------|-------------------|
| `SSH_PRIVATE_KEY` | The content of the **private** key file (`github_deploy_key`) you generated locally. |
| `SERVER_HOST` | Your VPS IP address or domain name (e.g., `192.0.2.1` or `api.example.com`). |
| `SERVER_USER` | `deployuser` (or whatever username you created). |
| `DEPLOY_PATH` | `/var/www/energyops` (or your chosen path). |
| `GHCR_PAT` | A GitHub Personal Access Token. |

### How to generate `GHCR_PAT`:
1. Go to GitHub Settings -> Developer settings -> Personal access tokens -> Tokens (classic).
2. Generate new token (classic).
3. Select scopes: `read:packages`, `write:packages`, `delete:packages` (optional).
4. Copy the token and save it as the `GHCR_PAT` secret.

---

## 3. Deployment

### First Deployment
Push your changes to the `main` branch. The GitHub Action "Build & Deploy" should trigger automatically.
1. It will build Docker images.
2. Push them to GitHub Container Registry.
3. SSH into your VPS.
4. Copy `docker-compose.prod.yml`, `.env`, and `deploy/` scripts.
5. Deploy the stack.

### Troubleshooting
If the deployment fails, check the "Actions" tab on GitHub for logs.

---

## 4. Optional: Auto-Start on Boot (Systemd)

To ensure your application starts automatically if the server reboots:

**On the VPS (as sudo):**

Wait for the first deployment to succeed, so the `deploy` folder is present on the server.

1. Copy the service file:

```bash
# Copy the file from the repo (after first deploy)
sudo cp /var/www/energyops/deploy/energyops-compose.service /etc/systemd/system/energyops-compose.service

# Verify the path in the service file matches your DEPLOY_PATH (defaults to /var/www/energyops)
cat /etc/systemd/system/energyops-compose.service
```

2. Enable the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now energyops-compose.service
```

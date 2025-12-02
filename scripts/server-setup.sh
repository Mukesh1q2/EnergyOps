#!/bin/bash
# Server Setup Script for OptiBid Energy Platform
# Run this on your production server (Ubuntu 22.04+ recommended)

set -e

echo "🚀 OptiBid Energy - Server Setup"
echo "================================"

# Variables - customize these
DEPLOY_USER="deployuser"
DEPLOY_PATH="/opt/optibid"
DOMAIN="your-domain.com"  # Change this!

# 1. Create deploy user
echo "📦 Creating deploy user..."
if ! id "$DEPLOY_USER" &>/dev/null; then
    sudo useradd -m -s /bin/bash $DEPLOY_USER
    sudo usermod -aG docker $DEPLOY_USER
    echo "✅ User $DEPLOY_USER created"
else
    echo "ℹ️  User $DEPLOY_USER already exists"
fi

# 2. Setup SSH for deploy user
echo "🔑 Setting up SSH..."
sudo mkdir -p /home/$DEPLOY_USER/.ssh
sudo chmod 700 /home/$DEPLOY_USER/.ssh
sudo touch /home/$DEPLOY_USER/.ssh/authorized_keys
sudo chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys
sudo chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh

echo ""
echo "⚠️  Add your GitHub Actions SSH public key to:"
echo "   /home/$DEPLOY_USER/.ssh/authorized_keys"
echo ""

# 3. Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sudo sh
    sudo systemctl enable docker
    sudo systemctl start docker
    echo "✅ Docker installed"
else
    echo "ℹ️  Docker already installed"
fi

# 4. Install Docker Compose
echo "📦 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed"
else
    echo "ℹ️  Docker Compose already installed"
fi

# 5. Install Nginx
echo "🌐 Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y nginx certbot python3-certbot-nginx
    sudo systemctl enable nginx
    echo "✅ Nginx installed"
else
    echo "ℹ️  Nginx already installed"
fi

# 6. Create deployment directory
echo "📁 Creating deployment directory..."
sudo mkdir -p $DEPLOY_PATH
sudo mkdir -p $DEPLOY_PATH/nginx/ssl
sudo mkdir -p $DEPLOY_PATH/monitoring
sudo mkdir -p $DEPLOY_PATH/database
sudo chown -R $DEPLOY_USER:$DEPLOY_USER $DEPLOY_PATH
echo "✅ Directory $DEPLOY_PATH created"

# 7. Create environment file template
echo "📝 Creating environment template..."
cat > $DEPLOY_PATH/.env.template << 'EOF'
# Database
POSTGRES_DB=optibid
POSTGRES_USER=optibid
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD

# Redis
REDIS_PASSWORD=CHANGE_ME_STRONG_PASSWORD

# ClickHouse
CLICKHOUSE_PASSWORD=CHANGE_ME_STRONG_PASSWORD

# Application
SECRET_KEY=CHANGE_ME_RANDOM_64_CHAR_STRING
API_URL=https://your-domain.com

# GitHub (for pulling images)
GITHUB_REPOSITORY=your-username/your-repo

# Monitoring
GRAFANA_PASSWORD=CHANGE_ME_STRONG_PASSWORD
EOF
sudo chown $DEPLOY_USER:$DEPLOY_USER $DEPLOY_PATH/.env.template
echo "✅ Environment template created at $DEPLOY_PATH/.env.template"

# 8. Create Nginx config
echo "🌐 Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/optibid << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL certificates (will be added by certbot)
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # WebSocket support
    location /ws/ {
        proxy_pass http://localhost:8000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }
    
    # Grafana (optional - restrict access in production)
    location /grafana/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host \$host;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/optibid /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx configured"

# 9. Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
echo "✅ Firewall configured"

# 10. Create systemd service for docker-compose
echo "⚙️  Creating systemd service..."
sudo tee /etc/systemd/system/optibid.service << EOF
[Unit]
Description=OptiBid Energy Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DEPLOY_PATH
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=$DEPLOY_USER
Group=$DEPLOY_USER

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable optibid
echo "✅ Systemd service created"

echo ""
echo "=========================================="
echo "✅ Server setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Copy .env.template to .env and fill in real values:"
echo "   cp $DEPLOY_PATH/.env.template $DEPLOY_PATH/.env"
echo ""
echo "2. Add GitHub Actions SSH public key:"
echo "   echo 'YOUR_PUBLIC_KEY' >> /home/$DEPLOY_USER/.ssh/authorized_keys"
echo ""
echo "3. Setup SSL certificate:"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "4. Update DOMAIN variable in this script and re-run nginx config"
echo ""
echo "5. Push to GitHub main branch to trigger deployment!"
echo ""

# Kvizovka Multiplayer - Deployment Guide

## Prerequisites

- Node.js 18+ installed on your server
- Server with fixed IP address or domain name
- Ports 3000 (server) and 5173 (client) open

---

## Server Deployment (Backend)

### 1. Prepare Your Server

SSH into your server:
```bash
ssh user@YOUR_SERVER_IP
```

### 2. Install Node.js (if not already installed)

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Check installation
node --version
npm --version
```

### 3. Clone and Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/kvizovka.git
cd kvizovka/multiplayer

# Install dependencies
npm install

# Build all packages
npm run build
```

### 4. Start Server

```bash
# Start server (foreground)
npm run start:server

# Or use PM2 for production (keeps running after logout)
npm install -g pm2
pm2 start packages/server/dist/index.js --name kvizovka-server
pm2 save
pm2 startup
```

Server will run on `http://YOUR_SERVER_IP:3000`

---

## Client Deployment (Frontend)

### Option 1: Deploy Client on Same Server

#### 1. Configure Server URL

Edit `packages/client/.env.production`:
```env
VITE_SERVER_URL=http://YOUR_SERVER_IP:3000
```

#### 2. Build Client

```bash
cd packages/client
npm run build
```

#### 3. Serve with Nginx

Install Nginx:
```bash
sudo apt-get install nginx
```

Configure Nginx (`/etc/nginx/sites-available/kvizovka`):
```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;

    root /path/to/kvizovka/multiplayer/packages/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # WebSocket proxy to server
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/kvizovka /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Access at: `http://YOUR_SERVER_IP`

---

### Option 2: Deploy Client on Vercel/Netlify

#### 1. Create `.env.production`

In `packages/client/.env.production`:
```env
VITE_SERVER_URL=http://YOUR_SERVER_IP:3000
```

#### 2. Deploy to Vercel

```bash
npm install -g vercel
cd packages/client
vercel --prod
```

When prompted, set:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 3. Set Environment Variable in Vercel Dashboard

Go to Vercel dashboard → Your project → Settings → Environment Variables:
- **Key**: `VITE_SERVER_URL`
- **Value**: `http://YOUR_SERVER_IP:3000`

---

## Environment Configuration

### Development
```env
# packages/client/.env
VITE_SERVER_URL=http://localhost:3000
```

### Production with Fixed IP
```env
# packages/client/.env.production
VITE_SERVER_URL=http://203.0.113.45:3000
```

### Production with Domain + HTTPS
```env
# packages/client/.env.production
VITE_SERVER_URL=https://your-domain.com
```

**Important Notes:**
- Vite variables MUST start with `VITE_`
- Must rebuild client after changing env vars
- Use HTTPS in production for security

---

## Server Configuration

The server runs on port 3000 by default. To change:

Edit `packages/server/src/index.ts`:
```typescript
const PORT = process.env.PORT || 3000
```

Or set environment variable:
```bash
PORT=8080 npm run start:server
```

---

## Firewall Configuration

Make sure ports are open:

```bash
# Ubuntu/Debian with ufw
sudo ufw allow 3000/tcp  # Server
sudo ufw allow 80/tcp    # Nginx (if using)
sudo ufw allow 443/tcp   # HTTPS (if using)
```

---

## Production Checklist

- [ ] Server running on fixed IP/domain
- [ ] `VITE_SERVER_URL` configured in client `.env.production`
- [ ] Client built with production env (`npm run build`)
- [ ] Server process managed with PM2 or systemd
- [ ] Firewall configured (ports 3000, 80, 443)
- [ ] HTTPS configured (recommended - use Let's Encrypt)
- [ ] CORS configured in server (if needed)
- [ ] Tested connection from client to server

---

## Troubleshooting

### Client can't connect to server

**Check 1: Server URL**
```bash
# In browser console
console.log(import.meta.env.VITE_SERVER_URL)
```

**Check 2: Server is running**
```bash
curl http://YOUR_SERVER_IP:3000
```

**Check 3: WebSocket connection**
```bash
# In browser console (DevTools → Network → WS tab)
# Should see WebSocket connection to server
```

**Check 4: CORS issues**
If cross-origin, add to `packages/server/src/index.ts`:
```typescript
app.use(cors({
  origin: 'http://YOUR_CLIENT_URL',
  credentials: true
}))
```

### Server crashes on startup

**Check Node version:**
```bash
node --version  # Should be 18+
```

**Check logs:**
```bash
pm2 logs kvizovka-server
```

### Client shows "Disconnected"

- Check if server is running: `pm2 status`
- Check firewall: `sudo ufw status`
- Check server logs: `pm2 logs kvizovka-server`
- Verify `VITE_SERVER_URL` matches server address

---

## Updating Deployment

### Update Server
```bash
cd kvizovka/multiplayer
git pull
npm install
npm run build:server
pm2 restart kvizovka-server
```

### Update Client
```bash
cd packages/client
git pull
npm install
npm run build
# If using Vercel: vercel --prod
```

---

## HTTPS Setup (Recommended)

### With Let's Encrypt (Free)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Update `.env.production`:
```env
VITE_SERVER_URL=https://your-domain.com
```

---

## Quick Deploy Script

Save as `deploy.sh`:
```bash
#!/bin/bash
echo "Deploying Kvizovka Multiplayer..."

# Pull latest code
git pull

# Install dependencies
npm install

# Build everything
npm run build

# Restart server
pm2 restart kvizovka-server

# Build client
cd packages/client
npm run build

echo "Deployment complete!"
```

Make executable: `chmod +x deploy.sh`
Run: `./deploy.sh`

---

## Support

For issues, check:
- Server logs: `pm2 logs kvizovka-server`
- Browser console (F12)
- Network tab for WebSocket connection

Need help? Open an issue on GitHub.

# Fly.io Deployment Guide - Kvizovka Multiplayer

**Platform:** Fly.io
**Purpose:** All-in-one deployment (Server + Database)
**Cost:** Free tier (with safety measures)
**Status:** Ready for deployment when app is refined

---

## Table of Contents

1. [Why Fly.io?](#why-flyio)
2. [Free Tier Limits](#free-tier-limits)
3. [Cost Protection Setup](#cost-protection-setup)
4. [Pricing Breakdown](#pricing-breakdown)
5. [Safety Checklist](#safety-checklist)
6. [Monitoring Usage](#monitoring-usage)
7. [Deployment Steps](#deployment-steps)
8. [Troubleshooting](#troubleshooting)

---

## Why Fly.io?

### ✅ Advantages for Kvizovka

- **All-in-one:** Server + PostgreSQL database on one platform
- **Truly free tier:** Generous limits that cover small apps
- **No cold starts:** App stays online 24/7
- **WebSocket support:** Perfect for real-time multiplayer
- **Spending limits:** Can lock charges at $0 or $5
- **Edge deployment:** Global low-latency network

### Comparison with Alternatives

| Feature | Fly.io | Railway | Render |
|---------|--------|---------|--------|
| Free Tier | ✅ Forever | $5 credit | 750 hrs/month |
| Cost After | $0 | $10-15/month | $0-7/month |
| Database Free | ✅ 3GB | ❌ | ✅ 90 days |
| Cold Starts | ❌ | ❌ | ✅ (~30s) |
| WebSockets | ✅ | ✅ | ✅ |
| Spending Limits | ✅ Hard caps | ⚠️ Monitor | ⚠️ Monitor |

---

## Free Tier Limits

### What's Included FREE (Forever)

```
✅ Up to 3 shared-cpu-1x VMs (256MB RAM each)
✅ 3GB persistent storage (volumes)
✅ 160GB outbound bandwidth per month
✅ 3GB PostgreSQL database
✅ Automatic SSL certificates
✅ Custom domains
```

### What Kvizovka Needs

**Phase 1 (In-Memory):**
- 1 VM for server (~256MB RAM) ✅
- ~5-10GB bandwidth/month ✅
- No database ✅

**Phase 2 (With Database):**
- 1 VM for server (~256MB RAM) ✅
- 1 PostgreSQL database (3GB) ✅
- ~10-20GB bandwidth/month ✅

**Verdict:** ✅ Well within free tier limits!

---

## Cost Protection Setup

### CRITICAL: Set Spending Limits Before Deploying

#### Step 1: Install Fly CLI

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

#### Step 2: Login and Set Hard Limit

```bash
# Login to Fly.io
fly auth login

# Set spending limit (IMPORTANT!)
fly orgs limits set --max-monthly-spend 5

# Verify it's set
fly orgs show personal
# Should show: "Max monthly spend: $5.00"
```

**What this does:**
- If you hit $5 in charges, Fly.io **stops everything**
- Your app goes offline but you won't get surprise bills
- You get email notifications before hitting limit

#### Step 3: Set Up Billing Alerts

1. Go to https://fly.io/dashboard
2. Click your organization (usually "personal")
3. Navigate to **Billing** → **Notifications**
4. Enable email alerts:
   ```
   ✅ Alert at $1 spent
   ✅ Alert at 80% of limit
   ✅ Alert when approaching free tier limits
   ```

---

## Pricing Breakdown

### What Could Cause Charges?

| Scenario | Free Tier | Charges If... | Risk for Kvizovka |
|----------|-----------|---------------|-------------------|
| **More than 3 VMs** | 3 VMs free | 4+ VMs | ⚠️ Very Low (need 1 VM) |
| **Larger VM** | 256MB free | 512MB+ RAM | ⚠️ Very Low (256MB enough) |
| **Bandwidth** | 160GB/month | Over 160GB | ⚠️ Very Low (use ~10GB) |
| **Storage** | 3GB free | 4GB+ | ⚠️ Very Low (use <1GB) |
| **Dedicated CPU** | Shared free | Dedicated | ❌ Won't use |

### Bandwidth Calculation

**For small player base (10-50 concurrent players):**

```
WebSocket messages: ~1KB per game action
10 games/hour × 20 actions/game × 1KB = 200KB/hour
200KB × 720 hours/month = 144MB/month

Even with 100 active players: ~5-10GB/month
```

**Verdict:** ✅ Well under 160GB free limit

### Cost Estimate for Kvizovka

#### Phase 1 (In-Memory, No Database)
```
1 VM (256MB):              $0/month (free tier)
Bandwidth (~5GB):          $0/month (under 160GB)
Storage:                   $0/month (no database)
SSL Certificate:           $0/month (included)
────────────────────────────────────────────────
TOTAL:                     $0.00/month ✅
```

#### Phase 2 (With PostgreSQL)
```
1 VM (256MB):              $0/month (free tier)
PostgreSQL (3GB):          $0/month (free tier)
Bandwidth (~10GB):         $0/month (under 160GB)
Storage:                   $0/month (under 3GB)
────────────────────────────────────────────────
TOTAL:                     $0.00/month ✅
```

**You'd need significant scale before charges kick in!**

---

## Safety Checklist

### ✅ Before First Deploy - Do This:

- [ ] Install Fly CLI
- [ ] Login to Fly.io account
- [ ] Set spending limit: `fly orgs limits set --max-monthly-spend 5`
- [ ] Verify limit: `fly orgs show personal`
- [ ] Enable billing email alerts in dashboard
- [ ] Configure `fly.toml` with minimal resources (see below)
- [ ] Test locally before deploying

### ✅ fly.toml Configuration (Safe Defaults)

Create this file in `packages/server/fly.toml`:

```toml
app = "kvizovka-server"
primary_region = "ams"  # Amsterdam (or choose closest to you)

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false  # Keep running (no cold starts)
  auto_start_machines = true
  min_machines_running = 1
  max_machines_running = 1     # ← Lock to 1 VM (prevent scaling costs)

# Use smallest VM size (free tier)
[[vm]]
  cpu_kind = "shared"           # ← Shared CPU (free)
  cpus = 1
  memory_mb = 256               # ← 256MB (free tier)
```

### ❌ DON'T Do This (Causes Charges):

- ❌ Increase `memory_mb` beyond 256
- ❌ Set `max_machines_running` > 1
- ❌ Enable auto-scaling
- ❌ Use dedicated CPU
- ❌ Add more than 3 VMs total
- ❌ Forget to set spending limit

---

## Monitoring Usage

### Check Usage Anytime

```bash
# See current month's usage
fly billing show

# See organization details and limits
fly orgs show personal

# Check specific app status
fly status --app kvizovka-server

# View real-time logs
fly logs --app kvizovka-server

# Check app info (shows VM size, count, etc.)
fly info --app kvizovka-server
```

### Dashboard Monitoring

1. Go to https://fly.io/dashboard
2. Click **Billing** → **Usage**
3. Monitor:
   - VM hours used this month
   - Bandwidth consumed
   - Storage used
   - Current spend ($0.00 target)

### Weekly Monitoring Routine

**Every Monday (5 minutes):**
```bash
fly billing show
```

**Look for:**
- ✅ Current spend: $0.00
- ✅ VMs: 1 machine running
- ✅ Bandwidth: <10GB used
- ⚠️ Any unexpected charges

---

## Deployment Steps

### Phase 1: Server Only (In-Memory)

#### 1. Prepare Server for Deployment

**Create Dockerfile in `packages/server/`:**

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/server/package*.json ./packages/server/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install --workspaces

# Copy source code
COPY packages/server ./packages/server
COPY packages/shared ./packages/shared

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Build server
WORKDIR /app/packages/server
RUN npm run build

# Expose port
EXPOSE 8080

# Start server
CMD ["npm", "start"]
```

#### 2. Deploy Server

```bash
# Navigate to server directory
cd packages/server

# Launch (creates app and deploys)
fly launch

# Follow prompts:
# - App name: kvizovka-server
# - Region: Choose closest (ams, ord, syd, etc.)
# - PostgreSQL: No (not needed for Phase 1)
# - Redis: No

# Set environment variables
fly secrets set NODE_ENV=production
fly secrets set CORS_ORIGIN=https://your-client-url.netlify.app

# Deploy
fly deploy
```

#### 3. Get Server URL

```bash
fly info

# Output shows:
# Hostname: kvizovka-server.fly.dev
```

**Your server URL:** `https://kvizovka-server.fly.dev`

#### 4. Update Client

In `packages/client/.env`:
```
VITE_SERVER_URL=https://kvizovka-server.fly.dev
```

Deploy client to Netlify/Vercel with this environment variable.

---

### Phase 2: Server + PostgreSQL Database

#### 1. Create Database

```bash
# Create Postgres database (free 3GB)
fly postgres create --name kvizovka-db --region ams

# Attach database to your app
fly postgres attach --app kvizovka-server kvizovka-db
```

#### 2. Update Server Code

Database connection URL is automatically available as `DATABASE_URL` environment variable.

#### 3. Deploy Updated Server

```bash
cd packages/server
fly deploy
```

---

## Emergency Controls

### If Something Goes Wrong

#### Stop App Immediately (Stops Charges)

```bash
# Scale to zero machines (app goes offline, charges stop)
fly scale count 0 --app kvizovka-server

# Restart when ready
fly scale count 1 --app kvizovka-server
```

#### Delete App Completely

```bash
# Nuclear option: Delete everything
fly apps destroy kvizovka-server

# Also delete database if created
fly postgres destroy kvizovka-db
```

#### Check for Unexpected Charges

```bash
fly billing show

# If charges detected:
# 1. Stop all apps immediately
# 2. Check what's running: fly apps list
# 3. Contact support: https://community.fly.io
```

---

## Troubleshooting

### Common Issues

#### Issue: "Not enough memory"
**Solution:** Your app is using >256MB RAM
```bash
# Check memory usage
fly vm status

# If consistently high, may need to optimize code
# Last resort: upgrade to 512MB (costs ~$3/month)
```

#### Issue: "Certificate error"
**Solution:** SSL cert provisioning takes 1-2 minutes
```bash
# Check cert status
fly certs show

# Force renewal if needed
fly certs create your-domain.com
```

#### Issue: "Connection refused"
**Solution:** Check if server is listening on correct port
```bash
# View logs
fly logs

# Ensure server listens on PORT env var (8080)
# In server code:
const PORT = process.env.PORT || 3000
```

#### Issue: High bandwidth usage
**Solution:** Monitor and optimize
```bash
fly billing show

# Look for bandwidth spikes
# May need to:
# - Reduce WebSocket message frequency
# - Implement message batching
# - Add CDN for static assets
```

---

## Regions Available

Choose the region closest to your primary users:

| Region Code | Location | Latency |
|-------------|----------|---------|
| `ams` | Amsterdam, Netherlands | Good for EU |
| `fra` | Frankfurt, Germany | Good for EU |
| `lhr` | London, UK | Good for UK/EU |
| `cdg` | Paris, France | Good for EU |
| `iad` | Ashburn, VA (US East) | Good for US East |
| `ord` | Chicago, IL | Good for US Central |
| `sjc` | San Jose, CA | Good for US West |
| `syd` | Sydney, Australia | Good for AU/NZ |

**For Serbia/Balkans:** `ams` (Amsterdam) or `fra` (Frankfurt) recommended

---

## Cost Scenarios (What If?)

### Scenario 1: Game Goes Viral (1000+ Players)

**Impact:**
- Bandwidth: ~50-100GB/month (still under 160GB free) ✅
- CPU: May need optimization
- RAM: 256MB may be tight

**Action:**
1. Monitor usage closely
2. Optimize WebSocket messages
3. Consider caching strategies
4. If needed, upgrade to 512MB RAM (~$3/month)

### Scenario 2: Long-Term Production (1+ Year)

**Cost:**
- Year 1: $0/month (free tier) ✅
- Fly.io has committed to free tier
- No "trial period" expiration

**Risk:** ⚠️ Very Low - Fly.io pricing is stable

### Scenario 3: Adding Features (Replays, Analytics)

**Impact:**
- More database storage needed
- 3GB free should cover 1000s of games
- If exceed 3GB: ~$0.15/GB/month

**Cost Example:**
- 10GB database: ~$1/month
- Still very affordable

---

## Before You Deploy Checklist

### Pre-Deployment

- [ ] App thoroughly tested locally
- [ ] All features working
- [ ] Server builds successfully
- [ ] Environment variables configured
- [ ] CORS configured for production domain
- [ ] Error handling implemented
- [ ] Logging set up

### Deployment Day

- [ ] Spending limit set ($5 max)
- [ ] Billing alerts enabled
- [ ] `fly.toml` configured (256MB, 1 VM)
- [ ] Dockerfile created
- [ ] Deploy server: `fly deploy`
- [ ] Test: https://your-app.fly.dev
- [ ] Deploy client (Netlify/Vercel)
- [ ] Test end-to-end gameplay

### Post-Deployment

- [ ] Monitor for first 24 hours
- [ ] Check logs: `fly logs`
- [ ] Verify $0 charges: `fly billing show`
- [ ] Test with real users
- [ ] Set up weekly monitoring routine

---

## Resources

### Official Documentation
- Fly.io Docs: https://fly.io/docs
- Pricing: https://fly.io/docs/about/pricing
- Node.js Guide: https://fly.io/docs/languages-and-frameworks/node
- PostgreSQL: https://fly.io/docs/postgres

### Support
- Community Forum: https://community.fly.io
- Discord: https://fly.io/discord
- Status Page: https://status.fly.io

### Useful Commands
```bash
# Full command reference
fly help

# App management
fly apps list
fly apps destroy <app-name>

# Scaling
fly scale show
fly scale count 1
fly scale memory 256

# Monitoring
fly status
fly logs
fly vm status

# Database
fly postgres list
fly postgres connect -a kvizovka-db

# Billing
fly billing show
fly orgs show personal
```

---

## Summary

### Why This Setup is Safe

✅ **Hard spending cap:** $5 maximum (set at CLI level)
✅ **Free tier generous:** 3 VMs, 160GB bandwidth, 3GB DB
✅ **Real-time monitoring:** Dashboard + CLI
✅ **Easy emergency stop:** Scale to zero instantly
✅ **No sneaky charges:** You control scaling

### Expected Cost for Kvizovka

**Phase 1 (Current):** $0/month
**Phase 2 (Database):** $0/month
**Phase 3 (Scaled):** $0-5/month (if viral)

### Deployment Timeline

**When app is ready:**
1. Run safety setup (10 minutes)
2. Deploy server (20 minutes)
3. Deploy client (10 minutes)
4. Test end-to-end (30 minutes)

**Total time:** ~1 hour from start to live!

---

## Next Steps

1. ✅ Continue refining app locally
2. ✅ Test all features thoroughly
3. ✅ Create Fly.io account (when ready)
4. ✅ Follow this guide for deployment
5. ✅ Monitor usage weekly

---

**You're in great hands with Fly.io! The free tier is generous, spending limits protect you, and the platform is perfect for real-time multiplayer games like Kvizovka.** 🚀

---

*Document Version: 1.0*
*Last Updated: January 7, 2026*
*Status: Ready for deployment*

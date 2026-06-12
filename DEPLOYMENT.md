# Duck Playground - Free Deployment Guide

All services are completely FREE. No credit card required after sign-up.

## Option 1: Railway.app (RECOMMENDED) ✅

Railway offers 5GB free credits monthly - perfect for this project.

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### Step 2: Add PostgreSQL Database
1. In your Railway project, click "Add Service"
2. Select PostgreSQL
3. Copy the connection string from the generated `DATABASE_URL`

### Step 3: Deploy Node.js Backend
1. Create new service → GitHub Repo
2. Connect this repository
3. Configure environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<from step 2>
   JWT_SECRET=generate-a-random-string-here
   CORS_ORIGIN=https://your-psd-website.com
   FRONTEND_URL=https://your-psd-website.com
   ```
4. Build command: `pnpm install && pnpm build`
5. Start command: `npm start`
6. Deploy!

### Step 4: Get Your API URL
After deployment, Railway gives you a public URL:
- Example: `https://duck-playground-abc123.railway.app`
- Use this in psd-website `.env`

## Option 2: Render.com ✅

Free tier includes 0.5GB RAM and PostgreSQL database.

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Create new Web Service

### Step 2: Configure Deployment
1. Connect this GitHub repo
2. Settings:
   - Environment: Node
   - Build command: `pnpm install`
   - Start command: `npm start`
3. Add PostgreSQL database (free tier)

### Step 3: Set Environment Variables
In Render dashboard:
```
NODE_ENV=production
DATABASE_URL=<PostgreSQL connection string>
JWT_SECRET=random-secret-key
CORS_ORIGIN=https://your-psd-website.com
```

### Step 4: Deploy
Click "Create Web Service" - Render auto-deploys on git push

## Option 3: Fly.io ✅

Offers 3 shared-cpu-1x 256MB VMs free with auto-scaling.

### Setup
1. Install Fly CLI: `npm install -g flyctl`
2. Authenticate: `fly auth login`
3. Launch: `fly launch` (auto-detects Node.js)
4. Add Postgres: `fly postgres create`
5. Deploy: `fly deploy`

## Option 4: Self-Hosted (Free VPS)

### AWS EC2 Free Tier
- 750 hours/month of t3.micro (free for 12 months)
- Setup Ubuntu, install Node.js, PostgreSQL
- Use GitHub Actions for auto-deploy

### Google Cloud Free Tier
- 1 e2-micro instance per month
- 5GB persistent disk
- Perfect for this project

### DigitalOcean
- $5/month droplet (usually free credits on signup)
- App Platform auto-deploys from GitHub

## Integration with psd-website

After deploying Duck-Playground, update psd-website `.env`:

```
DUCK_PLAYGROUND_API=https://duck-playground-xxx.railway.app
ADMIN_API_TOKEN=your-jwt-token-here
```

Then in Astro components:
```typescript
const API_URL = import.meta.env.DUCK_PLAYGROUND_API;

// Get events
const events = await fetch(`${API_URL}/api/events`).then(r => r.json());

// Admin operations
const response = await fetch(`${API_URL}/api/admin/applications`, {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
```

## Monitoring & Logs

### Railway
- Dashboard shows logs in real-time
- Memory/CPU usage tracked
- Downtime alerts available

### Render
- Logs tab shows deployment and runtime output
- Email alerts for failures

### Fly.io
- `fly logs` command streams live logs
- Built-in monitoring dashboard

## Database Backups

### Railway
- Automatic backups included free
- Download from dashboard anytime

### Render
- Manual backups available
- PostgreSQL snapshots

### Self-Hosted
- Set up cron job for daily backups
- Example: `pg_dump > backup.sql`

## Domain Setup

After deploying, you'll get a public URL. To use your own domain:

1. Get domain from Namecheap, GoDaddy, etc.
2. Update DNS to point to your deployment:
   - Railway: CNAME to your railway URL
   - Render: Add CNAME record
   - Fly: Use Fly's nameservers

## SSL/HTTPS

All three platforms provide:
- ✅ Free SSL certificates
- ✅ Auto-renewal
- ✅ HTTPS by default

## Cost Estimate

**Monthly costs (all options):**
- Railway.app: FREE (5GB credits)
- Render: FREE (small projects)
- Fly.io: FREE (3 shared VMs)
- Self-hosted: $5-20 depending on VPS

**Total for full setup:**
- ✅ Backend: FREE
- ✅ Database: FREE
- ✅ Domain: $10-12/year
- ✅ SSL: FREE

## Troubleshooting

### Database Connection Issues
```bash
# Test connection locally
psql postgresql://user:pass@host:5432/duck_playground

# Check .env DATABASE_URL format
```

### Build Failures
- Check Node.js version (requires 18+)
- Run `pnpm install` locally first
- Check for missing environment variables

### WebSocket Connection Fails
- Ensure CORS_ORIGIN matches your frontend URL
- Check that WebSocket port is open (usually same as HTTP)

## Next Steps

1. Choose your hosting platform
2. Deploy Duck-Playground
3. Update psd-website with API URL
4. Test admin dashboard
5. Enable chat features
6. Set up monitoring

---

**Total setup time: ~15 minutes**
**Monthly cost: $0 (completely free)**

🎉 Your custom backend for Duck Dating Apps is ready!

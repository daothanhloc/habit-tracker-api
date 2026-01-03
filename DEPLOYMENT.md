# Vercel Deployment Guide

## Files Modified for Vercel Deployment

### New Files Created:
- `api/index.ts` - Serverless handler for Vercel
- `.vercelignore` - Files to exclude from deployment
- `DEPLOYMENT.md` - This deployment guide

### Modified Files:
- `vercel.json` - Updated for serverless configuration
- `package.json` - Added `postinstall` script for Prisma
- `.env.example` - Added JWT secrets and Supabase pooling guidance

---

## Pre-Deployment Checklist

### 1. Supabase Setup
- [ ] Create a Supabase project (if not already done)
- [ ] Get **Connection Pooling** URL from Settings → Database
  - Use port 6543 (transaction mode) for serverless
  - Example: `postgresql://postgres.[ref]:[pwd]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`

### 2. Generate JWT Secrets
Generate secure secrets for production:
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate JWT_REFRESH_SECRET
openssl rand -base64 32
```

### 3. Install Vercel CLI
```bash
npm install -g vercel
```

### 4. Login to Vercel
```bash
vercel login
```

---

## Deployment Steps

### Step 1: Set Environment Variables in Vercel

**Option A: Via Vercel CLI**
```bash
vercel env add DATABASE_URL
# Paste your Supabase connection pooling URL

vercel env add JWT_SECRET
# Paste your generated JWT secret

vercel env add JWT_REFRESH_SECRET
# Paste your generated refresh token secret

vercel env add NODE_ENV
# Enter: production
```

**Option B: Via Vercel Dashboard**
1. Go to https://vercel.com
2. Navigate to your project → Settings → Environment Variables
3. Add the following:
   - `DATABASE_URL` - Supabase pooled connection string
   - `JWT_SECRET` - Your JWT secret
   - `JWT_REFRESH_SECRET` - Your refresh token secret
   - `NODE_ENV` - Set to `production`

### Step 2: Deploy to Vercel

**Preview Deployment (for testing):**
```bash
vercel
```

**Production Deployment:**
```bash
vercel --prod
```

### Step 3: Run Database Migrations

After successful deployment, run migrations against production database:

```bash
# Option 1: Set DATABASE_URL temporarily
DATABASE_URL="your-production-db-url" npx prisma migrate deploy

# Option 2: Pull Vercel env vars and run
vercel env pull .env.production
npx dotenv -e .env.production -- prisma migrate deploy
```

### Step 4: Verify Deployment

Test your API endpoints:
```bash
# Replace with your Vercel URL
curl https://your-app.vercel.app/auth/health
curl https://your-app.vercel.app/habits
```

---

## Troubleshooting

### Common Issues

**1. "DATABASE_URL is not defined"**
- Ensure environment variables are set in Vercel dashboard
- Redeploy after adding env vars

**2. "Prisma Client not generated"**
- The `postinstall` script should handle this
- Check build logs in Vercel dashboard

**3. "Too many database connections"**
- Make sure you're using the **pooled** connection string (port 6543)
- Not the direct connection string (port 5432)

**4. "Function timeout"**
- Default timeout is 10 seconds on Hobby plan
- Consider upgrading plan for longer timeouts if needed

**5. CORS Issues**
- Check CORS configuration in `src/config/fastify.ts:19`
- Update `origin` to your frontend domain in production

---

## Post-Deployment

### Monitor Your App
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment to view logs
3. Monitor for errors in the Functions tab

### Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Continuous Deployment
- Every push to `main` branch will trigger automatic deployment
- Pull requests create preview deployments automatically

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Supabase connection pooling URL (port 6543) |
| `JWT_SECRET` | Yes | Secret for access tokens (15min expiry) |
| `JWT_REFRESH_SECRET` | Yes | Secret for refresh tokens (7d expiry) |
| `NODE_ENV` | Yes | Set to `production` |
| `GMAIL_API_KEY` | No | For future email notifications |
| `BRAVE_API_KEY` | No | For future AI features |

---

## API Endpoints

Once deployed, your API will be available at: `https://your-app.vercel.app`

### Available Routes:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /habits` - Get user habits
- `POST /habits` - Create new habit
- `POST /habits/:id/track` - Track habit completion
- `GET /habits/:id/goals` - Get habit goals
- `POST /habits/:id/goals` - Create habit goal

---

## Local Development vs Production

### Local Development
```bash
npm run dev
# Uses src/main.ts with fastify.listen()
# Direct DB connection on port 5432
```

### Production (Vercel)
```bash
# Uses api/index.ts serverless handler
# Pooled DB connection on port 6543
# No fastify.listen() - uses Vercel's serverless infrastructure
```

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Prisma + Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

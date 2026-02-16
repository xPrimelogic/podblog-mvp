# Deployment Guide

## Vercel (Production)

### Automatic Deploy
Every push to `main` triggers automatic deploy via GitHub integration.

**Current URL:** https://podblog-mvp.vercel.app

### Environment Variables
Add in Vercel dashboard (Settings → Environment Variables):
```
NEXT_PUBLIC_SUPABASE_URL=https://jhdrsyqayqoumvbukjps.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from Supabase]
SUPABASE_SERVICE_ROLE_KEY=[from Supabase]
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NODE_ENV=production
```

### Build Settings
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

## Manual Deployment

### Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Railway (Alternative)
```bash
railway login
railway up
# Add env vars via dashboard
```

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase schema updated (run apply-schema.sql)
- [ ] Test upload endpoint
- [ ] Test processing pipeline
- [ ] Verify social generation works
- [ ] Check quote cards download
- [ ] Test WordPress integration (optional)

## Monitoring

- **Vercel Dashboard:** Build logs, function logs
- **Supabase:** Database logs, API logs
- **OpenAI:** Usage dashboard
- **Deepgram:** Usage dashboard

## Rollback

```bash
# Via Vercel dashboard: Deployments → Previous → Promote to Production
# or
vercel rollback
```

## Cost Monitoring

Expected costs (100 episodes/month):
- Deepgram: €13/month
- OpenAI GPT-4: €15/month
- Vercel: Free tier (Pro $20 if needed)
- Supabase: Free tier (Pro $25 if needed)
- **Total: ~€30-€60/month**

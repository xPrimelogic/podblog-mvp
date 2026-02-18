# PodBlog Payment System - Complete Setup Guide

## Overview

The payment system is fully integrated with Stripe and Supabase. Users can subscribe to plans, manage subscriptions, and access paid features.

## ✅ Components Implemented

### 1. **Pricing Page** (`/pricing`)
- 3 subscription plans: Starter €9, Creator €19, Pro €49
- Beautiful pricing cards with feature lists
- Direct checkout integration
- Responsive design with Tailwind CSS

### 2. **Stripe Integration**
- Checkout sessions: `/api/checkout`
- Webhook handler: `/api/webhooks/stripe`
- Subscription verification: `/api/subscription/verify`
- Subscription status: `/api/subscription/status`
- Subscription cancellation: `/api/subscription/cancel`

### 3. **Database Tables**
- `subscriptions` - Stripe subscription records
- Updated `profiles` with:
  - `stripe_customer_id` - Customer reference
  - `subscription_status` - active/inactive
  - `subscription_plan` - starter/creator/pro/free

### 4. **Success & Cancel Pages**
- `/checkout/success` - Shows subscription confirmation
- `/checkout/cancel` - Allows retry

### 5. **Subscription Management Component**
- `SubscriptionCard` - Displays current plan
- Shows renewal date
- One-click cancellation

## 🚀 Quick Start

### Step 1: Environment Variables
Stripe keys are already in `.env.local`:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # Add this from Stripe dashboard
```

### Step 2: Apply Database Migration
```bash
# From project root
node apply-migrations.js
```

Or manually in Supabase SQL editor:
```sql
-- Add columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN stripe_customer_id TEXT UNIQUE,
ADD COLUMN subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN subscription_plan TEXT DEFAULT 'free';

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  price_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Step 3: Configure Stripe Webhook
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy signing secret to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### Step 4: Update .env.local with Price IDs
Price IDs are configured in `.env.local`. Verify they match your Stripe products:

**EUR (Europe):**
```
STRIPE_PRICE_EUROPA_STARTER=price_1T1TWrHzl6QXfcVfLmhVzHt7
STRIPE_PRICE_EUROPA_CREATOR=price_1T1TWsHzl6QXfcVfNdUnNyLA
STRIPE_PRICE_EUROPA_PRO=price_1T1TWtHzl6QXfcVfYUGwZiuB
```

## 🔐 Protected Routes

### Requiring Payment
Add to middleware to restrict routes to paid users only:

```typescript
// In middleware.ts
const isPaidFeature = request.nextUrl.pathname === '/dashboard'

if (isPaidFeature && user) {
  // Check subscription status
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single()

  if (profile?.subscription_status !== 'active') {
    return NextResponse.redirect(new URL('/pricing', request.url))
  }
}
```

## 🔗 API Endpoints

### POST `/api/checkout`
Create Stripe checkout session.

**Request:**
```json
{
  "priceId": "price_1T1TWrHzl6QXfcVfLmhVzHt7"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/pay/cs_..."
}
```

### POST `/api/webhooks/stripe`
Stripe webhook handler. Automatically updates subscription status.

**Events:**
- `checkout.session.completed` - New subscription created
- `customer.subscription.updated` - Plan changed or renewed
- `customer.subscription.deleted` - Subscription cancelled

### POST `/api/subscription/verify`
Verify subscription after checkout.

**Request:**
```json
{
  "sessionId": "cs_..."
}
```

**Response:**
```json
{
  "plan": "creator",
  "status": "active",
  "current_period_start": 1708176000,
  "current_period_end": 1710854400
}
```

### GET `/api/subscription/status`
Get current user's subscription status.

**Response:**
```json
{
  "subscription_status": "active",
  "subscription_plan": "creator",
  "details": { ... }
}
```

### POST `/api/subscription/cancel`
Cancel user's active subscription.

**Response:**
```json
{
  "message": "Subscription marked for cancellation",
  "cancels_at": "2026-03-20T00:00:00Z"
}
```

## 📋 Testing Flow

### 1. Test Card Numbers (Stripe)
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **3D Secure:** 4000 0000 0000 3220

### 2. Complete Checkout Flow
```bash
# 1. Create account
POST /api/auth/register
{
  "email": "test@example.com",
  "password": "password123"
}

# 2. Go to pricing
GET /pricing

# 3. Click subscribe (Starter €9)
POST /api/checkout
Authorization: Bearer <token>

# 4. Complete Stripe checkout with test card
# 5. Verify subscription
POST /api/subscription/verify
{ "sessionId": "cs_..." }

# 6. Check status
GET /api/subscription/status
Authorization: Bearer <token>
```

### 3. Webhook Testing (Local)
Use Stripe CLI to forward webhooks:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Get signing secret from output and set as `STRIPE_WEBHOOK_SECRET`.

## 💳 Pricing Structure

### Starter - €9/month
- Up to 5 podcasts
- Monthly AI transcription
- Basic newsletter generation
- Email support

### Creator - €19/month (Most Popular)
- Unlimited podcasts
- Advanced AI transcription
- Full newsletter customization
- Social media automation
- Priority support
- Analytics dashboard
- Custom branding

### Pro - €49/month
- Everything in Creator +
- API access
- Custom integrations
- White-label options
- Dedicated account manager
- Advanced analytics
- Priority API access

## 🚨 Error Handling

### Common Issues

**1. "Invalid session"**
- Webhook not configured
- Session expired
- Price ID mismatch

**2. "Not authenticated"**
- Auth token missing
- Token expired
- Invalid Bearer format

**3. "Failed to create checkout session"**
- Price ID doesn't exist
- Stripe keys misconfigured
- Rate limited

### Logs
Check logs in:
- Stripe Dashboard → Logs
- Supabase → Logs
- Next.js console output

## 📈 Monitoring

### Key Metrics
- Checkout sessions created
- Successful subscriptions
- Cancellation rate
- Revenue by plan

### Stripe Dashboard Checks
1. Customers → Count active subscriptions
2. Products → Verify price IDs and amounts
3. Webhooks → Check delivery status
4. Logs → Search for errors

## 🔄 Database Queries

### Get active subscriptions
```sql
SELECT * FROM subscriptions WHERE status = 'active'
```

### Get user's subscription
```sql
SELECT s.* FROM subscriptions s
WHERE s.user_id = 'user-uuid'
ORDER BY s.created_at DESC LIMIT 1
```

### Check if user has active subscription
```sql
SELECT EXISTS(
  SELECT 1 FROM subscriptions 
  WHERE user_id = 'user-uuid' AND status = 'active'
)
```

## 🚀 Deployment Checklist

- [ ] Environment variables set in Vercel/production
- [ ] Stripe webhook endpoint configured
- [ ] Database migrations applied
- [ ] Price IDs verified
- [ ] Success/cancel pages tested
- [ ] Pricing page live
- [ ] Protected routes configured
- [ ] Email notifications set up (optional)

## 📚 Additional Resources

- [Stripe Docs](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**Status:** ✅ Ready for production
**Last Updated:** Feb 18, 2026
**Version:** 1.0.0

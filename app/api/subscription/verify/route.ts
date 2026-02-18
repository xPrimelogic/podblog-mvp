import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-15.acacia',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session ID provided' },
        { status: 400 }
      )
    }

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session || !session.subscription) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 400 }
      )
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    const priceId = subscription.items.data[0]?.price.id

    // Get plan name
    const priceMap: Record<string, string> = {
      'price_1T1TWrHzl6QXfcVfLmhVzHt7': 'starter',
      'price_1T1TWsHzl6QXfcVfNdUnNyLA': 'creator',
      'price_1T1TWtHzl6QXfcVfYUGwZiuB': 'pro',
      'price_1T1TWtHzl6QXfcVf6tv0S43M': 'starter',
      'price_1T1TWuHzl6QXfcVfd6MonlNy': 'creator',
      'price_1T1TWvHzl6QXfcVfBG7Z6OR0': 'pro',
      'price_1T1TWwHzl6QXfcVf54srJrlt': 'starter',
      'price_1T1TWwHzl6QXfcVffjxp9Zkl': 'creator',
      'price_1T1TWxHzl6QXfcVf7TcfBn6L': 'pro',
    }

    const plan = priceMap[priceId] || 'free'

    return NextResponse.json({
      plan,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      customer_email: session.customer_email,
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify subscription' },
      { status: 500 }
    )
  }
}

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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

// Types
interface StripeSubscription {
  id: string
  customer: string
  items: {
    data: Array<{
      price: {
        id: string
        product: string
      }
    }>
  }
  status: string
  current_period_start: number
  current_period_end: number
}

interface StripeCheckoutSession {
  customer: string
  subscription: string
}

async function getPlanNameFromPrice(priceId: string): Promise<string> {
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
  return priceMap[priceId] || 'free'
}

async function handleSubscriptionUpdated(subscription: StripeSubscription) {
  try {
    const customerId = subscription.customer
    const status = subscription.status
    const priceId = subscription.items.data[0]?.price.id

    // Get Supabase user from Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!profile) {
      console.log(`No profile found for customer ${customerId}`)
      return
    }

    const planName = await getPlanNameFromPrice(priceId)

    // Update subscription status in Supabase
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: profile.id,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
        plan: planName,
        status: status as 'active' | 'past_due' | 'canceled' | 'incomplete',
        price_id: priceId,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        updated_at: new Date(),
      }, {
        onConflict: 'stripe_subscription_id'
      })

    if (error) {
      console.error('Error updating subscription:', error)
    }

    // Update profile with subscription status
    await supabase
      .from('profiles')
      .update({
        subscription_status: status === 'active' ? 'active' : 'inactive',
        subscription_plan: planName,
      })
      .eq('id', profile.id)
  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

async function handleCheckoutSessionCompleted(session: StripeCheckoutSession) {
  try {
    const subscriptionId = session.subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId as string)

    await handleSubscriptionUpdated(subscription as StripeSubscription)
  } catch (error) {
    console.error('Error handling checkout session:', error)
  }
}

async function handleCustomerSubscriptionDeleted(subscription: StripeSubscription) {
  try {
    const customerId = subscription.customer

    // Get Supabase user
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!profile) {
      return
    }

    // Delete subscription record
    await supabase
      .from('subscriptions')
      .delete()
      .eq('stripe_subscription_id', subscription.id)

    // Update profile
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'inactive',
        subscription_plan: 'free',
      })
      .eq('id', profile.id)
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') || ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as StripeCheckoutSession)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as StripeSubscription)
        break
      case 'customer.subscription.deleted':
        await handleCustomerSubscriptionDeleted(event.data.object as StripeSubscription)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from './ui/button'
import Link from 'next/link'

interface SubscriptionData {
  subscription_status: string
  subscription_plan: string
  current_period_end?: string
}

export function SubscriptionCard() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          setLoading(false)
          return
        }

        const response = await fetch('/api/subscription/status', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setSubscription(data)
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return
    }

    setCancelling(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        alert('Your subscription has been cancelled and will end at the end of your billing period.')
      } else {
        alert('Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Cancellation error:', error)
      alert('Failed to cancel subscription')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return null
  }

  if (!subscription) {
    return (
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
        <p className="text-blue-100 mb-4">
          Upgrade to a paid plan to unlock all features
        </p>
        <Link href="/pricing">
          <Button className="bg-white text-blue-600 hover:bg-blue-50">
            View Plans
          </Button>
        </Link>
      </div>
    )
  }

  if (subscription.subscription_status === 'inactive' || subscription.subscription_plan === 'free') {
    return (
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Free Plan</h3>
        <p className="text-blue-100 mb-4">
          Upgrade to unlock advanced features
        </p>
        <Link href="/pricing">
          <Button className="bg-white text-blue-600 hover:bg-blue-50">
            Upgrade Now
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold capitalize">{subscription.subscription_plan} Plan</h3>
          <p className="text-green-100 text-sm">
            Status: <span className="font-semibold capitalize">{subscription.subscription_status}</span>
          </p>
        </div>
        <div className="bg-white/20 rounded-full p-3">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-sm text-green-100">
          Your subscription is active and you have access to all features.
        </p>
      </div>

      <button
        onClick={handleCancelSubscription}
        disabled={cancelling}
        className="text-sm text-green-100 hover:text-white transition"
      >
        {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
      </button>
    </div>
  )
}

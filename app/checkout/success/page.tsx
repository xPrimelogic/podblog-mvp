'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided')
      setLoading(false)
      return
    }

    const verifySubscription = async () => {
      try {
        const response = await fetch('/api/subscription/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        if (response.ok) {
          const data = await response.json()
          setSubscription(data)
        } else {
          setError('Failed to verify subscription')
        }
      } catch (err) {
        setError('Error verifying subscription')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    verifySubscription()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Verifying your subscription...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 border border-red-500/50 rounded-lg p-8 max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-white mb-4">Oops!</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link href="/pricing">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Back to Pricing
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-green-500/50 rounded-lg p-8 max-w-md w-full">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to PodBlog!
          </h1>
          <p className="text-slate-400 mb-8">
            Your subscription has been activated successfully.
          </p>

          {subscription && (
            <div className="bg-slate-700/50 rounded-lg p-4 mb-8 text-left">
              <div className="mb-3">
                <p className="text-sm text-slate-400">Plan</p>
                <p className="text-lg font-semibold text-white capitalize">
                  {subscription.plan}
                </p>
              </div>
              <div className="mb-3">
                <p className="text-sm text-slate-400">Status</p>
                <p className="text-lg font-semibold text-green-400 capitalize">
                  {subscription.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Renewal Date</p>
                <p className="text-lg font-semibold text-white">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/dashboard" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/pricing" className="block">
              <Button
                variant="outline"
                className="w-full border-slate-600 text-white hover:bg-slate-700"
              >
                Back to Pricing
              </Button>
            </Link>
          </div>

          <p className="text-sm text-slate-400 mt-6">
            Questions? <a href="mailto:support@podblog.ai" className="text-blue-400 hover:text-blue-300">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

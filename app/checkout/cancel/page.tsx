'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-md w-full">
        <div className="text-center">
          {/* Cancel Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 4v2M6.343 3.665c-1.146-.645-2.5.147-2.5 1.335V19c0 1.657 1.343 3 3 3h12c1.657 0 3-1.343 3-3V5c0-1.188-1.354-1.98-2.5-1.335m0 0L12 9m0 0l6.343-5.335"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Checkout Cancelled
          </h1>
          <p className="text-slate-400 mb-8">
            Your checkout was cancelled. No payment was processed. You can try again anytime.
          </p>

          <div className="space-y-3">
            <Link href="/pricing" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Back to Pricing
              </Button>
            </Link>
            <Link href="/dashboard" className="block">
              <Button
                variant="outline"
                className="w-full border-slate-600 text-white hover:bg-slate-700"
              >
                Go to Dashboard
              </Button>
            </Link>
          </div>

          <div className="mt-8 p-4 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-300 mb-3">
              💡 <strong>Need help choosing a plan?</strong>
            </p>
            <p className="text-sm text-slate-400">
              All plans include unlimited podcast uploads, AI transcription, and content generation.
            </p>
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

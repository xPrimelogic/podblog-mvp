'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Starter',
    price: 9,
    currency: '€',
    description: 'Perfect to get started',
    features: [
      'Up to 5 podcasts',
      'Monthly AI transcription',
      'Basic newsletter generation',
      'Email support',
      'Community access'
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || 'price_1T1TWrHzl6QXfcVfLmhVzHt7',
    highlighted: false
  },
  {
    name: 'Creator',
    price: 19,
    currency: '€',
    description: 'Most popular for creators',
    features: [
      'Unlimited podcasts',
      'Advanced AI transcription',
      'Full newsletter customization',
      'Social media automation',
      'Priority support',
      'Analytics dashboard',
      'Custom branding'
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR || 'price_1T1TWsHzl6QXfcVfNdUnNyLA',
    highlighted: true
  },
  {
    name: 'Pro',
    price: 49,
    currency: '€',
    description: 'For professional podcasters',
    features: [
      'Everything in Creator',
      'API access',
      'Custom integrations',
      'White-label options',
      'Dedicated account manager',
      'Advanced analytics',
      'Priority API access',
      'Custom webhooks'
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'price_1T1TWtHzl6QXfcVfYUGwZiuB',
    highlighted: false
  }
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      if (url) {
        router.push(url)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/50 backdrop-blur border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              PodBlog
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your podcast. All plans include access to our AI-powered content generation.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                plan.highlighted
                  ? 'md:scale-105 ring-2 ring-blue-500 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl'
                  : 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              {/* Card Content */}
              <div className="p-8">
                {plan.highlighted && (
                  <div className="mb-4">
                    <span className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-3xl text-slate-400 ml-1">{plan.currency}</span>
                    <span className="text-slate-400 ml-2">/month</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleCheckout(plan.priceId)}
                  disabled={loading !== null}
                  className={`w-full py-3 rounded-lg font-semibold transition mb-8 ${
                    plan.highlighted
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  } ${loading === plan.priceId ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading === plan.priceId ? 'Loading...' : 'Subscribe Now'}
                </Button>

                {/* Features */}
                <div className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I change my plan anytime?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.'
              },
              {
                q: 'Is there a free trial?',
                a: 'Currently, we offer a 7-day money-back guarantee. If you\'re not satisfied, contact support for a refund.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, Mastercard, American Express) and other payment methods through Stripe.'
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes, you can cancel anytime from your dashboard. Your subscription will remain active until the end of your billing period.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{item.q}</h3>
                <p className="text-slate-400">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, X, Sparkles, Zap, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Free Starter',
    price: '0',
    description: 'Perfect for exploring the platform',
    icon: Sparkles,
    features: [
      { text: '5 practice interviews per month', included: true },
      { text: 'Basic AI feedback', included: true },
      { text: 'General question bank', included: true },
      { text: 'Performance tracking', included: true },
      { text: 'Email support', included: true },
      { text: 'Video analysis', included: false },
      { text: 'Custom questions', included: false },
      { text: 'Priority support', included: false }
    ],
    cta: 'Start Free',
    href: '/register',
    popular: false
  },
  {
    name: 'Pro Seeker',
    price: '29',
    description: 'For serious job seekers',
    icon: Zap,
    features: [
      { text: 'Unlimited practice interviews', included: true },
      { text: 'Advanced AI feedback & coaching', included: true },
      { text: 'Role-specific question banks', included: true },
      { text: 'Detailed analytics dashboard', included: true },
      { text: 'Video & voice analysis', included: true },
      { text: 'Resume optimization tips', included: true },
      { text: 'Mock interview recordings', included: true },
      { text: 'Priority email & chat support', included: true }
    ],
    cta: 'Start 14-Day Trial',
    href: '/register?plan=pro',
    popular: true
  },
  {
    name: 'Team Suite',
    price: 'Custom',
    description: 'For teams and organizations',
    icon: Building2,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Custom question creation', included: true },
      { text: 'Team analytics & reporting', included: true },
      { text: 'API access', included: true },
      { text: 'SSO integration', included: true },
      { text: 'Dedicated success manager', included: true },
      { text: 'Custom training programs', included: true }
    ],
    cta: 'Contact Sales',
    href: '/contact?type=enterprise',
    popular: false
  }
]

export default function PricingSection() {
  const [mounted, setMounted] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    setMounted(true)
  }, [])

  const getPrice = (price: string) => {
    if (price === '0' || price === 'Custom') return price
    return billingCycle === 'yearly' 
      ? Math.floor(parseInt(price) * 10).toString() // 2 months free
      : price
  }

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className={cn(
            "text-4xl sm:text-5xl font-bold",
            "bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300",
            "bg-clip-text text-transparent",
            "transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            Simple, Transparent Pricing
          </h2>
          <p className={cn(
            "mt-4 text-lg text-gray-600 dark:text-gray-400",
            "transition-all duration-700 delay-100",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            Choose the perfect plan for your interview preparation journey
          </p>

          {/* Billing Toggle */}
          <div className={cn(
            "mt-8 inline-flex items-center gap-4 p-1 rounded-full",
            "bg-gray-100 dark:bg-gray-800",
            "transition-all duration-700 delay-200",
            mounted ? "opacity-100" : "opacity-0"
          )}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                billingCycle === 'monthly'
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                billingCycle === 'yearly'
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              Yearly
              <span className="ml-2 text-xs text-green-600 dark:text-green-400">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            const price = getPrice(plan.price)
            
            return (
              <div
                key={index}
                className={cn(
                  "relative group",
                  "transition-all duration-700",
                  mounted ? `opacity-100 translate-y-0 delay-${index * 100}` : "opacity-0 translate-y-4"
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className={cn(
                  "relative h-full p-8 rounded-2xl",
                  "bg-white dark:bg-gray-900",
                  "transition-all duration-300",
                  plan.popular
                    ? "border-2 border-blue-500 shadow-xl scale-105"
                    : "border-2 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg"
                )}>
                  {/* Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl mb-4",
                    "bg-gradient-to-r",
                    plan.popular ? "from-blue-500 to-indigo-500" : "from-gray-500 to-gray-600",
                    "flex items-center justify-center"
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    {price === 'Custom' ? (
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">Custom</div>
                    ) : (
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          ${price}
                        </span>
                        {price !== '0' && (
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            /{billingCycle === 'yearly' ? 'year' : 'month'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 dark:text-gray-700 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={cn(
                          "text-sm",
                          feature.included
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-gray-400 dark:text-gray-600"
                        )}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link href={plan.href} className="block">
                    <Button
                      className={cn(
                        "w-full py-6 text-base font-medium",
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      )}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Money Back Guarantee */}
        <div className={cn(
          "mt-16 text-center",
          "transition-all duration-700 delay-400",
          mounted ? "opacity-100" : "opacity-0"
        )}>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-900 dark:text-green-100 font-medium">
              30-day money-back guarantee on all paid plans
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

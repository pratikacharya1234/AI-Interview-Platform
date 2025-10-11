'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Crown, 
  Check, 
  X, 
  CreditCard, 
  Calendar, 
  Users, 
  Zap,
  Shield,
  Star,
  Download,
  Clock,
  Target,
  TrendingUp,
  Gift,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  billingPeriod: 'monthly' | 'yearly'
  features: string[]
  limits: {
    interviewsPerMonth: number | 'unlimited'
    storageGB: number | 'unlimited'
    reportsPerMonth: number | 'unlimited'
    supportLevel: string
  }
  popular?: boolean
  currentPlan?: boolean
}

interface UsageData {
  interviewsUsed: number
  interviewsLimit: number | 'unlimited'
  storageUsed: number
  storageLimit: number | 'unlimited'
  reportsGenerated: number
  reportsLimit: number | 'unlimited'
  billingCycleStart: string
  billingCycleEnd: string
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started with interview preparation',
    price: 0,
    billingPeriod: 'monthly',
    features: [
      'Basic interview practice',
      'Limited question bank access',
      'Basic performance tracking',
      'Community support',
      'Standard audio quality'
    ],
    limits: {
      interviewsPerMonth: 5,
      storageGB: 1,
      reportsPerMonth: 2,
      supportLevel: 'Community'
    },
    currentPlan: true
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    description: 'Advanced features for serious interview preparation',
    price: 29,
    billingPeriod: 'monthly',
    features: [
      'Unlimited interview practice',
      'Full question bank access',
      'Advanced analytics & insights',
      'Priority email support',
      'High-quality audio/video',
      'Custom practice sessions',
      'Performance benchmarking',
      'Export functionality'
    ],
    limits: {
      interviewsPerMonth: 'unlimited',
      storageGB: 50,
      reportsPerMonth: 'unlimited',
      supportLevel: 'Priority Email'
    },
    popular: true
  },
  {
    id: 'pro-yearly',
    name: 'Pro (Yearly)',
    description: 'Save 40% with annual billing',
    price: 19,
    billingPeriod: 'yearly',
    features: [
      'Everything in Pro Monthly',
      '40% cost savings',
      'Annual performance review',
      'Goal setting & tracking',
      'Advanced AI coaching'
    ],
    limits: {
      interviewsPerMonth: 'unlimited',
      storageGB: 100,
      reportsPerMonth: 'unlimited',
      supportLevel: 'Priority Email'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Comprehensive solution for teams and organizations',
    price: 99,
    billingPeriod: 'monthly',
    features: [
      'Everything in Pro',
      'Team management dashboard',
      'Bulk user management',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantees',
      'Advanced security features'
    ],
    limits: {
      interviewsPerMonth: 'unlimited',
      storageGB: 'unlimited',
      reportsPerMonth: 'unlimited',
      supportLevel: 'Dedicated Support'
    }
  }
]

const usageData: UsageData = {
  interviewsUsed: 3,
  interviewsLimit: 5,
  storageUsed: 0.3,
  storageLimit: 1,
  reportsGenerated: 1,
  reportsLimit: 2,
  billingCycleStart: '2024-10-01',
  billingCycleEnd: '2024-11-01'
}

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)

  const currentPlan = subscriptionPlans.find(plan => plan.currentPlan)
  const filteredPlans = subscriptionPlans.filter(plan => 
    plan.billingPeriod === billingCycle || plan.id === 'free'
  )

  const formatLimit = (limit: number | 'unlimited') => {
    return limit === 'unlimited' ? 'Unlimited' : limit.toLocaleString()
  }

  const calculateUsagePercentage = (used: number, limit: number | 'unlimited') => {
    if (limit === 'unlimited') return 0
    return Math.min((used / limit) * 100, 100)
  }

  const handleUpgrade = async (planId: string) => {
    setLoading(true)
    setSelectedPlan(planId)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Upgrading to plan:', planId)
      
      // In production, this would redirect to payment processor
      // window.location.href = `/payment?plan=${planId}`
      
    } catch (error) {
      console.error('Upgrade failed:', error)
    } finally {
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const daysUntilRenewal = () => {
    const endDate = new Date(usageData.billingCycleEnd)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Subscription & Billing</h1>
            <p className="text-muted-foreground">
              Manage your subscription and view usage statistics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
            <Button variant="outline" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Methods
            </Button>
          </div>
        </div>

        {/* Current Plan & Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentPlan?.id === 'free' ? (
                  <Shield className="h-5 w-5" />
                ) : (
                  <Crown className="h-5 w-5 text-yellow-500" />
                )}
                Current Plan: {currentPlan?.name}
              </CardTitle>
              <CardDescription>
                {currentPlan?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  ${currentPlan?.price || 0}
                  <span className="text-sm text-muted-foreground font-normal">
                    /{currentPlan?.billingPeriod === 'yearly' ? 'year' : 'month'}
                  </span>
                </span>
                {currentPlan?.id !== 'free' && (
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    Renews in {daysUntilRenewal()} days
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Billing Cycle</span>
                  <span className="font-medium">
                    {formatDate(usageData.billingCycleStart)} - {formatDate(usageData.billingCycleEnd)}
                  </span>
                </div>
                {currentPlan?.limits && (
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Support Level</span>
                      <span className="font-medium">{currentPlan.limits.supportLevel}</span>
                    </div>
                  </div>
                )}
              </div>

              {currentPlan?.id === 'free' && (
                <div className="pt-2 border-t">
                  <Button 
                    className="w-full gap-2"
                    onClick={() => handleUpgrade('pro-monthly')}
                  >
                    <Zap className="h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Usage This Month
              </CardTitle>
              <CardDescription>
                Track your current usage against plan limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Interviews */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Interviews Conducted
                  </span>
                  <span className="font-medium">
                    {usageData.interviewsUsed} / {formatLimit(usageData.interviewsLimit)}
                  </span>
                </div>
                {usageData.interviewsLimit !== 'unlimited' && (
                  <Progress 
                    value={calculateUsagePercentage(usageData.interviewsUsed, usageData.interviewsLimit)} 
                    className="h-2" 
                  />
                )}
              </div>

              {/* Storage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Storage Used
                  </span>
                  <span className="font-medium">
                    {usageData.storageUsed} GB / {formatLimit(usageData.storageLimit)} GB
                  </span>
                </div>
                {usageData.storageLimit !== 'unlimited' && (
                  <Progress 
                    value={calculateUsagePercentage(usageData.storageUsed, usageData.storageLimit)} 
                    className="h-2" 
                  />
                )}
              </div>

              {/* Reports */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Reports Generated
                  </span>
                  <span className="font-medium">
                    {usageData.reportsGenerated} / {formatLimit(usageData.reportsLimit)}
                  </span>
                </div>
                {usageData.reportsLimit !== 'unlimited' && (
                  <Progress 
                    value={calculateUsagePercentage(usageData.reportsGenerated, usageData.reportsLimit)} 
                    className="h-2" 
                  />
                )}
              </div>

              {/* Usage Warning */}
              {usageData.interviewsLimit !== 'unlimited' && 
               calculateUsagePercentage(usageData.interviewsUsed, usageData.interviewsLimit) > 80 && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-900 dark:text-orange-200">Usage Alert</p>
                    <p className="text-orange-700 dark:text-orange-300">
                      You&apos;re approaching your monthly limit. Consider upgrading to avoid interruption.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Plan Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Available Plans
            </CardTitle>
            <CardDescription>
              Choose the perfect plan for your interview preparation needs
            </CardDescription>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <span className={billingCycle === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}>
                Monthly
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative"
              >
                <div className={`absolute inset-0 rounded-md transition-all duration-200 ${
                  billingCycle === 'yearly' ? 'bg-primary translate-x-0' : 'bg-transparent translate-x-0'
                } w-6 h-6`} />
                <RefreshCw className="h-4 w-4 relative z-10" />
              </Button>
              <span className={billingCycle === 'yearly' ? 'font-semibold' : 'text-muted-foreground'}>
                Yearly
                <Badge variant="secondary" className="ml-2">Save 40%</Badge>
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative transition-all duration-200 ${
                    plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  } ${plan.currentPlan ? 'ring-2 ring-green-500' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                      Most Popular
                    </Badge>
                  )}
                  {plan.currentPlan && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500">
                      Current Plan
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                    <div className="pt-2">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">
                        /{plan.billingPeriod === 'yearly' ? 'year' : 'month'}
                      </span>
                      {plan.billingPeriod === 'yearly' && plan.price > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          Save ${(29 * 12) - (plan.price * 12)}/year
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t space-y-2 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Monthly Interviews:</span>
                        <span className="font-medium">{formatLimit(plan.limits.interviewsPerMonth)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage:</span>
                        <span className="font-medium">{formatLimit(plan.limits.storageGB)} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Reports:</span>
                        <span className="font-medium">{formatLimit(plan.limits.reportsPerMonth)}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      variant={plan.currentPlan ? "outline" : "primary"}
                      disabled={plan.currentPlan || loading}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {loading && selectedPlan === plan.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : plan.currentPlan ? (
                        'Current Plan'
                      ) : plan.id === 'free' ? (
                        'Downgrade'
                      ) : (
                        'Upgrade'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enterprise Contact */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Need something custom?</h3>
                <p className="text-muted-foreground">
                  Contact our sales team for enterprise solutions, volume discounts, and custom integrations.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  Contact Sales
                </Button>
                <Button className="gap-2">
                  <Gift className="h-4 w-4" />
                  Request Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
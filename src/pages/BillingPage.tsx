import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Layout } from '../components/Layout'
import { getSubscriptionStatus, subscribe, cancelSubscription } from '../api/billing'
import type { SubscriptionStatus } from '../api/billing'
import { useAuthStore } from '../store/authStore'

const PLANS = [
  {
    name: 'Trial',
    price: 'Free',
    period: '30 days',
    properties: 1,
    features: ['1 property', '30-day trial', 'All core features'],
    color: 'border-slate-600',
    badge: 'bg-slate-500/10 text-slate-400',
    priceId: null,
  },
  {
    name: 'Basic',
    price: '$29',
    period: 'per month',
    properties: 3,
    features: ['Up to 3 properties', 'All core features', 'Email support'],
    color: 'border-cyan-500/50',
    badge: 'bg-cyan-500/10 text-cyan-400',
    priceId: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID as string,
  },
  {
    name: 'Pro',
    price: '$79',
    period: 'per month',
    properties: Infinity,
    features: ['Unlimited properties', 'All core features', 'Priority support', 'Advanced analytics'],
    color: 'border-violet-500/50',
    badge: 'bg-violet-500/10 text-violet-400',
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID as string,
  },
]

const STATUS_STYLE: Record<string, string> = {
  Active:    'bg-cyan-500/10 text-cyan-400',
  PastDue:   'bg-amber-500/10 text-amber-400',
  Locked:    'bg-rose-500/10 text-rose-400',
  Cancelled: 'bg-slate-500/10 text-slate-400',
}

function BillingPage() {
  const user = useAuthStore((s) => s.user)
  const isOwner = user?.role === 'Owner'

  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchStatus = () => {
    setLoading(true)
    getSubscriptionStatus()
      .then(setSubscription)
      .catch(() => toast.error('Failed to load subscription'))
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchStatus() }, [])

  const handleSubscribe = async (plan: typeof PLANS[number]) => {
    if (!plan.priceId) return
    setActionLoading(plan.name)
    try {
      await subscribe(plan.name, plan.priceId)
      toast.success(`Upgraded to ${plan.name}`)
      fetchStatus()
    } catch {
      toast.error('Failed to update subscription')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription? Your account will be locked at the end of the billing period.')) return
    setActionLoading('cancel')
    try {
      await cancelSubscription()
      toast.success('Subscription cancelled')
      fetchStatus()
    } catch {
      toast.error('Failed to cancel subscription')
    } finally {
      setActionLoading(null)
    }
  }

  const trialDaysLeft = subscription
      // eslint-disable-next-line react-hooks/purity
    ? Math.max(0, Math.ceil((Date.now() - new Date(subscription.trialEndsAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <Layout>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">Billing & Subscription</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage your plan and billing details</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <svg className="animate-spin w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <>
            {/* Current plan card */}
            {subscription && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Current Plan</p>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-white text-lg font-semibold">{subscription.plan}</p>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-xs font-medium ${STATUS_STYLE[subscription.status] ?? 'bg-slate-700 text-slate-400'}`}>
                        {subscription.status}
                      </span>
                    </div>
                    {subscription.plan === 'Trial' && (
                      <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <p className="text-amber-400 text-sm font-medium">{trialDaysLeft} days left</p>
                        <p className="text-amber-500/70 text-xs">Upgrade before trial ends</p>
                      </div>
                    )}
                  </div>
                  {isOwner && subscription.plan !== 'Trial' && subscription.status === 'Active' && (
                    <button
                      onClick={handleCancel}
                      disabled={actionLoading === 'cancel'}
                      className="px-4 py-2 text-sm font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'cancel' ? 'Cancelling…' : 'Cancel subscription'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Plan cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const isCurrent = subscription?.plan === plan.name
                const busy = actionLoading === plan.name
                return (
                  <div
                    key={plan.name}
                    className={`bg-slate-800/50 border-2 rounded-2xl p-6 flex flex-col gap-5 ${isCurrent ? plan.color : 'border-slate-700'}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium ${plan.badge}`}>
                          {plan.name}
                        </span>
                        {isCurrent && (
                          <span className="text-xs text-slate-500 font-medium">Current</span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-white mt-3">{plan.price}</p>
                      <p className="text-slate-500 text-sm">{plan.period}</p>
                    </div>

                    <ul className="space-y-2 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                          <svg className="w-4 h-4 text-cyan-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>

                    {isOwner && plan.priceId && !isCurrent && (
                      <button
                        onClick={() => handleSubscribe(plan)}
                        disabled={!!actionLoading}
                        className="w-full py-2.5 rounded-xl text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-white transition-colors disabled:opacity-50"
                      >
                        {busy ? 'Processing…' : `Upgrade to ${plan.name}`}
                      </button>
                    )}

                    {isCurrent && (
                      <div className="w-full py-2.5 rounded-xl text-sm font-medium text-center bg-slate-700/50 text-slate-500">
                        Active plan
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </Layout>
  )
}

export default BillingPage

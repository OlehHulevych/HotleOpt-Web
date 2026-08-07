import client from './client'

export interface SubscriptionStatus {
  plan: 'Trial' | 'Basic' | 'Pro'
  status: 'Active' | 'PastDue' | 'Locked' | 'Cancelled'
  trialEndsAt: string
}

export const getSubscriptionStatus = () =>
  client.get<{ result: SubscriptionStatus }>('/api/subscription/status').then((r) => r.data.result)

export const subscribe = (plan: string, priceId: string) =>
  client.post(`/api/subscription/subscribe?priceId=${priceId}`, plan, {
    headers: { 'Content-Type': 'application/json' },
  })

export const cancelSubscription = () =>
  client.delete('/api/subscription')

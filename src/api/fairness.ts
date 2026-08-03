import client from './client'
import type { StaffFairnessDto } from '../types/fairness'

export const getStaffFairness = () =>
  client.get<{ result: StaffFairnessDto[] }>('/api/fairness').then((r) => r.data.result)

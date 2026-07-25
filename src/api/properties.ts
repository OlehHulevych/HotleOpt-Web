import client from './client'
import type { Property } from '../types/property'
import type { PaginatedResult } from '../types/room'

export const getProperties = () =>
  client
    .get<{ list: PaginatedResult<Property> }>('/api/property', { params: { page: 1, pageSize: 100 } })
    .then((r) => r.data.list.items)

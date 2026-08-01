import client from './client'
import type { Message } from '../types/message'
import type { PaginatedResult } from '../types/room'

export const getMessages = (propertyId: string, page = 1, pageSize = 50) =>
  client
    .get<{ result: PaginatedResult<Message> }>('/api/message', { params: { propertyId, currentPage: page, pageSize } })
    .then((r) => r.data.result)

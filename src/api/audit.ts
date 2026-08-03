import client from './client'
import type { AuditLogDto } from '../types/audit'

export const getAuditLogs = () =>
  client.get<{ data: AuditLogDto[] }>('/api/audit').then((r) => r.data.data)

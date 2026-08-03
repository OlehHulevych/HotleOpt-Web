export type EntityAction = 'Created' | 'Updated' | 'Deleted'

export interface AuditLogDto {
  id: string
  entityName: string
  entityId: string
  action: EntityAction
  changedById: string
  changes: string
  createdAt: string
}

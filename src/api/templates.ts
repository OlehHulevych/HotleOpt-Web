import client from './client'
import type { TaskTemplateDto, CreateTaskTemplateDto, ApplyTemplateDto } from '../types/template'

export const getTemplatesByProperty = (propertyId: string) =>
  client.get<{ data: TaskTemplateDto[] }>(`/api/task-templates/property/${propertyId}`).then((r) => r.data.data)

export const createTemplate = (dto: CreateTaskTemplateDto) =>
  client.post('/api/task-templates', dto).then((r) => r.data)

export const applyTemplate = (templateId: string, dto: ApplyTemplateDto) =>
  client.post(`/api/task-templates/${templateId}/apply`, dto).then((r) => r.data)

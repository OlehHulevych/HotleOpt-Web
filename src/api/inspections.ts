import client from './client'
import type { PaginatedResult } from '../types/room'
import type { RoomInspection, InspectionResult } from '../types/inspection'

export const inspectRoom = (roomId: string, propertyId: string, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return client
    .post<InspectionResult>('/api/inspections', form, { params: { roomId, propertyId } })
    .then((r) => r.data)
}

export const getInspections = (roomId: string, page = 1, pageSize = 5) =>
  client
    .get<PaginatedResult<RoomInspection>>(`/api/inspections/${roomId}`, { params: { page, pageSize } })
    .then((r) => r.data)

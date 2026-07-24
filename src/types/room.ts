export type RoomStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance'
export type RoomType = 'Single' | 'Double' | 'Twin' | 'Suite' | 'Deluxe'

export interface Room {
  id: string
  roomNumber: string
  description: string
  status: RoomStatus
  type: RoomType
  propertyId: string
  tenantId: string
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  pageSize: number
  page: number
  totalPages: number
}
